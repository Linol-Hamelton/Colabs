# Model economics: the dynamic layer of costs, limits and routing preferences

- What this is: the changing facts that a model resolver needs (PROTO-DEC-0075 items 9-10): which
  subscriptions and balances exist, what they cost, how much is left, and the owner's current
  preference among models.
- What this is not: kernel. The owner (chat, 2026-09-25): "реальность и она не имеет отношения к
  ядру потому что это может меняться это должно храниться в каком-то динамическом слое - о
  стоимости и расходах". No decision block cites a number from here as a rule.
- Update rule: newest snapshot first; each snapshot dated, with its source (the owner's screenshot,
  a CLI output, or a runner's usage record). Old snapshots stay as history until they are moved to
  an archive file.

## Owner's current ranking (chat, 2026-09-25, verbatim)

> У нас по факту получаются главные лошадки топ-1. Это DeepSeek 4.1 Flash. Номер два. Это Gemini
> 3.8. 3.8. 3.8. 3.8. Flash. Главный эксперт. Это ты. Модель, которая простаивает и непонятно по
> бюджетам. Это Мистраль. Остальные это массовка. Точка. Есть ли какие-то супер простые задачи?
> Можно делать через подписку Кива или подписку Капилот. На тех моделях, у которых очень низкая
> стоимость. [...] Кодекс Астра это модель которая немного лучше тебя, но в 10 раз менее выгодная,
> или как минимум в 4-5. Ей только крайне сложные и крайне короткие задачи надо давать.

Read as routing preferences:

| Place | Model (route) | Use |
|---|---|---|
| Workhorse 1 | DeepSeek Flash 4.1 (own key: `deepseek/deepseek-flash`) | bulk work, implementation from a specification, research legwork |
| Workhorse 2 | Gemini 3.8 Flash (agy) | the same, and a second family for independence |
| Main expert | Claude (the coordinator's Claude Code subscription) | senior work in the sense of PROTO-DEC-0074 item 4 |
| Underused | Mistral (vibe, Pro) | to be used more: large monthly allowance, almost untouched |
| Rare, short, hard | GPT-6 Astra (codex) | only extremely hard and extremely short tasks; 4-10x less cost-effective by the owner's estimate |
| Super simple | cheapest models inside the Kimi or Copilot subscriptions | trivial tasks |
| Others | - | "массовка": use only when a rule needs another family |

## Snapshot 2026-09-25, about 15:30 UTC (the owner's screenshots, plus CLI output where noted)

| Route | Plan | State | Resets |
|---|---|---|---|
| Copilot | Pro | credits 84% used; Copilot pauses when the limit is reached | 1 Oct 03:00 |
| Codex (ChatGPT) | Plus | 5-hour limit exhausted (0% left); weekly 13% left | 5-hour at 22:01; weekly on 30 Sep |
| Kilo | balance | $9.91 left (`kilo profile`: $11.97 earlier the same day) | top-up only |
| Mistral | Pro | API allowance $3.9 of $30 used; Vibe code $0 of $300 used | in 5 days (1st of the month) |
| DeepSeek | own key | balance $11.92 plus ¥155.41; last 30 days ¥161.14 for 7,827 requests and 2.09 billion tokens; total cost to date $20.07 plus ¥859.58 | top-up only |
| Antigravity (Google) | Pro | Claude 100%, Gemini Flash 98%, Gemini Pro 98% left | about 4.5 hours |
| Claude Code | subscription | 5-hour session 18% used; weekly 69% used | session in 3 h; weekly in 1 day |

## Prices per 1M tokens (in / out), `kilo models --verbose`, 2026-09-25

| Route | In | Out |
|---|---:|---:|
| `deepseek/deepseek-flash` (own key) | 0.15 | 0.60 |
| `deepseek/deepseek-v4-pro` (own key) | 0.435 | 0.87 |
| `kilo/google/gemini-3.7-flash` | 0.75 | 3.75 |
| `kilo/moonshotai/kimi-k2.7-code` | 0.66 | 3.30 |
| `kilo/anthropic/claude-opus-5.5` | 4 | 20 |
| `kilo/anthropic/claude-fable-5.1` | 10 | 50 |

## Measured runs (validator migration council, 2026-09-25)

| Step | Route and model | Cost |
|---|---|---|
| r2-b challenge | Kilo, claude-opus-5.5 xhigh | $5.23 |
| round-2 operator, about 30 min of model polling | Kilo, gemini-3.7-flash | $0.42 |
| r3-a synthesis, 161 lines, 19 min | copilot, kimi-k3 high | 227.58 copilot credits |
| draft decision, 309 lines, 19 min | copilot, kimi-k3 high | 208.54 copilot credits |
| critique-a, 185 lines | codex, gpt-6-astra high | 170,428 tokens, then the 5-hour limit was hit |
| critique-a substitute, stopped on collision | Kilo, gpt-6-astra high | $1.97 |

Per-run figures from now on: `docs/research/2026-09-25-validator-migration-council/round3/USAGE.md`,
written by `run-chain.cjs`.

## Consequences for the running council (coordinator's notes)

- kimi-k3 in copilot is not cheap in copilot credits: two steps took about 436 credits, and the plan
  is at 84%. The final plan and the revision now have the substitute `deepseek/deepseek-v4-pro`
  (own key).
- Codex is exhausted until 22:01; the chain needs it no more.
