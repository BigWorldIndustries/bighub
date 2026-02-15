import { error, redirect } from '@sveltejs/kit';
import { 
	DISCORD_CLIENT_ID, 
	DISCORD_CLIENT_SECRET, 
	DISCORD_REDIRECT_URI,
	AUTH_SECRET 
} from '$env/static/private';
import { createHmac } from 'crypto';

// Use trimmed redirect URI to avoid mismatches with Discord (e.g. trailing spaces in portal)
const redirectUri = DISCORD_REDIRECT_URI.trim();

interface DiscordTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
}

function createSessionCookie(discordUser: { id: string; username: string; avatar: string | null }): string {
	const sessionData = {
		discordUser,
		expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
	};

	const payload = Buffer.from(JSON.stringify(sessionData)).toString('base64url');
	const signature = createHmac('sha256', AUTH_SECRET)
		.update(payload)
		.digest('base64url');

	return `${payload}.${signature}`;
}

export const GET = async ({ url, cookies }: any) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('oauth_state');
	const returnTo = cookies.get('oauth_return_to') || '/nominate';

	// Verify state parameter
	if (!state || !storedState || state !== storedState) {
		throw error(400, 'Invalid state parameter');
	}

	if (!code) {
		throw error(400, 'No authorization code provided');
	}

	try {
		// Exchange code for access token
		const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				client_id: DISCORD_CLIENT_ID,
				client_secret: DISCORD_CLIENT_SECRET,
				grant_type: 'authorization_code',
				code,
				redirect_uri: redirectUri
			})
		});

		const tokenBody = await tokenResponse.text();
		if (!tokenResponse.ok) {
			console.error('Discord token exchange failed:', tokenBody);
			// Surface Discord's error so user can fix redirect_uri / client secret etc.
			let errMsg = 'Failed to exchange authorization code.';
			try {
				const parsed = JSON.parse(tokenBody) as { error?: string; error_description?: string };
				if (parsed.error_description) errMsg += ` ${parsed.error_description}`;
				else if (parsed.error) errMsg += ` (${parsed.error})`;
			} catch {
				// non-JSON response
			}
			throw error(500, errMsg);
		}

		const tokenData: DiscordTokenResponse = JSON.parse(tokenBody);

		// Fetch user info
		const userResponse = await fetch('https://discord.com/api/users/@me', {
			headers: {
				Authorization: `Bearer ${tokenData.access_token}`
			}
		});

		if (!userResponse.ok) {
			console.error('Discord user fetch failed:', await userResponse.text());
			throw error(500, 'Failed to fetch user information');
		}

		const discordUser: DiscordUser = await userResponse.json();

		// Create session cookie
		const sessionCookie = createSessionCookie({
			id: discordUser.id,
			username: discordUser.username,
			avatar: discordUser.avatar
		});

		// Set session cookie
		cookies.set('session', sessionCookie, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		// Clear OAuth cookies
		cookies.delete('oauth_state', { path: '/' });
		cookies.delete('oauth_return_to', { path: '/' });

		// Redirect to the return URL
		throw redirect(302, returnTo);
	} catch (err) {
		// Rethrow SvelteKit redirect and error() so user sees the real message
		if (err instanceof Response) throw err;
		if (err && typeof err === 'object' && 'status' in err && typeof (err as { status: number }).status === 'number') {
			throw err;
		}
		console.error('OAuth callback error:', err);
		throw error(500, 'Authentication failed');
	}
};
