'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/lib/auth';
import ThemeToggle from '@/components/ui/ThemeToggle';
import UserAuthNav from '@/components/ui/UserAuthNav';

export default function RoleWorkspaceNav() {
    const pathname = usePathname();
    const [userRole, setUserRole] = useState<UserRole>('hospital_admin');

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('assetiq_auth_token') : null;
                const res = await fetch('/api/auth/me', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                const data = await res.json();
                if (data.authenticated && data.role) {
                    setUserRole(data.role);
                } else if (typeof window !== 'undefined') {
                    const storedRole = localStorage.getItem('assetiq_user_role') as UserRole;
                    if (storedRole) setUserRole(storedRole);
                }
            } catch {
                if (typeof window !== 'undefined') {
                    const storedRole = localStorage.getItem('assetiq_user_role') as UserRole;
                    if (storedRole) setUserRole(storedRole);
                }
            }
        };
        fetchRole();
    }, [pathname]);

    // 1. HOSPITAL ADMIN WORKSPACE NAVIGATION
    if (userRole === 'hospital_admin') {
        return (
            <nav className="sticky top-0 z-50 bg-[var(--color-bg-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <Link href="/overview" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded bg-[var(--color-accent-bg)] border border-[var(--color-accent)] flex items-center justify-center font-mono font-bold text-xs text-[var(--color-accent)]">
                            ADM
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-base text-[var(--color-text-primary)] font-mono leading-none group-hover:text-[var(--color-accent)] transition-colors">
                                AssetIQ Executive
                            </span>
                            <span className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5">
                                Hospital Administration Control
                            </span>
                        </div>
                    </Link>
                    <span className="hidden md:inline-block text-[10px] bg-[var(--color-accent-bg)] text-[var(--color-accent)] border border-[var(--color-accent)] px-2 py-0.5 rounded font-mono font-bold">
                        ADMIN SUITE
                    </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold font-mono">
                    <Link
                        href="/overview"
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            pathname === '/overview'
                                ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] border border-[var(--color-accent)] shadow-sm font-bold'
                                : 'hover:bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]'
                        }`}
                    >
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        href="/surgeries"
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            pathname === '/surgeries'
                                ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] border border-[var(--color-accent)] shadow-sm font-bold'
                                : 'hover:bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]'
                        }`}
                    >
                        <span>Surgeries</span>
                    </Link>

                    <Link
                        href="/assets"
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            pathname === '/assets'
                                ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] border border-[var(--color-accent)] shadow-sm font-bold'
                                : 'hover:bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]'
                        }`}
                    >
                        <span>Assets</span>
                    </Link>

                    <Link
                        href="/maintenance"
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            pathname === '/maintenance'
                                ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] border border-[var(--color-accent)] shadow-sm font-bold'
                                : 'hover:bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]'
                        }`}
                    >
                        <span>Maintenance</span>
                    </Link>

                    <Link
                        href="/reports"
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            pathname === '/reports'
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm font-bold'
                                : 'hover:bg-[var(--color-bg-primary)] text-amber-400'
                        }`}
                    >
                        <span>PDF Reports</span>
                    </Link>

                    <ThemeToggle />
                    <UserAuthNav />
                </div>
            </nav>
        );
    }

    // 2. OT ADMIN WORKSPACE NAVIGATION
    if (userRole === 'ot_admin') {
        return (
            <nav className="sticky top-0 z-50 bg-[#141B20]/95 backdrop-blur-md border-b border-amber-500/30 px-6 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <Link href="/surgeries" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-400 flex items-center justify-center font-mono font-bold text-xs text-amber-400">
                            OT
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-base text-slate-100 font-mono leading-none group-hover:text-amber-400 transition-colors">
                                OT Scheduling Suite
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Surgery Suite & Equipment Allocation
                            </span>
                        </div>
                    </Link>
                    <span className="hidden md:inline-block text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
                        OT WORKSPACE
                    </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold font-mono">
                    <Link
                        href="/surgeries"
                        className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            pathname === '/surgeries'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400 shadow-sm font-bold'
                                : 'hover:bg-slate-800 text-slate-200'
                        }`}
                    >
                        <span>Surgeries (Scheduling)</span>
                    </Link>

                    <Link
                        href="/assets"
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            pathname === '/assets'
                                ? 'bg-slate-800 text-slate-100 border border-slate-700 font-bold'
                                : 'hover:bg-slate-800/60 text-slate-400'
                        }`}
                    >
                        <span>Assets (Read-Only)</span>
                    </Link>

                    <Link
                        href="/maintenance"
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                            pathname === '/maintenance'
                                ? 'bg-slate-800 text-slate-100 border border-slate-700 font-bold'
                                : 'hover:bg-slate-800/60 text-slate-400'
                        }`}
                    >
                        <span>Maintenance (Read-Only)</span>
                    </Link>

                    <ThemeToggle />
                    <UserAuthNav />
                </div>
            </nav>
        );
    }

    // 3. BIOMEDICAL ENGINEER WORKSPACE NAVIGATION
    return (
        <nav className="sticky top-0 z-50 bg-[#0F1D1A]/95 backdrop-blur-md border-b border-emerald-500/30 px-6 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
                <Link href="/assets" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-400 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
                        BIO
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-base text-slate-100 font-mono leading-none group-hover:text-emerald-400 transition-colors">
                            Biomedical Engineering
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Equipment Catalog & Compliance
                        </span>
                    </div>
                </Link>
                <span className="hidden md:inline-block text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                    BIOMED WORKSPACE
                </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold font-mono">
                <Link
                    href="/assets"
                    className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        pathname === '/assets'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400 shadow-sm font-bold'
                            : 'hover:bg-slate-800 text-slate-200'
                    }`}
                >
                    <span>Assets Catalog</span>
                </Link>

                <Link
                    href="/maintenance"
                    className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        pathname === '/maintenance'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400 shadow-sm font-bold'
                            : 'hover:bg-slate-800 text-slate-200'
                    }`}
                >
                    <span>Maintenance & PM</span>
                </Link>

                <Link
                    href="/surgeries"
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        pathname === '/surgeries'
                            ? 'bg-slate-800 text-slate-100 border border-slate-700 font-bold'
                            : 'hover:bg-slate-800/60 text-slate-400'
                    }`}
                >
                    <span>Surgeries (Read-Only)</span>
                </Link>

                <ThemeToggle />
                <UserAuthNav />
            </div>
        </nav>
    );
}
