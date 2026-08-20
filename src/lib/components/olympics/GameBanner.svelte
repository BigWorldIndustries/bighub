<script lang="ts">
	import { GAME_BADGES, gameBannerSrc, type OlympicsGame } from '$lib/olympics/games';

	export let game: OlympicsGame;
	export let selected = false;

	let showImage = false;

	$: imageSrc = game.imageUrl?.trim() || gameBannerSrc(game.id);
	$: imageSrc, (showImage = false);
</script>

<button
	type="button"
	on:click
	class="game-banner card rounded-xl text-left w-full h-44 relative overflow-visible
		{selected ? 'selected z-10' : 'hover:z-20'}"
>
	<div class="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
		<div class="absolute inset-0 bg-gradient-to-br from-primary-600/70 via-surface-800 to-secondary-600/50" />
		<img
			src={imageSrc}
			alt=""
			class="banner-media absolute inset-0 w-full h-full object-cover {showImage ? '' : 'hidden'}"
			on:load={() => (showImage = true)}
			on:error={() => (showImage = false)}
		/>
		<div class="absolute inset-0 banner-shade" class:has-image={showImage} />
	</div>

	<div class="relative z-10 h-full flex flex-col justify-between p-3">
		<div class="flex flex-wrap gap-1.5">
			{#each game.badges as badgeId}
				{@const badge = GAME_BADGES[badgeId]}
				{#if badge}
					<span class="badge-wrap relative">
						<span class="badge {badge.classes} text-[10px] px-2 py-0.5 font-semibold tracking-wide">
							{badge.label}
						</span>
						<span class="badge-tip">{badge.tooltip}</span>
					</span>
				{/if}
			{/each}
		</div>

		<div class="flex items-end justify-between gap-2">
			<div class="min-w-0">
				<h3 class="text-lg font-bold text-white drop-shadow-md leading-tight">{game.title}</h3>
				{#if game.note}
					<p class="text-xs text-surface-200 drop-shadow-md mt-1 leading-snug">{game.note}</p>
				{/if}
			</div>
			{#if selected}
				<span class="check-mark flex-shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center font-bold shadow-md">
					✓
				</span>
			{/if}
		</div>
	</div>
</button>

<style>
	.game-banner {
		border: 2px solid rgb(148 163 184 / 0.28);
		box-shadow: 0 4px 14px rgb(0 0 0 / 0.25);
		transition:
			transform 180ms ease,
			box-shadow 180ms ease,
			border-color 180ms ease,
			filter 180ms ease;
	}

	.game-banner:hover {
		transform: translateY(-6px) scale(1.035);
		filter: brightness(1.18);
		box-shadow: 0 16px 32px rgb(0 0 0 / 0.45);
		border-color: rgb(226 232 240 / 0.7);
	}

	.game-banner.selected {
		border: 3px solid #22c55e;
		box-shadow:
			0 0 0 3px rgb(34 197 94 / 0.35),
			0 12px 28px rgb(0 0 0 / 0.4);
	}

	.game-banner.selected:hover {
		border-color: #4ade80;
		box-shadow:
			0 0 0 4px rgb(34 197 94 / 0.45),
			0 16px 32px rgb(0 0 0 / 0.45);
	}

	.check-mark {
		background: #22c55e;
	}

	.banner-media {
		transform: scale(1.04);
		transition: transform 180ms ease;
	}

	.game-banner:hover .banner-media {
		transform: scale(1.14);
	}

	.banner-shade {
		background: rgb(0 0 0 / 0.18);
		transition: background 180ms ease;
	}

	.banner-shade.has-image {
		background: linear-gradient(to top, rgb(0 0 0 / 0.8), rgb(0 0 0 / 0.28), rgb(0 0 0 / 0.08));
	}

	.game-banner:hover .banner-shade {
		background: rgb(0 0 0 / 0.02);
	}

	.game-banner:hover .banner-shade.has-image {
		background: linear-gradient(to top, rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.08), transparent);
	}

	.badge-wrap .badge-tip {
		display: none;
		position: absolute;
		left: 0;
		top: calc(100% + 6px);
		z-index: 20;
		width: max-content;
		max-width: 240px;
		padding: 0.5rem 0.65rem;
		border-radius: 0.4rem;
		background: rgb(15 23 42 / 0.95);
		color: rgb(241 245 249);
		font-size: 0.75rem;
		line-height: 1.3;
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.35);
		pointer-events: none;
	}

	.badge-wrap:hover .badge-tip {
		display: block;
	}
</style>
