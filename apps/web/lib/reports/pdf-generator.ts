import {
    computeReportStatistics as computeStats,
    generatePdfReportDocument as genPdfDoc
} from './pdf-generator.js';

export interface ReportStats {
    totalSurgeries: number;
    readyCount: number;
    atRiskCount: number;
    notReadyCount: number;
    readyPct: string;
    atRiskPct: string;
    notReadyPct: string;
    totalAssets: number;
    underRepairAssets: number;
    pmOverdueAssets: number;
}

export function computeReportStatistics(surgeries: any[], assets: any[], assessments: any[]): ReportStats {
    return computeStats(surgeries, assets, assessments);
}

export function generatePdfReportDocument(params: any): { doc: any; stats: ReportStats } {
    return genPdfDoc(params);
}
