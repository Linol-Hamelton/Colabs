# Improvement research, 2026-09-25 — Google AX and beyond (study A), adaptive execution depth (study B)

Entry point for every model that works here. Read this file, then the index of `BRIEF.md`, then
your own prompt. Directives: PROTO-DEC-0066 (the research), PROTO-DEC-0067 (routes and failover). Coordinator and author of the prompts:
`claude-opus-5-5` (session `claude-eb97ac9d13050014`), which holds no other role in these frames.

## Why

- Study A answers O-01: what Google AX, and every other improvement the sources suggest, can give
  Colabs in speed, agent accuracy, context quality, convenience, architecture, security,
  scalability, fault tolerance and cost. Seeds: `OwnerIdeas/Google_AX.md`, `MCP_Server.md`, `Rust.md`.
- Study B answers O-02: an adaptive policy that sets how deep a task is executed (how many
  independent agents, which reviewers, critics, synthesis, certification) from its type, base
  frequency F1–F5 and risk, with models then chosen separately through P-L2-002.
- Both are research: they propose. Nothing here changes the kernel or reopens a decision.

## Layout

| Path | What | Written by |
|---|---|---|
| `BRIEF.md` | the owner's answers O-01..O-08, verbatim, with an index | coordinator |
| `prompts/A-research.md`, `prompts/B-research.md` | one prompt per study, the same for its three researchers | coordinator |
| `prompts/A-synthesis.md`, `prompts/B-synthesis.md` | one prompt per study for its synthesiser | coordinator |
| `prompts/run/<job>.md` | one job file per executor: agent name, model id, output files | coordinator |
| `prompts/launch.cjs`, `prompts/K-launch.md` | the launcher (P-L3-004) and the prompt of the Kilo Code session that runs it | coordinator |
| `A/<model>-registry.md`, `-cards.md`, `-report.md`, `-measurements.md` | one set per study-A researcher | each researcher |
| `B/<model>-taxonomy.md`, `-policy.md` | one set per study-B researcher | each researcher |
| `A/synthesis.md`, `A/synthesis-registry.md`, `B/synthesis.md` | the syntheses | each synthesiser |

`<model>` is the model id your job file gives, for example `gemini-3.1-pro`.

## Order

1. Wave 1, now and in parallel: three A researchers and three B researchers (O-06).
2. When all three files of a study exist: its synthesiser.
3. The owner approves a priority set. Wave 2: prototypes and A/B tests as separate tasks under
   P-L0-007, in a disposable clone (O-07). Only wave 2 can mark a hypothesis CONFIRMED or REJECTED,
   except where a wave-1 measurement settles it.
4. Study B's synthesis feeds the triage and escalation part of CORE-ARCH stage 3 (O-08).

## Dispatch (P-L2-002 for the model, P-L3-004 for the route)

Rubric (size, protected, novelty, reversibility, ambiguity, coupling):
- researchers of A: 2+0+2+0+2+2 = 8, so T6;
- researchers of B: 2+0+1+0+2+2 = 7, so T6;
- each synthesiser: 1+0+1+0+2+2 = 6, so T5.

No floor applies: the frames write only under this folder. Cells come from
`docs/core-arch/stage-4/MODEL-MATRIX.md`. `claude-opus-5-5` is excluded as coordinator.

| Job | Frame | Role | Model / effort | Primary route | Automatic Kilo fallback | `--agent` |
|---|---|---|---|---|---|---|
| a-sol | `task:research-a` | researcher | gpt-5.6-sol / max | codex | `openai/gpt-5.6-sol` max | codex |
| a-gemini | `task:research-a` | researcher | gemini-3.1-pro / high | agy | `google/gemini-3.1-pro-preview` high | gemini |
| a-deepseek | `task:research-a` | researcher | deepseek-flash / unknown | Kilo, own key | `openrouter/deepseek/deepseek-v4.1-flash` max | deepseek |
| a-synth | `task:research-a` | synthesiser | kimi-k2.7-code / medium | copilot | `vercel/moonshotai/kimi-k2.7-code` medium | copilot |
| b-grok | `task:research-b` | researcher | grok-4.5 / high | copilot | `openrouter/x-ai/grok-4.5` high | grok |
| b-kimi | `task:research-b` | researcher | kimi-k2.7-code / high | copilot | `vercel/moonshotai/kimi-k2.7-code` high | kimi |
| b-mistral | `task:research-b` | researcher | mistral-medium-3.5 / max | vibe | none: no Kilo route reaches max | mistral |
| b-synth | `task:research-b` | synthesiser | gemini-3.1-pro / high | agy | `google/gemini-3.1-pro-preview` high | agy |

- How to launch: in a Kilo Code session (mode Code), send the one line
  `Read and follow the file docs/research/2026-09-25-improvement-research/prompts/K-launch.md`.
  That session runs `prompts/launch.cjs`, which starts every job with the one ASCII line
  `Read and follow the file docs/research/2026-09-25-improvement-research/prompts/run/<job>.md`.
  The job file names the job's agent, model and output files, then sends the executor to its study
  prompt. The Kilo session itself: any T2 cell of the matrix, for example gemini-3.7-flash / medium
  through Kilo's `google/gemini-3.7-flash` route; it holds no role in the research frames.
- The launcher checks every command against its client's own help before anything runs
  (`--check`: 24 of 24 commands parse, no model called, 2026-09-25). It fails over by P-L3-004. Every
  attempt runs in a disposable git worktree, and only the job's outputs and new journals come back
  (PROTO-DEC-0070, R-L3-004.9). Its self-test (`prompts/launch-test.cjs`, fake clients) has 15
  scenarios and 52 pure checks: 70 of 70 in three runs in a row on Windows, 2026-09-25.
- One model holds one role in a frame (R-L2-002.2). A synthesiser is never a researcher of its own
  study. Researchers of one study do not read each other before their own files are written
  (R-L1-researcher.2). Swapping a job's model means editing `launch.cjs` and its job file, and is
  an owner decision.
- Study A needs web access, a shell and the repository. A client without web access still runs,
  and its report says which sources were unreachable.

## Status

| Output | State |
|---|---|
| Launch | waits for DeepSeek's second-pass verdict on package L: `docs/reviews/2026-09-25-claude-core-arch-stage2-fix-response-addendum-1.md` |
| A researchers (3) | not started |
| B researchers (3) | not started |
| A synthesis | waits for A |
| B synthesis | waits for B |
