import { NextResponse } from 'next/server';
import { getAssets, createAsset, getReadinessConfig } from '../../../lib/supabase/mock-db';
import { verifyRolePermission } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const overdueOnly = searchParams.get('overdue') === 'true';

        const config = await getReadinessConfig();
        const graceDays = config.pm_overdue_grace_days || 7;
        const now = new Date();

        let rawAssets = await getAssets();

        if (category) {
            rawAssets = rawAssets.filter((a: any) => a.category.toLowerCase() === category.toLowerCase());
        }
        if (status) {
            rawAssets = rawAssets.filter((a: any) => a.status.toLowerCase() === status.toLowerCase());
        }

        // Calculate PM overdue status
        let processedAssets = rawAssets.map((asset: any) => {
            const dueDate = new Date(asset.next_pm_due_date);
            const graceDeadline = new Date(dueDate.getTime() + graceDays * 24 * 60 * 60 * 1000);
            const is_pm_overdue = now > graceDeadline;
            return {
                ...asset,
                is_pm_overdue,
                pm_grace_deadline: graceDeadline.toISOString()
            };
        });

        if (overdueOnly) {
            processedAssets = processedAssets.filter(a => a.is_pm_overdue);
        }

        return NextResponse.json({ success: true, count: processedAssets.length, data: processedAssets });
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

        // Schema validation
        const required = ['asset_tag', 'name', 'category', 'model', 'serial_number', 'operating_room'];
        for (const field of required) {
            if (!body[field]) {
                return NextResponse.json(
                    { success: false, error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        const newAsset = await createAsset({
            ...body,
            status: body.status || 'UNDER_REPAIR', // Conservative default as per Rule 2
            last_pm_date: body.last_pm_date || new Date().toISOString(),
            next_pm_due_date: body.next_pm_due_date || new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
            total_operating_hours: body.total_operating_hours || 0,
            location: body.location || 'Main Hospital Building',
            department: body.department || 'Biomedical Engineering'
        });

        return NextResponse.json({ success: true, data: newAsset }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
