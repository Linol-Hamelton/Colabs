# DeepSeek (deepseek-flash) - v1.9.5 Certification Results Adjudication

**Date**: 2026-09-19  
**Release candidate**: `bd56d6c` (prompt commit `52e6d31`); working tree contains the four certification reports and their journals, uncommitted  
**Adjudicator**: DeepSeek (deepseek-flash), controller/auditor - non-certifying for this round (authored the specifications and per-item audits)  
**Scope**: triage of the certification inputs, independent reproduction of every claimed finding, dispositions, and the path to the tag  
**Mode**: CERTIFYING (for the adjudication itself)  
**Verdict**: **REMEDIATION REQUIRED before the tag** - four confirmed findings and one package-level defect; no evidence of a release-blocking design flaw beyond them.

---

## 1. Input triage

| Input | Claim | Gate validity | Disposition |
|---|---|---|---|
| **Claude Opus 4.6** (`...claude-opus-v1.9.5-certification.md`) | RECOMMENDATION, 4 findings | `Mode: CERTIFYING`, `Receipt-Owner: claude-opus-0f1b841e5c4c6638` matches its journal; real-repo receipt fresh; clone probe after re-anchor: `completion gate verified` | **The valid certifying review of record.** Its findings are adjudicated below |
| **Gemini 3.8** (`...gemini-v1.9.5-certification.md`) | RECOMMENDATION, same findings | `Mode: ADVISORY` (self-declared implementer conflict) | Advisory supporting review; findings adjudicated below |
| **Qoder** (`...qoder-v1.9.5-certification.md`) | PASS | `Receipt-Owner: qoder-cert` but the journal is `qoder-cert-1125dcc54f075331.md`; gate-check: `journal for Receipt-Owner "qoder-cert" not found` | **Non-gate-valid as submitted**; PASS carries no certifying weight. Repair: correct the header field (or ask Qoder to re-record/re-issue) |
| **Mistral Vibe** (`...mistral-vibe-v1.9.5-certification.md`) | FAIL (one CRITICAL) | `Receipt-Owner: mistral-vibe` vs journal `mistral-vibe-21547c9434f9f020.md`; the report also trips the transcription-marker rejection; gate-check rejects | **Non-gate-valid as submitted.** Its behavior claim is adjudicated in section 3.5 |
| **CodeGeeX / GLM chat output** | FAIL (3 "critical" defects: HTTP TOCTOU, cap integer overflow, MVCC registry desync) | `[MODE: READ-ONLY ADVISORY]`; commands reference an HTTP service, a `cli` binary, `cap_limit` JSON and MVCC that do not exist anywhere in Colabs; no reproduction is possible against this repository | **Rejected: fabricated findings about an imaginary system.** No weight, no remediation |

## 2. Package-level defect found by this adjudication

**AUD-C1 (BLOCKING for the package, not the code).** `validate-protocol.ps1:537` requires the adversarial-review-prompt artifact to match `(?is)(?:unified.{0,80}adversarial|adversarial.{0,80}unified).{0,80}prompt`. `docs/reviews/2026-09-19-final-v1.9.5-adversarial-review-prompt.md` does not contain "unified" anywhere. When `.ai/TASK.md` is set to `Completed` citing this prompt, the validator fails the completion gate before `gate-check` even runs. Reproduced in the clone before the phrase was added; fix: add one sentence to the prompt, e.g. "This is the unified adversarial audit prompt for the v1.9.5 release candidate."

## 3. Finding-by-finding reproduction (clone with the RC code, registry committed)

### 3.1 F-001 - registry immutability is case-insensitive (`validate-protocol.ps1`, positional compare uses `-ne`)
Mutated the committed registry row `| DEC-0001 | accepted |` to `| dec-0001 | ACCEPTED |`; validator output contained no immutability warning (only the unrelated journal-count warning). PowerShell `-ne` is case-insensitive, and PowerShell hashtables used for coverage are case-insensitive too, so case mutations pass. **Confirmed.** Fix: `-cne` for the row compare and case-sensitive id coverage.

