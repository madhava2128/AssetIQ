import { NextRequest, NextResponse } from 'next/server';
import { generatePdfReportDocument } from '../../../../lib/reports/pdf-generator';
const mockDb = require('../../../../lib/supabase/mock-db.js');

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const reportType = (searchParams.get('type') || 'DAILY').toUpperCase();
        const startDate = searchParams.get('start_date') || '2026-09-18';
        const endDate = searchParams.get('end_date') || '2026-09-18';

        // Fetch live surgeries and assets
        const surgeries = await mockDb.getSurgeries();
        const assets = await mockDb.getAssets();

        // Evaluate readiness dynamically for surgeries
        const evaluatedSurgeries = await Promise.all(
            (surgeries || []).map(async (s: any) => {
                try {
                    const config = await mockDb.getReadinessConfig();
                    const assetAssessments = [];

                    for (const req of (s.required_assets || [])) {
                        const asset = req.assigned_asset;
                        const breakdowns = asset ? await mockDb.getBreakdownIncidents(asset.id) : [];

                        const evalRes = require('../../../../lib/rules-engine/engine').evaluateAssetReadiness({
                            asset,
                            required_category: req.required_category,
                            criticality: req.criticality,
                            quantity_required: req.quantity || 1,
                            quantity_available: asset ? (asset.status === 'AVAILABLE' ? 1 : 0) : 0,
                            breakdowns,
                            config
                        });
                        assetAssessments.push(evalRes);
                    }

                    const assessment = require('../../../../lib/rules-engine/engine').aggregateSurgeryReadiness(s, assetAssessments, config);
                    return {
                        ...s,
                        readiness_status: assessment.final_status,
                        worst_rule_fired: assessment.worst_rule_fired,
                        assessment
                    };
                } catch (e) {
                    return s;
                }
            })
        );

        const { doc } = generatePdfReportDocument({
            reportType,
            startDate,
            endDate,
            surgeries: evaluatedSurgeries,
            assets
        });

        const pdfArrayBuffer = doc.output('arraybuffer');
        const filename = `assetiq-${reportType.toLowerCase()}-report-${startDate}.pdf`;

        return new NextResponse(pdfArrayBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to generate PDF report' }, { status: 500 });
    }
}
