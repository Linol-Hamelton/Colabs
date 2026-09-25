# Candidate matrix and tier table — first run of P-L3-002 and P-L3-003

- Produced by `claude-eb97ac9d13050014` on 2026-09-24 on the owner's workstation (PROTO-DEC-0062
  item 1, PROTO-DEC-0063). Procedures: `P-L3-002-model-discovery.md` 0.2, `P-L3-003-model-ranking.md` 0.2; owner answers PROTO-DEC-0064 (2026-09-25).
- Every value names its source. Nothing is filled from memory. Cells the provider's own information did
  not settle were decided by the owner (P-L3-003 step 5, PROTO-DEC-0064) and are marked so.
- Read-only: `--version`, `--help`, `help config`, model-list commands, one local config file, and
  official provider pages fetched with `curl` on 2026-09-24. No model was prompted.
- Matrices are per model maker; clients are routes (PROTO-DEC-0063 item 2).

## Step 1 — clients (routes)

| Client | Version | Reaches models of | Source |
|---|---|---|---|
| claude | 2.1.278 | Anthropic | `claude --version`, `claude --help` |
| codex | codex-cli 0.154.0 | OpenAI | `codex --version`, `codex debug models` |
| agy | 1.2.9 | Google; also Anthropic, OpenAI (gpt-oss) | `agy --version`, `agy models` |
| copilot | 1.0.88 | Anthropic, OpenAI, Google, xAI, Moonshot, Microsoft | `copilot --version`, `copilot help config` |
| vibe | 2.25.5 | Mistral | `vibe --version`, `~/.vibe/config.toml` |
| Kilo (IDE, no CLI) | — | DeepSeek | owner (PROTO-DEC-0043 item 7, 0056) |

## Step 2–3 — models, positioning and price per maker

Prices are per million tokens, input / output, standard rate, as on the page on 2026-09-24.

### Anthropic — `https://platform.claude.com/docs/en/models/overview`

| Model (API id) | Provider's words | Price | Reached through |
|---|---|---|---|
| claude-fable-5-1 | "For demanding reasoning and long-horizon agentic work"; the page says to use it "when your evals on Claude Opus 5.5 at higher effort still fall short" | $10 / $50 | claude, copilot |
| claude-opus-5-5 | "For long-running agentic coding and knowledge work"; "start with Claude Opus 5.5 for most workloads" | $4 / $20 | claude, copilot (as claude-opus-5) |
| claude-sonnet-5 | "The best combination of speed and intelligence" | $2 / $10 | claude, copilot |
| claude-haiku-4-5-20251001 | "The fastest model with near-frontier intelligence" | $1 / $5 | claude, copilot |

Ranks: **flagship claude-fable-5-1**, **second claude-opus-5-5**, **workhorse claude-haiku-4-5**
(lowest output price among the rest, R-L3-003 step 3).

### OpenAI — `codex debug models`; `https://developers.openai.com/api/docs/pricing`

| Model | Provider's words | Price | Reached through |
|---|---|---|---|
| gpt-6-astra | catalog priority 1, "Frontier intelligence for the most demanding work" | $10 / $50 | codex, copilot |
| gpt-5.6-sol | catalog priority 4, "Older coding model for complex work" | $4 / $20 | codex, copilot |
| gpt-5.6-terra | catalog priority 7, "Older balanced model for straightforward work" | not on the pricing page | codex, copilot |
| gpt-5.6-luna | catalog priority 8, "Older fast and efficient model" | not on the pricing page | codex, copilot |
| gpt-5.3-codex | — | $1.75 / $14.00 | copilot |
| gpt-5.5, gpt-5.4, gpt-5.4-mini, gpt-5-mini | — | not on the pricing page | copilot (gpt-5.5 also codex) |

Ranks: **flagship gpt-6-astra**, **second gpt-5.6-sol**, **workhorse gpt-5.6-luna** (owner,
PROTO-DEC-0064 item 2: terra and luna carry no published price; gpt-5.3-codex is priced at $14 output).

### Google — `https://ai.google.dev/gemini-api/docs/models`; `https://ai.google.dev/gemini-api/docs/pricing`

