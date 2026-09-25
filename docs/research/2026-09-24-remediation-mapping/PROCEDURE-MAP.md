# Procedure map by kernel layer - input for the round-3 syntheses

- Status: a data artifact. It assigns every described and planned procedure to a layer,
  records where it is written and what enforces it, and lists overlaps, conflicts and empty
  cells. It contains no recommendations. Gaps are stated as questions.
- Date: 2026-09-24. Written by claude-ebd3e8a8eb29a6d7 at the owner's request. Claude is
  also one of the three round-3 synthesisers, so this map is kept to sources.
- Baseline: `4ded1be`, dirty tree.
- Sources:
  - `AGENTS.md`;
  - `.ai/docs/PROTOCOL.md`, `PAIRED-CYCLE.md` and `CLI-AGENTS.md`;
  - `.ai/DECISIONS.md` through PROTO-DEC-0051, using the derived index from
    `node .ai/bin/protocol-index.cjs`;
  - `.ai/bin/`.
- Layers: the scheme in `docs/research/2026-09-23-kernel-architecture/DISCUSSION.md`
  section 5. It is a discussion scheme, not a decision.

Enforcement: **S** means a script enforces it; **P** means prose only; **S~** means a
script enforces part of it; **—** means it is decided but not built.

## L0 Meta-root: invariants, source priority, how procedures are made

| Procedure | Homes | Enf. |
|---|---|---|
| Source-of-truth ranking | AGENTS.md:16 §1 | P |
| Owner-only authority, transcription of direct approval | AGENTS.md:36 §2; PROTO-DEC-0030 | S~ (validator checks for a non-placeholder `Approved by`) |
| Decision blocks are append-only and immutable | AGENTS.md:267 §6; validate-protocol.ps1 (immutability); R3-C05 accepted exception (PROTO-DEC-0048 item 4) | S~ |
| Never list | AGENTS.md:459 §12 | P |
| Encoding: UTF-8 without BOM, `.ps1` ASCII | AGENTS.md:443 §11; DEC-0001; PROTOCOL.md:449 | S |
| Failures become procedures | PROTO-DEC-0050 item 1 | P |
| Signals: procedure-gap, script-candidate, fall | PROTO-DEC-0051 items 1-3 | — (interim "Signal:" journal lines) |
| Risk search serves coverage | PROTO-DEC-0049 item 4 | P |
| "Rule not found, stop and ask" | DISCUSSION.md §6 only | — |

## L1 Roles

| Procedure | Homes | Enf. |
|---|---|---|
| `## Roles` in TASK, injected at session start | DEC-0020; AGENTS.md:54 | S (hook injects the role) |
| Independence: author, executor and controller never certify | PROTO-DEC-0041 item 1; 0047 items 1-2; AGENTS.md:89 | S~ (`protocol-scope.cjs` heuristic, under remediation; grammar planned in 0049 item 2) |
| Certifier count by risk | PROTO-DEC-0038; 0041 item 2; 0047 item 3; AGENTS.md:89 | S~ (`gate-check` at completion, PROTO-DEC-0032) |
| Certifying capabilities | PROTO-DEC-0031; AGENTS.md §2 | P |
| Availability order and shadow certification | PROTO-DEC-0047 items 1 and 4 | P |
| DeepSeek coordinates and certifies nothing | PROTO-DEC-0046 | P |

## L2 Procedures and scenarios

