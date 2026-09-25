# Round-3 synthesis - remediation mapping (Claude)

- SHA `4ded1bee1c2acf2392fdeededf50935f59138302`; tree dirty (43 status lines). Model Claude Opus 5.5
  (`claude-opus-5-5`); client Claude Code 2.1.278 (VS Code). UTC 2026-09-23T23:39Z (local 2026-09-24).
- Session `claude-7b78af2bb24149a9`: a fresh session (PROTO-DEC-0053 item 3). It wrote none of the cycle's briefs,
  leads or map. Advisory, not a decision (0052 item 4, 0053 item 2).
- Commands actually run: `git rev-parse --show-toplevel`/`HEAD`; `git status --short`; `git ls-files` and
  `git ls-files -o --exclude-standard` (grep findings); `git worktree list`; `sed`/`grep`/`awk` over DECISIONS
  (0022, 0036, 0047-0053), TASK, PLAN, spec §2-§6, `protocol-scope|verdict|handoff|hooks|ledger.cjs`, the validator,
  PAIRED-CYCLE §5, PROTOCOL.md, CLI-AGENTS.md, `launch-round2.cjs` and one copilot journal; `wc -l` on PLAN and on the
  reports. Reproduction: a scratch `git clone --shared` at `4ded1be`, with `node` calling `hooks.snapshot`. The clone
  was deleted; the repository's `.git` was not touched.
- **I did not open any other round-3 synthesis (`r3-*-synthesis.md`)**; none existed when I listed the directory.
  Labels: FACT (a path:line I opened), CLAIM, HYPOTHESIS. Risks: trigger/likelihood/impact/prevention/compensation/cost/residual.

## Z1 - Fixed grammar for Roles and agreement lines

**S-claude-01 Roles grammar with scope and a merge rule.** Agreement with Gemini on item Z1-06: agree with
reservations. Token-only lines are right, but without a scope they cannot say "of that candidate" (0041 item 1).
- FACT: the Roles section is found by an unanchored split (`protocol-scope.cjs:330`). One Map entry per agent, last
  match wins (`:340`). Codex and DeepSeek each have two lines (`.ai/TASK.md:46-51`).
- Grammar: `- <agent> [ (<scope>) ]: <role>{, <role>}`, with `scope ::= all | batch:<id> | stream:<id> |
  candidate:<hex40>`. An unscoped line means `all`. Roles are a closed set. Excluded: author, executor, controller,
  coordinator, implementer, dispatcher, executing-pair. Permitted: certifier, escalation-certifier, shadow-certifier,
  reviewer, researcher.
- Merge rule: take the union of the agent's lines whose scope matches the review's `Batch:`/`Candidate:`
  (S-claude-09). Any matching excluded role excludes the agent. With no scope declared, all lines apply (today's
  conservative behaviour). An unknown agent, role or scope exits 2.
- Edit map: `checkIndependence` 325-345 becomes an anchored `^## Roles$` scan outside fences. `extractExcludedRole`
  405-451 is replaced by `parseRolesLine`. Spec §6 step 3 (spec:176-181) is rewritten. Fixtures: two lines per agent,
  a scoped leak, the unscoped fallback, and an unknown token.
- Risk: a wrong scope clears a real exclusion / medium / high / exclusion wins, and no scope matches all / the
  certifier still attests (spec:184-186 limit) / ~40 lines plus fixtures / residual: scopes stay human-written.
- Net gain: R3-C01, R3-C02 and F-R3-02 close by construction. It also removes the global exclusion by which TASK:48
  voids Codex's slot-2 designation at TASK:51.

**S-claude-02 Where the dropped constraints live.** Agreement with Mistral on item Z1-04: partially agree. Most of the
dropped prose restates binding rules. FACT: "no unilateral Completed" is `AGENTS.md:77`. "Does not certify its own
patches" and "neither authored nor controlled" are 0041 item 1, which the scoped grammar now enforces. The rest is not
binding: Block-Puzzle later, the VPN date, and the slot-2 trigger (0047 item 3, DECISIONS:1977). It goes to a
`## Role notes` section that the spec declares never parsed.
- Risk: a note is taken for a rule / low / low / the spec text / the certifier reads the notes / zero / none.

