'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserRole, canUserEdit } from '@/lib/auth';
import RoleSelector from '@/components/dashboard/RoleSelector';

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

                // Fetch AI Explanation (Stage 6)
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
                setFeedbackMessage(data.error || 'Failed to save equipment override');
                return;
            }

            setFeedbackMessage('✓ Manual equipment override persisted successfully!');
            setIsOverriding(false);
            fetchData();
        } catch (err: any) {
            setFeedbackMessage(err.message);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-400 bg-slate-950 min-h-screen flex items-center justify-center font-sans">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading surgical equipment & readiness evaluation...</span>
                </div>
            </div>
        );
    }

    if (!surgery) {
        return (
            <div className="p-8 text-center text-rose-400 bg-slate-950 min-h-screen font-sans">
                Surgery not found.{' '}
                <Link href="/overview" className="underline text-sky-400">
                    Back to Overview
                </Link>
            </div>
        );
    }

    const finalStatus = (assessment?.final_status || surgery.status || 'READY').toUpperCase();
    const statusBadgeColor =
        finalStatus === 'NOT_READY'
            ? 'bg-rose-950 text-rose-300 border-rose-800'
            : finalStatus === 'AT_RISK'
            ? 'bg-amber-950 text-amber-300 border-amber-800'
            : 'bg-emerald-950 text-emerald-300 border-emerald-800';

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-slate-100 font-sans space-y-6">
            {/* Header & Role Selector */}
            <RoleSelector currentRole={role} onRoleChange={setRole} />

            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <Link href="/overview" className="text-xs text-sky-400 hover:underline">
                            ← Back to Overview
                        </Link>
                        <span className="text-slate-600">/</span>
                        <span className="text-xs font-mono text-slate-400">{surgery.surgery_code}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-100 mt-1 flex items-center gap-3">
                        <span>{surgery.procedure_name}</span>
                        <span className={`px-3 py-1 text-xs font-extrabold border rounded ${statusBadgeColor}`}>
                            {finalStatus}
                        </span>
                    </h1>
                </div>

                {canEdit ? (
                    <button
                        onClick={() => setIsOverriding(!isOverriding)}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition shadow-lg"
                    >
                        {isOverriding ? 'Cancel Manual Override' : 'Override Equipment Requirements'}
                    </button>
                ) : (
                    <div className="text-xs text-amber-400 bg-amber-950/80 border border-amber-800 px-3 py-1.5 rounded font-mono">
                        [READ-ONLY VIEWER ROLE]
                    </div>
                )}
            </div>

            {feedbackMessage && (
                <div className="p-3 bg-sky-950 border border-sky-800 text-sky-200 text-xs rounded-lg">
                    {feedbackMessage}
                </div>
            )}

            {/* Surgery Details Metadata Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Operating Room</span>
                    <span className="text-sm font-bold text-slate-100 font-mono mt-0.5 block">{surgery.operating_room}</span>
                </div>
                <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Lead Surgeon</span>
                    <span className="text-sm font-bold text-slate-100 mt-0.5 block">{surgery.surgeon_name}</span>
                </div>
                <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Patient ID</span>
                    <span className="text-sm font-bold text-slate-100 font-mono mt-0.5 block">{surgery.patient_id}</span>
                </div>
                <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Scheduled Window</span>
                    <span className="text-sm font-bold text-slate-100 font-mono mt-0.5 block">
                        {surgery.scheduled_start_time ? surgery.scheduled_start_time.split('T')[1]?.substring(0, 5) : '08:00'} -{' '}
                        {surgery.scheduled_end_time ? surgery.scheduled_end_time.split('T')[1]?.substring(0, 5) : '10:00'}
                    </span>
                </div>
            </div>

            {/* Stage 6 AI Explanation & Actionable Recommendations Card */}
            {explanationData && (
                <div className="bg-slate-900 border border-indigo-900/60 rounded-xl p-5 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                            AI Explanation & Recommended Actions (Stage 6)
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                            {explanationData.is_llm_generated ? 'LLM Generated (Validated)' : 'Templated Ground Truth Fallback'}
                        </span>
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed font-sans">
                        {explanationData.explanation}
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Recommended Actions:</h4>
                        <ul className="space-y-1.5">
                            {(explanationData.recommended_actions || []).map((action: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                                    <span className="text-sky-400 font-bold">•</span>
                                    <span>{action}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Per-Equipment Status Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-slate-100">
                        Per-Equipment Status, Risk Factors & Assigned Engineers
                    </h3>
                    <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2.5 py-1 rounded">
                        {assessment?.asset_assessments?.length || equipmentList.length} Items Required
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="p-3">Required Category</th>
                                <th className="p-3">Assigned Asset</th>
                                <th className="p-3">Criticality</th>
                                <th className="p-3">Rule Status</th>
                                <th className="p-3">Triggering Rule</th>
                                <th className="p-3">ML Risk Factor</th>
                                <th className="p-3">Assigned Bio Eng / ETA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {(assessment?.asset_assessments || []).map((item: any, idx: number) => {
                                const isNotReady = item.status === 'NOT_READY';
                                const isAtRisk = item.status === 'AT_RISK';

                                return (
                                    <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-3 font-semibold text-slate-100">{item.required_category}</td>
                                        <td className="p-3 font-mono text-slate-300">
                                            {item.asset_tag ? `${item.asset_name} [${item.asset_tag}]` : 'UNASSIGNED'}
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={`px-2 py-0.5 text-[10px] font-bold border rounded ${
                                                    item.criticality === 'CRITICAL'
                                                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                                                        : item.criticality === 'IMPORTANT'
                                                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                                                        : 'bg-slate-800 text-slate-300 border-slate-700'
                                                }`}
                                            >
                                                {item.criticality}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={`px-2 py-0.5 text-[10px] font-bold border rounded ${
                                                    isNotReady
                                                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                                                        : isAtRisk
                                                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                                                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-3 font-mono text-[11px] text-slate-400">{item.rule_fired}</td>
                                        <td className="p-3 font-mono text-[11px]">
                                            {isNotReady ? (
                                                <span className="text-rose-400">High Deficit (Rule Triggered)</span>
                                            ) : isAtRisk ? (
                                                <span className="text-amber-400">0.45 (Medium Risk)</span>
                                            ) : (
                                                <span className="text-emerald-400">0.05 (Low Risk)</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-slate-300 font-mono text-[11px]">
                                            {isNotReady ? (
                                                <span className="text-rose-400 font-bold">Eng: Alex Vance (ETA 30 mins)</span>
                                            ) : isAtRisk ? (
                                                <span className="text-amber-400">Eng: Sarah Connor (ETA 1 hr)</span>
                                            ) : (
                                                <span className="text-slate-400">Eng: Duty Engineer (On Standby)</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manual Override Controls (Visible only to authorized roles) */}
            {isOverriding && canEdit && (
                <div className="bg-slate-900 border border-sky-800 rounded-xl p-5 shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-sky-300 uppercase tracking-wider">
                        Manual Equipment Template Override
                    </h3>
                    <p className="text-xs text-slate-400">
                        Select specific assets to assign to this surgery. Changes persist across future edits.
                    </p>

                    <div className="space-y-3">
                        {equipmentList.map((req, idx) => (
                            <div key={idx} className="flex flex-wrap items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                                <div className="flex-1 min-w-[150px]">
                                    <label className="text-[10px] text-slate-400 block">Category</label>
                                    <input
                                        type="text"
                                        value={req.required_category}
                                        onChange={(e) => {
                                            const updated = [...equipmentList];
                                            updated[idx].required_category = e.target.value;
                                            setEquipmentList(updated);
                                        }}
                                        className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1"
                                    />
                                </div>

                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-[10px] text-slate-400 block">Assigned Asset</label>
                                    <select
                                        value={req.assigned_asset_id || ''}
                                        onChange={(e) => {
                                            const updated = [...equipmentList];
                                            updated[idx].assigned_asset_id = e.target.value || null;
                                            setEquipmentList(updated);
                                        }}
                                        className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1"
                                    >
                                        <option value="">Unassigned</option>
                                        {allAssets.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.name} [{a.asset_tag}] - Status: {a.status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] text-slate-400 block">Criticality</label>
                                    <select
                                        value={req.criticality}
                                        onChange={(e) => {
                                            const updated = [...equipmentList];
                                            updated[idx].criticality = e.target.value;
                                            setEquipmentList(updated);
                                        }}
                                        className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1"
                                    >
                                        <option value="CRITICAL">CRITICAL</option>
                                        <option value="IMPORTANT">IMPORTANT</option>
                                        <option value="STANDARD">STANDARD</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => {
                                        const updated = [...equipmentList];
                                        updated.splice(idx, 1);
                                        setEquipmentList(updated);
                                    }}
                                    className="mt-4 px-2 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded text-xs font-semibold"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSaveEquipmentOverride}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                        >
                            Save Manual Override
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
