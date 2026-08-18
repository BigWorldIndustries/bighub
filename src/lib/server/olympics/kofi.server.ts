import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import { MIN_ENTRY_FEE, extractPaymentCode } from '$lib/olympics/config';
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

async function markSubmissionPaid(
	db: Firestore,
	discordUserId: string,
	payload: KofiWebhookPayload
): Promise<boolean> {
	const submissionRef = submissionsCollection(db).doc(discordUserId);
	const snap = await submissionRef.get();
	if (!snap.exists) return false;

	const form = snap.data()?.form_data ?? {};
	if (form.kofiTransactionId && form.kofiTransactionId === payload.kofi_transaction_id) {
		return true;
	}

	await submissionRef.update({
		'form_data.paymentStatus': 'paid',
		'form_data.paidAmount': asAmount(payload.amount),
		'form_data.kofiTransactionId': payload.kofi_transaction_id ?? null,
		'form_data.paidAt': FieldValue.serverTimestamp(),
		updatedAt: FieldValue.serverTimestamp()
	});

	return true;
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
	const code = extractPaymentCode(payload.message ?? undefined);
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
		const updated = await markSubmissionPaid(db, discordUserId, payload);
		if (updated) return;
	}

	const txId = payload.kofi_transaction_id || payload.message_id || `unknown-${Date.now()}`;
	const { verification_token: _token, ...safePayload } = payload;
	await unmatchedPaymentsCollection(db).doc(txId).set({
		...safePayload,
		matchedBy: matchedBy || null,
		receivedAt: FieldValue.serverTimestamp()
	});
}
