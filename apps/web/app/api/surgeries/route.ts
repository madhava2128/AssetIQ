import { NextResponse } from 'next/server';
import { getSurgeries, createSurgery } from '../../../lib/supabase/mock-db';
import { verifyRolePermission } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const operating_room = searchParams.get('operating_room');
        const status = searchParams.get('status');
        const surgery_type = searchParams.get('surgery_type');

        let surgeries: any[] = await getSurgeries();

        if (operating_room) {
            surgeries = surgeries.filter(s => s.operating_room.toLowerCase() === operating_room.toLowerCase());
        }
        if (status) {
            surgeries = surgeries.filter(s => s.status.toLowerCase() === status.toLowerCase());
        }
        if (surgery_type) {
            surgeries = surgeries.filter(s => s.surgery_type.toLowerCase() === surgery_type.toLowerCase());
        }

        return NextResponse.json({ success: true, count: surgeries.length, data: surgeries });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const auth = verifyRolePermission(authHeader, ['ot_admin', 'hospital_admin']);
        if (!auth.allowed) {
            return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
        }

        const body = await request.json();

        // Required field validation
        const required = ['procedure_name', 'operating_room', 'scheduled_start_time', 'scheduled_end_time'];
        for (const field of required) {
            if (!body[field]) {
                return NextResponse.json(
                    { success: false, error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        const newSurgery = await createSurgery(body);
        return NextResponse.json({ success: true, data: newSurgery }, { status: 201 });
    } catch (error: any) {
        // Enforce 400 Bad Request for OT double-booking or schema validation errors
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}
