const { evaluateAndFireAlerts, getFiredAlerts, resetAlertHistory } = require('../../lib/alerts/alert-engine');
const { computeReportStatistics } = require('../../lib/reports/pdf-generator');

describe('Stage 8 — Alerts & PDF Reports Unit Tests', () => {
    beforeEach(() => {
        resetAlertHistory();
    });

    test('Acceptance Criterion 1: Alert fires exactly once for newly NOT_READY surgery; re-running within 24h suppresses duplicates', () => {
        const notReadyAssessment = {
            surgery_id: 'surg-alert-101',
            surgery_code: 'SURG-ALERT-01',
            procedure_name: 'Cardiac Bypass',
            operating_room: 'OT-1',
            final_status: 'NOT_READY',
            worst_rule_fired: 'RULE_2_STATUS_UNDER_REPAIR',
            asset_assessments: [
                {
                    asset_id: 'ast-repair-01',
                    asset_tag: 'AST-REPAIR-01',
                    asset_name: 'Anesthesia Machine',
                    status: 'NOT_READY',
                    rule_fired: 'RULE_2_STATUS_UNDER_REPAIR',
                    explanation: 'Under Repair'
                }
            ]
        };

        const now = new Date('2026-09-18T10:00:00Z');

        // First execution -> Fires alert exactly once
        const alerts1 = evaluateAndFireAlerts(notReadyAssessment, now);
        expect(alerts1.length).toBe(1);
        expect(alerts1[0].severity).toBe('CRITICAL');
        expect(alerts1[0].recipients).toContain('biomedical_engineer');
        expect(alerts1[0].recipients).toContain('hospital_admin');

        // Re-run same check 2 hours later (within 24h window) -> Suppresses duplicate alert
        const twoHoursLater = new Date('2026-09-18T12:00:00Z');
        const alerts2 = evaluateAndFireAlerts(notReadyAssessment, twoHoursLater);
        expect(alerts2.length).toBe(0);

        // Total fired alerts in store remains 1
        expect(getFiredAlerts().length).toBe(1);
    });

    test('Acceptance Criterion 2: Status escalation from AT_RISK -> NOT_READY produces a new alert (dedup does not over-suppress)', () => {
        const surgeryId = 'surg-escalate-202';

        // Stage 1: Asset evaluates to AT_RISK (PM overdue)
        const atRiskAssessment = {
            surgery_id: surgeryId,
            surgery_code: 'SURG-ESCALATE-02',
            procedure_name: 'Orthopedic Knee Surgery',
            operating_room: 'OT-2',
            final_status: 'AT_RISK',
            worst_rule_fired: 'RULE_5_PM_OVERDUE_BEYOND_GRACE',
            asset_assessments: [
                {
                    asset_id: 'ast-overdue-02',
                    asset_tag: 'AST-OVERDUE-02',
                    asset_name: 'Orthopedic Drill',
                    status: 'AT_RISK',
                    rule_fired: 'RULE_5_PM_OVERDUE_BEYOND_GRACE',
                    explanation: 'PM Overdue beyond 7-day grace'
                }
            ]
        };

        const t1 = new Date('2026-09-18T10:00:00Z');
        const alerts1 = evaluateAndFireAlerts(atRiskAssessment, t1);
        expect(alerts1.length).toBe(1);
        expect(alerts1[0].severity).toBe('WARNING');
        expect(alerts1[0].recipients).toEqual(['biomedical_engineer']);

        // Stage 2: 3 hours later, asset status worsens to UNDER_REPAIR (NOT_READY)
        const notReadyAssessment = {
            surgery_id: surgeryId,
            surgery_code: 'SURG-ESCALATE-02',
            procedure_name: 'Orthopedic Knee Surgery',
            operating_room: 'OT-2',
            final_status: 'NOT_READY',
            worst_rule_fired: 'RULE_2_STATUS_UNDER_REPAIR',
            asset_assessments: [
                {
                    asset_id: 'ast-overdue-02',
                    asset_tag: 'AST-OVERDUE-02',
                    asset_name: 'Orthopedic Drill',
                    status: 'NOT_READY',
                    rule_fired: 'RULE_2_STATUS_UNDER_REPAIR',
                    explanation: 'Asset Under Repair'
                }
            ]
        };

        const t2 = new Date('2026-09-18T13:00:00Z');
        const alerts2 = evaluateAndFireAlerts(notReadyAssessment, t2);

        // Deduplication MUST NOT over-suppress -> Fires new CRITICAL escalation alert!
        expect(alerts2.length).toBe(1);
        expect(alerts2[0].severity).toBe('CRITICAL');
        expect(alerts2[0].is_escalation).toBe(true);
        expect(alerts2[0].recipients).toContain('hospital_admin');

        expect(getFiredAlerts().length).toBe(2);
    });

    test('Acceptance Criterion 3: PDF Report numbers match manual queries against readiness data (spot-check 3 figures)', () => {
        const mockSurgeries = [
            { id: 's1', surgery_code: 'S1', readiness_status: 'READY' },
            { id: 's2', surgery_code: 'S2', readiness_status: 'READY' },
            { id: 's3', surgery_code: 'S3', readiness_status: 'AT_RISK' },
            { id: 's4', surgery_code: 'S4', readiness_status: 'NOT_READY' }
        ];

        const mockAssets = [
            { id: 'a1', status: 'AVAILABLE', is_pm_overdue: false },
            { id: 'a2', status: 'UNDER_REPAIR', is_pm_overdue: false },
            { id: 'a3', status: 'AVAILABLE', is_pm_overdue: true },
            { id: 'a4', status: 'AVAILABLE', is_pm_overdue: false }
        ];

        const stats = computeReportStatistics(mockSurgeries, mockAssets, []);

        // Spot-check 1: Total surgeries & READY percentage
        expect(stats.totalSurgeries).toBe(4);
        expect(stats.readyCount).toBe(2);
        expect(stats.readyPct).toBe('50.0');

        // Spot-check 2: NOT_READY count & percentage
        expect(stats.notReadyCount).toBe(1);
        expect(stats.notReadyPct).toBe('25.0');

        // Spot-check 3: Equipment fleet metrics (Under Repair & PM Overdue)
        expect(stats.totalAssets).toBe(4);
        expect(stats.underRepairAssets).toBe(1);
        expect(stats.pmOverdueAssets).toBe(1);
    });
});
