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
1. The OwnerIdeas revision (`docs/research/2026-09-26-ownerideas-revision/`) has its stage-12
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
