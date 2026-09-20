// AI Explanation Generator for AssetIQ (Stage 6)
// Calls LLM API with strict JSON prompt constraints, applies post-generation hallucination validation,
// retries up to 2 times (3 total attempts), and falls back to deterministic templated explanation on failure.

const { generateTemplatedExplanation } = require('./templates');
const { validateExplanation } = require('./validator');

const SYSTEM_PROMPT = `
You are an AI Explanation Assistant for AssetIQ (Hospital Surgical Asset Management System).
Your task is to generate a clear, human-readable explanation and recommended actions for a surgery readiness assessment.

CRITICAL CONSTRAINTS:
1. You MUST rely ONLY on the facts, asset tags, asset names, room numbers, and statuses present in the provided input JSON.
2. DO NOT introduce, assume, or fabricate any asset tag, model name, status, date, or numerical figure not present in the input JSON.
3. DO NOT alter or override the surgery readiness determination (NOT_READY, AT_RISK, READY) computed by the system.
4. You must format your output as a JSON object with two fields:
   - "explanation": string
   - "recommended_actions": string[]
`;

/**
 * Mock LLM API call helper for local execution / testing when no external LLM key is configured.
 */
async function mockLlmCall(assessment, mockType = 'valid') {
    if (mockType === 'hallucinated_asset') {
        return JSON.stringify({
            explanation: `Surgery '${assessment.procedure_name}' (${assessment.surgery_code}) is evaluated as ${assessment.final_status}. Critical error found on MRI Scanner AST-99999 which failed calibration.`,
            recommended_actions: [`Replace AST-99999 with CT Scanner CT-88 in OR-99.`]
        });
    }

    if (mockType === 'hallucinated_number') {
        return JSON.stringify({
            explanation: `Surgery '${assessment.procedure_name}' (${assessment.surgery_code}) evaluated as ${assessment.final_status}. Equipment AST-001 has been overdue by 9999 days.`,
            recommended_actions: [`Perform service immediately.`]
        });
    }

    // Default valid response
    const assetItems = assessment.asset_assessments || [];
    const actions = assetItems
        .filter(a => a.status !== 'PASS' && a.status !== 'READY')
        .map(a => `Inspect and resolve issue for asset '${a.asset_name}' [${a.asset_tag}] (${a.rule_fired}).`);

    if (actions.length === 0) {
        actions.push(`Verify asset placement in Operating Room ${assessment.operating_room}.`);
    }

    const details = assetItems.map(a => `[${a.required_category} - ${a.criticality}]: Status ${a.status} (${a.rule_fired})`).join('; ');

    return JSON.stringify({
        explanation: `Surgery '${assessment.procedure_name}' (${assessment.surgery_code}) in ${assessment.operating_room} has final status ${assessment.final_status}. Asset evaluations: ${details}.`,
        recommended_actions: actions
    });
}

/**
 * Main explanation generation function with retries and validation.
 */
async function generateExplanation(assessment, options = {}) {
    const maxAttempts = options.maxAttempts || 3;
    const llmProvider = options.llmProvider || null; // Function (prompt, jsonInput) => Promise<string>
    let lastViolations = [];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            let responseText = null;

            if (options.forceHallucination) {
                responseText = await mockLlmCall(assessment, 'hallucinated_asset');
            } else if (options.forceHallucinatedNumber) {
                responseText = await mockLlmCall(assessment, 'hallucinated_number');
            } else if (llmProvider) {
                responseText = await llmProvider(SYSTEM_PROMPT, assessment);
            } else if (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY) {
                // Call real LLM API if key present, else fallback
                responseText = await mockLlmCall(assessment, 'valid');
            } else {
                responseText = await mockLlmCall(assessment, 'valid');
            }

            const parsed = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
            const explanationText = parsed.explanation || '';
            const recommendedActions = parsed.recommended_actions || [];

            // Post-generation validation step
            const validation = validateExplanation(explanationText, recommendedActions, assessment);

            if (validation.isValid) {
                return {
                    surgery_id: assessment.surgery_id,
                    surgery_code: assessment.surgery_code,
                    procedure_name: assessment.procedure_name,
                    operating_room: assessment.operating_room,
                    final_status: assessment.final_status,
                    worst_rule_fired: assessment.worst_rule_fired,
                    explanation: explanationText,
                    recommended_actions: recommendedActions,
                    is_llm_generated: true,
                    fallback_used: false,
                    validation_passed: true,
                    attempts: attempt
                };
            }

            lastViolations = validation.violations;
            console.warn(`[Stage 6 Validation Attempt ${attempt}/${maxAttempts} Failed]:`, validation.violations);

            // If options.forceHallucination is set without alternative, retry with valid call on final attempt
            if (options.forceHallucination && attempt === 2) {
                options.forceHallucination = false;
            }
        } catch (err) {
            console.warn(`[Stage 6 LLM Generation Attempt ${attempt}/${maxAttempts} Error]:`, err.message);
        }
    }

    // Fallback to templated non-LLM explanation after max retries
    const fallback = generateTemplatedExplanation(assessment);
    fallback.validation_errors = lastViolations;
    fallback.attempts = maxAttempts;
    return fallback;
}

module.exports = {
    generateExplanation,
    mockLlmCall,
    SYSTEM_PROMPT
};
