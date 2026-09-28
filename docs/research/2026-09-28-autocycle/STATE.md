# AUTOCYCLE-1 STATE (relay capsule; single writer: the operator)

**CHECKPOINT 2026-09-28T17:35Z - 2A IS MERGED; the owner restarts the Kilo window; a new session
continues from this file.** Read it first, then `.ai/DECISIONS.md` blocks 0091-0104, then
`docs/research/2026-09-27-roadmap-queue/SUPERVISOR-PREREG.md` (the packet-2 table below cites it).

## What just happened

- The registry fixture defect (tests 6/7 pinned `PROTO-DEC-0099`) was fixed on `v2.0.0` in a
  separate commit set BEFORE the 2A merge: fix `0e0d6a7` (branch `fix-registry-fixture`), DeepSeek
  review PASS (`c69d019`), merged as `b04e0d9`.
- The wave-2A candidate was merged: `merge --no-ff kernel-batch-1` -> `0030fd6` (local), full
  suite GREEN (423/423, 186.4 s, no WMI timeouts, Available 11.18/9.0/10.39 GB).
- `protocol-handoff verify` for the operator matches; pushed `v2.0.0` = **`bb19cc3`** and the branch
  `fix-registry-fixture`.
- S6 (after the merge): `docs/ops/RUNS.jsonl` has 2 valid rows - one with the explicit marker
  `tokens.source="none"`, one with full usage (127656 in / 37257 out, 0.093511 USD).

## Packet-2 table (S1-S9, value + source; the owner chooses the Kernel v1 variant)

| # | Value | Source |
|---|---|---|
| S1 | 2A round 1: Sol FAIL (2 reproduced blockers); round 2: Sol + MiMo both RECOMMENDATION; candidate merged. | `docs/reviews/2026-09-28-sol-*certification*.md`, `...-mimo-...`; `bb19cc3` |
| S2 | **A'** - F-C01 (the host review-path contract; probes return RECOMMENDATION/0 instead of FAIL/1) lies on the pilot path. | owner correction 2026-09-28; SUPERVISOR-PREREG S2 rows |
| S3 | ~3% not built (10 of 334 rows; all kernel-internal) -> keep. | the three corrected `drafts/DIG-*.md` |
| S4 | First pass 72.6% rejected -> postponement applied -> corrections -> 100% of corrected rows re-proven; no variant switch. | `docs/reviews/2026-09-28-gpt-5.6-luna-dig-verification.md`, `...-recheck.md`, `...-recheck2.md` |
| S5 | Run 1: 284.7 s (421/423; pre-existing fixture failures), Available 5.93/3.63/8.5 GB, no WMI timeouts. Run 2 (post-fix): **186.4 s, 423/423 PASS**, Available 11.18/9.0/10.39 GB, WMI 0. | `.ai/runtime/s5-*.log`, `s5b-*.log`, `gate-s5*.log` |
| S6 | After the merge: 2 dispatch rows, each with usage or the explicit `tokens.source="none"` marker. | `docs/ops/RUNS.jsonl` @ `bb19cc3` |
| S7 | No quota stop; Sol used both reserved calls (r1 FAIL, r2 RECOMMENDATION); Luna ran the DIG checks. | journals; PROTO-DEC-0095 item 4 |
| S8 | 0 supervisor corrections in the lock/archive/commit categories (4 process/accounting corrections + 2 self-caught are listed in the operator journal). The owner counts. | operator journal 2026-09-28; PROTO-DEC-0099 item 3 |
| S9 | Local Windows only -> keep (no cloud slice; the B-lite branch is dropped). | owner answer 2026-09-28T15:42Z; SUPERVISOR-PREREG |

## Next actions (in order)

1. The owner restarts the Kilo window and sets effort High in Claude Code; the new session starts
   the **advisor channel** (`advisor/CHANNEL.md`): create `advisor/001-REQUEST.md` with the
   packet-2 table above, commit+push it, call the advisor per CHANNEL.md section 3, then follow
   section 4 (reply file, MEASUREMENTS row `role=advisor`, ADV-NNN records).
2. **A-1** (after the 2A merge, per plan): executor Claude Opus 5.5 (max); certifiers Sol + MiMo
   (Sol Medium); the merge by the owner's word; independence: the advisor certifies nothing.
3. Open backlog/residuals: **M-2A-res** (F-2A-01/F-2A-05 LOW residuals, next wave), **N-3**
   (document `PROTOCOL_JOURNAL_IMPORT_ROOT` in the next forward artifact), the Kilo-client growth
   line, and the "tests must not hardcode live-corpus ids" line (all in `docs/ops/BACKLOG.md`).
4. Other queued work already completed tonight: F-18 catalog collectors (branch `bench-catalog`,
   `c53e412`; MiMo verifier pending), DIG corrections + Luna rechecks (all green), OPS-1 phase A
   (branch `ops-1`, `49164b7`; phases B/C gated), wave-3 drafts (`e8181ec`; packet 2).
5. Night budget: NIGHT_END was 2026-09-28 23:00 MSK (20:00Z); the delegated merge is done within it.

## Key SHAs and branches

- `v2.0.0` = **`bb19cc3`** (2A merged: `0030fd6` + registry fix `b04e0d9` + records).
- Frozen 2A = `9bf15ae` (code `5bc9940` + fixes `6364322` W5, `b26b177` S-7); candidate
  `kernel-batch-1` = `79670de` (now merged).
- Certificates: round 1 `d23d826` (Sol FAIL), `2440fcc` (MiMo RECOMMENDATION); round 2 `ca55d02`
  (Sol), `0d87aff` (MiMo); fix review `c31c3f5`; registry-fix review `c69d019`.
- Other branches: `cert-2a-sol-r2`, `cert-2a-mimo-r2`, `fix-registry-fixture`, `bench-catalog`,
  `roadmap-wave3`, `ops-1`.
- DIG: first-pass REJECT 72.6% -> option (b) corrections -> Luna rechecks 117/118 then 15/15 PASS.

## Standing rules (short)

- Owner decisions: `.ai/DECISIONS.md` 0091-0104. Advisor: PROTO-DEC-0102 + `advisor/CHANNEL.md`
  (ADV-NNN records, never PROTO-DEC; independence). Delegated merge: the six conditions of
  AUTOCYCLE section 6. Budget: paid DeepSeek API (operator + reviewer share; < $3 no reviewer +
  light steps only; < $1 STOP). vibe policy: PROTO-DEC-0094 (check logs for "falling back").
- Operator: DeepSeek Flash via Kilo (paid API). No secrets anywhere. The MCP cluster and `bot.js`
  belong to the owner's other windows (leave alone).
