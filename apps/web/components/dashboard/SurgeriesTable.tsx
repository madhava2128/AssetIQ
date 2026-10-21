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
        <div className="bg-panel border border-border rounded p-4">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <div>
                    <h3 className="text-section-heading text-text-primary">
                        Scheduled Surgeries
                    </h3>
                    <p className="text-body text-text-secondary mt-0.5">
                        List of surgeries and readiness checks for the selected day.
                    </p>
                </div>
                <span className="text-caption text-text-secondary bg-subtle border border-border px-2.5 py-1 rounded tabular-nums">
                    {surgeries.length} {surgeries.length === 1 ? 'surgery' : 'surgeries'}
                </span>
            </div>

            {surgeries.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-body">
                    No surgeries scheduled for this date.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-table border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-subtle text-caption font-medium text-text-secondary">
                                <th className="p-3">Surgery code</th>
                                <th className="p-3">Procedure name</th>
                                <th className="p-3">Operating room</th>
                                <th className="p-3">Lead surgeon</th>
                                <th className="p-3">Scheduled time</th>
                                <th className="p-3">Readiness</th>
                                <th className="p-3">Safety assessment</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {surgeries.map(surgery => {
                                const rawStatus = surgery.readiness_status || surgery.final_status;
                                const status = (rawStatus ? rawStatus : 'NOT_CHECKED').toUpperCase();
                                const theme = getReadinessStatusTheme(status);
                                const worstRule = surgery.worst_rule_fired;
                                const ruleMessage = status === 'NOT_CHECKED'
                                    ? 'Safety assessment not yet checked'
                                    : (worstRule && worstRule !== 'RULE_7_ALL_CHECKS_PASSED'
                                        ? formatRuleMessage(worstRule)
                                        : 'All equipment rules verified and compliant');

                                return (
                                    <tr key={surgery.id} className="hover:bg-subtle">
                                        <td className="p-3 font-medium text-text-primary tabular-nums">{surgery.surgery_code}</td>
                                        <td className="p-3 font-medium text-text-primary">{surgery.procedure_name}</td>
                                        <td className="p-3 text-text-secondary">{surgery.operating_room}</td>
                                        <td className="p-3 text-text-secondary">{surgery.surgeon_name}</td>
                                        <td className="p-3 text-text-secondary tabular-nums">
                                            {surgery.scheduled_start_time ? surgery.scheduled_start_time.split('T')[1]?.substring(0, 5) : '08:00'} –{' '}
                                            {surgery.scheduled_end_time ? surgery.scheduled_end_time.split('T')[1]?.substring(0, 5) : '10:00'}
                                        </td>
                                        <td className="p-3">
                                            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${theme.badgeClass}`}>
                                                {theme.label}
                                            </span>
                                        </td>
                                        <td className="p-3 text-caption text-text-secondary">
                                            {ruleMessage}
                                        </td>
                                        <td className="p-3 text-right">
                                            <Link
                                                href={`/surgeries/${surgery.id}`}
                                                className="text-accent hover:text-accent-hover text-caption font-medium underline"
                                            >
                                                View details
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
