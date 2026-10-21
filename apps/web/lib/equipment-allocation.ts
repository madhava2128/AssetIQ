/**
 * AssetIQ — Equipment Allocation Verification & Scheduling Collision Engine
 * Strictly display & scheduling verification — does not alter backend readiness engine.
 */

import { formatEnumValue } from './formatters';

export interface EquipmentAllocationRow {
    required_category: string;
    category_name: string;
    quantity_needed: number;
    quantity_available: number;
    allocated_equipment: string;
    status: 'READY' | 'AT_RISK' | 'NOT_READY';
    status_label: string;
    status_reason: string;
    allocation_check: string;
    is_clash: boolean;
}

export interface SurgeryAllocationResult {
    rows: EquipmentAllocationRow[];
    confirmed_count: number;
    total_count: number;
    short_count: number;
    summary_text: string;
    summary_status: 'READY' | 'AT_RISK' | 'NOT_READY';
}

/**
 * Checks if two surgeries overlap in time window
 */
export function areSurgeriesOverlapping(
    s1Start: string | Date,
    s1End: string | Date,
    s2Start: string | Date,
    s2End: string | Date
): boolean {
    const t1Start = new Date(s1Start).getTime();
    const t1End = new Date(s1End).getTime();
    const t2Start = new Date(s2Start).getTime();
    const t2End = new Date(s2End).getTime();

    return t1Start < t2End && t1End > t2Start;
}

/**
 * Computes equipment allocation verification for a given surgery
 */
