import {
	AVAILABILITY_CYCLE,
	AVAILABILITY_END,
	AVAILABILITY_START,
	type AvailabilityStatus
} from './config';

export interface AvailabilityDay {
	date: string;
	weekday: string;
	shortWeekday: string;
	monthDay: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseUtcDate(isoDate: string): Date {
	const [year, month, day] = isoDate.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

export function getAvailabilityDays(): AvailabilityDay[] {
	const days: AvailabilityDay[] = [];
	const start = parseUtcDate(AVAILABILITY_START);
	const end = parseUtcDate(AVAILABILITY_END);

	for (let time = start.getTime(); time <= end.getTime(); time += 24 * 60 * 60 * 1000) {
		const d = new Date(time);
		const date = d.toISOString().slice(0, 10);
		days.push({
			date,
			weekday: WEEKDAYS[d.getUTCDay()].toUpperCase(),
			shortWeekday: WEEKDAYS[d.getUTCDay()].toUpperCase(),
			monthDay: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
		});
	}

	return days;
}

export function defaultAvailability(): Record<string, AvailabilityStatus> {
	const availability: Record<string, AvailabilityStatus> = {};
	for (const day of getAvailabilityDays()) {
		availability[day.date] = 'unavailable';
	}
	return availability;
}

export function allDaysAvailable(): Record<string, AvailabilityStatus> {
	const availability: Record<string, AvailabilityStatus> = {};
	for (const day of getAvailabilityDays()) {
		availability[day.date] = 'available';
	}
	return availability;
}

export function cycleAvailability(status: AvailabilityStatus): AvailabilityStatus {
	return AVAILABILITY_CYCLE[status];
}

export const WEEKDAY_HEADERS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
