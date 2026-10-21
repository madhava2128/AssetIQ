'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Package,
    Wrench,
    AlertTriangle,
    FileText,
    Menu,
    X,
    LucideIcon
} from 'lucide-react';
import { UserRole } from '@/lib/auth';
import AssetIqLogo from '@/components/ui/AssetIqLogo';

interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

export default function RoleWorkspaceNav({
    children
}: {
    children?: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [userRole, setUserRole] = useState<UserRole>('hospital_admin');
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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

    // Close mobile drawer on route navigation
    useEffect(() => {
        setMobileDrawerOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('assetiq_auth_token');
            localStorage.removeItem('assetiq_user_role');
            document.cookie = 'assetiq_auth_token=; path=/; max-age=0;';
            document.cookie = 'assetiq_user_role=; path=/; max-age=0;';
        }
        router.push('/login');
    };

    const getRoleDetails = (role: UserRole) => {
        switch (role) {
            case 'hospital_admin':
                return { label: 'Hospital administrator', initials: 'HA' };
            case 'ot_admin':
                return { label: 'OT administrator', initials: 'OA' };
            case 'biomedical_engineer':
                return { label: 'Biomedical engineer', initials: 'BE' };
            default:
                return { label: 'Staff member', initials: 'IQ' };
        }
    };

    const roleDetails = getRoleDetails(userRole);

    let navLinks: NavItem[] = [];
    let homeHref = '/overview';

    if (userRole === 'hospital_admin') {
        homeHref = '/overview';
        navLinks = [
            { label: 'Dashboard', href: '/overview', icon: LayoutDashboard },
            { label: 'Surgeries', href: '/surgeries', icon: Calendar },
            { label: 'Assets', href: '/assets', icon: Package },
            { label: 'Maintenance', href: '/maintenance', icon: Wrench },
            { label: 'PDF Reports', href: '/reports', icon: FileText }
        ];
    } else if (userRole === 'ot_admin') {
        homeHref = '/surgeries';
        navLinks = [
            { label: 'Surgeries', href: '/surgeries', icon: Calendar },
            { label: 'Assets', href: '/assets', icon: Package },
            { label: 'Maintenance', href: '/maintenance', icon: Wrench }
        ];
    } else {
        homeHref = '/engineer-dashboard';
        navLinks = [
            { label: 'Dashboard', href: '/engineer-dashboard', icon: LayoutDashboard },
            { label: 'Assets', href: '/assets', icon: Package },
            { label: 'Maintenance', href: '/maintenance', icon: Wrench },
            { label: 'Breakdowns', href: '/breakdowns', icon: AlertTriangle },
            { label: 'Surgeries', href: '/surgeries', icon: Calendar }
        ];
    }

    const isLinkActive = (href: string) => {
        if (pathname === href) return true;
        if (href === '/assets' && pathname.startsWith('/assets/')) return true;
        if (href === '/surgeries' && pathname.startsWith('/surgeries/')) return true;
        return false;
    };

    return (
        <div className="min-h-screen flex flex-col bg-page text-text-primary font-sans">
            {/* 1. Deep Slate-Blue Top Bar (Frame) */}
            <header className="frame-element bg-frame border-b border-frame-divider sticky top-0 z-40 h-14 shrink-0">
                <div className="h-full px-4 flex items-center justify-between gap-4">
                    {/* Left: Mobile Toggle + Logo + AssetIQ Name */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Drawer Button */}
                        <button
                            type="button"
                            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                            className="md:hidden p-1.5 rounded text-frame-text hover:bg-frame-hover focus-frame transition-colors"
                            aria-label="Toggle navigation"
                        >
                            {mobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        <Link
                            href={homeHref}
                            className="flex items-center gap-2.5 text-frame-text hover:opacity-95 focus-frame transition-opacity shrink-0"
                        >
                            <AssetIqLogo size={28} variant="frame" />
                            <span className="text-base font-semibold tracking-tight text-frame-text">
                                AssetIQ
                            </span>
                        </Link>
                    </div>

                    {/* Right: Initials Circle + Plain Role Name + Sign Out */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2">
                            {/* Initials Circle */}
                            <div
                                className="w-7 h-7 rounded-full bg-frame-selected text-frame-text text-xs font-semibold flex items-center justify-center border border-frame-divider shrink-0 select-none"
                                title={roleDetails.label}
                            >
                                {roleDetails.initials}
                            </div>
                            {/* Plain Role Name */}
                            <span className="text-xs sm:text-caption text-frame-text-secondary hidden sm:inline font-normal">
                                {roleDetails.label}
                            </span>
                        </div>

                        {/* Sign Out Button (Styled for Frame) */}
                        <button
                            onClick={handleLogout}
                            className="text-xs sm:text-caption font-medium text-frame-text hover:bg-frame-hover border border-frame-divider bg-frame px-2.5 sm:px-3 py-1 sm:py-1.5 rounded focus-frame transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer (Narrow Screens) */}
                {mobileDrawerOpen && (
                    <div className="md:hidden bg-frame border-b border-frame-divider px-3 py-2 space-y-1 shadow-none">
                        {navLinks.map((link) => {
                            const active = isLinkActive(link.href);
                            const IconComponent = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
                                        active
                                            ? 'bg-frame-selected text-frame-text border-l-[3px] border-frame-marker'
                                            : 'text-frame-text-secondary hover:text-frame-text hover:bg-frame-hover border-l-[3px] border-transparent'
                                    }`}
                                >
                                    <IconComponent size={18} className="shrink-0" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </header>

            {/* 2. Workspace Body: Frame Sidebar + Calm Tinted Content */}
            <div className="flex flex-1 min-h-[calc(100vh-3.5rem)]">
                {/* Desktop Sidebar (Frame) */}
                <aside className="frame-element hidden md:flex flex-col w-60 shrink-0 bg-frame border-r border-frame-divider py-4 select-none">
                    <nav className="flex-1 space-y-1">
                        {navLinks.map((link) => {
                            const active = isLinkActive(link.href);
                            const IconComponent = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                                        active
                                            ? 'bg-frame-selected text-frame-text border-l-[3px] border-frame-marker'
                                            : 'text-frame-text-secondary hover:text-frame-text hover:bg-frame-hover border-l-[3px] border-transparent'
                                    }`}
                                >
                                    <IconComponent size={18} className="shrink-0" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Hospital Context Footer in Sidebar */}
                    <div className="px-4 pt-4 border-t border-frame-divider">
                        <p className="text-[11px] text-frame-text-secondary leading-normal">
                            Hospital Equipment & Surgery Readiness
                        </p>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 bg-page flex flex-col">
                    {children}
                </main>
            </div>
        </div>
    );
}