| Model | Provider's words | Price | Reached through |
|---|---|---|---|
| gemini-3.1-pro (preview) | "Advanced intelligence, complex problem-solving skills, and powerful agentic and vibe coding capabilities" | $2 / $12 (prompts ≤ 200k) | agy |
| gemini-3.8-flash | "Our most intelligent Flash model, engineered for long-horizon software engineering, autonomous agents, and complex enterprise workflows" | $0.75 / $3.75 through 2026-12-31 | agy, copilot |
| gemini-3.7-flash | "Our previous-generation Flash model for complex coding, agentic workflows, and reliable multi-step execution" | $0.75 / $3.75 through 2026-12-31 | agy, copilot |
| gemini-3.6-flash | "Our previous-generation Flash model, balancing speed and multimodal capabilities across general agentic and everyday tasks" | $0.75 / $3.75 through 2026-12-31 | agy, copilot |
| gemini-3.5-flash | "Our legacy Flash model, providing baseline speed and foundational performance for routine, high-throughput workloads" | $1.50 / $9.00 | copilot |

Ranks: **flagship gemini-3.8-flash**, **second gemini-3.1-pro**, **workhorse gemini-3.7-flash** (owner,
PROTO-DEC-0064 item 1: no page says which of 3.8 Flash and 3.1 Pro is the most capable).

### DeepSeek — `https://api-docs.deepseek.com/quick_start/pricing`

| Model | Provider's words | Price (peak) | Reached through |
|---|---|---|---|
| deepseek-flash (DeepSeek-V4.1-Flash) | none on the page | $0.30 / $1.20 | Kilo |
| deepseek-v4-pro (DeepSeek-V4-Pro-0813) | none on the page | $1.32 / $3.96 | **not used** (PROTO-DEC-0065 item 1) |

Ranks: **deepseek-flash 4.1** fills all three (PROTO-DEC-0065 item 1: deepseek-v4-pro is not used;
repeat rule of PROTO-DEC-0064 item 3).

### Mistral — `https://docs.mistral.ai/models`; `~/.vibe/config.toml`

| Model | Provider's words | Reached through |
|---|---|---|
| mistral-medium-3.5 | "Our frontier-class multimodal model optimized for agentic and coding use cases" | vibe (the only model configured) |

Ranks: **mistral-medium-3.5** fills all three (PROTO-DEC-0064 item 3).

### xAI — `https://docs.x.ai/developers/models` (model catalog embedded in the page)

| Model | Provider data | Price | Reached through |
|---|---|---|---|
| grok-4.5 | catalog entry; reasoning efforts low, medium, high, xhigh | prompt 20000, completion 60000 in the catalog's units (read as $2 / $6 per million; the page shows "/ 1M") | copilot |

Ranks: one reachable model, so **grok-4.5** fills all three (PROTO-DEC-0064 item 3).

### Moonshot — `https://platform.kimi.ai/docs/guide/kimi-k3-quickstart`; `https://platform.kimi.ai/docs/pricing/chat`

| Model | Provider's words | Price | Reached through |
|---|---|---|---|
| kimi-k3 | "Kimi K3 is Kimi's most capable flagship model to date" | row $3.00 / $6.00 / $0.30 / $3.00 / $15.00 per 1M; the column headers are not in the page text, output read as $15.00 | copilot |
| kimi-k2.7-code | "Kimi K2.7 Code and its high-speed variant for coding, multimodal input, thinking, tool calling, and 256K-token contexts" | not extracted | copilot |

Ranks: **flagship kimi-k3**, **second kimi-k2.7-code**, **workhorse kimi-k2.7-code** (repeat rule).

### Microsoft — reached through copilot only

| Model | Provider data | Reached through |
|---|---|---|
| mai-code-1.1-flash | listed in `copilot help config`; `https://ai.azure.com/catalog/models/mai-code-1.1-flash` answers 200 (not parsed) | copilot |

Ranks: one reachable model, so **mai-code-1.1-flash** fills all three.

## Step 5–6 — effort levels (three nearest the centre; even lists shift up; short lists repeat)

