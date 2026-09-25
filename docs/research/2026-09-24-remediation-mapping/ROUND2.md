# Remediation mapping - round 2 (challenge)

- Status: research dispatch, advisory. Round 1 is the four zone reports in this directory.
  Round 3 (Claude, Codex, DeepSeek) turns rounds 1 and 2 into a decision.
- Date: 2026-09-24. Written by claude-ebd3e8a8eb29a6d7 at the owner's request.
- Binding for all: `BRIEF.md` in this directory, including "How to treat risk"
  (PROTO-DEC-0049 item 4). Risks are found in order to cover them and reach the gain.
  "This is risky, drop it" is not a finding.

## Round-1 reports

| Zone | Report | Author |
|---|---|---|
| Z1 grammar for roles and agreement | `gemini-z1-grammar.md` | Gemini (replaced GLM, whose answer was rejected for false FACTs) |
| Z2 budget, immutability, collection scope | `mistral-z2-budget-scope.md` | Mistral |
| Z3 diff certification, producer Evidence, reproductions | `copilot-z3-diff-cert.md` | Copilot |
| Z4 five-minute idle exit | `qwen-z4-idle-exit.md` | Qwen |

## Assignments - nobody challenges their own zone

| Challenger | Zones | Output |
|---|---|---|
| Mistral | Z1, Z3 | `r2-mistral-z1-z3.md` |
| Copilot | Z2, Z4 | `r2-copilot-z2-z4.md` |
| Gemini | Z4, Z2 | `r2-gemini-z4-z2.md` |
| DeepSeek, last, after the three above | all four zones plus the three round-2 reports | `r2-deepseek-synthesis.md` |

## What a challenge contains

For every numbered point of the report you challenge:
1. Give one agreement line in the fixed form of PROTO-DEC-0048 item 3:
   `Agreement with <model> on item <ID>: <degree>.`
   Use one of the six degrees, worded exactly as in that block. Follow it with the
   justification. The justification is required for every degree other than "fully agree".
2. Check the point's FACTs. Open the cited `path:line` and run the reproduction if there
   is one. A FACT you could not confirm is marked as such, with what you actually saw.
3. Where the point is wrong or incomplete, give the correction and cover its risks in the
   BRIEF form: trigger, likelihood, impact, prevention, compensation, cost, residual.
4. Never quote the other report. Refer to it by item ID only. Matching prose is a
   citation defect under PROTO-DEC-0048 item 3.

Close each zone with:
- the points you would carry into round 3;
- the points you would drop, with the reason;
- the questions that only the owner can answer.

## Leads from a read-only spot check - verify each, accept none on trust

Z1 (Gemini):
- The migration of line 48 to `codex: coordinator` puts Codex in an excluded role, while
  line 51 makes it the slot-2 certifier. Codex and DeepSeek each have two Roles lines, and
  no merge rule is given.
- PROTO-DEC-0041 item 1 excludes roles "of that candidate". The grammar assigns roles
  with no candidate or scope binding.
- The migration drops constraints: no unilateral Completed; does not certify its own
  patches; for any candidate it neither authored nor controlled. Where should they live?

Z2 (Mistral):
- Option 3 compares all blocks raw. Is that a third attempt on R3-C05, which
  PROTO-DEC-0048 item 4 forbids, or audit input?
- "Certifier (DeepSeek, Copilot)": compare with PROTO-DEC-0046, where DeepSeek certifies
  nothing, and PROTO-DEC-0047 item 4, where Copilot is shadow only.
- `.ai/ARCHIVE.md` is cold history, not a home for proposals.
- The procedure is entirely manual, but the owner asked that exhaustion close the cycle
  at once. Can `protocol-verdict.cjs` `checkStopRule` emit that terminal state itself?

Z3 (Copilot):
- Verify the cited line ranges in `.ai/bin/protocol-handoff.cjs`.
- The package requires producer Evidence with `anchor: <Candidate>, clean tree`. In this
  shared checkout, `record` always reports "uncommitted changes present". Is a clean tree
  attainable outside a worktree?
- What does producing the package cost compared with the diff reading it saves?

Z4 (Qwen):
- The signals are the same text for six clients and none were measured.
- `.ai/runtime/<agent>-<id>.json` and journal mtime are session-level files. Check when
  each is actually written. A per-turn heartbeat is what a five-minute rule needs.
- Client transcripts exist and grow per turn: `~/.claude/projects/<project>/*.jsonl`,
  `~/.codex/sessions/`, agy `transcriptPath` in the hook payload. Kilo, Copilot and vibe
  are unmeasured. Measure them if you can, with read-only listing and mtime only.
- A test suite's child processes are activity, not idleness. A process waiting on a
  permission prompt for more than five minutes is a stall under PROTO-DEC-0049 item 3,
  not a false stall.
- The kill sequence is described in Unix terms (SIGTERM, SIGKILL); the hosts are
  Windows.

## Rules

1. Start your session with `node .ai/bin/protocol-session.cjs start --agent <name>`,
   unless hooks already started it. Follow `AGENTS.md`.
2. Write only your round-2 file and your own journal. No code, tests, `.ai/`, lock or
   commit. Do not edit the round-1 reports.
3. Mistral, Copilot and Gemini work in parallel. Do not open another round-2 report
   before yours is written. DeepSeek starts only after all three exist and reads them all.
4. Header: commit SHA; clean or dirty tree; model and client; UTC date; zones; the
   commands you actually ran. Label claims FACT, CLAIM or HYPOTHESIS; every repository
   FACT carries a `path:line` you opened.
5. Stay within 250 lines. Write a checkpoint line in your journal after each zone. Five
   minutes without progress is a stall; say so and stop.
6. Never write keys, tokens or passwords.
