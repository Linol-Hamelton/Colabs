# Package L, correction pass 4: implementation task

- For: the implementer of this pass, DeepSeek V4.1, run by the owner (PROTO-DEC-0076 item 1;
  owner-approved as a declared long task, PROTO-DEC-0078 item 4). Agent name `deepseek`.
- Written by: claude-c73232724159e5bd (senior specification, PROTO-DEC-0074 item 4). It certifies
  nothing and reviews your result only as the spec author. An independent fourth review pass
  follows.
- Authority: PROTO-DEC-0077 item 3, which authorises this pass: variant 9 of
  `docs/research/2026-09-25-validator-migration-council/final-plan-2.md` Part 2 as a hypothesis,
  F-3P-2 first, boundary = the owner's remote repositories only (L-1).
- Talk to the owner in Russian; write documents and code comments in English. Your last message is a
  short report to the owner in Russian.

## 0. Start

1. `node .ai/bin/protocol-session.cjs start --agent deepseek`. Journal line 1:
   `Launch: model=<actual id> effort=<value|unknown> client=<client>`. Line 2:
   `Orientation: <model> @ task:l-correction-4 (parent program:core-arch): implementer | success=section 5`.
2. `git status --short` must be clean except untracked journals; otherwise stop and tell the owner.
3. Read, in order:
   - this file;
   - `docs/reviews/2026-09-25-deepseek-core-arch-stage2-review-packageL-third-pass.md` (F-3P-1..F-3P-5);
   - Part 2 of `final-plan-2.md` (sections "Resolution", "Threat model", "Hostile acceptance suite");
   - `docs/core-arch/stage-4/P-L3-004-route-failover.md` R-L3-004.9;
   - `docs/research/2026-09-25-improvement-research/prompts/launch.cjs`, `launch-test.cjs` and
     `launch-fake-client.cjs`.

## 1. Scope: what to change (all in package L)

Work in this order. Each item has its acceptance test; add every test to `launch-test.cjs`.

1. F-3P-2, first. The launcher's own git calls must never run a hook a job can plant.
   - Today `gitIn` points `core.hooksPath` at a shared, job-writable directory under
     `<temp>/colabs-research/`.
   - Choose and measure one mechanism, and record the measurement in your response file. For
     example: a hooks path that cannot exist, per call; or `-c core.hooksPath=` with an explicit
     check that no hook file exists at the resolved path before the call; or `--no-verify` plus
     `core.hooksPath` pointing to a fresh per-call directory that is removed after.
   - Test: plant `post-checkout` and `pre-commit` hooks where a job can write, run every launcher
     git call, and assert that none executed.
2. Credential-separated executor, Level 1. Build the job environment from `process.env` minus git
   credential vectors:
   - `GH_TOKEN`, `GITHUB_TOKEN`, `GIT_ASKPASS`, `SSH_ASKPASS`, `SSH_AUTH_SOCK`, and any
     `*_TOKEN`/`*_PAT` that names GitHub or git;
   - plus `GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=<launcher-owned empty file outside the clone>`,
     `GIT_TERMINAL_PROMPT=0` and `GCM_INTERACTIVE=never`;
   - plus `credential.helper` set empty through the `GIT_CONFIG_COUNT` block, next to the existing
     `NO_PUSH_ENV` rule, which stays as defence in depth.

   Do not remove the model clients' own credentials: they live in their config files, not in these
   variables. If a client breaks, record it and keep the scrub. An empty global config also drops
   `user.name`, `user.email` and `safe.directory`; clients that call git themselves (codex,
   copilot) may fail on that. Test each client you can run with `--smoke`, and list every
   breakage under "Points to attack". Test: a canary token planted in each
   removed variable, and a canary credential helper in the real global config; the job's env and
   `git config --show-origin -l` inside the clone show none of them.
3. Task git mode, default-deny.
   - Every job gets `git: {mode, target?, publishRequired}`, read from the job table file (item 5),
     never from the job.
   - Allowed now: `READ_ONLY` (every research job) and `LOCAL_COMMIT` only if a job's
     authorisation permits commits (none does today).
   - `BRANCH_PUSH` and `RELEASE_PUSH` fail closed with "publisher not implemented". No publisher is
     built in this pass.
   - Test: a job table entry with each mode, including a missing and a malformed descriptor
     (malformed = fail closed).
