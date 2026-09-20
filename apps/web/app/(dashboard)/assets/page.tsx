'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, canEditAssets } from '@/lib/auth';
import AssetForm from '../../../components/forms/AssetForm';
import { formatEnumValue } from '@/lib/formatters';

export default function AssetsPage() {
    const [userRole, setUserRole] = useState<UserRole>('biomedical_engineer');
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [overdueOnly, setOverdueOnly] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any | null>(null);
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

    const canEdit = canEditAssets(userRole);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (categoryFilter) params.append('category', categoryFilter);
            if (statusFilter) params.append('status', statusFilter);
            if (overdueOnly) params.append('overdue', 'true');

            const res = await fetch(`/api/assets?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setAssets(data.data);
            }
        } catch (err: any) {
            console.error('Failed to fetch assets', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, [categoryFilter, statusFilter, overdueOnly]);

    const handleCreateOrUpdate = async (formData: any) => {
        if (!canEdit) {
            setErrorMessage("Access Denied: Only Biomedical Engineer or Hospital Admin can register or edit assets.");
            return;
        }
        setErrorMessage(null);
        try {
            let res;
            if (editingAsset) {
                res = await fetch(`/api/assets/${editingAsset.id}`, {
                    method: 'PATCH',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('assetiq_auth_token')}`
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                res = await fetch('/api/assets', {
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
                setErrorMessage(data.error || 'Failed to save asset');
                return;
            }

            setShowForm(false);
            setEditingAsset(null);
            fetchAssets();
        } catch (err: any) {
            setErrorMessage(err.message);
        }
    };

    // Calculate action-required assets for Biomedical Engineer Focal Point
    const overdueAssets = assets.filter(a => a.is_pm_overdue);
    const underRepairAssets = assets.filter(a => a.status === 'UNDER_REPAIR' || a.status === 'UNDER_MAINTENANCE');
    const actionRequiredCount = overdueAssets.length + underRepairAssets.length;

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-slate-100 font-sans space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-emerald-400">Asset & Equipment Catalog</h1>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 uppercase">
                            Role: {userRole}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400">Track hospital equipment inventory, preventive maintenance (PM) schedules, and active repair statuses.</p>
                </div>
                {canEdit ? (
                    <button
                        onClick={() => { setEditingAsset(null); setShowForm(true); setErrorMessage(null); }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-lg flex items-center gap-2 transition"
                    >
                        + Register New Asset
                    </button>
                ) : (
                    <div className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-amber-400 text-xs font-mono font-semibold rounded-lg flex items-center gap-1.5">
                        <span>🔒 Read-Only Mode (OT Admin)</span>
                    </div>
                )}
            </header>

            {errorMessage && (
                <div className="p-4 bg-rose-950/80 border border-rose-500 text-rose-200 text-xs rounded-xl flex justify-between items-center font-mono">
                    <span>🛑 <strong>Error:</strong> {errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)} className="text-xs underline text-rose-300">Dismiss</button>
                </div>
            )}

            {showForm && (
                <AssetForm
                    initialData={editingAsset}
                    onSubmit={handleCreateOrUpdate}
                    onCancel={() => { setShowForm(false); setEditingAsset(null); setErrorMessage(null); }}
                />
            )}

            {/* DOMINANT FOCAL POINT FOR BIOMEDICAL ENGINEER: Action Required Hero Card */}
            <div className={`p-5 rounded-xl border transition-all ${
                overdueAssets.length > 0 
                    ? 'bg-rose-950/20 border-rose-500/50 shadow-lg' 
                    : 'bg-emerald-950/20 border-emerald-500/40'
            }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-700">
                            {overdueAssets.length > 0 ? '⚠️' : '✓'}
                        </span>
                        <div>
                            <h2 className="text-base font-bold text-slate-100">
                                {overdueAssets.length > 0 
                                    ? `Action Required: ${overdueAssets.length} Medical ${overdueAssets.length === 1 ? 'Asset Has' : 'Assets Have'} Overdue Maintenance` 
                                    : 'All Medical Assets Are PM Compliant'}
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {overdueAssets.length > 0
                                    ? 'Preventive maintenance check is overdue. Perform PM or update maintenance logs immediately.'
                                    : 'Zero overdue maintenance checks. All registered equipment is cleared for clinical use.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 uppercase font-mono block">PM Overdue</span>
                            <span className={`text-base font-bold font-mono ${overdueAssets.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {overdueAssets.length}
                            </span>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 uppercase font-mono block">Under Repair</span>
                            <span className="text-base font-bold font-mono text-amber-400">
                                {underRepairAssets.length}
                            </span>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Assets</span>
                            <span className="text-base font-bold font-mono text-sky-400">
                                {assets.length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 items-center p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Equipment Category</label>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                        <option value="">All Categories</option>
                        <option value="ANESTHESIA_MACHINE">Anesthesia Machine</option>
                        <option value="LAPAROSCOPIC_TOWER">Laparoscopic Tower</option>
                        <option value="CARM_FLUOROSCOPY">C-Arm Fluoroscopy</option>
                        <option value="SURGICAL_MONITOR">Surgical Monitor</option>
                        <option value="ELECTROSURGICAL_UNIT">Electrosurgical Unit</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Equipment Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="IN_USE">In Use</option>
                        <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                        <option value="UNDER_REPAIR">Under Repair</option>
                        <option value="RETIRED">Retired</option>
                    </select>
                </div>

                <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 text-xs text-amber-300 font-semibold cursor-pointer bg-amber-950/40 border border-amber-800/80 px-3 py-1.5 rounded-lg">
                        <input
                            type="checkbox"
                            checked={overdueOnly}
                            onChange={(e) => setOverdueOnly(e.target.checked)}
                            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                        <span>⚠️ Filter PM Overdue Only</span>
                    </label>
                </div>
            </div>

            {/* Assets Inventory Table */}
            {loading ? (
                <div className="p-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading medical asset catalog...</span>
                </div>
            ) : (
                <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/90 shadow-xl">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-800/90 text-[11px] uppercase text-slate-400 font-bold border-b border-slate-700 tracking-wider">
                            <tr>
                                <th className="p-3.5">Asset Tag & Name</th>
                                <th className="p-3.5">Category & Specs</th>
                                <th className="p-3.5">Location / Suite</th>
                                <th className="p-3.5">Equipment Status</th>
                                <th className="p-3.5">Warranty & Contract</th>
                                <th className="p-3.5">Next PM Due</th>
                                <th className="p-3.5">PM Compliance</th>
                                <th className="p-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                            {assets.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-10 text-center text-slate-400 space-y-2">
                                        <div className="text-2xl">📋</div>
                                        <div className="font-semibold text-slate-300 text-sm">No Assets Found</div>
                                        <p className="text-xs text-slate-500">No medical equipment matches the selected category or status filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                assets.map((asset) => (
                                    <tr key={asset.id} className={`transition-colors ${asset.is_pm_overdue ? 'bg-rose-950/20 hover:bg-rose-950/30' : 'hover:bg-slate-800/50'}`}>
                                        <td className="p-3.5 font-medium">
                                            <div className="text-sky-400 font-mono text-[11px] font-bold">[{asset.asset_tag}]</div>
                                            <div className="text-slate-100 font-bold text-sm mt-0.5">{asset.name}</div>
                                        </td>
                                        <td className="p-3.5">
                                            <div className="text-slate-200 font-semibold">{formatEnumValue(asset.category)}</div>
                                            <div className="text-[11px] text-slate-400 mt-0.5">{asset.model} | S/N: {asset.serial_number}</div>
                                        </td>
                                        <td className="p-3.5">
                                            <div className="text-emerald-400 font-semibold">{asset.operating_room}</div>
                                            <div className="text-[11px] text-slate-400">{asset.location || 'Main Operating Block'}</div>
                                        </td>
                                        <td className="p-3.5">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                                asset.status === 'AVAILABLE' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600' :
                                                asset.status === 'IN_USE' ? 'bg-sky-950/80 text-sky-300 border-sky-600' :
                                                asset.status === 'UNDER_MAINTENANCE' ? 'bg-amber-950/80 text-amber-300 border-amber-600' :
                                                'bg-rose-950/80 text-rose-300 border-rose-600'
                                            }`}>
                                                {formatEnumValue(asset.status)}
                                            </span>
                                        </td>
                                        <td className="p-3.5">
                                            <div className="text-slate-200 font-semibold text-xs">{asset.warranty_vendor || asset.contract_vendor || 'Philips Healthcare'}</div>
                                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                Ref: {asset.warranty_contract_number || 'PHS-2024-0192'} | Exp: {(asset.warranty_end_date || asset.warranty_expiration_date)?.split('T')[0] || 'N/A'}
                                            </div>
                                            <div className="mt-1">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                    (asset.contract_status === 'Active' || (!asset.contract_status && new Date(asset.warranty_end_date || asset.warranty_expiration_date) > new Date())) ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700' :
                                                    (asset.contract_status === 'Expiring Soon') ? 'bg-amber-950/60 text-amber-300 border-amber-700' :
                                                    'bg-rose-950/60 text-rose-300 border-rose-700'
                                                }`}>
                                                    {asset.contract_status || (new Date(asset.warranty_end_date || asset.warranty_expiration_date) < new Date() ? 'Expired' : 'Active')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3.5 text-xs font-mono font-semibold text-slate-300">
                                            {asset.next_pm_due_date?.split('T')[0] || 'N/A'}
                                        </td>
                                        <td className="p-3.5">
                                            {asset.is_pm_overdue ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-950 px-2.5 py-1 rounded-lg border border-rose-600">
                                                    ⚠️ OVERDUE
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
                                                    ✓ Compliant
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3.5 text-right">
                                            {canEdit ? (
                                                <button
                                                    onClick={() => { setEditingAsset(asset); setShowForm(true); setErrorMessage(null); }}
                                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs rounded-lg border border-slate-700 font-semibold transition"
                                                >
                                                    Edit Asset
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-500 font-mono italic">
                                                    Read Only
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

