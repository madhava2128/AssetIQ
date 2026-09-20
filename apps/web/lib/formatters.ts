/**
 * AssetIQ — Plain Language Formatters & Status Standardizer
 */

export function formatRuleMessage(ruleCode: string | null | undefined): string {
    if (!ruleCode) return 'No issues detected';
    
    switch (ruleCode) {
        case 'RULE_1_STATUS_NOT_AVAILABLE':
            return 'Required equipment is currently under maintenance or repair';
        case 'RULE_2_MAINTENANCE_OVERDUE':
            return 'Assigned equipment has overdue preventive maintenance (PM)';
        case 'RULE_3_TYPE_MISMATCH':
            return 'Assigned equipment type does not match surgical requirement';
        case 'RULE_4_SCHEDULE_CONFLICT':
            return 'Assigned equipment is double-booked for another surgery at this time';
        case 'RULE_5_LOCATION_MISMATCH':
            return 'Assigned equipment is located in a different operating suite';
        default:
            return ruleCode.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }
}

export function formatEnumValue(value: string | null | undefined): string {
    if (!value) return 'N/A';

    const map: Record<string, string> = {
        // Surgery Types & Procedures
        'GENERAL_SURGERY': 'General Surgery',
        'CARDIAC_SURGERY': 'Cardiac Surgery',
        'ORTHOPEDIC': 'Orthopedic Surgery',
        'NEUROSURGERY': 'Neurosurgery',
        'VASCULAR': 'Vascular Surgery',
        'OPHTHALMIC': 'Ophthalmic Surgery',

        // Surgery Statuses
        'SCHEDULED': 'Scheduled',
        'IN_PROGRESS': 'In Progress',
        'COMPLETED': 'Completed',
        'CANCELLED': 'Cancelled',

        // Equipment Categories
        'ANESTHESIA_MACHINE': 'Anesthesia Machine',
        'LAPAROSCOPIC_TOWER': 'Laparoscopic Tower',
        'CARM_FLUOROSCOPY': 'C-Arm Fluoroscopy',
        'SURGICAL_MONITOR': 'Surgical Monitor',
        'ELECTROSURGICAL_UNIT': 'Electrosurgical Unit',

        // Asset Statuses
        'AVAILABLE': 'Available',
        'IN_USE': 'In Use',
        'UNDER_MAINTENANCE': 'Under Maintenance',
        'UNDER_REPAIR': 'Under Repair',
        'RETIRED': 'Retired',

        // Criticality
        'CRITICAL': 'Critical Level 1',
        'IMPORTANT': 'Important Level 2',
        'ROUTINE': 'Routine Level 3',
    };

    if (map[value]) return map[value];

    // Fallback: title-case snake_case string
    return value
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

export interface ReadinessStatusTheme {
    status: 'READY' | 'AT_RISK' | 'NOT_READY';
    label: string;
    shortLabel: string;
    glyph: string;
    badgeClass: string;
    bannerClass: string;
    borderClass: string;
    textClass: string;
}

export function getReadinessStatusTheme(status: string | null | undefined): ReadinessStatusTheme {
    const s = (status || 'READY').toUpperCase();
    if (s === 'NOT_READY') {
        return {
            status: 'NOT_READY',
            label: 'NOT READY — Critical Blocker',
            shortLabel: 'NOT READY',
            glyph: '🛑',
            badgeClass: 'bg-rose-950/70 text-rose-300 border border-rose-600',
            bannerClass: 'bg-rose-950/40 border-rose-500/60 text-rose-200',
            borderClass: 'border-rose-600',
            textClass: 'text-rose-400',
        };
    }
    if (s === 'AT_RISK') {
        return {
            status: 'AT_RISK',
            label: 'AT RISK — PM/Inspection Due',
            shortLabel: 'AT RISK',
            glyph: '⚠️',
            badgeClass: 'bg-amber-950/70 text-amber-300 border border-amber-600',
            bannerClass: 'bg-amber-950/40 border-amber-500/60 text-amber-200',
            borderClass: 'border-amber-600',
            textClass: 'text-amber-400',
        };
    }
    return {
        status: 'READY',
        label: 'READY — Cleared for Surgery',
        shortLabel: 'READY',
        glyph: '✓',
        badgeClass: 'bg-emerald-950/70 text-emerald-300 border border-emerald-600',
        bannerClass: 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200',
        borderClass: 'border-emerald-600',
        textClass: 'text-emerald-400',
    };
}
