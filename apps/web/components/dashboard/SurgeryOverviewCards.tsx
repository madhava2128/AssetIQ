'use client';

import React from 'react';

interface SurgeryOverviewCardsProps {
    totalSurgeries: number;
    readyCount: number;
    atRiskCount: number;
    notReadyCount: number;
    selectedDate: string;
    onDateChange: (date: string) => void;
}

export default function SurgeryOverviewCards({
    totalSurgeries,
    readyCount,
    atRiskCount,
    notReadyCount,
    selectedDate,
    onDateChange
}: SurgeryOverviewCardsProps) {
    return (
        <div className="space-y-4">
            <div className="instrument-panel p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)] font-sans">
                        Surgical Readiness Overview
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-mono">
                        Deterministic safety rules & XGBoost breakdown telemetry
                    </p>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                    <label className="text-[var(--color-text-muted)] font-semibold">Date Filter:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-mono rounded px-3 py-1.5 focus:outline-none focus:border-[var(--color-accent)] cursor-pointer"
                    />
                </div>
            </div>

            {/* KPI Instrumentation Readouts */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="instrument-panel p-4 font-mono">
                    <span className="text-xs font-semibold text-[var(--color-text-muted)] block">Total Scheduled</span>
                    <div className="text-3xl font-extrabold text-[var(--color-text-primary)] mt-1 font-mono">{totalSurgeries}</div>
                    <span className="text-[11px] text-[var(--color-text-muted)] mt-1 block">Surgeries on {selectedDate}</span>
                </div>

                <div className="instrument-panel p-4 font-mono border-l-4 border-l-[var(--color-status-ready)]">
                    <span className="text-xs font-bold text-[var(--color-status-ready)] flex items-center gap-1.5">
                        <span className="text-sm font-black">●</span>
                        <span>READY</span>
                    </span>
                    <div className="text-3xl font-extrabold text-[var(--color-status-ready)] mt-1 font-mono">{readyCount}</div>
                    <span className="text-[11px] text-[var(--color-text-muted)] mt-1 block">100% Deterministic Passed</span>
                </div>

                <div className="instrument-panel p-4 font-mono border-l-4 border-l-[var(--color-status-atrisk)]">
                    <span className="text-xs font-bold text-[var(--color-status-atrisk)] flex items-center gap-1.5">
                        <span className="text-sm font-black">▲</span>
                        <span>AT RISK</span>
                    </span>
                    <div className="text-3xl font-extrabold text-[var(--color-status-atrisk)] mt-1 font-mono">{atRiskCount}</div>
                    <span className="text-[11px] text-[var(--color-text-muted)] mt-1 block">PM Overdue / Risk Flagged</span>
                </div>

                <div className="instrument-panel p-4 font-mono border-l-4 border-l-[var(--color-status-notready)]">
                    <span className="text-xs font-bold text-[var(--color-status-notready)] flex items-center gap-1.5">
                        <span className="text-sm font-black">✕</span>
                        <span>NOT READY</span>
                    </span>
                    <div className="text-3xl font-extrabold text-[var(--color-status-notready)] mt-1 font-mono">{notReadyCount}</div>
                    <span className="text-[11px] text-[var(--color-text-muted)] mt-1 block">Under Repair / Missing Asset</span>
                </div>
            </div>
        </div>
    );
}

