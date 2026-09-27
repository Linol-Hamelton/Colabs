# PROGRAM OPS-1: operations layer (operator prompt)

Owner request 2026-09-27. Read `README.md` in this folder first: trigger, merge rules.

## Goal

- Work continues unattended.
- The owner is reached only when needed, by phone, and answers from the phone.
- Every route is the cheapest one that clears the capability floor.
- Nothing silently stops, and nothing silently overspends.

## Inputs (read first)

- AGENTS.md.
- PROTO-DEC-0038 and PROTO-DEC-0041.
- PROTO-DEC-0047: items 5-6 and 8-10.
- PROTO-DEC-0075: items 5 and 9-11.
- `.ai/docs/CLI-AGENTS.md`.
- `docs/research/2026-09-26-ownerideas-revision/round6/packages/PKG-1.md` and `PKG-3.md`.
  PKG-3 leaves the resolver cost metric owner-open.
- `docs/ops/MODEL-ECONOMICS.md` and `docs/ops/model-ladder.json`.
- `docs/research/2026-09-27-cost-routes-research/`:
  - use only rows the verifier confirmed (`round2/VERIFICATION.md` and the five final artifacts);
  - collector rows the verifier did not confirm count as OPEN QUESTION;
  - treat collector-A model lists and plan prices as unverified.
- The OwnerIdeas stage-12 findings. They include one about the dispatch tests: they are not
  hermetic.
  - `tests/dispatch.test.cjs` writes `*-launch.md` files into the tracked tree.
  - The hang test rewrites the tracked file `hang-launch.md`.

## Workstreams

### W1. Run programs on the kernel dispatcher

- Retire `run-chain.cjs` for new programs.
- Use `.ai/bin/protocol-dispatch.cjs`. It already provides stall detection, the hard ceiling,
  resume, substitutes and per-attempt usage.
- Every dispatch input is committed before launch: launch files and copyIn files.

### W2. Owner channel: a Telegram bot

No website, no localhost server, no open ports.

- **Script.** One script, `protocol-notify.cjs`; the owner chooses whether it lives in `.ai/bin/`
  or in `ops/`.
  - Node, no dependencies.
  - Uses Bot API long polling (`getUpdates`).
- **Credentials.**
  - The token lives only in env `TELEGRAM_BOT_TOKEN`.
  - Only the chat id in env `TELEGRAM_OWNER_CHAT` is accepted.
  - Every other sender is ignored and logged.
- **Outbound events.** Each message is short: what happened, the options as inline buttons, and
  one path or link.
  - NEED_OWNER;
  - a step FAILED after its recovery budget;
  - a STALL that was not recovered;
  - QUOTA_EXHAUSTED with no admissible substitute;
  - a CANDIDATE frozen;
  - certification verdicts;
  - a program DONE or BLOCKED.
- **Inbound: buttons, text and commands.**
  - Buttons answer the question they were sent with.
  - Free text becomes an owner directive, passed to the operator as text. It is never executed as
    a command.
  - Fixed commands: `/status` and `/stop <slot>`.
- **Inbound: voice.**
  - Transcription runs locally with whisper.cpp.
  - The bot echoes "Understood: ..." with a [Correct] button.
  - Only a confirmed transcript becomes a directive.
- **Inbound: photos.** Stored under `.ai/runtime/inbox/` and routed to a vision-capable model (the
  consultant).
- **Two-step confirmation for dangerous actions:**
  - approving a decision block;
  - substituting a certifier;
  - stopping the whole chain;
  - budget changes.
- **Provenance.**
  - Every owner answer is written to `.ai/runtime/owner-inbox/<id>.json`.
  - It is transcribed into the consuming session's journal as
    `Owner via Telegram, <ISO time>, message <id>: <text>`.
  - A decision-block approval given this way follows AGENTS.md section 2: a direct owner
    confirmation, transcribed with provenance.
- **Dead-man switch.**
  - The supervisor pings a free external heartbeat (healthchecks.io or equivalent) every 5
    minutes.
  - Silence alerts the owner by Telegram and by email.
  - Document the Windows power settings: no sleep on AC power.

### W3. Escalation ladder and roles

- **Levels.**
  - L0, the script supervisor: always on, free.
  - L1, the operator (DeepSeek Flash): event-driven only, no polling loops.
  - L2, the consultant (Opus 5.5): called only on named triggers.
  - L3, the owner, via Telegram.
