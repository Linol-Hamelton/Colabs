# DeepSeek Flash - H1 installed-role protected set fix review (ADVISORY)

**Date**: 2026-09-28
**Reviewed commit**: d31ebb6 (candidate `606fcc5..d31ebb6`); HEAD is `0c2b36a` (launch file only)
**Working tree**: dirty (untracked session journal `.ai/worklog/deepseek-f1f2471eac81e95a.md` only; no tracked file modified)
**Reviewer**: DeepSeek Flash via kilo (separate session)
**Scope**: [audit | edge-cases | security]
**scope-check**: PASS
**Verdict**: PASS
**Mode**: ADVISORY
**Receipt-Owner**: deepseek-f1f2471eac81e95a
**Receipt**: `.ai/worklog/deepseek-f1f2471eac81e95a.md` (Evidence block via `protocol-handoff.cjs record --quick`)

## Executive Summary

The candidate `606fcc5..d31ebb6` implements PROTO-DEC-0107 item 1 exactly: `loadProtectedSet`
is role-aware, the installed set is `managed` + `.ai/`, `.claude/`, `.codex/`, `source` is
required only for `role=source` (or a legacy manifest with no `role` key), and every contradiction
fails closed with exit 2. The nine new `PROTO-DEC-0107 H1:` tests are red on the pre-fix tool
(7 fail: cases 1,2,3,4,5,7,9) and green now (63/63); the end-to-end probe that failed before now
returns `Verdict: FAIL`, exit 1. No mandatory defect found; no other rule weakened.
This is an ADVISORY review, not a certificate: PROTO-DEC-0107 item 2 names the certifiers.

---

## Scope and Evidence

