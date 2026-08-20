import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';

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

loadEnv();

const [messagePath, ...flags] = process.argv.slice(2);
if (!messagePath) {
	console.error(
		'Usage: node scripts/post-webhook-message.mjs <messageFile> [--send] [--webhook=URL] [--no-everyone] [--file=path] [--embed-image=path] [--no-embed]'
	);
	process.exit(1);
}

const send = flags.includes('--send');
const suppressEveryone = flags.includes('--no-everyone');
const skipEmbed = flags.includes('--no-embed');
const webhookOverride = flags.find((flag) => flag.startsWith('--webhook='))?.slice('--webhook='.length);
const filePath = flags.find((flag) => flag.startsWith('--file='))?.slice('--file='.length);
let embedImagePath = flags.find((flag) => flag.startsWith('--embed-image='))?.slice('--embed-image='.length);
const content = readFileSync(messagePath, 'utf8').replace(/\s+$/, '');
const embedPath = messagePath.replace(/(\.[^.]+)?$/, '.embed.json');
let embeds;
if (!skipEmbed) {
	try {
		embeds = [JSON.parse(readFileSync(embedPath, 'utf8'))];
		console.log(`embed: ${embedPath}`);
	} catch {
		embeds = undefined;
	}
}
if (embedImagePath) {
	const filename = embedImagePath.split(/[/\\]/).pop() || 'image.gif';
	embeds = embeds ?? [{}];
	embeds[0] = { ...embeds[0], image: { url: `attachment://${filename}` } };
	console.log(`embed image: ${embedImagePath}`);
} else if (embeds?.[0]?.image?.url?.startsWith('attachment://')) {
	const filename = embeds[0].image.url.slice('attachment://'.length);
	const sibling = join(dirname(messagePath), filename);
	if (!existsSync(sibling)) {
		console.error(`Missing embed attachment: ${sibling}`);
		process.exit(1);
	}
	embedImagePath = sibling;
	console.log(`embed image: ${embedImagePath}`);
}
if (filePath) console.log(`attachment: ${filePath}`);
const mentioned = [...new Set([...content.matchAll(/<@!?(\d+)>/g)].map((m) => m[1]))];
const pingsEveryone = /@everyone\b/.test(content) && !suppressEveryone;
const parse = pingsEveryone ? ['everyone'] : [];

console.log(`file: ${messagePath}`);
console.log(`characters: ${content.length} / 2000`);
console.log(`mentions: ${mentioned.length ? mentioned.join(', ') : 'none'}`);
console.log(`@everyone: ${pingsEveryone ? 'yes' : 'no'}`);

if (content.length > 2000) {
	console.error('Message exceeds Discord\'s 2000 character limit.');
	process.exit(1);
}

if (!send) {
	console.log('\nDry run. Re-run with --send to post it.');
	process.exit(0);
}

const webhookUrl = (webhookOverride || process.env.DISCORD_OLYMPICS_WEBHOOK_URL)?.trim();
if (!webhookUrl) {
	console.error('No webhook. Pass --webhook=URL or set DISCORD_OLYMPICS_WEBHOOK_URL.');
	process.exit(1);
}

const payload = {
	content,
	allowed_mentions: { parse, users: mentioned },
	...(embeds ? { embeds } : {})
};

const attachPath = filePath || embedImagePath;

let response;
if (attachPath) {
	const filename = attachPath.split(/[/\\]/).pop() || 'attachment';
	const blob = new Blob([readFileSync(attachPath)]);
	const form = new FormData();
	form.append('payload_json', JSON.stringify(payload));
	form.append('files[0]', blob, filename);
	response = await fetch(webhookUrl, { method: 'POST', body: form });
} else {
	response = await fetch(webhookUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
}

if (!response.ok) {
	const body = await response.text().catch(() => '');
	console.error(`Webhook failed: ${response.status} ${body}`);
	process.exit(1);
}

console.log('Posted.');
