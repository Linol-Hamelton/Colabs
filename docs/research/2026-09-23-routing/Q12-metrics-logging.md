# Q12 - Logging every metric, for periodic review of roles, ratings and coefficients

- Question (owner, condensed): logging every metric, for periodic review of roles, ratings and coefficients.
- Primary: deepseek (coordinator role; writes, certifies nothing). Challenger: mistral.
- Date: 2026-09-23 (UTC). Reviewed commit: `b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed` (`git rev-parse HEAD`); working tree dirty (staged corpus/report changes, uncommitted research documents and journals).
- Inventory commands run: `git -C D:\Colabs ls-files | Measure-Object -Line` -> 307; `D:\VPN` -> 866; `D:\Block-Puzzle` -> 593; `D:\Битва за луну` -> 45. Metrics files: `D:\VPN` and `D:\Block-Puzzle` have none; `D:\Битва за луну\.ai\runtime\metrics\sessions.jsonl` exists (10 lines).
- Read order: binding, raw history, prior research; the opinion document `docs/reviews/2026-09-23-codex-routing-architecture.md` was read LAST, after this decomposition. No "Claude reply" file exists in the tree on this date.

## 1. Decomposition

1. What is logged today, by which code path, and on which events.
2. What the journal Evidence block logs, and its role as the durable per-task record.
3. What is absent that a ratings/coefficients review would need: model identity, cost,
   verdict joins, attempts, roles, failure reasons.
4. The join problem: session rows use opaque ids; reviews key on journal owner names.
5. Capacity/caps and retention: which logs are disposable, which are durable, which are
   capped by the validator.
6. What "coefficients" could even mean without a task denominator.

## 2. Essential factors

- The telemetry is Stop-event only: one JSON row per Stop exit from the hook, written by
  `recordSessionMetric` (FACT `.ai/DECISIONS.md:1580`; FACT `.ai/docs/PROTOCOL.md:350`).
  A session that crashes, is killed, or never reaches Stop contributes nothing; a dispatch
  blocked at quota/auth leaves no row (FACT: the Codex quota event survives only as journal
  prose, `.ai/worklog/deepseek-face2b2e94e03a81.md:18,20`).
- The schema is small and fixed: `ts, session, agent, changedFiles, durationSec, firstEditMs,
  handoffComplete, gitHead` (FACT `.ai/DECISIONS.md:1580`); `durationSec` is cumulative per
  session and `firstEditMs` is an upper bound by mtime (FACT by schema and codec comments).
- The real per-task record is the journal Evidence block, not the metrics: anchor, digest
  over the tree, recorded time, entry hash, parent-entry, scope, one exit per check
  (FACT `protocol-handoff.cjs:119-134`; live example `.ai/worklog/gemini-927b6b871251a111.md:25-35`).
- Verdicts are header tokens in review files, and their form has drifted: a template note
  records 56/115 matched a closed set and 59/115 deviated across 57 form variants
  (FACT `templates/reviews/REVIEW.md:22`). Measured on active reviews, only 16 of 57 files
  carried a countable header verdict (PASS 4 / FAIL 9 / RECOMMENDATION 3 / BLOCKED 0; label
  MEASURED, dossier method, routing pair excluded).
- Roles are task-local text, replaced per task (FACT AGENTS.md section 2; live instance
  `.ai/TASK.md:44-51`), and the current instance already has duplicate agent keys
  (deepseek `:47`/`:49`, codex `:48`/`:51`) that conflict with the parser's one-entry-per-agent
  assumption (FACT `protocol-hooks.cjs:300,309`).
- Runtime state is disposable by design: `.ai/runtime/` is gitignored
  (FACT `.gitignore:14`), rotated at 1 MB overwriting `sessions.1.jsonl`, and cleaned after
  7 days (FACT `protocol-hooks.cjs:619-636`; `protocol-session.cjs:342-348`). Prior analysis
  used the file by hand and salvaged "25 real sessions, 22.5 h, 119 changed files"
  (CLAIM `.ai/ARCHIVE.md:5257`).
- The project already declared its measurement basis: five frozen pilot metrics are derived
  from `git diff --numstat`, hook `firstEditMs`, verdicts and journals (FACT `.ai/PLAN.md:100,105,109`),
  and PLAN-level diagnostics are explicitly "not new success criteria" (FACT `.ai/PLAN.md:187-191`).

## 3. Blind spots - three ways a confident answer here could be wrong

