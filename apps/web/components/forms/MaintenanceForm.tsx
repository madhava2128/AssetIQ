'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { formatEnumValue, formatCurrencyINR } from '@/lib/formatters';
import { formatSurgeryDate } from '@/lib/date-utils';

export interface AssetSummaryItem {
    id: string;
    asset_tag: string;
    name: string;
    category?: string;
    model?: string;
    serial_number?: string;
    operating_room?: string;
    location?: string;
    department?: string;
    status: string;
    last_pm_date?: string | null;
    next_pm_due_date?: string | null;
    is_pm_overdue?: boolean;
    warranty_vendor?: string;
    warranty_contract_number?: string;
    warranty_end_date?: string | null;
    contract_status?: string;
    [key: string]: any;
}

export interface MaintenanceRecordItem {
    id: string;
    asset_id: string;
    maintenance_type: string;
    performed_by: string;
    performed_at: string;
    status?: string;
    next_due_date?: string | null;
    details?: string;
    parts_replaced?: string[];
    cost?: number;
    time_taken_hours?: number | null;
    action_needed?: string;
    created_at?: string;
}

export interface BreakdownIncidentItem {
    id: string;
    asset_id: string;
    reported_at: string;
    resolved_at?: string | null;
    severity: string;
    failure_type?: string;
    description: string;
}

interface MaintenanceFormProps {
    assets: AssetSummaryItem[];
    initialAssetId?: string;
    maintenanceRecords?: MaintenanceRecordItem[];
    breakdownIncidents?: BreakdownIncidentItem[];
    currentUser?: { name?: string; role?: string };
    onSubmit: (data: any) => Promise<boolean | void> | void;
    onCancel: () => void;
    onSuccess?: () => void;
}

