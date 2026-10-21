# AssetIQ Architecture & Cleaned Project Layout

## 1. System Overview
AssetIQ bridges hospital medical asset tracking, surgical scheduling, deterministic compliance validation, QR-based equipment lifecycle management, and predictive maintenance.

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

---

## 2. Cleaned Repository Folder Structure

```
assetiq/
├── apps/
│   └── web/                                # Next.js 14 web application & API routes
│       ├── app/                            # App Router routes
│       │   ├── (dashboard)/                # Protected dashboard pages
│       │   │   ├── assets/                 # Assets list & [id] details/QR view
│       │   │   ├── breakdowns/             # Incident breakdown overview (redirects to maintenance)
│       │   │   ├── engineer-dashboard/     # Biomedical engineer dedicated workspace
│       │   │   ├── maintenance/            # Preventive & corrective maintenance records
│       │   │   ├── overview/               # Hospital administrator executive overview
│       │   │   ├── reports/                # Operational PDF reports view
│       │   │   └── surgeries/              # Operating room surgery calendar & detail
│       │   ├── api/                        # Server-side API Route Handlers
│       │   │   ├── alerts/                 # Equipment alerts endpoint
│       │   │   ├── assets/                 # Asset CRUD, maintenance & incident endpoints
│       │   │   ├── auth/                   # Server login & session validation endpoints
│       │   │   ├── explanation/            # Readiness narrative explanation endpoint
│       │   │   ├── readiness/              # Readiness evaluation & ML health status
│       │   │   ├── reports/pdf/            # Server-streamed PDF report generation
│       │   │   ├── surgeries/              # Atomic surgery scheduling & template endpoints
│       │   │   └── users/roles/            # Role metadata & authorization endpoint
│       │   ├── login/                      # Hospital authentication portal
│       │   ├── qr/[assetTag]/              # Backward-compatible QR redirect route
│       │   ├── globals.css                 # Global styles, type scale & print stylesheet
│       │   └── layout.tsx                  # Root layout & typography configuration
│       ├── components/                     # Modular React UI components
│       │   ├── assets/                     # QrLabelCard with SVG QR code & print styling
│       │   ├── dashboard/                  # Hospital analytics, telemetry & clinical views
│       │   ├── forms/                      # Incident report modal, maintenance & surgery forms
│       │   ├── surgeries/                  # Surgery calendar & detail panels
│       │   └── ui/                         # Brand logo & role workspace navigation header
│       ├── lib/                            # Business logic & utilities
│       │   ├── alerts/                     # Telemetry alert engine
│       │   ├── explanation/                # Narrative generation & rule templates
│       │   ├── rules-engine/               # Deterministic surgical readiness rules engine
│       │   ├── scanner/                    # Production URL validation & QR scanner abstraction
│       │   ├── supabase/                   # Supabase clients & mock database fallback
│       │   ├── auth.ts / auth.js           # RBAC permissions & session validation
│       │   ├── db.ts                       # PostgreSQL connection pooling with session auth
│       │   ├── formatters.ts               # Clean date, downtime, currency formatters
│       │   ├── ml-client.ts                # HTTP client for Python ML microservice
│       │   ├── surgeries-shared.ts         # Shared multi-role read path with LEFT JOIN
│       │   └── tokens.ts                   # Design system token definitions
│       ├── styles/
│       │   └── tokens.css                  # CSS custom property token definitions
│       ├── tests/                          # Jest test suites (8 suites, 33 tests)
│       ├── package.json                    # Clean web dependencies (zero unused packages)
│       ├── tailwind.config.js              # Design token Tailwind theme extension
│       └── tsconfig.json                   # TypeScript configuration with @/* alias
├── services/
│   └── ml/                                 # Python FastAPI microservice
│       ├── src/                            # Feature engineering, training, inference
│       │   ├── features/                   # Asset telemetry feature pipeline
│       │   ├── inference/                  # Risk predictor using trained XGBoost model
│       │   ├── models/                     # Serialized model artifact (.joblib)
│       │   └── main.py                     # FastAPI HTTP server endpoints
│       ├── tests/                          # Pytest test suite for ML inference
│       └── requirements.txt                # Python dependencies
├── supabase/
│   ├── migrations/                         # Sequential, immutable SQL migrations
│   ├── policies/                           # Row Level Security (RLS) policies
│   └── seed/                               # Idempotent seed dataset (seed.sql)
├── scripts/
│   ├── verify-surgery-flow.js              # Standing safeguard: 22/22 permission & flow checks
│   └── verify-self-check.js                # E2E multi-role surgery & permission verification
├── docs/                                   # Architecture & engineering rules
│   ├── architecture.md                     # System boundaries & operational principles
│   └── engineering-rules.md                # 6 standing engineering rules
├── build-log/                              # Immutable stage reports, audits & verification logs
├── .github/                                # CI/CD workflow configurations
├── vercel.json                             # Multi-service Vercel deployment specification
├── AGENTS.md                               # Standing rules for autonomous AI agents
├── README.md                               # Cleaned root repository documentation
└── .gitignore                              # Comprehensive ignore rules (logs, caches, Android)
```

---

## 3. Core Architectural Boundaries
1. **Rules Engine & ML Separability**: The TS rules engine (`apps/web/lib/rules-engine/`) runs standalone. If the ML service is unreachable, the system safely falls back to rules-only mode.
2. **Read-Only Explanation Layer**: `apps/web/lib/explanation/` is strictly prohibited from mutating asset status or setting `final_status`.
3. **Database Schema & RLS**: All database changes are introduced via idempotent timestamped migration files in `supabase/migrations/` and RLS policies in `supabase/policies/`.
4. **QR Architecture**: QR payloads encode strictly `{NEXT_PUBLIC_APP_URL}/assets/{assetId}` via `getAppBaseUrl()` in `apps/web/lib/scanner/index.ts`. No secrets, tokens, or mutable metadata are embedded.
