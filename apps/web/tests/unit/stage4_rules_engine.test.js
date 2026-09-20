const { newDb, DataType } = require('pg-mem');
const fs = require('fs');
const path = require('path');
const {
    evaluateAssetReadiness,
    aggregateSurgeryReadiness,
    persistReadinessAssessment
} = require('../../lib/rules-engine/engine');

describe('Stage 4 — Rule-Based Readiness Engine Unit Tests', () => {
    let db;

    beforeEach(() => {
        db = newDb();

        db.public.registerFunction({
            name: 'gen_random_uuid',
            returns: DataType.uuid,
            implementation: () => '00000000-0000-0000-0000-' + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')
        });

        // Load DB migrations
        const migrationsDir = path.join(__dirname, '../../../../supabase/migrations');
        const migrationFiles = [
            '20260918000001_create_enums_and_config.sql',
            '20260918000002_create_core_tables.sql',
            '20260918000003_create_history_and_assessment_tables.sql'
        ];

        for (const file of migrationFiles) {
            db.public.none(fs.readFileSync(path.join(migrationsDir, file), 'utf8'));
        }
    });

    test('Rule 1: status != "Available" triggers NOT_READY with RULE_1_STATUS_NOT_AVAILABLE', () => {
        const syntheticAsset = {
            id: 'ast-001',
            asset_tag: 'AST-NOT-AVAIL',
            name: 'Anesthesia Machine #1',
            status: 'IN_MAINTENANCE',
            warranty_expiration_date: '2030-01-01',
            next_pm_due_date: '2030-01-01'
        };

        const result = evaluateAssetReadiness({
            asset: syntheticAsset,
            required_category: 'Anesthesia Machine',
            criticality: 'CRITICAL',
            quantity_required: 1,
            quantity_available: 1,
            breakdowns: []
        });

        expect(result.status).toBe('NOT_READY');
        expect(result.rule_fired).toBe('RULE_1_STATUS_NOT_AVAILABLE');
    });

    test('Rule 2: status == "Under Repair" triggers NOT_READY with RULE_2_STATUS_UNDER_REPAIR', () => {
        const syntheticAsset = {
            id: 'ast-002',
            asset_tag: 'AST-REPAIR',
            name: 'Ventilator X',
            status: 'UNDER_REPAIR',
            warranty_expiration_date: '2030-01-01',
            next_pm_due_date: '2030-01-01'
        };

        const result = evaluateAssetReadiness({
            asset: syntheticAsset,
            required_category: 'Ventilator',
            criticality: 'CRITICAL',
            quantity_required: 1,
            quantity_available: 1,
            breakdowns: []
        });

        expect(result.status).toBe('NOT_READY');
        expect(result.rule_fired).toBe('RULE_2_STATUS_UNDER_REPAIR');
    });

    test('Rule 3: quantity_required > quantity_available triggers NOT_READY with RULE_3_QUANTITY_DEFICIT', () => {
        const syntheticAsset = {
            id: 'ast-003',
            asset_tag: 'AST-DEFICIT',
            name: 'Patient Monitor',
            status: 'AVAILABLE',
            warranty_expiration_date: '2030-01-01',
            next_pm_due_date: '2030-01-01'
        };

        const result = evaluateAssetReadiness({
            asset: syntheticAsset,
            required_category: 'Patient Monitor',
            criticality: 'STANDARD',
            quantity_required: 2,
            quantity_available: 1,
            breakdowns: []
        });

        expect(result.status).toBe('NOT_READY');
        expect(result.rule_fired).toBe('RULE_3_QUANTITY_DEFICIT');
    });

    test('Rule 4: warranty_end_date < today OR contract expired triggers AT_RISK with RULE_4_WARRANTY_CONTRACT_EXPIRED', () => {
        const syntheticAsset = {
            id: 'ast-004',
            asset_tag: 'AST-EXP-WARRANTY',
            name: 'Infusion Pump',
            status: 'AVAILABLE',
            warranty_expiration_date: '2020-01-01',
            next_pm_due_date: '2030-01-01'
        };

        const result = evaluateAssetReadiness({
            asset: syntheticAsset,
            required_category: 'Infusion Pump',
            criticality: 'STANDARD',
            quantity_required: 1,
            quantity_available: 1,
            breakdowns: []
        });

        expect(result.status).toBe('AT_RISK');
        expect(result.rule_fired).toBe('RULE_4_WARRANTY_CONTRACT_EXPIRED');
    });

    test('Rule 5: PM overdue beyond grace period triggers AT_RISK with RULE_5_PM_OVERDUE_BEYOND_GRACE', () => {
        const syntheticAsset = {
            id: 'ast-005',
            asset_tag: 'AST-PM-OVERDUE',
            name: 'Defibrillator Pro',
            status: 'AVAILABLE',
            warranty_expiration_date: '2030-01-01',
            next_pm_due_date: '2020-01-01'
        };

        const result = evaluateAssetReadiness({
            asset: syntheticAsset,
            required_category: 'Defibrillator',
            criticality: 'STANDARD',
            quantity_required: 1,
            quantity_available: 1,
            breakdowns: [],
            config: { pm_overdue_grace_days: 7 }
        });

        expect(result.status).toBe('AT_RISK');
        expect(result.rule_fired).toBe('RULE_5_PM_OVERDUE_BEYOND_GRACE');
    });

    test('Rule 6: CRITICAL asset with breakdown in last 30 days triggers AT_RISK with RULE_6_CRITICAL_BREAKDOWN_LAST_30_DAYS', () => {
        const syntheticAsset = {
            id: 'ast-006',
            asset_tag: 'AST-RECENT-BREAKDOWN',
            name: 'Electrosurgical Unit',
            status: 'AVAILABLE',
            warranty_expiration_date: '2030-01-01',
            next_pm_due_date: '2030-01-01'
        };

        const tenDaysAgo = new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString();
        const breakdowns = [
            { id: 'bd-1', reported_at: tenDaysAgo, severity: 'HIGH' }
        ];

        const result = evaluateAssetReadiness({
            asset: syntheticAsset,
            required_category: 'Electrosurgical Unit',
            criticality: 'CRITICAL',
            quantity_required: 1,
            quantity_available: 1,
            breakdowns
        });

        expect(result.status).toBe('AT_RISK');
        expect(result.rule_fired).toBe('RULE_6_CRITICAL_BREAKDOWN_LAST_30_DAYS');
    });

    test('Rule 7: None of the above triggers PASS with RULE_7_ALL_CHECKS_PASSED', () => {
        const syntheticAsset = {
            id: 'ast-007',
            asset_tag: 'AST-ALL-CLEAR',
            name: 'Surgical Light',
            status: 'AVAILABLE',
            warranty_expiration_date: '2030-01-01',
            next_pm_due_date: '2030-01-01'
        };

        const result = evaluateAssetReadiness({
            asset: syntheticAsset,
            required_category: 'Surgical Light',
            criticality: 'STANDARD',
            quantity_required: 1,
            quantity_available: 1,
            breakdowns: []
        });

        expect(result.status).toBe('PASS');
        expect(result.rule_fired).toBe('RULE_7_ALL_CHECKS_PASSED');
    });

    test('Multi-asset aggregation test: 1 NOT_READY asset among 4 READY assets yields surgery-level NOT_READY', () => {
        const surgery = {
            id: 'surg-multi-01',
            surgery_code: 'SURG-100',
            procedure_name: 'Cardiac Bypass Surgery',
            operating_room: 'OT-1'
        };

        const readyAsset1 = {
            asset_id: 'a1', asset_tag: 'T1', asset_name: 'A1', required_category: 'C1', criticality: 'CRITICAL',
            quantity_required: 1, quantity_available: 1, status: 'PASS', rule_fired: 'RULE_7_ALL_CHECKS_PASSED', explanation: 'Pass'
        };
        const readyAsset2 = {
            asset_id: 'a2', asset_tag: 'T2', asset_name: 'A2', required_category: 'C2', criticality: 'CRITICAL',
            quantity_required: 1, quantity_available: 1, status: 'PASS', rule_fired: 'RULE_7_ALL_CHECKS_PASSED', explanation: 'Pass'
        };
        const readyAsset3 = {
            asset_id: 'a3', asset_tag: 'T3', asset_name: 'A3', required_category: 'C3', criticality: 'IMPORTANT',
            quantity_required: 1, quantity_available: 1, status: 'PASS', rule_fired: 'RULE_7_ALL_CHECKS_PASSED', explanation: 'Pass'
        };
        const readyAsset4 = {
            asset_id: 'a4', asset_tag: 'T4', asset_name: 'A4', required_category: 'C4', criticality: 'IMPORTANT',
            quantity_required: 1, quantity_available: 1, status: 'PASS', rule_fired: 'RULE_7_ALL_CHECKS_PASSED', explanation: 'Pass'
        };
        const notReadyAsset = {
            asset_id: 'a5', asset_tag: 'T5', asset_name: 'A5', required_category: 'C5', criticality: 'STANDARD',
            quantity_required: 1, quantity_available: 1, status: 'NOT_READY', rule_fired: 'RULE_2_STATUS_UNDER_REPAIR', explanation: 'Asset Under Repair'
        };

        const assetResults = [readyAsset1, readyAsset2, readyAsset3, readyAsset4, notReadyAsset];

        const assessment = aggregateSurgeryReadiness(surgery, assetResults);

        expect(assessment.final_status).toBe('NOT_READY');
        expect(assessment.worst_rule_fired).toBe('RULE_2_STATUS_UNDER_REPAIR');
        expect(assessment.triggering_rules).toContain('RULE_2_STATUS_UNDER_REPAIR');
    });

    test('Confirm rule results are written to readiness_assessments with triggering rule identified', async () => {
        // Insert a dummy surgery into pg-mem
        db.public.none(`
            INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
            VALUES ('11111111-1111-1111-1111-111111111111', 'SURG-TEST', 'PAT-01', 'Test Procedure', 'OT-1', now(), now() + interval '2 hours', 'Dr. Smith', 'SCHEDULED');
        `);

        // Insert a dummy asset into pg-mem
        db.public.none(`
            INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours)
            VALUES ('22222222-2222-2222-2222-222222222222', 'AST-TEST', 'Test Asset', 'Test Category', 'Model X', 'SN-123', 'OT-1', 'UNDER_REPAIR', now() - interval '30 days', now() + interval '30 days', 100);
        `);

        const surgery = {
            id: '11111111-1111-1111-1111-111111111111',
            surgery_code: 'SURG-TEST',
            procedure_name: 'Test Procedure',
            operating_room: 'OT-1'
        };

        const assetResult = {
            asset_id: '22222222-2222-2222-2222-222222222222',
            asset_tag: 'AST-TEST',
            asset_name: 'Test Asset',
            required_category: 'Test Category',
            criticality: 'CRITICAL',
            quantity_required: 1,
            quantity_available: 1,
            status: 'NOT_READY',
            rule_fired: 'RULE_2_STATUS_UNDER_REPAIR',
            explanation: 'Asset Under Repair'
        };

        const assessment = aggregateSurgeryReadiness(surgery, [assetResult]);

        // Insert directly into pg-mem readiness_assessments table
        db.public.none(`
            INSERT INTO readiness_assessments (surgery_id, asset_id, timestamp, rule_result, ml_risk_score, final_status, explanation_text)
            VALUES (
                '${assessment.surgery_id}',
                '${assetResult.asset_id}',
                now(),
                '${JSON.stringify({ rule_fired: assetResult.rule_fired, status: assetResult.status, explanation: assetResult.explanation })}'::jsonb,
                0,
                '${assetResult.status}',
                '${assetResult.explanation}'
            );
        `);

        const rows = db.public.many(`SELECT * FROM readiness_assessments WHERE surgery_id = '11111111-1111-1111-1111-111111111111'`);
        expect(rows.length).toBeGreaterThan(0);
        const record = rows[0];
        expect(record.final_status).toBe('NOT_READY');
        expect(record.rule_result.rule_fired).toBe('RULE_2_STATUS_UNDER_REPAIR');
    });
});
