import { redirect } from '@sveltejs/kit';
import { FREE_AGENT_ID, OLYMPICS_FORM_ID } from '$lib/olympics/config';
import { initializeFirebaseAdmin } from '$lib/server/firebase/firebase.server';
import {
	ensureOlympicsPaymentCode,
	findOlympicsSubmissionByUsername
} from '$lib/server/olympics/nations.server';
import {
	normalizeReferralUsername,
	olympicsSignupReturnTo,
	withDerivedXp
} from '$lib/olympics/tiers';
import type {
	OlympicsNation,
	OlympicsReferrerPreview,
	OlympicsSubmission,
	OlympicsSuggestedGame
} from '$lib/olympics/types';

export const load = async ({
	locals,
	fetch,
	url
}: {
	locals: App.Locals;
	fetch: typeof globalThis.fetch;
	url: URL;
}) => {
	const returnTo = olympicsSignupReturnTo(url);

	if (!locals.discordUser) {
		throw redirect(302, `/api/auth/discord?returnTo=${encodeURIComponent(returnTo)}`);
	}

	if (locals.inBigWorld === undefined) {
		throw redirect(302, `/api/auth/discord?returnTo=${encodeURIComponent(returnTo)}`);
	}

	const previewGate = url.searchParams.get('previewGate') === '1';

	const [submissionRes, nationsRes, gamesRes] = await Promise.all([
		fetch(`/api/forms?formId=${OLYMPICS_FORM_ID}`),
		fetch('/api/olympics/nations'),
		fetch('/api/olympics/games')
	]);

	const submissionData = await submissionRes.json();
	const nationsData = await nationsRes.json();
	const gamesData = await gamesRes.json();
	let existingSubmission = (submissionData.submitted ? submissionData.submission : null) as
		| OlympicsSubmission
		| null;

	if (existingSubmission) {
		const admin = initializeFirebaseAdmin();
		const code = await ensureOlympicsPaymentCode(admin.firestore(), locals.discordUser);
		if (existingSubmission.form_data) {
			existingSubmission = {
				...existingSubmission,
				form_data: withDerivedXp({
					...existingSubmission.form_data,
					...(code ? { paymentCode: code } : {})
				})
			};
		}
	}

	const lockedReferrer = normalizeReferralUsername(
		existingSubmission?.form_data?.referredByUsername
	);
	const previewUsername =
		lockedReferrer || (existingSubmission ? '' : normalizeReferralUsername(url.searchParams.get('ref')));
	let referrerPreview: OlympicsReferrerPreview | null = null;
	if (
		previewUsername &&
		previewUsername.toLowerCase() !== locals.discordUser.username.toLowerCase()
	) {
		const admin = initializeFirebaseAdmin();
		const found = await findOlympicsSubmissionByUsername(admin.firestore(), previewUsername);
		const nationId = found?.form_data?.nationId;
		const highlightNation = Boolean(nationId && nationId !== FREE_AGENT_ID);
		referrerPreview = {
			username: found?.discordUsername ?? previewUsername,
			...(highlightNation
				? { nationId, nationName: found?.form_data?.nationName }
				: {})
		};
	}

	return {
		user: locals.discordUser,
		inBigWorld: locals.inBigWorld === true,
		previewGate,
		discordReturnTo: `/api/auth/discord?returnTo=${encodeURIComponent(returnTo)}`,
		existingSubmission,
		referrerPreview,
		nations: (nationsData.nations ?? []) as OlympicsNation[],
		suggestedGames: (gamesData.suggested ?? []) as OlympicsSuggestedGame[],
		signupCounts: (gamesData.signupCounts ?? {}) as Record<string, number>
	};
};
