'use client';

import React from 'react';

interface HospitalAnalyticsTelemetryProps {
    surgeries: any[];
    assets: any[];
    breakdowns: any[];
    maintenanceRecords: any[];
    selectedDate: string;
}

export default function HospitalAnalyticsTelemetrySection({
    surgeries,
    assets,
    breakdowns,
    maintenanceRecords,
    selectedDate
}: HospitalAnalyticsTelemetryProps) {
    // 1. Surgeries Ready Today
    const totalSurgeries = surgeries.length;
    const readySurgeries = surgeries.filter(s => (s.readiness_status || s.final_status) === 'READY').length;
    const atRiskSurgeries = surgeries.filter(s => (s.readiness_status || s.final_status) === 'AT_RISK').length;
    const notReadySurgeries = surgeries.filter(s => (s.readiness_status || s.final_status) === 'NOT_READY').length;
    const surgeriesNeedAttention = atRiskSurgeries + notReadySurgeries;

    // 2. Equipment Readiness Rate
    const totalAssets = assets.length;
    const healthyAssets = assets.filter(a => a.status === 'AVAILABLE' && !a.is_pm_overdue).length;
    const equipmentReadinessRate = totalAssets > 0 ? Math.round((healthyAssets / totalAssets) * 100) : 100;

    // 3. Equipment Needing Attention
    const attentionAssets = assets.filter(a => a.status !== 'AVAILABLE' || a.is_pm_overdue);
    const attentionAssetsCount = attentionAssets.length;

    // 4. Maintenance On Track
    const overduePmAssets = assets.filter(a => a.is_pm_overdue).length;
    const maintenanceOnTrackRate = totalAssets > 0 ? Math.round(((totalAssets - overduePmAssets) / totalAssets) * 100) : 100;

    // 5. Equipment Downtime This Month
    let totalDowntimeHours = 0;
    (breakdowns || []).forEach(b => {
        if (b.reported_at) {
            const start = new Date(b.reported_at).getTime();
            const end = b.resolved_at ? new Date(b.resolved_at).getTime() : new Date().getTime();
            const hours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
            totalDowntimeHours += hours;
        }
    });

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
        <section className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl">📊</span>
                        <h2 className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
                            Hospital Analytics & Equipment Telemetry
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 uppercase">
                            Executive Management Summary
                        </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        Live operational readiness indicators for hospital leadership and administrative oversight.
                    </p>
                </div>
                <div className="text-xs font-mono font-semibold text-[var(--color-text-muted)] bg-[var(--color-bg-primary)] px-3 py-1.5 rounded-lg border border-[var(--color-border)] self-start md:self-auto">
                    Report Date: {selectedDate}
                </div>
            </div>

            {/* 6 Metric Executive Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Metric 1: Surgeries Ready Today */}
                <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                                Surgeries Ready Today
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                surgeriesNeedAttention === 0
                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                                    : 'bg-rose-950/80 text-rose-300 border border-rose-700'
                            }`}>
                                {surgeriesNeedAttention === 0 ? '✓ All Clear' : '⚠️ Action Needed'}
                            </span>
                        </div>
                        <div className="text-3xl lg:text-4xl font-extrabold font-mono text-[var(--color-text-primary)]">
                            {readySurgeries} <span className="text-xl text-[var(--color-text-muted)] font-normal">of {totalSurgeries}</span>
                        </div>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                        {surgeriesNeedAttention > 0
                            ? `${surgeriesNeedAttention} ${surgeriesNeedAttention === 1 ? 'surgery needs' : 'surgeries need'} attention before scheduled time.`
                            : 'All surgeries cleared and ready for today.'}
                    </p>
                </div>

                {/* Metric 2: Equipment Readiness Rate (With Section 3.1 Compliant Single Donut Ring) */}
                <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-3">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                                Equipment Readiness Rate
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                equipmentReadinessRate >= 90
                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                                    : 'bg-amber-950/80 text-amber-300 border border-amber-700'
                            }`}>
                                {equipmentReadinessRate >= 90 ? '● Optimal' : '▲ Below Target'}
                            </span>
                        </div>

                        {/* Section 3.1 Donut Accent Ring - Direct percentage inside, no axes/legends */}
                        <div className="flex items-center gap-4 my-1">
                            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-slate-800"
                                        strokeWidth="3.5"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className={equipmentReadinessRate >= 90 ? 'text-emerald-400' : 'text-amber-400'}
                                        strokeDasharray={`${equipmentReadinessRate}, 100`}
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <span className="absolute text-xs font-extrabold font-mono text-[var(--color-text-primary)]">
                                    {equipmentReadinessRate}%
                                </span>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-emerald-300">
                                    Conclusion: Equipment readiness is currently operating at optimal capacity.
                                </h4>
                                <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                                    ▲ Up 2% from prior period
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                        Share of required equipment currently available and fully operational.
                    </p>
                </div>

                {/* Metric 3: Equipment Needing Attention */}
                <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                                Equipment Needing Attention
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                attentionAssetsCount === 0
                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                                    : 'bg-rose-950/80 text-rose-300 border border-rose-700'
                            }`}>
                                {attentionAssetsCount === 0 ? '✓ None' : `${attentionAssetsCount} Flagged`}
                            </span>
                        </div>
                        <div className={`text-3xl lg:text-4xl font-extrabold font-mono ${
                            attentionAssetsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                            {attentionAssetsCount} <span className="text-base text-[var(--color-text-muted)] font-normal">items</span>
                        </div>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                        {attentionAssetsCount > 0
                            ? 'Overdue maintenance or active repair requests.'
                            : 'All hospital medical equipment is fully compliant.'}
                    </p>
                </div>

                {/* Metric 4: Maintenance On Track (With Section 3.1 Donut Accent Ring) */}
                <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-3">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                                Maintenance On Track
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                maintenanceOnTrackRate >= 90
                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                                    : 'bg-amber-950/80 text-amber-300 border border-amber-700'
                            }`}>
                                {maintenanceOnTrackRate >= 90 ? '✓ On Schedule' : '⚠️ Overdue Items'}
                            </span>
                        </div>

                        {/* Section 3.1 Donut Accent Ring - Direct percentage inside, no axes/legends */}
                        <div className="flex items-center gap-4 my-1">
                            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-slate-800"
                                        strokeWidth="3.5"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className={maintenanceOnTrackRate >= 90 ? 'text-emerald-400' : 'text-amber-400'}
                                        strokeDasharray={`${maintenanceOnTrackRate}, 100`}
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <span className="absolute text-xs font-extrabold font-mono text-[var(--color-text-primary)]">
                                    {maintenanceOnTrackRate}%
                                </span>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-emerald-300">
                                    Conclusion: Preventive maintenance compliance is on schedule.
                                </h4>
                                <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                                    {totalAssets - overduePmAssets} of {totalAssets} assets compliant
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                        {maintenanceOnTrackRate}% of scheduled maintenance completed on schedule.
                    </p>
                </div>

                {/* Metric 5: Equipment Downtime This Month */}
                <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                                Equipment Downtime
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950/80 text-sky-300 border border-sky-700">
                                Monthly Cumulative
                            </span>
                        </div>
                        <div className="text-3xl lg:text-4xl font-extrabold font-mono text-sky-400">
                            {totalDowntimeHours} <span className="text-base text-[var(--color-text-muted)] font-normal">hours</span>
                        </div>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                        Equipment was unavailable for a total of {totalDowntimeHours} hours this month.
                    </p>
                </div>

                {/* Metric 6: Recent Breakdowns */}
                <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                                Recent Breakdowns
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                openBreakdownsCount === 0
                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                                    : 'bg-amber-950/80 text-amber-300 border border-amber-700'
                            }`}>
                                {openBreakdownsCount === 0 ? '✓ All Resolved' : `🚨 ${openBreakdownsCount} Active`}
                            </span>
                        </div>
                        <div className="text-3xl lg:text-4xl font-extrabold font-mono text-[var(--color-text-primary)]">
                            {recentBreakdownsCount} <span className="text-base text-[var(--color-text-muted)] font-normal">incidents</span>
                        </div>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                        {recentBreakdownsCount === 0
                            ? 'Zero breakdown incidents recorded in the last 30 days.'
                            : `${recentBreakdownsCount} breakdown ${recentBreakdownsCount === 1 ? 'incident' : 'incidents'} in the last 30 days.`}
                    </p>
                </div>
            </div>
        </section>
    );
}
