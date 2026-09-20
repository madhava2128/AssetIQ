// Role-based Access Control (RBAC) & Auth Token Helper for AssetIQ (Stage 1 & 7)

export type UserRole = 'hospital_admin' | 'ot_admin' | 'biomedical_engineer';

export const VALID_ROLES: readonly UserRole[] = ['hospital_admin', 'ot_admin', 'biomedical_engineer'] as const;

export interface UserSession {
    role: UserRole;
    token: string;
    username: string;
    email: string;
}

export const MOCK_AUTH_TOKENS: Record<UserRole, string> = {
    biomedical_engineer: 'token-bio-eng-write-456',
    hospital_admin: 'token-hosp-admin-full-789',
    ot_admin: 'token-ot-admin-full-012'
};

export function isValidRole(role: any): role is UserRole {
    return typeof role === 'string' && (VALID_ROLES as readonly string[]).includes(role);
}

export function getLandingUrlForRole(role: UserRole): string {
    switch (role) {
        case 'hospital_admin':
            return '/overview';
        case 'ot_admin':
            return '/surgeries';
        case 'biomedical_engineer':
            return '/assets';
        default:
            return '/login?error=account_not_configured';
    }
}

export function canUserEdit(role: UserRole): boolean {
    return isValidRole(role);
}

export function canEditSurgeries(role: UserRole | null | undefined): boolean {
    if (!role || !isValidRole(role)) return false;
    return role === 'hospital_admin' || role === 'ot_admin';
}

export function canEditAssets(role: UserRole | null | undefined): boolean {
    if (!role || !isValidRole(role)) return false;
    return role === 'hospital_admin' || role === 'biomedical_engineer';
}

export function canEditReadinessConfig(role: UserRole | null | undefined): boolean {
    if (!role || !isValidRole(role)) return false;
    return role === 'hospital_admin';
}

export function getRoleFromToken(token?: string | null): UserRole | null {
    if (!token) return null;
    if (token.includes('hosp-admin') || token === 'hospital_admin') return 'hospital_admin';
    if (token.includes('ot-admin') || token === 'ot_admin') return 'ot_admin';
    if (token.includes('bio-eng') || token === 'biomedical_engineer') return 'biomedical_engineer';
    return null; // Return null for invalid or unconfigured roles
}

export function verifyServerSession(authHeader?: string | null): { authenticated: boolean; role: UserRole | null; error?: string } {
    if (!authHeader) {
        return { authenticated: false, role: null, error: 'MISSING_AUTH_TOKEN' };
    }
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const role = getRoleFromToken(token);
    
    if (!role || !isValidRole(role)) {
        return {
            authenticated: false,
            role: null,
            error: 'ACCOUNT_NOT_CONFIGURED: User has no valid role assigned. Access blocked.'
        };
    }

    return { authenticated: true, role };
}

export function verifyRolePermission(
    authHeader: string | null | undefined,
    allowedRoles: UserRole[]
): { allowed: boolean; status: number; message: string; role: UserRole | null } {
    const session = verifyServerSession(authHeader);
    if (!session.authenticated || !session.role) {
        return {
            allowed: false,
            status: 401,
            message: session.error || 'UNAUTHORIZED: Valid authentication token required.',
            role: null
        };
    }
    if (!allowedRoles.includes(session.role)) {
        return {
            allowed: false,
            status: 403,
            message: `FORBIDDEN: Role '${session.role}' is not authorized for this operation.`,
            role: session.role
        };
    }
    return { allowed: true, status: 200, message: 'OK', role: session.role };
}
