'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface EquipmentRiskChartProps {
    assets: any[];
}

export default function EquipmentRiskChart({ assets }: EquipmentRiskChartProps) {
    // Sort assets by risk priority / operating hours or status
    const chartData = (assets || [])
        .map(a => {
            let riskScore = 0.15;
            if (a.status === 'UNDER_REPAIR') riskScore = 0.95;
            else if (a.status !== 'AVAILABLE') riskScore = 0.80;
            else if (a.is_pm_overdue) riskScore = 0.65;
            else if (a.warranty_expiration_date && new Date(a.warranty_expiration_date) < new Date()) riskScore = 0.45;

            return {
                name: a.asset_tag || a.name || 'Asset',
                category: a.category || 'Equipment',
                riskScore: Math.round(riskScore * 100),
                status: a.status
            };
        })
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 8);

    const getBarColor = (score: number) => {
        if (score >= 80) return '#ef4444'; // Red
        if (score >= 40) return '#f59e0b'; // Amber
        return '#10b981'; // Green
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Equipment Failure Risk Index (%)
                </h3>
                <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">
                    Top High-Risk Assets
                </span>
            </div>

            <div className="h-64 w-full">
                {chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                        No asset risk data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis
                                dataKey="name"
                                stroke="#64748b"
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                interval={0}
                                angle={-25}
                                textAnchor="end"
                            />
                            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#334155',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                                formatter={(value: any) => [`${value}%`, 'Failure Risk Score']}
                            />
                            <Bar dataKey="riskScore" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.riskScore)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
