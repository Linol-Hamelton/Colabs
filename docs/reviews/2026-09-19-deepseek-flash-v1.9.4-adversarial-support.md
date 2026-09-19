# DeepSeek (deepseek-flash) - Supporting Adversarial Audit of Protocol v1.9.4 Release Hardening

**Date**: 2026-09-19  
**Release Code Commit**: c71bdcf94545c246178b5d75e780f3fd79cb9b5a (annotated tag `v1.9.4`)  
**HEAD during audit**: a6dbf8c (certification documentation only after the tag)  
**Working tree**: dirty (review artifacts are being added by reviewers)  
**Reviewer**: DeepSeek (model `deepseek/deepseek-flash`, session `deepseek-flash-ebd6eb9397ed3784`)  
**Conflict of interest**: DECLARED. The reviewer authored the consolidated plan
(`docs/reviews/2026-09-18-deepseek-flash-v1.9.4-consolidated-final-plan.md`) and
the P-1..P-5 gate reviews. Per AGENTS.md section 2 this report is supporting
adversarial evidence only; the certifying verdict for `## Completion gate` must
come from an unconflicted model (Claude, Copilot or Mistral).  
**Scope**: release integrity | lock | archive graph | Evidence | consumer sync | completion gate  
**Verdict**: PASS (supporting; not a certification)

---

## 1. Methods

All checks were run independently on this machine: real-repository commands for
release/consumer checks, and throwaway fixtures under the OS temp directory for
attack probes. No implementation file was modified by the reviewer.

## 2. Vector results

### Vector 1 - Release and tag integrity: PASS

| Check | Result |
|---|---|
| `git rev-list -n 1 v1.9.4` | `c71bdcf94545c246178b5d75e780f3fd79cb9b5a` |
| `git diff --name-only c71bdcf..HEAD` | `.ai/TASK.md`, `.ai/worklog/gemini-86ce17621cbe45e3.md`, audit prompt - documentation only, 0 code/tooling files |
| `protocolVersion` | `1.9.4` in `protocol-manifest.json`, `AGENTS.md`, `setup-ai-protocol.ps1`; validator `[PASS] one protocol version everywhere` implied by 0 warnings |
| `validate-protocol.ps1` | exit 0, `Protocol OK. 0 warning(s)` |
| `protocol.cjs doctor` | exit 0, `Protocol Healthy` |

### Vector 2 - Lock token and session spoofing: PASS

| Probe | Result |
|---|---|
| `acquire --session-pid 4` | rejected |
| Unrelated live PID without token, from a non-child process | rejected |
| Registered supervisor PID + matching `--session-token` | accepted; lock stores `sessionPid`, `tokenHash`; raw token absent |
| `clear-lock` plain / `clear-lock --force` without reason | refused |
| `clear-lock --force --reason` | cleared with `[AUDIT WARN]` |
| Nonce persistence across session `stop` | preserved |

### Vector 3 - Archive boundaries and Merkle graph: PASS

- Old-vs-new canonicalization sweep of the live `.ai/ARCHIVE.md` (20 records at
  audit time): **18 valid under both, 2 valid only under the new canonicalization
  (`2104e1a8`, `470a56bf`; both batch-boundary records), 0 valid only under the
  old one, 0 invalid under the new one.** The prompt's dynamic wording ("report
  actual counts") covers the growth; the fixed number "1 record" from the earlier
  review is now 2 as further batches were archived.
- Batch boundary regression: `node --test tests/archive.test.cjs` -> 8/8 pass,
  including the second-batch test at `tests/archive.test.cjs:257`.
- Multiple legitimate independent chains accepted.
- Re-rooting a middle record with the older record pointing into the reached
  chain -> rejected with `orphaned segment`.
- Deleting `- digest format: 4` from a middle legacy record -> the older record is
  still reached and a tampered older body is detected.

### Vector 4 - Evidence format 2 and doctor diagnostics: PASS

