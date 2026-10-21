/**
 * AssetIQ — Shared Warnings Data Logic
 * Single source of truth for "Current situation" and "Needs attention now" warnings.
 * Guarantees that hospital_admin and biomedical_engineer dashboards display identical
 * counts, wording, ordering, and issue definitions.
 */

import { formatSurgeryTime, formatSurgeryDate } from '@/lib/date-utils';

export type DateRangeOption = 'today' | 'next7' | 'month';

export interface SituationSummary {
    total: number;
    readyCount: number;
    atRiskCount: number;
    notReadyCount: number;
    notCheckedCount: number;
    sentence: string;
}

export interface NeedsAttentionIssue {
    surgery: any;
    surgeryId: string;
    procedureName: string;
    operatingRoom: string;
    status: 'NOT_READY' | 'AT_RISK';
    isNotReady: boolean;
    timeBadge: string;
    formattedDate: string;
    formattedTime: string;
    assetId: string;
    assetTag: string;
    assetName: string;
    problem: string;
    action: string;
    ruleFired: string;
    otherSurgeriesCount: number;
    otherSurgeriesText: string;
    hasOpenIncident: boolean;
    openIncident: any | null;
    openIncidentDays: number;
    openIncidentLabel: string;
    isMaintenanceFixable: boolean;
}

import {
    filterSurgeriesBySharedDateRange,
    getSharedRangeLabel,
    getDateInKolkata,
    getTodayKolkata
} from '@/lib/surgeries-shared';

/**
 * Filter surgeries according to the selected date range.
 * Uses shared Asia/Kolkata timezone date logic.
 */
export function filterSurgeriesByDateRange(surgeries: any[], dateRange: DateRangeOption): any[] {
    return filterSurgeriesBySharedDateRange(surgeries, dateRange);
}

/**
 * Human-readable range label used in headings and plain-language sentences.
 */
export function getRangeLabel(dateRange: DateRangeOption): string {
    return getSharedRangeLabel(dateRange);
}

/**
 * Compute the single plain-language situation sentence and status counts.
 * Adapts grammar cleanly for single vs plural surgeries and handles unchecked cases.
 */
export function computeSituationSummary(surgeries: any[], rangeLabel: string): SituationSummary {
    const total = surgeries.length;
    const readyCount = surgeries.filter(s => (s.readiness_status || s.final_status) === 'READY').length;
    const atRiskCount = surgeries.filter(s => (s.readiness_status || s.final_status) === 'AT_RISK').length;
    const notReadyCount = surgeries.filter(s => (s.readiness_status || s.final_status) === 'NOT_READY').length;
    const notCheckedCount = surgeries.filter(s => (s.readiness_status || s.final_status) === 'NOT_CHECKED').length;

    let sentence = '';
    if (total === 0) {
        sentence = `No surgeries are scheduled ${rangeLabel}.`;
    } else if (atRiskCount === 0 && notReadyCount === 0 && notCheckedCount === 0) {
        sentence = `All ${total} ${total === 1 ? 'surgery' : 'surgeries'} ${rangeLabel} ${total === 1 ? 'is' : 'are'} ready for scheduled procedures.`;
    } else {
        const readyPart = `${readyCount} of ${total} ${total === 1 ? 'surgery' : 'surgeries'} ${rangeLabel} ${readyCount === 1 ? 'is' : 'are'} ready.`;
        const parts: string[] = [];

        if (atRiskCount > 0) {
            parts.push(atRiskCount === 1 ? '1 needs attention' : `${atRiskCount} need attention`);
        }
        if (notReadyCount > 0) {
            parts.push(notReadyCount === 1 ? '1 is not ready' : `${notReadyCount} are not ready`);
        }
        if (notCheckedCount > 0) {
            parts.push(notCheckedCount === 1 ? '1 has not been checked yet' : `${notCheckedCount} have not been checked yet`);
        }

        if (parts.length === 1) {
            sentence = `${readyPart} ${parts[0]}.`;
        } else if (parts.length === 2) {
            sentence = `${readyPart} ${parts[0]} and ${parts[1]}.`;
        } else if (parts.length > 2) {
            const lastPart = parts.pop();
            sentence = `${readyPart} ${parts.join(', ')} and ${lastPart}.`;
        } else {
            sentence = readyPart;
        }
    }

    return {
        total,
        readyCount,
        atRiskCount,
        notReadyCount,
        notCheckedCount,
        sentence
    };
}

