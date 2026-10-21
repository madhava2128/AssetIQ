'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, canEditSurgeries } from '@/lib/auth';
import SurgeryCalendar, { CalendarViewMode } from '@/components/surgeries/SurgeryCalendar';
import SurgeryDetailPanel from '@/components/surgeries/SurgeryDetailPanel';
import SurgeryForm from '@/components/forms/SurgeryForm';
import { formatSurgeryDate, formatSurgeryTimeRange } from '@/lib/date-utils';
import { formatEnumValue, getReadinessStatusTheme } from '@/lib/formatters';
import { useAutoRefresh } from '@/lib/use-auto-refresh';

export default function SurgeriesPage() {
    const [userRole, setUserRole] = useState<UserRole>('ot_admin');
    const [surgeries, setSurgeries] = useState<any[]>([]);
    const [allAssets, setAllAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // View Mode & Calendar Controls
    const [pageView, setPageView] = useState<'calendar' | 'list'>('calendar');
    const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>('month');
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    // Filters
    const [orFilter, setOrFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [readinessFilter, setReadinessFilter] = useState('');

    // Modals / Panels State
    const [selectedSurgery, setSelectedSurgery] = useState<any | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingSurgery, setEditingSurgery] = useState<any | null>(null);
    const [prefilledSlot, setPrefilledSlot] = useState<{ date: string; time: string; or?: string } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch user session & role
    useEffect(() => {
        const fetchRole = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('assetiq_auth_token') : null;
                const res = await fetch('/api/auth/me', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                const data = await res.json();
                if (data.authenticated && data.role) {
                    setUserRole(data.role);
                } else if (typeof window !== 'undefined') {
                    const storedRole = localStorage.getItem('assetiq_user_role') as UserRole;
                    if (storedRole) setUserRole(storedRole);
                }
            } catch {
                if (typeof window !== 'undefined') {
                    const storedRole = localStorage.getItem('assetiq_user_role') as UserRole;
                    if (storedRole) setUserRole(storedRole);
                }
            }
        };
        fetchRole();
    }, []);

    const canEdit = canEditSurgeries(userRole);

    // Fetch all surgeries and assets
    const fetchSurgeriesAndAssets = async () => {
        setLoading(true);
        try {
            const [surgRes, assetRes] = await Promise.all([
                fetch('/api/surgeries', { cache: 'no-store' }),
                fetch('/api/assets', { cache: 'no-store' })
            ]);

            const surgData = await surgRes.json();
            const assetData = await assetRes.json();

            if (assetData.success) {
                setAllAssets(assetData.data || []);
            }

            if (surgData.success) {
                // Enrich surgeries with readiness status
                const enriched = await Promise.all((surgData.data || []).map(async (s: any) => {
                    if (s.readiness_checked === false) {
                        return {
                            ...s,
                            readiness_status: 'NOT_CHECKED',
                            worst_rule_fired: null
                        };
                    }

                    try {
                        const rRes = await fetch(`/api/readiness?surgery_id=${s.id}`, { cache: 'no-store' });
                        const rData = await rRes.json();
                        if (rData.success && rData.assessment) {
                            return {
                                ...s,
                                readiness_status: rData.assessment.final_status,
                                worst_rule_fired: rData.assessment.worst_rule_fired
                            };
                        }
                    } catch (e) {
                        console.error('Failed to fetch readiness for surgery', s.id, e);
                    }
                    return {
                        ...s,
                        readiness_status: s.readiness_status || 'NOT_CHECKED'
                    };
                }));
                setSurgeries(enriched);
            }
        } catch (err) {
            console.error('Failed to load surgeries:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSurgeriesAndAssets();
    }, []);

    // Auto-refresh every 60s and on window focus
    useAutoRefresh(fetchSurgeriesAndAssets, 60000);

    // Filter Logic
    const filteredSurgeries = useMemo(() => {
        return surgeries.filter((s) => {
            if (orFilter && s.operating_room !== orFilter) return false;
            if (deptFilter && s.department !== deptFilter) return false;
            if (typeFilter && s.surgery_type !== typeFilter) return false;
            if (statusFilter) {
                if (statusFilter === 'HIDE_CANCELLED' && s.status === 'CANCELLED') return false;
                if (statusFilter !== 'HIDE_CANCELLED' && s.status !== statusFilter) return false;
            }
            if (readinessFilter) {
                const st = (s.readiness_status || s.final_status || 'NOT_CHECKED').toUpperCase();
                if (st !== readinessFilter) return false;
            }
            return true;
        });
    }, [surgeries, orFilter, deptFilter, typeFilter, statusFilter, readinessFilter]);

    // Active filters flag
    const hasActiveFilters = Boolean(orFilter || deptFilter || typeFilter || statusFilter || readinessFilter);

    const handleClearFilters = () => {
        setOrFilter('');
        setDeptFilter('');
        setTypeFilter('');
        setStatusFilter('');
        setReadinessFilter('');
    };

    // Calculate Week Summary Metrics
    const { thisWeekSurgeries, weekReady, weekAtRisk, weekNotReady } = useMemo(() => {
        const today = new Date('2026-10-19T00:00:00+05:30');
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const list = surgeries.filter(s => {
            if (!s.scheduled_start_time || s.status === 'CANCELLED') return false;
            const d = new Date(s.scheduled_start_time);
            return d >= startOfWeek && d <= endOfWeek;
        });

        let r = 0, ar = 0, nr = 0;
        list.forEach(s => {
            const st = (s.readiness_status || s.final_status || 'NOT_CHECKED').toUpperCase();
            if (st === 'READY') r++;
            else if (st === 'AT_RISK') ar++;
            else if (st === 'NOT_READY') nr++;
        });

        return {
            thisWeekSurgeries: list,
            weekReady: r,
            weekAtRisk: ar,
            weekNotReady: nr
        };
    }, [surgeries]);

    // Save Surgery (Create / Edit) Action
    const handleSaveSurgery = async (formData: any) => {
        if (!canEdit) {
            const err = 'You do not have permission to edit surgeries.';
            setErrorMessage(err);
            throw new Error(err);
        }

        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            let res;
            if (editingSurgery) {
                res = await fetch(`/api/surgeries/${editingSurgery.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('assetiq_auth_token')}`
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                res = await fetch('/api/surgeries', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('assetiq_auth_token')}`
                    },
                    body: JSON.stringify(formData)
                });
            }

            const data = await res.json();
            if (!res.ok || !data.success || !data.data) {
                const errText = data?.error || 'Could not save surgery. Please try again.';
                setErrorMessage(errText);
                throw new Error(errText);
            }

            const created = data.data;
            const dateFormatted = formatSurgeryDate(created.scheduled_start_time);
            const timeFormatted = formatSurgeryTimeRange(created.scheduled_start_time, created.scheduled_end_time);
            const actionWord = editingSurgery ? 'updated' : 'scheduled';
            setSuccessMessage(`Surgery ${actionWord}: ${created.procedure_name} on ${dateFormatted} at ${timeFormatted} in ${created.operating_room}.`);

            setShowForm(false);
            setEditingSurgery(null);
            setPrefilledSlot(null);
            await fetchSurgeriesAndAssets();
        } catch (err: any) {
            setErrorMessage(err.message || 'Failed to save surgery.');
            throw err;
        }
    };

    // Cancel Surgery Action
    const handleCancelSurgery = async (id: string) => {
        if (!canEdit) {
            setErrorMessage('You do not have permission to cancel surgeries.');
            return;
        }

        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const res = await fetch(`/api/surgeries/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('assetiq_auth_token')}`
                }
            });

            const data = await res.json();
            if (data.success) {
                setSuccessMessage('Surgery cancelled successfully.');
                await fetchSurgeriesAndAssets();
            } else {
                setErrorMessage(data.error || 'Could not cancel surgery.');
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Could not cancel surgery.');
        }
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* 1. Page Header Band spanning content width */}
            <div className="page-header-band px-4 sm:px-6 py-5">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-page-title text-text-primary">Surgeries</h1>
                        <p className="text-body text-text-secondary mt-0.5">
                            Schedule and track surgical procedures and verify equipment allocation.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        {/* View Switch: Calendar vs List */}
                        <div className="inline-flex rounded-[4px] border border-border-strong bg-panel p-0.5 text-caption shadow-none">
                            <button
                                onClick={() => setPageView('calendar')}
                                className={`px-3 py-1.5 rounded-[3px] font-medium transition-colors cursor-pointer ${
                                    pageView === 'calendar'
                                        ? 'bg-page-header text-accent font-semibold border border-border'
                                        : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                Calendar
                            </button>
                            <button
                                onClick={() => setPageView('list')}
                                className={`px-3 py-1.5 rounded-[3px] font-medium transition-colors cursor-pointer ${
                                    pageView === 'list'
                                        ? 'bg-page-header text-accent font-semibold border border-border'
                                        : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                List
                            </button>
                        </div>

                        {/* Add Surgery Button */}
                        {canEdit && (
                            <button
                                onClick={() => {
                                    setEditingSurgery(null);
                                    setPrefilledSlot(null);
                                    setShowForm(true);
                                    setErrorMessage(null);
                                }}
                                className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-[4px] text-body font-medium transition-colors cursor-pointer shadow-none"
                            >
                                Add surgery
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Main Content Body on Cool Blue-Grey Page Background */}
            <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-5">
                {/* Success Message Banner */}
                {successMessage && (
                    <div className="p-3 bg-status-ready-bg border border-status-ready-solid text-status-ready-text text-caption rounded-[4px] flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs">✓</span>
                            <span>{successMessage}</span>
                        </div>
                        <button onClick={() => setSuccessMessage(null)} className="text-caption underline text-status-ready-text ml-4 cursor-pointer">
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Error Message Banner */}
                {errorMessage && (
                    <div className="p-3 bg-status-notready-bg border border-status-notready-solid text-status-notready-text text-caption rounded-[4px] flex justify-between items-center">
                        <span>{errorMessage}</span>
                        <button onClick={() => setErrorMessage(null)} className="text-caption underline text-status-notready-text ml-4 cursor-pointer">
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Form Modal / Inline Section */}
                {showForm && (
                    <div className="border border-border rounded-[6px] overflow-hidden bg-panel shadow-none">
                        <SurgeryForm
                            initialData={editingSurgery}
                            allSurgeries={surgeries}
                            allAssets={allAssets}
                            prefilledDate={prefilledSlot?.date}
                            prefilledTime={prefilledSlot?.time}
                            prefilledOr={prefilledSlot?.or}
                            onSubmit={handleSaveSurgery}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingSurgery(null);
                                setPrefilledSlot(null);
                                setErrorMessage(null);
                            }}
                            externalError={errorMessage}
                        />
                    </div>
                )}

                {/* Filters Row */}
                <div className="bg-panel border border-border rounded-[6px] p-3.5 flex flex-wrap items-center gap-4 text-caption shadow-none">
                    {/* Operating Room */}
                    <div>
                        <label className="block text-text-secondary font-medium mb-1">Operating room</label>
                        <select
                            value={orFilter}
                            onChange={(e) => setOrFilter(e.target.value)}
                            className="bg-panel border border-border-strong text-text-primary rounded-[4px] px-2.5 py-1.5 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                        >
                            <option value="">All Operating Rooms</option>
                            <option value="OR-1">Operating Room 1</option>
                            <option value="OR-2">Operating Room 2</option>
                            <option value="OR-3">Operating Room 3</option>
                            <option value="OR-4">Operating Room 4</option>
                            <option value="OR-5">Operating Room 5</option>
                            <option value="OR-6">Operating Room 6</option>
                        </select>
                    </div>

                    {/* Department */}
                    <div>
                        <label className="block text-text-secondary font-medium mb-1">Department</label>
                        <select
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                            className="bg-panel border border-border-strong text-text-primary rounded-[4px] px-2.5 py-1.5 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                        >
                            <option value="">All Departments</option>
                            <option value="General Surgery">General Surgery</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Cardiothoracic Surgery">Cardiothoracic Surgery</option>
                            <option value="Orthopedics">Orthopedics</option>
                            <option value="Neurosurgery">Neurosurgery</option>
                            <option value="Pediatric Surgery">Pediatric Surgery</option>
                            <option value="Urology">Urology</option>
                            <option value="Vascular Surgery">Vascular Surgery</option>
                        </select>
                    </div>

                    {/* Surgery Type */}
                    <div>
                        <label className="block text-text-secondary font-medium mb-1">Surgery type</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-panel border border-border-strong text-text-primary rounded-[4px] px-2.5 py-1.5 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                        >
                            <option value="">All Surgery Types</option>
                            <option value="LAPAROSCOPIC">Laparoscopic Surgery</option>
                            <option value="CARDIAC">Cardiac Surgery</option>
                            <option value="ORTHOPEDIC">Orthopedic Surgery</option>
                            <option value="NEUROSURGERY">Neurosurgery</option>
                            <option value="GENERAL_SURGERY">General Surgery</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-text-secondary font-medium mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-panel border border-border-strong text-text-primary rounded-[4px] px-2.5 py-1.5 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                        >
                            <option value="">All Statuses</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="HIDE_CANCELLED">Hide Cancelled</option>
                        </select>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="text-accent hover:text-accent-hover underline font-medium cursor-pointer"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>

                {/* One-Line Plain Summary Strip */}
                <div className="bg-panel border border-border rounded-[6px] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-table shadow-none">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-text-primary">This week:</span>
                        <span className="tabular-nums font-medium text-text-primary">{thisWeekSurgeries.length} surgeries</span>
                        <span className="text-text-muted">—</span>
                        <button
                            type="button"
                            onClick={() => setReadinessFilter(readinessFilter === 'READY' ? '' : 'READY')}
                            className={`cursor-pointer hover:underline text-status-ready-text tabular-nums font-medium ${readinessFilter === 'READY' ? 'underline font-bold' : ''}`}
                            title="Filter surgeries marked Ready"
                        >
                            {weekReady} ready
                        </button>
                        <span className="text-text-muted">,</span>
                        <button
                            type="button"
                            onClick={() => setReadinessFilter(readinessFilter === 'AT_RISK' ? '' : 'AT_RISK')}
                            className={`cursor-pointer hover:underline text-status-atrisk-text tabular-nums font-medium ${readinessFilter === 'AT_RISK' ? 'underline font-bold' : ''}`}
                            title="Filter surgeries marked At Risk"
                        >
                            {weekAtRisk} at risk
                        </button>
                        <span className="text-text-muted">,</span>
                        <button
                            type="button"
                            onClick={() => setReadinessFilter(readinessFilter === 'NOT_READY' ? '' : 'NOT_READY')}
                            className={`cursor-pointer hover:underline text-status-notready-text tabular-nums font-medium ${readinessFilter === 'NOT_READY' ? 'underline font-bold' : ''}`}
                            title="Filter surgeries marked Not Ready"
                        >
                            {weekNotReady} not ready
                        </button>
                    </div>

                    {readinessFilter && (
                        <button
                            type="button"
                            onClick={() => setReadinessFilter('')}
                            className="text-accent hover:underline text-caption font-medium cursor-pointer"
                        >
                            Show all statuses &rarr;
                        </button>
                    )}
                </div>

                {/* Main Content: Calendar View vs List View */}
                {loading ? (
                    <div className="p-12 text-center text-text-muted text-body bg-panel border border-border rounded-[6px] shadow-none">
                        Loading surgeries...
                    </div>
                ) : pageView === 'calendar' ? (
                    <SurgeryCalendar
                        surgeries={filteredSurgeries}
                        currentDate={currentDate}
                        viewMode={calendarViewMode}
                        canEdit={canEdit}
                        onViewModeChange={setCalendarViewMode}
                        onDateChange={setCurrentDate}
                        onSelectSurgery={(s) => setSelectedSurgery(s)}
                        onAddSurgeryAtSlot={(slot) => {
                            setPrefilledSlot(slot);
                            setEditingSurgery(null);
                            setShowForm(true);
                            setErrorMessage(null);
                        }}
                    />
                ) : (
                    /* List View Table */
                    <div className="bg-panel border border-border rounded-[6px] overflow-hidden shadow-none">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-table border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-table-header text-caption font-semibold text-text-primary">
                                        <th className="p-3">Surgery code</th>
                                        <th className="p-3">Procedure name</th>
                                        <th className="p-3">Operating room</th>
                                        <th className="p-3">Date & time</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Readiness</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredSurgeries.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-text-muted">
                                                No surgeries match the selected filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSurgeries.map((surgery) => {
                                            const isCancelled = surgery.status === 'CANCELLED';
                                            const rawSt = isCancelled ? 'NOT_CHECKED' : surgery.readiness_status || surgery.final_status;
                                            const theme = getReadinessStatusTheme(rawSt);
                                            const dateStr = formatSurgeryDate(surgery.scheduled_start_time);
                                            const timeRange = formatSurgeryTimeRange(surgery.scheduled_start_time, surgery.scheduled_end_time);

                                            return (
                                                <tr
                                                    key={surgery.id}
                                                    onClick={() => setSelectedSurgery(surgery)}
                                                    className="odd:bg-panel even:bg-table-stripe hover:bg-table-hover cursor-pointer transition-colors"
                                                >
                                                    <td className="p-3 font-medium text-text-primary tabular-nums">
                                                        {surgery.surgery_code}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className={`font-medium ${isCancelled ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                                                            {surgery.procedure_name}
                                                        </div>
                                                        <div className="text-caption text-text-secondary">
                                                            {formatEnumValue(surgery.surgery_type || 'GENERAL_SURGERY')} · {surgery.surgeon_name}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 font-medium text-text-primary">
                                                        {surgery.operating_room}
                                                    </td>
                                                    <td className="p-3 text-caption text-text-primary tabular-nums">
                                                        <div>{dateStr}</div>
                                                        <div className="text-text-secondary">{timeRange}</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`text-caption ${isCancelled ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                                                            {formatEnumValue(surgery.status)}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${theme.badgeClass}`}>
                                                            {theme.label}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => setSelectedSurgery(surgery)}
                                                            className="text-accent hover:text-accent-hover text-caption font-medium cursor-pointer underline"
                                                        >
                                                            View details
                                                        </button>
                                                        {canEdit && !isCancelled && surgery.status !== 'COMPLETED' && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingSurgery(surgery);
                                                                        setShowForm(true);
                                                                        setErrorMessage(null);
                                                                    }}
                                                                    className="border border-border-strong bg-panel hover:bg-panel-header text-text-primary px-2 py-0.5 rounded-[4px] text-caption font-medium transition-colors cursor-pointer"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm('Are you sure you want to cancel this scheduled surgery?')) {
                                                                            handleCancelSurgery(surgery.id);
                                                                        }
                                                                    }}
                                                                    className="border border-status-notready-solid bg-panel text-status-notready-text hover:bg-status-notready-bg px-2 py-0.5 rounded-[4px] text-caption font-medium transition-colors cursor-pointer"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 4. Surgery Detail Slide-Over Panel */}
                {selectedSurgery && (
                    <SurgeryDetailPanel
                        surgery={selectedSurgery}
                        allSurgeries={surgeries}
                        allAssets={allAssets}
                        canEdit={canEdit}
                        onClose={() => setSelectedSurgery(null)}
                        onEdit={(surg) => {
                            setSelectedSurgery(null);
                            setEditingSurgery(surg);
                            setShowForm(true);
                            setErrorMessage(null);
                        }}
                        onCancelSurgery={async (id) => {
                            await handleCancelSurgery(id);
                            setSelectedSurgery(null);
                        }}
                        onChangeEquipment={(surg) => {
                            setSelectedSurgery(null);
                            setEditingSurgery(surg);
                            setShowForm(true);
                            setErrorMessage(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}
