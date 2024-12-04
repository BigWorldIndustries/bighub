<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center">
		<!-- <h2 class="h2">Big World</h2> -->
		<!-- Animated Logo -->
		
		<section class="img-bg" />
		<img class='logo' src="/images/bigworld-logo.svg" width="50%" alt="fotomize" />
		
        <div class="button-container">
            <a class="btn variant-filled" href="" target="_self" rel="noreferrer">
                Vote for Big World President
            </a>
            <a class="btn variant-filled" href="" target="_self" rel="noreferrer">
                View Live Results Map
            </a>
        </div>
	</div>
</div>

<style lang="postcss">
	.button-container {
        display: flex;
        flex-direction: column; /* Default to vertical layout */
        align-items: center; /* Center buttons vertically */
        width: 100%; /* Ensure container takes full width */
    }

    @media (min-width: 768px) { /* Adjust breakpoint as necessary */
        .button-container {
            flex-direction: row; /* Horizontal layout on wider screens */
            justify-content: center; /* Center buttons horizontally */
            gap: 10px; /* Optional: adds space between buttons */
        }
    }

    .btn {
        width: 90%; /* Adjust width to ensure it fits within the screen */
        margin: 5px; /* Adds margin around buttons */
        text-align: center;
    }

	figure {
		@apply flex relative flex-col;
	}
	figure svg,
	.img-bg {
		@apply w-96 h-96 md:w-96 md:h-96;
	}
	.img-bg {
		@apply absolute z-[-1] rounded-full blur-[50px] transition-all;
		animation: pulse 5s cubic-bezier(0, 0, 0, 0.5) infinite,
			glow 5s linear infinite;
	}
	@keyframes glow {
		0% {
			@apply bg-primary-400/50;
		}
		33% {
			@apply bg-secondary-400/50;
		}
		66% {
			@apply bg-tertiary-400/50;
		}
		100% {
			@apply bg-primary-400/50;
		}
	}
	@keyframes pulse {
		50% {
			transform: scale(1.5);
		}
	}
</style>
