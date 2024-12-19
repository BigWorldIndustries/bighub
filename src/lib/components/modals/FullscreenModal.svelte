<script lang="ts">
	import type { SvelteComponent } from 'svelte';

	// Stores
	import { ConicGradient, getModalStore, type ConicStop } from '@skeletonlabs/skeleton';
    import { voteStore, voteStoreHandlers } from '../../../stores/voteStore';

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

    let windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
	$: widescreen = typeof window == 'undefined' || windowWidth > 700;

    interface Region {
        name: string;
        faction: string;
        imgSrc: string;
        caption: string;
    }

    interface Regions {
        [region: string]: Region
    }

	const modalStore = getModalStore();

    let selectedRegion: Region | null = null;

	voteStore.subscribe(store => {
		selectedRegion = store.hoveredRegion;
    });

    function closeModal(context: any) {
        voteStoreHandlers.unselectRegion();
        parent.onClose(context);
    }

	// Notes: Use `w-screen h-screen` to fit the visible canvas size.
	const cBase = 'bg-surface-100-800-token w-screen h-screen p-4 flex justify-center items-center';
    const cButton = 'absolute -top-0 -right-0 z-1 btn-icon variant-filled';
</script>
{#if $modalStore[0]}
	<!-- <div class="modal-example-fullscreen {cBase}">
		<div class="flex flex-col items-center space-y-4">
			<h2 class="h2">{selectedRegion?.name}</h2>
			<p>This demonstrates a full screen modal dialog.</p>
			<button class="btn variant-filled" on:click={closeModal}>× Close</button>
		</div>
	</div> -->
    <div class="">
        <button class={cButton} on:click={parent.onClose}>✕</button>
        <div class="card w-80 hover-box" hidden={!$voteStore.hoveredRegion}>
            {#each Object.entries($voteStore.regionImgUrls) as [name, url]}
                <img src={url} alt={name} class="" hidden={name != $voteStore.hoveredRegion?.name} />
            {/each}
            <div class="p-4 space-y-6">
                <div class="flex justify-between items-center">
                    <b>{$voteStore.hoveredRegion?.name}</b>
                    <div class="text-sm opacity-70">{$voteStore.hoveredRegion?.faction}</div>
                </div>
                <div class="text-sm opacity-70">{$voteStore.hoveredRegion?.caption}</div>
            </div>
            <footer class="p-4 border-t border-surface-300-600-token">
                <div class="flex justify-between">
                    {#each Object.entries($voteStore.electionData.simvotes) as [key, value]}
                        <div class="">
                            <div class="text-sm opacity-70">{key}</div>
                            <b>{Math.round(value[$voteStore.hoveredRegion?.name ?? 'total'])}</b>
                        </div>
                    {/each}
                </div>
                <br/>
                {#if $voteStore.hoveredRegion?.name && $voteStore.hoveredRegion?.name in $voteStore.electionData.sim_conics}
                    <ConicGradient stops={$voteStore.electionData.sim_conics[$voteStore.hoveredRegion.name]} legend></ConicGradient>
                {/if}
            </footer>
        </div>
    </div>
{/if}

<style>
    .centered {
		margin: auto;
		text-align: center;
		/* color: #00FFFF; */
	}
</style>