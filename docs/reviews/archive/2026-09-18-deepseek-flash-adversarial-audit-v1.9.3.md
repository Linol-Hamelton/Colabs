# DeepSeek (deepseek-flash) - Adversarial Audit v1.9.3 Hardening & Performance Optimization

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5 (a6a6d61)  
**Working tree**: dirty  
**Reviewer**: DeepSeek (model `deepseek/deepseek-flash`, session `deepseek-flash-ebd6eb9397ed3784`)  
**Scope**: security | architecture | performance | edge-cases  
**Verdict**: FAIL  

> Independent audit of PROTO-DEC-0027, optimizations B1-B3 and polish C1-C2.
> No implementation files were modified by the reviewer; probes ran in throwaway
> fixtures under the OS temp directory except where noted.

---

## Executive Summary

The hardened core is largely sound: the fast-validator test stub cannot silently
replace the real validator for the validator-focused suites, the date-heading
regexes are not ReDoS-reachable, and both consumer repositories carry byte-identical
managed files with their local state intact. However, three defects survive
adversarial probing, and one of them is live in this repository right now:
`protocol.cjs doctor` reports "Issues Found" yet exits 0 (and CI never runs it),
`verify --deep` fails closed on a format-4 archived entry that lacks `parent-entry`
that this protocol itself produced, and the new liveness-first cleanup removes the
journal/snapshot of an active transient CLI session because the recorded PID is
already dead. The working tree currently fails its own deep audit (2 failures in
`doctor`) while `validate-protocol.ps1` is green, so the completion claim is not
supported by the repository's own integrity tooling.

---

## Scope and Evidence

- **Baseline Commit**: `a6a6d6194e08e313dce1328cc8af971962f91fa5`
- **Working Tree State**: `dirty` (63 commits; all v1.9.3/v1.9.4 work uncommitted)
- **Commands & Tests Executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> exit 0, `Protocol OK. 0 warning(s)`
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` -> 176 tests, 176 pass (8 runs; see F-007)
  - `node .ai/bin/protocol.cjs doctor` -> 2 `[FAIL]` lines, `Verdict: Issues Found (2 failure(s))`, **exit 0**
  - `node .ai/bin/protocol-handoff.cjs verify --owner gemini-381fc7800a864cde [--deep]` -> exit 1 (stale / broken archived parent)
  - `node .ai/bin/protocol-handoff.cjs verify --owner copilot-20260918-audit` -> exit 1 (entry changed after certification)
  - `setup-ai-protocol.ps1 -Target D:\Block-Puzzle|-Verify` and `-Target D:\VPN -Verify` -> exit 0
  - Independent SHA-256 comparison of all 18 `managed` files, source vs both consumers -> 0 drift
  - Regex timing probes on 200k-character adversarial headings -> <= 1 ms
  - `node --test` argv probe -> `process.argv[1]` is the test file path, so the stub exclusion works
- **Environment**: Windows 11 (win32), Node.js v22.21.0, Windows PowerShell 5.1, 32 logical processors (16-way node test concurrency).

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | HIGH | `doctor` reports failures but exits 0; CI never runs it | `.ai/bin/protocol.cjs:142-147` | False green: broken Merkle chain passes any CI/agent gate | Open |
| F-002 | HIGH | `verify --deep` hard-fails on format-4 archive entries without `parent-entry`; no repair path | `.ai/bin/protocol-handoff.cjs:252-255`, `.ai/ARCHIVE.md` | Protocol's own artifact permanently fails deep audit; backward-compat regression | Open |
| F-003 | HIGH | Liveness protection is ineffective for active transient CLI sessions | `.ai/bin/protocol-session.cjs:160-169,242-250` | `prune` quarantines and `cleanup-runtime --force` deletes a live session's journal/snapshot | Open |
| F-004 | MEDIUM | `--session-pid` cannot be used by a supervisor as documented | `.ai/bin/protocol-lock.cjs:164-172` | Contradicts PROTO-DEC-0027 item 2; flag is a no-op that only rejects foreign PIDs | Open |
| F-005 | MEDIUM | Release version not bumped, not committed, not tagged | `protocol-manifest.json:3`, `AGENTS.md:3`, `git tag` | v1.9.3/v1.9.4 work is indistinguishable by version from v1.9.0; PROTO-DEC-0025 item 1 unmet | Open |
| F-006 | MEDIUM | Evidence-chain desync present in the working tree | `.ai/worklog/copilot-20260918-audit.md`, `.ai/ARCHIVE.md` | Certified entries do not verify; hidden by F-001 | Open |
| F-007 | LOW | Regression suite is not deterministic under 16-way concurrency | `test-protocol.ps1:28-29` | 1 of 8 runs failed (`# fail 1`); not reproducible in 7 later runs | Open |
| F-008 | LOW | `protocol.cjs` silently ignores `--root` | `.ai/bin/protocol.cjs:284-286` | Commands only work when cwd is the protocol root | Open |
| F-009 | LOW | Decision template block escapes all validator checks | `.ai/DECISIONS.md:1322-1345` | A `Status: Accepted` block with a placeholder approver is never validated | Open |

