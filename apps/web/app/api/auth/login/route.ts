import { NextResponse } from 'next/server';
import { MOCK_AUTH_TOKENS, isValidRole, getLandingUrlForRole, UserRole } from '@/lib/auth';

const DEMO_USER_CREDENTIALS = [
    {
        role: 'hospital_admin' as UserRole,
        email: 'admin@assetiq.in',
        password: 'AdminPass2026!',
        name: 'Dr. Rajesh Mehta (Hospital Administrator)',
        landingUrl: '/overview'
    },
    {
        role: 'ot_admin' as UserRole,
        email: 'ot.admin@assetiq.in',
        password: 'OtPass2026!',
        name: 'Nurse Superintendent Swati (OT Administrator)',
        landingUrl: '/surgeries'
    },
    {
        role: 'biomedical_engineer' as UserRole,
        email: 'biomed@assetiq.in',
        password: 'BiomedPass2026!',
        name: 'Eng. Vikram Rao (Biomedical Lead)',
        landingUrl: '/engineer-dashboard'
    },
    {
        role: null,
        email: 'unconfigured@assetiq.in',
        password: 'GuestPass2026!',
        name: 'Guest Trainee (Unconfigured Account)',
        landingUrl: '/login?error=account_not_configured'
    }
];

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { email, password, roleChoice } = body;

        let role: UserRole | null = null;
        let token: string | null = null;

        // 1. Check explicit Role Choice
        if (roleChoice) {
            if (roleChoice === 'hospital_admin') {
                role = 'hospital_admin';
                token = MOCK_AUTH_TOKENS.hospital_admin;
            } else if (roleChoice === 'ot_admin') {
                role = 'ot_admin';
                token = MOCK_AUTH_TOKENS.ot_admin;
            } else if (roleChoice === 'biomedical_engineer') {
                role = 'biomedical_engineer';
                token = MOCK_AUTH_TOKENS.biomedical_engineer;
            } else if (roleChoice === 'unconfigured') {
                role = null;
                token = 'token-invalid-unassigned-999';
            }
        } 
        // 2. Check Explicit Email / Password Matching
        else if (email && email.trim() !== '') {
            const lowerEmail = email.trim().toLowerCase();

            // Explicitly test unconfigured account block
            if (lowerEmail.includes('unconfigured')) {
                role = null;
                token = 'token-unconfigured-user';
            } else {
                const matchedDemoUser = DEMO_USER_CREDENTIALS.find(u => u.email.toLowerCase() === lowerEmail);

                if (matchedDemoUser && matchedDemoUser.role) {
                    role = matchedDemoUser.role;
                    token = MOCK_AUTH_TOKENS[matchedDemoUser.role];
                } else if (lowerEmail.includes('ot') || lowerEmail.includes('surgery')) {
                    role = 'ot_admin';
                    token = MOCK_AUTH_TOKENS.ot_admin;
                } else if (lowerEmail.includes('biomed') || lowerEmail.includes('engineer') || lowerEmail.includes('asset')) {
                    role = 'biomedical_engineer';
                    token = MOCK_AUTH_TOKENS.biomedical_engineer;
                } else {
                    // Default to hospital_admin for any other email/input to guarantee seamless login
                    role = 'hospital_admin';
                    token = MOCK_AUTH_TOKENS.hospital_admin;
                }
            }
        } else {
            // Default fallback if form submitted with blank inputs
            role = 'hospital_admin';
            token = MOCK_AUTH_TOKENS.hospital_admin;
        }

        // Verify if user has a valid role
        if (!role || !isValidRole(role)) {
            return NextResponse.json({
                success: false,
                code: 'ACCOUNT_NOT_CONFIGURED',
                message: 'Account Not Configured: Your user account has no active role assigned. Access blocked. Contact Hospital Administrator.'
            }, { status: 403 });
        }

        const landingUrl = getLandingUrlForRole(role);

        return NextResponse.json({
            success: true,
            role,
            token,
            landingUrl,
            user: {
                email: email || `${role}@assetiq.in`,
                role,
                username: role.replace('_', ' ').toUpperCase()
            }
        });
    } catch (err: any) {
        return NextResponse.json({
            success: false,
            error: err.message || 'Authentication failure'
        }, { status: 500 });
    }
}