- **Baseline commit**: `606fcc5`; candidate: `28d13cc` (tests) + `d31ebb6` (fix/spec/prompt/journal).
- **Reviewed diff**: `git diff 606fcc5..d31ebb6` (5 files, 327 insertions, 11 deletions).
- **Commands run by me**:
  - `node --test tests/rulebook.test.cjs` -> 63/63 pass, exit 0 (43.8 s).
  - `powershell -NoProfile -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> exit 0,
    1 pre-existing WARN: 109 session journals (cap 100, PROTO-DEC-0057 WARN-first; not H1).
  - Independent matrix probe (33 cases, old `606fcc5` tool vs candidate tool), temp git fixtures.
  - Pre-fix test-tree proof: `git archive 28d13cc` to a temp dir, `node --test tests/rulebook.test.cjs`.
  - End-to-end: real installer into a fresh temp target, installed tool on a neutral ledger.
- **Not run**: `test-protocol.ps1` (operator ran it: `h1-suite.log`, 432/432, 311.2 s,
  2026-09-28T19:33-19:38Z). Suite log tail re-checked and matches.
- **Environment**: Windows NT 10.0.26200.0; Node v22.21.0; PowerShell 5.1.26100.9444; git 2.53.0.windows.2.

---

## Findings Ledger (PROTO-DEC-0041)

| ID | Requirement | Candidate | Reproduction | Actual Result | Severity | Disposition | Proof of Closure |
|---|---|---|---|---|---|---|---|
| F-001 | Launch note predicts pre-fix green for cases 4 and 5 | `LAUNCH-H1.md:44-45` (vibe launch, not the candidate) | run 28d13cc tests pre-fix | cases 4,5 are red pre-fix, not green | INFO | confirmed | implementer corrected it in the prompt (`2026-09-28-h1-adversarial-prompt.md:85-90`); no candidate change needed |
| F-002 | Review mode wording differs between prompt and launch | `docs/reviews/2026-09-28-h1-adversarial-prompt.md:94` vs `LAUNCH-H1-REVIEW.md:42` | read both | prompt says CERTIFYING; the review launch says ADVISORY and "you certify nothing" | INFO | confirmed | followed the launch file: Mode ADVISORY, not certifying |

No HIGH / MEDIUM / LOW finding. The objective blocking rule is not triggered.

---

## Deep Dives

### 1. Semantics matrix (independent reproduction, 33 cases)

I built minimal temp git fixtures (installed-form manifest + one-row neutral ledger) and ran both
the pre-fix tool (`git show 606fcc5:.ai/bin/protocol-verdict.cjs`) and the candidate tool.
`managed` = the repository's real managed list.

| Case | Manifest | paths | new | old |
|---|---|---|---|---|
| 1 | installed | validate-protocol.ps1 | FAIL/1 | BLOCKED/2 |
| 2 | installed | protocol-manifest.json | FAIL/1 | BLOCKED/2 |
| 3 | installed | .ai/bin/protocol-verdict.cjs | FAIL/1 | BLOCKED/2 |
| 4 | installed | docs/x.md | RECOMMENDATION/0 | BLOCKED/2 |
| 5 | installed | setup-ai-protocol.ps1 (source-only) | RECOMMENDATION/0 | BLOCKED/2 |
| 6a/6b | installed, managed absent / `[]` | docs/x.md | 2 | 2 |
| 7 | installed + `source:[setup-ai-protocol.ps1]` | docs/x.md | 2 | RECOMMENDATION/0 |
| 7b/7c | installed + `source:[]` / `source:null` | docs/x.md | 2 | 2 |
| 8a-8e | role `"host"` / `42` / `null` present / `"Installed"` / `" installed"` | docs/x.md | 2 | 2 |
| 8f-8h | `role:"source"` explicit; missing/empty source | per-case | identical to old | identical |
| E1 | installed + extra keys (`contentDigest`, unknown) | validate-protocol.ps1 | FAIL/1 | BLOCKED/2 |
| E2-E5 | installed non-array managed / non-string entry / blank entry / manifest is array | docs/x.md | 2 | 2 |
| L1-L4 | legacy no-`role` managed+source / missing source / managed path / bad source entry | per-case | identical to old | identical |
| P1 | `__proto__:{role:"installed"}` + legacy source | setup-ai-protocol.ps1 | FAIL/1 | FAIL/1 |
| P2 | installed + `__proto__:{source:[...]}` | setup-ai-protocol.ps1 | RECOMMENDATION/0 | BLOCKED/2 |
| C1-C3 | `.AI/BIN/...`, `./validate-protocol.ps1`, trailing spaces | — | FAIL/1 | BLOCKED/2 |
| C4 | managed synthetic `custom/` (dir prefix) | custom/file.txt | FAIL/1 | BLOCKED/2 |
| C5 | managed synthetic `custom` (whole path) | custom/file.txt | RECOMMENDATION/0 | BLOCKED/2 |

Conclusions: (a) `role=source` and the legacy no-`role` path are byte-for-byte unchanged;
(b) the installed set is exact (`managed` + base prefixes) and excludes `source` entries (case 5);
(c) key presence, not emptiness, is the installed-`source` contradiction (7, 7b, 7c);
(d) unknown roles, non-string roles and case/spacing variants all exit 2;
(e) `managed` validation (non-empty array, non-empty string entries) still applies installed;
(f) prototype-chain tricks cannot smuggle a `source` set or change the role:
`Object.prototype.hasOwnProperty.call` is used for both, so P1 keeps legacy semantics and P2
accepts the installed form with the inherited `source` ignored (case 5 behaviour, RECOMMENDATION
for a source-only path).
All errors surface through the existing `Cannot load protocol-manifest.json at run time: ...`
message and exit 2; no stdout `Verdict:` line is printed on failure.

### 2. Pre-fix red / post-fix green, proven on the real test file

`git archive 28d13cc` (tests commit, fix absent) extracted to a temp dir; the extracted
`.ai/bin/protocol-verdict.cjs` has no `role` token (pre-fix). `node --test tests/rulebook.test.cjs`
there: **63 tests, 56 pass, 7 fail, exit 1**. The failures are exactly cases 1,2,3,4,5,7,9
(subtests 55,56,57,58,59,61,63). Representative assertions:
- case 4 `2 !== 0` (installed form BLOCKs every ledger pre-fix, so an off-protected control cannot
  reach RECOMMENDATION);
- case 7 `0 !== 2` (legacy code ignores `role` and accepts a manifest carrying both arrays);
- case 9 `2 !== 1` (installed tool cannot reach FAIL).
Cases 6 and 8 pass pre-fix (they pin the already-closed form). This confirms the implementer's
account in `2026-09-28-h1-adversarial-prompt.md:85-90` and refutes `LAUNCH-H1.md:44-45` (F-001).
On the candidate tree the same file is green: 63/63.

### 3. End-to-end cross-check (the ADV-001-2 probe)

Fresh temp target, `setup-ai-protocol.ps1 -Target <tmp> -InitGit` exit 0; installed manifest
`role=installed`, `hasSource=false` (no `source` key). One-row neutral ledger, requirement
`CLI check`, paths `validate-protocol.ps1`, disposition `confirmed`, exit 1:
- pre-fix tool: stderr `BLOCKED: Cannot load protocol-manifest.json at run time: source must be a
  non-empty array`, exit **2** (the original defect, reproduced);
- installed (candidate) tool: `Verdict: FAIL`, driving finding touches protected path
  `validate-protocol.ps1`, exit **1**.
Test case 9 performs the same flow and is green.

### 4. Scope and "no other rule weakened"

- `git diff --name-only 606fcc5..d31ebb6` touches only the declared surface:
  `.ai/bin/protocol-verdict.cjs`, `tests/rulebook.test.cjs`,
  `docs/specs/2026-09-23-executable-rulebook-spec.md`,
  `docs/reviews/2026-09-28-h1-adversarial-prompt.md`, plus the implementer journal
  `.ai/worklog/vibe-f33286ea18020944.md`.
- Forbidden files untouched (empty diff): `tests/validator-gate.test.cjs`, `validate-protocol.ps1`,
  `setup-ai-protocol.ps1`, `protocol-manifest.json`, `tests/handoff.test.cjs`.
- The verdict diff is confined to the header comment and `loadProtectedSet`; verdict arithmetic,
  severity exclusion, ledger parsing, path rejection and `--stop-rule` are byte-identical.
- Test diff is `145 insertions / 1 deletion`: the deletion is the `helpers.cjs` import line (adds
  `makeFixture`, `runPowerShell`); all new tests are appended. The pre-existing
  `RC-manifest-schema (C02)` test (`tests/rulebook.test.cjs:979`) is untouched and green.
- Spec diff is `7 insertions / 2 deletions`, confined to the protected-set paragraph; computation
  rules 1-4 untouched.
- Journal size caps respected: prompt 96/150, this report < 250 lines.

### 5. Node validator and self-protection

The installed set still protects `protocol-manifest.json` through `managed` in the installed role
(case 2 -> FAIL/1), so an installed project's manifest cannot be edited without a FAIL. `.ai/`,
`.claude/`, `.codex/` prefixes are unconditional; `tests/` is not in the set.

### 6. Mode conflict (F-002)

`docs/reviews/2026-09-28-h1-adversarial-prompt.md:94` asks the reviewer for `Mode: CERTIFYING`.
The review launch (`LAUNCH-H1-REVIEW.md:3,42`) states this is a DeepSeek fix review in `Mode:
ADVISORY` that "certifies nothing", and PROTO-DEC-0107 item 2 names the two H1 certifiers as
GPT-5.6 Luna and MiMo-V2.6-Pro. I followed the launch: Mode ADVISORY. This PASS is non-certifying
and cannot satisfy the H1 completion gate; a certifier named in PROTO-DEC-0107 item 2 must still
certify.

---

## Alternatives Considered & Trade-offs

- **Keep `source` mandatory and only warn for installed**: rejected by PROTO-DEC-0107 item 1; a WARN
  leaves every host-project verdict run BLOCKED, so a fresh install cannot pass the validator.
- **Accept and silently ignore a present `source` key in installed form**: rejected; it would drop
  the protection recorded in that key, which the requirement forbids. Exit 2 is the fail-closed form.
- **Treat any unknown role as legacy `source`**: rejected by PROTO-DEC-0047 item 8 (unknown input
  exits 2); it would let a typo (`"instaled"`) silently change the protected set.

---

## Recommendations & Actionable Plan

1. No candidate change required.
2. Optional: correct `LAUNCH-H1.md:44-45` to the observed pre-fix red set (1,2,3,4,5,7,9) so the
   launch note and the adversarial prompt agree (F-001). Documentation only; informational.
3. Hand this candidate to the PROTO-DEC-0107 item 2 certifiers; this ADVISORY review is not a
   certificate and does not close H1.

---

## References

- Decision blocks: `PROTO-DEC-0107` item 1 (`.ai/DECISIONS.md:4810`), `PROTO-DEC-0047` item 8
  (`.ai/DECISIONS.md:1982`), PROTO-DEC-0046 item 3, PROTO-DEC-0041 items 1/4.
- Launch files: `LAUNCH-H1-REVIEW.md`, `docs/research/2026-09-28-autocycle/LAUNCH-H1.md`.
- Prompt: `docs/reviews/2026-09-28-h1-adversarial-prompt.md`.
- Spec: `docs/specs/2026-09-23-executable-rulebook-spec.md` (protected-set paragraph).
- Active task: `.ai/TASK.md`; journal: `.ai/worklog/deepseek-f1f2471eac81e95a.md`.
- Operator full suite: `D:\Colabs\.ai\runtime\h1-suite.log` (432/432).
