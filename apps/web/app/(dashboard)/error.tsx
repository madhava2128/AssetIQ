'use client';

import React, { useEffect } from 'react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[AssetIQ Dashboard Error Boundary Fired]:', error);
    }, [error]);

    return (
        <div className="p-8 bg-page min-h-[calc(100vh-64px)] text-text-primary flex items-center justify-center font-sans">
            <div className="w-full max-w-lg bg-panel border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="w-9 h-9 rounded bg-status-notready-bg border border-status-notready-solid flex items-center justify-center font-semibold text-status-notready-text">
                        !
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-text-primary">
                            Unable to load dashboard page
                        </h1>
                        <p className="text-xs text-text-muted">
                            An error occurred while loading this section.
                        </p>
                    </div>
                </div>

                <div className="p-3.5 bg-subtle border border-border rounded text-xs text-text-primary overflow-x-auto space-y-1">
                    <p className="font-medium text-status-notready-text">
                        {error.name || 'Error'}: {error.message || 'An unexpected client-side error occurred in the dashboard route.'}
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
                                window.location.href = '/overview';
                            }
                        }}
                        className="w-full sm:flex-1 py-2 px-4 rounded bg-panel text-text-primary font-medium text-xs hover:bg-subtle transition-colors cursor-pointer text-center border border-border-strong"
                    >
                        Return to Overview
                    </button>
                </div>
            </div>
        </div>
    );
}
