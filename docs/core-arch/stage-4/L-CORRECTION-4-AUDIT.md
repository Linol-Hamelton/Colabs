# Package L, correction pass 4: unified adversarial audit (certifier 1)

- For: Gemini, run by the owner in Antigravity. The owner named you certifier of this stage
  (chat, 2026-09-25). Agent name `gemini`.
- Why an audit this deep: the change touches credentials and push rights, a high-risk path of
  PROTO-DEC-0038 item 1. Completion needs this unified prompt and two parallel independent
  certifiers (PROTO-DEC-0041 item 2). You are certifier 1; the owner names certifier 2 (Codex
  proposed). You do not read the other certifier's report before yours is written.
- Independence: you did not write the specification (claude-c73232724159e5bd) or the
  implementation (DeepSeek), and you took no part in package L before.
- Talk to the owner in Russian; write the report in English. Your last message is a short report to
  the owner in Russian.

## 0. Start

1. `node .ai/bin/protocol-session.cjs start --agent gemini`. Note the owner name it prints. Journal
   line 1: `Launch: model=<actual id> effort=<value> client=Antigravity`. Line 2:
   `Orientation: <model> @ task:l-correction-4-audit (parent program:core-arch): certifier 1 |
   success=section 4`.
2. The owner's message names `Candidate: <full SHA>`. If it names none, stop and ask. Read every
   path at that SHA (`git show <SHA>:<path>`, or a detached worktree under the system temp
   directory that you remove afterwards). Run tests only in that worktree, never in the owner's
   checkout.
3. Inputs:
   - the specification `docs/core-arch/stage-4/L-CORRECTION-4.md`;
   - DeepSeek's response `docs/reviews/2026-09-25-deepseek-core-arch-L-correction-4-response.md`
     and DeepSeek's journal for `task:l-correction-4`;
   - the third-pass review `docs/reviews/2026-09-25-deepseek-core-arch-stage2-review-packageL-third-pass.md`;
   - Part 2 of `docs/research/2026-09-25-validator-migration-council/final-plan-2.md`;
   - PROTO-DEC-0070, 0077 and 0078 in `.ai/DECISIONS.md`;
   - `git diff <SHA>~1 <SHA>`.

## 1. Audit every item of the specification

For each of items 1-9 of `L-CORRECTION-4.md`, give a verdict (PASS, FAIL or BLOCKED) with
evidence: a command and its output, or `path:line` at the candidate. A FAIL or BLOCKED needs at
least one reproduction per claim (AGENTS.md section 2).

1. F-3P-2. Plant hooks (`post-checkout`, `pre-commit`, `post-commit`, `reference-transaction`)
   wherever a job can write, including the old `<temp>/colabs-research/` path, then run every
   launcher git call. Did any hook execute? Is the chosen mechanism measured as the response says?
2. Credential scrub. With canary values in each removed variable and a canary credential helper in
   the real global config, read the job environment and `git config --show-origin -l` inside a
   clone. Is anything reachable? Also:
   - list every variable that still names a token;
   - check the empty-global-config side effects (`user.name`, `safe.directory`) on the clients.
3. Git modes. Missing, malformed or tampered descriptor; a job that tries to change its own mode;
   `BRANCH_PUSH` and `RELEASE_PUSH` must fail closed. Is the default-deny real in code, not only in
   text?
4. `ls-remote` audit.
   - Does the test use a temporary bare remote only? Grep the tests for the real `origin`.
   - Does a difference invalidate the attempt?
   - Are the blinds recorded?
5. `jobs.json`. Are unknown keys and missing fields fail-closed? Do `--check` and `--preflight`
   still pass? Are no models or routes left in code (PROTO-DEC-0073)?
6. `index.lock`.
   - A transient lock: no SCOPE_STOP.
   - A persistent lock with no git process: stop with "stale index.lock", clone kept.
   - Is the lock deleted anywhere? Grep for any `unlink`/`rm` near `index.lock`.
7. Route. Is `deepseek/deepseek-flash` in `kilo-routes.json`? Compare the `--dry a-deepseek`
   output before and after, as recorded in the response, and rerun it yourself.
8. Stale references. Do K-launch and the README name the governing review correctly?
9. Records. Is `docs/core-arch/` untouched by the implementer? Is the R-L3-004.9 text supplied in
   the response?

## 2. Hostile suite and regressions

- Rerun the negative cases of Part 2 that the response claims are implemented: 1-8, 10, 12, 13
  and 14. Use disposable local bare remotes and synthetic canaries only. Never touch an owner
  remote.
- Is every UNPROVED case honestly listed, with none claimed without a test?
- Run `node launch-test.cjs` three times in a row at the candidate. It must exit 0 each time with
  old plus new scenarios, and no old scenario weakened or removed without a stated reason.
- Run `launch.cjs --check` and `--preflight`, and `validate-protocol.ps1`.
- Look beyond the list for anything the spec missed:
  - a new path by which a job reaches credentials, the checkout or a remote;
  - a regression of F-L1/F-L2 (the private clone and the scope check);
  - a test that passes vacuously.

## 3. Verdict

One of PASS, RECOMMENDATION, FAIL or BLOCKED, per AGENTS.md section 2.
- PASS or RECOMMENDATION: no item FAILs, and every non-PASS item is a named recommendation.
- FAIL: at least one reproduced defect.
- BLOCKED: you could not verify something the verdict depends on (for example no candidate SHA, or
  a test you could not run). Say what.

F-3P-1 itself stays OPEN - HYPOTHESIS UNDER VALIDATION (PROTO-DEC-0077 item 3). Your verdict
certifies this pass, not the closure of F-3P-1.

## 4. Output

`docs/reviews/2026-09-25-gemini-core-arch-L-correction-4-audit.md`, at most 250 lines. Header:
- `Reviewed commit SHA: <candidate>`;
- working tree status;
- model, date (UTC), scope;
- `Mode: CERTIFYING`;
- `Receipt-Owner: <the owner name printed at start>`;
- `Verdict: <token>`.

Body: one table row per item 1-9, then the hostile-suite results, the regression results, the
findings beyond the list, and the reproductions. Then a five-label journal entry that names the
report path, and `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>` (the full
suite: this is a certification). No commit, tag or push.
