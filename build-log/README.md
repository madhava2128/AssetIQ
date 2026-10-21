# AssetIQ Build Log & Stage Reports

This directory stores authoritative stage checkpoint reports (`stage-N-report.md`) created after each stage completion.

## Operating Principles Checklist
- [ ] Self-checkpoint reports written after every stage (`build-log/stage-N-report.md`)
- [ ] Conservative, safety-first interpretations & default fallbacks logged
- [ ] Fail-safe & degradation mechanisms verified
- [ ] Automated tests passing before stage completion
- [ ] Idempotent migrations, scripts, and data pipelines
- [ ] Secrets restricted to environment variables (`.env.example` documented)
- [ ] Atomic git commits per stage

## Standing Engineering Rules
All future modifications touching surgeries, roles, authentication, RLS policies, or Supabase client setup must strictly comply with the standing engineering rules in [docs/engineering-rules.md](file:///Users/madhava/Desktop/AssetIQ/docs/engineering-rules.md) and pass `npm run verify:surgery-flow` (22/22 checks) before being marked complete. Writes must be atomic, unconfirmed UI is strictly prohibited, read paths must be shared, and service-role keys must remain isolated from app code.
