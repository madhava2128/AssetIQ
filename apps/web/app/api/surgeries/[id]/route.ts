import { NextResponse } from 'next/server';
import { getSharedSurgeries, updateSurgeryAtomic, cancelSurgeryAtomic } from '@/lib/db';
import { getSurgeryById as getMockSurgeryById, updateSurgery as updateMockSurgery, cancelSurgery as cancelMockSurgery } from '@/lib/supabase/mock-db';
import { verifyRolePermission } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        try {
            const list = await getSharedSurgeries({ id: params.id });
            if (list.length > 0) {
                return NextResponse.json({ success: true, data: list[0] });
            }
        } catch (dbErr: any) {
            console.warn('[Surgery GET by ID] Falling back to mock-db:', dbErr.message);
        }

        const surgery = await getMockSurgeryById(params.id);
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
    const authHeader = request.headers.get('authorization');
    const auth = verifyRolePermission(authHeader, ['ot_admin', 'hospital_admin']);
    if (!auth.allowed || !auth.role) {
        console.error('[Surgery Edit Refused]', {
            status: auth.status,
            message: auth.message
        });
        return NextResponse.json(
            { success: false, error: auth.message || 'FORBIDDEN: You do not have permission to edit surgeries.' },
            { status: auth.status }
        );
    }

    try {
        const body = await request.json();
        const updatedSurgery = await updateSurgeryAtomic(auth.role, params.id, body);

        // Sync with mock-db
        try {
            await updateMockSurgery(params.id, body);
        } catch {
            // Non-critical
        }

        return NextResponse.json({ success: true, data: updatedSurgery });
    } catch (error: any) {
        console.error('[Surgery Update Failure]', {
            role: auth.role,
            surgeryId: params.id,
            error: error.message
        });
        const isPermission = error.code === '42501' || error.message?.includes('FORBIDDEN');
        return NextResponse.json(
            { success: false, error: error.message },
            { status: isPermission ? 403 : 400 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const authHeader = request.headers.get('authorization');
    const auth = verifyRolePermission(authHeader, ['ot_admin', 'hospital_admin']);
    if (!auth.allowed || !auth.role) {
        console.error('[Surgery Cancel Refused]', {
            status: auth.status,
            message: auth.message
        });
        return NextResponse.json(
            { success: false, error: auth.message || 'FORBIDDEN: You do not have permission to cancel surgeries.' },
            { status: auth.status }
        );
    }

    try {
        const cancelledSurgery = await cancelSurgeryAtomic(auth.role, params.id);

        // Sync with mock-db
        try {
            await cancelMockSurgery(params.id);
        } catch {
            // Non-critical
        }

        return NextResponse.json({
            success: true,
            message: 'Surgery cancelled successfully',
            data: cancelledSurgery
        });
    } catch (error: any) {
        console.error('[Surgery Cancel Failure]', {
            role: auth.role,
            surgeryId: params.id,
            error: error.message
        });
        const isPermission = error.code === '42501' || error.message?.includes('FORBIDDEN');
        return NextResponse.json(
            { success: false, error: error.message },
            { status: isPermission ? 403 : 400 }
        );
    }
}
