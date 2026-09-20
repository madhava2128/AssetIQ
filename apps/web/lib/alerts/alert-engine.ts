import {
    evaluateAndFireAlerts as evalAlerts,
    getFiredAlerts as getAlerts,
    resetAlertHistory as resetAlerts
} from './alert-engine.js';

export interface Alert {
    id: string;
    dedupKey: string;
    surgery_id: string;
    surgery_code: string;
    procedure_name: string;
    operating_room: string;
    asset_id: string | null;
    asset_tag: string;
    asset_name: string;
    severity: 'CRITICAL' | 'WARNING';
    status_transition: 'NOT_READY' | 'AT_RISK';
    triggering_condition: string;
    recipients: ('biomedical_engineer' | 'hospital_admin')[];
    message: string;
    is_escalation: boolean;
    timestamp: string;
}

export function evaluateAndFireAlerts(assessment: any, now?: Date): Alert[] {
    return evalAlerts(assessment, now);
}

export function getFiredAlerts(): Alert[] {
    return getAlerts();
}

export function resetAlertHistory(): void {
    resetAlerts();
}
