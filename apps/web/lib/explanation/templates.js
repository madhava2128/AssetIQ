// Templated Fallback Explanation Generator for AssetIQ (Stage 6)
// Provides guaranteed, deterministic explanations and actionable recommendations in plain English.

function formatEquipmentName(item) {
    if (item.asset_name && !item.asset_name.toUpperCase().startsWith('AST-')) {
        return item.asset_name;
    }
    const cat = item.required_category || 'medical asset';
    return cat.toLowerCase().includes('unit') || cat.toLowerCase().includes('machine') || cat.toLowerCase().includes('scanner') || cat.toLowerCase().includes('system')
        ? cat
        : `${cat} unit`;
}

function formatStatusHeader(finalStatus) {
    const statusMap = {
        'NOT_READY': 'NOT READY',
        'AT_RISK': 'AT RISK',
        'READY': 'READY'
    };
    return `Surgery Readiness: ${statusMap[finalStatus] || finalStatus}`;
}

const RULE_PLAIN_EXPLANATIONS = {
    RULE_1_STATUS_NOT_AVAILABLE: (item) =>
        `The ${formatEquipmentName(item)} is currently unavailable.`,
    RULE_2_STATUS_UNDER_REPAIR: (item) =>
        `The ${formatEquipmentName(item)} is currently under repair.`,
    RULE_3_QUANTITY_DEFICIT: (item) =>
        `There is an equipment shortage for ${formatEquipmentName(item)} (required ${item.quantity_required}, available ${item.quantity_available}).`,
    RULE_4_WARRANTY_CONTRACT_EXPIRED: (item) =>
        `The ${formatEquipmentName(item)}'s service contract has expired.`,
    RULE_5_PM_OVERDUE_BEYOND_GRACE: (item) =>
        `Preventative maintenance for the ${formatEquipmentName(item)} is overdue beyond the allowable grace period.`,
    RULE_6_CRITICAL_BREAKDOWN_LAST_30_DAYS: (item) =>
        `The ${formatEquipmentName(item)} had a breakdown reported within the last 30 days and requires pre-op testing.`,
    RULE_7_ALL_CHECKS_PASSED: (item) =>
        `The ${formatEquipmentName(item)} is confirmed ready.`
};

const RULE_RECOMMENDATIONS = {
    RULE_1_STATUS_NOT_AVAILABLE: (item) =>
        `Assign an available ${formatEquipmentName(item)} unit prior to surgical start.`,
    RULE_2_STATUS_UNDER_REPAIR: (item) =>
        `Transfer the unit to biomedical engineering and substitute an operational ${formatEquipmentName(item)}.`,
    RULE_3_QUANTITY_DEFICIT: (item) =>
        `Allocate ${item.quantity_required - item.quantity_available} additional ${formatEquipmentName(item)} unit(s) to meet surgical requirements.`,
    RULE_4_WARRANTY_CONTRACT_EXPIRED: (item) =>
        `Biomedical engineering should renew or verify the ${formatEquipmentName(item)}'s service contract before the procedure, or arrange a backup unit if it cannot be resolved in time.`,
    RULE_5_PM_OVERDUE_BEYOND_GRACE: (item) =>
        `Perform an emergency PM inspection on the ${formatEquipmentName(item)} or reassign a PM-compliant unit.`,
    RULE_6_CRITICAL_BREAKDOWN_LAST_30_DAYS: (item) =>
        `Execute a mandatory pre-op functional verification test on the ${formatEquipmentName(item)}.`,
    RULE_7_ALL_CHECKS_PASSED: (item) =>
        `No intervention required.`
};

/**
 * Generates a structured templated explanation and recommended actions list in plain English.
 */
function generateTemplatedExplanation(assessment) {
    const {
        procedure_name = 'Procedure',
        operating_room = 'OR',
        final_status = 'UNKNOWN',
        worst_rule_fired = 'RULE_7_ALL_CHECKS_PASSED',
        asset_assessments = []
    } = assessment;

    const problemItems = asset_assessments.filter(a => a.status !== 'PASS' && a.status !== 'READY');
    const passingItems = asset_assessments.filter(a => a.status === 'PASS' || a.status === 'READY');

    const header = formatStatusHeader(final_status);

    let riskText = '';
    const actionItems = [];

    if (problemItems.length > 0) {
        const problemSentences = problemItems.map(item => {
            const ruleId = item.rule_fired || worst_rule_fired;
            const expFn = RULE_PLAIN_EXPLANATIONS[ruleId] || RULE_PLAIN_EXPLANATIONS.RULE_1_STATUS_NOT_AVAILABLE;
            return expFn(item);
        });

        let passingSummary = '';
        if (passingItems.length > 0) {
            const passingNames = passingItems.map(item => formatEquipmentName(item));
            if (passingNames.length === 1) {
                passingSummary = ` Everything else needed for this surgery — the ${passingNames[0]} — is confirmed ready.`;
            } else if (passingNames.length > 1) {
                const listStr = passingNames.slice(0, -1).join(', ') + ' and ' + passingNames[passingNames.length - 1];
                passingSummary = ` Everything else needed for this surgery — the ${listStr} — is confirmed ready.`;
            } else {
                passingSummary = ' All other required equipment is confirmed ready.';
            }
        } else {
            passingSummary = '';
        }

        riskText = `Primary Risk: ${problemSentences.join(' ')}${passingSummary}`;

        problemItems.forEach(item => {
            const ruleId = item.rule_fired || worst_rule_fired;
            const recFn = RULE_RECOMMENDATIONS[ruleId] || RULE_RECOMMENDATIONS.RULE_1_STATUS_NOT_AVAILABLE;
            actionItems.push(recFn(item));
        });
    } else {
        const passingNames = passingItems.map(item => formatEquipmentName(item));
        let equipStr = 'All required equipment';
        if (passingNames.length > 0) {
            equipStr = `All required equipment — including the ${passingNames.join(', ')}`;
        }
        riskText = `Readiness Status: ${equipStr} — is fully verified, operational, and cleared for this procedure in Operating Room ${operating_room}.`;
        actionItems.push(`Proceed with scheduled procedure in Operating Room ${operating_room} as planned.`);
    }

    const actionText = actionItems.join(' ');
    const explanationText = `${header}\n\n${riskText}\n\nRecommended Action: ${actionText}`;

    return {
        surgery_id: assessment.surgery_id,
        surgery_code: assessment.surgery_code,
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
    RULE_RECOMMENDATIONS,
    RULE_PLAIN_EXPLANATIONS
};