export function computeSurgeryEquipmentAllocation(
    surgery: any,
    allSurgeries: any[] = [],
    allAssets: any[] = []
): SurgeryAllocationResult {
    const requiredAssets = surgery.required_assets || [];
    const rows: EquipmentAllocationRow[] = [];

    // Find other active surgeries overlapping in time with this surgery
    const overlappingSurgeries = (allSurgeries || []).filter(other => {
        if (!other || other.id === surgery.id) return false;
        if (other.status === 'CANCELLED' || other.status === 'COMPLETED') return false;
        if (!other.scheduled_start_time || !other.scheduled_end_time) return false;
        if (!surgery.scheduled_start_time || !surgery.scheduled_end_time) return false;

        return areSurgeriesOverlapping(
            surgery.scheduled_start_time,
            surgery.scheduled_end_time,
            other.scheduled_start_time,
            other.scheduled_end_time
        );
    });

    for (const req of requiredAssets) {
        const category = req.required_category || 'GENERAL';
        const categoryName = formatEnumValue(category);
        const qtyNeeded = req.quantity || 1;

        // Assets of this category in the hospital fleet
        const fleetAssets = (allAssets || []).filter(a => a.category === category);
        const availableFleetUnits = fleetAssets.filter(a => a.status === 'AVAILABLE');
        const totalAvailableInFleet = availableFleetUnits.length;

        // Overlapping surgeries requiring this same equipment category
        const conflictingSurgeries: any[] = [];
        let totalOverlappingQtyDemanded = 0;

        for (const other of overlappingSurgeries) {
            const otherReqs = other.required_assets || [];
            const match = otherReqs.find((r: any) => r.required_category === category);
            if (match) {
                conflictingSurgeries.push(other);
                totalOverlappingQtyDemanded += (match.quantity || 1);
            }
        }

        // Available quantity remaining for this surgery
        const qtyAvailableAtTime = Math.max(0, totalAvailableInFleet - totalOverlappingQtyDemanded);

        // Allocated equipment unit (specific name/tag if assigned)
        let allocatedEquipmentName = 'Not assigned yet';
        let assignedAsset = req.assigned_asset || fleetAssets.find(a => a.id === req.assigned_asset_id);
        if (assignedAsset) {
            allocatedEquipmentName = `${assignedAsset.name} (${assignedAsset.asset_tag})`;
        }

        // Determine Status & Reason
        let status: 'READY' | 'AT_RISK' | 'NOT_READY' = 'READY';
        let statusLabel = 'Ready';
        let statusReason = 'Operational and available';

        if (assignedAsset) {
            const isRepair = assignedAsset.status === 'UNDER_REPAIR';
            const isMaintenance = assignedAsset.status === 'UNDER_MAINTENANCE';
            const isOverdue = assignedAsset.is_pm_overdue || (assignedAsset.next_pm_due_date && new Date(assignedAsset.next_pm_due_date) < new Date());
            const isContractExpired = assignedAsset.contract_status === 'Expired';

            if (isRepair) {
                status = 'NOT_READY';
                statusLabel = 'Not Ready';
                statusReason = 'Under repair';
            } else if (isMaintenance) {
                status = 'AT_RISK';
                statusLabel = 'At Risk';
                statusReason = 'Under preventive maintenance';
            } else if (isOverdue) {
                status = 'AT_RISK';
                statusLabel = 'At Risk';
                statusReason = 'Maintenance overdue';
            } else if (isContractExpired) {
                status = 'AT_RISK';
                statusLabel = 'At Risk';
                statusReason = 'Service contract expired';
            } else if (assignedAsset.status !== 'AVAILABLE') {
                status = 'AT_RISK';
                statusLabel = 'At Risk';
                statusReason = formatEnumValue(assignedAsset.status);
            }
        } else {
            // Fleet level check
            if (qtyAvailableAtTime < qtyNeeded) {
                status = 'NOT_READY';
                statusLabel = 'Not Ready';
                statusReason = 'Shortage in available fleet units';
            } else if (availableFleetUnits.some(a => a.is_pm_overdue)) {
                status = 'AT_RISK';
                statusLabel = 'At Risk';
                statusReason = 'Some fleet units have maintenance due';
            }
        }

        // Determine Allocation Check Result
        let allocationCheck = 'OK';
        let isClash = false;

        const totalDemand = qtyNeeded + totalOverlappingQtyDemanded;

        if (totalAvailableInFleet < totalDemand) {
            isClash = true;
            if (conflictingSurgeries.length > 0) {
                const otherRoom = conflictingSurgeries[0].operating_room || 'another OR';
                if (totalAvailableInFleet < qtyNeeded) {
                    allocationCheck = `Short by ${qtyNeeded - totalAvailableInFleet}`;
                } else {
                    allocationCheck = `Also needed in ${otherRoom} at the same time`;
                }
            } else {
                allocationCheck = `Short by ${qtyNeeded - totalAvailableInFleet}`;
            }
        } else if (assignedAsset) {
            // Check if another overlapping surgery also has this exact same asset unit assigned
            const otherUsingSameUnit = overlappingSurgeries.find(other => 
                (other.required_assets || []).some((r: any) => r.assigned_asset_id === assignedAsset.id)
            );
            if (otherUsingSameUnit) {
                isClash = true;
                allocationCheck = `Also needed in ${otherUsingSameUnit.operating_room || 'another OR'} at the same time`;
                status = 'NOT_READY';
                statusLabel = 'Not Ready';
                statusReason = 'Same physical unit assigned to overlapping surgery';
            }
        }

        rows.push({
            required_category: category,
            category_name: categoryName,
            quantity_needed: qtyNeeded,
            quantity_available: qtyAvailableAtTime,
            allocated_equipment: allocatedEquipmentName,
            status,
            status_label: statusLabel,
            status_reason: statusReason,
            allocation_check: allocationCheck,
            is_clash: isClash
        });
    }

    const totalCount = rows.length;
    const confirmedCount = rows.filter(r => r.allocation_check === 'OK' && r.status !== 'NOT_READY').length;
    const shortCount = totalCount - confirmedCount;

    let summaryText = `All ${totalCount} required equipment items are confirmed.`;
    let summaryStatus: 'READY' | 'AT_RISK' | 'NOT_READY' = 'READY';

    if (shortCount > 0) {
        summaryText = `${confirmedCount} of ${totalCount} required equipment items are confirmed. ${shortCount} ${shortCount === 1 ? 'item is short or at risk' : 'items are short or at risk'}.`;
        summaryStatus = rows.some(r => r.status === 'NOT_READY' || r.is_clash) ? 'NOT_READY' : 'AT_RISK';
    } else if (rows.some(r => r.status === 'AT_RISK')) {
        summaryText = `All ${totalCount} required equipment items are allocated, but inspection is recommended.`;
        summaryStatus = 'AT_RISK';
    }

    return {
        rows,
        confirmed_count: confirmedCount,
        total_count: totalCount,
        short_count: shortCount,
        summary_text: summaryText,
        summary_status: summaryStatus
    };
}

