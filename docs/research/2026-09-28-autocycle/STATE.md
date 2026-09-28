# AUTOCYCLE-1 STATE (relay capsule; single writer: the operator)

**CHECKPOINT 2026-09-28T16:25Z - a new session can continue from this file alone.** Read it first,
then the referenced PROTO-DEC blocks (0091-0103 in `.ai/DECISIONS.md`), then
`docs/research/2026-09-27-roadmap-queue/SUPERVISOR-PREREG.md` for the packet-2 signals.

## Continuation plan (short)

1. Candidate: `kernel-batch-1` @ `79670de` (frozen `9bf15ae`; certified **RECOMMENDATION x2** by
   Sol [receipt `codex-2386381c48088cee`] and MiMo [`mimo-695fcfb3b47f3125`]). Candidate vs frozen
   diff: documentation only (verified; PROTO-DEC-0100/0101).
2. When the gate is green (Available >= 8 GB; nonpaged < 1.5 GB; committed < 80%; pools normal; no
   parallel protocol heavy session; processes >5% CPU allowed only for non-protocol per
   PROTO-DEC-0103): in `D:\Colabs` run `git merge --no-ff kernel-batch-1` into `v2.0.0` **LOCALLY,
   NO push**; run `validate-protocol.ps1` + `test-protocol.ps1` on the merged tree (this = **S5 +
   condition (c)**; record wall time, WMI timeouts, the active non-protocol processes with % CPU,
   and Available before/after); `protocol-handoff verify` must match; no conflicts. Green -> push
   `v2.0.0`. Red -> `git merge --abort` (or `git reset --hard origin/v2.0.0`, local only) and STOP
   to the owner.
3. Deadline: a window must open by **19:30Z**; otherwise the merge goes to OWNER-QUEUE
   (PROTO-DEC-0101 item 3).
4. After the push: **S6** = read `docs/ops/RUNS.jsonl` AFTER the merge (usage or a not-exposed
   marker on every dispatch row); then the **packet-2 table (S1-S9, value + source)** goes to the
   owner AND becomes **advisor request 001** (`advisor/CHANNEL.md`); the owner sets effort High in
   Claude Code before the first advisor call (PROTO-DEC-0102).
5. Round-3 rule: any certifier not PASS/RECOMMENDATION -> STOP (round 3 means variant B).

## Environment gate (PROTO-DEC-0094 + 0101 + 0103)

- Thresholds: Available >= 8 GB (the gate counter = `Win32_OperatingSystem.FreePhysicalMemory`,
  available incl. standby); nonpaged < 1.5 GB; committed < 80%; no process >5% CPU (relaxed for
  THIS single run to non-protocol only, PROTO-DEC-0103); pools normal.
- CURRENT BLOCKER (16:23Z): `kilo` PID 2940 (`kilo.exe serve` of the VS Code extension
  `kilocode.kilo-code-7.8.1`, hosting THIS operator session) grew 3.98 GB (16:02Z) -> 6.17 (16:20Z)
  -> 8.24 GB WS (16:23Z); Available fell to ~7.0 GB and holds below 8. Owner informed; 5-min
  samples taken; a new session likely starts with a fresh serve process.
- Cadence: a gate line every 30 min in the operator journal; one line to the owner if no window
  opens within 60 min (counted from ~16:02Z).

## Open items

- S6 (after the merge); the packet-2 table to the owner; advisor 001 (after S6; effort High set by
  the owner); **M-2A-res** (F-2A-01/05 residuals in `docs/ops/BACKLOG.md`); **N-3** (document
  `PROTOCOL_JOURNAL_IMPORT_ROOT` in the next forward artifact; OWNER-QUEUE).
- A-1 next after 2A: executor Claude Opus 5.5 (max); certifiers Sol + MiMo; the merge by the
  owner's word.
- Packet-2 signals (observed table in SUPERVISOR-PREREG.md): S1 round 2 both RECOMMENDATION;
  S2 = A' (F-C01 on the pilot path); S3 ~3% keep; S4 72.6% -> corrections -> 100% re-proven;
  S5 pending (this run); S6 pending; S7 no quota stop (Sol has used both reserved calls: r1 FAIL,
  r2 RECOMMENDATION); S8 = 0 by category (owner counts); S9 = local Windows only, keep.
- DeepSeek spend: ~ $0.0218 tracked (lower bound; operator calls unmeasured). Thresholds: < $3 no
  DeepSeek reviewer + light steps only (OWNER-QUEUE line); < $1 STOP + one line.
- Advisor channel: PROTO-DEC-0102; procedure `advisor/CHANNEL.md`; independence: the advisor
  certifies nothing it directed (2A, A-1, Kernel v1).

## Key SHAs

- v2.0.0: `7303843` (latest pushed; the merge is NOT done).
- `kernel-batch-1`: `79670de` (candidate; frozen code `9bf15ae`).
- Frozen 2A: `9bf15ae` = code `5bc9940` + fixes `6364322` (W5), `b26b177` (S-7) + docs; the DeepSeek
  fix review is `c31c3f5`.
- Round-1 certs: `d23d826` (Sol), `2440fcc` (MiMo) - in-tree since `4837fff`/`9bf15ae`.
- Round-2 certs: `ca55d02` (Sol), `0d87aff` (MiMo) - in kb1 since `d2b3c56`/`79670de`.
- Other pushed branches: `cert-2a-sol-r2`, `cert-2a-mimo-r2`, `bench-catalog` (`c53e412`, F-18
  catalog collectors), `roadmap-wave3` (DIG: Mistral `f3c5314` + `34e9b9f`, Gemini `e13cb36`,
  DeepSeek `bc590f4`, cover re-run; Luna rechecks `6c4a536` (117/118) and `8f12e1c` (15/15 PASS)),
  `ops-1` (`49164b7`, OPS-1 phase A).
- DIG summary: first-pass REJECT 72.6% -> option (b) corrections on all three ranges -> Luna
  rechecks -> the corrected packet is fully re-proven.

## Blocks 0091-0103 (short map; read the blocks themselves)

- 0091: round-6 decision + standing delegation + consensus rule. 0092: NIGHT_END 23:00 MSK.
- 0093: DIG verifier Luna; agy successor via Gemini API. 0094: gate thresholds; vibe default.
- 0095: single agy attempt after "VPN ok"; Sol economy (two calls, Medium).
- 0096: 2A round-2 fix plan; DIG option (b). 0097: DeepSeek DIG range -> vibe.
- 0098: paid DeepSeek accounting; native reviewer route.
- 0099: packet-2 gate (S1/S5/S6); S2 = A'; findings-based q; probes excluded from E.
- 0100: freeze verified; q with misses (Sol 1.0 / MiMo 0.167 -> 0.5 after the unverified rule);
  full-log capture; S5 rules.
- 0101: freeze accepted; unverified q claims leave the precision denominator; order S5 -> merge ->
  S6; S9 branches. 0102: operator <-> advisor channel. 0103: relaxed CPU for this single run;
  MCP read-only check (0).

## Current session facts

- Operator: DeepSeek Flash via Kilo (paid DeepSeek API); node = kilo-a5143d29cc7dd8ff (a new
  session gets a new owner name; its journal is created by `protocol-session.cjs start --agent
  kilo`).
- No heavy step is running; no protocol sessions are alive; the MCP cluster and `bot.js` belong to
  the owner's other windows and must not be touched (PROTO-DEC-0103).
