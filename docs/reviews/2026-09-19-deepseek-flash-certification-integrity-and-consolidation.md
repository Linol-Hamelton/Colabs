# DeepSeek (deepseek-flash) - Certification Integrity Review and Cycle Consolidation

**Date**: 2026-09-19  
**Release code baseline**: c71bdcf (annotated tag `v1.9.4`); HEAD a6dbf8c plus uncommitted certification artifacts  
**Working tree**: dirty (untracked reviews and journals, modified TASK.md and reviewer journal)  
**Reviewer**: DeepSeek (deepseek-flash, session `deepseek-flash-ebd6eb9397ed3784`)  
**Conflict of interest**: DECLARED - author of the consolidated plan and P-1..P-5 gate reviews. This is a meta-review of reports, not a certification.  
**Scope**: documentation honesty | per-report validity | consolidation | next-cycle plan  

---

## 1. Documentation honesty check (claims vs repository)

| Claim | Verdict | Evidence |
|---|---|---|
| Five release reviews exist on disk | TRUE | Claude, Copilot, DeepSeek, Gemini, Mistral files under `docs/reviews/2026-09-19-*.md` |
| Completion gate is filled and TASK is `Completed` | TRUE | `.ai/TASK.md:3,49-52`; cited independent review is Copilot's |
| Validator is fully clean | FALSE | `[WARN] 34 session journals`; exit 0 with 1 warning. The plan's acceptance criterion was 0 warnings |
| "Working tree: clean" (Copilot, Mistral headers) | FALSE / imprecise | The tree carries untracked certification artifacts and modified `TASK.md`/journal; Claude and Gemini reported `dirty` correctly |
| Copilot's and Gemini's Evidence receipts are current | FALSE | `verify --deep`: claude exit 0, mistral-vibe exit 0, deepseek-flash exit 0; **gemini-2da9379 exit 1 (stale)**, **copilot-13595b63 exit 1 (stale)** - later writes moved the tree |
| Qoder FAIL report was persisted | FALSE | No `docs/reviews/*qoder*` file exists; the FAIL existed only in chat, which violates AGENTS.md section 5 and the ordering rule |
| CodeGeeX persisted `2026-09-19-codegeex-adversarial-audit-v1.9.4.md` | FALSE | The file does not exist; only the older `2026-09-18-codegeex-audit-v1.9.md` is present |
| Test counts cited by reviewers (200/200, lock 18/18, archive 8/8, handoff 30/30, handoff-chain 18/18, validator 12/12) | TRUE | Reproduced independently in this session |
| "16-byte nonce" inconsistency in live docs (Mistral note) | STALE | No live doc contains it; the string appears only inside Mistral's own report. The prompt was corrected to 32-byte earlier |
| Qoder: lock bypass via registered PID without token | FALSE | Probe: registered supervisor PID without token is rejected (`matches registered session ... but requires valid --session-token`) |
| Qoder: exit-code forgery still bypasses verification | FALSE for format 2; TRUE only for legacy receipts, which is the accepted A-1 policy | Probe: format-2 forgery rejected with `entry was changed after it was certified`; legacy receipts are unauthenticated by design, `verify` refuses them without `--allow-legacy`, and no silent upgrade occurs |
| Qoder: forged segment can be inserted into the archive chain | FALSE | Probe: a forged record whose parent points into the reached chain is rejected as `orphaned segment`; a rewritten `archived-parent` marker is anchored by the journal's hashed parent link |
| Claude Code reported 35/30 journals | INACCURATE | The validator counts **34** journals; `README.md` is excluded. The 35th directory entry is the README |
| Claude Code claimed a synthesis at `v1.9.4_audit_synthesis.md` | FALSE | The file exists nowhere in the repository; the synthesis was chat-only, the same ordering-rule class as Qoder |
| Any certification report verified session liveness cleanup (the council plan's Patch 6) | FALSE - and the underlying defect is still open | No report covers it; independent probes below reproduce the defect |

### 1.1 Open defect found by following Claude Code's coverage note

Claude Code correctly observed that the council plan's Patch 6 (liveness-first
cleanup) and Patch 7 (fastValidator fixture) were never verified by any
certification report. Checking Patch 6 produced a live defect:

| Probe (current tree) | Result |
|---|---|
| `protocol-session.cjs start` (no supervisor), then `prune` from another process | journal **quarantined** although the session is live |
| `start --supervisor-pid <live supervisor>`, then `prune` | journal **quarantined** - the live supervisor is ignored |
| `start --supervisor-pid <live supervisor>`, then `cleanup-runtime --force` | snapshot **removed**: "removed dead session snapshot" |

Root cause: `protocol-session.cjs:28-33` `isProcessAlive` reads only
`record.pid`, which is always the transient hook/CLI process, and ignores the
registered `supervisorPid` that the lock already trusts. This is the residual of
the reviewer's original P-1 audit finding and it violates PROTO-DEC-0025 item 3
("active sessions are never pruned"). Patch 7: `{ fastValidator }` exists in
`tests/helpers.cjs:61-63` and the deferral decision stands; no test asserts the
excluded-suite set, so this stays a next-cycle item.