| Procedure | Homes | Enf. |
|---|---|---|
| Session start | AGENTS.md:142 §3; `protocol-hooks.cjs`; `protocol-session.cjs start` | S |
| Session end | AGENTS.md:166 §4; Stop hook | S~ |
| Journal entry: five labels, Evidence | AGENTS.md:185 §5; PROTOCOL.md:123; DEC-0005 | S~ (labels are checked; entries are inserted by hand. See signal J below) |
| Paired cycle, seven phases | PAIRED-CYCLE.md:26 §2; PROTOCOL.md:354; PROTO-DEC-0041 | P |
| Adversarial prompt and report | PROTO-DEC-0027, 0038; AGENTS.md:89; PAIRED-CYCLE.md:278 (template 4) | S~ (`gate-check` checks that the files exist) |
| Batching and batch cap | PLAN "Batching rule"; PROTO-DEC-0047 item 5; 0048 item 1 | P |
| Escalation budget, at most 2 attempts per root cause | PAIRED-CYCLE.md:159; PROTO-DEC-0046; 0048 item 4; PLAN; `protocol-verdict.cjs` `checkStopRule` | S~ |
| Budget exhaustion goes to audit | PROTO-DEC-0048 item 4 | — |
| Diff-based re-certification | PROTO-DEC-0049 item 1 | — (Z3 package proposed) |
| Dispatch to another CLI | CLI-AGENTS.md §2-§7; PROTO-DEC-0043; 0050 item 2 | S~ (`prompts/launch-round2.cjs`, a recorded temporary workaround) |
| Idle and liveness | PROTO-DEC-0047 item 6 (15 min); 0049 item 3 (5 min); 0051 item 4 (three wakes, then FALLEN); PAIRED-CYCLE.md:162 (budget stop) | S~ (launcher: 5-minute stop, no wake) |
| Research programme: rounds, primary and challenge | none in the kernel; research briefs only | — |
| Council convening | PAIRED-CYCLE.md:165 | P |
| Freeze commit, path-scoped to the candidate | PROTO-DEC-0047 Consequences; AGENTS.md:431 §10 | P |

## L3 Tools

| Procedure | Homes | Enf. |
|---|---|---|
| Client roster | CLI-AGENTS.md:14 §1 | P |
| Client registry and execution profiles | PROTO-DEC-0047 item 9; 0050 item 3 | — |
| Permission grants | PROTO-DEC-0047 item 7; 0049 item 5; CLI-AGENTS.md:123 §6 | S~ (agy only: `~/.gemini/config/protocol-gate.cjs`, outside the repository) |
| MCP, skills and connectors governance | PROTO-DEC-0034, 0036, 0045, 0047 item 11; PROTOCOL.md:340 | P |
| Kernel scripts | `.ai/bin/`: archive, handoff, hooks, index, ledger, lock, scope, session, verdict, `protocol.cjs` | S |

## L4 Application, refined by experience

| Procedure | Homes | Enf. |
|---|---|---|
| Known client failure modes: vibe UTF-8, agy headless permissions, agy working directory, `-p` quoting | journals; `~/.gemini/config/PROTOCOL-CHANGES.md`; PROTO-DEC-0050 context | — |
| Measured client facts: effort scales, flags, MCP token tax | PROTO-DEC-0047 item 9 context | P |

## L5 State and artifacts

| Procedure | Homes | Enf. |
|---|---|---|
| Shared documents have one writer; cooperative lock | AGENTS.md:267 §6; PROTO-DEC-0028, 0029 | S (`protocol-lock.cjs`) |
| Evidence record and verify; receipt freshness | AGENTS.md:325 §7; DEC-0021; PROTO-DEC-0024, 0042 | S (`protocol-handoff.cjs`) |
| Findings ledger format | PAIRED-CYCLE.md:141 §4; spec §2 | S~ (`protocol-verdict.cjs`) |
| Layers A, B and C: inventory, decisions index, coverage and duplicates | PROTO-DEC-0044 | S |
| Decision registry | PROTO-DEC-0033 | S~ (the validator counts rows) |
| Archive, size limits and corpus budget | AGENTS.md:383 §8; PROTO-DEC-0023, 0037; DEC-0006 | S |
| Manifest | DEC-0012, 0013 | S |
| Signals ledger | PROTO-DEC-0051 | — |

## L6 Metrics

| Procedure | Homes | Enf. |
|---|---|---|
| Stop telemetry, `sessions.jsonl` | PROTO-DEC-0035; PROTOCOL.md:348 | S (overcounts 2.96x by `docs/research/2026-09-23-routing/INDEX-draft.md`) |
| Cost per task (CodeBurn) | PROTO-DEC-0047 item 10 | — (not installed) |
| Calibration: shadow scoring, verdict against outcome | PROTO-DEC-0047 item 4 | — |
| Signal cost field | PROTO-DEC-0051 item 1 | — |

