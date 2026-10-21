import React from 'react';
import RoleWorkspaceNav from '@/components/ui/RoleWorkspaceNav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleWorkspaceNav>
            {children}
        </RoleWorkspaceNav>
    );
}
