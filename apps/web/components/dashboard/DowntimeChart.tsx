'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TOKENS } from '@/lib/tokens';

interface DowntimeChartProps {
    breakdowns: any[];
    assets?: any[];
}

export default function DowntimeChart({ breakdowns, assets = [] }: DowntimeChartProps) {
    const categoryDowntimeHours: Record<string, number> = {};

    // Build asset ID to category map
    const assetCategoryMap: Record<string, string> = {};
    (assets || []).forEach(a => {
        if (a.id) {
            let cat = a.category ? a.category.replace(/_/g, ' ') : 'General Medical';
            cat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
            assetCategoryMap[a.id] = cat;
        }
    });

    (breakdowns || []).forEach(b => {
        const cat = (b.asset_id && assetCategoryMap[b.asset_id])
            ? assetCategoryMap[b.asset_id]
            : (b.severity ? `${b.severity} Priority` : 'General Equipment');

        const hours = Number(b.downtime_hours || 0);
        if (!categoryDowntimeHours[cat]) {
            categoryDowntimeHours[cat] = 0;
        }
        categoryDowntimeHours[cat] += hours;
    });

    const data = Object.keys(categoryDowntimeHours)
        .map(cat => ({
            category: cat,
            shortCategory: cat.length > 18 ? cat.substring(0, 16) + '...' : cat,
            downtimeDays: Number((categoryDowntimeHours[cat] / 24).toFixed(1))
        }))
        .sort((a, b) => b.downtimeDays - a.downtimeDays)
        .slice(0, 6);

    const totalDays = Number((data.reduce((a, b) => a + b.downtimeDays, 0)).toFixed(1));

    return (
        <div className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden flex flex-col justify-between">
            <div className="panel-header-band flex items-center justify-between">
                <div>
                    <h3 className="text-body font-semibold text-text-primary">
                        Downtime in days by equipment category
                    </h3>
                    <p className="text-caption text-text-secondary mt-0.5">
                        Out-of-service days recorded across medical equipment types.
                    </p>
                </div>
                <span className="text-caption text-text-muted tabular-nums">
                    {totalDays} days total
                </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="h-60 w-full">
                    {data.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-text-muted text-body">
                            No equipment downtime recorded.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={data}
                                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={TOKENS.chart.gridline} />
                                <XAxis
                                    type="number"
                                    stroke={TOKENS.text.secondary}
                                    tick={{ fill: TOKENS.text.secondary, fontSize: 11 }}
                                    unit=" d"
                                />
                                <YAxis
                                    type="category"
                                    dataKey="shortCategory"
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
                                        `${value} days out of service`,
                                        item.payload.category
                                    ]}
                                />
                                <Bar dataKey="downtimeDays" fill={TOKENS.chart.accent} radius={[0, 2, 2, 0]} barSize={14} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <p className="text-caption text-text-muted pt-2 border-t border-border mt-2">
                    Longer bars mean more days that equipment was unavailable for surgical use.
                </p>
            </div>
        </div>
    );
}
