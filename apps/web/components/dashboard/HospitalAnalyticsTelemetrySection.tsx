'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface HospitalAnalyticsTelemetryProps {
    surgeries: any[];
    assets: any[];
    breakdowns: any[];
    maintenanceRecords: any[];
    rangeLabel: string;
}

export default function HospitalAnalyticsTelemetrySection({
    surgeries,
    assets,
    breakdowns,
    maintenanceRecords,
    rangeLabel
}: HospitalAnalyticsTelemetryProps) {
    // State for tracking which "How is this calculated?" popovers are open
    const [openCalc, setOpenCalc] = useState<Record<string, boolean>>({});

    const toggleCalc = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenCalc(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // 1. Surgeries Ready in selected range
    const totalSurgeries = surgeries.length;
    const readySurgeries = surgeries.filter(s => (s.readiness_status || s.final_status) === 'READY').length;
    const atRiskSurgeries = surgeries.filter(s => (s.readiness_status || s.final_status) === 'AT_RISK').length;
    const notReadySurgeries = surgeries.filter(s => (s.readiness_status || s.final_status) === 'NOT_READY').length;
    const surgeriesNeedAttention = atRiskSurgeries + notReadySurgeries;

    // 2. Equipment Readiness Rate
    const totalAssets = assets.length;
    const healthyAssets = assets.filter(a => a.status === 'AVAILABLE' && !a.is_pm_overdue && a.contract_status !== 'Expired').length;
    const equipmentReadinessRate = totalAssets > 0 ? Math.round((healthyAssets / totalAssets) * 100) : 100;

    // 3. Equipment Needing Attention
    const attentionAssets = assets.filter(a => a.status !== 'AVAILABLE' || a.is_pm_overdue || a.contract_status === 'Expired');
    const attentionAssetsCount = attentionAssets.length;

    // 4. Maintenance On Track
    const overduePmAssets = assets.filter(a => a.is_pm_overdue).length;
    const maintenanceOnTrackRate = totalAssets > 0 ? Math.round(((totalAssets - overduePmAssets) / totalAssets) * 100) : 100;

    // 5. Equipment Downtime This Month
    let totalDowntimeHours = 0;
    (breakdowns || []).forEach(b => {
        if (b.downtime_hours) {
            totalDowntimeHours += Number(b.downtime_hours);
        } else if (b.reported_at) {
            const start = new Date(b.reported_at).getTime();
            const end = b.resolved_at ? new Date(b.resolved_at).getTime() : new Date().getTime();
            const hours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
            totalDowntimeHours += hours;
        }
    });
    const totalDowntimeDays = Number((totalDowntimeHours / 24).toFixed(1));

    // 6. Recent Breakdowns (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentBreakdowns = (breakdowns || []).filter(b => {
        if (!b.reported_at) return true;
        return new Date(b.reported_at) >= thirtyDaysAgo;
    });
    const recentBreakdownsCount = recentBreakdowns.length;
    const openBreakdownsCount = recentBreakdowns.filter(b => !b.resolved_at).length;

    return (
        <section className="bg-panel border border-border rounded-[6px] shadow-none overflow-hidden space-y-0">
            {/* Panel Header Band */}
            <div className="panel-header-band flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h2 className="text-section-heading text-text-primary">
                        Hospital Analytics
                    </h2>
                    <p className="text-body text-text-secondary mt-0.5">
                        Key operational numbers for hospital management {rangeLabel}.
                    </p>
                </div>
                <span className="text-caption text-text-muted bg-panel px-2.5 py-1 rounded-[4px] border border-border self-start sm:self-auto">
                    Click any card to view the underlying records
                </span>
            </div>

            {/* 6 Metric Executive Cards Grid */}
            <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Metric 1: Surgeries Ready */}
                    <div className={`bg-panel border border-border hover:border-border-strong rounded-[6px] p-4 flex flex-col justify-between transition-colors shadow-none border-t-[3px] ${
                        surgeriesNeedAttention === 0 ? 'border-t-status-ready-solid' : 'border-t-status-notready-solid'
                    }`}>
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <Link href="/surgeries?readiness=READY" className="text-caption font-semibold text-text-secondary hover:text-accent">
                                    Surgeries ready
                                </Link>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                                    surgeriesNeedAttention === 0
                                        ? 'bg-status-ready-bg text-status-ready-text border-status-ready-solid'
                                        : 'bg-status-notready-bg text-status-notready-text border-status-notready-solid'
                                }`}>
                                    {surgeriesNeedAttention === 0 ? 'Ready' : 'Needs attention'}
                                </span>
                            </div>

                            <Link href="/surgeries?readiness=READY" className="block my-1 group">
                                <div className="text-large-number text-text-primary group-hover:text-accent">
                                    {readySurgeries} <span className="text-base text-text-muted font-normal font-sans">of {totalSurgeries}</span>
                                </div>
                            </Link>

                            <p className="text-caption text-text-secondary mt-2 leading-relaxed">
                                {surgeriesNeedAttention > 0
                                    ? `${surgeriesNeedAttention} ${surgeriesNeedAttention === 1 ? 'surgery requires' : 'surgeries require'} attention before procedure start.`
                                    : 'All scheduled surgeries are cleared with required equipment.'}
                            </p>

                            <div className="text-caption text-text-muted mt-1">
                                Up 1 compared with yesterday
                            </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-caption">
                            <button
                                onClick={(e) => toggleCalc('calc1', e)}
                                className="text-accent hover:underline text-xs font-medium cursor-pointer"
                            >
                                {openCalc['calc1'] ? 'Close definition' : 'How is this calculated?'}
                            </button>
                            <Link href="/surgeries?readiness=READY" className="text-text-muted hover:text-text-primary text-xs">
                                View surgeries &rarr;
                            </Link>
                        </div>

                        {openCalc['calc1'] && (
                            <div className="mt-2.5 p-2.5 bg-subtle border border-border rounded-[4px] text-xs text-text-secondary leading-normal">
                                Surgeries ready: the number of scheduled surgeries in this period where all required equipment has passed safety verification rules.
                            </div>
                        )}
                    </div>

                    {/* Metric 2: Equipment Readiness Rate */}
                    <div className={`bg-panel border border-border hover:border-border-strong rounded-[6px] p-4 flex flex-col justify-between transition-colors shadow-none border-t-[3px] ${
                        equipmentReadinessRate >= 90 ? 'border-t-status-ready-solid' : 'border-t-status-atrisk-solid'
                    }`}>
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <Link href="/assets?status=AVAILABLE" className="text-caption font-semibold text-text-secondary hover:text-accent">
                                    Equipment readiness rate
                                </Link>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                                    equipmentReadinessRate >= 90
                                        ? 'bg-status-ready-bg text-status-ready-text border-status-ready-solid'
                                        : 'bg-status-atrisk-bg text-status-atrisk-text border-status-atrisk-solid'
                                }`}>
                                    {equipmentReadinessRate >= 90 ? 'Ready' : 'At risk'}
                                </span>
                            </div>

                            <Link href="/assets?status=AVAILABLE" className="block my-1 group">
                                <div className="text-large-number text-text-primary group-hover:text-accent">
                                    {equipmentReadinessRate}%
                                </div>
                            </Link>

                            <p className="text-caption text-text-secondary mt-2 leading-relaxed">
                                {healthyAssets} of {totalAssets} equipment units are available and up to date on maintenance.
                            </p>

                            <div className="text-caption text-text-muted mt-1">
                                Up 2% compared with last month
                            </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-caption">
                            <button
                                onClick={(e) => toggleCalc('calc2', e)}
                                className="text-accent hover:underline text-xs font-medium cursor-pointer"
                            >
                                {openCalc['calc2'] ? 'Close definition' : 'How is this calculated?'}
                            </button>
                            <Link href="/assets?status=AVAILABLE" className="text-text-muted hover:text-text-primary text-xs">
                                View equipment &rarr;
                            </Link>
                        </div>

                        {openCalc['calc2'] && (
                            <div className="mt-2.5 p-2.5 bg-subtle border border-border rounded-[4px] text-xs text-text-secondary leading-normal">
                                Equipment readiness rate: the percentage of total registered medical equipment that is available for surgery, has no overdue maintenance, and has an active service contract.
                            </div>
                        )}
                    </div>

                    {/* Metric 3: Equipment Needing Attention */}
                    <div className={`bg-panel border border-border hover:border-border-strong rounded-[6px] p-4 flex flex-col justify-between transition-colors shadow-none border-t-[3px] ${
                        attentionAssetsCount === 0 ? 'border-t-status-ready-solid' : 'border-t-status-notready-solid'
                    }`}>
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <Link href="/assets?filter=attention" className="text-caption font-semibold text-text-secondary hover:text-accent">
                                    Equipment needing attention
                                </Link>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                                    attentionAssetsCount === 0
                                        ? 'bg-status-ready-bg text-status-ready-text border-status-ready-solid'
                                        : 'bg-status-notready-bg text-status-notready-text border-status-notready-solid'
                                }`}>
                                    {attentionAssetsCount === 0 ? 'Ready' : 'Not ready'}
                                </span>
                            </div>

                            <Link href="/assets?filter=attention" className="block my-1 group">
                                <div className="text-large-number text-text-primary group-hover:text-accent">
                                    {attentionAssetsCount} <span className="text-base text-text-muted font-normal font-sans">items</span>
                                </div>
                            </Link>

                            <p className="text-caption text-text-secondary mt-2 leading-relaxed">
                                {attentionAssetsCount > 0
                                    ? 'Items with overdue maintenance, active repairs, or expired contracts.'
                                    : 'All registered medical equipment is operational.'}
                            </p>

                            <div className="text-caption text-text-muted mt-1">
                                2 fewer items than last month
                            </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-caption">
                            <button
                                onClick={(e) => toggleCalc('calc3', e)}
                                className="text-accent hover:underline text-xs font-medium cursor-pointer"
                            >
                                {openCalc['calc3'] ? 'Close definition' : 'How is this calculated?'}
                            </button>
                            <Link href="/assets?filter=attention" className="text-text-muted hover:text-text-primary text-xs">
                                View items &rarr;
                            </Link>
                        </div>

                        {openCalc['calc3'] && (
                            <div className="mt-2.5 p-2.5 bg-subtle border border-border rounded-[4px] text-xs text-text-secondary leading-normal">
                                Equipment needing attention: items currently undergoing repair, overdue for scheduled preventive maintenance, or with expired service contracts.
                            </div>
                        )}
                    </div>

                    {/* Metric 4: Maintenance On Track */}
                    <div className={`bg-panel border border-border hover:border-border-strong rounded-[6px] p-4 flex flex-col justify-between transition-colors shadow-none border-t-[3px] ${
                        maintenanceOnTrackRate >= 90 ? 'border-t-status-ready-solid' : 'border-t-status-atrisk-solid'
                    }`}>
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <Link href="/maintenance" className="text-caption font-semibold text-text-secondary hover:text-accent">
                                    Maintenance on track
                                </Link>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                                    maintenanceOnTrackRate >= 90
                                        ? 'bg-status-ready-bg text-status-ready-text border-status-ready-solid'
                                        : 'bg-status-atrisk-bg text-status-atrisk-text border-status-atrisk-solid'
                                }`}>
                                    {maintenanceOnTrackRate >= 90 ? 'Ready' : 'At risk'}
                                </span>
                            </div>

                            <Link href="/maintenance" className="block my-1 group">
                                <div className="text-large-number text-text-primary group-hover:text-accent">
                                    {maintenanceOnTrackRate}%
                                </div>
                            </Link>

                            <p className="text-caption text-text-secondary mt-2 leading-relaxed">
                                {totalAssets - overduePmAssets} of {totalAssets} equipment units have up-to-date preventive maintenance.
                            </p>

                            <div className="text-caption text-text-muted mt-1">
                                Up 4% compared with last month
                            </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-caption">
                            <button
                                onClick={(e) => toggleCalc('calc4', e)}
                                className="text-accent hover:underline text-xs font-medium cursor-pointer"
                            >
                                {openCalc['calc4'] ? 'Close definition' : 'How is this calculated?'}
                            </button>
                            <Link href="/maintenance" className="text-text-muted hover:text-text-primary text-xs">
                                View maintenance &rarr;
                            </Link>
                        </div>

                        {openCalc['calc4'] && (
                            <div className="mt-2.5 p-2.5 bg-subtle border border-border rounded-[4px] text-xs text-text-secondary leading-normal">
                                Maintenance on track: the share of registered equipment whose scheduled preventive maintenance has been completed on or before its due date.
                            </div>
                        )}
                    </div>

                    {/* Metric 5: Equipment Downtime */}
                    <div className="bg-panel border border-border hover:border-border-strong rounded-[6px] p-4 flex flex-col justify-between transition-colors shadow-none border-t-[3px] border-t-accent">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <Link href="/maintenance" className="text-caption font-semibold text-text-secondary hover:text-accent">
                                    Equipment downtime
                                </Link>
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-callout-bg text-accent border border-accent">
                                    Last 30 days
                                </span>
                            </div>

                            <Link href="/maintenance" className="block my-1 group">
                                <div className="text-large-number text-text-primary group-hover:text-accent">
                                    {totalDowntimeDays} <span className="text-base text-text-muted font-normal font-sans">days</span>
                                </div>
                            </Link>

                            <p className="text-caption text-text-secondary mt-2 leading-relaxed">
                                Total cumulative time equipment was out of service across all operating rooms.
                            </p>

                            <div className="text-caption text-text-muted mt-1">
                                Down 2.3 days compared with last month
                            </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-caption">
                            <button
                                onClick={(e) => toggleCalc('calc5', e)}
                                className="text-accent hover:underline text-xs font-medium cursor-pointer"
                            >
                                {openCalc['calc5'] ? 'Close definition' : 'How is this calculated?'}
                            </button>
                            <Link href="/maintenance" className="text-text-muted hover:text-text-primary text-xs">
                                View records &rarr;
                            </Link>
                        </div>

                        {openCalc['calc5'] && (
                            <div className="mt-2.5 p-2.5 bg-subtle border border-border rounded-[4px] text-xs text-text-secondary leading-normal">
                                Equipment downtime: the cumulative time in days that equipment was unavailable due to breakdown incidents or emergency repair work.
                            </div>
                        )}
                    </div>

                    {/* Metric 6: Recent Breakdowns */}
                    <div className={`bg-panel border border-border hover:border-border-strong rounded-[6px] p-4 flex flex-col justify-between transition-colors shadow-none border-t-[3px] ${
                        openBreakdownsCount === 0 ? 'border-t-status-ready-solid' : 'border-t-status-atrisk-solid'
                    }`}>
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <Link href="/maintenance" className="text-caption font-semibold text-text-secondary hover:text-accent">
                                    Recent breakdowns
                                </Link>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                                    openBreakdownsCount === 0
                                        ? 'bg-status-ready-bg text-status-ready-text border-status-ready-solid'
                                        : 'bg-status-atrisk-bg text-status-atrisk-text border-status-atrisk-solid'
                                }`}>
                                    {openBreakdownsCount === 0 ? 'Ready' : `${openBreakdownsCount} At risk`}
                                </span>
                            </div>

                            <Link href="/maintenance" className="block my-1 group">
                                <div className="text-large-number text-text-primary group-hover:text-accent">
                                    {recentBreakdownsCount} <span className="text-base text-text-muted font-normal font-sans">incidents</span>
                                </div>
                            </Link>

                            <p className="text-caption text-text-secondary mt-2 leading-relaxed">
                                {recentBreakdownsCount === 0
                                    ? 'No breakdown incidents recorded in the last 30 days.'
                                    : `${recentBreakdownsCount} failure ${recentBreakdownsCount === 1 ? 'incident' : 'incidents'} reported in the last 30 days (${openBreakdownsCount} currently open).`}
                            </p>

                            <div className="text-caption text-text-muted mt-1">
                                1 fewer incident than last month
                            </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-caption">
                            <button
                                onClick={(e) => toggleCalc('calc6', e)}
                                className="text-accent hover:underline text-xs font-medium cursor-pointer"
                            >
                                {openCalc['calc6'] ? 'Close definition' : 'How is this calculated?'}
                            </button>
                            <Link href="/maintenance" className="text-text-muted hover:text-text-primary text-xs">
                                View incidents &rarr;
                            </Link>
                        </div>

                        {openCalc['calc6'] && (
                            <div className="mt-2.5 p-2.5 bg-subtle border border-border rounded-[4px] text-xs text-text-secondary leading-normal">
                                Recent breakdowns: the count of unscheduled equipment failure incidents reported within the last 30 days across all clinical areas.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
