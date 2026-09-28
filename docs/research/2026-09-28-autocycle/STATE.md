# AUTOCYCLE-1 STATE (relay capsule; single writer: the operator)

Read this first in every session. At most 150 lines. Seeded 2026-09-28 by Claude (cloud session
`claude-ad7cc4169e888ea8`) from the repository at `18a7e4b`. The operator overwrites the seed values
as facts change and pushes after every step.

## Meta

- Cycle: C00 (setup; Part A pending). Claude finalizer calls tonight: 0. Budget spent: $0.00 of $5.00.
- Mode: pending reboot (degraded mode if no reboot after the snapshot).
- Last update: <ISO> by <operator session> at <sha>.

## Goals tonight (from AUTOCYCLE-PROMPT.md section 12)

1. Save state, delegation block, memory snapshot, reboot (Part A).
2. 2A: recovery 3 prompt-only, freeze, MiMo + Sol, delegated merge.
3. DIG verification (Sol primary) and vibe advisory.
4. perf-wave-1 second (docs) merge.
5. Wave-3 drafts and the filled SUPERVISOR-PREREG table for packet 2.
6. Probes and the benchmark catalog; measurements for every call.
7. A-1 after 2A (merge is the owner's). PROFILE-2 after 2A in a quiet window.

## Branch heads (origin) - operator verifies with git ls-remote

| Branch | Expected | Note |
|---|---|---|
| v2.0.0 | 18a7e4b or newer | round-6 inputs committed |
| kernel-batch-1 | origin 5a6cad1; local 5bc9940 UNPUSHED | 2A review RECOMMENDATION is in 5bc9940 |
| perf-wave-1 | origin 4c25741; local f8e20b2 UNPUSHED | Addendum is in f8e20b2 |
| roadmap-wave3 | 6ff869d | DIG drafts, COVER-DUP, GLM-PROBE |
| core-landing-ia | 0c03775 | frozen candidate (PROTO-DEC-0087); do not touch |
| autocycle-claude | (created by the finalizer) | Claude's mailbox answers |

## Standing assignments (unchanged tonight)

- 2A certifiers: MiMo-V2.6-Pro + GPT-5.6 Sol (PROTO-DEC-0090).
- A-1: executor Claude Opus 5.5 (effort max); certifiers GPT-5.6 Sol + MiMo-V2.6-Pro.
- DIG verifier: GPT-5.6 Sol; fallback MiMo-V2.6-Pro after its probe.
- vibe: GLM-5.3 route FAIL (silent fallback to mistral-medium-3.5); vibe rows are Mistral unless a
  probe PASSes.
- Operator: DeepSeek Flash (kilo). Finalizer: Claude Opus 5.5 effort High.
- Not in the consensus pool tonight: Sol, MiMo, Claude. Unavailable: copilot, kimi.

## Pipelines (next step)

- 2A kernel-batch-1: push 5bc9940 -> recovery 3 (prompt only) -> freeze -> MiMo + Sol -> merge.
- perf-wave-1: push f8e20b2 -> Addendum script-confirmation line present? -> range check -> docs merge.
- Wave 3 (F-17): COVER-DUP line -> Sol verification -> vibe advisory -> drafts -> packet 2 table.
- A-1: waits for the 2A merge.
- PROFILE-2 / V3: wait for the 2A merge and a quiet window; V3 split line is the owner's.
- core-landing-ia: frozen until stages 2-3 and the I-a certification.
- 2B Node validator: after 2A, only if the final-plan-2 section AC conditions are verified.

## Accepted tonight (by delegation)

(none yet)

## Points register (open points, with voting history)

(none yet)

## Hypotheses

| Id | Text | Source | How to verify | Status |
|---|---|---|---|---|
| H-1 | agy session deaths ("waiting for task") come from memory pressure | owner memory report 2026-09-27 | deaths stop after the reboot under the memory gate | уточнить |
| H-2 | kernel pools of 5.9 GB are a driver leak | owner memory report | pools regrow after the reboot; poolmon top tags | уточнить |
| H-3 | vibe silently replaces an unresolved active_model | GLM-PROBE.md @ 6ff869d | log line "falling back" | подтверждено (6ff869d) |

## Owner queue pointer

See `OWNER-QUEUE.md`.

## Measurements summary (top 10 by E)

(no rows yet)

## Memory

- Snapshot before reboot: (pending). Baseline after reboot: (pending).
