<script lang='ts'>
	import { invalidateAll } from '$app/navigation';
	import { Avatar } from '@skeletonlabs/skeleton';

	export let data: any;

	const FORM_ID = 'scotus-nomination';

	// Eligible users for nomination (from Discord elders / offline list)
	const eligibleCandidates = [
		// Online (elders)
		{ id: 'evo', name: 'Evo', displayName: 'Evo' },
		{ id: 'fetta', name: 'fetta', displayName: 'Fetta' },
		{ id: 'kat', name: 'Kat', displayName: 'Kat' },
		{ id: 'neonmuffin', name: 'NeonMuffin', displayName: 'NeonMuffin' },
		{ id: 'raven', name: 'Raven', displayName: 'Raven' },
		{ id: 'steeb', name: 'Rigoberto Gonzalez III', displayName: 'Rigoberto Gonzalez III' },
		{ id: 'shortgod', name: 'ShortGod', displayName: 'ShortGod' },
		{ id: 'spookydnuki', name: 'Spooky D Nuki', displayName: 'Spooky D Nuki' },
		{ id: 'bear', name: 'bear', displayName: 'Bear' },
		{ id: 'chains', name: 'Chains', displayName: 'Chains' },
		{ id: 'eller', name: 'Eller', displayName: 'Eller' },
		{ id: 'em', name: 'Em', displayName: 'Em' },
		{ id: 'eric', name: 'Eric', displayName: 'Eric' },
		{ id: 'gubb', name: 'Gubb', displayName: 'Gubb' },
		{ id: 'johan', name: 'johan', displayName: 'Johan' },
		{ id: 'shroomies', name: 'shroomies', displayName: 'Shroomies' },
		{ id: 'thenightpatrol', name: 'The Night Patrol', displayName: 'The Night Patrol' },
		{ id: 'tony', name: 'Tony', displayName: 'Tony' }
	];

	let selectedNominees: string[] = [];
	let isSubmitting = false;
	let errorMessage = '';
	let successMessage = '';
	let showChangeForm = false;

	$: isValid = selectedNominees.length === 3;

	function startChangeNomination() {
		showChangeForm = true;
		const raw = data.existingSubmission?.form_data?.nominees ?? [];
		// Only keep IDs that exist in current eligible list (avoids "phantom" selections after list changes)
		const validIds = raw.filter((id: string) => eligibleCandidates.some((c) => c.id === id));
		selectedNominees = [...new Set(validIds)]; // dedupe
	}

	function cancelChange() {
		showChangeForm = false;
		selectedNominees = [];
	}

	function toggleNominee(candidateId: string) {
		if (selectedNominees.includes(candidateId)) {
			selectedNominees = selectedNominees.filter(id => id !== candidateId);
		} else {
			if (selectedNominees.length < 3) {
				selectedNominees = [...selectedNominees, candidateId];
			}
		}
	}

	async function handleSubmit() {
		if (!isValid) {
			errorMessage = 'Please select exactly 3 nominees.';
			return;
		}

		isSubmitting = true;
		errorMessage = '';

		try {
			const response = await fetch('/api/forms', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					formId: FORM_ID,
					form_data: {
						nominees: selectedNominees
					}
				})
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to submit nomination');
			}

			// Refetch page data and switch to thank you view immediately
			await invalidateAll();
			showChangeForm = false;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to submit nomination';
		} finally {
			isSubmitting = false;
		}
	}

	function getDiscordAvatarUrl(userId: string, avatarHash: string | null): string {
		if (!avatarHash) {
			// Default Discord avatar
			return `https://cdn.discordapp.com/embed/avatars/${parseInt(userId) % 5}.png`;
		}
		return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
	}
</script>