| Model or client | Ordered list (source) | Min / Mid / Max |
|---|---|---|
| OpenAI gpt-6-astra, gpt-5.6-sol | low, medium, high, xhigh, max, ultra (`codex debug models`) | high / xhigh / max |
| OpenAI gpt-5.6-luna | low, medium, high, xhigh, max (same) | medium / high / xhigh |
| Anthropic, through claude | low, medium, high, xhigh, max (`claude --help`) | medium / high / xhigh |
| Google 3.8 / 3.7 Flash, through agy | low, medium, high (`agy --help`; also model ids) | low / medium / high |
| Google gemini-3.1-pro, through agy | low, high (model ids in `agy models`) | low / high / high |
| xAI, Moonshot, Microsoft, through copilot | none, minimal, low, medium, high, xhigh, max (`copilot --help`) | low / medium / high |
| Mistral, through vibe | not exposed; config `thinking = "max"` | max / max / max |
| DeepSeek, through Kilo | not exposed at launch | unknown |

Whether each model accepts each level through its client is not reported; the first launch of each
model records the value it actually ran with (P-L2-002 R-L2-002.5).

## Tier table (PROTO-DEC-0059: model rank first; PROTO-DEC-0064: repeats)

| Maker (client) | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 |
|---|---|---|---|---|---|---|---|---|---|
| Anthropic (claude) | haiku-4.5 / medium | haiku-4.5 / high | haiku-4.5 / xhigh | opus-5.5 / medium | opus-5.5 / high | opus-5.5 / xhigh | fable-5.1 / medium | fable-5.1 / high | fable-5.1 / xhigh |
| OpenAI (codex) | luna / medium | luna / high | luna / xhigh | sol / high | sol / xhigh | sol / max | astra / high | astra / xhigh | astra / max |
| Google (agy) | 3.7-flash / low | 3.7-flash / medium | 3.7-flash / high | 3.1-pro / low | 3.1-pro / high | 3.1-pro / high | 3.8-flash / low | 3.8-flash / medium | 3.8-flash / high |
| DeepSeek (Kilo) | flash-4.1 / unknown | flash-4.1 / unknown | flash-4.1 / unknown | flash-4.1 / unknown | flash-4.1 / unknown | flash-4.1 / unknown | flash-4.1 / unknown | flash-4.1 / unknown | flash-4.1 / unknown |
| Mistral (vibe) | medium-3.5 / max | medium-3.5 / max | medium-3.5 / max | medium-3.5 / max | medium-3.5 / max | medium-3.5 / max | medium-3.5 / max | medium-3.5 / max | medium-3.5 / max |
| xAI (copilot) | grok-4.5 / low | grok-4.5 / medium | grok-4.5 / high | grok-4.5 / low | grok-4.5 / medium | grok-4.5 / high | grok-4.5 / low | grok-4.5 / medium | grok-4.5 / high |
| Moonshot (copilot) | k2.7-code / low | k2.7-code / medium | k2.7-code / high | k2.7-code / low | k2.7-code / medium | k2.7-code / high | k3 / low | k3 / medium | k3 / high |
| Microsoft (copilot) | mai-code / low | mai-code / medium | mai-code / high | mai-code / low | mai-code / medium | mai-code / high | mai-code / low | mai-code / medium | mai-code / high |

## Fallback routes through Kilo (P-L3-004, PROTO-DEC-0067)

- The primary route is the maker's official CLI, the client column of the tier table. When it is
  unavailable, Kilo is the fallback router: the cheapest suitable route of the same model in the
  recorded Kilo catalog, `kilo-routes.json`, written by `kilo-routes.cjs` from
  `kilo models <provider> --verbose` (Kilo 7.7.9, 2026-09-25). Suitability and the effort level
  follow R-L3-004.3. This table was generated with the launcher's own functions, so the table and
  the launcher cannot disagree.
- min / mid / max is the tier's position within the model's rank: T1, T4, T7 / T2, T5, T8 / T3, T6, T9.
  One automatic fallback per task; the further routes are for the owner to name explicitly.
- Prices per route are in `kilo-routes.json`. Routes priced 0/0 are the owner's own subscription
  or key (`openai/`, `openai-compatible/`).
- Present in the Kilo catalog but not considered now (owner, 2026-09-25: no new candidates in this
  change): gpt-6-sol, gpt-6-luna, grok-4.6, grok-4.7, the `-fast` and `-pro` serving variants and
  the `~...-latest` aliases.

