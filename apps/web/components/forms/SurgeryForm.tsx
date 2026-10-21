'use client';

import React, { useState, useEffect } from 'react';
import { checkPreSaveConflicts } from '@/lib/equipment-allocation';
import { formatEnumValue } from '@/lib/formatters';

interface EquipmentItem {
    required_category: string;
    quantity: number;
    criticality: 'CRITICAL' | 'IMPORTANT' | 'STANDARD';
    assigned_asset_id?: string | null;
}

interface SurgeryFormProps {
    initialData?: any;
    allSurgeries?: any[];
    allAssets?: any[];
    prefilledDate?: string;
    prefilledTime?: string;
    prefilledOr?: string;
    onSubmit: (data: any) => Promise<void> | void;
    onCancel: () => void;
    externalError?: string | null;
}

const DEFAULT_TEMPLATES: Record<string, EquipmentItem[]> = {
    LAPAROSCOPIC: [
        { required_category: 'ANESTHESIA_MACHINE', quantity: 1, criticality: 'CRITICAL' },
        { required_category: 'LAPAROSCOPIC_TOWER', quantity: 1, criticality: 'CRITICAL' },
        { required_category: 'ELECTROSURGICAL_UNIT', quantity: 1, criticality: 'IMPORTANT' },
        { required_category: 'SURGICAL_MONITOR', quantity: 1, criticality: 'CRITICAL' }
    ],
    CARDIAC: [
        { required_category: 'ANESTHESIA_MACHINE', quantity: 1, criticality: 'CRITICAL' },
        { required_category: 'CARM_FLUOROSCOPY', quantity: 1, criticality: 'IMPORTANT' },
        { required_category: 'ELECTROSURGICAL_UNIT', quantity: 1, criticality: 'CRITICAL' },
        { required_category: 'SURGICAL_MONITOR', quantity: 2, criticality: 'CRITICAL' }
    ],
    ORTHOPEDIC: [
        { required_category: 'ANESTHESIA_MACHINE', quantity: 1, criticality: 'CRITICAL' },
        { required_category: 'CARM_FLUOROSCOPY', quantity: 1, criticality: 'CRITICAL' },
        { required_category: 'ELECTROSURGICAL_UNIT', quantity: 1, criticality: 'IMPORTANT' },
        { required_category: 'SURGICAL_MONITOR', quantity: 1, criticality: 'STANDARD' }
    ],
    NEUROSURGERY: [
        { required_category: 'ANESTHESIA_MACHINE', quantity: 1, criticality: 'CRITICAL' },
        { required_category: 'CARM_FLUOROSCOPY', quantity: 1, criticality: 'IMPORTANT' },
        { required_category: 'ELECTROSURGICAL_UNIT', quantity: 1, criticality: 'CRITICAL' },
        { required_category: 'SURGICAL_MONITOR', quantity: 2, criticality: 'CRITICAL' }
    ],
    GENERAL_SURGERY: [
        { required_category: 'ANESTHESIA_MACHINE', quantity: 1, criticality: 'CRITICAL' },
        { required_category: 'ELECTROSURGICAL_UNIT', quantity: 1, criticality: 'IMPORTANT' },
        { required_category: 'SURGICAL_MONITOR', quantity: 1, criticality: 'CRITICAL' }
    ]
};

const AVAILABLE_CATEGORIES = [
    'ANESTHESIA_MACHINE',
    'LAPAROSCOPIC_TOWER',
    'CARM_FLUOROSCOPY',
    'SURGICAL_MONITOR',
    'ELECTROSURGICAL_UNIT',
    'VENTILATOR',
    'DEFIBRILLATOR'
];