## L7 Prose

| Procedure | Homes | Enf. |
|---|---|---|
| Reviews persisted, header, immutability | PROTO-DEC-0026; AGENTS.md:230 | S~ (corpus budget only) |
| Research documents | no kernel rule | — |
| Specs (`docs/specs/`) | no kernel rule | — |
| Context digest (M0) | PROTO-DEC-0034; PROTOCOL.md:325 | P |

## L8 Access expansion

| Procedure | Homes | Enf. |
|---|---|---|
| Access tiers and change legitimisation | PROTOCOL.md:97; PROTO-DEC-0041 | P |
| Reading is never forbidden; widening is recorded; anomaly duty | DISCUSSION.md §6; PROTO-DEC-0049 item 1 (widening in certification only) | — |
| Edits outside the repository | PROTO-DEC-0048 item 8 | P |

## L9 Code

| Procedure | Homes | Enf. |
|---|---|---|
| Before changing code; stay inside the task | AGENTS.md:413 §9 | P |
| Scope check | spec §5; `protocol-scope.cjs` `checkScope` | S |
| Git: no commit or push without the owner | AGENTS.md:431 §10 | S~ (agy gate only) |

## One rule, several homes

1. Escalation budget: five homes (L2 row).
2. Idle and liveness: four homes with three different numbers (15 minutes, 5 minutes,
   budget-based).
3. Findings-ledger format: PAIRED-CYCLE.md §4 and spec §2.
4. Verdict vocabulary and review modes: PROTOCOL.md:251, AGENTS.md §2, PAIRED-CYCLE.md §3
   and the review template.
5. Completion gate: AGENTS.md §2, PROTOCOL.md:291, PAIRED-CYCLE.md:304, PROTO-DEC-0032 and
   0038.
6. Paired cycle: PAIRED-CYCLE.md §2 and PROTOCOL.md:354.
7. Journal rules: AGENTS.md §5, PROTOCOL.md:123 and CLAUDE.md.

## Conflicts found

- **K1.** PAIRED-CYCLE.md:160 requires "one synthesis and one disposition table per
  round". The owner's structure for this cycle is three independent round-3 syntheses
  (DeepSeek, Claude and Codex), then a final plan by Claude or Codex. That structure is
  recorded in no decision block.
- **K2.** DEC-0014 carries `Status: Proposed` inside `.ai/DECISIONS.md`, which AGENTS.md §2
  forbids. This comes from the derived index.
- **K3.** PROTO-DEC-0036 closed Track C/Repomix permanently for this repository. Yet
  PROTOCOL.md:325-339 still prescribes the pinned `npx -y repomix@1.18.0` command as an
  optional digest (verified 2026-09-24).
- **K4.** PROTO-DEC-0049 item 3 refines the 15 minutes of PROTO-DEC-0047 item 6, and 0051
  item 4 refines 0049. PAIRED-CYCLE.md §5 reflects neither.
- **K5.** The no-commit rule is hard-enforced for agy only. Every other client relies on
  prompt text. vibe runs with `--auto-approve`.

## Empty or thin cells, as questions

- **Q-L0.** Where does "rule not found, stop and ask" live, and what enforces it?
- **Q-L2.** Research programmes (briefs, rounds, challenge, synthesis) have no kernel
  procedure, yet they consumed most of this week. Should they become a scenario with role
  slots?
- **Q-L2.** Journal entries are inserted by hand. Signal J: an insertion above the
  `archived-parent` marker on 2026-09-24. Should entries be written by a script command?
- **Q-L4.** Client failure knowledge lives in journals and outside the repository. Is the
  0050 registry its only home?
- **Q-L6.** No layer measures whether a verdict was right. Shadow scoring has no
  mechanism. What feeds calibration?
- **Q-L7.** Research and specs have no rules for header, lifetime or status. Which ones
  bind?
- **Q-L8.** The read-expansion rule agreed in the discussion is recorded only for
  certification.
- **Q-X.** Seven rules have several homes (above). Which home is canonical for each?
