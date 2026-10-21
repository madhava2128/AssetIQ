import { NextResponse } from 'next/server';
import {
    getAssetById,
    updateAsset,
    deleteAsset,
    getMaintenanceRecords,
    getBreakdownIncidents,
    getReadinessConfig
} from '../../../../lib/supabase/mock-db';
import { verifyRolePermission } from '@/lib/auth';
import { evaluateAssetReadiness } from '@/lib/rules-engine/engine';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const asset = await getAssetById(params.id);
        if (!asset) {
            return NextResponse.json(
                { success: false, error: 'Asset not found' },
                { status: 404, headers: { 'Cache-Control': 'no-store, must-revalidate' } }
            );
        }

        const maintenanceHistory = await getMaintenanceRecords(params.id);
        const breakdownHistory = await getBreakdownIncidents(params.id);
        const config = await getReadinessConfig();

        const readiness = evaluateAssetReadiness({
            asset,
            required_category: asset.category || asset.name,
            criticality: asset.criticality || 'STANDARD',
            quantity_required: 1,
            quantity_available: asset.status === 'AVAILABLE' ? 1 : 0,
            breakdowns: breakdownHistory,
            config
        });

        return NextResponse.json({
            success: true,
            data: {
                ...asset,
                maintenance_history: maintenanceHistory,
                breakdown_history: breakdownHistory,
                readiness
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, must-revalidate'
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500, headers: { 'Cache-Control': 'no-store, must-revalidate' } }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('authorization');
        const auth = verifyRolePermission(authHeader, ['biomedical_engineer', 'hospital_admin']);
        if (!auth.allowed) {
            return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
        }

        const body = await request.json();
        const updatedAsset = await updateAsset(params.id, body);
        return NextResponse.json({ success: true, data: updatedAsset });
    } catch (error: any) {
        // Enforce safety error status (e.g. 400 for open breakdown when setting AVAILABLE)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('authorization');
        const auth = verifyRolePermission(authHeader, ['biomedical_engineer', 'hospital_admin']);
        if (!auth.allowed) {
            return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
        }

        const deleted = await deleteAsset(params.id);
        if (!deleted) {
            return NextResponse.json(
                { success: false, error: 'Asset not found or deletion failed' },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, message: 'Asset deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
