# Unified adversarial audit prompt: ROADMAP-1 wave 2A (kernel batch 1) - frozen-candidate certification

Issued: 2026-09-28 (UTC). Issuer: `mistral-0d03d4481ac46858` (vibe; model `mistral-medium-3.5`).
Authority: `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-RECOVERY3-VIBE.md` (PROTO-DEC-0095 item 1),
AGENTS.md section 2 (PROTO-DEC-0038 item 1).
Addressees: the two independent wave-2A certifiers, MiMo-V2.6-Pro and GPT-5.6 Sol (PROTO-DEC-0090
item 4), each in its own session, each outside execution and control (PROTO-DEC-0041 item 1).

## Candidate binding

- Worktree `D:\Colabs\.ai\runtime\kb1`, branch `kernel-batch-1`, candidate commit `5bc9940`.
- Reviewed range: `a4312e8..5bc9940` (12 commits; 6 code items plus docs). Review-1 baseline was
  `48365b2`; `5a6cad1` and `5bc9940` add only docs. Verify the code is identical at `48365b2` and
  `5bc9940` instead of assuming it.
- Working-tree requirement: clean at audit time; only the certifier's own artifacts (its journal and
  its review file) may be uncommitted. Any other dirty candidate file is a finding.
- This is an audit, not a fix: add no decision, change no code, run no repairs. Report only.

## Known items carried from review 1 (verify for closure; do not rediscover, do not waive)

Source: `docs/reviews/2026-09-27-deepseek-roadmap-2a-review.md` (commit `5bc9940`, verdict
RECOMMENDATION, Mode ADVISORY). These are recorded notes. For each, check the tree at `5bc9940`,
state whether it is closed in the candidate or still open, and fold the result into the per-item
verdict. Silence or blanket waiver is not acceptable.

- F-2A-01 (LOW): `W2A-EXECUTION.md` item-2 sentence says INDEX line 16 (CR-F01-1) was updated; the
  diff appends a new CR-W5-1 row and leaves CR-F01-1 untouched. The sentence is still uncorrected
  in the candidate. Confirm or refute.
- F-2A-02 (LOW): 43-line `getRepoRoot()` refactor inside the W5 commit `61c7159`, unmentioned in
  the execution report. Verify it is behavior-preserving (default path unchanged, `PROTOCOL_REPO_ROOT`
  inert unless set) or flag it.
- F-2A-03 (LOW): tests transiently import `.ai/worklog/gemini-0123456789abcdef.md` into the tracked
  tree (T6, T20-T26, T30), cleaned in `finally`. Verify the observable requirement (clean status
  after normal and killed runs) still holds; the literal tracked-tree write remains unless closed.
- F-2A-04 (INFO): reflog shows `reset: moving to HEAD~1` at `fbff763` dropping orphan `21037bf`;
  final history linear and unpushed. Note only.
- F-2A-05 (LOW): T30 sets `dispatch.runsFile`; the bare default `docs/ops/RUNS.jsonl` append path has
  no direct test assertion. Confirm status; do not accept a code-read as a test.
- F-2A-06 (INFO): validator exit 0 with 1 WARN (102 session journals, cap 100); environmental.

## Attack surfaces and required evidence, per item

### A. W0 codex usage parser (`fbff763`, `.ai/bin/protocol-dispatch.cjs`)

Surfaces: optional colon (`tokens used:\s*<n>` and `tokens used\s*<n>`); grouping by space, NBSP
(U+00A0), comma, dot; K/M multipliers (case-insensitive); dot as grouping vs decimal combined with
suffixes (`1.5k` -> 1500, `10.644` -> 10644); trailing punctuation; multiple or non-numeric tokens
(`tokens used abc` -> found=false); exact preservation in `attempt.rawUsage`; the real captured NBSP
pair `252` + U+00A0 + `154` -> 252154; schema `docs/specs/run-record.schema.md` and validator
(`protocol-runrecord.cjs`, rawUsage string|null) agreeing with behavior.
Evidence: run the named `W0` test in `tests/dispatch.test.cjs`; additionally probe `parseUsageFromLog`
directly with adversarial inputs of your own construction and show outputs; confirm the real NBSP
pair case and that a schema-invalid rawUsage is rejected by the validator.

### B. W5 hermetic fixtures (`61c7159`)

Surfaces: all 40 files (DISPATCH.json + 39 `run/*`) byte-identical across `a4312e8..5bc9940`
(blob-hash, not size or eyeball); `DISPATCH.json` unchanged (38 slots); old
`docs/research/2026-09-26-ownerideas-revision/prompts/` gone; archive copy intact; T5 runs the
fixture from a temp root without editing it; no test writes into the tracked tree (see F-2A-03);
archive INDEX gained exactly one new CR-W5-1 row with CR-F01-1 byte-identical; the `getRepoRoot()`
refactor (see F-2A-02): default still `cwd`, `PROTOCOL_REPO_ROOT` override inert, ~20 call sites
equivalent.
Evidence: blob-hash comparison of all 40 paths across the range; `git diff a4312e8..5bc9940 --
docs/research/archive/INDEX.md`; run `tests/dispatch.test.cjs` (T5, T6, guard test); read the
`getRepoRoot` diff and, if in doubt, a killed-run `git status --porcelain` probe.

