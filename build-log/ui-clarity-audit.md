# AssetIQ — UI First-Glance Clarity Audit Report

**Audit Date:** 2026-09-19  
**Auditor:** Antigravity Autonomous Agent  
**Scope:** Evaluation of first-glance visual hierarchy, information density, plain language usage, status consistency, and empty states across all role interfaces (`hospital_admin`, `ot_admin`, `biomedical_engineer`).

---

## 1. Role Landing Page Visual Density & Focal Point Analysis

### 1.1 Hospital Admin Landing Page (`/overview`)
- **Initial Load Density:** Currently renders 7 major stacked panel components simultaneously on initial viewport (Role Banner, Control Room Safety Banner, Clinical Manifest Checklist, Overview KPI Cards, Surgeries Table, High Risk Asset List, and an 8-chart Recharts Analytics Grid).
- **Focal Point Check:** The `ControlRoomSafetyBanner` displays safety status, but it competes with 6 other heavy cards and tables, diluting immediate visual priority. The single critical question ("How many surgeries today have a problem, and how severe") is buried under dense telemetry listings.
- **Action Plan:** Establish a dominant top-level **Clinical Safety & Readiness Focal Header** that immediately highlights surgical blockage counts in plain English. Wrap the 8 analytical Recharts components under a collapsible **"Hospital Analytics & Telemetry Deep Dive"** progressive disclosure section so first load is clean, readable, and focused.

### 1.2 OT Admin Landing Page (`/surgeries`)
- **Initial Load Density:** Renders header, status filter bars, and a single monolithic surgeries list where all surgeries (READY, AT_RISK, NOT_READY, COMPLETED) are mixed together without visual prioritization.
- **Focal Point Check:** Lacks an immediate focal hero section. An OT Admin looking at the page cannot instantly spot which surgeries require urgent intervention (e.g. missing equipment or NOT_READY state) vs. surgeries that are cleared.
- **Action Plan:** Add an **"Action Required: Surgeries Needing Attention"** top hero section that pulls out any surgery with missing asset assignments or NOT_READY / AT_RISK status, visually separating them from normal scheduled surgeries.

### 1.3 Biomedical Engineer Landing Page (`/assets`)
- **Initial Load Density:** Renders header, category/status dropdowns, checkbox filter, and a 7-column asset inventory table.
- **Focal Point Check:** Equipment requiring immediate attention (Overdue PM, Under Repair, Open Breakdown Incidents) is submerged within the general asset inventory.
- **Action Plan:** Surface an **"Action Required: High-Risk & Overdue Equipment"** banner section directly above the asset table. Highlight overdue PM count, open breakdowns, and under-repair assets with quick action buttons ("Perform PM", "Resolve Incident").

---

## 2. Plain Language & Jargon Audit

1. **Raw Rule Engine Codes:**
   - *Current Bug:* `worst_rule_fired` renders raw internal identifiers like `RULE_1_STATUS_NOT_AVAILABLE`, `RULE_2_MAINTENANCE_OVERDUE`, `RULE_3_TYPE_MISMATCH`, etc.
   - *Fix:* Translate all rule codes to plain English explanation strings (e.g. `"Required equipment is currently under maintenance or repair"`).

2. **Raw Database Enums & Database Columns:**
   - *Current Bug:* Displaying raw enum strings like `CARDIAC_SURGERY`, `ANESTHESIA_MACHINE`, `UNDER_MAINTENANCE`, `IN_PROGRESS`.
   - *Fix:* Create utility mappers to format all enums into human-readable text (e.g. `"Cardiac Surgery"`, `"Anesthesia Machine"`, `"Under Maintenance"`, `"In Progress"`).

3. **Status Badges & Criticality Tags:**
   - *Current Bug:* Raw criticality badges (`CRITICAL`, `IMPORTANT`) without level descriptions or icons.
   - *Fix:* Update tags to include clear icons and plain text (e.g. `🚨 Critical (Level 1)`, `⚠️ Important (Level 2)`).

---

## 3. Status Visual Language Consistency Audit

- **Requirement:** Ensure `READY`, `AT_RISK`, and `NOT_READY` have uniform colors, glyphs, and wording across Overview, Surgeries, Assets, Maintenance, and PDF Reports.
- **Standardized Tokens:**
  - `READY`: Emerald styling (`bg-emerald-950/40 text-emerald-400 border border-emerald-700/60`), Glyph `✓`, Text `"READY — Cleared for Surgery"` or `"READY — Fully Compliant"`.
  - `AT_RISK`: Amber styling (`bg-amber-950/40 text-amber-400 border border-amber-700/60`), Glyph `⚠️`, Text `"AT RISK — Inspection Due"`.
  - `NOT_READY`: Rose styling (`bg-rose-950/40 text-rose-400 border border-rose-700/60`), Glyph `🛑`, Text `"NOT READY — Critical Blocker"`.

---

## 4. Empty State Audit

- **Current State:** Filter returns with 0 results render generic empty table cells or blank grey panels.
- **Fix Plan:** Implement informative empty states with clear iconography, plain English explanations (e.g. `"✓ All medical assets are fully compliant with PM schedules."`, `"No surgeries scheduled for this date."`), and quick action/reset filter buttons.
