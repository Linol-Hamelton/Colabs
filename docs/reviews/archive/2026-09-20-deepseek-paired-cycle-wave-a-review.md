# Certifying Review: Paired-Cycle Wave A (R1, R2, R3, R4, R7)

Reviewer: DeepSeek (controller, independent reviewer)
Date: 2026-09-20 (UTC)
Reviewed commit: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
Working tree: dirty (uncommitted remediation set)
Mode: CERTIFYING
Receipt-Owner: deepseek-59c81998639a4feb
Scope: Wave A of the PROTO-DEC-0040 remediation: R1, R2, R3, R4, R7; findings F-001, F-003, F-004, F-002, F-008, F-007 of the Codex audit.
Verdict: FAIL

## Verdict

One mandatory finding blocks Wave A acceptance: the new safe-path check in
`validate-protocol.ps1` does not resolve reparse points, so a completion gate can
point through an in-repository junction to prompt/review files outside the repository
root and the installed-role validator still returns exit 0. The Node `gate-check`
rejects the same input via `realpathSync`, so PowerShell and Node disagree on the
security-relevant path rule. Everything else in Wave A reproduced as intended.

## Reproductions

1. **R1 (host edit / missing file) - VERIFIED.** TEMP installed fixture:
   `validate-protocol.ps1 -Quiet` after appending to `.ai/docs/PAIRED-CYCLE.md` ->
   exit 0 (reconciled-document WARN path); after deleting the file -> exit 1
   (`Protocol BROKEN`, missing managed file). Manifest regression test
   `tests/manifest.test.cjs` fails when the managed entry is removed (static check:
   the new assertion pins the exact entry).
2. **R2/R3/R4 (runbook and templates) - VERIFIED by reading.**
   `.ai/docs/PAIRED-CYCLE.md` now: implementer authors and persists the Unified
   Adversarial Audit Prompt in Phase 2 before review; Phase 3 never completes;
   Phase 5 contains the full closure gate; Phase 6 is handoff/stop only; roles are
   examples; Template 3 carries `--deep`, the required CERTIFY header
   (`Reviewer`, `Date`, commit baseline, `Mode: CERTIFYING`, `Receipt-Owner`,
   verdict) and the journal review-path binding; Template 4 uses the exact title
   `Unified Adversarial Audit Prompt`; source `test-protocol.ps1` and host
   `testCommand` are separated; Owner name vs Session id is explained; active
   SessionStart journal reuse is required; quick-vs-full honesty and
   persist-before-record ordering are documented.
3. **R7 (upgrade fidelity) - VERIFIED.** `tests/upgrade.test.cjs` adds real tag
   fixtures: v1.9.4/v1.9.5 plain upgrade restores `PAIRED-CYCLE.md` and rewrites the
   manifest to 1.9.6 but leaves validator exit 1; `-Force` reaches exit 0.
4. **Full regression suite - VERIFIED.** `test-protocol.ps1`: **261/261 pass**
   (255 baseline + 6 new), 0 fail, 117.4 s.
5. **W-A1 (MEDIUM, mandatory) - FAIL.** In a TEMP installed fixture, create a
   directory junction `docs/reviews/link` inside the root pointing outside it, place
   a valid unified prompt and review file in the outside directory, and set the
   completion gate to `docs/reviews/link/prompt.md` / `docs/reviews/link/review.md`.
   Result: `validate-protocol.ps1 -Quiet` -> **exit 0** ("Protocol OK"), i.e. the
   outside artifacts were accepted. `Test-ProtocolSafePath` performs only string
   normalization (`..`, absolute, rooted) and `GetFullPath`, which does not resolve
   reparse points. `isSafeInRoot` in `.ai/bin/protocol-handoff.cjs` does resolve with
   `fs.realpathSync` and would reject the same input, so PS/Node parity is broken on
   the exact criterion the dispatch required ("no traversal/link escape").
   Reproduction probe: `.ai/runtime/wave-a-probe.cjs` (fixture-only, nothing in the
   repository was modified).

## Non-blocking notes

- N-A1 (LOW): the implementer did not run `record --quick` after Wave A writes; its
  journal has no Evidence block. Required again in the remediation round.
- N-A2 (LOW, housekeeping): an untracked `protocol-manifest-temp.json` sits in the
  repository root (created before Wave A); it duplicates the manifest and should be
  removed by its owner or in Wave B housekeeping.
- N-A3 (INFO): validator currently reports 1 warning (37 journals); R8/Wave B scope.

## Required remediation (narrow)

1. `validate-protocol.ps1`: make the safe-path check reject any path whose resolved
   target, or any existing path segment leading to it, is a reparse point
   (junction/symlink) or cannot be resolved; keep the existing `..`, absolute and
   root-escape checks. PowerShell 5.1 compatible, ASCII-only.
2. Keep `.ai/bin/protocol-handoff.cjs` semantics identical (realpath check already
   present); state the parity explicitly in the code comment.
3. Add one regression test that fails before the fix: Windows-only junction escape
   must yield FAIL/exit 1, and a normal owner-selected in-root path must stay PASS.
4. Update the persisted Unified Adversarial Audit Prompt to describe the fixed diff
   and mark W-A1 resolved; run `validate-protocol.ps1` and `test-protocol.ps1`.
5. Run `record --quick` with the implementer owner name after the writes are final;
   keep `.ai/TASK.md` `Status: In progress`; no commit/tag/push.

Re-certification will re-run the probe, the full suite, and the R1/R7 fixture checks
on the updated tree.