1. Counting rows counts Stops, not sessions: 76 rows describe 25 session ids, and one Claude
   session produced 45 of them (MEASURED, this author's aggregation). Any per-agent rate
   computed from rows overcounts by roughly 3x.
2. Absence of a failure row is not absence of failure: the logging path never runs for
   quota/auth/sandbox failures, so reliability ratings computed from the log will be biased
   upward exactly for the providers that fail most visibly.
3. Ratings from reviews are not comparable: FAIL shares mix difficulty, role and reviewer
   strictness, and the review namespace mixes certification reports, prompts and research
   documents with no type field, so the true review denominator is unknown (FACT
   `templates/reviews/REVIEW.md:22`; measured 16/57 verdict headers).

## 4. Evidence

Logging machinery:
- FACT: schema and disposable/advisory status (`.ai/DECISIONS.md:1580`; `.ai/docs/PROTOCOL.md:350`).
- FACT: append site and rotation (`protocol-hooks.cjs:621-640,636`); call sites are all in
  the Stop branch (`:510,557,572,603`); SessionStart writes nothing.
- FACT: `protocol-session.cjs stop` prints the same fields; `protocol-handoff.cjs record`
  writes Evidence into the journal and never touches metrics (zero-match grep for `metrics`).
- FACT: Evidence format and parse (`protocol-handoff.cjs:119-134,176-187`); gate checking
  requires the named owner's Evidence to verify (`:1297-1321`).

Absences (zero-match greps on `.ai/runtime/metrics/`):
- FACT: no `model`, no `provider`, no `cost`/`tokens`, no `verdict`, no `attempt`/`retry`,
  no `role`, no `downtime`/`phase`/`error`/`exitCode`. Review prose can name a model
  (FACT `docs/reviews/2026-09-23-claude-batch-certification.md:5`) but it is not joinable data.
- FACT: PROTO-DEC-0035 deliberately excluded consumption measurement from the digest
  (`.ai/DECISIONS.md:1591`); the token pilot existed precisely because logs lacked tokens
  (`.ai/DECISIONS.md:1582`).

What could feed ratings today:
- FACT: verdict tokens and finding dispositions exist per review file but in free form
  (measured counts: PASS 4 / FAIL 9 / REC 3 / BLOCKED 0 across 57 active files; dispositions
  confirmed/observation tables in `docs/reviews/2026-09-22-deepseek-layers-abc-certification.md:38-44`,
  `docs/reviews/2026-09-23-claude-batch-certification.md:56-60`, among others).
- FACT: roles exist only as current TASK text (`.ai/TASK.md:44-51`), not as history.
- FACT: caps the validator enforces: journals >30 -> WARN-first
  (`validate-protocol.ps1:251-253`); reviews >60 files or 600 KB -> WARN (`:256-299`); journal
  `Agent:` mismatch -> WARN (`:1034-1040`). AGENTS section 8 table carries the same limits
  (FACT AGENTS.md:383-395).
- MEASURED: this author aggregated the file: rows 76, distinct sessions 25, agents claude 60 /
  codex 12 / gemini 2 / copilot 1 / deepseek 1, `handoffComplete=true` 38, changedFiles sum 323,
  gitHead range `5b34ae0` -> `b232a9e`.

Product repositories:
- MEASURED: `D:\Битва за луну\.ai\runtime\metrics\sessions.jsonl` has 10 rows; VPN and
  Block-Puzzle have no metrics directory at all (their installed hooks contain no recorder).
  So product pilots currently log nothing to the protocol telemetry.

Opinion input (read last): the advisory proposes one event schema with task/run/root-cause
ids, model/harness versions, requested vs applied effort, role/domain/risk, tokens/cost/quota,
switches and reasons, findings/acceptance (CLAIM, advisory,
`docs/reviews/2026-09-23-codex-routing-architecture.md:158-163`), and tentative capacity raises
(journals 30->60, reviews 60->90 / 600 KB->1.2 MB) contingent on an owner decision (`:164-167`).

## 5. What history can and cannot support

Can support: protocol compliance auditing (receipts, exits, tree digests, cap warnings);
gross time accounting at Stop granularity; a hand-reconstructed summary of one pilot window.
Cannot support: per-model or per-provider ratings, cost efficiency, attempt/round statistics,
role histories, reviewer accuracy joins, or any calibrated coefficients. The denominators
(tasks, models, rounds) are not recorded anywhere machine-readable.

## 6. Interaction with binding rules

Metrics are disposable and advisory: nothing in `.ai/runtime/` may become Evidence or a gate
input (PROTO-DEC-0034; PROTO-DEC-0035). A ratings table built from metrics therefore cannot
certify anything; it can only inform the owner's periodic review. Secret hygiene binds the
log (record blocks unredacted credentials), and any added field must not capture credentials
or raw transcripts. Data-minimisation vs "log every metric" is an explicit fork.

## 7. Interaction with the other 12 questions

Q01 needs resolved model ids; Q02 needs outcome joins; Q03/Q04 need requested-vs-applied
effort records; Q05 needs attempt fields; Q08 needs cost/quota; Q09 needs leave observations;
Q10 needs phase timestamps; Q11 needs deputy attribution; Q13 is the capacity question that
decides how much history is retained. Q12 is the enabling question for the rest.

## 8. Options (at most three)

A. Extend the Stop row (cheapest): add `model`, `provider`, plus a `taskId` and `role` when
   the dispatcher supplies them; missing stays null. Cost: one bounded code slice; risk:
   rows still miss crashes and pre-Stop failures.
B. Machine event log + journal Evidence unchanged: a separate append-only JSONL for
   routing/verdict/attempt events with explicit ids, while journals keep the human record.
   Cost: more code and discipline; benefit: no Evidence-format churn, covers failures if
   written at dispatch time rather than Stop.
C. Do less: record route+model in each journal entry and reflect it in the review header;
   no new files. Cost: zero code; risk: remains unmachineable, exactly today's problem.

## 9. Recommendation and the forks only the owner can decide

Recommendation: A now (minimal joinable fields at dispatch and Stop), B if the owner wants
ratings before the next pilot window; C only as a stopgap. Forks: (1) data-minimisation vs
"log every metric" - which fields are allowed, and for how long; (2) whether ratings are a
periodic owner-reviewed artifact (and against which frozen denominator); (3) whether any cap
changes from Q13 are coupled to this.

## 10. Missing data

Everything this document is about: task/attempt/verdict joins, model identity, cost and
quota, failure reasons, role history. Also missing: any definition of the "coefficients" the
owner wants reviewed, and the review type-tag that would give the denominator.

## 11. Challenge

Challenger: pending. The challenger must first save its own blind-spot list here, then read
this document and attack it; disagreement stays visible and is never averaged away.

### Challenger's independent blind-spot list (mistral, saved before reading the primary document)

- Proposed metric fields must be joinable to both tasks and reviews; no schema provided showing foreign keys or join paths to task_id or review_id.
- Schema churn cost on disposable state (worklog, journals) is unquantified; adding fields to tracked markdown may break existing parsers and validators.
- No capacity numbers provided for storage, throughput, or retention; unbounded logging is implied but unsustainable.
- "Ratings/coefficients" without a task denominator are meaningless: ratings are relative to a task context, coefficients need a scope.
- Censored/crashed runs: how are partial executions logged? Are they marked as failed, retried, or silently dropped?
- No rollback/cleanup mechanism for corrupted or malformed log entries.
- No access control or tamper-evidence for log files.

### Challenger's attack on the primary document (mistral, after reading)

- Line 22-26: telemetry is Stop-only; crashes and quota failures leave no row. Recommendation A (line 133-135) extends Stop rows but cannot capture pre-Stop failures, contradicting the need to log "every metric".
- Line 53-55: 76 rows describe 25 session ids (3x overcount); the primary admits this (line 54-55) but no option proposes deduplication, making per-agent rates systematically inflated.
- Line 76-77: metrics lack model, provider, cost, verdict, attempt fields. Option A adds these to Stop rows, but since crashes never reach Stop (line 24-26), the most critical reliability data remains missing.
- Line 112-114: explicitly cannot support per-model ratings or attempt statistics, yet recommendation A claims extending Stop rows enables ratings. This is inconsistent.
- Line 153-155: missing data includes task/attempt/verdict joins, but no option explains how to retroactively join existing journals/reviews to populate historical denominators.
- Line 30-32: Evidence block is the "real per-task record", but Evidence blocks contain no model identity or cost (line 76-77), so they cannot support ratings/coefficients reviews.
- Line 145-149: recommends A now, but A's "missing stays null" approach (line 135) means most fields will be null for crashes, defeating the purpose of periodic review.
