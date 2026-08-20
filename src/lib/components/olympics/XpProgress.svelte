<script lang="ts">
	import {
		OLYMPICS_TIERS,
		formatXp,
		nextTier,
		tierById,
		withDerivedXp,
		type OlympicsTierId
	} from '$lib/olympics/tiers';
	import type { OlympicsFormData } from '$lib/olympics/types';
	import TierTitle from './TierTitle.svelte';

	export let form: OlympicsFormData;

	$: derived = withDerivedXp(form);
	$: current = tierById(derived.tier);
	$: upcoming = nextTier(derived.xp);
	$: xpIntoTier = Math.max(0, derived.xp - current.xp);
	$: span = upcoming ? upcoming.xp - current.xp : 1;
	$: progressPct = upcoming ? Math.min(100, Math.round((xpIntoTier / span) * 100)) : 100;

	function statusFor(id: OlympicsTierId): 'reached' | 'current' | 'locked' {
		const index = OLYMPICS_TIERS.findIndex((tier) => tier.id === id);
		const currentIndex = OLYMPICS_TIERS.findIndex((tier) => tier.id === current.id);
		if (index < currentIndex) return 'reached';
		if (index === currentIndex) return 'current';
		return 'locked';
	}
</script>

<div class="xp-tree signup-panel p-6">
	<div class="text-center mb-5">
		<p class="text-sm text-surface-400">Current tier</p>
		<p class="mt-1">
			<TierTitle id={current.id} name={current.name} size="hero" />
		</p>
		<p class="text-lg text-primary-300 mt-1">{formatXp(derived.xp)}</p>
		{#if upcoming}
			<p class="text-sm text-surface-300 mt-1">
				{formatXp(upcoming.xp - derived.xp)} to {upcoming.name}
			</p>
		{:else}
			<p class="text-sm text-surface-300 mt-1">You're at the current top tier. More tiers are coming.</p>
		{/if}
	</div>

	<div class="tier-track" aria-hidden="true">
		<div class="tier-track-bar">
			<div class="tier-track-fill" style="width: {progressPct}%"></div>
		</div>
	</div>

	<ol class="tier-steps">
		{#each OLYMPICS_TIERS as tier}
			{@const status = statusFor(tier.id)}
			<li class="tier-step" class:current={status === 'current'} class:reached={status === 'reached'}>
				<span class="tier-dot" class:current={status === 'current'} class:reached={status === 'reached'}>
					{#if status === 'reached'}✓{:else if status === 'current'}●{:else}○{/if}
				</span>
				<div>
					<TierTitle id={tier.id} name={tier.name} size="md" />
					<p class="text-sm text-surface-400">{tier.tagline}</p>
				</div>
			</li>
		{/each}
	</ol>
</div>

<style>
	.signup-panel {
		background: rgb(15 23 42 / 0.45);
		border: 1px solid rgb(148 163 184 / 0.16);
		backdrop-filter: blur(12px);
		border-radius: 1rem;
	}

	.tier-track {
		height: 0.45rem;
		margin: 0 0.6rem 1.25rem;
	}

	.tier-track-bar {
		height: 100%;
		border-radius: 999px;
		background: rgb(148 163 184 / 0.22);
		overflow: hidden;
	}

	.tier-track-fill {
		height: 100%;
		border-radius: 999px;
		background: linear-gradient(90deg, rgb(244 114 182), rgb(56 189 248));
		transition: width 240ms ease;
	}

	.tier-steps {
		display: grid;
		gap: 0.85rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.tier-step {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		opacity: 0.55;
	}

	.tier-step.current,
	.tier-step.reached {
		opacity: 1;
	}

	.tier-dot {
		flex-shrink: 0;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 999px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8rem;
		border: 1px solid rgb(148 163 184 / 0.35);
		background: rgb(15 23 42 / 0.6);
	}

	.tier-dot.current {
		border-color: rgb(244 114 182);
		background: rgb(244 114 182 / 0.18);
	}

	.tier-dot.reached {
		border-color: rgb(52 211 153);
		background: rgb(52 211 153 / 0.2);
	}
</style>
