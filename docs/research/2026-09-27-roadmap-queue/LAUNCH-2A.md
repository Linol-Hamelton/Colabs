# Launch: task:roadmap-2a-executor (Gemini 3.8 Flash high via agy)

Program: ROADMAP-1, wave 2A (kernel batch 1, high-risk). Worktree:
`D:\Colabs\.ai\runtime\kb1`, branch `kernel-batch-1` cut from `v2.0.0` at `fbc3ce4`. Run every
command inside that worktree. Owner answers: `docs/research/2026-09-27-roadmap-queue/PACKET-1.md`
(Q3: W0, W1-retire, W5 pulled in; Q4 baseline exists but is not this wave's job).

## Session rules (binding)

- `node .ai/bin/protocol-session.cjs start --agent gemini`; use the printed owner name.
- Shared documents via `protocol-lock.cjs acquire/release --owner <your owner>`; append-only where
  required; never reformat.
- **Failing test first** for every defect item; then the fix; then the test passes. One commit per
  item, explicit paths, English, no force/rebase/amend, **do not push**.
- Kernel paths are in scope this time: `.ai/bin/`, `tests/`, `docs/specs/` and
  `.ai/docs/clients.json` may change for the named items only. No refactors beyond them.
- End: full `test-protocol.ps1` once (exclusive - scan first), then your five-label journal entry +
  `record --quick`. Record model `gemini-3.8-flash-high`, effort `high`, usage from your client or
  `not exposed`.

## Items

1. **W0 - codex usage parser.** Raw captured line (do not paraphrase):
   `.ai/runtime/cost-routes-verifier/cr-verifier-1.log:3883-3884`:
   `tokens used` then `252` + U+00A0 + `154` (char codes 50,53,50,160,49,53,52); the collector quote
   reads `(tokens used: 10 644)`. Make the parser accept an optional colon, and space, NBSP, comma
   and dot as grouping characters, plus K/M suffixes; keep the raw usage line in the attempt record.
   Failing tests first: `10 644`, `10` + NBSP + `644`, `10,644`, `tokens used: 10 644`, and the real
   captured pair (expected `252154`).
2. **W5 - hermetic dispatch tests.**
   - Launch files and state go into a temporary root; **no test writes into the tracked tree**;
     `git status` stays clean after a killed run (the `tests/fixtures/dispatch/t20-launch.md` leak
     class).
   - Re-home the owner-approved fixture `prompts/DISPATCH.json` and `prompts/run/*` (40 files, at
     `docs/research/2026-09-26-ownerideas-revision/`) into `tests/fixtures/`; update the test paths.
   - Then archive the leftover `docs/research/2026-09-26-ownerideas-revision/` directory (README
     stub only) with an archive INDEX row and repointed references.
3. **W1-retire.** New programs use `.ai/bin/protocol-dispatch.cjs` only. Mark
   `docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs` retired with a
   one-line pointer to `protocol-dispatch.cjs` in its header; do **not** delete it (reviews cite it).
4. **RUNS.jsonl investigation (Q3 amendment).** `docs/ops/RUNS.jsonl` is present and 0 bytes while
   dispatcher runs exist. Find the root cause (writer, path, or call-site), write a failing test
   that captures it, fix it so a real dispatch attempt appends a row, and note the store format.
5. **S-7.** Throttle `docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs`
   scenarios so the WMI queries do not time out; keep scenario semantics.
6. **S-10.** In `.ai/docs/clients.json`, add to the vibe client profile the note: never edit an
   entry after `record`; add a new entry. Keep the schema valid (the file is validated).

## Deliverable and handoff

- Branch `kernel-batch-1`: one commit per item (1-6) + your journal commit; plus
  `docs/research/2026-09-27-roadmap-queue/W2A-EXECUTION.md` (short: per item - commit sha, test
  names, deviations, open questions).
- The flow after you: DeepSeek adversarial review in its own session, then one fix pass, then the
  CANDIDATE freeze; the owner lane runs the full suite on the candidate. Do not run those yourself.
