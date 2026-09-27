Mode: ADVISORY
Baseline: 82c82965493d8820ed574cb1aa09d453bfb34054 (HEAD when the test lane started); Evidence anchor fe488fbc2a5342d54046d7078fde54cf67838a99 (an operator journal commit landed during the run); normative tree frozen at 7f199c50589ce3b5b34680e70be21e9a43aeeac1; working tree status: dirty (untracked session journals and this report)
Reviewer: DeepSeek 4.1 Flash, route kilo, effort unknown, 2026-09-27 (UTC)
Scope: stage-12 final technical verdict over the OwnerIdeas revision candidate (PKG-1..PKG-5); re-verification of the stage-9 findings F-1..F-5 and the round 1-3 certifier findings; tests and validators re-run in my own detached worktree
Verdict: PASS

Frame `task:ownerideas-r12-final-deepseek` (parent program `ownerideas-revision`). Nothing here is a
decision (AGENTS.md section 2). I certify nothing (PROTO-DEC-0079 item 6).

## 1. Method and baseline

- FACT: the test lane started at HEAD `82c82965493d8820ed574cb1aa09d453bfb34054`; the operator then
  committed `fe488fbc2a5342d54046d7078fde54cf67838a99` (a kilo journal, `docs(protocol)`) while the
  run was in flight, so the Evidence block anchors at `fe488fb`. The commit is journal-only.
- FACT: `git diff --stat 7f199c5 HEAD -- .ai/bin tests docs/specs .ai/docs .ai/SIGNALS.md docs/ops
  protocol-manifest.json docs/core-arch .ai/DECISIONS.md` prints nothing: no normative file changed
  after the frozen candidate `7f199c5`. All later commits are journals, this program's reports, or
  the sibling cost-routes study.
- FACT: I created `.ai/runtime/r12-deepseek` with `git worktree add .ai/runtime/r12-deepseek HEAD`
  and ran every test/validator there, sequentially, with no other test run active. The worktree was
  pristine before and after: `git status --porcelain` was empty after the last step.
- FACT: `record --owner deepseek-4f70203222c3ae0b` and `verify` were taken on the shared checkout
  at the same HEAD, because the session journal and its Evidence block must live in the shared
  checkout; a worktree Evidence block would be deleted with the worktree and could not verify.
- Note: `prompts/VERIFY.md` still names the earlier candidate `f3ab4b8`; the frozen candidate is
  `7f199c5`, named by both final certifications (round8/CERT-KIMI-PKG2-R3.md:2,
  round8/CERT-MIMO-PKG2-R3.md:1). The later explicit candidate governs.

## 2. Stage-9 findings F-1..F-5

`round8/IMPLEMENTATION-REVIEW-DEEPSEEK.md:84-142`. Status of each, reproduced on this tree:

| Finding | Independent result |
|---|---|
| F-1 PKG-5 audit prompt missing | RESOLVED. `docs/reviews/2026-09-26-gemini-ownerideas-pkg-5-audit-prompt.md` exists, 31 lines, one probe per AC-1..AC-15 |
| F-2 run-record `class` enum contradicts the schema | RESOLVED. `.ai/bin/protocol-runrecord.cjs:69-75` holds `NONE` + the fifteen PROTO-DEC-0075 item 4 names + `UNCLASSIFIED`; `docs/specs/run-record.schema.md:91` states the same. Repro below |
| F-3 `bin-output-schema.md` lists 12 classes | RESOLVED. `docs/specs/bin-output-schema.md:27-32` states fifteen and lists all fifteen; `:41` names `protocol-scope.cjs`/`protocol-verdict.cjs` and drops the two non-existent scripts |
| F-4 dispatch tests not hermetic | RESOLVED in isolation. 26/26 pass and `git status --porcelain` stays empty; the trailing guard test asserts it. Latent shared-checkout hazard recorded in section 8 |
| F-5 registry freshness / AC-15 not reproducible | RESOLVED. `probe` exits 0 with all eight clients `state=OK`; both `resolve` AC-15 rows match PKG-3's table exactly |

