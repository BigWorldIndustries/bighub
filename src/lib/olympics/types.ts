import type { AvailabilityStatus } from './config';

export interface OlympicsNation {
	id: string;
	name: string;
	seed?: boolean;
	createdBy?: string;
	captain?: string;
	colorScheme?: string;
	emojis?: string[];
}

export interface OlympicsSuggestedGame {
	id: string;
	title: string;
	createdBy?: string;
	hidden?: boolean;
}

export interface OlympicsFormData {
	email?: string;
	phone?: string;
	nationId: string;
	nationName: string;
	createdNation: boolean;
	colorScheme?: string;
	emojis?: string[];
	games: string[];
	availability: Record<string, AvailabilityStatus>;
	anyDateWithNotice?: boolean;
	entryAmount: number;
	paymentCode?: string;
	paymentStatus: 'pending' | 'paid';
	paidAmount?: number;
	kofiTransactionId?: string;
	paidAt?: { _seconds?: number; seconds?: number } | string;
}

export interface OlympicsDiscordAnnounce {
	submittedAt?: { _seconds?: number; seconds?: number } | string;
	paidTransactionIds?: string[];
}

export interface OlympicsSubmission {
	discordUserId: string;
	discordUsername: string;
	form_data: OlympicsFormData;
	submittedAt?: { _seconds?: number; seconds?: number } | string;
	discordAnnounce?: OlympicsDiscordAnnounce;
}
