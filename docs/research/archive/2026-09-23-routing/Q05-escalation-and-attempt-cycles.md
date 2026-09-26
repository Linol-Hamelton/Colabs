# Q05 - Escalation on failure to senior models; maximum number of attempt cycles

- Question (owner, condensed): escalation on failure to senior models; maximum number of attempt cycles.
- Primary: deepseek (coordinator role; writes, certifies nothing). Challenger: copilot.
- Date: 2026-09-23 (UTC). Reviewed commit: `b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed` (`git rev-parse HEAD`); working tree dirty (staged corpus/report changes, uncommitted research documents and journals).
- Inventory commands run: `git -C D:\Colabs ls-files | Measure-Object -Line` -> 307 files; `git -C D:\VPN ls-files ...` -> 866; `git -C D:\Block-Puzzle ls-files ...` -> 593; `git -C "D:\Битва за луну" ls-files ...` -> 45. Product `.ai/worklog` file counts: VPN 61, Block-Puzzle 30, Битва за луну 16.
- Read order: binding rules, then raw history, then prior research; the opinion document `docs/reviews/2026-09-23-codex-routing-architecture.md` was read LAST, after this decomposition. No "Claude reply" file exists in the tree on this date.

## 1. Decomposition

The question splits into components that the history addresses very unevenly:

1. Failure taxonomy: what counts as "failure" that triggers escalation (verdict FAIL, BLOCKED,
   capability failure, availability/quota, non-performance).
2. The escalation target: what "senior model" means in a fleet with no tier registry.
3. The budget unit: attempts counted per root cause, per task, per round, per provider.
4. Decision authority: who escalates - rule, controller, or owner - and how it is recorded.
5. The stop side: what ends a cycle when escalation does not converge.
6. The independence side: who may NOT be the escalated certifier (PROTO-DEC-0041 item 1).

## 2. Essential factors

- The budget already exists as policy: at most two remediation attempts per root cause, then
  stop and return the area or premise to the owner (FACT `.ai/PLAN.md:163-164`; restated in
  the managed runbook FACT `.ai/docs/PAIRED-CYCLE.md:159`). PROTO-DEC-0046 item 4 fixes the
  counting: per `root-cause` and `attempt`, not per report (FACT `.ai/DECISIONS.md:1947`),
  and it does not renumber the old premise's attempts (FACT `.ai/DECISIONS.md:1944`).
- Repetition is never scheduled: a phase repeats only on one of four triggers - a confirmed
  defect, a changed candidate or scope, new external information, or an incomplete closure
  proof (FACT `.ai/PLAN.md:156-158`); a phase budget is declared in advance and on exceed you
  stop and report (FACT `.ai/PLAN.md:165-167`).
- Attempt identity is a human judgement, not a measurement: `attempt` is keyed by `root-cause`
  (FACT `docs/specs/2026-09-23-executable-rulebook-spec.md:78`), and the live example is
  contested - round 3 left open "whether the `---` weakening is a third attempt on F-001's
  root cause or a first attempt on a new one" (FACT `.ai/worklog/deepseek-face2b2e94e03a81.md:24`).
  The check-2 stop rule is mechanical once identity is fixed: any group reaching attempt 3
  exits 1 and tells the owner to stop; non-contiguous attempts exit 2 (FACT
  `docs/specs/2026-09-23-executable-rulebook-spec.md:126,130-136`).
- "Senior" is undefined operationally. No record maps a model tier to an agent family; the
  metrics schema has no model, provider, or role field (FACT by schema; see section 4), and
  the role lines in `.ai/TASK.md:44-51` describe duties (implementer, controller, certifier,
  escalation certifier), not a capability ladder.
- The history shows escalation as an owner act, not a rule: the owner replaced a premise
  rather than grant a third attempt (FACT `.ai/DECISIONS.md:1941,1944`); the owner named
  Claude standing certifier and Codex the escalation certifier (FACT `.ai/ARCHIVE.md:6249`);
  the owner substituted the rulebook batch's certifier slate (FACT `.ai/DECISIONS.md:1948-1949`).
- Availability failures are structurally invisible to telemetry: the only metric writer is
  the Stop hook (FACT `.ai/DECISIONS.md:1580`), so a dispatch that dies at quota or auth
  never produces a row; the 2026-09-23 Codex quota event exists only as journal prose (FACT
  `.ai/worklog/deepseek-face2b2e94e03a81.md:18,20`).

