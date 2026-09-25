# Kernel architecture - research brief for Mistral, GLM, Copilot and Qwen

- Status: research dispatch. Advisory. Nothing produced under it is a decision, and it
  authorises no change to the protocol, the kernel or any product.
- Date: 2026-09-23. Written by claude-ebd3e8a8eb29a6d7 at the owner's request.
- Subject: `docs/research/2026-09-23-kernel-architecture/DISCUSSION.md` (in Russian), the
  owner's and Claude's discussion of a cascaded, layered protocol kernel.

## Why this exists

The kernel only grows. `AGENTS.md` (~5.3k tokens) is loaded in every session, and a
certifier loaded ~62k tokens this week, most of which its task did not need. The
discussion proposes a short meta-root, then roles, procedures and scenarios, tools,
application, state, metrics, prose, access expansion and code (layers 0-9). Each agent
would receive a packet compiled from its (role, stage, task) instead of the whole kernel.
Before any of it is designed, the owner wants independent research on the open
questions in section 9 of the discussion.

## Assignments - one owner per question, no overlaps

| Agent | Questions (DISCUSSION.md section 9) | Deliverable file |
|---|---|---|
| GLM | 1 missing layers; 2 order of root procedures; 4 tree depth; 7 cascade failure modes | `glm-architecture-critique.md` |
| Copilot | 5 how each client natively loads instructions, and whether it can load them conditionally or lazily | `copilot-client-loading.md` |
| Mistral | 6 prior art; 3 where metrics belong | `mistral-prior-art-metrics.md` |
| Qwen | 8 enforcing the root size cap and "one rule, one home" with scripts, tested on a rule-to-layer map of `AGENTS.md` | `qwen-rule-map-single-source.md` |

All files go in `docs/research/2026-09-23-kernel-architecture/`.

### GLM - architecture critique

Attack the ten-layer scheme in section 5 of the discussion; do not polish it.
- Name any layer that is missing or redundant, and any two layers that are really one.
- Rank the root procedures 0-5 and give a reason for each position. Answer directly
  whether dispatch belongs above escalation.
- State the maximum depth from trunk to leaf and what breaks beyond it.
- List the failure modes: misrouting, a stale packet, taboo avoidance, an unbounded loop,
  and an invariant that conflicts with a procedure. Add any others. For each, give a
  defence that a script can check, or say that none exists.
- Give at least one alternative decomposition that differs from the discussion's.

### Copilot - client loading mechanics

Cover these clients: Claude Code, Codex CLI, Kilo Code, agy (Antigravity), Copilot
CLI/VS Code, vibe, CodeGeeX and Qoder. For each, record:
- which instruction files it reads and in what order: global, repository, nested
  directories;
- whether imports or includes are followed;
- whether conditional loading exists (path globs, `applyTo`, per-mode rules) and whether
  lazy loading exists (skills, where only the description is loaded until the body is
  needed);
- the size limits it enforces or truncates at;
- how an injected hook context differs from a file it reads itself.

Verify each fact from `--help`, the client's own documentation or a live probe in a
throwaway directory, and record the CLI version and date for each. The question to
answer: on which clients can a router load a packet natively, and on which must the
packet be pasted into the prompt?

### Mistral - prior art and metrics

For each prior-art family, say what it already solves for this problem, what it does not
solve, and what it would cost to adopt here:
- hierarchical state machines and statecharts;
- BPMN;
- progressive disclosure in agent skills;
- directory-scoped `AGENTS.md`;
- handoff and routing in agent frameworks (LangGraph, OpenAI Agents SDK, CrewAI, AutoGen
  or AG2).

Then answer question 3: should metrics be a separate layer, or an output of every node,
recorded the way Evidence blocks are? Build the answer on
`docs/research/2026-09-23-routing/Q12-metrics-logging.md`, and on the finding in
`INDEX-draft.md` that the measurement layer is not yet reliable.

### Qwen - rule map and single-source checks

Stay bounded to `AGENTS.md`, sections 1-12.
1. Split the text into atomic rules, one normative statement each. Give every rule an id
   and its `AGENTS.md:line`.
2. Assign each rule to one layer from 0 to 9. Report the rules that fit no layer and the
   rules that fit two, because those are the data the discussion asks for.
3. For each rule, search `.ai/docs/PROTOCOL.md`, `.ai/docs/PAIRED-CYCLE.md`,
   `.ai/docs/CLI-AGENTS.md` and `CLAUDE.md` for a restatement. Cite every hit as
   `path:line`.
4. Propose script checks for a root size cap and for single-source rules, for example
   rule ids with one home plus a restatement detector. Give inputs, outputs and exit
   codes in the form of section 1 of `docs/specs/2026-09-23-executable-rulebook-spec.md`.
   Write no code.

## Rules for all four

1. Start your session with `node .ai/bin/protocol-session.cjs start --agent <name>`, unless
   hooks already started it, and follow `AGENTS.md`. Read `DISCUSSION.md` in full before
   anything else.
2. Research only. Write exactly one report file, the one named above, plus your own
   journal. Do not edit `AGENTS.md`, `.ai/`, `.claude/`, `.codex/`, kernel scripts,
   `.ai/DECISIONS.md`, `.ai/TASK.md`, `.ai/PLAN.md`, other research files or any product
   repository. Do not commit, and do not touch the candidate now in certification.
3. Work independently. Do not open the other three reports before your own is written.
   Where two reports touch the same point, the value is in their reaching it separately.
4. Report header:
   - commit SHA from `git rev-parse HEAD`;
   - working-tree state, clean or dirty;
   - model and client;
   - date in UTC;
   - assigned questions;
   - the commands you actually ran.
5. Label every claim FACT, CLAIM or HYPOTHESIS, as in `docs/research/2026-09-23-routing/`.
   - A FACT about the repository carries a `path:line` you have opened.
   - A FACT about an external tool carries a URL or `--help` output with its version and
     date.
   - What you know only from training is a CLAIM marked "unverified, from training".
   - The routing round found MEASURED labels with no measurement behind them and
     citations pointing at the wrong lines. Do not repeat that.
6. Sections the report must contain:
   - an answer to each assigned question;
   - at least three objections to `DISCUSSION.md`: where it is wrong, weakest, or
     assumes what it should prove;
   - what evidence would change your recommendation;
   - what you did not verify.
7. Keep the report to 250 lines or fewer. Write a checkpoint line in your journal after
   each section, so that a fresh session can resume from the repository.
8. Never write keys, tokens or passwords.
9. Without filesystem access, return the report in chat headed
   `[MODE: READ-ONLY ADVISORY]`. The owner then persists it with the transcription header
   of `AGENTS.md` section 5, item 5.

## What happens next

The coordinator collects the four reports and records where they agree, where they
conflict and what none of them covered. Their findings feed sprint S1 in section 8 of the
discussion, which the owner has not yet scheduled. Only the owner turns any of it into a
decision.
