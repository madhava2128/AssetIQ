'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BreakdownTrendsChartProps {
    breakdowns: any[];
}

export default function BreakdownTrendsChart({ breakdowns }: BreakdownTrendsChartProps) {
    // Group breakdowns by month
    const monthCounts: Record<string, number> = {};

    // Initialize 6 months history
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

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Breakdown Incident Trends (6 Months)
                </h3>
                <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">
                    Total: {breakdowns.length}
                </span>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="breakdownGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                borderColor: '#334155',
                                borderRadius: '8px',
                                color: '#f8fafc'
                            }}
                            formatter={(value: any) => [`${value} Incidents`, 'Breakdowns']}
                        />
                        <Area
                            type="monotone"
                            dataKey="incidents"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#breakdownGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
