# DESIGN: the operations layer (OPS-1 phase A design note)

Status: DRAFT. A design note, not a decision. Nothing here binds until an approved block in
`.ai/DECISIONS.md` carries it (AGENTS.md section 2). The decision drafts are in
`DECISION-DRAFTS.md` beside this file.

Author: `mistral-dd19689989559593` (vibe; requested `glm-5-3`, ran `mistral-medium-3.5` per
LAUNCH-PHASE-A.md and PROTO-DEC-0094 B.1). Date: 2026-09-28.

Sourcing rule for this file (LAUNCH-PHASE-A.md Constraints): every claim cites its source - a
PROTO-DEC item, a file path, or a verified cost-routes row. A cost row is used only where the
verifier confirmed it (`round2/VERIFICATION.md`) or a final artifact marks it FACT; everything
else stays OPEN QUESTION. Collector-A model lists and plan prices are unverified and are not
relied on.

## 1. Goal

The four goal lines (PROMPT.md Goal):

1. Work continues unattended.
2. The owner is reached only when needed, by phone, and answers from the phone.
3. Every route is the cheapest one that clears the capability floor.
4. Nothing silently stops, and nothing silently overspends.

## 2. The L0-L3 ladder and its triggers (W3)

| Level | Who | Mode | Cost basis |
|---|---|---|---|
| L0 | the script supervisor | always on | free: processes are checked by a script, not a model (PROTO-DEC-0076 item 3) |
| L1 | the operator, DeepSeek Flash | event-driven only, no polling loops (PROMPT.md W3) | subscription/paid route, see below |
| L2 | the consultant, Opus 5.5 | called only on named triggers | claude subscription rungs 1-3 of the owner ladder (MODEL-ECONOMICS.md ladder) |
| L3 | the owner | via Telegram, on demand (W2) | free |

- L1 route: DeepSeek has no terminal client (`.ai/docs/CLI-AGENTS.md` section 1), so the operator
  is reached through a route that exists: `deepseek/deepseek-flash` via kilo with the owner's key,
  effort max (MODEL-ECONOMICS.md "Route notes (2026-09-27)"). DeepSeek V4.1 Max stays
  approval-gated for long tasks (MODEL-ECONOMICS.md ladder rung 5; PROTO-DEC-0076 item 1;
  PROTO-DEC-0078 item 4).
- L2 triggers (PROMPT.md W3): a certification FAIL; reports that contradict each other; an
  architecture, decision or security question; two failed L1 recoveries.
- Return from L3 (PROMPT.md W3): the owner's answer comes back with a button - [back to L2 with my
  answer] or [decide at L1].

Consultant rule (PROMPT.md W3; draft D2):

- The consultant is diff-scoped, event-driven and read-only.
- It never certifies a candidate it advised on; review is not certification (PROTO-DEC-0041
  item 1; PROTO-DEC-0047 item 1).
- Where independence matters, the second opinion comes from another family (GPT-5.6 Sol).
- When the consultant's route is exhausted (the claude weekly limit already refused every call on
  2026-09-27, exact error text in `EVIDENCE.md` FACT), escalate to the owner or to Sol. Never
  silently downgrade (PROTO-DEC-0075 item 9).

Reviewer independence (PROMPT.md W3):

- The operator dispatches and relays; it authors and executes nothing.
- A DeepSeek reviewer is allowed, but only in its own session, never the operator session.
- Certifiers come from families other than the executor's and the operator's
  (PROTO-DEC-0041 item 1; PROTO-DEC-0047 items 5-6).

Recovery and liveness belong to L0, not to a model: error classes with per-class actions, the
budget of one primary plus two substitutes, resume-first after useful work, at most three wakes
per attempt, and an independent hard ceiling per step (PROTO-DEC-0075 items 2-5, 11;
PROTO-DEC-0051 item 4; PKG-3 S5). The stall default of 10 minutes stays an open owner question
(OQ-3, carried in README.md Transferred; PKG-1 S3 `stallMin` default 10, range 5-120).

## 3. The Telegram owner channel (W2; draft D1)

One script, `protocol-notify.cjs`; the owner chooses whether it lives in `.ai/bin/` or in `ops/`.
Node, no dependencies. Bot API long polling (`getUpdates`). No website, no localhost server, no
open ports (PROMPT.md W2).

Credentials:

- The token lives only in env `TELEGRAM_BOT_TOKEN`.
- Only the chat id in env `TELEGRAM_OWNER_CHAT` is accepted. Every other sender is ignored and
  logged.

