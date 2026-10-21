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
            <div className="bg-panel border border-border rounded p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-section-heading text-text-primary">
                        Surgery Readiness Summary
                    </h2>
                    <p className="text-body text-text-secondary mt-0.5">
                        Overview of scheduled surgeries and readiness status for the selected date.
                    </p>
                </div>

                <div className="flex items-center gap-2 text-body">
                    <label className="text-text-secondary font-medium">Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="bg-panel border border-border-strong text-text-primary text-body rounded px-3 py-1.5 focus:outline-none focus:border-accent cursor-pointer tabular-nums"
                    />
                </div>
            </div>

            {/* Plain KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-subtle border border-border rounded p-4">
                    <span className="text-caption font-medium text-text-secondary block">Total scheduled</span>
                    <div className="text-2xl font-bold text-text-primary mt-1 tabular-nums">{totalSurgeries}</div>
                    <span className="text-caption text-text-muted mt-1 block">Surgeries on {selectedDate}</span>
                </div>

                <div className="bg-subtle border border-border rounded p-4">
                    <span className="text-caption font-medium text-status-ready-text block">Ready</span>
                    <div className="text-2xl font-bold text-status-ready-text mt-1 tabular-nums">{readyCount}</div>
                    <span className="text-caption text-text-muted mt-1 block">Cleared for surgery</span>
                </div>

                <div className="bg-subtle border border-border rounded p-4">
                    <span className="text-caption font-medium text-status-atrisk-text block">At Risk</span>
                    <div className="text-2xl font-bold text-status-atrisk-text mt-1 tabular-nums">{atRiskCount}</div>
                    <span className="text-caption text-text-muted mt-1 block">Maintenance or secondary risk</span>
                </div>

                <div className="bg-subtle border border-border rounded p-4">
                    <span className="text-caption font-medium text-status-notready-text block">Not Ready</span>
                    <div className="text-2xl font-bold text-status-notready-text mt-1 tabular-nums">{notReadyCount}</div>
                    <span className="text-caption text-text-muted mt-1 block">Missing or unavailable equipment</span>
                </div>
            </div>
        </div>
    );
}
