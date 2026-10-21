const { validateExplanation, extractKnownEntities } = require('../../lib/explanation/validator');
const { generateTemplatedExplanation } = require('../../lib/explanation/templates');
const { generateExplanation } = require('../../lib/explanation/generator');

describe('Stage 6 — AI Explanation Layer (LLM) Unit Tests', () => {
    const mockAssessment = {
        surgery_id: 'surg-101',
        surgery_code: 'SURG-CARDIAC-01',
        procedure_name: 'Coronary Artery Bypass',
        operating_room: 'OT-1',
        final_status: 'NOT_READY',
        worst_rule_fired: 'RULE_2_STATUS_UNDER_REPAIR',
        triggering_rules: ['RULE_2_STATUS_UNDER_REPAIR'],
        asset_assessments: [
            {
                asset_id: 'ast-001',
                asset_tag: 'AST-001-ANESTH',
                asset_name: 'Anesthesia Workstation',
                required_category: 'Anesthesia Machine',
                criticality: 'CRITICAL',
                quantity_required: 1,
                quantity_available: 1,
                status: 'NOT_READY',
                rule_fired: 'RULE_2_STATUS_UNDER_REPAIR',
                explanation: "Asset 'Anesthesia Workstation' [AST-001-ANESTH] status is UNDER_REPAIR."
            },
            {
                asset_id: 'ast-002',
                asset_tag: 'AST-002-VENT',
                asset_name: 'Ventilator Pro',
                required_category: 'Ventilator',
                criticality: 'CRITICAL',
                quantity_required: 1,
                quantity_available: 1,
                status: 'PASS',
                rule_fired: 'RULE_7_ALL_CHECKS_PASSED',
                explanation: 'Passed all safety checks.'
            }
        ],
        explanation_text: 'Surgery evaluated as NOT_READY.'
    };

    test('Acceptance Criterion 1: Validation step catches and rejects fabricated asset tags, names, numbers, and un-translated rule/bracket syntax', () => {
        // 1. Fabricated asset tag (AST-99999)
        const fabricatedText = `Surgery Readiness: NOT READY\n\nPrimary Risk: AST-99999 is broken.\n\nRecommended Action: Replace unit.`;
        const valRes1 = validateExplanation(fabricatedText, ['Replace AST-99999.'], mockAssessment);

        expect(valRes1.isValid).toBe(false);
        expect(valRes1.violations.length).toBeGreaterThan(0);
        expect(valRes1.violations.some(v => v.includes('AST-99999'))).toBe(true);

        // 2. Fabricated status contradiction (claims FULLY READY when final_status is NOT_READY)
        const statusContradiction = `Surgery SURG-CARDIAC-01 is FULLY READY for surgical start.`;
        const valRes2 = validateExplanation(statusContradiction, [], mockAssessment);

        expect(valRes2.isValid).toBe(false);
        expect(valRes2.violations[0]).toContain('Status contradiction');

        // 3. Un-translated internal rule code (RULE_2_STATUS_UNDER_REPAIR)
        const ruleCodeDump = `Surgery Readiness: NOT READY\n\nPrimary Risk: Rule RULE_2_STATUS_UNDER_REPAIR failed for Anesthesia Workstation.\n\nRecommended Action: Repair unit.`;
        const valRes3 = validateExplanation(ruleCodeDump, [], mockAssessment);

        expect(valRes3.isValid).toBe(false);
        expect(valRes3.violations.some(v => v.includes('Readability violation'))).toBe(true);

        // 4. Bracketed asset label syntax ([AST-001-ANESTH])
        const bracketedDump = `Surgery Readiness: NOT READY\n\nPrimary Risk: The Anesthesia Workstation [AST-001-ANESTH] is down.\n\nRecommended Action: Substitute unit.`;
        const valRes4 = validateExplanation(bracketedDump, [], mockAssessment);

        expect(valRes4.isValid).toBe(false);
        expect(valRes4.violations.some(v => v.includes('bracketed internal label'))).toBe(true);
    });

    test('Acceptance Criterion 2: Generator retries hallucinated content and falls back to templated non-LLM explanation when retries are exhausted', async () => {
        // Force persistent hallucinated output (e.g. AST-99999)
        const alwaysHallucinateProvider = async () => {
            return JSON.stringify({
                explanation: 'Surgery SURG-CARDIAC-01 fails because AST-99999 CT Scanner broke down.',
                recommended_actions: ['Replace AST-99999 with MRI Scanner.']
            });
        };

        const result = await generateExplanation(mockAssessment, {
            maxAttempts: 3,
            llmProvider: alwaysHallucinateProvider
        });

        // Verifies fallback execution produces plain-language 3-part format
        expect(result.fallback_used).toBe(true);
        expect(result.is_llm_generated).toBe(false);
        expect(result.attempts).toBe(3);
        expect(result.explanation).toContain('Surgery Readiness: NOT READY');
        expect(result.explanation).toContain('Primary Risk:');
        expect(result.explanation).toContain('Recommended Action:');
        expect(result.explanation).not.toMatch(/RULE_\w+/);
        expect(result.explanation).not.toMatch(/\[.+\]/);
        expect(result.recommended_actions.length).toBeGreaterThan(0);
    });

    test('Acceptance Criterion 3: Templated explanation meets plain-language standard with zero raw codes or bracket syntax', () => {
        const templated = generateTemplatedExplanation(mockAssessment);

        expect(templated.final_status).toBe('NOT_READY');
        expect(templated.worst_rule_fired).toBe('RULE_2_STATUS_UNDER_REPAIR');
        expect(templated.explanation).toContain('Surgery Readiness: NOT READY');
        expect(templated.explanation).toContain('Primary Risk: The Anesthesia Workstation is currently under repair.');
        expect(templated.explanation).toContain('Everything else needed for this surgery — the Ventilator Pro — is confirmed ready.');
        expect(templated.explanation).toContain('Recommended Action:');

        // Plain language negative checks
        expect(templated.explanation).not.toMatch(/RULE_\w+/);
        expect(templated.explanation).not.toMatch(/\[.+\]/);
        expect(templated.explanation).not.toContain('Status PASS');

        // Recommended action check
        expect(templated.recommended_actions.length).toBeGreaterThan(0);
        expect(templated.recommended_actions[0]).toContain('Transfer the unit to biomedical engineering');
    });

    test('Valid LLM output in plain language passes post-generation validation cleanly', async () => {
        const validPlainLanguageProvider = async () => {
            return JSON.stringify({
                explanation: `Surgery Readiness: NOT READY\n\nPrimary Risk: The Anesthesia Workstation is currently under repair. Everything else needed for this surgery — the Ventilator Pro — is confirmed ready.\n\nRecommended Action: Biomedical engineering should transfer the unit to repair and substitute an operational Anesthesia Workstation in OT-1.`,
                recommended_actions: [`Transfer the Anesthesia Workstation to biomedical engineering and substitute an operational unit in OT-1.`]
            });
        };

        const result = await generateExplanation(mockAssessment, {
            maxAttempts: 3,
            llmProvider: validPlainLanguageProvider
        });

        expect(result.is_llm_generated).toBe(true);
        expect(result.fallback_used).toBe(false);
        expect(result.validation_passed).toBe(true);
        expect(result.attempts).toBe(1);
    });

    test('Architectural Rule Enforcement: Explanation layer NEVER mutates final_status', async () => {
        const assessmentCopy = JSON.parse(JSON.stringify(mockAssessment));
        const originalStatus = assessmentCopy.final_status;

        const result = await generateExplanation(assessmentCopy);

        expect(result.final_status).toBe(originalStatus);
        expect(assessmentCopy.final_status).toBe(originalStatus);
    });
});

