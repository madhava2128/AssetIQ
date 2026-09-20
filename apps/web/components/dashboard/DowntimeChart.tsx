'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DowntimeChartProps {
    breakdowns: any[];
}

export default function DowntimeChart({ breakdowns }: DowntimeChartProps) {
    const severityDowntime: Record<string, number> = {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0
    };

    (breakdowns || []).forEach(b => {
        const sev = (b.severity || 'MEDIUM').toUpperCase();
        const hours = Number(b.downtime_hours || 0);
        if (severityDowntime[sev] !== undefined) {
            severityDowntime[sev] += hours;
        } else {
            severityDowntime[sev] = hours;
        }
    });

    const data = Object.keys(severityDowntime).map(sev => ({
        severity: sev,
        downtimeHours: Math.round(severityDowntime[sev] * 10) / 10
    }));

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Downtime Analysis (Hours by Severity)
                </h3>
                <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">
                    Total: {data.reduce((a, b) => a + b.downtimeHours, 0)} hrs
                </span>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="severity" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                borderColor: '#334155',
                                borderRadius: '8px',
                                color: '#f8fafc'
                            }}
                            formatter={(value: any) => [`${value} Hours`, 'Cumulative Downtime']}
                        />
                        <Bar dataKey="downtimeHours" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
