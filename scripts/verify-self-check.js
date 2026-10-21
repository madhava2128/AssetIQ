const path = require('path');
let pg;
try {
    pg = require('pg');
} catch {
    pg = require(path.join(__dirname, '../apps/web/node_modules/pg'));
}
const { Pool } = pg;

const BASE_URL = 'http://localhost:3000';
const DATABASE_URL = 'postgresql://localhost:5432/assetiq';
const pool = new Pool({ connectionString: DATABASE_URL });

async function requestJson(url, options = {}) {
    const res = await fetch(url, options);
    let json = {};
    try { json = await res.json(); } catch { json = { error: 'Failed' }; }
    return { status: res.status, ok: res.ok, body: json };
}

async function login(email, password) {
    const res = await requestJson(BASE_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return res.body.token;
}

function getKolkataDateString(d = new Date()) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
}

async function run() {
    console.log('================================================================');
    console.log('             SECTION 5 SELF-VERIFICATION REPORT                 ');
    console.log('================================================================');

    // First clean up any old test rows
    await pool.query("DELETE FROM surgeries WHERE surgery_code LIKE 'E2E%' OR surgery_code LIKE 'TEST-SURG%'");

    const otToken = await login('ot.admin@assetiq.in', 'OtPass2026!');
    const adminToken = await login('admin@assetiq.in', 'AdminPass2026!');
    const bioToken = await login('biomed@assetiq.in', 'BiomedPass2026!');

    const todayStr = getKolkataDateString();
    const futDate = new Date();
    futDate.setDate(futDate.getDate() + 3);
    const fut3Str = getKolkataDateString(futDate);

    console.log('Today (Asia/Kolkata):', todayStr);
    console.log('Three days ahead    :', fut3Str);

    let todaySurgeryId = null;
    let futSurgeryId = null;

    try {
        console.log('\n[Check 1] Schedule surgeries as ot_admin (Today & 3 days ahead)...');
        const todayRes = await requestJson(BASE_URL + '/api/surgeries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + otToken },
            body: JSON.stringify({
                surgery_code: 'E2E-TODAY-' + Date.now(),
                patient_id: 'PAT-E2E-TODAY',
                procedure_name: 'Total Hip Replacement',
                surgery_type: 'ORTHOPEDIC',
                operating_room: 'OR-4',
                scheduled_start_time: todayStr + 'T14:00:00+05:30',
                scheduled_end_time: todayStr + 'T16:30:00+05:30',
                surgeon_name: 'Dr. Vikram Malhotra',
                notes: 'E2E Verification today',
                required_assets: [
                    { required_category: 'ANESTHESIA_MACHINE', quantity: 1, criticality: 'CRITICAL' },
                    { required_category: 'SURGICAL_MONITOR', quantity: 1, criticality: 'STANDARD' }
                ]
            })
        });
        const todaySurgery = todayRes.body.data;
        todaySurgeryId = todaySurgery.id;
        console.log('Today surgery creation status:', todayRes.status);
        console.log('Created today surgery ID:', todaySurgery.id, 'Code:', todaySurgery.surgery_code);

        const futRes = await requestJson(BASE_URL + '/api/surgeries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + otToken },
            body: JSON.stringify({
                surgery_code: 'E2E-FUT3-' + Date.now(),
                patient_id: 'PAT-E2E-FUT3',
                procedure_name: 'Laparoscopic Hernia Mesh Repair',
                surgery_type: 'LAPAROSCOPIC',
                operating_room: 'OR-5',
                scheduled_start_time: fut3Str + 'T11:00:00+05:30',
                scheduled_end_time: fut3Str + 'T13:30:00+05:30',
                surgeon_name: 'Dr. Priya Deshmukh',
                notes: 'E2E Verification 3 days ahead',
                required_assets: [
                    { required_category: 'LAPAROSCOPIC_TOWER', quantity: 1, criticality: 'CRITICAL' }
                ]
            })
        });
        const futSurgery = futRes.body.data;
        futSurgeryId = futSurgery.id;
        console.log('Future surgery creation status:', futRes.status);
        console.log('Created future surgery ID:', futSurgery.id, 'Code:', futSurgery.surgery_code);

        const dbRowsToday = await pool.query(
            'SELECT s.id, s.surgery_code, s.procedure_name, s.operating_room, s.scheduled_start_time, s.created_by, s.created_at, (SELECT count(*) FROM surgery_required_assets WHERE surgery_id = s.id) as required_assets_count FROM surgeries s WHERE s.id = $1',
            [todaySurgery.id]
        );
        console.log('\nDirect PostgreSQL Table Query for Today Surgery:');
        console.table(dbRowsToday.rows);

        const dbRowsFut = await pool.query(
            'SELECT s.id, s.surgery_code, s.procedure_name, s.operating_room, s.scheduled_start_time, s.created_by, s.created_at, (SELECT count(*) FROM surgery_required_assets WHERE surgery_id = s.id) as required_assets_count FROM surgeries s WHERE s.id = $1',
            [futSurgery.id]
        );
        console.log('Direct PostgreSQL Table Query for Future Surgery:');
        console.table(dbRowsFut.rows);

        console.log('\n[Check 2] Multi-role visibility & dashboard counts via shared read path...');
        const adminList = await requestJson(BASE_URL + '/api/surgeries', {
            headers: { 'Authorization': 'Bearer ' + adminToken }
        });
        const bioList = await requestJson(BASE_URL + '/api/surgeries', {
            headers: { 'Authorization': 'Bearer ' + bioToken }
        });

        const adminTodayMatch = adminList.body.data.find(s => s.id === todaySurgery.id);
        const bioTodayMatch = bioList.body.data.find(s => s.id === todaySurgery.id);
        const adminFutMatch = adminList.body.data.find(s => s.id === futSurgery.id);
        const bioFutMatch = bioList.body.data.find(s => s.id === futSurgery.id);

        console.log('hospital_admin sees today surgery   :', !!adminTodayMatch, '| readiness_status:', adminTodayMatch?.readiness_status);
        console.log('biomedical_engineer sees today surg :', !!bioTodayMatch, '| readiness_status:', bioTodayMatch?.readiness_status);
        console.log('hospital_admin sees future surgery  :', !!adminFutMatch, '| readiness_status:', adminFutMatch?.readiness_status);
        console.log('biomedical_engineer sees future surg:', !!bioFutMatch, '| readiness_status:', bioFutMatch?.readiness_status);

        const todayOnlyList = await requestJson(BASE_URL + '/api/surgeries?date=' + todayStr, {
            headers: { 'Authorization': 'Bearer ' + adminToken }
        });
        console.log('Total surgeries today count:', todayOnlyList.body.count, '(contains today\'s test surgery:', todayOnlyList.body.data.some(s => s.id === todaySurgery.id) + ')');

        console.log('\n[Check 3] Edit time & cancel other surgery as ot_admin...');
        const newStartTime = todayStr + 'T14:30:00+05:30';
        const newEndTime = todayStr + 'T17:00:00+05:30';
        const editRes = await requestJson(BASE_URL + '/api/surgeries/' + todaySurgery.id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + otToken },
            body: JSON.stringify({
                scheduled_start_time: newStartTime,
                scheduled_end_time: newEndTime,
                notes: 'Updated start time to 14:30'
            })
        });
        console.log('Edit response status:', editRes.status, '| New start time:', editRes.body.data?.scheduled_start_time);

        const cancelRes = await requestJson(BASE_URL + '/api/surgeries/' + futSurgery.id, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + otToken }
        });
        console.log('Cancel response status:', cancelRes.status, '| Status:', cancelRes.body.data?.status);

        const bioViewEdited = await requestJson(BASE_URL + '/api/surgeries/' + todaySurgery.id, {
            headers: { 'Authorization': 'Bearer ' + bioToken }
        });
        console.log('biomedical_engineer sees edited start time:', bioViewEdited.body.data?.scheduled_start_time);

        const adminViewCancelled = await requestJson(BASE_URL + '/api/surgeries/' + futSurgery.id, {
            headers: { 'Authorization': 'Bearer ' + adminToken }
        });
        console.log('hospital_admin sees cancelled status:', adminViewCancelled.body.data?.status);

        console.log('\n[Check 4] Reject invalid submissions & confirm ZERO partial rows...');
        const countBeforeInvalid = parseInt((await pool.query('SELECT count(*) FROM surgeries')).rows[0].count, 10);

        const missingFieldRes = await requestJson(BASE_URL + '/api/surgeries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + otToken },
            body: JSON.stringify({
                procedure_name: '',
                operating_room: 'OR-4',
                scheduled_start_time: todayStr + 'T18:00:00+05:30',
                scheduled_end_time: todayStr + 'T20:00:00+05:30'
            })
        });
        console.log('Missing procedure_name rejected:', missingFieldRes.status === 400, '| Error:', missingFieldRes.body.error);

        const doubleBookRes = await requestJson(BASE_URL + '/api/surgeries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + otToken },
            body: JSON.stringify({
                procedure_name: 'Overlapping OR-4 Procedure',
                operating_room: 'OR-4',
                scheduled_start_time: todayStr + 'T15:00:00+05:30',
                scheduled_end_time: todayStr + 'T16:00:00+05:30'
            })
        });
        console.log('Double booking rejected:', doubleBookRes.status === 400, '| Error:', doubleBookRes.body.error);

        const countAfterInvalid = parseInt((await pool.query('SELECT count(*) FROM surgeries')).rows[0].count, 10);
        console.log('Database row count before:', countBeforeInvalid, '| after:', countAfterInvalid, '| Zero partial rows:', countBeforeInvalid === countAfterInvalid);

        console.log('\n[Check 5] biomedical_engineer permission refusal verification...');
        const bioCreateRes = await requestJson(BASE_URL + '/api/surgeries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + bioToken },
            body: JSON.stringify({
                procedure_name: 'Unauthorized Surgery',
                operating_room: 'OR-1',
                scheduled_start_time: todayStr + 'T17:00:00+05:30',
                scheduled_end_time: todayStr + 'T18:00:00+05:30'
            })
        });
        console.log('biomedical_engineer create refused:', bioCreateRes.status === 403, '| Error:', bioCreateRes.body.error);

        const bioEditRes = await requestJson(BASE_URL + '/api/surgeries/' + todaySurgery.id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + bioToken },
            body: JSON.stringify({ notes: 'Illegal Edit by Bio' })
        });
        console.log('biomedical_engineer edit refused:', bioEditRes.status === 403, '| Error:', bioEditRes.body.error);

        const bioCancelRes = await requestJson(BASE_URL + '/api/surgeries/' + todaySurgery.id, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + bioToken }
        });
        console.log('biomedical_engineer cancel refused:', bioCancelRes.status === 403, '| Error:', bioCancelRes.body.error);

    } finally {
        if (todaySurgeryId || futSurgeryId) {
            await pool.query('DELETE FROM surgeries WHERE id = $1 OR id = $2', [todaySurgeryId, futSurgeryId]);
            console.log('\nTeardown complete: cleaned up E2E verification test rows.');
        }
        await pool.end();
    }
}

run().catch(console.error);
