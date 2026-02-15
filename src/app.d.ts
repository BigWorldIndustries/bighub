// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	interface Locals {
		discordUser?: {
			id: string;
			username: string;
			avatar: string | null;
		};
	}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
}

// Augment module declarations for environment variables
declare module '$env/static/private' {
	export const DISCORD_CLIENT_ID: string;
	export const DISCORD_CLIENT_SECRET: string;
	export const DISCORD_REDIRECT_URI: string;
	export const AUTH_SECRET: string;
	export const FIREBASE_STORAGEBUCKET: string;
	export const FIREBASE_SERVICE_KEY: string;
}
