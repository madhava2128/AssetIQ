'use client';

import React, { useState } from 'react';

interface MaintenanceFormProps {
    assets: Array<{ id: string; name: string; asset_tag: string }>;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export default function MaintenanceForm({ assets, onSubmit, onCancel }: MaintenanceFormProps) {
    const [formData, setFormData] = useState({
        asset_id: assets[0]?.id || '',
        maintenance_type: 'PREVENTIVE',
        performed_by: 'BioMed Team Lead',
        performed_at: new Date().toISOString().split('T')[0],
        details: '',
        parts_replaced: '',
        cost: 0
    });

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.asset_id) {
            setError('Please select an asset.');
            return;
        }

        const payload = {
            ...formData,
            parts_replaced: formData.parts_replaced
                ? formData.parts_replaced.split(',').map(s => s.trim()).filter(Boolean)
                : []
        };

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-900 text-slate-100 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-emerald-400">Log Equipment Maintenance</h3>

            {error && (
                <div className="p-3 bg-rose-900/50 border border-rose-500 text-rose-200 text-sm rounded">
                    ⚠️ {error}
                </div>
            )}

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Target Asset *</label>
                <select
                    name="asset_id"
                    value={formData.asset_id}
                    onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                >
                    <option value="">Select equipment...</option>
                    {assets.map(asset => (
                        <option key={asset.id} value={asset.id}>
                            [{asset.asset_tag}] {asset.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Maintenance Type</label>
                    <select
                        name="maintenance_type"
                        value={formData.maintenance_type}
                        onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    >
                        <option value="PREVENTIVE">PREVENTIVE (Routine PM)</option>
                        <option value="CORRECTIVE">CORRECTIVE (Repair)</option>
                        <option value="CALIBRATION">CALIBRATION</option>
                        <option value="INSPECTION">SAFETY INSPECTION</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Performed By</label>
                    <input
                        type="text"
                        name="performed_by"
                        value={formData.performed_by}
                        onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
                        placeholder="Technician / Engineer name"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Details & Procedure Description</label>
                <textarea
                    name="details"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    rows={3}
                    placeholder="Describe maintenance actions, calibrations, or safety checks..."
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Parts Replaced (comma separated)</label>
                    <input
                        type="text"
                        name="parts_replaced"
                        value={formData.parts_replaced}
                        onChange={(e) => setFormData({ ...formData, parts_replaced: e.target.value })}
                        placeholder="e.g. O2 Sensor, Dust Filter"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Total Cost ($)</label>
                    <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
            </div>

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
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-medium shadow-md"
                >
                    Save Record
                </button>
            </div>
        </form>
    );
}
