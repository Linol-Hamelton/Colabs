# Launch: task:roadmap-2a-review2 (DeepSeek Flash via kilo, its own session)

Wave-2A adversarial review before the candidate freeze. Work in the worktree
`D:\Colabs\.ai\runtime\kb1` (branch `kernel-batch-1`). Reviewed range: **`a4312e8..HEAD`**
(`48365b2`); the branch now carries 421 tests (one new). Owner mandates (round 5, PROTO-DEC-0090):
up to 3 rounds (PROTO-DEC-0047 item 5).

## Focus

1. **W0** (`fbff763`): the codex usage parser accepts an optional colon, space/NBSP/comma/dot
   grouping and K/M suffixes; keeps the raw usage line; the real captured pair
   (`252`+U+00A0+`154`) parses to `252154`; the named tests exist.
2. **W5** (`61c7159`): the 40 fixture files (`prompts/DISPATCH.json` + `prompts/run/*`) moved
   byte-identically into `tests/fixtures/prompts/` (verify with sha256 lists before/after);
   `DISPATCH.json` unchanged; T5 stays green through a temp root recreating the original relative
   layout, never by editing the fixture; hermeticity: after a killed
   `node tests/dispatch.test.cjs` the worktree `git status` is clean; the leftover directory is
   archived with a NEW INDEX row (the CR-F01-1 row untouched).
3. **W1-retire** (`cf99cdf`): `run-chain.cjs` marked retired with the one-line pointer, not deleted.
4. **Item 4** (`fde0248`): root cause found; a real dispatch attempt appends a row to
   `docs/ops/RUNS.jsonl` (test proves it with a temp root); the schema matches
   `docs/specs/run-record.schema.md`.
5. **Item 5** (`653117c`) and **item 6** (`fa74541`): S-7 throttle keeps scenario semantics;
   the S-10 note is in `.ai/docs/clients.json` and the file validates.
6. **Hygiene**: one commit per item; explicit paths; no force/rebase/amend; no edits outside the
   named scope; `.ps1` ASCII; LF/UTF-8.

## Rules and deliverable

- `node .ai/bin/protocol-session.cjs start --agent deepseek`; use the printed owner name.
- Read-only on the reviewed files; write only your review, journal and evidence. Reproduce every
  FAIL claim. The operator ran the full suite (421/421 pass, exit 0) - you may run targeted test
  files; do not start the full suite.
- Deliverable: `docs/reviews/2026-09-27-deepseek-roadmap-2a-review.md` (<= 250 lines) with the
  header (reviewed commit `48365b2`, tree status, reviewer model, date UTC, scope) and an explicit
  `PASS` / `RECOMMENDATION` / `FAIL` / `BLOCKED` verdict; journal + `record --quick`; commit on
  this branch with explicit paths; no push.