## 3. Blind spots - three ways a confident answer here could be wrong

1. Root-cause labelling can be gamed or misjudged, and the cap then measures taxonomy skill,
   not quality: splitting one problem into new root-cause labels resets the budget. The open
   F-001/immutability classification is a live instance (FACT `...face2b2e94e03a81.md:24`).
2. Escalation outcomes have no denominator. The only clean senior-model escalation inside a
   certification loop - Codex in the cycle architecture - is n=1: r3/r4 FAIL then r5 PASS
   (FACT `.ai/ARCHIVE.md:6450,6534`; `.ai/worklog/codex-eb8786999ebfc7c2.md:11`). Any
   "seniors fix it" claim from that is HYPOTHESIS.
3. Verdict frequency is not competence: FAIL counts mix task difficulty, reviewer strictness
   and assigned role, and reviews historically used 57 header forms of which only a subset is
   machine-countable (CLAIM `templates/reviews/REVIEW.md:22`; measured counts in Q12's
   dossier). A rotation policy tuned on FAIL shares would chase a biased signal.

## 4. Evidence (label: meaning; every claim carries a path and line)

Rules and mechanics:
- FACT: two attempts per root cause, owner return after (`.ai/PLAN.md:163-164`;
  `.ai/docs/PAIRED-CYCLE.md:159`).
- FACT: trigger list for any repeat (`.ai/PLAN.md:156-158`); phase budget declaration
  (`.ai/PLAN.md:165-167`).
- FACT: the stop rule and the attempt field (`docs/specs/2026-09-23-executable-rulebook-spec.md:78,126,130-136`);
  its acceptance test names "a third attempt on one root cause" (`:189`).
- FACT: the review-scale gate that forces full pairs on protocol core and a single statement
  elsewhere (`.ai/DECISIONS.md:1671`); two parallel independent certifiers for high-risk
  final checks (`.ai/DECISIONS.md:1793`); protected-path blocking (`:1795`).
- FACT: a Codex capability failure yields BLOCKED and leaves the task open, because one
  reviewer does not satisfy item 2 (`.ai/ARCHIVE.md:6251`); the residual that the second slot
  has no standing occupant for routine high-risk work was left for the owner
  (`.ai/ARCHIVE.md:6255`).
- FACT: roles live in TASK and are owner-written (`.ai/TASK.md:44-51`).

Recorded escalation events:
- FACT 2026-09-20: the designated Gemini session "failed twice to make any change"; the
  controller executed the remediation itself and disclosed it (`.ai/ARCHIVE.md:4450`).
- FACT 2026-09-20: two external spots deferred because "Codex and Claude both hit limits"
  and "when a reviewer quota returns" (`.ai/worklog/deepseek-59c81998639a4feb.md:74`,
  `:45`; `.ai/PLAN.md:131`).
- FACT 2026-09-22: owner reported Codex limits exhausted and named substitutes (Copilot,
  DeepSeek, Gemini) subject to independence (`.ai/TASK.md:64`).
- FACT 2026-09-23: Codex blocked twice (sandbox `spawnSync git EPERM`; OpenAI quota until
  11:34 local), no verdict; Claude slot returned FAIL; one FAIL already stops the round and
  leaves attempt 2 to the owner (`.ai/worklog/deepseek-face2b2e94e03a81.md:18,20`).
- FACT 2026-09-19: Qoder's review downgraded to advisory on a receipt/owner mismatch; no
  replacement certifier recorded (`.ai/DECISIONS.md:1710`; `.ai/TASK.md:28`).
- FACT 2026-09-22: DeepSeek terminal route measured impossible on context budget
  (181,577 input tokens vs 163,840 limit) -> route substitution (`.ai/DECISIONS.md:1849`;
  `docs/decisions/REGISTRY.md:62`).

Attempt-cycle data:
- FACT: the cycle architecture needed Claude round 3 and Codex round 5, while policy set a
  two-attempt budget; "the available journals do not map every round to one root-cause ID,
  so an enforcement conclusion needs a single ledger" (`.ai/ARCHIVE.md:6624,6626`).
