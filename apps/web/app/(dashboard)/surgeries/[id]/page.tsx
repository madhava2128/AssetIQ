'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserRole, canUserEdit } from '@/lib/auth';
import { formatEnumValue, formatRuleMessage, getReadinessStatusTheme } from '@/lib/formatters';

export default function SurgeryDetailPage({ params }: { params: { id: string } }) {
    const [role, setRole] = useState<UserRole>('biomedical_engineer');
    const [surgery, setSurgery] = useState<any | null>(null);
    const [assessment, setAssessment] = useState<any | null>(null);
    const [explanationData, setExplanationData] = useState<any | null>(null);
    const [allAssets, setAllAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOverriding, setIsOverriding] = useState(false);
    const [equipmentList, setEquipmentList] = useState<any[]>([]);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    const canEdit = canUserEdit(role);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [surgeryRes, assetsRes, readinessRes] = await Promise.all([
                fetch(`/api/surgeries/${params.id}`, { cache: 'no-store' }),
                fetch('/api/assets', { cache: 'no-store' }),
                fetch(`/api/readiness?surgery_id=${params.id}`, { cache: 'no-store' })
            ]);

            const surgeryData = await surgeryRes.json();
            const assetsData = await assetsRes.json();
            const readinessData = await readinessRes.json();

            if (surgeryData.success) {
                setSurgery(surgeryData.data);
                setEquipmentList(surgeryData.data.required_assets || []);
            }
            if (assetsData.success) {
                setAllAssets(assetsData.data);
            }
            if (readinessData.success && readinessData.assessment) {
                setAssessment(readinessData.assessment);

                try {
                    const expRes = await fetch('/api/explanation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ assessment: readinessData.assessment })
                    });
                    const expJson = await expRes.json();
                    if (expJson.success && expJson.data) {
                        setExplanationData(expJson.data);
                    }
                } catch (e) {
                    console.error('Failed to load explanation:', e);
                }
            }
        } catch (err) {
            console.error('Failed to load surgery detail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const handleSaveEquipmentOverride = async () => {
        if (!canEdit) return;
        setFeedbackMessage(null);
        try {
            const res = await fetch(`/api/surgeries/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ required_assets: equipmentList })
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setFeedbackMessage(data.error || 'Could not save equipment changes.');
                return;
            }

            setFeedbackMessage('Equipment changes saved successfully.');
            setIsOverriding(false);
            fetchData();
        } catch (err: any) {
            setFeedbackMessage(err.message || 'Could not save equipment changes.');
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-text-muted min-h-[400px] flex items-center justify-center text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading surgery details...</span>
                </div>
            </div>
        );
    }

    if (!surgery) {
        return (
            <div className="max-w-7xl mx-auto p-6 text-center text-sm">
                <p className="text-status-notready-text">Surgery not found.</p>
                <Link href="/surgeries" className="text-accent underline mt-2 inline-block">
                    Back to surgeries
                </Link>
            </div>
        );
    }

    const finalStatus = (assessment?.final_status || surgery.status || 'READY').toUpperCase();
    const statusTheme = getReadinessStatusTheme(finalStatus);

    return (
        <div className="space-y-6">
            {/* Page Header Band */}
            <div className="page-header-band px-4 sm:px-6 py-5 border-b border-border">
                <div className="max-w-7xl mx-auto">
                    <Link href="/surgeries" className="text-sm font-medium text-accent hover:underline inline-flex items-center gap-1 mb-2">
                        ← Back to surgeries
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-page-title text-text-primary">
                                    {surgery.procedure_name}
                                </h1>
                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-[4px] border ${statusTheme.badgeClass}`}>
                                    {statusTheme.label}
                                </span>
                            </div>
                            <p className="text-sm text-text-secondary mt-1 tabular-nums">
                                Surgery code: {surgery.surgery_code} · {formatEnumValue(surgery.surgery_type || 'GENERAL_SURGERY')}
                            </p>
                        </div>

                        {canEdit && (
                            <button
                                onClick={() => setIsOverriding(!isOverriding)}
                                className="border border-border-strong bg-panel hover:bg-table-hover text-text-primary px-3.5 py-1.5 rounded-[4px] text-sm font-medium transition-colors self-start sm:self-auto"
                            >
                                {isOverriding ? 'Cancel override' : 'Change equipment assignment'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 pb-12">
                {feedbackMessage && (
                    <div className="p-3.5 bg-subtle border border-accent text-accent text-sm rounded-[4px]">
                        {feedbackMessage}
                    </div>
                )}

                {/* Overall Status & Plain-English Explanation at the Top */}
                <div className={`p-5 rounded-[6px] border border-border border-l-[4px] ${statusTheme.bannerClass} space-y-3`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-text-primary">
                                Readiness Status: {statusTheme.label}
                            </h2>
                        </div>
                    </div>

                    {explanationData && explanationData.explanation && (
                        <div className="text-sm leading-relaxed text-text-primary max-w-[70ch]">
                            {explanationData.explanation}
                        </div>
                    )}

                    {explanationData && explanationData.recommended_actions && explanationData.recommended_actions.length > 0 && (
                        <div className="pt-2 border-t border-border">
                            <h3 className="text-xs font-semibold text-text-secondary mb-1">
                                Recommended actions:
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-text-primary">
                                {explanationData.recommended_actions.map((action: string, idx: number) => (
                                    <li key={idx}>{action}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Surgery Metadata Card */}
                <div className="bg-panel border border-border rounded-[6px] p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-xs font-medium text-text-muted block">Operating room</span>
                            <span className="font-semibold text-text-primary mt-0.5 block">{surgery.operating_room}</span>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-text-muted block">Lead surgeon</span>
                            <span className="font-semibold text-text-primary mt-0.5 block">{surgery.surgeon_name}</span>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-text-muted block">Patient ID</span>
                            <span className="font-semibold text-text-primary mt-0.5 block tabular-nums">{surgery.patient_id}</span>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-text-muted block">Scheduled time</span>
                            <span className="font-semibold text-text-primary mt-0.5 block tabular-nums">
                                {surgery.scheduled_start_time ? surgery.scheduled_start_time.split('T')[1]?.substring(0, 5) : '08:00'} –{' '}
                                {surgery.scheduled_end_time ? surgery.scheduled_end_time.split('T')[1]?.substring(0, 5) : '10:00'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Per-Equipment Status Table */}
                <div className="bg-panel border border-border rounded-[6px] overflow-hidden">
                    <div className="panel-header-band p-4 border-b border-border flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-text-primary">
                                Required Equipment ({assessment?.asset_assessments?.length || equipmentList.length} items)
                            </h3>
                            <p className="text-sm text-text-secondary mt-0.5">
                                Status and risk check for each piece of equipment assigned to this surgery.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-table-header text-xs font-semibold text-text-primary">
                                    <th className="p-3">Required Equipment</th>
                                    <th className="p-3">Assigned Asset</th>
                                    <th className="p-3">Criticality</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Safety Assessment</th>
                                    <th className="p-3">Assigned Engineer</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {(assessment?.asset_assessments || []).map((item: any, idx: number) => {
                                    const itemTheme = getReadinessStatusTheme(item.status);
                                    const ruleText = item.rule_fired ? formatRuleMessage(item.rule_fired) : 'Checked and ready';

                                    return (
                                        <tr key={idx} className="odd:bg-panel even:bg-table-stripe hover:bg-table-hover transition-colors">
                                            <td className="p-3 font-medium text-text-primary">{item.required_category}</td>
                                            <td className="p-3 text-text-primary tabular-nums">
                                                {item.asset_tag ? `${item.asset_name || ''} (${item.asset_tag})` : 'Unassigned'}
                                            </td>
                                            <td className="p-3 text-text-secondary">
                                                {item.criticality ? formatEnumValue(item.criticality) : 'Routine'}
                                            </td>
                                            <td className="p-3">
                                                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-[4px] ${itemTheme.badgeClass}`}>
                                                    {itemTheme.label}
                                                </span>
                                            </td>
                                        <td className="p-3 text-xs text-text-muted">
                                            {ruleText}
                                        </td>
                                        <td className="p-3 text-xs text-text-muted">
                                            {item.status === 'NOT_READY'
                                                ? 'Alex Vance (ETA 30 mins)'
                                                : item.status === 'AT_RISK'
                                                ? 'Sarah Connor (ETA 1 hr)'
                                                : 'Duty Engineer on standby'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Equipment Override Controls */}
            {isOverriding && canEdit && (
                <div className="bg-panel border border-border rounded-md p-5 space-y-4">
                    <div>
                        <h3 className="text-base font-semibold text-text-primary">
                            Manual Equipment Assignment
                        </h3>
                        <p className="text-sm text-text-secondary mt-0.5">
                            Reassign specific equipment units for this surgery.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {equipmentList.map((req, idx) => (
                            <div key={idx} className="flex flex-wrap items-center gap-3 bg-subtle p-3 rounded border border-border">
                                <div className="flex-1 min-w-[150px]">
                                    <label className="text-xs font-medium text-text-muted block mb-1">Equipment category</label>
                                    <input
                                        type="text"
                                        value={req.required_category}
                                        onChange={(e) => {
                                            const updated = [...equipmentList];
                                            updated[idx].required_category = e.target.value;
                                            setEquipmentList(updated);
                                        }}
                                        className="w-full bg-panel border border-border-strong text-sm text-text-primary rounded px-3 py-1.5 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                                    />
                                </div>

                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-xs font-medium text-text-muted block mb-1">Assigned equipment</label>
                                    <select
                                        value={req.assigned_asset_id || ''}
                                        onChange={(e) => {
                                            const updated = [...equipmentList];
                                            updated[idx].assigned_asset_id = e.target.value || null;
                                            setEquipmentList(updated);
                                        }}
                                        className="w-full bg-panel border border-border-strong text-sm text-text-primary rounded px-3 py-1.5 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                                    >
                                        <option value="">Unassigned</option>
                                        {allAssets.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.name} ({a.asset_tag}) – {formatEnumValue(a.status)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-text-muted block mb-1">Criticality</label>
                                    <select
                                        value={req.criticality}
                                        onChange={(e) => {
                                            const updated = [...equipmentList];
                                            updated[idx].criticality = e.target.value;
                                            setEquipmentList(updated);
                                        }}
                                        className="bg-panel border border-border-strong text-sm text-text-primary rounded px-3 py-1.5 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                                    >
                                        <option value="CRITICAL">Critical</option>
                                        <option value="IMPORTANT">Important</option>
                                        <option value="STANDARD">Routine</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => {
                                        const updated = [...equipmentList];
                                        updated.splice(idx, 1);
                                        setEquipmentList(updated);
                                    }}
                                    className="mt-5 px-3 py-1.5 border border-status-notready-solid bg-panel hover:bg-status-notready-bg text-status-notready-text rounded text-xs font-medium transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={handleSaveEquipmentOverride}
                            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-[4px] text-sm font-medium transition-colors"
                        >
                            Save equipment changes
                        </button>
                        <button
                            onClick={() => setIsOverriding(false)}
                            className="border border-border-strong bg-panel hover:bg-table-hover text-text-primary px-4 py-2 rounded-[4px] text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
