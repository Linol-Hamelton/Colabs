# AUTOCYCLE-1 STATE (relay capsule; single writer: the operator)

**CHECKPOINT 2026-09-28T17:47Z - 2A IS MERGED; Kernel v1 = variant A' (PROTO-DEC-0105); the
Community/CoLabus split plan is recorded (PROTO-DEC-0106); the owner restarts the Kilo window; a new
session continues from this file.** Read it first, then `.ai/DECISIONS.md` blocks 0091-0106, then
`docs/research/2026-09-27-roadmap-queue/SUPERVISOR-PREREG.md`.

## Kernel v1 (PROTO-DEC-0105, owner decision)

- Kernel v1 = the current kernel + the merged 2A (`bb19cc3`) + the F-C01 fix (the host review-path
  contract) + A-1 (security semantics). Pilots start after the Kernel v1 freeze; 2B, CORE-ARCH stage
  3 and OPS-1 phases B/C run after v1, in parallel with the pilots.
- A-1: executor Claude Opus (Claude Code, effort max); certifiers Sol + MiMo; Sol has ONE extra call
  beyond PROTO-DEC-0095 (Medium; prompt <= 150; report <= 250); a repeat after a FAIL only by the
  owner's word; the A-1 merge is the owner's.
- F-C01: executor vibe (check the log for "falling back"); a failing test first; the DeepSeek review;
  the certifier candidates (the validator/gate path is high risk - two independent certifiers) come
  from the advisor and need the owner's approval.
- The order and parallelism of F-C01 and A-1: decided by the advisor (the channel, request 001);
  the Kernel v1 freeze happens after both are merged.

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

1. The owner restarts the Kilo window. The new session opens the **advisor channel**
   (`advisor/CHANNEL.md`; note the owner's update `fe1c11d`: check `claude --help` for an effort
   option; if present, pass `high` on every call and record it in MEASUREMENTS `effort`; otherwise
   the owner sets High once in settings and the operator records `effort=owner-setting`): create
   `advisor/001-REQUEST.md` with the packet-2 table and the questions the owner assigned to the
   advisor - **the order and parallelism of F-C01 and A-1** and **the F-C01 certifier candidates**
   (two independent, the validator/gate path is high risk); commit+push the request; call the
   advisor per CHANNEL.md section 3 (effort rule above); save `advisor_session=<id>` into STATE;
   then follow section 4 (reply file, MEASUREMENTS `role=advisor`, ADV-NNN records).
2. **A-1** and **F-C01** execute per the advisor's order; A-1: executor Claude Opus (max),
   certifiers Sol + MiMo (Sol Medium; +1 call beyond PROTO-DEC-0095; repeat only by the owner's
   word); F-C01: vibe executor (falling-back check), failing test first, DeepSeek review, the
   advisor-proposed certifiers approved by the owner; each merge per the delegated rule; the Kernel
   v1 freeze after BOTH are merged; then the Community/CoLabus steps of PROTO-DEC-0106 item 8.
3. At the v1 freeze: build the public-composition tables mechanically (install into an empty temp
   folder; compare with `git ls-files`; "stays"/"leaves" with path, size, one line; mark any
   "leaves" file the installer/validator needs) and send them to the owner; nothing deleted before
   the owner's word; the tag-name proposal `kernel-v1.0.0` awaits approval.
4. Open backlog/residuals: **M-2A-res** (F-2A-01/F-2A-05 LOW residuals, next wave), **N-3**
   (document `PROTOCOL_JOURNAL_IMPORT_ROOT` in the next forward artifact), the Kilo-client growth
   line, the "tests must not hardcode live-corpus ids" line, and the OWNER-QUEUE additions (license
   lawyer before the first sale; authorship article) - all in `docs/ops/BACKLOG.md` /
   `OWNER-QUEUE.md`.
5. Other queued work already completed tonight: F-18 catalog collectors (branch `bench-catalog`,
   `c53e412`; MiMo verifier pending), DIG corrections + Luna rechecks (all green), OPS-1 phase A
   (branch `ops-1`, `49164b7`; phases B/C gated), wave-3 drafts (`e8181ec`).

## Key SHAs and branches

- `v2.0.0` = **`f252467`** (PROTO-DEC-0105/0106 `7323e2f` merged with the owner's CHANNEL update
  `fe1c11d`; behind it: 2A merged `bb19cc3` = `0030fd6` + registry fix `b04e0d9` + records).
- Frozen 2A = `9bf15ae` (code `5bc9940` + fixes `6364322` W5, `b26b177` S-7); candidate
  `kernel-batch-1` = `79670de` (now merged).
- Certificates: round 1 `d23d826` (Sol FAIL), `2440fcc` (MiMo RECOMMENDATION); round 2 `ca55d02`
  (Sol), `0d87aff` (MiMo); fix review `c31c3f5`; registry-fix review `c69d019`.
- Other branches: `cert-2a-sol-r2`, `cert-2a-mimo-r2`, `fix-registry-fixture`, `bench-catalog`,
  `roadmap-wave3`, `ops-1`.
- DIG: first-pass REJECT 72.6% -> option (b) corrections -> Luna rechecks 117/118 then 15/15 PASS.

## Standing rules (short)

- Owner decisions: `.ai/DECISIONS.md` 0091-0106. Advisor: PROTO-DEC-0102 + `advisor/CHANNEL.md`
  (ADV-NNN records, never PROTO-DEC; independence). Delegated merge: the six conditions of
  AUTOCYCLE section 6. Budget: paid DeepSeek API (operator + reviewer share; < $3 no reviewer +
  light steps only; < $1 STOP). vibe policy: PROTO-DEC-0094 (check logs for "falling back").
- Operator: DeepSeek Flash via Kilo (paid API). No secrets anywhere. The MCP cluster and `bot.js`
  belong to the owner's other windows (leave alone).