F-2 reproduction (worktree at HEAD):

```
node -e "const rr=require('./.ai/bin/protocol-runrecord.cjs');const fs=require('fs');const rec=JSON.parse(fs.readFileSync('tests/fixtures/runrecord/golden.jsonl','utf8').split(/\r?\n/)[0]);..."
SCOPE -> ["root.attempts[0].class: must be one of NONE, AUTH_ERROR, ... PROCESS_CRASH, ... POLICY_FAILURE, UNCLASSIFIED"]
AUTH_ERROR -> [] (accepted)
PROCESS_CRASH -> [] (accepted)
```

The obsolete class `SCOPE` is now rejected; canonical `AUTH_ERROR` and `PROCESS_CRASH` pass.

## 3. Certifier record, rounds 1-3, and stage-11 verification

- Round 1: `round8/CERT-KIMI.md` PASS (candidate `f3ab4b8`); `round8/CERT-MIMO.md` FAIL - F-PKG2-1
  invented golden pins, F-PKG2-2 missing golden DONE record, and a missed STOP 3. Both defects were
  repaired by `round9/REPAIR-PKG2-GEMINI.md` (real git pins; DONE record added) and independently
  re-verified in round 2.
- Round 2: `round8/CERT-KIMI-PKG2-R2.md` PASS; `round8/CERT-MIMO-PKG2-R2.md` FAIL on the four
  residual PKG-2 defects F-PKG2-R2-1..R2-4 (render headers, missing `VALID line=` rows, no golden
  Markdown equality, no CLI stdout pattern check). All four were repaired by
  `round9/REPAIR-PKG2-R3-GEMINI.md`; I re-read the source and reproduced the corrected
  behaviour: headers `Model ran`/`Effort used`; `validate` prints `VALID line=1`/`VALID line=2`;
  T13 asserts byte equality to `tests/fixtures/runrecord/golden.md`; `testCliPattern_AllCommands`
  checks every CLI stdout line.
- Round 3: `round8/CERT-KIMI-PKG2-R3.md` PASS and `round8/CERT-MIMO-PKG2-R3.md` PASS, both on the
  frozen candidate `7f199c5`, both finding the normative diff to HEAD empty.
- Stage 11: `round9/VERIFY-SOL.md` (GPT-5.6 Sol, `Mode: CERTIFYING`) PASS on `7f199c5`.
- FACT: the final candidate survived independent verification. MiMo's two FAILs were adjudicated
  by reproduction in the r9d/r9e repairs and re-verified to PASS in round 3; no certifier finding
  remains open with a blocking verdict.

## 4. Tests and validators I ran myself (worktree at 82c8296)

Sequential, no parallel test run. Real exits:

| Command | Exit | Observed |
|---|---:|---|
| `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` | 0 | `Protocol OK. 1 warning(s)` (WARN-first: 149 journals > cap 100; pre-existing) |
| `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` | 0 | `# tests 419 / # pass 419 / # fail 0` (530209 ms) |
| `node --test tests/dispatch.test.cjs` | 0 | 26/26, incl. T27-T29 and the tracked-file guard |
| `node --test tests/resolver.test.cjs` | 0 | 7/7, incl. AC-15 |
| `node --test tests/runrecord.test.cjs` | 0 | 1/1 wrapper, T1-T14 + CLI pattern |
| `node --test tests/signals.test.cjs` | 0 | 9/9 |
| `node .ai/bin/protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl` | 0 | `VALID line=1`, `VALID line=2`, `SUMMARY records=2 invalid=0` |
| `node .ai/bin/protocol-signals.cjs check` | 0 | `SUMMARY lines=97 signals=95 invalid=0` |
| `node .ai/bin/protocol-signals.cjs count` | 0 | `SUMMARY total=95 open=91` |
| `node .ai/bin/protocol-dispatch.cjs probe` | 0 | eight clients `state=OK` |
| `node .ai/bin/protocol-dispatch.cjs resolve tests/fixtures/resolver/real-ladder.json floor-t7-kernel` | 1 | primary `vibe:mistral-medium-3.5` rung 9; one substitute `agy:gemini-3.8-flash-high` rung 5; `ASK_OWNER reason=shortfall` |
| `... resolve tests/fixtures/resolver/real-ladder.json floor-t3-other` | 0 | primary rung 9; substitutes rung 7 Gemini 3.7 High, rung 6 Luna XHigh |
| final `git status --porcelain` in the worktree | 0 | empty |

