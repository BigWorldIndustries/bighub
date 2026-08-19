<script lang="ts">
	import {
		cycleAvailability,
		getAvailabilityDays,
		WEEKDAY_HEADERS
	} from '$lib/olympics/dates';
	import type { AvailabilityStatus } from '$lib/olympics/config';

	export let availability: Record<string, AvailabilityStatus>;
	export let readonly = false;
	export let dimmed = false;

	const days = getAvailabilityDays();
	const weeks: typeof days[] = [];
	for (let i = 0; i < days.length; i += 7) {
		weeks.push(days.slice(i, i + 7));
	}

	const statusLabel: Record<AvailabilityStatus, string> = {
		available: 'Available',
		tentative: 'Tentative',
		unavailable: 'Not available'
	};

	function cycle(date: string) {
		if (readonly || dimmed) return;
		availability[date] = cycleAvailability(availability[date] ?? 'unavailable');
		availability = availability;
	}

	function cellClasses(status: AvailabilityStatus): string {
		const hover = readonly || dimmed ? '' : 'hover:brightness-110';
		if (status === 'available') return `bg-success-500 text-white ${hover}`;
		if (status === 'tentative') return `bg-warning-500 text-surface-900 ${hover}`;
		return `bg-error-500 text-white ${hover}`;
	}
</script>

<div class="flex flex-wrap gap-3 text-sm mb-4">
	<span class="inline-flex items-center gap-2">
		<span class="w-3 h-3 rounded-sm bg-success-500" /> Available
	</span>
	<span class="inline-flex items-center gap-2">
		<span class="w-3 h-3 rounded-sm bg-warning-500" /> Tentative
	</span>
	<span class="inline-flex items-center gap-2">
		<span class="w-3 h-3 rounded-sm bg-error-500" /> Not available
	</span>
	{#if !readonly && !dimmed}
		<span class="text-surface-400">Click a day to cycle</span>
	{/if}
</div>

<div class="overflow-x-auto" class:availability-dimmed={dimmed}>
	<div class="min-w-[640px]">
		<div class="grid grid-cols-7 gap-2 mb-2">
			{#each WEEKDAY_HEADERS as header}
				<div class="text-center text-xs font-bold tracking-widest text-surface-400">{header}</div>
			{/each}
		</div>

		<div class="space-y-2">
			{#each weeks as week}
				<div class="grid grid-cols-7 gap-2">
					{#each week as day}
						<button
							type="button"
							on:click={() => cycle(day.date)}
							disabled={readonly || dimmed}
							class="rounded-lg px-1 py-3 sm:py-4 text-center transition-colors duration-150 font-semibold shadow-sm {readonly || dimmed ? 'cursor-default' : 'cursor-pointer'} {cellClasses(availability[day.date] ?? 'unavailable')}"
							aria-label="{day.weekday} {day.monthDay}: {statusLabel[availability[day.date] ?? 'unavailable']}"
						>
							<div class="text-sm sm:text-base">{day.monthDay}</div>
							<div class="text-[10px] sm:text-xs font-medium opacity-90 mt-1">
								{statusLabel[availability[day.date] ?? 'unavailable']}
							</div>
						</button>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.availability-dimmed {
		opacity: 0.38;
		filter: grayscale(0.15);
		pointer-events: none;
		transition: opacity 180ms ease;
	}
</style>
