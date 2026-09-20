'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PmComplianceChartProps {
    assets: any[];
}

export default function PmComplianceChart({ assets }: PmComplianceChartProps) {
    const now = new Date();

    let compliantCount = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;

    (assets || []).forEach(a => {
        if (!a.next_pm_due_date) {
            compliantCount++;
            return;
        }

        const dueDate = new Date(a.next_pm_due_date);
        const graceDeadline = new Date(dueDate.getTime() + 7 * 24 * 3600 * 1000);

        if (now > graceDeadline) {
            overdueCount++;
        } else if (dueDate < now) {
            dueSoonCount++;
        } else {
            compliantCount++;
        }
    });

    const data = [
        { name: 'PM Compliant', value: compliantCount, color: '#10b981' },
        { name: 'Due Soon (In Grace)', value: dueSoonCount, color: '#f59e0b' },
        { name: 'PM Overdue', value: overdueCount, color: '#ef4444' }
    ].filter(d => d.value > 0);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    Preventative Maintenance (PM) Compliance
                </h3>
                <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">
                    Total: {assets.length}
                </span>
            </div>

            <div className="h-64 w-full">
                {data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                        No PM data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#334155',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => (
                                    <span className="text-xs text-slate-300 font-medium px-1">{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
