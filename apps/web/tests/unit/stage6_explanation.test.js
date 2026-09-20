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

    test('Acceptance Criterion 1: Validation step catches and rejects fabricated asset tags, names, or numbers', () => {
        // 1. Fabricated asset tag (AST-99999)
        const fabricatedText = `Surgery SURG-CARDIAC-01 evaluated as NOT_READY due to AST-99999 being out of service.`;
        const valRes1 = validateExplanation(fabricatedText, ['Replace AST-99999.'], mockAssessment);

        expect(valRes1.isValid).toBe(false);
        expect(valRes1.violations.length).toBeGreaterThan(0);
        expect(valRes1.violations[0]).toContain('AST-99999');

        // 2. Fabricated status contradiction (claims FULLY READY when final_status is NOT_READY)
        const statusContradiction = `Surgery SURG-CARDIAC-01 is FULLY READY for surgical start.`;
        const valRes2 = validateExplanation(statusContradiction, [], mockAssessment);

        expect(valRes2.isValid).toBe(false);
        expect(valRes2.violations[0]).toContain('Status contradiction');

        // 3. Fabricated numerical value (overdue by 999 days when not in payload)
        const fabricatedNum = `Surgery SURG-CARDIAC-01 has asset AST-001-ANESTH overdue by 999 days.`;
        const valRes3 = validateExplanation(fabricatedNum, [], mockAssessment);

        expect(valRes3.isValid).toBe(false);
        expect(valRes3.violations[0]).toContain('999');
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

        // Verifies fallback execution
        expect(result.fallback_used).toBe(true);
        expect(result.is_llm_generated).toBe(false);
        expect(result.attempts).toBe(3);
        expect(result.explanation).toContain('NOT_READY');
        expect(result.explanation).toContain('RULE_2_STATUS_UNDER_REPAIR');
        expect(result.recommended_actions.length).toBeGreaterThan(0);
    });

    test('Acceptance Criterion 3: Templated explanation always includes the specific triggering rule and actionable recommendations', () => {
        const templated = generateTemplatedExplanation(mockAssessment);

        expect(templated.final_status).toBe('NOT_READY');
        expect(templated.worst_rule_fired).toBe('RULE_2_STATUS_UNDER_REPAIR');
        expect(templated.explanation).toContain('RULE_2_STATUS_UNDER_REPAIR');
        expect(templated.explanation).toContain('AST-001-ANESTH');
        
        // Recommended action must include specific guidance referencing asset tag & rule
        expect(templated.recommended_actions.length).toBeGreaterThan(0);
        expect(templated.recommended_actions[0]).toContain('AST-001-ANESTH');
        expect(templated.recommended_actions[0]).toContain('UNDER_REPAIR');
    });

    test('Valid LLM output passes post-generation validation cleanly', async () => {
        const validProvider = async () => {
            return JSON.stringify({
                explanation: `Surgery SURG-CARDIAC-01 in OT-1 is NOT_READY. Asset AST-001-ANESTH is UNDER_REPAIR (RULE_2_STATUS_UNDER_REPAIR).`,
                recommended_actions: [`Replace AST-001-ANESTH with an operational Anesthesia Machine in OT-1.`]
            });
        };

        const result = await generateExplanation(mockAssessment, {
            maxAttempts: 3,
            llmProvider: validProvider
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
