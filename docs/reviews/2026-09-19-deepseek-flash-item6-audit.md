# DeepSeek (deepseek-flash) - Item 6 Remediation Audit

**Date**: 2026-09-19  
**Reviewed state**: v1.9.5 RC `bd56d6c` plus the uncommitted Item 6 remediation (five fixes)  
**Reviewer**: DeepSeek (deepseek-flash), auditor/controller  
**Scope**: F-001 case-sensitive registry checks; F-002 header-scoped gate-check parsing; F-003 PID > 4 bounds; F-004 boundary-aware citation; AUD-C1 prompt phrase  
**Conflict declaration**: authored the remediation prompt and the certification criteria; no implementation role.  
**Mode**: CERTIFYING  
**Verdict**: **PASS** - all five fixes verified independently; ready to commit and to the delta re-certification.

---

## 1. Independent verification

| Check | Result |
|---|---|
| `node --test tests/registry.test.cjs` | 8/8 pass |
| `node --test tests/gate.test.cjs` | 16/16 pass |
| `node --test tests/session.test.cjs` | 33/33 pass |
| `node --test tests/validator.test.cjs` | 12/12 pass |
| `powershell .\test-protocol.ps1` | **241/241 pass**, exit 0 |
| `powershell .\validate-protocol.ps1` | exit 0; **1 warning**: `32 session journals` (process state, see section 3) |
| `verify --owner gemini-434bcd8012e0f38c --deep` | exit 0, matches the current tree |

### Independent probe matrix (fresh clone with the remediation)

| Case | Observed |
|---|---|
| F-001: committed registry row mutated to `dec-0001/ACCEPTED` | exit 0 with three warnings: missing `DEC-0001`, unknown `dec-0001`, immutability `-cne` - case mutation is now caught |
| F-002a: header `Date: 2026-09-25`, body `Date: 2026-01-01` after `---`, no `Mode` | exit 1, `missing Mode: CERTIFYING` (new classification is correct) |
| F-002b: no header `Date`, body `Date: 2026-01-01` after `---` | exit 1, `missing or has an invalid Date` |
| F-003: `isSessionAlive({supervisorPid:4, pid:dead})` / `pid:4` | `false` / `null` (PID 4 is unusable, matching the writer bound) |
| F-004: journal cites only `docs/reviews/real-fix.md.bak` | exit 1, `does not mention independent review docs/reviews/real-fix.md` |
| F-004: exact citation | exit 0, `completion gate verified` |
| AUD-C1 end-to-end: Completed task citing the final prompt + Claude's review | `record` exit 0; `gate-check` exit 0; standalone validator exit 0 with **no FAILs** (only the journal-count warning) |

## 2. Fix review

- **F-001**: `$seen` is now `Dictionary[string,bool](Ordinal)` and `$regIdSet` a `HashSet[string](Ordinal)`; the positional row compare uses `-cne`. All `$seen` call sites remain compatible (`ContainsKey`/indexer).
- **F-002**: the header region is deterministic (before the first `---`, else before the first `## `, else the whole file); all five field regexes are scoped to it. The transcription-marker check remains whole-file, which is intended.
- **F-003**: `checkProcessAlive` requires `pid > 4` and both `isSessionAlive` branches apply the same bound; this matches the original `start` validation (`supPid <= 4` rejected) and the lock's PID checks. Windows PID 4 can no longer pin artifacts.
- **F-004**: the citation match uses an escaped path plus a negative lookahead `(?![A-Za-z0-9._/-])`, so backups, drafts, and subdirectory continuations fail while punctuation/whitespace/end-of-line boundaries pass.
- **AUD-C1**: the prompt carries `This is the unified adversarial audit prompt for the v1.9.5 release candidate.`, which satisfies `validate-protocol.ps1:537`; the end-to-end fixture confirms the basic gate check now passes on a Completed task.

## 3. Notes (non-blocking)

| Id | Note | Action |
|---|---|---|
| I6-1 | The implementer report lists `tests/validator.test.cjs 21/21`; the file has 12 tests and the full suite is 241/241 (the +5 comes from registry 7->8 and gate 12->16). The report's subtotal was a miscount | None; suite is authoritative |
| I6-2 | The repository now has 32 journals, so the validator emits `[WARN] 32 session journals`. The certification round added three journals | Archive at least two unprotected journals (keep-0 + prune + stage) during the pre-freeze step to restore 0 warnings |
| I6-3 | The clone probe produced an `Agent line does not name <owner>` warning for a probe fixture only | Not present in the repository |

## 4. Recommendation

1. Commit Item 6 and push; the RC becomes the commit that contains the remediation.
2. Dispatch Claude Opus for the delta re-certification: re-run its four findings on the fixed HEAD, confirm closure, record a delta review (`Mode: CERTIFYING`, correct `Receipt-Owner`, receipt) - request file: `docs/reviews/2026-09-19-claude-opus-delta-certification-request.md`.
3. Pre-freeze housekeeping: archive two journals to reach the cap; then set `.ai/TASK.md` to `Completed` with the completion gate citing the final prompt and the certifying review; freeze; ordered records; standalone validator; commit and tag decision.

## 5. References

- Adjudication: `docs/reviews/2026-09-19-deepseek-flash-certification-adjudication.md`
- Remediation prompt: `docs/reviews/2026-09-19-gemini-v1.9.5-item6-remediation-prompt.md`
- Probes: clone `C:\Users\Dmitry\AppData\Local\Temp\kilo\v195probe9\repo` (`probe-item6.cjs`)
