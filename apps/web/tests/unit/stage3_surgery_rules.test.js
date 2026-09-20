const {
    createSurgery,
    getSurgeryById,
    updateSurgery,
    getSurgeryTemplates
} = require('../../lib/supabase/mock-db');

describe('Stage 3 — Surgery Management & Equipment Allocation Rules Tests', () => {
    test('Acceptance Criterion 1: Creating a surgery of a known type auto-populates correct equipment list', async () => {
        // Create a CARDIAC surgery without passing manual required assets
        const cardiacSurgery = await createSurgery({
            procedure_name: 'Coronary Artery Bypass Graft (CABG)',
            surgery_type: 'CARDIAC',
            operating_room: 'OR-5',
            scheduled_start_time: new Date(Date.now() + 100 * 3600 * 1000).toISOString(),
            scheduled_end_time: new Date(Date.now() + 104 * 3600 * 1000).toISOString(),
            surgeon_name: 'Dr. Emily Al-Mansoor'
        });

        expect(cardiacSurgery).toBeDefined();
        expect(cardiacSurgery.required_assets).toBeDefined();
        expect(cardiacSurgery.required_assets.length).toBeGreaterThan(0);

        // Verify CARDIAC template categories are present
        const categories = cardiacSurgery.required_assets.map(r => r.required_category);
        expect(categories).toContain('ANESTHESIA_MACHINE');
        expect(categories).toContain('CARM_FLUOROSCOPY');
        expect(categories).toContain('ELECTROSURGICAL_UNIT');
        expect(categories).toContain('SURGICAL_MONITOR');

        // Check equipment criticality levels
        const anesthesiaReq = cardiacSurgery.required_assets.find(r => r.required_category === 'ANESTHESIA_MACHINE');
        expect(anesthesiaReq.criticality).toBe('CRITICAL');
    });

    test('Acceptance Criterion 2: Double-booking the same OT/time slot is rejected with clear error', async () => {
        const startTime = new Date(Date.now() + 120 * 3600 * 1000).toISOString();
        const endTime = new Date(Date.now() + 124 * 3600 * 1000).toISOString();

        // 1. Create first surgery in OR-3
        await createSurgery({
            procedure_name: 'Open Heart Surgery A',
            surgery_type: 'CARDIAC',
            operating_room: 'OR-3',
            scheduled_start_time: startTime,
            scheduled_end_time: endTime,
            surgeon_name: 'Dr. Sarah'
        });

        // 2. Attempt to create overlapping surgery in OR-3 during same time window
        const overlappingStart = new Date(Date.now() + 122 * 3600 * 1000).toISOString();
        const overlappingEnd = new Date(Date.now() + 126 * 3600 * 1000).toISOString();

        await expect(
            createSurgery({
                procedure_name: 'Emergency Spine Fusion B',
                surgery_type: 'NEUROSURGERY',
                operating_room: 'OR-3',
                scheduled_start_time: overlappingStart,
                scheduled_end_time: overlappingEnd,
                surgeon_name: 'Dr. Michael'
            })
        ).rejects.toThrow(/Double-booking rejected: Operating Room OR-3 is already booked/);
    });

    test('Acceptance Criterion 3: Manual override of equipment template persists across future edits', async () => {
        // Step 1: Create a GENERAL_SURGERY procedure
        const surgery = await createSurgery({
            procedure_name: 'Laparoscopic Hernia Repair',
            surgery_type: 'GENERAL_SURGERY',
            operating_room: 'OR-6',
            scheduled_start_time: new Date(Date.now() + 200 * 3600 * 1000).toISOString(),
            scheduled_end_time: new Date(Date.now() + 203 * 3600 * 1000).toISOString()
        });

        // Step 2: Perform a manual equipment override (e.g. adding a custom requirement)
        const customOverrideEquipment = [
            { required_category: 'ANESTHESIA_MACHINE', criticality: 'CRITICAL', quantity: 1, is_manual_override: true },
            { required_category: 'CARM_FLUOROSCOPY', criticality: 'IMPORTANT', quantity: 1, is_manual_override: true }
        ];

        const overriddenSurgery = await updateSurgery(surgery.id, {
            required_assets: customOverrideEquipment
        });

        expect(overriddenSurgery.required_assets.length).toBe(2);
        expect(overriddenSurgery.required_assets.some(r => r.required_category === 'CARM_FLUOROSCOPY')).toBe(true);

        // Step 3: Edit the surgery details (e.g., change surgeon name and start time)
        const editedSurgery = await updateSurgery(surgery.id, {
            surgeon_name: 'Dr. Revised Surgeon',
            notes: 'Updated pre-op notes'
        });

        // Step 4: Confirm that the manual equipment override persists!
        expect(editedSurgery.surgeon_name).toBe('Dr. Revised Surgeon');
        expect(editedSurgery.required_assets.length).toBe(2);
        expect(editedSurgery.required_assets.some(r => r.required_category === 'CARM_FLUOROSCOPY')).toBe(true);
    });
});
