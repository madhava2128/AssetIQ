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
        <div className="min-h-screen bg-page text-text-primary flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-lg bg-panel border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="w-9 h-9 rounded bg-status-notready-bg border border-status-notready-solid flex items-center justify-center font-semibold text-status-notready-text">
                        !
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-text-primary">
                            An error occurred
                        </h1>
                        <p className="text-xs text-text-muted">
                            Application error boundary handler
                        </p>
                    </div>
                </div>

                <div className="p-3.5 bg-subtle border border-border rounded text-xs text-text-primary overflow-x-auto space-y-1">
                    <p className="font-medium text-status-notready-text">
                        {error.name || 'Error'}: {error.message || 'An unexpected client-side error occurred.'}
                    </p>
                    {error.digest && (
                        <p className="text-xs text-text-muted">
                            Digest ID: <span className="text-text-secondary tabular-nums">{error.digest}</span>
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                        onClick={() => reset()}
                        className="w-full sm:flex-1 py-2 px-4 rounded bg-accent text-white font-medium text-xs hover:bg-accent-hover transition-colors cursor-pointer text-center"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                localStorage.removeItem('assetiq_auth_token');
                                window.location.href = '/login';
                            }
                        }}
                        className="w-full sm:flex-1 py-2 px-4 rounded bg-panel text-text-primary font-medium text-xs hover:bg-subtle transition-colors cursor-pointer text-center border border-border-strong"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
