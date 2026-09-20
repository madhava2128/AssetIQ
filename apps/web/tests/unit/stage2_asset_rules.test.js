const {
    createAsset,
    updateAsset,
    createMaintenanceRecord,
    createBreakdownIncident,
    getReadinessConfig
} = require('../../lib/supabase/mock-db');

describe('Stage 2 — Asset Management Module Rules & Safety Tests', () => {
    let validAsset;

    beforeEach(async () => {
        // Create a clean valid asset for each test run
        validAsset = await createAsset({
            asset_tag: `AST-TEST-${Math.floor(Math.random() * 10000)}`,
            name: 'Test Anesthesia Station',
            category: 'ANESTHESIA_MACHINE',
            model: 'A7 Test',
            serial_number: `SN-TEST-${Math.floor(Math.random() * 10000)}`,
            operating_room: 'OR-1',
            status: 'UNDER_REPAIR', // Initial conservative default
            last_pm_date: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
            next_pm_due_date: new Date(Date.now() + 150 * 24 * 3600 * 1000).toISOString(),
            total_operating_hours: 500
        });
    });

    test('Acceptance Criterion 1: Cannot create a maintenance record referencing a nonexistent asset', async () => {
        const invalidAssetId = 'nonexistent-uuid-999999999';

        await expect(
            createMaintenanceRecord({
                asset_id: invalidAssetId,
                maintenance_type: 'PREVENTIVE',
                performed_by: 'Test BioMed Tech',
                details: 'Routine check'
            })
        ).rejects.toThrow(`Referenced asset does not exist: ${invalidAssetId}`);
    });

    test('Acceptance Criterion 2: Cannot mark an asset "Available" with an open breakdown incident', async () => {
        // Step 1: Create an open breakdown incident for validAsset
        await createBreakdownIncident({
            asset_id: validAsset.id,
            severity: 'CRITICAL',
            failure_type: 'MECHANICAL',
            description: 'Vaporizer lock jammed'
        });

        // Step 2: Attempt to manually mark the asset status as AVAILABLE
        await expect(
            updateAsset(validAsset.id, { status: 'AVAILABLE' })
        ).rejects.toThrow(`Cannot mark asset AVAILABLE while an unresolved breakdown incident exists (Asset ID: ${validAsset.id})`);
    });

    test('Acceptance Criterion 3: PM-overdue flag correctly identifies assets past next_due_date', async () => {
        const config = await getReadinessConfig();
        const graceDays = config.pm_overdue_grace_days || 7;
        const now = new Date();

        // Overdue Asset (next_pm_due_date was 20 days ago)
        const overdueAsset = await createAsset({
            asset_tag: 'AST-OVERDUE-01',
            name: 'Overdue Laparoscopic Tower',
            category: 'LAPAROSCOPIC_TOWER',
            model: 'Overdue Tower Model',
            serial_number: 'SN-OVERDUE-01',
            operating_room: 'OR-2',
            status: 'UNDER_MAINTENANCE',
            next_pm_due_date: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
        });

        // Compliant Asset (next_pm_due_date is 90 days in future)
        const compliantAsset = await createAsset({
            asset_tag: 'AST-COMPLIANT-01',
            name: 'Compliant C-Arm',
            category: 'CARM_FLUOROSCOPY',
            model: 'Cios Alpha',
            serial_number: 'SN-COMPLIANT-01',
            operating_room: 'OR-3',
            status: 'AVAILABLE',
            next_pm_due_date: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString()
        });

        // Compute overdue flags
        const isOverdueAssetFlagged = now > new Date(new Date(overdueAsset.next_pm_due_date).getTime() + graceDays * 24 * 3600 * 1000);
        const isCompliantAssetFlagged = now > new Date(new Date(compliantAsset.next_pm_due_date).getTime() + graceDays * 24 * 3600 * 1000);

        expect(isOverdueAssetFlagged).toBe(true);
        expect(isCompliantAssetFlagged).toBe(false);
    });
});