### F-001 - [HIGH] - `doctor` is non-failing, and CI never invokes it

- **Location**: `.ai/bin/protocol.cjs:142-147` (and `:309-311`, no `process.exitCode`)
- **Confidence**: High
- **Reproduction**:
  ```powershell
  node .ai/bin/protocol.cjs doctor
  # ...
  # [FAIL] .ai/worklog/copilot-20260918-audit.md: historical entry at index 0 was changed after certification.
  # [FAIL] .ai/worklog/gemini-381fc7800a864cde.md: archived parent sha256:f5fd... has no parent-entry link.
  # Verdict: Issues Found (2 failure(s)). Inspect details above.
  # exit code: 0
  ```
  A fixture with `.ai/TASK.md` deleted (any `[FAIL]`) also exits 0.
- **Impact**: `doctor` is the only tool that runs `verifyJournalChain(..., deep=true)`
  over every journal (`protocol.cjs:130`). Because it always exits 0, a broken
  Merkle chain and post-certification entry edits are invisible to any caller that
  checks an exit code. PROTO-DEC-0025 item 2 states deep traversal is "enforced in
  `protocol.cjs doctor` and CI"; `.github/workflows/protocol.yml` never runs
  `doctor` and never passes `--deep`, so the enforcement claim is unmet on both
  halves. This is exactly the class of false signal DEC-0011 exists to remove.
- **Recommendation / Proposed Fix**:
  ```javascript
  console.log('\n======================================');
  if (issues === 0) {
    console.log('Verdict: Protocol Healthy. All checks passed.');
  } else {
    console.log(`Verdict: Issues Found (${issues} failure(s)). Inspect details above.`);
    process.exitCode = 1;
  }
  ```
  and add `node .ai/bin/protocol.cjs doctor` to the CI `checks` job.

### F-002 - [HIGH] - Deep archive verification breaks on this protocol's own format-4 history

- **Location**: `.ai/bin/protocol-handoff.cjs:252-255`; data: `.ai/ARCHIVE.md`
- **Confidence**: High
- **Reproduction**:
  ```powershell
  node .ai/bin/protocol.cjs doctor
  # [FAIL] .ai/worklog/gemini-381fc7800a864cde.md:
  #   archived parent sha256:f5fdb3be... has no parent-entry link.
  node .ai/bin/protocol-handoff.cjs verify --owner gemini-381fc7800a864cde --deep
  # exit 1
  ```
  In a throwaway fixture, removing every `- parent-entry:` line from a two-entry
  chain leaves `verify --owner ...` at exit 0 (in-journal links are skipped at
  `protocol-handoff.cjs:283`).
