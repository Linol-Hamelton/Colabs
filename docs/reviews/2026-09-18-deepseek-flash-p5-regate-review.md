# DeepSeek (deepseek-flash) - Re-Gate Review of P-5 (P5-F1 fix and the archive-boundary hash change)

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5 (a6a6d61)  
**Working tree**: dirty  
**Reviewer**: DeepSeek (model `deepseek/deepseek-flash`, session `deepseek-flash-ebd6eb9397ed3784`)  
**Scope**: documentation correction | out-of-plan hash change | batch boundary  
**Verdict**: PASS conditional on P5-F2 (one regression test) before the release tag  

> Read with `docs/reviews/2026-09-18-deepseek-flash-p5-gate-review.md` (original
> findings). No implementation files were modified by the reviewer.

---

## 1. P5-F1 - fixed

- `docs/reviews/2026-09-18-multi-model-consensus-refutation.md:49` now reads
  "Lock liveness accepts own PID, parent PPID, or a registered PID presented with
  matching session token; system PIDs (<= 4) and unaffiliated live PIDs are
  rejected".
- Line 70 now reads "The session token is an anti-accident barrier; local
  filesystem access is not defended (DEC-0016)".
- Both statements now match `QUICKSTART.md:62` and `.ai/docs/PROTOCOL.md:68-75`
  and no longer overstate the security property.

## 2. Out-of-plan change to `canonicalEntryBody` - reviewed and accepted as a bug fix

The implementer additionally changed the shared canonicalization to strip trailing
archive provenance headers:
`body.replace(/(?:\s*\n-{3,}[ \t]*|\s*\n### From [^\r\n]+)*\s*$/, '')`
(`protocol-hooks.cjs`), with the matching cleanup in `protocol-handoff.cjs:195`.
This was not in the frozen plan, so it was verified independently before acceptance.

**Evidence that it fixes a real defect and invalidates nothing:**

| Measurement over the real `.ai/ARCHIVE.md` | Result |
|---|---|
| Sections carrying `### From` provenance headers | 16 |
| Records valid under old canonicalization | 17 |
| Records valid under the new canonicalization | 18 |
| Records valid under new but not old | 1 (`2104e1a8`) - the batch-boundary record |
| Records valid under old but not new | 0 |
| Records invalid under both | 0 |

**Second-batch fixture** (two journals, each recorded then archived into the same
`ARCHIVE.md`): 2 labeled sections, 0 hash mismatches, the boundary section that
carries the trailing `### From` header is valid, `verify --deep` for the second
journal exits 0, `doctor` exits 0.

Without the change, the boundary record's computed body includes the next batch's
header and fails as tampered. With it, the hash is stable. No existing receipt is
invalidated, and the rejected A-2 option (excluding `- sanitized:`) was not
reintroduced.

**Security note**: a trailing `### From ...` line is now outside the hashed body.
Only that terminal line is affected; all claims (body, Evidence, exit codes,
digest, parent link) remain hashed, and trailing separators were already excluded.
Cosmetic risk only, recorded here for the threat model.

## 3. Required before the tag

- **P5-F2 [LOW/regression]**: add a dedicated second-batch boundary test. Existing
  tests archive only one batch, so the exact defect just fixed is not covered. The
  test should archive a second batch into an existing `ARCHIVE.md` and assert that
  the boundary section's computed hash equals its `- entry:` label and that
  `verify --deep` stays green. My fixture probe above can be lifted directly.
- No code change is otherwise required for P-5.

## 4. Verification runs

| Check | Result |
|---|---|
| `validate-protocol.ps1` | exit 0, 0 warnings |
| `node .ai/bin/protocol.cjs doctor` | exit 0, Healthy (25 legacy WARN) |
| `test-protocol.ps1` | **199/199** |
| Old-vs-new canonicalization sweep | 17 both, 1 new-only, 0 old-only |
| Second-batch boundary fixture | 0 mismatches, deep verify 0, doctor 0 |

The reviewer's own receipt is stale after these edits and is refreshed with this
review.

## 5. Gate decision

- **P-5: PASS**, conditional on P5-F2 (regression test) before the v1.9.4 tag.
- **P-6 may start** with the unchanged preconditions: the owner must author or
  approve `PROTO-DEC-0028` (still absent from `.ai/DECISIONS.md`), the final
  Mandatory Adversarial Review and Completion gate are required before
  `Status: Completed`, and consumer sync runs `-Force` then `-Verify` as separate
  commands.

---

## References

- `docs/reviews/2026-09-18-deepseek-flash-p5-gate-review.md`
- `docs/reviews/2026-09-18-multi-model-consensus-refutation.md`
- `.ai/worklog/deepseek-flash-ebd6eb9397ed3784.md`
