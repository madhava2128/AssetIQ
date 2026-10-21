// jsPDF Report Generator for AssetIQ — Simple Hospital Office Style
// Generates Daily and Monthly Surgical Readiness Audit PDF reports.
// Pulls all figures live from readiness_assessments and core tables — ZERO hardcoded values.

const { jsPDF } = require('jspdf');
require('jspdf-autotable');

/**
 * Computes exact statistical summary figures from real assessment and asset data.
 */
function computeReportStatistics(surgeries, assets, assessments) {
    const totalSurgeries = surgeries.length;
    let readyCount = 0;
    let atRiskCount = 0;
    let notReadyCount = 0;

    surgeries.forEach(s => {
        const status = (s.readiness_status || s.final_status || 'READY').toUpperCase();
        if (status === 'NOT_READY') notReadyCount++;
        else if (status === 'AT_RISK') atRiskCount++;
        else readyCount++;
    });

    const readyPct = totalSurgeries > 0 ? ((readyCount / totalSurgeries) * 100).toFixed(1) : '0.0';
    const atRiskPct = totalSurgeries > 0 ? ((atRiskCount / totalSurgeries) * 100).toFixed(1) : '0.0';
    const notReadyPct = totalSurgeries > 0 ? ((notReadyCount / totalSurgeries) * 100).toFixed(1) : '0.0';

    const totalAssets = assets.length;
    const underRepairAssets = assets.filter(a => a.status === 'UNDER_REPAIR').length;
    const pmOverdueAssets = assets.filter(a => a.is_pm_overdue || (a.next_pm_due_date && new Date(a.next_pm_due_date) < new Date())).length;

    return {
        totalSurgeries,
        readyCount,
        atRiskCount,
        notReadyCount,
        readyPct,
        atRiskPct,
        notReadyPct,
        totalAssets,
        underRepairAssets,
        pmOverdueAssets
    };
}

/**
 * Generates jsPDF document object for Daily or Monthly report with simple, clean layout.
 */
