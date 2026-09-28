# Luna H1 certification — installed-role protected set

- Reviewed commit SHA: `476b488abba8fb5614a81105241e8b806d820d54`
- Working tree status: dirty while this review and journal are being created; before them the candidate tree was clean.
- Reviewer model: `GPT-5.6 Luna`
- Provider/client: OpenAI Codex client, confirmed by this active certification session
- Effort: `xhigh`; usage: `not-exposed`
- Date (UTC): 2026-09-28T20:28:44Z
- Scope: `docs/reviews/2026-09-28-h1-adversarial-prompt.md`, frozen tree, and fresh installed probe
- Mode: `CERTIFYING`
- Receipt-Owner: `codex-e7ed7431f3ebf38f`
- Verdict: `PASS`

## Independence and baseline

I read the frozen candidate and the advisory DeepSeek review, but did not read the
other H1 certifier's artifacts before freezing this report. `git rev-parse HEAD`
matched the reviewed SHA. `git diff 606fcc5..HEAD --stat` showed only the H1
implementation, H1 tests/spec/prompt, launch/review documents, and implementer
journals. Forbidden files were untouched: `tests/validator-gate.test.cjs`,
`validate-protocol.ps1`, `setup-ai-protocol.ps1`, `protocol-manifest.json`, and
`tests/handoff.test.cjs`.

## Required checks

| Check | Result |
|---|---|
| `node --test tests/rulebook.test.cjs` | PASS — 63/63, exit 0, 44.1 s |
| `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` | PASS — exit 0; one pre-existing WARN for 110 journals over cap 100 |
| Fresh real installer + neutral ledger | PASS — install exit 0; installed `role=installed`, `source` absent; candidate `Verdict: FAIL`, exit 1 |
| Pre-fix real installed tool | PASS reproduction — `BLOCKED: ... source must be a non-empty array`, exit 2 |
| Full `test-protocol.ps1` | Not rerun per launch instruction; operator evidence records 432/432 PASS |

## Nine-case H1 matrix

| Case | Input / assertion | Candidate result |
|---:|---|---|
| 1 | installed + managed `validate-protocol.ps1` | `FAIL/1` |
| 2 | installed + managed `protocol-manifest.json` | `FAIL/1` |
| 3 | installed + `.ai/bin/` prefix | `FAIL/1` |
| 4 | installed + off-protected `docs/x.md` | `RECOMMENDATION/0` |
| 5 | installed excludes source-only `setup-ai-protocol.ps1` | `RECOMMENDATION/0` |
| 6 | missing or empty `managed` | `BLOCKED/2` |
| 7 | any present `source` key, including `source: []` | `BLOCKED/2` |
| 8 | unknown/non-string roles (`host`, `42`, `null`) | `BLOCKED/2` |
| 9 | fresh installer end-to-end protected finding | `FAIL/1` |

## Adversarial findings and verdicts

- Semantics 1–3: PASS. `source` and legacy role-less manifests retain mandatory
  `managed` + non-empty `source`; installed manifests use `managed` plus the three
  base prefixes and reject unknown roles.
- Legacy/C02 behavior: PASS. Existing `RC-manifest-schema (C02)` remains present
  and green; the role-less source path was independently exercised.
- Validation and fail-closed behavior: PASS. Installed `managed` entries remain
  non-empty strings; missing/empty managed, present source (including empty/null),
  and invalid roles exit 2 through the existing load error.
- Prototype safety: PASS. Independent probes with inherited `role`/`source`
  properties cannot change role selection or smuggle source protection; the code
  uses own-property checks for both keys.
- Protected-set behavior: PASS. `protocol-manifest.json`, managed validator,
  and `.ai/` remain protected; source-only installer and ordinary docs are not.
- Regression scope: PASS. The verdict diff is limited to role-aware
  `loadProtectedSet`; arithmetic, ledger parsing, path normalization, and
  `--stop-rule` have no other diff hunks. The spec diff is only its protected-set
  paragraph. Tests append the H1 matrix; the import only adds required helpers.
- Pre-fix account: PASS. Running the test archive at `28d13cc` produced 63 tests,
  56 pass, 7 fail: cases `1,2,3,4,5,7,9`. The independent old-vs-new matrix
  reproduced the same classification; case 4 is blocked pre-fix and case 7 is
  incorrectly accepted pre-fix.
- Size and hygiene: PASS. The adversarial prompt is 96 lines; this report is
  within the 250-line cap; `git diff --check` found only pre-existing trailing
  blank-line warnings in implementer journals.

No FAIL or BLOCKED finding remains. The stale prediction in the older autocycle
launch note is informational and does not affect the frozen implementation.
