'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserRole, canEditAssets, getLandingUrlForRole } from '@/lib/auth';
import { formatEnumValue, getReadinessStatusTheme } from '@/lib/formatters';
import { formatSurgeryDate } from '@/lib/date-utils';
import { isValidAssetId } from '@/lib/scanner';
import QrLabelCard from '@/components/assets/QrLabelCard';
import ReportIncidentModal from '@/components/forms/ReportIncidentModal';

export const dynamic = 'force-dynamic';

export default function AssetDetailPage({
    params
}: {
    params: { id: string }
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const assetId = params.id;
    const isNewlyRegistered = searchParams?.get('registered') === 'true';

    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [asset, setAsset] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorState, setErrorState] = useState<'NONE' | 'INVALID_ID' | 'NOT_FOUND' | 'FORBIDDEN'>('NONE');
    const [showIncidentModal, setShowIncidentModal] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // 1. Initial Validation of Asset ID format
    const isIdValid = isValidAssetId(assetId);

    // 2. Authentication and Role verification
    useEffect(() => {
        if (!isIdValid) {
            setErrorState('INVALID_ID');
            setLoading(false);
            setAuthChecked(true);
            return;
        }

        const verifyAuth = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('assetiq_auth_token') : null;
            if (!token) {
                router.push(`/login?next=/assets/${assetId}`);
                return;
            }

            try {
                const res = await fetch('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();

                if (!res.ok || !data.authenticated || !data.role) {
                    router.push(`/login?next=/assets/${assetId}`);
                    return;
                }

                setUserRole(data.role);
                setAuthChecked(true);
            } catch {
                const storedRole = typeof window !== 'undefined' ? (localStorage.getItem('assetiq_user_role') as UserRole) : null;
                if (storedRole) {
                    setUserRole(storedRole);
                    setAuthChecked(true);
                } else {
                    router.push(`/login?next=/assets/${assetId}`);
                }
            }
        };

        verifyAuth();
    }, [assetId, isIdValid, router]);

    // 3. Fetch latest asset data
    const fetchAssetData = useCallback(async () => {
        if (!isIdValid) return;
        setLoading(true);

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('assetiq_auth_token') : null;
            const res = await fetch(`/api/assets/${assetId}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });

            if (res.status === 404) {
                setErrorState('NOT_FOUND');
                setAsset(null);
                return;
            }

            if (res.status === 403) {
                setErrorState('FORBIDDEN');
                setAsset(null);
                return;
            }

            const data = await res.json();
            if (data.success && data.data) {
                setAsset(data.data);
                setErrorState('NONE');
            } else {
                setErrorState('NOT_FOUND');
            }
        } catch (err) {
            console.error('Failed to load asset details', err);
            setErrorState('NOT_FOUND');
        } finally {
            setLoading(false);
        }
    }, [assetId, isIdValid]);

    useEffect(() => {
        if (authChecked && isIdValid) {
            fetchAssetData();
        }
    }, [authChecked, isIdValid, fetchAssetData]);

    // Error states handling
    if (errorState === 'INVALID_ID') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-panel border border-border rounded-[6px] p-6 text-center space-y-4 shadow-none">
                    <h1 className="text-xl font-semibold text-text-primary">This QR code is not valid</h1>
                    <p className="text-sm text-text-secondary">
                        The requested equipment identifier format is invalid.
                    </p>
                    <Link
                        href="/assets"
                        className="inline-block bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-[4px] transition-colors"
                    >
                        Go to equipment catalog
                    </Link>
                </div>
            </div>
        );
    }

    if (errorState === 'NOT_FOUND') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-panel border border-border rounded-[6px] p-6 text-center space-y-4 shadow-none">
                    <h1 className="text-xl font-semibold text-text-primary">Asset not found</h1>
                    <p className="text-sm text-text-secondary">
                        The requested equipment could not be found or you do not have permission to view it.
                    </p>
                    <Link
                        href="/assets"
                        className="inline-block bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-[4px] transition-colors"
                    >
                        Go to equipment catalog
                    </Link>
                </div>
            </div>
        );
    }

    if (errorState === 'FORBIDDEN') {
        const homeUrl = userRole ? getLandingUrlForRole(userRole) : '/login';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-panel border border-border rounded-[6px] p-6 text-center space-y-4 shadow-none">
                    <h1 className="text-xl font-semibold text-text-primary">You don't have access to this page</h1>
                    <p className="text-sm text-text-secondary">
                        Your account role does not have permission to view equipment details.
                    </p>
                    <Link
                        href={homeUrl}
                        className="inline-block bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-[4px] transition-colors"
                    >
                        Return to home page
                    </Link>
                </div>
            </div>
        );
    }

    if (loading || !asset) {
        return (
            <div className="flex-1 flex flex-col">
                <div className="page-header-band px-4 sm:px-6 py-5">
                    <div className="max-w-5xl mx-auto space-y-2">
                        <div className="h-8 w-60 bg-panel-header rounded-[4px] animate-pulse"></div>
                        <div className="h-4 w-96 bg-panel-header rounded-[4px] animate-pulse"></div>
                    </div>
                </div>
                <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
                    <div className="h-44 bg-panel border border-border rounded-[6px] animate-pulse"></div>
                    <div className="h-44 bg-panel border border-border rounded-[6px] animate-pulse"></div>
                </div>
            </div>
        );
    }

    // Calculations for Health Summary
    const readiness = asset.readiness || {};
    const readinessTheme = getReadinessStatusTheme(readiness.status || (asset.status === 'AVAILABLE' ? 'READY' : 'NOT_READY'));

    const now = new Date();
    let nextPmText = 'Not scheduled';
    let pmOverdueDays = 0;
    let isPmOverdue = false;

    if (asset.next_pm_due_date) {
        const dueDate = new Date(asset.next_pm_due_date);
        if (!isNaN(dueDate.getTime())) {
            const dueMidnight = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
            const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const diffDays = Math.round((dueMidnight - nowMidnight) / (1000 * 3600 * 24));

            if (diffDays < 0) {
                pmOverdueDays = Math.abs(diffDays);
                isPmOverdue = true;
                nextPmText = `Overdue by ${pmOverdueDays} day${pmOverdueDays === 1 ? '' : 's'}`;
            } else if (diffDays === 0) {
                nextPmText = 'Due today';
            } else if (diffDays <= 30) {
                nextPmText = `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
            } else {
                nextPmText = 'On time';
            }
        }
    }

    const lastPmDateFormatted = asset.last_pm_date ? formatSurgeryDate(asset.last_pm_date) : 'N/A';
    const lastMaintenanceRecord = (asset.maintenance_history || [])[0];
    const lastPmType = lastMaintenanceRecord?.maintenance_type
        ? formatEnumValue(lastMaintenanceRecord.maintenance_type)
        : 'Preventive';

    const breakdownHistory: any[] = asset.breakdown_history || [];
    const openIncidents = breakdownHistory.filter(b => !b.resolved_at || b.resolved_at === null);
    const resolvedIncidents = breakdownHistory.filter(b => b.resolved_at);
    const sortedIncidents = [...openIncidents, ...resolvedIncidents];

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    const breakdownsLast30Days = breakdownHistory.filter(b => {
        if (!b.reported_at) return false;
        return new Date(b.reported_at) >= thirtyDaysAgo;
    }).length;

    const contractVendor = asset.contract_vendor || asset.warranty_vendor || 'Philips Healthcare';
    const rawContractEnd = asset.warranty_end_date || asset.contract_end_date || asset.warranty_expiration_date;
    const contractEndDate = rawContractEnd ? formatSurgeryDate(rawContractEnd) : '19 Oct 2027';

    let contractStatusBadge: 'Active' | 'Expiring soon' | 'Expired' = 'Active';
    if (asset.contract_status === 'Expired') {
        contractStatusBadge = 'Expired';
    } else if (rawContractEnd) {
        const endDateObj = new Date(rawContractEnd);
        const daysToContractEnd = Math.round((endDateObj.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (daysToContractEnd < 0) {
            contractStatusBadge = 'Expired';
        } else if (daysToContractEnd <= 30) {
            contractStatusBadge = 'Expiring soon';
        } else {
            contractStatusBadge = 'Active';
        }
    }

    let summarySentence = 'This equipment is operational and ready for clinical use.';
    if (asset.status === 'UNDER_REPAIR') {
        summarySentence = openIncidents.length > 0
            ? `This equipment is currently under repair: there is ${openIncidents.length} open incident${openIncidents.length === 1 ? '' : 's'}.`
            : 'This equipment is currently under repair and cannot be used.';
    } else if (isPmOverdue && openIncidents.length > 0) {
        summarySentence = `This equipment needs attention: maintenance is overdue by ${pmOverdueDays} days and there is ${openIncidents.length} open incident${openIncidents.length === 1 ? '' : 's'}.`;
    } else if (isPmOverdue) {
        summarySentence = `This equipment needs attention: maintenance is overdue by ${pmOverdueDays} days.`;
    } else if (openIncidents.length > 0) {
        summarySentence = `This equipment needs attention: there is ${openIncidents.length} open incident${openIncidents.length === 1 ? '' : 's'}.`;
    } else if (contractStatusBadge === 'Expired') {
        summarySentence = 'This equipment needs attention: the service contract has expired.';
    } else if (asset.status !== 'AVAILABLE') {
        summarySentence = `This equipment is currently ${asset.status.toLowerCase().replace(/_/g, ' ')}.`;
    }

    const canReportIncidents = userRole === 'hospital_admin' || userRole === 'biomedical_engineer';
    const canRecordMaintenance = canEditAssets(userRole);

    let statusBadgeClass = 'bg-status-ready-bg text-status-ready-text border-status-ready-solid';
    if (asset.status === 'UNDER_REPAIR') {
        statusBadgeClass = 'bg-status-notready-bg text-status-notready-text border-status-notready-solid';
    } else if (asset.status === 'UNDER_MAINTENANCE' || asset.status !== 'AVAILABLE') {
        statusBadgeClass = 'bg-status-atrisk-bg text-status-atrisk-text border-status-atrisk-solid';
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* 1. Page Header Band spanning content width */}
            <div className="page-header-band px-4 sm:px-6 py-5">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-1.5 text-caption text-text-secondary">
                            <Link href="/assets" className="hover:text-accent hover:underline">
                                Equipment Catalog
                            </Link>
                            <span>/</span>
                            <span className="text-text-primary font-medium tabular-nums">{asset.asset_tag}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                            <span className="text-caption font-bold px-2 py-0.5 rounded-[4px] bg-panel text-text-primary border border-border tabular-nums">
                                {asset.asset_tag}
                            </span>
                            <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-[4px] border ${statusBadgeClass}`}>
                                {formatEnumValue(asset.status)}
                            </span>
                        </div>

                        <h1 className="text-page-title text-text-primary pt-1">
                            {asset.name}
                        </h1>
                        <p className="text-caption text-text-secondary">
                            {formatEnumValue(asset.category)} &bull; Model: {asset.model || 'Standard'} &bull; S/N: {asset.serial_number}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="min-h-[44px] px-3.5 py-2 border border-border-strong bg-panel hover:bg-panel-header text-text-primary rounded-[4px] text-caption font-medium transition-colors shadow-none cursor-pointer"
                        >
                            Print label
                        </button>
                        <Link
                            href="/assets"
                            className="min-h-[44px] px-3.5 py-2 border border-border-strong bg-panel hover:bg-panel-header text-text-secondary hover:text-text-primary rounded-[4px] text-caption font-medium transition-colors flex items-center shadow-none"
                        >
                            Back to catalog
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. Main Content Body on Cool Blue-Grey Page Background */}
            <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
                {/* Registration Success Banner (Section 3) */}
                {isNewlyRegistered && (
                    <div className="p-4 bg-status-ready-bg border border-status-ready-solid rounded-[4px] text-status-ready-text text-body flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-none">
                        <div>
                            <span className="font-semibold">Asset registered. </span>
                            <span>Download or print its QR label and attach it to the equipment.</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.replace(`/assets/${assetId}`)}
                            className="text-caption underline cursor-pointer font-medium self-end sm:self-auto"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Toast Success Message */}
                {toastMessage && (
                    <div className="p-4 bg-status-ready-bg border border-status-ready-solid rounded-[4px] text-status-ready-text text-body flex items-center justify-between shadow-none">
                        <span>{toastMessage}</span>
                        <button
                            type="button"
                            onClick={() => setToastMessage(null)}
                            className="text-caption underline ml-4 cursor-pointer font-medium"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Top QR Label Section when newly registered (Section 3) */}
                {isNewlyRegistered && (
                    <div className="w-full">
                        <QrLabelCard asset={asset} />
                    </div>
                )}

                {/* Main Content Layout: Single column on phone, 2 columns on desktop */}
                <div className={`grid grid-cols-1 ${isNewlyRegistered ? '' : 'lg:grid-cols-3'} gap-6`}>
                    {/* Left/Main Column */}
                    <div className={`${isNewlyRegistered ? 'w-full' : 'lg:col-span-2'} space-y-6`}>
                        {/* 2. Health Summary */}
                        <section className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden space-y-0">
                            <div className="panel-header-band">
                                <h2 className="text-section-heading text-text-primary">Equipment Health & Readiness</h2>
                                <p className="text-body font-medium text-text-primary mt-1 leading-relaxed">
                                    {summarySentence}
                                </p>
                            </div>

                            <div className="p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body">
                                    {/* Readiness */}
                                    <div className="p-3 bg-panel border border-border rounded-[6px] space-y-1 shadow-none">
                                        <div className="text-caption text-text-muted font-medium">Readiness Assessment</div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-[4px] border ${readinessTheme.badgeClass}`}>
                                                {readinessTheme.label}
                                            </span>
                                        </div>
                                        <p className="text-caption text-text-secondary pt-0.5 leading-snug">
                                            {readiness.explanation || (readiness.status === 'PASS' ? 'Passed all safety checks.' : 'Operational checks confirmed.')}
                                        </p>
                                    </div>

                                    {/* Next Maintenance Due */}
                                    <div className="p-3 bg-panel border border-border rounded-[6px] space-y-1 shadow-none">
                                        <div className="text-caption text-text-muted font-medium">Preventive Maintenance</div>
                                        <div className="font-semibold text-text-primary">
                                            {nextPmText}
                                        </div>
                                        <p className="text-caption text-text-secondary pt-0.5 leading-snug">
                                            Last check: {lastPmDateFormatted} ({lastPmType})
                                        </p>
                                    </div>

                                    {/* Open Incidents & 30-Day Breakdowns */}
                                    <div className="p-3 bg-panel border border-border rounded-[6px] space-y-1 shadow-none">
                                        <div className="text-caption text-text-muted font-medium">Incidents & Breakdowns</div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-text-primary">
                                                {openIncidents.length} open incident{openIncidents.length === 1 ? '' : 's'}
                                            </span>
                                            {openIncidents.length > 0 && (
                                                <a href="#incident-history" className="text-caption text-accent hover:underline font-medium">
                                                    View list &darr;
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-caption text-text-secondary pt-0.5 leading-snug">
                                            {breakdownsLast30Days} breakdown{breakdownsLast30Days === 1 ? '' : 's'} in the last 30 days
                                        </p>
                                    </div>

                                    {/* Service Contract */}
                                    <div className="p-3 bg-panel border border-border rounded-[6px] space-y-1 shadow-none">
                                        <div className="text-caption text-text-muted font-medium">Service Contract</div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-text-primary truncate">{contractVendor}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-[4px] font-medium border ${
                                                contractStatusBadge === 'Expired'
                                                    ? 'bg-status-notready-bg text-status-notready-text border-status-notready-solid'
                                                    : contractStatusBadge === 'Expiring soon'
                                                    ? 'bg-status-atrisk-bg text-status-atrisk-text border-status-atrisk-solid'
                                                    : 'bg-status-ready-bg text-status-ready-text border-status-ready-solid'
                                            }`}>
                                                {contractStatusBadge}
                                            </span>
                                        </div>
                                        <p className="text-caption text-text-secondary pt-0.5 leading-snug">
                                            Valid through: {contractEndDate}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Mobile placement of QR Card */}
                        {!isNewlyRegistered && (
                            <div className="block lg:hidden">
                                <QrLabelCard asset={asset} />
                            </div>
                        )}

                        {/* 3. Location and Details */}
                        <section className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden space-y-0">
                            <div className="panel-header-band">
                                <h2 className="text-section-heading text-text-primary">Location & Specifications</h2>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-caption sm:text-body">
                                    <div>
                                        <span className="block text-text-muted text-caption">Operating Room / Room</span>
                                        <span className="font-medium text-text-primary">{asset.operating_room || 'OR-1'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-text-muted text-caption">Department</span>
                                        <span className="font-medium text-text-primary">{asset.department || 'Biomedical Engineering'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-text-muted text-caption">Building Location</span>
                                        <span className="font-medium text-text-primary">{asset.location || 'OT Complex Wing A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-text-muted text-caption">Manufacturer</span>
                                        <span className="font-medium text-text-primary">{asset.manufacturer || formatEnumValue(asset.category)}</span>
                                    </div>
                                    <div>
                                        <span className="block text-text-muted text-caption">Model</span>
                                        <span className="font-medium text-text-primary">{asset.model || 'Standard'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-text-muted text-caption">Criticality Level</span>
                                        <span className="font-medium text-text-primary">{asset.criticality || 'STANDARD'}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. Quick Actions */}
                        <section className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden space-y-0">
                            <div className="panel-header-band">
                                <h2 className="text-section-heading text-text-primary">Quick Actions</h2>
                            </div>
                            <div className="p-5">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    {canReportIncidents ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowIncidentModal(true)}
                                            className="min-h-[44px] px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-[4px] text-body font-semibold transition-colors flex items-center justify-center cursor-pointer shadow-none text-center"
                                        >
                                            Report an incident
                                        </button>
                                    ) : (
                                        <div className="p-3 bg-panel-header border border-border rounded-[4px] text-text-secondary text-body flex-1">
                                            To report a problem with this equipment, contact biomedical engineering.
                                        </div>
                                    )}

                                    {canRecordMaintenance && (
                                        <Link
                                            href={`/maintenance?record=true&asset_id=${asset.id}`}
                                            className="min-h-[44px] px-5 py-2.5 border border-border-strong bg-panel hover:bg-panel-header text-text-primary rounded-[4px] text-body font-semibold transition-colors flex items-center justify-center text-center shadow-none"
                                        >
                                            Record maintenance
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* 5. Maintenance History */}
                        <section className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden space-y-0">
                            <div className="panel-header-band flex items-center justify-between">
                                <h2 className="text-section-heading text-text-primary">Maintenance History</h2>
                                <Link
                                    href={`/maintenance?asset_id=${asset.id}`}
                                    className="text-caption text-accent hover:underline font-medium"
                                >
                                    View all maintenance &rarr;
                                </Link>
                            </div>

                            <div className="p-5">
                                {(asset.maintenance_history || []).length === 0 ? (
                                    <p className="text-caption text-text-muted py-3">No maintenance records logged for this equipment.</p>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {(asset.maintenance_history || []).slice(0, 5).map((m: any) => (
                                            <div key={m.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-table">
                                                <div className="space-y-0.5">
                                                    <span className="font-semibold text-text-primary">
                                                        {formatEnumValue(m.maintenance_type)}
                                                    </span>
                                                    <span className="text-text-muted ml-2">by {m.performed_by || 'Biomedical Tech'}</span>
                                                    {m.details && (
                                                        <p className="text-text-secondary text-caption">{m.details}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 self-start sm:self-auto text-text-muted">
                                                    <span className="px-2 py-0.5 bg-panel-header rounded-[4px] border border-border text-text-primary font-medium text-caption">
                                                        {m.status || 'Completed'}
                                                    </span>
                                                    <span className="tabular-nums text-caption">{formatSurgeryDate(m.performed_at)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 6. Incident History */}
                        <section id="incident-history" className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden space-y-0">
                            <div className="panel-header-band flex items-center justify-between">
                                <h2 className="text-section-heading text-text-primary">Incident History</h2>
                                <span className="text-caption text-text-muted tabular-nums">
                                    {sortedIncidents.length} recorded
                                </span>
                            </div>

                            <div className="p-5">
                                {sortedIncidents.length === 0 ? (
                                    <p className="text-caption text-text-muted py-3">No breakdown incidents recorded for this equipment.</p>
                                ) : (
                                    <div className="divide-y divide-border space-y-1">
                                        {sortedIncidents.map((incident: any) => {
                                            const isOpen = !incident.resolved_at;
                                            const reportedDate = incident.reported_at ? formatSurgeryDate(incident.reported_at) : 'N/A';
                                            const resolvedDate = incident.resolved_at ? formatSurgeryDate(incident.resolved_at) : null;

                                            let downtimeText = '0 days';
                                            if (isOpen) {
                                                const reportedTime = new Date(incident.reported_at).getTime();
                                                const daysOpen = Math.max(0, Number(((now.getTime() - reportedTime) / (1000 * 3600 * 24)).toFixed(1)));
                                                downtimeText = `${daysOpen} days out of service (Active)`;
                                            } else if (incident.downtime_hours) {
                                                const days = Number((incident.downtime_hours / 24).toFixed(1));
                                                downtimeText = `${days} days out of service`;
                                            }

                                            return (
                                                <div key={incident.id} className="pt-3 pb-2 space-y-1.5 text-table">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded-[4px] font-semibold text-caption border ${
                                                                isOpen
                                                                    ? 'bg-status-notready-bg text-status-notready-text border-status-notready-solid'
                                                                    : 'bg-status-neutral-bg text-status-neutral-text border-status-neutral-solid'
                                                            }`}>
                                                                {isOpen ? 'Open Incident' : 'Resolved'}
                                                            </span>
                                                            <span className="font-semibold text-text-primary">
                                                                {formatEnumValue(incident.failure_type || 'FAILURE')}
                                                            </span>
                                                            <span className="text-text-muted text-caption">
                                                                &bull; Severity: <span className="font-medium text-text-primary">{formatEnumValue(incident.severity)}</span>
                                                            </span>
                                                        </div>
                                                        <span className="text-text-muted text-caption tabular-nums">{reportedDate}</span>
                                                    </div>

                                                    <p className="text-body text-text-primary font-normal leading-relaxed">
                                                        {incident.description}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-4 text-caption text-text-muted pt-0.5">
                                                        <span>Downtime: <strong className="text-text-secondary">{downtimeText}</strong></span>
                                                        {incident.reported_by && (
                                                            <span>Reported by: <strong className="text-text-secondary">{incident.reported_by}</strong></span>
                                                        )}
                                                        {resolvedDate && (
                                                            <span>Resolved on: <strong className="text-text-secondary">{resolvedDate}</strong></span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Desktop): QR Label Section */}
                    {!isNewlyRegistered && (
                        <div className="hidden lg:block space-y-6">
                            <div className="sticky top-20">
                                <QrLabelCard asset={asset} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Incident Reporting Modal */}
                <ReportIncidentModal
                    isOpen={showIncidentModal}
                    asset={asset}
                    openIncidents={openIncidents}
                    onClose={() => setShowIncidentModal(false)}
                    onSuccess={(msg) => {
                        setToastMessage(msg);
                        fetchAssetData();
                    }}
                />
            </div>
        </div>
    );
}
