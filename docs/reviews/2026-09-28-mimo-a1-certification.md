# MiMo-V2.6-Pro - A-1 frozen-candidate certification

**Date**: 2026-09-28 (UTC)
**Reviewed commit**: `8b74e4190be5b382eaed46b74f5755924dfab148` (branch `a1-installed-advisory`)
**Working tree**: dirty (this certifier's journal and this report; no candidate file uncommitted)
**Reviewer**: MiMo-V2.6-Pro, route `xiaomi` provider, model id `mimo-v2.6-pro` (confirmed from client log `C:\Users\Dmitry\.local\share\mimocode\log\2026-09-28T200211080Z-main-7604-e3a2a86e.active.log`: `providerID=xiaomi modelID=mimo-v2.6-pro`; launch `--variant high`). Client usage/effort JSON: `not-exposed` in this harness.
**Scope**: full certification of the frozen tree (A-1 completion-gate fix)
**scope-check**: PASS
**Verdict**: RECOMMENDATION
**Mode**: CERTIFYING
**Receipt-Owner**: mimo-d473022df037297a

Authority: `LAUNCH-A1-CERT-MIMO.md`, `docs/reviews/2026-09-28-a1-adversarial-prompt.md` (PROTO-DEC-0087 item 4, PROTO-DEC-0105 item 2, PROTO-DEC-0041 item 2, PROTO-DEC-0038 item 1). Independence: outside execution and control of the candidate; did not read the parallel Sol certifier's artifacts before this file.

---

## Executive Summary

The A-1 defect is fixed on the frozen tree. Both validator review parsers refuse an advisory Mode value and the advisory-mode bracket marker in both roles and on both paths. Test-first reproduces: at `6f44903` the two A-1 tests fail with their case lists (8 and 4 escapes); at `8b74e41` they pass 4/4. Parity is complete (4/4 role-path-form combos refuse both forms). No subset gap and no certifying review in `docs/reviews/` is newly refused. Residual escapes (marker split across a newline, table-cell and exotic-prefix forms, missing or non-ADVISORY Mode values) are the pre-existing R2/R3 blacklist limitation and are not introduced by A-1; none blocks merge of this candidate. Verdict: **RECOMMENDATION** (whitelist follow-up recommended).

---

## Baseline and Binding

- Frozen SHA `8b74e4190be5b382eaed46b74f5755924dfab148` equals `git rev-parse HEAD`.
- `git diff 74b46ff..HEAD --stat` names exactly 9 paths: `validate-protocol.ps1`, `tests/validator-gate.test.cjs`, `docs/reviews/2026-09-28-a1-adversarial-prompt.md`, `docs/reviews/2026-09-28-deepseek-a1-fix-review.md`, `.ai/worklog/claude-0ff8b28052330de0.md`, `.ai/worklog/deepseek-7673879ed0e8fc01.md`, `LAUNCH-A1-CERT-MIMO.md`, `LAUNCH-A1-CERT-SOL.md`, `LAUNCH-A1-REVIEW.md`. Matches the launch baseline check (candidate code + prompt + journal + review + launch docs). `.ai/bin/protocol-handoff.cjs` is untouched.
- Code delta is one helper (`Get-ProtocolAdvisoryReason`) plus two call sites; Reviewer/Verdict/transcription rules unchanged.
- `validate-protocol.ps1` is ASCII-only (0 bytes > 127). Full diff of the two code files read.
- Environment: Windows 10.0.19045, Node.js v22.21.0, PowerShell 5.1.

---

## Per-item verdicts

| # | Required check | Verdict | Evidence |
|---|---|---|---|
| 1 | Scope (`git diff --stat`, full code diff read) | PASS | 9 named paths only; code diff read in full |
| 2 | Test-first at `6f44903` vs candidate | PASS | pre-fix 2/4 fail (8 + 4 escapes listed); candidate 4/4 pass |
| 3 | Targeted families (`validator-gate`, `validator-lightpath`, `gate`, `validator`) | PASS | 4/4, 14/14, 34/34, 13/13 |
| 4 | `validate-protocol.ps1` exit 0 | PASS | exit 0; 1 pre-existing WARN (journals > cap) |
| 5 | `protocol-handoff.cjs verify --owner claude-0ff8b28052330de0 --deep` | PASS (expected stale) | exit 1 stale vs current tree; matches DeepSeek F-009; certifiers record own |
| 6 | Parity matrix on a fresh fixture | PASS | 4/4 combos refuse both forms; installed CERTIFYING control accepts |
| 7 | Own probes from the attack list | PASS (with residuals) | see probes and closure table |
| Op | Operator evidence (`a1-suite.log`) | PASS | 425/425, 304479 ms, `validate-protocol.ps1` exit 0 |
| **Whole candidate** | | **RECOMMENDATION** | |

---

## Commands executed (this session)

- `git rev-parse HEAD`; `git diff 74b46ff..HEAD --stat` / `--name-only`; full code diff read
- `git archive --format=tar -o <tmp>.tar 6f44903` + extract (pre-fix tree; `git worktree add` blocked in this checkout)
- Pre-fix: `node --test tests/validator-gate.test.cjs` at `6f44903` -> `# pass 2 # fail 2`
- Candidate: `node --test tests/validator-gate.test.cjs` -> `# pass 4 # fail 0` (125.6 s)
- `node --test tests/validator-lightpath.test.cjs tests/gate.test.cjs tests/validator.test.cjs` -> 61/61
- `powershell -ExecutionPolicy Bypass -File validate-protocol.ps1` -> exit 0, 1 WARN
- `node .ai/bin/protocol-handoff.cjs verify --owner claude-0ff8b28052330de0 --deep` -> exit 1 stale
- Parity + attack probe (`tests/helpers.cjs` fixture, both roles x both paths x both forms + 18 header variants + 5 hostile-cost cases)
- Corpus header scan of 117 `docs/reviews/*.md`
- ASCII check on `validate-protocol.ps1`; Node `gate-check` Mode compare read at `protocol-handoff.cjs:1146` and `:1244`

---

## 1. Scope (check 1) - PASS

`git diff --stat 74b46ff 8b74e41` shows 749 insertions / 6 deletions across the 9 launch-named paths. No other path appears. The two code files hold the A-1 helper and tests; the remaining seven are prompt, fix review, two journals and three launch docs. `protocol-handoff.cjs` (gate-check) is untouched on purpose; its source-role call remains guarded.

---

## 2. Test-first (check 2) - PASS

Pre-fix tree at `6f44903` (validator identical to `74b46ff`; tests hold the A-1 regressions):

- `not ok 3` escapes (8): `installed/strict` both forms, `installed/light` both forms, `source/strict` both forms (exit 1 via gate-check, not the validator), `source/light` both forms.
- `not ok 4` escapes (4): list-prefixed lowercase Mode, bold Mode, two Mode lines, quote-bracket Mode.

Candidate `8b74e41`: 4/4 pass. Controls are non-vacuous (same fixture with a certifying Mode accepts in the installed role; the filled review template with header comments kept accepts).

---

## 3. Targeted families (check 3) - PASS

| Suite | Result |
|---|---|
| `tests/validator-gate.test.cjs` | 4/4 |
| `tests/validator-lightpath.test.cjs` | 14/14 |
| `tests/gate.test.cjs` | 34/34 |
| `tests/validator.test.cjs` | 13/13 |

No regression in the light-path, gate-check or general validator families. Full 425-test suite is the operator's quiet window (LAUNCH-A1); the log `D:\Colabs\.ai\runtime\a1-suite.log` reports 425/425 in 304479 ms.

---

## 4. Validator (check 4) - PASS

`validate-protocol.ps1` exit 0. One WARN: 109 session journals vs cap 100 (predates A-1). ASCII-only confirmed (0 non-ASCII bytes). Header-region contract unchanged (text before the first `---` line, else before the first `## `, else the whole file); body never read.

---

## 5. Executor evidence (check 5) - PASS (expected stale)

`protocol-handoff.cjs verify --owner claude-0ff8b28052330de0 --deep` exits 1 (recorded digest vs current tree). This matches DeepSeek F-009 and the launch: the freeze commits after the executor recorded, so its receipt is stale by design. This certifier records its own evidence.

---

## 6. Parity matrix (check 6) - PASS

Fresh fixture via `tests/helpers.cjs`; role committed into the baseline; one docs change for the light path. Exit codes at `8b74e41`:

| role / path / form | result |
|---|---|
| installed / strict / Mode value naming ADVISORY | refuse (exit 1, advisory reason) |
| installed / strict / bracket marker | refuse (exit 1, advisory reason) |
| installed / light / either form | refuse (exit 1, advisory reason) |
| source / strict / either form | refuse (exit 1, advisory reason; gate-check also present) |
| source / light / either form | refuse (exit 1, advisory reason) |
| installed / strict / control certifying Mode | accept (exit 0) |
| source / strict / control certifying Mode | exit 1 (gate-check requires a verifying receipt; not a candidate defect) |

Both roles refuse both forms on both paths. Pre-fix accepted both forms on every installed path and on the source light path.

---

## 7. Attack probes (check 7)

### Must-refuse (all refused)

Canonical Mode value; canonical bracket marker; list-prefixed lowercase Mode with prose; bold Mode; two Mode lines (certifying then advisory); quote-bracket Mode; the three-line swallow case (`- Mode:` / `Mode:` / `ADVISORY`).

### False positives (all accepted)

Filled `templates/reviews/REVIEW.md` with header comments kept; certifying review quoting both forbidden forms below its first `---`; list / bold / quote certifying Mode lines.

### Subset (both refused)

Exact `Mode: ADVISORY` and `Mode:` + spaces + `ADVISORY`. The new Rule 1 is a strict superset of the old exact compare; no header the old rule refused is now accepted (corpus subset scan: 0 of 117).

### Header region (all refused)

CRLF line endings; no `---` terminator (header = whole file); the three-line swallow case. Line-0 `---` empty-header case remains covered by the existing F-5 test (fails missing Reviewer).

### Cost (all complete, exit 0)

| hostile header | ms |
|---|---|
| baseline certifying | 2419 |
| 50k unclosed HTML comment opens | 7011 |
| 33k marker prefixes | 2602 |
| 200k `*` | 2510 |
| 33k Mode lines | 2746 |

Bounded quantifiers hold; no super-linear blowup. The 50k-comment case is the comment-strip bound (4000 chars), about 3x baseline, still linear-ish and well under any timeout.

### Corpus (117 `docs/reviews/*.md`)

30 refused, every one a review or prompt that itself declares an advisory Mode or carries the marker in its header. 20 headers name a certifying Mode; 18 of those accept; the 2 marked refused are prompts that quote the marker in the header (correct refusal). No real certifying review is newly refused.

---

## Closure table: DeepSeek residuals and known R1-R4

Independent reproduction. Disposition is for this candidate only.

| ID | Claim | My reproduction | Blocks A-1? | Disposition |
|---|---|---|---|---|
| F-005 / R3 | Marker split across a newline still certifies | ACCEPTED (installed strict) | No | Confirmed residual. Pre-existing class: the marker is matched in its one-line form. Hiding it is no stronger than omitting it (R2). Outside A-1's allowed files. Whitelist follow-up. |
| F-006 / R3 | Table-cell Mode declaration escapes | ACCEPTED (`| Mode | ... |`) | No | Confirmed residual. Same R2/R3 class. Whitelist follow-up. |
| F-007 / R3 | Exotic prefixes (hash Mode, fullwidth colon/brackets, zero-width, gap >80) | ACCEPTED (5/5 forms) | No | Confirmed residual. Deliberate malformation required. Whitelist follow-up. |
| F-008 | Long HTML comment or fenced quote of the marker in the header is refused | REFUSED (comment >4000 chars) | No | Confirmed residual false-positive direction. No corpus certifying review hit. Unusual header required. Hardening recommended. |
| R2 | Installed role requires neither certifying Mode nor Receipt-Owner | ACCEPTED (no Mode line; `SHADOW-CERTIFYING`; `READ-ONLY`) | No | Confirmed pre-existing. A-1 is a blacklist by design; a whitelist closes R2 together with F-005..F-008. |
| R1 | Node gate-check still exact-compares Mode and never reads the marker | Confirmed by source read (`protocol-handoff.cjs:1146`, `:1244`) | No | Pre-existing. The validator now fails first on the same tree. Standalone gate-check remains weaker. Outside A-1's allowed files. |
| R4 | `PAIRED-CYCLE.md:349` says the Mode is rejected anywhere in the file; engines read only the header | Confirmed (`PAIRED-CYCLE.md:349`) | No | Pre-existing doc/engine drift. Outside A-1's allowed files. |
| F-009 | Executor receipt stale after freeze | Confirmed (verify exit 1) | No | Expected. Certifiers record their own. |
| F-010 | Launch cites a decision block that does not exist | Confirmed (newest is 0106) | No | Operator typo class. No impact. |
| F-011 | No new validator warning | Confirmed (1 pre-existing journal WARN) | No | Environmental. |

No residual reintroduces the A-1 defect (an honest advisory declaration satisfying the completion gate) and none is a regression versus `74b46ff`. None blocks merge of this candidate.

---

## Per-item verdicts (attack list)

| Attack | Verdict |
|---|---|
| 1 False negatives | PASS for canonical forms; residuals F-005..F-007 / R2 confirmed, non-blocking |
| 2 False positives | PASS (template, PAIRED-style certifying, 18/20 corpus certifying headers) |
| 3 Subset | PASS (0 of 117) |
| 4 Header region | PASS |
| 5 Culture and case | PASS (IgnoreCase + CultureInvariant + ToUpperInvariant; no Turkish-I trap in the ADVISORY token) |
| 6 Cost | PASS (bounded quantifiers; hostile headers complete) |
| 7 PowerShell 5.1 | PASS (string enum cast, `foreach` + `return`, `-f` with braces in the value, empty header short-circuit, no caller-variable shadowing) |
| 8 Test validity | PASS (controls non-vacuous; `a1NotRefused` rejects light-path fallback; fixtures fresh per case) |
| 9 Parity | PASS (no role/path/form disagreement) |

---

## Verdict rationale

**RECOMMENDATION**. The reported A-1 defect is closed on the frozen tree with test-first proof, full parity and no subset gap or certifying-corpus false positive. The residual escapes are the pre-existing blacklist limitation the prompt itself records as outside A-1's allowed files; independently confirmed, none blocks merge. Optional hardening (whitelist: require a certifying Mode and Receipt-Owner in both roles, and extend the marker match across line breaks) should be an owner-decision follow-up and would close F-005..F-008, R1, R2 and R4 together.

---

## References

- Candidate: `74b46ff..8b74e41`; fix commit `7e51b89`; test commit `6f44903`.
- Adversarial prompt: `docs/reviews/2026-09-28-a1-adversarial-prompt.md`.
- DeepSeek fix review (independently verified, not adopted): `docs/reviews/2026-09-28-deepseek-a1-fix-review.md`.
- Launch: `LAUNCH-A1-CERT-MIMO.md` (PROTO-DEC-0105 item 2 one-round pair).
- Executor journal: `.ai/worklog/claude-0ff8b28052330de0.md`.
- This session journal: `.ai/worklog/mimo-d473022df037297a.md`.
