'use client';

import React, { useState } from 'react';

interface BreakdownFormProps {
    assets: Array<{ id: string; name: string; asset_tag: string }>;
    incidentToResolve?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export default function BreakdownForm({ assets, incidentToResolve, onSubmit, onCancel }: BreakdownFormProps) {
    const isResolveMode = !!incidentToResolve;

    const [formData, setFormData] = useState({
        asset_id: incidentToResolve?.asset_id || assets[0]?.id || '',
        severity: incidentToResolve?.severity || 'HIGH',
        failure_type: incidentToResolve?.failure_type || 'MECHANICAL',
        description: incidentToResolve?.description || '',
        resolution_notes: incidentToResolve?.resolution_notes || '',
        downtime_days: incidentToResolve?.downtime_hours ? Number((incidentToResolve.downtime_hours / 24).toFixed(1)) : 0,
        is_resolving: isResolveMode
    });

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Requirement: severity & failure_type MUST be set before resolving
        if (formData.is_resolving) {
            if (!formData.severity) {
                setError('Severity must be specified before resolving breakdown incident.');
                return;
            }
            if (!formData.failure_type) {
                setError('Failure type must be specified before resolving breakdown incident.');
                return;
            }
        }

        onSubmit({
            ...formData,
            downtime_hours: Math.round((formData.downtime_days || 0) * 24),
            id: incidentToResolve?.id
        });
    };

    return (
        <form onSubmit={handleSubmit} className="overflow-hidden bg-panel text-text-primary rounded-[6px] border border-border">
            <div className="panel-header-band px-5 py-3 border-b border-border">
                <h3 className="text-base font-semibold text-text-primary">
                    {isResolveMode ? 'Resolve Breakdown Incident' : 'Report Equipment Breakdown'}
                </h3>
            </div>

            <div className="p-5 space-y-4">
                {error && (
                    <div className="p-3 bg-status-notready-bg border border-status-notready-solid text-status-notready-text text-sm rounded-[4px]">
                        {error}
                    </div>
                )}

            {!isResolveMode && (
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Affected equipment *</label>
                    <select
                        name="asset_id"
                        value={formData.asset_id}
                        onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                        required
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    >
                        <option value="">Select affected equipment...</option>
                        {assets.map(asset => (
                            <option key={asset.id} value={asset.id}>
                                {asset.name} ({asset.asset_tag})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Severity *</label>
                    <select
                        name="severity"
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        required
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    >
                        <option value="CRITICAL">Critical (Immediate stop)</option>
                        <option value="HIGH">High (Major malfunction)</option>
                        <option value="MEDIUM">Medium (Partial failure)</option>
                        <option value="LOW">Low (Minor glitch)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Failure type *</label>
                    <select
                        name="failure_type"
                        value={formData.failure_type}
                        onChange={(e) => setFormData({ ...formData, failure_type: e.target.value })}
                        required
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    >
                        <option value="MECHANICAL">Mechanical Failure</option>
                        <option value="ELECTRICAL">Electrical / Power Issue</option>
                        <option value="SOFTWARE">Software / Firmware Glitch</option>
                        <option value="CALIBRATION">Calibration Drift</option>
                        <option value="USER_ERROR">Operational / User Error</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Incident description</label>
                <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what occurred, any error codes displayed..."
                    className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                />
            </div>

            {isResolveMode && (
                <div className="space-y-4 pt-2 border-t border-border">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Resolution notes *</label>
                        <textarea
                            name="resolution_notes"
                            rows={3}
                            value={formData.resolution_notes}
                            onChange={(e) => setFormData({ ...formData, resolution_notes: e.target.value })}
                            placeholder="Describe repairs completed and verification performed..."
                            required
                            className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Total downtime (days)</label>
                        <input
                            type="number"
                            step="0.1"
                            name="downtime_days"
                            value={formData.downtime_days}
                            onChange={(e) => setFormData({ ...formData, downtime_days: Number(e.target.value) })}
                            className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                        />
                    </div>
                </div>
            )}

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-border-strong bg-panel hover:bg-table-hover text-text-primary rounded-[4px] text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-[4px] text-sm font-medium transition-colors"
                    >
                        {isResolveMode ? 'Resolve breakdown' : 'Report breakdown'}
                    </button>
                </div>
            </div>
        </form>
    );
}
