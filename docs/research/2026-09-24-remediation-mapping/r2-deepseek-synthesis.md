# Round-2 synthesis - remediation mapping (DeepSeek, last)

- Baseline: `4ded1bee1c2acf2392fdeededf50935f59138302`; tree dirty (live journals and research
  files of this round, measured during this session).
- Model: DeepSeek. Client: Kilo (IDE session). UTC date: 2026-09-24. Zones: all four plus the
  three round-2 reports. Dispatched round 2, shaped none of it, certifies nothing (DEC-0046 item 6).
- Read: `ROUND2.md`, `BRIEF.md`, the four round-1 reports, the three round-2 reports, and the
  cited blocks PROTO-DEC-0041 (1-5), 0046 (4-6), 0047 (1,3,4,6), 0048 (2-7), 0049 (1-4), 0051 (4).
- Reproductions run read-only (no code, test, shared-document, lock or commit change): scope.cjs
  255-452; verdict.cjs 620-799 and function map; validate-protocol.ps1 988-1057; handoff.cjs
  1-140, 818-847, 1291-1418 and function map; TASK.md 44-51; PLAN.md line count; sessions.jsonl
  row counts; greps for termination signals and repro-locator code; read-only listing of
  `~/.claude/projects`, `~/.codex/sessions`, agy `brain/` (names, mtimes only).

## Z1 - Roles and agreement grammar (author: Gemini; challenger: Mistral)

As reproduced in the fixed form:
- Agreement with mistral on item Z1-03: fully agree. The four closure defects match the code:
  fence toggle without marker/length tracking (protocol-scope.cjs:275-285); unanchored section
  split with a prefix test (:330); clause-level negation guard suppressing later tokens
  (:405-451, `not`/`without` admitted at :430); vocabulary for `authored`, `controlled` and bare
  `executing pair` (:410-415).
- Agreement with mistral on item Z1-04: partially agree. The migration as written drops governance
  text the grammar has no field for; the author's note that the prose moves elsewhere does not by
  itself preserve the candidate-scoped exclusions of PROTO-DEC-0041 item 1.
- Agreement with mistral on item Z1-06: agree with reservations. Strict token lines are right;
  the constraint/scope gap is real and does not require abandoning the closed grammar.

No FACT is in dispute; the gap is completeness, and the challenger's `## Role Constraints` idea
was not checked against the checker's actual semantics - where the zone's decisive finding sits.

Lead nobody checked, reproduced (ROUND2 Z1 lead items 1-3):
1. `.ai/TASK.md` has two Roles lines per agent: codex :48/:51, deepseek :47/:49.
   `checkIndependence` keeps one `excludedRoles` Map keyed by agent and rewrites the entry per
   matching line (:326, :334-343): no merge rule, last non-null match wins.
