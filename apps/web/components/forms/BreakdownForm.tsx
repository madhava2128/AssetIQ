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
        downtime_hours: incidentToResolve?.downtime_hours || 0,
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
            id: incidentToResolve?.id
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-900 text-slate-100 rounded-lg border border-slate-700">
            <h3 className={`text-lg font-semibold ${isResolveMode ? 'text-amber-400' : 'text-rose-400'}`}>
                {isResolveMode ? 'Resolve Breakdown Incident' : 'Report Equipment Breakdown Incident'}
            </h3>

            {error && (
                <div className="p-3 bg-rose-900/50 border border-rose-500 text-rose-200 text-sm rounded">
                    ⚠️ {error}
                </div>
            )}

            {!isResolveMode && (
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Affected Asset *</label>
                    <select
                        name="asset_id"
                        value={formData.asset_id}
                        onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
                    >
                        <option value="">Select affected equipment...</option>
                        {assets.map(asset => (
                            <option key={asset.id} value={asset.id}>
                                [{asset.asset_tag}] {asset.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Severity *</label>
                    <select
                        name="severity"
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
                    >
                        <option value="CRITICAL">CRITICAL (Immediate OR stop)</option>
                        <option value="HIGH">HIGH (Major malfunction)</option>
                        <option value="MEDIUM">MEDIUM (Partial failure)</option>
                        <option value="LOW">LOW (Minor glitch)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Failure Type *</label>
                    <select
                        name="failure_type"
                        value={formData.failure_type}
                        onChange={(e) => setFormData({ ...formData, failure_type: e.target.value })}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
                    >
                        <option value="MECHANICAL">MECHANICAL</option>
                        <option value="ELECTRICAL">ELECTRICAL</option>
                        <option value="SOFTWARE">SOFTWARE / FIRMWARE</option>
                        <option value="CALIBRATION">CALIBRATION FAULT</option>
                        <option value="SENSOR">SENSOR / PROBE</option>
                        <option value="OTHER">OTHER</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Breakdown Description *</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={2}
                    placeholder="Describe exact error code or behavior during procedure..."
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
                />
            </div>

            {isResolveMode && (
                <>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Resolution Notes & Technician Action</label>
                        <textarea
                            name="resolution_notes"
                            value={formData.resolution_notes}
                            onChange={(e) => setFormData({ ...formData, resolution_notes: e.target.value })}
                            rows={2}
                            placeholder="Describe how the breakdown was resolved..."
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Total Downtime (Hours)</label>
                        <input
                            type="number"
                            name="downtime_hours"
                            value={formData.downtime_hours}
                            onChange={(e) => setFormData({ ...formData, downtime_hours: parseFloat(e.target.value) || 0 })}
                            placeholder="e.g. 24"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                        />
                    </div>
                </>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm font-medium"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className={`px-4 py-2 text-white rounded text-sm font-medium shadow-md ${isResolveMode ? 'bg-amber-600 hover:bg-amber-500' : 'bg-rose-600 hover:bg-rose-500'}`}
                >
                    {isResolveMode ? 'Resolve & Close Incident' : 'Report Incident (Auto Timestamp)'}
                </button>
            </div>
        </form>
    );
}
