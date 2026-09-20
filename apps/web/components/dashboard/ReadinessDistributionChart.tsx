'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ReadinessDistributionChartProps {
    readyCount: number;
    atRiskCount: number;
    notReadyCount: number;
}

const COLORS = {
    READY: '#4E9A82',     // Desaturated clinical green
    AT_RISK: '#C98A3B',   // Desaturated clinical amber
    NOT_READY: '#B44B4B'  // Desaturated clinical red
};

export default function ReadinessDistributionChart({
    readyCount,
    atRiskCount,
    notReadyCount
}: ReadinessDistributionChartProps) {
    const data = [
        { name: '● READY', value: readyCount, color: COLORS.READY },
        { name: '▲ AT RISK', value: atRiskCount, color: COLORS.AT_RISK },
        { name: '✕ NOT READY', value: notReadyCount, color: COLORS.NOT_READY }
    ].filter(item => item.value > 0);

    const total = readyCount + atRiskCount + notReadyCount;

    return (
        <div className="instrument-panel p-5 font-mono">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-3">
                <h3 className="text-base font-bold text-[var(--color-text-primary)] font-sans">
                    Surgery Readiness Distribution
                </h3>
                <span className="text-xs text-[var(--color-text-muted)] font-mono border border-[var(--color-border)] px-2.5 py-0.5 rounded">
                    Total: {total}
                </span>
            </div>

            <div className="h-64 w-full">
                {data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[var(--color-text-muted)] text-xs font-mono">
                        No surgery readiness data for selected date
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={4}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#16262C',
                                    borderColor: 'rgba(143, 166, 163, 0.3)',
                                    borderRadius: '4px',
                                    color: '#E7EEEC',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    fontSize: '12px'
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => (
                                    <span className="text-xs text-[var(--color-text-primary)] font-mono font-bold px-1">{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