`node .ai/bin/protocol-runrecord.cjs sessions` exits 0 but reports `rows=0 sessions=0 ratio=NaN`
in the detached worktree because `.ai/runtime/metrics/` is untracked session state and absent
there; it is a live measurement, not an acceptance number.

## 5. Integration and documentation

- FACT: the manifest holds every package entry exactly once: `source` carries `protocol-dispatch.cjs`,
  `clients.json`, `bin-output-schema.md`, `protocol-runrecord.cjs`, `run-record.schema.md`,
  `model-ladder.json`, `wake.md`, `repair.md`, `SIGNALS.md`, `protocol-signals.cjs`,
  `signals-ledger.md`; `tests` carries the five package test files.
- FACT: single sources of truth hold. `.ai/docs/CLI-AGENTS.md:50` points section 1 at
  `.ai/docs/clients.json`; the ladder is hash-gated (`protocol-dispatch.cjs:634-635` against
  `model-ladder.json:6`); `docs/specs/run-record.schema.md` does not restate the PKG-2 S4/S5 rows;
  `docs/specs/signals-ledger.md` is the one grammar; `docs/ops/RUNS.jsonl` is empty and reserved
  for the first real dispatch.
- FACT: the PKG-4 records conform - P-L2-002 0.5 replaces `Size` with `Independent judgement`;
  R-L0-37/R-L0-38 are defined once each in `L0-ROOT.md:50,86`; P-L0-009 has the nine S6 headings in
  order; CORE-ARCH-3 В-24 reads `Закрыт: PROTO-DEC-0072`.
- FACT: size caps on specs hold (`signals-ledger.md` 72 lines <= 120; `bin-output-schema.md` 41
  lines <= 80); P-L3-005 carries no flag string, effort value or model id (only front-matter `---`).
- FACT: `docs/specs/run-record.schema.md:91` and the library agree with PROTO-DEC-0075 item 4.

## 6. Closure criteria

- Dangling references: the deleted `OwnerIdeas/MIGRATION.md` and the moved
  `OwnerIdeas/SYNTHESIS-2026-09-25-cross-document.md` are referenced only from immutable records
  (`.ai/ARCHIVE.md`, journals, `PROTO-DEC-0080`), from this program's own artifacts and from the
  archive index. `docs/research/archive/INDEX.md` maps every moved path. No active-corpus dangling
  reference.
- Canonical destinations exist: the kept `OwnerIdeas/*.md` files carry the advisory-seed banner
  (`Advisory seed; consumed by <frame>; status: RESOLUTION-CLAUDE.md section 4.4`); P-L0-009 holds
  A-1 part a with its `## Open` transcribing the undecided envelope.
- Research candidates are registered in `docs/research/FRAMES.md`: F-02 (admitted), C-R1, C-R5,
  C-R7, C-JEV; the candidate counter reads 4/5. No second active source of truth for an implemented
  decision was found.

## 7. Known items - classified, not fixed

- Codex usage parser under-count. REPRODUCED. `.ai/bin/protocol-dispatch.cjs:1202` matches
  `/tokens used\s*\r?\n?\s*([0-9,]+)/gi`. On my tree:
  `"tokens used\n10 644"` -> 10; `"tokens used 10 644"` -> 10; `"tokens used: 10 644"` -> no usage
  (`source="none"`); `"tokens used\n10,644"` -> 10644. Classification: real implementation defect in
  PKG-1 S8, owner-queued as OPS-1 W0 (`docs/research/2026-09-27-ops-layer/PROMPT.md:33-46`), not a
  blocking finding for this candidate.
