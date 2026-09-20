'use client';

import React from 'react';
import { UserRole, canUserEdit, MOCK_AUTH_TOKENS } from '@/lib/auth';

interface RoleSelectorProps {
    currentRole: UserRole;
    onRoleChange: (role: UserRole) => void;
}

export default function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
    const roles: { role: UserRole; label: string; desc: string }[] = [
        { role: 'biomedical_engineer', label: 'Biomedical Engineer', desc: 'Full asset & maintenance edit controls' },
        { role: 'hospital_admin', label: 'Hospital Admin', desc: 'Full administrative override & management' },
        { role: 'ot_admin', label: 'OT Admin', desc: 'Surgery scheduling & OT assignment controls' }
    ];

    const canEdit = canUserEdit(currentRole);

    return (
        <div className="instrument-panel p-3.5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded border bg-[var(--color-accent-bg)] border-[var(--color-accent)] text-[var(--color-accent)]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[var(--color-text-muted)] font-semibold">Role Context:</span>
                        <span className="font-bold text-[var(--color-text-primary)] border border-[var(--color-border)] px-2 py-0.5 rounded">
                            {currentRole}
                        </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                        Token: <code className="text-[var(--color-text-primary)]">{MOCK_AUTH_TOKENS[currentRole]}</code>
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <label className="text-[var(--color-text-muted)] font-semibold">Switch Context:</label>
                <select
                    value={currentRole}
                    onChange={(e) => onRoleChange(e.target.value as UserRole)}
                    className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-mono rounded px-3 py-1.5 focus:outline-none focus:border-[var(--color-accent)] cursor-pointer"
                >
                    {roles.map(r => (
                        <option key={r.role} value={r.role}>
                            {r.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

