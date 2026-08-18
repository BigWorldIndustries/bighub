import type { AvailabilityStatus } from './config';

export interface OlympicsNation {
	id: string;
	name: string;
	seed?: boolean;
	createdBy?: string;
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
	games: string[];
	availability: Record<string, AvailabilityStatus>;
	entryAmount: number;
	paymentCode?: string;
	paymentStatus: 'pending' | 'paid';
	paidAmount?: number;
	kofiTransactionId?: string;
	paidAt?: { _seconds?: number; seconds?: number } | string;
}

export interface OlympicsSubmission {
	discordUserId: string;
	discordUsername: string;
	form_data: OlympicsFormData;
	submittedAt?: { _seconds?: number; seconds?: number } | string;
}
