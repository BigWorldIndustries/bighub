<script lang="ts">
	export let before: string = '';
	export let highlight: string;
	export let after: string = '';
	export let tone: 'custom' | 'holo' | 'pack' = 'custom';
</script>

<p class="featured-perk">
	{before}<span class="mark {tone}">{highlight}</span>{after}
</p>

<style>
	.featured-perk {
		margin: 0;
		font-size: 1.02rem;
		line-height: 1.45;
		color: rgb(226 232 240);
	}

	.mark {
		font-weight: 800;
	}

	.custom {
		color: #fb7185;
		text-shadow: 0 0 8px rgb(251 113 133 / 0.35);
	}

	.pack {
		color: #38bdf8;
		text-shadow: 0 0 8px rgb(56 189 248 / 0.35);
	}

	.holo {
		background-image: linear-gradient(
			90deg,
			#f9a8d4,
			#fbbf24,
			#67e8f9,
			#c4b5fd,
			#f9a8d4
		);
		background-size: 220% auto;
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		-webkit-text-fill-color: transparent;
		animation: holo-shift 3.2s linear infinite;
		filter: drop-shadow(0 0 6px rgb(251 191 36 / 0.35));
	}

	@keyframes holo-shift {
		to {
			background-position: 220% center;
		}
	}
</style>