export default function SurgeryForm({
    initialData,
    allSurgeries = [],
    allAssets = [],
    prefilledDate,
    prefilledTime,
    prefilledOr,
    onSubmit,
    onCancel,
    externalError
}: SurgeryFormProps) {
    const isEditMode = !!initialData;

    // Parse initial or prefilled start date and time
    let defaultDate = prefilledDate || new Date().toISOString().split('T')[0];
    let defaultStartTime = prefilledTime || '09:00';
    let defaultDuration = '2';

    if (initialData?.scheduled_start_time) {
        const start = new Date(initialData.scheduled_start_time);
        if (!isNaN(start.getTime())) {
            defaultDate = start.toISOString().split('T')[0];
            const hh = String(start.getHours()).padStart(2, '0');
            const mm = String(start.getMinutes()).padStart(2, '0');
            defaultStartTime = `${hh}:${mm}`;

            if (initialData.scheduled_end_time) {
                const end = new Date(initialData.scheduled_end_time);
                const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                if (diffHours > 0) {
                    defaultDuration = String(diffHours);
                }
            }
        }
    }

    const [procedureName, setProcedureName] = useState(initialData?.procedure_name || '');
    const [surgeryType, setSurgeryType] = useState(initialData?.surgery_type || 'LAPAROSCOPIC');
    const [operatingRoom, setOperatingRoom] = useState(initialData?.operating_room || prefilledOr || 'OR-1');
    const [department, setDepartment] = useState(initialData?.department || 'General Surgery');
    const [surgeonName, setSurgeonName] = useState(initialData?.surgeon_name || 'Dr. Ananya Sharma');
    const [patientId, setPatientId] = useState(initialData?.patient_id || `PAT-${Math.floor(Math.random() * 9000 + 1000)}`);
    const [surgeryCode, setSurgeryCode] = useState(initialData?.surgery_code || `SURG-2026-${Math.floor(Math.random() * 900 + 100)}`);
    const [date, setDate] = useState(defaultDate);
    const [startTime, setStartTime] = useState(defaultStartTime);
    const [durationHours, setDurationHours] = useState(defaultDuration);
    const [status, setStatus] = useState(initialData?.status || 'SCHEDULED');
    const [notes, setNotes] = useState(initialData?.notes || '');

    // Equipment list editor
    const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(() => {
        if (initialData?.required_assets && initialData.required_assets.length > 0) {
            return initialData.required_assets.map((r: any) => ({
                required_category: r.required_category,
                quantity: r.quantity || 1,
                criticality: r.criticality || 'STANDARD',
                assigned_asset_id: r.assigned_asset_id || null
            }));
        }
        return DEFAULT_TEMPLATES[initialData?.surgery_type || 'LAPAROSCOPIC'] || DEFAULT_TEMPLATES.LAPAROSCOPIC;
    });

    // Conflict warnings and errors
    const [formError, setFormError] = useState<string | null>(externalError || null);
    const [shortageWarnings, setShortageWarnings] = useState<string[]>([]);
    const [confirmedShortage, setConfirmedShortage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (externalError) setFormError(externalError);
    }, [externalError]);

    // When surgery type changes in Add Mode, auto-fill standard equipment list
    const handleSurgeryTypeChange = (newType: string) => {
        setSurgeryType(newType);
        if (!isEditMode) {
            const template = DEFAULT_TEMPLATES[newType] || DEFAULT_TEMPLATES.GENERAL_SURGERY;
            setEquipmentList([...template]);
        }
    };

    // Calculate start & end ISO strings
    const computeStartAndEndTimes = () => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date(`${date}T00:00:00`);
        startDate.setHours(hours || 0, minutes || 0, 0, 0);

        const durationMs = parseFloat(durationHours) * 60 * 60 * 1000;
        const endDate = new Date(startDate.getTime() + durationMs);

        return {
            startIso: startDate.toISOString(),
            endIso: endDate.toISOString()
        };
    };

    // Equipment list item actions
    const handleAddEquipment = () => {
        setEquipmentList([
            ...equipmentList,
            { required_category: 'SURGICAL_MONITOR', quantity: 1, criticality: 'STANDARD' }
        ]);
        setShortageWarnings([]);
    };

    const handleRemoveEquipment = (index: number) => {
        setEquipmentList(equipmentList.filter((_, i) => i !== index));
        setShortageWarnings([]);
    };

    const handleEquipmentChange = (index: number, field: keyof EquipmentItem, value: any) => {
        const updated = [...equipmentList];
        updated[index] = { ...updated[index], [field]: value };
        setEquipmentList(updated);
        setShortageWarnings([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!procedureName.trim()) {
            setFormError('Please enter procedure name.');
            return;
        }

        if (equipmentList.length === 0) {
            setFormError('Please include at least one required equipment item.');
            return;
        }

        const { startIso, endIso } = computeStartAndEndTimes();

        // Check for conflicts: OR double booking & fleet shortages
        const conflictCheck = checkPreSaveConflicts(
            {
                id: initialData?.id,
                operating_room: operatingRoom,
                scheduled_start_time: startIso,
                scheduled_end_time: endIso,
                required_assets: equipmentList,
                status
            },
            allSurgeries,
            allAssets
        );

        // 1. Operating Room Double-Booking: BLOCKED
        if (conflictCheck.isDoubleBooked) {
            setFormError(conflictCheck.doubleBookingError || 'Operating room is already booked for this time window.');
            return;
        }

        // 2. Equipment Shortage: Show warning and require confirmation if not confirmed yet
        if (conflictCheck.hasShortage && !confirmedShortage) {
            setShortageWarnings(conflictCheck.shortageWarnings);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                id: initialData?.id,
                surgery_code: surgeryCode,
                patient_id: patientId,
                procedure_name: procedureName.trim(),
                surgery_type: surgeryType,
                operating_room: operatingRoom,
                department,
                surgeon_name: surgeonName.trim(),
                scheduled_start_time: startIso,
                scheduled_end_time: endIso,
                status,
                notes,
                required_assets: equipmentList
            });
        } catch (err: any) {
            setFormError(err.message || 'Could not save surgery. Please check input fields.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-panel border border-border rounded-md p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-lg font-semibold text-text-primary">
                    {isEditMode ? 'Edit Surgery' : 'Schedule Surgery'}
                </h3>
                <span className="text-xs text-text-muted">Fields marked with * are required</span>
            </div>

            {/* Error Message */}
            {formError && (
                <div className="p-3.5 bg-status-notready-bg border border-status-notready-solid text-status-notready-text text-sm rounded flex items-start justify-between">
                    <div>
                        <span className="font-semibold block mb-0.5">Could not save surgery:</span>
                        <span>{formError}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormError(null)}
                        className="text-xs text-status-notready-text underline ml-3"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Equipment Shortage Warning Box */}
            {shortageWarnings.length > 0 && !confirmedShortage && (
                <div className="p-4 bg-status-atrisk-bg border border-status-atrisk-solid text-status-atrisk-text text-sm rounded-md space-y-2">
                    <div className="font-semibold flex items-center gap-1.5">
                        <span>Equipment Availability Warning</span>
                    </div>
                    <p className="text-xs text-status-atrisk-text">
                        The following equipment shortages were detected for this surgery schedule:
                    </p>
                    <ul className="list-disc list-inside text-xs space-y-1 font-medium">
                        {shortageWarnings.map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                        ))}
                    </ul>
                    <div className="pt-2 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setConfirmedShortage(true);
                                setShortageWarnings([]);
                            }}
                            className="bg-status-atrisk-solid hover:opacity-90 text-white px-3 py-1.5 rounded text-xs font-medium cursor-pointer"
                        >
                            Proceed and save anyway
                        </button>
                        <button
                            type="button"
                            onClick={() => setShortageWarnings([])}
                            className="border border-status-atrisk-solid bg-panel hover:bg-status-atrisk-bg text-status-atrisk-text px-3 py-1.5 rounded text-xs font-medium cursor-pointer"
                        >
                            Review equipment
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Procedure Name */}
                <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-text-primary mb-1">
                        Procedure name *
                    </label>
                    <input
                        type="text"
                        required
                        value={procedureName}
                        onChange={(e) => setProcedureName(e.target.value)}
                        placeholder="e.g. Laparoscopic Cholecystectomy"
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                </div>

                {/* Surgery Type */}
                <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">
                        Surgery type *
                    </label>
                    <select
                        value={surgeryType}
                        onChange={(e) => handleSurgeryTypeChange(e.target.value)}
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    >
                        <option value="LAPAROSCOPIC">Laparoscopic Surgery</option>
                        <option value="CARDIAC">Cardiac Surgery</option>
                        <option value="ORTHOPEDIC">Orthopedic Surgery</option>
                        <option value="NEUROSURGERY">Neurosurgery</option>
                        <option value="GENERAL_SURGERY">General Surgery</option>
                    </select>
                </div>

                {/* Operating Room */}
                <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">
                        Operating room *
                    </label>
                    <select
                        value={operatingRoom}
                        onChange={(e) => setOperatingRoom(e.target.value)}
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    >
                        <option value="OR-1">Operating Room 1</option>
                        <option value="OR-2">Operating Room 2</option>
                        <option value="OR-3">Operating Room 3</option>
                        <option value="OR-4">Operating Room 4</option>
                        <option value="OR-5">Operating Room 5</option>
                        <option value="OR-6">Operating Room 6</option>
                    </select>
                </div>

                {/* Date */}
                <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">
                        Date *
                    </label>
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                </div>

                {/* Start Time & Duration */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-text-primary mb-1">
                            Start time *
                        </label>
                        <input
                            type="time"
                            required
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-text-primary mb-1">
                            Expected duration
                        </label>
                        <select
                            value={durationHours}
                            onChange={(e) => setDurationHours(e.target.value)}
                            className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                        >
                            <option value="1">1 hour</option>
                            <option value="1.5">1.5 hours</option>
                            <option value="2">2 hours</option>
                            <option value="2.5">2.5 hours</option>
                            <option value="3">3 hours</option>
                            <option value="3.5">3.5 hours</option>
                            <option value="4">4 hours</option>
                            <option value="5">5 hours</option>
                        </select>
                    </div>
                </div>

                {/* Department */}
                <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">
                        Department
                    </label>
                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    >
                        <option value="General Surgery">General Surgery</option>
                        <option value="Cardiothoracic Surgery">Cardiothoracic Surgery</option>
                        <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                        <option value="Neurosurgery">Neurosurgery</option>
                        <option value="Anesthesiology">Anesthesiology</option>
                        <option value="Pediatric Surgery">Pediatric Surgery</option>
                    </select>
                </div>

                {/* Lead Surgeon */}
                <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">
                        Lead surgeon
                    </label>
                    <input
                        type="text"
                        value={surgeonName}
                        onChange={(e) => setSurgeonName(e.target.value)}
                        placeholder="Dr. Surgeon Name"
                        className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                </div>

                {/* Status (if editing) */}
                {isEditMode && (
                    <div>
                        <label className="block text-xs font-medium text-text-primary mb-1">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                        >
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Equipment List Editor */}
            <div className="pt-3 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-semibold text-text-primary">
                            Required Equipment List
                        </h4>
                        <p className="text-xs text-text-muted">
                            Verify and edit medical equipment required for this procedure.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddEquipment}
                        className="border border-border-strong bg-panel hover:bg-subtle text-text-primary px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                    >
                        + Add equipment
                    </button>
                </div>

                <div className="border border-border rounded-md overflow-hidden bg-panel">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-subtle border-b border-border text-text-secondary font-medium">
                                <th className="p-2.5">Equipment type</th>
                                <th className="p-2.5 w-24">Quantity</th>
                                <th className="p-2.5 w-36">Criticality</th>
                                <th className="p-2.5 w-16 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {equipmentList.map((item, idx) => (
                                <tr key={idx} className="hover:bg-subtle">
                                    <td className="p-2">
                                        <select
                                            value={item.required_category}
                                            onChange={(e) => handleEquipmentChange(idx, 'required_category', e.target.value)}
                                            className="w-full bg-panel border border-border-strong text-text-primary rounded px-2 py-1 text-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                                        >
                                            {AVAILABLE_CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>
                                                    {formatEnumValue(cat)}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            min={1}
                                            max={5}
                                            value={item.quantity}
                                            onChange={(e) => handleEquipmentChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                                            className="w-full bg-panel border border-border-strong text-text-primary rounded px-2 py-1 text-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <select
                                            value={item.criticality}
                                            onChange={(e) => handleEquipmentChange(idx, 'criticality', e.target.value as any)}
                                            className="w-full bg-panel border border-border-strong text-text-primary rounded px-2 py-1 text-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                                        >
                                            <option value="CRITICAL">Critical</option>
                                            <option value="IMPORTANT">Important</option>
                                            <option value="STANDARD">Standard</option>
                                        </select>
                                    </td>
                                    <td className="p-2 text-right">
                                        {equipmentList.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEquipment(idx)}
                                                className="text-status-notready-text hover:text-status-notready-solid text-xs px-2 py-1 cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-border-strong bg-panel hover:bg-subtle text-text-primary rounded text-sm font-medium transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                    {isSubmitting ? 'Saving surgery...' : isEditMode ? 'Update surgery' : 'Schedule surgery'}
                </button>
            </div>
        </form>
    );
}
