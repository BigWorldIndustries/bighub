<script lang="ts">
	import { nationColorScheme } from '$lib/olympics/nationStyle';

	export let name: string;
	export let emojis: string[] = [];
	export let colorScheme: string | undefined = undefined;
	export let size: 'md' | 'xl' = 'md';

	$: scheme = nationColorScheme(colorScheme);
	$: shown = emojis.filter(Boolean);
</script>

<span class="nation-title" class:size-xl={size === 'xl'}>
	{#if shown.length}
		<span class="nation-emojis" aria-hidden="true">{shown.join(' ')}</span>
	{/if}
	{#if scheme}
		<span
			class="nation-gradient"
			style="--from: {scheme.from}; --to: {scheme.to};"
		>
			{name}
		</span>
	{:else}
		<span class="nation-plain">{name}</span>
	{/if}
</span>

<style>
	.nation-title {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		min-width: 0;
		font-weight: 700;
		line-height: 1.25;
	}

	.size-xl {
		font-size: 1.25rem;
	}

	.nation-emojis {
		flex-shrink: 0;
		font-weight: 400;
		letter-spacing: 0.06em;
	}

	.nation-plain {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.nation-gradient {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		background-image: linear-gradient(90deg, var(--from), var(--to));
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		-webkit-text-fill-color: transparent;
	}
</style>
