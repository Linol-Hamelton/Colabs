# Proposal: move the Node validator port earlier

- Status: proposal for the owner, not a decision (AGENTS.md section 2). Nothing here is
  implemented. The owner asked for it on 2026-09-25.
- Author: Claude, session `claude-c73232724159e5bd`, CORE-ARCH implementer (PROTO-DEC-0054).
- Date (UTC): 2026-09-25. Measurements were taken on the owner's Windows workstation at `e44686b`.
  They are recorded in `.ai/worklog/claude-c73232724159e5bd.md`, entry "Measured PowerShell cost
  in the check suite".

## 1. What the scripts cost now (measured)

| Measure | Value | Source |
|---|---|---|
| One `validate-protocol.ps1` run | 3 s average, 2-12 s | 240 Evidence blocks in journals and `.ai/ARCHIVE.md` |
| One `test-protocol.ps1` run | 224 s average, 70-670 s, 12.1 h in total | 194 Evidence blocks |
| Full suite today | 302-309 s wall, 376 tests, 16 workers | three runs at `e44686b` |
| PowerShell processes per suite run | 300, 686 s summed over workers | spawn probe (NODE_OPTIONS preload, scratch only) |
| of which the validator | 201 calls, 584 s, 2.9 s each | same |
| of which the installer | 86 calls, 96 s | same |
| Critical path | `tests/validator.test.cjs`: 283 s of 309 s, 34 tests in sequence | per-test durations |
| Cold start | powershell about 170 ms, node about 80 ms | five runs each |

Conclusion: the cost is not PowerShell's start-up. It is the 1,109-line validator, run once per
test as a separate process, and run by the slowest test file in sequence. Every `record` spends
about five minutes. Reliability costs as well:
- a cloud session has no PowerShell, so it cannot run the validator or record Evidence
  (`claude-ad7cc4169e888ea8`, "spawnSync pwsh ENOENT");
- three pieces of logic are kept "in parity" by hand between the PowerShell and Node copies:
  `protocol-handoff.cjs:889`, `protocol-archive.cjs:225`, `setup-ai-protocol.ps1:342`;
- `.ps1` files must stay ASCII-only because of Windows PowerShell 5.1 (DEC-0001).

## 2. What is already decided

- PROTO-DEC-0025 item 5: the validation engine moves to Node.js in v2.0, with differential
  verification against the PowerShell reference implementation.
- PROTO-DEC-0039 item 3: this is v2.0 scope, "scheduled after the pilot report".
- The pilots are on hold under PROTO-DEC-0048 (protocol first), so today that timing has no date.
- CORE-ARCH-1 H-13 rejected a rewrite in Python. Rust appears only in `OwnerIdeas/` seeds, which
  are the owner's hypotheses, not decisions. Node is the only runtime already required everywhere:
  hooks, `.ai/bin`, the suite.

## 3. The proposal

1. Timing. Move the Node validator port from "after the pilot report" to now, as its own task. It
   runs before CORE-ARCH package I-a lands kernel changes, so that later validator changes are
   written once, in Node, instead of twice.
2. Scope, step 1, the validator only:
   - `.ai/bin/protocol-validate.cjs` exports `validate(root, options)` and a CLI with the same
     output lines (`[PASS]`, `[WARN]`, `[FAIL]`, "Protocol OK. N warning(s).") and exit codes;
   - `validate-protocol.ps1` becomes a thin ASCII wrapper that calls it, so every documented
     command keeps working;
   - `protocol-handoff.cjs record` calls it directly, with no PowerShell, so cloud sessions can
     record Evidence.
3. The one check Node cannot do alone: the PowerShell syntax check of `.ps1` files uses
   PowerShell's own parser (`validate-protocol.ps1:243`). It stays a spawned check that runs when
   PowerShell exists and reports WARN "not run" when it does not. That affects only `.ps1` files,
   which step 1 reduces to wrappers.
4. Differential verification (PROTO-DEC-0025 item 5). While both engines exist, every validator
   test and the real tree run through both. Their normalised outputs (check lines and exit code)
   must be equal, and any difference fails the suite. The PowerShell engine is retired only after
   the diff has stayed green through certification.
5. Tests. Validator tests call `validate()` in-process; a few keep testing the CLI.
   `validator.test.cjs` is split so that the 16 workers share it.
6. Not in step 1: `setup-ai-protocol.ps1` (the installer, 412 lines, rarely run; a later step),
   and the launcher's process table (`Get-CimInstance` in the research launcher, a separate
   question).

## 4. Metrics, fixed before the work (targets are the implementer's proposal)

| Metric | Baseline | Proposed target |
|---|---|---|
| Suite wall time on this workstation | 302-309 s | 120 s or less |
| One validator run on the real tree | 3 s | 1 s or less |
| PowerShell processes per suite run | 300 | 20 or fewer (wrapper and syntax checks) |
| `record` in a session without PowerShell | exit 1 | exit 0 with an Evidence block |
| Differences between the engines | n/a | 0 on every fixture and on the real tree |

## 5. Options for the owner

- A (recommended): now, as a separate task in its own branch and worktree. The research jobs in
  `D:\Colabs` and the stage-2 review then never see a half-ported validator. The PowerShell
  validator is frozen for the duration, except for P0 fixes, which go into both engines.
- B: keep PROTO-DEC-0039 item 3 as it is (after the pilot report). Only the test split of
  section 3 item 5 is done now, as a low-risk cut of the suite's wall time. Its size is an
  estimate: the next-slowest test file takes 94 s. The validator stays at 3 s a run, and cloud
  sessions stay without Evidence.

## 6. Risks

| Risk | Cover |
|---|---|
| Behaviour drift between the engines | the differential run of section 3 item 4; retirement only after certification |
| Review cost: the validator is protocol core (PROTO-DEC-0038 item 1) | full prompt and report, two parallel independent certifiers (PROTO-DEC-0041 item 2). The owner reported on 2026-09-22 that Codex had exhausted its limits (`.ai/TASK.md` Open questions), so the second slot must be named first |
| A validator change during the port | freeze, as in option A; P0 fixes into both engines |
| Kernel changes of CORE-ARCH land in PowerShell first | order the port before package I-a (section 3 item 1) |

## 7. Draft block for the owner, if option A is chosen (not written to DECISIONS.md)

`### PROTO-DEC-00NN` / `Status: Accepted` / `Date: <answer date>` / `Reopen-trigger: owner-directive` /
`Supersedes: PROTO-DEC-0039 item 3, as to the timing of the Node validator only` /
Decision:
1. The Node validator of PROTO-DEC-0025 item 5 is built now, as its own task, before CORE-ARCH
   package I-a lands.
2. Step 1 is the validator only. `validate-protocol.ps1` becomes a wrapper. `record` runs without
   PowerShell. The PowerShell syntax check of `.ps1` files stays and reports WARN where PowerShell
   is absent.
3. Both engines run on every validator test and on the real tree until certification. Any
   difference fails the suite.
4. The PowerShell validator is frozen during the port except for P0 fixes, which go into both
   engines.
5. The metrics of section 4 are fixed before the work.
6. Roles: named by the owner in `.ai/TASK.md`.
`Approved by: RuslanFomenko (<words>, <date>; transcribed by <session>)`
