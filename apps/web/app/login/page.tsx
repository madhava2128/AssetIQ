'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<'hospital_admin' | 'ot_admin' | 'biomedical_engineer'>('hospital_admin');
    const [email, setEmail] = useState('admin@assetiq.in');
    const [password, setPassword] = useState('AdminPass2026!');
    const [loading, setLoading] = useState(false);
    const [errorState, setErrorState] = useState<{ code: string; message: string } | null>(null);

    const handleRoleSelect = (role: 'hospital_admin' | 'ot_admin' | 'biomedical_engineer') => {
        setSelectedRole(role);
        setErrorState(null);
        if (role === 'hospital_admin') {
            setEmail('admin@assetiq.in');
            setPassword('AdminPass2026!');
        } else if (role === 'ot_admin') {
            setEmail('ot.admin@assetiq.in');
            setPassword('OtPass2026!');
        } else if (role === 'biomedical_engineer') {
            setEmail('biomed@assetiq.in');
            setPassword('BiomedPass2026!');
        }
    };

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setErrorState(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password.trim()
                })
            });

            const data = await res.json();

            if (!data.success) {
                setErrorState({
                    code: data.code || 'AUTH_ERROR',
                    message: data.message || 'Authentication failed'
                });
                return;
            }

            // Store verifiable session tokens
            if (typeof window !== 'undefined') {
                localStorage.setItem('assetiq_auth_token', data.token);
                localStorage.setItem('assetiq_user_role', data.role);
                document.cookie = `assetiq_auth_token=${data.token}; path=/; max-age=86400;`;
                document.cookie = `assetiq_user_role=${data.role}; path=/; max-age=86400;`;
            }

            // Route to role-appropriate landing view
            router.push(data.landingUrl);
        } catch (err: any) {
            setErrorState({
                code: 'SERVER_ERROR',
                message: err.message || 'Unable to connect to authentication server'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex items-center justify-center p-4 font-sans selection:bg-[var(--color-accent-bg)]">
            {/* Defensive Container Constraints: max-w-md w-full overflow-hidden */}
            <div className="w-full max-w-md bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                {/* Clinical OR Monitor Header Bar */}
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        {/* Strictly Sized Logo Icon: viewBox="0 0 24 24", width=36, height=36 */}
                        <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded bg-[var(--color-accent-bg)] border border-[var(--color-accent)] flex items-center justify-center font-mono font-bold text-sm text-[var(--color-accent)] max-w-full overflow-hidden">
                            <svg className="w-5 h-5 text-[var(--color-accent)] max-w-full max-h-full" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold font-mono tracking-tight text-[var(--color-text-primary)]">
                                AssetIQ Access
                            </h1>
                            <p className="text-[11px] font-mono text-[var(--color-text-muted)]">
                                Surgical Suite Readiness Telemetry
                            </p>
                        </div>
                    </div>
                    <div className="text-[10px] font-mono bg-[var(--color-bg-primary)] text-[var(--color-accent)] border border-[var(--color-border)] px-2.5 py-1 rounded font-bold">
                        SYS: ONLINE
                    </div>
                </div>

                {/* Role Quick Selector Tabs */}
                <div className="mb-6">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-2">
                        Select Demo Role Profile
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] font-mono text-[11px]">
                        <button
                            type="button"
                            onClick={() => handleRoleSelect('hospital_admin')}
                            className={`py-1.5 px-2 rounded font-bold transition-all text-center truncate ${
                                selectedRole === 'hospital_admin'
                                    ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] border border-[var(--color-accent)] shadow-sm'
                                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                            }`}
                        >
                            Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleSelect('ot_admin')}
                            className={`py-1.5 px-2 rounded font-bold transition-all text-center truncate ${
                                selectedRole === 'ot_admin'
                                    ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] border border-[var(--color-accent)] shadow-sm'
                                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                            }`}
                        >
                            OT Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleSelect('biomedical_engineer')}
                            className={`py-1.5 px-2 rounded font-bold transition-all text-center truncate ${
                                selectedRole === 'biomedical_engineer'
                                    ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] border border-[var(--color-accent)] shadow-sm'
                                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                            }`}
                        >
                            Biomed
                        </button>
                    </div>
                </div>

                {/* Account Not Configured / Auth Error Display */}
                {errorState && (
                    <div className="mb-6 p-4 rounded-lg bg-[var(--color-status-notready-bg)] border border-[var(--color-status-notready)] text-[var(--color-status-notready)] font-mono text-xs">
                        <div className="flex items-center gap-2 font-bold mb-1">
                            <svg className="w-4 h-4 text-[var(--color-status-notready)] max-w-full max-h-full" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>ACCOUNT ACCESS BLOCKED</span>
                        </div>
                        <p className="leading-relaxed text-[11px] text-[var(--color-text-primary)] mt-1">
                            {errorState.message}
                        </p>
                    </div>
                )}

                {/* Primary Login Form */}
                <form
                    onSubmit={handleLogin}
                    className="space-y-4 font-mono text-xs"
                >
                    <div>
                        <label className="block text-[var(--color-text-muted)] font-semibold mb-1">
                            Hospital Email / Identity
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@assetiq.hospital"
                            className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded px-3 py-2 focus:outline-none focus:border-[var(--color-accent)] font-mono text-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-[var(--color-text-muted)] font-semibold mb-1">
                            Security Credentials
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded px-3 py-2 focus:outline-none focus:border-[var(--color-accent)] font-mono text-xs"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded bg-[var(--color-accent)] text-[#0E1A1F] font-bold font-mono text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                        {loading ? 'Authenticating Claims...' : `Sign In as ${selectedRole.replace('_', ' ').toUpperCase()} →`}
                    </button>
                </form>
            </div>
        </div>
    );
}
