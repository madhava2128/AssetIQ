'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserAuthNav() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedRole = localStorage.getItem('assetiq_user_role');
            setUserRole(storedRole);
        }
    }, []);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('assetiq_auth_token');
            localStorage.removeItem('assetiq_user_role');
            document.cookie = 'assetiq_auth_token=; path=/; max-age=0;';
            document.cookie = 'assetiq_user_role=; path=/; max-age=0;';
        }
        setUserRole(null);
        router.push('/login');
    };

    const formatRoleLabel = (role: string | null) => {
        if (!role) return '';
        if (role === 'hospital_admin') return 'Hospital Administrator';
        if (role === 'ot_admin') return 'OT Administrator';
        if (role === 'biomedical_engineer') return 'Biomedical Engineer';
        return role.replace(/_/g, ' ');
    };

    return (
        <div className="flex items-center gap-2 sm:gap-3 text-caption border-l border-border pl-2 sm:pl-4 ml-1 sm:ml-2">
            {userRole ? (
                <>
                    <span className="text-text-secondary text-caption hidden sm:inline">
                        {formatRoleLabel(userRole)}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="text-text-primary hover:bg-subtle border border-border-strong bg-panel px-3 py-1 rounded text-caption font-medium transition-colors"
                    >
                        Sign out
                    </button>
                </>
            ) : (
                <Link
                    href="/login"
                    className="bg-accent hover:bg-accent-hover text-white px-3 py-1 rounded text-caption font-medium transition-colors"
                >
                    Sign in
                </Link>
            )}
        </div>
    );
}
