'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CapexOpexChartProps {
    assets: any[];
    maintenanceRecords: any[];
}

export default function CapexOpexChart({ assets, maintenanceRecords }: CapexOpexChartProps) {
    const categoryCosts: Record<string, { opex: number; capex: number }> = {};

    (assets || []).forEach(a => {
        const cat = a.category || 'General';
        if (!categoryCosts[cat]) {
            categoryCosts[cat] = { opex: 0, capex: 0 };
        }
        // Estimated CAPEX value per asset unit in INR (e.g. ₹35,00,000 for Anesthesia, ₹25,00,000 for Ventilator)
        const estValue = cat.toLowerCase().includes('anesthesia') ? 3500000
                        : cat.toLowerCase().includes('ventilator') ? 2500000
                        : cat.toLowerCase().includes('monitor') ? 1000000
                        : cat.toLowerCase().includes('defibrillator') ? 1500000
                        : 2000000;
        categoryCosts[cat].capex += estValue;
    });

    (maintenanceRecords || []).forEach(m => {
        const cost = Number(m.cost || 0) * 80; // Convert USD base cost to INR equivalent
        // Find asset category
        const asset = (assets || []).find(a => a.id === m.asset_id);
        const cat = asset ? asset.category : 'General';
        if (!categoryCosts[cat]) {
            categoryCosts[cat] = { opex: 0, capex: 0 };
        }
        categoryCosts[cat].opex += cost;
    });

    const data = Object.keys(categoryCosts).map(cat => ({
        category: cat.length > 12 ? cat.substring(0, 10) + '...' : cat,
        fullCategory: cat,
        CAPEX: categoryCosts[cat].capex,
        OPEX: categoryCosts[cat].opex
    })).slice(0, 6);

    return (
        <div className="instrument-panel p-5 font-mono">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-3">
                <h3 className="text-base font-bold text-[var(--color-text-primary)] font-sans">
                    CAPEX Asset Value vs OPEX Maintenance Cost (₹ INR)
                </h3>
                <span className="text-xs text-[var(--color-text-muted)] font-mono border border-[var(--color-border)] px-2.5 py-0.5 rounded">
                    Financial Telemetry
                </span>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(143, 166, 163, 0.15)" />
                        <XAxis
                            dataKey="category"
                            stroke="var(--color-text-muted)"
                            tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                        />
                        <YAxis
                            stroke="var(--color-text-muted)"
                            tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                            tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#16262C',
                                borderColor: 'rgba(143, 166, 163, 0.3)',
                                borderRadius: '4px',
                                color: '#E7EEEC',
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: '12px'
                            }}
                            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            formatter={(value) => (
                                <span className="text-xs text-[var(--color-text-primary)] font-mono font-bold px-1">{value}</span>
                            )}
                        />
                        <Bar dataKey="CAPEX" fill="var(--color-accent)" name="CAPEX (Asset Value)" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="OPEX" fill="var(--color-status-atrisk)" name="OPEX (Maintenance)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

