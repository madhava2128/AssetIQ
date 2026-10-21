'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/auth';

export default function ReportsPage() {
    const router = useRouter();
    const [reportType, setReportType] = useState<'DAILY' | 'MONTHLY'>('DAILY');
    const [startDate, setStartDate] = useState<string>('2026-09-18');
    const [endDate, setEndDate] = useState<string>('2026-09-18');
    const [surgeries, setSurgeries] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Route guard: restricted to hospital_admin
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

                if (currentRole === 'ot_admin') {
                    router.replace('/surgeries');
                    return;
                }
                if (currentRole === 'biomedical_engineer') {
                    router.replace('/engineer-dashboard');
                    return;
                }
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
            console.error('Failed to load report data:', err);
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
        <div className="space-y-6">
            {/* Page Header Band */}
            <div className="page-header-band px-4 sm:px-6 py-5 border-b border-border">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-page-title text-text-primary">Hospital Reports</h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Generate and download PDF audit reports for surgical readiness and equipment compliance.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 pb-12">
                <div className="bg-panel border border-border rounded-[6px] overflow-hidden">
                    <div className="panel-header-band px-5 py-3 border-b border-border">
                        <h2 className="text-base font-semibold text-text-primary">Audit Report Configuration</h2>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Configuration form */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-text-primary block mb-1">
                                    Report type
                                </label>
                                <select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value as any)}
                                    className="w-full bg-panel border border-border-strong text-text-primary text-sm rounded-[4px] px-3 py-2 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                                >
                                    <option value="DAILY">Daily Surgery Readiness Audit</option>
                                    <option value="MONTHLY">Monthly Hospital Equipment Audit</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-text-primary block mb-1">
                                    Start date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-panel border border-border-strong text-text-primary text-sm rounded-[4px] px-3 py-2 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-text-primary block mb-1">
                                    End date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-panel border border-border-strong text-text-primary text-sm rounded-[4px] px-3 py-2 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent"
                                />
                            </div>
                        </div>

                        {/* Preview Cards */}
                        <div className="bg-subtle p-5 rounded-[6px] border border-border space-y-3">
                            <h3 className="text-sm font-semibold text-text-primary">
                                Report Summary Preview ({startDate} to {endDate})
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-panel p-4 rounded-[6px] border border-border border-t-[3px] border-t-accent">
                                    <span className="text-xs text-text-secondary block font-medium">Total Surgeries</span>
                                    <span className="text-large-number text-text-primary mt-1 block">{totalSurgeries}</span>
                                </div>
                                <div className="bg-panel p-4 rounded-[6px] border border-border border-t-[3px] border-t-status-ready-solid">
                                    <span className="text-xs text-status-ready-text block font-medium">Ready</span>
                                    <span className="text-large-number text-status-ready-text mt-1 block">
                                        {readyCount} <span className="font-sans text-xs font-normal text-text-muted">({totalSurgeries > 0 ? ((readyCount / totalSurgeries) * 100).toFixed(0) : 0}%)</span>
                                    </span>
                                </div>
                                <div className="bg-panel p-4 rounded-[6px] border border-border border-t-[3px] border-t-status-atrisk-solid">
                                    <span className="text-xs text-status-atrisk-text block font-medium">At Risk</span>
                                    <span className="text-large-number text-status-atrisk-text mt-1 block">
                                        {atRiskCount} <span className="font-sans text-xs font-normal text-text-muted">({totalSurgeries > 0 ? ((atRiskCount / totalSurgeries) * 100).toFixed(0) : 0}%)</span>
                                    </span>
                                </div>
                                <div className="bg-panel p-4 rounded-[6px] border border-border border-t-[3px] border-t-status-notready-solid">
                                    <span className="text-xs text-status-notready-text block font-medium">Not Ready</span>
                                    <span className="text-large-number text-status-notready-text mt-1 block">
                                        {notReadyCount} <span className="font-sans text-xs font-normal text-text-muted">({totalSurgeries > 0 ? ((notReadyCount / totalSurgeries) * 100).toFixed(0) : 0}%)</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Download button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                            <p className="text-xs text-text-muted">
                                Report includes executive KPI table, scheduled surgeries list, and verification sign-off section.
                            </p>

                            <button
                                onClick={handleDownloadPdf}
                                disabled={isGenerating}
                                className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-[4px] text-sm font-medium transition-colors cursor-pointer self-start sm:self-auto"
                            >
                                {isGenerating ? 'Generating PDF...' : 'Download PDF report'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
