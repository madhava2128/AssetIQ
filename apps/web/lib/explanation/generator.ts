import { generateExplanation as genExp } from './generator.js';
import type { ExplanationResponse } from './templates';

export type { ExplanationResponse };

export interface GeneratorOptions {
    maxAttempts?: number;
    llmProvider?: (systemPrompt: string, assessment: any) => Promise<string>;
    forceHallucination?: boolean;
    forceHallucinatedNumber?: boolean;
}

export async function generateExplanation(
    assessment: any,
    options?: GeneratorOptions
): Promise<ExplanationResponse> {
    return genExp(assessment, options);
}
