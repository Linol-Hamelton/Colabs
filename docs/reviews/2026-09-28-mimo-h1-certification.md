# MiMo-V2.6-Pro - H1 installed-role protected set certification

**Date**: 2026-09-28T20:39:19Z
**Reviewed commit**: 476b488abba8fb5614a81105241e8b806d820d54 (frozen SHA; `git rev-parse HEAD` matches)
**Working tree**: dirty (untracked session journal `.ai/worklog/mimo-bf3aa483e17b17d1.md` only; no tracked file modified)
**Reviewer**: MiMo-V2.6-Pro via mimo (route confirmed from client log)
**Effort**: high
**Usage**: not-exposed
**Scope**: [audit | edge-cases | security]
**scope-check**: PASS
**Verdict**: PASS
**Mode**: CERTIFYING
**Receipt-Owner**: mimo-bf3aa483e17b17d1
**Receipt**: `.ai/worklog/mimo-bf3aa483e17b17d1.md` (Evidence block via `protocol-handoff.cjs record --quick`)

---

## Executive Summary

Full certification of frozen tree `476b488` (branch `h1-installed-protected-set`) against every item of
`docs/reviews/2026-09-28-h1-adversarial-prompt.md`. The H1 defect is reproduced on the pre-fix tool
(`606fcc5`): an installed-form manifest (`role=installed`, no `source` key) makes `loadProtectedSet`
exit 2 with `source must be a non-empty array`, so every host-project verdict run is BLOCKED. The
candidate fix makes the same probe yield `Verdict: FAIL`, exit 1. Nine-case matrix, legacy path,
prototype-chain probes, scope, and the DeepSeek fix-review claims are independently verified. Zero
mandatory defects. Verdict: **PASS**.

---

## Baseline check

- `git rev-parse HEAD` = `476b488abba8fb5614a81105241e8b806d820d54` = frozen SHA (the commit that
  adds `LAUNCH-H1-CERT-MIMO.md`). Confirmed.
- `git diff 606fcc5..HEAD --stat` touches exactly the allowed surface: `.ai/bin/protocol-verdict.cjs`,
  `tests/rulebook.test.cjs`, `docs/specs/2026-09-23-executable-rulebook-spec.md` (protected-set
  paragraph), `docs/reviews/2026-09-28-h1-adversarial-prompt.md`, implementer journal
  `.ai/worklog/vibe-f33286ea18020944.md`, DeepSeek review + journal, and the three launch docs.
  Nothing else. Forbidden files (`tests/validator-gate.test.cjs`, `validate-protocol.ps1`,
  `setup-ai-protocol.ps1`, `protocol-manifest.json`, `tests/handoff.test.cjs`) have empty diff.

---

## Per-item verdicts (adversarial prompt checklist)