Outbound events - each message short: what happened, the options as inline buttons, and one path
or link (PROMPT.md W2): NEED_OWNER; a step FAILED after its recovery budget; a STALL that was not
recovered; QUOTA_EXHAUSTED with no admissible substitute; a CANDIDATE frozen; certification
verdicts; a program DONE or BLOCKED.

Inbound (PROMPT.md W2):

- Buttons answer the question they were sent with.
- Free text becomes an owner directive, passed to the operator as text. It is never executed as a
  command.
- Fixed commands: `/status` and `/stop <slot>`.
- Voice: transcription runs locally with whisper.cpp; the bot echoes "Understood: ..." with a
  [Correct] button; only a confirmed transcript becomes a directive.
- Photos: stored under `.ai/runtime/inbox/` and routed to a vision-capable model (the consultant).

Two-step confirmation for dangerous actions (PROMPT.md W2): approving a decision block;
substituting a certifier; stopping the whole chain; budget changes.

Provenance rule (PROMPT.md W2; AGENTS.md section 2):

- Every owner answer is written to `.ai/runtime/owner-inbox/<id>.json`.
- It is transcribed into the consuming session's journal as
  `Owner via Telegram, <ISO time>, message <id>: <text>`.
- A decision-block approval given this way is a direct owner confirmation, transcribed with
  provenance, exactly as AGENTS.md section 2 requires.

Dead-man switch (PROMPT.md W2): the supervisor pings a free external heartbeat (healthchecks.io
or equivalent) every 5 minutes; silence alerts the owner by Telegram and by email; the Windows
power settings are documented - no sleep on AC power.

## 4. Cost-aware routing (W4; draft D4)

