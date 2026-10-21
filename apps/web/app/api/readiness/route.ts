import { NextRequest, NextResponse } from 'next/server';
import { evaluateAssetReadiness, aggregateSurgeryReadiness } from '../../../lib/rules-engine/engine';
const mockDb = require('../../../lib/supabase/mock-db.js');

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const surgeryId = searchParams.get('surgery_id');

        if (!surgeryId) {
            return NextResponse.json({ error: 'Missing surgery_id query parameter' }, { status: 400 });
        }

        const surgery = await mockDb.getSurgeryById(surgeryId);
        if (!surgery) {
            return NextResponse.json({ error: `Surgery with ID ${surgeryId} not found` }, { status: 404 });
        }

        // If surgery is explicitly not checked yet (e.g. scheduled in advance), return NOT_CHECKED
        if (surgery.readiness_checked === false) {
            return NextResponse.json({
                success: true,
                assessment: {
                    surgery_id: surgery.id,
                    final_status: 'NOT_CHECKED',
                    worst_rule_fired: null,
                    asset_assessments: []
                }
            });
        }

        const config = await mockDb.getReadinessConfig();
        const assetAssessments = [];

        for (const req of (surgery.required_assets || [])) {
            const asset = req.assigned_asset;
            const breakdowns = asset ? await mockDb.getBreakdownIncidents(asset.id) : [];

            const evalRes = evaluateAssetReadiness({
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

        const assessment = aggregateSurgeryReadiness(surgery, assetAssessments, config);

        return NextResponse.json({ success: true, assessment });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to evaluate readiness' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { surgery_id } = body;

        if (!surgery_id) {
            return NextResponse.json({ error: 'Missing surgery_id in request body' }, { status: 400 });
        }

        const surgery = await mockDb.getSurgeryById(surgery_id);
        if (!surgery) {
            return NextResponse.json({ error: `Surgery with ID ${surgery_id} not found` }, { status: 404 });
        }

        const config = await mockDb.getReadinessConfig();
        const assetAssessments = [];

        for (const req of (surgery.required_assets || [])) {
            const asset = req.assigned_asset;
            const breakdowns = asset ? await mockDb.getBreakdownIncidents(asset.id) : [];

            const evalRes = evaluateAssetReadiness({
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

        const assessment = aggregateSurgeryReadiness(surgery, assetAssessments, config);

        return NextResponse.json({ success: true, assessment, persisted: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to evaluate and persist readiness' }, { status: 500 });
    }
}
