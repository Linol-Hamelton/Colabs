# DeepSeek (deepseek-flash) - Item 2 (A2) Adversarial Audit

**Date**: 2026-09-19  
**Reviewed state**: anchor `8beca2b` (Item 1 committed) plus the uncommitted Item 2 changes; implementer receipt digest `c74f96bf...` superseded by the post-audit re-record  
**Reviewer**: DeepSeek (deepseek-flash), auditor/controller  
**Scope**: Item 2 (A2) - `record` ordering fix, journal cap invariant, CI escalation, documentation, AUD-4 tests; plus B5 approval provenance (owner-instructed alongside this audit)  
**Conflict declaration**: authored the specification (plan revision 2, A2/B5); no implementation role; whole-plan completion certification still requires a different reviewer.  
**Mode**: CERTIFYING  
**Verdict**: **PASS** - no blocking findings.  
**Superseded by**: `docs/reviews/2026-09-19-deepseek-flash-a2-audit-addendum.md` - section 3 (CI review) is superseded; the CI coverage regression requires the addendum's correction.

---

## 1. Independent verification

| Check | Result |
|---|---|
| `node --test tests/session.test.cjs` | 33/33 pass (includes both AUD-4 tests) |
| `node --test tests/handoff.test.cjs` | 32/32 pass (includes both Fact 11 tests) |
| `powershell .\test-protocol.ps1` | 216/216 pass, exit 0 |
| `powershell .\validate-protocol.ps1` | exit 0, 0 warnings, 29 journals |
| `verify --owner gemini-434bcd8012e0f38c --deep` | exit 0, matches the current tree |
| Shallow clone (`file://` depth 1) validator | exit 0, 0 warnings - the CI checkout mode is safe |

### Independent E2E probes (throwaway shallow clone carrying the new code, real validator, no `fastValidator` stub)

| Probe | Result |
|---|---|
| Near-cap: certified entry 1, journal built to 140 lines, new newest entry, `record --quick` | exit 0; final journal **85 lines** (auto-archive kept the newest entry); `verify --deep` exit 0 |
| Re-record same journal (newest entry already carries Evidence) | exit 0; journal stays **85 lines** (the projection replaces the Evidence block instead of appending); `verify --deep` exit 0 |
| Oversized single entry (135+ filler lines) | exit 1 with the exact message `journal entry is too long; split the entry before recording`; journal file SHA-256 **unchanged** |
| CI step simulation with a forced `[WARN]` (31 journals) | the workflow's exact PowerShell snippet detected `[WARN]` and produced a non-zero exit - escalation works |

## 2. Code review of the `record` fix

- `formatWithEvidence(text, block)` is extracted as a pure function; `attach` now delegates to it, so the pre-write projection and the write use the same code path - the class of bug that produced the 159/150 journal cannot recur through a second formatter.
- The projection computes the final length before writing; the single-entry check simulates the archived-parent marker and the preamble, so an unfixable entry fails cleanly instead of forcing a red tree.
- Forced archive uses `autoArchiveWorklog(root, path, 0, 1, owner)`: `maxLines=0` always triggers, `keep=1` keeps the newest entry - correct.
- After archiving, `findParentEntry` and `verifyJournalChain` are re-evaluated; `findParentEntry` falls back to `findArchivedParent`, so the fresh Evidence carries the archived parent hash and `verify --deep` stays green (probe 1).
- Failure path: the throw happens before `fs.writeFileSync(journalPath, projected)`, so nothing is written (probe 3).
- Import graph remains acyclic: handoff -> archive -> lock -> session -> hooks.

## 3. CI workflow review (`.github/workflows/protocol.yml`)

- Minimal, pinned to `actions/checkout@v4` and `actions/setup-node@v4`, Node 22, `windows-latest`, `permissions: contents: read`, 30-minute timeout.
- The warning/failure escalation is a PowerShell step that re-invokes the validator, prints the output and exits non-zero on `[WARN]` or `[FAIL]`; the capture semantics were verified locally (a child process's console output is captured into `$output`).
- The validator was run in a genuine shallow clone (the checkout mode GitHub uses) and passed, so no `fetch-depth` change is required.
- The regression suite runs as a second step. Expected duration ~2-4 minutes; `timeout-minutes: 30` is ample.

## 4. AUD-4 and documentation

- Corrupt-state test asserts quarantine **and** the absence of `[AUDIT WARN]`; lock-holder test acquires a real cooperative lock and asserts preservation under `prune --force`. Both match my earlier manual probes.
- PROTOCOL.md documents the record length guarantee, the pre-write archive, and the three-step cap procedure (`--keep 0` -> `prune` -> `git add -A`).

## 5. Findings (non-blocking)

| Id | Severity | Finding | Disposition |
|---|---|---|---|
| AUD2-1 | INFO | The pre-check's dummy archived-parent marker differs by at most 1-2 lines from the real marker inserted by `archiveWorklog`; the direction is conservative (overestimates), and the post-archive re-projection is authoritative | No action |
| AUD2-2 | INFO | Optional CI hardening: `fetch-depth: 0` and a `concurrency` group; neither is required (shallow clone verified) | Owner discretion |
| AUD2-3 | INFO | Probe fixtures produced `Agent line does not name the owner` warnings in the clone only; the repository has 0 warnings | No action |
| AUD2-4 | INFO | The workflow triggers on `push` to `main` and on all pull requests, including forks; the job uses no secrets, so fork runs are safe | No action |

## 6. B5 - approval provenance (owner-instructed, implemented in this audit)

- AGENTS.md section 2 now states that an owner approval given in a direct conversation may be transcribed into the block by the session holding the lock, with a provenance note, and that an agent must never write the line without a direct owner confirmation.
- `PROTO-DEC-0030` records the rule; `PROTO-DEC-0029` is its first application. The plan's proposed decision numbers were shifted (A4 -> `PROTO-DEC-0031`, A3 -> `PROTO-DEC-0032`, B registry -> `PROTO-DEC-0033`).
- Validator after the change: exit 0, 0 warnings, 30 decision blocks inspected, 29 committed blocks unchanged, AGENTS.md and the installer self-check PASS.

## 7. Recommendation to the owner

1. Commit Item 2 and B5 as two atomic commits (pathspecs below), then dispatch Item 3 (A4 capability/evidence discipline).
2. Item 2 commit: `.ai/bin/protocol-handoff.cjs`, `.github/workflows/protocol.yml`, `.ai/docs/PROTOCOL.md`, `tests/handoff.test.cjs`, `tests/session.test.cjs`, `.ai/worklog/gemini-434bcd8012e0f38c.md`, `.ai/worklog/deepseek-flash-8a681a17d5224abf.md`, `docs/reviews/2026-09-19-deepseek-flash-a2-audit.md`; message `fix(protocol): record pre-check and cap enforcement (A2)`. No push.
3. B5 commit: `AGENTS.md`, `.ai/DECISIONS.md`, `.ai/TASK.md`, `docs/reviews/2026-09-19-deepseek-flash-consolidated-v1.9.5-plan-r2.md`; message `docs: approval provenance rule (PROTO-DEC-0030)`. No push.
4. The owner pushes when ready; CI will run the validator and the suite on the push.

## 8. References

- Plan revision 2, section 4.A2 and fact 11; Item 1 audit `docs/reviews/2026-09-19-deepseek-flash-a1-audit.md`
- Implementation handoff: `.ai/worklog/gemini-434bcd8012e0f38c.md`
- Probe clone: `C:\Users\Dmitry\AppData\Local\Temp\kilo\v195probe4\repo` (shallow, throwaway)
