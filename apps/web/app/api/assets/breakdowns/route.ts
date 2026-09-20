import { NextResponse } from 'next/server';
import {
    getBreakdownIncidents,
    createBreakdownIncident,
    resolveBreakdownIncident
} from '../../../../lib/supabase/mock-db';
import { verifyRolePermission } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const assetId = searchParams.get('asset_id') || undefined;
        const incidents = await getBreakdownIncidents(assetId);
        return NextResponse.json({ success: true, count: incidents.length, data: incidents });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const auth = verifyRolePermission(authHeader, ['biomedical_engineer', 'hospital_admin']);
        if (!auth.allowed) {
            return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
        }

        const body = await request.json();

        if (!body.asset_id) {
            return NextResponse.json(
                { success: false, error: 'Missing required field: asset_id' },
                { status: 400 }
            );
        }

        // Automatic timestamped reported_at
        const newIncident = await createBreakdownIncident({
            ...body,
            reported_at: new Date().toISOString()
        });

        return NextResponse.json({ success: true, data: newIncident }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const auth = verifyRolePermission(authHeader, ['biomedical_engineer', 'hospital_admin']);
        if (!auth.allowed) {
            return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
        }

        const body = await request.json();

        if (!body.id) {
            return NextResponse.json(
                { success: false, error: 'Missing breakdown incident id' },
                { status: 400 }
            );
        }

        // Requires severity and failure_type before resolving
        const resolvedIncident = await resolveBreakdownIncident(body.id, {
            severity: body.severity,
            failure_type: body.failure_type,
            resolution_notes: body.resolution_notes,
            downtime_hours: body.downtime_hours
        });

        return NextResponse.json({ success: true, data: resolvedIncident });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}
