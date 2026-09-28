# Launch: task:ops-1-phase-a (Mistral Medium 3.5 via vibe, its own session)

Owner directive 2026-09-28 (PROTO-DEC-0094 B.2): OPS-1 phase A starts now, on vibe. Read first:
`docs/research/2026-09-27-ops-layer/README.md` (trigger and merge rules) and `PROMPT.md` (the
binding program prompt), plus `AGENTS.md`. Work in the worktree `D:\Colabs\.ai\runtime\ops1`
(branch `ops-1`).

## Scope (phase A only: docs only, this folder only, no code)

- `DESIGN.md` - the design note for the operations layer: the four Goal lines; the L0-L3 ladder and
  its triggers; the Telegram owner channel with the provenance rule; the consultant rule; the
  cost-aware routing per W4; the usage parsers per W4; the hermetic dispatch tests (W5); the W8
  lanes as post-W5.
- `DECISION-DRAFTS.md` - the D1-D5 drafts for the owner, exactly the five in `PROMPT.md` section
  "Decision drafts"; each with a recommendation, the reasoning and the consequences; D5 proposes
  MiMo-V2.6-Pro + GPT-5.6 Sol and names the Kimi fallback variants.
- Nothing else: no `.ai/bin` changes, no tests, no files outside
  `docs/research/2026-09-27-ops-layer/`.

## Constraints

- Use only cost-routes rows the verifier confirmed (`round2/VERIFICATION.md` and the five final
  artifacts); unverified rows are OPEN QUESTION; collector-A model lists and plan prices are
  unverified.
- Every claim cites its source (a PROTO-DEC item, a file path, or a verified row). Unknown stays
  unknown.
- Caps: `DESIGN.md` <= 250 lines, `DECISION-DRAFTS.md` <= 150 lines.

## Session rules

- `node .ai/bin/protocol-session.cjs start --agent mistral`; use the printed owner name.
- Drafter only: no verdicts, no certification, no decisions; the drafts are proposals for the owner.
- Run `validate-protocol.ps1` once at the end and `record --quick`; no `test-protocol.ps1`.
- Commit with explicit paths on `ops-1`; do not push.
- Journal: five labels plus model/effort and usage. Record the model honestly: requested `glm-5-3`,
  ran `mistral-medium-3.5` while the vibe log shows "falling back" (PROTO-DEC-0094 B.1); check the
  log before claiming any model.

## After

Stop and report; the drafts go to the owner (phase B/C never start before the trigger).