- **Impact**: `.ai/ARCHIVE.md` contains an entry with `- digest format: 4` but no
  `- parent-entry:` line. `verifyArchivedChain` treats format `< 4` as legacy and
  stops, but a format-4 record without a link is a hard failure with no recovery:
  `ARCHIVE.md` is append-only, `rehash` only rewrites the newest journal entry, and
  no command can add a missing archived link. The repository is therefore permanently
  red under `--deep`/`doctor` until a human edits an immutable archive. This is a
  backward-compatibility regression introduced by the fail-closed re-hashing in
  PROTO-DEC-0027 item 5: the same build that treats legacy evidence gently hard-fails
  on a format that was valid when it was written. The in-journal asymmetry is the
  mirror problem: active-journal links can be silently stripped.
- **Recommendation / Proposed Fix**: classify format-4-without-parent-entry as
  `legacy` with a warning (not `ok:false`) when it is the oldest reachable record,
  and require `parent-entry` for format >= 4 only when a later link points at it;
  make `verifyJournalChain` fail when a non-oldest section has a null `parentEntry`.

### F-003 - [HIGH] - Active transient CLI sessions are pruned and cleaned

- **Location**: `.ai/bin/protocol-session.cjs:160-169` (prune), `:242-250`
  (`cleanup-runtime --force`), snapshot PID written at `.ai/bin/protocol-hooks.cjs:407`
- **Confidence**: High
- **Reproduction** (fresh fixture; `protocol-session.cjs start` exits immediately):
  ```
  journal created: .ai/worklog/qwen-<hash>.md  true
  snapshot pid 22232 alive-now: false
  prune out: quarantined qwen-<hash>.md
  journal still exists: false
  snapshot exists before cleanup: true
  cleanup out: removed dead session snapshot qwen-<hash>.json
  snapshot exists after cleanup --force: false
  ```
