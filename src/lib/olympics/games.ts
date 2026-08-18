export type BadgeId =
	| 'gifted'
	| 'ftp'
	| 'cash'
	| 'popular'
	| 'multiDay'
	| 'casual'
	| 'team'
	| 'suggested';

export interface GameBadge {
	id: BadgeId;
	label: string;
	tooltip: string;
	classes: string;
}

export interface OlympicsGame {
	id: string;
	title: string;
	badges: BadgeId[];
	note?: string;
}

export const GAME_BADGES: Record<BadgeId, GameBadge> = {
	gifted: {
		id: 'gifted',
		label: 'Gifted Game',
		tooltip: "Participants will be gifted this game if they don't already have it.",
		classes: 'variant-filled-primary'
	},
	ftp: {
		id: 'ftp',
		label: 'Free to Play',
		tooltip: 'This game is free to play.',
		classes: 'variant-filled-success'
	},
	cash: {
		id: 'cash',
		label: 'Cash Prize',
		tooltip: 'This game will have a cash prize for winners.',
		classes: 'variant-filled-warning'
	},
	popular: {
		id: 'popular',
		label: 'Popular',
		tooltip: 'This is a popular event, many sign-ups are expected.',
		classes: 'variant-filled-secondary'
	},
	multiDay: {
		id: 'multiDay',
		label: 'Multi-Day',
		tooltip: 'This event may run over multiple days.',
		classes: 'variant-filled-tertiary'
	},
	casual: {
		id: 'casual',
		label: 'Casual',
		tooltip: 'This game is casual-friendly, not expected to be super competitive.',
		classes: 'variant-soft-surface'
	},
	team: {
		id: 'team',
		label: 'Team Event',
		tooltip:
			'You will be paired up with teammate(s) from your nation, make sure they sign up as well!',
		classes: 'bg-sky-600 text-white'
	},
	suggested: {
		id: 'suggested',
		label: 'Suggested',
		tooltip: 'Community suggestion — interest is being gauged.',
		classes: 'bg-amber-600 text-white'
	}
};

/** Official 2026 roster. Suggested games are stored in Firestore and merged in the picker. */
export const OLYMPICS_GAMES: OlympicsGame[] = [
	{ id: 'smash-bros-ultimate', title: 'Smash Bros Ultimate', badges: ['popular'] },
	{ id: 'skribble', title: 'Skribble', badges: ['popular', 'ftp', 'casual'] },
	{ id: 'among-us', title: 'Among Us', badges: ['popular', 'gifted', 'casual'] },
	{ id: 'fall-guys', title: 'Fall Guys', badges: ['popular', 'gifted', 'casual'] },
	{ id: 'chess', title: 'Chess', badges: ['ftp', 'casual', 'multiDay'] },
	{ id: 'teamfight-tactics', title: 'Teamfight Tactics', badges: ['ftp'] },
	{ id: 'geoguessr', title: 'Geoguessr', badges: ['ftp', 'casual'] },
	{ id: 'marvel-rivals', title: 'Marvel Rivals', badges: ['ftp', 'team'] },
	{ id: 'rocket-league', title: 'Rocket League', badges: ['ftp', 'casual', 'team'] },
	{ id: 'omega-strikers', title: 'Omega Strikers', badges: ['ftp', 'casual', 'team'] },
	{ id: 'halo-custom-games', title: 'Halo (Custom Games)', badges: ['casual', 'ftp'] },
	{ id: 'halo-competitive', title: 'Halo (Competitive)', badges: ['popular', 'ftp'] },
	{ id: 'gears-of-war', title: 'Gears of War', badges: ['popular'] },
	{ id: 'splitgate', title: 'Splitgate', badges: ['ftp', 'team'] },
	{
		id: 'friend-slop',
		title: 'Friend Slop',
		badges: ['casual', 'gifted', 'multiDay'],
		note: 'A variety of friend slop games, to be decided the night of.'
	},
	{ id: 'online-poker', title: 'Online Poker', badges: ['ftp', 'casual'] },
	{
		id: 'trivia-games',
		title: 'Trivia Games',
		badges: ['ftp', 'casual', 'multiDay'],
		note: 'A variety of trivia games, to be decided the night of.'
	},
	{
		id: 'word-games',
		title: 'Word Games',
		badges: ['ftp', 'casual', 'multiDay'],
		note: 'A variety of word games, to be decided the night of.'
	},
	{ id: 'rust', title: 'Rust', badges: ['multiDay', 'team'] },
	{ id: 'apex-legends', title: 'Apex Legends', badges: ['ftp', 'team'] },
	{
		id: 'keep-talking-and-nobody-explodes',
		title: 'Keep Talking And Nobody Explodes',
		badges: ['casual', 'team']
	},
	{ id: 'legends-of-runeterra', title: 'Legends of Runeterra', badges: ['ftp'] },
	{ id: 'hades-ii-speedrun', title: 'Hades II (Speedrun)', badges: [] },
	{ id: 'yugioh', title: 'Yugioh', badges: ['multiDay'] }
];

export const GAME_IDS = new Set(OLYMPICS_GAMES.map((game) => game.id));
export const SUGGESTED_GAME_MAX_LENGTH = 40;

export function asSuggestedGame(id: string, title: string): OlympicsGame {
	return { id, title, badges: ['suggested'] };
}

export function compareGamesByPopularity(
	a: OlympicsGame,
	b: OlympicsGame,
	counts: Record<string, number>
): number {
	const countDiff = (counts[b.id] ?? 0) - (counts[a.id] ?? 0);
	if (countDiff !== 0) return countDiff;

	const aOfficial = GAME_IDS.has(a.id);
	const bOfficial = GAME_IDS.has(b.id);
	if (aOfficial && bOfficial) {
		return (
			OLYMPICS_GAMES.findIndex((game) => game.id === a.id) -
			OLYMPICS_GAMES.findIndex((game) => game.id === b.id)
		);
	}
	if (aOfficial) return -1;
	if (bOfficial) return 1;
	return a.title.localeCompare(b.title);
}

export function gameBannerSrc(gameId: string): string {
	return `/images/games/${gameId}.jpg`;
}
