import { Pool, type PoolClient } from 'pg';

// Single PostgreSQL connection pool for AssetIQ
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/assetiq';

export const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

/**
 * Execute database operations within an ACID transaction with caller role context.
 * Sets request.jwt.claims so public.get_current_user_role() and RLS policies evaluate correctly.
 * Automatically rolls back on any error to guarantee zero partial writes.
 */
export async function withSessionClient<T>(
    role: string,
    fn: (client: PoolClient) => Promise<T>
): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const claimsJson = JSON.stringify({
            role,
            user_metadata: { role },
            app_metadata: { role }
        });
        await client.query("SELECT set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.role', $2, true);", [
            claimsJson,
            role
        ]);
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw err;
    } finally {
        client.release();
    }
}

export interface ScheduleSurgeryParams {
    surgery_code?: string;
    patient_id?: string;
    procedure_name: string;
    surgery_type?: string;
    operating_room: string;
    scheduled_start_time: string;
    scheduled_end_time: string;
    surgeon_name?: string;
    status?: string;
    notes?: string;
    created_by?: string;
    required_assets?: Array<{
        required_category: string;
        quantity?: number;
        criticality?: string;
        assigned_asset_id?: string | null;
    }>;
}

/**
 * Atomic Surgery Scheduling via single PostgreSQL RPC function:
 * public.schedule_surgery_with_required_assets(...)
 * Runs inside a single ACID transaction with caller RLS permissions.
 */
export async function scheduleSurgeryAtomic(callerRole: string, params: ScheduleSurgeryParams) {
    return withSessionClient(callerRole, async (client) => {
        const res = await client.query(
            `SELECT public.schedule_surgery_with_required_assets(
                $1, $2, $3, $4, $5, $6::timestamptz, $7::timestamptz, $8, $9, $10, $11, $12::jsonb
            ) as result;`,
            [
                params.surgery_code || null,
                params.patient_id || null,
                params.procedure_name,
                params.surgery_type || 'GENERAL_SURGERY',
                params.operating_room,
                params.scheduled_start_time,
                params.scheduled_end_time,
                params.surgeon_name || 'Dr. On-Call Surgeon',
                params.status || 'SCHEDULED',
                params.notes || '',
                params.created_by || callerRole,
                JSON.stringify(params.required_assets || [])
            ]
        );
        return res.rows[0]?.result;
    });
}

/**
 * Atomic Surgery Update via single PostgreSQL RPC function:
 * public.update_surgery_atomic(...)
 */
export async function updateSurgeryAtomic(callerRole: string, id: string, updates: any) {
    return withSessionClient(callerRole, async (client) => {
        const res = await client.query(
            `SELECT public.update_surgery_atomic($1::uuid, $2::jsonb) as result;`,
            [id, JSON.stringify(updates)]
        );
        return res.rows[0]?.result;
    });
}

/**
 * Atomic Surgery Cancel via single PostgreSQL RPC function:
 * public.cancel_surgery_atomic(...)
 */
export async function cancelSurgeryAtomic(callerRole: string, id: string) {
    return withSessionClient(callerRole, async (client) => {
        const res = await client.query(
            `SELECT public.cancel_surgery_atomic($1::uuid) as result;`,
            [id]
        );
        return res.rows[0]?.result;
    });
}

export interface SharedSurgeriesQueryFilters {
    id?: string;
    operating_room?: string | null;
    status?: string | null;
    surgery_type?: string | null;
    date_range?: 'today' | 'next7' | 'month' | null;
    date?: string | null; // YYYY-MM-DD in Asia/Kolkata
}

/**
 * Shared Read Path query executing against PostgreSQL with LEFT JOINs.
 * Ensures surgeries with no readiness assessment yet appear cleanly as "NOT_CHECKED" ("Not yet checked").
 * Standardizes Asia/Kolkata timezone date extraction and status values.
 */
export async function getSharedSurgeries(filters: SharedSurgeriesQueryFilters = {}) {
    const conditions: string[] = [];
    const values: any[] = [];
    let pIdx = 1;

    if (filters.id) {
        conditions.push(`s.id = $${pIdx++}::uuid`);
        values.push(filters.id);
    }
    if (filters.operating_room) {
        conditions.push(`LOWER(s.operating_room) = LOWER($${pIdx++})`);
        values.push(filters.operating_room);
    }
    if (filters.status) {
        conditions.push(`LOWER(s.status) = LOWER($${pIdx++})`);
        values.push(filters.status);
    }
    if (filters.surgery_type) {
        conditions.push(`LOWER(s.surgery_type) = LOWER($${pIdx++})`);
        values.push(filters.surgery_type);
    }
    if (filters.date) {
        conditions.push(`((s.scheduled_start_time AT TIME ZONE 'Asia/Kolkata')::date) = $${pIdx++}::date`);
        values.push(filters.date);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
        SELECT 
            s.id,
            s.surgery_code,
            s.patient_id,
            s.procedure_name,
            s.surgery_type,
            s.operating_room,
            s.scheduled_start_time,
            s.scheduled_end_time,
            s.surgeon_name,
            s.status,
            s.notes,
            s.created_by,
            s.created_at,
            s.updated_at,
            COALESCE(ra.final_status, 'NOT_CHECKED') as readiness_status,
            ra.rule_result,
            ra.explanation_text,
            CASE WHEN ra.id IS NOT NULL THEN
                jsonb_build_object(
                    'id', ra.id,
                    'surgery_id', ra.surgery_id,
                    'final_status', ra.final_status,
                    'rule_result', ra.rule_result,
                    'explanation_text', ra.explanation_text,
                    'timestamp', ra.timestamp
                )
            ELSE NULL END as assessment,
            COALESCE(
                (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', sra.id,
                            'surgery_id', sra.surgery_id,
                            'required_category', sra.required_category,
                            'assigned_asset_id', sra.assigned_asset_id,
                            'criticality', sra.criticality,
                            'quantity', sra.quantity,
                            'is_manual_override', sra.is_manual_override,
                            'assigned_asset', CASE WHEN a.id IS NOT NULL THEN
                                jsonb_build_object(
                                    'id', a.id,
                                    'asset_tag', a.asset_tag,
                                    'name', a.name,
                                    'category', a.category,
                                    'model', a.model,
                                    'serial_number', a.serial_number,
                                    'operating_room', a.operating_room,
                                    'status', a.status,
                                    'last_pm_date', a.last_pm_date,
                                    'next_pm_due_date', a.next_pm_due_date,
                                    'total_operating_hours', a.total_operating_hours,
                                    'location', a.location,
                                    'department', a.department,
                                    'warranty_vendor', a.warranty_vendor,
                                    'contract_status', a.contract_status,
                                    'is_pm_overdue', (a.next_pm_due_date IS NOT NULL AND a.next_pm_due_date < CURRENT_TIMESTAMP)
                                )
                            ELSE NULL END
                        )
                    )
                    FROM public.surgery_required_assets sra
                    LEFT JOIN public.assets a ON sra.assigned_asset_id = a.id
                    WHERE sra.surgery_id = s.id
                ),
                '[]'::jsonb
            ) as required_assets
        FROM public.surgeries s
        LEFT JOIN LATERAL (
            SELECT id, surgery_id, final_status, rule_result, explanation_text, timestamp
            FROM public.readiness_assessments
            WHERE surgery_id = s.id
            ORDER BY timestamp DESC NULLS LAST, created_at DESC NULLS LAST
            LIMIT 1
        ) ra ON true
        ${whereClause}
        ORDER BY s.scheduled_start_time ASC;
    `;

    const res = await pool.query(sql, values);
    return res.rows;
}
