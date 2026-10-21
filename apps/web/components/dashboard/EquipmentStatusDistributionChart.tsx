'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TOKENS } from '@/lib/tokens';

interface EquipmentStatusDistributionProps {
    assets: any[];
}

export default function EquipmentStatusDistributionChart({ assets }: EquipmentStatusDistributionProps) {
    const statusCounts: Record<string, number> = {
        'Available': 0,
        'In Use': 0,
        'Under Maintenance': 0,
        'Under Repair': 0
    };

    (assets || []).forEach(a => {
        const raw = (a.status || 'AVAILABLE').toUpperCase();
        if (raw === 'AVAILABLE') statusCounts['Available']++;
        else if (raw === 'IN_USE') statusCounts['In Use']++;
        else if (raw === 'UNDER_MAINTENANCE') statusCounts['Under Maintenance']++;
        else if (raw === 'UNDER_REPAIR') statusCounts['Under Repair']++;
        else statusCounts['Available']++;
    });

    const statusColors: Record<string, string> = {
        'Available': TOKENS.status.ready.solid,
        'In Use': TOKENS.chart.midBlue,
        'Under Maintenance': TOKENS.status.atRisk.solid,
        'Under Repair': TOKENS.status.notReady.solid
    };

    const data = Object.keys(statusCounts)
        .map(name => ({
            name,
            value: statusCounts[name],
            color: statusColors[name]
        }))
        .filter(d => d.value > 0);

    const total = (assets || []).length;

    return (
        <div className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden flex flex-col justify-between">
            <div className="panel-header-band flex items-center justify-between">
                <div>
                    <h3 className="text-body font-semibold text-text-primary">
                        Equipment by operational status
                    </h3>
                    <p className="text-caption text-text-secondary mt-0.5">
                        Shows operational readiness across all registered hospital equipment.
                    </p>
                </div>
                <span className="text-caption text-text-muted tabular-nums">
                    {total} total items
                </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="h-60 w-full">
                    {data.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-text-muted text-body">
                            No equipment registered in the inventory.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Legend
                                    verticalAlign="top"
                                    height={32}
                                    formatter={(value) => (
                                        <span className="text-caption text-text-primary px-1">{value}</span>
                                    )}
                                />
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: TOKENS.panel.bg,
                                        borderColor: TOKENS.panel.border,
                                        borderRadius: '6px',
                                        color: TOKENS.text.primary,
                                        fontSize: '13px'
                                    }}
                                    formatter={(value: any) => [`${value} units`, 'Equipment']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <p className="text-caption text-text-muted pt-2 border-t border-border mt-2">
                    Taller segments indicate more equipment currently in that operational state.
                </p>
            </div>
        </div>
    );
}
