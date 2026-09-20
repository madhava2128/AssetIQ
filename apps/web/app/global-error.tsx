'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[AssetIQ Global Error Boundary Fired]:', error);
    }, [error]);

    return (
        <html lang="en" className="dark" data-theme="dark">
            <body className="bg-[#0A1014] text-[#E1E8EC] min-h-screen flex items-center justify-center p-6 font-mono">
                <div className="w-full max-w-lg bg-[#121B22] border border-[#2A3A46] rounded-xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-[#2A3A46] pb-4">
                        <div className="w-9 h-9 rounded bg-[#3A1414] border border-[#F87171] flex items-center justify-center font-bold text-[#F87171]">
                            ⚠️
                        </div>
                        <div>
                            <h1 className="text-base font-bold tracking-tight text-[#F87171]">
                                SYSTEM RENDER FAULT DETECTED
                            </h1>
                            <p className="text-[11px] text-[#8C9BA5]">
                                Clinical Suite Telemetry Exception Handler
                            </p>
                        </div>
                    </div>

                    <div className="p-3 bg-[#0A1014] border border-[#2A3A46] rounded font-mono text-xs text-[#E1E8EC] overflow-x-auto">
                        <p className="font-bold text-[#F87171] mb-1">
                            {error.name || 'Error'}: {error.message || 'An unexpected client-side error occurred.'}
                        </p>
                        {error.digest && (
                            <p className="text-[10px] text-[#8C9BA5]">
                                Digest ID: <code className="text-[#38BDF8]">{error.digest}</code>
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={() => reset()}
                            className="flex-1 py-2 px-4 rounded bg-[#38BDF8] text-[#0A1014] font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer text-center"
                        >
                            ↻ Retry Render Cycle
                        </button>
                        <button
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    localStorage.clear();
                                    window.location.href = '/login';
                                }
                            }}
                            className="flex-1 py-2 px-4 rounded bg-[#2A3A46] text-[#E1E8EC] font-bold text-xs hover:bg-[#3A4C5A] transition-colors cursor-pointer text-center border border-[#3A4C5A]"
                        >
                            Reset State & Return to Login
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
