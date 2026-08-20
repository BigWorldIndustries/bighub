<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { Avatar, TabGroup, Tab } from '@skeletonlabs/skeleton';
	import { IconBrandDiscordFilled } from '@tabler/icons-svelte';
	import GameBanner from '$lib/components/olympics/GameBanner.svelte';
	import AvailabilityGrid from '$lib/components/olympics/AvailabilityGrid.svelte';
	import XpProgress from '$lib/components/olympics/XpProgress.svelte';
	import {
		DISCORD_INVITE_URL,
		FREE_AGENT_ID,
		KOFI_PAGE_URL,
		KOFI_USERNAME,
		OLYMPICS_FORM_ID,
		slugifyNationName,
		type AvailabilityStatus
	} from '$lib/olympics/config';
	import {
		OLYMPICS_TIERS,
		XP_PER_REFERRAL,
		nextTier,
		normalizeReferralUsername,
		referralSignupPath,
		withDerivedXp
	} from '$lib/olympics/tiers';
	import {
		DEFAULT_NATION_COLOR,
		NATION_COLOR_SCHEMES,
		NATION_EMOJI_CHOICES,
		firstGrapheme,
		type NationColorId
	} from '$lib/olympics/nationStyle';
	import NationTitle from '$lib/components/olympics/NationTitle.svelte';
	import TierTitle from '$lib/components/olympics/TierTitle.svelte';
	import FeaturedPerk from '$lib/components/olympics/FeaturedPerk.svelte';
	import PrizeGalleries from '$lib/components/olympics/PrizeGalleries.svelte';
	import { allDaysAvailable, defaultAvailability } from '$lib/olympics/dates';
	import {
		GAME_IDS,
		OLYMPICS_GAMES,
		SUGGESTED_GAME_MAX_LENGTH,
		asSuggestedGame,
		compareGamesByPopularity,
		overlayOfficialGame,
		type OlympicsGame
	} from '$lib/olympics/games';
	import type {
		OlympicsFormData,
		OlympicsNation,
		OlympicsReferrerPreview,
		OlympicsSubmission,
		OlympicsSuggestedGame
	} from '$lib/olympics/types';

	export let data: {
		user: { id: string; username: string; avatar: string | null };
		inBigWorld: boolean;
		previewGate: boolean;
		discordReturnTo: string;
		existingSubmission: OlympicsSubmission | null;
		referrerPreview: OlympicsReferrerPreview | null;
		nations: OlympicsNation[];
		suggestedGames: OlympicsSuggestedGame[];
		signupCounts: Record<string, number>;
	};

	const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const TAB_LABELS = ['Contact', 'Allegiance', 'Events', 'Availability', 'Tiers', 'Review'];

	let tabSet = 0;
	let email = '';
	let phone = '';
	let nationMode: 'join' | 'create' = 'join';
	let selectedNationId = FREE_AGENT_ID;
	let newNationColor: NationColorId = DEFAULT_NATION_COLOR;
	let newNationEmojis: [string, string] = ['', ''];
	let emojiSlot: 0 | 1 = 0;
	const emojiSlots: Array<0 | 1> = [0, 1];
	let newNationName = '';
	let selectedGames: string[] = [];
	let localSuggestions: OlympicsGame[] = [];
	let suggestedName = '';
	let suggestedError = '';
	let availability = defaultAvailability();
	let anyDateWithNotice = false;
	let availabilityBeforeFlexible: Record<string, AvailabilityStatus> | null = null;
	let isSubmitting = false;
	let errorMessage = '';
	let showForm = !data.existingSubmission;
	let copiedCode = false;
	let copiedLink = false;
	let referredByUsername = '';
	let pollTimer: ReturnType<typeof setInterval> | null = null;

	function applySubmission(submission: OlympicsSubmission | null) {
		const form = submission?.form_data;
		email = form?.email ?? '';
		phone = form?.phone ?? '';
		referredByUsername =
			form?.referredByUsername ?? data.referrerPreview?.username ?? '';
		selectedGames = form?.games ? [...form.games] : [];
		availability = { ...defaultAvailability(), ...(form?.availability ?? {}) };
		anyDateWithNotice = Boolean(form?.anyDateWithNotice);
		availabilityBeforeFlexible = null;
		if (anyDateWithNotice) {
			availability = allDaysAvailable();
		}
		if (form?.createdNation) {
			nationMode = 'create';
			newNationName = form.nationName ?? '';
			selectedNationId = FREE_AGENT_ID;
			const existing = data.nations.find((nation) => nation.id === form.nationId);
			newNationColor =
				existing?.colorScheme &&
				NATION_COLOR_SCHEMES.some((scheme) => scheme.id === existing.colorScheme)
					? (existing.colorScheme as NationColorId)
					: DEFAULT_NATION_COLOR;
			newNationEmojis = [existing?.emojis?.[0] ?? '', existing?.emojis?.[1] ?? ''];
		} else {
			nationMode = 'join';
			selectedNationId = form?.nationId ?? FREE_AGENT_ID;
			newNationName = '';
			newNationColor = DEFAULT_NATION_COLOR;
			newNationEmojis = ['', ''];
		}
	}

	applySubmission(data.existingSubmission);

	$: referralLocked = Boolean(data.existingSubmission);
	$: referrerNationId = data.referrerPreview?.nationId;
	$: joinNations = data.nations
		.filter((nation) => nation.id !== FREE_AGENT_ID)
		.slice()
		.sort((a, b) => {
			if (referrerNationId && a.id === referrerNationId) return -1;
			if (referrerNationId && b.id === referrerNationId) return 1;
			return 0;
		});
	$: referralLink = `${$page.url.origin}${referralSignupPath(data.user.username)}`;
	$: isSelfReferral =
		normalizeReferralUsername(referredByUsername).toLowerCase() ===
		data.user.username.toLowerCase();
	$: contactValid = !email || EMAIL_RE.test(email);
	$: nationValid =
		nationMode === 'create' ? newNationName.trim().length >= 2 : Boolean(selectedNationId);
	$: eventsValid = selectedGames.length >= 1;
	$: overlaysById = new Map((data.suggestedGames ?? []).map((game) => [game.id, game]));
	$: officialGames = OLYMPICS_GAMES.map((game) => overlayOfficialGame(game, overlaysById.get(game.id)));
	$: catalogSuggestions = (data.suggestedGames ?? [])
		.filter((game) => !GAME_IDS.has(game.id) && (!game.hidden || selectedGames.includes(game.id)))
		.map((game) =>
			asSuggestedGame(game.id, game.title, {
				badges: game.badges,
				note: game.note,
				imageUrl: game.imageUrl
			})
		);
	$: sessionSuggestions = localSuggestions.filter(
		(game) => !GAME_IDS.has(game.id) && !catalogSuggestions.some((existing) => existing.id === game.id)
	);
	$: pickerGames = [...officialGames, ...catalogSuggestions, ...sessionSuggestions].sort((a, b) =>
		compareGamesByPopularity(a, b, data.signupCounts ?? {})
	);
	$: selectedNation = data.nations.find((nation) => nation.id === selectedNationId);
	$: selectedNationName =
		nationMode === 'create'
			? newNationName.trim()
			: selectedNation?.name ?? 'Free Agent';
	$: previewNation = {
		name: newNationName.trim() || 'Your house',
		emojis: newNationEmojis.filter(Boolean),
		colorScheme: newNationColor
	};

	function pickEmoji(emoji: string) {
		newNationEmojis[emojiSlot] = emoji;
		newNationEmojis = newNationEmojis;
		if (emojiSlot === 0) emojiSlot = 1;
	}

	function setEmojiFromInput(slot: 0 | 1, event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		newNationEmojis[slot] = firstGrapheme(target.value);
		newNationEmojis = newNationEmojis;
	}

	$: currentTabValid =
		tabSet === 0 ? contactValid : tabSet === 1 ? nationValid : tabSet === 2 ? eventsValid : true;

	function tabUnlocked(index: number): boolean {
		if (index <= 0) return true;
		if (index >= 1 && !contactValid) return false;
		if (index >= 2 && !nationValid) return false;
		if (index >= 3 && !eventsValid) return false;
		return true;
	}

	function clampTab(index: number): number {
		if (tabUnlocked(index)) return index;
		for (let i = index - 1; i >= 0; i--) {
			if (tabUnlocked(i)) return i;
		}
		return 0;
	}

	$: if (!tabUnlocked(tabSet)) tabSet = clampTab(tabSet);

	function nextTab() {
		if (!currentTabValid) return;
		if (tabSet < TAB_LABELS.length - 1) tabSet += 1;
	}

	function prevTab() {
		if (tabSet > 0) tabSet -= 1;
	}

	function startEdit() {
		applySubmission(data.existingSubmission);
		localSuggestions = [];
		suggestedName = '';
		suggestedError = '';
		showForm = true;
		tabSet = 0;
		errorMessage = '';
	}

	function cancelEdit() {
		showForm = false;
		errorMessage = '';
	}

	function toggleGame(gameId: string) {
		if (selectedGames.includes(gameId)) {
			selectedGames = selectedGames.filter((id) => id !== gameId);
		} else {
			selectedGames = [...selectedGames, gameId];
		}
	}

	function addSuggestedGame() {
		const title = suggestedName.trim();
		suggestedError = '';

		if (title.length < 2) {
			suggestedError = 'Please enter at least 2 characters.';
			return;
		}
		if (title.length > SUGGESTED_GAME_MAX_LENGTH) {
			suggestedError = `Keep it to ${SUGGESTED_GAME_MAX_LENGTH} characters or fewer.`;
			return;
		}

		const slug = slugifyNationName(title);
		if (!slug) {
			suggestedError = 'Please include letters or numbers.';
			return;
		}

		const existing =
			pickerGames.find((game) => game.id === slug) ??
			(data.suggestedGames ?? []).find((game) => game.id === slug);

		if (existing) {
			if (!selectedGames.includes(slug)) {
				selectedGames = [...selectedGames, slug];
			}
			suggestedName = '';
			return;
		}

		localSuggestions = [...localSuggestions, asSuggestedGame(slug, title)];
		selectedGames = [...selectedGames, slug];
		suggestedName = '';
	}

	function getDiscordAvatarUrl(userId: string, avatarHash: string | null): string {
		if (!avatarHash) {
			return `https://cdn.discordapp.com/embed/avatars/${parseInt(userId) % 5}.png`;
		}
		return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
	}

	function formatSubmittedAt(submission: OlympicsSubmission): string {
		const stamp = submission.submittedAt;
		if (!stamp) return '';
		if (typeof stamp === 'string') return new Date(stamp).toLocaleDateString();
		const seconds = stamp._seconds ?? stamp.seconds;
		if (!seconds) return '';
		return new Date(seconds * 1000).toLocaleDateString();
	}

	function gameTitle(id: string): string {
		const fromPicker = pickerGames.find((game) => game.id === id);
		if (fromPicker) return fromPicker.title;
		const fromCatalog = (data.suggestedGames ?? []).find((game) => game.id === id);
		if (fromCatalog) return fromCatalog.title;
		return OLYMPICS_GAMES.find((game) => game.id === id)?.title ?? id;
	}

	async function copyText(value: string, kind: 'code' | 'link') {
		try {
			await navigator.clipboard.writeText(value);
			if (kind === 'code') {
				copiedCode = true;
				setTimeout(() => (copiedCode = false), 2000);
			} else {
				copiedLink = true;
				setTimeout(() => (copiedLink = false), 2000);
			}
		} catch {
			if (kind === 'code') copiedCode = false;
			else copiedLink = false;
		}
	}

	function scrollToId(id: string) {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	async function goRefer() {
		await copyText(referralLink, 'link');
		scrollToId('earn-refer');
	}

	function goDonate() {
		scrollToId('earn-donate');
	}

	function setAnyDateWithNotice(checked: boolean) {
		anyDateWithNotice = checked;
		if (checked) {
			availabilityBeforeFlexible = { ...availability };
			availability = allDaysAvailable();
			return;
		}
		if (availabilityBeforeFlexible) {
			availability = { ...availabilityBeforeFlexible };
			availabilityBeforeFlexible = null;
			return;
		}
		availability = defaultAvailability();
	}

	function onAnyDateToggle(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		setAnyDateWithNotice(target.checked);
	}

	function availabilityCounts(form: { availability?: OlympicsFormData['availability'] }) {
		const values = Object.values(form.availability ?? {});
		return {
			available: values.filter((status) => status === 'available').length,
			tentative: values.filter((status) => status === 'tentative').length,
			unavailable: values.filter((status) => status === 'unavailable').length
		};
	}

	async function handleSubmit() {
		if (!contactValid || !nationValid || !eventsValid) {
			errorMessage = 'Please complete each tab before submitting.';
			return;
		}

		isSubmitting = true;
		errorMessage = '';

		try {
			const form_data: OlympicsFormData = {
				email: email.trim() || undefined,
				phone: phone.trim() || undefined,
				nationId: nationMode === 'join' ? selectedNationId : '',
				nationName: nationMode === 'create' ? newNationName.trim() : '',
				createdNation: nationMode === 'create',
				colorScheme: nationMode === 'create' ? newNationColor : undefined,
				emojis: nationMode === 'create' ? newNationEmojis.filter(Boolean) : undefined,
				games: selectedGames,
				availability,
				anyDateWithNotice,
				entryAmount: 0,
				paymentStatus: 'pending',
				...(!referralLocked && !isSelfReferral
					? { referredByUsername: normalizeReferralUsername(referredByUsername) || undefined }
					: {})
			};

			const response = await fetch('/api/forms', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					formId: OLYMPICS_FORM_ID,
					form_data: {
						...form_data,
						suggestedGames: localSuggestions.map((game) => ({ id: game.id, title: game.title }))
					}
				})
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => ({}));
				throw new Error(payload.message || 'Failed to submit sign-up');
			}

			await invalidateAll();
			showForm = false;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to submit sign-up';
		} finally {
			isSubmitting = false;
		}
	}

	onMount(() => {
		pollTimer = setInterval(() => {
			if (data.previewGate || (!data.inBigWorld && !data.existingSubmission)) return;
			if (!showForm && data.existingSubmission) {
				void invalidateAll();
			}
		}, 4000);
	});

	onDestroy(() => {
		if (pollTimer) clearInterval(pollTimer);
	});
