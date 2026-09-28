# AUTOCYCLE-1 STATE (relay capsule; single writer: the operator)

**CHECKPOINT 2026-09-28T18:20Z - OWNER ANSWERED Q-A..Q-D (PROTO-DEC-0107): remaining F-C01 work =
H1 only, part of Kernel v1; A-1 RUNNING; H1 certifiers named (Luna + MiMo); NIGHT_END not extended;
the Kernel v1 freeze after both merges.** Read it first, then `.ai/DECISIONS.md` blocks 0091-0106, then
`docs/research/2026-09-27-roadmap-queue/SUPERVISOR-PREREG.md`.

## Advisor channel (PROTO-DEC-0102; ADV-001 recorded as selection=advisor)

- advisor_session=`4fa0a406-0c18-4641-a85f-265e69fa9fce`; first call 2026-09-28T17:57Z (Opus 5.5,
  `--effort high` per the CLI option and the owner update `fe1c11d`); full JSON
  `.ai/runtime/advisor-001.json`; MEASUREMENTS role=advisor (shadow $2.5775, marginal 0); reply
  `advisor/001-REPLY.md` @ `f6b9fe8`.
- ADV-001 decisions: (1) A-1 first, now, as the only heavy session; (2) a parallel light F-C01 probe
  (done, results below); (3) F-C01 execution only after the owner answers Q-A/Q-B; its branch is cut
  from the current v2.0.0; on a diff overlap with A-1 it waits and is cherry-picked onto the merged
  tree (no rebase of a pushed branch); (4) heavy steps strictly serial (A-1 suite, then F-C01 suite,
  then merged-tree runs); the vibe executor runs only targeted tests, the operator runs the full
  suite in a quiet window; (5) Claude limits: A-1 on Opus max, on exhaustion High with a record
  (PROTO-DEC-0090 item 10); advisor calls only at milestones; (6) Sol does not certify F-C01 (its
  extra call belongs to A-1); (7) corrections: the stale F-C01 line in `.ai/TASK.md`, the STATE Key
  SHAs.
- Advisor finding: the 2026-09-23 F-C01 form is CLOSED (PROTO-DEC-0046 item 3, 0048 item 2;
  `tests/rulebook.test.cjs:270,293`); what is really open is the host path - H1 (the installed
  manifest has no `source`, so `protocol-verdict` check 1 exits 2 in every host project) and H2 (no
  host consumer-path declaration). Both were inferred from code; H1 is now reproduced.
- Next advisor call (002): sent now with the probe output and the owner's answers (PROTO-DEC-0107);
  later calls at the A-1 freeze and the A-1 verdicts.

## Kernel v1 (PROTO-DEC-0105, owner decision)

- Kernel v1 = the current kernel + the merged 2A (`bb19cc3`) + the F-C01 fix + A-1 (security
  semantics). Pilots start after the Kernel v1 freeze; 2B, CORE-ARCH stage 3 and OPS-1 phases B/C
  run after v1, in parallel with the pilots.
