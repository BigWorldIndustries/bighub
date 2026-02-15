import { redirect } from '@sveltejs/kit';
import { DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI } from '$env/static/private';
import { randomBytes } from 'crypto';

const redirectUri = DISCORD_REDIRECT_URI.trim();

export const GET = async ({ cookies, url }: any) => {
	// Generate a random state parameter for CSRF protection
	const state = randomBytes(16).toString('hex');
	
	// Store state in a cookie to verify later
	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 60 * 10 // 10 minutes
	});

	// Get the returnTo parameter if it exists, otherwise default to /nominate
	const returnTo = url.searchParams.get('returnTo') || '/nominate';
	cookies.set('oauth_return_to', returnTo, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 60 * 10 // 10 minutes
	});

	// Build Discord OAuth URL
	const params = new URLSearchParams({
		client_id: DISCORD_CLIENT_ID,
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: 'identify',
		state
	});

	throw redirect(302, `https://discord.com/api/oauth2/authorize?${params}`);
};
