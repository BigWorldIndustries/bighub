import { redirect, type Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { AUTH_SECRET } from '$env/static/private';
import { createHmac } from 'crypto';

interface SessionData {
	discordUser: {
		id: string;
		username: string;
		avatar: string | null;
	};
	inBigWorld?: boolean;
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

const KOFI_WEBHOOK_PATH = '/api/olympics/kofi';
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function isFormContentType(request: Request): boolean {
	const type = request.headers.get('content-type')?.split(';')[0]?.trim() ?? '';
	return (
		type === 'application/x-www-form-urlencoded' ||
		type === 'multipart/form-data' ||
		type === 'text/plain'
	);
}

export const handle: Handle = async ({ event, resolve }) => {
	// SvelteKit's built-in origin check is off so Ko-fi webhooks can POST.
	// Re-apply it everywhere except the token-authenticated Ko-fi route.
	if (
		!dev &&
		event.url.pathname !== KOFI_WEBHOOK_PATH &&
		MUTATING.has(event.request.method) &&
		isFormContentType(event.request)
	) {
		const origin = event.request.headers.get('origin');
		if (origin !== event.url.origin) {
			return new Response(`Cross-site ${event.request.method} form submissions are forbidden`, {
				status: 403
			});
		}
	}
	// Discord OAuth redirect is registered for localhost, not 127.0.0.1.
	// Cookies do not carry across those hosts, which causes "Invalid state parameter".
	if (dev && event.url.hostname === '127.0.0.1') {
		const url = new URL(event.url);
		url.hostname = 'localhost';
		throw redirect(307, url.toString());
	}

	const sessionCookie = event.cookies.get('session');

	if (sessionCookie) {
		const sessionData = verifyAndDecodeSession(sessionCookie);
		if (sessionData) {
			event.locals.discordUser = sessionData.discordUser;
			event.locals.inBigWorld = sessionData.inBigWorld;
		}
	}

	return resolve(event);
};