- **Impact**: Every session is launched by a one-shot process, so the `pid` stored
  in `.ai/runtime/<owner>.json` is dead by the time any other command evaluates it.
  The liveness guard that `prune` and `cleanup-runtime --force` rely on can
  therefore never protect a real active session; it only protects the artificial
  case in `tests/session.test.cjs:146-148`, where the test writes
  `state.pid = process.pid`. A live hookless session that has not written its first
  entry loses its journal to `.ai/runtime/pruned/` the moment anyone runs `prune`,
  and its next `record --owner` fails with "No session journal for owner". This
  contradicts PROTO-DEC-0025 item 3 ("Active sessions are never pruned") and
  PROTO-DEC-0027 item 7 ("preserves snapshots unless process liveness is
  conclusively dead"). The tests assert the intended property, not the delivered one.
- **Recommendation / Proposed Fix**: stop equating the launcher PID with the
  session lifetime. Either persist a heartbeat/session TTL that `prune` consults,
  or make `prune` skip journals whose owner holds the lock or whose journal was
  touched within the session window; add a regression that starts a session in one
  process and prunes from another without injecting a PID.

### F-004 - [MEDIUM] - `--session-pid` is documented for supervisors but cannot be used by them

- **Location**: `.ai/bin/protocol-lock.cjs:164-172`; docs `AGENTS.md:243`, `QUICKSTART.md:62`; decision `PROTO-DEC-0027` item 2
- **Confidence**: High
- **Reproduction**: `acquire --owner x --session-pid <pid-of-a-supervisor>` is
  rejected with `must match this CLI process PID <cli-pid>`; passing the CLI's own
  PID is identical to the default and changes nothing.
- **Impact**: The option can never record a long-lived supervisor's PID, which is
  the only reason it exists. The lock's `pid` still ends up as the short-lived CLI
  process, so lock liveness remains exactly the P0 issue the prior Copilot audit
  raised, and any later session is told "Nothing is holding it now. Pass `--force`"
  for a lock that a transient session legitimately owns.
- **Recommendation / Proposed Fix**: accept an explicit `--session-pid` only when
  accompanied by `--supervisor` (or when the target PID is the parent process), and
  store `sessionPid` separately from `pid`; or drop the flag and the documentation
  claim until v1.9.4 persistence lands, so the docs do not promise a capability the
  CLI refuses.

### F-005 - [MEDIUM] - Version not bumped, committed or tagged

- **Location**: `protocol-manifest.json:3` (`1.9.0`), `AGENTS.md:3`, `setup-ai-protocol.ps1:1`; `git tag` stops at `v1.9.2`
- **Confidence**: High
- **Impact**: The audited work claims v1.9.3/v1.9.4, but every version string and
  the installed manifest still say 1.9.0, and the work is uncommitted and untagged.
  PROTO-DEC-0025 item 1 requires an atomic release commit with an annotated tag;
  this release has neither, so the "release" is not bisectable or reproducible by
  version. Consumers that auto-verify version strings will accept the new bytes as
  1.9.0.
- **Recommendation / Proposed Fix**: bump `protocolVersion` and all matching strings
  to the release number, commit atomically, and create the annotated tag.

### F-006 - [MEDIUM] - Evidence chain is desynchronized in the working tree

- **Location**: `.ai/worklog/copilot-20260918-audit.md`, `.ai/ARCHIVE.md`
- **Confidence**: High
- **Reproduction**: `verify --owner copilot-20260918-audit` -> "entry was changed
  after it was certified"; `verify --deep --owner gemini-...` -> broken archived
  parent; `verify --owner gemini-...` -> stale digest.
- **Impact**: A certified entry no longer matches its hash and an archived link is
  missing, so `record` would refuse to stamp new evidence that chains to them. The
  only tool that surfaces all three (`doctor`) exits 0 (F-001).
- **Recommendation / Proposed Fix**: re-record or `rehash` the affected journals
  with a stated reason, and repair the archive link before declaring completion.

### F-007 - [LOW] - Suite non-determinism under 16-way concurrency

- **Location**: `test-protocol.ps1:28-29`
- **Confidence**: Medium (one observed failure, not reproduced)
- **Reproduction**: first run of the session returned `# tests 176 / # pass 175 /
  # fail 1 / exit 1`; seven subsequent runs returned 176/176. The first run's TAP
  was truncated by the caller and the failing test id was not captured.
- **Impact**: A 16-way parallel suite that fails roughly one run in eight without a
  reproducible test id undermines the "suite passes" evidence used by handoff.
- **Recommendation / Proposed Fix**: capture and report the failing test id on
  non-zero exit, or serialize the known resource-heavy suites; keep the fixture
  root isolated per worker.

### F-008 - [LOW] - `protocol.cjs` ignores `--root`

- **Location**: `.ai/bin/protocol.cjs:284-286`
- **Confidence**: High
- **Impact**: `findRoot()` uses `process.cwd()`; the `--root` option passed by
  `tests/operator.test.cjs` is silently ignored. It works only because the test also
  sets `cwd`. Any caller relying on `--root` operates on the wrong checkout.
- **Recommendation / Proposed Fix**: parse `--root` and pass it to `findRoot`.

### F-009 - [LOW] - Template decision block bypasses validation

- **Location**: `.ai/DECISIONS.md:1322-1345`
- **Confidence**: High
- **Impact**: The `### DEC-nnnn` template has `Status: Accepted` and
  `Approved by: _a human name...`, but the validator's block regex requires digits
  (`DEC-(?<number>\d{4})`), so the placeholder is never inspected. The validator
  says "inspected 27 decision blocks", silently excluding it.
- **Recommendation / Proposed Fix**: place the template in `templates/ai/` only, or
  make the validator warn on a `DEC-nnnn` block.

---

## Deep Dives

### Fast-validator stub (Focus 1)

`shouldUseFastValidator` (`tests/helpers.cjs:61-70`) excludes
`validator`, `installer`, `upgrade`, `manifest`, `review-findings` and `codex`
by `process.argv[1]` basename. A `node --test` probe confirmed `process.argv[1]`
is the test file path, so the exclusion matches. The stub cannot produce a silent
false green in the validator suites, because those suites assert `exit 1` on
corrupted fixtures; if the stub were selected the assertion itself would fail. The
residual risk is coverage, not correctness: any new `validate-protocol.ps1` rule is
exercised only by the seven real-validator suites. `PROTOCOL_TEST_FAST_CHECKS` is
set and restored inside `test-protocol.ps1` (`:23-35`), so it does not leak to the
caller's shell. No finding.

### ReDoS on `DATE_HEADING_REGEX` (Focus 4)

The optional timezone group is bounded by `\d{2}` and the alternation is anchored
by ` - .+`; 200k-character adversarial inputs (`digits`, `mixed`, `dashes`,
`colons`) returned in 0-1 ms for both the anchored and `/m` variants. No
catastrophic backtracking. No finding.

### Consumer synchronization (Focus 5)

`-Verify` reports only structure and integration; it does not compare managed bytes
to the source manifest. An independent SHA-256 sweep of all 18 `managed` files
found 0 drift for both `D:\Block-Puzzle` and `D:\VPN`, and each installed
`contentDigest` self-checks clean. Local `DECISIONS.md` (45 KB / 9.7 KB), 16 and 22
journals, and 9 and 8 backup directories survive `-Force`. The claim holds; the
weaker `-Verify` semantics are worth documenting but are not a defect.

### Merkle chain semantics

`verifyJournalChain` recomputes each entry's body hash and validates a recorded
`parent-entry` only when it is a real hash. `reportOne` compares only the newest
entry's `parent-entry`. As demonstrated in F-002, deleting all `parent-entry` lines
or replacing them with `root`/`legacy` leaves `verify` at exit 0 in active journals,
because the entry hash excludes the Evidence block that carries the link. The
archive path fails closed (`:252-255`), creating the asymmetry that makes the
current repository red. A consistent rule is needed: every format-4 Evidence block
must carry a well-formed `parent-entry`, and `root`/`legacy` are valid only for the
oldest entry.

---

## Alternatives Considered & Trade-offs

- **Keep `doctor` advisory (exit 0) and rely on `validate-protocol.ps1`**: rejected
  because the validator does not run deep chain verification; the two failures in
  F-001/F-006 are invisible to it.
- **Treat all format-4 entries without `parent-entry` as legacy and stop**: rejected
  because it would let a stripped active-journal link pass; the correct fix is to
  distinguish "oldest reachable record" from "a link that should exist".
- **Trust the launcher PID for session liveness**: rejected by the evidence in
  F-003; the PID is always dead on exit, so it cannot express session lifetime.
- **Remove the fast-validator stub entirely**: rejected; it is a sound performance
  optimization once the excluded-suite list is maintained, and the suite runtime
  drop (404 s -> ~105 s here) is real.

---

## Recommendations & Actionable Plan

1. Make `doctor` fail (non-zero) when `issues > 0`, and add it to
   `.github/workflows/protocol.yml`; this unblocks detection of F-002/F-006.
2. Repair deep-verification backward compatibility: classify a format-4 archive
   record without `parent-entry` as legacy-with-warning when it is the oldest
   reachable node, and fail only on a genuinely expected-but-absent link; add a
   regression for a stripped in-journal `parent-entry`.
3. Replace PID-based session liveness with a session heartbeat/TTL (or a
   lock/journal-recency guard) and add a cross-process `prune` regression that does
   not inject `state.pid = process.pid`.
4. Resolve `--session-pid`: either support a supervisor PID explicitly or remove
   the flag and the `AGENTS.md`/`QUICKSTART.md` claim.
5. Bump the protocol version, commit the v1.9.3/v1.9.4 work atomically, and create
   the annotated tag required by PROTO-DEC-0025 item 1.
6. Re-record/rehash the affected journals and repair the archive link before any
   `Status: Completed` claim.

---

## References

- Decision blocks: `PROTO-DEC-0025`, `PROTO-DEC-0027` in `.ai/DECISIONS.md`
- Active task: `.ai/TASK.md`
- Associated session journal: `.ai/worklog/deepseek-flash-ebd6eb9397ed3784.md`
- Unified prompt: `docs/reviews/2026-09-18-unified-adversarial-audit-prompt.md`
- Prior related review: `docs/reviews/2026-09-18-copilot-audit-v1.9.md`
