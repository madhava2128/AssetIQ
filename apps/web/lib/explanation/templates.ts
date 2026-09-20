import { generateTemplatedExplanation as genTemplated } from './templates.js';

export interface ExplanationResponse {
    surgery_id: string;
    surgery_code: string;
    procedure_name: string;
    operating_room: string;
    final_status: string;
    worst_rule_fired: string;
    explanation: string;
    recommended_actions: string[];
    is_llm_generated: boolean;
    fallback_used: boolean;
    validation_passed?: boolean;
    attempts?: number;
    validation_errors?: string[];
}

export function generateTemplatedExplanation(assessment: any): ExplanationResponse {
    return genTemplated(assessment);
}
