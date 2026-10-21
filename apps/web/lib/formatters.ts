/**
 * AssetIQ — Plain Language Formatters & Status Standardizer
 */

export function formatRuleMessage(ruleCode: string | null | undefined): string {
    if (!ruleCode) return 'No issues detected';
    
    switch (ruleCode) {
        case 'RULE_1_STATUS_NOT_AVAILABLE':
            return 'Required equipment is currently under maintenance or repair';
        case 'RULE_2_MAINTENANCE_OVERDUE':
            return 'Assigned equipment has overdue preventive maintenance';
        case 'RULE_3_TYPE_MISMATCH':
            return 'Assigned equipment type does not match surgical requirement';
        case 'RULE_4_SCHEDULE_CONFLICT':
            return 'Assigned equipment is scheduled for another surgery at this time';
        case 'RULE_5_LOCATION_MISMATCH':
            return 'Assigned equipment is located in a different operating room';
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
        'CRITICAL': 'Critical',
        'IMPORTANT': 'Important',
        'ROUTINE': 'Routine',
    };

    if (map[value]) return map[value];

    // Fallback: title-case snake_case string
    return value
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

export function formatCurrencyINR(amount: number | null | undefined): string {
    const val = Number(amount || 0);
    return `₹${val.toLocaleString('en-IN')}`;
}

export function formatExecutiveCurrencyINR(amount: number | null | undefined): string {
    const val = Number(amount || 0);
    if (val >= 10000000) {
        return `₹${(val / 10000000).toFixed(2)} Crore`;
    }
    if (val >= 100000) {
        return `₹${(val / 100000).toFixed(1)} Lakhs`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
}

export interface ReadinessStatusTheme {
    status: 'READY' | 'AT_RISK' | 'NOT_READY' | 'NOT_CHECKED';
    label: string;
    shortLabel: string;
    glyph: string;
    badgeClass: string;
    bannerClass: string;
    borderClass: string;
    textClass: string;
}

export function getReadinessStatusTheme(status: string | null | undefined): ReadinessStatusTheme {
    const s = (status || '').toUpperCase();
    if (s === 'NOT_READY') {
        return {
            status: 'NOT_READY',
            label: 'Not Ready',
            shortLabel: 'Not Ready',
            glyph: '',
            badgeClass: 'bg-status-notready-bg text-status-notready-text border border-status-notready-solid',
            bannerClass: 'bg-status-notready-bg border border-status-notready-solid text-status-notready-text',
            borderClass: 'border-status-notready-solid',
            textClass: 'text-status-notready-text',
        };
    }
    if (s === 'AT_RISK') {
        return {
            status: 'AT_RISK',
            label: 'At Risk',
            shortLabel: 'At Risk',
            glyph: '',
            badgeClass: 'bg-status-atrisk-bg text-status-atrisk-text border border-status-atrisk-solid',
            bannerClass: 'bg-status-atrisk-bg border border-status-atrisk-solid text-status-atrisk-text',
            borderClass: 'border-status-atrisk-solid',
            textClass: 'text-status-atrisk-text',
        };
    }
    if (s === 'NOT_CHECKED' || s === 'NOT_YET_CHECKED' || s === 'UNCHECKED' || s === 'PENDING') {
        return {
            status: 'NOT_CHECKED',
            label: 'Not yet checked',
            shortLabel: 'Not yet checked',
            glyph: '',
            badgeClass: 'bg-status-neutral-bg text-status-neutral-text border border-status-neutral-solid',
            bannerClass: 'bg-status-neutral-bg border border-status-neutral-solid text-status-neutral-text',
            borderClass: 'border-status-neutral-solid',
            textClass: 'text-status-neutral-text',
        };
    }
    return {
        status: 'READY',
        label: 'Ready',
        shortLabel: 'Ready',
        glyph: '',
        badgeClass: 'bg-status-ready-bg text-status-ready-text border border-status-ready-solid',
        bannerClass: 'bg-status-ready-bg border border-status-ready-solid text-status-ready-text',
        borderClass: 'border-status-ready-solid',
        textClass: 'text-status-ready-text',
    };
}
