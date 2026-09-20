import { NextResponse } from 'next/server';
import { getSurgeryById, updateSurgery, cancelSurgery } from '../../../../lib/supabase/mock-db';
import { verifyRolePermission } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const surgery = await getSurgeryById(params.id);
        if (!surgery) {
            return NextResponse.json(
                { success: false, error: 'Surgery not found' },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, data: surgery });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('authorization');
        const auth = verifyRolePermission(authHeader, ['ot_admin', 'hospital_admin']);
        if (!auth.allowed) {
            return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
        }

        const body = await request.json();
        const updatedSurgery = await updateSurgery(params.id, body);
        return NextResponse.json({ success: true, data: updatedSurgery });
    } catch (error: any) {
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
        const auth = verifyRolePermission(authHeader, ['ot_admin', 'hospital_admin']);
        if (!auth.allowed) {
            return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
        }

        const cancelledSurgery = await cancelSurgery(params.id);
        return NextResponse.json({
            success: true,
            message: 'Surgery cancelled successfully',
            data: cancelledSurgery
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
