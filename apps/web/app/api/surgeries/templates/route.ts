import { NextResponse } from 'next/server';
import { getSurgeryTemplates } from '../../../../lib/supabase/mock-db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || undefined;
        const templates = await getSurgeryTemplates(type);
        return NextResponse.json({ success: true, count: templates.length, data: templates });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
