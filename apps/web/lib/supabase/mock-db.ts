// In-Memory & Supabase Database Abstraction Layer for AssetIQ (Stage 1, 2 & 3)

const mockDb = require('./mock-db.js');

export interface Asset {
    id: string;
    asset_tag: string;
    name: string;
    category: string;
    model: string;
    serial_number: string;
    operating_room: string;
    status: string;
    last_pm_date: string;
    next_pm_due_date: string;
    total_operating_hours: number;
    location?: string;
    department?: string;
    warranty_expiration_date?: string;
    contract_vendor?: string;
    is_pm_overdue?: boolean;
    pm_grace_deadline?: string;
}

export interface SurgeryRequiredAsset {
    id: string;
    surgery_id: string;
    required_category: string;
    assigned_asset_id?: string | null;
    assigned_asset?: Asset | null;
    criticality: 'CRITICAL' | 'IMPORTANT' | 'STANDARD' | string;
    quantity: number;
    is_manual_override: boolean;
}

export interface Surgery {
    id: string;
    surgery_code: string;
    patient_id: string;
    procedure_name: string;
    surgery_type: string;
    operating_room: string;
    scheduled_start_time: string;
    scheduled_end_time: string;
    surgeon_name: string;
    status: string;
    notes?: string;
    required_assets?: SurgeryRequiredAsset[];
}

export const getReadinessConfig = mockDb.getReadinessConfig;
export const getAssets = mockDb.getAssets;
export const getAssetById = mockDb.getAssetById;
export const createAsset = mockDb.createAsset;
export const updateAsset = mockDb.updateAsset;
export const deleteAsset = mockDb.deleteAsset;
export const getMaintenanceRecords = mockDb.getMaintenanceRecords;
export const createMaintenanceRecord = mockDb.createMaintenanceRecord;
export const getBreakdownIncidents = mockDb.getBreakdownIncidents;
export const createBreakdownIncident = mockDb.createBreakdownIncident;
export const resolveBreakdownIncident = mockDb.resolveBreakdownIncident;

export const getSurgeryTemplates = mockDb.getSurgeryTemplates;
export const getSurgeries = mockDb.getSurgeries;
export const getSurgeryById = mockDb.getSurgeryById;
export const createSurgery = mockDb.createSurgery;
export const updateSurgery = mockDb.updateSurgery;
export const cancelSurgery = mockDb.cancelSurgery;
