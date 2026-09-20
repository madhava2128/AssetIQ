'use client';

import React, { useState, useEffect } from 'react';

interface SurgeryFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void> | void;
    onCancel: () => void;
    externalError?: string | null;
}

export default function SurgeryForm({ initialData, onSubmit, onCancel, externalError }: SurgeryFormProps) {
    const isEditMode = !!initialData;

    const [formData, setFormData] = useState({
        surgery_code: initialData?.surgery_code || `SURG-2026-${Math.floor(Math.random() * 900 + 100)}`,
        patient_id: initialData?.patient_id || `PAT-${Math.floor(Math.random() * 9000 + 1000)}`,
        procedure_name: initialData?.procedure_name || '',
        surgery_type: initialData?.surgery_type || 'LAPAROSCOPIC',
        operating_room: initialData?.operating_room || 'OR-1',
        scheduled_start_time: initialData?.scheduled_start_time ? initialData.scheduled_start_time.substring(0, 16) : new Date(Date.now() + 24 * 3600 * 1000).toISOString().substring(0, 16),
        scheduled_end_time: initialData?.scheduled_end_time ? initialData.scheduled_end_time.substring(0, 16) : new Date(Date.now() + 27 * 3600 * 1000).toISOString().substring(0, 16),
        surgeon_name: initialData?.surgeon_name || 'Dr. Ananya Sharma',
        status: initialData?.status || 'SCHEDULED',
        notes: initialData?.notes || ''
    });

    const [templatePreview, setTemplatePreview] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(externalError || null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (externalError) {
            setError(externalError);
        }
    }, [externalError]);

    // Fetch equipment template preview when surgery_type changes
    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const res = await fetch(`/api/surgeries/templates?type=${formData.surgery_type}`);
                const data = await res.json();
                if (data.success) {
                    setTemplatePreview(data.data);
                }
            } catch (err) {
                console.error('Failed to load templates', err);
            }
        };
        fetchTemplate();
    }, [formData.surgery_type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.procedure_name || !formData.operating_room || !formData.scheduled_start_time || !formData.scheduled_end_time) {
            setError('Please fill in procedure name, OR, and scheduled times.');
            return;
        }

        const startTime = new Date(formData.scheduled_start_time);
        const endTime = new Date(formData.scheduled_end_time);

        if (endTime <= startTime) {
            setError('Scheduled end time must be after scheduled start time.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                ...formData,
                scheduled_start_time: startTime.toISOString(),
                scheduled_end_time: endTime.toISOString()
            });
        } catch (err: any) {
            setError(err.message || 'Database write failure: Unable to save surgery record.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-5 bg-slate-900 text-slate-100 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-sky-400">
                {isEditMode ? 'Edit Surgery Schedule' : 'Schedule New Surgery Procedure'}
            </h3>

            {error && (
                <div className="p-3 bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-mono rounded flex items-center justify-between">
                    <span>🛑 <strong>Database Write / Validation Error:</strong> {error}</span>
                    <button type="button" onClick={() => setError(null)} className="text-[11px] underline text-rose-300">
                        Dismiss
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Procedure Name *</label>
                    <input
                        type="text"
                        name="procedure_name"
                        value={formData.procedure_name}
                        onChange={(e) => setFormData({ ...formData, procedure_name: e.target.value })}
                        placeholder="e.g. Laparoscopic Cholecystectomy"
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Surgery Procedure Type (Template)</label>
                    <select
                        name="surgery_type"
                        value={formData.surgery_type}
                        onChange={(e) => setFormData({ ...formData, surgery_type: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-500 font-semibold text-sky-300"
                    >
                        <option value="LAPAROSCOPIC">LAPAROSCOPIC</option>
                        <option value="CARDIAC">CARDIAC</option>
                        <option value="ORTHOPEDIC">ORTHOPEDIC</option>
                        <option value="NEUROSURGERY">NEUROSURGERY</option>
                        <option value="GENERAL_SURGERY">GENERAL SURGERY</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Patient ID & Surgery Code</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="patient_id"
                            value={formData.patient_id}
                            onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                            placeholder="Patient ID"
                            className="w-1/2 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                        />
                        <input
                            type="text"
                            name="surgery_code"
                            value={formData.surgery_code}
                            onChange={(e) => setFormData({ ...formData, surgery_code: e.target.value })}
                            placeholder="Surgery Code"
                            className="w-1/2 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-sky-300"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Lead Surgeon</label>
                    <input
                        type="text"
                        name="surgeon_name"
                        value={formData.surgeon_name}
                        onChange={(e) => setFormData({ ...formData, surgeon_name: e.target.value })}
                        placeholder="Dr. Name"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Assigned Operating Room (OT) *</label>
                    <select
                        name="operating_room"
                        value={formData.operating_room}
                        onChange={(e) => setFormData({ ...formData, operating_room: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none"
                    >
                        <option value="OR-1">OR Suite 1</option>
                        <option value="OR-2">OR Suite 2</option>
                        <option value="OR-3">OR Suite 3</option>
                        <option value="OR-4">OR Suite 4</option>
                        <option value="OR-5">OR Suite 5</option>
                        <option value="OR-6">OR Suite 6</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Surgery Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                    >
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Scheduled Start Time *</label>
                    <input
                        type="datetime-local"
                        name="scheduled_start_time"
                        value={formData.scheduled_start_time}
                        onChange={(e) => setFormData({ ...formData, scheduled_start_time: e.target.value })}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Scheduled End Time *</label>
                    <input
                        type="datetime-local"
                        name="scheduled_end_time"
                        value={formData.scheduled_end_time}
                        onChange={(e) => setFormData({ ...formData, scheduled_end_time: e.target.value })}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200"
                    />
                </div>
            </div>

            {/* Standard Equipment Template Preview */}
            <div className="p-3 bg-slate-800/60 rounded border border-slate-700 mt-3">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase text-slate-300">
                        ⚡ Standard Equipment Template ({formData.surgery_type})
                    </span>
                    <span className="text-xs text-sky-400 font-medium">Auto-populates required equipment</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {templatePreview.map((item, idx) => (
                        <div key={idx} className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs flex items-center gap-1.5">
                            <span className="font-semibold text-slate-200">{item.required_category}</span>
                            <span className="text-slate-400">×{item.quantity}</span>
                            <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                                item.criticality === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-700' :
                                item.criticality === 'IMPORTANT' ? 'bg-amber-950 text-amber-300 border border-amber-700' :
                                'bg-slate-800 text-slate-400'
                            }`}>
                                {item.criticality}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm font-medium disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded text-sm font-medium shadow-md flex items-center gap-2"
                >
                    {isSubmitting ? 'Writing to Database...' : isEditMode ? 'Update Surgery' : 'Schedule Surgery'}
                </button>
            </div>
        </form>
    );
}
