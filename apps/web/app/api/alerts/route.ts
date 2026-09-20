import { NextRequest, NextResponse } from 'next/server';
import { evaluateAndFireAlerts, getFiredAlerts } from '../../../lib/alerts/alert-engine';
import { evaluateSurgeryReadiness } from '../../../lib/rules-engine/engine';
const mockDb = require('../../../lib/supabase/mock-db.js');

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');

        let alerts = getFiredAlerts();
        if (role) {
            alerts = alerts.filter(a => a.recipients.includes(role as any));
        }

        return NextResponse.json({ success: true, alerts });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to fetch alerts' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        let assessment = body.assessment;

        if (!assessment && body.surgery_id) {
            const surgery = await mockDb.getSurgeryById(body.surgery_id);
            if (!surgery) {
                return NextResponse.json({ error: `Surgery ${body.surgery_id} not found` }, { status: 404 });
            }

            const config = await mockDb.getReadinessConfig();
            const assetAssessments = [];

            for (const req of (surgery.required_assets || [])) {
                const asset = req.assigned_asset;
                const breakdowns = asset ? await mockDb.getBreakdownIncidents(asset.id) : [];

                const evalRes = require('../../../lib/rules-engine/engine').evaluateAssetReadiness({
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

            assessment = require('../../../lib/rules-engine/engine').aggregateSurgeryReadiness(surgery, assetAssessments, config);
        }

        if (!assessment) {
            return NextResponse.json({ error: 'Missing surgery_id or assessment payload' }, { status: 400 });
        }

        const newAlerts = evaluateAndFireAlerts(assessment);

        return NextResponse.json({
            success: true,
            newAlerts,
            totalFired: newAlerts.length
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Failed to process alerts' }, { status: 500 });
    }
}
