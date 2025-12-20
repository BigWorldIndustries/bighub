<script lang='ts'>
	import { onDestroy, onMount } from 'svelte';

	// Get the SVG file from GitHub repo: https://github.com/geolonia/japanese-prefectures/blob/master/map-full.svg
	import Prefectures from '$lib/components/BigMap.svelte';
    import { Avatar, popup, ProgressRadial, type PopupSettings } from '@skeletonlabs/skeleton';
    import { voteStore, voteStoreHandlers } from '../../stores/voteStore';
    import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-svelte';

	interface VotePercent {
    	[candidate: string]: number
	}

	interface CandidateColor {
		[candidate: string]: string
	}

	let windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
	$: widescreen = typeof window == 'undefined' || windowWidth > 700;

	let language = 'en';
	let container: any, svg, colorfulSvg, tooltipSvg, tooltip: HTMLSpanElement | null;
	$: tooltip = null;
	$: totalVotes = 0;
	$: sortedSimVotes = {};
	let votePercent: VotePercent = {};
	let candidateColor: CandidateColor = {
		'Ally/Dan': 'stroke-secondary-500',
		'Johan': 'stroke-warning-500',
		'TheNightPatrol': 'stroke-tertiary-500'
	};
	let prefectures: any[] = [];
	let noOfPefectures = 47;

	let endDate = new Date("2025-12-25"); // election end date
	let hoursUntil = 0; 
	let minutesUntil = 0;
	let timeDifference = 0;

	function calculateDaysUntil() {
		const currentDate = new Date();
		timeDifference = endDate.valueOf() - currentDate.valueOf();
		hoursUntil = Math.ceil(timeDifference / (1000 * 60 * 60)) + 5; // Convert milliseconds to days
		minutesUntil = Math.ceil(timeDifference / (1000 * 60)) + (5*60); // Convert milliseconds to days
  	}

	let intervalId: NodeJS.Timeout;

	const popupHover: PopupSettings = {
		event: 'hover',
		target: 'popupHover',
		placement: 'top'
	};

	const mockdata = [
		{
			label: 'Ally/Dan',
			stats: '456,578',
			progress: 65,
			color: 'stroke-primary-500',
			icon: 'up'
		},
		{
			label: 'Johan',
			stats: '2,550',
			progress: 72,
			color: 'stroke-tertiary-500',
			icon: 'up'
		},
		{
			label: 'The Night Patrol',
			stats: '4,735',
			progress: 52,
			color: 'stroke-error-500',
			icon: 'down'
		}
	];

	voteStore.subscribe(store => {
        //console.log(store);
		// Guard against null or undefined store or electionData
		if (!store || !store.electionData) {
			totalVotes = 0;
			votePercent = {};
			sortedSimVotes = {};
			return;
		}
		
		let simVotes = store.electionData.simvotes;
		
		// Guard against null or undefined simVotes
		if (!simVotes) {
			totalVotes = 0;
			votePercent = {};
			sortedSimVotes = {};
			return;
		}
		
		// sum up all total votes across all candidates
		totalVotes = Object.values(simVotes).reduce((sum, candidateVotes) => {
			// Ensure 'total' exists in the VoteData, then add its value
			return sum + (candidateVotes['total'] || 0);
		}, 0);

		for (const [candidate, candidateVotes] of Object.entries(simVotes)) {
			// Guard against null or undefined candidateVotes
			if (!candidateVotes) continue;
			const candidateTotal = candidateVotes['total'] || 0;
			votePercent[candidate] = totalVotes > 0 
				? (candidateTotal / totalVotes) * 100 
				: 0; // Avoid division by zero
    	}

		// Sort simVotes by total votes in descending order
		sortedSimVotes = Object.fromEntries(
			Object.entries(simVotes).sort(([, a], [, b]) => (b['total'] || 0) - (a['total'] || 0))
		);
    });

	onMount(async () => {
		calculateDaysUntil();

		if ($voteStore?.electionData) {
			console.log($voteStore.electionData);
		}
		
		if (voteStoreHandlers?.getElectionData) {
			await voteStoreHandlers.getElectionData();
		}

		//Start incrementing the offset every second as long as there is time remaining
		if (minutesUntil > 0 && voteStoreHandlers?.incrementOffset) {
			intervalId = setInterval(() => {
				voteStoreHandlers.incrementOffset();
			}, 1000);
		}
	});

	onDestroy(() => {
		// Clean up the interval
		if (intervalId) {
			clearInterval(intervalId);
		}
	});

