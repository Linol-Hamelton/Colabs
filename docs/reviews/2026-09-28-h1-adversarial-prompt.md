# Unified adversarial audit prompt - task H1 (installed-role protected set; PROTO-DEC-0107 item 1)

Reviewer: independent certifier (one of the two PROTO-DEC-0107 H1 certifiers, outside
execution and control per PROTO-DEC-0041 item 1).
Mode: this is the prompt half of the prompt+report pair required by PROTO-DEC-0038
item 1. Produce an explicit verdict: PASS / FAIL / BLOCKED / RECOMMENDATION, with a
reproduction per claim for any FAIL or BLOCKED finding.

## Baseline

- Repository/branch: `.ai/runtime/h1`, branch `h1-installed-protected-set`, cut from
  the `v2.0.0` commit `606fcc5` (H1 launch file).
- Audit range: `git diff 606fcc5..HEAD`, plus any uncommitted tree state you observe.
- Allowed surface (nothing else may have changed; verify with
  `git diff --stat 606fcc5..HEAD`):
  - `.ai/bin/protocol-verdict.cjs`
  - `tests/rulebook.test.cjs`
  - `docs/specs/2026-09-23-executable-rulebook-spec.md` (only the protected-set paragraph)
  - `docs/reviews/2026-09-28-h1-adversarial-prompt.md` (this file)
  - `.ai/worklog/**` (the implementer's journal)
- Forbidden by the launch file: `tests/validator-gate.test.cjs`,
  `validate-protocol.ps1`, `setup-ai-protocol.ps1`, `protocol-manifest.json`.

## What was implemented (PROTO-DEC-0107 item 1, ADV-002-3)

`loadProtectedSet` in `.ai/bin/protocol-verdict.cjs` now reads the manifest role:

1. `role` = `"source"` OR the key is absent (legacy) -> unchanged: `managed` and
   `source` both mandatory and non-empty; both contribute to the protected set.
2. `role` = `"installed"` -> protected set = `managed` + `.ai/`, `.claude/`, `.codex/`.
   `managed` must be present and non-empty. A present `source` key -> exit 2
   (the form contradicts `setup-ai-protocol.ps1` Prepare-ManifestWrite; silently
   dropping protection is forbidden).
3. Any other `role` value (not a string, `"host"`, `42`, `null`, ...) -> exit 2.

All failures exit 2 through the existing `Cannot load protocol-manifest.json at run
time: ...` messages. No other check was touched: verdict arithmetic, severity
exclusion, ledger parsing, path rejection and `--stop-rule` are unchanged.

## Reproduction (defect being fixed; ADV-001-2 probe, verbatim)

In a fresh temp install (`setup-ai-protocol.ps1 -Target ...\probe-fc01-install
-InitGit`), the installed `.ai/bin/protocol-verdict.cjs` on a one-row ledger
(requirement `CLI check`, paths `validate-protocol.ps1`, disposition confirmed,
exit 1) printed nothing to stdout, wrote to stderr `BLOCKED: Cannot load
protocol-manifest.json at run time: source must be a non-empty array`, and exited 2;
the installed manifest is `role=installed`, `hasSource=false`.

## Required checks (run them yourself; do not trust this prompt)

1. `node --test tests/rulebook.test.cjs` -> 63/63 pass, exit 0. The nine new tests
   are prefixed `PROTO-DEC-0107 H1:` (matrix cases 1-9, ADV-002-4).
2. `powershell -ExecutionPolicy Bypass -File validate-protocol.ps1` -> exit 0
   (a pre-existing WARN about journal count is not H1's finding).
3. Do NOT run the full suite (`test-protocol.ps1`); the operator runs it in a quiet
   window.
4. Re-run the probe above in a fresh temp folder with the real installer and the
   now-installed `protocol-verdict.cjs`: same ledger must yield `Verdict: FAIL`,
   exit 1 (covered end-to-end by H1 test case 9; reproduce it once independently).

## Audit checklist (adversarial; hunt, do not confirm)

- Semantics 1-3 above hold exactly; no third role behavior, no silent acceptance.
- Legacy role-less manifests still require `managed` and `source` (existing tests:
  `RC-manifest-schema (C02)` at tests/rulebook.test.cjs:979 must stay green
  unmodified; `tests/handoff.test.cjs` legacy-manifest test untouched).
- `role: "installed"` with a `source: []` key still exits 2 (key presence, not
  emptiness, is the contradiction).
- `managed` entry validation (non-empty strings) still applies in the installed role.
- Prototype-chain tricks: a manifest with `__proto__`-crafted keys cannot smuggle a
  `source` set or change the role; `Object.prototype.hasOwnProperty.call` is used
  for both role and source presence.
- The installed set really excludes `source` entries: `setup-ai-protocol.ps1` in a
  host project yields RECOMMENDATION, not FAIL (test case 5).
- The manifest still protects itself through `managed` in the installed role (test
   case 2: `protocol-manifest.json` -> FAIL).
- No other behavior changed: `git diff 606fcc5..HEAD -- .ai/bin/protocol-verdict.cjs`
  contains only role-aware protected-set logic; verdict arithmetic, `--stop-rule`,
  ledger parsing and path normalisation are byte-identical otherwise.
- The spec change is confined to the protected-set paragraph; computation rules
  1-4 are untouched.
- The test file changes add tests only; no existing test was edited or weakened.
- Size caps: this prompt <= 150 lines; your report <= 250 lines (PROTO-DEC-0038
  item 3).
- Scope: the implementer recorded that pre-fix the red set was cases 1, 2, 3, 4, 5,
  7 and 9 (the launch note predicted 1, 2, 3, 5, 9: case 4 cannot pass pre-fix
  because an installed-form manifest BLOCKs every ledger, and case 7 returns 0
  pre-fix because the legacy code ignores `role` and accepts a manifest that carries
  both arrays). Verify that account against the tests commit `28d13cc` (tests only,
  fix absent) if you check out that commit.

## Output

A report file under `docs/reviews/` (owner-selected path), `Mode: CERTIFYING`,
`Receipt-Owner: <your session owner name>`, verdict PASS or RECOMMENDATION to
certify, FAIL/BLOCKED with one reproduction per claim otherwise.
