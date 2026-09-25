# Fix response: CORE-ARCH stage 2 and the research/launch packages, attempt 1 (CB-01..CB-26)

- Author: Claude, session `claude-ad7cc4169e888ea8`, implementer (PROTO-DEC-0054). Certifies nothing.
- Model and effort: `claude-opus-5-5`, effort `xhigh`, set at launch, unchanged in the session
  (PROTO-DEC-0055 item 5). Client: Claude Code, cloud session on branch `v2.0.0`.
- Date (UTC): 2026-09-25. Mode: IMPLEMENTER fix response (not a review, no verdict token).
- Baseline: `ab23c63` (the owner's snapshot of the reviewed tree `4ded1be` + dirty). Fixes are the
  23 commits `14ec65f`..`3971830`, one per ledger row, each pushed on its own; this file is
  committed after them. Tree clean at `3971830`.
- Answers: `docs/reviews/2026-09-25-core-arch-stage2-findings.md` (CB-01..CB-26), reports
  `docs/reviews/2026-09-25-deepseek-core-arch-stage2-review.md` (S) and
  `docs/reviews/2026-09-25-deepseek-research-launch-review.md` (L). Both reports and the ledger are
  unchanged.
- Outcome count: 23 fixed, 0 rejected, 3 to the owner (CB-12, CB-13, CB-21).
- Launch line for DeepSeek's second pass (model and effort named at launch):
  `Read and follow the file docs/reviews/2026-09-25-claude-core-arch-stage2-fix-response.md`

Paths below are repository-relative. Line numbers are at `3971830`.

## Stage 2 (report S): CB-01..CB-11

| Id | Outcome | What changed | Commit | Where |
|---|---|---|---|---|
| CB-01 | fixed | Parent-scope lines are inherited defaults: a model the frame's own lines do not name holds its parent-scope role there, and a model the frame names holds only those lines. The one-role rule is checked on one frame's effective lines (PROTO-DEC-0057 item 3). Cross-frame independence stays with the lineage and the bars of R-L0-05, R-L1-certifier.1 and R-L1-fixer.2. F7 now exits 0. The section 6 rationale and P-L1-001 step 5 are aligned. The program-wide alternative would need a decision superseding 0057 item 3; it is not written. | `14ec65f` | `docs/core-arch/stage-2/SCHEMA-assignment.md:48-53,74-75,99,144-149`; `docs/core-arch/stage-2/P-L1-001-orientation.md:56-58` |
| CB-02 | fixed | `owner` is removed from the assignable slots, and a line naming it exits 2 (new fixture F9). A delegated coordinator writes no `coordinator` line and no delegation line. ROLE-owner's preamble no longer says a model may hold the slot. | `1c695a6` | `SCHEMA-assignment.md:39-40,46-47,120-122`; `docs/core-arch/stage-2/roles/ROLE-owner.md:22` |
| CB-03 | fixed | `assigner ::= model \| "owner"` is removed. A delegation line now names its delegate model and `by <block_id>`, the decision block in which the owner recorded the delegation. The line is accepted only if that block exists, carries `Approved by:` and names the same model, scope and date; otherwise exit 2 (F10). The `by` field is marked as this draft's proposal for the form PROTO-DEC-0062 item 3 leaves open. | `1b2e5ed` | `SCHEMA-assignment.md:34,42,113-119` |
| CB-04 | fixed | Section 3 names its inputs: the role document (today `.ai/TASK.md`) and a scope registry (`- <scope_id> frame=<path> parent=<scope_id or ->`), whose path is fixed with the task-frame schema in S3-T03. New rules 5-7: exactly one registry line, frame fields equal to it, one parent level, and an unissued scope exit 2. New fixtures F11-F13. | `6fa6658` | `SCHEMA-assignment.md:60-67,76-82`, fixtures F11-F13 |
| CB-05 | fixed | R-L1-002.1 is the one home of the participant rule. SCHEMA §1 and CORE-ARCH-3 §2 point to it. `R-L1-dispatcher.1` is the one home of "the dispatcher is a script": the schema line points to it, and ROLE-dispatcher's preamble no longer says a model may hold that slot. | `49d91c8` | `docs/core-arch/stage-2/P-L1-002-independence.md:37-40`; `SCHEMA-assignment.md:20-26,54`; `docs/core-arch/stage-2/roles/ROLE-dispatcher.md:22`; `docs/core-arch/CORE-ARCH-3.md:64-65` |
| CB-06 | fixed | The lineage now covers every frame in which the candidate was produced, fixed, reviewed, framed, dispatched, coordinated or otherwise controlled: every act that R-L0-05 and R-L1-coordinator.2 bar from certifying. | `d87edbe` | `P-L1-002-independence.md:41-44` |
| CB-07 | fixed | A note under the slot table states that PROTO-DEC-0031 binds certifying verdicts only (`AGENTS.md:127`), and that the other rows are the stage-2 proposal in 0031's vocabulary. The coordinator gains SHELL_EXEC. Report-writing slots gain FS_WRITE, or else the §5.5 transcription route (ADVISORY). Seven ROLE records state the right to write their own report. | `6b2df9b` | `CORE-ARCH-3.md:69-91`; `roles/ROLE-{researcher,synthesiser,drafter,critic,fixer,reviewer,auditor}.md` Rights |
| CB-08 | fixed | Row 3 of the packet trial now maps "a reproduced FAIL or BLOCKED still blocks" to R-L1-reviewer.2, which names PROTO-DEC-0041 items 3-5 and `AGENTS.md:137-138`. Row 5 records that only PROTO-DEC-0050 item 2 carries the fixed launch line today. | `5da360b` | `docs/core-arch/stage-2/trial/S2-T10-packet-trial.md:50,52`; `roles/ROLE-reviewer.md:30` |
| CB-09 | fixed | Both citations of `CORE-ARCH-1.md:240` (a blank line) now cite the nine-check table at `:243-253`. The record is a stage-1 draft approved as design (PROTO-DEC-0061); this is a citation-only minor change, for the owner to confirm on the P-L0-001 short path. | `93bdd88` | `docs/core-arch/stage-1/P-L0-004-layer-consistency.md:17,78` |
| CB-10 | fixed | LCC re-run for L1 after CB-01..CB-09, with a throwaway script in the scratchpad (not a kernel tool): 33 records, 142 rule ids, none defined twice; 14 slots, none unknown; 9 back edges, all well formed; AR-013/014/015/022 have records; LCC-3 re-read after CB-01. New line: `LCC: L1 \| 1..7=pass \| 8=fail:reviewer,coordinator \| 9=pass \| by=claude-ad7cc4169e888ea8`. LCC-8 recomputed: reviewer/accept 48,830 B, coordinator/frame 43,167 B, coordinator/dispatch 62,873 B. В-26 carries these numbers and the reviewer's point that the WARN-first rule of 0057 item 5 does not cover this budget. The archived line in `.ai/ARCHIVE.md:8360` stays (append-only), and В-26 stays the owner's. | `37030c8` | `.ai/worklog/claude-ad7cc4169e888ea8.md:25`; `CORE-ARCH-3.md:215-220` |
| CB-11 | fixed | Pilot rule 7: the review prompt names the candidate commit (full SHA), or a SHA-256 per reviewed path. The implementer edits none of those paths during the review, and a later edit is a new stacked candidate. WORK-CYCLE step 8 points to the rule. Now that the tree is committed, a review can be pinned to a SHA; this second pass reviews `ab23c63..<head>`. | `b79d098` | `docs/core-arch/CORE-ARCH-4.md:191-196`; `docs/core-arch/stage-2/WORK-CYCLE.md:25` |

## Research and launch packages (report L): CB-12..CB-26

| Id | Outcome | What changed | Commit | Where |
|---|---|---|---|---|
| CB-12 | to the owner | A decision block cannot be edited. Question and block text are in owner item 1 below. | — | owner item 1 |
| CB-13 | to the owner | Same reason; owner item 2. | — | owner item 2 |
| CB-14 | fixed | The timer table gains a "Source" column: soft and hard come from O-11; the caps, the tick and the smoke timeout are the implementer's proposal, and the price tie-break of R-L3-004.2 is marked the same way. Evidence C lists all four, and a comment beside `DEFAULTS` says so. No behaviour change. | `f0390f1` | `docs/core-arch/stage-4/P-L3-004-route-failover.md:45,113-119,172-177`; `docs/research/2026-09-25-improvement-research/prompts/launch.cjs:31-33` |
| CB-15 | fixed | The state table now has a row for every launcher transition, including STARTING → SUSPECT, SUSPECT → STARTING, both phases of SUSPECT, the stop recorded before launch and the tree-gone condition of the fallback. A note covers `hard - soft` < one tick. | `d87b8e9` | `P-L3-004-route-failover.md:123-146` |
| CB-16 | fixed | `options()` rejects with exit 2: unknown or duplicated flags, missing, non-integer, zero or negative numbers, a malformed `--route`, soft ≥ hard, and none or more than one command. Pure checks in the new `--pure` mode of the self-test. | `9ee0f16` | `launch.cjs:501-533,703-710`; `prompts/launch-test.cjs:72-84` |
| CB-17 | fixed | New `startBlockers()`: `--start` is refused while the previous watchdog lives, or while any process the record names is alive by PID and creation time. That covers each attempt's root and recorded descendants, plus children of an unconfirmed attempt's processes. It fails closed when the process table cannot be read. R-L3-004.7 is extended. Bug reproduced on `ab23c63` (see verification), new scenario zz-t12. | `b4be866` | `launch.cjs:222-245,647`; `P-L3-004-route-failover.md:62-66`; `launch-test.cjs:38,95-99,148-162` |
| CB-18 | fixed | The watchdog never deletes the stop marker. `--start` clears an old one under the start lock before it spawns the watchdog, and a marker seen before launch ends the job as NEEDS_OWNER with no attempt. `--stop` during a start says so. Scenario zz-t10. | `48168b1` | `launch.cjs:360-361,478-482,662-663`; `launch-test.cjs:34` |
| CB-19 | fixed | New `chunkIsProgress()`: new log bytes count as progress only if at least one new line is neither an error text nor a retry notice. In such a tick the client log does not count either. A retry loop therefore reaches soft silence: FAILED_EARLY before useful work, SUSPECT then HUNG after it. New fake mode `ratelimit-loop`, scenario zz-t9, and the L2/L3 rows and risk row are updated. | `5c13748` | `launch.cjs:133-138,299-307,436-442`; `P-L3-004-route-failover.md:95-96,184`; `launch-test.cjs:32,103-107` |
| CB-20 | fixed | `ERROR_TEXT` counts a status code (401, 403, 429, 500, 502-504, 529) only after an HTTP/status/error/code word or before its reason phrase, and the bare "forbidden" is dropped. Added: credit balance, overload, fetch failed, socket hang up, EAI_AGAIN, hit your limit, rate_limit_error, RESOURCE_EXHAUSTED, quota exceeded. The reviewer's 8 misses and 3 false hits are pure checks, and P-L3-004 lists the same set. | `8112b37` | `launch.cjs:35-45`; `P-L3-004-route-failover.md:105-109`; `launch-test.cjs:85-92` |
| CB-21 | to the owner | Every grant needs the owner's recorded authority. Owner item 3, with two options. | — | owner item 3 |
| CB-22 | fixed | A "Divergence" section: the launcher resumes no session by id, so HUNG is FALLEN on the first stall under PROTO-DEC-0051 item 4, and the owner records a fall `Signal:`. The kernel dispatch script must implement the three wakes and does not inherit this path. The HUNG reason in the state file says so. | `88cfa5d` | `P-L3-004-route-failover.md:152-159`; `launch.cjs:468-470` |
| CB-23 | fixed | K-launch rule 3 stops on any exit code a step does not name, and exit 2 always stops. Step 4 expects 0 or 1. Step 5 expects 0 (all started) or 1 (some refused, the rest started: report, do not retry), and it requires an `Owner-confirmed:` journal line before `--start`. Step 6 expects 0. | `eb32a52` | `prompts/K-launch.md:15-17,39,43-49,51` |
| CB-24 | fixed | `taskkill /T` is gone. `killExact()` stops one PID only right after its PID and creation time match a fresh table. `aliveTree()` finds live recorded processes and their younger children, newest first. `ensureGone` and `--stop` without a watchdog stop leaves first, and the root goes through Node's child handle. Scenario zz-t11: the root exits, and a detached grandchild is stopped by identity. | `b0dfa68` | `launch.cjs:193-220,369-385,692-697`; `P-L3-004-route-failover.md:69-72`; `launch-test.cjs:36,93-100` |
| CB-25 | fixed | agy is recorded as 1.2.9 on 2026-09-24 and 1.2.10 at the `--help` check on 2026-09-25 (`.ai/ARCHIVE.md:8491`). Notes are numbered 1-4 in order. | `0cc4e38` | `docs/core-arch/stage-4/MODEL-MATRIX.md:17,171-179` |
| CB-26 | fixed | The O-06 index line keeps "of different makers" and "a synthesiser who is not one of the researchers". No verbatim block was touched. | `3971830` | `docs/research/2026-09-25-improvement-research/BRIEF.md:20` |

## Owner items (ready to answer; numbers are the next free ids, renumber if a block lands first)

1. **CB-12.** PROTO-DEC-0067 supersedes the five-minute idle bound of 0049 item 3 for *every* dispatch
   watchdog. But O-11 set timers for the failover path only, 0067 item 7 trials them only in the
   research launcher, and `launch-round2.cjs:24,108-109` still enforces five minutes. Choose:
   (A, recommended) narrow the supersede, with the block below; (B) keep it wide and change the
   round-2 launcher to the O-11 timers in a separate change.
   `### PROTO-DEC-0068` / `Status: Accepted` / `Date: <answer date>` / `Reopen-trigger: owner-directive` /
   `Supersedes: PROTO-DEC-0067, as to the scope of its Supersedes line only` /
   Context: the launch-package review (report L Part 4 item 1, CB-12) found the Supersedes line of
   0067 broader than O-11, and 0049 item 3 (zero activity) measures something else than O-11 (no
   progress of a live process). Decision: 1. The soft and hard timers of PROTO-DEC-0067 item 3
   replace the idle bound of PROTO-DEC-0049 item 3 only in
   `docs/research/2026-09-25-improvement-research/prompts/launch.cjs` and in P-L3-004 while it is on
   trial. 2. Elsewhere, including `launch-round2.cjs` and the kernel dispatch script of
   PROTO-DEC-0050 item 4 until an approved block adopts P-L3-004 there, PROTO-DEC-0049 item 3 stands
   in full. Consequences: no code change. `Approved by: RuslanFomenko (<words>, <date>; transcribed by <session>)`.
2. **CB-13.** Item 6 of PROTO-DEC-0066 drops two sentences of the O-08 option you chose
   (`BRIEF.md:1377`). Confirm this block, which adds them and supersedes nothing:
   `### PROTO-DEC-0069` / `Status: Accepted` / `Date: <answer date>` / `Reopen-trigger: owner-directive` /
   Context: CB-13; PROTO-DEC-0066 item 6 omits part of O-08. Decision: 1. As chosen in O-08, the
   improvement research of PROTO-DEC-0066 runs in parallel with the stage-2 review, does not count
   under the two-stream limit of PROTO-DEC-0048 item 7, and touches no kernel record. This adds to
   PROTO-DEC-0066 item 6 and changes nothing else in it. `Approved by: RuslanFomenko (<words>, <date>; transcribed by <session>)`.
3. **CB-21.** The launcher runs `vibe --auto-approve` (`launch.cjs:159`). No block authorises it:
   0047 item 7 grants vibe `-p --enabled-tools --max-turns`, and `CLI-AGENTS.md:129-130` requires
   your recorded authorisation. It also runs copilot with `--allow-all-tools --no-ask-user`, the
   repository as working directory and `--add-dir <temp>` (`launch.cjs:158`). 0047 item 7's
   compensation, a narrow working directory, is absent, and `--no-ask-user` is recorded nowhere.
   Choose: (A) authorise these flags for this run only, with the block below; (B) narrow them
   (vibe `--enabled-tools <list>` instead of `--auto-approve`; copilot without `--add-dir <temp>`).
   B must pass a local `launch.cjs --check researchers` and `--smoke` first, because neither can
   run in the cloud. The research is not launched until you answer.
   `### PROTO-DEC-0070` / `Status: Accepted` / `Date: <answer date>` / `Reopen-trigger: owner-directive` /
   Context: CB-21 as above; the researchers must write their outputs inside the repository, so the
   working directory cannot be narrower than the repository. Decision: 1. For the improvement
   research of PROTO-DEC-0066 only, the owner authorises vibe
   `-p --auto-approve --max-turns 400 --output streaming --workdir <repository>` (job b-mistral) and
   copilot `-p --allow-all-tools --no-ask-user --add-dir <system temp>` with the repository as
   working directory (jobs a-synth, b-grok, b-kimi). 2. The prompts' limits stand: no installs, no
   MCP, no edits outside the job's outputs and journal. The certifiers of the research output
   check the diff against them, and a violation is handled by the owner, as for agy in
   PROTO-DEC-0049 item 5. 3. The authorisation ends with this run and grants nothing to the kernel
   dispatch script of PROTO-DEC-0050 item 4.
   `Approved by: RuslanFomenko (<words>, <date>; transcribed by <session>)`.
4. Standing, not new: В-26 (LCC-8 interim, CB-10); the minor classification of the CB-09 citation
   fix (P-L0-001 short path).

Proposed one-line change to `.ai/TASK.md` "Next" (for the owner to apply; this session edits no
shared document): `2026-09-25: fix round 1 of CB-01..CB-26 answered in
docs/reviews/2026-09-25-claude-core-arch-stage2-fix-response.md (23 fixed, CB-12/13/21 to the
owner); DeepSeek second pass on ab23c63..<head> pending; research launch waits for CB-21 and a
local launch-test.cjs run.`

## What was verified here, and how

- `node --check` on `launch.cjs`, `launch-test.cjs` and `launch-fake-client.cjs`: exit 0.
- `node .../launch-test.cjs --pure` on Linux: 46/46 PASS, exit 0. It runs pure functions only:
  options, ERROR_TEXT probes, chunkIsProgress, aliveTree.
- Full self-test, run under a Linux emulation of `powershell`, `tasklist` and `taskkill` (a /proc
  reader in the scratchpad, not committed; zombies excluded, as terminated processes are on
  Windows). On `ab23c63` it reproduced the reviewer's Windows result, 11/11. Three consecutive runs
  at the fix head: 15/15 scenarios plus the pure checks, exit 0, no process left behind.
  Reproductions on `ab23c63` under the same emulation: CB-19 (a rate-limit loop stayed `STARTING`
  for the whole 120 s window), CB-18 (a pre-recorded stop was deleted and the job reached `DONE`),
  and CB-17 (after the watchdog was killed and the root had exited, the old root-only start check
  did not refuse while a recorded grandchild was alive).
- `launch.cjs --dry researchers`: exit 0, output byte-identical to `ab23c63`. `--status`: exit 0.
  Malformed options: exit 2.
- `node .ai/bin/protocol-handoff.cjs verify`: exit 1, "no evidence matches the current tree".
  That is expected, because no Evidence could be recorded here (below).

## Not run in this environment

- `validate-protocol.ps1` and `test-protocol.ps1`: this container has neither `pwsh` nor
  `powershell`. Not run.
- `protocol-handoff.cjs record --owner claude-ad7cc4169e888ea8`: exit 1,
  `validate-protocol.ps1 could not run: spawnSync pwsh ENOENT`, and the journal was left unchanged.
  No Evidence block was written by hand. Requested: a local `record` over this tree, after the
  validator and the suite have run.
- `launch-test.cjs` on Windows, and `launch.cjs --check` (needs the codex, agy, copilot, vibe and
  kilo CLIs, none of them installed here). Not run; `--smoke` and `--start` are out of scope.
  Windows-only behaviour is therefore unverified: `Win32_Process` creation times, taskkill
  without `/T`, Node's `child.kill()` on a `cmd.exe` root, and PID reuse. All launcher fixes
  (CB-16..CB-20, CB-22, CB-24) are **locally unverified on Windows**. Requested: run
  `launch-test.cjs` and `launch.cjs --check researchers` on the workstation before any launch.
- `kilo-routes.cjs --print`: kilo is not installed. Not run; the catalog is unchanged.

## Re-review instructions (second pass, attempt 1 of RC-CB-*)

1. Step 0 as in round 1. Review the diff `ab23c63..<head>` of the paths in the "Where" columns,
   read from that commit (CORE-ARCH-4 §9 rule 7). Widen the reading only where a fix depends on
   unchanged text, and record why.
2. For each fixed row: `fixed-and-verified`, or `unresolved` with a reproduction, added as a new
   ledger row with `attempt: 2` only for root causes that stay open. Rows sent to the owner stay
   `confirmed` and are marked so. Report any defect a fix introduced, to the same evidence standard.
3. A root cause still open gets fix attempt 2. If that also fails, it goes to the owner
   (R-L0-11), never to a third fix.