- Dispatch tests not hermetic. Not reproduced in isolation: 26/26 pass and the worktree stays clean;
  the guard test enforces this. The known latent form is concurrent runs in one shared checkout
  (MiMo round 2 saw `tests/fixtures/dispatch/t26-launch.md` deleted mid-run). Classification: latent
  hazard, mitigated by the guard and by running the lane in a private worktree.
- STOP-7. FACT: `docs/research/FRAMES.md:26` marks F-01 `CLOSED` with `Record: PROTO-DEC-0079..0081`
  and no `receipt:` field, while `:20` counts `Closed frames without a receipt | 1`. R-L0-22.56/22.67
  want a receipt on a closed row. Open process item; the program is still implementing.
- STOP-8 owner decisions. Listed under section 9; these are open owner decisions, not failures.

## 8. Residual non-blocking findings

- R-1: `docs/reviews/2026-09-26-mistral-ownerideas-pkg-2-audit-prompt.md` is 184 lines, over the
  AGENTS.md section 2 item 3 cap of 150 and over PKG-2 required output 5. Flagged as Kimi round-1
  finding 3 and never trimmed. Content is complete (one probe per AC-1..AC-10); the file needs
  trimming or an owner-approved expansion.
- R-2: the codex-tokens defect of section 7 (OPS-1 W0).
- R-3: `vibe` and `kimi` have `effort.how="config"` with `effort.note=null`; PKG-5 S8 permits this,
  and their P-L3-005 stop condition stays reachable. Finding, not failure (stage-9 F-6).
- R-4: `protocol-signals.cjs check` reports `lines=97` for a 99-line ledger; the two blank header
  lines are excluded and `docs/specs/signals-ledger.md` does not define the `lines` counter
  (stage-9 F-7).
- R-5: `prompts/VERIFY.md:6` still names candidate `f3ab4b8`; the frozen candidate is `7f199c5`.

## 9. OPEN OWNER DECISIONS

These are open owner decisions, not defects of the candidate.

- OQ-1 (A-11 redaction / DIG): A-11 has no accepted block; outside DIG and the packages.
- OQ-2 (A-1 design block): the capability-envelope design (P-L0-009 `## Open`) and enforcement.
- OQ-3 (stall threshold): PROTO-DEC-0051 item 4 (five minutes) vs PROTO-DEC-0075 item 5
  (10-15 minutes); PKG-1 defaults to 10.
- F-02 gate: `docs/research/2026-09-26-model-layer/round2/GATE-REPORT.md`.
- DeepSeek identity mapping: postponed, with two recorded triggers.
- OQ-10 (DIG): `FRAMES.md` still reads `not counted (ledger pending)`; the gate owner records the
  number. Owner/gate act.
- OQ-4..OQ-9, OQ-11..OQ-13 remain as recorded in `round6/FINAL-RESOLUTION-CLAUDE.md` section 9 and
  its resume log.

## 10. Limits of this review

- Advisory (COMMON.md). I did not run the new dispatcher on a real route: A-13's first real launch
  and the switch of any program to `protocol-dispatch.cjs` are owner acts (resolution section 8).
- The resolver AC-15 rows depend on the workstation's client versions; the registry matched on
  2026-09-27. A later client update re-opens F-5's probe path by design.
- Two parallel certifiers plus GPT-5.6 Sol already certified the frozen candidate; this review adds
  an independent reproduction on the same candidate and does not replace their CERTIFYING verdicts.

## Verdict

Verdict: PASS. No unresolved blocking finding: F-1..F-5 and every certifier finding across rounds
1-3 are resolved or refuted with reproduction, the frozen candidate `7f199c5` survived independent
verification, all validators, the full suite and the four package test files are green in my own
worktree at HEAD, and integration, documentation and closure criteria hold. The codex-tokens
under-count (OPS-1 W0) and the oversize PKG-2 audit prompt (R-1) are recorded residuals, not
blocking. Owner items are listed under OPEN OWNER DECISIONS.