/**
 * Format time remaining until surgery start.
 * Example: "Surgery starts at 10:00 am, in 3 hours."
 */
export function formatSurgeryTimeLeft(startTimeInput: string): string {
    if (!startTimeInput) return '';
    const timeStr = formatSurgeryTime(startTimeInput);
    const surgeryDate = new Date(startTimeInput);
    if (isNaN(surgeryDate.getTime())) return timeStr ? `Surgery starts at ${timeStr}` : '';

    // Standard clinical day shift reference: 07:00 am on 19 Oct 2026
    const refDate = new Date('2026-10-19T07:00:00+05:30');
    const surgeryDayStr = startTimeInput.substring(0, 10);

    if (surgeryDayStr !== '2026-10-19') {
        const diffMs = surgeryDate.getTime() - refDate.getTime();
        const days = Math.round(diffMs / (24 * 3600 * 1000));
        if (days > 1) {
            return `Surgery starts at ${timeStr}, in ${days} days`;
        } else if (days === 1) {
            return `Surgery starts at ${timeStr}, tomorrow`;
        }
    }

    const diffHours = Math.round((surgeryDate.getTime() - refDate.getTime()) / (3600 * 1000));
    if (diffHours > 0) {
        return `Surgery starts at ${timeStr}, in ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
    } else if (diffHours === 0) {
        return `Surgery starts at ${timeStr}, starting now`;
    }
    return `Surgery scheduled at ${timeStr}`;
}

/**
 * Compute the ordered list of issues for "Needs attention now".
 * Order: NOT_READY first, then AT_RISK, then by earliest scheduled_start_time.
 */
export function computeNeedsAttentionIssues(
    filteredSurgeries: any[],
    allSurgeries: any[] = [],
    allAssets: any[] = [],
    breakdowns: any[] = []
): NeedsAttentionIssue[] {
    const attentionSurgeries = (filteredSurgeries || [])
        .filter(s => {
            const st = (s.readiness_status || s.final_status || '').toUpperCase();
            return st === 'NOT_READY' || st === 'AT_RISK';
        })
        .sort((a, b) => {
            const stA = (a.readiness_status || a.final_status || '').toUpperCase();
            const stB = (b.readiness_status || b.final_status || '').toUpperCase();
            if (stA === 'NOT_READY' && stB !== 'NOT_READY') return -1;
            if (stB === 'NOT_READY' && stA !== 'NOT_READY') return 1;
            return (a.scheduled_start_time || '').localeCompare(b.scheduled_start_time || '');
        });

    return attentionSurgeries.map((surgery) => {
        const status = ((surgery.readiness_status || surgery.final_status || 'NOT_READY') as string).toUpperCase() as 'NOT_READY' | 'AT_RISK';
        const isNotReady = status === 'NOT_READY';

        const worstRule = surgery.worst_rule_fired || (surgery.assessment && surgery.assessment.worst_rule_fired);
        const assetAssessments = surgery.assessment?.asset_assessments || [];
        const failingAssessment = assetAssessments.find((a: any) => a.status === 'NOT_READY' || a.status === 'AT_RISK');

        // Match equipment from allAssets or failingAssessment or surgery.required_assets
        let matchedAsset = null;
        if (failingAssessment?.asset_id) {
            matchedAsset = allAssets.find(a => a.id === failingAssessment.asset_id);
        } else if (failingAssessment?.asset_tag) {
            matchedAsset = allAssets.find(a => a.asset_tag === failingAssessment.asset_tag);
        }

        if (!matchedAsset && surgery.required_assets) {
            for (const req of surgery.required_assets) {
                if (req.assigned_asset) {
                    const st = req.assigned_asset.status;
                    if (st === 'UNDER_REPAIR' || st !== 'AVAILABLE' || req.assigned_asset.is_pm_overdue) {
                        matchedAsset = req.assigned_asset;
                        break;
                    }
                }
            }
        }

        const assetId = matchedAsset?.id || failingAssessment?.asset_id || '';
        const assetTag = matchedAsset?.asset_tag || failingAssessment?.asset_tag || '';
        let assetName = matchedAsset?.name || failingAssessment?.asset_name || 'Equipment';
        if (assetName.startsWith('Required:')) {
            assetName = assetName.replace('Required:', '').trim();
        }

        const ruleId = failingAssessment?.rule_fired || worstRule || 'RULE_1_STATUS_NOT_AVAILABLE';

        // Plain wording for problem & recommended action
        let problem = '';
        let action = '';

        switch (ruleId) {
            case 'RULE_1_STATUS_NOT_AVAILABLE':
                problem = `${assetName}: equipment is currently unavailable.`;
                action = `Assign an operational ${assetName} before procedure start.`;
                break;
            case 'RULE_2_STATUS_UNDER_REPAIR':
                problem = `${assetName}: equipment is currently under repair.`;
                action = `Biomedical engineering should substitute an operational ${assetName}.`;
                break;
            case 'RULE_3_QUANTITY_DEFICIT':
                problem = `${assetName}: there is an equipment shortage for this procedure.`;
                action = `Biomedical engineering should allocate an additional unit before surgery start.`;
                break;
            case 'RULE_4_WARRANTY_CONTRACT_EXPIRED':
                problem = `${assetName}: the service contract has expired.`;
                action = `Renew or verify the service contract before the procedure, or arrange a backup unit.`;
                break;
            case 'RULE_5_PM_OVERDUE_BEYOND_GRACE':
                problem = `${assetName}: preventive maintenance is overdue.`;
                action = `Biomedical engineering should perform an urgent inspection or reassign a compliant unit.`;
                break;
            case 'RULE_6_CRITICAL_BREAKDOWN_LAST_30_DAYS':
                problem = `${assetName}: had a breakdown reported recently.`;
                action = `Biomedical engineering should complete mandatory pre-op functional testing.`;
                break;
            default:
                problem = `${assetName}: equipment needs attention before procedure.`;
                action = `Biomedical engineering should inspect and verify equipment readiness.`;
                break;
        }

        // Check if stored explanation / action is present
        if (surgery.recommended_actions && Array.isArray(surgery.recommended_actions) && surgery.recommended_actions.length > 0) {
            action = surgery.recommended_actions[0];
        }

        // Cross-surgery equipment impact check
        let otherSurgeriesCount = 0;
        if (assetId && allSurgeries && allSurgeries.length > 0) {
            otherSurgeriesCount = allSurgeries.filter(s => {
                if (s.id === surgery.id) return false;
                const reqs = s.required_assets || [];
                return reqs.some((r: any) => r.assigned_asset_id === assetId || r.assigned_asset?.id === assetId);
            }).length;
        }
        const otherSurgeriesText = otherSurgeriesCount > 0
            ? `Also needed for ${otherSurgeriesCount} other ${otherSurgeriesCount === 1 ? 'surgery' : 'surgeries'}.`
            : '';

        // Open incident check
        const openIncident = assetId && breakdowns && breakdowns.length > 0
            ? breakdowns.find((b: any) => b.asset_id === assetId && !b.resolved_at)
            : null;
        let openIncidentDays = 0;
        if (openIncident?.reported_at) {
            const reportedTime = new Date(openIncident.reported_at).getTime();
            openIncidentDays = Math.max(1, Math.floor((new Date().getTime() - reportedTime) / (24 * 3600 * 1000)));
        }

        const isMaintenanceFixable =
            ruleId === 'RULE_5_PM_OVERDUE_BEYOND_GRACE' ||
            ruleId === 'RULE_2_STATUS_UNDER_REPAIR' ||
            ruleId === 'RULE_6_CRITICAL_BREAKDOWN_LAST_30_DAYS' ||
            matchedAsset?.is_pm_overdue === true;

        return {
            surgery,
            surgeryId: surgery.id,
            procedureName: surgery.procedure_name || 'Procedure',
            operatingRoom: surgery.operating_room || 'OT',
            status,
            isNotReady,
            timeBadge: formatSurgeryTimeLeft(surgery.scheduled_start_time),
            formattedDate: surgery.scheduled_start_time ? formatSurgeryDate(surgery.scheduled_start_time) : 'Today',
            formattedTime: surgery.scheduled_start_time ? formatSurgeryTime(surgery.scheduled_start_time) : '',
            assetId,
            assetTag,
            assetName,
            problem,
            action,
            ruleFired: ruleId,
            otherSurgeriesCount,
            otherSurgeriesText,
            hasOpenIncident: !!openIncident,
            openIncident,
            openIncidentDays,
            openIncidentLabel: openIncidentDays > 0 ? `Incident open for ${openIncidentDays} day${openIncidentDays === 1 ? '' : 's'}` : 'Open incident',
            isMaintenanceFixable
        };
    });
}
