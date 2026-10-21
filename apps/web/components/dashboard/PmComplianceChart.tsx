'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TOKENS } from '@/lib/tokens';

interface PmComplianceChartProps {
    assets: any[];
}

export default function PmComplianceChart({ assets }: PmComplianceChartProps) {
    const now = new Date();

    let compliantCount = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;

    (assets || []).forEach(a => {
        if (!a.next_pm_due_date) {
            compliantCount++;
            return;
        }

        const dueDate = new Date(a.next_pm_due_date);
        const graceDeadline = new Date(dueDate.getTime() + 7 * 24 * 3600 * 1000);

        if (now > graceDeadline) {
            overdueCount++;
        } else if (dueDate < now) {
            dueSoonCount++;
        } else {
            compliantCount++;
        }
    });

    const data = [
        { name: 'Compliant', value: compliantCount, color: TOKENS.status.ready.solid },
        { name: 'Due Soon', value: dueSoonCount, color: TOKENS.status.atRisk.solid },
        { name: 'Overdue', value: overdueCount, color: TOKENS.status.notReady.solid }
    ].filter(d => d.value > 0);

    const total = (assets || []).length;

    return (
        <div className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden flex flex-col justify-between">
            <div className="panel-header-band flex items-center justify-between">
                <div>
                    <h3 className="text-body font-semibold text-text-primary">
                        Preventive maintenance compliance
                    </h3>
                    <p className="text-caption text-text-secondary mt-0.5">
                        Tracks compliance with scheduled inspection intervals.
                    </p>
                </div>
                <span className="text-caption text-text-muted tabular-nums">
                    {total} assets tracked
                </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="h-60 w-full">
                    {data.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-text-muted text-body">
                            No maintenance records available.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Legend
                                    verticalAlign="top"
                                    height={32}
                                    formatter={(value) => (
                                        <span className="text-caption text-text-primary px-1">{value}</span>
                                    )}
                                />
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: TOKENS.panel.bg,
                                        borderColor: TOKENS.panel.border,
                                        borderRadius: '6px',
                                        color: TOKENS.text.primary,
                                        fontSize: '13px'
                                    }}
                                    formatter={(value: any) => [`${value} units`, 'Equipment']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <p className="text-caption text-text-muted pt-2 border-t border-border mt-2">
                    Overdue equipment requires inspection before assignment to surgery.
                </p>
            </div>
        </div>
    );
}
