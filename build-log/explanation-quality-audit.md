# AssetIQ — Stage 6 AI Explanation Quality Audit

**Audit Date:** 2026-09-22  
**Auditor:** Antigravity Autonomous Agent  
**Scope:** Investigation of Stage 6 AI Explanation layer outputs, prompt constraints, mock generation logic, fallback templates, and hallucination validator rules.

---

## 1. Problem Summary

The Stage 6 AI Explanation layer was outputting raw internal data dumps instead of clear, human-readable explanations. An example of the broken output observed:

> *"Surgery 'Total Knee Arthroplasty' (SURG-2026-002) in OR-2 has final status AT_RISK. Asset evaluations: [ANESTHESIA_MACHINE - CRITICAL]: Status PASS (RULE_7_ALL_CHECKS_PASSED); [CARM_FLUOROSCOPY - CRITICAL]: Status AT_RISK (RULE_4_WARRANTY_CONTRACT_EXPIRED)... Inspect and resolve issue for asset 'Ziehm Solo FD C-Arm' [AST-CARM-002] (RULE_4_WARRANTY_CONTRACT_EXPIRED)."*

This string contains raw database rule IDs (`RULE_4_WARRANTY_CONTRACT_EXPIRED`), bracketed internal tags (`[AST-CARM-002]`, `[ANESTHESIA_MACHINE - CRITICAL]`), uppercase status enums (`PASS`, `AT_RISK`), and an exhaustive listing of passing assets.

---

## 2. Root Cause Analysis

### 2.1 System Prompt & Generator Instructions (`apps/web/lib/explanation/generator.js`)
- **Vague Formatting Guidance:** The `SYSTEM_PROMPT` in `generator.js` instructed the LLM to generate a "clear, human-readable explanation" and enforce non-hallucination, but failed to provide explicit formatting negative constraints (e.g., forbidding rule codes, bracket syntax, status enums, or asset ID tags).
- **Technical Mock Responses:** The `mockLlmCall` function used when no LLM API key is present directly concatenated structured JSON arrays into string templates (`[${a.required_category} - ${a.criticality}]: Status ${a.status} (${a.rule_fired})`), echoing internal codes back as output.

### 2.2 Fallback Template Generator (`apps/web/lib/explanation/templates.js`)
- **Deterministic Technical Strings:** When LLM generation failed or defaulted to fallback mode, `generateTemplatedExplanation` and `RULE_RECOMMENDATIONS` formatted raw rule IDs (e.g., `RULE_2_STATUS_UNDER_REPAIR`) and bracketed tags into the fallback text.
- **No Plain Language Translation:** Fallback templates directly rendered uppercase status enums (e.g., `Status NOT_READY`) and exhaustively listed every passing asset line-by-line rather than summarizing healthy assets.

### 2.3 Post-Generation Validator (`apps/web/lib/explanation/validator.js`)
- **Permissive Readability Rules:** `validateExplanation` strictly verified hallucination risks (checking if tags or numbers were grounded in the input JSON), but contained zero rules checking for readability, formatting, un-translated rule codes (`RULE_\d+`), or bracketed internal syntax (`[...]`).
- **Pass-through of Technical Junk:** Because technical junk strings are present in the input payload JSON (e.g., `rule_fired`), the validator considered them "grounded" and passed them as valid explanations.

---

## 3. Required Remediation Plan

1. **Update LLM System Prompt & Mock Generator (`lib/explanation/generator.js`):**
   - Require a strict **three-part plain-language structure**:
     1. **`Surgery Readiness: [STATUS IN PLAIN WORDS]`** (e.g. `Surgery Readiness: AT RISK`)
     2. **`Primary Risk:`** (or **`Readiness Status:`**) — Plain English explanation of specific problem(s) and a reassuring note on passing equipment.
     3. **`Recommended Action:`** — Plain English recommendations for OT/Biomedical staff.
   - Forbid internal rule codes, status enums (`PASS`, `AT_RISK`, `CRITICAL`), asset tag brackets (`[AST-...]`), and exhaustive itemization of passing assets.

2. **Rewrite Fallback Template Generator (`lib/explanation/templates.js`):**
   - Translate every rule code (`RULE_1` through `RULE_7`) into plain English descriptions.
   - Structure fallback explanations with the exact same three-part format as the LLM output.
   - Summarize passing assets into a single reassuring statement instead of listing each one.

3. **Enhance Post-Generation Validator (`lib/explanation/validator.js`):**
   - Add checks for un-translated rule codes (`RULE_\d+`), bracket syntax (`[...]`), and raw status string patterns (`Status PASS (`, `Status AT_RISK (`).
   - Automatically reject LLM responses that contain un-translated technical tokens.

4. **Update Unit Tests (`tests/unit/stage6_explanation.test.js`):**
   - Assert that both LLM-generated and templated fallback explanations satisfy the plain-language criteria and three-part structure with zero technical codes.
