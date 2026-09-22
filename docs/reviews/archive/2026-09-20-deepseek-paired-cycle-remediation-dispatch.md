# DeepSeek Remediation Dispatch - Paired-Cycle Wave A (R1, R2, R3, R4, R7)

**Date**: 2026-09-20 (UTC)
**Controller / independent reviewer**: DeepSeek (owner `deepseek-59c81998639a4feb`)
**Implementer**: Gemini (start own session and own journal first)
**Launch basis**: `docs/reviews/2026-09-20-deepseek-gemini-paired-cycle-remediation-prompt.md`; `.ai/PLAN.md` items R1-R8; `PROTO-DEC-0040`
**Baseline**: HEAD `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1`, dirty tree. Reproduced at dispatch time: validator exit 0 with 1 warning (journals over cap), `test-protocol.ps1` 255/255, corpus 53 files / 517,199 B, 36 journals.

## Findings this wave must close

- **R1** (Codex F-001, F-007): `.ai/docs/PAIRED-CYCLE.md` is missing from the installed-role reconciliation allowlist, so a host edit is FAIL instead of WARN; no test pins its managed membership.
- **R2** (F-002): Phase 3 permits Completed before the mandatory adversarial review; the runbook has no full core closure path and the prompt author is wrong (controller instead of implementer).
- **R3** (F-003, F-004): Template 4 title fails the completion gate (`Unified Adversarial Audit Prompt` required); `--deep` missing; CERTIFY template lacks the output header and journal binding; source vs host test commands are conflated.
- **R4** (F-008): artifact/receipt ordering; quick-vs-full honesty; excluded journals/runtime vs tracked artifacts.
- **R7** (B/G/H): roles must be examples, not assignments; host owner selects the review path; no source-only prerequisites in managed docs; upgrade guidance must match measured behavior.

## R5 contract (authored now; Wave B implements it; not part of Wave A)

Conservative risk-scaled completion inside the existing checks (no new gate, service or classifier):

1. Default is the strict path. Missing, unparseable, unknown or misleading scope keeps the strict requirement.
2. Light path is declared in `## Completion gate` as `- Scope: docs` (or `- Scope: config`, allowlist only: `.gitattributes`, `.gitignore`, `.editorconfig`) plus `- Independent review: <path>`; no adversarial counterpart is required.
3. Light-path validity requires all of: the review path resolves inside the repository root (no absolute path, no `..`, no reparse/link escape) and exists non-empty; the review has `Reviewer:` and `Verdict: PASS|RECOMMENDATION`; `ADVISORY` never satisfies it.
4. Changed-path containment: the changed path set (git `diff --name-only HEAD` plus untracked files, excluding `.ai/worklog/**` and `.ai/runtime/**`) is non-empty and entirely inside the declared scope. `docs` means `docs/**` except `docs/decisions/**`; anything under `.ai/**`, `AGENTS.md`, `QUICKSTART.md`, `validate-protocol.ps1`, `.ai/bin/**`, `setup-ai-protocol.ps1`, `test-protocol.ps1`, `tests/**`, `.github/**`, `protocol-manifest.json` forces the strict path.
5. Git unavailable, not a repository, or an empty changed set: strict path.
6. Strict path semantics are unchanged: prompt file must carry the unified marker; review must have `Reviewer`, `Date`, `Mode: CERTIFYING`, `Receipt-Owner`, verdict `PASS|RECOMMENDATION`.
7. Parity between `validate-protocol.ps1` and `protocol-handoff.cjs` gate-check; the installed role relies on the PowerShell validator.
8. Required tests: positive docs-only light path; negative core file under `Scope: docs`; unknown scope; traversal path; advisory review in the light path; missing review file.

Wave A must leave the strict path exactly as it is today; only the R7 path-location relaxation below applies to both paths.

## Wave A tasks (bounded)

1. **R1**: add `.ai/docs/PAIRED-CYCLE.md` to `$docDigests` in `validate-protocol.ps1` (host edit becomes WARN; a missing file remains FAIL through the managed machinery). Add one regression test that fails when the manifest `managed` entry is removed. Do not pin version numbers in tests; cover real installed fixtures.
2. **R2**: rewrite the phases/roles/diagram/closure criteria in `.ai/docs/PAIRED-CYCLE.md`: the implementer authors and persists the unified adversarial prompt before the independent CERTIFYING review; no Completed before the full core review plus gate; Phase 6 is a handoff/stop point, never completion; removal of prompt-first authoring is forbidden. Roles are examples; never auto-assign.
3. **R3**: in all four templates: exact title `Unified Adversarial Audit Prompt`; `verify --deep`; CERTIFY output header requirements (`Reviewer`, `Date`, commit/tree baseline, `Mode: CERTIFYING`, `Receipt-Owner`, verdict) and the journal entry must name the review path; explain Owner name vs Session id; reuse an active SessionStart journal instead of starting a second one; state the source test command (`test-protocol.ps1`) separately from a host `testCommand`; filled templates must pass the existing checks.
4. **R4**: document and template the correct ordering: persist prompt, review, TASK and archival moves before the final `record`; verify the producer receipt before consumer edits; re-record each owner on the same final tree; journals and `.ai/runtime` are excluded from the tree digest, tracked artifacts are not; `--quick` is validator-only and never substitutes for a full suite; final core receipts use full `record`.
5. **R7**: replace default-assignment wording with examples; for installed hosts the owner selects an in-repository review path (path checks: inside root, no traversal/escape) — relax the hardcoded `docs/reviews/` prefix to those safe path rules in both the validator and the Node gate-check; remove any source-only prerequisite from managed docs; upgrade guidance must match measurement: an ordinary install restores `PAIRED-CYCLE.md` and updates the manifest to 1.9.6 but leaves older managed tooling (version mismatch), while `-Force` brings full parity; document this existing limitation without rewriting the installer. Exercise v1.9.4 and v1.9.5 fixtures plus a fresh install with the existing test helpers.
6. **Tests**: add the targeted regressions from R1 and the path rules; do not multiply version pins or build a prompt-testing system; keep coverage meaningfully above the current baseline.
7. **Evidence**: implementation note inside the implementer journal; persist the unified adversarial prompt at `docs/reviews/2026-09-20-gemini-paired-cycle-remediation-adversarial-prompt.md` (<= 150 lines) covering R1-R8 plus the actual diff; TASK stays `In progress`; no commit, tag or push; reserve corpus room (do not create extra review files); record with `--quick` only after all Wave A writes are final; release the lock.

Wave B (R5, R8) is dispatched after the controller certifies Wave A; do not implement it now.

## Verification the controller will reproduce

- Validator exit 0 at Wave A scope (journal warning is R8 and stays visible until Wave B); `test-protocol.ps1` green with new tests included.
- Host-edit WARN and missing-file FAIL in a TEMP installed fixture; manifest-entry-removal test fails.
- Filled templates pass the strict checks; path rules reject traversal and accept an owner-selected in-root path.
- Diff stays inside the allowed surface: `.ai/docs/PAIRED-CYCLE.md`, `.ai/docs/PROTOCOL.md`, `AGENTS.md`, `QUICKSTART.md`, `validate-protocol.ps1`, narrow `protocol-handoff.cjs` path checks, existing tests/fixtures; `protocol-manifest.json` only if registration requires it.
