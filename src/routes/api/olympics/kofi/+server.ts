import { error, json } from '@sveltejs/kit';
import { KOFI_VERIFICATION_TOKEN } from '$env/static/private';
import { initializeFirebaseAdmin } from '$lib/server/firebase/firebase.server';
import { processKofiPayment, type KofiWebhookPayload } from '$lib/server/olympics/kofi.server';

export const POST = async ({ request }) => {
	let payload: KofiWebhookPayload;

	try {
		const form = await request.formData();
		const raw = form.get('data');
		if (typeof raw !== 'string' || !raw) {
			throw new Error('missing data');
		}
		payload = JSON.parse(raw) as KofiWebhookPayload;
	} catch {
		throw error(400, 'Invalid Ko-fi payload');
	}

	if (!payload.verification_token || payload.verification_token !== KOFI_VERIFICATION_TOKEN) {
		throw error(401, 'Invalid verification token');
	}

	console.info('[kofi] webhook received', {
		type: payload.type,
		amount: payload.amount,
		currency: payload.currency,
		from_name: payload.from_name,
		message: payload.message,
		kofi_transaction_id: payload.kofi_transaction_id
	});

	try {
		const admin = initializeFirebaseAdmin();
		await processKofiPayment(admin.firestore(), payload);
	} catch (err) {
		console.error('Ko-fi webhook processing failed:', err);
		throw error(500, 'Failed to process Ko-fi webhook');
	}

	return json({ ok: true });
};
