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
        <div className="bg-panel border border-border rounded p-4">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <div>
                    <h3 className="text-section-heading text-text-primary">
                        Equipment Needing Attention
                    </h3>
                    <p className="text-body text-text-secondary mt-0.5">
                        Equipment currently undergoing maintenance, repair, or with overdue checks.
                    </p>
                </div>
                <span className="text-caption text-status-notready-text bg-status-notready-bg border border-status-notready-solid px-2.5 py-1 rounded font-medium tabular-nums">
                    {highRiskAssets.length} {highRiskAssets.length === 1 ? 'item' : 'items'}
                </span>
            </div>

            {highRiskAssets.length === 0 ? (
                <div className="p-6 text-center text-status-ready-text text-body bg-status-ready-bg border border-status-ready-solid rounded">
                    All medical equipment is currently operational and up to date.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-table border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-subtle text-caption font-medium text-text-secondary">
                                <th className="p-3">Asset tag</th>
                                <th className="p-3">Equipment name</th>
                                <th className="p-3">Location</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Detail</th>
                                {canEdit && <th className="p-3 text-right">Action</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {highRiskAssets.map(asset => {
                                let riskBadge = 'PM overdue';
                                let badgeClass = 'bg-status-atrisk-bg text-status-atrisk-text border-status-atrisk-solid';

                                if (asset.status === 'UNDER_REPAIR') {
                                    riskBadge = 'Under repair';
                                    badgeClass = 'bg-status-notready-bg text-status-notready-text border-status-notready-solid';
                                } else if (asset.status !== 'AVAILABLE') {
                                    riskBadge = formatEnumValue(asset.status);
                                    badgeClass = 'bg-status-atrisk-bg text-status-atrisk-text border-status-atrisk-solid';
                                }

                                return (
                                    <tr key={asset.id} className="hover:bg-subtle">
                                        <td className="p-3 font-medium text-text-primary tabular-nums">{asset.asset_tag}</td>
                                        <td className="p-3 font-medium text-text-primary">{asset.name}</td>
                                        <td className="p-3 text-text-secondary">{asset.operating_room || asset.location || 'General'}</td>
                                        <td className="p-3">
                                            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${badgeClass}`}>
                                                {formatEnumValue(asset.status)}
                                            </span>
                                        </td>
                                        <td className="p-3 text-caption text-text-secondary">
                                            {riskBadge}
                                        </td>
                                        {canEdit && (
                                            <td className="p-3 text-right">
                                                {onUpdateAssetStatus && asset.status !== 'AVAILABLE' && (
                                                    <button
                                                        onClick={() => onUpdateAssetStatus(asset.id, 'AVAILABLE')}
                                                        className="border border-border-strong bg-panel hover:bg-subtle text-text-primary text-caption font-medium px-2.5 py-1 rounded"
                                                    >
                                                        Mark available
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
