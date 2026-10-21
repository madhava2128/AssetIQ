'use client';

import React, { useState, useEffect } from 'react';
import { formatSurgeryDate } from '@/lib/date-utils';

interface ReportIncidentModalProps {
    isOpen: boolean;
    asset?: {
        id: string;
        name: string;
        asset_tag: string;
    };
    assetId?: string;
    assetName?: string;
    assetTag?: string;
    openIncidents?: any[];
    onClose: () => void;
    onSuccess?: (message?: string) => void;
}

export default function ReportIncidentModal({
    isOpen,
    asset: propAsset,
    assetId,
    assetName,
    assetTag,
    openIncidents = [],
    onClose,
    onSuccess
}: ReportIncidentModalProps) {
    const asset = propAsset || {
        id: assetId || '',
        name: assetName || '',
        asset_tag: assetTag || ''
    };
    const [failureType, setFailureType] = useState('MECHANICAL');
    const [severity, setSeverity] = useState('HIGH');
    const [description, setDescription] = useState('');
    const [reportedBy, setReportedBy] = useState('Biomedical Engineer');
    const [currentTimeString, setCurrentTimeString] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize current user name and time
    useEffect(() => {
        if (!isOpen) return;

        // Current time string formatted cleanly
        const now = new Date();
        const formattedDate = formatSurgeryDate(now);
        const timePart = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
        setCurrentTimeString(`${formattedDate}, ${timePart}`);

        // Get signed-in user identity
        const storedRole = typeof window !== 'undefined' ? localStorage.getItem('assetiq_user_role') : null;
        if (storedRole === 'hospital_admin') {
            setReportedBy('Dr. Rajesh Mehta (Hospital Administrator)');
        } else if (storedRole === 'biomedical_engineer') {
            setReportedBy('Eng. Vikram Rao (Biomedical Lead)');
        } else {
            setReportedBy('Signed-in Staff');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Check if there is already an open incident
    const activeIncident = openIncidents.length > 0 ? openIncidents[0] : null;
    const activeIncidentDate = activeIncident?.reported_at ? formatSurgeryDate(activeIncident.reported_at) : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!description.trim()) {
            setError('Please describe what happened before submitting.');
            return;
        }

        setSubmitting(true);

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('assetiq_auth_token') : null;
            const res = await fetch('/api/assets/breakdowns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    asset_id: asset.id,
                    failure_type: failureType,
                    severity: severity,
                    description: description.trim(),
                    reported_by: reportedBy
                })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.error || 'Failed to submit incident report. Please check your connection.');
                setSubmitting(false);
                return;
            }

            // Success confirmation
            const successMsg = `Incident reported for ${asset.name}.`;
            onSuccess(successMsg);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Could not connect to the server. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 overflow-y-auto">
            <div className="w-full max-w-lg bg-panel border border-border rounded-[6px] shadow-none flex flex-col max-h-[90vh] overflow-hidden my-auto">
                {/* Modal Header */}
                <div className="panel-header-band p-4 sm:p-5 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">Report an Incident</h2>
                        <p className="text-xs text-text-muted mt-0.5">
                            Equipment: <span className="font-medium text-text-primary">{asset.name}</span> ({asset.asset_tag})
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-subtle text-base font-semibold"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                    {/* Open Incident Warning Banner (Section 6) */}
                    {activeIncident && (
                        <div className="p-3 bg-status-atrisk-bg border border-status-atrisk-solid rounded text-status-atrisk-text text-sm">
                            <span className="font-semibold">Notice: </span>
                            An incident for this equipment is already open
                            {activeIncidentDate ? ` (reported ${activeIncidentDate})` : ''}.
                            You can still add another.
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-status-notready-bg border border-status-notready-solid rounded text-status-notready-text text-sm">
                            {error}
                        </div>
                    )}

                    {/* Fixed Asset Display (cannot be changed) */}
                    <div className="bg-subtle border border-border rounded p-3">
                        <div className="text-xs text-text-muted font-medium">Selected Equipment</div>
                        <div className="text-sm font-semibold text-text-primary">{asset.name}</div>
                        <div className="text-xs text-text-secondary tabular-nums">Asset ID: {asset.asset_tag}</div>
                    </div>

                    {/* What is the problem? Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            What is the problem? *
                        </label>
                        <select
                            value={failureType}
                            onChange={(e) => setFailureType(e.target.value)}
                            required
                            className="w-full min-h-[44px] bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-base sm:text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                        >
                            <option value="MECHANICAL">Mechanical Failure</option>
                            <option value="ELECTRICAL">Electrical / Power Issue</option>
                            <option value="SOFTWARE">Software / Firmware Glitch</option>
                            <option value="CALIBRATION">Calibration Drift</option>
                            <option value="USER_ERROR">Operational / User Error</option>
                            <option value="OTHER">Other Issue</option>
                        </select>
                    </div>

                    {/* How serious is it? Dropdown with one-line hints */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            How serious is it? *
                        </label>
                        <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                            required
                            className="w-full min-h-[44px] bg-panel border border-border-strong text-text-primary rounded px-3 py-2 text-base sm:text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                        >
                            <option value="HIGH">High: equipment cannot be used</option>
                            <option value="CRITICAL">Critical: immediate danger or complete shutdown</option>
                            <option value="MEDIUM">Medium: partial failure / equipment usable with limits</option>
                            <option value="LOW">Low: minor glitch / cosmetic or non-critical issue</option>
                        </select>
                    </div>

                    {/* Describe what happened (multi-line textarea, 16px min text to prevent phone zoom) */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Describe what happened *
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="e.g., Gas delivery pressure alarm sounded during pre-use test, error code P-03"
                            className="w-full bg-panel border border-border-strong text-text-primary rounded p-3 text-base sm:text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent leading-relaxed"
                        />
                    </div>

                    {/* Reported by and Time reported (Read-only) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border text-xs text-text-secondary">
                        <div>
                            <span className="block font-medium text-text-muted mb-0.5">Reported by</span>
                            <span className="text-text-primary font-medium">{reportedBy}</span>
                        </div>
                        <div>
                            <span className="block font-medium text-text-muted mb-0.5">Time reported</span>
                            <span className="text-text-primary font-medium">{currentTimeString || 'Current time'}</span>
                        </div>
                    </div>

                    {/* Sticky Footer / Submit Target */}
                    <div className="sticky bottom-0 bg-panel border-t border-border pt-3 -mx-4 -mb-4 p-4 sm:static sm:mx-0 sm:mb-0 sm:p-0 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="min-h-[44px] px-4 py-2 border border-border-strong bg-panel hover:bg-table-hover text-text-primary rounded-[4px] text-sm font-medium transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="min-h-[44px] px-5 py-2 bg-status-notready-solid hover:bg-status-notready-text text-white rounded-[4px] text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer shadow-none"
                        >
                            {submitting ? 'Submitting incident...' : 'Submit incident'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
