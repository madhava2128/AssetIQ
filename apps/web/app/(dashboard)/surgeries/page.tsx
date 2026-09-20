'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, canEditSurgeries } from '@/lib/auth';
import SurgeryForm from '../../../components/forms/SurgeryForm';
import { formatEnumValue, formatRuleMessage, getReadinessStatusTheme } from '@/lib/formatters';

export default function SurgeriesPage() {
    const [userRole, setUserRole] = useState<UserRole>('ot_admin');
    const [surgeries, setSurgeries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [orFilter, setOrFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingSurgery, setEditingSurgery] = useState<any | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Direct per-page server session role fetch on page load
    useEffect(() => {
        const fetchServerRole = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('assetiq_auth_token') : null;
                const res = await fetch('/api/auth/me', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                const data = await res.json();
                if (data.authenticated && data.role) {
                    setUserRole(data.role);
                } else if (typeof window !== 'undefined') {
                    const storedRole = localStorage.getItem('assetiq_user_role') as UserRole;
                    if (storedRole) setUserRole(storedRole);
                }
            } catch {
                if (typeof window !== 'undefined') {
                    const storedRole = localStorage.getItem('assetiq_user_role') as UserRole;
                    if (storedRole) setUserRole(storedRole);
                }
            }
        };
        fetchServerRole();
    }, []);

    const canEdit = canEditSurgeries(userRole);

    const fetchSurgeries = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (orFilter) params.append('operating_room', orFilter);
            if (statusFilter) params.append('status', statusFilter);

            const res = await fetch(`/api/surgeries?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                // Fetch readiness for each surgery
                const list = await Promise.all((data.data || []).map(async (s: any) => {
                    try {
                        const rRes = await fetch(`/api/readiness?surgery_id=${s.id}`, { cache: 'no-store' });
                        const rData = await rRes.json();
                        if (rData.success && rData.assessment) {
                            return { ...s, readiness_status: rData.assessment.final_status, worst_rule_fired: rData.assessment.worst_rule_fired };
                        }
                    } catch {}
                    return s;
                }));
                setSurgeries(list);
            }
        } catch (err) {
            console.error('Failed to fetch surgeries', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSurgeries();
    }, [orFilter, statusFilter]);

    const handleCreateOrUpdate = async (formData: any) => {
        if (!canEdit) {
            const err = "Access Denied: Role '" + userRole + "' is not authorized to create or edit surgeries.";
            setErrorMessage(err);
            throw new Error(err);
        }
        setErrorMessage(null);
        try {
            let res;
            if (editingSurgery) {
                res = await fetch(`/api/surgeries/${editingSurgery.id}`, {
                    method: 'PATCH',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('assetiq_auth_token')}`
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                res = await fetch('/api/surgeries', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('assetiq_auth_token')}`
                    },
                    body: JSON.stringify(formData)
                });
            }

            const data = await res.json();
            if (!res.ok || !data.success) {
                const errText = data.error || 'Database write failure: Surgery record could not be saved.';
                setErrorMessage(errText);
                throw new Error(errText);
            }

            setShowForm(false);
            setEditingSurgery(null);
            await fetchSurgeries();
        } catch (err: any) {
            setErrorMessage(err.message);
            throw err;
        }
    };

    const handleCancelSurgery = async (id: string) => {
        if (!canEdit) {
            setErrorMessage("Access Denied: Only OT Admin or Hospital Admin can cancel surgeries.");
            return;
        }
        if (!confirm('Are you sure you want to cancel this scheduled surgery?')) return;
        try {
            const res = await fetch(`/api/surgeries/${id}`, { 
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('assetiq_auth_token')}`
                }
            });
            const data = await res.json();
            if (data.success) {
                await fetchSurgeries();
            } else {
                setErrorMessage(data.error);
            }
        } catch (err: any) {
            setErrorMessage(err.message);
        }
    };

    // Categorize surgeries for OT Admin Focal Point
    const needsAttentionSurgeries = surgeries.filter(s => {
        const hasUnassigned = s.required_assets?.some((r: any) => !r.assigned_asset);
        const isNotReady = (s.readiness_status || s.final_status) === 'NOT_READY';
        const isAtRisk = (s.readiness_status || s.final_status) === 'AT_RISK';
        return hasUnassigned || isNotReady || isAtRisk;
    });

    const routineSurgeries = surgeries.filter(s => !needsAttentionSurgeries.includes(s));

    const renderSurgeryCard = (surgery: any, highlightAttention = false) => {
        const readinessTheme = getReadinessStatusTheme(surgery.readiness_status || surgery.final_status);
        const hasUnassigned = surgery.required_assets?.some((r: any) => !r.assigned_asset);

        return (
            <div key={surgery.id} className={`p-5 rounded-xl border transition-all shadow-md ${
                highlightAttention 
                    ? 'bg-slate-900 border-amber-500/60 shadow-amber-950/20' 
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
            }`}>
                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-sky-400 font-bold bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                                {surgery.surgery_code}
                            </span>
                            <span className="font-bold text-base text-slate-100">{surgery.procedure_name}</span>
                            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                {formatEnumValue(surgery.surgery_type || 'GENERAL_SURGERY')}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                            <div>🏥 <strong className="text-emerald-400 font-semibold">{surgery.operating_room}</strong></div>
                            <div>👨‍⚕️ Surgeon: <strong className="text-slate-200">{surgery.surgeon_name}</strong></div>
                            <div>👤 Patient ID: <strong className="text-slate-300 font-mono">{surgery.patient_id}</strong></div>
                            <div>⏰ Scheduled: <strong className="text-sky-300">{surgery.scheduled_start_time?.replace('T', ' ').substring(0, 16)} — {surgery.scheduled_end_time?.replace('T', ' ').substring(11, 16)}</strong></div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Readiness Tag */}
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${readinessTheme.badgeClass}`}>
                            {readinessTheme.glyph} {readinessTheme.shortLabel}
                        </span>

                        {/* Surgery Lifecycle Status */}
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                            Status: {formatEnumValue(surgery.status)}
                        </span>

                        <a
                            href={`/surgeries/${surgery.id}`}
                            className="px-3 py-1 bg-sky-900/60 hover:bg-sky-800 text-sky-200 border border-sky-600 text-xs rounded-lg font-semibold transition"
                        >
                            View Equipment Map
                        </a>

                        {canEdit && surgery.status !== 'CANCELLED' && (
                            <button
                                onClick={() => handleCancelSurgery(surgery.id)}
                                className="px-3 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs rounded-lg font-semibold transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Required Assets & Criticality Mapping */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="text-xs font-semibold text-slate-400 mb-2 flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                            <span>Required Medical Equipment Checklist ({surgery.required_assets?.length || 0} items)</span>
                            {hasUnassigned && (
                                <span className="text-[10px] font-bold text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-700">
                                    ⚠️ Action Needed: Equipment Unassigned
                                </span>
                            )}
                        </span>
                        {surgery.worst_rule_fired && (
                            <span className="text-[11px] text-amber-300 font-semibold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700">
                                ⚠️ Rule: {formatRuleMessage(surgery.worst_rule_fired)}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {surgery.required_assets?.map((req: any) => (
                            <div key={req.id} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                    req.criticality === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-700' :
                                    req.criticality === 'IMPORTANT' ? 'bg-amber-950 text-amber-300 border border-amber-700' :
                                    'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}>
                                    {formatEnumValue(req.criticality)}
                                </span>

                                <span className="font-semibold text-slate-200">{formatEnumValue(req.required_category)}</span>

                                {req.assigned_asset ? (
                                    <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded text-[11px] font-mono">
                                        ✓ [{req.assigned_asset.asset_tag}] {req.assigned_asset.name}
                                    </span>
                                ) : (
                                    <span className="text-rose-300 font-bold bg-rose-950/80 border border-rose-700 px-2 py-0.5 rounded text-[11px] animate-pulse">
                                        ⚠️ Needs Assignment
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-slate-100 font-sans space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-sky-400">Surgery Management & Equipment Allocation</h1>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-300 uppercase">
                            Role: {userRole}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400">Schedule surgical procedures, verify equipment requirements, and ensure OT readiness.</p>
                </div>
                {canEdit ? (
                    <button
                        onClick={() => { setEditingSurgery(null); setShowForm(true); setErrorMessage(null); }}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg shadow-lg flex items-center gap-2 transition"
                    >
                        + Schedule Surgery
                    </button>
                ) : (
                    <div className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-amber-400 text-xs font-mono font-semibold rounded-lg flex items-center gap-1.5">
                        <span>🔒 Read-Only Mode (Biomedical Engineer)</span>
                    </div>
                )}
            </header>

            {errorMessage && !showForm && (
                <div className="p-4 bg-rose-950/80 border border-rose-500 text-rose-200 text-xs rounded-xl flex justify-between items-center font-mono">
                    <span>🛑 <strong>Error:</strong> {errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)} className="text-xs underline text-rose-300">Dismiss</button>
                </div>
            )}

            {showForm && (
                <SurgeryForm
                    initialData={editingSurgery}
                    onSubmit={handleCreateOrUpdate}
                    onCancel={() => { setShowForm(false); setEditingSurgery(null); setErrorMessage(null); }}
                    externalError={errorMessage}
                />
            )}

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Operating Room (OT Suite)</label>
                    <select
                        value={orFilter}
                        onChange={(e) => setOrFilter(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                        <option value="">All Operating Rooms</option>
                        <option value="OR-1">OR Suite 1</option>
                        <option value="OR-2">OR Suite 2</option>
                        <option value="OR-3">OR Suite 3</option>
                        <option value="OR-4">OR Suite 4</option>
                        <option value="OR-5">OR Suite 5</option>
                        <option value="OR-6">OR Suite 6</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Surgery Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading surgical schedule and equipment allocations...</span>
                </div>
            ) : surgeries.length === 0 ? (
                /* Plain Language Useful Empty State */
                <div className="p-10 bg-slate-900/60 border border-slate-800 rounded-xl text-center space-y-3">
                    <div className="text-3xl">📅</div>
                    <h3 className="text-sm font-bold text-slate-300">No Surgeries Scheduled</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                        No surgical procedures match the currently selected operating room or status filters.
                    </p>
                    {(orFilter || statusFilter) && (
                        <button
                            onClick={() => { setOrFilter(''); setStatusFilter(''); }}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold rounded-lg border border-slate-700 transition"
                        >
                            Reset Filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* DOMINANT FOCAL POINT: Surgeries Needing Action */}
                    {needsAttentionSurgeries.length > 0 && (
                        <div className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-5 space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
                                <div className="flex items-center gap-2 text-amber-300">
                                    <span className="text-lg">⚡</span>
                                    <h2 className="text-sm font-bold tracking-wide uppercase">
                                        Action Required: {needsAttentionSurgeries.length} {needsAttentionSurgeries.length === 1 ? 'Surgery Needs' : 'Surgeries Need'} Attention
                                    </h2>
                                </div>
                                <span className="text-[11px] font-bold text-amber-200 bg-amber-950 px-2.5 py-0.5 rounded border border-amber-600">
                                    HIGH PRIORITY
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {needsAttentionSurgeries.map(s => renderSurgeryCard(s, true))}
                            </div>
                        </div>
                    )}

                    {/* Routine & Cleared Surgeries List */}
                    {routineSurgeries.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {needsAttentionSurgeries.length > 0 ? 'Cleared & Routine Surgeries' : 'Scheduled Surgeries'} ({routineSurgeries.length})
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {routineSurgeries.map(s => renderSurgeryCard(s, false))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

