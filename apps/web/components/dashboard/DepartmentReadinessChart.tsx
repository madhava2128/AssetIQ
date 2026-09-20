'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DepartmentReadinessChartProps {
    surgeries: any[];
}

export default function DepartmentReadinessChart({ surgeries }: DepartmentReadinessChartProps) {
    const roomReadiness: Record<string, { READY: number; AT_RISK: number; NOT_READY: number }> = {};

    (surgeries || []).forEach(s => {
        const room = s.operating_room || 'OT-1';
        if (!roomReadiness[room]) {
            roomReadiness[room] = { READY: 0, AT_RISK: 0, NOT_READY: 0 };
        }
        const st = (s.readiness_status || s.final_status || 'READY').toUpperCase();
        if (st === 'NOT_READY') roomReadiness[room].NOT_READY++;
        else if (st === 'AT_RISK') roomReadiness[room].AT_RISK++;
        else roomReadiness[room].READY++;
    });

    const data = Object.keys(roomReadiness).map(room => ({
        room,
        READY: roomReadiness[room].READY,
        AT_RISK: roomReadiness[room].AT_RISK,
        NOT_READY: roomReadiness[room].NOT_READY
    })).sort((a, b) => a.room.localeCompare(b.room));

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    Operating Room Readiness Breakdown
                </h3>
                <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">
                    By OR / Department
                </span>
            </div>

            <div className="h-64 w-full">
                {data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                        No OR readiness data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="room" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#334155',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Bar dataKey="READY" stackId="a" fill="#10b981" />
                            <Bar dataKey="AT_RISK" stackId="a" fill="#f59e0b" />
                            <Bar dataKey="NOT_READY" stackId="a" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
