<script lang='ts'>
	import { onMount } from 'svelte';

	// Get the SVG file from GitHub repo: https://github.com/geolonia/japanese-prefectures/blob/master/map-full.svg
	import Prefectures from '$lib/components/Japan.svelte';

	function getUniqueColor(n: number) {
		const rgb = [0, 0, 0];
		for (let i = 0; i < 24; i++) {
			rgb[i % 3] <<= 1;
			rgb[i % 3] |= n & 0x01;
			n >>= 1;
		}
		return '#' + rgb.reduce((a, c) => (c > 0x0f ? c.toString(16) : '0' + c.toString(16)) + a, '');
	}
	let language = 'en';
	let container: any, svg, colorfulSvg, tooltipSvg, tooltip: HTMLSpanElement | null;
	$: tooltip = null;
	let prefectures: any[] = [];
	let noOfPefectures = 47;

	let randomColors = Array.from({ length: noOfPefectures }, (_, index) => index)
		.map((value) => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => getUniqueColor(value));

	onMount(() => {
		svg = container.firstChild!;
		colorfulSvg = svg.cloneNode(true);
		colorfulSvg.getElementById('prefectures').childNodes.forEach((node: { getAttribute: (arg0: string) => any; getElementsByTagName: (arg0: string) => { textContent: any; }[]; setAttribute: (arg0: string, arg1: string) => void; }, index: number) => {
			let color = randomColors[index];
			let code = node.getAttribute('data-code');
			let titleText = node.getElementsByTagName('title')[0].textContent;
			let title = {
				en: titleText.split('/')[1].trim(),
				tr: titleText.split('/')[1].trim(),
				jp: titleText.split('/')[0].trim()
			};

			prefectures = [...prefectures, { color, title, code }];
			node.setAttribute('fill', randomColors[index]);
		});

		document.getElementById('colorfulContainer')?.appendChild(colorfulSvg);

		tooltipSvg = colorfulSvg.cloneNode(true);

		tooltipSvg.getElementById('prefectures').childNodes.forEach((node: { classList: { add: (arg0: string) => void; }; appendChild: (arg0: HTMLSpanElement) => void; }, index: number) => {
			let span = document.createElement('span');
			span.classList.add('tooltiptext');
			span.innerHTML = prefectures[index].title[language];
			node.classList.add('tooltip');
			node.appendChild(span);
		});

		document.getElementById('tooltipContainer')?.appendChild(tooltipSvg);

		document.addEventListener('mouseover', function (e) {
			if (!(e.target as HTMLElement)?.closest('#tooltip') && tooltip != null) {
				tooltip.style.visibility = 'hidden';
			}
			let target = (e.target as HTMLElement).closest('#tooltipContainer #prefectures g'); 
			if (target) {
				let elemRect = target.getBoundingClientRect();

				let bodyRect = document.getElementById('tooltipContainer')?.getBoundingClientRect();

				if (tooltip && bodyRect) {
					tooltip.style.top = `${elemRect.top - bodyRect.top}px`;
					tooltip.style.left = `${elemRect.left - bodyRect.left}px`;
					tooltip.style.visibility = 'visible';

					let titleText = target.getElementsByTagName('title')[0].textContent;
					tooltip.textContent =
						language == 'jp' ? titleText!.split('/')[0].trim() : titleText!.split('/')[1].trim();
				}
			}
		});
	});
</script>

<div id="mainContainer" class="flex gap-4 flex-col relative">
	<p>Original MAP</p>
	<div class="flex justify-center" bind:this={container}><Prefectures /></div>
	<p>Colorful MAP</p>
	<div class="flex justify-center" id="colorfulContainer"></div>
	<p>Legend</p>
	{#key prefectures}
		<div class="flex flex-wrap gap-2">
			{#each prefectures.sort((a, b) => a.code - b.code) as pref}
				<span
					class="text-sm text-white px-2 py-1 rounded-full"
					style="background-color: {pref.color}">{pref.title[language]}</span
				>
			{/each}
		</div>
	{/key}
	<p>Tooltipped MAP</p>
	<div class="flex justify-center relative" id="tooltipContainer">
		<span
			style="visiblity:hidden;"
			bind:this={tooltip}
			id="tooltip"
			class="absolute px-2 py-1 rounded bg-white/[0.9]"
		></span>
	</div>
</div>