| # | Item | Verdict | Evidence |
|---|---|---|---|
| 1 | Semantics 1-3 hold exactly; no third role behavior | PASS | Independent matrix (below); code review of `loadProtectedSet` |
| 2 | Legacy role-less manifests still require `managed` and `source` | PASS | `RC-manifest-schema (C02)` green unmodified; L-legacy probes identical old vs new |
| 3 | `role: "installed"` with `source: []` still exits 2 | PASS | Case 7b: key presence, not emptiness, is the contradiction |
| 4 | `managed` entry validation still applies in installed role | PASS | E-non-string-managed, E-blank-managed -> exit 2 |
| 5 | Prototype-chain tricks cannot smuggle `source` or change role | PASS | P-proto-role keeps legacy semantics; P-proto-source ignores inherited `source` (`hasOwnProperty` on both) |
| 6 | Installed set excludes `source` entries | PASS | Case 5: `setup-ai-protocol.ps1` -> RECOMMENDATION/0 |
| 7 | Manifest still protects itself through `managed` | PASS | Case 2: `protocol-manifest.json` -> FAIL/1 |
| 8 | No other behavior changed | PASS | Verdict diff confined to header comment + `loadProtectedSet`; arithmetic, `--stop-rule`, ledger parsing, path normalisation byte-identical |
| 9 | Spec change confined to protected-set paragraph | PASS | Spec diff: 7 insertions / 2 deletions in one paragraph; computation rules 1-4 untouched |
| 10 | Test file changes add tests only | PASS | 145 insertions / 1 deletion (helpers import line); all new tests appended; `RC-manifest-schema (C02)` at line 979 untouched |
| 11 | Size caps: prompt <= 150, report <= 250 | PASS | Prompt 96 lines; this report <= 250 lines |
| 12 | Pre-fix red set = cases 1,2,3,4,5,7,9 | PASS | `git show 28d13cc` tests on pre-fix tool: subtests 55,56,57,58,59,61,63 fail; 60,62 pass. Matches implementer account; refutes `LAUNCH-H1.md:44-45` |
| 13 | End-to-end installed probe | PASS | Fresh `setup-ai-protocol.ps1` install -> neutral ledger -> `Verdict: FAIL`, exit 1 (candidate); `BLOCKED: ... source must be a non-empty array`, exit 2 (pre-fix) |
| 14 | `node --test tests/rulebook.test.cjs` 63/63 | PASS | 63/63 pass, exit 0, 43.3 s |
| 15 | `validate-protocol.ps1` exit 0 | PASS | Exit 0; 1 pre-existing WARN (110 journals, cap 100) - not H1 |
| 16 | Operator full suite (not re-run per prompt item 3) | PASS (operator) | `h1-suite.log` tail: 432/432, 311.2 s, matches launch claim |

---

## Nine-case matrix (independent reproduction)

Fixtures: temp git repos, installer-form manifest (`role=installed`, `managed` + `integration` + `state`,
no `source` key), one-row neutral ledger. Old = `git show 606fcc5:.ai/bin/protocol-verdict.cjs`.

| Case | Manifest / paths | New (candidate) | Old (pre-fix) | Expected |
|---|---|---|---|---|
| 1 | installed / `validate-protocol.ps1` | FAIL/1 | BLOCKED/2 | FAIL/1 |
| 2 | installed / `protocol-manifest.json` | FAIL/1 | BLOCKED/2 | FAIL/1 |
| 3 | installed / `.ai/bin/protocol-verdict.cjs` | FAIL/1 | BLOCKED/2 | FAIL/1 |
| 4 | installed / `docs/x.md` | RECOMMENDATION/0 | BLOCKED/2 | RECOMMENDATION/0 |
| 5 | installed / `setup-ai-protocol.ps1` (source-only) | RECOMMENDATION/0 | BLOCKED/2 | RECOMMENDATION/0 |
| 6 | installed, `managed` absent or `[]` / `docs/x.md` | BLOCKED/2 | BLOCKED/2 | exit 2 |
| 7 | installed + `source` key present / `docs/x.md` | BLOCKED/2 | RECOMMENDATION/0 | exit 2 |
| 8 | `role: "host"` or `42` / `docs/x.md` | BLOCKED/2 | BLOCKED/2 | exit 2 |
| 9 | end-to-end real installer / `validate-protocol.ps1` | FAIL/1 | BLOCKED/2 | FAIL/1 |

Extended probes (same fixtures): `source: []` / `source: null` in installed form -> exit 2 (7b/7c);
`role: null` / `"Installed"` / `" installed"` -> exit 2 (8c-8e); legacy no-`role` path byte-identical
old vs new (L-legacy-ok/no-source/empty-source/bad-source/managed-path/source-path/off);
`__proto__` smuggle keeps legacy semantics (P-proto-role) or ignores inherited `source` (P-proto-source);
extra manifest keys tolerated; non-array / non-string / blank `managed` -> exit 2; manifest-is-array ->
exit 2; path normalisation (case, `./`, dir prefix vs whole path) unchanged.

---

## DeepSeek fix-review claims (independent verification)