</script>

	<!-- Display the total values -->
	<!-- <div class="totals">
		<h2>Total Votes</h2>
		<ul>
			{#if $voteStore?.electionData?.simvotes != null}
				{#each Object.entries($voteStore.electionData.simvotes) as [key, value]}
					<li>
						<strong>{key}:</strong> {$voteStore.electionData.simvotes[key].total + $voteStore.offset}
					</li>
				{/each}
			{/if}
		</ul>
	</div> -->
	<br/>
	<!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		{#each Object.entries($voteStore.electionData.simvotes) as [key, value]}
			<div class="p-6">
				<div class="">
					<div class="minimal centered">
						<Avatar src={"/images/"+key.toLowerCase()+".jpg"} width="w-32" rounded="rounded-full" />
					</div>
					<div class="space-y-2 centered">
						<h2 class="title"><div class={"gradient-heading-"+key.toLowerCase()}>{key.toUpperCase()}</div></h2>
						<div class="text-2xl font-bold">{$voteStore.electionData.simvotes[key].total + $voteStore.offset} votes</div>
						<div class="text-2xl font-bold">{Math.round(votePercent[key] * 10) / 10}%</div>
					</div>
				</div>
			</div>
		{/each}
	</div> -->

	<div class="grid grid-cols-1 md:grid-cols-2">
		<div class="card leaderboard">
		{#if sortedSimVotes && Object.keys(sortedSimVotes).length > 0}
			{#each Object.entries(sortedSimVotes) as [key, value], index}
				{#if key && value}
					{#if index==0}
						<div class={"flex space-x-5 items-center card withspace " + (key ? key.toLowerCase().replace(/\//g, '') : '')}>
							<Avatar src={"/images/"+(key ? key.toLowerCase() : '')+".jpg"} width="w-32" rounded="rounded-full" />
							<div class="space-y-2">
								<h1 class={`text-3l mb-0 animate-bounce`}>
									#{index+1} {key || 'Unknown'} {minutesUntil < 0 ? '(President-Elect)' : ''}
								</h1>
								
								<h2 class="animate-pulse font-display">
									{($voteStore?.electionData?.simvotes?.[key]?.total ?? 0) + ($voteStore?.offset ?? 0)} VOTES
								</h2>
							</div>
						</div>
					{:else}
						<div class={"flex space-x-5 items-center card withspace " + (key ? key.toLowerCase().replace(/\//g, '') : '')}>
							<Avatar src={"/images/"+(key ? key.toLowerCase() : '')+".jpg"} width="w-32" rounded="rounded-full" />
							<div class="space-y-2">
								<h1 class={`text-3l mb-0`}>
									#{index+1} {key || 'Unknown'}
								</h1>
								
								<h2 class="animate-pulse font-display">
									{($voteStore?.electionData?.simvotes?.[key]?.total ?? 0) + ($voteStore?.offset ?? 0)} VOTES
								</h2>
							</div>
						</div>
					{/if}
				{/if}
			{/each}
		{/if}

		{#if hoursUntil == 1}
			<span class={`text-4xs mb-0 opacity-50 tabbed`}>1 hour remaining</span>
		{:else if hoursUntil == 0}
			<span class={`text-4xs mb-0 opacity-50 tabbed`}>{minutesUntil} minutes remaining</span>
		{:else if hoursUntil > 1}
			<span class={`text-4xs mb-0 opacity-50 tabbed`}>{hoursUntil} hours remaining</span>
		{:else}
			<span class={`text-4xs mb-0 opacity-50 tabbed`}>Election has concluded.</span>
		{/if}
		<br />
		</div>
		{#if !widescreen}
			<br />
		{/if}
		<div id="mainContainer" class="flex gap-4 flex-col relative mapcontainer">
			<h1 class={`text-4xs tabbed centered`}>LIVE ELECTION MAP</h1>
			{#if widescreen}
				<span class={`text-3xs opacity-75 tabbed centered`}>Hover over a region for stats</span>
			{:else}
				<span class={`text-3xs opacity-75 tabbed centered`}>Click on a region for stats</span>
			{/if}
			<div class="flex justify-center" bind:this={container}><Prefectures /></div>
		</div>
	</div>


<!-- <button class="btn variant-filled [&>*]:pointer-events-none" use:popup={popupHover}>
	<span>(icon)</span>
	<span>Hover</span>
</button>

<div class="card p-4 variant-filled-secondary" data-popup="popupHover">
	<p>Hover Content</p>
	<div class="arrow variant-filled-secondary" />
</div> -->
<style>
	.mapcontainer {
		margin: auto;
	}

	.allydan {
		background-color: #00b349;
	}

	.johan {
		background-color: #fd4b4b;
	}

	.thenightpatrol {
		background-color: #00a4d1;
	}

	.minimal {
		max-width: fit-content;
	}

	.leaderboard {
		height: fit-content;
		margin-left: 1vh;
		margin-right: 1vh;
	}

	.withspace {
		margin: 20px;
	}

	.tabbed {
		margin-left: 32px;
	}

	.centered {
		margin: auto;
		width: 50%;
		text-align: center;
		/* color: #00FFFF; */
	}

	.text-centered {
		text-align: center;
	}

	.bigfont {
		font-family:'Courier New', Courier, monospace
	}

	.title {
        font-size: 24px;
        text-align-last: center;
        padding-bottom: 1%;
        padding-top: 10%;
    }

	.maxheight {
		max-height: 300px;
	}

	/* .johan {
		background-color: chocolate;
	} */

</style>