Mode: CERTIFYING
Reviewed CANDIDATE: f3ab4b8b299c3fc783d9b6e22b61d1cdcfb15dcc (full SHA; git rev-parse f3ab4b8 matches)
Actual HEAD: 6babdec550938199f2d707f9794681db11c91bde (git rev-parse HEAD)
HEAD normative diff: `git diff --stat f3ab4b8 HEAD -- .ai/bin tests docs/specs .ai/docs .ai/SIGNALS.md docs/ops protocol-manifest.json` is empty
Receipt-Owner: mimo-e4c410e6b1de3851
Reviewer: MiMo-V2.6-Pro (owner accepted MiMo-V2.6-Pro in place of MiMo-V2.6-Flash on 2026-09-26, direct owner confirmation, PROTO-DEC-0086 context), route mimo, effort high, 2026-09-27
Scope: certification of PKG-1, PKG-2, PKG-3, PKG-5 (PKG-4 statement: yes)
Verdict: FAIL
Working tree: dirty (tracked: USAGE.md only; untracked journals). Package paths match CANDIDATE (normative diff empty). `git worktree add` is blocked in this tool environment; FAIL evidence was re-checked against committed blobs via `git show f3ab4b8:<path>` and git object lookups (independent of the working tree). Did not read `round8/CERT-KIMI.md`.

| Package | Verdict | Basis (commands run on this tree / committed blobs) |
|---|---|---|
| PKG-1 | PASS | AC-1..AC-16 met (table below) |
| PKG-2 | FAIL | golden pins invented; AC-1 DONE golden missing (repro below) |
| PKG-3 | PASS | AC-1..AC-15 met; AC-15 rows match the package table |
| PKG-5 | PASS | AC-1..AC-15 met; real ledger `check` invalid=0 |

## Shared evidence (exit codes as printed)

- `node --test tests/dispatch.test.cjs` → 0 (23/23, incl. T20-T26 and the tracked-file guard).
- `node --test tests/runrecord.test.cjs` → 0 (T1-T14 as printed).
- `node --test tests/resolver.test.cjs` → 0 (7/7, incl. AC-15).
- `node --test tests/signals.test.cjs` → 0 (AC-1..AC-9).
- `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` → 0 (Protocol OK; 1 WARN: 136 journals vs cap 100, WARN-first).
- `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` → 0 (416/416).
- `check prompts/DISPATCH.json` → 0 (`CHECK ... slots=28`); `check tests/fixtures/dispatch/R3-DISPATCH.json` → 1, exactly ten `ERROR reason=launch-missing` rows; fixture sha256 `2af348353dbe3d0ff5182d7893f63399ec3d6a1b1dfac6d361d15ee22b245b7f` (matches S3).
- `probe` → 0, eight clients `state=OK`. `protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl` → 0 (`SUMMARY records=1 invalid=0`).
- `protocol-signals.cjs check` → 0 (`lines=97 signals=95 invalid=0`); `count` → 0 (procedure-gap 65, script-candidate 13, fall 17; total 95).
- `resolve tests/fixtures/resolver/real-ladder.json floor-t7-kernel` → 1 `ASK_OWNER reason=shortfall`; primary `vibe:mistral-medium-3.5` rung=9; SUBSTITUTE n=1 `agy:gemini-3.8-flash-high` rung=5; exclusions match AC-15 (below-floor 1,2,3,6,7; tier-unknown 4,5 Terra,8; route-unknown DeepSeek rung 5).
- `resolve ... floor-t3-other` → 0; primary rung 9; SUBSTITUTE n=1 rung 7 Gemini 3.7 High; n=2 rung 6 Luna XHigh. Matches AC-15.

## PKG-1 PASS

AC-1..AC-14, AC-16 covered by dispatch tests T1-T19 and the suite/validator exits above. AC-15: registry `command` flags were filled from recorded `--help` (executor journal); `probe` level 0 OK for all eight clients (`claude,codex,agy,copilot,vibe,kilo,kimi,mimo`). Source check: `git show f3ab4b8:.ai/bin/protocol-dispatch.cjs` contains 0 `docs/research/` paths and `POINTER_PREFIX = 'Read and follow the file '` exactly once (T19). S11 manifest entries present in `protocol-manifest.json` (dispatch, clients.json, bin-output-schema, dispatch tests). `docs/specs/bin-output-schema.md` lists the fifteen PROTO-DEC-0075 item 4 classes and the ten non-conforming scripts. Allowed/forbidden: implementation files stay in Allowed paths; `protocol-manifest.json` and the frame report appear in the operator path-scoped commit `78a22f0` (W1 gate / frame output), which S11 assigns to the operator. No second source of truth: CLI-AGENTS section 1 carries the pointer line to `clients.json`. No open STOP.

## PKG-2 FAIL

