# AUTOCYCLE-1 STATE (relay capsule; single writer: the operator)

Read this first in every session. At most 150 lines. Seeded 2026-09-28 by Claude (cloud session
`claude-ad7cc4169e888ea8`) from the repository at `18a7e4b`. The operator overwrites the seed values
as facts change and pushes after every step.

## Meta

- Cycle: C00 (Part A complete; post-reboot baseline recorded). Claude finalizer calls tonight: 0. Budget spent: $0.00 of $5.00.
- Mode: post-reboot (reboot confirmed: LastBootUpTime 2026-09-28T14:40:16+03:00, newer than the Part A
  snapshot 2026-09-28T00:58Z; NOT degraded).
- NIGHT_END extended by the owner 2026-09-28 to 23:00 MSK (PROTO-DEC-0092); delegation valid until then with the same boundaries; MAX_CYCLES 8 and budget $5.00 unchanged.
- Last update: 2026-09-28T12:17Z by kilo-a5143d29cc7dd8ff at a2db48c (this STATE commit follows it).

## Goals tonight (from AUTOCYCLE-PROMPT.md section 12)

1. Save state, delegation block, memory snapshot, reboot (Part A) - DONE; reboot confirmed 2026-09-28T14:40:16+03:00.
2. 2A: recovery 3 prompt-only, freeze, MiMo + Sol, delegated merge.
3. DIG verification (Sol primary) and vibe advisory.
4. perf-wave-1 second (docs) merge.
5. Wave-3 drafts and the filled SUPERVISOR-PREREG table for packet 2.
6. Probes DONE (results below); benchmark catalog pending; measurements recorded (9 rows).
7. A-1 after 2A (merge is the owner's). PROFILE-2 after 2A in a quiet window.

## Branch heads (origin) - operator verifies with git ls-remote

| Branch | Expected | Note |
|---|---|---|
| v2.0.0 | c9ad966 + STATE commit | PROTO-DEC-0091 is in c9ad966; round-5 record is 635ad4e |
| kernel-batch-1 | origin 5bc9940 = local 5bc9940 | pushed in Part A (was local-only, ahead 1) |
| perf-wave-1 | origin f8e20b2 = local f8e20b2 | pushed in Part A (was local-only, ahead 2) |
| roadmap-wave3 | 6ff869d | DIG drafts, COVER-DUP, GLM-PROBE |
| core-landing-ia | 0c03775 | frozen candidate (PROTO-DEC-0087); do not touch |
| autocycle-claude | (created by the finalizer) | Claude's mailbox answers |

## Standing assignments (unchanged tonight)

- 2A certifiers: MiMo-V2.6-Pro + GPT-5.6 Sol (PROTO-DEC-0090).
- A-1: executor Claude Opus 5.5 (effort max); certifiers GPT-5.6 Sol + MiMo-V2.6-Pro (PROTO-DEC-0091
  item 6i; the GLM route FAILED, so the MiMo reserve is active).
- DIG verifier: GPT-5.6 Sol; fallback MiMo-V2.6-Pro after its probe.
- vibe: GLM-5.3 route FAIL (silent fallback to mistral-medium-3.5); vibe rows are Mistral unless a
  probe PASSes.
- Operator: DeepSeek Flash (kilo). Finalizer: Claude Opus 5.5 effort High.
- Not in the consensus pool tonight: Sol, MiMo, Claude. Unavailable: copilot, kimi.

## 2A status (C01 item 6c)

- Recovery-3 launch file committed on `kernel-batch-1`: `LAUNCH-2A-RECOVERY3.md`, commit `670f520`
  (pushed). Candidate stays `5bc9940`.
- First dispatch 2026-09-28T12:02Z FAILED: agy 400 `User location is not supported` (retryable
  false). Owner restored agy at ~12:06Z; the session was relaunched 12:07Z (bgp pid 8724) and is
  running. Awaiting the unified adversarial audit prompt (deliverable
  `docs/reviews/2026-09-28-gemini-wave2a-adversarial-prompt.md`).
- After the prompt lands: freeze the candidate, then MiMo + Sol certification. The MiMo route
  question is in OWNER-QUEUE (OpenRouter blocked by credits; xiaomi route verified).
- Owner note 2026-09-28T12:16Z: first cycle after the reboot strictly sequential (section 10); the
  merged-tree suite ran in parallel with this agy session (recorded in the operator journal for
  H-1); no new heavy steps until recovery 3 ends.

## Pipelines (next step)

- 2A kernel-batch-1: pushed -> recovery 3 (prompt only) -> freeze -> MiMo + Sol -> delegated merge.
- perf-wave-1: second docs merge DONE - `a2db48c` on v2.0.0, pushed; range check + Addendum line
  `confirmed by report.cjs @ 22ff6a6` + perf1 `verify` matches; full suite on the merged tree green
  (420/420, validate 0 warnings, wall 192.9 s).
- Wave 3 (F-17): COVER-DUP line -> Sol verification -> vibe advisory -> drafts -> packet 2 table.
- A-1: waits for the 2A merge.
- PROFILE-2 / V3: wait for the 2A merge and a quiet window; V3 split line is the owner's.
- core-landing-ia: frozen until stages 2-3 and the I-a certification.
- 2B Node validator: after 2A, only if the final-plan-2 section AC conditions are verified.

## Part A record (2026-09-28)

- Step 1: local heads descend from origin; pushed kernel-batch-1 5bc9940 and perf-wave-1 f8e20b2;
  ls-remote matches (kb1 5bc9940, perf1 f8e20b2, w3 6ff869d, v2.0.0 cb60b49 at the time).
- Step 2: PROTO-DEC-0091 appended under lock (round-6 items 1-8 with the section-6 changes, standing
  delegation verbatim, consensus rule verbatim) + one REGISTRY row; commit c9ad966, pushed.
- Step 3 memory before: Nonpaged 2133.84 MB, Paged 6162.40 MB, Committed 52052.07 MB of 65229.49 MB,
  free 8.12 GB; TextInputHost PID 37004 killed (10198 MB private, CPU 263113 s); after 65 s:
  Nonpaged 2102.89 MB, Paged 6174.94 MB, Committed 41475.92 MB, free 9.49 GB.
- Kilo PID 42968 NOT killed: live `kilo.exe serve` tree hosting the operator session plus two live
  agy background runners (perf1, w3); logged in OWNER-QUEUE.
- Uncommitted not ours: w3 worktree untracked `docs/research/2026-09-27-roadmap-queue/drafts/.ai/`;
  logged in OWNER-QUEUE.
- GLM provenance reattribution to mistral-medium-3.5 written in the operator journal
  `.ai/worklog/kilo-a5143d29cc7dd8ff.md` (round-6 item 2).
- Reboot confirmed 2026-09-28T14:40:16+03:00 (LastBootUpTime newer than the Part A snapshot); the
  post-reboot memory baseline is in Memory below. Cycle work has not resumed (NIGHT_END passed).

## Probes (2026-09-28 after reboot; 9 rows in MEASUREMENTS.jsonl)

- MiMo via OpenRouter BLOCKED by credits: HTTP 402, the account affords ~27065 tokens; kilo requests
  32000, mimo requests 128000 (artifacts `.ai/runtime/probe-mimo-openrouter.txt`,
  `.ai/runtime/probe-mimo-OR-mimo.txt`). Owner item.
- MiMo via the xiaomi provider (mimo CLI): READY, PONG/PONG2; identity from the log
  `providerID=xiaomi modelID=mimo-v2.6-pro`; first call $0.022708305 for 52169 in / 4 out
  (~$0.435/M in, derived from the client cost field).
- codex `gpt-6-sol` and `gpt-6-luna`: READY (PONG); identity from the rollout turn_context.model;
  subscription, no marginal cost; usage 22465/6 and 21947/6.
- claude: id `claude-sonnet-5-5` is unrecognized; the alias `sonnet` resolves to `claude-sonnet-5`
  (canonicalModel in the JSON result). Owner item.
- GLM via vibe: still FAIL - fresh 2026-09-28T11:59:58Z warning "falling back to default model
  'mistral-medium-3.5'"; the config models array holds only mistral-medium-3.5.
- Pool now: DeepSeek Flash (kilo), Gemini 3.8 (agy), codex Sol/Luna/Terra, vibe = Mistral,
  MiMo via the xiaomi route (OpenRouter blocked).

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

See `OWNER-QUEUE.md` (new 2026-09-28: round-6 leftover file; Kilo PID 42968; w3 untracked dir;
OpenRouter credits for MiMo; Sonnet 5.5 id unconfirmed).

## Measurements summary (top 10 by E)

9 probe rows recorded 2026-09-28; the top-10 by E is computed at cycle close.

## Memory

- Snapshot before reboot (2026-09-28T00:58Z): Nonpaged 2133.84 MB, Paged 6162.40 MB,
  Committed 52052.07 MB of 65229.49 MB, free 8.12 GB.
- After TextInputHost stop (2026-09-28T01:00Z): Nonpaged 2102.89 MB, Paged 6174.94 MB,
  Committed 41475.92 MB, free 9.49 GB.
- Baseline after reboot (2026-09-28T11:47Z, uptime 7.6 min; reboot 2026-09-28T14:40:16+03:00):
  Nonpaged 690.63 MB, Paged 499.77 MB, Committed 17577.29 MB of 65229.49 MB (27%), free 17.83 GB.
  TextInputHost fresh (PID 15084, 62.9 MB, 0.9 s CPU); a 5 s CPU sample shows no process above 1%
  of total capacity (max Code 0.93%; 32 logical processors).
  Pools returned to ~0.7/0.5 GB (was 5.9 GB paged before reboot) - consistent with H-2.