/**
 * Pre-save verification: checks operating room double-booking and equipment shortages
 */
export function checkPreSaveConflicts(
    candidate: {
        id?: string;
        operating_room: string;
        scheduled_start_time: string;
        scheduled_end_time: string;
        required_assets?: any[];
        status?: string;
    },
    allSurgeries: any[] = [],
    allAssets: any[] = []
): {
    isDoubleBooked: boolean;
    doubleBookingError: string | null;
    hasShortage: boolean;
    shortageWarnings: string[];
} {
    const { id, operating_room, scheduled_start_time, scheduled_end_time, status } = candidate;

    // 1. Operating Room Double-Booking Check
    let isDoubleBooked = false;
    let doubleBookingError: string | null = null;

    if (status !== 'CANCELLED') {
        const conflictingSurgery = allSurgeries.find(s => {
            if (s.id === id) return false;
            if (s.operating_room !== operating_room) return false;
            if (s.status === 'CANCELLED' || s.status === 'COMPLETED') return false;

            return areSurgeriesOverlapping(
                scheduled_start_time,
                scheduled_end_time,
                s.scheduled_start_time,
                s.scheduled_end_time
            );
        });

        if (conflictingSurgery) {
            isDoubleBooked = true;
            doubleBookingError = `Operating Room ${operating_room} is already booked for another active procedure (${conflictingSurgery.procedure_name || 'Surgery'}) during this window.`;
        }
    }

    // 2. Equipment Shortage Warnings Check
    const shortageWarnings: string[] = [];
    const requiredAssets = candidate.required_assets || [];

    const overlappingActiveSurgeries = allSurgeries.filter(s => {
        if (s.id === id) return false;
        if (s.status === 'CANCELLED' || s.status === 'COMPLETED') return false;
        return areSurgeriesOverlapping(
            scheduled_start_time,
            scheduled_end_time,
            s.scheduled_start_time,
            s.scheduled_end_time
        );
    });

    for (const req of requiredAssets) {
        const category = req.required_category;
        const qtyNeeded = req.quantity || 1;
        const categoryName = formatEnumValue(category);

        const availableUnits = allAssets.filter(a => a.category === category && a.status === 'AVAILABLE').length;

        let overlappingDemand = 0;
        let conflictRooms: string[] = [];
        for (const other of overlappingActiveSurgeries) {
            const match = (other.required_assets || []).find((r: any) => r.required_category === category);
            if (match) {
                overlappingDemand += (match.quantity || 1);
                if (other.operating_room && !conflictRooms.includes(other.operating_room)) {
                    conflictRooms.push(other.operating_room);
                }
            }
        }

        if (availableUnits < qtyNeeded + overlappingDemand) {
            if (conflictRooms.length > 0) {
                shortageWarnings.push(
                    `${categoryName}: only ${availableUnits} available unit(s) in hospital fleet, but also needed in ${conflictRooms.join(', ')} during this time.`
                );
            } else {
                shortageWarnings.push(
                    `${categoryName}: requires ${qtyNeeded} unit(s), but only ${availableUnits} available in hospital fleet.`
                );
            }
        }
    }

    return {
        isDoubleBooked,
        doubleBookingError,
        hasShortage: shortageWarnings.length > 0,
        shortageWarnings
    };
}
