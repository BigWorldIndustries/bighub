import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import { ControlledError } from '../util/util.server';
import {
	FREE_AGENT_ID,
	OLYMPICS_FORM_ID,
	SEED_NATIONS,
	generatePaymentCode,
	slugifyNationName,
	type AvailabilityStatus
} from '$lib/olympics/config';
import {
	DEFAULT_NATION_COLOR,
	isNationColorId,
	parseNationEmojis
} from '$lib/olympics/nationStyle';
import { getAvailabilityDays } from '$lib/olympics/dates';
import { normalizeReferralUsername, withDerivedXp } from '$lib/olympics/tiers';
import type {
	OlympicsDiscordAnnounce,
	OlympicsFormData,
	OlympicsNation,
	OlympicsReferralLock,
	OlympicsSuggestedGame
} from '$lib/olympics/types';
import { notifyOlympicsSignup } from './discord.server';
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
		byId.set(nation.id, {
			id: nation.id,
			name: nation.name,
			seed: true,
			captain: nation.captain,
			colorScheme: nation.colorScheme,
			emojis: [...nation.emojis]
		});
	}

	const needsCaptainLookup: { id: string; createdBy: string }[] = [];

	for (const doc of snapshot.docs) {
		if (byId.has(doc.id)) continue;
		const data = doc.data();
		const createdBy = typeof data.createdBy === 'string' ? data.createdBy : undefined;
		const storedCaptain =
			typeof data.createdByUsername === 'string' ? data.createdByUsername.trim() : '';
		const colorScheme =
			typeof data.colorScheme === 'string' && isNationColorId(data.colorScheme)
				? data.colorScheme
				: undefined;
		const emojis = parseNationEmojis(data.emojis);
		byId.set(doc.id, {
			id: doc.id,
			name: data.name ?? doc.id,
			seed: false,
			createdBy,
			...(storedCaptain ? { captain: storedCaptain } : {}),
			...(colorScheme ? { colorScheme } : {}),
			...(emojis.length ? { emojis } : {})
		});
		if (createdBy && !storedCaptain) {
			needsCaptainLookup.push({ id: doc.id, createdBy });
		}
	}

	if (needsCaptainLookup.length) {
		const uniqueIds = [...new Set(needsCaptainLookup.map((item) => item.createdBy))];
		const snaps = await Promise.all(
			uniqueIds.map((id) => submissionsCollection(db).doc(id).get())
		);
		const usernames = new Map<string, string>();
		for (const snap of snaps) {
			const username = snap.data()?.discordUsername;
			if (typeof username === 'string' && username.trim()) {
				usernames.set(snap.id, username.trim());
			}
		}
		for (const item of needsCaptainLookup) {
			const captain = usernames.get(item.createdBy);
			if (!captain) continue;
			const nation = byId.get(item.id);
			if (nation) nation.captain = captain;
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
			throw new ControlledError(400, 'House name must be at least 2 characters.');
		}
		if (nationName.length > 40) {
			throw new ControlledError(400, 'House name must be 40 characters or fewer.');
		}

		const slug = slugifyNationName(nationName);
		if (!slug) {
			throw new ControlledError(400, 'House name must include letters or numbers.');
		}

		const existing = nations.find((nation) => nation.id === slug);
		if (existing) {
			nationId = existing.id;
			nationName = existing.name;
		} else {
			nationId = slug;
		}
	} else {
		const existing = nations.find((nation) => nation.id === nationId);
		if (!existing) {
			throw new ControlledError(400, 'Please select a house or create your own.');
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
	const anyDateWithNotice = Boolean(raw.anyDateWithNotice);
	for (const day of getAvailabilityDays()) {
		if (anyDateWithNotice) {
			availability[day.date] = 'available';
			continue;
		}
		const status = availabilityRaw[day.date];
		if (typeof status !== 'string' || !VALID_STATUSES.has(status as AvailabilityStatus)) {
			throw new ControlledError(400, 'Please mark availability for every day.');
		}
		availability[day.date] = status as AvailabilityStatus;
	}

	const actuallyCreated = createdNation && !nations.some((nation) => nation.id === nationId);

	const colorScheme =
		actuallyCreated && typeof raw.colorScheme === 'string' && isNationColorId(raw.colorScheme)
			? raw.colorScheme
			: actuallyCreated
				? DEFAULT_NATION_COLOR
				: undefined;
	const emojis = actuallyCreated ? parseNationEmojis(raw.emojis) : undefined;

	return {
		form: {
			...(email ? { email } : {}),
			...(phone ? { phone } : {}),
			nationId,
			nationName,
			createdNation: actuallyCreated,
			...(colorScheme ? { colorScheme } : {}),
			...(emojis?.length ? { emojis } : {}),
			games,
			availability,
			...(anyDateWithNotice ? { anyDateWithNotice: true } : {}),
			entryAmount: 0,
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

export function referralsCollection(db: Firestore) {
	return olympicsFormRef(db).collection('referrals');
}

function pendingReferralItems(db: Firestore, usernameLower: string) {
	return olympicsFormRef(db)
		.collection('pendingReferralCredits')
		.doc(usernameLower)
		.collection('items');
}

export async function findOlympicsSubmissionByUsername(
	db: Firestore,
	username: string
): Promise<{
	discordUserId: string;
	discordUsername: string;
	form_data: OlympicsFormData;
} | null> {
	const normalized = normalizeReferralUsername(username);
	if (!normalized) return null;

	const snapshot = await submissionsCollection(db)
		.where('discordUsernameLower', '==', normalized.toLowerCase())
		.limit(2)
		.get();

	if (snapshot.size !== 1) return null;
	const doc = snapshot.docs[0]!;
	const data = doc.data() ?? {};
	return {
		discordUserId: doc.id,
		discordUsername:
			typeof data.discordUsername === 'string' ? data.discordUsername : normalized,
		form_data: (data.form_data ?? {}) as OlympicsFormData
	};
}

function lockedReferralFields(
	lock: OlympicsReferralLock | undefined,
	existing: Partial<OlympicsFormData>
) {
	const username =
		(lock?.referrerUsername && lock.referrerUsername.trim()) ||
		(typeof existing.referredByUsername === 'string' ? existing.referredByUsername.trim() : '');
	const userId =
		(typeof lock?.referrerUserId === 'string' && lock.referrerUserId) ||
		(typeof existing.referredByUserId === 'string' ? existing.referredByUserId : '');
	return {
		...(username ? { referredByUsername: username } : {}),
		...(userId ? { referredByUserId: userId } : {})
	};
}

function asReferralLock(data: Record<string, unknown> | undefined): OlympicsReferralLock | undefined {
	if (!data) return undefined;
	return {
		referrerUsername: typeof data.referrerUsername === 'string' ? data.referrerUsername : '',
		referrerUsernameLower:
			typeof data.referrerUsernameLower === 'string' ? data.referrerUsernameLower : '',
		referrerUserId: typeof data.referrerUserId === 'string' ? data.referrerUserId : null,
		credited: Boolean(data.credited)
	};
}

function omitUndefined<T extends object>(value: T): T {
	const next = { ...value } as T & Record<string, unknown>;
	for (const key of Object.keys(next)) {
		if (next[key] === undefined) delete next[key];
	}
	return next;
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
	const referralRef = referralsCollection(db).doc(user.id);
	const usernameLower = user.username.toLowerCase();
	const pendingQuery = pendingReferralItems(db, usernameLower);

	const existingSnap = await submissionRef.get();
	const existingForm = (existingSnap.data()?.form_data ?? {}) as Partial<OlympicsFormData>;

	const paymentCode =
		typeof existingForm.paymentCode === 'string' && existingForm.paymentCode.startsWith('BWO-')
			? existingForm.paymentCode
			: await mintUniquePaymentCode(db);

	const nationRef = nationsCollection(db).doc(normalized.nationId);
	const paymentCodeRef = paymentCodesCollection(db).doc(paymentCode);
	const existingAnnounce = existingSnap.data()?.discordAnnounce as
		| OlympicsDiscordAnnounce
		| undefined;

	await db.runTransaction(async (tx) => {
		const submissionInTx = await tx.get(submissionRef);
		const referralSnap = await tx.get(referralRef);
		const pendingSnap = await tx.get(pendingQuery);
		const isNew = !submissionInTx.exists;
		const currentForm = (submissionInTx.data()?.form_data ?? existingForm) as Partial<OlympicsFormData>;
		const existingLock = asReferralLock(referralSnap.data() as Record<string, unknown> | undefined);

		const requestedRaw = isNew ? normalizeReferralUsername(rawFormData.referredByUsername) : '';
		const requested =
			requestedRaw && requestedRaw.toLowerCase() !== usernameLower ? requestedRaw : '';

		const referrerQuery =
			isNew && !existingLock && requested
				? await tx.get(
						submissionsCollection(db)
							.where('discordUsernameLower', '==', requested.toLowerCase())
							.limit(2)
					)
				: null;

		const pendingReferralSnaps = await Promise.all(
			pendingSnap.docs.map((doc) => tx.get(referralsCollection(db).doc(doc.id)))
		);

		const existingNation = Boolean(rawFormData.createdNation) ? await tx.get(nationRef) : null;
		const suggestionItems = await readNewSuggestedGames(tx, db, newSuggestions);

		let pendingCredits = 0;
		for (let i = 0; i < pendingSnap.docs.length; i++) {
			const pendingDoc = pendingSnap.docs[i]!;
			const lockSnap = pendingReferralSnaps[i]!;
			if (!lockSnap.exists) continue;
			if (lockSnap.data()?.credited) {
				tx.delete(pendingDoc.ref);
				continue;
			}
			pendingCredits += 1;
			tx.update(lockSnap.ref, {
				credited: true,
				referrerUserId: user.id
			});
			tx.delete(pendingDoc.ref);
		}

		let referralFields: {
			referredByUsername?: string;
			referredByUserId?: string;
		} = lockedReferralFields(existingLock, currentForm);

		if (!referralSnap.exists) {
			if (isNew && requested) {
				const referrerDoc = referrerQuery?.size === 1 ? referrerQuery.docs[0] : undefined;
				const referrerId = referrerDoc?.id;
				const canCredit = Boolean(referrerId && referrerId !== user.id);

				tx.set(referralRef, {
					referrerUsername: requested,
					referrerUsernameLower: requested.toLowerCase(),
					referrerUserId: canCredit ? referrerId : null,
					credited: canCredit,
					createdAt: FieldValue.serverTimestamp()
				});

				referralFields = {
					referredByUsername: requested,
					...(canCredit && referrerId ? { referredByUserId: referrerId } : {})
				};

				if (canCredit && referrerDoc && referrerId) {
					const referrerForm = (referrerDoc.data()?.form_data ?? {}) as Partial<OlympicsFormData>;
					const credited = withDerivedXp({
						...referrerForm,
						referralCount: (referrerForm.referralCount ?? 0) + 1
					});
					tx.update(referrerDoc.ref, {
						'form_data.referralCount': credited.referralCount,
						'form_data.xp': credited.xp,
						'form_data.tier': credited.tier,
						'form_data.paidAmount': credited.paidAmount,
						updatedAt: FieldValue.serverTimestamp()
					});
				} else {
					tx.set(pendingReferralItems(db, requested.toLowerCase()).doc(user.id), {
						referredUserId: user.id,
						referrerUsernameLower: requested.toLowerCase(),
						createdAt: FieldValue.serverTimestamp()
					});
				}
			} else {
				tx.set(referralRef, {
					referrerUsername: referralFields.referredByUsername ?? '',
					referrerUsernameLower: (referralFields.referredByUsername ?? '').toLowerCase(),
					referrerUserId: referralFields.referredByUserId ?? null,
					credited: true,
					createdAt: FieldValue.serverTimestamp()
				});
			}
		}

		const alreadyPaid = currentForm.paymentStatus === 'paid' || (currentForm.paidAmount ?? 0) > 0;
		const form_data: OlympicsFormData = omitUndefined(
			withDerivedXp({
				...normalized,
				paymentCode,
				paymentStatus: alreadyPaid ? ('paid' as const) : ('pending' as const),
				paidAmount: currentForm.paidAmount,
				referralCount: (currentForm.referralCount ?? 0) + pendingCredits,
				...(currentForm.kofiTransactionId
					? { kofiTransactionId: currentForm.kofiTransactionId }
					: {}),
				...(currentForm.paidAt ? { paidAt: currentForm.paidAt } : {}),
				...(currentForm.payments ? { payments: currentForm.payments } : {}),
				...referralFields
			})
		);

		if (form_data.createdNation) {
			if (existingNation?.exists) {
				const owner = existingNation.data()?.createdBy;
				if (owner && owner !== user.id) {
					throw new ControlledError(
						409,
						'That house name was just taken. Please choose another or join the existing one.'
					);
				}
			} else {
				tx.set(nationRef, {
					name: form_data.nationName,
					createdBy: user.id,
					createdByUsername: user.username,
					...(form_data.colorScheme ? { colorScheme: form_data.colorScheme } : {}),
					...(form_data.emojis?.length ? { emojis: form_data.emojis } : {}),
					createdAt: FieldValue.serverTimestamp()
				});
			}
		} else if (Boolean(rawFormData.createdNation)) {
			const owner = existingNation?.data()?.createdBy;
			if (existingNation?.exists && owner === user.id) {
				const colorScheme =
					typeof rawFormData.colorScheme === 'string' && isNationColorId(rawFormData.colorScheme)
						? rawFormData.colorScheme
						: DEFAULT_NATION_COLOR;
				tx.set(
					nationRef,
					{
						createdByUsername: user.username,
						colorScheme,
						emojis: parseNationEmojis(rawFormData.emojis)
					},
					{ merge: true }
				);
			}
		}

		writeNewSuggestedGames(tx, user.id, suggestionItems);

		tx.set(submissionRef, {
			discordUserId: user.id,
			discordUsername: user.username,
			discordUsernameLower: usernameLower,
			form_data,
			submittedAt: submissionInTx.data()?.submittedAt ?? FieldValue.serverTimestamp(),
			updatedAt: FieldValue.serverTimestamp(),
			...(existingAnnounce ? { discordAnnounce: existingAnnounce } : {})
		});

		tx.set(paymentCodeRef, {
			discordUserId: user.id,
			paymentCode
		});
	});

	if (!existingAnnounce?.submittedAt) {
		const posted = await notifyOlympicsSignup({
			discordUserId: user.id,
			nationName: normalized.nationName,
			nationId: normalized.nationId
		});
		if (posted) {
			await submissionRef.update({
				'discordAnnounce.submittedAt': FieldValue.serverTimestamp()
			});
		}
	}

	const saved = await submissionRef.get();
	return (saved.data()?.form_data ?? normalized) as OlympicsFormData;
}

export async function hydrateOlympicsSubmission(
	db: Firestore,
	user: { id: string; username: string }
): Promise<string | null> {
	const submissionRef = submissionsCollection(db).doc(user.id);
	const snap = await submissionRef.get();
	if (!snap.exists) return null;

	const form = (snap.data()?.form_data ?? {}) as Partial<OlympicsFormData>;
	let paymentCode =
		typeof form.paymentCode === 'string' && form.paymentCode.startsWith('BWO-')
			? form.paymentCode
			: null;

	if (!paymentCode) {
		paymentCode = await mintUniquePaymentCode(db);
		await paymentCodesCollection(db).doc(paymentCode).set({
			discordUserId: user.id,
			paymentCode
		});
	}

	const derived = withDerivedXp({
		...form,
		paymentCode,
		referralCount: form.referralCount ?? 0,
		paidAmount: form.paidAmount ?? 0
	});

	const xpChanged =
		form.xp !== derived.xp ||
		form.tier !== derived.tier ||
		form.paymentCode !== paymentCode ||
		form.referralCount !== derived.referralCount;

	if (xpChanged) {
		await submissionRef.update({
			'form_data.paymentCode': paymentCode,
			'form_data.paidAmount': derived.paidAmount,
			'form_data.referralCount': derived.referralCount,
			'form_data.xp': derived.xp,
			'form_data.tier': derived.tier,
			discordUsernameLower: user.username.toLowerCase(),
			updatedAt: FieldValue.serverTimestamp()
		});
	}

	return paymentCode;
}

export async function ensureOlympicsPaymentCode(
	db: Firestore,
	user: { id: string; username: string }
): Promise<string | null> {
	return hydrateOlympicsSubmission(db, user);
}
