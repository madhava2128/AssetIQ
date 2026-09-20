// Alerting & Deduplication Engine for AssetIQ (Stage 8)
// Automatically fires alerts on NOT_READY or AT_RISK transitions with 24h deduplication & escalation rules.

// In-memory alert store
const alertHistoryStore = [];

/**
 * Resets alert history store (useful for testing)
 */
function resetAlertHistory() {
    alertHistoryStore.length = 0;
}

/**
 * Retrieves all fired alerts
 */
function getFiredAlerts() {
    return [...alertHistoryStore];
}

/**
 * Processes a surgery readiness assessment and fires alerts according to escalation & 24h deduplication rules.
 */
function evaluateAndFireAlerts(assessment, now = new Date()) {
    if (!assessment) return [];

    const {
        surgery_id,
        surgery_code = 'SURG-UNK',
        procedure_name = 'Procedure',
        operating_room = 'OR',
        final_status,
        worst_rule_fired = 'RULE_7_ALL_CHECKS_PASSED',
        asset_assessments = []
    } = assessment;

    // Only fire alerts if final_status is NOT_READY or AT_RISK
    const statusUpper = (final_status || '').toUpperCase();
    if (statusUpper !== 'NOT_READY' && statusUpper !== 'AT_RISK') {
        return [];
    }

    const nowTs = now.getTime();
    const twentyFourHoursAgoTs = nowTs - (24 * 3600 * 1000);
    const newAlertsFired = [];

    // Find triggering asset items
    const nonPassItems = asset_assessments.filter(a => a.status === 'NOT_READY' || a.status === 'AT_RISK');
    const itemsToProcess = nonPassItems.length > 0 ? nonPassItems : [{
        asset_id: null,
        asset_tag: 'SYSTEM',
        asset_name: 'Required Assets',
        status: statusUpper,
        rule_fired: worst_rule_fired,
        explanation: assessment.explanation_text || 'Surgery failed safety evaluation'
    }];

    for (const item of itemsToProcess) {
        const assetId = item.asset_id || 'GLOBAL';
        const itemStatus = (item.status || statusUpper).toUpperCase();
        const triggeringCondition = item.rule_fired || worst_rule_fired;

        // Determine severity & recipients
        let severity = 'WARNING';
        let recipients = ['biomedical_engineer'];

        if (itemStatus === 'NOT_READY') {
            severity = 'CRITICAL';
            recipients = ['biomedical_engineer', 'hospital_admin'];
        }

        const dedupKey = `${surgery_id}:${assetId}:${triggeringCondition}`;
        const assetDedupPrefix = `${surgery_id}:${assetId}:`;

        // Find existing alert for same surgery + asset in last 24h
        const existingAssetAlert = alertHistoryStore.find(a => {
            const aTs = new Date(a.timestamp).getTime();
            return a.dedupKey.startsWith(assetDedupPrefix) && aTs >= twentyFourHoursAgoTs;
        });

        const exactDuplicateAlert = alertHistoryStore.find(a => {
            const aTs = new Date(a.timestamp).getTime();
            return a.dedupKey === dedupKey && aTs >= twentyFourHoursAgoTs;
        });

        let shouldFire = false;
        let isEscalation = false;

        if (!existingAssetAlert) {
            shouldFire = true;
        } else if (existingAssetAlert.severity === 'WARNING' && severity === 'CRITICAL') {
            shouldFire = true;
            isEscalation = true;
        } else if (!exactDuplicateAlert) {
            shouldFire = true;
        }

        if (shouldFire) {
            const alertObj = {
                id: `alt-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`,
                dedupKey,
                surgery_id,
                surgery_code,
                procedure_name,
                operating_room,
                asset_id: item.asset_id || null,
                asset_tag: item.asset_tag || 'UNASSIGNED',
                asset_name: item.asset_name || item.required_category || 'Equipment',
                severity,
                status_transition: itemStatus,
                triggering_condition: triggeringCondition,
                recipients,
                message: isEscalation
                    ? `[ESCALATION CRITICAL] Surgery '${procedure_name}' (${surgery_code}) in ${operating_room} escalated from AT_RISK to NOT_READY! Trigger: ${triggeringCondition}. Immediate action required by Biomedical Engineering & Hospital Admin.`
                    : `[ALERT ${severity}] Surgery '${procedure_name}' (${surgery_code}) in ${operating_room} status is ${itemStatus}. Trigger: ${triggeringCondition} on asset '${item.asset_name}' [${item.asset_tag}].`,
                is_escalation: isEscalation,
                timestamp: now.toISOString()
            };

            alertHistoryStore.push(alertObj);
            newAlertsFired.push(alertObj);
        }
    }

    return newAlertsFired;
}

module.exports = {
    evaluateAndFireAlerts,
    getFiredAlerts,
    resetAlertHistory
};
