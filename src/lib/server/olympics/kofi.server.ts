import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import { MIN_ENTRY_FEE, extractPaymentCode } from '$lib/olympics/config';
import type { OlympicsDiscordAnnounce } from '$lib/olympics/types';
import { notifyOlympicsPayment } from './discord.server';
import {
	paymentCodesCollection,
	submissionsCollection,
	unmatchedPaymentsCollection
} from './nations.server';

export interface KofiWebhookPayload {
	verification_token?: string;
	message_id?: string;
	type?: string;
	from_name?: string;
	message?: string | null;
	amount?: string;
	email?: string;
	currency?: string;
	kofi_transaction_id?: string;
}

function asAmount(value: string | undefined): number | undefined {
	if (!value) return undefined;
	const amount = Number(value);
	return Number.isFinite(amount) ? amount : undefined;
}

type MarkPaidResult =
	| { matched: false }
	| {
			matched: true;
			duplicate: boolean;
			alreadyAnnounced: boolean;
			paymentId: string;
	  };

async function markSubmissionPaid(
	db: Firestore,
	discordUserId: string,
	payload: KofiWebhookPayload
): Promise<MarkPaidResult> {
	const submissionRef = submissionsCollection(db).doc(discordUserId);
	const snap = await submissionRef.get();
	if (!snap.exists) return { matched: false };

	const data = snap.data() ?? {};
	const form = data.form_data ?? {};
	const paymentId =
		payload.kofi_transaction_id || payload.message_id || `kofi-${Date.now()}`;
	const announce = (data.discordAnnounce ?? {}) as OlympicsDiscordAnnounce;
	const alreadyAnnounced = (announce.paidTransactionIds ?? []).includes(paymentId);
	const duplicate = Boolean(
		form.kofiTransactionId && form.kofiTransactionId === payload.kofi_transaction_id
	);

	if (!duplicate) {
		await submissionRef.update({
			'form_data.paymentStatus': 'paid',
			'form_data.paidAmount': asAmount(payload.amount),
			'form_data.kofiTransactionId': payload.kofi_transaction_id ?? null,
			'form_data.paidAt': FieldValue.serverTimestamp(),
			updatedAt: FieldValue.serverTimestamp()
		});
	}

	return { matched: true, duplicate, alreadyAnnounced, paymentId };
}

async function findByEmail(db: Firestore, email: string): Promise<string | null> {
	const snapshot = await submissionsCollection(db)
		.where('form_data.email', '==', email)
		.limit(2)
		.get();

	if (snapshot.size === 1) return snapshot.docs[0].id;
	return null;
}

async function findByUsername(db: Firestore, name: string): Promise<string | null> {
	const snapshot = await submissionsCollection(db)
		.where('discordUsernameLower', '==', name.toLowerCase())
		.limit(2)
		.get();

	if (snapshot.size === 1) return snapshot.docs[0].id;
	return null;
}

export async function processKofiPayment(db: Firestore, payload: KofiWebhookPayload): Promise<void> {
	const code = extractPaymentCode(
		[payload.message, payload.from_name].filter(Boolean).join(' ')
	);
	let discordUserId: string | null = null;
	let matchedBy = '';

	if (code) {
		const codeDoc = await paymentCodesCollection(db).doc(code).get();
		if (codeDoc.exists) {
			discordUserId = codeDoc.data()?.discordUserId ?? null;
			matchedBy = 'paymentCode';
		}
	}

	if (!discordUserId && payload.email) {
		discordUserId = await findByEmail(db, payload.email.trim());
		if (discordUserId) matchedBy = 'email';
	}

	if (!discordUserId && payload.from_name && payload.from_name !== 'Anonymous') {
		discordUserId = await findByUsername(db, payload.from_name.trim());
		if (discordUserId) matchedBy = 'username';
	}

	const amount = asAmount(payload.amount);
	if (discordUserId && amount !== undefined && amount < MIN_ENTRY_FEE) {
		const txId = payload.kofi_transaction_id || payload.message_id || `unknown-${Date.now()}`;
		const { verification_token: _underToken, ...underPayload } = payload;
		await unmatchedPaymentsCollection(db).doc(txId).set({
			...underPayload,
			matchedBy,
			reason: 'below_minimum',
			receivedAt: FieldValue.serverTimestamp()
		});
		return;
	}

	if (discordUserId) {
		const result = await markSubmissionPaid(db, discordUserId, payload);
		if (result.matched) {
			if (!result.alreadyAnnounced) {
				const posted = await notifyOlympicsPayment({
					discordUserId,
					amount,
					rawAmount: payload.amount
				});
				if (posted && result.paymentId) {
					await submissionsCollection(db).doc(discordUserId).update({
						'discordAnnounce.paidTransactionIds': FieldValue.arrayUnion(result.paymentId)
					});
				}
			}
			return;
		}
	}

	const txId = payload.kofi_transaction_id || payload.message_id || `unknown-${Date.now()}`;
	const { verification_token: _token, ...safePayload } = payload;
	await unmatchedPaymentsCollection(db).doc(txId).set({
		...safePayload,
		matchedBy: matchedBy || null,
		receivedAt: FieldValue.serverTimestamp()
	});
}
