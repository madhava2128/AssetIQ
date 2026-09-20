const { evaluateAssetReadiness, aggregateSurgeryReadiness } = require('../../lib/rules-engine/engine');

/**
 * Integration helper function combining Stage 4 deterministic rules result with Stage 5 ML layer prediction.
 */
function integrateRulesAndMl(ruleResult, mlPrediction) {
    const isMlActive = mlPrediction && mlPrediction.is_active === true;
    const failureProb = mlPrediction ? (mlPrediction.failure_probability || 0.0) : 0.0;
    const ruleStatus = ruleResult.status;

    // Safety Precedence Rule 1: NOT_READY CAN NEVER be downgraded or overridden by ML layer
    if (ruleStatus === 'NOT_READY') {
        return {
            ...ruleResult,
            ml_status: isMlActive ? 'ML_LAYER_ACTIVE' : 'ML_LAYER_DORMANT: insufficient_training_data',
            ml_failure_probability: failureProb,
            final_status: 'NOT_READY',
            ml_overridden: false,
            explanation: ruleResult.explanation + (isMlActive ? ` (ML failure prob: ${(failureProb * 100).toFixed(1)}%, overridden: false)` : ' (ML Layer Dormant)')
        };
    }

    // Safety Precedence Rule 2: AT_RISK CAN NEVER be downgraded to READY
    if (ruleStatus === 'AT_RISK') {
        return {
            ...ruleResult,
            ml_status: isMlActive ? 'ML_LAYER_ACTIVE' : 'ML_LAYER_DORMANT: insufficient_training_data',
            ml_failure_probability: failureProb,
            final_status: 'AT_RISK',
            ml_overridden: false,
            explanation: ruleResult.explanation + (isMlActive ? ` (ML failure prob: ${(failureProb * 100).toFixed(1)}%)` : ' (ML Layer Dormant)')
        };
    }

    // Safety Precedence Rule 3: PASS / READY can be upgraded to AT_RISK if ML signals high failure risk
    if (ruleStatus === 'PASS' || ruleStatus === 'READY') {
        if (isMlActive && failureProb >= 0.35) {
            return {
                ...ruleResult,
                ml_status: 'ML_LAYER_ACTIVE',
                ml_failure_probability: failureProb,
                status: 'AT_RISK',
                final_status: 'AT_RISK',
                ml_overridden: true,
                explanation: ruleResult.explanation + ` [ML Risk Upgrade: Predicted breakdown probability ${(failureProb * 100).toFixed(1)}% >= threshold 35%]`
            };
        }
        return {
            ...ruleResult,
            ml_status: isMlActive ? 'ML_LAYER_ACTIVE' : 'ML_LAYER_DORMANT: insufficient_training_data',
            ml_failure_probability: failureProb,
            final_status: 'READY',
            ml_overridden: false
        };
    }

    return {
        ...ruleResult,
        final_status: ruleStatus,
        ml_overridden: false
    };
}

describe('Stage 5 — XGBoost Prediction Layer Integration Tests', () => {
    test('Cold-start handling: ML dormant state preserves rules engine result without failure', () => {
        const asset = {
            id: 'ast-dormant-1',
            asset_tag: 'AST-DORM',
            name: 'Ventilator V1',
            status: 'AVAILABLE',
            warranty_expiration_date: '2030-01-01',
            next_pm_due_date: '2030-01-01'
        };

        const ruleRes = evaluateAssetReadiness({
            asset,
            required_category: 'Ventilator',
            criticality: 'STANDARD',
            quantity_required: 1,
            quantity_available: 1
        });

        const dormantMlPrediction = {
            is_active: false,
            status: 'ML_LAYER_DORMANT: insufficient_training_data',
            failure_probability: 0.0,
            risk_level: 'LOW'
        };

        const integrated = integrateRulesAndMl(ruleRes, dormantMlPrediction);

        expect(integrated.final_status).toBe('READY');
        expect(integrated.ml_status).toBe('ML_LAYER_DORMANT: insufficient_training_data');
        expect(integrated.ml_overridden).toBe(false);
    });

    test('Acceptance Criterion: ML prediction NEVER overrides a NOT_READY rules result', () => {
        const notReadyAsset = {
            id: 'ast-nr-01',
            asset_tag: 'AST-REPAIR',
            name: 'Anesthesia System',
            status: 'UNDER_REPAIR',
            warranty_expiration_date: '2030-01-01',
            next_pm_due_date: '2030-01-01'
        };

        const ruleRes = evaluateAssetReadiness({
            asset: notReadyAsset,
            required_category: 'Anesthesia System',
            criticality: 'CRITICAL',
            quantity_required: 1,
            quantity_available: 1
        });

        expect(ruleRes.status).toBe('NOT_READY');

        // Test with low ML failure probability (0.02)
        const lowRiskMl = { is_active: true, failure_probability: 0.02, risk_level: 'LOW' };
        const integratedLow = integrateRulesAndMl(ruleRes, lowRiskMl);

        expect(integratedLow.final_status).toBe('NOT_READY');
        expect(integratedLow.ml_overridden).toBe(false);

        // Test with high ML failure probability (0.92)
        const highRiskMl = { is_active: true, failure_probability: 0.92, risk_level: 'HIGH' };
        const integratedHigh = integrateRulesAndMl(ruleRes, highRiskMl);

        expect(integratedHigh.final_status).toBe('NOT_READY');
        expect(integratedHigh.ml_overridden).toBe(false);
    });

    test('ML layer upgrades PASS to AT_RISK when failure probability exceeds threshold', () => {
        const clearAsset = {
            id: 'ast-pass-1',
            asset_tag: 'AST-CLEAR',
            name: 'Patient Monitor',
            status: 'AVAILABLE',
            warranty_expiration_date: '2030-01-01',
            next_pm_due_date: '2030-01-01'
        };

        const ruleRes = evaluateAssetReadiness({
            asset: clearAsset,
            required_category: 'Patient Monitor',
            criticality: 'IMPORTANT',
            quantity_required: 1,
            quantity_available: 1
        });

        expect(ruleRes.status).toBe('PASS');

        const highMlRisk = { is_active: true, failure_probability: 0.65, risk_level: 'MEDIUM' };
        const integrated = integrateRulesAndMl(ruleRes, highMlRisk);

        expect(integrated.final_status).toBe('AT_RISK');
        expect(integrated.ml_overridden).toBe(true);
        expect(integrated.explanation).toContain('ML Risk Upgrade');
    });
});
