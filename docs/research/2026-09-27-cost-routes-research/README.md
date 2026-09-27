# Study: zero-cost routes and official prices (owner prompt 2026-09-27)

Status: ROUNDS COMPLETE 2026-09-27 (operator `kilo-9a9b18229cce57fd`). Five registries are
published at the study root; round-2 verification rendered FAIL to the drafts
(`round2/VERIFICATION.md`), and its UNVERIFIABLE/REFUTED items are carried as OPEN QUESTION in the
registries and listed in `GAPS.md`. Collector drafts were salvaged from kept clones after the
dispatcher marked both attempts POLICY_FAILURE (scope check on untracked `copyIn` files; an
operator configuration error, not a collector defect).

Binding input: `OWNER-PROMPT.md` (owner prompt, committed `1fae654`). It defines scope, the hard
boundaries and the acceptance criteria; where this file and the prompt disagree, the prompt wins.
The prompt is not edited.

This is a fact-gathering study: it produces registries of declared prices and observed CLI
behaviour, and recommends no decision (the operator decides nothing). It is not admitted to
`docs/research/FRAMES.md`; the gate owner may rule otherwise.

## Team and routes (owner-named)

| Slot | Client | Model, effort | Writes |
|---|---|---|---|
| `cr-collector-a` | agy | `gemini-3.7-flash-high` | `round1/COLLECTOR-A.md` |
| `cr-collector-b` | kilo | `deepseek/deepseek-flash`, max | `round1/COLLECTOR-B.md` |
| `cr-verifier` | codex | `gpt-5.6-luna` | `round2/VERIFICATION.md` |

Dispatched through the kernel launch path (`.ai/bin/protocol-dispatch.cjs`), dispatch file
`prompts/DISPATCH.json`; each attempt runs in a private clone, and only the declared output and
the agent's own journal are imported back.

## Service allocation

The owner prompt names Collector A = Google/Antigravity, copilot, claude and Collector B = the
key/gateway cluster. The remaining inventory is assigned by the operator:

- **Collector A:** claude (Anthropic), codex (OpenAI), agy (Antigravity/Google), copilot (GitHub),
  vibe (Mistral), Gemini API key.
- **Collector B:** DeepSeek own key, OpenRouter, HuggingFace, Moonshot API and kimi, Kilo gateway,
  Vercel AI Gateway, mimo (Xiaomi).

## Deliverables

| File | Content | Author |
|---|---|---|
| `COST-ZERO-ROUTES.md` | service -> CLI -> model id -> $0 mechanism -> limit -> reset window -> exhaustion check -> source+date | operator, after verification |
| `PRICES-OFFICIAL.md` | service -> model -> in/out per 1M -> currency -> URL+date | operator |
| `FREE-UNTIL-BALANCE.md` | $0/minimal-price models on credit services while balance > 0; conditions | operator |
| `GAPS.md` | what could not be established, why, what is needed from the owner | operator |
| `EVIDENCE.md` | commands and their output, links; FACT / INFERENCE / OPEN QUESTION | operator |

## Evidence rules (binding for every agent in this study)

1. Official vendor channels only: price pages, subscription documentation, CLI docs, `--help`,
   official model listings, configs. No third-party reviews or aggregators; an aggregator's own
   official page is a source only for what that service serves to us.
2. Every fact carries a URL and a retrieval date (UTC, 2026-09-27), or the exact command and its
   captured output (for empirical facts), or both.
3. Labels on every item: `FACT` (source or reproduction attached), `INFERENCE` (only with the
   evidence it derives from), `OPEN QUESTION` (unknown; state what would resolve it). No estimate
   without a label.
4. No secrets in any file: never copy a key, token or password; refer to credentials by name.
5. Never attempt to exhaust a quota or limit; observe and record only.
6. Each report is at most 250 lines; tables preferred. Russian (ru-RU) for the five final
   artifacts and the collector drafts; the verifier report too.
7. Write only the declared output file and your journal; no commits, tags, pushes or branches;
   never touch `.ai/bin`, `tests/`, `docs/specs/`, VPN production or the kernel.

## Acceptance criteria (from OWNER-PROMPT.md)

- Every inventory service is covered across questions 1-7 or explicitly marked uncovered with a
  reason.
- Every "$0" claim has either an official document or a reproduced command with output.
- No unlabelled judgement; no third-party sources.
- Reports <= 250 lines each; tables preferred.

## Questions (per service)

Q1 model list reachable through the CLI (exact ids/aliases, including lower and "included"
tiers); Q2 which are $0 on the subscription and by which mechanism (included/0x multiplier,
credits, rolling quota, free tier), with limit and reset window; Q3 behaviour at exhaustion,
with one short cheap-or-$0 mini-check per CLI (exact error text); Q4 tariff model (what counts
as a premium request/credit, how many in the plan, reset cadence, what happens to included
models after exhaustion); Q5 per API key: full model list and official prices in/out per 1M
tokens, including free variants reachable with our key; Q6 "free until balance runs out" models
on credit services, how it is verified, what happens at zero balance; Q7 suitability for the
dispatcher task profile (contexts tens-to-hundreds of thousands of tokens, minutes of work,
agentic steps) and the windows/limits that constrain it.

## Layout

`OWNER-PROMPT.md`, `README.md` (this file), `prompts/DISPATCH.json`,
`prompts/run/collector-a.md`, `prompts/run/collector-b.md`, `prompts/run/verifier.md`,
`round1/COLLECTOR-A.md`, `round1/COLLECTOR-B.md`, `round2/VERIFICATION.md`, `USAGE.md` (written by
the dispatcher), the five final artifacts at the root.
