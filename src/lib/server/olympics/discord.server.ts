import { env } from '$env/dynamic/private';
import { FREE_AGENT_ID } from '$lib/olympics/config';

function webhookUrl(): string | undefined {
	const url = env.DISCORD_OLYMPICS_WEBHOOK_URL?.trim();
	return url || undefined;
}

function mention(discordUserId: string): string {
	return `<@${discordUserId}>`;
}

function pickRandom<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)]!;
}

/** Epic signup lines for house athletes. `{mention}` and `{nation}` (house name) are substituted before posting. */
export const NATION_SIGNUP_ANNOUNCEMENTS = [
	'**A NEW OLYMPIAN HAS EMERGED** 🔥🏅\n{mention} has taken the torch for **{nation}** and cast their name for the Big World Olympics.',
	'**THE FLAME IGNITES** 🔥\n{mention} of **{nation}** has stepped forward to compete in the Big World Olympics.',
	'**A CHALLENGER ENTERS THE GAMES** ⚔️🏆\n{mention} has claimed their place under the banner of **{nation}**.',
	'**THE ARENA GROWS LOUDER** 🏟️\n{mention} has answered the call of the Big World Olympics, representing **{nation}**.',
	'**LET THE RECORD SHOW** 📜\n{mention} has inscribed their name for **{nation}** in the Big World Olympics.',
	'**THE TORCH PASSES ON** 🔥\n{mention} flies the colors of **{nation}** and enters the Big World Olympics.'
];

/** Free-agent lines — they are unbound, not representing a house called "Free Agent". */
export const FREE_AGENT_SIGNUP_ANNOUNCEMENTS = [
	'**A NEW OLYMPIAN HAS EMERGED** 🔥🏅\n{mention} has taken the torch as a free agent and cast their name for the Big World Olympics.',
	'**THE FLAME IGNITES** 🔥\n{mention} has stepped forward unbound — a free agent in the Big World Olympics.',
	'**A CHALLENGER ENTERS THE GAMES** ⚔️🏆\n{mention} walks into the arena with no house at their back, a free agent.',
	'**THE ARENA GROWS LOUDER** 🏟️\n{mention} has answered the call of the Big World Olympics as a free agent.',
	'**LET THE RECORD SHOW** 📜\n{mention} has inscribed their name for the Big World Olympics, competing as a free agent.',
	'**THE TORCH PASSES ON** 🔥\n{mention} enters the Big World Olympics unclaimed, a free agent among the houses.'
];

export function formatPrizeAmount(amount: number | undefined, raw?: string): string {
	if (amount !== undefined && Number.isFinite(amount)) {
		return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
	}
	if (raw?.trim()) {
		const trimmed = raw.trim();
		return trimmed.startsWith('$') ? trimmed : `$${trimmed}`;
	}
	return '$0';
}

export function isFreeAgentSignup(nationId: string, nationName: string): boolean {
	return nationId === FREE_AGENT_ID || nationName.trim().toLowerCase() === 'free agent';
}

export function renderSignupAnnouncement(
	discordUserId: string,
	nationName: string,
	nationId = ''
): string {
	const template = pickRandom(
		isFreeAgentSignup(nationId, nationName)
			? FREE_AGENT_SIGNUP_ANNOUNCEMENTS
			: NATION_SIGNUP_ANNOUNCEMENTS
	);
	return template
		.replaceAll('{mention}', mention(discordUserId))
		.replaceAll('{nation}', nationName);
}

export function renderPaymentAnnouncement(
	discordUserId: string,
	amount: number | undefined,
	rawAmount?: string
): string {
	return `${mention(discordUserId)} has added ${formatPrizeAmount(amount, rawAmount)} to the Big World Olympics prize pool! 🔥🔥🔥`;
}

async function executeWebhook(
	content: string,
	userIds: string[]
): Promise<boolean> {
	const url = webhookUrl();
	if (!url) return false;

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				content,
				allowed_mentions: { users: userIds }
			})
		});

		if (!response.ok) {
			const body = await response.text().catch(() => '');
			console.error('Olympics Discord webhook failed:', response.status, body);
			return false;
		}

		return true;
	} catch (err) {
		console.error('Olympics Discord webhook error:', err);
		return false;
	}
}

export async function notifyOlympicsSignup(input: {
	discordUserId: string;
	nationName: string;
	nationId: string;
}): Promise<boolean> {
	const content = renderSignupAnnouncement(
		input.discordUserId,
		input.nationName,
		input.nationId
	);
	return executeWebhook(content, [input.discordUserId]);
}

export async function notifyOlympicsPayment(input: {
	discordUserId: string;
	amount: number | undefined;
	rawAmount?: string;
}): Promise<boolean> {
	const content = renderPaymentAnnouncement(
		input.discordUserId,
		input.amount,
		input.rawAmount
	);
	return executeWebhook(content, [input.discordUserId]);
}
