'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/auth';
import {
    computeNeedsAttentionIssues,
    NeedsAttentionIssue
} from '@/lib/dashboard-warnings';
import ReportIncidentModal from '@/components/forms/ReportIncidentModal';

interface NeedsAttentionListProps {
    surgeries: any[];
    rangeLabel: string;
    allSurgeries?: any[];
    allAssets?: any[];
    breakdowns?: any[];
    userRole?: UserRole;
    onIncidentReported?: () => void;
}

export default function NeedsAttentionList({
    surgeries,
    rangeLabel,
    allSurgeries = [],
    allAssets = [],
    breakdowns = [],
    userRole = 'hospital_admin',
    onIncidentReported
}: NeedsAttentionListProps) {
    const router = useRouter();
    const [showAll, setShowAll] = useState(false);

    // Modal state for reporting incidents directly from dashboard
    const [reportingAsset, setReportingAsset] = useState<{
        id: string;
        name: string;
        tag: string;
    } | null>(null);

    // Compute shared ordered issues list
    const issues = computeNeedsAttentionIssues(
        surgeries,
        allSurgeries.length > 0 ? allSurgeries : surgeries,
        allAssets,
        breakdowns
    );

    const displayItems = showAll ? issues : issues.slice(0, 5);
    const hasMore = issues.length > 5 && !showAll;
    const isEngineer = userRole === 'biomedical_engineer';

    return (
        <section className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden space-y-0">
            {/* Panel Header Band */}
            <div className="panel-header-band flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h2 className="text-section-heading text-text-primary">
                        Needs attention now
                    </h2>
                    <p className="text-body text-text-secondary mt-0.5">
                        What to act on first across scheduled surgeries {rangeLabel}.
                    </p>
                </div>
                {issues.length > 0 && (
                    <span className="text-caption font-semibold px-2.5 py-1 rounded-[4px] bg-status-notready-bg text-status-notready-text border border-status-notready-solid self-start sm:self-auto tabular-nums">
                        {issues.length} {issues.length === 1 ? 'issue' : 'issues'} found
                    </span>
                )}
            </div>

            {/* Panel Content */}
            <div className="p-4 sm:p-5 space-y-4">
                {/* Empty State */}
                {issues.length === 0 ? (
                    <div className="p-5 text-center bg-panel border border-border rounded-[6px] text-text-secondary text-body">
                        Nothing needs attention right now. All equipment for today's surgeries is ready.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayItems.map((issue: NeedsAttentionIssue) => {
                            return (
                                <div
                                    key={issue.surgeryId}
                                    className="bg-panel border border-border hover:border-border-strong rounded-[6px] p-4 flex flex-col lg:flex-row lg:items-start justify-between gap-4 text-table transition-colors shadow-none"
                                >
                                    <div className="space-y-2 flex-1 min-w-0">
                                        {/* Badges & Surgery Header */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-[4px] font-semibold border ${
                                                    issue.isNotReady
                                                        ? 'bg-status-notready-bg text-status-notready-text border-status-notready-solid'
                                                        : 'bg-status-atrisk-bg text-status-atrisk-text border-status-atrisk-solid'
                                                }`}
                                            >
                                                {issue.isNotReady ? 'Not Ready' : 'At Risk'}
                                            </span>

                                            {issue.timeBadge && (
                                                <span className="text-caption text-text-secondary font-medium">
                                                    {issue.timeBadge}
                                                </span>
                                            )}

                                            <span className="text-text-muted">•</span>

                                            <span className="font-semibold text-text-primary">
                                                {issue.procedureName}
                                            </span>

                                            <span className="text-text-muted">•</span>

                                            <span className="text-caption text-text-secondary font-medium">
                                                {issue.operatingRoom}
                                            </span>

                                            {issue.assetTag && (
                                                <span className="text-caption bg-panel-header border border-border text-text-muted px-1.5 py-0.5 rounded-[4px] tabular-nums">
                                                    {issue.assetTag}
                                                </span>
                                            )}
                                        </div>

                                        {/* Problem & Recommended Action */}
                                        <p className="text-body text-text-primary leading-relaxed">
                                            <span className="font-medium text-text-secondary">Problem: </span>
                                            <span>{issue.problem} </span>
                                            <span className="font-medium text-accent">Action: </span>
                                            <span>{issue.action}</span>
                                        </p>

                                        {/* Multi-Surgery Impact Note */}
                                        {issue.otherSurgeriesText && (
                                            <p className="text-caption text-status-atrisk-text font-medium">
                                                {issue.otherSurgeriesText}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
                                        {isEngineer ? (
                                            <>
                                                {/* 1. Open equipment */}
                                                {issue.assetId ? (
                                                    <Link
                                                        href={`/assets/${issue.assetId}`}
                                                        className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 rounded-[4px] text-caption font-medium border border-border-strong bg-panel hover:bg-panel-header text-text-primary transition-colors cursor-pointer whitespace-nowrap"
                                                    >
                                                        Open equipment
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href="/assets"
                                                        className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 rounded-[4px] text-caption font-medium border border-border-strong bg-panel hover:bg-panel-header text-text-primary transition-colors cursor-pointer whitespace-nowrap"
                                                    >
                                                        Open equipment
                                                    </Link>
                                                )}

                                                {/* 2. Record maintenance (if fixable by PM/repair) */}
                                                {issue.isMaintenanceFixable && issue.assetId && (
                                                    <Link
                                                        href={`/maintenance?asset_id=${issue.assetId}&record=true`}
                                                        className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 rounded-[4px] text-caption font-medium border border-accent bg-accent text-white hover:bg-accent-hover transition-colors cursor-pointer whitespace-nowrap"
                                                    >
                                                        Record maintenance
                                                    </Link>
                                                )}

                                                {/* 3. Report or view incident */}
                                                {issue.hasOpenIncident ? (
                                                    <Link
                                                        href={issue.assetId ? `/assets/${issue.assetId}` : '/maintenance?tab=breakdowns'}
                                                        className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 rounded-[4px] text-caption font-medium border border-status-notready-solid bg-status-notready-bg text-status-notready-text hover:bg-panel transition-colors cursor-pointer whitespace-nowrap"
                                                    >
                                                        {issue.openIncidentLabel}
                                                    </Link>
                                                ) : issue.assetId ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setReportingAsset({
                                                            id: issue.assetId,
                                                            name: issue.assetName,
                                                            tag: issue.assetTag
                                                        })}
                                                        className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 rounded-[4px] text-caption font-medium border border-border-strong bg-panel hover:bg-panel-header text-text-primary transition-colors cursor-pointer whitespace-nowrap"
                                                    >
                                                        Report an incident
                                                    </button>
                                                ) : null}

                                                {/* 4. View surgery (read-only) */}
                                                <Link
                                                    href={`/surgeries?surgery_id=${issue.surgeryId}`}
                                                    className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 rounded-[4px] text-caption font-medium border border-border bg-panel hover:bg-panel-header text-text-secondary hover:text-text-primary transition-colors cursor-pointer whitespace-nowrap"
                                                >
                                                    View surgery
                                                </Link>
                                            </>
                                        ) : (
                                            /* Admin: Keep original single link */
                                            <Link
                                                href={`/surgeries?surgery_id=${issue.surgeryId}`}
                                                className="self-start md:self-center border border-border-strong bg-panel hover:bg-panel-header text-text-primary px-3 py-1.5 rounded-[4px] text-caption font-medium transition-colors whitespace-nowrap cursor-pointer"
                                            >
                                                Open surgery
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Show All / Show Less link */}
                        {hasMore && (
                            <div className="text-right pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowAll(true)}
                                    className="text-caption text-accent hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
                                >
                                    Show all {issues.length} issues &rarr;
                                </button>
                            </div>
                        )}

                        {showAll && issues.length > 5 && (
                            <div className="text-right pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowAll(false)}
                                    className="text-caption text-accent hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
                                >
                                    Show fewer issues &uarr;
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Incident Reporting Modal */}
            {reportingAsset && (
                <ReportIncidentModal
                    isOpen={true}
                    onClose={() => setReportingAsset(null)}
                    assetId={reportingAsset.id}
                    assetName={reportingAsset.name}
                    assetTag={reportingAsset.tag}
                    onSuccess={() => {
                        setReportingAsset(null);
                        if (onIncidentReported) onIncidentReported();
                    }}
                />
            )}
        </section>
    );
}