AC-2..AC-9 met by `tests/runrecord.test.cjs` (negative fixtures, budget, tokens/end, readRecords/appendRecord, render, sessions ratio 2.96). AC-10: validator+suite green on the integrated tree.

**F-PKG2-1 (blocking) — golden pins are invented, not read from git.** S3 requires `head` = `fd789ac` in full and `launchSha256` = sha256 of `launchFile` at that commit. Reproduction:

```
git rev-parse fd789ac
fd789acdb6558400576644822622544c41296980
git cat-file -t fd789ac0d8e5b36a1b2c3d4e5f6a7b8c9d0e1f2a
fatal: git cat-file: could not get object info
git show fd789ac:docs/research/2026-09-26-ownerideas-revision/prompts/run/r6-claude-final.md | <sha256>
f500344c8b0bcf1736f9a23e84239862c095aa60f8065982863ad5e7c521959c
```

Committed `tests/fixtures/runrecord/golden.jsonl` has `head":"fd789ac0d8e5b36a1b2c3d4e5f6a7b8c9d0e1f2a"` (not a git object) and `launchSha256":"c31227615196cc741502194167cbe7bab90d6e763d3d036704e45ee4f1db2130"` (≠ `f500344c…`). `tests/runrecord.test.cjs` sets `launchSha256: crypto.createHash('sha256').update('launch-file-content')` and never checks pins against the repository. Same wrong `head` in `tests/fixtures/runrecord/pattern-test.jsonl`. This is STOP 3 (a real row forced invented values instead of a STOP) and a missed STOP → FAIL.

**F-PKG2-2 (blocking) — AC-1 golden DONE record missing.** AC-1 requires a golden valid record (one fresh attempt, DONE, every completion field true) as the golden file. `tests/fixtures/runrecord/golden.jsonl` holds only the FAILED `r6-claude-final` two-attempt record (`state":"FAILED"`, `supervisorDone:false`); T1 validates that FAILED shape in memory. The real-past-failure fixture is required *in addition* (PKG-2 AC corpus text), not as a substitute.

## PKG-3 PASS

AC-1: `docs/ops/model-ladder.json` has 11 rungs, `schema=ladder/1`, snapshot 2026-09-25; DeepSeek V4.1 Max model null per S2; stale-hash path tested (resolver T1). AC-2..AC-6: resolver tests. AC-7..AC-12: dispatch T20-T25 (budgets, STALL wakes/fallen, repair resume, pin-changed/`--revise`, Evidence completion, run records). AC-13: source still free of prompt text / `docs/research/`; pointers are launch + `wake.md`/`repair.md`. AC-14: suite 416/416. AC-15: live rows match the package expected table exactly (see shared evidence). Allowed paths for create/change match the commits; `docs/ops/RUNS.jsonl` is runtime data. No second source of truth: `MODEL-ECONOMICS.md` stays canonical and `sectionSha256` gates drift. No open STOP.

## PKG-5 PASS

AC-1..AC-10: signals tests + dispatch T26 (fall + procedure-gap + ERROR row on ledger failure). AC-11: `protocol-signals.cjs check` on the real `.ai/SIGNALS.md` → `invalid=0` (97 lines / 95 signals). AC-12: P-L3-005 front matter matches S8; headings are the eight schema section-3 headings in order; body carries no flag string, effort value or model id. Note (non-blocking): R-L3-005.6 is paraphrased (`Where effort.how indicates no setting is available` vs S8's `` `none` ``); meaning preserved; AC-12 as written is met. AC-13: CLI-AGENTS has sections 1-10; section 10 present. AC-14: `clients.json` loader tests pass; `effort.note` values present for codex/agy; vibe/kimi `config` notes remain null (S8 allows null when `--help` shows no instruction — finding, not failure). AC-15: validator+suite green. S2 header of `.ai/SIGNALS.md` is byte-identical to the four fixed lines. No second source of truth: CORE-ARCH-6 remains a proposal; `docs/specs/signals-ledger.md` is canonical grammar. No open STOP.

## PKG-4 statement (medium risk, PROTO-DEC-0079 D6)

I am the certifier providing the PKG-4 independent statement (DeepSeek wrote the plan, so its review is not a certification). Spot-check of the committed CANDIDATE: P-L2-002 is 0.5 with Independent judgement replacing Size; L0-ROOT is 0.6 with R-L0-37 and R-L0-38 defined once each; P-L0-009 exists (0.1 draft). No blocking defect found in this statement-level check. Not a substitute for a high-risk package certification.

## STOP / second-source / paths summary

Missed STOP: PKG-2 STOP 3 (above). No other missed STOP in the executors' reports that contradicts the CANDIDATE. Path sets of `78a22f0`, `4793cb0`, `aa52c42` stay within package Allowed paths plus operator gate (`protocol-manifest.json`), frame outputs (`round8/IMPLEMENT-E*.md`) and run-chain usage rows in `USAGE.md` (author: owner/operator commits). No commit/tag/push/branch by this certifier.
