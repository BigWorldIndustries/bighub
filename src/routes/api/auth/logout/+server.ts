import { redirect } from '@sveltejs/kit';

export const GET = async ({ cookies }: any) => {
	// Clear the session cookie
	cookies.delete('session', { path: '/' });

	// Redirect to home page
	throw redirect(302, '/');
};
