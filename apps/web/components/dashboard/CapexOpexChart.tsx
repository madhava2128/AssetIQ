'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TOKENS } from '@/lib/tokens';

interface CapexOpexChartProps {
    assets: any[];
    maintenanceRecords: any[];
}

export default function CapexOpexChart({ assets, maintenanceRecords }: CapexOpexChartProps) {
    const categoryCosts: Record<string, { opex: number; capex: number }> = {};

    (assets || []).forEach(a => {
        let cat = a.category ? a.category.replace(/_/g, ' ') : 'General Medical';
        cat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();

        if (!categoryCosts[cat]) {
            categoryCosts[cat] = { opex: 0, capex: 0 };
        }
        const estValue = cat.toLowerCase().includes('anesthesia') ? 3500000
                        : cat.toLowerCase().includes('ventilator') ? 2500000
                        : cat.toLowerCase().includes('monitor') ? 1000000
                        : cat.toLowerCase().includes('defibrillator') ? 1500000
                        : cat.toLowerCase().includes('c-arm') ? 4500000
                        : 2000000;
        categoryCosts[cat].capex += estValue;
    });

    (maintenanceRecords || []).forEach(m => {
        const cost = Number(m.cost || 0);
        const asset = (assets || []).find(a => a.id === m.asset_id);
        let cat = asset && asset.category ? asset.category.replace(/_/g, ' ') : 'General Medical';
        cat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();

        if (!categoryCosts[cat]) {
            categoryCosts[cat] = { opex: 0, capex: 0 };
        }
        categoryCosts[cat].opex += cost;
    });

    const data = Object.keys(categoryCosts).map(cat => ({
        category: cat,
        shortCategory: cat.length > 14 ? cat.substring(0, 12) + '...' : cat,
        'Asset Value': categoryCosts[cat].capex,
        'Maintenance Cost': categoryCosts[cat].opex
    })).slice(0, 5);

    return (
        <div className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden flex flex-col justify-between">
            <div className="panel-header-band flex items-center justify-between">
                <div>
                    <h3 className="text-body font-semibold text-text-primary">
                        Equipment value vs maintenance expenditure
                    </h3>
                    <p className="text-caption text-text-secondary mt-0.5">
                        Capital asset value compared against maintenance spending.
                    </p>
                </div>
                <span className="text-caption text-text-muted">
                    In ₹ Lakhs
                </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="h-60 w-full">
                    {data.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-text-muted text-body">
                            No expenditure data available.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 5, right: 15, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.chart.gridline} />
                                <XAxis
                                    dataKey="shortCategory"
                                    stroke={TOKENS.text.secondary}
                                    tick={{ fill: TOKENS.text.secondary, fontSize: 11 }}
                                />
                                <YAxis
                                    stroke={TOKENS.text.secondary}
                                    tick={{ fill: TOKENS.text.secondary, fontSize: 11 }}
                                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: TOKENS.panel.bg,
                                        borderColor: TOKENS.panel.border,
                                        borderRadius: '6px',
                                        color: TOKENS.text.primary,
                                        fontSize: '13px'
                                    }}
                                    formatter={(value: any, name: any) => [
                                        `₹${Number(value).toLocaleString('en-IN')}`,
                                        name
                                    ]}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={32}
                                    formatter={(value) => (
                                        <span className="text-caption text-text-primary px-1 font-medium">{value}</span>
                                    )}
                                />
                                <Bar dataKey="Asset Value" fill={TOKENS.chart.accent} radius={[2, 2, 0, 0]} barSize={16} />
                                <Bar dataKey="Maintenance Cost" fill={TOKENS.chart.slateDark} radius={[2, 2, 0, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <p className="text-caption text-text-muted pt-2 border-t border-border mt-2">
                    Compares the initial equipment asset investment against cumulative maintenance and servicing expenditure.
                </p>
            </div>
        </div>
    );
}
