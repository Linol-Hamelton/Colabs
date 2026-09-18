# DeepSeek (deepseek-flash) - Re-Gate Review of P2-F3, P1-F1 and P1-F2/F3

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5 (a6a6d61)  
**Working tree**: dirty  
**Reviewer**: DeepSeek (model `deepseek/deepseek-flash`, session `deepseek-flash-ebd6eb9397ed3784`)  
**Scope**: archive truncation bypass | lock supervisor binding | regression  
**Verdict**: PASS - P2-F3 closed, P-1 closed; P-3 may start  

> Third independent pass. Read with the two earlier P-2 reviews and the P-1 gate
> review; those remain the record of the original findings.

---

## 1. P2-F3 - closed

- Code: `archiveEntryRecords` now sets
  `format: (parsed && hasExplicitFormat) ? parsed.format : null` with
  `hasExplicitFormat = /digest format:\s*\d+/` (`protocol-handoff.cjs:196,205`).
- Reproduction of the former exploit (delete only the `- digest format:` line
  from a legacy middle record, keep its parent-entry):
  - clean chain -> `ok: true` **because the walk now reaches the older terminal**,
    not because it stopped early;
  - older record body tampered -> `ok: false, archived parent ... was tampered`,
    proving the older record is still examined.
- Residual (documented, out of scope per DEC-0016): a legacy chain that is re-rooted
  while the severed older record remains a self-standing root cannot be
  distinguished from another journal's independent chain. This is the
  wholesale-severance case, and it is recorded as a known limitation rather than a
  blocker.

## 2. P1-F1 - closed

Real CLI flow, no state injection, supervisor PID registered through the product
path:

| Step | Result |
|---|---|
| `protocol-session.cjs start --agent qwen --supervisor-pid <supervisor.pid>` | exit 0; `supervisorPid` persisted in `.ai/runtime/<owner>.json` |
| Registered supervisor PID without token, from a process whose ppid is not the supervisor | rejected: "matches registered session ... but requires valid --session-token" |
| Registered supervisor PID + correct token, from a non-child process | accepted; lock stores `sessionPid = supervisor`, `tokenHash` set, raw token absent |
| Wrong token | rejected: "token does not match registered session" |
| `clear-lock` / `clear-lock --force` (no reason) | rejected |
| `clear-lock --force --reason "recovery"` | cleared with `[AUDIT WARN]` |
| PID 4 | rejected (reserved system PID) |
| `supervisorPid` preserved across `stop` | verified |
| Foreign live PID without affiliation | rejected (earlier probe, unchanged) |

The ppid path remains an affiliation binding: a process that directly spawns the
CLI may claim its own parent. That is the intended cooperative model and was
approved in D1.

## 3. P1-F2 / P1-F3 - closed as documented

`QUICKSTART.md:62` and `.ai/docs/PROTOCOL.md:68-75` now state explicitly that the
session token is an **anti-accident** barrier (PID-collision and squatting
protection) and not an anti-adversary isolation from local filesystem access, and
that recovery is `clear-lock --force --reason`. Error text names reserved system
PIDs. This matches the owner's P1-F2 decision.

## 4. Independent verification runs

| Check | Result |
|---|---|
| `validate-protocol.ps1` | exit 0, 0 warnings |
| `node .ai/bin/protocol.cjs doctor` | exit 0, Protocol Healthy |
| `test-protocol.ps1` | exit 0, **193/193** |
| `tests/handoff-chain.test.cjs` | 18/18 |
| `tests/lock.test.cjs` | 18/18 |
| `tests/session.test.cjs` | 19/19 |

## 5. Gate decision

- **P-2: closed** (P2-F1, P2-F2, P2-F3).
- **P-1: closed** (P1-F1, P1-F2/F3).
- **Approved to start P-3** (Legacy Evidence scoped policy per Addendum A-1).
- Residual notes for the release record: ppid affiliation is the accepted binding;
  the session token is anti-accident by design; a wholesale archive rewrite remains
  outside the threat model (DEC-0016).
- v1.9.4 tag remains frozen until P-3 and the remaining plan items pass.

---

## References

- `docs/reviews/2026-09-18-deepseek-flash-p1-gate-review.md`
- `docs/reviews/2026-09-18-deepseek-flash-p2-gate-review.md`
- `docs/reviews/2026-09-18-deepseek-flash-p2-regate-review.md`
- `.ai/worklog/deepseek-flash-ebd6eb9397ed3784.md`