4. `ls-remote` audit, never enforcement.
   - Before and after every attempt, record `git ls-remote` of each remote configured in the
     checkout (L-1: the owner's repositories only).
   - Any difference in a no-push mode is an incident: it invalidates the attempt, and the incident
     line is written to the attempt record.
   - Record the known blinds (push+revert, webhooks, remotes not listed) in R-L3-004.9.
   - Test: against a temporary local bare remote only, never the checkout's real `origin`, a fake
     client that pushes by a bypass route leaves a ref difference, and the attempt is invalidated.
5. M-2, the job table out of code (PROTO-DEC-0073). Move `JOBS` (models, routes, levels, outputs,
   needs, and the new git mode) to `prompts/jobs.json`, with a strict loader: unknown keys or a
   missing field fail closed. Keep the models as they are; M-3 re-resolves them separately. Test:
   `--check` and `--preflight` still pass with the file; a broken file fails closed.
6. M-1 (F-3P-5), `index.lock`.
   - A transient `.git/index.lock` must not raise a spurious SCOPE_STOP.
   - Retry the state read with bounded backoff (for example 5 tries within 15 s).
   - If the lock persists: if a `git` process runs in that clone, wait for the next scan; if none
     runs, stop the attempt with the reason "stale index.lock" and keep the clone for inspection.
   - Never delete the lock.
   - Test: fake clients that hold a lock briefly and permanently.
7. S-3: the `a-deepseek` route `openai-compatible/deepseek/deepseek-flash` becomes
   `deepseek/deepseek-flash` in the job table (the openai-compatible one has no key in the Kilo
   CLI). Check that the new id exists in `docs/core-arch/stage-4/kilo-routes.json`.
   `kiloCandidates` excludes the primary route, so the fallback list changes too: record
   `launch.cjs --dry a-deepseek` before and after in your response file.
8. S-2 (F-3P-4): K-launch step 0 and the improvement-research README name the governing review:
   the fourth pass on this correction, not the second pass.
9. Records. Update the improvement-research README test counts. Do not edit
   `P-L3-004-route-failover.md` or any other record under `docs/core-arch/`. Those are candidate
   kernel records, and PROTO-DEC-0072 item 3 puts them at the T7 floor. Instead, list in your
   response file the text R-L3-004.9 needs (items 1-6, the `-c` residual, the audit blinds); the
   spec author writes it into the record.

## 2. Hostile suite (the testable subset of Part 2)

- On disposable local bare remotes with synthetic canary credentials only, never an owner
  remote, add the negative cases of Part 2: 1-8, 10, 12, 13 and 14 (descriptor tampering).
- For 9 (credential helper, OS store, SSH agent) and 11 (hosting API), test what can be tested
  locally, for example a canary helper in the global config. Mark the rest UNPROVED in your
  response file.
- Unknown coverage is not a pass.
- Positive cases: READ_ONLY never publishes, and `publishRequired=false` never pushes.

## 3. Do not

- Build a publisher, give any job credentials, or touch an owner remote.
- Change the kernel (`.ai/`), any record under `docs/core-arch/`, the validator, or another
  program's files.
- Commit, tag or push. The owner commits after review.
- Weaken an existing test. If one becomes invalid, say why in the response file.

## 4. Checks

- `node launch-test.cjs` exits 0 three times in a row, with all old and new scenarios.
- `launch.cjs --check` and `--preflight` pass.
- `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` exits 0.
- Evidence: this is a code change, so record with the full suite:
  `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>` (PROTO-DEC-0071).

## 5. Output

`docs/reviews/2026-09-25-deepseek-core-arch-L-correction-4-response.md`, at most 250 lines. Header:
- date, candidate = your final tree, not committed;
- a table with one row per item 1-9: finding | fix | where | test;
- the measurements of item 1;
- the UNPROVED list of section 2;
- "Points to attack" for the fourth pass.

Then a five-label journal entry and the full `record`.
