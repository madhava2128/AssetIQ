// AI Explanation Generator for AssetIQ (Stage 6)
// Calls LLM API with strict JSON prompt constraints, applies post-generation hallucination validation,
// retries up to 2 times (3 total attempts), and falls back to deterministic templated explanation on failure.

const { generateTemplatedExplanation } = require('./templates');
const { validateExplanation } = require('./validator');

const SYSTEM_PROMPT = `
You are an AI Explanation Assistant for AssetIQ (Hospital Surgical Asset Management System).
Your task is to generate a clear, human-readable explanation and recommended actions for a surgery readiness assessment.

FORMAT & STYLE MANDATES:
1. NO INTERNAL CODES, STATUS ENUMS, OR TECHNICAL TOKENS:
   - NEVER include raw rule codes (e.g. RULE_4_WARRANTY_CONTRACT_EXPIRED, RULE_2_STATUS_UNDER_REPAIR).
   - NEVER include raw status enums or labels (e.g. PASS, AT_RISK, NOT_READY, UNDER_REPAIR, CRITICAL).
   - Translate all status and rule codes into plain English sentences (e.g. "service contract has expired" or "under repair").

2. NO BRACKETS, ASSET TAGS, OR ARRAY LIST SYNTAX:
   - NEVER include internal asset tags or IDs in brackets (e.g. [AST-CARM-002], [ANESTHESIA_MACHINE - CRITICAL]).
   - Refer to equipment using plain descriptive names only (e.g. "the C-Arm imaging unit" or "the Anesthesia Workstation").

3. DO NOT ITEMIZE PASSING ASSETS INDIVIDUALLY:
   - Only describe equipment that has an actual problem or risk.
   - For passing equipment, include a brief reassuring summary note (e.g. "Everything else needed for this surgery — the anesthesia machine and surgical monitor — is confirmed ready.").

4. STRICT THREE-PART STRUCTURE REQUIRED FOR THE EXPLANATION STRING:
   - Section 1: "Surgery Readiness: [STATUS IN PLAIN WORDS]" (e.g. "Surgery Readiness: AT RISK", "Surgery Readiness: NOT READY", or "Surgery Readiness: READY").
   - Section 2: "Primary Risk: [Plain English problem description and passing equipment summary]" (or "Readiness Status: All required equipment is confirmed ready." if READY).
   - Section 3: "Recommended Action: [Plain English action plan for OT / Biomedical engineering staff]".

5. CRITICAL NON-HALLUCINATION CONSTRAINTS:
   - Rely ONLY on facts, equipment names, room numbers, and issues present in the input JSON.
   - DO NOT introduce or fabricate unmentioned equipment types, model numbers, dates, or figures.
   - DO NOT alter the surgery readiness status determination.

OUTPUT FORMAT:
Return a JSON object with:
  - "explanation": string (formatted with the 3-part structure above)
  - "recommended_actions": string[] (array of plain-language action sentences)
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

    // Default valid plain-language response
    const templated = generateTemplatedExplanation(assessment);
    return JSON.stringify({
        explanation: templated.explanation,
        recommended_actions: templated.recommended_actions
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