| Claim | Verified | Notes |
|---|---|---|
| Semantics 1-3 exact | Yes | Matrix above |
| Pre-fix red set 1,2,3,4,5,7,9 | Yes | Subtests 55-59,61,63; 60,62 green pre-fix |
| End-to-end probe now FAIL/1 | Yes | Fresh install, real installer |
| Forbidden files untouched | Yes | Empty diff |
| Verdict diff confined to `loadProtectedSet` | Yes | Arithmetic/stop-rule/ledger/path byte-identical |
| Spec confined to protected-set paragraph | Yes | |
| `RC-manifest-schema (C02)` unmodified and green | Yes | Test 42 pass |
| Prototype-chain safe via `hasOwnProperty` | Yes | P1/P2 probes |
| F-001 (launch note wrong about pre-fix green for 4,5) | Confirmed | Not a candidate defect |
| F-002 (mode conflict prompt vs review launch) | Confirmed | DeepSeek correctly used ADVISORY; this review is CERTIFYING per PROTO-DEC-0107 item 2 |

No residual blocking finding from the DeepSeek review.

---

## Reproductions

**H1 defect (pre-fix)**: installed manifest (`role=installed`, `hasSource=false`, `managed` 25 entries),
one-row ledger (`CLI check`, paths `validate-protocol.ps1`, disposition `confirmed`), pre-fix tool
(`606fcc5`): stderr `BLOCKED: Cannot load protocol-manifest.json at run time: source must be a non-empty
array`, exit **2**. No stdout `Verdict:` line.

**H1 fix (candidate)**: same manifest, same ledger, installed tool from real `setup-ai-protocol.ps1`
install: stdout `Verdict: FAIL` with driving finding touching protected path `validate-protocol.ps1`,
exit **1**.

---

## Findings Ledger

| ID | Severity | Disposition | Notes |
|---|---|---|---|
| M-001 | INFO | confirmed | `LAUNCH-H1.md:44-45` predicts wrong pre-fix green set (cases 4,5); implementer corrected in prompt. Documentation only; not a candidate defect. |
| M-002 | INFO | confirmed | Prompt requests `Mode: CERTIFYING` for any reviewer; DeepSeek review launch overrides to ADVISORY. Correctly resolved by each launch. Not a candidate defect. |

No HIGH / MEDIUM / LOW finding. The objective blocking rule is not triggered.

---

## Alternatives Considered & Trade-offs

- **Adopt DeepSeek PASS without re-running**: rejected by the launch ("Verify its claims yourself; do not
  adopt them"). Every material claim was independently reproduced.
- **FAIL for the `LAUNCH-H1.md` prediction error**: rejected; the launch note is outside the candidate
  surface and was already corrected in the adversarial prompt. INFO only.

---

## Recommendations & Actionable Plan

1. No candidate change required.
2. Optional: correct `LAUNCH-H1.md:44-45` to the observed pre-fix red set (1,2,3,4,5,7,9). Documentation
   only.
3. H1 completion gate still requires the second certifier (GPT-5.6 Luna, parallel worktree). This PASS
   is one of the two PROTO-DEC-0041 item 2 slots.

---

## References

- Prompt: `docs/reviews/2026-09-28-h1-adversarial-prompt.md` (96 lines)
- DeepSeek advisory: `docs/reviews/2026-09-28-deepseek-h1-fix-review.md`
- Spec: `docs/specs/2026-09-23-executable-rulebook-spec.md` (protected-set paragraph)
- Decision: `PROTO-DEC-0107` item 1/2; `PROTO-DEC-0047` item 8; `PROTO-DEC-0041` items 1/2/4; `PROTO-DEC-0038`
- Launch: `LAUNCH-H1-CERT-MIMO.md`
- Pre-fix SHA: `606fcc5`; tests-only: `28d13cc`; fix: `d31ebb6`; frozen: `476b488`
- Operator suite: `D:\Colabs\.ai\runtime\h1-suite.log` (432/432, 311.2 s)
- Journal: `.ai/worklog/mimo-bf3aa483e17b17d1.md`