<svelte:head>
	<title>Supreme Court Nomination - BigHub</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
	<!-- User Header -->
	<div class="card variant-filled-surface p-6 mb-8">
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
			<a href="/api/auth/logout" class="btn variant-ghost-surface btn-sm">
				Logout
			</a>
		</div>
	</div>

	{#if data.existingSubmission && !showChangeForm}
		<!-- Already Submitted -->
		<div class="card variant-filled-surface p-8 text-center">
			<h1 class="text-3xl font-bold mb-4">Thank You!</h1>
			<p class="text-lg mb-6">You have submitted your Supreme Court nomination.</p>
			
			<div class="card variant-filled-surface p-6 max-w-md mx-auto mb-6">
				<h3 class="text-xl font-semibold mb-4">Your Nominees:</h3>
				<ul class="list-disc list-inside space-y-2">
					{#each data.existingSubmission.form_data.nominees as nominee}
						<li class="text-lg">
							{eligibleCandidates.find(c => c.id === nominee)?.displayName || nominee}
						</li>
					{/each}
				</ul>
				<p class="text-sm text-surface-400 mt-4">
					Submitted on {new Date(data.existingSubmission.submittedAt._seconds * 1000).toLocaleDateString()}
				</p>
			</div>

			<button
				type="button"
				on:click={startChangeNomination}
				class="btn variant-filled-primary"
			>
				Change nomination
			</button>
		</div>
	{:else}
		<!-- Nomination Form (first time or changing vote) -->
		<div class="card variant-filled-surface p-8">
			<h1 class="text-3xl font-bold mb-4 text-center">
				{showChangeForm ? 'Change your nomination' : 'Supreme Court Nomination'}
			</h1>
			<p class="text-center text-surface-200 mb-6">
				Select exactly 3 candidates to nominate for the Big World Supreme Court.
				{#if showChangeForm}
					<br>
					<button type="button" on:click={cancelChange} class="underline hover:no-underline mt-2 text-surface-100 hover:text-primary-300">
						Cancel and keep current nomination
					</button>
				{/if}
			</p>

			<div class="card variant-soft-surface p-5 mb-8 text-base text-surface-300 space-y-2">
				<p class="font-semibold text-surface-100 mb-2">Context</p>
				<ul class="list-disc list-inside space-y-1">
					<li>The Supreme Court reflects mods who will be <strong>permanent mods</strong> of the server until otherwise voted out.</li>
					<li>This nomination is to replace <strong>Steeb</strong>, who was voted out of the Supreme Court in the most recent election.</li>
					<li>The current members of the Supreme Court are <strong>Noonz</strong> and <strong>Zaz</strong>.</li>
					<li>The president will nominate the court member from the top 3 nominations.</li>
					<li>You may nominate yourself.</li>
				</ul>
			</div>

			{#if errorMessage}
				<div class="alert variant-filled-error mb-6">
					<p>{errorMessage}</p>
				</div>
			{/if}

			{#if successMessage}
				<div class="alert variant-filled-success mb-6">
					<p>{successMessage}</p>
				</div>
			{/if}

			<div class="space-y-4 mb-8">
				<h3 class="text-xl font-semibold mb-4">
					Eligible Candidates 
					<span class="text-sm text-surface-400 font-normal">
						({selectedNominees.length}/3 selected)
					</span>
				</h3>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each eligibleCandidates as candidate}
						<button
							type="button"
							on:click={() => toggleNominee(candidate.id)}
							class="card p-4 text-left transition-all cursor-pointer {selectedNominees.includes(candidate.id) 
								? 'variant-filled-primary ring-4 ring-primary-500' 
								: 'variant-ghost-surface hover:variant-soft-surface'}"
							disabled={!selectedNominees.includes(candidate.id) && selectedNominees.length >= 3}
						>
							<div class="flex items-center space-x-3">
								<div class="flex-shrink-0">
									{#if selectedNominees.includes(candidate.id)}
										<div class="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
											<span class="text-white font-bold">✓</span>
										</div>
									{:else}
										<div class="w-6 h-6 rounded-full border-2 border-surface-400"></div>
									{/if}
								</div>
								<div>
									<p class="font-semibold">{candidate.displayName}</p>
									<p class="text-sm text-surface-400">{candidate.name}</p>
								</div>
							</div>
						</button>
					{/each}
				</div>
			</div>

			<div class="flex justify-center">
				<button
					on:click={handleSubmit}
					disabled={!isValid || isSubmitting}
					class="btn variant-filled-primary btn-lg"
				>
					{#if isSubmitting}
						<span>{showChangeForm ? 'Saving...' : 'Submitting...'}</span>
					{:else}
						{showChangeForm ? 'Save changes' : 'Submit Nomination'}
					{/if}
				</button>
			</div>

			{#if !isValid && selectedNominees.length > 0}
				<p class="text-center text-warning-500 mt-4 text-sm">
					Please select exactly 3 nominees
				</p>
			{/if}
		</div>
	{/if}

	<div class="mt-8 text-center">
		<a href="/" class="btn variant-ghost-surface">
			← Back to Home
		</a>
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
	}
</style>

