// Role-based Access Control (RBAC) & Auth Token Helper for AssetIQ (CommonJS & TS)

const VALID_ROLES = ['hospital_admin', 'ot_admin', 'biomedical_engineer'];

const MOCK_AUTH_TOKENS = {
    biomedical_engineer: 'token-bio-eng-write-456',
    hospital_admin: 'token-hosp-admin-full-789',
    ot_admin: 'token-ot-admin-full-012'
};

function isValidRole(role) {
    return typeof role === 'string' && VALID_ROLES.includes(role);
}

function getLandingUrlForRole(role) {
    switch (role) {
        case 'hospital_admin':
            return '/overview';
        case 'ot_admin':
            return '/surgeries';
        case 'biomedical_engineer':
            return '/engineer-dashboard';
        default:
            return '/login?error=account_not_configured';
    }
}

function canUserEdit(role) {
    return isValidRole(role);
}

function canEditSurgeries(role) {
    if (!role || !isValidRole(role)) return false;
    return role === 'hospital_admin' || role === 'ot_admin';
}

function canEditAssets(role) {
    if (!role || !isValidRole(role)) return false;
    return role === 'hospital_admin' || role === 'biomedical_engineer';
}

function canEditReadinessConfig(role) {
    if (!role || !isValidRole(role)) return false;
    return role === 'hospital_admin';
}

function getRoleFromToken(token) {
    if (!token) return null;
    if (token.includes('hosp-admin') || token === 'hospital_admin') return 'hospital_admin';
    if (token.includes('ot-admin') || token === 'ot_admin') return 'ot_admin';
    if (token.includes('bio-eng') || token === 'biomedical_engineer') return 'biomedical_engineer';
    return null;
}

function verifyServerSession(authHeader) {
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

function verifyRolePermission(authHeader, allowedRoles) {
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

module.exports = {
    canUserEdit,
    canEditSurgeries,
    canEditAssets,
    canEditReadinessConfig,
    getRoleFromToken,
    isValidRole,
    getLandingUrlForRole,
    verifyServerSession,
    verifyRolePermission,
    MOCK_AUTH_TOKENS,
    VALID_ROLES
};