Per-route cost fields in the route registry (PROMPT.md W4): `costClass` - one of
`included-subscription`, `free-tier`, `free-model`, `paid-token`; in/out price per 1M tokens; limit
and reset window; source URL or command, with a date. The four $0 types stay distinct, as the
verifier required (COST-ZERO-ROUTES.md header; round2/VERIFICATION.md section "Coverage and
form" and its methodical remarks).

Resolver order stays (PROMPT.md W4; PROTO-DEC-0075 item 9): capability floor, then compatibility,
then cost (metric per D4). Among admissible routes, zero-cost comes first. On QUOTA_EXHAUSTED, move
to the next admissible route automatically (PKG-3 S5 class table).

What the cost-routes study established - verified rows only (PROMPT.md W4; everything else is
OPEN QUESTION in `GAPS.md`):

- $0 now:
  - Kilo free models, including `kilo/kilo-auto/free`: works at a negative balance - empirical
    `PONG` at cost 0 with balance -0.002231, plus the pricing page Auto Free $0/mo
    (COST-ZERO-ROUTES.md FACT; FREE-UNTIL-BALANCE.md). The served model is chosen by the router
    (`dots-studio/dots-3-note-preview:free`, EVIDENCE.md). The verifier could not reproduce
    (EPERM on its state store, round2/VERIFICATION.md); reproduction on a fixed environment is an
    acceptance test, not a premise.
  - OpenRouter `:free` variants: 50 requests a day on our tier (`used:0, remaining:50`,
    EVIDENCE.md FACT), and not every variant is 0/0 - the verifier REFUTED the "all `:free` are
    0/0" claim (round2/VERIFICATION.md; EVIDENCE.md section 4).
  - Gemini API Free Tier: 2.5-family and gemma-4, confirmed on the official pricing page
    (round2/VERIFICATION.md CONFIRMED); the numeric quotas are not confirmed (OPEN QUESTION,
    GAPS.md section 3).
- Subscription CLIs cost $0 only until the quota is exhausted. On 2026-09-27, copilot (monthly)
  and claude (weekly) already refused every call; the exact error texts are recorded
  (EVIDENCE.md FACT).
- The Kimi Code subscription returned 403 (EVIDENCE.md FACT).
- The MiMo free channel ended; MiMo now goes through paid OpenRouter (a config comment only - no
  official source, OPEN QUESTION; COST-ZERO-ROUTES.md).

Owner premises needed before D4 is operational (GAPS.md section 6): (1) whether an "included in
subscription" claim may be taken as an owner premise without account-level proof; (2) permission
for single paid calls to read balances and error texts; (3) the reference source for the Kilo
balance - the owner prompt said ~$0.03, `kilo profile` printed `$-0.00` (GAPS.md section 4).

Hard limits (PROMPT.md W4):

- No automatic route change for certifier slots without an owner record.
- No silent senior-to-weaker swap (PROTO-DEC-0075 item 9).
- Auto-router models (`kilo/kilo-auto/free`, `openrouter/free`) only for tasks where the model
  identity does not matter, with `modelRan` recorded. Never for review or certification.

## 5. Usage parsers (W4; the W0 defect)

- Add kimi `stream-json`; add claude with `--output-format stream-json` (reported cost); add agy
  and vibe only if their `--help` shows a machine-readable usage output. Otherwise record source
  `not-exposed`, which is distinct from "client reported none" (PROMPT.md W4). The existing
  registry usage types are `kilo-json`, `codex-tokens`, `copilot-credits`, `none`
  (`.ai/docs/clients.json` grammar, PKG-1 S2).
- Record the observed model (`modelRan`, source `client-output`) where the client prints it, not
  only the requested one (PROMPT.md W4; the W4 MiMo-identity transfer, README.md Transferred).
- W0 codex defect (first commit): the regex `/tokens used\s*\r?\n?\s*([0-9,]+)/` accepts only
  commas as digit groupers; on this machine codex prints `tokens used: 10 644` (EVIDENCE.md FACT),
  which parses as 10, or as 0 when a colon follows the words; `USAGE-VERIFIER.md` shows 252 tokens
  for a 5-minute verifier run. Fix: accept an optional colon, and space, non-breaking space, comma
  and dot as grouping characters; also accept a K or M suffix. Tests: `10 644`, `10 644` (NBSP),
  `10,644`, `tokens used: 10 644`, and one real captured line. The raw usage line is kept in the
  attempt record so an auditor can recheck the figure (PROMPT.md W0).

## 6. Hermetic dispatch tests (W5)

The dispatch suite is not hermetic today: `tests/dispatch.test.cjs` writes `*-launch.md` files
into the tracked tree, and the hang test rewrites the tracked file `hang-launch.md` (OwnerIdeas
stage-12 findings, cited in PROMPT.md Inputs).

Design (PROMPT.md W5):

- Launch files and state go into a temporary repository root.
- No test writes into the tracked tree.
- `git status` stays clean after a killed run.

Every dispatch input is committed before launch - launch files and copyIn files (README.md merge
rules; the SCOPE_STOP of cost-routes round 1 came from uncommitted `copyIn` inputs,
cost-routes-research README.md).

## 7. Faster test lanes (W8, after W5)

- Why (PROMPT.md W8): the full suite (419 tests) takes about 9 minutes on Windows and runs inside
  every `record` - about ten times on 2026-09-27.
- Parallel suite. Run the test files in parallel. This needs W5 first: shared state made MiMo's
  first round-3 `record` fail under a concurrent run (PROMPT.md W8).
- Fast lane. A working `record` runs the tests of the changed packages only. The full lane stays
  mandatory at a CANDIDATE freeze and for certification.
- Measure. Record the wall time before and after in the program report.

## 8. Order and dependencies

W0 is the first commit (PROMPT.md Phases and W0). W1: run programs on the kernel dispatcher
`.ai/bin/protocol-dispatch.cjs` - it already provides stall detection, the hard ceiling, resume,
substitutes and per-attempt usage; `run-chain.cjs` is retired for new programs; every dispatch
input is committed before launch; the private-clone environment must let a client read its own
user-level state - the kilo EPERM on its state store is the recorded failure to fix, with read
access to the client's own state directory only, never write access to another client's
(PROMPT.md W1; round2/VERIFICATION.md). W2 Telegram; W3 ladder; W4 routing; W5 hermetic tests;
W8 lanes after W5. W6 and W7 are added only after the owner reviews the local incident audit of
the VPN report (PROMPT.md, after W8).

Phase B implements after approval on branch `ops-1`, one workstream per commit; phase C `.ai/bin`
changes are high-risk: two independent CERTIFYING certifiers on one frozen CANDIDATE, at most
three rounds, and the consultant does not certify (PROMPT.md Phases; PROTO-DEC-0038 item 1;
PROTO-DEC-0047 item 5).

## 9. Open questions carried (not solved here)

- OQ-3: the stall default of 10 minutes against PROTO-DEC-0051 item 4 (README.md Transferred).
- The three D4 premises (GAPS.md section 6), and the Kilo balance reference (GAPS.md section 4).
- Numeric Gemini Free Tier quotas; the full OpenRouter 0/0 variant list; the per-row guarantee of
  the 24 Kilo free rows; the HF monthly credit size; Moonshot balance currency
  (GAPS.md sections 3-4).
- The price of MiMo-V2.6-Pro appears in no verified row; it stays unknown (`PRICES-OFFICIAL.md`
  lists only mimo-v2.5 and MiMo-V2.5-Pro rows, unverified).
- OQ-8 (run-record store) and OQ-9 (switching programs to `protocol-dispatch.cjs`) remain with the
  owner (README.md Transferred).