**S-claude-03 Fences (R3-C03).** Agreement with Gemini on item Z1-05.3: fully agree. FACT: the fence toggle ignores
marker and length (`protocol-scope.cjs:278-279`), and the header strip is a lazy regex (`:236`). Fix: one CommonMark
`stripFences` (same character, closing length ≥ the opener's), shared by the Roles scan, the header and the journal.
An unclosed fence exits 2. Tests: four tildes around three backticks, and an unclosed fence.

**S-claude-04 Agreement grammar, quotation matcher.** Agreement with Gemini on item Z1-03: agree with reservations.
- The degrees match DECISIONS:2014-2019 byte for byte. Add what round 2 actually did: the model name is
  case-insensitive; one line per item, so ranges like `Z4-11..Z4-13` are invalid; the justification follows `.`/`;` or
  runs to the next blank line; a non-full degree with an empty justification exits 2.
- Matcher: it is specified now (0048 item 3), but its window is fixed only after a calibration run over this cycle's 8
  reports plus round 3, which reports false positives per window size. CLAIM: 7 tokens flags shared technical
  phrasing; about 12 is my guess. FACT: `protocol-ledger.cjs dup` hashes whole records (`:15`), so it is no matcher.
- Risk: false citation defects / medium / medium / calibration plus the Z1-03 exclusions / the hand check stays until
  then / one script / residual: paraphrase goes undetected, which is accepted.

## Z2 - Collection scope, budget exhaustion, R3-C05

**S-claude-05 Collection fix.** Agreement with Mistral on item Z2-01: fully agree. FACT: the code builds three
directories (`protocol-verdict.cjs:729-733`), where spec:134-135 names one. Keep `path.join(root,'docs','reviews')` plus
the target (`:726`). FACT: no tracked or untracked `*findings*.md` exists outside the `docs/reviews/` root
(`git ls-files`, `-o`). This is the pre-change measurement DeepSeek left open; nothing live is dropped. Tests: a sibling
`scratch/x-findings.md` and a nested `<target>/docs/reviews/` ledger are ignored. Risk low, cost one line, no residual.

**S-claude-06 An EXHAUSTED state, with no new exit code.** Agreement with Copilot on item Z2-4: agree with
reservations. Agreement with Gemini on item Z2-03: partially agree.
- FACT: the only terminal trigger is `maxAttempt >= 3` (`protocol-verdict.cjs:675`). Disposition is read only for
  conflicts (`:635-651`). `deferred-by-owner` exists (spec:77).
- The spec never says whether `attempt` counts findings or fixes. DECISIONS:2021 treats a confirmed attempt-2 row as
  exhausted, so spec §4 must state that first (0048 Consequences).
- At the group's highest attempt: `deferred-by-owner` gives CLOSED-BY-OWNER (reported, not a violation);
  `confirmed`/`unresolved` at attempt 2 gives EXHAUSTED, exit 1; attempt ≥3 gives STOP, exit 1, as today.
- An output prefix separates the states. Codes stay 0/1/2 (spec:121, 0049 item 2), so Copilot's exit 3 is dropped.
- On EXHAUSTED, the group's `paths` join the forbidden list of the next scope declaration. `checkScope` (spec §5) then
  blocks the implementer mechanically.
- Edit map: `checkStopRule` 658-692, `main` 767-777, spec §4. Fixtures: all three states, plus R3-C05 as recorded.
- Risk: `deferred-by-owner` without a ruling / low / medium / the row cites the approving block / reopening needs a
  REGISTRY trigger row (AGENTS §6) / one field check / residual: the row is human-written.
- Net gain: "close at once" becomes code, and R3-C05 stops failing every run.

**S-claude-07 R3-C05 and the procedure's home.** Agreement with Gemini on item Z2-02: fully agree. A validator change
is a third attempt, which DECISIONS:2021 and BRIEF:76-78 forbid. Audit handoff: the group's rows, both attempt diffs
and the EXHAUSTED output go to the standing certifier, or to an owner-named model outside the executing pair. The
auditor recommends; only the owner reopens. PLAN is at 200/200 (FACT, `wc -l`); see Q1.

## Z3 - Diff re-certification, producer Evidence, reproductions

**S-claude-08 Replace "clean tree" with digest equality to the Candidate.** Agreement with Mistral on item Z3-02:
partially agree. Agreement with DeepSeek on its Z3 disputed FACT 1: partially agree.
- FACT: the dirty flag counts every porcelain path, journals included (`protocol-hooks.cjs:117-120,156`). The digest
  skips `.ai/runtime/`, `.ai/worklog/` and ARCHIVE (`:125`).
- Reproduced: an isolated clone at `4ded1be` reads dirty=false, and one write under `.ai/worklog/` makes it dirty. So
  "clean tree" cannot be reached in the shared checkout, nor in an isolated one once the producer writes its entry.
  Also reproduced: the snapshot identities equal `git ls-tree -r 4ded1be` minus the session paths (301/301 entries,
  0 mismatches).
- Proposal, `record --candidate <sha>`: (1) check that `<sha>` descends from `Baseline`; (2) run the validator
  and suite in a temporary `git worktree add --detach`, removed in `finally`; (3) digest `git ls-tree`; (4) write
  `anchor: <sha>, candidate tree` to the producer's journal in the main checkout. `verify` and `gate-check` recompute
  the digest from git objects, so the receipt never stales when others write; this also eases PROTO-DEC-0042.
- Edit map: `protocol-handoff.cjs` `anchor` 62-88, `renderEvidence` 109-135, record and verify in `main` 676-850, and
  `gateCheck` 934+. Tests: a dirty main checkout, a non-descendant sha, and a moved tree that stays fresh.
- Risk: the suite runs elsewhere / medium / medium / a fixed worktree root with cleanup / leftovers show in
  `git worktree list` / one suite run (315 s) / residual: disk. FACT: isolated certifier worktrees are already used
  (`D:/Colabs-cert/*`).

**S-claude-09 The package and its bindings.** Agreement with Copilot on item Z3-03: agree with reservations.
- Keep `Baseline`, `Candidate`, `Diff`, `Closes-findings`, `Producer-journal` and `Producer-Evidence`. Add `Batch:` as
  the S-claude-01 scope key.
- The dispatch script (S-claude-13) generates the package. CLAIM: near-zero cost against the whole-batch reread.
- `Closes-findings` must resolve in the S-claude-05 corpus, or exits 2. The gate feeds `Producer-journal` into
  `checkIndependence` as `candidateJournal` (`protocol-scope.cjs:258-263`), so the header fallback (`:301`) alone
  exits 2.
- Edit map: `templates/reviews/REVIEW.md:3-12`, `gateCheck`, validator parity. FACT: the cited `:1296-1420` exceeds
  the 1418-line file, as DeepSeek said.

**S-claude-10 Reproduction locator.** Agreement with Copilot on item Z3-04: fully agree, with Mistral's narrowing.
- Parse it in `parseFindingsLedger` (`protocol-verdict.cjs`), which already reads the field. A bad format, a missing
  file or a sha256 mismatch exits 2. `none` stays advisory (spec §3). External form: `external:<loc>; sha256:<hex>;
  sanction:<id>` (Q6).
- Risk: the locator drifts / high / medium / exit 2 / commit probes under `docs/reviews/probes/` / small / residual:
  OS variance.

## Z4 - Wake-then-fail watchdog

**S-claude-11 Activity signals.** Agreement with Qwen on item Z4-02: categorically disagree, with reasons. The signals
were not measured, and journal and state files do not change per turn (per the Copilot and Gemini reproductions and
DeepSeek's row counts).
- Watch four signals: (a) the dispatcher's stdout log, which every dispatched client has (`launch-round2.cjs:85-86`);
  (b) the transcript at a registry path: Claude `~/.claude/projects/<p>/<sid>.jsonl`, Codex `~/.codex/sessions/`, agy
  `transcriptPath`, the others HYPOTHESIS; (c) the report and journal under the session root, worktrees included
  (DeepSeek conflict 5); (d) the process-tree CPU delta, which covers the 315 s suite (`copilot-2db59a7f7eba7f43.md:43`;
  Gemini cited :38).
- Any single signal resets the timer. A blocked permission prompt shows none of them, so it is a stall (0049 item 3).
- Risk: a silent but active client / medium / high / (d) plus a same-session wake / a false fall costs at most 5 min /
  30 s polling / residual: no resume and no output, which is itself a signal.

**S-claude-12 Wake, FALLEN, stop state.**
- The registry gives `sessionIdFrom` (for example, the first stream-json event) and a `resume` argv. Both are
  HYPOTHESIS until read from `--help` (0050 item 2).
- Wake with `Continue from your last journal checkpoint in <journal>.`, at most three times. Then run
  `taskkill /PID <pid> /T /F` (`launch-round2.cjs:72`). FALLEN keeps the logs, the session id and the wake history,
  and appends a `fall` signal.
- Wakes and the single restart stay in the same ledger attempt, since only certifier rows count attempts (DeepSeek
  conflict 2). No EXHAUSTED task is woken.
- Exit codes: 0 all done with a report; 1 any FALLEN or FAILED; 2 unknown entry or argument.
- Risk: a stale replay / low / medium / the line names the checkpoint / the journal shows it / zero / low.

## D - Dispatch script, registry, CLI-AGENTS.md

**S-claude-13 `.ai/bin/protocol-dispatch.cjs`.** It reads `.ai/clients.json` and a job file
`{agent, client, promptFile, report, root}`.
- Registry fields: `cli`, `version`, `verified` (date and `--help` source), `argv` (an array), `env` (vibe UTF-8,
  `launch-round2.cjs:80-82`), `permission`, `timeBound`, `sessionIdFrom`, `resume`, `artifacts`, and `failureModes[]`
  as `{cause, countermeasure, signal}`.
- FACT: the launcher spawns shell strings with `shell: true` (`launch-round2.cjs:32-40,86`), which is the quoting
  class 0050 removes. HYPOTHESIS: npm clients are `.cmd` shims that Node on Windows will not spawn without a shell.
  Resolve them to `node <entry.js>`, or use one tested quoter.
- Before spawning, check that the toplevel equals the root and that the prompt has its Step 0 line.
- CLI-AGENTS.md gains §9 Dispatch (0050 item 2, one restart) and §10 Profiles, which points to the registry. §6
  (`CLI-AGENTS.md:123-142`) cites the per-run authorisation. The launcher retires at certification.
- Risk: machine paths get tracked / high / low / `~` and `<root>` templates / a local override in `.ai/runtime/` /
  small / none.

**S-claude-14 K5 for every client.** Detection: the dispatcher compares HEAD and refs before and after each run, and
any move is a violation plus a `procedure-gap` signal. Prevention: a `.git/hooks/pre-commit` refuses commits while
`PROTOCOL_DISPATCHED=1` is set, outside the tree (0048 item 8, Q5). Risk: `--no-verify` / low / medium / detection
still fires / owner review / zero / low.

## S - Signals ledger

**S-claude-15 File, grammar, processing.**
- `.ai/SIGNALS.md` is append-only and written only via `protocol-signal.cjs add`, in the interim journal shape:
  `Signal: <id> | <type> | <date> | <participant> | <evidence> | cost=<n><attempts|min|owner> | <disposition>`.
- `type` is one of procedure-gap, script-candidate, fall. `disposition` is one of open, grouped:G-n, procedure:<ref>,
  script:<ref>, kept-by-assistant:<unmet §1 condition>, rejected:<reason>.
- A change is a new line with the same id; the last wins (as in REGISTRY); unparseable exits 2. `plan --batch <id>`
  groups open signals by the coordinator's `rc=` tag, lists groups open two batches (0051 item 2), and imports journal
  `Signal:` lines once, by hash.
- Risk: concurrent appends / medium / low / one `appendFileSync` per line, and the lock for grouping / duplicate ids
  rejected / small / residual: HYPOTHESIS that appends are atomic on NTFS.

## C - Research cycle and kernel-change scenario

**S-claude-16 `.ai/docs/RESEARCH-CYCLE.md`.**
- It records rounds 1-3 (0052 item 1) and the four-step close (0053 item 1). It holds templates for the brief and
  round prompts (Step 0, the agreement form, caps) and for the independence journal line.
- It adds a validator warning for reports over their cap. FACT: `r2-copilot-z2-z4.md` is 268 lines; the cap lives
  only in prompts. It declares one limit: "did not open" cannot be observed by a script (as in spec §6).
- PAIRED-CYCLE §5 item 3 (`PAIRED-CYCLE.md:160`) is scoped to implementation cycles (0052 item 3).
- Risk: drift from the decisions / low / medium / cite, never restate / review / small / low.

## K - Conflicts K2-K5 and canonical homes

**S-claude-17 Conflicts.**
- K2 is not live. FACT: PROTO-DEC-0022 closes DEC-0014 (DECISIONS:1056), and the validator whitelists it
  (`validate-protocol.ps1:446`). It needs only an annotation in `protocol-index.cjs`, with no block edit.
- K3 is live. FACT: 0036 item 1 closes Repomix permanently (DECISIONS:1612), yet `PROTOCOL.md:325-339` still
  prescribes `repomix@1.18.0` (:330). Withdraw that text and cite 0036: a docs edit, one reviewer.
- K4 is covered by S-claude-18 (2), and K5 by S-claude-14.

**S-claude-18 Canonical homes.** Decisions stay the authority. Each rule gets one operational text; other homes keep
one line and a link. (1) Budget: spec §4 plus `checkStopRule`. (2) Liveness: CLI-AGENTS §9 plus the registry (5 min,
3 wakes, 60-min cap); the 15 min of 0047 item 6 (DECISIONS:1980) stays only as the checkpoint cadence. (3) Ledger
format: spec §2. (4) Verdicts: PROTOCOL.md. (5) Gate: AGENTS §2. (6) Paired cycle: PAIRED-CYCLE §2. (7) Journals:
AGENTS §5. Rows 1-3 are aligned in this round because it edits them; rows 4-7 are deferred.

## Order, batching, scope

**S-claude-19 Order across the two edit streams.** Stream A is Gemini, stream B is DeepSeek.
- **Wave 0, spec (A):** the §2 locator; §4 attempt semantics, EXHAUSTED and CLOSED-BY-OWNER; §6 roles, scope, merge
  and agreement grammar (matcher window open); the package fields; the signal grammar.
- **Wave 1, in parallel:** A: `protocol-scope.cjs` (S-01, S-03, S-04) and `protocol-verdict.cjs` (S-05, S-06, S-10),
  so one stream owns verdict.cjs. B: `protocol-dispatch.cjs`, `clients.json` and the watchdog (S-11 to S-14), all new
  files.
- **Wave 2:** A: `protocol-handoff.cjs` (S-08, S-09), the template, validator parity. B: `protocol-signal.cjs`,
  CLI-AGENTS §9-10, RESEARCH-CYCLE.md, the pointers, K3.
- **Dependencies:** S-09 needs the S-01 scope key, and S-12 needs the S-15 grammar; wave 0 fixes both.
- **Certification:** one freeze and one diff certification against `4ded1be` (0049 Consequences), with
  `record --candidate` Evidence.
- **Calibration:** matcher calibration is research, so the two-stream cap does not apply to it (0048 item 7).

**S-claude-20 Deferred to the kernel redesign**, as none of it obstructs work now (0048 item 6): R3-C05 prevention
code of any kind (an append-only decision writer or a raw compare); in-client heartbeat hooks for agy, Kilo, Copilot
and vibe (S-11(a)(d) cover dispatched runs); script-written journal entries (signal J); calibration and shadow scoring
(Q-L6); rule-not-found (Q-L0); read expansion outside certification (Q-L8); home rows 4-7; a standing supervisor
service; CodeBurn.

## Where round 2 conflicts, and what the evidence supports

**S-claude-21 Resolutions.** (1) Option 3 on R3-C05: Gemini and DeepSeek over Copilot's Z2-2 support (S-claude-07).
(2) `checkStopRule`: Copilot is right on the FACT (`:675`); Gemini's "can" was a proposal; exit 3 is dropped
(S-claude-06). (3) Clean tree, re-run: Mistral and DeepSeek are each half right; isolation is needed, plus a digest
criterion (S-claude-08). (4) Mistral's Z3-01 is misattributed: FACT `copilot-z3-diff-cert.md:14-34` has no certifier
list, though the content is right per 0046 item 6. (5) Suite time: 315 s, not 270 s (`copilot-2db59a7f7eba7f43.md:43`).

## Owner-only questions

**S-claude-22**
- Q1: PLAN is at its cap. I recommend archiving the product-pilot sections (dormant under 0048 item 1) and keeping the
  procedure in PLAN. The alternatives are raising the cap or naming another home.
- Q2: Who is 0048 item 7's one coordinator? Does TASK:48 (Codex prepares dispatch) scope this batch? If so, Codex
  cannot fill slot 2.
- Q3: Who fills slot 2 under Codex's limits, now that certification is diff-only?
- Q4: Which batch and stream ids serve as Roles scopes, and who writes them?
- Q5: May a `.git/hooks/pre-commit` guard for dispatched runs be installed (0048 item 8)?
- Q6: Is each sanctioned borrowing recorded as a decision block, or in a sanction registry?
- Q7: May the quotation matcher be automated this round if calibration passes?
- Q8: Is the wave-0 spec certified first on its own, or with the code at the one freeze?
