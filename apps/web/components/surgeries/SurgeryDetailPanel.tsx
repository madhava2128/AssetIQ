'use client';

import React, { useEffect, useState } from 'react';
import { formatSurgeryDate, formatSurgeryTimeRange } from '@/lib/date-utils';
import { formatEnumValue, getReadinessStatusTheme } from '@/lib/formatters';
import { computeSurgeryEquipmentAllocation, SurgeryAllocationResult } from '@/lib/equipment-allocation';

interface SurgeryDetailPanelProps {
    surgery: any;
    allSurgeries: any[];
    allAssets: any[];
    canEdit: boolean;
    onClose: () => void;
    onEdit: (surgery: any) => void;
    onCancelSurgery: (surgeryId: string) => void;
    onChangeEquipment?: (surgery: any) => void;
}

export default function SurgeryDetailPanel({
    surgery,
    allSurgeries,
    allAssets,
    canEdit,
    onClose,
    onEdit,
    onCancelSurgery,
    onChangeEquipment
}: SurgeryDetailPanelProps) {
    const [explanation, setExplanation] = useState<string | null>(null);
    const [recommendedActions, setRecommendedActions] = useState<string[]>([]);
    const [loadingExplanation, setLoadingExplanation] = useState(false);

    // Compute allocation results
    const allocation: SurgeryAllocationResult = computeSurgeryEquipmentAllocation(
        surgery,
        allSurgeries,
        allAssets
    );

    // Determine readiness status
    const isCancelled = surgery.status === 'CANCELLED';
    const isCompleted = surgery.status === 'COMPLETED';
    const rawStatus = surgery.readiness_status || surgery.final_status;
    const statusTheme = getReadinessStatusTheme(isCancelled ? 'NOT_CHECKED' : rawStatus);

    useEffect(() => {
        if (!surgery || isCancelled) {
            setExplanation(null);
            setRecommendedActions([]);
            return;
        }

        // Fetch plain-English AI explanation if assessment or status exists
        const fetchExplanation = async () => {
            if (rawStatus === 'NOT_CHECKED' || !rawStatus) {
                setExplanation('Not yet checked. Readiness is checked 24 hours before the surgery.');
                setRecommendedActions([]);
                return;
            }

            setLoadingExplanation(true);
            try {
                const res = await fetch('/api/explanation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        assessment: {
                            surgery_id: surgery.id,
                            final_status: rawStatus,
                            worst_rule_fired: surgery.worst_rule_fired || null,
                            surgery,
                            asset_assessments: allocation.rows.map(r => ({
                                status: r.status,
                                rule_fired: r.status !== 'READY' ? r.status_reason : null,
                                asset: {
                                    asset_tag: r.allocated_equipment,
                                    name: r.category_name,
                                    category: r.required_category
                                }
                            }))
                        }
                    })
                });

                const data = await res.json();
                if (data.success && data.data) {
                    setExplanation(data.data.explanation || null);
                    setRecommendedActions(data.data.recommended_actions || []);
                } else {
                    setExplanation(
                        rawStatus === 'READY'
                            ? 'All required medical devices are operational, assigned, and cleared for this scheduled procedure.'
                            : rawStatus === 'AT_RISK'
                            ? 'Assigned equipment has preventive maintenance due or contract expiry. Clinical inspection recommended before incision.'
                            : 'Required critical equipment is under repair or unavailable. Substitution required immediately.'
                    );
                }
            } catch {
                setExplanation(
                    rawStatus === 'READY'
                        ? 'All required equipment is verified and operational.'
                        : 'Readiness issues detected. Please review required equipment allocation.'
                );
            } finally {
                setLoadingExplanation(false);
            }
        };

        fetchExplanation();
    }, [surgery?.id, rawStatus, isCancelled]);

    if (!surgery) return null;

    const timeRange = formatSurgeryTimeRange(surgery.scheduled_start_time, surgery.scheduled_end_time);
    const dateFormatted = formatSurgeryDate(surgery.scheduled_start_time);
    const departmentName = surgery.department || formatEnumValue(surgery.surgery_type || 'GENERAL_SURGERY');

    return (
        <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] md:w-[620px] bg-panel border-l border-border shadow-none flex flex-col overflow-hidden">
            {/* 1. Header Bar */}
            <div className="panel-header-band p-4 sm:p-5 border-b border-border flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-section-heading font-semibold text-text-primary">
                            {surgery.procedure_name}
                        </h2>
                    </div>
                    <div className="text-caption text-text-secondary mt-1 space-x-2 tabular-nums">
                        <span>{surgery.surgery_code}</span>
                        {surgery.patient_id && (
                            <>
                                <span>·</span>
                                <span>Patient: {surgery.patient_id}</span>
                            </>
                        )}
                        <span>·</span>
                        <span>{departmentName}</span>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="text-text-muted hover:text-text-primary p-1.5 rounded hover:bg-subtle transition-colors cursor-pointer"
                    aria-label="Close panel"
                >
                    ✕
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                {/* 1. Metadata Grid */}
                <div className="bg-subtle border border-border rounded p-3.5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-caption">
                        <div>
                            <span className="text-text-secondary block">Date</span>
                            <span className="font-semibold text-text-primary mt-0.5 block tabular-nums">{dateFormatted}</span>
                        </div>
                        <div>
                            <span className="text-text-secondary block">Time</span>
                            <span className="font-semibold text-text-primary mt-0.5 block tabular-nums">{timeRange}</span>
                        </div>
                        <div>
                            <span className="text-text-secondary block">Operating room</span>
                            <span className="font-semibold text-text-primary mt-0.5 block">{surgery.operating_room}</span>
                        </div>
                        <div>
                            <span className="text-text-secondary block">Status</span>
                            <span className={`inline-block font-semibold mt-0.5 ${
                                isCancelled ? 'text-text-muted line-through' : 'text-text-primary'
                            }`}>
                                {formatEnumValue(surgery.status)}
                            </span>
                        </div>
                    </div>
                    {surgery.surgeon_name && (
                        <div className="mt-2.5 pt-2.5 border-t border-border text-caption">
                            <span className="text-text-secondary">Lead surgeon: </span>
                            <span className="font-medium text-text-primary">{surgery.surgeon_name}</span>
                        </div>
                    )}
                </div>

                {/* 2. Readiness Summary Box */}
                <div className={`p-4 rounded border ${statusTheme.bannerClass} space-y-2.5`}>
                    <div className="flex items-center justify-between">
                        <span className="text-caption font-semibold">
                            Readiness assessment:
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusTheme.badgeClass}`}>
                            {statusTheme.label}
                        </span>
                    </div>

                    <div className="text-body leading-relaxed text-text-primary max-w-[70ch]">
                        {loadingExplanation ? (
                            <span className="text-text-muted">Loading assessment explanation...</span>
                        ) : (
                            explanation || 'Not yet checked. Readiness is checked 24 hours before the surgery.'
                        )}
                    </div>

                    {recommendedActions.length > 0 && (
                        <div className="pt-2 border-t border-border">
                            <div className="text-caption font-medium text-text-secondary mb-1">
                                Recommended actions:
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-caption text-text-primary max-w-[70ch]">
                                {recommendedActions.map((action, idx) => (
                                    <li key={idx}>{action}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* 3. Equipment Allocation Table */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-body font-semibold text-text-primary">
                                Equipment Allocation
                            </h3>
                            <p className="text-caption text-text-secondary mt-0.5">
                                Verifying equipment availability and allocation for this scheduled procedure.
                            </p>
                        </div>
                    </div>

                    <div className="border border-border rounded overflow-hidden bg-panel">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-table border-collapse">
                                <thead>
                                    <tr className="bg-subtle border-b border-border text-text-secondary font-medium">
                                        <th className="p-2.5">Equipment needed</th>
                                        <th className="p-2.5 text-center">Needed</th>
                                        <th className="p-2.5 text-center">Available</th>
                                        <th className="p-2.5">Allocated equipment</th>
                                        <th className="p-2.5">Status</th>
                                        <th className="p-2.5">Allocation check</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {allocation.rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-text-muted">
                                                No equipment items registered for this surgery.
                                            </td>
                                        </tr>
                                    ) : (
                                        allocation.rows.map((row, idx) => {
                                            const itemTheme = getReadinessStatusTheme(row.status);
                                            const isShort = row.allocation_check !== 'OK';

                                            return (
                                                <tr key={idx} className="hover:bg-subtle transition-colors">
                                                    <td className="p-2.5 font-medium text-text-primary">
                                                        {row.category_name}
                                                    </td>
                                                    <td className="p-2.5 text-center text-text-primary tabular-nums">
                                                        {row.quantity_needed}
                                                    </td>
                                                    <td className="p-2.5 text-center text-text-primary tabular-nums">
                                                        {row.quantity_available}
                                                    </td>
                                                    <td className="p-2.5 text-text-secondary tabular-nums">
                                                        {row.allocated_equipment}
                                                    </td>
                                                    <td className="p-2.5">
                                                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium border ${itemTheme.badgeClass}`}>
                                                            {itemTheme.label}
                                                        </span>
                                                        {row.status_reason && row.status !== 'READY' && (
                                                            <div className="text-[10px] text-text-muted mt-0.5">
                                                                {row.status_reason}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-2.5">
                                                        <span className={`text-caption font-medium ${
                                                            isShort ? 'text-status-notready-text bg-status-notready-bg border border-status-notready-solid px-1.5 py-0.5 rounded' : 'text-status-ready-text'
                                                        }`}>
                                                            {row.allocation_check}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 4. Allocation Summary Line */}
                    <div className={`p-3 rounded border text-caption font-medium flex items-center justify-between ${
                        allocation.summary_status === 'NOT_READY'
                            ? 'bg-status-notready-bg border-status-notready-solid text-status-notready-text'
                            : allocation.summary_status === 'AT_RISK'
                            ? 'bg-status-atrisk-bg border-status-atrisk-solid text-status-atrisk-text'
                            : 'bg-status-ready-bg border-status-ready-solid text-status-ready-text'
                    }`}>
                        <span>{allocation.summary_text}</span>
                        <span className="font-semibold text-caption">
                            {allocation.summary_status === 'NOT_READY' ? 'Shortage' : allocation.summary_status === 'AT_RISK' ? 'Attention Needed' : 'Confirmed'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 5. Bottom Actions Bar (Only for roles allowed to edit) */}
            {canEdit && !isCancelled && !isCompleted && (
                <div className="p-4 border-t border-border bg-subtle flex items-center justify-between gap-3">
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to cancel this scheduled surgery?')) {
                                onCancelSurgery(surgery.id);
                            }
                        }}
                        className="px-3 py-1.5 border border-status-notready-solid bg-panel text-status-notready-text hover:bg-status-notready-bg rounded text-caption font-medium transition-colors cursor-pointer"
                    >
                        Cancel surgery
                    </button>

                    <div className="flex items-center gap-2">
                        {onChangeEquipment && (
                            <button
                                onClick={() => onChangeEquipment(surgery)}
                                className="px-3 py-1.5 border border-border-strong bg-panel hover:bg-subtle text-text-primary rounded text-caption font-medium transition-colors cursor-pointer"
                            >
                                Change equipment list
                            </button>
                        )}
                        <button
                            onClick={() => onEdit(surgery)}
                            className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white rounded text-caption font-medium transition-colors cursor-pointer"
                        >
                            Edit surgery
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
}
