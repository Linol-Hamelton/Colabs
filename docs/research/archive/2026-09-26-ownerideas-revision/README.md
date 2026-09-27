# OwnerIdeas revision — program package (owner dispatch 2026-09-26)

Entry point for every participant. Read this file, then `prompts/COMMON.md`, then the launch file
your slot names.

## Why

Before M3 the owner ordered a full revision of the idea corpus in `OwnerIdeas/`: what is already
implemented in the kernel, what is stale, which L0–L3 layers, procedures or mechanisms were missed,
what stays active, and what needs a separate research frame. The revision also decides what to
clean or archive, so that OwnerIdeas never becomes a second source of truth for a decision the
kernel already carries.

## Authority and provenance

- The owner's dispatch, verbatim: `DISPATCH-OWNER.md` (owner chat 2026-09-25T23:23:58Z, transcribed
  2026-09-26 by `kilo-f22faac486b5e567`).
- The corpus was synchronized into Git before the revision: commit `7b6d17a` adds the five sources
  that existed only on disk. Manifest and verification: `CORPUS.md`.
- The prompts were written by `kilo-f22faac486b5e567` (Kilo Code session). It transcribes the
  owner's requirements and operates the chain runner; it holds no role in the review frames,
  decides nothing and certifies nothing.
- Nothing here is a decision (AGENTS.md section 2). Reports are advisory inputs to the owner.

## Frozen assignments (owner dispatch section 20; no substitution)

| Role | Model | Effort | Route | Agent name |
|---|---|---|---|---|
| R1 reviewer — Gemini | Gemini 3.8 Flash | high | agy, marker `gemini-3.8-flash-high` | gemini |
| R1 reviewer — Claude | Claude Opus 5.5 | xhigh | claude CLI | claude |
| R1 reviewer — DeepSeek | DeepSeek 4.1 Flash | unknown (route exposes none; frozen as unknown) | `kilo run -m deepseek/deepseek-flash` | deepseek |
| R1 reviewer — Mistral | Mistral Medium 3.5 (senior reachable through the matrix) | max (client config; not a flag) | vibe | mistral |
| Synthesis A | Kimi K2.7 Code HighSpeed | high (client thinking config) | `kimi` CLI, `-m moonshot-ai/kimi-k2.7-code-highspeed` (owner-confirmed local CLI, 2026-09-26; the Vercel route was denied that day) | kimi |
| Synthesis B | MiMo-V2.6-Pro | high | `mimo` CLI, `-m xiaomi/mimo-v2.6-pro --variant high` (owner-confirmed local CLI and Xiaomi credential, 2026-09-26; the Vercel and OpenRouter routes were unavailable that day) | mimo |
| Resolution, 5 packages, closure | Claude Opus 5.5 | high (owner cap 2026-09-26: not above Opus 5.5 High; was xhigh) | claude CLI | claude |
| Plan, pre-check, post-implementation review, final review | DeepSeek 4.1 Flash | unknown | `kilo run -m deepseek/deepseek-flash` | deepseek |
| Cleanup, repair | Gemini 3.8 Flash | high | agy | gemini |
| Repair verification | GPT-5.6 Sol (owner change 2026-09-26, PROTO-DEC-0086 item 2; was Mistral Medium 3.5) | medium | codex | codex |
| Stage-8 executors | E1 Gemini 3.8 Flash (high); E2 Mistral Medium 3.5 (max), one per edit stream (PROTO-DEC-0086 item 2) | - | agy / vibe | gemini / mistral |
| High-risk certifiers | Kimi K2.7 Code HighSpeed and MiMo-V2.6-Flash; neither executes stage 8 (PROTO-DEC-0086 item 1) | - | kimi / mimo | kimi / mimo |

A route that fails BLOCKS its slot and goes to the owner; there is no automatic move to another
model or effort. The stage-8 executor set is named before that stage starts and fixed then.

## Layout

| Path | What | Written by |
|---|---|---|
| `DISPATCH-OWNER.md` | the owner's dispatch, verbatim | transcription |
| `CORPUS.md` | frozen corpus manifest (sha256) and the sync verification record | operator |
| `prompts/COMMON.md` | rules for every participant | operator |
| `prompts/R1-REVIEW.md` | the round-1 review prompt | operator |
| `prompts/run/r1-*.md` | one launch file per round-1 slot | operator |
| `prompts/DISPATCH.json` | chain-runner table for stage 1 | operator |
| `round1/REVIEW-GEMINI.md`, `-CLAUDE.md`, `-DEEPSEEK.md`, `-MISTRAL.md` | the four independent reviews (`OWNERIDEAS-REVIEW-*.md` in the dispatch) | each reviewer |
| `USAGE.md` | per-run usage, from the runner | runner |

Later rounds add their own files when their inputs exist.

## Order

1. Sync the corpus (done, `7b6d17a`).
2. Round 1: four independent reviews, in parallel (running).
3. Freeze the corpus (`OwnerIdeas` + four reviews).
4. Two independent syntheses (Kimi, MiMo) — each reads the whole frozen corpus.
5. Claude resolves the boundary: cleanup list, active list, research list; work splits.
6. Gemini executes the approved cleanup; DeepSeek writes the single plan.
7. Two independent plan critiques (Kimi, MiMo), then Claude's final resolution and five
   implementation packages; DeepSeek pre-checks; five executors run in parallel.
8. DeepSeek reviews the implementation; Gemini repairs; verification is by GPT-5.6 Sol (codex;
   owner change 2026-09-26, PROTO-DEC-0086 item 2). **Stage 12 (final closure) is owner-run in the
   cloud Claude session** (owner instruction 2026-09-26): the operator prepares the input manifest
   and the prompt and reports readiness; no r12 slot is created and nothing is launched for it.

## How to run (operator)

```
node docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs docs/research/2026-09-26-ownerideas-revision/prompts/DISPATCH.json status
node docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs docs/research/2026-09-26-ownerideas-revision/prompts/DISPATCH.json report
node docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs docs/research/2026-09-26-ownerideas-revision/prompts/DISPATCH.json show <slot>
node docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs docs/research/2026-09-26-ownerideas-revision/prompts/DISPATCH.json stop|accept <slot> [reason]
```

The runner (detached): `... DISPATCH.json runner`. State: `.ai/runtime/ownerideas-revision/`.
