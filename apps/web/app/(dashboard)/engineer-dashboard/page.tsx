'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/auth';
import {
    DateRangeOption,
    filterSurgeriesByDateRange,
    getRangeLabel
} from '@/lib/dashboard-warnings';
import TodaySituationBanner from '@/components/dashboard/TodaySituationBanner';
import NeedsAttentionList from '@/components/dashboard/NeedsAttentionList';
import { formatSurgeryDate } from '@/lib/date-utils';
import { formatEnumValue } from '@/lib/formatters';
import { useAutoRefresh } from '@/lib/use-auto-refresh';

export default function BiomedicalEngineerDashboard() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<UserRole>('biomedical_engineer');
    const [dateRange, setDateRange] = useState<DateRangeOption>('today');
    const [surgeries, setSurgeries] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [breakdowns, setBreakdowns] = useState<any[]>([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastSuccessfulTime, setLastSuccessfulTime] = useState<string>('19 Oct 2026, 11:59 pm');
    const [refreshError, setRefreshError] = useState<string | null>(null);

    // Route guard: Exclusively for biomedical_engineer
    useEffect(() => {
        const fetchServerRole = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('assetiq_auth_token') : null;
                const res = await fetch('/api/auth/me', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                const data = await res.json();
                let currentRole: UserRole = 'biomedical_engineer';

                if (data.authenticated && data.role) {
                    currentRole = data.role;
                } else if (typeof window !== 'undefined') {
                    const storedRole = localStorage.getItem('assetiq_user_role') as UserRole;
                    if (storedRole) currentRole = storedRole;
                }

                if (currentRole === 'hospital_admin') {
                    router.replace('/overview');
                    return;
                }
                if (currentRole === 'ot_admin') {
                    router.replace('/surgeries');
                    return;
                }

                setUserRole(currentRole);
            } catch {
                if (typeof window !== 'undefined') {
                    const storedRole = localStorage.getItem('assetiq_user_role') as UserRole;
                    if (storedRole === 'hospital_admin') {
                        router.replace('/overview');
                        return;
                    }
                    if (storedRole === 'ot_admin') {
                        router.replace('/surgeries');
                        return;
                    }
                }
            }
        };
        fetchServerRole();
    }, [router]);

    // Load and evaluate dashboard data
    const loadDashboardData = useCallback(async (isBackground = false) => {
        if (!isBackground) setRefreshing(true);
        try {
            const [surgeriesRes, assetsRes, breakdownsRes, maintRes] = await Promise.all([
                fetch('/api/surgeries', { cache: 'no-store' }),
                fetch('/api/assets', { cache: 'no-store' }),
                fetch('/api/assets/breakdowns', { cache: 'no-store' }),
                fetch('/api/assets/maintenance', { cache: 'no-store' })
            ]);

            if (!surgeriesRes.ok || !assetsRes.ok) {
                throw new Error('Network error while retrieving operational data');
            }

            const surgeriesData = await surgeriesRes.json();
            const assetsData = await assetsRes.json();
            const breakdownsData = await breakdownsRes.json();
            const maintData = await maintRes.json();

            const surgeryList = surgeriesData.success ? surgeriesData.data : [];
            const assetList = assetsData.success ? assetsData.data : [];
            const breakdownList = breakdownsData.success ? breakdownsData.data : [];
            const maintList = maintData.success ? maintData.data : [];

            // Evaluate readiness for each surgery
            const evaluatedSurgeries = await Promise.all(
                surgeryList.map(async (s: any) => {
                    try {
                        const readinessRes = await fetch(`/api/readiness?surgery_id=${s.id}`, { cache: 'no-store' });
                        const readinessData = await readinessRes.json();
                        if (readinessData.success && readinessData.assessment) {
                            return {
                                ...s,
                                readiness_status: readinessData.assessment.final_status,
                                worst_rule_fired: readinessData.assessment.worst_rule_fired,
                                assessment: readinessData.assessment
                            };
                        }
                    } catch (e) {
                        console.error('Failed to fetch readiness for surgery', s.id, e);
                    }
                    return s;
                })
            );

            setSurgeries(evaluatedSurgeries);
            setAssets(assetList);
            setBreakdowns(breakdownList);
            setMaintenanceRecords(maintList);
            setRefreshError(null);

            // Update timestamp
            const now = new Date();
            const timeStr = now.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }) + ', ' + now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).toLowerCase();
            setLastSuccessfulTime(timeStr);
        } catch (err: any) {
            console.error('Failed to load engineer dashboard data:', err);
            setRefreshError('Could not refresh data. Showing last known state.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData(true);
    }, [loadDashboardData]);

    // Auto-refresh every 60s and on window focus
    useAutoRefresh(loadDashboardData, 60000);

    const filteredSurgeries = useMemo(() => {
        return filterSurgeriesByDateRange(surgeries, dateRange);
    }, [surgeries, dateRange]);

    const rangeLabel = getRangeLabel(dateRange);

    // 1. Maintenance overdue or due soon (within 7 days)
    const maintenanceQueue = useMemo(() => {
        const refDate = new Date('2026-10-19T00:00:00+05:30');
        return assets
            .filter(a => {
                if (a.is_pm_overdue) return true;
                if (!a.next_pm_due_date) return false;
                const dueDate = new Date(a.next_pm_due_date);
                const diffDays = Math.round((dueDate.getTime() - refDate.getTime()) / (24 * 3600 * 1000));
                return diffDays <= 7;
            })
            .map(a => {
                const dueDate = a.next_pm_due_date ? new Date(a.next_pm_due_date) : null;
                const isOverdue = a.is_pm_overdue || (dueDate && dueDate < refDate);
                let timingText = 'Maintenance due';
                if (dueDate) {
                    const diffDays = Math.round((refDate.getTime() - dueDate.getTime()) / (24 * 3600 * 1000));
                    if (diffDays > 0) {
                        timingText = `${diffDays} day${diffDays === 1 ? '' : 's'} overdue (${formatSurgeryDate(a.next_pm_due_date)})`;
                    } else if (diffDays === 0) {
                        timingText = `Due today (${formatSurgeryDate(a.next_pm_due_date)})`;
                    } else {
                        timingText = `Due in ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} (${formatSurgeryDate(a.next_pm_due_date)})`;
                    }
                }
                return {
                    asset: a,
                    timingText,
                    isOverdue
                };
            })
            .sort((a, b) => {
                if (a.isOverdue && !b.isOverdue) return -1;
                if (!a.isOverdue && b.isOverdue) return 1;
                return (a.asset.next_pm_due_date || '').localeCompare(b.asset.next_pm_due_date || '');
            });
    }, [assets]);

    // 2. Open incidents
    const openIncidentsQueue = useMemo(() => {
        const refDate = new Date();
        return breakdowns
            .filter(b => !b.resolved_at)
            .map(b => {
                const asset = assets.find(a => a.id === b.asset_id);
                let daysOpen = 1;
                if (b.reported_at) {
                    const repTime = new Date(b.reported_at).getTime();
                    daysOpen = Math.max(1, Math.floor((refDate.getTime() - repTime) / (24 * 3600 * 1000)));
                }
                return {
                    incident: b,
                    asset,
                    assetName: asset?.name || 'Equipment',
                    assetTag: asset?.asset_tag || '',
                    assetId: b.asset_id,
                    problemDescription: b.description || b.failure_type || 'Malfunction reported',
                    severity: b.severity || 'MEDIUM',
                    daysOpenText: `Open for ${daysOpen} day${daysOpen === 1 ? '' : 's'}`
                };
            })
            .sort((a, b) => {
                const sevOrder: Record<string, number> = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
                const sA = sevOrder[a.severity] || 5;
                const sB = sevOrder[b.severity] || 5;
                if (sA !== sB) return sA - sB;
                return (b.incident.reported_at || '').localeCompare(a.incident.reported_at || '');
            });
    }, [breakdowns, assets]);

    // 3. Service contracts expired or expiring in 30 days
    const contractsQueue = useMemo(() => {
        const refDate = new Date('2026-10-19T00:00:00+05:30');
        return assets
            .filter(a => {
                const endStr = a.warranty_end_date || a.contract_end_date || a.warranty_expiration_date;
                const isExpiredStatus = a.contract_status === 'Expired' || a.contract_expired === true;
                if (isExpiredStatus) return true;
                if (!endStr) return false;
                const endDate = new Date(endStr);
                const diffDays = Math.round((endDate.getTime() - refDate.getTime()) / (24 * 3600 * 1000));
                return diffDays <= 30;
            })
            .map(a => {
                const endStr = a.warranty_end_date || a.contract_end_date || a.warranty_expiration_date;
                let isExpired = a.contract_status === 'Expired' || a.contract_expired === true;
                let timingText = 'Contract expired';
                if (endStr) {
                    const endDate = new Date(endStr);
                    const diffDays = Math.round((refDate.getTime() - endDate.getTime()) / (24 * 3600 * 1000));
                    if (diffDays > 0) {
                        isExpired = true;
                        timingText = `Expired on ${formatSurgeryDate(endStr)}`;
                    } else {
                        timingText = `Expires in ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} (${formatSurgeryDate(endStr)})`;
                    }
                }
                return {
                    asset: a,
                    vendor: a.warranty_vendor || a.contract_vendor || 'Vendor not specified',
                    timingText,
                    isExpired
                };
            })
            .sort((a, b) => {
                if (a.isExpired && !b.isExpired) return -1;
                if (!a.isExpired && b.isExpired) return 1;
                return (a.asset.name || '').localeCompare(b.asset.name || '');
            });
    }, [assets]);

    // Skeleton loading state
    if (loading) {
        return (
            <div className="flex-1 flex flex-col">
                <div className="page-header-band px-4 sm:px-6 py-5">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="h-8 w-48 bg-panel-header rounded-[4px] animate-pulse" />
                            <div className="h-4 w-80 bg-panel-header rounded-[4px] animate-pulse" />
                        </div>
                        <div className="h-9 w-60 bg-panel-header rounded-[4px] animate-pulse" />
                    </div>
                </div>
                <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
                    <div className="h-28 bg-panel border border-border rounded-[6px] animate-pulse" />
                    <div className="h-48 bg-panel border border-border rounded-[6px] animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-44 bg-panel border border-border rounded-[6px] animate-pulse" />
                        <div className="h-44 bg-panel border border-border rounded-[6px] animate-pulse" />
                        <div className="h-44 bg-panel border border-border rounded-[6px] animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* 1. Page Header Band spanning content width */}
            <div className="page-header-band px-4 sm:px-6 py-5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-page-title text-text-primary">Dashboard</h1>
                        <p className="text-body text-text-secondary mt-0.5">
                            What needs your attention across today's surgeries and equipment.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 self-start md:self-auto">
                        {/* Timestamp */}
                        <span className="text-caption text-text-muted tabular-nums">
                            Data as of {lastSuccessfulTime}
                        </span>

                        {/* Refresh Button */}
                        <button
                            type="button"
                            onClick={() => loadDashboardData(false)}
                            disabled={refreshing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-border-strong bg-panel hover:bg-panel-header text-text-primary text-caption font-medium transition-colors cursor-pointer disabled:opacity-60 shadow-none"
                            title="Refresh dashboard data"
                        >
                            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                        </button>

                        {/* Date Range Selector */}
                        <div className="inline-flex rounded-[4px] border border-border-strong bg-panel p-0.5 text-caption font-medium shadow-none">
                            <button
                                type="button"
                                onClick={() => setDateRange('today')}
                                className={`px-3 py-1.5 rounded-[3px] transition-colors cursor-pointer ${
                                    dateRange === 'today'
                                        ? 'bg-page-header text-accent font-semibold border border-border'
                                        : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={() => setDateRange('next7')}
                                className={`px-3 py-1.5 rounded-[3px] transition-colors cursor-pointer ${
                                    dateRange === 'next7'
                                        ? 'bg-page-header text-accent font-semibold border border-border'
                                        : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                Next 7 days
                            </button>
                            <button
                                type="button"
                                onClick={() => setDateRange('month')}
                                className={`px-3 py-1.5 rounded-[3px] transition-colors cursor-pointer ${
                                    dateRange === 'month'
                                        ? 'bg-page-header text-accent font-semibold border border-border'
                                        : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                This month
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Main Content Body on Cool Blue-Grey Page Background */}
            <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
                {/* Refresh Failure Notice */}
                {refreshError && (
                    <div className="p-3 bg-status-atrisk-bg border border-status-atrisk-solid rounded-[4px] text-status-atrisk-text text-body flex items-center justify-between gap-2">
                        <span>{refreshError}</span>
                        <button
                            type="button"
                            onClick={() => setRefreshError(null)}
                            className="text-caption font-semibold underline cursor-pointer"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* 1. Current Situation (Shared Component) */}
                <TodaySituationBanner
                    surgeries={filteredSurgeries}
                    rangeLabel={rangeLabel}
                />

                {/* 2. Needs Attention Now (Shared Component with Engineer Actions) */}
                <NeedsAttentionList
                    surgeries={filteredSurgeries}
                    rangeLabel={rangeLabel}
                    allSurgeries={surgeries}
                    allAssets={assets}
                    breakdowns={breakdowns}
                    userRole={userRole}
                    onIncidentReported={() => loadDashboardData(true)}
                />

                {/* 3. Section 5: Equipment Work Queue */}
                <section className="space-y-4">
                    <div className="border-b border-border pb-2">
                        <h2 className="text-section-heading text-text-primary">
                            Your equipment queue
                        </h2>
                        <p className="text-body text-text-secondary mt-0.5">
                            Equipment problems requiring attention, whether or not a surgery is scheduled soon.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Queue 1: Maintenance overdue or due soon */}
                        <div className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden flex flex-col justify-between">
                            <div className="panel-header-band flex items-center justify-between">
                                <h3 className="text-body font-semibold text-text-primary">
                                    Maintenance overdue or due soon
                                </h3>
                                <span className="text-caption font-semibold px-2 py-0.5 rounded-[4px] bg-panel text-text-secondary border border-border tabular-nums">
                                    {maintenanceQueue.length}
                                </span>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                {maintenanceQueue.length === 0 ? (
                                    <p className="text-body text-text-muted py-6 text-center">
                                        No overdue maintenance.
                                    </p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {maintenanceQueue.slice(0, 5).map(({ asset, isOverdue, timingText }) => (
                                            <div
                                                key={asset.id}
                                                className="bg-panel border border-border hover:border-border-strong rounded-[6px] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-table shadow-none"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-semibold text-text-primary truncate">
                                                        {asset.name}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-caption text-text-secondary">
                                                        <span className="tabular-nums">{asset.asset_tag}</span>
                                                        <span>•</span>
                                                        <span className={isOverdue ? 'text-status-notready-text font-medium' : 'text-text-secondary'}>
                                                            {timingText}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/maintenance?asset_id=${asset.id}&record=true`}
                                                    className="inline-flex items-center justify-center min-h-[44px] px-3 py-1.5 rounded-[4px] text-caption font-medium border border-accent bg-accent text-white hover:bg-accent-hover transition-colors cursor-pointer shrink-0"
                                                >
                                                    Record maintenance
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="border-t border-border pt-2 text-right">
                                    <Link
                                        href="/maintenance"
                                        className="text-caption text-accent hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
                                    >
                                        View all maintenance ({maintenanceQueue.length}) &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Queue 2: Open incidents */}
                        <div className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden flex flex-col justify-between">
                            <div className="panel-header-band flex items-center justify-between">
                                <h3 className="text-body font-semibold text-text-primary">
                                    Open incidents
                                </h3>
                                <span className="text-caption font-semibold px-2 py-0.5 rounded-[4px] bg-status-notready-bg text-status-notready-text border border-status-notready-solid tabular-nums">
                                    {openIncidentsQueue.length}
                                </span>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                {openIncidentsQueue.length === 0 ? (
                                    <p className="text-body text-text-muted py-6 text-center">
                                        No open incidents.
                                    </p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {openIncidentsQueue.slice(0, 5).map(({ incident, assetId, assetName, assetTag, problemDescription, severity, daysOpenText }) => (
                                            <div
                                                key={incident.id}
                                                className="bg-panel border border-border hover:border-border-strong rounded-[6px] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-table shadow-none"
                                            >
                                                <div className="min-w-0 flex-1 space-y-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-text-primary truncate">
                                                            {assetName}
                                                        </span>
                                                        <span className="text-caption bg-panel-header border border-border text-text-muted px-1.5 py-0.5 rounded-[4px] tabular-nums">
                                                            {assetTag}
                                                        </span>
                                                    </div>
                                                    <div className="text-caption text-text-secondary truncate">
                                                        {problemDescription}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-caption">
                                                        <span className="text-status-notready-text font-semibold text-xs">
                                                            {formatEnumValue(severity)}
                                                        </span>
                                                        <span className="text-text-muted">•</span>
                                                        <span className="text-text-secondary font-medium">
                                                            {daysOpenText}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Link
                                                    href={assetId ? `/assets/${assetId}` : '/breakdowns'}
                                                    className="inline-flex items-center justify-center min-h-[44px] px-3 py-1.5 rounded-[4px] text-caption font-medium border border-border-strong bg-panel hover:bg-panel-header text-text-primary transition-colors cursor-pointer shrink-0"
                                                >
                                                    Open incident
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="border-t border-border pt-2 text-right">
                                    <Link
                                        href="/breakdowns"
                                        className="text-caption text-accent hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
                                    >
                                        View all incidents ({openIncidentsQueue.length}) &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Queue 3: Service contracts expired or expiring in 30 days */}
                        <div className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden flex flex-col justify-between">
                            <div className="panel-header-band flex items-center justify-between">
                                <h3 className="text-body font-semibold text-text-primary">
                                    Expiring service contracts
                                </h3>
                                <span className="text-caption font-semibold px-2 py-0.5 rounded-[4px] bg-panel text-text-secondary border border-border tabular-nums">
                                    {contractsQueue.length}
                                </span>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                {contractsQueue.length === 0 ? (
                                    <p className="text-body text-text-muted py-6 text-center">
                                        No expiring service contracts.
                                    </p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {contractsQueue.slice(0, 5).map(({ asset, vendor, timingText, isExpired }) => (
                                            <div
                                                key={asset.id}
                                                className="bg-panel border border-border hover:border-border-strong rounded-[6px] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-table shadow-none"
                                            >
                                                <div className="min-w-0 flex-1 space-y-0.5">
                                                    <div className="font-semibold text-text-primary truncate">
                                                        {asset.name}
                                                    </div>
                                                    <div className="text-caption text-text-secondary truncate">
                                                        {vendor}
                                                    </div>
                                                    <div className={`text-caption font-medium ${isExpired ? 'text-status-atrisk-text' : 'text-text-secondary'}`}>
                                                        {timingText}
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/assets/${asset.id}`}
                                                    className="inline-flex items-center justify-center min-h-[44px] px-3 py-1.5 rounded-[4px] text-caption font-medium border border-border-strong bg-panel hover:bg-panel-header text-text-primary transition-colors cursor-pointer shrink-0"
                                                >
                                                    Open equipment
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="border-t border-border pt-2 text-right">
                                    <Link
                                        href="/assets"
                                        className="text-caption text-accent hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
                                    >
                                        View all assets ({contractsQueue.length}) &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
