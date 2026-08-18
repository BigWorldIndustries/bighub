import { FieldValue, type Firestore, type Transaction } from 'firebase-admin/firestore';
import { OLYMPICS_FORM_ID, slugifyNationName } from '$lib/olympics/config';
import { GAME_IDS, SUGGESTED_GAME_MAX_LENGTH } from '$lib/olympics/games';
import type { OlympicsSuggestedGame } from '$lib/olympics/types';

export function suggestedGamesCollection(db: Firestore) {
	return db.collection('forms').doc(OLYMPICS_FORM_ID).collection('suggestedGames');
}

export async function listOlympicsSuggestedGames(db: Firestore): Promise<OlympicsSuggestedGame[]> {
	const snapshot = await suggestedGamesCollection(db).get();
	return snapshot.docs
		.map((doc) => {
			const data = doc.data();
			return {
				id: doc.id,
				title: typeof data.name === 'string' && data.name.trim() ? data.name.trim() : doc.id,
				createdBy: typeof data.createdBy === 'string' ? data.createdBy : undefined,
				hidden: Boolean(data.hidden)
			};
		})
		.sort((a, b) => a.title.localeCompare(b.title));
}

export async function countOlympicsGameSignups(db: Firestore): Promise<Record<string, number>> {
	const snapshot = await db
		.collection('forms')
		.doc(OLYMPICS_FORM_ID)
		.collection('submissions')
		.get();

	const counts: Record<string, number> = {};
	for (const doc of snapshot.docs) {
		const games = doc.data()?.form_data?.games;
		if (!Array.isArray(games)) continue;

		const seen = new Set<string>();
		for (const value of games) {
			if (typeof value !== 'string') continue;
			const id = value.trim();
			if (!id || seen.has(id)) continue;
			seen.add(id);
			counts[id] = (counts[id] ?? 0) + 1;
		}
	}

	return counts;
}

function asString(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function parseIncomingSuggestions(raw: unknown): { id: string; title: string }[] {
	if (!Array.isArray(raw)) return [];

	const byId = new Map<string, { id: string; title: string }>();
	for (const item of raw) {
		if (!item || typeof item !== 'object') continue;
		const record = item as Record<string, unknown>;
		const title = asString(record.title);
		if (title.length < 2 || title.length > SUGGESTED_GAME_MAX_LENGTH) continue;

		const slug = slugifyNationName(title);
		if (!slug || GAME_IDS.has(slug)) continue;

		const id = asString(record.id) || slug;
		if (id !== slug) continue;
		byId.set(id, { id, title });
	}

	return Array.from(byId.values());
}

export function resolveOlympicsGames(
	raw: Record<string, unknown>,
	catalog: OlympicsSuggestedGame[]
): { games: string[]; newSuggestions: { id: string; title: string }[] } {
	const catalogById = new Map(catalog.map((game) => [game.id, game]));
	const incoming = parseIncomingSuggestions(raw.suggestedGames);
	const incomingById = new Map(incoming.map((game) => [game.id, game]));

	const rawIds = Array.isArray(raw.games) ? raw.games : [];
	const games: string[] = [];

	for (const value of rawIds) {
		if (typeof value !== 'string') continue;
		const id = value.trim();
		if (!id || games.includes(id)) continue;
		if (GAME_IDS.has(id) || catalogById.has(id) || incomingById.has(id)) {
			games.push(id);
		}
	}

	const newSuggestions = incoming.filter(
		(game) => games.includes(game.id) && !catalogById.has(game.id) && !GAME_IDS.has(game.id)
	);

	return { games, newSuggestions };
}

export async function readNewSuggestedGames(
	tx: Transaction,
	db: Firestore,
	suggestions: { id: string; title: string }[]
) {
	const items = [];
	for (const game of suggestions) {
		const ref = suggestedGamesCollection(db).doc(game.id);
		items.push({ game, ref, snap: await tx.get(ref) });
	}
	return items;
}

export function writeNewSuggestedGames(
	tx: Transaction,
	userId: string,
	items: Awaited<ReturnType<typeof readNewSuggestedGames>>
) {
	for (const item of items) {
		if (item.snap.exists) continue;
		tx.set(item.ref, {
			name: item.game.title,
			createdBy: userId,
			createdAt: FieldValue.serverTimestamp(),
			hidden: false
		});
	}
}
