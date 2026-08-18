import { error, json } from '@sveltejs/kit';
import { initializeFirebaseAdmin } from '$lib/server/firebase/firebase.server';
import { listOlympicsSuggestedGames, countOlympicsGameSignups } from '$lib/server/olympics/games.server';
import { ControlledError } from '$lib/server/util/util.server';

export const GET = async ({ locals }: { locals: App.Locals }) => {
	if (!locals.discordUser) {
		throw error(401, 'Not authenticated');
	}

	try {
		const admin = initializeFirebaseAdmin();
		const db = admin.firestore();
		const [suggested, signupCounts] = await Promise.all([
			listOlympicsSuggestedGames(db),
			countOlympicsGameSignups(db)
		]);
		return json({ suggested, signupCounts });
	} catch (err) {
		if (err instanceof ControlledError) {
			throw error(err.code, err.msg);
		}
		console.error('Error listing olympics suggested games:', err);
		throw error(500, 'Failed to load games');
	}
};
