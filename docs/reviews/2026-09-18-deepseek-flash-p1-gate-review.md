# DeepSeek (deepseek-flash) - Gate Review of P-1 (Lock Ownership Hardening)

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5 (a6a6d61)  
**Working tree**: dirty  
**Reviewer**: DeepSeek (model `deepseek/deepseek-flash`, session `deepseek-flash-ebd6eb9397ed3784`)  
**Scope**: security | lock liveness | regression  
**Verdict**: RECOMMENDATION (proceed to P-2; P-1 not closed until P1-F1 and P1-F2 are resolved)  

> Independent verification of the implementer's P-1 report. No implementation
> files were modified by the reviewer.

---

## 1. Claims verified true

| Claim | Independent result |
|---|---|
| `--session-pid 4` rejected | Probe: exit 1, `must be a positive integer > 4`. |
| Unrelated live PID without token rejected | Probe with a detached live child: exit 1, `not bound to this session`. |
| Own PID and parent PPID accepted | `node --test tests/lock.test.cjs` -> 17/17 pass (includes the ppid case). |
| Registered PID with correct token accepted, wrong token rejected | Test passes, but see P1-F1: the test injects a live PID into the runtime state. |
| Raw token never stored in the lock | Probe: lock file has `tokenHash`, `JSON.stringify(lock).includes(nonce)` is false. |
| Live registered lock cannot be cleared without `--force --reason` | Probe: plain clear exit 1; `--force` without reason exit 1; `--force --reason` exit 0 with `[AUDIT WARN]`. |
| Foreign-host lock preserved | Covered by tests; `liveness: cooperative` for tokenless locks. |
| Nonce survives Stop | Probe: nonce identical before/after `protocol-session.cjs stop`. |
| `.ai/runtime` is not committed | `git check-ignore .ai/runtime` confirms it is ignored. |
| Suite, validator, doctor | `validate-protocol.ps1` exit 0, 0 warnings; `doctor` exit 0 Healthy; `test-protocol.ps1` 186/186; session tests 19/19. |

The implementer's report is accurate for every item it states.

---

## 2. Findings

### P1-F1 - [HIGH] The `--session-pid` + `--session-token` registered path is unreachable in the real flow

- **Location**: `.ai/bin/protocol-hooks.cjs:410` (`pid: process.pid` in the state),
  `.ai/bin/protocol-lock.cjs:201` (`isRegistered = state.pid === num && tokenHash`),
  `tests/lock.test.cjs` registered case.
- **Reproduction**:
  ```
  protocol-session.cjs start --agent p1-agent
  # owner p1-agent-..., token printed
  # state.pid is the start CLI process, already exited
  acquire --session-pid <state.pid> --session-token <token>
  -> exit 1: Invalid --session-pid value: <pid> (target process is not running)
  ```
- **Impact**: `hooks.run` and `protocol-session.cjs start` record the transient
  hook/CLI PID, which is dead before any external caller can use it. Only a direct
  parent (`process.ppid`) works. A detached supervisor (IDE extension, daemon,
  orchestrator that shells out through an intermediate process) cannot register a
  live PID, so the token path the owner approved (D1) is a paper control. The
  regression test passes only because it writes `pid: supervisor.pid` into the
  state by hand, which production never does - the same test-versus-reality gap
  that produced the earlier `prune` and `--session-pid` review findings.
- **Required fix (before P-1 is closed)**: let the session register a live
  supervisor PID:
  1. `protocol-session.cjs start --supervisor-pid <pid>` (optional): accept only
     `process.pid` or `process.ppid`, alive and `> 4`, and persist
     `supervisorPid` in `.ai/runtime/<owner>.json`.
  2. `hooks.run` must preserve `supervisorPid` across Stop, like `nonce`.
  3. `protocol-lock.cjs` accepts `state.pid === num || state.supervisorPid === num`
     with a valid token.
  4. Regression: start a session as a child of a long-lived wrapper that passes
     `--supervisor-pid <wrapper.pid>`; from a separate process acquire with that
     PID and the token and expect success, then expect `clear-lock` to refuse
     without `--force --reason`. Do not inject state by hand.

### P1-F2 - [MEDIUM] The nonce is stored in plaintext and is readable by any local agent

- **Location**: `.ai/bin/protocol-hooks.cjs:413,472-476`; the state file is
  world-readable `.ai/runtime/<owner>.json`.
- **Impact**: `--session-token` proves only that the caller can read the state
  file, not that it is the supervisor. Once P1-F1 lets a live supervisor PID be
  registered, any agent that reads the nonce could present it with that PID and
  block `clear-lock` (recoverable only with `--force --reason`). This is a weaker
  guarantee than "liveness authentication".
- **Recommended fix (pre-release, with P1-F1)**: store `nonceHash` instead of the
  raw `nonce`; print the raw token once at `start`; compare
  `sha256(provided) === state.nonceHash`. `whoami` then reports only that a token
  is registered, not its value. If the owner prefers the simpler design, document
  explicitly that the token is anti-accident, not anti-adversary, and rely on
  `--force --reason` for recovery.

### P1-F3 - [LOW] Error text and docs polish

- Rejection message `must be a positive integer > 4` is accurate but does not say
  why; mention "reserved system PID" for operator clarity.
- `QUICKSTART.md`/`.ai/docs/PROTOCOL.md` should state that a detached supervisor
  currently cannot use the token path until P1-F1 lands, so nobody relies on an
  unreachable control.

### P1-F4 - [INFO] Intentional strictness confirmed

A live tokenless (legacy/cooperative) lock cannot be stolen even with `--force`,
and `clear-lock --force` clears only dead or unknown-liveness locks. That is
stricter than the pre-P-1 behavior and safer; no regression found in the suite.

---

## 3. Gate decision

- **P-1 core objective achieved**: arbitrary-PID lock squatting (PID 4 and any
  unrelated live PID) is closed, verified by probe and tests; the tree is green
  (validator 0, doctor 0, suite 186/186).
- **Approved to start P-2** (different files: `protocol-handoff.cjs`), so work can
  continue without collision.
- **P-1 remains OPEN** until P1-F1 is implemented with a real-flow regression and
  P1-F2 is either implemented or explicitly documented by the owner. No v1.9.4 tag
  before both are closed.
- The implementer's report should be corrected: "success for registered PID +
  valid token" is only true for an injected state, not for production.

---

## References

- `docs/reviews/2026-09-18-deepseek-flash-v1.9.4-consolidated-final-plan.md` (P-1)
- `.ai/DECISIONS.md`: PROTO-DEC-0027, PROTO-DEC-0028 draft
- `.ai/worklog/deepseek-flash-ebd6eb9397ed3784.md`
