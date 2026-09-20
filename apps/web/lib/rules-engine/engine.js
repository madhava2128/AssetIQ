// Deterministic Rules Engine for AssetIQ (Stage 4)
// Pure, standalone rules engine logic operating in strict precedence order

/**
 * Evaluates a single required asset against the 7 deterministic rules in exact precedence order.
 * First match wins — later rules CANNOT override an earlier NOT_READY or AT_RISK.
 */
function evaluateAssetReadiness(params) {
    const {
        asset,
        required_category,
        criticality = 'STANDARD',
        quantity_required = 1,
        quantity_available = 1,
        breakdowns = [],
        config = { pm_overdue_grace_days: 7 }
    } = params;

    const now = new Date();

    function buildResult(ruleId, ruleName, status, message) {
        return {
            asset_id: asset ? asset.id : null,
            asset_tag: asset ? asset.asset_tag : 'UNASSIGNED',
            asset_name: asset ? asset.name : `Required: ${required_category}`,
            required_category,
            criticality,
            quantity_required,
            quantity_available,
            status,
            rule_fired: ruleId,
            rule_name: ruleName,
            explanation: message
        };
    }

    // Missing / Unassigned asset check -> Rule 3 deficit
    if (!asset) {
        return buildResult(
            'RULE_3_QUANTITY_DEFICIT',
            'Quantity Deficit / Unassigned Asset',
            'NOT_READY',
            `No assigned asset for required category '${required_category}' (Required: ${quantity_required}, Available: ${quantity_available}).`
        );
    }

    const assetStatus = (asset.status || '').toUpperCase();

    // Rule 2: status == "Under Repair" -> NOT_READY
    if (assetStatus === 'UNDER_REPAIR' || assetStatus === 'UNDER REPAIR') {
        return buildResult(
            'RULE_2_STATUS_UNDER_REPAIR',
            'Asset Under Repair',
            'NOT_READY',
            `Asset '${asset.name}' [${asset.asset_tag}] status is UNDER_REPAIR.`
        );
    }

    // Rule 1: status != "Available" -> NOT_READY
    if (assetStatus !== 'AVAILABLE') {
        return buildResult(
            'RULE_1_STATUS_NOT_AVAILABLE',
            'Asset Not Available',
            'NOT_READY',
            `Asset '${asset.name}' [${asset.asset_tag}] status is '${asset.status}' (must be AVAILABLE).`
        );
    }

    // Rule 3: quantity_required > quantity_available -> NOT_READY
    if (quantity_required > quantity_available) {
        return buildResult(
            'RULE_3_QUANTITY_DEFICIT',
            'Quantity Deficit',
            'NOT_READY',
            `Required quantity (${quantity_required}) exceeds available assets (${quantity_available}) for category '${required_category}'.`
        );
    }

    // Rule 4: warranty_end_date < today OR contract expired -> AT_RISK
    const warrantyDateStr = asset.warranty_end_date || asset.warranty_expiration_date;
    if (warrantyDateStr || asset.contract_end_date || asset.contract_expired || asset.contract_status === 'Expired') {
        const warrantyDate = warrantyDateStr ? new Date(warrantyDateStr) : null;
        const contractDate = asset.contract_end_date ? new Date(asset.contract_end_date) : null;

        const isWarrantyExpired = warrantyDate && warrantyDate < now;
        const isContractExpired = (contractDate && contractDate < now) || asset.contract_expired === true || asset.contract_status === 'Expired';

        if (isWarrantyExpired || isContractExpired) {
            const expDetail = isWarrantyExpired
                ? `warranty expired on ${warrantyDateStr.split('T')[0]}`
                : `contract expired`;
            return buildResult(
                'RULE_4_WARRANTY_CONTRACT_EXPIRED',
                'Warranty / Contract Expired',
                'AT_RISK',
                `Asset '${asset.name}' [${asset.asset_tag}] has ${expDetail}.`
            );
        }
    }

    // Rule 5: PM overdue beyond the grace period defined in readiness_config -> AT_RISK
    if (asset.next_pm_due_date) {
        const graceDays = config.pm_overdue_grace_days !== undefined ? config.pm_overdue_grace_days : 7;
        const dueDate = new Date(asset.next_pm_due_date);
        const graceDeadline = new Date(dueDate.getTime() + graceDays * 24 * 3600 * 1000);

        if (now > graceDeadline) {
            return buildResult(
                'RULE_5_PM_OVERDUE_BEYOND_GRACE',
                'PM Overdue Beyond Grace Period',
                'AT_RISK',
                `Asset '${asset.name}' [${asset.asset_tag}] PM is overdue beyond the ${graceDays}-day grace period (due date: ${asset.next_pm_due_date.split('T')[0]}).`
            );
        }
    }

    // Rule 6: Asset is CRITICAL and has a breakdown incident in the last 30 days -> AT_RISK
    const assetCriticality = (criticality || asset.criticality || 'STANDARD').toUpperCase();
    if (assetCriticality === 'CRITICAL' && breakdowns && breakdowns.length > 0) {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
        const recentBreakdown = breakdowns.find(b => {
            const reportedAt = new Date(b.reported_at);
            return reportedAt >= thirtyDaysAgo;
        });

        if (recentBreakdown) {
            return buildResult(
                'RULE_6_CRITICAL_BREAKDOWN_LAST_30_DAYS',
                'Critical Asset Recent Breakdown History',
                'AT_RISK',
                `CRITICAL asset '${asset.name}' [${asset.asset_tag}] had a breakdown incident reported in the last 30 days (${recentBreakdown.reported_at.split('T')[0]}).`
            );
        }
    }

    // Rule 7: None of the above -> PASS (defer to ML layer in Stage 5)
    return buildResult(
        'RULE_7_ALL_CHECKS_PASSED',
        'All Deterministic Safety Checks Passed',
        'PASS',
        `Asset '${asset.name}' [${asset.asset_tag}] passed all 6 safety rules.`
    );
}