| Probe | Result |
|---|---|
| Forge `exit 7` -> `exit 0` in Evidence | `verify` fails with `entry was changed after it was certified` |
| Tamper `- scope:` metadata | rejected with the same hash-mismatch message |
| Delete `- parent-entry:` | rejected (hash change) |
| `rehash` without `--reason` | rejected |
| `rehash --reason` after a body edit | succeeds; `verify` returns 0 |
| Legacy receipt without `--allow-legacy` | rejected (`not authenticated`) |
| Legacy receipt with `--allow-legacy` | passes with warning |
| Anonymous `verify` over only legacy receipts | exit 1 |
| `doctor` on a broken/tampered evidence chain | non-zero exit |

### Vector 5 - Consumer synchronization and isolation: PASS

| Check | Result |
|---|---|
| `setup-ai-protocol.ps1 -Target D:\Block-Puzzle -Verify` | exit 0 |
| `setup-ai-protocol.ps1 -Target D:\VPN -Verify` | exit 0 |
| Managed file SHA-256 vs source manifest | 18/18 match, 0 drift, 0 missing, both consumers at `1.9.4` |
| Consumer HEADs | unchanged during sync (`ce72535`, `1b6276d`); working trees remain uncommitted (43 and 34 changed files), so no rogue installer commits (DEC-0025 item 4) |

### Vector 6 - Completion gate negative matrix: PASS (8/8 probes)

Valid Completed task with a bold `**Reviewer**`/`**Verdict**` review passes; a
plain-text review also passes. Rejected: prompt or review outside `docs/reviews/`,
empty prompt, missing review, `Verdict: FAIL`, `Verdict: BLOCKED`. Placeholder
paths in prose do not false-positive. `test-protocol.ps1` -> **200/200**.

## 3. Non-blocking observations

1. **Prompt staleness (documentation)**: section 3, Vector 1 still cites the
   certification baseline as `2c64a92`, while HEAD advanced to `a6dbf8c`. The
   header was generalized; the vector text was not. The underlying claim (no code
   changes after `c71bdcf`) holds for every HEAD checked, so this is cosmetic and
   does not affect the release.
2. **Sweep count drift (expected)**: boundary-valid records are now 2, not 1.
   Certifiers should expect the number to grow with each archived batch; the
   invariant to assert is "0 records invalid under the new canonicalization" and
   that each boundary record is a batch boundary.
3. **Observed during the audit**: an unconflicted certifier artifact appeared from
   another model (`docs/reviews/2026-09-19-copilot-v1.9.4-release-certification.md`,
   untracked at audit time). Its verdict, not this report, is the one to cite in
   `## Completion gate`.
4. **Release-gate housekeeping (blocker for a 0-warning closure)**: the
   certification session added a 31st journal, so `validate-protocol.ps1` now
   reports `[WARN] 31 session journals in .ai/worklog; archive the oldest into
   .ai/ARCHIVE.md` (exit 0, 1 warning). The plan's acceptance criterion is
   "validator passes with 0 warnings". Before closing the gate, archive the oldest
   journal by hand under the shared-document lock (oldest at audit time:
   `.ai/worklog/deepseek-87f92938b60af796.md`, 2026-09-16): append its entries to
   `.ai/ARCHIVE.md` with `protocol-archive.cjs worklog`, then quarantine/remove
   the emptied journal (`protocol-session.cjs prune`). Do not delete a journal
   that still holds entries. After that the validator returns to 0 warnings.
5. **Transient validator failure during recording**: one `record` run observed
   `validate-protocol.ps1: exit 1` while another session was writing its journal
   and review files; a direct re-run returned exit 0. The reviewer re-recorded
   after the tree settled. This is a concurrency artifact of the certification
   session, not a defect in the validator.

## 4. Residual risks (accepted by design, not defects)

Lock token is an anti-accident barrier (readable in `.ai/runtime`); PID binding
accepts own/ppid/registered; wholesale archive rewrite is outside the runtime
threat model (DEC-0016); a terminal `### From ...` provenance line is outside the
hash body.

---

## References

- `docs/reviews/2026-09-18-v1.9.4-final-adversarial-audit-prompt.md`
- `docs/reviews/2026-09-18-deepseek-flash-v1.9.4-consolidated-final-plan.md`
- `.ai/worklog/deepseek-flash-ebd6eb9397ed3784.md`
