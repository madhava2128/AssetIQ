'use client';

import React from 'react';
import { formatEnumValue } from '@/lib/formatters';

interface HighRiskAssetListProps {
    assets: any[];
    canEdit: boolean;
    onUpdateAssetStatus?: (assetId: string, newStatus: string) => void;
}

export default function HighRiskAssetList({ assets, canEdit, onUpdateAssetStatus }: HighRiskAssetListProps) {
    const highRiskAssets = (assets || []).filter(a =>
        a.status === 'UNDER_REPAIR' ||
        a.status !== 'AVAILABLE' ||
        a.is_pm_overdue ||
        ((a.warranty_end_date || a.warranty_expiration_date) && new Date(a.warranty_end_date || a.warranty_expiration_date) < new Date()) ||
        a.contract_status === 'Expired'
    );

    return (
        <div className="instrument-panel p-5 font-mono">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-3">
                <h3 className="text-base font-bold text-[var(--color-text-primary)] font-sans">
                    High-Risk Asset Flagged List ({highRiskAssets.length})
                </h3>
                <span className="text-xs text-[var(--color-status-notready)] border border-[var(--color-status-notready)]/50 px-2.5 py-0.5 rounded font-bold">
                    Action Required
                </span>
            </div>

            {highRiskAssets.length === 0 ? (
                <div className="p-8 text-center text-[var(--color-status-ready)] text-xs font-mono bg-[var(--color-status-ready-bg)] border border-[var(--color-status-ready)]/30 rounded">
                    ● All active hospital assets are fully PM-compliant and operational.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                        <thead className="text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                            <tr>
                                <th className="p-2.5 font-bold">Asset Tag</th>
                                <th className="p-2.5 font-bold font-sans">Asset Name</th>
                                <th className="p-2.5 font-bold">Location</th>
                                <th className="p-2.5 font-bold">Status</th>
                                <th className="p-2.5 font-bold">PM / Risk Detail</th>
                                {canEdit && <th className="p-2.5 text-right font-bold">Quick Action</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]/40">
                            {highRiskAssets.map(asset => {
                                let riskBadge = '⚠️ PM Overdue';
                                let badgeClass = 'badge-at-risk';

                                const aDate = (asset.warranty_end_date || asset.warranty_expiration_date) ? new Date(asset.warranty_end_date || asset.warranty_expiration_date) : null;

                                if (asset.status === 'UNDER_REPAIR') {
                                    riskBadge = '🛑 Under Repair';
                                    badgeClass = 'badge-not-ready';
                                } else if (asset.status !== 'AVAILABLE') {
                                    riskBadge = `⚠️ ${formatEnumValue(asset.status)}`;
                                    badgeClass = 'badge-at-risk';
                                } else if (asset.is_pm_overdue) {
                                    riskBadge = '⚠️ PM Overdue';
                                    badgeClass = 'badge-at-risk';
                                } else if ((aDate && aDate < new Date()) || asset.contract_status === 'Expired') {
                                    riskBadge = '⚠️ Warranty Expired';
                                    badgeClass = 'badge-at-risk';
                                }

                                const warrantyText = (asset.warranty_vendor || asset.contract_vendor) ? `${asset.warranty_vendor || asset.contract_vendor} (${(asset.warranty_end_date || asset.warranty_expiration_date)?.split('T')[0] || 'Expired'})` : null;

                                return (
                                    <tr key={asset.id} className="hover:bg-[var(--color-bg-primary)]/50 transition-colors">
                                        <td className="p-2.5 font-bold text-[var(--color-accent)]">{asset.asset_tag}</td>
                                        <td className="p-2.5 text-[var(--color-text-primary)] font-sans font-semibold">{asset.name}</td>
                                        <td className="p-2.5 text-[var(--color-text-muted)]">{asset.operating_room || 'Central Supply'}</td>
                                        <td className="p-2.5">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${badgeClass}`}>
                                                {riskBadge}
                                            </span>
                                        </td>
                                        <td className="p-2.5 text-[var(--color-text-muted)] text-[11px]">
                                            {asset.is_pm_overdue && asset.next_pm_due_date ? `PM Due: ${asset.next_pm_due_date.split('T')[0]}` : (warrantyText || `Status: ${asset.status}`)}
                                        </td>
                                        {canEdit && (
                                            <td className="p-2.5 text-right">
                                                {asset.status === 'UNDER_REPAIR' ? (
                                                    <button
                                                        onClick={() => onUpdateAssetStatus && onUpdateAssetStatus(asset.id, 'AVAILABLE')}
                                                        className="px-2.5 py-1 bg-[var(--color-status-ready-bg)] text-[var(--color-status-ready)] border border-[var(--color-status-ready)] rounded text-[10px] font-bold hover:opacity-90 transition-opacity"
                                                    >
                                                        Mark Available
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => onUpdateAssetStatus && onUpdateAssetStatus(asset.id, 'UNDER_REPAIR')}
                                                        className="px-2.5 py-1 bg-[var(--color-status-notready-bg)] text-[var(--color-status-notready)] border border-[var(--color-status-notready)] rounded text-[10px] font-bold hover:opacity-90 transition-opacity"
                                                    >
                                                        Set Under Repair
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}


