import type { Handle } from '@sveltejs/kit';
import { AUTH_SECRET } from '$env/static/private';
import { createHmac } from 'crypto';

interface SessionData {
	discordUser: {
		id: string;
		username: string;
		avatar: string | null;
	};
	expiresAt: number;
}

function verifyAndDecodeSession(cookie: string): SessionData | null {
	try {
		const [payload, signature] = cookie.split('.');
		if (!payload || !signature) return null;

		// Verify signature
		const expectedSignature = createHmac('sha256', AUTH_SECRET)
			.update(payload)
			.digest('base64url');

		if (signature !== expectedSignature) {
			console.warn('Invalid session signature');
			return null;
		}

		// Decode payload
		const sessionData: SessionData = JSON.parse(
			Buffer.from(payload, 'base64url').toString('utf-8')
		);

		// Check expiration
		if (sessionData.expiresAt < Date.now()) {
			console.log('Session expired');
			return null;
		}

		return sessionData;
	} catch (error) {
		console.error('Error decoding session:', error);
		return null;
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get('session');

	if (sessionCookie) {
		const sessionData = verifyAndDecodeSession(sessionCookie);
		if (sessionData) {
			event.locals.discordUser = sessionData.discordUser;
		}
	}

	return resolve(event);
};
