import { NextResponse } from 'next/server';
import { verifyServerSession, getLandingUrlForRole } from '@/lib/auth';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const session = verifyServerSession(authHeader);

    if (!session.authenticated || !session.role) {
        return NextResponse.json({
            authenticated: false,
            code: 'ACCOUNT_NOT_CONFIGURED',
            message: session.error || 'Account Not Configured: Invalid or unassigned user role.'
        }, { status: 401 });
    }

    return NextResponse.json({
        authenticated: true,
        role: session.role,
        landingUrl: getLandingUrlForRole(session.role)
    });
}