export default function MaintenanceForm({
    assets = [],
    initialAssetId,
    maintenanceRecords = [],
    breakdownIncidents = [],
    currentUser,
    onSubmit,
    onCancel,
    onSuccess
}: MaintenanceFormProps) {
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    // Form fields state
    const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAssetId || '');
    const [assetSearchQuery, setAssetSearchQuery] = useState('');
    const [isSearchingAsset, setIsSearchingAsset] = useState(!initialAssetId);

    const [maintenanceType, setMaintenanceType] = useState('PREVENTIVE');
    const [performedAt, setPerformedAt] = useState(todayStr);
    const [outcome, setOutcome] = useState<'COMPLETED' | 'FOLLOW_UP_NEEDED' | 'COULD_NOT_COMPLETE'>('COMPLETED');
    const [performedBy, setPerformedBy] = useState(currentUser?.name || 'Biomedical Engineer');
    const [details, setDetails] = useState('');
    const [actionNeeded, setActionNeeded] = useState('');

    // Optional Extra Details (collapsed by default)
    const [showOptionalDetails, setShowOptionalDetails] = useState(false);
    const [timeTakenHours, setTimeTakenHours] = useState('');
    const [partsReplaced, setPartsReplaced] = useState('');
    const [cost, setCost] = useState('');

    // Next Due Date state
    const [nextDueDate, setNextDueDate] = useState('');
    const [isNextDateManual, setIsNextDateManual] = useState(false);

    // Validation & Warning state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
    const [confirmedDuplicateDate, setConfirmedDuplicateDate] = useState(false);

    // View breakdown modal/popover state
    const [showBreakdownDetails, setShowBreakdownDetails] = useState(false);

    // Ref for scrolling to errors
    const errorSummaryRef = useRef<HTMLDivElement>(null);

    // Retrieve active asset object
    const selectedAsset = useMemo(() => {
        return assets.find(a => a.id === selectedAssetId) || null;
    }, [assets, selectedAssetId]);

    // Update if initialAssetId prop changes
    useEffect(() => {
        if (initialAssetId) {
            setSelectedAssetId(initialAssetId);
            setIsSearchingAsset(false);
        }
    }, [initialAssetId]);

    // Filter assets for searchable picker
    const filteredAssets = useMemo(() => {
        if (!assetSearchQuery.trim()) return assets.slice(0, 10);
        const q = assetSearchQuery.toLowerCase();
        return assets.filter(a =>
            a.name.toLowerCase().includes(q) ||
            a.asset_tag.toLowerCase().includes(q) ||
            (a.location && a.location.toLowerCase().includes(q)) ||
            (a.department && a.department.toLowerCase().includes(q)) ||
            (a.model && a.model.toLowerCase().includes(q))
        ).slice(0, 15);
    }, [assets, assetSearchQuery]);

    // Check for open breakdowns on selected asset
    const openBreakdown = useMemo(() => {
        if (!selectedAssetId) return null;
        return breakdownIncidents.find(b => b.asset_id === selectedAssetId && !b.resolved_at);
    }, [breakdownIncidents, selectedAssetId]);

    const isUnderRepair = useMemo(() => {
        return !!openBreakdown || selectedAsset?.status === 'UNDER_REPAIR';
    }, [openBreakdown, selectedAsset]);

    // Recent breakdowns in last 30 days
    const recentBreakdowns = useMemo(() => {
        if (!selectedAssetId) return [];
        const now = new Date().getTime();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        return breakdownIncidents.filter(b => {
            if (b.asset_id !== selectedAssetId) return false;
            const reportedTime = new Date(b.reported_at).getTime();
            return !isNaN(reportedTime) && (now - reportedTime) <= thirtyDaysMs;
        });
    }, [breakdownIncidents, selectedAssetId]);

    // Last recorded maintenance for selected asset
    const lastMaintenanceRecord = useMemo(() => {
        if (!selectedAssetId) return null;
        const records = maintenanceRecords
            .filter(m => m.asset_id === selectedAssetId)
            .sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime());
        return records[0] || null;
    }, [maintenanceRecords, selectedAssetId]);

    // Calculate relative days helper
    const getDaysDifference = (targetDateStr: string | null | undefined): { days: number; isPast: boolean } | null => {
        if (!targetDateStr) return null;
        const target = new Date(targetDateStr);
        if (isNaN(target.getTime())) return null;
        const today = new Date(todayStr);
        const diffMs = target.getTime() - today.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        return {
            days: Math.abs(diffDays),
            isPast: diffDays < 0
        };
    };

    // Calculate suggested interval in days
    const suggestedIntervalDays = useMemo(() => {
        if (outcome === 'FOLLOW_UP_NEEDED' || outcome === 'COULD_NOT_COMPLETE') {
            return 7;
        }
        switch (maintenanceType) {
            case 'PREVENTIVE':
                return 90;
            case 'CALIBRATION':
                return 365;
            case 'INSPECTION':
            case 'SAFETY_TEST':
            case 'SOFTWARE_UPDATE':
                return 180;
            case 'CORRECTIVE':
                return 30;
            default:
                return 90;
        }
    }, [maintenanceType, outcome]);

    // Auto-suggest next due date when maintenanceType, outcome, or performedAt changes (unless manually edited)
    useEffect(() => {
        if (!isNextDateManual && performedAt) {
            const baseDate = new Date(performedAt);
            if (!isNaN(baseDate.getTime())) {
                const autoDate = new Date(baseDate.getTime() + suggestedIntervalDays * 24 * 60 * 60 * 1000);
                setNextDueDate(autoDate.toISOString().split('T')[0]);
            }
        }
    }, [performedAt, suggestedIntervalDays, isNextDateManual]);

    // Suggested date label
    const suggestedDateDisplay = useMemo(() => {
        if (!performedAt) return '';
        const baseDate = new Date(performedAt);
        if (isNaN(baseDate.getTime())) return '';
        const autoDate = new Date(baseDate.getTime() + suggestedIntervalDays * 24 * 60 * 60 * 1000);
        const formatted = formatSurgeryDate(autoDate);
        if (outcome === 'FOLLOW_UP_NEEDED' || outcome === 'COULD_NOT_COMPLETE') {
            return `Suggested: ${formatted} (7 days after this visit because follow-up is needed). You can change it.`;
        }
        return `Suggested: ${formatted} (${suggestedIntervalDays} days after this visit). You can change it.`;
    }, [performedAt, suggestedIntervalDays, outcome]);

    // Quick pick interval handler
    const applyQuickInterval = (days: number) => {
        setIsNextDateManual(true);
        const base = performedAt ? new Date(performedAt) : new Date(todayStr);
        const target = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
        setNextDueDate(target.toISOString().split('T')[0]);
        validateField('nextDueDate', target.toISOString().split('T')[0]);
    };

    // Check if duplicate record exists for this equipment on this date
    const hasExistingRecordOnDate = useMemo(() => {
        if (!selectedAssetId || !performedAt) return false;
        return maintenanceRecords.some(m =>
            m.asset_id === selectedAssetId &&
            m.performed_at.split('T')[0] === performedAt
        );
    }, [maintenanceRecords, selectedAssetId, performedAt]);

    // Check if next due date is more than 2 years out (> 730 days)
    const isNextDueDateFarFuture = useMemo(() => {
        if (!performedAt || !nextDueDate) return false;
        const pDate = new Date(performedAt);
        const nDate = new Date(nextDueDate);
        if (isNaN(pDate.getTime()) || isNaN(nDate.getTime())) return false;
        const diffDays = (nDate.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays > 730;
    }, [performedAt, nextDueDate]);

    // Field-level validator
    const validateField = (fieldName: string, value: any): string => {
        let error = '';
        if (fieldName === 'selectedAssetId' && !value) {
            error = 'Choose the equipment this maintenance was for.';
        }
        if (fieldName === 'performedAt') {
            if (!value) {
                error = 'Date performed is required.';
            } else if (value > todayStr) {
                error = 'The date performed cannot be in the future.';
            }
        }
        if (fieldName === 'nextDueDate') {
            if (!value) {
                error = 'Next due date is required.';
            } else if (performedAt && value <= performedAt) {
                error = 'The next due date must be after the date performed.';
            }
        }
        if (fieldName === 'actionNeeded') {
            if ((outcome === 'FOLLOW_UP_NEEDED' || outcome === 'COULD_NOT_COMPLETE') && !value.trim()) {
                error = 'Describe what needs to happen next for this equipment.';
            }
        }
        setErrors(prev => {
            const next = { ...prev };
            if (error) next[fieldName] = error;
            else delete next[fieldName];
            return next;
        });
        return error;
    };

    const handleBlur = (fieldName: string, value: any) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        validateField(fieldName, value);
    };

    // Validate entire form
    const validateAll = (): boolean => {
        const e1 = validateField('selectedAssetId', selectedAssetId);
        const e2 = validateField('performedAt', performedAt);
        const e3 = validateField('nextDueDate', nextDueDate);
        const e4 = validateField('actionNeeded', actionNeeded);

        setTouched({
            selectedAssetId: true,
            performedAt: true,
            nextDueDate: true,
            actionNeeded: true
        });

        const isValid = !e1 && !e2 && !e3 && !e4;
        if (!isValid && errorSummaryRef.current) {
            errorSummaryRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        return isValid;
    };

    // Form submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (!validateAll()) return;

        // Warn if duplicate record exists and hasn't been acknowledged
        if (hasExistingRecordOnDate && !confirmedDuplicateDate) {
            setServerError('A maintenance record for this equipment already exists on this date. Please check the confirmation box below to save anyway.');
            if (errorSummaryRef.current) {
                errorSummaryRef.current.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        setIsSubmitting(true);

        const payload = {
            asset_id: selectedAssetId,
            maintenance_type: maintenanceType,
            performed_at: new Date(performedAt).toISOString(),
            status: outcome,
            next_due_date: new Date(nextDueDate).toISOString(),
            performed_by: performedBy.trim() || 'Biomedical Engineer',
            details: details.trim(),
            action_needed: actionNeeded.trim() || null,
            time_taken_hours: timeTakenHours ? Number(timeTakenHours) : null,
            parts_replaced: partsReplaced
                ? partsReplaced.split(',').map(s => s.trim()).filter(Boolean)
                : [],
            cost: cost ? Number(cost) : 0
        };

        try {
            const result = await onSubmit(payload);
            // If onSubmit returns false, submission failed
            if (result === false) {
                setServerError('Could not save the record. Please verify equipment status and try again.');
                setIsSubmitting(false);
                return;
            }
            setSaveSuccess(true);
            setIsSubmitting(false);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setServerError(err.message || 'Could not save the record. Please try again.');
            setIsSubmitting(false);
        }
    };

    // Reset to log another record
    const handleResetForm = () => {
        setSaveSuccess(false);
        setSelectedAssetId('');
        setIsSearchingAsset(true);
        setAssetSearchQuery('');
        setMaintenanceType('PREVENTIVE');
        setPerformedAt(todayStr);
        setOutcome('COMPLETED');
        setDetails('');
        setActionNeeded('');
        setTimeTakenHours('');
        setPartsReplaced('');
        setCost('');
        setIsNextDateManual(false);
        setErrors({});
        setTouched({});
        setServerError(null);
        setConfirmedDuplicateDate(false);
    };

    // Maintenance type hint lookup
    const typeHints: Record<string, string> = {
        PREVENTIVE: 'Routine check done to prevent failures.',
        CORRECTIVE: 'Work done to fix a fault.',
        CALIBRATION: 'Work done to calibrate precision instruments.',
        SAFETY_TEST: 'Electrical and clinical safety inspection.',
        SOFTWARE_UPDATE: 'Firmware or operating software upgrade.',
        INSPECTION: 'Visual and mechanical safety inspection.'
    };

    // Criticality display in plain words
    const criticalityDisplay = useMemo(() => {
        if (!selectedAsset) return 'Routine';
        const cat = (selectedAsset.category || '').toUpperCase();
        if (cat === 'ANESTHESIA_MACHINE' || cat === 'VENTILATOR' || cat === 'DEFIBRILLATOR') {
            return 'Critical';
        }
        if (cat === 'SURGICAL_MONITOR' || cat === 'CARM_FLUOROSCOPY' || cat === 'LAPAROSCOPIC_TOWER') {
            return 'Important';
        }
        return 'Routine';
    }, [selectedAsset]);

    // Warranty status helper
    const warrantyInfo = useMemo(() => {
        if (!selectedAsset) return null;
        const vendor = selectedAsset.warranty_vendor || selectedAsset.contract_vendor || 'Not specified';
        const contractNo = selectedAsset.warranty_contract_number || 'N/A';
        const endDateStr = selectedAsset.warranty_end_date || selectedAsset.warranty_expiration_date;
        if (!endDateStr) {
            return { vendor, contractNo, endDateStr: 'N/A', statusLabel: 'No active contract' };
        }
        const diff = getDaysDifference(endDateStr);
        let statusLabel = 'Active';
        if (diff) {
            if (diff.isPast) statusLabel = 'Expired';
            else if (diff.days <= 30) statusLabel = `Expiring soon (${diff.days} days)`;
            else statusLabel = 'Active';
        }
        return {
            vendor,
            contractNo,
            endDateStr: formatSurgeryDate(endDateStr),
            statusLabel
        };
    }, [selectedAsset]);

    // Last maintenance info helper
    const lastMaintenanceInfo = useMemo(() => {
        const lastDate = lastMaintenanceRecord?.performed_at || selectedAsset?.last_pm_date;
        if (!lastDate) return null;
        const diff = getDaysDifference(lastDate);
        const daysAgoText = diff ? (diff.days === 0 ? 'Today' : `${diff.days} days ago`) : '';
        const typeText = lastMaintenanceRecord
            ? formatEnumValue(lastMaintenanceRecord.maintenance_type)
            : 'Scheduled PM';
        return {
            dateStr: formatSurgeryDate(lastDate),
            typeText,
            daysAgoText
        };
    }, [lastMaintenanceRecord, selectedAsset]);

    // Next due info helper
    const nextDueInfo = useMemo(() => {
        const dueDate = selectedAsset?.next_pm_due_date;
        if (!dueDate) return null;
        const diff = getDaysDifference(dueDate);
        if (!diff) return null;

        let statusText = 'On time';
        let statusClass = 'text-status-ready-text';

        if (diff.isPast) {
            statusText = `Overdue by ${diff.days} days`;
            statusClass = 'text-status-notready-text font-medium';
        } else if (diff.days <= 5) {
            statusText = diff.days === 0 ? 'Due today' : `Due in ${diff.days} days`;
            statusClass = 'text-status-atrisk-text font-medium';
        } else {
            statusText = 'On time';
            statusClass = 'text-status-ready-text font-medium';
        }

        return {
            dateStr: formatSurgeryDate(dueDate),
            statusText,
            statusClass
        };
    }, [selectedAsset]);

    // Post-save Confirmation Screen
    if (saveSuccess) {
        return (
            <div className="bg-panel border border-border rounded-md p-6 max-w-2xl mx-auto space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-status-ready-bg border border-status-ready-solid text-status-ready-text flex items-center justify-center font-bold">
                        ✓
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-text-primary">Maintenance record saved</h2>
                        <p className="text-sm text-text-secondary mt-0.5">
                            The maintenance record was logged and equipment schedule has been updated.
                        </p>
                    </div>
                </div>

                <div className="bg-subtle border border-border rounded p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-text-secondary">Equipment:</span>
                        <span className="font-medium text-text-primary">{selectedAsset?.name} ({selectedAsset?.asset_tag})</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-secondary">Date performed:</span>
                        <span className="font-medium text-text-primary tabular-nums">{formatSurgeryDate(performedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-secondary">Next maintenance due:</span>
                        <span className="font-medium text-status-ready-text tabular-nums">{formatSurgeryDate(nextDueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-secondary">Outcome:</span>
                        <span className="text-text-primary">{outcome === 'COMPLETED' ? 'Completed, equipment ready for use' : outcome === 'FOLLOW_UP_NEEDED' ? 'Follow-up needed' : 'Could not complete'}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleResetForm}
                        className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                        Add another record
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="border border-border-strong bg-panel hover:bg-subtle text-text-primary px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                        Back to maintenance
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-panel border border-border rounded-[6px] overflow-hidden text-text-primary max-w-4xl mx-auto">
            {/* Header */}
            <div className="panel-header-band p-5 border-b border-border">
                <h2 className="text-xl font-semibold text-text-primary">Record maintenance</h2>
                <p className="text-sm text-text-secondary mt-1">
                    Log a maintenance visit for a piece of equipment and set when it is next due.
                </p>
            </div>

            {/* Error Summary Banner (if validation errors or server error) */}
            {(Object.keys(errors).length > 0 || serverError) && (
                <div
                    ref={errorSummaryRef}
                    role="alert"
                    aria-live="assertive"
                    className="m-5 p-4 bg-status-notready-bg border border-status-notready-solid text-status-notready-text rounded text-sm space-y-1"
                >
                    <div className="font-semibold">Please fix the following problems before saving:</div>
                    {serverError && <div>• {serverError}</div>}
                    {errors.selectedAssetId && <div>• {errors.selectedAssetId}</div>}
                    {errors.performedAt && <div>• {errors.performedAt}</div>}
                    {errors.nextDueDate && <div>• {errors.nextDueDate}</div>}
                    {errors.actionNeeded && <div>• {errors.actionNeeded}</div>}
                </div>
            )}

            {/* Under Repair Notice Banner */}
            {isUnderRepair && selectedAsset && (
                <div className="mx-5 mt-5 p-3.5 bg-status-atrisk-bg border border-status-atrisk-solid text-status-atrisk-text rounded text-sm">
                    <strong>Notice:</strong> This equipment is currently under repair. Recording maintenance will not mark it as available.
                </div>
            )}

            {/* Duplicate Record Notice Banner */}
            {hasExistingRecordOnDate && (
                <div className="mx-5 mt-5 p-3.5 bg-status-atrisk-bg border border-status-atrisk-solid text-status-atrisk-text rounded text-sm space-y-2">
                    <div>
                        <strong>Warning:</strong> A maintenance record for this equipment already exists on {formatSurgeryDate(performedAt)}.
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                        <input
                            type="checkbox"
                            checked={confirmedDuplicateDate}
                            onChange={(e) => setConfirmedDuplicateDate(e.target.checked)}
                            className="rounded border-border-strong text-accent focus:ring-accent"
                        />
                        Save anyway (record duplicate visit on same date)
                    </label>
                </div>
            )}

            {/* Main Form Content */}
            <form onSubmit={handleSubmit} noValidate className="p-5 space-y-6">

                {/* ======================================================== */}
                {/* SECTION 1: EQUIPMENT */}
                {/* ======================================================== */}
                <section aria-labelledby="section-equipment-heading" className="space-y-4">
                    <div className="border-b border-border pb-2">
                        <h3 id="section-equipment-heading" className="text-lg font-semibold text-text-primary">
                            1. Equipment
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">Which equipment this maintenance was performed for.</p>
                    </div>

                    {/* Searchable Picker if searching or no equipment picked */}
                    {isSearchingAsset || !selectedAsset ? (
                        <div className="space-y-2">
                            <label htmlFor="equipment-search" className="block text-sm font-medium text-text-primary">
                                Search equipment <span className="text-text-muted font-normal">(required)</span>
                            </label>
                            <input
                                id="equipment-search"
                                type="text"
                                value={assetSearchQuery}
                                onChange={(e) => setAssetSearchQuery(e.target.value)}
                                placeholder="Type name, asset tag, department, or location..."
                                className="w-full bg-panel border border-border-strong text-text-primary rounded px-3.5 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                                autoFocus={!selectedAsset}
                            />

                            {/* Dropdown Results List */}
                            <div className="border border-border rounded max-h-56 overflow-y-auto divide-y divide-border bg-panel">
                                {filteredAssets.length === 0 ? (
                                    <div className="p-3 text-sm text-text-muted text-center">
                                        No equipment matches "{assetSearchQuery}".
                                    </div>
                                ) : (
                                    filteredAssets.map(asset => (
                                        <button
                                            key={asset.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedAssetId(asset.id);
                                                setIsSearchingAsset(false);
                                                validateField('selectedAssetId', asset.id);
                                            }}
                                            className="w-full text-left p-3 hover:bg-subtle transition-colors flex justify-between items-center group"
                                        >
                                            <div>
                                                <div className="text-sm font-medium text-text-primary group-hover:text-accent">
                                                    {asset.name}
                                                </div>
                                                <div className="text-xs text-text-muted mt-0.5 tabular-nums">
                                                    Tag: <span className="text-text-secondary">{asset.asset_tag}</span> • Dept: {asset.department || 'Biomedical'} • Loc: {asset.location || 'OR Complex'}
                                                </div>
                                            </div>
                                            <span className="text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                Select →
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                            {errors.selectedAssetId && touched.selectedAssetId && (
                                <p className="text-xs text-status-notready-text mt-1">{errors.selectedAssetId}</p>
                            )}
                        </div>
                    ) : (
                        /* Read-only compact Equipment Summary Box */
                        <div className="bg-subtle border border-border rounded p-4 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2.5">
                                <div>
                                    <div className="text-base font-semibold text-text-primary flex items-center gap-2">
                                        {selectedAsset.name}
                                        <span className="text-xs font-normal text-text-muted tabular-nums">
                                            ({selectedAsset.asset_tag})
                                        </span>
                                    </div>
                                    <div className="text-xs text-text-secondary mt-0.5">
                                        Model: {selectedAsset.model || 'Standard'} • Dept: {selectedAsset.department || 'Biomedical'} • Loc: {selectedAsset.location || 'OR Complex'}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSearchingAsset(true);
                                        setAssetSearchQuery('');
                                    }}
                                    className="text-xs text-accent hover:underline font-medium self-start sm:self-auto"
                                >
                                    Change equipment
                                </button>
                            </div>

                            {/* Key Metadata Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                    <div className="text-text-muted">Current status</div>
                                    <div className="mt-0.5">
                                        <span className={`inline-block px-2 py-0.5 rounded border font-medium ${
                                            selectedAsset.status === 'AVAILABLE'
                                                ? 'bg-status-ready-bg text-status-ready-text border-status-ready-solid'
                                                : selectedAsset.status === 'UNDER_MAINTENANCE'
                                                ? 'bg-status-atrisk-bg text-status-atrisk-text border-status-atrisk-solid'
                                                : 'bg-status-notready-bg text-status-notready-text border-status-notready-solid'
                                        }`}>
                                            {formatEnumValue(selectedAsset.status)}
                                        </span>
                                    </div>
                                    <div className="text-text-muted mt-1">Criticality: <span className="text-text-primary font-medium">{criticalityDisplay}</span></div>
                                </div>

                                <div>
                                    <div className="text-text-muted">Last maintenance</div>
                                    {lastMaintenanceInfo ? (
                                        <div className="mt-0.5 text-text-primary">
                                            <div className="font-medium tabular-nums">{lastMaintenanceInfo.dateStr}</div>
                                            <div className="text-text-muted">{lastMaintenanceInfo.typeText} ({lastMaintenanceInfo.daysAgoText})</div>
                                        </div>
                                    ) : (
                                        <div className="mt-0.5 text-text-muted">No prior records</div>
                                    )}
                                </div>

                                <div>
                                    <div className="text-text-muted">Current PM schedule</div>
                                    {nextDueInfo ? (
                                        <div className="mt-0.5">
                                            <div className="font-medium text-text-primary tabular-nums">{nextDueInfo.dateStr}</div>
                                            <div className={nextDueInfo.statusClass}>{nextDueInfo.statusText}</div>
                                        </div>
                                    ) : (
                                        <div className="mt-0.5 text-text-muted">Not scheduled</div>
                                    )}
                                </div>

                                <div>
                                    <div className="text-text-muted">Warranty / Contract</div>
                                    {warrantyInfo ? (
                                        <div className="mt-0.5 text-text-primary">
                                            <div className="font-medium truncate">{warrantyInfo.vendor}</div>
                                            <div className="text-text-muted">{warrantyInfo.statusLabel}</div>
                                        </div>
                                    ) : (
                                        <div className="mt-0.5 text-text-muted">No contract</div>
                                    )}
                                </div>
                            </div>

                            {/* Recent breakdowns badge / link */}
                            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-text-secondary">Recent breakdowns (last 30 days): </span>
                                    <span className={`font-semibold tabular-nums ${recentBreakdowns.length > 0 ? 'text-status-notready-text' : 'text-text-primary'}`}>
                                        {recentBreakdowns.length} incident{recentBreakdowns.length === 1 ? '' : 's'}
                                    </span>
                                </div>
                                {recentBreakdowns.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowBreakdownDetails(!showBreakdownDetails)}
                                        className="text-accent hover:underline font-medium"
                                    >
                                        {showBreakdownDetails ? 'Hide details' : 'View incidents'}
                                    </button>
                                )}
                            </div>

                            {/* Expandable Breakdown List */}
                            {showBreakdownDetails && recentBreakdowns.length > 0 && (
                                <div className="mt-2 p-3 bg-panel border border-border rounded text-xs space-y-2">
                                    <div className="font-semibold text-text-primary">Breakdown incidents:</div>
                                    {recentBreakdowns.map((b) => (
                                        <div key={b.id} className="border-b border-border last:border-b-0 pb-1.5 last:pb-0">
                                            <div className="flex justify-between font-medium">
                                                <span>{formatEnumValue(b.severity)} • {formatEnumValue(b.failure_type || 'General')}</span>
                                                <span className="text-text-muted tabular-nums">{formatSurgeryDate(b.reported_at)}</span>
                                            </div>
                                            <div className="text-text-secondary mt-0.5">{b.description}</div>
                                            <div className="text-text-muted mt-0.5">
                                                Status: {b.resolved_at ? `Resolved on ${formatSurgeryDate(b.resolved_at)}` : 'Unresolved / Open'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* ======================================================== */}
                {/* SECTION 2: WHAT WAS DONE */}
                {/* ======================================================== */}
                <section aria-labelledby="section-visit-details-heading" className="space-y-4">
                    <div className="border-b border-border pb-2">
                        <h3 id="section-visit-details-heading" className="text-lg font-semibold text-text-primary">
                            2. What was done
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">Details of the maintenance visit performed.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Maintenance Type Dropdown */}
                        <div>
                            <label htmlFor="maintenance-type" className="block text-sm font-medium text-text-primary mb-1">
                                Maintenance type <span className="text-text-muted font-normal">(required)</span>
                            </label>
                            <select
                                id="maintenance-type"
                                value={maintenanceType}
                                onChange={(e) => setMaintenanceType(e.target.value)}
                                className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                            >
                                <option value="PREVENTIVE">Preventive (scheduled check)</option>
                                <option value="CORRECTIVE">Corrective (repair)</option>
                                <option value="CALIBRATION">Calibration</option>
                                <option value="SAFETY_TEST">Safety/electrical test</option>
                                <option value="SOFTWARE_UPDATE">Software update</option>
                                <option value="INSPECTION">Inspection</option>
                            </select>
                            <p className="text-xs text-text-muted mt-1">
                                {typeHints[maintenanceType] || 'Routine maintenance visit.'}
                            </p>
                        </div>

                        {/* Date Performed */}
                        <div>
                            <label htmlFor="performed-at" className="block text-sm font-medium text-text-primary mb-1">
                                Date performed <span className="text-text-muted font-normal">(required)</span>
                            </label>
                            <input
                                id="performed-at"
                                type="date"
                                max={todayStr}
                                value={performedAt}
                                onChange={(e) => {
                                    setPerformedAt(e.target.value);
                                    validateField('performedAt', e.target.value);
                                }}
                                onBlur={(e) => handleBlur('performedAt', e.target.value)}
                                className={`w-full bg-panel border ${
                                    errors.performedAt && touched.performedAt ? 'border-status-notready-solid' : 'border-border-strong'
                                } text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent`}
                            />
                            <p className="text-xs text-text-muted mt-1 tabular-nums">
                                Formatted: {formatSurgeryDate(performedAt) || 'Invalid date'} (cannot be in the future)
                            </p>
                            {errors.performedAt && touched.performedAt && (
                                <p className="text-xs text-status-notready-text mt-1">{errors.performedAt}</p>
                            )}
                        </div>
                    </div>

                    {/* Outcome Radio Options */}
                    <div>
                        <fieldset>
                            <legend className="block text-sm font-medium text-text-primary mb-2">
                                Outcome <span className="text-text-muted font-normal">(required)</span>
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <label className={`flex items-start gap-2 p-3 border rounded cursor-pointer transition-colors ${
                                    outcome === 'COMPLETED'
                                        ? 'border-accent bg-accent-subtle/40'
                                        : 'border-border bg-panel hover:bg-subtle'
                                }`}>
                                    <input
                                        type="radio"
                                        name="outcome"
                                        value="COMPLETED"
                                        checked={outcome === 'COMPLETED'}
                                        onChange={() => setOutcome('COMPLETED')}
                                        className="mt-0.5 text-accent focus:ring-accent"
                                    />
                                    <div>
                                        <div className="text-sm font-medium text-text-primary">Completed</div>
                                        <div className="text-xs text-text-muted">Equipment ready for use</div>
                                    </div>
                                </label>

                                <label className={`flex items-start gap-2 p-3 border rounded cursor-pointer transition-colors ${
                                    outcome === 'FOLLOW_UP_NEEDED'
                                        ? 'border-accent bg-accent-subtle/40'
                                        : 'border-border bg-panel hover:bg-subtle'
                                }`}>
                                    <input
                                        type="radio"
                                        name="outcome"
                                        value="FOLLOW_UP_NEEDED"
                                        checked={outcome === 'FOLLOW_UP_NEEDED'}
                                        onChange={() => setOutcome('FOLLOW_UP_NEEDED')}
                                        className="mt-0.5 text-accent focus:ring-accent"
                                    />
                                    <div>
                                        <div className="text-sm font-medium text-text-primary">Follow-up needed</div>
                                        <div className="text-xs text-text-muted">Completed, but requires next visit</div>
                                    </div>
                                </label>

                                <label className={`flex items-start gap-2 p-3 border rounded cursor-pointer transition-colors ${
                                    outcome === 'COULD_NOT_COMPLETE'
                                        ? 'border-accent bg-accent-subtle/40'
                                        : 'border-border bg-panel hover:bg-subtle'
                                }`}>
                                    <input
                                        type="radio"
                                        name="outcome"
                                        value="COULD_NOT_COMPLETE"
                                        checked={outcome === 'COULD_NOT_COMPLETE'}
                                        onChange={() => setOutcome('COULD_NOT_COMPLETE')}
                                        className="mt-0.5 text-accent focus:ring-accent"
                                    />
                                    <div>
                                        <div className="text-sm font-medium text-text-primary">Could not complete</div>
                                        <div className="text-xs text-text-muted">Pending parts or access</div>
                                    </div>
                                </label>
                            </div>
                        </fieldset>
                    </div>

                    {/* Performed By */}
                    <div>
                        <label htmlFor="performed-by" className="block text-sm font-medium text-text-primary mb-1">
                            Performed by <span className="text-text-muted font-normal">(required)</span>
                        </label>
                        <input
                            id="performed-by"
                            type="text"
                            value={performedBy}
                            onChange={(e) => setPerformedBy(e.target.value)}
                            placeholder="Technician or engineer name"
                            className="w-full bg-panel border border-border-strong text-text-primary rounded px-3.5 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                        />
                        <p className="text-xs text-text-muted mt-1">Name of the biomedical specialist who conducted the visit.</p>
                    </div>

                    {/* Work Done / Remarks */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="maintenance-details" className="block text-sm font-medium text-text-primary">
                                Work done / remarks
                            </label>
                            <span className="text-xs text-text-muted tabular-nums">
                                {details.length} characters
                            </span>
                        </div>
                        <textarea
                            id="maintenance-details"
                            rows={3}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Replaced air filter, checked alarms, tested battery backup"
                            className="w-full bg-panel border border-border-strong text-text-primary rounded px-3.5 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                        />
                        <p className="text-xs text-text-muted mt-1">Short summary of findings, checks completed, or service performed.</p>
                    </div>

                    {/* Collapsible Optional Extra Details */}
                    <div className="border border-border rounded overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowOptionalDetails(!showOptionalDetails)}
                            className="w-full p-3 bg-subtle hover:bg-subtle/80 text-left text-sm font-medium text-text-primary flex justify-between items-center transition-colors"
                        >
                            <span>Add more details (optional)</span>
                            <span className="text-xs text-text-muted">
                                {showOptionalDetails ? '▲ Hide' : '▼ Show (time, parts, cost)'}
                            </span>
                        </button>

                        {showOptionalDetails && (
                            <div className="p-4 bg-panel space-y-4 border-t border-border">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="time-taken" className="block text-xs font-medium text-text-secondary mb-1">
                                            Time taken (hours)
                                        </label>
                                        <input
                                            id="time-taken"
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            value={timeTakenHours}
                                            onChange={(e) => setTimeTakenHours(e.target.value)}
                                            placeholder="e.g. 1.5"
                                            className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-1.5 text-sm tabular-nums focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="parts-replaced" className="block text-xs font-medium text-text-secondary mb-1">
                                            Parts replaced
                                        </label>
                                        <input
                                            id="parts-replaced"
                                            type="text"
                                            value={partsReplaced}
                                            onChange={(e) => setPartsReplaced(e.target.value)}
                                            placeholder="e.g. O2 Sensor, Filter"
                                            className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="maintenance-cost" className="block text-xs font-medium text-text-secondary mb-1">
                                            Cost (₹ INR)
                                        </label>
                                        <input
                                            id="maintenance-cost"
                                            type="number"
                                            min="0"
                                            value={cost}
                                            onChange={(e) => setCost(e.target.value)}
                                            placeholder="e.g. 12500"
                                            className="w-full bg-panel border border-border-strong text-text-primary rounded px-3 py-1.5 text-sm tabular-nums focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                                        />
                                        {cost && !isNaN(Number(cost)) && (
                                            <div className="text-xs text-text-muted mt-1 tabular-nums">
                                                Formatted: {formatCurrencyINR(Number(cost))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* ======================================================== */}
                {/* SECTION 3: NEXT MAINTENANCE */}
                {/* ======================================================== */}
                <section aria-labelledby="section-next-maintenance-heading" className="space-y-4">
                    <div className="border-b border-border pb-2">
                        <h3 id="section-next-maintenance-heading" className="text-lg font-semibold text-text-primary">
                            3. Next maintenance
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">When the next service visit is scheduled.</p>
                    </div>

                    {/* Auto-suggest note */}
                    <div className="p-3 bg-subtle border border-border rounded text-xs text-text-secondary flex justify-between items-center">
                        <span>{suggestedDateDisplay}</span>
                        {isNextDateManual && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsNextDateManual(false);
                                    const base = new Date(performedAt);
                                    if (!isNaN(base.getTime())) {
                                        const autoDate = new Date(base.getTime() + suggestedIntervalDays * 24 * 60 * 60 * 1000);
                                        setNextDueDate(autoDate.toISOString().split('T')[0]);
                                    }
                                }}
                                className="text-accent hover:underline font-medium ml-2"
                            >
                                Reset to suggested
                            </button>
                        )}
                    </div>

                    <div>
                        <label htmlFor="next-due-date" className="block text-sm font-medium text-text-primary mb-1">
                            Next due date <span className="text-text-muted font-normal">(required)</span>
                        </label>

                        {/* Quick pick chips */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xs text-text-muted">Quick intervals:</span>
                            <button
                                type="button"
                                onClick={() => applyQuickInterval(30)}
                                className="px-2.5 py-1 bg-panel border border-border hover:bg-subtle rounded text-xs font-medium text-text-primary transition-colors"
                            >
                                +30 days
                            </button>
                            <button
                                type="button"
                                onClick={() => applyQuickInterval(90)}
                                className="px-2.5 py-1 bg-panel border border-border hover:bg-subtle rounded text-xs font-medium text-text-primary transition-colors"
                            >
                                +90 days
                            </button>
                            <button
                                type="button"
                                onClick={() => applyQuickInterval(180)}
                                className="px-2.5 py-1 bg-panel border border-border hover:bg-subtle rounded text-xs font-medium text-text-primary transition-colors"
                            >
                                +6 months
                            </button>
                            <button
                                type="button"
                                onClick={() => applyQuickInterval(365)}
                                className="px-2.5 py-1 bg-panel border border-border hover:bg-subtle rounded text-xs font-medium text-text-primary transition-colors"
                            >
                                +12 months
                            </button>
                        </div>

                        <input
                            id="next-due-date"
                            type="date"
                            value={nextDueDate}
                            onChange={(e) => {
                                setIsNextDateManual(true);
                                setNextDueDate(e.target.value);
                                validateField('nextDueDate', e.target.value);
                            }}
                            onBlur={(e) => handleBlur('nextDueDate', e.target.value)}
                            className={`w-full sm:w-72 bg-panel border ${
                                errors.nextDueDate && touched.nextDueDate ? 'border-status-notready-solid' : 'border-border-strong'
                            } text-text-primary rounded px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent`}
                        />
                        <p className="text-xs text-text-muted mt-1 tabular-nums">
                            Formatted: {formatSurgeryDate(nextDueDate) || 'Invalid date'} (must be after date performed)
                        </p>
                        {errors.nextDueDate && touched.nextDueDate && (
                            <p className="text-xs text-status-notready-text mt-1">{errors.nextDueDate}</p>
                        )}
                        {isNextDueDateFarFuture && (
                            <p className="text-xs text-status-atrisk-text mt-1">
                                Notice: The next maintenance date is more than 2 years in the future.
                            </p>
                        )}
                    </div>

                    {/* Conditional: What needs to happen next? */}
                    {(outcome === 'FOLLOW_UP_NEEDED' || outcome === 'COULD_NOT_COMPLETE') && (
                        <div className="p-3.5 bg-subtle border border-border rounded space-y-1">
                            <label htmlFor="action-needed" className="block text-sm font-medium text-text-primary">
                                What needs to happen next? <span className="text-text-muted font-normal">(required)</span>
                            </label>
                            <textarea
                                id="action-needed"
                                rows={2}
                                value={actionNeeded}
                                onChange={(e) => {
                                    setActionNeeded(e.target.value);
                                    validateField('actionNeeded', e.target.value);
                                }}
                                onBlur={(e) => handleBlur('actionNeeded', e.target.value)}
                                placeholder="Describe the required spare parts, pending calibrations, or next visit actions..."
                                className={`w-full bg-panel border ${
                                    errors.actionNeeded && touched.actionNeeded ? 'border-status-notready-solid' : 'border-border-strong'
                                } text-text-primary rounded px-3.5 py-2 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent`}
                            />
                            {errors.actionNeeded && touched.actionNeeded && (
                                <p className="text-xs text-status-notready-text mt-1">{errors.actionNeeded}</p>
                            )}
                        </div>
                    )}
                </section>

                {/* ======================================================== */}
                {/* LIVE PREVIEW: WHAT WILL HAPPEN WHEN YOU SAVE */}
                {/* ======================================================== */}
                <div className="bg-subtle border border-border rounded p-4 text-sm space-y-2">
                    <div className="font-semibold text-text-primary flex items-center gap-2">
                        <span>ℹ️</span> What will happen when you save
                    </div>
                    <ul className="text-xs text-text-secondary space-y-1 list-disc pl-5">
                        {selectedAsset ? (
                            <li>
                                Maintenance will be recorded for <strong>{selectedAsset.name}</strong> on <span className="tabular-nums font-medium text-text-primary">{formatSurgeryDate(performedAt) || 'selected date'}</span>.
                            </li>
                        ) : (
                            <li>Maintenance record will be created for the selected equipment.</li>
                        )}
                        {nextDueDate && (
                            <li>
                                The next maintenance will be due on <span className="tabular-nums font-medium text-text-primary">{formatSurgeryDate(nextDueDate)}</span>.
                            </li>
                        )}
                        {selectedAsset?.is_pm_overdue && (
                            <li className="text-status-ready-text font-medium">
                                This equipment will no longer be counted as overdue for maintenance.
                            </li>
                        )}
                        {isUnderRepair && (
                            <li className="text-status-atrisk-text font-medium">
                                This equipment will remain under repair because an unresolved breakdown incident is open.
                            </li>
                        )}
                        {!isUnderRepair && outcome === 'COMPLETED' && selectedAsset?.status === 'UNDER_MAINTENANCE' && (
                            <li className="text-status-ready-text font-medium">
                                This equipment will be marked as available for use in surgeries.
                            </li>
                        )}
                        {outcome === 'FOLLOW_UP_NEEDED' && (
                            <li className="text-status-atrisk-text font-medium">
                                A follow-up visit will be scheduled and flagged for {formatSurgeryDate(nextDueDate)}.
                            </li>
                        )}
                        {outcome === 'COULD_NOT_COMPLETE' && (
                            <li className="text-status-notready-text font-medium">
                                Incomplete status will be logged and pending tasks tracked for {formatSurgeryDate(nextDueDate)}.
                            </li>
                        )}
                    </ul>
                </div>

                {/* ======================================================== */}
                {/* STICKY FOOTER BAR */}
                {/* ======================================================== */}
                <div className="sticky bottom-0 -mx-5 -mb-5 p-4 bg-panel border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 z-10">
                    <div className="text-xs text-text-muted">
                        All mandatory fields marked with (required).
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-4 py-2 border border-border-strong bg-panel hover:bg-table-hover text-text-primary rounded-[4px] text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-[4px] text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Saving...' : 'Save maintenance record'}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
}