</script>

<svelte:head>
	<title>Big World Olympics Sign-Up - BigHub</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-5xl">
	<div class="signup-bar p-5 mb-8">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<Avatar
					src={getDiscordAvatarUrl(data.user.id, data.user.avatar)}
					width="w-16"
					rounded="rounded-full"
				/>
				<div>
					<p class="text-sm text-surface-400">Logged in as</p>
					<h2 class="text-xl font-bold">{data.user.username}</h2>
				</div>
			</div>
			<a href="/api/auth/logout" class="btn variant-ghost-surface btn-sm">Logout</a>
		</div>
	</div>

	{#if data.previewGate || (!data.inBigWorld && !data.existingSubmission)}
		<div class="py-2 max-w-2xl mx-auto">
			{#if data.previewGate}
				<p class="text-center text-sm text-amber-300 mb-4">
					Preview of the membership step.
					<a href="/olympics/signup" class="underline">Exit preview</a>
				</p>
			{/if}
			<h1 class="text-3xl font-bold mb-2 text-center">Join Big World</h1>
			<p class="text-center text-surface-300 mb-6">Step 0 of sign-up</p>

			<div class="signup-panel p-6 space-y-5">
				<p class="text-center text-surface-200">
					The Big World Olympics will take place in the Big World discord server. Join the server,
					then come back — we'll unlock the form once you're in.
				</p>
				<ol class="space-y-3 text-surface-200 max-w-md mx-auto">
					<li class="flex gap-3">
						<span
							class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center"
							>1</span
						>
						<span class="pt-1">Join the Big World server with the invite below.</span>
					</li>
					<li class="flex gap-3">
						<span
							class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center"
							>2</span
						>
						<span class="pt-1">Come back and log in again. We'll check Discord membership.</span>
					</li>
				</ol>
				<div class="flex flex-wrap justify-center gap-3 pt-2">
					<a
						href={DISCORD_INVITE_URL}
						target="_blank"
						rel="noreferrer"
						class="btn variant-filled-primary"
					>
						<IconBrandDiscordFilled class="w-5 h-5" />
						Join Big World
					</a>
					<a
						href={data.discordReturnTo}
						class="btn variant-ghost-surface"
					>
						I've joined - login again
					</a>
				</div>
				<p class="text-center text-sm text-surface-400">
					If Discord asks you to authorize again, that's us refreshing server membership.
				</p>
			</div>
		</div>
	{:else if data.existingSubmission && !showForm}
		{@const form = data.existingSubmission.form_data}
		{@const counts = availabilityCounts(form)}
		{@const nationCaptain = data.nations.find((nation) => nation.id === form.nationId)?.captain}
		{@const derived = withDerivedXp(form)}
		{@const upcomingTier = nextTier(derived.xp)}
		<div class="py-2">
			<p class="text-center text-sm uppercase tracking-[0.2em] text-success-400 mb-2">
				Raise the Banners!
			</p>
			<div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-6">
				<p class="text-surface-300 text-center sm:text-left">
					You are locked in for the Big World Olympics 2026. You may edit your details any time before the games begin.
				</p>
				<button type="button" class="btn btn-sm variant-ghost-surface" on:click={startEdit}>
					Edit sign-up
				</button>
			</div>

			<div class="grid md:grid-cols-2 gap-4 mb-4">
				<div class="signup-panel p-5">
					<p class="text-sm text-surface-400 mb-1">House</p>
					<NationTitle
						name={form.nationName}
						emojis={data.nations.find((nation) => nation.id === form.nationId)?.emojis ?? []}
						colorScheme={data.nations.find((nation) => nation.id === form.nationId)?.colorScheme}
						size="xl"
					/>
					{#if nationCaptain}
						<p class="text-sm text-surface-400 mt-1">Captain: {nationCaptain}</p>
					{/if}
				</div>
				<div class="signup-panel p-5">
					<p class="text-sm text-surface-400 mb-1">Events</p>
					<p class="font-medium">{form.games.map(gameTitle).join(', ')}</p>
				</div>
				<div class="signup-panel p-5">
					<p class="text-sm text-surface-400 mb-1">Availability</p>
					{#if form.anyDateWithNotice}
						<p>Any date, with advance notice</p>
					{:else}
						<p>
							{counts.available} available · {counts.tentative} tentative · {counts.unavailable} not available
						</p>
					{/if}
				</div>
				<div class="signup-panel p-5">
					<p class="text-sm text-surface-400 mb-1">Submitted</p>
					<p>{formatSubmittedAt(data.existingSubmission) || 'Just now'}</p>
					{#if form.referredByUsername}
						<p class="text-sm text-surface-400 mt-2">Referred by {form.referredByUsername}</p>
					{/if}
				</div>
			</div>

			<h1 class="text-3xl sm:text-4xl font-bold mb-3 text-center">Earn XP</h1>
			<p class="text-center text-surface-300 max-w-xl mx-auto mb-6">
				{#if upcomingTier}
					Sign-up is the starting line. {upcomingTier.name} is {upcomingTier.tagline} —
					{upcomingTier.shortPerks.join(', ').toLowerCase()}.
				{:else}
					You're at the current top tier. Extra donations still feed the prize pool, and more tiers
					are coming.
				{/if}
			</p>

			<div class="earn-cta-grid max-w-2xl mx-auto mb-8">
				<button type="button" class="earn-cta refer" on:click={goRefer}>
					<span class="earn-cta-kicker">2,500 XP each</span>
					<span class="earn-cta-title">Refer a Friend</span>
					<span class="earn-cta-copy">Share your link. When they submit, you climb.</span>
				</button>
				<button type="button" class="earn-cta donate" on:click={goDonate}>
					<span class="earn-csuta-kicker">$1 = 1,000 XP</span>
					<span class="earn-cta-title">Donate</span>
					<span class="earn-cta-copy">
						{#if upcomingTier?.id === 'citizen'}
							$5 unlocks Citizen — gifted games, raffles, medals.
						{:else if upcomingTier?.id === 'protagonist'}
							$10 puts you in the 2026 card set, mailed to you.
						{:else}
							Every dollar boosts the prize pool and your XP.
						{/if}
					</span>
				</button>
			</div>

			<div class="max-w-2xl mx-auto mb-6">
				<XpProgress {form} />
			</div>

			<div class="signup-panel p-5 mb-6 max-w-2xl mx-auto space-y-4">
				<h2 class="text-lg font-bold text-center">What you unlock</h2>
				<ul class="space-y-3">
					{#each OLYMPICS_TIERS as tier}
						<li class="flex gap-3 items-start" class:opacity-40={tier.xp > derived.xp}>
							<div class="min-w-0">
								<TierTitle id={tier.id} name={tier.name} size="md" />
								<p class="text-sm text-surface-400">
									{tier.shortPerks.join(' · ')}
								</p>
							</div>
						</li>
					{/each}
				</ul>
				<p class="text-sm text-center text-surface-400">
					Check out what was given out last Olympics.
				</p>
				<PrizeGalleries compact />
			</div>

			<div id="earn-refer" class="signup-panel p-5 mb-6 max-w-2xl mx-auto space-y-3 scroll-mt-8">
				<p class="text-sm uppercase tracking-wide text-primary-300">Refer a friend</p>
				<h2 class="text-xl font-bold">Recruit Your Allies and get 2,500 XP</h2>
				<p class="text-surface-300">
					Send this to someone who hasn't signed up yet. The moment they complete the form, you get
					credited — no donation required on their end.
				</p>
				<div class="flex gap-2 items-stretch">
					<input class="input font-medium" type="text" readonly value={referralLink} />
					<button
						type="button"
						class="btn variant-filled-primary flex-shrink-0"
						on:click={() => copyText(referralLink, 'link')}
					>
						{copiedLink ? 'Copied!' : 'Copy'}
					</button>
				</div>
			</div>

			<div id="earn-donate" class="signup-panel p-6 mb-8 max-w-2xl mx-auto scroll-mt-8">
				<p class="text-sm uppercase tracking-wide text-warning-400 text-center mb-1">Donate</p>
				<h2 class="text-2xl font-bold mb-2 text-center">Turn support into a higher tier</h2>
				<p class="text-center text-surface-300 mb-4">
					{#if upcomingTier?.id === 'citizen'}
						$5 is Citizen. Gifted games, raffles, giveaways, and medals for top 3. Anything extra
						keeps stacking XP and feeds the prize pool.
					{:else if upcomingTier?.id === 'protagonist'}
						$10 is Protagonist — custom artwork in the 2026 trading card set, plus a holographic
						card and booster mailed to you. Extra still goes to prizes.
					{:else}
						Every dollar is 1,000 XP and goes to the Big World Olympics prize pool.
					{/if}
					Paste this code in the Ko-fi message so we can match it to you:
				</p>
				<p class="text-center text-3xl font-bold tracking-widest mb-4">{form.paymentCode}</p>
				<div class="flex flex-wrap justify-center gap-2 mb-4">
					<button
						type="button"
						class="btn variant-filled-success"
						on:click={() => form.paymentCode && copyText(form.paymentCode, 'code')}
					>
						{copiedCode ? 'Copied!' : 'Copy code'}
					</button>
					<a href={KOFI_PAGE_URL} target="_blank" rel="noreferrer" class="btn variant-ghost-surface">
						Open Ko-fi
					</a>
				</div>
				<p class="text-center text-sm text-surface-400 mb-4">
					This page updates automatically when a donation is confirmed.
				</p>
				<iframe
					id="kofiframe"
					src="https://ko-fi.com/{KOFI_USERNAME}/?hidefeed=true&widget=true&embed=true"
					title="Support Big World on Ko-fi"
					class="w-full rounded-xl bg-transparent"
					style="border: none; height: 712px;"
				></iframe>
			</div>
		</div>
	{:else}
		<div class="py-2">
			<h1 class="text-3xl font-bold mb-2 text-center">Big World Olympics 2026</h1>
			<p class="text-center text-surface-300 mb-6">Sign-up</p>

			{#if data.existingSubmission}
				<p class="text-center mb-4">
					<button type="button" on:click={cancelEdit} class="underline text-surface-200 hover:text-primary-300">
						Cancel and keep current sign-up
					</button>
				</p>
			{/if}

			{#if errorMessage}
				<div class="alert variant-filled-error mb-6">
					<p>{errorMessage}</p>
				</div>
			{/if}

			<TabGroup justify="justify-center">
				{#each TAB_LABELS as label, index}
					<Tab bind:group={tabSet} name="olympics-tab" value={index}>
						<span class="hidden sm:inline">{index + 1}. {label}</span>
						<span class="sm:hidden">{index + 1}</span>
					</Tab>
				{/each}

				<svelte:fragment slot="panel">
					<div class="pt-6">
						{#if tabSet === 0}
							<div class="space-y-6 max-w-2xl mx-auto">
								<p class="text-lg text-surface-200 leading-relaxed">
									Big World Olympics is a multi-week-long online gaming event where you can participate as
									much or as little as you want. Sign-up is free. Donate or refer friends after you submit
									to unlock higher tiers.
								</p>
								<p class="text-surface-200">
									Games will be hosted in the Big World Discord server.
									<a
										href={DISCORD_INVITE_URL}
										target="_blank"
										rel="noreferrer"
										class="underline hover:text-primary-300"
									>
										Join Here.
									</a>
								</p>

								<label class="label">
									<span>Discord Username</span>
									<input class="input font-bold text-lg" type="text" value={data.user.username} disabled />
								</label>

								<label class="label">
									<span>Email <span class="text-surface-400">(optional)</span></span>
									<input class="input" type="email" bind:value={email} placeholder="you@example.com" />
								</label>

								<label class="label">
									<span>Phone <span class="text-surface-400">(optional)</span></span>
									<input class="input" type="tel" bind:value={phone} placeholder="Optional" />
								</label>

								<label class="label">
									<span>
										Who referred you?
										<span class="text-surface-400">{referralLocked ? '' : '(optional)'}</span>
									</span>
									<input
										class="input"
										type="text"
										bind:value={referredByUsername}
										placeholder="Discord username"
										maxlength="32"
										disabled={referralLocked}
									/>
								</label>
								{#if referralLocked}
									<p class="text-sm text-surface-400">
										Your referrer is locked from your first submit and cannot be changed.
									</p>
								{:else if isSelfReferral}
									<p class="text-warning-500 text-sm">You can't refer yourself — this will be ignored.</p>
								{:else}
									<p class="text-sm text-surface-400">
										If a friend sent you here, enter their Discord username. This is saved when you first
										submit and cannot be changed later.
									</p>
								{/if}

								{#if email && !contactValid}
									<p class="text-warning-500 text-sm">Please enter a valid email address.</p>
								{/if}
							</div>
						{:else if tabSet === 1}
							<div class="space-y-6 max-w-xl mx-auto">
								<div class="text-center space-y-1">
									<h2 class="text-2xl font-bold">Choose Your Allegiance</h2>
									<p class="text-surface-400">
										Pick the house you will fight for in this year's Olympics.
									</p>
								</div>

								<div class="flex items-start gap-3">
									<input
										class="radio mt-1"
										type="radio"
										bind:group={nationMode}
										value="join"
									/>
									<div class="flex-1 min-w-0">
										<p class="font-semibold mb-2">Join an existing house</p>
										<div class="nation-list">
											<button
												type="button"
												class="nation-option"
												class:selected={nationMode === 'join' && selectedNationId === FREE_AGENT_ID}
												on:click={() => {
													nationMode = 'join';
													selectedNationId = FREE_AGENT_ID;
												}}
											>
												<span class="nation-option-name">Free Agent</span>
											</button>
											{#each joinNations as nation}
												<button
													type="button"
													class="nation-option"
													class:selected={nationMode === 'join' && selectedNationId === nation.id}
													on:click={() => {
														nationMode = 'join';
														selectedNationId = nation.id;
													}}
												>
													<NationTitle
														name={nation.name}
														emojis={nation.emojis ?? []}
														colorScheme={nation.colorScheme}
													/>
													<div class="nation-option-meta">
														{#if referrerNationId && nation.id === referrerNationId}
															<span class="referrer-badge">Your referrer's nation</span>
														{/if}
														{#if nation.captain}
															<span class="captain-tag">Captain {nation.captain}</span>
														{/if}
													</div>
												</button>
											{/each}
										</div>
										{#if nationMode === 'join' && selectedNationId === FREE_AGENT_ID}
											<p class="text-sm text-surface-400 mt-2">
												You will be drafted for one of the pre-existing houses.
											</p>
										{/if}
									</div>
								</div>

								<div class="flex items-start gap-3">
									<input class="radio mt-1" type="radio" bind:group={nationMode} value="create" />
									<div class="flex-1 min-w-0">
										<p class="font-semibold">Or create your own...</p>
										<p class="text-sm text-surface-400 mb-2">
											You will be able to invite others to your house once submitted.
										</p>
										<input
											class="input"
											type="text"
											bind:value={newNationName}
											placeholder="House name"
											maxlength="40"
											disabled={nationMode !== 'create'}
										/>
										<div class="mt-4 space-y-3">
											<div>
												<p class="text-sm font-medium mb-2">Colors</p>
												<div class="color-swatches">
													{#each NATION_COLOR_SCHEMES as scheme}
														<button
															type="button"
															class="color-swatch"
															class:selected={newNationColor === scheme.id}
															style="background-image: linear-gradient(135deg, {scheme.from}, {scheme.to});"
															title={scheme.label}
															aria-label={scheme.label}
															on:click={() => {
																nationMode = 'create';
																newNationColor = scheme.id;
															}}
														></button>
													{/each}
												</div>
											</div>
											<div>
												<p class="text-sm font-medium mb-2">Emojis</p>
												<div class="flex gap-2 mb-2">
													{#each emojiSlots as slot}
														<div
															class="emoji-slot"
															class:selected={emojiSlot === slot}
														>
															<input
																class="emoji-slot-input"
																value={newNationEmojis[slot]}
																placeholder="+"
																maxlength="8"
																disabled={nationMode !== 'create'}
																on:focus={() => {
																	nationMode = 'create';
																	emojiSlot = slot;
																}}
																on:input={(event) => setEmojiFromInput(slot, event)}
															/>
														</div>
													{/each}
												</div>
												<div class="emoji-grid">
													{#each NATION_EMOJI_CHOICES as emoji}
														<button
															type="button"
															class="emoji-choice"
															on:click={() => {
																nationMode = 'create';
																pickEmoji(emoji);
															}}
														>
															{emoji}
														</button>
													{/each}
												</div>
											</div>
											<div class="nation-preview">
												<p class="text-xs text-surface-400 mb-1">Preview</p>
												<NationTitle
													name={previewNation.name}
													emojis={previewNation.emojis}
													colorScheme={previewNation.colorScheme}
													size="xl"
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						{:else if tabSet === 2}
							<div class="space-y-6">
								<h2 class="text-2xl font-bold text-center">Choose your events</h2>
								<p class="text-center text-surface-300 max-w-2xl mx-auto">
									You do not have to participate in every event. Choose only the games you would like to
									sign up for. You will get more information once event details are confirmed.
								</p>

								<div class="signup-panel p-5 max-w-2xl mx-auto space-y-3">
									<label class="label">
										<span>Suggest a game</span>
										<div class="flex flex-col sm:flex-row gap-2">
											<input
												class="input"
												type="text"
												bind:value={suggestedName}
												placeholder="Suggest a game..."
												maxlength={SUGGESTED_GAME_MAX_LENGTH}
												on:keydown={(event) => {
													if (event.key === 'Enter') {
														event.preventDefault();
														addSuggestedGame();
													}
												}}
											/>
											<button type="button" class="btn variant-filled-primary" on:click={addSuggestedGame}>
												Add
											</button>
										</div>
									</label>
									<p class="text-sm text-surface-400">
										Suggest a game not listed below and start gauging interest. Others will be able to
										select it when they sign-up.
									</p>
									{#if suggestedError}
										<p class="text-warning-500 text-sm">{suggestedError}</p>
									{/if}
								</div>

								<p class="text-center text-surface-300">or choose from existing options:</p>
								<p class="text-center text-sm text-surface-400">
									{selectedGames.length} selected · hover badges for details
								</p>

								<div class="grid grid-cols-1 sm:grid-cols-2 gap-5 py-2">
									{#each pickerGames as game}
										<GameBanner
											{game}
											selected={selectedGames.includes(game.id)}
											on:click={() => toggleGame(game.id)}
										/>
									{/each}
								</div>

								{#if !eventsValid}
									<p class="text-center text-warning-500 text-sm">Please select at least one event.</p>
								{/if}
							</div>
						{:else if tabSet === 3}
							<div class="space-y-6">
								<h2 class="text-2xl font-bold text-center">Availability</h2>
								<p class="text-surface-300 max-w-3xl mx-auto text-center leading-relaxed">
									Please provide your free availability for the next few weeks as accurately as possible.
								</p>
								<p class="text-surface-300 max-w-3xl mx-auto text-center leading-relaxed">
									All events will take place in ET evening hours (6pm-11pm) unless otherwise specified. Exact times
									will be provided once details are confirmed.
								</p>
								<p class="text-surface-400 max-w-3xl mx-auto text-center text-sm">
									This allows us to schedule the events to maximize turnout. You can come back and edit this
									later if plans change. Days default to not available — click to mark available or tentative.
								</p>
								<p class="text-surface-300 max-w-3xl mx-auto text-center leading-relaxed">
									We will try to schedule your selected events on days you're available, but cannot guarantee
									it - depending on what works best for everyone.
								</p>

								<label class="flex items-start gap-3 max-w-xl mx-auto cursor-pointer signup-panel p-4">
									<input
										class="checkbox mt-1"
										type="checkbox"
										checked={anyDateWithNotice}
										on:change={onAnyDateToggle}
									/>
									<div>
										<p class="font-semibold">I'm good with any date, with advance notice</p>
										<p class="text-sm text-surface-400 mt-1">
											We'll mark every day as available. You can uncheck this to set specific days again.
										</p>
									</div>
								</label>

								<p class="text-warning-400 max-w-3xl mx-auto text-center leading-relaxed">
									Heads Up: This is based on the next few weeks. If timing doesn't work out, we may
									reschedule the games for further out.
								</p>

								<AvailabilityGrid bind:availability dimmed={anyDateWithNotice} />
							</div>
						{:else if tabSet === 4}
							<div class="space-y-6 max-w-2xl mx-auto">
								<h2 class="text-2xl font-bold text-center">Tiers</h2>
								<p class="text-center text-surface-300">
									Everyone can enter free. Donate after you submit, or refer friends, to unlock higher
									tiers. $1 = 1,000 XP. Each completed referral is {XP_PER_REFERRAL.toLocaleString('en-US')} XP.
								</p>
								<p class="text-sm text-center text-surface-400">
									Donations are matched on Ko-fi after sign-up using your personal payment code. All money
									goes towards Big World Olympics events and the prize pool.
								</p>

								{#each OLYMPICS_TIERS as tier}
									<div class="signup-panel p-5 space-y-3">
										<div class="flex items-baseline justify-between gap-3">
											<h3>
												<TierTitle id={tier.id} name={tier.name} size="xl" />
											</h3>
											<p class="text-sm text-surface-400">{tier.tagline}</p>
										</div>
										<ul class="list-disc ml-5 space-y-2 text-surface-200">
											{#each tier.perks as perk}
												{#if perk.startsWith('Bronze / Silver / Gold')}
													<li>
														<span class="medal bronze">Bronze</span>
														<span class="text-surface-400"> / </span>
														<span class="medal silver">Silver</span>
														<span class="text-surface-400"> / </span>
														<span class="medal gold">Gold</span>
														medals for top 3 placements
													</li>
												{:else}
													<li>{perk}</li>
												{/if}
											{/each}
										</ul>
										{#if tier.featuredPerks?.length}
											<div class="space-y-1 pt-1 ml-5">
												{#each tier.featuredPerks as perk}
													<FeaturedPerk
														before={perk.before ?? ''}
														highlight={perk.highlight}
														after={perk.after ?? ''}
														tone={perk.tone}
													/>
												{/each}
											</div>
										{/if}
									</div>
								{/each}

								<p class="text-center text-sm text-surface-400">
									Check out what was given out last Olympics.
								</p>
								<PrizeGalleries compact />
								<p class="text-center text-surface-300 font-medium">More tiers coming based on community contributions. Wanna contribute prizes or merch to the Olympics loot and get paid for it? Reach out!</p>
							</div>
						{:else if tabSet === 5}
							{@const counts = availabilityCounts({ availability })}
							<div class="space-y-5 max-w-3xl mx-auto">
								<h2 class="text-2xl font-bold text-center">Review</h2>
								<p class="text-center text-surface-300">
									Check everything below, then submit. You can jump back to a tab to make changes.
								</p>

								<div class="signup-panel p-5">
									<div class="flex items-center justify-between mb-3">
										<h3 class="font-bold">Contact</h3>
										<button type="button" class="btn btn-sm variant-ghost-surface" on:click={() => (tabSet = 0)}>
											Change
										</button>
									</div>
									<dl class="space-y-2 text-surface-200">
										<div class="flex justify-between gap-4">
											<dt class="text-surface-400">Discord</dt>
											<dd>{data.user.username}</dd>
										</div>
										<div class="flex justify-between gap-4">
											<dt class="text-surface-400">Email</dt>
											<dd>{email.trim() || 'Not provided'}</dd>
										</div>
										<div class="flex justify-between gap-4">
											<dt class="text-surface-400">Phone</dt>
											<dd>{phone.trim() || 'Not provided'}</dd>
										</div>
										<div class="flex justify-between gap-4">
											<dt class="text-surface-400">Referred by</dt>
											<dd>
												{#if isSelfReferral}
													None
												{:else}
													{normalizeReferralUsername(referredByUsername) || 'None'}
												{/if}
											</dd>
										</div>
									</dl>
								</div>

								<div class="signup-panel p-5">
									<div class="flex items-center justify-between mb-3">
										<h3 class="font-bold">House</h3>
										<button type="button" class="btn btn-sm variant-ghost-surface" on:click={() => (tabSet = 1)}>
											Change
										</button>
									</div>
									<NationTitle
										name={selectedNationName || '—'}
										emojis={nationMode === 'create'
											? newNationEmojis.filter(Boolean)
											: selectedNation?.emojis ?? []}
										colorScheme={nationMode === 'create'
											? newNationColor
											: selectedNation?.colorScheme}
										size="xl"
									/>
									<p class="text-sm text-surface-400 mt-1">
										{#if nationMode === 'create'}
											Creating a new house — you'll be captain
										{:else if selectedNationId === FREE_AGENT_ID}
											Signing up as a Free Agent
										{:else if selectedNation?.captain}
											Joining {selectedNationName} (Captain: {selectedNation.captain})
										{:else}
											Joining an existing house
										{/if}
									</p>
								</div>

								<div class="signup-panel p-5">
									<div class="flex items-center justify-between mb-3">
										<h3 class="font-bold">Events</h3>
										<button type="button" class="btn btn-sm variant-ghost-surface" on:click={() => (tabSet = 2)}>
											Change
										</button>
									</div>
									{#if selectedGames.length}
										<ul class="list-disc list-inside space-y-1 text-surface-200">
											{#each selectedGames as gameId}
												<li>{gameTitle(gameId)}</li>
											{/each}
										</ul>
									{:else}
										<p class="text-warning-500">No events selected.</p>
									{/if}
								</div>

								<div class="signup-panel p-5">
									<div class="flex items-center justify-between mb-3">
										<h3 class="font-bold">Availability</h3>
										<button type="button" class="btn btn-sm variant-ghost-surface" on:click={() => (tabSet = 3)}>
											Change
										</button>
									</div>
									{#if anyDateWithNotice}
										<p class="text-surface-300 mb-4">
											Any date, with advance notice — every day is marked available.
										</p>
									{:else}
										<p class="text-surface-300 mb-4">
											{counts.available} available · {counts.tentative} tentative · {counts.unavailable} not
											available
										</p>
									{/if}
									<AvailabilityGrid bind:availability readonly dimmed={anyDateWithNotice} />
								</div>

								<div class="signup-panel p-5">
									<div class="flex items-center justify-between mb-3">
										<h3 class="font-bold">Tiers</h3>
										<button type="button" class="btn btn-sm variant-ghost-surface" on:click={() => (tabSet = 4)}>
											View
										</button>
									</div>
									<p>
										Sign-up is free (Free Spirit). After you submit, donate on Ko-fi or refer friends to
										unlock Citizen and Protagonist. More tiers are coming.
									</p>
								</div>
							</div>
						{/if}
					</div>
				</svelte:fragment>
			</TabGroup>

			<div class="flex justify-between items-center mt-8 gap-3">
				<button type="button" class="btn variant-ghost-surface" on:click={prevTab} disabled={tabSet === 0}>
					Back
				</button>

				{#if tabSet < TAB_LABELS.length - 1}
					<button
						type="button"
						class="btn variant-filled-primary"
						on:click={nextTab}
						disabled={!currentTabValid}
					>
						Next
					</button>
				{:else}
					<button
						type="button"
						class="btn variant-filled-primary"
						on:click={handleSubmit}
						disabled={isSubmitting || !contactValid || !nationValid || !eventsValid}
					>
						{isSubmitting
							? 'Submitting...'
							: data.existingSubmission
								? 'Save changes'
								: 'Submit sign-up'}
					</button>
				{/if}
			</div>
		</div>
	{/if}

	<div class="mt-8 text-center">
		<a href="/olympics" class="btn variant-ghost-surface">← Back to Olympics</a>
	</div>
</div>

<style>
	.signup-bar,
	.signup-panel {
		background: rgb(15 23 42 / 0.45);
		border: 1px solid rgb(148 163 184 / 0.16);
		backdrop-filter: blur(12px);
		border-radius: 1rem;
	}

	.earn-cta-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.85rem;
	}

	@media (min-width: 640px) {
		.earn-cta-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.earn-cta {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.35rem;
		text-align: left;
		padding: 1.15rem 1.2rem;
		border-radius: 1rem;
		border: 1px solid rgb(148 163 184 / 0.22);
		background: rgb(15 23 42 / 0.55);
		color: inherit;
		transition:
			transform 140ms ease,
			border-color 140ms ease,
			box-shadow 140ms ease;
	}

	.earn-cta:hover {
		transform: translateY(-2px);
	}

	.earn-cta.refer {
		border-color: rgb(244 114 182 / 0.55);
		box-shadow: 0 0 0 1px rgb(244 114 182 / 0.12), 0 12px 28px rgb(244 114 182 / 0.12);
	}

	.earn-cta.donate {
		border-color: rgb(251 191 36 / 0.7);
		background: linear-gradient(180deg, rgb(245 158 11 / 0.16), rgb(15 23 42 / 0.55));
		box-shadow: 0 0 0 1px rgb(251 191 36 / 0.18), 0 14px 32px rgb(245 158 11 / 0.18);
	}

	.earn-cta-kicker {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgb(203 213 225);
	}

	.earn-cta.donate .earn-cta-kicker {
		color: rgb(252 211 77);
	}

	.earn-cta-title {
		font-size: 1.45rem;
		font-weight: 800;
		line-height: 1.15;
	}

	.earn-cta-copy {
		font-size: 0.92rem;
		color: rgb(203 213 225);
		line-height: 1.4;
	}

	.nation-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.nation-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		width: 100%;
		padding: 0.7rem 0.9rem;
		text-align: left;
		border-radius: 0.75rem;
		border: 1px solid rgb(148 163 184 / 0.18);
		background: rgb(15 23 42 / 0.4);
		color: inherit;
		transition:
			border-color 120ms ease,
			background-color 120ms ease;
	}

	.nation-option:hover {
		border-color: rgb(244 114 182 / 0.45);
		background: rgb(15 23 42 / 0.62);
	}

	.nation-option.selected {
		border-color: rgb(244 114 182 / 0.95);
		background: rgb(244 114 182 / 0.12);
	}

	.nation-option-name {
		font-weight: 600;
		line-height: 1.3;
	}

	.captain-tag {
		flex-shrink: 0;
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		background: rgb(148 163 184 / 0.18);
		color: rgb(203 213 225);
	}

	.nation-option-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 0.4rem;
		flex-shrink: 0;
	}

	.referrer-badge {
		flex-shrink: 0;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		background: rgb(244 114 182 / 0.18);
		color: rgb(251 207 232);
		border: 1px solid rgb(244 114 182 / 0.45);
	}

	.color-swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.color-swatch {
		width: 1.85rem;
		height: 1.85rem;
		border-radius: 999px;
		border: 2px solid rgb(148 163 184 / 0.25);
		padding: 0;
		cursor: pointer;
	}

	.color-swatch.selected {
		border-color: white;
		box-shadow: 0 0 0 2px rgb(244 114 182 / 0.9);
	}

	.emoji-slot {
		width: 2.6rem;
		height: 2.6rem;
		border-radius: 0.7rem;
		border: 1px solid rgb(148 163 184 / 0.22);
		background: rgb(15 23 42 / 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.emoji-slot.selected {
		border-color: rgb(244 114 182 / 0.9);
	}

	.emoji-slot-input {
		width: 100%;
		height: 100%;
		border: 0;
		background: transparent;
		text-align: center;
		font-size: 1.15rem;
		color: inherit;
	}

	.emoji-slot-input:focus {
		outline: none;
	}

	.emoji-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	.emoji-choice {
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		border: 1px solid rgb(148 163 184 / 0.16);
		background: rgb(15 23 42 / 0.35);
		font-size: 1.05rem;
		line-height: 1;
	}

	.emoji-choice:hover {
		border-color: rgb(244 114 182 / 0.5);
		background: rgb(15 23 42 / 0.6);
	}

	.nation-preview {
		padding: 0.75rem 0.9rem;
		border-radius: 0.75rem;
		border: 1px dashed rgb(148 163 184 / 0.28);
		background: rgb(15 23 42 / 0.28);
	}

	.medal {
		font-weight: 800;
	}

	.medal.bronze {
		color: #cd7f32;
		text-shadow: 0 0 10px rgb(205 127 50 / 0.45);
	}

	.medal.silver {
		color: #e2e8f0;
		text-shadow: 0 0 10px rgb(226 232 240 / 0.4);
	}

	.medal.gold {
		color: #fbbf24;
		text-shadow: 0 0 12px rgb(251 191 36 / 0.55);
	}
</style>
