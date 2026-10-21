'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TOKENS } from '@/lib/tokens';

interface EquipmentRiskChartProps {
    assets: any[];
}

export default function EquipmentRiskChart({ assets }: EquipmentRiskChartProps) {
    const chartData = (assets || [])
        .map(a => {
            let riskScore = 15;
            if (a.status === 'UNDER_REPAIR') riskScore = 95;
            else if (a.status !== 'AVAILABLE') riskScore = 80;
            else if (a.is_pm_overdue) riskScore = 65;
            else if (a.contract_status === 'Expired') riskScore = 55;
            else if ((a.warranty_expiration_date || a.warranty_end_date) && new Date(a.warranty_expiration_date || a.warranty_end_date) < new Date()) riskScore = 45;

            const displayName = a.asset_tag ? `${a.asset_tag} (${a.name?.substring(0, 14) || 'Asset'})` : (a.name || 'Asset');

            return {
                name: displayName,
                fullAsset: `${a.asset_tag} — ${a.name}`,
                category: a.category || 'Equipment',
                riskScore,
                status: a.status
            };
        })
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 6);

    const getBarColor = (score: number) => {
        if (score >= 80) return TOKENS.status.notReady.solid;
        if (score >= 40) return TOKENS.status.atRisk.solid;
        return TOKENS.status.ready.solid;
    };

    return (
        <div className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden flex flex-col justify-between">
            <div className="panel-header-band flex items-center justify-between">
                <div>
                    <h3 className="text-body font-semibold text-text-primary">
                        Highest-risk equipment
                    </h3>
                    <p className="text-caption text-text-secondary mt-0.5">
                        Ranked by maintenance delays, repair tickets, and expired contracts.
                    </p>
                </div>
                <span className="text-caption text-text-muted">
                    Top {chartData.length} flagged units
                </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="h-60 w-full">
                    {chartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-text-muted text-body">
                            No equipment risk data available.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={chartData}
                                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={TOKENS.chart.gridline} />
                                <XAxis
                                    type="number"
                                    domain={[0, 100]}
                                    stroke={TOKENS.text.secondary}
                                    tick={{ fill: TOKENS.text.secondary, fontSize: 11 }}
                                    unit="%"
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke={TOKENS.text.secondary}
                                    tick={{ fill: TOKENS.text.secondary, fontSize: 11 }}
                                    width={120}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: TOKENS.panel.bg,
                                        borderColor: TOKENS.panel.border,
                                        borderRadius: '6px',
                                        color: TOKENS.text.primary,
                                        fontSize: '13px'
                                    }}
                                    formatter={(value: any, name: any, item: any) => [
                                        `${value}% risk score`,
                                        item.payload.fullAsset
                                    ]}
                                />
                                <Bar dataKey="riskScore" radius={[0, 2, 2, 0]} barSize={14}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getBarColor(entry.riskScore)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <p className="text-caption text-text-muted pt-2 border-t border-border mt-2">
                    Longer bars indicate higher operational risk due to repair status or maintenance delays.
                </p>
            </div>
        </div>
    );
}
