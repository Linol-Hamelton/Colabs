# AUTOCYCLE-1 STATE (relay capsule; single writer: the operator)

**CHECKPOINT 2026-09-28T21:05Z - KERNEL v1 FROZEN: annotated tag `kernel-v1.0.0` on `22e066d`
pushed (tag object `bf680c88`); PROTO-DEC-0108 recorded (2A + H1 + A-1; Zenodo enabled; SWH save
accepted); WAITING for the owner's release/CoLabus lines; no new development in the public repo.** Read it first, then `.ai/DECISIONS.md` blocks 0091-0106, then
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
- ADV-002 (selection=advisor): H1 starts NOW in parallel with A-1 (vibe is a light step, the files
  are disjoint); names: branch `h1-installed-protected-set`, worktree `.ai/runtime/h1`,
  `LAUNCH-H1.md`, certifier prompt `docs/reviews/2026-09-28-h1-adversarial-prompt.md`; allowed files
  = `.ai/bin/protocol-verdict.cjs`, `tests/rulebook.test.cjs`, the spec protected-set paragraph,
  the prompt, the journal (NOT `tests/validator-gate.test.cjs` - A-1 edits it); semantics: source or
  missing role unchanged (`managed`+`source` required), installed = `managed` + `.ai/`, `.claude/`,
  `.codex/` with `source` present -> exit 2, any other role -> exit 2; a 9-case test matrix in
  `tests/rulebook.test.cjs` (prefix `PROTO-DEC-0107 H1:`); the A-1 flow adds an operator full suite
  on the branch before the DeepSeek review; MiMo certifies both candidates in separate sequential
  sessions. Owner clarification (selection=owner): advisor calls are LIGHT (like codex/vibe remote
  calls; the 8 GB gate does not block them; wait only under Available < 4 GB); heavy = full suite,
  measurements, local code-working sessions.