| Maker | Model (tiers) | Primary: client, effort min / mid / max | Automatic Kilo fallback: min / mid / max | Further suitable Kilo routes | Not suitable |
|---|---|---|---|---|---|
| Anthropic | claude-haiku-4-5 (T1-T3) | claude, medium / high / xhigh | `openrouter/anthropic/claude-haiku-4.5` medium; `openrouter/anthropic/claude-haiku-4.5` high; `vercel/anthropic/claude-haiku-4.5` max | `vercel/anthropic/claude-haiku-4.5` | `openrouter/anthropic/claude-haiku-4.5` (highest level high is below xhigh) |
| Anthropic | claude-opus-5-5 (T4-T6) | claude, medium / high / xhigh | `openrouter/anthropic/claude-opus-5.5` medium / high / xhigh | `vercel/anthropic/claude-opus-5.5` | — |
| Anthropic | claude-fable-5-1 (T7-T9) | claude, medium / high / xhigh | `openrouter/anthropic/claude-fable-5.1` medium / high / xhigh | `vercel/anthropic/claude-fable-5.1` | — |
| OpenAI | gpt-5.6-luna (T1-T3) | codex, medium / high / xhigh | `openai/gpt-5.6-luna` medium / high / xhigh | `openrouter/openai/gpt-5.6-luna`, `vercel/openai/gpt-5.6-luna` | — |
| OpenAI | gpt-5.6-sol (T4-T6) | codex, high / xhigh / max | `openai/gpt-5.6-sol` high / xhigh / max | `openrouter/openai/gpt-5.6-sol`, `vercel/openai/gpt-5.6-sol` | — |
| OpenAI | gpt-6-astra (T7-T9) | codex, high / xhigh / max | `openai/gpt-6-astra` high / xhigh / max | `openrouter/openai/gpt-6-astra`, `vercel/openai/gpt-6-astra` | — |
| Google | gemini-3.7-flash (T1-T3) | agy, low / medium / high | `google/gemini-3.7-flash` low / medium / high | `openrouter/google/gemini-3.7-flash`, `vercel/google/gemini-3.7-flash` | — |
| Google | gemini-3.1-pro (T4-T6) | agy, low / high / high | `google/gemini-3.1-pro-preview` low / high / high | `openrouter/google/gemini-3.1-pro-preview`, `vercel/google/gemini-3.1-pro-preview` | — |
| Google | gemini-3.8-flash (T7-T9) | agy, low / medium / high | `google/gemini-3.8-flash` low / medium / high | `openrouter/google/gemini-3.8-flash`, `vercel/google/gemini-3.8-flash` | — |
| DeepSeek | deepseek-flash (T1-T9) | Kilo (openai-compatible, own key), unknown / unknown / unknown | `openrouter/deepseek/deepseek-v4.1-flash` low / high / max | `huggingface/deepseek-ai/DeepSeek-V4.1-Flash`, `vercel/deepseek/deepseek-v4.1-flash` | — |
| Mistral | mistral-medium-3.5 (T1-T9) | vibe, max / max / max | —; —; — | — | `openrouter/mistralai/mistral-medium-3-5` (highest level high is below max); `vercel/mistral/mistral-medium-3.5` (highest level high is below max) |
| xAI | grok-4.5 (T1-T9) | copilot, low / medium / high | `openrouter/x-ai/grok-4.5` low / medium / high | `vercel/spacexai/grok-4.5` | — |
| Moonshot | kimi-k2.7-code (T1-T6) | copilot, low / medium / high | `vercel/moonshotai/kimi-k2.7-code` low / medium / high | — | `openrouter/moonshotai/kimi-k2.7-code` (cannot set effort); `huggingface/moonshotai/Kimi-K2.7-Code` (cannot set effort) |
| Moonshot | kimi-k3 (T7-T9) | copilot, low / medium / high | `huggingface/moonshotai/Kimi-K3` low / high / high | `openrouter/moonshotai/kimi-k3`, `vercel/moonshotai/kimi-k3` | — |
| Microsoft | mai-code-1.1-flash (T1-T9) | copilot, low / medium / high | —; —; — | — | — |

## Notes

1. DeepSeek: deepseek-v4-pro is not used (PROTO-DEC-0065 item 1); flash 4.1 fills every tier.
4. How each client takes its model and effort (before launch or after) is the subject of a per-client
   procedure still to be written (PROTO-DEC-0065 item 2, stage 4).
2. xAI prices and the Moonshot price columns were read from embedded page data, not from a
   rendered table; the reading is stated in each row.
3. Microsoft's catalog page was reached but not parsed; with one reachable model, price and
   positioning do not change its ranks.
