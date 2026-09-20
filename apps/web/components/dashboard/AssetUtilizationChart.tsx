'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AssetUtilizationChartProps {
    assets: any[];
}

export default function AssetUtilizationChart({ assets }: AssetUtilizationChartProps) {
    const categoryHours: Record<string, { totalHours: number; count: number }> = {};

    (assets || []).forEach(a => {
        const cat = a.category || 'General';
        if (!categoryHours[cat]) {
            categoryHours[cat] = { totalHours: 0, count: 0 };
        }
        categoryHours[cat].totalHours += Number(a.total_operating_hours || 0);
        categoryHours[cat].count += 1;
    });

    const data = Object.keys(categoryHours).map(cat => ({
        category: cat.length > 14 ? cat.substring(0, 12) + '...' : cat,
        fullCategory: cat,
        avgHours: Math.round(categoryHours[cat].totalHours / categoryHours[cat].count)
    })).sort((a, b) => b.avgHours - a.avgHours).slice(0, 7);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    Asset Utilization (Avg Operating Hours)
                </h3>
                <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">
                    By Category
                </span>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                            dataKey="category"
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                        />
                        <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                borderColor: '#334155',
                                borderRadius: '8px',
                                color: '#f8fafc'
                            }}
                            formatter={(value: any) => [`${value} hrs`, 'Avg Operating Hours']}
                        />
                        <Bar dataKey="avgHours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
