# AssetIQ — Dashboard Readability Audit

**Date:** October 19, 2026  
**Auditor:** Antigravity Autonomous Agent  
**Goal:** Comprehensive audit of the current hospital_admin dashboard structure, questions answered, cognitive hierarchy, jargon, and chart readability issues prior to reordering into a coherent story.

---

## 1. Inventory of Current Dashboard Blocks (In Current Order)

| # | Component Name | Current Title & Heading | Question It Answers | Cognitive / Readability Role |
|---|---|---|---|---|
| 1 | `ControlRoomSafetyBanner` | "Action required: X surgeries are not ready" | Are there immediate surgery blockers today? | Urgent safety alerts, but placed before the viewer even knows how many surgeries are scheduled today. |
| 2 | `HospitalAnalyticsTelemetrySection` | "Hospital Analytics" | What are the executive metrics (surgeries ready, equipment health, PM compliance, downtime)? | High-level management summary, but disconnected from date filtering and missing direct drill-down links. |
| 3 | `SurgeryOverviewCards` | "Surgery Readiness Summary" | How many surgeries are Ready, At Risk, or Not Ready? | Redundant count cards (duplicates information already shown in blocks #1 and #2). Contains an isolated date picker. |
| 4 | `ClinicalManifestView` | "Clinical Equipment Manifest & AI Verification" | What is the equipment status and AI explanation for a selected procedure? | Detailed manifest with split view; dense technical rules and checklist. |
| 5 | `SurgeriesTable` | "Scheduled Surgeries" | What are all surgeries scheduled for the selected day? | Complete tabular schedule, but duplicates list items from block #4. |
| 6 | `HighRiskAssetList` | "Equipment Needing Attention" | Which physical assets have overdue maintenance, open repairs, or contract gaps? | Essential operational list, but buried far down below full tables. |
| 7 | `Detailed Analytics Charts` (collapsible) | "Detailed Analytics Charts" (8 Recharts components) | Deep-dive telemetry trends (capex/opex, risk tiers, downtime, compliance). | Hidden behind a toggle button. Charts lack takeaway-focused titles, clear captions, and intuitive groupings. |

---

## 2. Identified Readability & Storytelling Problems

### A. Lack of a Single Linear Narrative
- **The answer is not given first:** A first-time reviewer or hospital director must piece together numbers from block #1 (alerts), block #2 (analytics card 1), and block #3 (KPI cards) to answer the fundamental question: *"What is today's situation?"*
- **Scattered Date Filters:** The date picker lives inside block #3 (`SurgeryOverviewCards`), but block #1 (`ControlRoomSafetyBanner`) and block #2 (`HospitalAnalyticsTelemetrySection`) also depend on dates, leading to disorientation.
- **Cognitive Overload Before Action:** The viewer is presented with technical checklists and raw telemetry before seeing a prioritized, plain-sentence "Needs attention now" list.

### B. Unclear, Redundant, or Jargon-Heavy Elements
1. **Clinical Manifest Jargon:** Terms like "Clinical Manifest Split View", "Control Room Safety Banner", "Rule 7 Passed", and "Telemetry Section" sound like backend code names rather than clinical office tools.
2. **Duplicated Counters:** Total surgeries, Ready, At Risk, and Not Ready counts are rendered in 3 separate places on the same screen with differing visual treatments.
3. **Missing "Why":** Charts are grouped in an undifferentiated 8-chart grid titled "Detailed Analytics Charts" without explaining *why* the user is looking at them or what decisions they inform.

### C. Chart Readability & Formatting Issues
1. **Data-naming Titles:** Titles such as *"Capex vs Opex Expenditure Analysis"* and *"Equipment Risk Tier Scoring"* name the data instead of stating the insight or takeaway (e.g., *"Maintenance costs are within budget"* or *"Equipment risk distribution"*).
2. **Missing Captions:** Charts do not explain what the axes mean or what to look for (e.g. *"Taller bars mean more downtime for that equipment category"*).
3. **Axis Formatting:**
   - Downtime hours were previously displayed in raw hours instead of days.
   - Financial expenditure in Capex/Opex lacked Indian numbering formatting (₹ Lakhs / ₹ Crores).
4. **Missing Empty States:** Several charts render empty axes or blank SVG viewports when filtered data has zero entries instead of a friendly plain message (e.g. *"No breakdowns recorded this month"*).
5. **Traceability Gaps:** Summary cards with rates (e.g. "Equipment readiness 88%", "Maintenance on track 92%") had no explanation of how they were calculated and did not link to filtered asset or surgery lists.

---

## 3. Reordering Plan: One Story, Top to Bottom

We will reorder and refine the dashboard into a cohesive story:

1. **Page Header:**
   - Heading: **"Dashboard"**
   - Subtitle: *"Surgery readiness and equipment health at a glance."*
   - Timestamp: *"Data as of 19 Oct 2026, 7:54 pm"*
   - Date range selector: **Today**, **Next 7 days**, **This month** (applied consistently across all date-dependent blocks).
   - Header link: *"How to read this page"* (opens and smoothly scrolls to the decision panel).
2. **Today's Situation (The Answer First):**
   - Single wide status panel with a large plain sentence: e.g. *"14 of 18 surgeries today are ready. 3 need attention and 1 is not ready."*
   - Clickable status pills (Ready, At Risk, Not Ready) linking to `/surgeries` filtered by that status.
3. **Needs Attention Now:**
   - Plain-sentence prioritized list (max 5 rows + "View all" link).
   - Each row states: Surgery, date/time, operating room, plain-language problem, and actionable recommendation (e.g. *"Biomedical engineering should replace the backup battery on Ventilator V-102"*).
   - Friendly empty state: *"Nothing needs attention right now."*
4. **Hospital Analytics (Management Numbers):**
   - 6 plain cards: Surgeries Ready, Equipment Readiness Rate, Equipment Needing Attention, Maintenance on Track, Downtime in Days, Recent Breakdowns.
   - Large numbers in `tabular-nums`, plain sentence of meaning, trend compared with last period.
   - Clickable to filtered underlying lists.
   - "How is this calculated?" popover/toggle for each card.
5. **Why It Happens (Supporting Charts):**
   - Grouped under 3 plain subheadings:
     - **Equipment health:** Equipment by status, overdue maintenance compliance, highest-risk equipment.
     - **Breakdowns and downtime:** Breakdown incidents over time, downtime in days by equipment type.
     - **Usage and departments:** Equipment utilization rate, surgery readiness by surgical department.
   - Plain takeaway titles and one-line captions explaining what to look for.
6. **How AssetIQ Decides (Explanation Panel):**
   - Collapsed by default near bottom.
   - 3-step decision flow:
     1. Safety rules check first
     2. Risk prediction adds a second opinion (live state: Active or Learning)
     3. Plain explanation generated by AI
   - Legend of 4 readiness statuses and 24-hour verification note.
7. **Other Roles' Landing Pages:**
   - `ot_admin` (`/surgeries`): Single plain-sentence summary strip above calendar.
   - `biomedical_engineer` (`/assets`): Single plain-sentence summary strip above equipment catalog.
