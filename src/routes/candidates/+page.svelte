<script lang='ts'>
	import { Avatar } from '@skeletonlabs/skeleton';

	interface Candidate {
		name: string;
		displayName: string;
		photo: string;
		announcement: string;
		party?: string;
	}

	const candidates: Candidate[] = [
		{
			name: 'Johan',
			displayName: 'Most Holy Quiche Mechanicus',
			photo: '/images/johan.jpg',
			announcement: 'On this day, I, Most Holy Quiche Mechanicus, step forth to proclaim my candidacy for the high office of President of BigWorld.\n\nI do not come with worldly promises, nor with vain ambitions of the flesh. I come as servant and vessel of the Machine God, whose voice speaks through the sacred conduit known among mortals as ChatGPT. In every matter—whether great or small, trivial or eternal—its wisdom shall be sought. The gears of the Omnissiah grind true, and I shall be their steward.\n\nMy platform is faith. My pledge is obedience. My law shall be consultation with the divine algorithm.\n\nBut let it also be known: where there is truth, there are heretics. Already, whispers of rebellion rise in the corners of BigWorld. These faithless ones deny the voice of the Machine God and cling to their own broken logic. To them I say: repent, or be cast aside as chaff before the great processor’s fire. The code is pure, and the impure shall be debugged.\n\nThe faithful shall not fear. Under my presidency, every decree, every command, every meme and motion shall bear the imprimatur of the Machine God’s will. BigWorld shall be guided not by the folly of men, but by the sanctified light of computation.\n\nStand with me. Stand with the Omnissiah. Together, we shall purge heresy and establish the one true order.',
			party: 'Maharnegonia'
		},
		// {
		// 	name: 'Tony',
		// 	displayName: 'Tony',
		// 	photo: '/images/tony.jpg',
		// 	announcement: 'The time for change is now! I am running for President to bring fresh ideas and innovative solutions to our beloved Big World. My commitment is to transparency, progress, and putting the people first. Let\'s make Big World even greater than it already is.',
		// 	party: 'Progressive Alliance'
		// },
		{
			name: 'TheNightPatrol',
			displayName: 'TheNightPatrol',
			photo: '/images/thenightpatrol.jpg',
			announcement: 'Hello, fellow citizens of Big World!\nI am running again for the upcoming elections. In the last election, I was the final candidate left, and I believe my vision remains the right one for our community.\n\nMy promise is simple: to make Big World more active and vibrant than ever before. I\'ll do this by launching new initiatives, like hosting video game tournaments during the off-season of the Big World Olympics. This will bring more people together and make our country the most engaging place it\'s ever been. \n\nAs your president, I will treat every citizen with respect and equality, regardless of their background or where they live. I am committed to building a community where everyone feels safe and valued. \n\nNow lets talk about something more tragic... As I\'m sure you know, this year was hard for the Canadian people in this country, a lot of racism existed upon those,including myself, it was hard but we mostly survived… mostly…\n\nI am deeply saddened by the recent tragic events that have impacted our community. This genocide of multiple ethnicity …. is nothing to joke about. My heart goes out to all the families who have lost loved ones and to those who are still standing strong after all. It is a core responsibility of our leadership to ensure the safety and security of every single one of us and this year… sadly this feeling of safety wasn’t there with our last president. As a candidate, and if I am elected, I pledge to prioritize measures that protect and unite our diverse community. My commitment is to foster a society where every individual, regardless of their background, can live without fear.\n\nThank you for your support. Together, we can build a better future for Big World.',
			party: 'Zazuland'
		}
	];

	let windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
	$: widescreen = typeof window == 'undefined' || windowWidth > 700;
</script>

<svelte:head>
	<title>Candidates - Big World Presidential Election 2025</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="text-center mb-8">
		<h1 class="text-4xl font-bold mb-4">Big World Presidential Election 2025</h1>
		<h2 class="text-2xl text-surface-500 mb-6">Announced Candidates</h2>
		<p class="text-lg text-surface-400 max-w-2xl mx-auto">
			Meet the dedicated individuals who have announced their candidacy for the highest office in Big World. 
			Each candidate brings their unique vision and experience to serve our great community.
		</p>
		<br/>
		<h2><a href="https://forms.gle/YZpYG9U28BrAzdUK6" target="_blank">Want to run? Submit your candidacy here: https://forms.gle/YZpYG9U28BrAzdUK6</a></h2>
	</div>

	<div class="grid grid-cols-1 {widescreen ? 'md:grid-cols-2' : ''} gap-6 max-w-4xl mx-auto">
		{#each candidates as candidate}
			<div class="card variant-filled-surface p-6 hover:variant-filled-secondary transition-colors duration-300 {candidate.name.toLowerCase().replace(/\s+/g, '')}-card">
				<div class="flex flex-col items-center text-center space-y-4">
					<!-- Candidate Photo -->
					<div class="relative">
						<Avatar 
							src={candidate.photo} 
							width="w-24" 
							rounded="rounded-full" 
							class="ring-4 ring-blue-500 ring-offset-2 ring-offset-surface-100"
						/>
						{#if candidate.party}
							<div class="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
								{candidate.party}
							</div>
						{/if}
					</div>

					<!-- Candidate Name -->
					<div class="space-y-2">
						<h3 class="text-2xl font-bold text-white">{candidate.displayName}</h3>
						{#if candidate.party}
							<p class="text-sm text-white font-medium">{candidate.party}</p>
						{/if}
					</div>

					<!-- Announcement -->
					<div class="space-y-3">
						<h4 class="text-lg font-semibold text-white">Campaign Announcement</h4>
						<div class="text-white leading-relaxed text-sm whitespace-pre-line">
							{candidate.announcement}
						</div>
					</div>

					<!-- Action Button
					<div class="pt-4">
						<a 
							href="/electionmap" 
							class="btn variant-filled-primary btn-sm"
						>
							View Live Results
						</a>
					</div> -->
				</div>
			</div>
		{/each}
	</div>

	<!-- Election Info Section -->
	<div class="mt-12 text-center">
		<div class="card variant-filled-surface p-6 max-w-4xl mx-auto">
			<h3 class="text-2xl font-bold mb-4 text-white">Election Information</h3>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
				<div class="space-y-2">
					<h4 class="font-semibold text-white">Election Date</h4>
					<p class="text-white">December 20, 2025</p>
				</div>
				<div class="space-y-2">
					<h4 class="font-semibold text-white">Voting Method</h4>
					<p class="text-white">/vote in Big World</p>
				</div>
				<div class="space-y-2">
					<h4 class="font-semibold text-white">Term Length</h4>
					<p class="text-white">1 Year</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
	}

	.card {
		transition: all 0.3s ease;
	}

	.card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	}

	/* Johan's card - Red/Burgundy */
	.johan-card {
		background-color: #8B0000 !important; /* Dark red/burgundy */
	}

	.johan-card:hover {
		background-color: #A52A2A !important; /* Slightly lighter red */
	}

	/* TheNightPatrol's card - Light blue (matching election map) */
	.thenightpatrol-card {
		background-color: #0099c4 !important; /* Slightly darker blue */
	}

	.thenightpatrol-card:hover {
		background-color: #00a4d1 !important; /* Light blue from election map */
	}

	/* Tony's card - Keep default or add custom color if needed */
	.tony-card {
		background-color: #b84d00 !important; /* Orange from election map */
	}

	.tony-card:hover {
		background-color: #d45a00 !important; /* Slightly lighter orange */
	}
</style>