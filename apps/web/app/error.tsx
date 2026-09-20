'use client';

import React, { useEffect } from 'react';

export default function AppError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[AssetIQ App Error Boundary Fired]:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex items-center justify-center p-6 font-mono">
            <div className="w-full max-w-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
                    <div className="w-9 h-9 rounded bg-[var(--color-status-notready-bg)] border border-[var(--color-status-notready)] flex items-center justify-center font-bold text-[var(--color-status-notready)]">
                        ⚠️
                    </div>
                    <div>
                        <h1 className="text-base font-bold tracking-tight text-[var(--color-status-notready)]">
                            CLINICAL MANIFEST RENDER FAULT
                        </h1>
                        <p className="text-[11px] text-[var(--color-text-muted)]">
                            Telemetry Exception Boundary Handler
                        </p>
                    </div>
                </div>

                <div className="p-3.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded font-mono text-xs text-[var(--color-text-primary)] overflow-x-auto space-y-1">
                    <p className="font-bold text-[var(--color-status-notready)]">
                        {error.name || 'Error'}: {error.message || 'An unexpected client-side error occurred.'}
                    </p>
                    {error.digest && (
                        <p className="text-[10px] text-[var(--color-text-muted)]">
                            Digest ID: <code className="text-[var(--color-accent)]">{error.digest}</code>
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                        onClick={() => reset()}
                        className="w-full sm:flex-1 py-2.5 px-4 rounded bg-[var(--color-accent)] text-[#0E1A1F] font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer text-center"
                    >
                        ↻ Retry Render Cycle
                    </button>
                    <button
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                localStorage.removeItem('assetiq_auth_token');
                                window.location.href = '/login';
                            }
                        }}
                        className="w-full sm:flex-1 py-2.5 px-4 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-bold text-xs hover:bg-[var(--color-border)] transition-colors cursor-pointer text-center border border-[var(--color-border)]"
                    >
                        Reset State & Return to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
