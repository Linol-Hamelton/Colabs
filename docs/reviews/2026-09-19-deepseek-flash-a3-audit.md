# DeepSeek (deepseek-flash) - Item 4 (A3) Adversarial Audit

**Date**: 2026-09-19  
**Reviewed state**: anchor `3baebed` plus the uncommitted Item 4 changes (`protocol-handoff.cjs`, `validate-protocol.ps1`, `protocol-manifest.json`, `AGENTS.md`, `.ai/docs/PROTOCOL.md`, new `tests/gate.test.cjs`); implementer receipt `verify --deep` exit 0 at handoff  
**Reviewer**: DeepSeek (deepseek-flash), auditor/controller  
**Scope**: Item 4 (A3) `gate-check` implementation, validator integration, tests, decision draft  
**Conflict declaration**: authored the A3 specification; no implementation role; whole-plan certification still requires a different reviewer.  
**Mode**: CERTIFYING  
**Verdict**: **FAIL** - two reproduced blocking defects. Both are fixable in a small remediation round; the rest of the item verifies.

---

## 1. What passes

| Check | Result |
|---|---|
| `node --test tests/gate.test.cjs` | 9/9 pass |
| `node --test tests/validator.test.cjs` | 12/12 pass |
| `powershell .\validate-protocol.ps1` | exit 0, 0 warnings, 29 journals |
| `verify --owner gemini-434bcd8012e0f38c --deep` | exit 0, matches the current tree |
| Refactor fidelity | `checkOwnerReceipt` keeps the exact check order and messages of the old `reportOne` path (format, auth, entry-null, entry hash, parent, chain, digest, failing-check); `verify` regressions pass |
| Binding rule | review path mention + deep receipt, advisory/transcribed rejection, wrong-owner rejection, empty `Receipt` accepted, `In progress` not applicable - all covered and passing |
| Path safety | `docs/reviews/` confinement, `..` rejection, prompt != review |
| No recursion | `gate-check` runs in-process; no subprocess validator call |
| Manifest/docs | `tests/gate.test.cjs` registered; PROTOCOL.md and AGENTS.md updated within scope |

Findings A3-1 and A3-2 are blocking; A3-3..A3-5 are informational.

## 2. A3-1 (BLOCKING) - bootstrap deadlock: a cited owner's receipt can never be refreshed

The validator now runs `gate-check` whenever `Status: Completed`. `record` runs the validator as one of its checks. Therefore, while the task is Completed and the cited owner's receipt is absent or stale, every `record` invocation fails before it can produce the receipt that `gate-check` demands. Reproduced in a clone carrying this implementation:

```
A1 record exit 1        AI protocol: 1 check(s) failed; the evidence records the failure.
A2 re-record exit 1
A3 verify exit 1        .ai\worklog\probe-owner.md evidence matches the tree but records a failing check.
```

Fixture: Completed task citing a review with `Mode: CERTIFYING`, `Receipt-Owner: probe-owner`, a journal entry naming the review path, no Evidence yet. This is exactly the final-certification sequence (freeze, write TASK and reviews, then record); as implemented it can never complete.

Required fix: `protocol-handoff.cjs` must run its internal validator with the completion-gate check suppressed - for example set an environment variable (`PROTOCOL_SKIP_GATE=1`) when spawning the validator and have `validate-protocol.ps1` skip only the `gate-check` step in that mode (all other checks still run and are recorded). The standalone validator after the record pass then enforces the gate against the fresh receipt. Add a regression test: Completed task + cited owner without Evidence -> `record` succeeds green; standalone validator then passes once the receipt exists.

## 3. A3-2 (BLOCKING) - omitted `Date` bypasses the entire certifying requirement

`isNew = reviewDate !== '' && reviewDate > '2026-09-19'`; a missing or unparseable `Date` makes the review legacy regardless of content. Reproduced:

```
B1 omitted-date exit 0
[WARN] legacy review docs/reviews/probe-legacy.md missing Mode: CERTIFYING
[WARN] legacy review docs/reviews/probe-legacy.md missing Receipt-Owner
[WARN] legacy review docs/reviews/probe-legacy.md not mentioned in any journal in .ai/worklog
B2 future-date-no-mode exit 1 | ... is missing Mode: CERTIFYING.
```

A review can therefore omit `Date`, `Mode` and `Receipt-Owner` and - when no journal mentions it - pass with warnings. The gate's stated purpose (binding the citation to a verified receipt) is lost.

Required fix (needs the owner's confirmation because it edits the approved draft wording): treat a missing or unparseable `Date` in the cited independent review as **not legacy** - it must fail with `missing or invalid Date`. Legacy applies only to a present date `<= 2026-09-19`. Add a regression test for the omitted-date and malformed-date cases. Residual (accepted by the plan): a genuine legacy review without `Receipt-Owner` still passes with WARN when no journal mentions it; with the Date fix that grandfathering is bounded to pre-cutoff artifacts.

## 4. Informational

| Id | Finding | Note |
|---|---|---|
| A3-3 | `Mode`/`Verdict` regexes use an optional colon (`Mode:?`), so a line like `Model: X` parses as a malformed Mode and fails with a confusing message; the verdict must be an exact token (`PASS (certifying)` fails) | Tighten to `\bMode\b\s*:` / `\bVerdict\b\s*:` if trivial; otherwise leave |
| A3-4 | Legacy `[WARN]` lines go to stdout of `gate-check` and are not escalated by the validator/CI | By design for grandfathering; note only |
| A3-5 | The `PROTO-DEC-0032` draft cannot be transcribed as-is: heading must be `### PROTO-DEC-0032` (not `##` with a title), `Status: Approved` must be `Accepted`, and the omitted-date clause needs the owner's amendment above | The controller normalizes the format during transcription; the amendment needs the owner's confirmation |

## 5. Required remediation before commit

1. Fix A3-1 (gate suppression during `record`'s internal validator run) with a regression test.
2. Fix A3-2 (missing/invalid Date fails) with regression tests, subject to the owner's confirmation of the amended wording.
3. Optional: apply A3-3.
4. Re-run: gate/handoff/session/validator tests, full suite, validator 0 warnings; journal + `record` + `verify --deep`; stop for the re-audit.

## 6. Owner decision requested

Confirm the amendment: in the cited independent review, a missing or unparseable `Date` fails the gate; legacy handling applies only to a present `Date <= 2026-09-19`. On confirmation the remediation proceeds and `PROTO-DEC-0032` is transcribed in normalized form with this clause.

## 7. References

- Plan revision 2, section 4.A3; `PROTO-DEC-0031`; Item 4 prompt
- Reproductions: clone `C:\Users\Dmitry\AppData\Local\Temp\kilo\v195probe5\repo` (`probe-a3.cjs`)
- Implementer handoff: `.ai/worklog/gemini-434bcd8012e0f38c.md`