2. So a later certifier line cannot clear an earlier excluded role: with the migration, codex
   stays excluded as coordinator although :51 nominates it for the second certifier slot, and
   deepseek resolves to implementer (:49 over :47's controller). Both are excluded for every
   candidate, while the decision scopes exclusion to the candidate at hand (PROTO-DEC-0041 item 1).
3. The exclusion is applied globally (:363-383) because no line carries a candidate or scope and
   no grammar defines one. The checker already reads a producer from a `Candidate journal` /
   `Producer journal` header field (:261) and from that journal's `- recorded: ... by <owner>`
   line (:287) - the interface the Z3 package must feed (conflict 1).

Candidate solution: keep the strict token grammar and fail-closed exit 2 (DEC-0049 item 2); add a
merge rule (ordered union of an agent's lines, precedence stated for scoped lines), an optional
candidate/scope qualifier consumed by `checkIndependence` as a filter, and fixtures per direction
plus double lines and unknown tokens. Risk coverage: trigger - a scoped exclusion leaks or a merge
rule hides one; likelihood medium; impact high (independence unsound in both directions);
prevention - explicit scope, per-candidate evaluation, the fixtures; compensation - the manual
check of DEC-0048 item 3 stays until certification; cost - one grammar field, one merge rule,
tests; residual - scope values stay human-written, same trust boundary as today's prose. Net gain:
closes R3-C01/C02/C03 and F-R3-02 and removes the global-exclusion defect that would void the
TASK.md certifier designations.

## Z2 - Budget, immutability, collection scope (author: Mistral; challengers: Copilot, Gemini)

As reproduced in the fixed form:
- Agreement with copilot on item Z2-1 and with gemini on item Z2-01: fully agree. The spec set is
  `docs/reviews/*findings*.md` plus the target (spec:134-135); the code builds three candidate
  directories (protocol-verdict.cjs:729-733).
- Agreement with copilot on item Z2-2: fully agree on the FACT. Non-last blocks are compared only
  normalized; the raw comparison runs for the last block alone (validate-protocol.ps1:1019-1046).
- Agreement with gemini on item Z2-02: categorically disagree with the round-1 recommendation.
  Option 3 (raw comparison for all blocks in the validator) is a third attempt on the root cause
  that PROTO-DEC-0048 item 4 records as an accepted exception with no third attempt; the BRIEF
  routes this idea to audit input, not remediation code. Copilot's softer support for Option 3 is
  not the side the reproduction supports.

Disputed FACT, reproduced - can `checkStopRule` close an exhausted cycle by itself? Copilot: only
after a third attempt row exists; needs a `deferred-by-owner` branch. Gemini: attempt-2 detection
and immediate exit are already possible. The code supports Copilot: `disposition` is read only for
duplicate-conflict detection (:635, :644-651); the sole terminal trigger is `maxAttempt >= 3`
(:675), with the terminal block at :767-775. `deferred-by-owner` is an existing ledger value
(spec:77), currently uninspected.

Other dispositions: the decision names `.ai/PLAN.md` for the procedure (DEC-0048 item 4) and PLAN
is at 200/200 lines (measured); `.ai/ARCHIVE.md` is cold history (AGENTS.md:20); a new research
file is not what the decision names. Certifier lines must follow independent availability
(DEC-0047 item 1), DeepSeek's candidate-scoped exclusion for what it dispatches (DEC-0046 item 6)
and Copilot's shadow-only status (DEC-0047 item 4); Mistral's own candidate-scoped nuance is the
correct reading, Gemini's looser phrasing imprecise. Research streams are exempt from the
two-stream cap (DEC-0048 item 7), so Copilot's Z2-R03 correction stands.

Unchecked: Option 1 was never re-run against an existing cross-file probe, and nobody measured
which ledgers outside `docs/reviews/` currently feed `--stop-rule` - one reproduction for the
implementer before the one-line change.

Candidate solution: Option 1 as the only collection-scope change; a `deferred-by-owner` terminal
branch in `checkStopRule` that emits a distinct machine state without opening an attempt 3; all
byte-comparison ideas remain advisory audit input; the procedure goes where the owner resolves the
PLAN capacity question. Risk coverage: trigger - a legitimate ledger lives outside the recorded
set, or `deferred-by-owner` is written prematurely; likelihood low; impact medium; prevention -
the target file is always added (protocol-verdict.cjs:726), the disposition is honored only as
written, reopening stays gated by a registry trigger row (AGENTS.md section 6); compensation -
owner can reopen the area explicitly; cost - one branch and fixtures; residual - authorization to
write the terminal disposition stays a human process concern. Net gain: spec compliance restored,
and the owner's "close at once" becomes code without a third attempt.

## Z3 - Diff certification, producer Evidence, reproductions (author: Copilot; challenger: Mistral)

As reproduced in the fixed form:
- Agreement with mistral on item Z3-03 and Z3-04: fully agree on the package direction and the
  locator/sanction contract; its additions (root-relative paths, no shell expansion) narrow the
  parser and should be taken.

Disputed FACTs, reproduced:
1. Clean-tree producer Evidence: the dirty flag comes from `git status --porcelain -uall` or the
   snapshot equivalent (protocol-handoff.cjs:77-79) and renders as uncommitted-changes-present
   (:121). The shared checkout is dirty, but a producing session in an isolated checkout at the
   frozen candidate can record clean-tree Evidence; worktree isolation is already the recorded
   pattern for certifiers (PROTO-DEC-0046 item 6). The requirement text must say where the
   producer records; the architecture does not have to change.
2. Edit-map ranges: `protocol-verdict.cjs:271-490` is `parseFindingsLedger`, which reads the
   reproduction field as data (:343); `checkStopRule` is at :628; no code resolves reproduction
   locators (grep negative). The resolver is new code; Mistral's correction is right in substance,
   wrong in detail.
3. The round-1 report contains no text about a DeepSeek/Copilot certifier list (grep negative);
   Mistral's Z3-01 challenge item is misattributed, though its content is right per DEC-0046 item 6.
4. Mistral's own citation: `:829-835` is inside `main`'s verify branch, not `reportOne` (:663-675);
   the digest-versus-tree comparison it describes is real (:823-844).

Unchecked: the cited gate ranges were verified by nobody (spot-check: `gateCheck` starts at :934;
the cited `:1296-1420` exceeds the 1418-line file), and the cost of producing the package against
the diff reading it saves (ROUND2 Z3 lead 3) is unmeasured. Both go to round 3.

Candidate solution: Option A package with the narrowings; `record` (not the certifier) attaches
the whole-tree run; producer Evidence is recorded in the producing checkout and says so; the gate
resolves Producer-journal and binds it to the Candidate; root-relative locator grammar with
`{path}` substitution, and three-field sanctioned borrowings (path, sha256, sanction). Risk
coverage: trigger - wrong baseline, stale producer receipt, drifting locator, changed borrowing;
likelihood medium for stale/drift, low for laundering; impact high; prevention - 40-hex ancestry,
entry-hash binding, exit 2 on malformed or unreadable input, no silent fallback; compensation -
certifiers widen beyond the diff, whole-tree run stays attached; cost - parser, fixtures, one
producer record per candidate; residual - semantic defects outside tests remain possible. Net
gain: exactly the diff and claimed closures, closing F-R3-03/F-R3-04 with parseable inputs.

## Z4 - Five-minute idle exit (author: Qwen; challengers: Copilot, Gemini)

As reproduced in the fixed form:
- Agreement with copilot on item Z4-4 and with gemini on items Z4-11..Z4-13: fully agree on the
  FACTs. The false-stall risks are real; a permission-prompt wait beyond five minutes is a stall
  by definition (PROTO-DEC-0049 item 3), not an exception.

Disputed FACTs, reproduced:
1. Uniform per-client signal: refuted. `sessions.jsonl` holds 115 rows: claude 97, codex 12,
   gemini 3, copilot 2, deepseek 1, none for mistral/kilo/vibe. Automatic per-turn writing exists
   only where the Stop hook fires (protocol-hooks.cjs:614, :621; protocol-session.cjs:6-10).
2. Test-suite timing: the 270s claim is refuted by a recorded Evidence block - `test-protocol.ps1`
   exit 0 in 315s (copilot-2db59a7f7eba7f43.md), already over the bound.
3. Kill sequence: no termination code exists; these are Windows hosts; the working mechanism is a
   process-tree kill (`taskkill /PID <pid> /T /F`), as both challengers and this round's launcher
   practice support. The Unix signal sketch is wrong here.
4. Exit codes: a separate invalid-input code 3 is rejected; unknown input exits 2 (DEC-0049 item 2).
5. External artifacts: the three transcript roots exist and are listable by an unsandboxed process
   (tested); the sandboxed Copilot session could not read them; agy transcript growth was verified
   first-hand by Gemini. The watchdog must run outside the agent sandbox or watch in-repo artifacts.

Lead nobody checked - the launcher is the working prototype: `launch-round2.cjs` watches the
streamed output, the report and the newest journal with a 5-minute idle bound and a 60-minute cap;
this round it caught Mistral's crash by exit and did not false-stall the long runs (gemini 2m44s,
copilot 8m, mistral 2m29s after retry). Gaps against DEC-0051 item 4: ends on first stall instead
of three wake-by-resume attempts; no transcript artifact; no FALLEN signal.

Candidate solution: implement DEC-0051 item 4 as written (artifact watching over streamed output,
transcript, report, journal; resume by session id with a fixed continue-from-checkpoint line, max
three; FALLEN with logs, session id, wake history, appended as a fall signal), Windows process-tree
termination as the ending mechanism, per-client resume commands and artifact paths in the client
registry (DEC-0050 item 3), and session-root-aware artifact paths so worktree sessions are watched
where they write (conflict 5). Risk coverage: trigger - long suite or slow turn without artifact
growth; likelihood high; impact - false FALLEN, lost context; prevention - process-tree activity
sampling plus multi-artifact watching; compensation - a wake resumes the same session, so a false
fall loses at most the interval; cost - polling in the dispatch script; residual - a silent but
active client without resume support cannot be distinguished, itself a procedure gap. Net gain: up
to three context-preserving wakes, and a true fall enters the signals ledger.

## Conflicts between zones

1. Z1 global roles against the Z3 package: the independence gate already consumes a Producer
   journal and the producer from Evidence (protocol-scope.cjs:261, :287), which the Z3 package
   supplies per candidate; without candidate scope the Z1 grammar keeps excluding globally and the
   package binding cannot override it. Specify together.
2. Z2 stop rule against the Z4 watchdog: a terminal stop means return to the owner; a watchdog
   resume could restart an executor into a closed root cause. The wake must carry the stop state,
   and a FALLEN must not count as a new attempt.
3. Exit-code vocabulary: Z2's proposed distinct `deferred-by-owner` code, the existing stop-rule
   exit 1, and Z4's exit 2 for unknown input (DEC-0049 item 2) need one contract.
4. Collection scope against closure claims: Z2 narrows the corpus; Z3's `Closes-findings` IDs and
   locators must resolve in that same corpus or an accepted closure becomes invisible.
5. Worktree isolation against artifact watching: producers and certifiers work on a frozen SHA in
   their own checkout (DEC-0046 item 6), so their journals grow there, not in the main checkout;
   watching the main checkout only would false-stall every isolated review.

## For round 3

Decided by evidence:
- Z1: the grammar closes R3-C01/C02/C03/F-R3-02; a merge rule and candidate-scope binding are
  required because last-wins plus global exclusion contradicts TASK.md:46-51 and DEC-0041 item 1.
- Z2: three candidate directories against the spec's source plus target; Option 3 is a forbidden
  third attempt, audit input only; `checkStopRule` is attempt-driven, not disposition-driven;
  `deferred-by-owner` is the right hook; PLAN is at cap; ARCHIVE is not a proposal home.
- Z3: the shared checkout is permanently dirty; clean-tree Evidence needs an isolated checkout;
  no locator resolver exists; the Z3-01 challenge is misattributed but its content is right; the
  package cost side is unmeasured.
- Z4: the uniform-signal claim is refuted by the metric distribution; the suite runs 315s; Windows
  needs process-tree termination; DEC-0051 item 4 fixes the wake policy; the launcher is a working
  partial prototype.

Needs the judgement of Claude, Codex and DeepSeek:
- Merge and scope grammar for Roles lines, and how far `checkIndependence` consumes Z3 fields.
- Where constraint prose lives (structured section vs grammar extension) and whether scope
  enforcement is script or reviewer duty.
- Terminal exit-code choice and its interaction with watchdog wakes.
- Clean-tree semantics (worktree requirement vs declared-dirty) and Producer-journal resolution
  across checkouts.
- The quotation-detection matcher (unit, exclusions) before certification.
- Per-client resume-by-id commands and artifact sets; the watchdog supervision boundary.
- Whether the DEC-0048 item 4 prevention tool may ever be code, or stays audit input only.

Owner-only questions:
- Raise the PLAN.md cap, trim it first, or record another home for the procedure.
- Are producer worktrees provisioned this round, and who owns them?
- Introduce a third exit code for owner-accepted exceptions, or keep 1 with a distinct output?
- Are heartbeat writes for agy, Kilo, Copilot and vibe in scope this round, or deferred?
- Who owns and tests the unsandboxed watchdog process outside the repository (AGENTS.md item 8)?
- Which certifiers bind this round's kernel changes given Codex's exhausted limits?
