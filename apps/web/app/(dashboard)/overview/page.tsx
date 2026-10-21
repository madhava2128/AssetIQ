'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, canUserEdit } from '@/lib/auth';

// Story Blocks
import TodaySituationBanner from '@/components/dashboard/TodaySituationBanner';
import NeedsAttentionList from '@/components/dashboard/NeedsAttentionList';
import HospitalAnalyticsTelemetrySection from '@/components/dashboard/HospitalAnalyticsTelemetrySection';
import DecisionExplanationPanel from '@/components/dashboard/DecisionExplanationPanel';

// Supporting Charts
import EquipmentStatusDistributionChart from '@/components/dashboard/EquipmentStatusDistributionChart';
import PmComplianceChart from '@/components/dashboard/PmComplianceChart';
import EquipmentRiskChart from '@/components/dashboard/EquipmentRiskChart';
import BreakdownTrendsChart from '@/components/dashboard/BreakdownTrendsChart';
import DowntimeChart from '@/components/dashboard/DowntimeChart';
import AssetUtilizationChart from '@/components/dashboard/AssetUtilizationChart';
import DepartmentReadinessChart from '@/components/dashboard/DepartmentReadinessChart';
import CapexOpexChart from '@/components/dashboard/CapexOpexChart';

// More Details Blocks
import ClinicalManifestView from '@/components/dashboard/ClinicalManifestView';
import SurgeriesTable from '@/components/dashboard/SurgeriesTable';
import HighRiskAssetList from '@/components/dashboard/HighRiskAssetList';
import { useAutoRefresh } from '@/lib/use-auto-refresh';
import { filterSurgeriesBySharedDateRange, getSharedRangeLabel } from '@/lib/surgeries-shared';

type DateRangeOption = 'today' | 'next7' | 'month';

