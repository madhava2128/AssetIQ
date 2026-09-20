'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, canUserEdit } from '@/lib/auth';
import RoleSelector from '@/components/dashboard/RoleSelector';
import ControlRoomSafetyBanner from '@/components/dashboard/ControlRoomSafetyBanner';
import ClinicalManifestView from '@/components/dashboard/ClinicalManifestView';
import SurgeryOverviewCards from '@/components/dashboard/SurgeryOverviewCards';
import SurgeriesTable from '@/components/dashboard/SurgeriesTable';
import HighRiskAssetList from '@/components/dashboard/HighRiskAssetList';
import ReadinessDistributionChart from '@/components/dashboard/ReadinessDistributionChart';
import EquipmentRiskChart from '@/components/dashboard/EquipmentRiskChart';
import PmComplianceChart from '@/components/dashboard/PmComplianceChart';
import BreakdownTrendsChart from '@/components/dashboard/BreakdownTrendsChart';
import AssetUtilizationChart from '@/components/dashboard/AssetUtilizationChart';
import DepartmentReadinessChart from '@/components/dashboard/DepartmentReadinessChart';
import DowntimeChart from '@/components/dashboard/DowntimeChart';
import CapexOpexChart from '@/components/dashboard/CapexOpexChart';

import HospitalAnalyticsTelemetrySection from '@/components/dashboard/HospitalAnalyticsTelemetrySection';

export default function DashboardOverviewPage() {
    const router = useRouter();
    const [role, setRole] = useState<UserRole>('hospital_admin');
    const [selectedDate, setSelectedDate] = useState<string>('2026-09-18');
    const [surgeries, setSurgeries] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [breakdowns, setBreakdowns] = useState<any[]>([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
                    router.replace('/assets');
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
                        router.replace('/assets');
                        return;
                    }
                }
            }
        };
        fetchServerRole();
    }, [router]);

    const canEdit = canUserEdit(role);

    const handleRoleSwitch = (newRole: UserRole) => {
        setRole(newRole);
        if (typeof window !== 'undefined') {
            localStorage.setItem('assetiq_user_role', newRole);
            document.cookie = `assetiq_user_role=${newRole}; path=/; max-age=86400;`;
        }
        if (newRole === 'ot_admin') {
            router.replace('/surgeries');
        } else if (newRole === 'biomedical_engineer') {
            router.replace('/assets');
        }
    };

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
    }, [selectedDate]);

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
                // Immediate refresh cycle -> no stale cached readiness data
                await loadDashboardData();
            }
        } catch (err) {
            console.error('Failed to update asset status:', err);
        }
    };

    // Filter surgeries by selected date
    const filteredSurgeries = surgeries.filter(s => {
        if (!s.scheduled_start_time) return true;
        return s.scheduled_start_time.startsWith(selectedDate);
    });

    const displaySurgeries = filteredSurgeries.length > 0 ? filteredSurgeries : surgeries;

    const readyCount = displaySurgeries.filter(s => (s.readiness_status || s.final_status) === 'READY').length;
    const atRiskCount = displaySurgeries.filter(s => (s.readiness_status || s.final_status) === 'AT_RISK').length;
    const notReadyCount = displaySurgeries.filter(s => (s.readiness_status || s.final_status) === 'NOT_READY').length;

    const [showAnalytics, setShowAnalytics] = useState(false);

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-400 bg-[var(--color-bg-primary)] min-h-screen flex items-center justify-center font-mono text-xs">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
                    <span>INITIALIZING CLINICAL CONTROL ROOM TELEMETRY...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-[var(--color-bg-primary)] min-h-screen text-[var(--color-text-primary)] font-sans space-y-6">
            {/* Auth Role Selector Banner */}
            <RoleSelector currentRole={role} onRoleChange={handleRoleSwitch} />

            {/* DOMINANT FOCAL POINT: Clinical Control Room Safety Banner */}
            <ControlRoomSafetyBanner surgeries={displaySurgeries} selectedDate={selectedDate} />

            {/* NEW ADDITIVE SECTION: Hospital Analytics & Equipment Telemetry for Management */}
            <HospitalAnalyticsTelemetrySection
                surgeries={displaySurgeries}
                assets={assets}
                breakdowns={breakdowns}
                maintenanceRecords={maintenanceRecords}
                selectedDate={selectedDate}
            />

            {/* Top-Level KPI Summary Cards */}
            <SurgeryOverviewCards
                totalSurgeries={displaySurgeries.length}
                readyCount={readyCount}
                atRiskCount={atRiskCount}
                notReadyCount={notReadyCount}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
            />

            {/* Split Manifest Layout (Left Rail + Main Panel Equipment Manifest Checklist) */}
            <ClinicalManifestView
                surgeries={displaySurgeries}
                selectedDate={selectedDate}
                canEdit={canEdit}
                onUpdateAssetStatus={handleUpdateAssetStatus}
            />

            {/* Scheduled Surgeries Table */}
            <SurgeriesTable surgeries={displaySurgeries} canEdit={canEdit} />

            {/* High Risk Asset List with Quick Action */}
            <HighRiskAssetList
                assets={assets}
                canEdit={canEdit}
                onUpdateAssetStatus={handleUpdateAssetStatus}
            />

            {/* Progressive Disclosure: Recharts Analytics Grid (8 Visualizations) */}
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                            <span>📈 Detailed Visualizations & Analytics Reports</span>
                            <span className="text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded">
                                8 Recharts Visualizations
                            </span>
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            Deep-dive charts for capex/opex trends, equipment risk models, downtime, and PM compliance.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
                    >
                        <span>{showAnalytics ? 'Hide Analytical Charts ▲' : 'View Analytical Charts (8) ▼'}</span>
                    </button>
                </div>

                {showAnalytics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--color-border)]">
                        <ReadinessDistributionChart
                            readyCount={readyCount}
                            atRiskCount={atRiskCount}
                            notReadyCount={notReadyCount}
                        />
                        <EquipmentRiskChart assets={assets} />
                        <PmComplianceChart assets={assets} />
                        <BreakdownTrendsChart breakdowns={breakdowns} />
                        <AssetUtilizationChart assets={assets} />
                        <DepartmentReadinessChart surgeries={displaySurgeries} />
                        <DowntimeChart breakdowns={breakdowns} />
                        <CapexOpexChart assets={assets} maintenanceRecords={maintenanceRecords} />
                    </div>
                )}
            </div>
        </div>
    );
}
