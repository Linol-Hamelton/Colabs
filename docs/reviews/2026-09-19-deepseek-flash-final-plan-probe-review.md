# DeepSeek (deepseek-flash) - Final v1.9.5 Plan Probe Review

**Date**: 2026-09-19  
**Reviewed commit**: `a6dbf8ce18be52c8f5d95ae837d71af5d7c63cac`  
**Working tree**: dirty (certification package, council reviews, journals uncommitted)  
**Reviewer**: DeepSeek (deepseek-flash)  
**Scope**: council / adversarial plan review (probes only)  
**Verdict**: PROBES ONLY - non-certifying. Conflict declared: this reviewer's model authored the plan under review; per the dispatch conflict rule it may submit probes but not certify.

---

## Executive Summary

The plan's factual core survives probing: the digest excludes `.ai/runtime/`, `.ai/worklog/` and `.ai/ARCHIVE.md`; a review write stales receipts; a journal write and a `git commit` do not; C0 reproduces exactly as described (live supervisor ignored by `prune` and `cleanup-runtime --force`); `--supervisor-pid` is blocked for shell-spawned orchestrators; the gate checks existence and verdict only, and the cited Copilot receipt is stale.

Three material corrections/deltas are required before the owner freezes the plan: (1) the journal count is **30, not 29** - already at the cap, and this very review round pushes it to 31 and produces the first validator warning, so A2 archival must precede A3's freeze/record; (2) A1's `--force` rule ("overrides only false/null") contradicts branch (iv), and `prune` currently quarantines a foreign-host empty journal, which a literal call-site rename will not fix; (3) the A1 acceptance matrix can be passed by an implementation that ignores `supervisorPid` entirely if the test artifacts are fresh, because the recency fallback then covers branches (i) and (iii). The plan's freeze ordering is correct but its freeze definition is too narrow: any untracked non-ignored file anywhere in the tree stales receipts, and one was written by a concurrent reviewer during this probe.

---

## Scope and Evidence