### 3.2 F-002 - `gate-check` takes the first `Date:` line anywhere in the file
A review whose first `Date:` line is in an early body/preamble (`Date: 2026-01-01`), followed later by a real header (`Date: 2026-09-25`), with no `Mode` and no `Receipt-Owner` and no journal mention, exits 0 with legacy warnings: `C early-old-date bypass exit 0`. The certifying requirements can be bypassed by a crafted review. **Confirmed.** Fix: parse `Date`/`Mode`/`Verdict`/`Receipt-Owner` only inside the review header region (for example, the text before the first `---` or before the first blank-line-separated body heading), and fail when the header region has no `Date`.

### 3.3 F-003 - PID 4 is treated as a live supervisor
`node -e` probe on Windows: `process.kill(4, 0)` throws `EPERM` (counted as alive) and `isSessionAlive({hostname, pid: 999999999, supervisorPid: 4})` returns `true`, while `start` rejects supervisor PIDs `<= 4`. A forged state with `supervisorPid: 4` pins artifacts indefinitely. **Confirmed.** Fix: apply the same `> 4` bound in the reader.

### 3.4 F-004 - review path citation is a substring match
A journal whose only mention is `docs/reviews/real-sub.md.bak` (a backup, not the review) satisfies the binding: `sub substring gate 0 | completion gate verified: docs/reviews/real-sub.md bound to .ai/worklog/sub-owner.md`. A false-positive binding. **Confirmed.** Fix: boundary-aware matching (path followed by a non-path character: whitespace, backtick, quote, `)`, end-of-line, etc.).

### 3.5 Mistral's CRITICAL - `prune` quarantines an aged empty journal when the state file is missing
Reproduced: `F missing-state aged -> quarantined mistral-case.md`; the contrast case with a state file present and a foreign hostname is preserved: `skipping foreign-case.md (unknown liveness or foreign host)`. The behavior matches the **approved plan** (A1.6 branch 10: "missing state file, empty journal fresh/aged -> preserved/quarantined"), the approved A1 audit (probe rows 6 and 10), and `PROTOCOL.md` ("If the state file is missing or unreadable, the empty journal ... falls back to the recency window; once it is older than RECENT_WINDOW it is quarantined"). What is imprecise is `PROTO-DEC-0029` item 2, which says "`null` preserves" without distinguishing *state present with unknown liveness* from *state absent*. No content is lost (the journal is empty and quarantine is recoverable). **Disposition: not a release defect; a decision-text ambiguity.** Recommended: a short clarifying note in the certification package (or a future decision) stating that `null` spans two cases and only the state-present case preserves. No code change. Mistral's exact repro command also used a non-existent `--agent` flag on `prune`; the behavior itself reproduces.

## 4. Required before the tag (Item 6 remediation)

1. F-001: case-sensitive registry immutability/coverage (`-cne` + case-sensitive lookups) with a negative test (case-mutated row warns).
2. F-002: header-scoped header-field parsing in `gate-check` with tests for an early body `Date:` and a missing header `Date`.
3. F-003: `> 4` supervisor bound in `isSessionAlive` with a unit test.
4. F-004: boundary-aware review-path citation with positive and negative tests (`.bak`, `-draft`, real exact cite).
5. AUD-C1: add the required phrase to the final certification prompt.
6. Re-run all suites; journal + `record` + `verify --deep`; stop for the re-audit. Then a **delta re-certification**: Claude Opus verifies its four findings closed on the fixed RC and records a delta verdict/receipt; the owner gates; freeze and ordered records follow.

## 5. Certification status

- Certifying input on file: Claude Opus (RECOMMENDATION, four findings - all confirmed, none blocking *by design*, but F-001/F-002 weaken the gate and AUD-C1 breaks the package validation, so they must be fixed before the tag).
- Qoder and Mistral reports are not gate-valid as submitted (field/receipt binding); CodeGeeX/GLM output is rejected as fabricated.
- After Item 6 and the delta re-certification, the completion gate can be filled with the final prompt and Claude's (updated) review, and the freeze/record/tag sequence can run.

## 6. References

- Probes: clone `C:\Users\Dmitry\AppData\Local\Temp\kilo\v195probe8\repo` (`probe-cert.cjs`, `probe-fix.cjs`)
- Reports: `docs/reviews/2026-09-19-*-v1.9.5-certification.md`
- Specs: plan revision 2; `PROTO-DEC-0029`..`0033`; `PROTOCOL.md`; `validate-protocol.ps1:537`
