<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar, initializeStores, Modal, type ModalComponent } from '@skeletonlabs/skeleton';
	import { IconBrandDiscordFilled } from '@tabler/icons-svelte';
	import { IconBrandGithub } from '@tabler/icons-svelte';
	import { IconFlameFilled } from '@tabler/icons-svelte';
	import { IconBrandTwitch } from '@tabler/icons-svelte';
	import { onMount, onDestroy } from "svelte"; 
	import FullscreenModal from '$lib/components/modals/FullscreenModal.svelte';
	import { injectAnalytics } from '@vercel/analytics/sveltekit'

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	injectAnalytics();
	initializeStores();
	

	const modalComponentRegistry: Record<string, ModalComponent> = {
		fullScreen: { ref: FullscreenModal }
	};

	let windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
	$: widescreen = typeof window == 'undefined' || windowWidth > 700;

	const handleResize = () => {
		windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
	};

	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('resize', handleResize);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
		window.removeEventListener('resize', handleResize);
		}
	});
</script>

<Modal components={modalComponentRegistry} />

<svelte:head>
    <title>BigHub</title>
</svelte:head>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<img class='logo' src="/images/bigworld-logo.svg" width="48px" alt="fotomize" />
				{#if widescreen}
					<strong class="text-xl">BigHub</strong>
				{/if}
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://discord.gg/RfbyhH9FZc"
					target="_blank"
					rel="noreferrer"
				>
					<IconBrandDiscordFilled/>
					{#if widescreen}
						Discord
					{/if}
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://www.twitch.tv/bigworldplays"
					target="_blank"
					rel="noreferrer"
				>
					<IconBrandTwitch/>
					{#if widescreen}
						Twitch
					{/if}
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://bigworld.fandom.com/wiki/Special:AllPages"
					target="_blank"
					rel="noreferrer"
				>
					<IconFlameFilled/>
					{#if widescreen}
						Wiki
					{/if}
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://github.com/BigWorldIndustries"
					target="_blank"
					rel="noreferrer"
				>
					<IconBrandGithub/>
					{#if widescreen}
						Github
					{/if}
				</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>

<style>
	.logo {
		padding: 0px;
		margin: 0px;
		margin-right: 12px;
	}
</style>