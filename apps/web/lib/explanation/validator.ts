import { validateExplanation as valExp, extractKnownEntities as extKnown } from './validator.js';

export interface ValidationResult {
    isValid: boolean;
    violations: string[];
}

export function validateExplanation(
    generatedText: string,
    recommendedActions: string[],
    assessment: any
): ValidationResult {
    return valExp(generatedText, recommendedActions, assessment);
}

export function extractKnownEntities(assessment: any): any {
    return extKnown(assessment);
}
