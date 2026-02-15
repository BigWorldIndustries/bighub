import { redirect } from '@sveltejs/kit';

const FORM_ID = 'scotus-nomination';

export const load = async ({ locals, fetch }: any) => {
	// Check if user is authenticated
	if (!locals.discordUser) {
		throw redirect(302, '/api/auth/discord?returnTo=/nominate');
	}

	// Check if user has already submitted
	const response = await fetch(`/api/forms?formId=${FORM_ID}`);
	const data = await response.json();

	return {
		user: locals.discordUser,
		existingSubmission: data.submitted ? data.submission : null
	};
};
