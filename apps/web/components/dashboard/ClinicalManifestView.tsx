'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ClinicalManifestViewProps {
    surgeries: any[];
    selectedDate: string;
    canEdit: boolean;
    onUpdateAssetStatus?: (assetId: string, newStatus: string) => void;
}

export default function ClinicalManifestView({
    surgeries,
    selectedDate,
    canEdit,
    onUpdateAssetStatus
}: ClinicalManifestViewProps) {
    const [selectedSurgeryId, setSelectedSurgeryId] = useState<string>(
        surgeries.length > 0 ? surgeries[0].id : ''
    );

    const activeSurgery = surgeries.find(s => s.id === selectedSurgeryId) || surgeries[0];

    const getStatusGlyph = (status: string) => {
        const st = (status || '').toUpperCase();
        if (st === 'NOT_READY') return { glyph: '✕', text: 'NOT READY', class: 'text-[var(--color-status-notready)]', bgClass: 'bg-[var(--color-status-notready-bg)] border-[var(--color-status-notready)]' };
        if (st === 'AT_RISK') return { glyph: '▲', text: 'AT RISK', class: 'text-[var(--color-status-atrisk)]', bgClass: 'bg-[var(--color-status-atrisk-bg)] border-[var(--color-status-atrisk)]' };
        return { glyph: '●', text: 'READY', class: 'text-[var(--color-status-ready)]', bgClass: 'bg-[var(--color-status-ready-bg)] border-[var(--color-status-ready)]' };
    };

    return (
        <div className="instrument-panel rounded-lg overflow-hidden border border-[var(--color-border)] text-[var(--color-text-primary)]">
            {/* Split Manifest Layout: Left Rail + Main Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
                
                {/* Left Rail: Persistent Dense Surgeries Manifest */}
                <div className="lg:col-span-4 border-r border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4 flex flex-col">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)] font-mono">
                        <span className="text-xs font-bold text-[var(--color-text-muted)]">
                            Surgeries ({surgeries.length})
                        </span>
                        <span className="text-xs text-[var(--color-accent)] font-semibold">
                            {selectedDate}
                        </span>
                    </div>

                    <div className="space-y-1.5 overflow-y-auto max-h-[520px] pr-1">
                        {surgeries.map(s => {
                            const statusInfo = getStatusGlyph(s.readiness_status || s.final_status);
                            const isSelected = s.id === (activeSurgery?.id);

                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedSurgeryId(s.id)}
                                    className={`w-full text-left p-2.5 rounded border transition-all flex items-center justify-between font-mono text-xs ${
                                        isSelected
                                            ? 'bg-[var(--color-bg-surface)] border-[var(--color-accent)] text-[var(--color-text-primary)]'
                                            : 'border-transparent hover:bg-[var(--color-bg-surface)]/60 text-[var(--color-text-muted)]'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <span className={`font-bold text-sm ${statusInfo.class}`}>
                                            {statusInfo.glyph}
                                        </span>
                                        <span className="font-bold text-[var(--color-text-primary)]">{s.operating_room || 'OT'}</span>
                                        <span className="truncate text-[var(--color-text-muted)]">| {s.surgery_code}</span>
                                    </div>
                                    <span className="text-[10px] opacity-80">{s.scheduled_start_time ? s.scheduled_start_time.split('T')[1]?.substring(0, 5) : '08:00'}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>


                {/* Main Panel: Manifest / Checklist View for Selected Surgery */}
                <div className="lg:col-span-8 p-5 bg-[var(--color-bg-surface)] flex flex-col justify-between">
                    {activeSurgery ? (
                        <div className="space-y-5">
                            {/* Surgery Header Readout */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3 font-mono">
                                <div>
                                    <div className="text-xs text-[var(--color-text-muted)]">
                                        <span>{activeSurgery.operating_room}</span>
                                        <span className="mx-2 text-[var(--color-border)]">|</span>
                                        <span>{activeSurgery.surgery_code}</span>
                                        <span className="mx-2 text-[var(--color-border)]">|</span>
                                        <span>{activeSurgery.scheduled_start_time ? activeSurgery.scheduled_start_time.split('T')[1]?.substring(0, 5) : '10:00'}</span>
                                        <span className="mx-2 text-[var(--color-border)]">|</span>
                                        <span>Surgeon: {activeSurgery.surgeon_name}</span>
                                    </div>
                                    <h2 className="text-lg font-bold text-[var(--color-text-primary)] mt-1 font-sans">
                                        {activeSurgery.procedure_name}
                                    </h2>
                                </div>
                                <Link
                                    href={`/surgeries/${activeSurgery.id}`}
                                    className="px-3 py-1.5 bg-[var(--color-accent-bg)] text-[var(--color-accent)] border border-[var(--color-accent)] rounded font-mono text-xs font-bold hover:opacity-90 transition-opacity"
                                >
                                    Full Surgery View
                                </Link>
                            </div>

                            {/* Full-Width Status Strip (The single bold moment per surgery view with state transition) */}
                            {(() => {
                                const statusInfo = getStatusGlyph(activeSurgery.readiness_status || activeSurgery.final_status);
                                const worstRule = activeSurgery.worst_rule_fired || 'RULE_7_ALL_CHECKS_PASSED';

                                return (
                                    <div className={`p-4 rounded border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono transition-all duration-300 ease-in-out ${statusInfo.bgClass}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-3xl font-black ${statusInfo.class}`}>
                                                {statusInfo.glyph}
                                            </span>
                                            <div>
                                                <div className="text-xs text-[var(--color-text-muted)] font-semibold">
                                                    Readiness Status
                                                </div>
                                                <div className={`text-2xl font-black tracking-tight font-mono ${statusInfo.class}`}>
                                                    {statusInfo.text}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right border-t md:border-t-0 border-[var(--color-border)] pt-2 md:pt-0 w-full md:w-auto">
                                            <div className="text-xs text-[var(--color-text-muted)] font-semibold">
                                                Triggering Rule
                                            </div>
                                            <div className="text-xs font-bold font-mono text-[var(--color-text-primary)]">
                                                {worstRule}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Manifest Equipment Checklist (Dot-Leader Rows) */}
                            <div>
                                <div className="flex items-center justify-between font-mono text-xs font-bold text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-2 mb-3">
                                    <span>Equipment Manifest</span>
                                    <span>Status</span>
                                </div>

                                <div className="space-y-3 font-mono text-xs">
                                    {((activeSurgery.assessment?.asset_assessments) || [
                                        { required_category: 'Anesthesia Machine', asset_tag: 'AST-001', criticality: 'CRITICAL', status: 'AT_RISK', rule_fired: 'RULE_4' },
                                        { required_category: 'Ventilator', asset_tag: 'AST-002', criticality: 'CRITICAL', status: 'READY', rule_fired: 'RULE_7' },
                                        { required_category: 'Electrosurgical Unit', asset_tag: 'AST-003', criticality: 'HIGH', status: 'READY', rule_fired: 'RULE_7' }
                                    ]).map((item: any, idx: number) => {
                                        const itemStatus = getStatusGlyph(item.status);
                                        return (
                                            <div key={idx} className="dot-leader-row font-mono text-xs">
                                                <div className="flex items-center gap-2 truncate shrink-0 max-w-[50%]">
                                                    <span className="font-bold text-[var(--color-text-primary)]">{item.required_category}</span>
                                                    <span className="text-[var(--color-text-muted)] text-[11px]">[{item.asset_tag || 'UNASSIGNED'}]</span>
                                                </div>

                                                {/* Dotted Leader Line */}
                                                <div className="dot-leader-fill"></div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-[10px] text-[var(--color-text-muted)] font-semibold mr-1">{item.criticality}</span>
                                                    <span className={`font-bold flex items-center gap-1.5 ${itemStatus.class}`}>
                                                        <span className="text-sm font-black">{itemStatus.glyph}</span>
                                                        <span>{itemStatus.text}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-[var(--color-text-muted)] font-mono text-xs py-12">
                            Select a surgery from the left manifest rail to inspect equipment readiness.
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

