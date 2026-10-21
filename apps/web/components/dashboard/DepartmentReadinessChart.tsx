'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TOKENS } from '@/lib/tokens';

interface DepartmentReadinessChartProps {
    surgeries: any[];
}

export default function DepartmentReadinessChart({ surgeries }: DepartmentReadinessChartProps) {
    const roomReadiness: Record<string, { Ready: number; 'At Risk': number; 'Not Ready': number }> = {};

    (surgeries || []).forEach(s => {
        const room = s.operating_room || 'OT-1';
        if (!roomReadiness[room]) {
            roomReadiness[room] = { Ready: 0, 'At Risk': 0, 'Not Ready': 0 };
        }
        const st = (s.readiness_status || s.final_status || 'READY').toUpperCase();
        if (st === 'NOT_READY') roomReadiness[room]['Not Ready']++;
        else if (st === 'AT_RISK') roomReadiness[room]['At Risk']++;
        else if (st === 'READY') roomReadiness[room].Ready++;
    });

    const data = Object.keys(roomReadiness).map(room => ({
        room,
        Ready: roomReadiness[room].Ready,
        'At Risk': roomReadiness[room]['At Risk'],
        'Not Ready': roomReadiness[room]['Not Ready']
    })).sort((a, b) => a.room.localeCompare(b.room));

    const totalSurgeries = (surgeries || []).length;

    return (
        <div className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden flex flex-col justify-between">
            <div className="panel-header-band flex items-center justify-between">
                <div>
                    <h3 className="text-body font-semibold text-text-primary">
                        Readiness by operating room
                    </h3>
                    <p className="text-caption text-text-secondary mt-0.5">
                        Surgery readiness breakdown across operating rooms.
                    </p>
                </div>
                <span className="text-caption text-text-muted tabular-nums">
                    {totalSurgeries} procedures
                </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="h-60 w-full">
                    {data.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-text-muted text-body">
                            No surgeries scheduled across operating rooms for this period.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.chart.gridline} />
                                <XAxis
                                    dataKey="room"
                                    stroke={TOKENS.text.secondary}
                                    tick={{ fill: TOKENS.text.secondary, fontSize: 12 }}
                                />
                                <YAxis
                                    stroke={TOKENS.text.secondary}
                                    tick={{ fill: TOKENS.text.secondary, fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: TOKENS.panel.bg,
                                        borderColor: TOKENS.panel.border,
                                        borderRadius: '6px',
                                        color: TOKENS.text.primary,
                                        fontSize: '13px'
                                    }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={32}
                                    formatter={(value) => (
                                        <span className="text-caption text-text-primary px-1 font-medium">{value}</span>
                                    )}
                                />
                                <Bar dataKey="Ready" stackId="a" fill={TOKENS.status.ready.solid} barSize={22} />
                                <Bar dataKey="At Risk" stackId="a" fill={TOKENS.status.atRisk.solid} barSize={22} />
                                <Bar dataKey="Not Ready" stackId="a" fill={TOKENS.status.notReady.solid} barSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <p className="text-caption text-text-muted pt-2 border-t border-border mt-2">
                    Green bars indicate ready procedures; amber and red bars flag rooms with unresolved equipment issues.
                </p>
            </div>
        </div>
    );
}