### C. W1-retire (`cf99cdf`)

Surfaces: exactly one added header line in
`docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs`
(`// RETIRED: New programs use .ai/bin/protocol-dispatch.cjs only (OPS-1 W1-retire).`); file kept
for historic citations; nothing else in the file changed; no active tooling still invokes it.
Evidence: `git diff cf99cdf^..cf99cdf` scoped to that file; grep the tree for live `run-chain`
references outside archive/history contexts.

### D. Item 4, canonical RUNS store repair (`fde0248`)

Surfaces: the root cause (commit `aa52c42` emptied `docs/ops/RUNS.jsonl`, 306 fixture rows gone, and
the 2 real records stayed in `.ai/runtime/cost-routes/RUNS.jsonl`); `runsFile` added to
`allowedTopKeys` with `isSafeRelativePath` validation (probe `../`, absolute paths, drive letters,
empty string); resolution precedence CLI > `PROTOCOL_RUNS_FILE` > `dispatch.runsFile` (relative to
repoRoot) > default `docs/ops/RUNS.jsonl`; null-safe `sessionId`/`exitCode` on early returns in
`executeAttempt`, `completion`, `recordAttempts` (no `undefined` leaking into the record schema, no
swallowed validation failure); the two authentic records `R-20260927T020054Z-cr-collector-a` and
`R-20260927T020803Z-cr-collector-b` matching `run-record/1` with `pins.launchSha256` consistent
with the tree.
Evidence: `node .ai/bin/protocol-runrecord.cjs validate docs/ops/RUNS.jsonl` (exit 0, 2 valid, 0
invalid); `node .ai/bin/protocol-dispatch.cjs report
docs/research/2026-09-27-cost-routes-research/prompts/DISPATCH.json` renders both records; T30
passes; attempt at least one unsafe `runsFile` value and show it is rejected.

### E. Item 5, S-7 throttle (`653117c`, launch-test.cjs)

Surfaces: bounded concurrency 4 (`CONCURRENCY = 4`, `launchNext` queue); slot released exactly once
on every terminal path (success, assertion failure, spawn error, watchdog `own` scenarios); scenario
semantics unchanged (envCanary, audit, stopBefore/stopAfter, imported/orphan assertions, sorting and
reporting); no scenario silently skipped when the queue drains.
Evidence: `node docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs --pure` exit 0
(53 assertions); a single scenario run (`--one zz-t1`) exit 0; code-read of every release path; a
killed mid-run probe if you doubt the release logic.

### F. Item 6, S-10 vibe client note (`fa74541`, `.ai/docs/clients.json`)

Surfaces: `note` added to the `vibe` profile; `resume.note` refreshed to include the record rule;
registry still validates (`loadRegistry`/`validateRegistry` accept the extra key); no other client
entry disturbed.
Evidence: `node --test --test-name-pattern="T3" tests/dispatch.test.cjs`; `node --test
tests/resolver.test.cjs`; `node .ai/bin/protocol-dispatch.cjs probe vibe` exit 0; show the two
changed fields verbatim.

### G. Hygiene across `a4312e8..5bc9940`

Surfaces: one commit per code item with explicit paths (`fbff763`, `61c7159`, `cf99cdf`, `fde0248`,
`653117c`, `fa74541`); docs commits carry no code; no force/rebase/amend beyond the known F-2A-04
reflog entry; no `.ps1` file touched in the range (ASCII rule); UTF-8/LF intact; no scope creep
outside the named files; `git status` clean apart from your own artifacts.
Evidence: per-commit `git show --stat` for the six code commits; `git reflog show kernel-batch-1`;
validator encoding/size checks (the pre-existing journal-count WARN is F-2A-06, not a new finding).

## Verdict requirements (each certifier, independently)

1. Render an explicit verdict per item A-G and for the whole candidate: PASS / FAIL / BLOCKED /
   RECOMMENDATION. State it in the report header and per item.
2. Every FAIL claim carries at least one reproduction: the exact command, the observed output, and
   the tree it ran against. Unreproduced FAIL claims downgrade to advisory (PROTO-DEC-0038).
3. Persist the report under `docs/reviews/` with the mandatory header: reviewed commit SHA, working
   tree status, reviewer model, UTC date, scope, verdict. Certifying reviews declare
   `Mode: CERTIFYING` and `Receipt-Owner: <session owner name from protocol-session.cjs start>`;
   outputs without repository capability carry `[MODE: READ-ONLY ADVISORY]` and certify nothing.
4. The KNOWN items F-2A-01..06 receive an explicit closed/open disposition each, not a blanket note.
5. Do not modify the candidate, the task files, or any decision. Findings go in your report only.

STATUS: READY
