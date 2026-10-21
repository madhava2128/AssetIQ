'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TOKENS } from '@/lib/tokens';

interface ReadinessDistributionChartProps {
    readyCount: number;
    atRiskCount: number;
    notReadyCount: number;
}

export default function ReadinessDistributionChart({
    readyCount,
    atRiskCount,
    notReadyCount
}: ReadinessDistributionChartProps) {
    const data = [
        { name: 'Ready', value: readyCount, color: TOKENS.status.ready.solid },
        { name: 'At Risk', value: atRiskCount, color: TOKENS.status.atRisk.solid },
        { name: 'Not Ready', value: notReadyCount, color: TOKENS.status.notReady.solid }
    ].filter(item => item.value > 0);

    const total = readyCount + atRiskCount + notReadyCount;

    return (
        <div className="bg-panel border border-border rounded p-4 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-1 pb-2 border-b border-border">
                    <h3 className="text-body font-semibold text-text-primary">
                        Surgery readiness share
                    </h3>
                    <span className="text-caption text-text-muted tabular-nums">
                        {total} total surgeries
                    </span>
                </div>
                <p className="text-caption text-text-secondary mb-3">
                    Proportion of scheduled procedures cleared versus flagged.
                </p>
            </div>

            <div className="h-60 w-full">
                {data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-text-muted text-body">
                        No surgeries scheduled for the selected date range.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Legend
                                verticalAlign="top"
                                height={32}
                                formatter={(value) => (
                                    <span className="text-caption text-text-primary px-1 font-medium">{value}</span>
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
                                    backgroundColor: TOKENS.neutrals.panel,
                                    borderColor: TOKENS.neutrals.border,
                                    borderRadius: '4px',
                                    color: TOKENS.neutrals.textPrimary,
                                    fontSize: '13px'
                                }}
                                formatter={(value: any) => [`${value} surgeries`, 'Status']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>

            <p className="text-caption text-text-muted pt-2 border-t border-border mt-2">
                Green indicates procedures ready to proceed; amber and red require clinical or engineering resolution.
            </p>
        </div>
    );
}
