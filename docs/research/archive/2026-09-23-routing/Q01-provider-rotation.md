# Q01 - Provider rotation: auto-switching providers by task type and complexity (today via CLI)

- Question (owner, condensed): provider rotation - auto-switching providers by task type and complexity (today via CLI).
- Primary: deepseek (coordinator role; writes, certifies nothing). Challenger: gemini.
- Date: 2026-09-23 (UTC). Reviewed commit: `b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed` (`git rev-parse HEAD`); working tree dirty (staged corpus/report changes, uncommitted research documents and journals).
- Inventory commands run: `git -C D:\Colabs ls-files | Measure-Object -Line` -> 307; `D:\VPN` -> 866; `D:\Block-Puzzle` -> 593; `D:\Битва за луну` -> 45. Product `.ai/worklog` file counts: VPN 61, Block-Puzzle 30, Битва за луну 16.
- Read order: binding, raw history, prior research; the opinion document `docs/reviews/2026-09-23-codex-routing-architecture.md` was read LAST, after this decomposition. No "Claude reply" file exists in the tree on this date.

## 1. Decomposition

1. What selects a provider today, and where that selection is recorded.
2. What inputs an automatic router would need: task type, complexity, risk class, eligibility
   (authorization, capability, entitlement, independence), availability and quota.
3. What "rotation" would change operationally: who chooses, when a switch is allowed, and
   what the switch does to context, budgets and accountability.
4. What already constrains the choice: independence rules, review scale, advisory-tool
   policy, receipts and capability profiles.
5. What the history can measure about provider-task fit, and what it cannot.

## 2. Essential factors

- There is no provider-selection code in the kernel at all: a search of every `.ai/bin/*.cjs`
  for `model|provider` returns exactly one match, a comment (MEASURED `Select-String -Path .ai/bin/*.cjs -Pattern 'model|provider'` -> 1 match, `.ai/bin/protocol-handoff.cjs:217`).
  Rotation today is a dispatcher decision expressed as CLI flags and role text.
- Provider access is deliberately uneven: four families have terminal clients (agy, codex,
  claude, copilot, vibe) and DeepSeek has none - it participates through IDE/chat and is
  advisory unless it ran its own session (FACT `.ai/docs/CLI-AGENTS.md:19-25,30-48`). Model
  ids must be checked at run time and the id actually used recorded (FACT `:27-28`), but no
  store for that exists (section 4).
- The only recorded task-type routing rule is cost-shaped: free/local for tests, paid for
  analysis/coding, Gemini remote route only via `agy` (FACT `.ai/DECISIONS.md:1615`); the
  execution vector is "chosen per task" (FACT `.ai/DECISIONS.md:1711`).
- Risk class already exists as prose and gates effort: protocol-core paths require full
  prompt+report pairs, other edits one statement (FACT `.ai/DECISIONS.md:1671-1672`);
  high-risk final checks require two parallel independent certifiers (FACT `.ai/DECISIONS.md:1793`);
  protected paths block objectively (FACT `.ai/DECISIONS.md:1795`). A Phase 0 frame must
  carry the risk class (FACT `.ai/PLAN.md:150`), and PLAN-level diagnostics already wish to
  record "task and risk class, phase, candidate, reviewer role and actual model where known"
  (FACT `.ai/PLAN.md:187-191`) - "not new success criteria".
- Complexity has no operational definition anywhere in the tree; difficulty is inferred by
  humans from the task text and the review scale, not measured.
- Two recorded restraints push against naive model-per-task switching: "No brand trust" -
  capability is the operational environment, not the model title (FACT `.ai/docs/PAIRED-CYCLE.md:22`);
  and the work is "not ... a separate model per pass" (FACT `.ai/docs/PAIRED-CYCLE.md:28`).
- Independence binds assignment before quality does: no certifier may come from the author,
  executor, controller or the executing pair (FACT `.ai/DECISIONS.md:1792`); a caller never
  records a callee's receipt (FACT `.ai/docs/CLI-AGENTS.md:82-86`).

## 3. Blind spots - three ways a confident answer here could be wrong

1. "Complexity" may be unmeasurable from history, so any router would consume a label no one
   can back-test; the only structured risk input is the prose path list in PROTO-DEC-0038.
2. An auto-switcher can silently break independence or capability guarantees unless
   eligibility is enforced by deterministic code before any model choice (the advisory's
   own framing: CLAIM `docs/reviews/2026-09-23-codex-routing-architecture.md:52-63`).
3. Aliases are not models: `--model auto` and provider-side auto tiers can change the
   resolved model behind a stable name; with no resolved-id record, a "rotation result" can
   be confounded by an invisible model swap (FACT `.ai/docs/CLI-AGENTS.md:27-28`; CLAIM
   advisory `:79-80`).

## 4. Evidence

Mechanisms:
- FACT: no kernel router; one match only (`.ai/bin/protocol-handoff.cjs:217`, comment).
- FACT: CLI roster and per-client controls (`.ai/docs/CLI-AGENTS.md:19-25`); DeepSeek has no
  terminal client and is advisory unless sessioned (`.ai/docs/CLI-AGENTS.md:30-48`).
- FACT: session identity command and owner name use (`.ai/docs/CLI-AGENTS.md:75-79`);
  roles are owner-written examples, never auto-assigned (AGENTS.md section 2 "Who does what";
  live instance `.ai/TASK.md:44-51`).
- FACT: execution vectors (Agent Manager vs CLI/agy) are recorded choices (`.ai/DECISIONS.md:1711`).
- FACT: cost policy for task types (`.ai/DECISIONS.md:1615`); local 8B/9B models were never
  pilot subjects (`.ai/DECISIONS.md:1614`).