- ADV-003 (selection=owner, 2026-09-28T20:39Z): the owner answered the briefing himself to save the
  Claude limit: the A-1 blacklist is sufficient for v1 (whitelist -> BACKLOG); H1 accepted; hosts
  `D:\Block-Puzzle` and `D:\VPN` checked (both `role=installed`, no `source` -> no re-install);
  freeze diffs are docs-only (checked for both); **A-1 merge GRANTED**; **H1 merge granted only on
  a MiMo-H1 PASS/RECOMMENDATION, otherwise STOP**; F-001 left unfixed; after both merges - full
  suite + `verify` + push, then a separate `git mv` of `LAUNCH-*.md` to
  `docs/research/2026-09-28-autocycle/launch/`; after a green merged tree - propose tag
  `kernel-v1.0.0` + SHA (tag on the owner's word only); Community state skeletons = exactly the
  installer's empty-project skeletons (OWNER-QUEUE line closed); DeepSeek balance = owner base
  $21.9 (15:08Z) minus usage (reviewers $0.080118 by usage so far; operator calls unmeasured).
- Next advisor call: only on a FAIL/BLOCKED verdict or a new risk; otherwise the owner answers
  directly.
- Owner ruling on parallel candidates (selection=owner, 2026-09-28): the overlap check
  `git diff --name-only v2.0.0...a1-installed-advisory` (tests/validator-gate.test.cjs + uncommitted
  validate-protocol.ps1) vs `...h1-installed-protected-set` (tests/rulebook.test.cjs + uncommitted
  .ai/bin/protocol-verdict.cjs) shows **no common files**. If one delivers first and the other's diff
  then overlaps: the second merges the updated v2.0.0 before its freeze (plain merge, no rebase;
  conflicts resolved by its executor with a failing test first, then the operator full suite) and
  freezes/certifies the merged SHA; its DeepSeek review covers the diff against the updated v2.0.0.
  If there is no overlap, the ADV-002 order stands; the full suite on the merged tree after the
  second merge is mandatory either way.

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
- H1 execution (ADV-002): worktree `.ai/runtime/h1`, branch `h1-installed-protected-set` @ `606fcc5`
  (cut from `606fcc5`); executor vibe launched 18:34Z (background `bgp_0e94889cc001d6qaazaxD8B6oV`,
  pid 31832, max-turns 150, registered minimal tool list); it runs only
  `node --test tests/rulebook.test.cjs`; the full suite stays with the operator.
- **H1 candidate DELIVERED 18:39Z (vibe, mistral-medium-3.5): `28d13cc` tests (nine
  `PROTO-DEC-0107 H1:` cases) + `d31ebb6` fix/spec/prompt(96)/journal; only the ADV-002-2 allowed
  files; 63/63 on the branch; working tree clean. The operator full suite is queued until the A-1
  session exits (ADV-002-5).**
- **A-1 candidate DELIVERED 19:03Z (Claude Opus 5.5, effort max; executor session ended
  `A1_DONE ok=True`, wall 57.6 min, shadow cost 14.28 USD): `6f44903` failing regression +
  `7e51b89` fix + adversarial prompt (129 lines) + journal; working tree clean; branch
  `a1-installed-advisory` tip `7e51b89`; no push/merge by the executor.**
- **F-18 CLOSED (owner ACCEPT 2026-09-28): catalog accepted @ `81cab28` (MiMo verifier
  RECOMMENDATION 9/0/1), merged into `v2.0.0` as `c554d17` (docs-only range, 14 files); full suite on
  the merged tree 423/423 PASS (297.3 s, Available 10.28 GB); frame row CLOSED; row 20
  (swe-bench-pro) stays unverified (HTTP 403) with a BACKLOG recheck line.**
- Both candidate suites GREEN on their branches (A-1 425/425 in 304.5 s; H1 432/432 in 311.2 s;
  validators exit 0; Available 10.34 -> 9.74 -> 9.63 GB). DeepSeek fix reviews dispatched for both
  at 19:39Z (balance recorded before the paid calls: documented snapshot $11.92 + ¥155.41, live
  balance not observable from this session).
- DeepSeek fix reviews delivered: **A-1 RECOMMENDATION** (`0e1f947`), **H1 PASS** (`411f7dd`); both
  Mode ADVISORY (fix reviews, not certificates). Frozen and pushed: A-1 `8b74e41`, H1 `476b488`
  (the freeze commits carry the certifier launch docs). Four certifier worktrees created
  (`cert-a1-sol`, `cert-a1-mimo`, `cert-h1-luna`, `cert-h1-mimo`); wave 1 (Sol + MiMo for A-1)
  dispatched 20:03Z.
- `advisor/003-BRIEFING.md` (for Claude when its limits reset) updated to the certified state at
  this commit: A-1 certified (Sol PASS + MiMo REC) and H1 (Luna PASS, MiMo-H1 running) plus seven
  risk points to check; the MiMo-H1 verdict followed as `26b9e5b`.
- **Merges: A-1 `4d7081a`, H1 `ee0d9f1`; merged-tree suite 434/434 PASS (278.9 s), `verify` matches,
  pushed. `LAUNCH-*.md` relocated to `docs/research/2026-09-28-autocycle/launch/` (`6b55688`).
  MiMo-H1 PASS committed `26b9e5b` (branch `cert-h1-mimo` pushed). MEASUREMENTS: 54 rows.**

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
- ADV-002 exchange: request `1688372`, reply `ca4f9fc`; owner gate clarification (advisor calls are
  light); `LAUNCH-H1.md` `606fcc5`; H1 worktree + vibe executor started in parallel with A-1.
- A-1 progress: failing regression committed `6f44903` (advisory must fail the gate); the fix to
  `validate-protocol.ps1` is in progress (+28/-6).
- H1 vibe session crashed ~25 s in on a Windows console-encoding error (`charmap` cannot encode
  `→`) before any edit; restarted with `PYTHONUTF8=1`/`PYTHONIOENCODING=utf-8` resuming the same
  session (`6c2b087c-bfe1-a031-6783-64b20d34298b`, wrapper pid 28096); model = mistral-medium-3.5
  (GLM alias unresolved; vibe.log evidence 18:30:41Z).
- Under the lock: the `.ai/TASK.md` F-C01 line corrected (ADV-001-7); OWNER-QUEUE +Q-A..Q-D.
- `LAUNCH-A1.md` `74b46ff`; A-1 worktree + branch created from it; executor session started.
- F-C01 probe, light, no tree changes (details in the Kernel v1 section above).
- Gate before A-1: FreePhysicalMemory 9.47 -> 9.89 GB; Committed 37.24/68.40 GB (54.4%); nonpaged
  1.22 GB; TextInputHost (208% of 30-core total) stopped per the standing memory steps; no process
  above ~5% after that (msmpeng 4.5%, transient).
- Earlier today: 2A merged `bb19cc3`, registry fix `b04e0d9`, S6 green (2 valid RUNS rows: one
  `tokens.source="none"`, one full usage 127656/37257, 0.093511 USD); pushed `v2.0.0` to `74b46ff`.
- 18:25Z perceived section-10 gate block before advisor 002 (Available 7.7 -> 7.2 GB); corrected by
  the owner: advisor calls are light, so the call proceeded at Available 8.88 GB (ADV-002-6).

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

1. **A-1: MERGED into v2.0.0 `4d7081a`** (certified: Sol PASS `a9a2443` + MiMo RECOMMENDATION
   `d11b430`, cert branches `cert-a1-sol`/`cert-a1-mimo` pushed; DeepSeek review RECOMMENDATION;
   branch suite 425/425; owner-granted per ADV-003 item 4).
2. **H1: MERGED into v2.0.0 `ee0d9f1`** (certified: Luna PASS `e13adf3` + MiMo PASS `26b9e5b`,
   cert branches `cert-h1-luna`/`cert-h1-mimo` pushed; DeepSeek review PASS; branch suite 432/432;
   merged after the MiMo-H1 PASS satisfied the owner's condition).
3. **M-2A-res (autonomous brief item 3b): DONE** - F-2A-01 and F-2A-05 both CONFIRMED open LOW
   (`M-2A-RES-CHECK.md`); no code changes.
   **F-18 (item 3c): cover/dup check DONE** (`bench-catalog` `6f2673b`); exit artifact
   `CATALOG.jsonl` merged (48 rows, `a612bff`); MiMo verifier (20% sample) launched 18:52Z as
   `bgp_0e959c1ae001mQ3JOFzDWHEmUs` (launch `LAUNCH-F18-VERIFY.md` `e31a31a`); result pending.
   **F-18 verifier DONE 18:58Z: RECOMMENDATION - 9 CONFIRM / 0 REJECT / 1 UNSURE (row 20
   swe-bench-pro: datacamp.com HTTP 403 for one of four scores); review
   `docs/reviews/2026-09-28-mimo-bench-catalog-verification.md` (CERTIFYING, receipt
   mimo-4aeecec4ecf66249) @ `81cab28` (pushed). **Owner ACCEPT 2026-09-28; frame CLOSED in FRAMES;
   merged `c554d17`; suite 423/423 on the merged tree; row 20 recheck in BACKLOG.**
   **Gate cadence:** the 30-min gate cron was stopped at 21:05Z in waiting mode (no development;
   re-enable on the owner's word); the log stays at `.ai/runtime/gate-autocycle.log`.
4. **Kernel v1 FROZEN 2026-09-28T21:02Z: annotated tag `kernel-v1.0.0` on `22e066d` pushed (tag
   object `bf680c88`); PROTO-DEC-0108 recorded under the lock (Zenodo integration enabled; Software
   Heritage save request accepted). WAITING for the owner's two lines ("релиз опубликован, DOI
   <...>", "CoLabus создан, доступ выдан"), then PROTO-DEC-0106 steps d-f one by one.** The five
   state files reset to the installer's empty-project skeletons (ADV-003 item 7). **The five
   validator-referenced files ALL STAY (verdict 2026-09-28, selection=owner): `.editorconfig` and
   `.codex/config.toml` as exceptions; `test-protocol.ps1`, `tests/` entirely and
   `.github/workflows/protocol.yml` because `role=source` requires them (FAIL otherwise,
   `validate-protocol.ps1:144-158`); `REGISTRY.md` stays as a path with stub content. Tables
   recalculated: 158 stay / 1881 leave, referenced=0. Step (f) check extended: validator PASS +
   full suite PASS on the cleaned tree + Community install validator PASS.**
5. At the freeze: the public-composition tables (install into an empty temp folder; compare with
   `git ls-files`; "stays"/"leaves" with path, size, one line; mark any "leaves" file the
   installer/validator needs) to the owner; nothing deleted before the owner's word; the tag-name
   proposal `kernel-v1.0.0` awaits approval. **Tables built (autonomous brief item 3a):
   `COMMUNITY-COMPOSITION.md` - 45 stay / 1963 leave @ `63de030` + 5 validator-referenced leaves and
   the state-file freeze-form question in OWNER-QUEUE; nothing deleted.**
6. Open backlog/residuals: **M-2A-res** (F-2A-01/F-2A-05 LOW residuals, next wave), **N-3**
   (document `PROTOCOL_JOURNAL_IMPORT_ROOT` in the next forward artifact), the Kilo-client growth
   line, the "tests must not hardcode live-corpus ids" line, and the OWNER-QUEUE additions (license
   lawyer before the first sale; authorship article) - all in `docs/ops/BACKLOG.md` / `OWNER-QUEUE.md`.
7. Other queued work already completed tonight: F-18 catalog collectors (branch `bench-catalog`,
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