- **L2 triggers:**
  - a certification FAIL;
  - reports that contradict each other;
  - an architecture, decision or security question;
  - two failed L1 recoveries.
- **Return from L3.** The owner's answer comes back with a button: [back to L2 with my answer] or
  [decide at L1].
- **Consultant rule.**
  - The consultant is diff-scoped, event-driven and read-only.
  - It never certifies a candidate it advised on.
  - Where independence matters, the second opinion comes from another family (GPT-5.6 Sol).
  - When the consultant's route is exhausted (the Claude weekly limit was hit on 2026-09-27),
    escalate to the owner or to Sol. Never silently downgrade.
- **Reviewer independence.** DeepSeek as operator shapes the work, so DeepSeek is not the
  reviewer of work it operated. Pick another family.

### W4. Cost-aware routing

- **Per-route cost fields in the route registry:**
  - `costClass`: one of `included-subscription`, `free-tier`, `free-model`, `paid-token`;
  - in/out price per 1M tokens;
  - limit and reset window;
  - source URL or command, with a date.
- **Resolver order stays:** capability floor, then compatibility, then cost (metric per D4).
  - Among admissible routes, zero-cost comes first.
  - On QUOTA_EXHAUSTED, move to the next admissible route automatically.
- **Hard limits.**
  - No automatic route change for certifier slots without an owner record.
  - No silent senior-to-weaker swap (0075 item 9).
  - Auto-router models (`kilo/kilo-auto/free`, `openrouter/free`) only for tasks where the model
    identity does not matter, with modelRan recorded. Never for review or certification.
- **Usage parsers.**
  - Add kimi `stream-json`.
  - Add claude with `--output-format stream-json` (reported cost).
  - Add agy and vibe only if their `--help` shows a machine-readable usage output.
  - Otherwise record source `not-exposed`, which is distinct from "client reported none".
  - Record the observed model (modelRan source `client-output`) where the client prints it, not
    only the requested one.

### W5. Hermetic dispatch tests

- Launch files and state go into a temporary repository root.
- No test writes into the tracked tree.
- `git status` stays clean after a killed run.

## Decision drafts for the owner

These go into `DECISION-DRAFTS.md` in this folder. Never write them into `.ai/DECISIONS.md`.

- **D1.** The Telegram owner channel and the provenance rule.
- **D2.** The consultant role (Opus 5.5) and its independence rule.
- **D3.** The L0-L3 ladder and its triggers.
- **D4.** The resolver cost metric and the zero-cost policy. This closes the PKG-3 open question.
- **D5.** The Kimi certifier route. The Kimi Code subscription returned 403, so only the API route
  remains. The choice is between two variants:
  - `kimi-k2.7-code-highspeed` at $1.90/$8.00;
  - `kimi-k2.7-code` at $0.95/$4.00.
  The second is a variant change and needs an owner record.

## Phases

- **Phase A.** A design note (`DESIGN.md`) and the D1-D5 drafts, docs only, this folder only. Then
  stop and send them to the owner (by chat, or by Telegram once W2 exists).
- **Phase B.** Implementation after approval, on branch `ops-1`, one workstream per commit.
  - Executor: Gemini 3.8 Flash high.
  - Reviewer: a family different from both the executor and the operator.
- **Phase C.** `.ai/bin` changes are high-risk (PROTO-DEC-0038).
  - Two independent CERTIFYING certifiers on one frozen CANDIDATE.
  - At most three rounds (PROTO-DEC-0047 item 5).
  - The consultant does not certify.

## Acceptance

- A stalled step is detected, resumed or failed over without any LLM polling. The owner gets one
  Telegram message when they are needed.
- A button or voice answer from the phone reaches the operator and is journaled with provenance.
- Cutting the machine's network makes the heartbeat alert fire.
- The route registry has cost fields for every route in the ladder.
- The resolver picks a zero-cost route when one clears the floor. Tests cover the certifier-slot
  exclusion and the auto-router exclusion.
- Usage is recorded for kilo, mimo, copilot, codex, kimi and claude. The other clients are marked
  not-exposed.
- The dispatch suite leaves `git status` clean after a killed run.
- No secret appears in the repository, journals or logs.
