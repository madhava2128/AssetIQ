'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, canUserEdit } from '@/lib/auth';
import RoleSelector from '@/components/dashboard/RoleSelector';

export default function ReportsPage() {
    const router = useRouter();
    const [role, setRole] = useState<UserRole>('hospital_admin');
    const [reportType, setReportType] = useState<'DAILY' | 'MONTHLY'>('DAILY');
    const [startDate, setStartDate] = useState<string>('2026-09-18');
    const [endDate, setEndDate] = useState<string>('2026-09-18');
    const [surgeries, setSurgeries] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

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

                // Route Guard: PDF Audit Reports is restricted exclusively to hospital_admin
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

    const loadReportData = async () => {
        setLoading(true);
        try {
            const [surgeriesRes, assetsRes] = await Promise.all([
                fetch('/api/surgeries', { cache: 'no-store' }),
                fetch('/api/assets', { cache: 'no-store' })
            ]);

            const surgeriesData = await surgeriesRes.json();
            const assetsData = await assetsRes.json();

            const surgeryList = surgeriesData.success ? surgeriesData.data : [];
            const assetList = assetsData.success ? assetsData.data : [];

            // Evaluate readiness dynamically for surgeries
            const evaluatedSurgeries = await Promise.all(
                surgeryList.map(async (s: any) => {
                    try {
                        const readinessRes = await fetch(`/api/readiness?surgery_id=${s.id}`, { cache: 'no-store' });
                        const readinessData = await readinessRes.json();
                        if (readinessData.success && readinessData.assessment) {
                            return {
                                ...s,
                                readiness_status: readinessData.assessment.final_status,
                                worst_rule_fired: readinessData.assessment.worst_rule_fired
                            };
                        }
                    } catch (e) {
                        console.error('Failed readiness for report:', e);
                    }
                    return s;
                })
            );

            setSurgeries(evaluatedSurgeries);
            setAssets(assetList);
        } catch (err) {
            console.error('Failed to load report telemetry data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReportData();
    }, []);

    const totalSurgeries = surgeries.length;
    const readyCount = surgeries.filter(s => (s.readiness_status || s.final_status) === 'READY').length;
    const atRiskCount = surgeries.filter(s => (s.readiness_status || s.final_status) === 'AT_RISK').length;
    const notReadyCount = surgeries.filter(s => (s.readiness_status || s.final_status) === 'NOT_READY').length;

    const handleDownloadPdf = () => {
        setIsGenerating(true);
        const url = `/api/reports/pdf?type=${reportType}&start_date=${startDate}&end_date=${endDate}`;
        window.open(url, '_blank');
        setTimeout(() => setIsGenerating(false), 1500);
    };

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-slate-100 font-sans space-y-6">
            {/* Header & Role Selector */}
            <RoleSelector currentRole={role} onRoleChange={setRole} />

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <span>Hospital Readiness PDF Audit Reports (Stage 8)</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Generates downloadable official PDF readiness audit reports using jsPDF. All figures are computed live from readiness_assessments — zero mock values.
                    </p>
                </div>

                {/* Report Configuration Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Report Type
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="DAILY">Daily Surgical Readiness Executive Audit</option>
                            <option value="MONTHLY">Monthly Hospital Equipment & Compliance Audit</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Live Telemetry Preview Card */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Live Data Telemetry Preview ({startDate} to {endDate})
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Surgeries</span>
                            <span className="text-2xl font-bold font-mono text-slate-100 mt-1 block">{totalSurgeries}</span>
                        </div>
                        <div className="bg-slate-900 p-3.5 rounded-lg border border-emerald-900/40">
                            <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">READY Surgeries</span>
                            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                                {readyCount} ({totalSurgeries > 0 ? ((readyCount / totalSurgeries) * 100).toFixed(1) : 0}%)
                            </span>
                        </div>
                        <div className="bg-slate-900 p-3.5 rounded-lg border border-amber-900/40">
                            <span className="text-[10px] text-amber-400 uppercase tracking-wider block">AT_RISK Surgeries</span>
                            <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                                {atRiskCount} ({totalSurgeries > 0 ? ((atRiskCount / totalSurgeries) * 100).toFixed(1) : 0}%)
                            </span>
                        </div>
                        <div className="bg-slate-900 p-3.5 rounded-lg border border-rose-900/40">
                            <span className="text-[10px] text-rose-400 uppercase tracking-wider block">NOT_READY Surgeries</span>
                            <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">
                                {notReadyCount} ({totalSurgeries > 0 ? ((notReadyCount / totalSurgeries) * 100).toFixed(1) : 0}%)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Download PDF Action Button */}
                <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-slate-400">
                        Official jsPDF report output includes Executive Summary KPI Table, Surgeries Breakdown, and Bio Eng Sign-off block.
                    </div>

                    <button
                        onClick={handleDownloadPdf}
                        disabled={isGenerating}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-lg flex items-center gap-2"
                    >
                        {isGenerating ? (
                            <span>Generating PDF...</span>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Download Official PDF Audit Report</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
