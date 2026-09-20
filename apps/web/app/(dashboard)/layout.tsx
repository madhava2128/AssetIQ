import React from 'react';
import RoleWorkspaceNav from '@/components/ui/RoleWorkspaceNav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-sans">
            <RoleWorkspaceNav />
            <main className="flex-1">{children}</main>
        </div>
    );
}
