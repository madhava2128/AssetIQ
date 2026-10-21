'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TOKENS } from '@/lib/tokens';

interface AssetUtilizationChartProps {
    assets: any[];
}

export default function AssetUtilizationChart({ assets }: AssetUtilizationChartProps) {
    const categoryHours: Record<string, { totalHours: number; count: number }> = {};

    (assets || []).forEach(a => {
        let cat = a.category ? a.category.replace(/_/g, ' ') : 'General Medical';
        cat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();

        if (!categoryHours[cat]) {
            categoryHours[cat] = { totalHours: 0, count: 0 };
        }
        categoryHours[cat].totalHours += Number(a.total_operating_hours || 0);
        categoryHours[cat].count += 1;
    });

    const data = Object.keys(categoryHours).map(cat => ({
        category: cat,
        shortCategory: cat.length > 18 ? cat.substring(0, 16) + '...' : cat,
        avgHours: Math.round(categoryHours[cat].totalHours / categoryHours[cat].count)
    })).sort((a, b) => b.avgHours - a.avgHours).slice(0, 6);

    return (
        <div className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden flex flex-col justify-between">
            <div className="panel-header-band flex items-center justify-between">
                <div>
                    <h3 className="text-body font-semibold text-text-primary">
                        Equipment utilization by category
                    </h3>
                    <p className="text-caption text-text-secondary mt-0.5">
                        Operating workload comparison across main equipment categories.
                    </p>
                </div>
                <span className="text-caption text-text-muted">
                    Average operating hours
                </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="h-60 w-full">
                    {data.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-text-muted text-body">
                            No equipment utilization records found.
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
                                    unit=" hrs"
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
                                        `${value} avg operating hours`,
                                        item.payload.category
                                    ]}
                                />
                                <Bar dataKey="avgHours" fill={TOKENS.chart.midBlue} radius={[0, 2, 2, 0]} barSize={14} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <p className="text-caption text-text-muted pt-2 border-t border-border mt-2">
                    Higher hours indicate heavily utilized equipment needing closer preventive attention.
                </p>
            </div>
        </div>
    );
}
