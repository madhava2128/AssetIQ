/**
 * AssetIQ — Date and Time Utilities for Surgeries Calendar
 * Strictly enforces Asia/Kolkata timezone, Monday week start, "19 Oct 2026", 12-hour am/pm format.
 */

export const TIMEZONE = 'Asia/Kolkata';

// Operating Rooms supported in the surgical suite
export const OPERATING_ROOMS = ['OR-1', 'OR-2', 'OR-3', 'OR-4', 'OR-5', 'OR-6'];

// Time axis hours: 7:00 to 20:00
export const CALENDAR_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

/**
 * Format date as "19 Oct 2026" in Asia/Kolkata timezone
 */
export function formatSurgeryDate(dateInput: string | Date): string {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';

    return new Intl.DateTimeFormat('en-GB', {
        timeZone: TIMEZONE,
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(d);
}

/**
 * Format time as "08:30 am" in Asia/Kolkata timezone
 */
export function formatSurgeryTime(dateInput: string | Date): string {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';

    return new Intl.DateTimeFormat('en-US', {
        timeZone: TIMEZONE,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(d).toLowerCase();
}

/**
 * Format range as "08:30 am – 11:30 am"
 */
export function formatSurgeryTimeRange(startInput: string | Date, endInput: string | Date): string {
    const startStr = formatSurgeryTime(startInput);
    const endStr = formatSurgeryTime(endInput);
    if (!startStr) return '';
    if (!endStr) return startStr;
    return `${startStr} – ${endStr}`;
}

/**
 * Month heading, e.g. "October 2026"
 */
export function formatMonthHeading(dateInput: string | Date): string {
    const d = new Date(dateInput);
    return new Intl.DateTimeFormat('en-GB', {
        timeZone: TIMEZONE,
        month: 'long',
        year: 'numeric'
    }).format(d);
}

/**
 * Week range heading, e.g. "19 Oct – 25 Oct 2026"
 */
export function formatWeekHeading(weekStart: Date): string {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startPart = new Intl.DateTimeFormat('en-GB', {
        timeZone: TIMEZONE,
        day: 'numeric',
        month: 'short'
    }).format(weekStart);

    const endPart = new Intl.DateTimeFormat('en-GB', {
        timeZone: TIMEZONE,
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(weekEnd);

    return `${startPart} – ${endPart}`;
}

/**
 * Check if two dates represent the same calendar day in Asia/Kolkata timezone
 */
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
    const s1 = formatSurgeryDate(date1);
    const s2 = formatSurgeryDate(date2);
    return s1 === s2 && s1.length > 0;
}

/**
 * Check if date is today in Asia/Kolkata timezone
 */
export function isTodayInKolkata(dateInput: string | Date): boolean {
    return isSameDay(dateInput, new Date());
}

/**
 * Returns Monday of the week containing the specified date
 */
export function getMondayOfWeek(d: Date): Date {
    const date = new Date(d);
    // getDay(): 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

/**
 * Returns 7 days for the week (Monday to Sunday)
 */
export function getWeekDays(baseDate: Date): Date[] {
    const monday = getMondayOfWeek(baseDate);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const nextDay = new Date(monday);
        nextDay.setDate(monday.getDate() + i);
        days.push(nextDay);
    }
    return days;
}

/**
 * Generates weeks for Month view grid, where weeks start on Monday.
 * Returns array of weeks, where each week is array of 7 Dates.
 */
export function getMonthGrid(year: number, monthIndex: number): Date[][] {
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

    const startMonday = getMondayOfWeek(firstDayOfMonth);
    
    // Find the end Sunday
    const lastDayWeekday = lastDayOfMonth.getDay();
    const daysUntilSunday = lastDayWeekday === 0 ? 0 : 7 - lastDayWeekday;
    const endSunday = new Date(lastDayOfMonth);
    endSunday.setDate(lastDayOfMonth.getDate() + daysUntilSunday);
    endSunday.setHours(23, 59, 59, 999);

    const weeks: Date[][] = [];
    let currentDay = new Date(startMonday);

    while (currentDay <= endSunday) {
        const week: Date[] = [];
        for (let i = 0; i < 7; i++) {
            week.push(new Date(currentDay));
            currentDay.setDate(currentDay.getDate() + 1);
        }
        weeks.push(week);
    }

    return weeks;
}

/**
 * Helper to compute fractional hour position for time-axis placement (e.g., 08:30 -> 8.5)
 */
export function getTimeInHours(dateInput: string | Date): number {
    const d = new Date(dateInput);
    // Format to Asia/Kolkata hours and minutes
    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: TIMEZONE,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    });
    const parts = formatter.formatToParts(d);
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
    return hour + minute / 60;
}
