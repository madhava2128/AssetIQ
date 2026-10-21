'use client';

import React from 'react';
import Link from 'next/link';
import { computeSituationSummary } from '@/lib/dashboard-warnings';

interface TodaySituationBannerProps {
    surgeries: any[];
    dateRange?: 'today' | 'next7' | 'month';
    rangeLabel: string;
}

export default function TodaySituationBanner({
    surgeries,
    rangeLabel
}: TodaySituationBannerProps) {
    const {
        readyCount,
        atRiskCount,
        notReadyCount,
        sentence
    } = computeSituationSummary(surgeries, rangeLabel);

    // Determine worst status for 4px left border & background tint
    let borderStyle = 'border-l-[4px] border-l-status-ready-solid bg-status-ready-bg';
    let situationLabel = 'All ready';

    if (notReadyCount > 0) {
        borderStyle = 'border-l-[4px] border-l-status-notready-solid bg-status-notready-bg';
        situationLabel = 'Attention required';
    } else if (atRiskCount > 0) {
        borderStyle = 'border-l-[4px] border-l-status-atrisk-solid bg-status-atrisk-bg';
        situationLabel = 'Cases at risk';
    } else if (readyCount === 0 && atRiskCount === 0 && notReadyCount === 0) {
        borderStyle = 'border-l-[4px] border-l-status-neutral-solid bg-status-neutral-bg';
        situationLabel = 'None scheduled';
    }

    return (
        <section className={`border border-border rounded-[6px] p-5 shadow-none space-y-4 ${borderStyle}`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Left: The Answer First (Sentence case, primary text) */}
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-caption font-semibold text-text-secondary">
                            Current situation
                        </span>
                        <span className="text-caption text-text-muted">•</span>
                        <span className="text-caption text-text-muted font-medium">
                            {situationLabel}
                        </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-text-primary leading-snug">
                        {sentence}
                    </h2>
                    <p className="text-body text-text-secondary">
                        Click any status badge below to view and manage the underlying surgical cases.
                    </p>
                </div>

                {/* Right: Three Clickable Count Badges */}
                <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
                    <Link
                        href="/surgeries?readiness=READY"
                        className="flex items-center gap-2 px-3.5 py-2 rounded-[4px] border bg-panel border-status-ready-solid text-status-ready-text hover:bg-status-ready-bg transition-colors cursor-pointer"
                        title="Click to view all ready surgeries"
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-status-ready-solid"></span>
                        <span className="text-body font-semibold tabular-nums">{readyCount}</span>
                        <span className="text-caption font-medium">Ready</span>
                    </Link>

                    <Link
                        href="/surgeries?readiness=AT_RISK"
                        className="flex items-center gap-2 px-3.5 py-2 rounded-[4px] border bg-panel border-status-atrisk-solid text-status-atrisk-text hover:bg-status-atrisk-bg transition-colors cursor-pointer"
                        title="Click to view all surgeries at risk"
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-status-atrisk-solid"></span>
                        <span className="text-body font-semibold tabular-nums">{atRiskCount}</span>
                        <span className="text-caption font-medium">At Risk</span>
                    </Link>

                    <Link
                        href="/surgeries?readiness=NOT_READY"
                        className="flex items-center gap-2 px-3.5 py-2 rounded-[4px] border bg-panel border-status-notready-solid text-status-notready-text hover:bg-status-notready-bg transition-colors cursor-pointer"
                        title="Click to view all surgeries that are not ready"
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-status-notready-solid"></span>
                        <span className="text-body font-semibold tabular-nums">{notReadyCount}</span>
                        <span className="text-caption font-medium">Not Ready</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
