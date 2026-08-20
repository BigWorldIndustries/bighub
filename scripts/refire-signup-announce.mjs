import { readFileSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function loadEnv() {
	const text = readFileSync(new URL('../.env', import.meta.url), 'utf8');
	for (const line of text.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const eq = trimmed.indexOf('=');
		if (eq < 1) continue;
		const key = trimmed.slice(0, eq).trim();
		let value = trimmed.slice(eq + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		process.env[key] = value;
	}
}

const NATION_SIGNUP_ANNOUNCEMENTS = [
	'**A NEW OLYMPIAN HAS EMERGED** 🔥🏅\n{mention} has taken the torch for **{nation}** and cast their name for the Big World Olympics.',
	'**THE FLAME IGNITES** 🔥\n{mention} of **{nation}** has stepped forward to compete in the Big World Olympics.',
	'**A CHALLENGER ENTERS THE GAMES** ⚔️🏆\n{mention} has claimed their place under the banner of **{nation}**.',
	'**THE ARENA GROWS LOUDER** 🏟️\n{mention} has answered the call of the Big World Olympics, representing **{nation}**.',
	'**LET THE RECORD SHOW** 📜\n{mention} has inscribed their name for **{nation}** in the Big World Olympics.',
	'**THE TORCH PASSES ON** 🔥\n{mention} flies the colors of **{nation}** and enters the Big World Olympics.',
	'**YOUR BANNER IS RAISED** 🚩\n{mention} has successfully entered the Big World Olympics under the banner of **{nation}**.'
];

const FREE_AGENT_SIGNUP_ANNOUNCEMENTS = [
	'**A NEW OLYMPIAN HAS EMERGED** 🔥🏅\n{mention} has taken the torch as a free agent and cast their name for the Big World Olympics.',
	'**THE FLAME IGNITES** 🔥\n{mention} has stepped forward unbound — a free agent in the Big World Olympics.',
	'**A CHALLENGER ENTERS THE GAMES** ⚔️🏆\n{mention} walks into the arena with no house at their back, a free agent.',
	'**THE ARENA GROWS LOUDER** 🏟️\n{mention} has answered the call of the Big World Olympics as a free agent.',
	'**LET THE RECORD SHOW** 📜\n{mention} has inscribed their name for the Big World Olympics, competing as a free agent.',
	'**THE TORCH PASSES ON** 🔥\n{mention} enters the Big World Olympics unclaimed, a free agent among the houses.',
	'**YOUR BANNER IS RAISED** 🚩\n{mention} has successfully entered the Big World Olympics as a free agent among the houses.'
];

function pickRandom(items) {
	return items[Math.floor(Math.random() * items.length)];
}

loadEnv();

const userIds = process.argv.slice(2).map((id) => id.trim()).filter(Boolean);
if (!userIds.length) {
	console.error('Usage: node scripts/refire-signup-announce.mjs <discordUserId> [moreIds...]');
	process.exit(1);
}

const webhookUrl = process.env.DISCORD_OLYMPICS_WEBHOOK_URL?.trim();
if (!webhookUrl) {
	console.error('DISCORD_OLYMPICS_WEBHOOK_URL is not set.');
	process.exit(1);
}

const serviceAccount = JSON.parse(
	Buffer.from(process.env.FIREBASE_SERVICE_KEY, 'base64').toString()
);
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const submissions = db.collection('forms').doc('olympics-2026').collection('submissions');

let failed = 0;
for (const userId of userIds) {
	const snap = await submissions.doc(userId).get();
	if (!snap.exists) {
		console.error(`No submission found for ${userId}`);
		failed += 1;
		continue;
	}

	const form = snap.data()?.form_data ?? {};
	const nationId = typeof form.nationId === 'string' ? form.nationId : '';
	const nationName = typeof form.nationName === 'string' ? form.nationName : '';
	const isFreeAgent =
		nationId === 'free-agent' || nationName.trim().toLowerCase() === 'free agent';
	const content = pickRandom(
		isFreeAgent ? FREE_AGENT_SIGNUP_ANNOUNCEMENTS : NATION_SIGNUP_ANNOUNCEMENTS
	)
		.replaceAll('{mention}', `<@${userId}>`)
		.replaceAll('{nation}', nationName);

	const response = await fetch(webhookUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			content,
			allowed_mentions: { users: [userId] }
		})
	});

	if (!response.ok) {
		console.error(`Webhook failed for ${userId}: ${response.status}`);
		failed += 1;
		continue;
	}

	console.log(`Posted signup announcement for ${userId} (${isFreeAgent ? 'free agent' : nationName})`);
}

if (failed) process.exit(1);
