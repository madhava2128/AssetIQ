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
