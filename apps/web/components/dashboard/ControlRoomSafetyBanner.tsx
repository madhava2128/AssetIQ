'use client';

import React from 'react';
import { formatRuleMessage } from '@/lib/formatters';

interface ControlRoomSafetyBannerProps {
    surgeries: any[];
    selectedDate: string;
}

export default function ControlRoomSafetyBanner({ surgeries, selectedDate }: ControlRoomSafetyBannerProps) {
    const notReadySurgeries = (surgeries || []).filter(s => (s.readiness_status || s.final_status) === 'NOT_READY');
    const atRiskSurgeries = (surgeries || []).filter(s => (s.readiness_status || s.final_status) === 'AT_RISK');

    if (notReadySurgeries.length > 0) {
        return (
            <div className="rounded p-4 bg-status-notready-bg border border-status-notready-solid text-status-notready-text">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-status-notready-solid pb-3 mb-3">
                    <div>
                        <h2 className="text-section-heading font-semibold text-status-notready-text">
                            Action required: {notReadySurgeries.length} {notReadySurgeries.length === 1 ? 'surgery is not ready' : 'surgeries are not ready'}
                        </h2>
                        <p className="text-body text-status-notready-text mt-0.5 opacity-90">
                            Equipment or scheduling issues must be resolved before proceeding on {selectedDate}.
                        </p>
                    </div>
                    <span className="self-start sm:self-auto text-caption font-medium px-2.5 py-1 rounded bg-panel text-status-notready-text border border-status-notready-solid">
                        Not Ready
                    </span>
                </div>

                <div className="space-y-2">
                    {notReadySurgeries.map((s, idx) => {
                        const ruleText = formatRuleMessage(s.worst_rule_fired);
                        return (
                            <div key={idx} className="flex flex-wrap items-center justify-between gap-2 bg-panel p-3 rounded border border-border text-table">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-text-primary">{s.operating_room || 'OT'}</span>
                                    <span className="text-text-muted">—</span>
                                    <span className="font-semibold text-text-primary">{s.procedure_name}</span>
                                    <span className="text-text-muted text-caption tabular-nums">({s.surgery_code})</span>
                                </div>
                                <div className="flex items-center gap-3 text-caption">
                                    <span className="text-status-notready-text font-medium bg-status-notready-bg px-2 py-0.5 rounded border border-status-notready-solid">
                                        {ruleText}
                                    </span>
                                    <span className="text-text-secondary">Surgeon: {s.surgeon_name}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (atRiskSurgeries.length > 0) {
        return (
            <div className="rounded p-4 bg-status-atrisk-bg border border-status-atrisk-solid text-status-atrisk-text">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h2 className="text-section-heading font-semibold text-status-atrisk-text">
                            Attention: {atRiskSurgeries.length} {atRiskSurgeries.length === 1 ? 'surgery is at risk' : 'surgeries are at risk'}
                        </h2>
                        <p className="text-body text-status-atrisk-text mt-0.5 opacity-90">
                            Assigned equipment has upcoming maintenance or secondary risk factors on {selectedDate}.
                        </p>
                    </div>
                    <span className="text-caption font-medium px-2.5 py-1 rounded bg-panel text-status-atrisk-text border border-status-atrisk-solid">
                        At Risk
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded p-4 bg-status-ready-bg border border-status-ready-solid text-status-ready-text flex items-center justify-between">
            <div>
                <h2 className="text-section-heading font-semibold text-status-ready-text">
                    All scheduled surgeries are ready
                </h2>
                <p className="text-body text-status-ready-text mt-0.5 opacity-90">
                    All equipment and operating rooms are verified for {selectedDate}.
                </p>
            </div>
            <span className="text-caption font-medium px-2.5 py-1 rounded bg-panel text-status-ready-text border border-status-ready-solid">
                Ready
            </span>
        </div>
    );
}