- **Baseline Commit**: `a6dbf8ce18be52c8f5d95ae837d71af5d7c63cac`; tag `v1.9.4` -> `c71bdcf`.
- **Working Tree State**: `dirty`. The anchor digest moved twice during the session (`095e583f...` -> `59c1fa71...`) because another reviewer (Gemini) wrote `docs/reviews/2026-09-19-gemini-final-plan-adversarial-review.md` at 02:35 local.
- **Probe environment**: throwaway clone at `C:\Users\Dmitry\AppData\Local\Temp\kilo\v195probe\repo` (HEAD `a6dbf8c`, 99 files). No implementation file, test, `.ai/` shared document or plan was modified in `D:\Colabs`; probes ran in the clone. The only real-repo writes were this report, this reviewer's own journal, and the Evidence block attached by `record`.
- **Environment**: Windows (win32), Node.js v22.21.0, PowerShell 5.1.
- **Commands executed** (representative; full output in the Deep Dives):
  - `node .ai/bin/protocol-handoff.cjs state|record|verify|rehash` (clone and real repo)
  - `git clone --depth 1 --no-hardlinks D:\Colabs <temp>`
  - `node .ai/bin/protocol-session.cjs start|prune|cleanup-runtime` (clone)
  - `node .ai/bin/protocol-lock.cjs acquire|clear-lock|status` (clone)
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` (real repo, exit 0)
  - `git ls-files --cached --others --exclude-standard` (journal count)

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | HIGH | A1.4 `--force` rule contradicts branch (iv); `prune` alien to null-liveness | `protocol-session.cjs:182`, plan A1.1/A1.4 vs matrix (iv) | A literal `isSessionAlive` rename keeps `prune`'s `=== true` polarity and quarantines foreign-host journals; the force rule would delete foreign-host snapshots the current code preserves | Open |
| F-002 | HIGH | A1 acceptance matrix is gameable by a supervisor-blind implementation | plan A1 acceptance (i)-(v) | Branches (i)/(iii) pass with fresh mtimes even if `supervisorPid` is never read; no branch ages artifacts to force the supervisor path; no branch tests `--force` against a live supervisor | Open |
| F-003 | MEDIUM | Journal count is 30, not 29; the review round itself triggers the first warning | plan section 0 row 4, A2; `validate-protocol.ps1:215-217` | Plan's own council round (one journal per reviewer) pushes the count to 31; validator warns; A2 must precede A3 | Open |
| F-004 | MEDIUM | Freeze definition is too narrow for the digest's real scope | plan A4 step 3 | Any untracked non-ignored file anywhere stales receipts, not only `docs/reviews/**`/TASK; a concurrent reviewer staled all five receipts during this probe | Open |
| F-005 | MEDIUM | Gate freshness needs a receipt-owner field; none exists today | plan A4/C8; `templates/reviews/REVIEW.md` | No review carries `Session:`; without `Session:`/`Receipt-Owner:` the validator cannot verify the cited owner; legacy and transcriber paths are unspecified | Open |
| F-006 | MEDIUM | Registration is not an authenticated boundary under any supervisor policy | `protocol-session.cjs:64-79`, `protocol-lock.cjs:170-211` | A hand-written state file with a borrowed live PID and its own nonce acquires and pins the lock as "registered"; (a) adds no new class but needs a documented anti-accident caveat | Open |
| F-007 | LOW | H1 metrics have no instrumentation; stop telemetry is dead code | `protocol-session.cjs:122-125`; plan C1 | `durationSec`/`changedFiles` are never produced by `hooks.run`; token/repeat-read metrics need harness data; thresholds cannot be measured as planned | Open |
| F-008 | LOW | Registry format/ownership not settled; mutable twin risk | plan B3/B4 | Two hand-maintained copies drift; a mutable registry can flip `frozen` status without a decision; no lock/append-only rule stated | Open |
| F-009 | LOW | MCP risk register misses the degradation and version-pinning cases | plan C2 | The worst failure is not only stale data but gate behavior changing with server state; require identical gate semantics without MCP | Open |
| F-010 | LOW | A6 docs must change with A1, not after | `.ai/docs/PROTOCOL.md:68-73, :194-196` | Docs state the own/ppid restriction and "active live session ... is never pruned" - the latter is the invariant C0 breaks | Open |
| F-011 | INFO | Fact corrections: receipt states and counts | plan sections 0/1 | All five cited receipts verify as stale at probe time (tree moving); `deepseek-flash-ebd6eb9397ed3784` went stale as well | Open |

---

## Deep Dives

### V1 - Digest and freeze mechanics (clone, end to end)

All values are `node .ai/bin/protocol-handoff.cjs state` digests unless noted.

| Step | Mutation | Digest | fileCount | verify --owner probe-runner |
|---|---|---|---|---|
| 0 | clone baseline | `736b246c...85c9d6` | 99 | n/a |
| 1 | untracked `probe-artifact.md` added | `638f4fe6...ca9e0` | 100 | n/a |
| 2 | journal `probe-runner.md` added | `638f4fe6...ca9e0` | 100 | n/a |
| 3 | `record --quick` | `638f4fe6...ca9e0` | 100 | exit 0 |
| 4 | `rehash --reason "probe neutrality test"` | `638f4fe6...ca9e0` | 100 | exit 0 |
| 5 | sibling journal `probe-sibling.md` added | `638f4fe6...ca9e0` | 100 | exit 0 |
| 6 | `git commit` of `probe-artifact.md` (`a6dbf8c` -> `7ac8c45`) | `638f4fe6...ca9e0` | 100 | exit 0 |
| 7 | `docs/reviews/probe-review.md` added | `5f6393f9...4fb22` | 101 | **exit 1 stale** |
| 8 | the same file staged (`git add`) | `5f6393f9...4fb22` | 101 | exit 1 (content already changed) |
| 9 | `.ai/ARCHIVE.md` appended | `5f6393f9...4fb22` | 101 | exit 1 |
| 10 | `.gitignore` appended | `c29bdad6...1e3a3` | 101 | exit 1 |
| 11 | `.ai/TASK.md` appended | `00bef21b...070d4` | 101 | exit 1 |

Conclusions:

- Journal writes, `rehash`, auto-archive targets (`.ai/ARCHIVE.md`, journal, `.ai/runtime/*.tmp`, the lock), `prune` quarantine moves (`worklog` -> `runtime/pruned`) and `git commit`/staging are **digest-neutral**. The plan's correction of the interim claim is confirmed.
- `docs/reviews/**` (untracked, non-ignored) and `.ai/TASK.md` are **digest-visible**; one review write staled a fresh receipt (exit 1 with the exact recorded/current digests).
- The freeze definition must cover the **whole tree**: `probe-artifact.md` at the repo root changed the digest (step 1), and `.gitignore` is tracked (step 10). `.gitignore` covers `*~`, `*.swp`, `.vscode/`, `.idea/`, `.ai/scratch/`, `.ai/runtime/`, `.ai/backups/`, but not `*.tmp`, `*.bak`, `*.orig`, editor recovery files. A freeze checklist should require "no writes anywhere except `.ai/worklog/`, `.ai/runtime/`, `.ai/ARCHIVE.md`" and compare `state` before and after the record pass.
- The `dirty: true` flag persists while only excluded files (journals) are untracked, but `verify` compares the digest only, so this is cosmetic.

### V2 - C0 reproduced, and the matrix attacked

**prune** (clone): session started with a live supervisor, then the transient `start` process exited:

```
supervisorPid=16236 alive=True ; recorded pid=25048 alive=False
--- prune (no --force)
quarantined probesup-fda0575311b94745.md
1 journal(s) quarantined.
--- after prune: journal=False state=False quarantined=True
```

**cleanup-runtime** (clone):

```
supervisorPid=4712 alive=True ; recorded pid=2584 alive=False
--- cleanup-runtime WITHOUT --force (expect 0 cleaned)
0 file(s) cleaned.   state present=True
--- cleanup-runtime --force
removed dead session snapshot probecln-9e7f849e21ffce9d.json
1 file(s) cleaned.   state present after force=False journal present=True
```

**Foreign host** (clone): after patching the state hostname,

```
--- cleanup-runtime --force
0 file(s) cleaned.   foreign state preserved=True
--- prune
quarantined probefrn-398a91d04f8460c6.md
2 journal(s) quarantined.   foreign journal present=False quarantined=True
```

Attack results against the design:

- Stale-but-alive supervisor PID outliving its session: supervisor-first makes the session look alive; only residue results (an empty journal and a snapshot), no content loss. Recycled PID: same until the recycled PID dies; only residue.
- Foreign host: `cleanup-runtime` preserves (`null` !== `false`), but `prune` quarantines because its skip condition is `isProcessAlive(state) === true`. A mechanical call-site rename keeps this polarity and **fails matrix branch (iv)** for journals. The plan must state the three-way rule: `true` -> skip, `false` -> prune, `null` -> policy choice (recommend preserve for both, or document the asymmetry deliberately).
- `--force` + live supervisor: A1.4 says `--force` "overrides only `false`/`null`", i.e. it would delete a foreign-host snapshot that the current code and matrix (iv) preserve. Either keep `null` preserved under `--force` or introduce an explicit flag; the plan must not leave this to the implementer.
- Touched empty journal of a dead session: the planned recency fallback would keep it; that is only hygiene (the file is empty). Live hookless session idling past the window: loses its snapshot baseline (later Stop warns "no snapshot"); its journal with entries is protected by `holdsContent`. 15 minutes is acceptable for both artifacts **only** because the window covers just the pre-first-entry gap; it is unmeasured and should be recorded as a heuristic, with the window applied to empty journals and snapshots, never to journals with entries.

### V3 - Supervisor policy: concrete attack or none

Under current policy (b), `start --supervisor-pid <explorer>` is rejected:

```
AI protocol: Invalid --supervisor-pid: 9972 must be current process PID or parent PID (process.ppid)
```

But a **hand-written state file** is accepted by every policy, because registration is not authenticated:

```
$nonce = <64 hex>; @{ version=1; pid=$exp; hostname=<host>; nonce=$nonce; supervisorPid=$exp; files=@{}; entryHash=$null } -> .ai/runtime/probehand.json
acquire --owner probehand --session-pid 9972 --session-token $nonce
{ "acquired": true, "sessionPid": 9972, "tokenHash": "5a08a5dc..." }
acquire ... --session-token wrongtoken   -> Invalid --session-token: token does not match registered session
status                                   -> "alive": true, "liveness": "registered"
acquire --owner other-owner              -> Live registered lock held by process 9972
clear-lock                               -> Process 9972 still holds the registered lock
clear-lock --force --reason "probe cleanup" -> [AUDIT WARN] ... { "cleared": true, "forced": true }
```

So a session can pin the shared lock as "registered live" while a borrowed long-lived PID exists, after its own processes exit; recovery requires `--force --reason`, which is audited. This attack exists today under (b) whenever the parent is long-lived (IDE/daemon), and the state file is forgeable regardless. Therefore **policy (a) reintroduces no new class**: it fixes the real external-orchestrator case (fact 3 confirmed: `cmd`-spawned `start` rejects its caller PID), keeps the nonce/token binding, and widens only the accidental pinning surface. Recommendation: (a) plus a PROTOCOL.md note that registration is an anti-accident guard; optionally a registered-liveness TTL (e.g., report `registered` locks older than `STALE_AFTER_MINUTES` as stale-eligible with a reason) to bound residue.

### V4 - Gate freshness: validator-embedded verify vs `gate-check`

Measured cost: `verify --owner <X> --deep` is 385-482 ms per owner including Node startup; `verify` never invokes the validator, so there is no recursion. All five cited reviews currently fail:

```
[copilot-...] exit=1 ... evidence is stale. Recorded 93533bf2..., tree is now 59c1fa71...
[claude-123ff4a27989f7af] exit=1 ... Recorded 4718e9e7..., tree is now 59c1fa71...
[mistral-vibe-7d4ebdb4413f0de0] exit=1 ... Recorded 1eee0f11..., tree is now 59c1fa71...
[gemini-2da9379ddcd247b6] exit=1 ... Recorded b71fec44..., tree is now 59c1fa71...
[deepseek-flash-ebd6eb9397ed3784] exit=1 ... Recorded 095e583f..., tree is now 59c1fa71...
```

`grep ^Session:` over `docs/reviews/*.md` returns nothing: no review has a receipt-owner field today.

Recommendation: **`gate-check` subcommand** (option b), invoked once by the validator in the source role, advisory in installed projects. It centralizes: TASK gate parsing, `Session:`/`Receipt-Owner:` extraction, `verify --deep` per cited owner, legacy grandfathering (missing field + pre-v1.9.5 review date -> WARN, not FAIL), transcribed reviews (the transcriber's owner carries the receipt; review is `non-certifying` unless the review itself is certifying), and exit codes. The validator already shells out to Node (`--check`), so this adds no new dependency class. Tests in `tests/gate.test.cjs`: valid receipt passes; stale receipt fails; missing field on a new review fails; missing field on a legacy review warns; transcriber receipt routing; installed role advisory; re-record after gate fill passes only if the tree is unchanged.

### V5 - Decision freeze and registry

Loopholes and tightening:

- `metric-drop` with no baseline: require `metric`, `baseline` (value + measurement command + date), `threshold`, and a new measured value recorded in the registry; otherwise not a trigger.
- `new-external-data` with an unreproducible source: require either an in-repo reproduction command or an artifact committed under `docs/reviews/` with a content hash and retrieval date. A blog post alone does not qualify.
- `owner-directive` unrecorded: require a dated quote and channel in the registry; TASK.md is replaceable and is not a durable record.
- The registry is mutable; the decision log's integrity check (`validate-protocol.ps1` compares committed blocks) does not cover it. Either make the registry append-only with the same `git show HEAD:` diff check, or generate it from an append-only event file under `.ai/`.
- Format: one Markdown table `id | status | reopen-trigger | frozen-at | supersedes | evidence`; if a JSON twin is kept, generate it from the Markdown in CI and never hand-edit both. Coverage check: the validator extracts every `### (PROTO-)?DEC-\d{4}` id from `.ai/DECISIONS.md` and asserts set equality with the registry; missing/extra ids FAIL in the source role. No decision block is edited.

### V6 - Acceptance criteria and sequencing

A failing implementation the current criteria would accept: an `isSessionAlive` that **ignores `supervisorPid` and returns true whenever the artifact mtime is within `RECENT_WINDOW`, else false**. With fresh test artifacts it passes (i) and (iii); (ii) fails only if the test is run immediately after start (fresh -> recent -> preserved) - so even (ii) can pass if the harness does not age artifacts. Fix: age journals/snapshots beyond the window in branches (i), (ii) and (iv); add branch (vi) `--force` + live supervisor must preserve; add branch (vii) no state file -> prunable. For A4, an implementation that verifies **any** journal rather than the cited owner's would pass until a test holds a fresh receipt for a different owner and a stale one for the cited owner. For A5, a forged `Mode: CERTIFYING` line passes unless the test requires the certificate receipt as well.

Sequencing corrections: move **A2 before A3** (count is 30/30; one new journal warns); move the PROTOCOL.md liveness/documentation update (A6) into A1's step, because the docs state the invariant the code currently breaks; add the review-template field (`Session:`/`Receipt-Owner:`) as an A4 prerequisite; enumerate the DEC entries (A1, A4, A5, and B4 if enforced) before the freeze.

### V7 - Omissions and hypotheses

- H1 metrics: only handoff completeness (complete entry + Evidence) is measurable today. `protocol-session.cjs:122-125` prints telemetry only when `result.durationSec`/`result.changedFiles` exist, and `hooks.run` never sets them - dead branch. Time-to-first-edit needs session `startTime` vs first changed-file mtime (noisy), context assembly time needs hook timing, and token/repeat-read metrics need orchestrator-level accounting. Recommend an instrumentation prerequisite inside C1 before the pilot, and pre-registered thresholds (primary: >=25% median token reduction with n>=10 per arm and no handoff-completeness regression; secondary guardrails for the rest).
- MCP risk register: add (i) MCP-unavailable must degrade to identical gate semantics (no protocol decision may cite MCP-derived evidence), (ii) server/tool version pinning and reproduciblity of derived indexes (disposable under `.ai/runtime/`), (iii) MCP tool output can carry secrets into journals (the secret scanner covers known patterns only), (iv) capability asymmetry between MCP-enabled and MCP-less agents must not change gate weight (ties to A5).
- The 35%/50%/65% forecast is correctly marked unverified in the plan; `grep '35%|50%|65%' .ai/DECISIONS.md` returns nothing, so no decision text carries it as fact.
- Track B omissions: registry ownership/lock rule; status transitions need dated events, not edits. Track C omissions: pilot design (single consumer confounds; pre-register tasks and alternate arms).

---

## Answers to the Plan's 14 Council Questions

1. **Supervisor registration policy** - Recommend (a) any live PID > 4. Probes show registration is not authenticated (forged state file acquires the lock), so (a) adds no attack class, keeps the nonce/token binding, and unblocks external orchestrators (fact 3). Strongest counter: (a) makes accidental pinning trivial (any long-lived PID), so document the anti-accident model and consider a registered-liveness TTL.
2. **RECENT_WINDOW and scope** - Recommend 15 minutes, applied to empty journals and snapshots only; journals with entries are protected by `holdsContent`. Strongest counter: the value is unmeasured; any fixed window will occasionally strand or clean an artifact - record it as a heuristic and keep it owner-settable.
3. **Ordering vs excluding TASK.md from the digest** - Keep TASK.md in the digest; make the freeze cover the whole tree and compare `state` before/after. Excluding TASK.md would make the gate unfalsifiable. Strongest counter: the whole-tree freeze is brittle against accidental writes (observed: a concurrent reviewer staled all five receipts) - mitigate with a freeze checklist and a final single re-record pass, not by weakening the digest.
4. **Validator-embedded verify vs `gate-check`** - Recommend `gate-check` subcommand with validator invocation in the source role and advisory behavior in installed projects (measured 0.4s/owner, no recursion); tests mandatory. Strongest counter: new code surface to keep in sync; but the alternative spreads evidence logic into PowerShell regexes.
5. **Journal cap invariant** - Keep the 30-file cap with release-gate archival. The count is already 30/30; the next session warns. Strongest counter: the cap churns every council round; raising it to 40 buys headroom at the cost of a larger injected context (SessionStart reads 8 journals).
6. **Registry format and location** - Markdown table under `docs/decisions/REGISTRY.md` as the single hand-edited source; generate the JSON twin in CI if needed; add an append-only/ownership rule. Strongest counter: a new mutable shared file escapes the existing lock convention; place the event log under `.ai/` or extend the lock rule explicitly.
7. **Validator enforcement of `Reopen-trigger:`** - Advisory first; enforce coverage via the registry, not by adding mandatory fields to append-only decision blocks. Strongest counter: enforcement via a mutable registry is weak unless the registry is append-only and checked.
8. **H1 metrics and thresholds** - Keep handoff completeness and context-assembly time; gate token/repeat-read metrics on orchestrator instrumentation; pre-register thresholds (primary >=25% token reduction, no completeness drop). Strongest counter: a single-consumer pilot risks confounds; use crossed A/B with pre-registered tasks.
9. **MCP policy ownership** - Protocol source owns the invariants (gate independence, no auto-install, evidence provenance); orchestrator config owns per-project enablement/profiles. Strongest counter: split ownership can drift; mitigate by having the validator check declarations where present.
10. **Push timing and signing** - Push after the certification commit without rewriting history; signing optional unless the owner already has key infrastructure. Strongest counter: pushing immediate stale receipts is acceptable only because receipts are tree-anchored and re-recordable.
11. **Capability matrix source of truth** - Orchestrator profile, recorded as `Mode: CERTIFYING|ADVISORY` in the review header plus the owner receipt; gate-check treats only CERTIFYING + verifying receipt as gate weight. Strongest counter: text declarations are forgeable; only the receipt makes them meaningful.
12. **Certification-journal exemption** - Keep the rejection (no exemption). Archival preserves history in `.ai/ARCHIVE.md`; exemptions require validator exceptions and uncap a directory. Strongest counter: certification journals are the audit trail - but archiving keeps them, and `prune` only removes content-free files.
13. **Migration note for pre-v1.9.5 sessions** - Required as documentation only: `isSessionAlive` falls back to `pid`, then recency; old dead states behave as today. Strongest counter: a long-idle hookless session may lose its empty journal/snapshot silently; acceptable because `holdsContent` and the window bound the damage.
14. **v1.9.5 as the vehicle** - Approve v1.9.5; C0 is a small, testable correctness fix against PROTO-DEC-0025 item 3, and Track B/C are hypotheses that should not delay it. Strongest counter: consecutive governance cycles risk churn, but the plan explicitly deprioritizes them.

---

## Delta List

- **ADD** A1 branch (i)/(iv) with artifacts aged beyond `RECENT_WINDOW`; branch (vi) `--force` + live supervisor preserves; branch (vii) missing state file is prunable - closes the supervisor-blind loophole (F-002).
- **ADD** an explicit three-way rule for `null` liveness in both `prune` and `cleanup-runtime`, and one rule for `--force` + `null` - removes the A1.4/branch (iv) contradiction (F-001).
- **ADD** `Session:`/`Receipt-Owner:` to `templates/reviews/REVIEW.md` and a `gate-check` subcommand with `tests/gate.test.cjs` - the gate cannot verify a citation without an owner (F-005).
- **ADD** an append-only rule and validator coverage check for the registry - a mutable registry can rewrite `frozen` status (F-008).
- **ADD** an instrumentation prerequisite and pre-registered thresholds to C1 - the telemetry branch is dead today (F-007).
- **ADD** MCP degradation/version-pinning/secret-flow items to the C2 risk register (F-009).
- **REWORD** plan section 0 row 4 and section 1: 30 journals (not 29), at the cap, one warning away.
- **REWORD** A4 step 3 "freeze" to "no writes anywhere outside `.ai/worklog/`, `.ai/runtime/`, `.ai/ARCHIVE.md`; verify `state` before/after" (F-004).
- **REWORD** A1.1 "replace the four `isProcessAlive` call sites" to specify the polarity change per call site, including prune's `=== true` skip (F-001).
- **REPRIORITIZE** A2 archival before A3 freeze/commit; put the PROTOCOL.md update (A6) inside A1 (F-003, F-010).
- **REMOVE** the JSON twin unless generated from the Markdown - two hand-maintained copies drift (F-008).

---

## Alternatives Considered & Trade-offs

- **Alternative A**: Exclude `.ai/TASK.md` from the digest to break the circularity - **Rejected because**: it makes the gate self-certifying; any post-hoc edit would still verify.
- **Alternative B**: Keep own/ppid-only supervisor registration - **Rejected because**: it permanently blocks external orchestrators (reproduced with `cmd`), and it does not improve security since the state file is forgeable.
- **Alternative C**: Raise the journal cap to 40 - **Rejected because**: it grows the injected context and postpones the mechanical archival step the plan already prescribes.
- **Alternative D**: Validator-embedded verification (option a) - **Rejected because**: evidence logic belongs with the evidence module; PowerShell regexes over review headers would duplicate it and be harder to test.

---

## Recommendations & Actionable Plan

1. Apply the delta list to the plan text before the owner freezes it.
2. Freeze in the plan's order (reviews and TASK first), but with the whole-tree definition; only then record receipts owner by owner and run `verify --deep` for each cited owner.
3. Land A1 with the seven-branch test matrix, the three-way liveness rule and the `gate-check` tests in the same change as the PROTOCOL.md update.
4. Archive journals to `.ai/ARCHIVE.md` before the freeze (A2) so the release gate can hold 0 warnings and <= 30 journals.

---

## References

- Plan under review: `docs/reviews/2026-09-19-deepseek-flash-final-followup-plan-v1.9.5.md`
- Dispatch prompt: `docs/reviews/2026-09-19-final-plan-adversarial-review-prompt.md`
- Decisions: `PROTO-DEC-0025`, `PROTO-DEC-0028` in `.ai/DECISIONS.md`
- Active task: `.ai/TASK.md` (v1.9.4 Completed; v1.9.5 not yet opened)
- Reviewer journal: `.ai/worklog/deepseek-flash-8a681a17d5224abf.md`
- Probe fixture: `C:\Users\Dmitry\AppData\Local\Temp\kilo\v195probe\repo` (throwaway clone; not part of the repository)
