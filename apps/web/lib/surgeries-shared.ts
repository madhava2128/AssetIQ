/**
 * AssetIQ — Single Shared Read Path & Date Range Utilities for Surgeries
 * Ensures ot_admin, biomedical_engineer, and hospital_admin panels use identical
 * queries, status values, date ranges (Asia/Kolkata), and "today" definitions.
 */

import { formatSurgeryDate, formatMonthHeading, TIMEZONE } from '@/lib/date-utils';

export type DateRangeOption = 'today' | 'next7' | 'month' | 'all';

/**
 * Extract YYYY-MM-DD formatted date string in Asia/Kolkata timezone.
 * Eliminates UTC substring misalignment bugs.
 */
export function getDateInKolkata(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(d);
}

/**
 * Current calendar date in Asia/Kolkata timezone as YYYY-MM-DD
 */
export function getTodayKolkata(): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date());
}

/**
 * Filter surgeries consistently according to the selected date range in Asia/Kolkata timezone.
 * Used by hospital_admin dashboard, biomedical_engineer dashboard, and surgeries lists/calendars.
 */
export function filterSurgeriesBySharedDateRange(
    surgeries: any[],
    dateRange: DateRangeOption,
    customBaseDate?: string
): any[] {
    const todayStr = customBaseDate || getTodayKolkata();

    const todayDate = new Date(`${todayStr}T00:00:00+05:30`);
    const next7Date = new Date(todayDate);
    next7Date.setDate(next7Date.getDate() + 6);
    const next7EndStr = getDateInKolkata(next7Date);

    const yearMonth = todayStr.substring(0, 7); // e.g. "2026-10"

    return (surgeries || []).filter(s => {
        if (!s.scheduled_start_time) return true;
        const surgeryDateStr = getDateInKolkata(s.scheduled_start_time);

        if (dateRange === 'today') {
            return surgeryDateStr === todayStr;
        }
        if (dateRange === 'next7') {
            return surgeryDateStr >= todayStr && surgeryDateStr <= next7EndStr;
        }
        if (dateRange === 'month') {
            return surgeryDateStr.startsWith(yearMonth);
        }
        return true;
    });
}

/**
 * Human-readable range label used in headings and plain-language summary sentences.
 */
export function getSharedRangeLabel(dateRange: DateRangeOption, customBaseDate?: string): string {
    const todayStr = customBaseDate || getTodayKolkata();
    const todayDate = new Date(`${todayStr}T00:00:00+05:30`);

    switch (dateRange) {
        case 'today':
            return `today (${formatSurgeryDate(todayDate)})`;
        case 'next7': {
            const next7Date = new Date(todayDate);
            next7Date.setDate(next7Date.getDate() + 6);
            return `over the next 7 days (${formatSurgeryDate(todayDate)}–${formatSurgeryDate(next7Date)})`;
        }
        case 'month':
            return `this month (${formatMonthHeading(todayDate)})`;
        case 'all':
            return 'across all dates';
        default:
            return `today (${formatSurgeryDate(todayDate)})`;
    }
}

/**
 * Standardize surgery status and readiness status.
 * Unchecked surgeries consistently return "NOT_CHECKED" ("Not yet checked").
 */
export function normalizeReadinessStatus(status: string | null | undefined): 'READY' | 'AT_RISK' | 'NOT_READY' | 'NOT_CHECKED' {
    if (!status) return 'NOT_CHECKED';
    const s = status.toUpperCase().trim();
    if (s === 'NOT_READY') return 'NOT_READY';
    if (s === 'AT_RISK') return 'AT_RISK';
    if (s === 'READY') return 'READY';
    return 'NOT_CHECKED';
}
