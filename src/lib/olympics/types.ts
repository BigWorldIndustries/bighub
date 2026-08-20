import type { AvailabilityStatus } from './config';
import type { BadgeId } from './games';
import type { OlympicsTierId } from './tiers';

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
	badges?: BadgeId[];
	note?: string;
	imageUrl?: string;
}

export interface OlympicsKofiPayment {
	id: string;
	amount: number;
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
	payments?: OlympicsKofiPayment[];
	referredByUsername?: string;
	referredByUserId?: string;
	referralCount?: number;
	xp?: number;
	tier?: OlympicsTierId;
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

export interface OlympicsReferrerPreview {
	username: string;
	nationId?: string;
	nationName?: string;
}

export interface OlympicsReferralLock {
	referrerUsername: string;
	referrerUsernameLower: string;
	referrerUserId?: string | null;
	credited: boolean;
	createdAt?: unknown;
}
