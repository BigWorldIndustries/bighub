export const NATION_COLOR_SCHEMES = [
	{ id: 'ember', label: 'Ember', from: '#fb7185', to: '#f59e0b' },
	{ id: 'royal', label: 'Royal', from: '#c084fc', to: '#f472b6' },
	{ id: 'ocean', label: 'Ocean', from: '#38bdf8', to: '#818cf8' },
	{ id: 'forest', label: 'Forest', from: '#34d399', to: '#a3e635' },
	{ id: 'midnight', label: 'Midnight', from: '#818cf8', to: '#22d3ee' },
	{ id: 'sun', label: 'Sun', from: '#fbbf24', to: '#f97316' },
	{ id: 'orange', label: 'Orange', from: '#fb923c', to: '#ea580c' },
	{ id: 'frost', label: 'Frost', from: '#e2e8f0', to: '#7dd3fc' },
	{ id: 'crimson', label: 'Crimson', from: '#f43f5e', to: '#fb7185' }
] as const;

export type NationColorId = (typeof NATION_COLOR_SCHEMES)[number]['id'];

export const DEFAULT_NATION_COLOR: NationColorId = 'royal';

export const NATION_EMOJI_CHOICES = [
	'🔥',
	'👑',
	'⚔️',
	'🛡️',
	'🌊',
	'🏝️',
	'🌿',
	'🦎',
	'⚡',
	'❄️',
	'🌙',
	'☀️',
	'🦅',
	'🐉',
	'💫',
	'🎭',
	'🧀',
	'🥧',
	'☕',
	'🎺',
	'🧿',
	'🌸'
] as const;

export function isNationColorId(value: string): value is NationColorId {
	return NATION_COLOR_SCHEMES.some((scheme) => scheme.id === value);
}

export function nationColorScheme(id: string | undefined) {
	return NATION_COLOR_SCHEMES.find((scheme) => scheme.id === id) ?? null;
}

export function firstGrapheme(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) return '';
	try {
		const parts = new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(trimmed);
		return [...parts][0]?.segment ?? '';
	} catch {
		return Array.from(trimmed)[0] ?? '';
	}
}

export function parseNationEmojis(raw: unknown): string[] {
	if (!Array.isArray(raw)) return [];
	return raw
		.slice(0, 2)
		.map((item) => firstGrapheme(typeof item === 'string' ? item : ''))
		.filter(Boolean);
}
