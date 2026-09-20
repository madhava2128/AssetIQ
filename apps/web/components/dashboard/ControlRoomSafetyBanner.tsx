'use client';

import React from 'react';
import { formatRuleMessage, getReadinessStatusTheme } from '@/lib/formatters';

interface ControlRoomSafetyBannerProps {
    surgeries: any[];
    selectedDate: string;
}

export default function ControlRoomSafetyBanner({ surgeries, selectedDate }: ControlRoomSafetyBannerProps) {
    const notReadySurgeries = (surgeries || []).filter(s => (s.readiness_status || s.final_status) === 'NOT_READY');
    const atRiskSurgeries = (surgeries || []).filter(s => (s.readiness_status || s.final_status) === 'AT_RISK');
    const readySurgeries = (surgeries || []).filter(s => (s.readiness_status || s.final_status) === 'READY');

    if (notReadySurgeries.length > 0) {
        const theme = getReadinessStatusTheme('NOT_READY');
        return (
            <div className={`rounded-xl p-5 border shadow-xl ${theme.bannerClass}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-rose-500/30 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-xl p-1.5 rounded-lg bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">🛑</span>
                        <div>
                            <h2 className="text-base font-bold text-rose-200">
                                {notReadySurgeries.length} {notReadySurgeries.length === 1 ? 'Surgery Has a' : 'Surgeries Have'} Critical Safety Blocker
                            </h2>
                            <p className="text-xs text-rose-300/80">Immediate action required before proceeding with surgical schedule on {selectedDate}</p>
                        </div>
                    </div>
                    <span className="text-xs text-rose-200 bg-rose-950 px-3 py-1 rounded-full border border-rose-500 font-bold self-start md:self-auto">
                        ACTION REQUIRED
                    </span>
                </div>

                <div className="space-y-2.5">
                    {notReadySurgeries.map((s, idx) => {
                        const ruleText = formatRuleMessage(s.worst_rule_fired);
                        return (
                            <div key={idx} className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-lg border border-rose-500/40">
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-rose-950 text-rose-300 border border-rose-700">
                                        {s.operating_room || 'OT'}
                                    </span>
                                    <div>
                                        <span className="font-bold text-sm text-slate-100">{s.surgery_code}</span>
                                        <span className="text-xs text-slate-300 ml-2">({s.procedure_name})</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="text-rose-300 font-semibold bg-rose-950/60 px-2.5 py-1 rounded border border-rose-800">
                                        ⚠️ {ruleText}
                                    </span>
                                    <span className="text-slate-400 font-mono">Surgeon: {s.surgeon_name}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (atRiskSurgeries.length > 0) {
        const theme = getReadinessStatusTheme('AT_RISK');
        return (
            <div className={`rounded-xl p-5 border shadow-xl ${theme.bannerClass}`}>
                <div className="flex items-center justify-between gap-3 border-b border-amber-500/30 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-xl p-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">⚠️</span>
                        <div>
                            <h2 className="text-base font-bold text-amber-200">
                                Attention: {atRiskSurgeries.length} {atRiskSurgeries.length === 1 ? 'Surgery Is' : 'Surgeries Are'} At Risk
                            </h2>
                            <p className="text-xs text-amber-300/80">Preventive maintenance or equipment warnings detected for {selectedDate}</p>
                        </div>
                    </div>
                    <span className="text-xs text-amber-200 bg-amber-950 px-3 py-1 rounded-full border border-amber-500 font-bold">
                        INSPECTION RECOMMENDED
                    </span>
                </div>

                <div className="space-y-2">
                    {atRiskSurgeries.map((s, idx) => {
                        const ruleText = formatRuleMessage(s.worst_rule_fired);
                        return (
                            <div key={idx} className="flex items-center justify-between bg-slate-900/90 px-3 py-2 rounded-lg border border-amber-500/40 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-amber-400">{s.operating_room}</span>
                                    <span className="text-slate-200 font-semibold">{s.surgery_code} — {s.procedure_name}</span>
                                </div>
                                <span className="font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                                    {ruleText}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    const theme = getReadinessStatusTheme('READY');
    return (
        <div className={`rounded-xl p-4 border shadow-md ${theme.bannerClass}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-lg p-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">✓</span>
                    <div>
                        <h2 className="text-sm font-bold text-emerald-200">
                            All {surgeries.length} Scheduled Surgical Suites Verified & Cleared
                        </h2>
                        <p className="text-xs text-emerald-300/80">Every required medical asset is matched, compliant, and operational for {selectedDate}</p>
                    </div>
                </div>
                <span className="text-xs text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-600 font-bold">
                    STATUS: ALL CLEAR
                </span>
            </div>
        </div>
    );
}


