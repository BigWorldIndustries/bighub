<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<img class='logo' src="/images/bigworld-logo.svg" width="48px" alt="fotomize" />
				<strong class="text-xl">BigHub</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://discord.gg/RfbyhH9FZc"
					target="_blank"
					rel="noreferrer"
				>
					Discord
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://www.twitch.tv/bigworldplays"
					target="_blank"
					rel="noreferrer"
				>
					Twitch
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://bigworld.fandom.com/wiki/Special:AllPages"
					target="_blank"
					rel="noreferrer"
				>
					Wiki
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://github.com/BigWorldIndustries"
					target="_blank"
					rel="noreferrer"
				>
					GitHub
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