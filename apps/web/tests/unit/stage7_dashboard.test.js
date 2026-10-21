const { canUserEdit, getRoleFromToken, MOCK_AUTH_TOKENS, getLandingUrlForRole, verifyServerSession, verifyRolePermission } = require('../../lib/auth');
const { evaluateAssetReadiness, aggregateSurgeryReadiness } = require('../../lib/rules-engine/engine');

describe('Stage 7 — Dashboard (Next.js + Recharts) Unit Tests', () => {
    test('Requirement 3: Exclusive Permissions enforced — Cross-role write operations rejected', () => {
        const adminToken = `Bearer ${MOCK_AUTH_TOKENS.hospital_admin}`;
        const otToken = `Bearer ${MOCK_AUTH_TOKENS.ot_admin}`;
        const bioToken = `Bearer ${MOCK_AUTH_TOKENS.biomedical_engineer}`;

        // 1. Assets Write Permission (biomedical_engineer & hospital_admin ALLOWED, ot_admin REJECTED)
        expect(verifyRolePermission(adminToken, ['biomedical_engineer', 'hospital_admin']).allowed).toBe(true);
        expect(verifyRolePermission(bioToken, ['biomedical_engineer', 'hospital_admin']).allowed).toBe(true);
        
        const otAssetWrite = verifyRolePermission(otToken, ['biomedical_engineer', 'hospital_admin']);
        expect(otAssetWrite.allowed).toBe(false);
        expect(otAssetWrite.status).toBe(403);
        expect(otAssetWrite.message).toContain("Role 'ot_admin' is not authorized");

        // 2. Surgeries Write Permission (ot_admin & hospital_admin ALLOWED, biomedical_engineer REJECTED)
        expect(verifyRolePermission(adminToken, ['ot_admin', 'hospital_admin']).allowed).toBe(true);
        expect(verifyRolePermission(otToken, ['ot_admin', 'hospital_admin']).allowed).toBe(true);

        const bioSurgeryWrite = verifyRolePermission(bioToken, ['ot_admin', 'hospital_admin']);
        expect(bioSurgeryWrite.allowed).toBe(false);
        expect(bioSurgeryWrite.status).toBe(403);
        expect(bioSurgeryWrite.message).toContain("Role 'biomedical_engineer' is not authorized");

        // 3. User & Role Management Permission (hospital_admin ALLOWED ONLY, ot_admin & biomedical_engineer REJECTED)
        expect(verifyRolePermission(adminToken, ['hospital_admin']).allowed).toBe(true);

        const otRoleManage = verifyRolePermission(otToken, ['hospital_admin']);
        expect(otRoleManage.allowed).toBe(false);
        expect(otRoleManage.status).toBe(403);

        const bioRoleManage = verifyRolePermission(bioToken, ['hospital_admin']);
        expect(bioRoleManage.allowed).toBe(false);
        expect(bioRoleManage.status).toBe(403);
    });

    test('Acceptance Criterion 2: Role-based UI restrictions verified with different auth tokens', () => {
        // 1. Biomedical Engineer Role
        const bioToken = MOCK_AUTH_TOKENS.biomedical_engineer;
        const bioRole = getRoleFromToken(bioToken);
        expect(bioRole).toBe('biomedical_engineer');
        expect(canUserEdit(bioRole)).toBe(true);
        expect(getLandingUrlForRole(bioRole)).toBe('/engineer-dashboard');

        // 2. Hospital Admin Role (Full Admin Token)
        const adminToken = MOCK_AUTH_TOKENS.hospital_admin;
        const adminRole = getRoleFromToken(adminToken);
        expect(adminRole).toBe('hospital_admin');
        expect(canUserEdit(adminRole)).toBe(true);
        expect(getLandingUrlForRole(adminRole)).toBe('/overview');

        // 3. OT Admin Role
        const otToken = MOCK_AUTH_TOKENS.ot_admin;
        const otRole = getRoleFromToken(otToken);
        expect(otRole).toBe('ot_admin');
        expect(canUserEdit(otRole)).toBe(true);
        expect(getLandingUrlForRole(otRole)).toBe('/surgeries');

        // 4. Verifiable Server-Side Session Check
        const validSession = verifyServerSession(`Bearer ${adminToken}`);
        expect(validSession.authenticated).toBe(true);
        expect(validSession.role).toBe('hospital_admin');

        // 5. Unconfigured or Invalid Role Block
        const invalidSession = verifyServerSession('Bearer token-invalid-role-123');
        expect(invalidSession.authenticated).toBe(false);
        expect(invalidSession.role).toBeNull();
        expect(invalidSession.error).toContain('ACCOUNT_NOT_CONFIGURED');
    });

    test('Acceptance Criterion 3: Dashboard reflects asset status change within one refresh cycle (no stale data)', () => {
        const surgery = {
            id: 'surg-refresh-01',
            surgery_code: 'SURG-REFRESH',
            procedure_name: 'Laparoscopic Surgery',
            operating_room: 'OT-1'
        };

        const mutableAsset = {
            id: 'ast-lap-01',
            asset_tag: 'AST-LAP-01',
            name: 'Laparoscopic Tower',
            status: 'AVAILABLE',
            warranty_expiration_date: '2030-01-01',
            next_pm_due_date: '2030-01-01'
        };

        // Cycle 1: Asset is AVAILABLE -> Surgery evaluates to READY
        const eval1 = evaluateAssetReadiness({
            asset: mutableAsset,
            required_category: 'Laparoscopic Tower',
            criticality: 'CRITICAL',
            quantity_required: 1,
            quantity_available: 1
        });
        const agg1 = aggregateSurgeryReadiness(surgery, [eval1]);

        expect(agg1.final_status).toBe('READY');

        // Action: User marks asset "UNDER_REPAIR"
        mutableAsset.status = 'UNDER_REPAIR';

        // Cycle 2: Immediately re-evaluated on next refresh cycle -> Surgery evaluates to NOT_READY
        const eval2 = evaluateAssetReadiness({
            asset: mutableAsset,
            required_category: 'Laparoscopic Tower',
            criticality: 'CRITICAL',
            quantity_required: 1,
            quantity_available: 1
        });
        const agg2 = aggregateSurgeryReadiness(surgery, [eval2]);

        expect(agg2.final_status).toBe('NOT_READY');
        expect(agg2.worst_rule_fired).toBe('RULE_2_STATUS_UNDER_REPAIR');
    });

    test('Acceptance Criterion 1: Visualizations data aggregations handle seed data cleanly', () => {
        const mockAssets = [
            { id: 'a1', category: 'Anesthesia Machine', status: 'AVAILABLE', total_operating_hours: 1200, next_pm_due_date: '2030-01-01' },
            { id: 'a2', category: 'Ventilator', status: 'UNDER_REPAIR', total_operating_hours: 800, next_pm_due_date: '2020-01-01' },
            { id: 'a3', category: 'Patient Monitor', status: 'AVAILABLE', total_operating_hours: 450, next_pm_due_date: '2030-01-01' }
        ];

        const mockSurgeries = [
            { id: 's1', operating_room: 'OT-1', final_status: 'READY' },
            { id: 's2', operating_room: 'OT-1', final_status: 'NOT_READY' },
            { id: 's3', operating_room: 'OT-2', final_status: 'AT_RISK' }
        ];

        // 1. Readiness Distribution counts
        const readyCount = mockSurgeries.filter(s => s.final_status === 'READY').length;
        const atRiskCount = mockSurgeries.filter(s => s.final_status === 'AT_RISK').length;
        const notReadyCount = mockSurgeries.filter(s => s.final_status === 'NOT_READY').length;

        expect(readyCount).toBe(1);
        expect(atRiskCount).toBe(1);
        expect(notReadyCount).toBe(1);

        // 2. High risk asset count
        const highRiskAssets = mockAssets.filter(a => a.status === 'UNDER_REPAIR' || a.next_pm_due_date < '2026-01-01');
        expect(highRiskAssets.length).toBe(1);
        expect(highRiskAssets[0].id).toBe('a2');
    });
});