export default function DashboardOverviewPage() {
    const router = useRouter();
    const [role, setRole] = useState<UserRole>('hospital_admin');
    const [dateRange, setDateRange] = useState<DateRangeOption>('today');
    const [surgeries, setSurgeries] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [breakdowns, setBreakdowns] = useState<any[]>([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExplanationOpen, setIsExplanationOpen] = useState(false);
    const [showMoreDetails, setShowMoreDetails] = useState(false);

    // Direct per-page server session role fetch & route guard
    useEffect(() => {
        const fetchServerRole = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('assetiq_auth_token') : null;
                const res = await fetch('/api/auth/me', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                const data = await res.json();
                let currentRole: UserRole = 'hospital_admin';

                if (data.authenticated && data.role) {
                    currentRole = data.role;
                } else if (typeof window !== 'undefined') {
                    const storedRole = localStorage.getItem('assetiq_user_role') as UserRole;
                    if (storedRole) currentRole = storedRole;
                }

                // Strict Route-Level Exclusion: Dashboard is restricted exclusively to hospital_admin
                if (currentRole === 'ot_admin') {
                    router.replace('/surgeries');
                    return;
                }
                if (currentRole === 'biomedical_engineer') {
                    router.replace('/engineer-dashboard');
                    return;
                }

                setRole(currentRole);
            } catch {
                if (typeof window !== 'undefined') {
                    const storedRole = localStorage.getItem('assetiq_user_role') as UserRole;
                    if (storedRole === 'ot_admin') {
                        router.replace('/surgeries');
                        return;
                    }
                    if (storedRole === 'biomedical_engineer') {
                        router.replace('/engineer-dashboard');
                        return;
                    }
                }
            }
        };
        fetchServerRole();
    }, [router]);

    const canEdit = canUserEdit(role);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [surgeriesRes, assetsRes, breakdownsRes, maintRes] = await Promise.all([
                fetch('/api/surgeries', { cache: 'no-store' }),
                fetch('/api/assets', { cache: 'no-store' }),
                fetch('/api/assets/breakdowns', { cache: 'no-store' }),
                fetch('/api/assets/maintenance', { cache: 'no-store' })
            ]);

            const surgeriesData = await surgeriesRes.json();
            const assetsData = await assetsRes.json();
            const breakdownsData = await breakdownsRes.json();
            const maintData = await maintRes.json();

            let surgeryList = surgeriesData.success ? surgeriesData.data : [];
            const assetList = assetsData.success ? assetsData.data : [];
            const breakdownList = breakdownsData.success ? breakdownsData.data : [];
            const maintList = maintData.success ? maintData.data : [];

            // Evaluate readiness dynamically for each surgery
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
        } catch (err) {
            console.error('Failed to load dashboard overview data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Auto-refresh every 60s and on window focus
    useAutoRefresh(loadDashboardData, 60000);

    const handleUpdateAssetStatus = async (assetId: string, newStatus: string) => {
        if (!canEdit) return;
        try {
            const res = await fetch(`/api/assets/${assetId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (data.success) {
                await loadDashboardData();
            }
        } catch (err) {
            console.error('Failed to update asset status:', err);
        }
    };

    // Shared date range filter in Asia/Kolkata timezone
    const filteredSurgeries = useMemo(() => {
        return filterSurgeriesBySharedDateRange(surgeries, dateRange);
    }, [surgeries, dateRange]);

    // Human-readable range labels used in headings and descriptions
    const rangeLabel = getSharedRangeLabel(dateRange);

    const handleScrollToExplanation = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsExplanationOpen(true);
        setTimeout(() => {
            const el = document.getElementById('how-assetiq-decides');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 50);
    };

    // Skeleton loading state
    if (loading) {
        return (
            <div className="flex-1 flex flex-col">
                <div className="page-header-band px-4 sm:px-6 py-5">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="h-8 w-48 bg-panel-header rounded-[4px] animate-pulse"></div>
                            <div className="h-4 w-72 bg-panel-header rounded-[4px] animate-pulse"></div>
                        </div>
                        <div className="h-9 w-60 bg-panel-header rounded-[4px] animate-pulse"></div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
                    <div className="h-28 bg-panel border border-border rounded-[6px] animate-pulse"></div>
                    <div className="h-44 bg-panel border border-border rounded-[6px] animate-pulse"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-36 bg-panel border border-border rounded-[6px] animate-pulse"></div>
                        ))}
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
                        <div className="flex items-center gap-3">
                            <h1 className="text-page-title text-text-primary">Dashboard</h1>
                            <a
                                href="#how-assetiq-decides"
                                onClick={handleScrollToExplanation}
                                className="text-caption text-accent hover:underline font-medium cursor-pointer"
                            >
                                How to read this page
                            </a>
                        </div>
                        <p className="text-body text-text-secondary mt-0.5">
                            Surgery readiness and equipment health at a glance.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 self-start md:self-auto">
                        {/* Plain Timestamp */}
                        <span className="text-caption text-text-muted tabular-nums">
                            Data as of 19 Oct 2026, 7:54 pm
                        </span>

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
                {/* 2. Today's Situation (The Answer First) */}
                <TodaySituationBanner
                    surgeries={filteredSurgeries}
                    dateRange={dateRange}
                    rangeLabel={rangeLabel}
                />

                {/* 3. Needs Attention Now */}
                <NeedsAttentionList
                    surgeries={filteredSurgeries}
                    rangeLabel={rangeLabel}
                    allSurgeries={surgeries}
                    allAssets={assets}
                    breakdowns={breakdowns}
                    userRole={role}
                />

                {/* 4. Hospital Analytics (Management Numbers) */}
                <HospitalAnalyticsTelemetrySection
                    surgeries={filteredSurgeries}
                    assets={assets}
                    breakdowns={breakdowns}
                    maintenanceRecords={maintenanceRecords}
                    rangeLabel={rangeLabel}
                />

                {/* 5. Why It Happens (Supporting Charts) */}
                <section className="space-y-6">
                    <div className="border-b border-border pb-2">
                        <h2 className="text-section-heading text-text-primary">
                            Why it happens
                        </h2>
                        <p className="text-body text-text-secondary mt-0.5">
                            Detailed operational telemetry explaining equipment availability, downtime patterns, and surgical workload.
                        </p>
                    </div>

                    {/* Sub-Heading 1: Equipment Health */}
                    <div className="space-y-3">
                        <div>
                            <h3 className="text-body font-semibold text-text-primary">
                                Equipment health
                            </h3>
                            <p className="text-caption text-text-muted">
                                Current operational status, maintenance compliance intervals, and flagged high-risk medical assets.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <EquipmentStatusDistributionChart assets={assets} />
                            <PmComplianceChart assets={assets} />
                            <EquipmentRiskChart assets={assets} />
                        </div>
                    </div>

                    {/* Sub-Heading 2: Breakdowns and Downtime */}
                    <div className="space-y-3">
                        <div>
                            <h3 className="text-body font-semibold text-text-primary">
                                Breakdowns and downtime
                            </h3>
                            <p className="text-caption text-text-muted">
                                Incident trend over the last 6 months and cumulative out-of-service days by equipment type.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <BreakdownTrendsChart breakdowns={breakdowns} />
                            <DowntimeChart breakdowns={breakdowns} assets={assets} />
                        </div>
                    </div>

                    {/* Sub-Heading 3: Usage and Departments */}
                    <div className="space-y-3">
                        <div>
                            <h3 className="text-body font-semibold text-text-primary">
                                Usage and departments
                            </h3>
                            <p className="text-caption text-text-muted">
                                Operating room readiness distribution, equipment utilization hours, and capital value versus maintenance expenditure.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DepartmentReadinessChart surgeries={filteredSurgeries} />
                            <AssetUtilizationChart assets={assets} />
                            <CapexOpexChart assets={assets} maintenanceRecords={maintenanceRecords} />
                        </div>
                    </div>
                </section>

                {/* 6. How AssetIQ Decides (Explanation Panel) */}
                <DecisionExplanationPanel
                    isOpen={isExplanationOpen}
                    onToggle={() => setIsExplanationOpen(!isExplanationOpen)}
                />

                {/* 7. Operational Details ("More Details") */}
                <section className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden space-y-0">
                    <div className="panel-header-band flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-section-heading text-text-primary">
                                More details
                            </h2>
                            <p className="text-body text-text-secondary mt-0.5">
                                Individual procedure manifests, scheduled surgical cases table, and equipment inventory checks.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowMoreDetails(!showMoreDetails)}
                            className="border border-border-strong bg-panel hover:bg-panel-header text-text-primary px-3.5 py-1.5 rounded-[4px] text-table font-medium transition-colors self-start sm:self-auto cursor-pointer"
                        >
                            {showMoreDetails ? 'Hide operational details' : 'View operational details'}
                        </button>
                    </div>

                    {showMoreDetails && (
                        <div className="p-5 border-t border-border space-y-6">
                            {/* Clinical Manifest Split Checklist */}
                            <ClinicalManifestView
                                surgeries={filteredSurgeries}
                                selectedDate={dateRange === 'today' ? '2026-10-19' : rangeLabel}
                                canEdit={canEdit}
                                onUpdateAssetStatus={handleUpdateAssetStatus}
                            />

                            {/* Scheduled Surgeries Table */}
                            <SurgeriesTable
                                surgeries={filteredSurgeries}
                                canEdit={canEdit}
                            />

                            {/* High-Risk Equipment Inventory List */}
                            <HighRiskAssetList
                                assets={assets}
                                canEdit={canEdit}
                                onUpdateAssetStatus={handleUpdateAssetStatus}
                            />
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
