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

    return (
        <div className="flex items-center gap-2 font-mono text-xs ml-2 border-l border-[var(--color-border)] pl-3">
            {userRole ? (
                <>
                    <span className="hidden lg:inline-block text-[10px] text-[var(--color-text-muted)] font-semibold">
                        Role:
                    </span>
                    <span className="text-[10px] font-bold text-[var(--color-accent)] bg-[var(--color-accent-bg)] border border-[var(--color-accent)] px-2 py-0.5 rounded uppercase">
                        {userRole}
                    </span>
                    <button
                        onClick={handleLogout}
                        title="Sign Out of Session"
                        className="px-2.5 py-1 rounded bg-[var(--color-bg-primary)] hover:bg-[var(--color-status-notready-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-status-notready)] border border-[var(--color-border)] hover:border-[var(--color-status-notready)] transition-colors text-[11px] font-bold flex items-center gap-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                    </button>
                </>
            ) : (
                <Link
                    href="/login"
                    className="px-3 py-1 rounded bg-[var(--color-accent)] text-[#0E1A1F] font-bold text-[11px] hover:opacity-90 transition-opacity"
                >
                    Sign In
                </Link>
            )}
        </div>
    );
}