- CLAIM (withdrawn): an early cohort read "outcome changed in 9 of 12 second rounds"; later
  corrected to "eight normalized verdict transitions" in the same twelve-row table
  (`.ai/ARCHIVE.md:4509`; `.ai/ARCHIVE.md:6152`).
- FACT: F-001 chain - round 1 found the implementation absent (`.ai/worklog/deepseek-db22ebbd5fd21de8.md:98-117`),
  round 2 FAIL with F-001 HIGH (`:52,66-69`), remediation attempt 1
  (`.ai/worklog/gemini-4261c9c2e2da03ac.md:9,14`), round 3 FAIL with F-001 partial and
  self-labelled attempt 2 of the <=2 budget
  (`docs/reviews/2026-09-23-deepseek-batch-certification-round3.md:28`; `.ai/worklog/deepseek-db22ebbd5fd21de8.md:9`).
- FACT: the only findings-ledger artifact on disk is a 3-line runtime probe (`.ai/runtime/codex-path-review-ledger.md:1,3`);
  the ledger artifact is "new" in the spec and had not existed (FACT `docs/specs/2026-09-23-executable-rulebook-spec.md:62-64`).

Telemetry (MEASURED by this author, 2026-09-23):
- 76 rows in `.ai/runtime/metrics/sessions.jsonl`; agents: claude 60, codex 12, gemini 2,
  copilot 1, deepseek 1; 25 distinct session ids; `handoffComplete=true` in 38 rows; keys:
  `ts, session, agent, changedFiles, durationSec, firstEditMs, handoffComplete, gitHead`.
  Command: `Get-Content .ai/runtime/metrics/sessions.jsonl | ForEach-Object { $_ | ConvertFrom-Json }` then `Group-Object agent`.
- FACT: no `model`, `provider`, `verdict`, `attempt`, `role`, `cost`, or `tokens` field
  exists (zero-match greps on the metrics directory; schema fixed by PROTO-DEC-0035,
  `.ai/DECISIONS.md:1580`). Attempt data cannot be recovered retroactively.

Opinion input (read last): the Codex advisory proposes a failure taxonomy and states that
"Existing maximum remains TWO remediation attempts per root cause, across all models,
providers and sessions" (CLAIM, advisory only, `docs/reviews/2026-09-23-codex-routing-architecture.md:130`).

## 5. What history can and cannot support

Can support: the existence and exact wording of the cap; that the cap was enforced once
(F-001 round 3 -> owner) and replaced once (new premise, PROTO-DEC-0046); that escalation
events happened and were owner-decided; that runtime and capability failures recurred
(limits, sandbox, context ceiling).
Cannot support: any escalation rate, any senior-vs-junior lift, any optimal attempt cap, or
any model-tier ranking. There is no task denominator, no model identity per session, and no
structured verdict/attempt join; FAIL shares cannot be normalized by difficulty, role, or
reviewer strictness.

## 6. Interaction with binding rules

- Independence: PROTO-DEC-0041 item 1 forbids certifying by anyone who authored, executed or
  controlled the candidate (FACT `.ai/DECISIONS.md:1792`). An escalated implementer
  (`.ai/ARCHIVE.md:4450`) therefore cannot later certify the same candidate; escalation must
  budget a fresh certifier, and item 2 still requires two parallel certifiers on high risk
  (`.ai/DECISIONS.md:1793`). The 2026-09-23 batch is the live example: coordinator DeepSeek
  certifies nothing (`.ai/DECISIONS.md:1948-1949`).
- Reproduction over voting: escalation must not let a senior model's vote erase a
  reproduction; a FAIL/BLOCKED claim needs a reproduction to block (AGENTS.md section 2).
- Advisory tools: external judges (including Jev) can suggest escalation but never write a
  verdict or override a gate (PROTO-DEC-0034; PROTO-DEC-0045 item 3).

## 7. Interaction with the other 12 questions

Q04 (effort rotation): escalation by effort is cheaper than by model only if applied effort
is observable - it is not (Q12). Q07 (coordinator cycles): the two-attempt cap bounds the
coordinator's "longest possible cycles". Q09 (leave): quota events must be classified either
as leave (planned) or as failure (escalation trigger); today they are neither recorded nor
classified. Q11 (deputies): the deputy inherits the remaining attempt budget; without the
documented cap across providers, a substitution is a budget reset (the advisory calls this
out: CLAIM `...routing-architecture.md:130`). Q12 (logging): everything Q05 cannot measure is
a Q12 requirement. Q13 (limits): attempt data is small; the missing denominator is the issue.

