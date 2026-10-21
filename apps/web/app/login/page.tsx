'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSafeNextPath } from '@/lib/scanner';
import AssetIqLogo from '@/components/ui/AssetIqLogo';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [nextUrl, setNextUrl] = useState<string | null>(null);

    useEffect(() => {
        const nextParam = searchParams?.get('next') || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : null);
        const safeNext = getSafeNextPath(nextParam);
        if (safeNext) {
            setNextUrl(safeNext);
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

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
                setErrorMessage(data.message || 'Invalid email or password. Please try again.');
                return;
            }

            // Store session tokens
            if (typeof window !== 'undefined') {
                localStorage.setItem('assetiq_auth_token', data.token);
                localStorage.setItem('assetiq_user_role', data.role);
                document.cookie = `assetiq_auth_token=${data.token}; path=/; max-age=86400;`;
                document.cookie = `assetiq_user_role=${data.role}; path=/; max-age=86400;`;
            }

            // Route to safe next or role landing
            const destination = nextUrl || getSafeNextPath(searchParams?.get('next')) || data.landingUrl || '/overview';
            router.push(destination);
        } catch (err: any) {
            setErrorMessage(err.message || 'Could not connect to the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-page">
            {/* Narrow screens slim frame header */}
            <header className="md:hidden bg-frame border-b border-frame-divider px-4 py-3 flex items-center gap-2.5 shrink-0">
                <AssetIqLogo size={24} variant="frame" />
                <span className="text-base font-semibold text-frame-text tracking-tight">
                    AssetIQ
                </span>
            </header>

            {/* Desktop Left Part: 45% Frame Background */}
            <div className="hidden md:flex md:w-[45%] lg:w-[42%] bg-frame relative flex-col justify-between p-8 lg:p-12 overflow-hidden select-none shrink-0 border-r border-frame-divider">
                {/* Brand Identity & Copy */}
                <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <AssetIqLogo size={32} variant="frame" />
                        <span className="text-2xl font-semibold tracking-tight text-frame-text">
                            AssetIQ
                        </span>
                    </div>

                    <p className="text-base lg:text-lg text-frame-text-secondary leading-relaxed max-w-sm">
                        Know which equipment is ready before surgery starts.
                    </p>
                </div>

                {/* Tone-on-tone Background Logo Shape in Lower Corner (Clipped Container) */}
                <div className="absolute -bottom-10 -right-10 pointer-events-none opacity-50 z-0">
                    <AssetIqLogo size={280} variant="tone-on-tone" />
                </div>

                {/* Quiet Footer Note */}
                <div className="relative z-10 pt-8 border-t border-frame-divider">
                    <p className="text-xs text-frame-text-secondary">
                        Hospital equipment tracking & surgery readiness
                    </p>
                </div>
            </div>

            {/* Right Part: Tinted Page Background with Centered White Sign-in Panel */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-page">
                <div className="w-full max-w-md bg-panel border border-border rounded-[6px] p-6 sm:p-8 shadow-none">
                    <div className="mb-6">
                        <h1 className="text-page-title text-text-primary">Sign in</h1>
                        <p className="text-body text-text-secondary mt-1">
                            Enter your hospital account to continue.
                        </p>
                    </div>

                    {nextUrl && (
                        <div className="mb-4 p-3 rounded-[4px] bg-callout-bg border border-border text-text-secondary text-caption">
                            Sign in to view equipment details.
                        </div>
                    )}

                    {errorMessage && (
                        <div className="mb-4 p-3 rounded-[4px] bg-status-notready-bg border border-status-notready-solid text-status-notready-text text-caption">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-caption font-medium text-text-primary mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@hospital.org"
                                className="w-full bg-panel border border-border-strong text-text-primary rounded-[4px] px-3 py-2 text-body focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                            />
                        </div>

                        <div>
                            <label className="block text-caption font-medium text-text-primary mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-panel border border-border-strong text-text-primary rounded-[4px] px-3 py-2 text-body focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full min-h-[44px] py-2.5 px-4 rounded-[4px] bg-accent hover:bg-accent-hover text-white font-medium text-body transition-colors disabled:opacity-50 cursor-pointer shadow-none"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-page flex items-center justify-center p-4">
                <div className="w-full max-w-sm bg-panel border border-border rounded-[6px] p-8 text-center text-text-secondary text-sm">
                    Loading AssetIQ...
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