## 2. Per-report assessment

| Report | Independent | Receipt now | Notable value | Issues |
|---|---|---|---|---|
| Claude certification | Yes | **valid** | Honest baseline, per-file test evidence, notes the journal warning, declares no conflict | Strongest certifying artifact; cite this one in the gate |
| Mistral Vibe certification | Yes | **valid** | Detailed vector-by-vector evidence, journal warning acknowledged | Header says "clean" while artifacts were untracked; stale "16-byte" note |
| Copilot certification | Yes | **stale** | Concise PASS, alternative analysis | Cited in the gate but its receipt no longer verifies; "clean" header; F-000 has no concrete reproductions |
| Gemini release audit | No (implementer) | **stale** | Good implementer summary | Self-audit; not independent evidence |
| DeepSeek support audit | Yes, conflict declared | valid | Six-vector probe evidence | Not a certification by design |
| Qoder FAIL report | N/A | none | none | No file, no reproductions, all three critical claims refuted or restated accepted policy; non-compliant with the ordering rule |
| CodeGeeX plan (chat) | N/A | none | none current | Describes the pre-fix tree and cites an artifact that was never created |

## 3. Consolidated verdict

The **functional core of v1.9.4 is verified**: all six audit vectors pass under
multiple independent implementations (my probes, Claude's and Mistral's test
runs), the regression suite is 200/200, doctor is Healthy, and consumers are 18/18
byte-identical. Qoder's FAIL is not supported by evidence.

**Correction to the first edition of this report**: the cycle is **not fully
closed**. The six-vector audit did not cover the session-liveness invariant, and
the probe in section 1.1 shows that `prune` and `cleanup-runtime --force` still
discard a live transient session's journal and snapshot, even when a live
supervisor is registered. This is an open defect against PROTO-DEC-0025 item 3,
found by following Claude Code's coverage note and confirmed with root cause.

The **governance state is not fully clean**: 34 journals exceed the 30 limit
(validator warning, contradicting the 0-warning criterion), the certification
artifacts are uncommitted, the gate cites a stale receipt, two reviewers' receipts
are stale, and one chat-only FAIL report breaks the ordering rule.

## 4. Next-cycle plan

### C0 - Session liveness cleanup (blocker for this cycle's closure)
Make `isProcessAlive` in `protocol-session.cjs` prefer `supervisorPid` (mirroring
the lock) and stop `prune` / `cleanup-runtime --force` from touching a journal or
snapshot whose registered supervisor is alive. Add regressions: prune preserves a
live session's journal both with and without a registered supervisor; cleanup
preserves the snapshot; a confirmed-dead session is still prunable. Owner
decision required: require `--supervisor-pid` for long sessions, or add a
recency-based fallback for sessions that never register one.

### C1 - Restore a 0-warning validator (owner/coordinator, under the lock)
Archive the oldest journals into `.ai/ARCHIVE.md` by hand (`protocol-archive.cjs
worklog`, then `prune` for emptied files) until the count is <= 30. Never delete a
journal that still holds entries.

### C2 - Freeze and commit the certification record
After C1 and after all writers stop, commit the five reviews, the five reviewer
journals, `TASK.md`, and the refreshed receipts as one certification commit.

### C3 - Re-anchor the completion gate
Either re-record `copilot-13595b63...` after the freeze, or change the gate's
`Independent review:` line to Claude's certification, whose receipt currently
verifies. Re-run `validate-protocol.ps1` and record the final evidence.

### C4 - Evidence discipline for chat-only findings
A FAIL claim without a persisted report and a reproduction is non-compliant under
AGENTS.md section 5. Proposed next-iteration check: the completion gate additionally
requires that the cited independent review's journal receipt verifies
(`verify --owner <id> --deep` exit 0) at gate time.

### C5 - Documentation accuracy
Remove or correct any "clean tree" claim when artifacts are untracked; state
explicitly in `.ai/docs/PROTOCOL.md` that legacy receipts are editable and
therefore not tamper-evident (format 2 only). No live "16-byte" reference remains.

### C6 - Carried technical hypotheses (v1.9.5 / v2.0)
- Store `nonceHash` instead of the raw nonce (P1-F2 option) so the token is not
  readable from `.ai/runtime`.
- Explicit `{ fastValidator: false }` fixture option plus an asserted exclusion set
  (Mistral F-001).
- Add `doctor` and a `verify --deep` freshness check to CI.

**Cycle verdict**: the v1.9.4 hardening core is verified, but the cycle is not
fully closed. C0 (session liveness cleanup) is an open defect against
PROTO-DEC-0025 item 3; C1-C3 close the release record; C4-C6 seed the next cycle.

---

## References

- All `docs/reviews/2026-09-19-*` certification artifacts
- `docs/reviews/2026-09-18-v1.9.4-final-adversarial-audit-prompt.md`
- `.ai/TASK.md`; `.ai/DECISIONS.md` PROTO-DEC-0028
- `.ai/worklog/deepseek-flash-ebd6eb9397ed3784.md`
