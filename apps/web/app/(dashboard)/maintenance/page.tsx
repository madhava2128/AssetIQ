'use client';

import React, { useState, useEffect } from 'react';
import MaintenanceForm from '../../../components/forms/MaintenanceForm';
import BreakdownForm from '../../../components/forms/BreakdownForm';
import { formatEnumValue } from '@/lib/formatters';

export default function MaintenancePage() {
    const [assets, setAssets] = useState<any[]>([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
    const [breakdownIncidents, setBreakdownIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'schedule' | 'history' | 'breakdowns'>('schedule');
    const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
    const [showBreakdownForm, setShowBreakdownForm] = useState(false);
    const [incidentToResolve, setIncidentToResolve] = useState<any | null>(null);

    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assetsRes, maintenanceRes, breakdownsRes] = await Promise.all([
                fetch('/api/assets'),
                fetch('/api/assets/maintenance'),
                fetch('/api/assets/breakdowns')
            ]);

            const assetsData = await assetsRes.json();
            const maintenanceData = await maintenanceRes.json();
            const breakdownsData = await breakdownsRes.json();

            if (assetsData.success) setAssets(assetsData.data);
            if (maintenanceData.success) setMaintenanceRecords(maintenanceData.data);
            if (breakdownsData.success) setBreakdownIncidents(breakdownsData.data);
        } catch (err: any) {
            console.error('Error fetching maintenance data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleMaintenanceSubmit = async (formData: any) => {
        setFeedbackMessage(null);
        try {
            const res = await fetch('/api/assets/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setFeedbackMessage({ type: 'error', text: data.error || 'Failed to record maintenance.' });
                return;
            }
            setFeedbackMessage({ type: 'success', text: 'Maintenance record logged successfully.' });
            setShowMaintenanceForm(false);
            fetchData();
        } catch (err: any) {
            setFeedbackMessage({ type: 'error', text: err.message });
        }
    };

    const handleBreakdownSubmit = async (formData: any) => {
        setFeedbackMessage(null);
        try {
            let res;
            if (formData.is_resolving) {
                res = await fetch('/api/assets/breakdowns', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                res = await fetch('/api/assets/breakdowns', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            const data = await res.json();
            if (!res.ok || !data.success) {
                setFeedbackMessage({ type: 'error', text: data.error || 'Failed to log breakdown.' });
                return;
            }

            setFeedbackMessage({
                type: 'success',
                text: formData.is_resolving ? 'Breakdown incident resolved & closed.' : 'Breakdown incident logged & asset set to UNDER_REPAIR.'
            });

            setShowBreakdownForm(false);
            setIncidentToResolve(null);
            fetchData();
        } catch (err: any) {
            setFeedbackMessage({ type: 'error', text: err.message });
        }
    };

    const overdueAssets = assets.filter(a => a.is_pm_overdue);
    const openBreakdowns = breakdownIncidents.filter(b => !b.resolved_at);

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-400">Maintenance & Breakdown Management</h1>
                    <p className="text-sm text-slate-400">Track preventive maintenance compliance, overdue assets, and breakdown incidents.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => { setShowMaintenanceForm(true); setShowBreakdownForm(false); setFeedbackMessage(null); }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg shadow-lg"
                    >
                        + Log Maintenance
                    </button>
                    <button
                        onClick={() => { setIncidentToResolve(null); setShowBreakdownForm(true); setShowMaintenanceForm(false); setFeedbackMessage(null); }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm rounded-lg shadow-lg"
                    >
                        🚨 Report Breakdown
                    </button>
                </div>
            </header>

            {feedbackMessage && (
                <div className={`mb-6 p-4 rounded-lg border text-sm flex justify-between items-center ${
                    feedbackMessage.type === 'error'
                        ? 'bg-rose-950/70 border-rose-500 text-rose-200'
                        : 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                }`}>
                    <span>{feedbackMessage.type === 'error' ? '🛑 Error:' : '✓ Success:'} {feedbackMessage.text}</span>
                    <button onClick={() => setFeedbackMessage(null)} className="text-xs underline">Dismiss</button>
                </div>
            )}

            {showMaintenanceForm && (
                <div className="mb-6">
                    <MaintenanceForm
                        assets={assets}
                        onSubmit={handleMaintenanceSubmit}
                        onCancel={() => setShowMaintenanceForm(false)}
                    />
                </div>
            )}

            {showBreakdownForm && (
                <div className="mb-6">
                    <BreakdownForm
                        assets={assets}
                        incidentToResolve={incidentToResolve}
                        onSubmit={handleBreakdownSubmit}
                        onCancel={() => { setShowBreakdownForm(false); setIncidentToResolve(null); }}
                    />
                </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-xs font-semibold text-slate-400 uppercase">PM Overdue Assets</div>
                    <div className={`text-2xl font-bold mt-1 ${overdueAssets.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {overdueAssets.length}
                    </div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-xs font-semibold text-slate-400 uppercase">Unresolved Breakdown Incidents</div>
                    <div className={`text-2xl font-bold mt-1 ${openBreakdowns.length > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                        {openBreakdowns.length}
                    </div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-xs font-semibold text-slate-400 uppercase">Total Equipment Active</div>
                    <div className="text-2xl font-bold mt-1 text-sky-400">{assets.length}</div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 mb-6">
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === 'schedule'
                            ? 'border-emerald-500 text-emerald-400'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Maintenance Schedule ({overdueAssets.length} Overdue)
                </button>
                <button
                    onClick={() => setActiveTab('breakdowns')}
                    className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === 'breakdowns'
                            ? 'border-rose-500 text-rose-400'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Breakdown Incidents ({openBreakdowns.length} Open)
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === 'history'
                            ? 'border-sky-500 text-sky-400'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Completed Logs History
                </button>
            </div>

            {/* Tab Contents */}
            {loading ? (
                <div className="p-8 text-center text-slate-400">Loading maintenance records...</div>
            ) : (
                <>
                    {activeTab === 'schedule' && (
                        <div className="border border-slate-800 rounded-lg bg-slate-900 overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                                    <tr>
                                        <th className="p-3">Asset Tag & Name</th>
                                        <th className="p-3">Category</th>
                                        <th className="p-3">Last PM Date</th>
                                        <th className="p-3">Next PM Due</th>
                                        <th className="p-3">Compliance Status</th>
                                        <th className="p-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {assets.map((asset) => (
                                        <tr key={asset.id} className={asset.is_pm_overdue ? 'bg-rose-950/20 hover:bg-rose-950/40' : 'hover:bg-slate-800/50'}>
                                            <td className="p-3 font-medium">
                                                <div className="font-mono text-xs text-sky-400">{asset.asset_tag}</div>
                                                <div className="text-slate-100 font-semibold">{asset.name}</div>
                                            </td>
                                            <td className="p-3 text-slate-300 font-medium">{formatEnumValue(asset.category)}</td>
                                            <td className="p-3 text-xs text-slate-400">{asset.last_pm_date?.split('T')[0] || 'N/A'}</td>
                                            <td className="p-3 text-xs font-semibold">{asset.next_pm_due_date?.split('T')[0] || 'N/A'}</td>
                                            <td className="p-3">
                                                {asset.is_pm_overdue ? (
                                                    <span className="inline-flex px-2.5 py-1 text-xs font-bold text-rose-300 bg-rose-950 border border-rose-600 rounded">
                                                        ⚠️ OVERDUE
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex px-2 py-0.5 text-xs text-emerald-400 bg-emerald-950/50 rounded">
                                                        ✓ OK
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => {
                                                        setShowMaintenanceForm(true);
                                                        setShowBreakdownForm(false);
                                                    }}
                                                    className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs rounded font-medium"
                                                >
                                                    Perform PM
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'breakdowns' && (
                        <div className="border border-slate-800 rounded-lg bg-slate-900 overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                                    <tr>
                                        <th className="p-3">Reported At</th>
                                        <th className="p-3">Asset ID</th>
                                        <th className="p-3">Severity & Type</th>
                                        <th className="p-3">Description</th>
                                        <th className="p-3">Resolved Status</th>
                                        <th className="p-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {breakdownIncidents.map((incident) => (
                                        <tr key={incident.id} className={!incident.resolved_at ? 'bg-amber-950/20' : ''}>
                                            <td className="p-3 text-xs font-mono text-slate-400">
                                                {incident.reported_at?.replace('T', ' ').substring(0, 16)}
                                            </td>
                                            <td className="p-3 font-mono text-xs text-sky-400">{incident.asset_id.substring(0, 8)}...</td>
                                            <td className="p-3">
                                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                                    incident.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-amber-950 text-amber-300'
                                                }`}>
                                                    {incident.severity || 'HIGH'}
                                                </span>
                                                <div className="text-xs text-slate-500 mt-0.5">{incident.failure_type || 'MECHANICAL'}</div>
                                            </td>
                                            <td className="p-3 text-slate-200">{incident.description}</td>
                                            <td className="p-3">
                                                {incident.resolved_at ? (
                                                    <span className="text-xs text-emerald-400 font-medium">✓ Resolved ({incident.resolved_at.split('T')[0]})</span>
                                                ) : (
                                                    <span className="text-xs text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600">
                                                        🚨 UNRESOLVED
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right">
                                                {!incident.resolved_at && (
                                                    <button
                                                        onClick={() => {
                                                            setIncidentToResolve(incident);
                                                            setShowBreakdownForm(true);
                                                        }}
                                                        className="px-3 py-1 bg-amber-950 hover:bg-amber-900 border border-amber-700 text-amber-300 text-xs rounded font-medium"
                                                    >
                                                        Resolve
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="border border-slate-800 rounded-lg bg-slate-900 overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                                    <tr>
                                        <th className="p-3">Performed At</th>
                                        <th className="p-3">Asset ID</th>
                                        <th className="p-3">Type</th>
                                        <th className="p-3">Technician</th>
                                        <th className="p-3">Details & Parts</th>
                                        <th className="p-3 text-right">Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {maintenanceRecords.map((m) => (
                                        <tr key={m.id}>
                                            <td className="p-3 text-xs font-mono text-slate-400">{m.performed_at?.split('T')[0]}</td>
                                            <td className="p-3 font-mono text-xs text-sky-400">{m.asset_id.substring(0, 8)}...</td>
                                            <td className="p-3 font-medium text-emerald-400 text-xs">{m.maintenance_type}</td>
                                            <td className="p-3 text-slate-300">{m.performed_by}</td>
                                            <td className="p-3 text-xs">
                                                <div>{m.details}</div>
                                                {m.parts_replaced?.length > 0 && (
                                                    <div className="text-slate-500">Parts: {m.parts_replaced.join(', ')}</div>
                                                )}
                                            </td>
                                            <td className="p-3 text-right font-mono text-xs text-slate-200">${m.cost || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
