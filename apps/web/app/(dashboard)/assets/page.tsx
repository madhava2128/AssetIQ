'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { UserRole, canEditAssets } from '@/lib/auth';
import AssetForm from '../../../components/forms/AssetForm';
import { formatEnumValue } from '@/lib/formatters';
import { buildAssetQrUrl } from '@/lib/scanner';

export default function AssetsPage() {
    const [userRole, setUserRole] = useState<UserRole>('biomedical_engineer');
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [overdueOnly, setOverdueOnly] = useState(false);
    const [attentionOnly, setAttentionOnly] = useState(false);
    const [expiredOnly, setExpiredOnly] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

    // Read URL query params on initial mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('filter') === 'attention') {
                setAttentionOnly(true);
            }
            if (params.get('overdue') === 'true') {
                setOverdueOnly(true);
            }
            if (params.get('status')) {
                setStatusFilter(params.get('status') || '');
            }
        }
    }, []);

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
            setErrorMessage("You do not have permission to register or edit equipment.");
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
                const errText = data.error || 'Operation failed. Please try again.';
                setErrorMessage(errText);
                throw new Error(errText);
            }

            setShowForm(false);
            setEditingAsset(null);
            fetchAssets();
        } catch (err: any) {
            setErrorMessage(err.message || 'Operation failed.');
            throw err;
        }
    };

    // Filter computation
    const displayedAssets = assets.filter(a => {
        if (attentionOnly) {
            const needsAttention = a.status !== 'AVAILABLE' || a.is_pm_overdue || a.contract_status === 'Expired';
            if (!needsAttention) return false;
        }
        if (expiredOnly) {
            if (a.contract_status !== 'Expired') return false;
        }
        return true;
    });

    // Counts for summary line
    const totalCount = assets.length;
    const attentionCount = assets.filter(a => a.status !== 'AVAILABLE' || a.is_pm_overdue || a.contract_status === 'Expired').length;
    const pmOverdueCount = assets.filter(a => a.is_pm_overdue).length;
    const expiredCount = assets.filter(a => a.contract_status === 'Expired').length;
    const underRepairCount = assets.filter(a => a.status === 'UNDER_REPAIR').length;

    // Filtered assets for printing
    const selectedAssetsToPrint = assets.filter(a => selectedAssetIds.includes(a.id));

    const handlePrintSelected = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* 1. Page Header Band spanning content width */}
            <div className="page-header-band px-4 sm:px-6 py-5">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-page-title text-text-primary">Equipment</h1>
                        <p className="text-body text-text-secondary mt-0.5">
                            Equipment catalog, preventive maintenance intervals, and QR code tracking.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
                        {canEdit && selectedAssetIds.length > 0 && (
                            <button
                                type="button"
                                onClick={handlePrintSelected}
                                className="bg-panel hover:bg-panel-header text-text-primary border border-border-strong px-3.5 py-2 rounded-[4px] text-caption font-semibold transition-colors flex items-center gap-2 shadow-none cursor-pointer"
                                title="Print 50x50mm QR label stickers for selected equipment on an A4 sheet"
                            >
                                <span>Print {selectedAssetIds.length} QR label{selectedAssetIds.length > 1 ? 's' : ''}</span>
                            </button>
                        )}
                        <Link
                            href="/maintenance"
                            className="border border-border-strong bg-panel hover:bg-panel-header text-text-primary px-3.5 py-2 rounded-[4px] text-caption font-medium transition-colors shadow-none"
                        >
                            Maintenance
                        </Link>
                        <Link
                            href="/breakdowns"
                            className="border border-border-strong bg-panel hover:bg-panel-header text-text-primary px-3.5 py-2 rounded-[4px] text-caption font-medium transition-colors shadow-none"
                        >
                            Breakdowns
                        </Link>
                        {canEdit && (
                            <button
                                onClick={() => { setEditingAsset(null); setShowForm(true); setErrorMessage(null); }}
                                className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-[4px] text-body font-medium transition-colors shadow-none cursor-pointer"
                            >
                                Add asset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Main Content Body on Cool Blue-Grey Page Background */}
            <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-5">
                {errorMessage && (
                    <div className="p-3 bg-status-notready-bg border border-status-notready-solid text-status-notready-text text-caption rounded-[4px] flex justify-between items-center">
                        <span>{errorMessage}</span>
                        <button onClick={() => setErrorMessage(null)} className="text-caption underline text-status-notready-text cursor-pointer">
                            Dismiss
                        </button>
                    </div>
                )}

                {/* One-Line Plain Summary Strip */}
                <div className="bg-panel border border-border rounded-[6px] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-table shadow-none">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => { setAttentionOnly(!attentionOnly); setOverdueOnly(false); setExpiredOnly(false); setStatusFilter(''); }}
                            className={`cursor-pointer hover:underline font-semibold text-text-primary tabular-nums ${attentionOnly ? 'underline font-bold text-accent' : ''}`}
                            title="Filter all equipment needing attention"
                        >
                            {attentionCount} items need attention:
                        </button>
                        <button
                            type="button"
                            onClick={() => { setOverdueOnly(!overdueOnly); setAttentionOnly(false); setExpiredOnly(false); }}
                            className={`cursor-pointer hover:underline text-status-atrisk-text tabular-nums font-medium ${overdueOnly ? 'underline font-bold' : ''}`}
                            title="Filter maintenance overdue equipment"
                        >
                            {pmOverdueCount} maintenance overdue
                        </button>
                        <span className="text-text-muted">,</span>
                        <button
                            type="button"
                            onClick={() => { setExpiredOnly(!expiredOnly); setAttentionOnly(false); setOverdueOnly(false); }}
                            className={`cursor-pointer hover:underline text-status-atrisk-text tabular-nums font-medium ${expiredOnly ? 'underline font-bold' : ''}`}
                            title="Filter expired service contracts"
                        >
                            {expiredCount} service contracts expired
                        </button>
                        <span className="text-text-muted">,</span>
                        <button
                            type="button"
                            onClick={() => { setStatusFilter(statusFilter === 'UNDER_REPAIR' ? '' : 'UNDER_REPAIR'); setAttentionOnly(false); setOverdueOnly(false); setExpiredOnly(false); }}
                            className={`cursor-pointer hover:underline text-status-notready-text tabular-nums font-medium ${statusFilter === 'UNDER_REPAIR' ? 'underline font-bold' : ''}`}
                            title="Filter equipment currently under repair"
                        >
                            {underRepairCount} under repair
                        </button>
                    </div>

                    {(attentionOnly || overdueOnly || expiredOnly || statusFilter) && (
                        <button
                            type="button"
                            onClick={() => { setAttentionOnly(false); setOverdueOnly(false); setExpiredOnly(false); setStatusFilter(''); setCategoryFilter(''); }}
                            className="text-accent hover:underline text-caption font-medium cursor-pointer"
                        >
                            Show all equipment &rarr;
                        </button>
                    )}
                </div>

                {/* Form Modal/Section */}
                {showForm && (
                    <div className="border border-border rounded-[6px] overflow-hidden bg-panel shadow-none">
                        <AssetForm
                            initialData={editingAsset}
                            onSubmit={handleCreateOrUpdate}
                            onCancel={() => { setShowForm(false); setEditingAsset(null); setErrorMessage(null); }}
                        />
                    </div>
                )}

                {/* Filters */}
                <div className="bg-panel border border-border rounded-[6px] p-4 flex flex-wrap items-center gap-4 shadow-none">
                    <div>
                        <label className="block text-caption font-medium text-text-secondary mb-1">Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-panel border border-border-strong text-text-primary text-caption rounded-[4px] px-3 py-1.5 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                        >
                            <option value="">All Categories</option>
                            <option value="ANESTHESIA_MACHINE">Anesthesia Machine</option>
                            <option value="LAPAROSCOPIC_TOWER">Laparoscopic Tower</option>
                            <option value="CARM_FLUOROSCOPY">C-Arm Fluoroscopy</option>
                            <option value="SURGICAL_MONITOR">Surgical Monitor</option>
                            <option value="ELECTROSURGICAL_UNIT">Electrosurgical Unit</option>
                            <option value="VENTILATOR">Ventilator</option>
                            <option value="DEFIBRILLATOR">Defibrillator</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-caption font-medium text-text-secondary mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-panel border border-border-strong text-text-primary text-caption rounded-[4px] px-3 py-1.5 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
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
                        <label className="inline-flex items-center gap-2 cursor-pointer text-caption text-text-primary">
                            <input
                                type="checkbox"
                                checked={overdueOnly}
                                onChange={(e) => setOverdueOnly(e.target.checked)}
                                className="rounded-[3px] border-border-strong text-accent focus:ring-accent"
                            />
                            <span>Overdue maintenance only</span>
                        </label>
                    </div>
                </div>

                {/* Assets Table */}
                <div className="bg-panel border border-border rounded-[6px] overflow-hidden shadow-none">
                    {loading ? (
                        <div className="p-12 text-center text-text-muted text-body">
                            Loading equipment catalog...
                        </div>
                    ) : displayedAssets.length === 0 ? (
                        <div className="p-12 text-center text-text-muted text-body">
                            No equipment records match the selected filter.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-table border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-table-header text-caption font-semibold text-text-primary">
                                        {canEdit && (
                                            <th className="p-3 w-8 text-center">
                                                <input
                                                    type="checkbox"
                                                    title="Select all displayed equipment"
                                                    checked={displayedAssets.length > 0 && selectedAssetIds.length === displayedAssets.length}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedAssetIds(displayedAssets.map(a => a.id));
                                                        } else {
                                                            setSelectedAssetIds([]);
                                                        }
                                                    }}
                                                    className="rounded-[3px] border-border-strong text-accent focus:ring-accent cursor-pointer"
                                                />
                                            </th>
                                        )}
                                        <th className="p-3">Asset Tag</th>
                                        <th className="p-3">Equipment Name</th>
                                        <th className="p-3">Category</th>
                                        <th className="p-3">Location / Room</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Maintenance Status</th>
                                        <th className="p-3">Next Due Date</th>
                                        <th className="p-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {displayedAssets.map(asset => {
                                        const isAvailable = asset.status === 'AVAILABLE';
                                        const isRepair = asset.status === 'UNDER_REPAIR';
                                        const isMaintenance = asset.status === 'UNDER_MAINTENANCE';

                                        let statusBadgeClass = 'bg-status-ready-bg text-status-ready-text border-status-ready-solid';
                                        if (isRepair) statusBadgeClass = 'bg-status-notready-bg text-status-notready-text border-status-notready-solid';
                                        else if (isMaintenance || !isAvailable) statusBadgeClass = 'bg-status-atrisk-bg text-status-atrisk-text border-status-atrisk-solid';

                                        const isSelected = selectedAssetIds.includes(asset.id);

                                        return (
                                            <tr key={asset.id} className="odd:bg-panel even:bg-table-stripe hover:bg-table-hover transition-colors">
                                                {canEdit && (
                                                    <td className="p-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedAssetIds(prev => [...prev, asset.id]);
                                                                } else {
                                                                    setSelectedAssetIds(prev => prev.filter(id => id !== asset.id));
                                                                }
                                                            }}
                                                            className="rounded-[3px] border-border-strong text-accent focus:ring-accent cursor-pointer"
                                                        />
                                                    </td>
                                                )}
                                                <td className="p-3 font-medium text-text-primary tabular-nums">
                                                    <Link
                                                        href={`/assets/${asset.id}`}
                                                        className="text-accent hover:underline font-semibold tabular-nums"
                                                        title="Open asset details and QR tracking"
                                                    >
                                                        {asset.asset_tag}
                                                    </Link>
                                                </td>
                                                <td className="p-3 text-text-primary">
                                                    <Link
                                                        href={`/assets/${asset.id}`}
                                                        className="font-medium hover:text-accent hover:underline block"
                                                        title="Open asset details and QR tracking"
                                                    >
                                                        {asset.name}
                                                    </Link>
                                                    <div className="text-caption text-text-muted">{asset.model || ''}</div>
                                                </td>
                                                <td className="p-3 text-text-secondary">{formatEnumValue(asset.category)}</td>
                                                <td className="p-3 text-text-secondary">{asset.operating_room || asset.location || 'General'}</td>
                                                <td className="p-3">
                                                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-[4px] border ${statusBadgeClass}`}>
                                                        {formatEnumValue(asset.status)}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    {asset.is_pm_overdue ? (
                                                        <span className="text-xs font-medium text-status-atrisk-text bg-status-atrisk-bg border border-status-atrisk-solid px-2 py-0.5 rounded-[4px]">
                                                            Overdue
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-status-ready-text font-medium">
                                                            On track
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-caption text-text-muted tabular-nums">
                                                    {asset.next_pm_due_date ? asset.next_pm_due_date.split('T')[0] : 'N/A'}
                                                </td>
                                                <td className="p-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/assets/${asset.id}`}
                                                            className="text-caption text-accent hover:underline font-medium"
                                                        >
                                                            Details & QR
                                                        </Link>
                                                        {canEdit && (
                                                            <>
                                                                <Link
                                                                    href={`/maintenance?record=true&asset_id=${asset.id}`}
                                                                    className="text-caption text-text-secondary hover:underline font-medium"
                                                                >
                                                                    Maintenance
                                                                </Link>
                                                                <button
                                                                    onClick={() => { setEditingAsset(asset); setShowForm(true); setErrorMessage(null); }}
                                                                    className="text-text-primary border border-border-strong bg-panel hover:bg-panel-header px-2 py-0.5 rounded-[4px] text-caption font-medium transition-colors"
                                                                >
                                                                    Edit
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Hidden A4 Print Sheet for Selected Assets */}
                {canEdit && selectedAssetsToPrint.length > 0 && (
                    <div id="qr-print-a4-sheet" className="print-only">
                        <div className="qr-a4-grid">
                            {selectedAssetsToPrint.map(a => (
                                <div key={a.id} className="qr-a4-label">
                                    <div className="qr-print-brand">AssetIQ</div>
                                    <div className="qr-print-svg-wrapper">
                                        <QRCodeSVG
                                            value={buildAssetQrUrl(a.id)}
                                            size={95}
                                            level="M"
                                            includeMargin={false}
                                        />
                                    </div>
                                    <div className="qr-print-tag">{a.asset_tag}</div>
                                    <div className="qr-print-name">{a.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Print Styles for A4 Sheet */}
                <style jsx global>{`
                    @media screen {
                        .print-only {
                            display: none !important;
                        }
                    }

                    @media print {
                        body * {
                            visibility: hidden !important;
                        }

                        #qr-print-a4-sheet,
                        #qr-print-a4-sheet * {
                            visibility: visible !important;
                        }

                        #qr-print-a4-sheet {
                            display: block !important;
                            position: fixed !important;
                            top: 0 !important;
                            left: 0 !important;
                            width: 100% !important;
                            background: #FFFFFF !important;
                        }

                        .qr-a4-grid {
                            display: grid !important;
                            grid-template-columns: repeat(3, 50mm) !important;
                            gap: 6mm !important;
                            padding: 8mm !important;
                        }

                        .qr-a4-label {
                            width: 50mm !important;
                            height: 50mm !important;
                            border: 1px dashed #666 !important;
                            padding: 2.5mm !important;
                            box-sizing: border-box !important;
                            display: flex !important;
                            flex-direction: column !important;
                            align-items: center !important;
                            justify-content: space-between !important;
                            text-align: center !important;
                            page-break-inside: avoid !important;
                        }

                        .qr-print-brand {
                            font-size: 8pt !important;
                            font-weight: 700 !important;
                            color: #000000 !important;
                            letter-spacing: 0.5px !important;
                            line-height: 1 !important;
                        }

                        .qr-print-svg-wrapper {
                            display: flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                            flex: 1 !important;
                        }

                        .qr-print-svg-wrapper svg {
                            width: 26mm !important;
                            height: 26mm !important;
                        }

                        .qr-print-tag {
                            font-size: 7.5pt !important;
                            font-family: inherit !important;
                            font-weight: 700 !important;
                            font-variant-numeric: tabular-nums !important;
                            color: #000000 !important;
                            line-height: 1.1 !important;
                        }

                        .qr-print-name {
                            font-size: 6.5pt !important;
                            font-weight: 500 !important;
                            color: #333333 !important;
                            line-height: 1.1 !important;
                            max-height: 5mm !important;
                            overflow: hidden !important;
                            text-overflow: ellipsis !important;
                            white-space: nowrap !important;
                            width: 44mm !important;
                        }

                        @page {
                            size: A4 portrait;
                            margin: 5mm;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}
