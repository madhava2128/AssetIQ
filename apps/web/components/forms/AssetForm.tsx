'use client';

import React, { useState } from 'react';

interface AssetFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export default function AssetForm({ initialData, onSubmit, onCancel }: AssetFormProps) {
    const [formData, setFormData] = useState({
        asset_tag: initialData?.asset_tag || '',
        name: initialData?.name || '',
        category: initialData?.category || 'ANESTHESIA_MACHINE',
        model: initialData?.model || '',
        serial_number: initialData?.serial_number || '',
        operating_room: initialData?.operating_room || 'OR-1',
        location: initialData?.location || 'OR Complex Floor 2',
        department: initialData?.department || 'Biomedical Engineering',
        status: initialData?.status || 'UNDER_REPAIR', // Default conservative
        last_pm_date: initialData?.last_pm_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        next_pm_due_date: initialData?.next_pm_due_date?.split('T')[0] || new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0],
        total_operating_hours: initialData?.total_operating_hours || 0,
        warranty_vendor: initialData?.warranty_vendor || initialData?.contract_vendor || 'Philips Healthcare',
        warranty_contract_number: initialData?.warranty_contract_number || 'PHS-2024-0192',
        warranty_end_date: initialData?.warranty_end_date?.split('T')[0] || initialData?.warranty_expiration_date?.split('T')[0] || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
        warranty_expiration_date: initialData?.warranty_expiration_date?.split('T')[0] || initialData?.warranty_end_date?.split('T')[0] || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
        contract_status: initialData?.contract_status || 'Active',
        contract_vendor: initialData?.warranty_vendor || initialData?.contract_vendor || 'Philips Healthcare'
    });

    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.asset_tag || !formData.name || !formData.serial_number || !formData.model) {
            setError('Please fill in all mandatory asset details.');
            return;
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-900 text-slate-100 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-sky-400">
                {initialData ? 'Edit Hospital Asset' : 'Register New Medical Asset'}
            </h3>

            {error && (
                <div className="p-3 bg-rose-900/50 border border-rose-500 text-rose-200 text-sm rounded">
                    ⚠️ {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Asset Tag *</label>
                    <input
                        type="text"
                        name="asset_tag"
                        value={formData.asset_tag}
                        onChange={handleChange}
                        required
                        placeholder="e.g. AST-ANES-010"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Equipment Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Drager Perseus A500"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Asset Category *</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                    >
                        <option value="ANESTHESIA_MACHINE">Anesthesia Machine</option>
                        <option value="LAPAROSCOPIC_TOWER">Laparoscopic Tower</option>
                        <option value="CARM_FLUOROSCOPY">C-Arm Fluoroscopy</option>
                        <option value="SURGICAL_MONITOR">Surgical Monitor</option>
                        <option value="ELECTROSURGICAL_UNIT">Electrosurgical Unit (ESU)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Model & Serial Number *</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            placeholder="Model"
                            required
                            className="w-1/2 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                        />
                        <input
                            type="text"
                            name="serial_number"
                            value={formData.serial_number}
                            onChange={handleChange}
                            placeholder="Serial #"
                            required
                            className="w-1/2 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Operating Room & Location</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="operating_room"
                            value={formData.operating_room}
                            onChange={handleChange}
                            placeholder="OR-1"
                            className="w-1/2 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                        />
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Location"
                            className="w-1/2 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Status (Default: UNDER_REPAIR)</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                    >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="IN_USE">IN_USE</option>
                        <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
                        <option value="UNDER_REPAIR">UNDER_REPAIR</option>
                        <option value="RETIRED">RETIRED</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Last PM Date</label>
                    <input
                        type="date"
                        name="last_pm_date"
                        value={formData.last_pm_date}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Next PM Due Date</label>
                    <input
                        type="date"
                        name="next_pm_due_date"
                        value={formData.next_pm_due_date}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Warranty Vendor</label>
                    <input
                        type="text"
                        name="warranty_vendor"
                        value={formData.warranty_vendor}
                        onChange={(e) => {
                            handleChange(e);
                            setFormData(prev => ({ ...prev, warranty_vendor: e.target.value, contract_vendor: e.target.value }));
                        }}
                        placeholder="e.g. Philips Healthcare"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-100"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Contract Ref Number</label>
                    <input
                        type="text"
                        name="warranty_contract_number"
                        value={formData.warranty_contract_number}
                        onChange={handleChange}
                        placeholder="e.g. PHS-2024-0192"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-100"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Warranty End Date</label>
                    <input
                        type="date"
                        name="warranty_end_date"
                        value={formData.warranty_end_date}
                        onChange={(e) => {
                            handleChange(e);
                            setFormData(prev => ({ ...prev, warranty_end_date: e.target.value, warranty_expiration_date: e.target.value }));
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Contract Status</label>
                    <select
                        name="contract_status"
                        value={formData.contract_status}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-100"
                    >
                        <option value="Active">Active</option>
                        <option value="Expiring Soon">Expiring Soon</option>
                        <option value="Expired">Expired</option>
                    </select>
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
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded text-sm font-medium shadow-md"
                >
                    Save Asset
                </button>
            </div>
        </form>
    );
}
