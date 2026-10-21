'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatRuleMessage, getReadinessStatusTheme } from '@/lib/formatters';

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

    return (
        <div className="bg-panel border border-border rounded overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
                {/* Left Rail: Surgeries List */}
                <div className="lg:col-span-4 border-r border-border bg-subtle p-4 flex flex-col">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                        <span className="text-body font-semibold text-text-primary">
                            Surgeries ({surgeries.length})
                        </span>
                        <span className="text-caption text-text-muted tabular-nums">
                            {selectedDate}
                        </span>
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[460px] pr-1">
                        {surgeries.map(s => {
                            const status = (s.readiness_status || s.final_status || 'READY').toUpperCase();
                            const theme = getReadinessStatusTheme(status);
                            const isSelected = s.id === (activeSurgery?.id);

                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedSurgeryId(s.id)}
                                    className={`w-full text-left p-2.5 rounded text-table flex items-center justify-between ${
                                        isSelected
                                            ? 'bg-accent-subtle border border-accent text-text-primary'
                                            : 'hover:bg-panel text-text-primary'
                                    }`}
                                >
                                    <div className="truncate pr-2">
                                        <div className="font-medium text-text-primary truncate">
                                            {s.operating_room || 'OT'} — {s.procedure_name}
                                        </div>
                                        <div className="text-caption text-text-muted tabular-nums">
                                            {s.surgery_code} · {s.scheduled_start_time ? s.scheduled_start_time.split('T')[1]?.substring(0, 5) : '08:00'}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded shrink-0 ${theme.badgeClass}`}>
                                        {theme.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Panel: Manifest Details */}
                <div className="lg:col-span-8 p-5 bg-panel flex flex-col justify-between">
                    {activeSurgery ? (
                        <div className="space-y-5">
                            {/* Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                                <div>
                                    <h3 className="text-section-heading text-text-primary">
                                        {activeSurgery.procedure_name}
                                    </h3>
                                    <div className="text-caption text-text-secondary mt-1 space-x-2 tabular-nums">
                                        <span>Room: {activeSurgery.operating_room}</span>
                                        <span>·</span>
                                        <span>Code: {activeSurgery.surgery_code}</span>
                                        <span>·</span>
                                        <span>Surgeon: {activeSurgery.surgeon_name}</span>
                                    </div>
                                </div>
                                <Link
                                    href={`/surgeries/${activeSurgery.id}`}
                                    className="bg-accent hover:bg-accent-hover text-white px-3 py-1.5 rounded text-caption font-medium"
                                >
                                    View surgery details
                                </Link>
                            </div>

                            {/* Readiness Summary Callout */}
                            {(() => {
                                const status = (activeSurgery.readiness_status || activeSurgery.final_status || 'READY').toUpperCase();
                                const theme = getReadinessStatusTheme(status);
                                const worstRule = activeSurgery.worst_rule_fired;
                                const ruleText = worstRule && worstRule !== 'RULE_7_ALL_CHECKS_PASSED'
                                    ? formatRuleMessage(worstRule)
                                    : 'All required equipment has been verified and cleared for surgery.';

                                return (
                                    <div className={`p-4 rounded border flex items-center justify-between gap-4 ${theme.bannerClass}`}>
                                        <div>
                                            <div className="text-caption font-medium opacity-80">Readiness status</div>
                                            <div className="text-lg font-bold mt-0.5">{theme.label}</div>
                                            <p className="text-caption mt-1">{ruleText}</p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Equipment Table */}
                            <div>
                                <h4 className="text-body font-semibold text-text-primary mb-2">Required equipment</h4>
                                <div className="border border-border rounded overflow-hidden">
                                    <table className="w-full text-left text-table">
                                        <thead className="bg-subtle text-text-secondary border-b border-border">
                                            <tr>
                                                <th className="p-2.5 font-medium">Equipment category</th>
                                                <th className="p-2.5 font-medium">Assigned asset</th>
                                                <th className="p-2.5 font-medium">Criticality</th>
                                                <th className="p-2.5 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {((activeSurgery.assessment?.asset_assessments) || [
                                                { required_category: 'Anesthesia Machine', asset_tag: 'AST-001', criticality: 'Critical', status: 'AT_RISK' },
                                                { required_category: 'Ventilator', asset_tag: 'AST-002', criticality: 'Critical', status: 'READY' },
                                                { required_category: 'Electrosurgical Unit', asset_tag: 'AST-003', criticality: 'Important', status: 'READY' }
                                            ]).map((item: any, idx: number) => {
                                                const itemTheme = getReadinessStatusTheme(item.status);
                                                return (
                                                    <tr key={idx} className="hover:bg-subtle">
                                                        <td className="p-2.5 font-medium text-text-primary">{item.required_category}</td>
                                                        <td className="p-2.5 text-text-secondary tabular-nums">{item.asset_tag || 'Unassigned'}</td>
                                                        <td className="p-2.5 text-text-secondary">{item.criticality}</td>
                                                        <td className="p-2.5">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${itemTheme.badgeClass}`}>
                                                                {itemTheme.label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-text-muted text-body py-12">
                            Select a surgery from the left list to view equipment readiness.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
