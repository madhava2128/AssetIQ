'use client';

import React, { useState, useEffect } from 'react';
import MaintenanceForm from '../../../components/forms/MaintenanceForm';
import BreakdownForm from '../../../components/forms/BreakdownForm';
import { formatEnumValue, formatCurrencyINR } from '@/lib/formatters';
import { UserRole } from '@/lib/auth';

export default function MaintenancePage() {
    const [assets, setAssets] = useState<any[]>([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
    const [breakdownIncidents, setBreakdownIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<UserRole>('biomedical_engineer');

    const [activeTab, setActiveTab] = useState<'schedule' | 'history' | 'breakdowns'>('schedule');
    const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
    const [selectedAssetIdForForm, setSelectedAssetIdForForm] = useState<string>('');
    const [showBreakdownForm, setShowBreakdownForm] = useState(false);
    const [incidentToResolve, setIncidentToResolve] = useState<any | null>(null);

    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Fetch user role from session
    useEffect(() => {
        const fetchRole = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('assetiq_auth_token') : null;
                const res = await fetch('/api/auth/me', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                const data = await res.json();
                if (data.authenticated && data.role) {
                    setUserRole(data.role);
                } else if (typeof window !== 'undefined') {
                    const stored = localStorage.getItem('assetiq_user_role') as UserRole;
                    if (stored) setUserRole(stored);
                }
            } catch {
                if (typeof window !== 'undefined') {
                    const stored = localStorage.getItem('assetiq_user_role') as UserRole;
                    if (stored) setUserRole(stored);
                }
            }
        };
        fetchRole();
    }, []);

    // Check URL query parameters for pre-selected equipment (?asset_id=... or ?record=true)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const assetIdParam = params.get('asset_id');
            const recordParam = params.get('record');
            const tabParam = params.get('tab');
            if (tabParam === 'breakdowns' || tabParam === 'history' || tabParam === 'schedule') {
                setActiveTab(tabParam);
            }
            if (assetIdParam) {
                setSelectedAssetIdForForm(assetIdParam);
                setShowMaintenanceForm(true);
            } else if (recordParam === 'true') {
                setShowMaintenanceForm(true);
            }
        }
    }, []);

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

    const handleMaintenanceSubmit = async (formData: any): Promise<boolean> => {
        setFeedbackMessage(null);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('assetiq_auth_token') : null;
            const res = await fetch('/api/assets/maintenance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : { Authorization: 'Bearer token-bio-eng-write-456' })
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setFeedbackMessage({ type: 'error', text: data.error || 'Could not save maintenance record.' });
                return false;
            }
            setFeedbackMessage({ type: 'success', text: 'Maintenance record saved successfully.' });
            fetchData();
            return true;
        } catch (err: any) {
            setFeedbackMessage({ type: 'error', text: err.message || 'Could not save maintenance record.' });
            return false;
        }
    };

    const handleBreakdownSubmit = async (formData: any) => {
        setFeedbackMessage(null);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('assetiq_auth_token') : null;
            let res;
            if (formData.is_resolving) {
                res = await fetch('/api/assets/breakdowns', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : { Authorization: 'Bearer token-bio-eng-write-456' })
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                res = await fetch('/api/assets/breakdowns', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : { Authorization: 'Bearer token-bio-eng-write-456' })
                    },
                    body: JSON.stringify(formData)
                });
            }

            const data = await res.json();
            if (!res.ok || !data.success) {
                setFeedbackMessage({ type: 'error', text: data.error || 'Could not save breakdown record.' });
                return;
            }

            setFeedbackMessage({
                type: 'success',
                text: formData.is_resolving ? 'Breakdown incident resolved and closed.' : 'Breakdown reported successfully.'
            });

            setShowBreakdownForm(false);
            setIncidentToResolve(null);
            fetchData();
        } catch (err: any) {
            setFeedbackMessage({ type: 'error', text: err.message || 'Could not save breakdown record.' });
        }
    };

    const canRecordMaintenance = userRole === 'hospital_admin' || userRole === 'biomedical_engineer';
    const overdueAssets = assets.filter(a => a.is_pm_overdue);
    const openBreakdowns = breakdownIncidents.filter(b => !b.resolved_at);

    return (
        <div className="space-y-6">
            {/* Page Header Band */}
            <div className="page-header-band px-4 sm:px-6 py-5 border-b border-border">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-page-title text-text-primary">Maintenance & Breakdowns</h1>
                        <p className="text-sm text-text-secondary mt-1">
                            Track preventive maintenance compliance, overdue assets, and breakdown incidents.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {canRecordMaintenance && (
                            <button
                                onClick={() => {
                                    setSelectedAssetIdForForm('');
                                    setShowMaintenanceForm(true);
                                    setShowBreakdownForm(false);
                                    setFeedbackMessage(null);
                                }}
                                className="bg-accent hover:bg-accent-hover text-white font-medium text-sm px-4 py-2 rounded-[4px] transition-colors"
                            >
                                Record maintenance
                            </button>
                        )}
                        {canRecordMaintenance && (
                            <button
                                onClick={() => { setIncidentToResolve(null); setShowBreakdownForm(true); setShowMaintenanceForm(false); setFeedbackMessage(null); }}
                                className="border border-border-strong bg-panel hover:bg-table-hover text-text-primary font-medium text-sm px-4 py-2 rounded-[4px] transition-colors"
                            >
                                Report breakdown
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 pb-12">
                {feedbackMessage && (
                    <div className={`p-3.5 rounded-[6px] border text-sm flex justify-between items-center ${
                        feedbackMessage.type === 'error'
                            ? 'bg-status-notready-bg border-status-notready-solid text-status-notready-text'
                            : 'bg-status-ready-bg border-status-ready-solid text-status-ready-text'
                    }`}>
                        <span>{feedbackMessage.text}</span>
                        <button onClick={() => setFeedbackMessage(null)} className="text-xs underline">Dismiss</button>
                    </div>
                )}

                {/* Forms */}
                {showMaintenanceForm && canRecordMaintenance && (
                    <MaintenanceForm
                        assets={assets}
                        initialAssetId={selectedAssetIdForForm}
                        maintenanceRecords={maintenanceRecords}
                        breakdownIncidents={breakdownIncidents}
                        currentUser={{ name: 'Biomedical Engineer', role: userRole }}
                        onSubmit={handleMaintenanceSubmit}
                        onCancel={() => {
                            setShowMaintenanceForm(false);
                            setSelectedAssetIdForForm('');
                        }}
                        onSuccess={fetchData}
                    />
                )}

                {showBreakdownForm && (
                    <BreakdownForm
                        assets={assets}
                        incidentToResolve={incidentToResolve}
                        onSubmit={handleBreakdownSubmit}
                        onCancel={() => { setShowBreakdownForm(false); setIncidentToResolve(null); }}
                    />
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-panel border border-border border-t-[3px] border-t-status-atrisk-solid rounded-[6px]">
                        <div className="text-xs font-medium text-text-secondary">Overdue maintenance</div>
                        <div className={`text-large-number mt-1 ${overdueAssets.length > 0 ? 'text-status-atrisk-text' : 'text-status-ready-text'}`}>
                            {overdueAssets.length} <span className="font-sans text-xs font-normal text-text-muted">items</span>
                        </div>
                    </div>

                    <div className="p-4 bg-panel border border-border border-t-[3px] border-t-status-notready-solid rounded-[6px]">
                        <div className="text-xs font-medium text-text-secondary">Open breakdowns</div>
                        <div className={`text-large-number mt-1 ${openBreakdowns.length > 0 ? 'text-status-notready-text' : 'text-status-ready-text'}`}>
                            {openBreakdowns.length} <span className="font-sans text-xs font-normal text-text-muted">incidents</span>
                        </div>
                    </div>

                    <div className="p-4 bg-panel border border-border border-t-[3px] border-t-accent rounded-[6px]">
                        <div className="text-xs font-medium text-text-secondary">Total active equipment</div>
                        <div className="text-large-number mt-1 text-text-primary">{assets.length} <span className="font-sans text-xs font-normal text-text-muted">units</span></div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-border space-x-1">
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'schedule'
                                ? 'border-accent text-accent font-semibold'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        Maintenance Schedule ({overdueAssets.length} overdue)
                    </button>
                    <button
                        onClick={() => setActiveTab('breakdowns')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'breakdowns'
                                ? 'border-accent text-accent font-semibold'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        Breakdown Incidents ({openBreakdowns.length} open)
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'history'
                                ? 'border-accent text-accent font-semibold'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        Completed Logs History
                    </button>
                </div>

                {/* Tab Contents */}
                {loading ? (
                    <div className="p-12 text-center text-text-muted text-sm bg-panel border border-border rounded-[6px]">Loading records...</div>
                ) : (
                    <>
                        {activeTab === 'schedule' && (
                            <div className="border border-border rounded-[6px] bg-panel overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-table-header text-xs font-semibold text-text-primary border-b border-border">
                                                <th className="p-3">Asset Tag & Equipment</th>
                                                <th className="p-3">Category</th>
                                                <th className="p-3">Last Maintenance</th>
                                                <th className="p-3">Next Due Date</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {assets.map((asset) => (
                                                <tr key={asset.id} className="odd:bg-panel even:bg-table-stripe hover:bg-table-hover transition-colors">
                                                    <td className="p-3">
                                                        <div className="font-medium text-text-primary">{asset.name}</div>
                                                        <div className="text-xs text-text-muted tabular-nums">{asset.asset_tag}</div>
                                                    </td>
                                                    <td className="p-3 text-text-secondary">{formatEnumValue(asset.category)}</td>
                                                    <td className="p-3 text-xs text-text-muted tabular-nums">{asset.last_pm_date?.split('T')[0] || 'N/A'}</td>
                                                    <td className="p-3 text-xs text-text-primary font-medium tabular-nums">{asset.next_pm_due_date?.split('T')[0] || 'N/A'}</td>
                                                    <td className="p-3">
                                                        {asset.is_pm_overdue ? (
                                                            <span className="text-xs font-medium text-status-atrisk-text bg-status-atrisk-bg border border-status-atrisk-solid px-2 py-0.5 rounded-[4px]">
                                                                Overdue
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-medium text-status-ready-text bg-status-ready-bg border border-status-ready-solid px-2 py-0.5 rounded-[4px]">
                                                                On track
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        {canRecordMaintenance && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAssetIdForForm(asset.id);
                                                                    setShowMaintenanceForm(true);
                                                                    setShowBreakdownForm(false);
                                                                    setFeedbackMessage(null);
                                                                }}
                                                                className="text-xs text-accent hover:underline font-medium"
                                                            >
                                                                Log PM
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'breakdowns' && (
                            <div className="border border-border rounded-[6px] bg-panel overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-table-header text-xs font-semibold text-text-primary border-b border-border">
                                                <th className="p-3">Equipment</th>
                                                <th className="p-3">Severity</th>
                                                <th className="p-3">Failure Type</th>
                                                <th className="p-3">Reported At</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {breakdownIncidents.map((incident) => {
                                                const asset = assets.find(a => a.id === incident.asset_id);
                                                const isResolved = !!incident.resolved_at;

                                                return (
                                                    <tr key={incident.id} className="odd:bg-panel even:bg-table-stripe hover:bg-table-hover transition-colors">
                                                        <td className="p-3">
                                                            <div className="font-medium text-text-primary">{asset?.name || 'Equipment'}</div>
                                                            <div className="text-xs text-text-muted tabular-nums">{asset?.asset_tag || ''}</div>
                                                        </td>
                                                        <td className="p-3">
                                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-[4px] border ${
                                                                incident.severity === 'CRITICAL' ? 'bg-status-notready-bg text-status-notready-text border-status-notready-solid' :
                                                                incident.severity === 'HIGH' ? 'bg-status-atrisk-bg text-status-atrisk-text border-status-atrisk-solid' :
                                                                'bg-status-neutral-bg text-status-neutral-text border-status-neutral-solid'
                                                            }`}>
                                                                {formatEnumValue(incident.severity)}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-text-secondary">{formatEnumValue(incident.failure_type)}</td>
                                                        <td className="p-3 text-xs text-text-muted tabular-nums">{incident.reported_at?.split('T')[0] || 'N/A'}</td>
                                                        <td className="p-3">
                                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-[4px] border ${
                                                                isResolved ? 'bg-status-ready-bg text-status-ready-text border-status-ready-solid' : 'bg-status-notready-bg text-status-notready-text border-status-notready-solid'
                                                            }`}>
                                                                {isResolved ? 'Resolved' : 'Open'}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            {!isResolved && (
                                                                <button
                                                                    onClick={() => {
                                                                        setIncidentToResolve(incident);
                                                                        setShowBreakdownForm(true);
                                                                    }}
                                                                    className="text-xs text-accent hover:underline font-medium"
                                                                >
                                                                    Resolve
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="border border-border rounded-[6px] bg-panel overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-table-header text-xs font-semibold text-text-primary border-b border-border">
                                                <th className="p-3">Equipment</th>
                                                <th className="p-3">Maintenance Type</th>
                                                <th className="p-3">Performed By</th>
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Cost</th>
                                                <th className="p-3">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {maintenanceRecords.map((rec) => {
                                                const asset = assets.find(a => a.id === rec.asset_id);
                                                return (
                                                    <tr key={rec.id} className="odd:bg-panel even:bg-table-stripe hover:bg-table-hover transition-colors">
                                                        <td className="p-3">
                                                            <div className="font-medium text-text-primary">{asset?.name || 'Equipment'}</div>
                                                            <div className="text-xs text-text-muted tabular-nums">{asset?.asset_tag || ''}</div>
                                                        </td>
                                                        <td className="p-3 text-text-secondary">{formatEnumValue(rec.maintenance_type)}</td>
                                                        <td className="p-3 text-text-secondary">{rec.performed_by || 'Technician'}</td>
                                                        <td className="p-3 text-xs text-text-muted tabular-nums">{rec.performed_at?.split('T')[0] || 'N/A'}</td>
                                                        <td className="p-3 text-xs font-medium text-text-primary tabular-nums">{formatCurrencyINR(rec.cost)}</td>
                                                        <td className="p-3 text-xs text-text-muted max-w-xs truncate">{rec.details || 'Routine check completed.'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
