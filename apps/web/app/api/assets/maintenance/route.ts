import { NextResponse } from 'next/server';
import { getMaintenanceRecords, createMaintenanceRecord } from '../../../../lib/supabase/mock-db';
import { verifyRolePermission } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const assetId = searchParams.get('asset_id') || undefined;
        const records = await getMaintenanceRecords(assetId);
        return NextResponse.json({ success: true, count: records.length, data: records });
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

        // Enforce required asset_id
        if (!body.asset_id) {
            return NextResponse.json(
                { success: false, error: 'Missing required field: asset_id' },
                { status: 400 }
            );
        }

        const newRecord = await createMaintenanceRecord(body);
        return NextResponse.json({ success: true, data: newRecord }, { status: 201 });
    } catch (error: any) {
        // Enforce Acceptance Criterion 1 (Cannot create maintenance record referencing nonexistent asset)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}
