<script lang='ts'>
	import { onMount } from 'svelte';

	// Get the SVG file from GitHub repo: https://github.com/geolonia/japanese-prefectures/blob/master/map-full.svg
	import Prefectures from '$lib/components/BigMap.svelte';
    import { popup, type PopupSettings } from '@skeletonlabs/skeleton';

	let language = 'en';
	let container: any, svg, colorfulSvg, tooltipSvg, tooltip: HTMLSpanElement | null;
	$: tooltip = null;
	let prefectures: any[] = [];
	let noOfPefectures = 47;

	const popupHover: PopupSettings = {
		event: 'hover',
		target: 'popupHover',
		placement: 'top'
	};

	onMount(() => {
	});

</script>

<div id="mainContainer" class="flex gap-4 flex-col relative mapcontainer">
	<div class="flex justify-center" bind:this={container}><Prefectures /></div>
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
		max-width: 50%;
		margin-left: 25%;
	}
</style>