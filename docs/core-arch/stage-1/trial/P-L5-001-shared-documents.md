---
id: P-L5-001
version: 0.2
title: Shared documents have one writer at a time, through the cooperative lock
layer: L5
type: procedure
status: draft
roles: [all]
stages: [any]
triggers: [edit-shared-document]
inputs: [.ai/TASK.md, .ai/PLAN.md, .ai/DECISIONS.md, .ai/ARCHIVE.md, docs/decisions/REGISTRY.md]
outputs: [journal]
tools: [TOOL-protocol-lock]
back_edges: []
enforcement: S~
enforced_by: [.ai/bin/protocol-lock.cjs]
script_candidate: no:4
evidence_class: [A]
evidence: [AGENTS.md:269, DEC-0020, PROTO-DEC-0028, PROTO-DEC-0029]
---

# P-L5-001 Shared documents: one writer

Trial record of CORE-ARCH stage 1, task S1-T08, written through P-L0-001 (class A). Draft 0.2;
lands in stage 5. Not binding until approved. `script_candidate: no:4` because whether a holder
is really gone is judgement ("age is a reason to investigate, never a proof").

## Purpose

Five documents (task, plan, decisions, archive, registry) are shared state that two sessions
could overwrite. One cooperative lock makes their edits serial, the way graphmemory serialises
mutations through one queue while reads stay free.

## Rules

- R-L5-001.1. Take the lock before editing a shared document and release it when done.
- R-L5-001.2. A lock held by another owner is never taken over; its holder is confirmed gone first.
- R-L5-001.3. Per file: DECISIONS and REGISTRY are append-only (see P-L0-005); ARCHIVE is
  append-only; TASK has sections replaced; PLAN is replaced by the session that owns the task.
- R-L5-001.4. Reading a shared document never needs the lock.

## Steps

1. **Acquire** (any role). `node .ai/bin/protocol-lock.cjs acquire --owner <owner>`. If it names an
   abandoned gate, run `clear-operation` (refused while its maker lives).
2. **If held** (any role). Run `status`; read `stale` and `heldForMinutes`; confirm the holder's
   session is over before `release --owner <reported owner>`; a dead holder process allows
   `clear-lock` or `acquire --force`. A live holder: wait or stop (P-L0-002).
3. **Edit** (lock holder). Only the documents the task needs, by the per-file rule.
4. **Release** (lock holder). `release --owner <owner>` before the session ends.

## Stop conditions

- The holder cannot be confirmed gone.
- The edit would rewrite an append-only file.

## Back edges

None.

## Evidence

- A - the first pilot: two sessions worked in parallel, "the journals were partitioned and the
  lock held" (DEC-0020 Context). Liveness binding was hardened by PROTO-DEC-0028 and 0029.
- A - this session took and released the lock twice (PROTO-DEC-0054 and 0055, with REGISTRY and
  TASK) with no collision (journal `claude-eb97ac9d13050014`).

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| A participant edits without the lock | low | high | cooperative rule; validator and review catch conflicting edits after the fact | none | the lock is not an OS barrier |
| A live holder's lock is released | low | high | R-L5-001.2, step 2 | one status call | a slow holder looks dead |

## Change log

- 0.1 — 2026-09-24 — claude-eb97ac9d13050014 — trial record through P-L0-001 (S1-T08) — reviewer DeepSeek S1-T11: held.
- 0.2 — 2026-09-24 — claude-eb97ac9d13050014 — rule ids re-anchored to the record (schema 0.5, CA-24 class); no meaning changed — review pending.
