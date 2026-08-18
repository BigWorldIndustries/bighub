import { redirect } from '@sveltejs/kit';
import { OLYMPICS_FORM_ID } from '$lib/olympics/config';
import { initializeFirebaseAdmin } from '$lib/server/firebase/firebase.server';
import { ensureOlympicsPaymentCode } from '$lib/server/olympics/nations.server';
import type { OlympicsNation, OlympicsSubmission, OlympicsSuggestedGame } from '$lib/olympics/types';

export const load = async ({ locals, fetch }: { locals: App.Locals; fetch: typeof globalThis.fetch }) => {
	if (!locals.discordUser) {
		throw redirect(302, '/api/auth/discord?returnTo=/olympics/signup');
	}

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

	if (existingSubmission && !existingSubmission.form_data?.paymentCode) {
		const admin = initializeFirebaseAdmin();
		const code = await ensureOlympicsPaymentCode(admin.firestore(), locals.discordUser);
		if (code && existingSubmission.form_data) {
			existingSubmission = {
				...existingSubmission,
				form_data: { ...existingSubmission.form_data, paymentCode: code }
			};
		}
	}

	return {
		user: locals.discordUser,
		existingSubmission,
		nations: (nationsData.nations ?? []) as OlympicsNation[],
		suggestedGames: (gamesData.suggested ?? []) as OlympicsSuggestedGame[],
		signupCounts: (gamesData.signupCounts ?? {}) as Record<string, number>
	};
};
