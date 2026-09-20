# AssetIQ System Architecture

## Overview
AssetIQ bridges hospital medical asset tracking, surgical scheduling, deterministic compliance validation, and predictive maintenance.

```
+-----------------------------------------------------------------------------------+
|                                  Next.js App                                      |
|  (apps/web/app: UI & API routes /surgeries, /assets, /readiness, /alerts, /qr)   |
+--------------------------+--------------------------------+-----------------------+
                           |                                |
                           v                                v
         +----------------------------------+   +-----------------------+
         | Rules Engine (TypeScript)        |   | Python ML Service     |
         | (apps/web/lib/rules-engine)      |   | (services/ml)         |
         | Deterministic safety enforcement |   | Predictive risk model |
         +----------------------------------+   +-----------------------+
                           |                                |
                           +----------------+---------------+
                                            |
                                            v
                         +-------------------------------------+
                         | LLM Explanation Layer               |
                         | (apps/web/lib/explanation)          |
                         | Read-only explanation generation    |
                         +-------------------------------------+
                                            |
                                            v
                         +-------------------------------------+
                         | Supabase Database & RLS             |
                         | (supabase/migrations, policies)     |
                         +-------------------------------------+
```

## Core Architectural Boundaries
1. **Rules Engine & ML Separability**: The TS rules engine (`apps/web/lib/rules-engine/`) runs standalone. If the ML service is unreachable, the system degrades to rules-only mode.
2. **Read-Only Explanation Layer**: `apps/web/lib/explanation/` is strictly prohibited from mutating asset status or setting `final_status`.
3. **Database Schema & RLS**: All database changes are introduced via idempotent timestamped migration files in `supabase/migrations/` and RLS policies in `supabase/policies/`.
