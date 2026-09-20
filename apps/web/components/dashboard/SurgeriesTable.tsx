'use client';

import React from 'react';
import Link from 'next/link';
import { formatRuleMessage, getReadinessStatusTheme } from '@/lib/formatters';

interface SurgeriesTableProps {
    surgeries: any[];
    canEdit: boolean;
}

export default function SurgeriesTable({ surgeries, canEdit }: SurgeriesTableProps) {
    return (
        <div className="instrument-panel p-5 font-mono">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-3">
                <h3 className="text-base font-bold text-[var(--color-text-primary)] font-sans">
                    Scheduled Surgeries & Readiness Manifest
                </h3>
                <span className="text-xs text-[var(--color-text-muted)] font-mono border border-[var(--color-border)] px-2.5 py-1 rounded">
                    {surgeries.length} Surgeries Evaluated
                </span>
            </div>

            {surgeries.length === 0 ? (
                <div className="p-8 text-center text-[var(--color-text-muted)] text-xs font-mono">
                    No surgeries scheduled for this date.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                        <thead className="text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                            <tr>
                                <th className="p-2.5 font-bold">Surgery Code</th>
                                <th className="p-2.5 font-bold font-sans">Procedure Name</th>
                                <th className="p-2.5 font-bold">OR Room</th>
                                <th className="p-2.5 font-bold font-sans">Lead Surgeon</th>
                                <th className="p-2.5 font-bold">Time Window</th>
                                <th className="p-2.5 font-bold">Readiness</th>
                                <th className="p-2.5 font-bold font-sans">Triggering Safety Assessment</th>
                                <th className="p-2.5 text-right font-bold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]/40">
                            {surgeries.map(surgery => {
                                const status = (surgery.readiness_status || surgery.final_status || 'READY').toUpperCase();
                                const theme = getReadinessStatusTheme(status);
                                const worstRule = surgery.worst_rule_fired;
                                const ruleMessage = worstRule && worstRule !== 'RULE_7_ALL_CHECKS_PASSED' 
                                    ? formatRuleMessage(worstRule) 
                                    : 'All equipment rules verified and compliant';

                                return (
                                    <tr key={surgery.id} className="hover:bg-[var(--color-bg-primary)]/50 transition-colors">
                                        <td className="p-2.5 font-bold text-[var(--color-accent)]">{surgery.surgery_code}</td>
                                        <td className="p-2.5 text-[var(--color-text-primary)] font-sans font-semibold">{surgery.procedure_name}</td>
                                        <td className="p-2.5 text-[var(--color-text-muted)]">{surgery.operating_room}</td>
                                        <td className="p-2.5 text-[var(--color-text-muted)] font-sans">{surgery.surgeon_name}</td>
                                        <td className="p-2.5 text-[var(--color-text-muted)] text-[11px]">
                                            {surgery.scheduled_start_time ? surgery.scheduled_start_time.split('T')[1]?.substring(0, 5) : '08:00'} -{' '}
                                            {surgery.scheduled_end_time ? surgery.scheduled_end_time.split('T')[1]?.substring(0, 5) : '10:00'}
                                        </td>
                                        <td className="p-2.5">
                                            <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${theme.badgeClass}`}>
                                                {theme.glyph} {theme.shortLabel}
                                            </span>
                                        </td>
                                        <td className="p-2.5 text-[11px] font-sans">
                                            {status === 'READY' ? (
                                                <span className="text-[var(--color-status-ready)] font-semibold">✓ {ruleMessage}</span>
                                            ) : (
                                                <span className="text-[var(--color-status-atrisk)] font-semibold">⚠️ {ruleMessage}</span>
                                            )}
                                        </td>
                                        <td className="p-2.5 text-right">
                                            <Link
                                                href={`/surgeries/${surgery.id}`}
                                                className="px-3 py-1 bg-[var(--color-accent-bg)] text-[var(--color-accent)] border border-[var(--color-accent)] rounded text-[11px] font-bold hover:opacity-90 transition-opacity inline-block"
                                            >
                                                Inspect Detail
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}


