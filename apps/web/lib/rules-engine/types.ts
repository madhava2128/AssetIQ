export type RuleStatus = 'NOT_READY' | 'AT_RISK' | 'READY' | 'PASS';

export interface RuleEvaluation {
    rule_id: string;
    rule_name: string;
    status: RuleStatus;
    message: string;
}

export interface AssetReadinessResult {
    asset_id: string | null;
    asset_tag: string;
    asset_name: string;
    required_category: string;
    criticality: 'CRITICAL' | 'IMPORTANT' | 'STANDARD' | string;
    quantity_required: number;
    quantity_available: number;
    status: RuleStatus;
    rule_fired: string;
    evaluations: RuleEvaluation[];
    explanation: string;
}

export interface SurgeryReadinessAssessment {
    surgery_id: string;
    surgery_code: string;
    procedure_name: string;
    operating_room: string;
    timestamp: string;
    final_status: RuleStatus;
    worst_rule_fired: string;
    triggering_rules: string[];
    asset_assessments: AssetReadinessResult[];
    explanation_text: string;
}
