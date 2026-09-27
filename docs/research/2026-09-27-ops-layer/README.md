# OPS-1: operations layer (queued program)

Status: QUEUED 2026-09-27. Not launched. Nothing here is a decision.

Owner request: 2026-09-27, in the cloud advisory session `claude-ad7cc4169e888ea8`. The owner
confirmed three choices in that conversation:
- a Telegram bot plus an external heartbeat as the owner channel;
- Opus 5.5 as the consultant;
- DeepSeek Flash as the operator.
All three still need decision blocks: see D1-D5 in `PROMPT.md`. Until those exist, they are
proposals.

## Trigger

Start when both conditions hold:
1. The OwnerIdeas revision (`docs/research/archive/2026-09-26-ownerideas-revision/`, CLOSED 2026-09-27, receipt CR-F01-1) has its stage-12
   verdict CLOSED.
2. The owner says go.

Phase A of `PROMPT.md` writes design notes and decision drafts only, with no code. It may start
before the trigger if the owner says so. Phases B and C never start before the trigger.

The stage-12 closure report names this program as the next item. `.ai/TASK.md` (section Next)
carries a one-line pointer to this file.

## Files

- `PROMPT.md`: the program prompt for the operator. It is binding for the program once launched.
- Written by the program itself:
  - `DESIGN.md`;
  - `DECISION-DRAFTS.md`;
  - the round folders;
  - a `USAGE.md` written by the dispatcher.

## Merge rules (to keep parallel work conflict-free)

- **Phase A: this folder only.** The decision drafts go into `DECISION-DRAFTS.md` here, not into
  `.ai/PLAN.md`. The session that holds the lock copies them to PLAN only at owner review.
- **Phases B and C: a separate branch** `ops-1`, cut from `v2.0.0` after the trigger (AGENTS.md
  section 10).
  - It is merged back with a merge commit: no rebase, no force-push.
  - It never carries files of another running program.
- **Kernel files** (`.ai/bin`, `tests/`, `docs/specs`, `.ai/docs/clients.json`) change only after
  the OwnerIdeas CANDIDATE has closed. A frozen candidate is never edited underneath its
  certifiers.
- **Shared documents** (`.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md`,
  `docs/decisions/REGISTRY.md`):
  - edited only under `protocol-lock.cjs`;
  - one line or one block per change;
  - never reformatted.
- **Dispatcher inputs** (launch files and copyIn files) are committed before launch. Uncommitted
  inputs caused the SCOPE_STOP of cost-routes round 1.
- **Parallel operators in one checkout.**
  - `git add` names paths explicitly: never `git add -A` or `.`.
  - A session never commits another session's files: its reports, journals or usage tables.
  - Where two operators run at once, each works in its own `git worktree`.
  - On 2026-09-27 the cost-routes operator offered to commit the round-3 certification reports of
    the other operator. That must go to their owner session instead.

## Transferred from the F-01 closure (CR-F01-1, 2026-09-27)

TRANSFER targets named by the stage-12 closure of F-01 (R-L0-22.60):

- **W5.** The dispatch test fixture re-homed from `docs/research/2026-09-26-ownerideas-revision/` (`prompts/DISPATCH.json` and
  `prompts/run/*`, 40 files) to `tests/fixtures/prompts/`. Pointed `tests/dispatch.test.cjs`
  at it, archived the leftover directory with archive INDEX row CR-W5-1.
- **W1.** Retire `docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs`
  (F-06 had TRANSFER(A-3); A-3 is now implemented as `.ai/bin/protocol-dispatch.cjs`).
- **W0.** The codex usage-parser exception (owner decision A, 2026-09-27).
- **W4.** MiMo model identity: runs record only the requested model; record the observed one.
- **W1/W7.** Cost-routes K-launch: `cr-collector-a` ended early with an unconfirmed cause (operator
  journal `kilo-9a9b18229cce57fd`).
- **Tooling finding.** The untracked `.ai/runtime/closure-receipts.cjs` overwrites
  `docs/research/CLOSURES.jsonl` (`writeFileSync`), against R-L0-22.67. Never run it again; any
  closure tool appends.
- **Owner questions carried from F-01** (`docs/research/archive/2026-09-26-ownerideas-revision/round6/FINAL-RESOLUTION-CLAUDE.md`
  section 9), all undecided:
  - here: OQ-1 (redaction beyond journals), OQ-3 (stall default 10 min against PROTO-DEC-0051
    item 4), OQ-4 (install scope `source` or `managed`), OQ-8 (run-record store), OQ-9 (switching
    programs to `protocol-dispatch.cjs`);
  - in F-03: OQ-2 (lives in P-L0-009 `## Open`), OQ-5, OQ-7;
  - with the owner: OQ-6 (certifier floor override), OQ-10 (DIG counter), OQ-11 (carried items).
- **Residual non-blocking findings** of `docs/research/archive/2026-09-26-ownerideas-revision/round9/FINAL-DEEPSEEK.md` section 8:
  R-1 (a PKG-2 audit prompt at 184 lines against the 150 cap needs an owner-approved expansion),
  R-3, R-4.
