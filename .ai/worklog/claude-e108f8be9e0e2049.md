# Worklog: claude-e108f8be9e0e2049

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

<!-- archived-parent: sha256:86088e95ce6ea1171cba13253637e34151e89d998551be1fc5d14084fc5e7e50 -->

---

## 2026-09-27 - Kernel package I-a landed on branch core-landing-ia; perf wave 1 on perf-wave-1

Agent: claude-e108f8be9e0e2049 (Claude Code, model `claude-opus-5-5`; CORE-ARCH implementer on the
owner's direct instruction; usage not exposed by the client)

Action: caller graph of `.ai/bin`: ledger, verdict, scope and index were never wired into any runtime
path; `.ai/core/` did not exist. Built `protocol-core.cjs` (A-8: lint, catalog, check-links, lcc,
verify) per the approved SPEC-protocol-core; moved the 0061-approved L0 records and P-L0-008 into
`.ai/core/`, fixed the three form defects lint found, activated them on PROTO-DEC-0061, generated
CATALOG, wired `verify` into the validator, registered manifest entries and `tests/core.test.cjs`.
Wrote `docs/core-arch/SCRIPTS-REFERENCE.md`. Perf wave 1 Commit A: write-based fixture seeding
(`e752c0c`, byte-identity test) and the split of `validator.test.cjs` into four files (`64043a3`).

Result: kernel lint 0 findings; check-links 0 dangling; `LCC: L0 | 1=pass | 2=pass | 3=pass | 4=pass
| 5=pass | 6=pass | 7=manual | 8=pass | 9=pass` (design mode; strict fails on forward references to
L1/L2, as PROTO-DEC-0061 foresaw). Validator on the branch: kernel PASS, `Protocol OK. 0 warning(s)`.
core tests 13/13; manifest 20/20 on perf-wave-1. The SessionStart kernel injection was refused by
the permission classifier and is left to the owner.

Next step: owner decides the landing of I-a into v2.0.0 (0061 item 2 orders it after stages 2-3;
certifiers Codex and Gemini per 0055 item 3) and Commit B (A-1); perf benchmarks of wave 1 run next.

Open: full-suite result of core-landing-ia recorded in the commit message; perf M1 not yet measured.

Evidence:
- anchor: 606b23a88ba17bfd1ad7f751f7d3f01916cd7cd4, uncommitted changes present
- digest: sha256:54bba176fd7a9b28c0d107a8e0bb4ae546eb48ac6232055bc829ded71b62fbfd over 760 tracked and untracked files
- digest format: 4
- recorded: 2026-09-27T17:26:52.486Z by claude-e108f8be9e0e2049
- entry hash format: 2
- entry: sha256:c8d5d8a3848b4c0d068a095e06c0bed195de03534066a853bb8e54c1bb86ee83 of this entry without this block
- parent-entry: sha256:07b38623d9b37b7ac2235051f6919a65d5f4c6d8821733bf7ab14a5b6b94dba9
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 7s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
## 2026-09-27 - Audit report aligned with the owner's review; harness persisted in tools/perf

Agent: claude-e108f8be9e0e2049 (Claude Code, model `claude-opus-5-5`; supervisor; usage not
exposed by the client)

Action: applied the owner-relayed review to the report: wave 1 split into Commit A (fixture seeding
by write + split of `validator.test.cjs`, no semantic change) and Commit B (A-1 with a failing
regression test first, high-risk path); probability claims replaced by milestones M1 <= 300 s,
M2 <= 120 s, M3 P90 <= 60 s with a stop rule at M1; LPT removed. Persisted the harness as
`tools/perf/` (preload, bench, report, evidence-history, ps-profile, gate-slice, fixtures, README,
baseline JSON); every tool was run once; `ps-profile.cjs` runs the installer only with `-Verify` and
aborts on any repository change.

Result: tools reproduce the baseline (gate slice 17/17 with 0 mismatches, cold read 1,407 vs 117 ms,
18 validator subprocesses). Corrected factorial (seeding method as the fixture factor): PS+cpSync
5,673 ms, PS+written 4,377, Node+cpSync 1,962, Node+written 806 per iteration. Files ASCII, LF, no
BOM; validator `Protocol OK. 0 warning(s)`.

Next step: the owner names who executes Commit A and Commit B and on which branch; nothing in
`tests/` or the validator was changed by this session.

Open: wave 1 is not started; `tools/perf/`, the report, this journal and `.ai/ARCHIVE.md` (auto-
archived journal entries) await a commit.

Evidence:
- anchor: 606b23a88ba17bfd1ad7f751f7d3f01916cd7cd4, uncommitted changes present
- digest: sha256:3ca3a70242ab2ca51ab2e123da93cab146aa0b7902b428dab75eb06a3547e41d over 759 tracked and untracked files
- digest format: 4
- recorded: 2026-09-27T16:57:18.416Z by claude-e108f8be9e0e2049
- entry hash format: 2
- entry: sha256:07b38623d9b37b7ac2235051f6919a65d5f4c6d8821733bf7ab14a5b6b94dba9 of this entry without this block
- parent-entry: sha256:9ba2fcf6feb052bf3b5a6111ffed4045a6881a8cece66a25cbf8db2b55bbdf30
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 5s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
## 2026-09-27 - Performance audit against the owner's 105-section criteria; manifest incident

Agent: claude-e108f8be9e0e2049 (Claude Code, model `claude-opus-5-5`; supervisor; usage not
exposed by the client)

Action: re-ran the PowerShell assessment as a hypothesis test: 5 full suites at `606b23a` (c16, c8,
c24, c16, c8) with a spawn/fs preload and WMI sampling, Evidence statistics (384 validator / 235
suite lines), per-call `Invoke-External` log, installer section profile (`-Verify` only), in-file PS
microbenchmarks, a completion-gate Node slice with parity against the PS validator (17 steps), a
2x2 factorial, a cold-read test, git-template and file-order checks. Report rewritten (never
committed before): `docs/reviews/2026-09-27-claude-powershell-refactor-assessment.md`.

Result: suite 543-664 s (median 600, CV 7.3 %); `validator.test.cjs` is the critical path; 24
workers do not help (H6). Gate slice 71.5 s -> 23 ms, identical FAIL sets. Copy-API fixture seeding
costs 1.32 s per fixture in first-read scanning vs 0.12 s written. Node's runner re-sorts files by
name. Incident (mine): an instrumented installer copy overwrote `protocol-manifest.json` 18:22-18:25
local; restored from HEAD (backup byte-identical), `.ai/backups/` removed. A killed benchmark leaked
`tests/fixtures/dispatch/t25-launch.md` (removed); my runs' temp directories removed. Tree clean
apart from this journal and the report.

Next step: owner decides on the report's option I and step 1 of J; persisting the scratch harness
into the repository is a separate ask.

Open: <60 s is a projection, not a measurement; 10-run stability, per-test pyramid map and
mutation equivalence beyond the gate slice are not done; another session running the validator
during 18:22-18:25 could have seen a false FAIL from the overwritten manifest.

Evidence:
- anchor: 606b23a88ba17bfd1ad7f751f7d3f01916cd7cd4, uncommitted changes present
- digest: sha256:02cf5b32f2b3ac3805fd95a882fc71c3fa5a02f635ec1cad604ef63b7dbb7599 over 749 tracked and untracked files
- digest format: 4
- recorded: 2026-09-27T16:25:39.079Z by claude-e108f8be9e0e2049
- entry hash format: 2
- entry: sha256:9ba2fcf6feb052bf3b5a6111ffed4045a6881a8cece66a25cbf8db2b55bbdf30 of this entry without this block
- parent-entry: sha256:86088e95ce6ea1171cba13253637e34151e89d998551be1fc5d14084fc5e7e50
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 6s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
