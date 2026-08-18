<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import { Avatar, TabGroup, Tab } from '@skeletonlabs/skeleton';
	import GameBanner from '$lib/components/olympics/GameBanner.svelte';
	import AvailabilityGrid from '$lib/components/olympics/AvailabilityGrid.svelte';
	import {
		DISCORD_INVITE_URL,
		FREE_AGENT_ID,
		KOFI_PAGE_URL,
		KOFI_USERNAME,
		MIN_ENTRY_FEE,
		OLYMPICS_FORM_ID,
		slugifyNationName
	} from '$lib/olympics/config';
	import { defaultAvailability } from '$lib/olympics/dates';
	import {
		GAME_IDS,
		OLYMPICS_GAMES,
		SUGGESTED_GAME_MAX_LENGTH,
		asSuggestedGame,
		compareGamesByPopularity,
		type OlympicsGame
	} from '$lib/olympics/games';
	import type {
		OlympicsFormData,
		OlympicsNation,
		OlympicsSubmission,
		OlympicsSuggestedGame
	} from '$lib/olympics/types';

	export let data: {
		user: { id: string; username: string; avatar: string | null };
		existingSubmission: OlympicsSubmission | null;
		nations: OlympicsNation[];
		suggestedGames: OlympicsSuggestedGame[];
		signupCounts: Record<string, number>;
	};

	const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const TAB_LABELS = ['Contact', 'Nation', 'Events', 'Availability', 'Payment', 'Review'];

	let tabSet = 0;
	let email = '';
	let phone = '';
	let nationMode: 'join' | 'create' = 'join';
	let selectedNationId = FREE_AGENT_ID;
	let newNationName = '';
	let selectedGames: string[] = [];
	let localSuggestions: OlympicsGame[] = [];
	let suggestedName = '';
	let suggestedError = '';
	let availability = defaultAvailability();
	let isSubmitting = false;
	let errorMessage = '';
	let showForm = !data.existingSubmission;
	let copiedCode = false;
	let pollTimer: ReturnType<typeof setInterval> | null = null;

	function applySubmission(submission: OlympicsSubmission | null) {
		const form = submission?.form_data;
		email = form?.email ?? '';
		phone = form?.phone ?? '';
		selectedGames = form?.games ? [...form.games] : [];
		availability = { ...defaultAvailability(), ...(form?.availability ?? {}) };
		if (form?.createdNation) {
			nationMode = 'create';
			newNationName = form.nationName ?? '';
			selectedNationId = FREE_AGENT_ID;
		} else {
			nationMode = 'join';
			selectedNationId = form?.nationId ?? FREE_AGENT_ID;
			newNationName = '';
		}
	}

	applySubmission(data.existingSubmission);

	$: joinNations = data.nations.filter((nation) => nation.id !== FREE_AGENT_ID);
	$: contactValid = !email || EMAIL_RE.test(email);
	$: nationValid =
		nationMode === 'create' ? newNationName.trim().length >= 2 : Boolean(selectedNationId);
	$: eventsValid = selectedGames.length >= 1;
	$: catalogSuggestions = (data.suggestedGames ?? [])
		.filter((game) => !GAME_IDS.has(game.id) && (!game.hidden || selectedGames.includes(game.id)))
		.map((game) => asSuggestedGame(game.id, game.title));
	$: sessionSuggestions = localSuggestions.filter(
		(game) => !GAME_IDS.has(game.id) && !catalogSuggestions.some((existing) => existing.id === game.id)
	);
	$: pickerGames = [...OLYMPICS_GAMES, ...catalogSuggestions, ...sessionSuggestions].sort((a, b) =>
		compareGamesByPopularity(a, b, data.signupCounts ?? {})
	);
	$: selectedNationName =
		nationMode === 'create'
			? newNationName.trim()
			: data.nations.find((nation) => nation.id === selectedNationId)?.name ?? 'Free Agent';
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

	function formatUsd(amount: number): string {
		if (!Number.isFinite(amount)) return '$—';
		return `$${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
	}

	async function copyPaymentCode(code: string) {
		try {
			await navigator.clipboard.writeText(code);
			copiedCode = true;
			setTimeout(() => (copiedCode = false), 2000);
		} catch {
			copiedCode = false;
		}
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
				games: selectedGames,
				availability,
				entryAmount: MIN_ENTRY_FEE,
				paymentStatus: 'pending'
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
			const status = data.existingSubmission?.form_data?.paymentStatus;
			if (!showForm && status === 'pending') {
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

	{#if data.existingSubmission && !showForm}
		{@const form = data.existingSubmission.form_data}
		{@const counts = availabilityCounts(form)}
		{@const paid = form.paymentStatus === 'paid'}
		<div class="py-2">
			<h1 class="text-3xl font-bold mb-2 text-center">
				{paid ? 'Sign-up complete' : 'One last step to complete your sign-up'}
			</h1>
			<p class="text-center text-surface-300 mb-6">
				{#if paid}
					You're in for Big World Olympics 2026. You can update your details any time.
				{:else}
					Your details are saved. Pay the ${MIN_ENTRY_FEE} minimum entry fee on Ko-fi to finish.
				{/if}
			</p>

			<div class="signup-panel p-5 mb-6 max-w-2xl mx-auto flex items-center gap-4">
				{#if paid}
					<span
						class="flex-shrink-0 w-12 h-12 rounded-full bg-success-500 text-white text-2xl font-bold flex items-center justify-center"
						aria-hidden="true"
					>
						✓
					</span>
				{:else}
					<span
						class="flex-shrink-0 w-12 h-12 rounded-full bg-error-500 text-white text-2xl font-bold flex items-center justify-center"
						aria-hidden="true"
					>
						✕
					</span>
				{/if}
				<div>
					<p class="text-sm text-surface-400">Entry fee</p>
					{#if paid}
						<p class="text-xl font-bold text-success-400">
							Paid {formatUsd(form.paidAmount ?? MIN_ENTRY_FEE)}
						</p>
					{:else}
						<p class="text-lg text-surface-200">
							Still awaiting ${MIN_ENTRY_FEE} entry fee on Ko-fi
						</p>
					{/if}
				</div>
			</div>

			<div class="grid md:grid-cols-2 gap-4 mb-8">
				<div class="signup-panel p-5">
					<p class="text-sm text-surface-400 mb-1">Nation</p>
					<p class="text-xl font-semibold">{form.nationName}</p>
				</div>
				<div class="signup-panel p-5">
					<p class="text-sm text-surface-400 mb-1">Events</p>
					<p class="font-medium">{form.games.map(gameTitle).join(', ')}</p>
				</div>
				<div class="signup-panel p-5">
					<p class="text-sm text-surface-400 mb-1">Availability</p>
					<p>
						{counts.available} available · {counts.tentative} tentative · {counts.unavailable} not available
					</p>
				</div>
				<div class="signup-panel p-5">
					<p class="text-sm text-surface-400 mb-1">Submitted</p>
					<p>{formatSubmittedAt(data.existingSubmission) || 'Just now'}</p>
				</div>
			</div>

			{#if !paid}
				<div class="signup-panel p-6 mb-8 max-w-2xl mx-auto">
					<h2 class="text-xl font-bold mb-2 text-center">Pay your entry fee</h2>
					<p class="text-center text-surface-300 mb-4">
						Minimum ${MIN_ENTRY_FEE}. Extra support is welcome and goes to the prize pool. Paste this
						code in the Ko-fi message box so we can match your signup:
					</p>
					<p class="text-center text-3xl font-bold tracking-widest mb-4">{form.paymentCode}</p>
					<div class="flex flex-wrap justify-center gap-2 mb-4">
						<button
							type="button"
							class="btn variant-filled-success"
							on:click={() => form.paymentCode && copyPaymentCode(form.paymentCode)}
						>
							{copiedCode ? 'Copied!' : 'Copy code'}
						</button>
						<a href={KOFI_PAGE_URL} target="_blank" rel="noreferrer" class="btn variant-ghost-surface">
							Open Ko-fi
						</a>
					</div>
					<p class="text-center text-sm text-surface-400 mb-4">
						This page updates automatically when payment is confirmed.
					</p>
					<iframe
						id="kofiframe"
						src="https://ko-fi.com/{KOFI_USERNAME}/?hidefeed=true&widget=true&embed=true"
						title="Support Big World on Ko-fi"
						class="w-full rounded-xl bg-transparent"
						style="border: none; height: 712px;"
					></iframe>
				</div>
			{/if}

			<div class="flex justify-center">
				<button type="button" on:click={startEdit} class="btn variant-filled-primary">
					Edit sign-up
				</button>
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
									much or as little as you want. All participants get free games and merch, and winners get
									prizes.
								</p>
								<p class="text-lg">
									A <strong>${MIN_ENTRY_FEE}</strong> minimum entry fee is required to complete sign-up.
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

								{#if email && !contactValid}
									<p class="text-warning-500 text-sm">Please enter a valid email address.</p>
								{/if}
							</div>
						{:else if tabSet === 1}
							<div class="space-y-6 max-w-xl mx-auto">
								<h2 class="text-2xl font-bold text-center">Choose your nation</h2>

								<label class="flex items-start gap-3 cursor-pointer">
									<input class="radio mt-1" type="radio" bind:group={nationMode} value="join" />
									<div class="flex-1">
										<p class="font-semibold mb-2">Join an existing nation</p>
										<select class="select" bind:value={selectedNationId} disabled={nationMode !== 'join'}>
											<option value={FREE_AGENT_ID}>Free Agent</option>
											{#each joinNations as nation}
												<option value={nation.id}>{nation.name}</option>
											{/each}
										</select>
										{#if nationMode === 'join' && selectedNationId === FREE_AGENT_ID}
											<p class="text-sm text-surface-400 mt-2">
												You will be drafted for one of the pre-existing nations.
											</p>
										{/if}
									</div>
								</label>

								<label class="flex items-start gap-3 cursor-pointer">
									<input class="radio mt-1" type="radio" bind:group={nationMode} value="create" />
									<div class="flex-1">
										<p class="font-semibold">Create your own</p>
										<p class="text-sm text-surface-400 mb-2">
											You will be able to invite others to your nation once submitted.
										</p>
										<input
											class="input"
											type="text"
											bind:value={newNationName}
											placeholder="Nation name"
											maxlength="40"
											disabled={nationMode !== 'create'}
										/>
									</div>
								</label>
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
									All events will take place in ET evening hours unless otherwise specified. Exact times
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

								<AvailabilityGrid bind:availability />
							</div>
						{:else if tabSet === 4}
							<div class="space-y-6 max-w-2xl mx-auto">
								<h2 class="text-2xl font-bold text-center">Payment</h2>
								<p class="text-xl text-center">
									Required entry fee: <strong>${MIN_ENTRY_FEE}</strong>
								</p>
								<p class="text-center text-surface-300">
									Payment is required to complete your sign-up. After you submit your details, you'll
									pay on Ko-fi (minimum ${MIN_ENTRY_FEE}). Anything extra is optional and goes to the
									prize pool.
								</p>
								<p class="text-sm text-center text-surface-400">
									All money will go towards the Big World Olympics events and prize pool.
								</p>

								<div class="signup-panel p-5 space-y-3">
									<h3 class="font-bold">Guaranteed with your entry fee</h3>
									<ul class="space-y-4 text-surface-200">
										<li>
											<p class="font-semibold">Big World Merch</p>
											<p class="text-sm text-surface-400 mt-1">
												<a href="/olympics" class="underline hover:text-primary-300">
													Check out what was given out last Olympics.
												</a>
											</p>
											<ul class="list-disc ml-6 mt-2 space-y-2 text-surface-300">
												<li>
													1 Big World Olympics 2026 sealed booster pack (10-15 cards)
													<span class="block text-sm text-surface-400 mt-1">
														Shipped directly to you, provided you participate in at least one event and provide a
														mailing address.
													</span>
												</li>
												<li>1 custom-made Big World holographic card representing you</li>
											</ul>
										</li>
										<li>
											<p class="font-semibold">Gifted Games</p>
											<p class="text-sm text-surface-400 mt-1">
												In events you participate in that are marked as "Gifted Games" eligible.
											</p>
										</li>
									</ul>
								</div>

								<div class="signup-panel p-5 space-y-3">
									<h3 class="font-bold">Chance with your entry fee</h3>
									<ul class="list-disc list-inside space-y-2 text-surface-200">
										<li>Daily Raffle on Event Days (up to $50 Gift Cards)</li>
										<li>Giveaways</li>
										<li>Chance to Win Custom-Made Big World Olympics Medals</li>
										<li>Chance to Win Cash Prizes in Paid Events</li>
										<li>Bragging Rights</li>
									</ul>
								</div>

								<div class="signup-panel p-5 space-y-3">
									<h3 class="font-bold">Why is there a fee?</h3>
									<p class="text-surface-200">
										Every participant gets back much more than ${MIN_ENTRY_FEE} in value and winners are eligible for medals
										&amp; huge prizes.
									</p>
									<p class="text-surface-200">
										The entry fee helps offset that cost, and guarantees that our sign-ups are legitimate, to
										weed out flakers. Flakers ruin things for everyone because they skew the count and mess up
										the schedule for legit participants. ${MIN_ENTRY_FEE} is a way to say "I'm serious about participating".
									</p>
								</div>
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
									</dl>
								</div>

								<div class="signup-panel p-5">
									<div class="flex items-center justify-between mb-3">
										<h3 class="font-bold">Nation</h3>
										<button type="button" class="btn btn-sm variant-ghost-surface" on:click={() => (tabSet = 1)}>
											Change
										</button>
									</div>
									<p class="text-xl font-semibold">{selectedNationName || '—'}</p>
									<p class="text-sm text-surface-400 mt-1">
										{#if nationMode === 'create'}
											Creating a new nation
										{:else if selectedNationId === FREE_AGENT_ID}
											Signing up as a Free Agent
										{:else}
											Joining an existing nation
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
									<p class="text-surface-300 mb-4">
										{counts.available} available · {counts.tentative} tentative · {counts.unavailable} not
										available
									</p>
									<AvailabilityGrid bind:availability readonly />
								</div>

								<div class="signup-panel p-5">
									<div class="flex items-center justify-between mb-3">
										<h3 class="font-bold">Payment</h3>
										<button type="button" class="btn btn-sm variant-ghost-surface" on:click={() => (tabSet = 4)}>
											View
										</button>
									</div>
									<p>
										<strong>${MIN_ENTRY_FEE} minimum</strong> via Ko-fi on the next screen — required to
										complete sign-up.
									</p>
									<p class="text-sm text-surface-400 mt-1">
										Extra support is optional and goes to the prize pool.
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
								: 'Submit & continue to payment'}
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
</style>
