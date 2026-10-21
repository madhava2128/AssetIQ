import { NextResponse } from 'next/server';
import { scheduleSurgeryAtomic, getSharedSurgeries } from '@/lib/db';
import { getSurgeries as getMockSurgeries, createSurgery as createMockSurgery } from '@/lib/supabase/mock-db';
import { verifyRolePermission } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const operating_room = searchParams.get('operating_room');
        const status = searchParams.get('status');
        const surgery_type = searchParams.get('surgery_type');
        const date = searchParams.get('date');

        try {
            const surgeries = await getSharedSurgeries({
                operating_room,
                status,
                surgery_type,
                date
            });
            return NextResponse.json({ success: true, count: surgeries.length, data: surgeries });
        } catch (dbErr: any) {
            console.warn('[Surgeries GET] Falling back to mock-db:', dbErr.message);
            let surgeries: any[] = await getMockSurgeries();

            if (operating_room) {
                surgeries = surgeries.filter(s => s.operating_room?.toLowerCase() === operating_room.toLowerCase());
            }
            if (status) {
                surgeries = surgeries.filter(s => s.status?.toLowerCase() === status.toLowerCase());
            }
            if (surgery_type) {
                surgeries = surgeries.filter(s => s.surgery_type?.toLowerCase() === surgery_type.toLowerCase());
            }

            return NextResponse.json({ success: true, count: surgeries.length, data: surgeries });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization');
    const auth = verifyRolePermission(authHeader, ['ot_admin', 'hospital_admin']);
    
    if (!auth.allowed || !auth.role) {
        console.error('[Surgery Scheduling Refused]', {
            status: auth.status,
            message: auth.message,
            tokenSnippet: authHeader ? authHeader.substring(0, 15) : 'none'
        });
        return NextResponse.json(
            { success: false, error: auth.message || 'FORBIDDEN: You do not have permission to schedule surgeries.' },
            { status: auth.status }
        );
    }

    let body: any = {};
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json(
            { success: false, error: 'Invalid JSON request payload' },
            { status: 400 }
        );
    }

    // Required field validation
    const required = ['procedure_name', 'operating_room', 'scheduled_start_time', 'scheduled_end_time'];
    for (const field of required) {
        if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
            return NextResponse.json(
                { success: false, error: `Missing required field: ${field}` },
                { status: 400 }
            );
        }
    }

    try {
        // Execute atomic database function inside single ACID transaction with caller role RLS
        const newSurgery = await scheduleSurgeryAtomic(auth.role, {
            surgery_code: body.surgery_code,
            patient_id: body.patient_id,
            procedure_name: body.procedure_name,
            surgery_type: body.surgery_type,
            operating_room: body.operating_room,
            scheduled_start_time: body.scheduled_start_time,
            scheduled_end_time: body.scheduled_end_time,
            surgeon_name: body.surgeon_name,
            status: body.status || 'SCHEDULED',
            notes: body.notes || '',
            created_by: auth.role,
            required_assets: body.required_assets || []
        });

        if (!newSurgery || !newSurgery.id) {
            throw new Error('Database failed to confirm surgery creation.');
        }

        // Also keep mock store in sync for any components referencing mock store
        try {
            await createMockSurgery({
                ...body,
                id: newSurgery.id,
                surgery_code: newSurgery.surgery_code,
                patient_id: newSurgery.patient_id,
                created_by: auth.role
            });
        } catch {
            // Non-critical if mock store already has it
        }

        return NextResponse.json({ success: true, data: newSurgery }, { status: 201 });
    } catch (error: any) {
        const errorMsg = error.message || 'Database error while scheduling surgery';
        const isPermission = error.code === '42501' || errorMsg.includes('FORBIDDEN') || errorMsg.includes('Permission denied');
        const isConflict = error.code === '23505' || errorMsg.includes('Double-booking rejected') || errorMsg.includes('already booked');
        
        console.error('[Surgery Scheduling Failure]', {
            role: auth.role,
            errorCode: error.code,
            errorMessage: errorMsg
        });

        const status = isPermission ? 403 : (isConflict ? 400 : 400);
        return NextResponse.json(
            { success: false, error: errorMsg },
            { status }
        );
    }
}