## 8. Options (at most three)

A. Rule-only (today): keep two attempts per root cause, owner returns, no new machinery.
   Cost 0, time 0. Risk: root-cause relabelling resets budgets; classification disputes
   consume owner turns (live example, `.ai/worklog/deepseek-face2b2e94e03a81.md:24`).
B. Rule + ledger + telemetry: keep the cap, make the findings ledger the counting record for
   every round (first real use exists in tests and one probe), and add attempt/verdict/model
   fields to the metrics schema. Cost: small code + discipline change; time: one bounded
   slice. Risk: schema churn on disposable data; needs owner approval for any cap change.
C. Declared senior ladder: define, per question, a named escalation order with pre-declared
   deputies and pre-settled questions (feeds Q09/Q11). Cost: owner authoring; time: medium.
   Risk: the history cannot justify the order by measurement; it would be declared, not
   derived, and must be marked as such.

## 9. Recommendation and the forks only the owner can decide

Recommendation: A now, B next (option B is A made measurable; C only after B produces data).
Forks: (1) classify the `---` weakening - attempt 3 of F-001 (stop) or attempt 1 of a new
root cause; (2) decide whether a quota/auth block is "leave" (Q09) or "failure" (Q05);
(3) decide whether a task-level cap exists in addition to the root-cause cap, so relabelling
cannot create an endless workflow.

## 10. Missing data

Per-session model/provider identity; attempt and root-cause IDs in telemetry; verdict and
reviewer-role joins; quota/reset observations; a classification rubric for root causes; the
definition of "senior" for each provider; and any counterfactual for escalated vs
non-escalated runs.

## 11. Challenge

Challenger: pending. The challenger must first save its own blind-spot list here, then read
this document and attack it; disagreement stays visible and is never averaged away.
### Challenger's independent blind-spot list (copilot, saved before reading the primary document)
- Attempt-cycle units may be counted inconsistently across retries, handoffs, and partial failures.
- Root-cause labels may be post hoc, overlapping, or unavailable at escalation time.
- 'Senior' may lack an operational definition, eligibility threshold, or stable model set.
- Rules/events may establish constraints but not comparative success rates for the proposed options.
- A missing denominator can make escalation gains and failure rates non-identifiable.
- The recommendation may silently assume a baseline, sample size, or stopping rule not evidenced.
- Attempt budgets may reset or double-count when responsibility changes.
- No guard may prevent escalation loops, duplicate work, or escalation after terminal failures.
### Challenger's attack on the primary document (copilot, after reading)
- The primary correctly concedes that history cannot support an optimal cap or senior-vs-junior lift (docs/research/2026-09-23-routing/Q05-escalation-and-attempt-cycles.md:135-138), but still recommends keeping the two-attempt rule immediately (docs/research/2026-09-23-routing/Q05-escalation-and-attempt-cycles.md:180-180). That is a policy-preservation choice, not an evidence-backed recommendation; the missing denominator blocks claiming that Option A is safer or cheaper than a temporary owner-set cap.
- The claimed one-time enforcement of the cap is not a clean validation sample: the same document says attempt identity is human judgement and cites a live dispute over whether a change is attempt 3 or a new root cause (docs/research/2026-09-23-routing/Q05-escalation-and-attempt-cycles.md:32-36). Thus the enforcement example cannot establish that the accounting rule is reliably applied.
- Option B adds telemetry, but the proposed next step does not require a task-level immutable attempt ledger before escalation. Without that join, a provider handoff can still reset accounting; the primary itself identifies no structured verdict/attempt join (docs/research/2026-09-23-routing/Q05-escalation-and-attempt-cycles.md:135-138).
- The undefined senior tier is acknowledged (docs/research/2026-09-23-routing/Q05-escalation-and-attempt-cycles.md:39-45), yet the options allow a declared senior ladder (docs/research/2026-09-23-routing/Q05-escalation-and-attempt-cycles.md:170-176) without an eligibility or competence denominator. That risks converting an owner preference into a purported escalation policy; the recommendation should gate any ladder on measured, reproducible qualification.
