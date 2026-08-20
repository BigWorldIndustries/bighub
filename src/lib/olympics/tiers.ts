export type OlympicsTierId = 'freeSpirit' | 'citizen' | 'protagonist';

export const XP_PER_USD = 1000;
export const XP_PER_REFERRAL = 2500;

export interface OlympicsTier {
	id: OlympicsTierId;
	name: string;
	xp: number;
	usd: number;
	tagline: string;
	perks: string[];
	featuredPerks?: {
		before?: string;
		highlight: string;
		after?: string;
		tone: 'custom' | 'holo' | 'pack';
	}[];
	shortPerks: string[];
}

export const OLYMPICS_TIERS: OlympicsTier[] = [
	{
		id: 'freeSpirit',
		name: 'Free Spirit',
		xp: 0,
		usd: 0,
		tagline: 'Free to enter',
		perks: [
			'Play in any event',
			'Not eligible for gifted games',
			'Not eligible for raffles or giveaways'
		],
		shortPerks: ['Play in any event']
	},
	{
		id: 'citizen',
		name: 'Citizen',
		xp: 5000,
		usd: 5,
		tagline: '$5 or 5,000 XP',
		perks: [
			'Play in any event',
			'Gifted games',
			'Raffles and giveaways',
			'Bronze / Silver / Gold medals for top 3 placements'
		],
		shortPerks: ['Gifted games', 'Raffles & giveaways', 'Medals for top 3']
	},
	{
		id: 'protagonist',
		name: 'Protagonist',
		xp: 10000,
		usd: 10,
		tagline: '$10 or 10,000 XP',
		perks: [
			'Everything in Citizen, plus:'
		],
		featuredPerks: [
			{ highlight: 'Custom card', after: ' in the 2026 trading card set', tone: 'custom' },
			{ highlight: 'Holographic card', after: ' mailed to you', tone: 'holo' },
			{ before: '1 Big World Olympics ', highlight: 'booster pack', tone: 'pack' }
		],
		shortPerks: [
			'Everything in Citizen',
			'Custom card in the 2026 set',
			'Holo card + booster mailed to you'
		]
	}
];

export function computeOlympicsXp(paidAmount: number, referralCount: number): number {
	const paid = Number.isFinite(paidAmount) ? Math.max(0, paidAmount) : 0;
	const refs = Number.isFinite(referralCount) ? Math.max(0, Math.floor(referralCount)) : 0;
	return Math.round(paid * XP_PER_USD) + refs * XP_PER_REFERRAL;
}

export function tierFromXp(xp: number): OlympicsTierId {
	if (xp >= 10000) return 'protagonist';
	if (xp >= 5000) return 'citizen';
	return 'freeSpirit';
}

export function tierById(id: OlympicsTierId | string | undefined): OlympicsTier {
	return OLYMPICS_TIERS.find((tier) => tier.id === id) ?? OLYMPICS_TIERS[0]!;
}

export function nextTier(xp: number): OlympicsTier | null {
	return OLYMPICS_TIERS.find((tier) => tier.xp > xp) ?? null;
}

export function formatXp(xp: number): string {
	return `${Math.max(0, Math.round(xp)).toLocaleString('en-US')} XP`;
}

export function normalizeReferralUsername(raw: unknown): string {
	if (typeof raw !== 'string') return '';
	return raw.trim().replace(/^@+/, '').slice(0, 32);
}

export function referralSignupPath(username: string): string {
	return `/olympics/signup?ref=${encodeURIComponent(username)}`;
}

export function olympicsSignupReturnTo(url: { searchParams: URLSearchParams }): string {
	const params = new URLSearchParams();
	const ref = url.searchParams.get('ref')?.trim();
	if (ref) params.set('ref', ref);
	if (url.searchParams.get('previewGate') === '1') params.set('previewGate', '1');
	const qs = params.toString();
	return qs ? `/olympics/signup?${qs}` : '/olympics/signup';
}

export function withDerivedXp<T extends { paidAmount?: number; referralCount?: number }>(
	form: T
): T & {
	paidAmount: number;
	referralCount: number;
	xp: number;
	tier: OlympicsTierId;
} {
	const paidAmount =
		typeof form.paidAmount === 'number' && Number.isFinite(form.paidAmount)
			? Math.max(0, form.paidAmount)
			: 0;
	const referralCount =
		typeof form.referralCount === 'number' && Number.isFinite(form.referralCount)
			? Math.max(0, Math.floor(form.referralCount))
			: 0;
	const xp = computeOlympicsXp(paidAmount, referralCount);
	return { ...form, paidAmount, referralCount, xp, tier: tierFromXp(xp) };
}
