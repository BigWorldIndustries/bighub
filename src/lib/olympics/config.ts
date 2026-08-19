export const OLYMPICS_FORM_ID = 'olympics-2026';
export const DISCORD_INVITE_URL = 'https://discord.gg/RfbyhH9FZc';
export const BIG_WORLD_GUILD_ID = '618468327404339220';
export const FREE_AGENT_ID = 'free-agent';
export const KOFI_PAGE_URL = 'https://ko-fi.com/bigworld';
export const KOFI_USERNAME = 'bigworld';
export const MIN_ENTRY_FEE = 5;
export const PAYMENT_CODE_RE = /\bBWO-[A-HJ-NP-Z2-9]{4}\b/i;
const PAYMENT_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generatePaymentCode(): string {
	let suffix = '';
	for (let i = 0; i < 4; i++) {
		suffix += PAYMENT_CODE_ALPHABET[Math.floor(Math.random() * PAYMENT_CODE_ALPHABET.length)];
	}
	return `BWO-${suffix}`;
}

export function extractPaymentCode(message: string | null | undefined): string | null {
	if (!message) return null;
	const normalized = message.toUpperCase().replace(/[\u2010-\u2015\u2212]/g, '-');
	const match = normalized.match(PAYMENT_CODE_RE);
	return match ? match[0] : null;
}

export const AVAILABILITY_START = '2026-08-17';
export const AVAILABILITY_END = '2026-09-20';

export const SEED_NATIONS = [
	{ id: 'maharnegonia', name: 'Maharnegonia', captain: 'Noonz', colorScheme: 'crimson', emojis: ['⚔️', '🛡️'] },
	{ id: 'zazuland', name: 'Zazuland', captain: 'Zazu', colorScheme: 'ocean', emojis: ['👑', '🏰'] },
	{ id: 'shneibler-isles', name: 'Shneibler Isles', captain: 'Dan', colorScheme: 'forest', emojis: ['🌊', '🏝️'] }
] as const;

export type AvailabilityStatus = 'available' | 'tentative' | 'unavailable';

export const AVAILABILITY_CYCLE: Record<AvailabilityStatus, AvailabilityStatus> = {
	unavailable: 'available',
	available: 'tentative',
	tentative: 'unavailable'
};

export function slugifyNationName(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 48);
}
