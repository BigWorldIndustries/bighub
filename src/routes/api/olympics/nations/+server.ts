import { error, json } from '@sveltejs/kit';
import { initializeFirebaseAdmin } from '$lib/server/firebase/firebase.server';
import { listOlympicsNations } from '$lib/server/olympics/nations.server';
import { ControlledError } from '$lib/server/util/util.server';

export const GET = async ({ locals }: { locals: App.Locals }) => {
	if (!locals.discordUser) {
		throw error(401, 'Not authenticated');
	}

	try {
		const admin = initializeFirebaseAdmin();
		const nations = await listOlympicsNations(admin.firestore());
		return json({ nations });
	} catch (err) {
		if (err instanceof ControlledError) {
			throw error(err.code, err.msg);
		}
		console.error('Error listing olympics nations:', err);
		throw error(500, 'Failed to load houses');
	}
};
