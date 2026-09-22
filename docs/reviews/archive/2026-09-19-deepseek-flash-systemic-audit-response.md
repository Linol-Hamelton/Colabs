# DeepSeek (deepseek-flash) - Systemic Repository Audit Response

**Date**: 2026-09-19
**Reviewed commit**: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
**Working tree**: dirty
**Reviewer**: deepseek-flash (independent strategic audit)
**Scope**: audit, architecture, strategic trajectory, meta-process evaluation
**Verdict**: RECOMMENDATION (strategic: RADICAL SIMPLIFICATION)
**Mode**: ADVISORY
**Receipt-Owner**: none

> Mode note: this session has REPO_READ, SHELL_EXEC and FS_WRITE, but no EVIDENCE_SIGN
> receipt was produced, and the open-disagreements rule ("no runtime changes before the
> owner rules") was respected. The review is therefore advisory and cannot satisfy a
> completion gate. Every quantitative claim below is reproducible with the listed command.

---

## Executive Diagnosis

The project did not fail; it succeeded past the point of usefulness. Ten days of hardening
produced a genuinely robust, well-tested protocol kernel (2,826 lines, 255 tests, real
fixes to real data-loss and false-green defects). But the mission in `.ai/PLAN.md` was
never executed: "Find out whether this protocol reduces rework and context loss on real
work, before building anything further for it" (`PLAN.md:51-54`). Every one of the five
`## Review` boxes is still unchecked (`PLAN.md:98-101`). Instead of running that pilot,
the team spent the last 48 hours and 35 commits building *further for it* - and then
built a context-economy program to solve the context cost of the reports it wrote about
itself. That is the wrong turn, and it is measurable, not rhetorical.

The correct fix is not more protocol. It is to (a) terminate the Repomix/index track
permanently for this repository, (b) enforce a budget on the one corpus that is currently
unbounded - `docs/reviews/` - and (c) redirect all agent attention to `Block-Puzzle` and
`VPN`, where the protocol's value or its uselessness can actually be observed. v2.0 should
be a smaller protocol, not a stricter one.

### The decisive evidence

| Fact | Value | Command |
|---|---|---|
| Kernel JS | 2,826 lines in `.ai/bin/` | `Get-ChildItem .ai/bin/*.cjs` |
| Review corpus | 126 files, 1,299,793 bytes | `Get-ChildItem docs/reviews/*.md` |
| Reviews written in last 2 days | 124 of 126 | same, `LastWriteTime` |
| Protocol commits in last 48 h | 35 | `git log --since="48 hours ago"` |
| Kernel-to-prose ratio | ~1 : 460 by bytes (1,300 KB / 2.8 K lines) | - |
| Worklog journals | 30 (at the hard cap) | `protocol-archive.cjs status` |
| `Block-Puzzle` last commit | 2026-09-17 04:19 | `git -C D:\Block-Puzzle log -1` |
| `VPN` last commit | 2026-09-18 03:44 | `git -C D:\VPN log -1` |
| Local models pulled | `omnicoder-2-9b` (5.7 GB), `qwen3:8b` (5.2 GB) | `ollama list` |

Two conclusions follow directly. First, the context "crisis" was self-inflicted: the
review corpus outgrew the kernel by more than two orders of magnitude, so the bottleneck
was never the 21k tokens of kernel code. Second, while all of that was being written, the
two repositories the protocol exists to serve received no agent attention at all.

---

## Block 1 - "Did we take a wrong turn?"

### 1. Meta-bureaucracy (the "Protocol Ouroboros")

**Agree, with one correction.** The loop is real, but "95% of tokens on audits" is an
estimate, not a measurement; the defensible claim is the ratio above and the 35/48 h commit
count. More importantly, blaming "bureaucracy" is imprecise. The mechanism is a structural
asymmetry: `AGENTS.md` caps `.ai/TASK.md` at 80 lines and journals at 150, but
`PROTO-DEC-0026` created `docs/reviews/` as an explicitly permanent, unbounded, Git-tracked
corpus with no budget. The protocol capped its *working* memory and left its *archive* to
grow without limit. The review directory became the context problem, and the response to
that problem was a new R&D program about index tools.

### 2. Artificial context scarcity

**Yes, largely artificial.** The digest was commissioned from
`PROTO-DEC-0034`/`0035`, whose stated problem was repeated kernel reading. But the kernel
is ~21k tokens - one prompt for any frontier model. The measurable burn is the 126-file
review corpus and the multi-thousand-line adversarial prompts (24 `-prompt.md` files
alone). Repomix then supplied an 88k-token XML digest to "solve" it, which the H1 data
shows was an *additional* read on top of exploration. The proper tool for an oversized
prose corpus is a retention policy and an index file, not a code packer.

### 3. Pseudo-cryptography in a single-user environment

**Partly valid, but not a fair charge of fraud.** The protocol is honest about its own
limits: `DEC-0016:730` says the identity is "an integrity check against accidental drift
between two sessions, not a defence against a crafted collision", and `AGENTS.md` section 5
says plainly that "nothing inside one checkout can stop a session writing into another
session's journal" and that separate files "prevent collisions, not forgery". So the
authors know it is a safety net, not a Byzantine system.

The criticism that lands is proportionality, not pretense. Supervisor-PID nonces, session
tokens, 11-branch liveness matrices and multi-level Merkle traversal are heavy machinery
whose actual function is to stop *accidental* damage - a job a simple age check plus a
warning already does. The four-capability certifying/advisory split (`PROTO-DEC-0031`) is
the exception: it answers a real confusion (read-only chat models asserting blocking FAILs)
and should stay.

Net: keep drift detection and the certifying/advisory distinction; drop the adversarial
security framing and any further PID/nonce/traversal layers.

---

## Block 2 - Repomix and "Pilot v2"

### 4. Was the stop rule violated?

**No, and saying so would be unfair.** `PROTO-DEC-0035` said "terminate without MCP
adoption"; no MCP was adopted and Arm C was cancelled. The `PROTO-DEC-0035` stop rule was
executed as written. What happened after is a *reinterpretation*: the post-mortem claims
the raw digest measured "read-all overhead, not index value"
(`2026-09-19-h1-pilot-postmortem-and-repomix-paths.md:9`) and proposes B2/B3/B4/C2.

That reinterpretation is not fraud; it is sunken-cost escalation, and it is also
unnecessary on the arithmetic. The H1 data already kills the premise without another run:
Arm A used ~73k fresh tokens on broad tasks and ~45k on narrow tasks, while the digest
itself is ~88k tokens. **The index is larger than the work it is meant to save.** B3
(scoped 3-6 files, 5-15k) might in principle beat that, but only if someone first spends
tokens and time choosing the scope - which reintroduces the cost being optimized, and
which `grep`/`rg` already do interactively and precisely.

### 5. Can any monolithic index beat targeted search here?

**No, not for this repository.** `ripgrep` + targeted `Read` is O(relevant), has zero
generation latency, zero staleness risk, and no stored artifact to maintain. A monolithic
digest is O(repository) per orientation step and must be regenerated as the tree changes.
At 2.8k kernel lines the crossover never occurs. The only regime where an index wins is a
repository too large to search comfortably - which this one is not.

### 6. Local 8B/9B models in Ollama

**Already done and should not be used.** `ollama list` shows `omnicoder-2-9b` (5.7 GB) and
`qwen3:8b` (5.2 GB) pulled minutes ago. The downloads are sunk; the mistake would be
running dozens of multi-step Git trials on them. H1 already showed the variance: one
B trial ran 2,306 s against ~230-800 s for the rest, and the owner run policy reserves
test runs for free subjects precisely because such trials are noisy. Small models are
weakest exactly where v2 would test them (long tool-call chains, journal discipline,
worktree hygiene). The result would be a large volume of uninterpretable data and a new
class of environment failures - the definition of spending compute to lower confidence.

---

## Block 3 - Kernel architecture (`.ai/bin/`)

### 7. Circular dependencies

**Real and worth fixing, in v2.0.** Verified require graph:

- `protocol-lock.cjs:10` requires `./protocol-session.cjs`
- `protocol-session.cjs:26` requires `./protocol-hooks.cjs`
- `protocol-hooks.cjs:553` lazily requires `./protocol-archive.cjs`
- `protocol-archive.cjs:11-12` requires `./protocol-lock.cjs` and `./protocol-hooks.cjs`

Commit `b587dc1` moved `module.exports` above the CLI guard, which hides the symptom, not
the cycle. The clean break is to extract the only thing `lock` actually needs from
`session` - process liveness - into a leaf module, giving unidirectional layers:
`primitives (fs/hash/process)` -> `lock` -> `session` -> `hooks`/`archive` -> `handoff` ->
`cli`. This is a mechanical, test-backed refactor, low risk, and should be scheduled for
v2.0 - not done as a drive-by during a feature freeze.

### 8. Splitting `protocol-handoff.cjs` (1,047 lines)

**Support, but do not oversell it.** It is 37% of the kernel and mixes CLI parsing, tree
snapshotting, Merkle hashing, gate checks and secret scanning. Splitting into
`snapshot` / `evidence` / `gate` improves testability and reviewability. It does not by
itself make the protocol simpler; treat it as code hygiene bundled into v2.0, not as a
strategic fix. The strategic fix is to delete or freeze mechanisms that do not pay rent.

### 9. Replace `validate-protocol.ps1` with Node (v2.0)

**Yes.** Node 22 is already a hard dependency, the rest of the toolchain is `.cjs`, and the
PowerShell engine is 778 ASCII-only lines maintained in parallel with `protocol.cjs doctor`
and the Node tests. PowerShell 5.1 also carries the ANSI-codepage trap that spawned
`DEC-0001`. One cross-platform Node validator removes dual maintenance and one whole class
of encoding failure. The differential-verification requirement of `PROTO-DEC-0025` item 5
is the right way to do it.

---

## Block 4 - Verdicts on D1-D12

| # | Verdict | One-line rationale |
|---|---|---|
| **D1** | **Terminate permanently for this repository.** | Index (~88k) is larger than the work (~45-73k fresh); stop rule already fired. |
| **D2** | **No v2, so no new primary metric.** If ever run: fresh tokens (`in + out`) primary, total secondary. | Fresh view is the arm-comparable one and is not cache-dominated. |
| **D3** | **Keep 25% / +5%.** Do not lower to 20% / +3%. | Lowering thresholds after a failed run is textbook goalpost-shifting. |
| **D4** | **Reject "tokens per accepted finding".** | "Accepted" requires a judge; trivial-finding farming games the denominator. Automated checks only. |
| **D5** | **Abort further local-model pulls and do not run v2 on them.** | 8B tool-calling is unreliable for multi-step Git; H1 already showed extreme variance. |
| **D6** | **Use `agy`/Gemini and paid analysis models only.** Skip HF-credit routes or define whether borrowed credits count as "free". | Avoids fragile account/card bindings and undefined policy edges. |
| **D7** | **Archive now, but classify first - do not mass-move.** Move prompts/runbooks/discussions/pre-v1.9.5 files; keep every review cited by a live receipt or completion gate at its cited path. Add an index. Never touch `DECISIONS.md`, `REGISTRY.md`, `.ai/ARCHIVE.md`. | A blind move can break `gate-check` receipt path bindings (`PROTO-DEC-0032`) and violates the immutability rule in spirit. |
| **D8** | **v2.0 = radical simplification, not a new gate layer.** | Node validator, break cycles, split handoff, lower ceremony. |
| **D9** | **Reject further process hardening.** Accept C1a as a bug fix, not a precedent for monitoring. | Monotonic clocks/power watchers/supervisors are over-engineering for a laptop. |
| **D10** | **Owner policy is binding; define "test" as any measurement-motivated run, and count borrowed credits as non-free.** | Removes the pilot/analysis ambiguity that allowed paid pilot batches. |
| **D11** | **Close the round now:** Qoder -> advisory (broken `Receipt-Owner`), Codex re-recorded at the freeze, Gemini fresh, F-001 fixed by C1a. | The substantive stop-rule conclusion was never in doubt. |
| **D12** | **Record both execution vectors; use the right tool per task.** | Agent Manager for background/DeepSeek runs, CLI/`agy` for deep multi-file work. |

---

## Falsifier

I would reverse the "terminate permanently" and "radical simplification" positions if a
controlled, pre-registered run showed a *material and reproducible* token or wall-clock win
for an index pattern on this repository - specifically: on broad tasks, `>= 25%` median
total-token reduction and `<= +5%` narrow regression against a matched control, measured on
a second model family, with the per-task scope selection cost counted in the total. A
plausible narrower version would be a repository whose prose corpus genuinely exceeds the
context window and whose search is not already fast. Absent that, more arms only add noise.

I would also soften the "wrong turn" verdict if `Block-Puzzle`/`VPN` work resumes and the
protocol's cost on real product tasks proves low and its benefits real; the trajectory
diagnosis is about *allocation now*, not about the inherent value of the kernel.

---

## Minimal next step (owner approval requested)

1. **Close Track C / Repomix permanently.** Do not run B2/B3/B4/C2. Record a short
   `PROTO-DEC` extending `PROTO-DEC-0035` to close the index track for this repository,
   with the falsifier above as its only reopen trigger.
2. **Context detox with a budget.** Add a retained-corpus rule for `docs/reviews/` (e.g.
   move non-certifying and pre-v1.9.5 files to `docs/reviews/archive/`, keep an index,
   preserve any review bound to a live receipt). This is the change that actually recovers
   context; no experiment is needed.
3. **Return to `.ai/PLAN.md`.** Freeze protocol feature work except P0 bug fixes; start the
   first real product task in `Block-Puzzle` (or `VPN`) and measure the protocol there.
   Schedule the v2.0 simplification (Node validator, cycle break, handoff split) *after*
   that pilot produces data.

Items 1-3 are one decision: stop perfecting the instrument and use it on the work.

---

## References

- Mission never run: `.ai/PLAN.md:51-54`, `:98-101`
- Unbounded corpus created: `PROTO-DEC-0026`; caps: `AGENTS.md` section 8
- Honest self-limits: `DEC-0016`, `AGENTS.md` sections 5-6
- Stop rule and pilot: `PROTO-DEC-0035`, `docs/reviews/2026-09-19-h1-pilot-report.md`,
  `...-h1-pilot-report-correction.md`
- Post-mortem: `docs/reviews/2026-09-19-h1-pilot-postmortem-and-repomix-paths.md`
- Peer audit: `docs/reviews/2026-09-19-gemini-systemic-repository-audit.md`
- Require graph: `.ai/bin/protocol-{lock,session,hooks,archive}.cjs`
- External audit: `docs/reviews/2026-09-19-codex-trackc-h1-audit.md`