/**
 * Aggregates individual asset evaluations into a surgery-level readiness result.
 * Worst status wins: NOT_READY > AT_RISK > READY/PASS.
 * Configurable via readiness_config parameters (defaults to safety-conservative worst-status).
 */
function aggregateSurgeryReadiness(surgery, assetResults, config = {}) {
    const strictWorstStatus = config.strict_worst_status !== false;

    let finalStatus = 'READY';

    if (strictWorstStatus) {
        const hasNotReady = assetResults.some(r => r.status === 'NOT_READY');
        const hasAtRisk = assetResults.some(r => r.status === 'AT_RISK');

        if (hasNotReady) {
            finalStatus = 'NOT_READY';
        } else if (hasAtRisk) {
            finalStatus = 'AT_RISK';
        }
    } else {
        // Custom criticality weighting logic
        const criticalNotReady = assetResults.some(r => r.status === 'NOT_READY' && r.criticality === 'CRITICAL');
        const anyNotReady = assetResults.some(r => r.status === 'NOT_READY');
        const anyAtRisk = assetResults.some(r => r.status === 'AT_RISK');

        if (criticalNotReady) {
            finalStatus = 'NOT_READY';
        } else if (anyNotReady) {
            finalStatus = config.allow_standard_downgrade ? 'AT_RISK' : 'NOT_READY';
        } else if (anyAtRisk) {
            finalStatus = 'AT_RISK';
        }
    }

    const triggeringRules = Array.from(
        new Set(assetResults.filter(r => r.status !== 'PASS' && r.status !== 'READY').map(r => r.rule_fired))
    );

    const worstResult = assetResults.find(r => r.status === finalStatus) || assetResults[0];

    const explanationParts = assetResults.map(r => `[${r.required_category} (${r.criticality})]: ${r.explanation}`);
    const summaryHeader = `Surgery '${surgery.procedure_name}' (${surgery.surgery_code}) evaluated as ${finalStatus}.`;
    const explanationText = `${summaryHeader}\nDetails:\n` + explanationParts.join('\n');

    return {
        surgery_id: surgery.id,
        surgery_code: surgery.surgery_code,
        procedure_name: surgery.procedure_name,
        operating_room: surgery.operating_room,
        timestamp: new Date().toISOString(),
        final_status: finalStatus,
        worst_rule_fired: worstResult ? worstResult.rule_fired : 'RULE_7_ALL_CHECKS_PASSED',
        triggering_rules: triggeringRules,
        asset_assessments: assetResults,
        explanation_text: explanationText
    };
}

/**
 * Persists assessment results to Supabase readiness_assessments table
 */
async function persistReadinessAssessment(supabaseClient, assessmentResult) {
    if (!supabaseClient || !assessmentResult) return null;

    const recordsToInsert = assessmentResult.asset_assessments.map(assetRes => ({
        surgery_id: assessmentResult.surgery_id,
        asset_id: assetRes.asset_id || null,
        timestamp: new Date().toISOString(),
        rule_result: {
            rule_fired: assetRes.rule_fired,
            rule_name: assetRes.rule_name,
            status: assetRes.status,
            required_category: assetRes.required_category,
            criticality: assetRes.criticality,
            explanation: assetRes.explanation
        },
        ml_risk_score: 0,
        final_status: assetRes.status,
        explanation_text: assetRes.explanation
    }));

    // Add overall surgery assessment summary record (asset_id = null)
    recordsToInsert.push({
        surgery_id: assessmentResult.surgery_id,
        asset_id: null,
        timestamp: new Date().toISOString(),
        rule_result: {
            worst_rule_fired: assessmentResult.worst_rule_fired,
            triggering_rules: assessmentResult.triggering_rules,
            total_assets_assessed: assessmentResult.asset_assessments.length
        },
        ml_risk_score: 0,
        final_status: assessmentResult.final_status,
        explanation_text: assessmentResult.explanation_text
    });

    const { data, error } = await supabaseClient
        .from('readiness_assessments')
        .insert(recordsToInsert)
        .select();

    if (error) {
        console.error('Error persisting readiness assessment:', error);
        throw error;
    }

    return data;
}

module.exports = {
    evaluateAssetReadiness,
    aggregateSurgeryReadiness,
    persistReadinessAssessment
};
