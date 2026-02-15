import { error, json } from '@sveltejs/kit';
import { initializeFirebaseAdmin } from '$lib/server/firebase/firebase.server';
import { FieldValue } from 'firebase-admin/firestore';

export const GET = async ({ url, locals }: any) => {
	const formId = url.searchParams.get('formId');

	if (!formId) {
		throw error(400, 'formId is required');
	}

	if (!locals.discordUser) {
		throw error(401, 'Not authenticated');
	}

	try {
		const admin = initializeFirebaseAdmin();
		const db = admin.firestore();

		const submissionDoc = await db
			.collection('forms')
			.doc(formId)
			.collection('submissions')
			.doc(locals.discordUser.id)
			.get();

		if (!submissionDoc.exists) {
			return json({ submitted: false, submission: null });
		}

		return json({ 
			submitted: true, 
			submission: submissionDoc.data() 
		});
	} catch (err) {
		console.error('Error fetching form submission:', err);
		throw error(500, 'Failed to fetch form submission');
	}
};

export const POST = async ({ request, locals }: any) => {
	if (!locals.discordUser) {
		throw error(401, 'Not authenticated');
	}

	let body;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	const { formId, form_data } = body;

	if (!formId || typeof formId !== 'string') {
		throw error(400, 'formId is required and must be a string');
	}

	if (!form_data || typeof form_data !== 'object') {
		throw error(400, 'form_data is required and must be an object');
	}

	try {
		const admin = initializeFirebaseAdmin();
		const db = admin.firestore();

		const submissionRef = db
			.collection('forms')
			.doc(formId)
			.collection('submissions')
			.doc(locals.discordUser.id);

		// Create or update submission (overwrites if user already submitted)
		await submissionRef.set({
			discordUserId: locals.discordUser.id,
			discordUsername: locals.discordUser.username,
			form_data,
			submittedAt: FieldValue.serverTimestamp()
		});

		return json({ success: true });
	} catch (err) {
		if (err instanceof Response) throw err;
		console.error('Error submitting form:', err);
		throw error(500, 'Failed to submit form');
	}
};
