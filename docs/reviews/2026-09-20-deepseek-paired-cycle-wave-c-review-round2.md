# Certifying Review (Reissue): Paired-Cycle Wave C and the Fix Round (C40-01..C40-08, F-1..F-9)

Reviewer: DeepSeek (controller, independent reviewer)
Date: 2026-09-20 (UTC)
Reviewed commit: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
Working tree: dirty (uncommitted Wave C set including the fix round)
Mode: CERTIFYING
Receipt-Owner: deepseek-59c81998639a4feb
Supersedes: docs/reviews/2026-09-20-deepseek-paired-cycle-wave-c-review.md
Scope: C40-01..C40-08 from `docs/reviews/2026-09-20-codex-paired-cycle-remediation-reaudit.md`, the Wave C fix round closing F-1..F-5 of the external Claude round-1 review, and the process items F-6..F-9 from its round-2 review. This reissue exists because the superseded report predated the fix round and its measurements (AGENTS.md section 2; the external round-2 review F-9).
Verdict: PASS

## Acceptance evidence on the current tree

| Check | Command | Result |
|---|---|---|
| Validator | `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1 -Quiet` | exit 0, **0 warnings** |
| Regression suite | `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` | exit 0, **300/300 pass**, 0 fail, 230 s |
| Controller matrix | `node .ai/runtime/wave-c-probe2.cjs` | 10/10 cases A-J agree in both engines |
| Corpus | recursive walk excluding `archive/` | **56 files / 580,759 B** (cap 60 / 600 KB) |
| Journals | `.ai/worklog/*.md` excluding README | **30** (cap 30, validator clean) |

## C40 disposition

C40-01 core-as-review forces strict 0/1 -> fixed (PS 1 / Node 1, both engines refuse the light
path before the parser). C40-02 baseline classification survives an ordinary commit (same bytes
PASS/PASS) and an empty change set stays strict -> fixed. C40-03 journal binding mechanism
verified in both directions; the DeepSeek Wave C review now carries a journal entry citing its
own path (this report is cited by `deepseek-59c81998639a4feb`). C40-04 header contract identical
in both engines, including the Node `Reviewer:` requirement added in the fix round; verdict must
be exactly PASS or RECOMMENDATION; ADVISORY and transcription rejected. C40-05 document-extension
allowlist under `docs/` plus root README/CHANGELOG; executables and images force strict. C40-06
path parity: reparse points rejected by both engines, source role keeps `docs/reviews/`, installed
role accepts safe in-root paths, leading `./` normalized identically. C40-07 recursive corpus
counter excluding `archive/` with file and byte limits, WARN-first. C40-08 template fence fixed,
filled-template gate test reads the real document, per-tag upgrade results with explicit named
skip and no false PASS, light-gate contract documented in `PAIRED-CYCLE.md` and `PROTOCOL.md`.

## Fix round F-1..F-5 (independently confirmed by the external round-2 review)

- F-1 tar extraction is PATH-independent (System32 tar preference, `cwd=tmp`, relative names) and
  both `git archive` and `tar` exit statuses are asserted; the historical upgrade tests are green.
- F-2 the per-tag coverage test is bound to `passedTags` results and cannot print `PASS verified`
  over red tests.
- F-3 the Node strict and light paths require `Reviewer:`, matching PowerShell and the documented
  contract.
- F-4 leading `./` normalization is identical in both engines across light and strict paths.
- F-5 this review's predecessor carried a non-bare verdict; this reissue carries `Verdict: PASS`.

## Process items F-6..F-9

- F-6 TASK/PLAN reconciled with the measured numbers in the same closure pass as this report
  (300/300, 0 warnings, 56 files / 580,759 B, 30 journals).
- F-7 the reviewer journal entry citing this review path is written before receipts, and the
  receipts follow on the same final tree.
- F-8 empty journals pruned and one aged journal archived; the validator reports zero warnings.
- F-9 the unified prompt was extended to cover the fix round (53 lines) and this reissue is the
  CERTIFYING report against the tree that contains it.

## Limits (unchanged and disclosed)

- The baseline is a declaration; a malicious baseline could hide an earlier core commit. Accepted
  residual risk recorded in the prompt and runbook.
- A partial-tag CI checkout hard-fails the coverage test rather than skipping; fail-closed and the
  per-tag skip message tells CI to fetch tags.
- The two engines can report different reasons when a review is both ADVISORY and transcribed
  (verdict parity holds, reason order differs); cosmetic.
- External spot re-review on this final tree is the remaining acceptance item; its report is a
  separate artifact and is compared before the receipts are recorded.
