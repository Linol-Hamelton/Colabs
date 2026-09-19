# H1 Pilot - Smoke Batch Report (Agent Manager + Trial Template)

**Date**: 2026-09-19  
**Baseline**: `001af50` (trial template commit)  
**Author**: DeepSeek (deepseek-flash), controller  
**Purpose**: validate the Agent Manager execution path and the trial prompt template. This batch ran in parallel and is **not pilot-grade data** (timing metrics invalid).

## 1. Batch

Seven worktree sessions, Arm A (control), Task 6 (narrow edit), repetition 1, one per model: Claude Opus Latest, Gemini 3.8 Flash, GPT-5.1, DeepSeek V4 Pro, Qwen3 Max Thinking, Mistral Medium 3.5, GLM-5.3; variants `high`.

## 2. Results

| Model | Resolved provider | Outcome | Evidence |
|---|---|---|---|
| DeepSeek V4 Pro | **deepseek** (native) | **Trial completed, quality PASS** | `LOCK_ACQUIRE_TIMEOUT_MS = 5000` added and exported; unit test added; `tests/lock.test.cjs` 19/19 green in the worktree; journal `pilot-a-da116431254262a3.md` (29 lines, five labels); telemetry `{"changedFiles":2,"durationSec":93,"firstEditMs":20132,"handoffComplete":true,"gitHead":"001af50..."}` |
| Claude Opus Latest | kilo | **No response** | Session has the user prompt and an empty assistant turn; worktree clean, no journal, no metrics |
| Gemini 3.8 Flash | kilo | No response | same pattern |
| GPT-5.1 | kilo | No response | same pattern |
| Qwen3 Max Thinking | kilo | No response | same pattern |
| Mistral Medium 3.5 | kilo | No response | same pattern |
| GLM-5.3 | kilo | No response | same pattern |

All six empty sessions are `idle` with zero git changes; their transcripts contain no assistant message at all.

## 3. Analysis

1. **The template and the Agent Manager path work end to end.** The DeepSeek trial exercised every element: template read, protocol session start/stop, telemetry line, journal entry with the five labels, the narrow edit with its own test, and the machine-readable report. It is recorded as the reference smoke row in `.ai/runtime/pilot-data/trials.jsonl`.
2. **The failure is provider-side, not protocol-side.** The owner captured the provider error: every empty session failed with **HTTP 403 Forbidden from `https://api.kilo.ai/api/openrouter/chat/completions`** (Kilo gateway; `x-vercel-mitigated: deny`). The Kilo extension login cannot be authorized in this VS Code installation, so all `kilo`-provider models are unreachable regardless of VPN or patcher state; DeepSeek works because it is connected with a direct provider token (native `deepseek` route). This also explains why the no-VPN Qwen/GLM sessions failed through the gateway.
3. **Consequence for the pilot**: official trials require per-provider access arranged first; the model set must be finalized by what is actually reachable. Recommended access groups: (a) native providers that answer directly (DeepSeek today; possibly others if the catalog offers a native provider for them), (b) VPN group, (c) patcher group, (d) gateway group - each run in its own network mode, sequentially, never mixed.
4. **Timing caveat**: even the successful trial ran while six sessions were being spawned in parallel; its `durationSec`/`firstEditMs` are smoke-only. Token usage was not captured (UI only); the row records `token_source: "unavailable"`.

## 4. Owner actions and decisions (2026-09-19)

1. **Done - empty sessions removed**: the six idle sessions and their worktrees were stopped and deleted (`a-6-1-claude` via `helix-mum`, `a-6-1-gemini`, `a-6-1-gpt`, `a-6-1-qwen`, `a-6-1-mistral`, `a-6-1-glm`); the DeepSeek reference worktree `a-6-1-deepseek` is kept as raw evidence. Leftover orphan worktrees were pruned.
2. **Owner decision**: no commit of the smoke artifacts yet - normal data first.
3. **Access**: the Kilo gateway returns 403 on authorization; the other models cannot be added through this harness until the extension login works or an alternative harness is used (native CLI with VPN/patcher: Claude Code, Gemini CLI, Qwen Code; or a Kilo API key instead of the extension login).
4. **Open decision**: the official pilot can proceed as a single-model A/B experiment with DeepSeek (direct token) while the other harnesses are arranged, or it waits for multi-model access. The single-model A/B still tests the H1 core (does the digest reduce tokens on broad tasks) and needs one confirmation: whether per-session token usage is retrievable for the direct-provider sessions (harness UI or DeepSeek platform export).

## 5. Status

- Template: validated. Agent Manager orchestration: validated for a native provider; gateway path blocked by the environment.
- No main-tree file changed by the batch; the trial worktrees are isolated.
