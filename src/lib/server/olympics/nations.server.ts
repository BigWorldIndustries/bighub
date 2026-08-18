import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import { ControlledError } from '../util/util.server';
import {
	FREE_AGENT_ID,
	MIN_ENTRY_FEE,
	OLYMPICS_FORM_ID,
	SEED_NATIONS,
	generatePaymentCode,
	slugifyNationName,
	type AvailabilityStatus
} from '$lib/olympics/config';
import { getAvailabilityDays } from '$lib/olympics/dates';
import type { OlympicsFormData, OlympicsNation, OlympicsSuggestedGame } from '$lib/olympics/types';
import {
	listOlympicsSuggestedGames,
	readNewSuggestedGames,
	resolveOlympicsGames,
	writeNewSuggestedGames
} from './games.server';

const VALID_STATUSES = new Set<AvailabilityStatus>(['available', 'tentative', 'unavailable']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function nationsCollection(db: Firestore) {
	return db.collection('forms').doc(OLYMPICS_FORM_ID).collection('nations');
}

export async function listOlympicsNations(db: Firestore): Promise<OlympicsNation[]> {
	const snapshot = await nationsCollection(db).get();
	const byId = new Map<string, OlympicsNation>();

	byId.set(FREE_AGENT_ID, { id: FREE_AGENT_ID, name: 'Free Agent', seed: true });

	for (const nation of SEED_NATIONS) {
		byId.set(nation.id, { id: nation.id, name: nation.name, seed: true });
	}

	for (const doc of snapshot.docs) {
		const data = doc.data();
		if (!byId.has(doc.id)) {
			byId.set(doc.id, {
				id: doc.id,
				name: data.name ?? doc.id,
				seed: false,
				createdBy: data.createdBy
			});
		}
	}

		return Array.from(byId.values()).sort((a, b) => {
			if (a.id === FREE_AGENT_ID) return -1;
			if (b.id === FREE_AGENT_ID) return 1;
			if (a.seed && !b.seed) return -1;
			if (!a.seed && b.seed) return 1;
			return a.name.localeCompare(b.name);
		});
}

function asString(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

export function normalizeOlympicsFormData(
	raw: Record<string, unknown>,
	nations: OlympicsNation[],
	suggestedCatalog: OlympicsSuggestedGame[] = []
): { form: OlympicsFormData; newSuggestions: { id: string; title: string }[] } {
	const email = asString(raw.email);
	const phone = asString(raw.phone);
	const createdNation = Boolean(raw.createdNation);
	let nationName = asString(raw.nationName);
	let nationId = asString(raw.nationId);

	if (email && !EMAIL_RE.test(email)) {
		throw new ControlledError(400, 'Please enter a valid email address.');
	}

	if (phone.length > 40) {
		throw new ControlledError(400, 'Phone number is too long.');
	}

	if (createdNation) {
		if (nationName.length < 2) {
			throw new ControlledError(400, 'Nation name must be at least 2 characters.');
		}
		if (nationName.length > 40) {
			throw new ControlledError(400, 'Nation name must be 40 characters or fewer.');
		}

		const slug = slugifyNationName(nationName);
		if (!slug) {
			throw new ControlledError(400, 'Nation name must include letters or numbers.');
		}

		const existing = nations.find((nation) => nation.id === slug);
		if (existing) {
			// Creating a name that already exists → join that nation instead
			nationId = existing.id;
			nationName = existing.name;
		} else {
			nationId = slug;
		}
	} else {
		const existing = nations.find((nation) => nation.id === nationId);
		if (!existing) {
			throw new ControlledError(400, 'Please select a nation or create your own.');
		}
		nationName = existing.name;
	}

	const { games, newSuggestions } = resolveOlympicsGames(raw, suggestedCatalog);

	if (games.length < 1) {
		throw new ControlledError(400, 'Please select at least one event.');
	}

	const availabilityRaw =
		raw.availability && typeof raw.availability === 'object' && !Array.isArray(raw.availability)
			? (raw.availability as Record<string, unknown>)
			: {};

	const availability: Record<string, AvailabilityStatus> = {};
	for (const day of getAvailabilityDays()) {
		const status = availabilityRaw[day.date];
		if (typeof status !== 'string' || !VALID_STATUSES.has(status as AvailabilityStatus)) {
			throw new ControlledError(400, 'Please mark availability for every day.');
		}
		availability[day.date] = status as AvailabilityStatus;
	}

	const actuallyCreated =
		createdNation && !nations.some((nation) => nation.id === nationId);

	return {
		form: {
			...(email ? { email } : {}),
			...(phone ? { phone } : {}),
			nationId,
			nationName,
			createdNation: actuallyCreated,
			games,
			availability,
			entryAmount: MIN_ENTRY_FEE,
			paymentStatus: 'pending' as const
		},
		newSuggestions
	};
}

function olympicsFormRef(db: Firestore) {
	return db.collection('forms').doc(OLYMPICS_FORM_ID);
}

export function paymentCodesCollection(db: Firestore) {
	return olympicsFormRef(db).collection('paymentCodes');
}

export function submissionsCollection(db: Firestore) {
	return olympicsFormRef(db).collection('submissions');
}

export function unmatchedPaymentsCollection(db: Firestore) {
	return olympicsFormRef(db).collection('unmatchedPayments');
}

async function mintUniquePaymentCode(db: Firestore): Promise<string> {
	for (let attempt = 0; attempt < 8; attempt++) {
		const code = generatePaymentCode();
		const existing = await paymentCodesCollection(db).doc(code).get();
		if (!existing.exists) return code;
	}
	throw new ControlledError(500, 'Could not generate a payment code. Please try again.');
}

export async function saveOlympicsSignup(
	db: Firestore,
	user: { id: string; username: string },
	rawFormData: Record<string, unknown>
) {
	const [nations, suggestedCatalog] = await Promise.all([
		listOlympicsNations(db),
		listOlympicsSuggestedGames(db)
	]);
	const { form: normalized, newSuggestions } = normalizeOlympicsFormData(
		rawFormData,
		nations,
		suggestedCatalog
	);

	const submissionRef = submissionsCollection(db).doc(user.id);
	const existingSnap = await submissionRef.get();
	const existingForm = (existingSnap.data()?.form_data ?? {}) as Partial<OlympicsFormData>;

	const paymentCode =
		typeof existingForm.paymentCode === 'string' && existingForm.paymentCode.startsWith('BWO-')
			? existingForm.paymentCode
			: await mintUniquePaymentCode(db);

	const alreadyPaid = existingForm.paymentStatus === 'paid';
	const form_data: OlympicsFormData = {
		...normalized,
		paymentCode,
		paymentStatus: alreadyPaid ? 'paid' : 'pending',
		...(alreadyPaid
			? {
					paidAmount: existingForm.paidAmount,
					kofiTransactionId: existingForm.kofiTransactionId,
					paidAt: existingForm.paidAt
				}
			: {})
	};

	const nationRef = nationsCollection(db).doc(form_data.nationId);
	const paymentCodeRef = paymentCodesCollection(db).doc(paymentCode);

	await db.runTransaction(async (tx) => {
		const existingNation = form_data.createdNation ? await tx.get(nationRef) : null;
		const suggestionItems = await readNewSuggestedGames(tx, db, newSuggestions);

		if (form_data.createdNation) {
			if (existingNation?.exists) {
				const owner = existingNation.data()?.createdBy;
				if (owner && owner !== user.id) {
					throw new ControlledError(
						409,
						'That nation name was just taken. Please choose another or join the existing one.'
					);
				}
			} else {
				tx.set(nationRef, {
					name: form_data.nationName,
					createdBy: user.id,
					createdAt: FieldValue.serverTimestamp()
				});
			}
		}

		writeNewSuggestedGames(tx, user.id, suggestionItems);

		tx.set(submissionRef, {
			discordUserId: user.id,
			discordUsername: user.username,
			discordUsernameLower: user.username.toLowerCase(),
			form_data,
			submittedAt: existingSnap.data()?.submittedAt ?? FieldValue.serverTimestamp(),
			updatedAt: FieldValue.serverTimestamp()
		});

		tx.set(paymentCodeRef, {
			discordUserId: user.id,
			paymentCode
		});
	});

	return form_data;
}

export async function ensureOlympicsPaymentCode(
	db: Firestore,
	user: { id: string; username: string }
): Promise<string | null> {
	const submissionRef = submissionsCollection(db).doc(user.id);
	const snap = await submissionRef.get();
	if (!snap.exists) return null;

	const form = (snap.data()?.form_data ?? {}) as Partial<OlympicsFormData>;
	if (typeof form.paymentCode === 'string' && form.paymentCode.startsWith('BWO-')) {
		return form.paymentCode;
	}

	const paymentCode = await mintUniquePaymentCode(db);
	await submissionRef.update({
		'form_data.paymentCode': paymentCode,
		discordUsernameLower: user.username.toLowerCase(),
		updatedAt: FieldValue.serverTimestamp()
	});
	await paymentCodesCollection(db).doc(paymentCode).set({
		discordUserId: user.id,
		paymentCode
	});
	return paymentCode;
}
