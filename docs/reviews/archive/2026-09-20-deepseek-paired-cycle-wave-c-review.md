# Certifying Review: Paired-Cycle Wave C (C40-01..C40-08)

Reviewer: DeepSeek (controller, independent reviewer)
Date: 2026-09-20 (UTC)
Reviewed commit: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
Working tree: dirty (uncommitted Wave C set; a parallel owner-launched Claude session writes read-only analysis artifacts, untouched here)
Mode: CERTIFYING
Receipt-Owner: deepseek-59c81998639a4feb
Scope: the limited remediation ordered after the independent re-audit FAIL: C40-01..C40-08, plus the owner's additional criteria (reason-checking negatives, same-contents-after-commit PASS, per-tag upgrade results, corpus capacity).
Verdict: PASS

## Acceptance matrix (controller probe, both engines)

`.ai/runtime/wave-c-probe2.cjs` on TEMP fixtures (installed role unless stated), each case run
through `validate-protocol.ps1 -Quiet` and `node .ai/bin/protocol-handoff.cjs gate-check`:

| Case | Expectation | PS | Node |
|---|---|---|---|
| A docs before commit, `- Baseline: <40-hex>` | light path accepted | 0 | 0 |
| B same contents after commit, same baseline | light path accepted (C40-02) | 0 | 0 |
| C core file (`CLAUDE.md`) named as the review artifact | forced strict, FAIL | 1 | 1 |
| D executable file under `docs/` (`.js`) | forced strict, FAIL | 1 | 1 |
| E `Verdict: PASS WITH BLOCKERS` | review parser rejects | 1 | 1 |
| F transcription marker | review parser rejects | 1 | 1 |
| G `Reviewer`/`Verdict` under a body heading | review parser rejects | 1 | 1 |
| H in-root junction review path | both engines reject | 1 | 1 |
| I `custom-audit/` in installed role | accepted | 0 | 0 |
| J `custom-audit/` in source role | rejected (source keeps `docs/reviews/`) | 1 | 1 |

Notes: negatives E-G run inside a correctly classified light path, so they fail on the review
parser, not on classification - the reason, not only the exit code, is asserted. Case B is the
owner's corrected criterion and now passes after an ordinary commit of the same bytes.

## Engine changes verified by reading

- `validate-protocol.ps1` and `protocol-handoff.cjs`: baseline must match `^[0-9a-f]{40}$`
  before any git call; `rev-parse --verify` and `merge-base --is-ancestor <sha> HEAD` gate the
  light path; protected-path prefixes are evaluated on the raw changed set before the
  review-artifact exclusion; document-extension allowlist for the `docs` scope plus root
  `README.md`/`CHANGELOG.md`; recursive corpus counter over `docs/reviews/` excluding
  `archive/`, files and bytes, WARN-first; reparse-point rejection on both engines.
- Repair paths still hold: junction/out-of-root cases fail, strict path requires the
  unified prompt plus an independent review with the CERTIFYING header.
- Residual risk documented in the prompt and runbook, not hidden: the baseline is a
  declaration; a malicious baseline could hide an earlier core commit. Wave C prints the
  baseline in the light-path success message and requires it in journal and review.

## Checks actually run

- `validate-protocol.ps1`: exit 0, **0 warnings**.
- `test-protocol.ps1`: **295/295 pass**, 0 fail, 211 s (255 baseline + 40 regression tests
  added across the remediation waves).
- `rg`/inspection of both engines for the 40-hex guard, protected-prefix ordering,
  document-extension allowlist, reparse rejection and role-aware paths.
- Corpus 52 files / ~600 KB region (the parallel Claude session added two read-only
  artifacts); journals 30 (validator clean).

## Remaining gate

Acceptance requires one limited external re-review (Codex or Claude headless) with PASS,
covering C40-01..08 and the areas DeepSeek itself touched earlier (PLAN Wave C section,
unified prompt refresh, R8 journal housekeeping). Final receipts are recorded after that
report lands and after `.ai/TASK.md`/`.ai/PLAN.md` are reconciled under lock - the last tree
change before recording.