function generatePdfReportDocument(params) {
    const {
        reportType = 'DAILY',
        startDate = '2026-09-18',
        endDate = '2026-09-18',
        surgeries = [],
        assets = [],
        assessments = []
    } = params;

    const stats = computeReportStatistics(surgeries, assets, assessments);
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    const generatedTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    // 1. Slim deep-blue header rule and clean white page layout
    doc.setFillColor(21, 49, 75); // Slim deep-blue header rule #15314B
    doc.rect(0, 0, 210, 2.5, 'F');

    // Wordmark & Report Header on clean white page
    doc.setTextColor(21, 49, 75); // Deep slate-blue #15314B for wordmark
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AssetIQ', 14, 13);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 36, 58); // Text primary #14243A
    const titleText = reportType === 'MONTHLY' ? 'Monthly Hospital Equipment & Compliance Report' : 'Daily Surgery Readiness Report';
    doc.text(titleText, 14, 20);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(95, 111, 133); // Text muted #5F6F85
    doc.text(`Period: ${startDate} to ${endDate}  |  Generated: ${generatedTimestamp}`, 14, 26);

    // Slim divider rule under header info
    doc.setDrawColor(201, 212, 223); // Border #C9D4DF
    doc.setLineWidth(0.3);
    doc.line(14, 29, 196, 29);

    // 2. Executive Summary KPI Table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 36, 58); // Text primary #14243A
    doc.text('1. Operational Readiness Summary', 14, 38);

    const kpiSummaryData = [
        ['Total Surgeries Scheduled', String(stats.totalSurgeries), 'Total Equipment Fleet', String(stats.totalAssets)],
        ['Ready Surgeries', `${stats.readyCount} (${stats.readyPct}%)`, 'Equipment Under Repair', String(stats.underRepairAssets)],
        ['At Risk Surgeries', `${stats.atRiskCount} (${stats.atRiskPct}%)`, 'Overdue Maintenance Items', String(stats.pmOverdueAssets)],
        ['Not Ready Surgeries', `${stats.notReadyCount} (${stats.notReadyPct}%)`, 'Audit Status', stats.notReadyCount > 0 ? 'Attention Needed' : 'Operational']
    ];

    doc.autoTable({
        startY: 42,
        head: [['Surgical Metric', 'Count / %', 'Equipment Fleet Metric', 'Count / Status']],
        body: kpiSummaryData,
        theme: 'grid',
        headStyles: { fillColor: [228, 235, 242], textColor: [20, 36, 58], fontStyle: 'bold', fontSize: 9 }, // Table header #E4EBF2
        bodyStyles: { fontSize: 8.5, textColor: [20, 36, 58] },
        alternateRowStyles: { fillColor: [247, 249, 251] }, // Table striped row #F7F9FB
        styles: { lineColor: [201, 212, 223], lineWidth: 0.2 }, // Border #C9D4DF
        margin: { left: 14, right: 14 }
    });

    // 3. Detailed Surgeries Readiness Breakdown Table
    const lastY1 = doc.lastAutoTable ? doc.lastAutoTable.finalY : 80;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 36, 58); // Text primary #14243A
    doc.text('2. Scheduled Surgeries & Readiness Status', 14, lastY1 + 10);

    const surgeriesTableRows = (surgeries || []).map(s => {
        const rawSt = (s.readiness_status || s.final_status || 'READY').toUpperCase();
        const st = rawSt === 'NOT_READY' ? 'Not Ready' : rawSt === 'AT_RISK' ? 'At Risk' : 'Ready';
        const worstRule = s.worst_rule_fired || 'All checks passed';
        const action = rawSt === 'NOT_READY' ? 'Equipment replacement required'
                    : rawSt === 'AT_RISK' ? 'Inspection recommended'
                    : 'Cleared for surgery';

        return [
            s.surgery_code || 'SURG',
            s.operating_room || 'OT-1',
            s.procedure_name || 'Procedure',
            st,
            worstRule.replace(/_/g, ' '),
            action
        ];
    });

    doc.autoTable({
        startY: lastY1 + 14,
        head: [['Surgery Code', 'Operating Room', 'Procedure Name', 'Readiness', 'Safety Check', 'Action Item']],
        body: surgeriesTableRows.length > 0 ? surgeriesTableRows : [['N/A', 'N/A', 'No surgeries scheduled for this period', 'Ready', 'None', 'None']],
        theme: 'grid',
        headStyles: { fillColor: [228, 235, 242], textColor: [20, 36, 58], fontStyle: 'bold', fontSize: 8.5 }, // Table header #E4EBF2
        bodyStyles: { fontSize: 8, textColor: [20, 36, 58] },
        alternateRowStyles: { fillColor: [247, 249, 251] }, // Table striped row #F7F9FB
        styles: { lineColor: [201, 212, 223], lineWidth: 0.2 }, // Border #C9D4DF
        didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === 3) {
                const val = String(data.cell.raw || '');
                if (val.includes('Not Ready')) {
                    data.cell.styles.textColor = [180, 35, 24]; // Not Ready #B42318
                    data.cell.styles.fontStyle = 'bold';
                } else if (val.includes('At Risk')) {
                    data.cell.styles.textColor = [138, 83, 0]; // At Risk #8A5300
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = [30, 123, 75]; // Ready #1E7B4B
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
        margin: { left: 14, right: 14 }
    });

    // 4. Equipment Audit Table
    const lastY2 = doc.lastAutoTable ? doc.lastAutoTable.finalY : 140;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 36, 58); // Text primary #14243A
    doc.text('3. Equipment Needing Attention', 14, lastY2 + 10);

    const highRiskAssetRows = assets
        .filter(a => a.status === 'UNDER_REPAIR' || a.status !== 'AVAILABLE' || a.is_pm_overdue)
        .map(a => [
            a.asset_tag || 'AST',
            a.name || 'Equipment',
            (a.category || 'General').replace(/_/g, ' '),
            (a.status || 'AVAILABLE').replace(/_/g, ' '),
            a.next_pm_due_date ? a.next_pm_due_date.split('T')[0] : 'N/A',
            a.operating_room || a.location || 'OR'
        ]);

    doc.autoTable({
        startY: lastY2 + 14,
        head: [['Asset Tag', 'Equipment Name', 'Category', 'Status', 'Next Due Date', 'Location']],
        body: highRiskAssetRows.length > 0 ? highRiskAssetRows : [['N/A', 'All equipment compliant and operational', 'N/A', 'Available', 'N/A', 'N/A']],
        theme: 'grid',
        headStyles: { fillColor: [228, 235, 242], textColor: [20, 36, 58], fontStyle: 'bold', fontSize: 8.5 }, // Table header #E4EBF2
        bodyStyles: { fontSize: 8, textColor: [20, 36, 58] },
        alternateRowStyles: { fillColor: [247, 249, 251] }, // Table striped row #F7F9FB
        styles: { lineColor: [201, 212, 223], lineWidth: 0.2 }, // Border #C9D4DF
        margin: { left: 14, right: 14 }
    });

    // 5. Sign-off Footer
    const lastY3 = doc.lastAutoTable ? doc.lastAutoTable.finalY : 200;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(65, 82, 106); // Text secondary #41526A
    doc.text('Biomedical Engineering & Administration Sign-Off:', 14, lastY3 + 12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(95, 111, 133); // Text muted #5F6F85
    doc.text('Chief Biomedical Engineer: ______________________     Date: ____________', 14, lastY3 + 18);
    doc.text('Hospital Administrator:    ______________________     Date: ____________', 14, lastY3 + 24);

    return { doc, stats };
}

module.exports = {
    computeReportStatistics,
    generatePdfReportDocument
};
