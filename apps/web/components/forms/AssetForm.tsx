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
        status: initialData?.status || 'AVAILABLE',
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
            setError('Please fill in all mandatory equipment details.');
            return;
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-5 bg-panel text-text-primary rounded-md border border-border">
            <h3 className="text-lg font-semibold text-text-primary">
                {initialData ? 'Edit Equipment' : 'Add New Equipment'}
            </h3>

            {error && (
                <div className="p-3 bg-status-notready-bg border border-status-notready-solid text-status-notready-text text-sm rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Asset tag *</label>
                    <input
                        type="text"
                        name="asset_tag"
                        value={formData.asset_tag}
                        onChange={handleChange}
                        required
                        placeholder="e.g. AST-ANES-010"
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Equipment name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Drager Perseus A500"
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Equipment category *</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    >
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
                    <label className="block text-sm font-medium text-text-primary mb-1">Model *</label>
                    <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Perseus A500"
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Serial number *</label>
                    <input
                        type="text"
                        name="serial_number"
                        value={formData.serial_number}
                        onChange={handleChange}
                        required
                        placeholder="e.g. SN-892418"
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    >
                        <option value="AVAILABLE">Available</option>
                        <option value="IN_USE">In Use</option>
                        <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                        <option value="UNDER_REPAIR">Under Repair</option>
                        <option value="RETIRED">Retired</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Operating room</label>
                    <select
                        name="operating_room"
                        value={formData.operating_room}
                        onChange={handleChange}
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    >
                        <option value="OR-1">Operating Room 1</option>
                        <option value="OR-2">Operating Room 2</option>
                        <option value="OR-3">Operating Room 3</option>
                        <option value="OR-4">Operating Room 4</option>
                        <option value="OR-5">Operating Room 5</option>
                        <option value="OR-6">Operating Room 6</option>
                        <option value="STORAGE">Equipment Storage</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Department</label>
                    <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Last maintenance date</label>
                    <input
                        type="date"
                        name="last_pm_date"
                        value={formData.last_pm_date}
                        onChange={handleChange}
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Next maintenance due *</label>
                    <input
                        type="date"
                        name="next_pm_due_date"
                        value={formData.next_pm_due_date}
                        onChange={handleChange}
                        required
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Warranty vendor</label>
                    <input
                        type="text"
                        name="warranty_vendor"
                        value={formData.warranty_vendor}
                        onChange={handleChange}
                        placeholder="e.g. Philips Healthcare"
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Contract number</label>
                    <input
                        type="text"
                        name="warranty_contract_number"
                        value={formData.warranty_contract_number}
                        onChange={handleChange}
                        placeholder="e.g. PHS-2024-0192"
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-border-strong bg-panel hover:bg-subtle text-text-primary rounded text-sm font-medium transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm font-medium transition-colors"
                >
                    Save
                </button>
            </div>
        </form>
    );
}
