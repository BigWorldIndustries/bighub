<script lang="ts">
	import type { OlympicsTierId } from '$lib/olympics/tiers';

	export let id: OlympicsTierId;
	export let name: string;
	export let size: 'md' | 'xl' | 'hero' = 'md';
</script>

<span class="tier-title {id} size-{size}">{name}</span>

<style>
	.tier-title {
		display: inline-block;
		font-weight: 800;
		letter-spacing: 0.01em;
		line-height: 1.2;
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		-webkit-text-fill-color: transparent;
	}

	.size-md {
		font-size: 1.05rem;
	}

	.size-xl {
		font-size: 1.35rem;
	}

	.size-hero {
		font-size: 1.85rem;
	}

	.freeSpirit {
		background-image: linear-gradient(90deg, #67e8f9, #a5b4fc, #7dd3fc);
		filter: drop-shadow(0 0 6px rgb(103 232 249 / 0.35));
	}

	.citizen {
		background-image: linear-gradient(90deg, #fde68a, #f59e0b, #fbbf24);
		filter: drop-shadow(0 0 8px rgb(245 158 11 / 0.45));
	}

	.protagonist {
		background-image: linear-gradient(
			90deg,
			#f9a8d4,
			#fbbf24,
			#67e8f9,
			#c4b5fd,
			#f9a8d4
		);
		background-size: 220% auto;
		animation: protagonist-shift 3.6s linear infinite;
		filter: drop-shadow(0 0 10px rgb(251 191 36 / 0.55)) drop-shadow(0 0 18px rgb(244 114 182 / 0.4));
	}

	@keyframes protagonist-shift {
		to {
			background-position: 220% center;
		}
	}
</style>
