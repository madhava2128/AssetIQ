import { NextResponse } from 'next/server';
import { verifyRolePermission, UserRole, isValidRole } from '@/lib/auth';

// Mock in-memory store of registered users & assigned roles
let mockUserRolesStore = [
    { id: 'usr-1', email: 'admin@assetiq.hospital', name: 'Dr. Rajesh Mehta', role: 'hospital_admin' },
    { id: 'usr-2', email: 'ot@assetiq.hospital', name: 'Nurse Superintendent Swati', role: 'ot_admin' },
    { id: 'usr-3', email: 'biomed@assetiq.hospital', name: 'Eng. Vikram Rao', role: 'biomedical_engineer' }
];

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const auth = verifyRolePermission(authHeader, ['hospital_admin']);

    if (!auth.allowed) {
        return NextResponse.json({
            success: false,
            error: auth.message
        }, { status: auth.status });
    }

    return NextResponse.json({
        success: true,
        data: mockUserRolesStore
    });
}

export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization');
    // Only hospital_admin is permitted to reassign roles
    const auth = verifyRolePermission(authHeader, ['hospital_admin']);

    if (!auth.allowed) {
        return NextResponse.json({
            success: false,
            error: auth.message
        }, { status: auth.status });
    }

    try {
        const body = await request.json();
        const { userId, newRole } = body;

        if (!userId || !newRole) {
            return NextResponse.json({
                success: false,
                error: 'Missing required parameters: userId and newRole'
            }, { status: 400 });
        }

        if (!isValidRole(newRole)) {
            return NextResponse.json({
                success: false,
                error: `Invalid target role '${newRole}'. Allowed roles: hospital_admin, ot_admin, biomedical_engineer.`
            }, { status: 400 });
        }

        const user = mockUserRolesStore.find(u => u.id === userId);
        if (!user) {
            return NextResponse.json({
                success: false,
                error: `User '${userId}' not found.`
            }, { status: 404 });
        }

        user.role = newRole as UserRole;

        return NextResponse.json({
            success: true,
            message: `User '${user.email}' successfully updated to role '${newRole}'.`,
            data: user
        });
    } catch (err: any) {
        return NextResponse.json({
            success: false,
            error: err.message || 'Failed to update user role'
        }, { status: 500 });
    }
}
