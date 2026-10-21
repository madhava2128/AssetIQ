/**
 * AssetIQ ML Service Client
 * Connects the web application to the internal ML service via Vercel service binding (ML_SERVICE_URL)
 * or local fallback (http://localhost:8000).
 */

export function getMlServiceUrl(): string {
    return process.env.ML_SERVICE_URL || 'http://localhost:8000';
}

export interface MlHealthResponse {
    status: string;
    ml_layer_status: string;
    is_active: boolean;
    cold_start_threshold: number;
}

export interface MlMetricsResponse {
    status: string;
    metrics?: {
        roc_auc?: number;
        precision?: number;
        recall?: number;
        accuracy?: number;
    };
    message?: string;
}

export async function fetchMlHealth(): Promise<MlHealthResponse | null> {
    try {
        const baseUrl = getMlServiceUrl();
        const url = new URL('/health', baseUrl);
        const res = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        return null;
    }
}

export async function fetchMlMetrics(): Promise<MlMetricsResponse | null> {
    try {
        const baseUrl = getMlServiceUrl();
        const url = new URL('/metrics', baseUrl);
        const res = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        return null;
    }
}

export async function predictAssetFailure(payload: {
    asset_id?: string;
    asset?: Record<string, any>;
    features?: Record<string, any>;
    breakdowns?: any[];
    utilization?: any[];
}): Promise<any | null> {
    try {
        const baseUrl = getMlServiceUrl();
        const url = new URL('/predict', baseUrl);
        const res = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        return null;
    }
}

export async function evaluateReadinessWithMl(payload: {
    rule_status: string;
    asset: Record<string, any>;
    breakdowns?: any[];
    utilization?: any[];
}): Promise<any | null> {
    try {
        const baseUrl = getMlServiceUrl();
        const url = new URL('/evaluate-readiness', baseUrl);
        const res = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        return null;
    }
}
