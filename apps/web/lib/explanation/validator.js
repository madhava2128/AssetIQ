// Hallucination Validator for AssetIQ Explanation Layer (Stage 6)
// Strictly validates generated explanation text against structured input JSON payload.

/**
 * Extract all valid strings, numbers, asset tags, and status keywords from assessment JSON.
 */
function extractKnownEntities(assessment) {
    const knownTags = new Set();
    const knownNames = new Set();
    const knownCategories = new Set();
    const knownStatuses = new Set(['NOT_READY', 'AT_RISK', 'READY', 'PASS', 'AVAILABLE', 'UNDER_REPAIR', 'IN_MAINTENANCE', 'SCHEDULED', 'CANCELLED']);
    const knownNumbers = new Set();

    // Surgery level attributes
    if (assessment.surgery_code) knownTags.add(assessment.surgery_code.toUpperCase());
    if (assessment.operating_room) knownTags.add(assessment.operating_room.toUpperCase());
    if (assessment.final_status) knownStatuses.add(assessment.final_status.toUpperCase());
    if (assessment.worst_rule_fired) knownTags.add(assessment.worst_rule_fired.toUpperCase());

    // Extract text strings into words
    function addTextNumbersAndWords(str) {
        if (!str) return;
        const numbers = str.match(/\b\d+(\.\d+)?\b/g);
        if (numbers) {
            numbers.forEach(n => knownNumbers.add(n));
        }
    }

    addTextNumbersAndWords(JSON.stringify(assessment));

    // Extract asset assessments details
    const assetList = assessment.asset_assessments || [];
    assetList.forEach(asset => {
        if (asset.asset_tag && asset.asset_tag !== 'UNASSIGNED') knownTags.add(asset.asset_tag.toUpperCase());
        if (asset.asset_name) knownNames.add(asset.asset_name.toLowerCase());
        if (asset.required_category) knownCategories.add(asset.required_category.toLowerCase());
        if (asset.status) knownStatuses.add(asset.status.toUpperCase());
        if (asset.rule_fired) knownTags.add(asset.rule_fired.toUpperCase());

        if (asset.quantity_required !== undefined) knownNumbers.add(String(asset.quantity_required));
        if (asset.quantity_available !== undefined) knownNumbers.add(String(asset.quantity_available));
    });

    return {
        knownTags,
        knownNames,
        knownCategories,
        knownStatuses,
        knownNumbers
    };
}

/**
 * Validates generated explanation text and recommended actions against input payload.
 * Returns { isValid: boolean, violations: string[] }
 */
function validateExplanation(generatedText, recommendedActions, assessment) {
    const violations = [];
    const fullText = (generatedText + ' ' + (recommendedActions || []).join(' ')).trim();
    const fullTextUpper = fullText.toUpperCase();

    const entities = extractKnownEntities(assessment);

    // 1. Check for fabricated asset tags (pattern AST-\w+ or ASSET-\w+)
    const tagMatches = fullTextUpper.match(/\b(AST|ASSET)-[A-Z0-9-]+\b/g) || [];
    for (const tag of tagMatches) {
        if (!entities.knownTags.has(tag)) {
            violations.push(`Fabricated asset tag detected: '${tag}' is not present in input payload.`);
        }
    }

    // 2. Check for contradictory status determination
    const finalStatus = (assessment.final_status || '').toUpperCase();
    if (finalStatus === 'NOT_READY' && (fullTextUpper.includes('FULLY READY') || fullTextUpper.includes('DETERMINATION: READY'))) {
        violations.push(`Status contradiction: Input final_status is NOT_READY but generated text claims READY.`);
    }

    // 3. Check for fabricated asset types / equipment not in input
    const suspiciousAssets = ['MRI SCANNER', 'CT SCANNER', 'ROBOTIC SURGICAL SYSTEM', 'HYPERBARIC CHAMBER', 'PET SCANNER', 'HEART-LUNG MACHINE'];
    for (const sysAsset of suspiciousAssets) {
        if (fullTextUpper.includes(sysAsset)) {
            const isKnown = Array.from(entities.knownCategories).some(c => c.toUpperCase().includes(sysAsset)) ||
                            Array.from(entities.knownNames).some(n => n.toUpperCase().includes(sysAsset));
            if (!isKnown) {
                violations.push(`Fabricated equipment type detected: '${sysAsset}' not present in input payload.`);
            }
        }
    }

    // 4. Check for arbitrary un-grounded numbers (e.g. "overdue by 999 days")
    const textNumbers = fullText.match(/\b\d+\b/g) || [];
    for (const numStr of textNumbers) {
        const num = parseInt(numStr, 10);
        // Ignore common small numbers (1-5, year prefixes like 2026, or numbers explicitly present in input)
        if (num > 10 && num < 1900 && !entities.knownNumbers.has(numStr) && !entities.knownNumbers.has(String(num))) {
            // Check if present anywhere in stringified payload
            const jsonPayloadStr = JSON.stringify(assessment);
            if (!jsonPayloadStr.includes(numStr)) {
                violations.push(`Fabricated numerical value detected: '${numStr}' not grounded in input payload.`);
            }
        }
    }

    // 5. Readability Check: Un-translated internal rule codes (e.g. RULE_4_WARRANTY_CONTRACT_EXPIRED)
    const ruleCodeMatches = fullText.match(/\bRULE_\d+(_[A-Z0-9_]+)?\b/g) || [];
    for (const ruleCode of ruleCodeMatches) {
        violations.push(`Readability violation: Generated text contains raw internal rule code '${ruleCode}' instead of plain English.`);
    }

    // 6. Readability Check: Bracketed internal asset tags or category labels (e.g. [AST-CARM-002], [ANESTHESIA_MACHINE - CRITICAL])
    const bracketMatches = fullText.match(/\[[A-Z0-9_ -]+\]/gi) || [];
    for (const bMatch of bracketMatches) {
        violations.push(`Readability violation: Generated text contains bracketed internal label '${bMatch}'.`);
    }

    // 7. Readability Check: Raw status enum dumps (e.g. "Status PASS (", "Status AT_RISK (")
    const rawStatusMatches = fullText.match(/\bStatus\s+(PASS|AT_RISK|NOT_READY|UNDER_REPAIR)\b/gi) || [];
    for (const sMatch of rawStatusMatches) {
        violations.push(`Readability violation: Generated text contains raw status dump '${sMatch}'.`);
    }

    return {
        isValid: violations.length === 0,
        violations
    };
}

module.exports = {
    extractKnownEntities,
    validateExplanation
};