- Order (ADV-001): A-1 first; F-C01 waits for the owner's Q-A (target) and Q-B (certifiers).
- A-1: executor Claude Opus (max), launched 2026-09-28T18:06Z as `bgp_0e93210cb0017xfa8CSWlkTlsi`
  (pid 9664), worktree `.ai/runtime/a1`, branch `a1-installed-advisory` @ `74b46ff`, launch file
  `docs/research/2026-09-28-autocycle/LAUNCH-A1.md`; certifiers Sol + MiMo (Sol Medium, one call
  beyond PROTO-DEC-0095; repeat only by the owner's word); the A-1 merge is the owner's; a DeepSeek
  review before the freeze only if the owner approves Q-D.
- F-C01 = H1 fix (owner, PROTO-DEC-0107): for `role=installed` the protected set = `managed` +
  `.ai/`, `.claude/`, `.codex/`; `source` is required only for `role=source`; H2 -> 2B. Executor
  vibe (falling-back check), failing test first, DeepSeek review; certifiers **GPT-5.6 Luna (codex,
  xhigh) + MiMo-V2.6-Pro (xiaomi)** (reserve Gemini 3.8 Flash only instead of MiMo; Terra only
  instead of Luna). Probe (ADV-001-2): (a) on HEAD both neutral requirements return **FAIL/1**;
  (b) in a fresh installed fixture the installed tool exits **2** (BLOCKED `source must be a
  non-empty array`) and the installed manifest has `hasSource=false` (H1 confirmed). Raw outputs:
  operator journal 2026-09-28.

## Community / CoLabus split (PROTO-DEC-0106, record + plan; execution at the v1 freeze)

- Kernel v1 is the LAST public version, under MIT, as the Community Edition; everything after the
  freeze lives only in the closed **CoLabus** repository (proprietary; the paid terms later with the
  lawyer). The name is approved; no trademark check needed.
- Until the split: commits/pushes go to the public linol-hamelton/colabs; the public history is NEVER
  rewritten (no force/rebase/filter-repo/branch deletion); the repo is never deleted.
- Freeze order (each step a separate line to the owner; the owner does the outside-repo steps):
  (a) tag the last public version on `v2.0.0` - proposal `kernel-v1.0.0`, the owner approves;
  (b) owner: Zenodo-GitHub DOI integration BEFORE the release, release by tag, Software Heritage;
  (c) owner: closed CoLabus repo + agent access; (d) operator: push the full history + the
  owner-approved live branches, ls-remote check; (e) operator: CoLabus LICENSE "Copyright (c) 2026
  Ruslan Fomenko. All rights reserved.", role stays `source`; (f) operator: ONE public commit
  removing everything outside the public composition + the Community README; check: install into an
  empty temp folder + validator PASS, else no push.
- Public composition: only what an EMPTY project gets at protocol install (the manifest "managed" +
  "integration" lists and what the installer creates) + LICENSE, setup-ai-protocol.ps1 + its
  templates, README.md, QUICKSTART.md. The new session builds the two tables mechanically (install
  into an empty temp folder; compare with `git ls-files`) and sends them to the owner; nothing is
  deleted before the owner's word; a "leaves" file needed by the installer/validator is marked
  separately.
- After CoLabus exists, new ideas and plans are written only there.

## What just happened

- ADV-001 exchange: request `118f932`, reply + advisor journal `f6b9fe8`.
- Owner answered Q-A..Q-D; **PROTO-DEC-0107** appended under the lock + REGISTRY row (transcribed by
  kilo-2fec8d740dc73400); OWNER-QUEUE Q-A..Q-D resolved.
- Under the lock: the `.ai/TASK.md` F-C01 line corrected (ADV-001-7); OWNER-QUEUE +Q-A..Q-D.
- `LAUNCH-A1.md` `74b46ff`; A-1 worktree + branch created from it; executor session started.
- F-C01 probe, light, no tree changes (details in the Kernel v1 section above).
- Gate before A-1: FreePhysicalMemory 9.47 -> 9.89 GB; Committed 37.24/68.40 GB (54.4%); nonpaged
  1.22 GB; TextInputHost (208% of 30-core total) stopped per the standing memory steps; no process
  above ~5% after that (msmpeng 4.5%, transient).
- Earlier today: 2A merged `bb19cc3`, registry fix `b04e0d9`, S6 green (2 valid RUNS rows: one
  `tokens.source="none"`, one full usage 127656/37257, 0.093511 USD); pushed `v2.0.0` to `74b46ff`.
- 18:25Z section-10 gate FAIL before advisor 002: Available 7.7 -> 7.2 GB (< 8; A-1 holds ~2 GB).
  The call is deferred until the gate recovers; advisor 002 request is pushed (`1688372`).

## Packet-2 table (S1-S9, value + source; the owner chose the Kernel v1 variant: A')

| # | Value | Source |
|---|---|---|
| S1 | 2A round 1: Sol FAIL (2 reproduced blockers); round 2: Sol + MiMo both RECOMMENDATION; candidate merged. | `docs/reviews/2026-09-28-sol-*certification*.md`, `...-mimo-...`; `bb19cc3` |
| S2 | **A'** - F-C01 (the host review-path contract; probes return RECOMMENDATION/0 instead of FAIL/1) lies on the pilot path. | owner correction 2026-09-28; SUPERVISOR-PREREG S2 rows; corrected by ADV-001: the original form is closed, the host gap H1 is reproduced |
| S3 | ~3% not built (10 of 334 rows; all kernel-internal) -> keep. | the three corrected `drafts/DIG-*.md` |
| S4 | First pass 72.6% rejected -> postponement applied -> corrections -> 100% of corrected rows re-proven; no variant switch. | `docs/reviews/2026-09-28-gpt-5.6-luna-dig-verification.md`, `...-recheck.md`, `...-recheck2.md` |
| S5 | Run 1: 284.7 s (421/423; pre-existing fixture failures), Available 5.93/3.63/8.5 GB, no WMI timeouts. Run 2 (post-fix): **186.4 s, 423/423 PASS**, Available 11.18/9.0/10.39 GB, WMI 0. | `.ai/runtime/s5-*.log`, `s5b-*.log`, `gate-s5*.log` |
| S6 | After the merge: 2 dispatch rows, each with usage or the explicit `tokens.source="none"` marker. | `docs/ops/RUNS.jsonl` @ `bb19cc3` |
| S7 | No quota stop; Sol used both reserved calls (r1 FAIL, r2 RECOMMENDATION); Luna ran the DIG checks. | journals; PROTO-DEC-0095 item 4 |
| S8 | 0 supervisor corrections in the lock/archive/commit categories (4 process/accounting corrections + 2 self-caught are listed in the operator journal). The owner counts. | operator journal 2026-09-28; PROTO-DEC-0099 item 3 |
| S9 | Local Windows only -> keep (no cloud slice; the B-lite branch is dropped). | owner answer 2026-09-28T15:42Z; SUPERVISOR-PREREG |

## Next actions (in order)

1. **A-1**: watch the executor (a stall is 15 min without a tree write or journal update;
   PROTO-DEC-0047 item 6); on the candidate: the DeepSeek review per Q-D (approved: one call if the
   balance >= $3), then freeze, then Sol (Medium, prompt <= 150, report <= 250) + MiMo in parallel on
   one SHA; FAIL -> STOP to the owner, a repeat only by the owner's word; the merge is the owner's.
2. **H1 fix (the F-C01 remainder)**: advisor 002 now; after its reply - branch from v2.0.0 + LAUNCH
   file; the vibe executor starts only after A-1 completes (heavy steps serial, ADV-001-4); failing
   test first; DeepSeek review; certifiers Luna + MiMo on the frozen SHA (owner-approved,
   PROTO-DEC-0107); merge per the delegated rule (not a reserved category) unless it falls after
   NIGHT_END - after 23:00 MSK merges only by the owner's word.
3. The Kernel v1 freeze after BOTH merges; then the Community/CoLabus steps (PROTO-DEC-0106 item 8).
4. At the freeze: the public-composition tables (install into an empty temp folder; compare with
   `git ls-files`; "stays"/"leaves" with path, size, one line; mark any "leaves" file the
   installer/validator needs) to the owner; nothing deleted before the owner's word; the tag-name
   proposal `kernel-v1.0.0` awaits approval.
5. Open backlog/residuals: **M-2A-res** (F-2A-01/F-2A-05 LOW residuals, next wave), **N-3**
   (document `PROTOCOL_JOURNAL_IMPORT_ROOT` in the next forward artifact), the Kilo-client growth
   line, the "tests must not hardcode live-corpus ids" line, and the OWNER-QUEUE additions (license
   lawyer before the first sale; authorship article) - all in `docs/ops/BACKLOG.md` / `OWNER-QUEUE.md`.
6. Other queued work already completed tonight: F-18 catalog collectors (branch `bench-catalog`,
   `c53e412`; MiMo verifier pending), DIG corrections + Luna rechecks (all green), OPS-1 phase A
   (branch `ops-1`, `49164b7`; phases B/C gated), wave-3 drafts (`e8181ec`).

## Key SHAs and branches

- `v2.0.0` = **`74b46ff`** (ADV-001 request `118f932` + reply `f6b9fe8` + LAUNCH-A1 `74b46ff`;
  behind: checkpoint `b0bf238`, merge `f252467`, 2A merge `bb19cc3`).
- Advisor: session `4fa0a406-0c18-4641-a85f-265e69fa9fce`; reply `advisor/001-REPLY.md`; journal
  `claude-7dcc4d0185595bcf`.
- A-1: branch `a1-installed-advisory` @ `74b46ff` (worktree `.ai/runtime/a1`; executor pid 9664).
- Frozen 2A = `9bf15ae` (code `5bc9940` + fixes `6364322` W5, `b26b177` S-7); candidate
  `kernel-batch-1` = `79670de` (merged). Certificates: r1 `d23d826` (Sol FAIL), `2440fcc` (MiMo
  RECOMMENDATION); r2 `ca55d02` (Sol), `0d87aff` (MiMo); fix review `c31c3f5`; registry-fix review
  `c69d019`.
- Other branches: `cert-2a-sol-r2`, `cert-2a-mimo-r2`, `fix-registry-fixture`, `bench-catalog`,
  `roadmap-wave3`, `ops-1`, `perf-wave-1`.
- DIG: first-pass REJECT 72.6% -> option (b) corrections -> Luna rechecks 117/118 then 15/15 PASS.

## Standing rules (short)

- Owner decisions: `.ai/DECISIONS.md` 0091-0107. Advisor: PROTO-DEC-0102 + `advisor/CHANNEL.md`
  (ADV-NNN records; independence). Delegated merge: the six conditions of AUTOCYCLE section 6.
  Budget: paid DeepSeek API (operator + reviewer share; < $3 no reviewer + light steps only; < $1
  STOP). vibe policy: PROTO-DEC-0094 (check logs for "falling back"). NIGHT_END not extended; after
  23:00 MSK merges only by the owner's word (PROTO-DEC-0107 item 3).
- Operator: DeepSeek Flash via Kilo (paid API). No secrets anywhere. The MCP cluster and `bot.js`
  belong to the owner's other windows (leave alone).
