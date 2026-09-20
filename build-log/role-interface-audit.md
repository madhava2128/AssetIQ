# AssetIQ — Role Interface Audit Log

## 1. Baseline Navigation Audit Findings
- **Current Architecture**: The top navigation bar in `apps/web/app/(dashboard)/layout.tsx` is static and identical across all authenticated sessions.
- **Exposed Links for All Roles**:
  - `Dashboard` (`/overview`)
  - `Surgeries` (`/surgeries`)
  - `Assets Catalog` (`/assets`)
  - `Maintenance` (`/maintenance`)
  - `PDF Audit Reports` (`/reports`)
- **Identical Interface Flaw**: Regardless of whether a user logs in as `hospital_admin`, `ot_admin`, or `biomedical_engineer`, the UI renders the exact same layout and navigation links. Role differentiation was previously limited to disabling/enabling specific buttons within individual pages.

---

## 2. Per-Role Route Authorization Audit & Plan

### 2.1 `hospital_admin` — Executive Control Suite
- **Landing View**: `/overview` (Executive Dashboard)
- **Authorized Links**:
  - `Dashboard` (`/overview`) — Full analytics, Recharts visualizations & readiness telemetry
  - `Surgeries` (`/surgeries`) — Full CRUD + OT scheduling
  - `Assets` (`/assets`) — Full CRUD equipment management
  - `Maintenance` (`/maintenance`) — Full PM compliance & breakdown logging
  - `Reports` (`/reports`) — PDF audit report generation
- **Action**: Retain full navigation access.

### 2.2 `biomedical_engineer` — Biomedical Equipment Workspace
- **Landing View**: `/assets` (Equipment Catalog)
- **Authorized Links**:
  - `Assets` (`/assets`) — Full CRUD equipment registration & PM controls
  - `Maintenance` (`/maintenance`) — Full PM compliance & breakdown incident logging
  - `Surgeries` (`/surgeries`) — **Read-Only Schedule View** (to monitor equipment requirements per surgery)
- **Prohibited Routes (Must be EXCLUDED from nav & route-guarded)**:
  - `Dashboard` (`/overview`)
  - `Reports` (`/reports`)
- **Action**: Build `BiomedicalEngineerNav` bar. If direct navigation to `/overview` or `/reports` is attempted, redirect immediately to `/assets`.

### 2.3 `ot_admin` — OT Surgical Scheduling Workspace
- **Landing View**: `/surgeries` (Surgery Schedule)
- **Authorized Links**:
  - `Surgeries` (`/surgeries`) — Full CRUD surgery creation, editing, cancellation, and OT allocation
  - `Assets` (`/assets`) — **Read-Only Asset View** (for checking equipment availability during scheduling)
  - `Maintenance` (`/maintenance`) — **Read-Only Maintenance View** (for checking PM status during scheduling)
- **Prohibited Routes (Must be EXCLUDED from nav & route-guarded)**:
  - `Dashboard` (`/overview`)
  - `Reports` (`/reports`)
- **Action**: Build `OtAdminNav` bar. If direct navigation to `/overview` or `/reports` is attempted, redirect immediately to `/surgeries`.
