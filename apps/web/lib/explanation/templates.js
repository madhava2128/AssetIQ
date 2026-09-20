// Templated Fallback Explanation Generator for AssetIQ (Stage 6)
// Provides guaranteed, deterministic explanations and actionable recommendations based strictly on Stage 4/5 outputs.

const RULE_RECOMMENDATIONS = {
    RULE_1_STATUS_NOT_AVAILABLE: (item) =>
        `Replace asset '${item.asset_name}' [${item.asset_tag}] (current status: '${item.status}') with an AVAILABLE '${item.required_category}' unit prior to surgical start.`,
    RULE_2_STATUS_UNDER_REPAIR: (item) =>
        `Asset '${item.asset_name}' [${item.asset_tag}] is UNDER_REPAIR. Transfer unit to biomedical engineering and substitute an operational '${item.required_category}' unit.`,
    RULE_3_QUANTITY_DEFICIT: (item) =>
        `Equipment deficit for category '${item.required_category}': required ${item.quantity_required}, available ${item.quantity_available}. Allocate ${item.quantity_required - item.quantity_available} additional unit(s).`,
    RULE_4_WARRANTY_CONTRACT_EXPIRED: (item) =>
        `Asset '${item.asset_name}' [${item.asset_tag}] warranty or service contract has expired. Request biomedical review or active vendor coverage.`,
    RULE_5_PM_OVERDUE_BEYOND_GRACE: (item) =>
        `Preventative maintenance for '${item.asset_name}' [${item.asset_tag}] is overdue beyond grace period. Perform emergency PM check or reassign PM-compliant unit.`,
    RULE_6_CRITICAL_BREAKDOWN_LAST_30_DAYS: (item) =>
        `CRITICAL asset '${item.asset_name}' [${item.asset_tag}] had a breakdown reported within the last 30 days. Execute mandatory pre-op functional verification test.`,
    RULE_7_ALL_CHECKS_PASSED: (item) =>
        `Asset '${item.asset_name}' [${item.asset_tag}] passed all deterministic safety checks.`
};

/**
 * Generates a structured templated explanation and recommended actions list.
 */
function generateTemplatedExplanation(assessment) {
    const {
        surgery_code = 'UNKNOWN',
        procedure_name = 'Procedure',
        operating_room = 'OR',
        final_status = 'UNKNOWN',
        worst_rule_fired = 'RULE_7_ALL_CHECKS_PASSED',
        asset_assessments = []
    } = assessment;

    const actionItems = [];
    const detailLines = [];

    asset_assessments.forEach((item, index) => {
        const ruleId = item.rule_fired || 'RULE_7_ALL_CHECKS_PASSED';
        const line = `Asset ${index + 1} [${item.required_category} - ${item.criticality}]: Status ${item.status} (${ruleId}) - ${item.explanation}`;
        detailLines.push(line);

        if (item.status !== 'PASS' && item.status !== 'READY') {
            const recFn = RULE_RECOMMENDATIONS[ruleId] || RULE_RECOMMENDATIONS.RULE_1_STATUS_NOT_AVAILABLE;
            actionItems.push(recFn(item));
        }
    });

    if (actionItems.length === 0) {
        actionItems.push(`All required assets for procedure '${procedure_name}' (${surgery_code}) in Operating Room '${operating_room}' are fully verified and READY.`);
    }

    const statusSummary = `Surgery Readiness Determination: ${final_status}. Worst triggering rule: ${worst_rule_fired}.`;
    const explanationText = `${statusSummary}\n\nAsset Evaluation Details:\n` + detailLines.join('\n');

    return {
        surgery_id: assessment.surgery_id,
        surgery_code,
        procedure_name,
        operating_room,
        final_status,
        worst_rule_fired,
        explanation: explanationText,
        recommended_actions: actionItems,
        is_llm_generated: false,
        fallback_used: true
    };
}

module.exports = {
    generateTemplatedExplanation,
    RULE_RECOMMENDATIONS
};
