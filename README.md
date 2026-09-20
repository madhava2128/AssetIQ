# AssetIQ — Intelligent Hospital Asset & Surgical Readiness Platform

## Core Value Proposition

AssetIQ is an enterprise hospital asset management and surgical readiness system designed to guarantee equipment availability and patient safety for operating rooms. By orchestrating real-time asset tracking, deterministic safety rule validation, machine learning preventive failure risk assessment, and transparent AI decision explanations, AssetIQ prevents surgical delays, avoids equipment failures during procedures, and ensures every scheduled surgery has fully verified, operational medical assets.

## Repository Layout

```
assetiq/
├── apps/
│   └── web/                          # Next.js web application & API routes
├── services/
│   └── ml/                           # Python ML service (predictive risk modeling)
├── supabase/
│   ├── migrations/                   # Sequential schema migrations
│   ├── seed/                         # Idempotent seed data & scripts
│   └── policies/                     # Row Level Security (RLS) policies
├── build-log/                        # Automated stage reports & verification logs
├── docs/                             # Architecture & system documentation
└── .github/
    └── workflows/                    # CI/CD workflows
```

## Global Operating Principles
- **Patient-Safety First**: Ambiguity defaults to safe states (e.g. unknown asset status defaults to "Under Repair").
- **Deterministic Rules & ML Separability**: Deterministic rules engine operates independently of ML inference service.
- **Fail-Safe & Degraded Execution**: Unreachable or failing sub-services trigger loud alerts and degrade to safety-first fallbacks.
- **Strict Verification**: Every stage includes automated test coverage before completion.
