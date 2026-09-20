// Deterministic Rules Engine for AssetIQ (Stage 4) - TypeScript Interface & Re-export
import {
    evaluateAssetReadiness as evalAsset,
    aggregateSurgeryReadiness as aggSurgery,
    persistReadinessAssessment as persistAssessment
} from './engine.js';
import type { RuleStatus, AssetReadinessResult, SurgeryReadinessAssessment } from './types';

export type { RuleStatus, AssetReadinessResult, SurgeryReadinessAssessment };

export interface EvaluateAssetParams {
    asset: any;
    required_category: string;
    criticality?: 'CRITICAL' | 'IMPORTANT' | 'STANDARD' | string;
    quantity_required?: number;
    quantity_available?: number;
    breakdowns?: any[];
    config?: {
        pm_overdue_grace_days?: number;
        [key: string]: any;
    };
}

export function evaluateAssetReadiness(params: EvaluateAssetParams): AssetReadinessResult {
    return evalAsset(params);
}

export function aggregateSurgeryReadiness(
    surgery: any,
    assetResults: AssetReadinessResult[],
    config?: any
): SurgeryReadinessAssessment {
    return aggSurgery(surgery, assetResults, config);
}

export async function persistReadinessAssessment(
    supabaseClient: any,
    assessmentResult: SurgeryReadinessAssessment
): Promise<any> {
    return persistAssessment(supabaseClient, assessmentResult);
}

/**
 * Evaluates full readiness for a surgery by loading its details, required assets, assets, and breakdown incidents from Supabase.
 */
export async function evaluateSurgeryReadiness(
    supabaseClient: any,
    surgeryId: string,
    persist: boolean = false
): Promise<SurgeryReadinessAssessment> {
    // 1. Fetch readiness config
    const { data: configRows } = await supabaseClient
        .from('readiness_config')
        .select('*')
        .limit(1);
    const config = configRows && configRows.length > 0 ? configRows[0] : { pm_overdue_grace_days: 7 };

    // 2. Fetch surgery details
    const { data: surgery, error: surgeryErr } = await supabaseClient
        .from('surgeries')
        .select('*')
        .eq('id', surgeryId)
        .single();

    if (surgeryErr || !surgery) {
        throw new Error(`Surgery not found: ${surgeryId}`);
    }

    // 3. Fetch required assets
    const { data: reqAssets } = await supabaseClient
        .from('surgery_required_assets')
        .select('*, asset:assets(*)')
        .eq('surgery_id', surgeryId);

    const assetAssessments: AssetReadinessResult[] = [];

    for (const req of (reqAssets || [])) {
        const asset = req.asset;
        let breakdowns: any[] = [];
        if (asset && asset.id) {
            const { data: bData } = await supabaseClient
                .from('breakdown_incidents')
                .select('*')
                .eq('asset_id', asset.id);
            breakdowns = bData || [];
        }

        const evalRes = evaluateAssetReadiness({
            asset,
            required_category: req.asset_category || (asset ? asset.name : 'Unknown'),
            criticality: req.criticality || 'STANDARD',
            quantity_required: req.quantity_required || 1,
            quantity_available: asset ? (asset.status === 'AVAILABLE' ? 1 : 0) : 0,
            breakdowns,
            config
        });

        assetAssessments.push(evalRes);
    }

    const surgeryAssessment = aggregateSurgeryReadiness(surgery, assetAssessments, config);

    if (persist) {
        await persistReadinessAssessment(supabaseClient, surgeryAssessment);
    }

    return surgeryAssessment;
}
