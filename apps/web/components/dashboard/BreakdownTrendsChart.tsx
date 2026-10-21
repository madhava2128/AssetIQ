'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TOKENS } from '@/lib/tokens';

interface BreakdownTrendsChartProps {
    breakdowns: any[];
}

export default function BreakdownTrendsChart({ breakdowns }: BreakdownTrendsChartProps) {
    // Group breakdowns by month for last 6 months
    const monthCounts: Record<string, number> = {};

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString('default', { month: 'short' });
        monthCounts[key] = 0;
    }

    (breakdowns || []).forEach(b => {
        if (b.reported_at) {
            const d = new Date(b.reported_at);
            const key = d.toLocaleString('default', { month: 'short' });
            if (monthCounts[key] !== undefined) {
                monthCounts[key]++;
            }
        }
    });

    const data = Object.keys(monthCounts).map(month => ({
        month,
        incidents: monthCounts[month]
    }));

    const totalIncidents = (breakdowns || []).length;

    return (
        <div className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden flex flex-col justify-between">
            <div className="panel-header-band flex items-center justify-between">
                <div>
                    <h3 className="text-body font-semibold text-text-primary">
                        Breakdowns per month, last 6 months
                    </h3>
                    <p className="text-caption text-text-secondary mt-0.5">
                        Monthly trend of reported medical equipment failure incidents.
                    </p>
                </div>
                <span className="text-caption text-text-muted tabular-nums">
                    {totalIncidents} total incidents
                </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="h-60 w-full">
                    {totalIncidents === 0 ? (
                        <div className="h-full flex items-center justify-center text-text-muted text-body">
                            No breakdown incidents recorded in the last 6 months.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.chart.gridline} />
                                <XAxis
                                    dataKey="month"
                                    stroke={TOKENS.text.secondary}
                                    tick={{ fill: TOKENS.text.secondary, fontSize: 12 }}
                                />
                                <YAxis
                                    stroke={TOKENS.text.secondary}
                                    tick={{ fill: TOKENS.text.secondary, fontSize: 12 }}
                                    allowDecimals={false}
                                    unit=""
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: TOKENS.panel.bg,
                                        borderColor: TOKENS.panel.border,
                                        borderRadius: '6px',
                                        color: TOKENS.text.primary,
                                        fontSize: '13px'
                                    }}
                                    formatter={(value: any) => [`${value} incidents`, 'Breakdowns']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="incidents"
                                    stroke={TOKENS.chart.accent}
                                    strokeWidth={2.5}
                                    dot={{ fill: TOKENS.chart.accent, r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <p className="text-caption text-text-muted pt-2 border-t border-border mt-2">
                    A downward slope shows improving equipment reliability across surgical operating rooms.
                </p>
            </div>
        </div>
    );
}
