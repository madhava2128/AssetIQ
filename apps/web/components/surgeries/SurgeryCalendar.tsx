'use client';

import React, { useMemo } from 'react';
import {
    formatSurgeryDate,
    formatSurgeryTime,
    formatMonthHeading,
    formatWeekHeading,
    isSameDay,
    isTodayInKolkata,
    getWeekDays,
    getMonthGrid,
    getTimeInHours,
    OPERATING_ROOMS,
    CALENDAR_HOURS
} from '@/lib/date-utils';
import { formatEnumValue } from '@/lib/formatters';

export type CalendarViewMode = 'month' | 'week' | 'day';

interface SurgeryCalendarProps {
    surgeries: any[];
    currentDate: Date;
    viewMode: CalendarViewMode;
    canEdit: boolean;
    onViewModeChange: (mode: CalendarViewMode) => void;
    onDateChange: (date: Date) => void;
    onSelectSurgery: (surgery: any) => void;
    onAddSurgeryAtSlot?: (prefilled: { date: string; time: string; or?: string }) => void;
}

export default function SurgeryCalendar({
    surgeries,
    currentDate,
    viewMode,
    canEdit,
    onViewModeChange,
    onDateChange,
    onSelectSurgery,
    onAddSurgeryAtSlot
}: SurgeryCalendarProps) {
    // Navigation handlers
    const handlePrev = () => {
        const next = new Date(currentDate);
        if (viewMode === 'month') {
            next.setMonth(next.getMonth() - 1);
        } else if (viewMode === 'week') {
            next.setDate(next.getDate() - 7);
        } else {
            next.setDate(next.getDate() - 1);
        }
        onDateChange(next);
    };

    const handleNext = () => {
        const next = new Date(currentDate);
        if (viewMode === 'month') {
            next.setMonth(next.getMonth() + 1);
        } else if (viewMode === 'week') {
            next.setDate(next.getDate() + 7);
        } else {
            next.setDate(next.getDate() + 1);
        }
        onDateChange(next);
    };

    const handleToday = () => {
        onDateChange(new Date());
    };

    // Current period heading
    const periodHeading = useMemo(() => {
        if (viewMode === 'month') {
            return formatMonthHeading(currentDate);
        }
        if (viewMode === 'week') {
            return formatWeekHeading(currentDate);
        }
        return formatSurgeryDate(currentDate);
    }, [viewMode, currentDate]);

    // Compute surgeries visible in the active view period for the summary line
    const visibleSurgeries = useMemo(() => {
        if (viewMode === 'month') {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            return surgeries.filter(s => {
                if (!s.scheduled_start_time) return false;
                const d = new Date(s.scheduled_start_time);
                return d.getFullYear() === year && d.getMonth() === month;
            });
        }
        if (viewMode === 'week') {
            const weekDays = getWeekDays(currentDate);
            return surgeries.filter(s => {
                if (!s.scheduled_start_time) return false;
                return weekDays.some(wDay => isSameDay(s.scheduled_start_time, wDay));
            });
        }
        // Day view
        return surgeries.filter(s => isSameDay(s.scheduled_start_time, currentDate));
    }, [surgeries, currentDate, viewMode]);

    // Accurate summary counts
    const summarySentence = useMemo(() => {
        const total = visibleSurgeries.length;
        if (total === 0) {
            const periodWord = viewMode === 'month' ? 'this month' : viewMode === 'week' ? 'this week' : 'today';
            return `No surgeries scheduled ${periodWord}.`;
        }

        let ready = 0;
        let atRisk = 0;
        let notReady = 0;
        let unchecked = 0;
        let cancelled = 0;

        visibleSurgeries.forEach(s => {
            if (s.status === 'CANCELLED') {
                cancelled++;
                return;
            }
            const st = (s.readiness_status || s.final_status || 'NOT_CHECKED').toUpperCase();
            if (st === 'READY') ready++;
            else if (st === 'AT_RISK') atRisk++;
            else if (st === 'NOT_READY') notReady++;
            else unchecked++;
        });

        const periodWord = viewMode === 'month' ? 'this month' : viewMode === 'week' ? 'this week' : 'today';
        const parts: string[] = [];
        if (ready > 0) parts.push(`${ready} ready`);
        if (atRisk > 0) parts.push(`${atRisk} at risk`);
        if (notReady > 0) parts.push(`${notReady} not ready`);
        if (unchecked > 0) parts.push(`${unchecked} not yet checked`);
        if (cancelled > 0) parts.push(`${cancelled} cancelled`);

        return `${total} ${total === 1 ? 'surgery' : 'surgeries'} ${periodWord}: ${parts.join(', ')}.`;
    }, [visibleSurgeries, viewMode]);

    // Helper for entry card styling
    const getEntryBorderAndBadge = (surgery: any) => {
        if (surgery.status === 'CANCELLED') {
            return {
                borderClass: 'border-l-[3px] border-l-status-neutral-solid bg-panel opacity-75',
                textClass: 'line-through text-text-muted',
                badgeText: 'Cancelled',
                badgeColor: 'text-text-muted bg-panel border border-border'
            };
        }

        const raw = (surgery.readiness_status || surgery.final_status || 'NOT_CHECKED').toUpperCase();
        if (raw === 'READY') {
            return {
                borderClass: 'border-l-[3px] border-l-status-ready-solid bg-panel hover:bg-table-hover',
                textClass: 'text-text-primary',
                badgeText: 'Ready',
                badgeColor: 'text-status-ready-text bg-status-ready-bg border border-status-ready-solid'
            };
        }
        if (raw === 'AT_RISK') {
            return {
                borderClass: 'border-l-[3px] border-l-status-atrisk-solid bg-panel hover:bg-table-hover',
                textClass: 'text-text-primary',
                badgeText: 'At Risk',
                badgeColor: 'text-status-atrisk-text bg-status-atrisk-bg border border-status-atrisk-solid'
            };
        }
        if (raw === 'NOT_READY') {
            return {
                borderClass: 'border-l-[3px] border-l-status-notready-solid bg-panel hover:bg-table-hover',
                textClass: 'text-text-primary',
                badgeText: 'Not Ready',
                badgeColor: 'text-status-notready-text bg-status-notready-bg border border-status-notready-solid'
            };
        }
        return {
            borderClass: 'border-l-[3px] border-l-status-neutral-solid bg-panel hover:bg-table-hover',
            textClass: 'text-text-primary',
            badgeText: 'Not yet checked',
            badgeColor: 'text-status-neutral-text bg-status-neutral-bg border border-status-neutral-solid'
        };
    };

    return (
        <div className="space-y-4">
            {/* Top Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel border border-border rounded-[6px] p-3.5 shadow-none">
                {/* Navigation: Prev / Next / Today & Period Heading */}
                <div className="flex items-center gap-3">
                    <div className="inline-flex rounded-[4px] border border-border-strong bg-panel overflow-hidden text-caption shadow-none">
                        <button
                            onClick={handlePrev}
                            className="px-2.5 py-1.5 hover:bg-panel-header text-text-primary border-r border-border cursor-pointer"
                            aria-label="Previous period"
                        >
                            ← Prev
                        </button>
                        <button
                            onClick={handleToday}
                            className="px-3 py-1.5 hover:bg-panel-header text-text-primary font-medium border-r border-border cursor-pointer"
                        >
                            Today
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-2.5 py-1.5 hover:bg-panel-header text-text-primary cursor-pointer"
                            aria-label="Next period"
                        >
                            Next →
                        </button>
                    </div>

                    <h2 className="text-section-heading font-semibold text-text-primary">
                        {periodHeading}
                    </h2>
                </div>

                {/* View Switch: Month / Week / Day */}
                <div className="inline-flex rounded-[4px] border border-border-strong bg-panel p-0.5 text-caption shadow-none">
                    {(['month', 'week', 'day'] as CalendarViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => onViewModeChange(mode)}
                            className={`px-3 py-1 rounded-[3px] capitalize font-medium transition-colors cursor-pointer ${
                                viewMode === mode
                                    ? 'bg-page-header text-accent font-semibold border border-border'
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Accurate Visible Period Summary Line */}
            <div className="text-caption text-text-primary bg-panel border border-border rounded-[6px] px-3.5 py-2 flex items-center justify-between font-medium tabular-nums shadow-none">
                <span>{summarySentence}</span>
                <span className="text-caption text-text-muted font-normal hidden sm:inline">
                    Click any entry for equipment allocation details
                </span>
            </div>

            {/* Calendar Main Body */}
            <div className="bg-panel border border-border rounded-[6px] overflow-hidden shadow-none">
                {viewMode === 'month' && (
                    <MonthView
                        currentDate={currentDate}
                        surgeries={surgeries}
                        canEdit={canEdit}
                        getEntryStyle={getEntryBorderAndBadge}
                        onSelectSurgery={onSelectSurgery}
                        onDayMoreClick={(day) => {
                            onDateChange(day);
                            onViewModeChange('day');
                        }}
                        onAddSlot={(day) => {
                            if (canEdit && onAddSurgeryAtSlot) {
                                onAddSurgeryAtSlot({
                                    date: day.toISOString().split('T')[0],
                                    time: '09:00'
                                });
                            }
                        }}
                    />
                )}

                {viewMode === 'week' && (
                    <WeekView
                        currentDate={currentDate}
                        surgeries={surgeries}
                        canEdit={canEdit}
                        getEntryStyle={getEntryBorderAndBadge}
                        onSelectSurgery={onSelectSurgery}
                        onAddSlot={(day, hour) => {
                            if (canEdit && onAddSurgeryAtSlot) {
                                onAddSurgeryAtSlot({
                                    date: day.toISOString().split('T')[0],
                                    time: `${String(hour).padStart(2, '0')}:00`
                                });
                            }
                        }}
                    />
                )}

                {viewMode === 'day' && (
                    <DayView
                        currentDate={currentDate}
                        surgeries={surgeries}
                        canEdit={canEdit}
                        getEntryStyle={getEntryBorderAndBadge}
                        onSelectSurgery={onSelectSurgery}
                        onAddSlot={(or, hour) => {
                            if (canEdit && onAddSurgeryAtSlot) {
                                onAddSurgeryAtSlot({
                                    date: currentDate.toISOString().split('T')[0],
                                    time: `${String(hour).padStart(2, '0')}:00`,
                                    or
                                });
                            }
                        }}
                    />
                )}
            </div>

            {/* One-Line Legend Under Calendar */}
            <div className="bg-panel border border-border rounded-[6px] px-4 py-2.5 flex flex-wrap items-center gap-6 text-caption text-text-primary shadow-none">
                <span className="font-semibold text-text-secondary">Status legend:</span>

                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-status-ready-solid inline-block"></span>
                    <span>Ready</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-status-atrisk-solid inline-block"></span>
                    <span>At Risk</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-status-notready-solid inline-block"></span>
                    <span>Not Ready</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-status-neutral-solid inline-block"></span>
                    <span>Not yet checked</span>
                </div>

                <div className="flex items-center gap-1.5 text-text-muted">
                    <span className="line-through text-caption">Cancelled</span>
                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// MONTH VIEW COMPONENT
// -------------------------------------------------------------
interface MonthViewProps {
    currentDate: Date;
    surgeries: any[];
    canEdit: boolean;
    getEntryStyle: (surgery: any) => any;
    onSelectSurgery: (s: any) => void;
    onDayMoreClick: (d: Date) => void;
    onAddSlot: (d: Date) => void;
}

function MonthView({
    currentDate,
    surgeries,
    canEdit,
    getEntryStyle,
    onSelectSurgery,
    onDayMoreClick,
    onAddSlot
}: MonthViewProps) {
    const weeks = useMemo(() => {
        return getMonthGrid(currentDate.getFullYear(), currentDate.getMonth());
    }, [currentDate]);

    const weekDaysHeader = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="w-full">
            {/* Tinted Weekday Header Row */}
            <div className="grid grid-cols-7 border-b border-border bg-table-header text-caption font-semibold text-text-primary text-center py-2.5">
                {weekDaysHeader.map((name) => (
                    <div key={name}>{name}</div>
                ))}
            </div>

            {/* Weeks Grid */}
            <div className="divide-y divide-border">
                {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="grid grid-cols-7 divide-x divide-border min-h-[110px]">
                        {week.map((day, dayIdx) => {
                            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                            const isToday = isTodayInKolkata(day);

                            // Surgeries on this day
                            const daySurgeries = surgeries.filter(s => isSameDay(s.scheduled_start_time, day));
                            const visibleEntries = daySurgeries.slice(0, 3);
                            const extraCount = daySurgeries.length - 3;

                            return (
                                <div
                                    key={dayIdx}
                                    onClick={(e) => {
                                        if (e.target === e.currentTarget && canEdit) {
                                            onAddSlot(day);
                                        }
                                    }}
                                    className={`p-1.5 flex flex-col justify-between transition-colors ${
                                        !isCurrentMonth ? 'bg-panel-header text-text-muted' : 'bg-panel text-text-primary'
                                    } ${isToday ? 'ring-2 ring-accent ring-inset bg-accent-subtle' : ''}`}
                                >
                                    {/* Top Day Number & Today indicator */}
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-caption font-semibold px-1 rounded tabular-nums ${
                                            isToday ? 'bg-accent text-white' : ''
                                        }`}>
                                            {day.getDate()}
                                        </span>
                                        {daySurgeries.length > 0 && (
                                            <span className="text-[10px] text-text-muted tabular-nums">
                                                {daySurgeries.length} {daySurgeries.length === 1 ? 'item' : 'items'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Day Entries List */}
                                    <div className="space-y-1 flex-1">
                                        {visibleEntries.map((s) => {
                                            const style = getEntryStyle(s);
                                            const timeStr = formatSurgeryTime(s.scheduled_start_time);
                                            const typeStr = formatEnumValue(s.surgery_type || 'GENERAL_SURGERY');

                                            return (
                                                <div
                                                    key={s.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectSurgery(s);
                                                    }}
                                                    className={`p-1 rounded-[4px] text-caption border border-border cursor-pointer truncate shadow-none ${style.borderClass}`}
                                                    title={`${s.procedure_name} (${s.operating_room}) - ${style.badgeText}`}
                                                >
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="font-semibold text-[10px] text-text-secondary tabular-nums">
                                                            {timeStr}
                                                        </span>
                                                        <span className={`text-[9px] px-1 rounded font-medium ${style.badgeColor}`}>
                                                            {style.badgeText}
                                                        </span>
                                                    </div>
                                                    <div className={`truncate font-medium mt-0.5 ${style.textClass}`}>
                                                        {typeStr} · {s.operating_room}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* +N More Link */}
                                    {extraCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDayMoreClick(day);
                                            }}
                                            className="text-caption font-medium text-accent hover:underline mt-1 text-left cursor-pointer tabular-nums"
                                        >
                                            +{extraCount} more...
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// WEEK VIEW COMPONENT
// -------------------------------------------------------------
interface WeekViewProps {
    currentDate: Date;
    surgeries: any[];
    canEdit: boolean;
    getEntryStyle: (surgery: any) => any;
    onSelectSurgery: (s: any) => void;
    onAddSlot: (d: Date, hour: number) => void;
}

function WeekView({
    currentDate,
    surgeries,
    canEdit,
    getEntryStyle,
    onSelectSurgery,
    onAddSlot
}: WeekViewProps) {
    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[760px]">
                {/* Header row: 7 day columns */}
                <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-table-header text-caption font-semibold text-text-primary">
                    <div className="p-2 border-r border-border text-center">Time</div>
                    {weekDays.map((day, idx) => {
                        const isToday = isTodayInKolkata(day);
                        return (
                            <div
                                key={idx}
                                className={`p-2 text-center border-r border-border ${
                                    isToday ? 'bg-accent-subtle text-accent font-semibold' : ''
                                }`}
                            >
                                <div>{day.toLocaleDateString('en-GB', { weekday: 'short' })}</div>
                                <div className="text-[11px] text-text-secondary tabular-nums">{day.getDate()}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Time Grid: 7:00 to 20:00 */}
                <div className="divide-y divide-border">
                    {CALENDAR_HOURS.map((hour) => (
                        <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[56px]">
                            {/* Time Axis Column */}
                            <div className="p-1 border-r border-border text-[11px] text-text-secondary text-center bg-panel-header tabular-nums">
                                {hour > 12 ? `${hour - 12}:00 pm` : hour === 12 ? '12:00 pm' : `${hour}:00 am`}
                            </div>

                            {/* 7 Days Columns */}
                            {weekDays.map((day, dIdx) => {
                                const slotSurgeries = surgeries.filter(s => {
                                    if (!isSameDay(s.scheduled_start_time, day)) return false;
                                    const h = getTimeInHours(s.scheduled_start_time);
                                    return h >= hour && h < hour + 1;
                                });

                                return (
                                    <div
                                        key={dIdx}
                                        onClick={(e) => {
                                            if (e.target === e.currentTarget && canEdit) {
                                                onAddSlot(day, hour);
                                            }
                                        }}
                                        className="border-r border-border p-1 relative hover:bg-table-hover transition-colors"
                                    >
                                        {slotSurgeries.map((s) => {
                                            const style = getEntryStyle(s);
                                            const timeRange = formatSurgeryTime(s.scheduled_start_time);
                                            const typeStr = formatEnumValue(s.surgery_type || 'GENERAL_SURGERY');

                                            return (
                                                <div
                                                    key={s.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectSurgery(s);
                                                    }}
                                                    className={`p-1.5 rounded-[4px] border border-border cursor-pointer text-caption mb-1 shadow-none ${style.borderClass}`}
                                                >
                                                    <div className="flex items-center justify-between gap-1 mb-0.5">
                                                        <span className="font-semibold text-[10px] text-text-secondary tabular-nums">
                                                            {timeRange}
                                                        </span>
                                                        <span className={`text-[9px] px-1 rounded font-medium ${style.badgeColor}`}>
                                                            {style.badgeText}
                                                        </span>
                                                    </div>
                                                    <div className={`font-semibold text-caption truncate ${style.textClass}`}>
                                                        {s.procedure_name}
                                                    </div>
                                                    <div className="text-[10px] text-text-secondary truncate">
                                                        {typeStr} · {s.operating_room}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// DAY VIEW COMPONENT (OR Columns)
// -------------------------------------------------------------
interface DayViewProps {
    currentDate: Date;
    surgeries: any[];
    canEdit: boolean;
    getEntryStyle: (surgery: any) => any;
    onSelectSurgery: (s: any) => void;
    onAddSlot: (or: string, hour: number) => void;
}

function DayView({
    currentDate,
    surgeries,
    canEdit,
    getEntryStyle,
    onSelectSurgery,
    onAddSlot
}: DayViewProps) {
    return (
        <div className="overflow-x-auto">
            <div className="min-w-[760px]">
                {/* Header row: One column per Operating Room (OR-1 to OR-6) */}
                <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-border bg-table-header text-caption font-semibold text-text-primary">
                    <div className="p-2 border-r border-border text-center">Time</div>
                    {OPERATING_ROOMS.map((orName) => (
                        <div key={orName} className="p-2 text-center border-r border-border font-semibold text-text-primary">
                            {orName}
                        </div>
                    ))}
                </div>

                {/* Time Grid: 7:00 to 20:00 */}
                <div className="divide-y divide-border">
                    {CALENDAR_HOURS.map((hour) => (
                        <div key={hour} className="grid grid-cols-[60px_repeat(6,1fr)] min-h-[58px]">
                            {/* Time Axis Column */}
                            <div className="p-1 border-r border-border text-[11px] text-text-secondary text-center bg-panel-header tabular-nums">
                                {hour > 12 ? `${hour - 12}:00 pm` : hour === 12 ? '12:00 pm' : `${hour}:00 am`}
                            </div>

                            {/* 6 OR Columns */}
                            {OPERATING_ROOMS.map((orName) => {
                                const slotSurgeries = surgeries.filter(s => {
                                    if (!isSameDay(s.scheduled_start_time, currentDate)) return false;
                                    if (s.operating_room !== orName) return false;
                                    const h = getTimeInHours(s.scheduled_start_time);
                                    return h >= hour && h < hour + 1;
                                });

                                return (
                                    <div
                                        key={orName}
                                        onClick={(e) => {
                                            if (e.target === e.currentTarget && canEdit) {
                                                onAddSlot(orName, hour);
                                            }
                                        }}
                                        className="border-r border-border p-1 relative hover:bg-table-hover transition-colors"
                                    >
                                        {slotSurgeries.map((s) => {
                                            const style = getEntryStyle(s);
                                            const timeRange = formatSurgeryTime(s.scheduled_start_time);

                                            return (
                                                <div
                                                    key={s.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectSurgery(s);
                                                    }}
                                                    className={`p-2 rounded-[4px] border border-border cursor-pointer text-caption mb-1 shadow-none ${style.borderClass}`}
                                                >
                                                    <div className="flex items-center justify-between gap-1 mb-1">
                                                        <span className="font-semibold text-[10px] text-text-secondary tabular-nums">
                                                            {timeRange}
                                                        </span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${style.badgeColor}`}>
                                                            {style.badgeText}
                                                        </span>
                                                    </div>
                                                    <div className={`font-semibold text-caption truncate ${style.textClass}`}>
                                                        {s.procedure_name}
                                                    </div>
                                                    <div className="text-[11px] text-text-secondary truncate mt-0.5">
                                                        {s.surgeon_name || 'Assigned Surgeon'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
