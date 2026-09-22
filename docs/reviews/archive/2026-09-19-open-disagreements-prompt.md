# Open Disagreements - Discussion Prompt (Human + Models)

**Date**: 2026-09-19  
**Author**: DeepSeek (deepseek-flash), controller  
**Purpose**: surface and settle every accumulated disagreement between the human owner and the models, and between models, before the v2 execution starts.  
**How to answer**: each participant answers **all** items with four fields: (1) Position, (2) Evidence (repository paths or commands), (3) What would change my mind (falsifier), (4) Minimal compromise. FS-capable reviewers write `docs/reviews/2026-09-19-<agent>-disagreement-positions.md`; text-only participants answer `[MODE: READ-ONLY ADVISORY]` and the owner transcribes. The owner answers the `H` items in chat; those answers are binding.

## Items

| # | Question | Known positions |
|---|---|---|
| D1 | Is the Repomix index path worth any further runs for this repository? | Gemini and CodeGeeX: likely dead on arrival (small repo, index overhead >= savings); DeepSeek and Qoder: B2/B3 untested, one cheap run settles it |
| D2 | Primary metric formula for v2 | DeepSeek: fresh tokens primary, total secondary; Gemini: cost-weighted `(In*0.1)+(CacheRead*0.01)+(Out*1.0)`; CodeGeeX: fresh tokens; Qoder: cost-weighted + tokens-per-finding |
| D3 | Threshold pair | Plan/DEC-0035: 25% broad / +5% narrow; CodeGeeX: 20% / +3%; counter-position (Gemini): lowering invites statistical false positives from 8-9B variance |
| D4 | Secondary metrics and who "accepts" a finding | Gemini: automated checks only; CodeGeeX: tokens-per-finding is gameable (trivial findings); Qoder: token-per-finding needed |
| D5 | Local subject model | DeepSeek plan: `omnicoder-2-9b` + `qwen3:8b`; CodeGeeX: `qwen2.5-coder:7b`; Qoder: `qwen3:8b`; owner R2: HF Inference API instead of `qwen-code` |
| D6 | Remote access route for free subjects | Owner: HF Inference API via CLI (card issues block qwen-code); Gemini/CodeGeeX: local Ollama or `agy`; DeepSeek: `agy` inside the Gemini quota plus local Ollama |
| D7 | Cleanup depth | Owner: maximum cleanup of spent data whose decisions are made and implemented; protocol (AGENTS.md): archive, never delete; DeepSeek: preserve `DECISIONS.md`, `REGISTRY.md`, certifying reviews, `ARCHIVE.md`; Gemini/CodeGeeX: ref-surface cleanup now, v2.0 later |
| D8 | v2.0 history-freeze timing and criteria | DeepSeek: only after v2 closes, v1.x repo stays as archive; CodeGeeX: only if evidence must be re-recorded; owner: undecided |
| D9 | Process hardening scope | Council additions: concurrent-writer ban during freeze, environment pinning, lock/process sweep, power-state note, model-version pinning; counter: ossification risk (Qoder) and scope creep |
| D10 | Paid/free boundary edge cases | Owner policy: tests free/local, paid for analysis/coding, Gemini exception; edge cases: is a pilot run "test" or "analysis"? are HF Inference API credits "free"? does the Gemini exception extend to its quota used by other models via `agy`? |
| D11 | Audit closure details | All: downgrade Qoder to advisory; Codex receipt: re-record at freeze vs cite as advisory anchored to `001af50`; DeepSeek: re-record if quota permits |
| D12 | Role of Agent Manager vs CLI for future councils | Owner: Agent Manager for DeepSeek-class subjects, CLI for Gemini; DeepSeek: record both as execution vectors with the workflow caveat |

## Rules for the answers

1. Do not restate agreed facts; argue only where you disagree.
2. Any claim about the repository must be verifiable with a path or command.
3. Where you have no position, say "no position" rather than inventing one.
4. The owner's chat answers to the `H`-marked items (D7, D8, D10 plus any item the owner chooses to rule on) are binding and close the item.
5. No implementation, no commits, no runtime changes before the owner rules.