Inputs a router would need:
- FACT: risk scale and batching (`.ai/DECISIONS.md:1671-1673`; `.ai/PLAN.md:193-200`);
  Phase 0 risk class (`.ai/PLAN.md:150`); diagnostic field list (`.ai/PLAN.md:187-191`).
- FACT: independence constraints (`.ai/DECISIONS.md:1792-1793`); advisory-only external
  tools (`.ai/DECISIONS.md:1552-1553`).

Availability events (measured history):
- FACT 2026-09-20: spots deferred because Codex and Claude hit limits
  (`.ai/worklog/deepseek-59c81998639a4feb.md:45,74`).
- FACT 2026-09-22: owner reported Codex limits exhausted; substitutes named
  (`.ai/TASK.md:64`); the DeepSeek terminal route was refused on context budget
  (`.ai/DECISIONS.md:1849`; `docs/decisions/REGISTRY.md:62`).
- FACT 2026-09-23: Codex doubly blocked (sandbox `EPERM`, quota until 11:34 local); Copilot
  "available again after an auth fix" (`.ai/worklog/deepseek-face2b2e94e03a81.md:18,22`).
- FACT: host asymmetry is real - `rg` exists for one host and not another
  (`.ai/worklog/kilo-ddc9014eda60f89b.md:20`; `docs/reviews/2026-09-20-mcp-council-final-round2-synthesis.md:25`).

Metrics (MEASURED by this author):
- 76 rows, 25 distinct sessions; agents claude 60, codex 12, gemini 2, copilot 1, deepseek 1;
  `handoffComplete=true` 38; command stated in Q05. Schema has no model/provider/cost/token
  fields (FACT `.ai/DECISIONS.md:1580`; zero-match greps in the metrics dir).
- The richer pilot schema once existed but is disposable and pilot-only:
  `.ai/runtime/pilot-data/trials.jsonl:1` records `model`, `provider`, `cost_usd`,
  `tokens_in/out`; this is runtime state, not Evidence.

Product repositories:
- FACT: they lack the rules that would bind assignment - no CLI-AGENTS.md and no
  PROTO-DEC-0038/0041 in the installed trees (`.ai/DECISIONS.md:1868`; `D:\VPN\.ai\TASK.md:71-72`).
- MEASURED: VPN 866 files, Block-Puzzle 593, Битва за луну 45; their `.ai/worklog` counts are
  61 / 30 / 16; the VPN and Block-Puzzle trees have no metrics directory.

Opinion input (read last): the advisory proposes routing by domain, role, difficulty, risk
and pool with a recorded selected route (CLAIM, advisory, `docs/reviews/2026-09-23-codex-routing-architecture.md:34-48`), eligibility-before-optimization
(`:67-69`) and a task-class route table (`:71-77`); it also states that missing model/task
denominators "prevent a defensible domain leaderboard today" (`:25`).

## 5. What history can and cannot support

Can support: that manual rotation exists and is exercised under pressure (limits, auth
blocks, context ceilings); that risk gates already classify work by path and review scale;
that the fleet has recorded capability asymmetries (`rg`, harnesses); that no router code
exists to be extended, only dispatch habits to be codified.
Cannot support: provider-task fit, per-provider latency/cost, per-provider defect rates,
complexity labels, or the effect of any rotation policy. There is no task denominator and no
resolved-model identity per run.

## 6. Interaction with binding rules

Any router is a tool, not a decider: advisory policy (PROTO-DEC-0034) means it cannot be a
gate input or Evidence. Assignment remains bound by independence (PROTO-DEC-0041 items 1-2),
by receipts/capability profiles for certifying reviews (AGENTS.md section 2), and by the
"no brand trust" rule that ranks capability over title. A router that selects a certifier
would also need to enforce the two-parallel-certifier requirement on high risk - a
deterministic eligibility filter, not a model choice.

## 7. Interaction with the other 12 questions

Q02 supplies the competence units; Q03 the tiers; Q04 the effort axis; Q05 the attempt
budget that a provider switch must not reset; Q08 the cost ceiling; Q09 predicts leave;
Q10 sets time-over-money; Q11 deputies inherit packets; Q12 supplies the telemetry that
makes any of it reviewable; Q13 is the capacity envelope around it.

## 8. Options (at most three)

A. Do less now: keep manual dispatch; require the dispatcher to record, in the journal and
   the Evidence, the selected route and the resolved model id (and rejected alternatives).
   Cost: discipline only; time: immediate; risk: still no automation, but no new failure mode.
B. Thin deterministic dispatcher: a local wrapper that checks eligibility (independence,
   capabilities, declared quota reserve) and refuses or forwards; the model choice stays
   manual among eligible routes. Cost: one bounded code slice + tests; time: days; risk:
   another component to certify and to keep in sync with CLI-AGENTS.
C. Adaptive auto-router with a competence matrix: blocked by missing data (no resolved
   model ids, no task/outcome join, no cost); would encode guesses as policy. Not recommended
   before Q02/Q12 deliver data.

## 9. Recommendation and the forks only the owner can decide

Recommendation: A now; B only after A records at least one phase of route/model data; C is
premature. Forks: (1) whether any dispatcher code is in scope while PROTO-DEC-0039's freeze
is in force, or whether the owner lifts it for a bounded slice; (2) whether alias pinning
(recording the resolved id) is mandatory for accepted runs; (3) whether product repositories
get CLI-AGENTS/rules before or after the protocol core is automated.

## 10. Missing data

Resolved model id and provider per session; task/risk labels; cost, tokens and quota
observations; failure taxonomy and refusal reasons; per-provider latency; and any matched
comparison of routes on identical tasks.

## 11. Challenge

Challenger: pending. The challenger must first save its own blind-spot list here, then read
this document and attack it; disagreement stays visible and is never averaged away.
