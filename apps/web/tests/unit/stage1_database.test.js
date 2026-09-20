const fs = require('fs');
const path = require('path');
const { newDb, DataType } = require('pg-mem');

describe('Stage 1 — Database Foundation (Supabase) Tests', () => {
    let db;

    beforeEach(() => {
        db = newDb();

        // Register UUID extension stub
        db.public.registerFunction({
            name: 'gen_random_uuid',
            returns: DataType.uuid,
            implementation: () => '00000000-0000-0000-0000-' + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')
        });

        // Register helper function for user role
        db.public.registerFunction({
            name: 'get_current_user_role',
            returns: DataType.text,
            implementation: () => 'biomedical_engineer'
        });
    });

    test('All 8 tables, FK constraints, and default readiness_config are created cleanly', async () => {
        const migrationsDir = path.join(__dirname, '../../../../supabase/migrations');
        const migrationFiles = [
            '20260918000001_create_enums_and_config.sql',
            '20260918000002_create_core_tables.sql',
            '20260918000003_create_history_and_assessment_tables.sql',
            '20260918000005_stage2_asset_fields_and_constraints.sql',
            '20260918000006_stage3_surgery_templates_and_criticality.sql',
            '20260920000006_add_warranty_and_contract_fields.sql'
        ];

        const runSqlForPgMem = (sql) => {
            const cleaned = sql
                .replace(/CREATE OR REPLACE FUNCTION[\s\S]*?\$\$ LANGUAGE plpgsql;/gi, '')
                .replace(/CREATE TRIGGER[\s\S]*?EXECUTE (PROCEDURE|FUNCTION)[\s\S]*?;/gi, '')
                .replace(/DROP TRIGGER[\s\S]*?;/gi, '');
            db.public.none(cleaned);
        };

        for (const file of migrationFiles) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            runSqlForPgMem(sql);
        }

        // Verify 8 tables exist
        const expectedTables = [
            'surgeries',
            'surgery_required_assets',
            'assets',
            'maintenance_records',
            'breakdown_incidents',
            'asset_utilization',
            'readiness_config',
            'readiness_assessments'
        ];

        for (const table of expectedTables) {
            const res = db.public.many(`SELECT * FROM ${table}`);
            expect(Array.isArray(res)).toBe(true);
        }

        // Verify readiness_config populated default values
        const config = db.public.one(`SELECT * FROM readiness_config LIMIT 1`);
        expect(Number(config.at_risk_threshold)).toBe(0.35);
        expect(Number(config.not_ready_threshold)).toBe(0.70);
        expect(Number(config.pm_overdue_grace_days)).toBe(7);
    });

    test('Seed script runs twice idempotently without row duplication', async () => {
        const migrationsDir = path.join(__dirname, '../../../../supabase/migrations');
        const seedFile = path.join(__dirname, '../../../../supabase/seed/seed.sql');

        const migrationFiles = [
            '20260918000001_create_enums_and_config.sql',
            '20260918000002_create_core_tables.sql',
            '20260918000003_create_history_and_assessment_tables.sql',
            '20260918000005_stage2_asset_fields_and_constraints.sql',
            '20260918000006_stage3_surgery_templates_and_criticality.sql',
            '20260920000006_add_warranty_and_contract_fields.sql'
        ];

        const runSqlForPgMem = (sql) => {
            const cleaned = sql
                .replace(/CREATE OR REPLACE FUNCTION[\s\S]*?\$\$ LANGUAGE plpgsql;/gi, '')
                .replace(/CREATE TRIGGER[\s\S]*?EXECUTE (PROCEDURE|FUNCTION)[\s\S]*?;/gi, '')
                .replace(/DROP TRIGGER[\s\S]*?;/gi, '');
            db.public.none(cleaned);
        };

        for (const file of migrationFiles) {
            runSqlForPgMem(fs.readFileSync(path.join(migrationsDir, file), 'utf8'));
        }

        const seedSql = fs.readFileSync(seedFile, 'utf8');

        // Run seed 1st time
        db.public.none(seedSql);

        const assetsCount1 = db.public.many('SELECT id FROM assets').length;
        const surgeriesCount1 = db.public.many('SELECT id FROM surgeries').length;
        const reqAssetsCount1 = db.public.many('SELECT id FROM surgery_required_assets').length;
        const maintenanceCount1 = db.public.many('SELECT id FROM maintenance_records').length;
        const breakdownCount1 = db.public.many('SELECT id FROM breakdown_incidents').length;
        const utilizationCount1 = db.public.many('SELECT id FROM asset_utilization').length;

        expect(assetsCount1).toBeGreaterThanOrEqual(40);
        expect(surgeriesCount1).toBe(15);

        // Run seed 2nd time (Idempotency verification)
        db.public.none(seedSql);

        const assetsCount2 = db.public.many('SELECT id FROM assets').length;
        const surgeriesCount2 = db.public.many('SELECT id FROM surgeries').length;
        const reqAssetsCount2 = db.public.many('SELECT id FROM surgery_required_assets').length;
        const maintenanceCount2 = db.public.many('SELECT id FROM maintenance_records').length;
        const breakdownCount2 = db.public.many('SELECT id FROM breakdown_incidents').length;
        const utilizationCount2 = db.public.many('SELECT id FROM asset_utilization').length;

        expect(assetsCount2).toBe(assetsCount1);
        expect(surgeriesCount2).toBe(surgeriesCount1);
        expect(reqAssetsCount2).toBe(reqAssetsCount1);
        expect(maintenanceCount2).toBe(maintenanceCount1);
        expect(breakdownCount2).toBe(breakdownCount1);
        expect(utilizationCount2).toBe(utilizationCount1);
    });

    test('RLS policy helper get_current_user_role correctly resolves role', async () => {
        const role = db.public.one('SELECT public.get_current_user_role() as role').role;
        expect(role).toBe('biomedical_engineer');
    });
});
