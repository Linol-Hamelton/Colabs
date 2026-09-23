# Worklog: gemini-4261c9c2e2da03ac

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-23 - Remediated round-2 certification findings F-001..F-004

Agent: gemini-4261c9c2e2da03ac

Action: Remediated all four reproduced findings from `docs/reviews/2026-09-23-deepseek-batch-certification-round2.md`.
1. F-001: in `.ai/bin/protocol-verdict.cjs`, replaced substring matching with single path normalisation (strip leading `./`, backslashes to `/`, casefold) and exact segment matching against the recorded PROTO-DEC-0038 item 1 list (`.ai/`, `.claude/`, `hooks`, `validator`, `gates`, `security`, `data`). Removed invented substring matching.
2. F-002: in `.ai/bin/protocol-scope.cjs`, removed filesystem mtime sorting of worklog journals in `checkIndependence`. Derived candidate producer solely from declared repository inputs (`--producer`, review Producer/Candidate header, or candidate journal Evidence owner); exits 2 when producer cannot be determined.
3. F-003: in `validate-protocol.ps1`, restored heading-only block termination in decision parsing and stripped single trailing `---` line before body comparison. Added positive regression test (editing after an internal `---` is caught with exit 1).
4. F-004: in `.ai/bin/protocol-scope.cjs`, defined touched set as tracked changes (`git diff -z`) plus untracked files (`git ls-files --others --exclude-standard -z`), excluding the input scope/forbidden query files. Updated `docs/specs/2026-09-23-executable-rulebook-spec.md` section 5 item 1 accordingly.
5. Extended `tests/rulebook.test.cjs` with 6 new tests covering F-001 negative forms (`./` prefix, casefold, false-protection words), F-002 determinism under swapped mtimes and missing producer, and F-004 untracked forbidden files (all 26/26 tests passing). Extended `tests/validator.test.cjs` with Direction D (positive regression for edit after internal `---`). Pruned empty journals to restore validator 0 warnings.

Result: All four findings reproduced and verified closed. `validate-protocol.ps1` reports Protocol OK with 0 warnings. `tests/rulebook.test.cjs` 26/26 tests pass.

Next step: Run full regression suite and record evidence block via `protocol-handoff.cjs record`. Return completed remediation report to controller and owner.

Open: None for this remediation batch. Candidate deliverables remain uncommitted pending independent re-certification.

Evidence:
- anchor: 82bf99a8e2bfcde3ff375b9995f3ab45edb7ddc5, uncommitted changes present
- digest: sha256:aff02f1f7317ecb26239d683cb20861c7c14facbce48eb9df414029f42a5eafb over 313 tracked and untracked files
- digest format: 4
- recorded: 2026-09-23T03:07:57.745Z by gemini-4261c9c2e2da03ac
- entry hash format: 2
- entry: sha256:0f0236a44c7b8b2398dbff70fd8dfb871235cf22a7695e054fe3f293245f16c7 of this entry without this block
- parent-entry: root
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 3s
- test-protocol.ps1: exit 0 in 308s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
