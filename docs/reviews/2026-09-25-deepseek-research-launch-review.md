# Report L - the research package and the launch package: transcription, coverage, adversarial code review

- Reviewer: DeepSeek, model `deepseek/deepseek-flash`, effort unknown, client Kilo (mode Code),
  owner `deepseek-de4b5c30af414f21`. Date: 2026-09-25 UTC.
- Baseline: `4ded1bee1c2acf2392fdeededf50935f59138302`; tree **dirty**. No reviewed file changed
  during the review (17 files hashed twice, identical).
- Scope: package R (`docs/research/2026-09-25-improvement-research/`) and package L
  (`P-L3-004`, `kilo-routes.cjs/.json`, the fallback section of `MODEL-MATRIX.md`,
  `prompts/launch.cjs`, `launch-test.cjs`, `launch-fake-client.cjs`, `K-launch.md`), Parts 4-7.
  Mode: **ADVISORY**.
- Verdict: **FAIL** - reproduced defects CB-17 (two-executor hole with a dead watchdog), CB-19
  (retry loop suppresses both timers), CB-18 (owner stop discarded in the start window) and CB-21
  (grants in use without recorded authority) block a live launch; each fix is small and the fix
  list is in the ledger.
- Commands run: `launch.cjs --check researchers` (18/18 parse, exit 0, no model); `--dry
  researchers` (exit 0); `--status`; `launch-test.cjs` twice (11/11 PASS both); `kilo-routes.cjs
  --print` (exit 0, 701 lines, deep-equal to `kilo-routes.json` ignoring `generated`); experiments
  against a full copy under the temp directory (fake clients, liveness, stop marker, dead
  watchdog, option parsing, regex probes). Forbidden commands were not run: no `--smoke`,
  `--start`, `--stop`, no `kilo run`, `codex`, `agy`, `copilot`, `vibe` model call.

## Part 4 - transcription of PROTO-DEC-0066 and 0067

1. **The `Supersedes` line of 0067 overreaches as worded.** O-11 item 4 directs two configurable
   timers *for the failover path*; it does not address the certified round-2 dispatcher. FACT:
   `docs/research/2026-09-24-remediation-mapping/prompts/launch-round2.cjs:24,108-109` still
   enforces `IDLE_MS = 5 min` under PROTO-DEC-0049 item 3, and 0067 item 7 puts the new policy on
   trial only in the research launcher. As written ("the idle bound a dispatch watchdog applies
   before it stops an executor") the supersede contradicts the living tree; either scope it to
   "the launcher of the improvement research / P-L3-004 (trial)" or update the round-2 launcher in
   the same change. The transcriber's-reading note is honest; the wording is what needs narrowing.
   The semantics also differ (0049 item 3 = zero tokens for 5 min; O-11 = no progress with a live
   process), so a plain supersede loses that distinction.
2. **Values beyond the owner's words (O-09..O-11).** Inside or directed: 150 s and 480 s sit in
   the owner's "2-3 min" and "7-10 min"; both are called configurable (`P-L3-004:103-110`); 16 KB
   and 0.5 s CPU are thresholds named in the L2/L6 signal rows and covered by the implementer's
   Evidence C sentence (`:145-147`). Beyond, and not named as the implementer's proposal anywhere:
   the price tie-break ("ties go to the maker's own provider, then alphabetically", `:44-45`); the
   caps 360 min researcher / 180 min synthesiser (`:109`); the 15 s tick (`:110`) and the 180 s
   smoke timeout (`launch.cjs:32`). Recommendation: mark these four as the implementer's proposal
   under the owner policy, as Evidence C does for the state table and timers, or put them to the
   owner with В-26-style questions.
3. **0066 item 6 does not fully state the option the owner chose (O-08).** It matches the
   classes C/D and the stage-3 triage/escalation split; it drops O-08's exemption "the research
   does not count under the two-stream limit (PROTO-DEC-0048 item 7) and touches no kernel". With
   the launch running in parallel with the stage-2 review, the dropped sentence is what makes
   that parallel run safe to read; add it to item 6 or the Consequences. FACT: O-08 option text
   `BRIEF.md:1377`; block `.ai/DECISIONS.md:2597`.

## Part 5 - the research package

1. **Coverage: no requirement dropped.** O-02 required result 1-10 map to `B-research.md` section
   4 (methods 1-7) and section 5 (taxonomy columns cover F, justification, pattern, triggers,
   roles, parallelism, review, synthesis, certification; policy items 2 and 5-10; impact list in
   method 6). O-02 critical limits are carried: F is not importance (`B-research.md:26-27`), no
   count from F alone, no brand choice, no council-for-everything (method 4 gives every escalation
   a stop and a budget), no merged methods, five entities separate. O-03 sections 1-15 map to
   `A-research.md` section 2 (sources and provenance letters, plus `prov:O`), section 5 (funnel,
   diversity re-run, novelty) and the O-03 section numbers cited per source. O-04 stages 1-8 map
   to `A-research.md:77-92` and its outputs; the card fields are carried by reference to O-04
   section 4 (`:103-105`) with the extra fields; the value formula is `:92`. One narrow gap: the
   O-03 final-result field list (per-hypothesis "expected effect", "metric", "verification
   method", "verification result") is fully present only for carded hypotheses; the registry
   columns for the wide pass carry screening scores and disposition instead, and O-04's backlog
   spec asks for fewer fields, so this is a note, not a defect.
2. **Index: one mismatch.** All eleven index lines match their blocks except O-06
   (`BRIEF.md:20`), which reads "Three independent researchers plus a synthesis" and drops the
   option's "of different makers" and "synthesizer - not one of the researchers". The block
   (`DECISIONS.md:2595`) and README keep them, so the binding text is right and the index line
   understates; fix the index line.
3. **Limits: the in-place list writes nothing tracked.** `validate-protocol.ps1` run in place:
   exit 0, "Protocol OK. 0 warning(s)", `git status --porcelain` byte-identical before and after.
   In a full copy under the temp directory: `test-protocol.ps1` 376/376 pass, exit 0, porcelain
   identical; `node .ai/bin/protocol-index.cjs` writes only `.ai/runtime/decisions-index.md`
   (ignored), porcelain identical; `node .ai/bin/protocol-handoff.cjs verify` exit 0, porcelain
   identical. So a researcher following the list cannot write tracked state. The install/MCP ban
   is prose-only for the clients: the launcher grants them full tool access (CB-21), so a
   researcher that ignores its prompt could install or edit; the prompt forbids it and the
   working directory is the repository, which is also where it must write its outputs. Enforcing
   it mechanically would need a narrowed grant or a gate, out of scope here.
4. **Independence: sound under the approved decisions, broken by the draft grammar.** kimi-k2.7-code
   in `a-synth` and `b-kimi`, and deepseek-flash in this review and `a-deepseek`, sit in different
   frames; PROTO-DEC-0057 item 3 confines the one-role rule to one frame and no synthesiser
   researches its own study (README:72; A-synth and B-synth guards). Each study has three
   researchers of three different makers. Caveat: under SCHEMA-assignment section 2 as drafted,
   if these frames declared `parent-scope: program:core-arch` while program-scope lines name
   those models, the grammar would exit 1 (see report S, CB-01) - the fix there is what keeps
   this dispatch legal. Disclosure: this reviewer is the planned `a-deepseek` researcher in a
   different frame; no rule requires recusal (the review is advisory and this session certifies
   nothing), and it is recorded in the journal; the certifiers of the research output must still
   stand outside execution and control (PROTO-DEC-0041 item 1).
5. **Hygiene: pass.** The fixed launch line (K-launch:63 and `launch.cjs:130`) and all eight
   `prompts/run/*.md` are pure ASCII; a script compared every job file's agent, model and output
   list with the `JOBS` table of `launch.cjs` - all 8 MATCH. Informational: the four study
   prompts contain 3-10 non-ASCII bytes each (em dashes, multiplication sign, arrow) in headings
   and prose; no launch line is affected and files are read by models, not by cmd.exe.

## Part 6 - the launch package (adversarial code review)

1. **State machine.** Every row of the P-L3-004 state table exists in `launch.cjs`, and no
   terminal path starts a second route after useful work. The code has two transitions the table
   lacks: `STARTING -> SUSPECT` (soft silence before any useful work) and `SUSPECT -> STARTING`
   (progress without useful work). Reproduced with a fake client: states observed
   `STARTING, SUSPECT, DONE` in a 20 s run with tick/soft/hard 1/3/6 s. Add the two rows (they
   are benign but make the table untrue as written). A reachable unintended input: `--hard-seconds
   -5` makes `decide()` return `FAILED_EARLY` on the first tick (pure call reproduced), and
   `--cap-minutes 0` is silently ignored (falsy check); numeric options have no validation or
   exit 2.
2. **Failover.** Switch conditions verified in code: `FAILED_EARLY` implies `!useful`
   (`classifyExit`/`decide`); `state.autoFallbackUsed` makes it once per dispatch; `autoAllowed`
   is false for an owner-named `--route`; `STOPPED` never falls back. One hole: the owner-stop
   window in CB-18.
3. **Process safety.** The start lock survives a five-way race (self-test pass, twice) and a
   fresh lock is refused; a 60 s-old lock with no live watchdog is replaced. Descendants are
   killed only with a matching creation time (`tree()`, `ensureGone`), as required. **Dead
   watchdog: reproduced hole.** After the root exits while a detached descendant lives, the
   predicate `startJobs` uses (`sameProcess(pid) || alive(pid)`) is false, and 61 s later
   `takeStartLock` wins while the descendant is still alive - a second executor can start without
   the previous tree being gone, which R-L3-004.7 forbids. The root itself is stopped by PID
   alone (`launch.cjs:293,175`), and `taskkill /T` in the root kill and in `--stop` (`:175,568`)
   terminates by parent linkage, the very mechanism the fix calls unreliable (`:191-192`).
4. **Liveness.** Long but working agent that would be killed: reproduced with a fake client that
   writes one output then stays silent - `STARTING, WORKING, SUSPECT, NEEDS_OWNER`, first attempt
   `HUNG`; with the defaults that is any client waiting > 480 s on one unstreamed model response
   after its first write. Dead agent waited on too long: reproduced with a fake client printing
   `429 rate limit exceeded` every 700 ms; with tick/soft/hard 1/3/6 s the state stayed
   `STARTING` for the whole 13 s run because log growth counts as progress, so neither timer
   fires; with the defaults such a retry loop runs to the 360-minute cap. O-11 wants progress to
   extend the wait and hard failure to fail over; a retry loop is not progress. The P-L3-004 risk
   table claims coverage ("log volume is not useful work while the log carries error text") - that
   is true for useful work only, not for the progress clock. Fix: do not count log growth as
   progress while `errorIn()` matches, or count a repeated error as a strike.
5. **Error text.** False negatives reproduced against `ERROR_TEXT`: "Your credit balance is too
   low", "overloaded_error: Overloaded" (529), "500 Internal Server Error", "504 Gateway Timeout",
   "fetch failed", "socket hang up", "EAI_AGAIN", "You've hit your limit". False positives: "line
   503 of the spec" and "processed 429 tokens" match `\b50[23]\b` / `\b(401|403|429)\b`; "Forbidden"
   in a sandbox message matches too. Corrections: require an HTTP/status or error context near
   4xx/5xx, add the phrases above and 500/504/529, and only count a match in the tail while no
   useful work exists (already done) - plus the progress fix of item 4.
6. **Commands.** `--check researchers` reproduces 18/18 parse, exit 0, no model call; every flag
   was tested against its client's own help by the check itself. The safe-character guard rejects
   `%`, `&`, backtick, `$`, unbalanced quotes and backslash-before-quote, and accepts the real
   command shape (probes reproduced). Version records disagree: `MODEL-MATRIX.md:17` records agy
   1.2.9; the implementer's journal for the same checks says agy 1.2.10
   (`ARCHIVE.md:8491`); the check passed against the live help. Record one version per client and
   date, or note the re-check.
7. **Permissions.** `codex --approve-for-me` (0047 item 7) and `agy --dangerously-skip-permissions`
   (0049 item 5, after the owner verified the deny path) are recorded. `kilo run --auto` is
   arguably covered by 0047 item 7's last sentence ("Kilo's auto-approval ... the coordinator's to
   configure"). `copilot --allow-all-tools` is recorded only with the compensation "narrow working
   directory"; the launcher runs copilot with the repository as cwd and adds the temp directory,
   so the compensation is absent, and `--no-ask-user` is recorded nowhere. **`vibe --auto-approve`
   has no recorded authority**: 0047 item 7 grants vibe `-p --enabled-tools --max-turns`, and
   `CLI-AGENTS.md:129-130` requires the owner to authorize `--auto-approve` for the run and the
   authorization to be recorded. Fix: record the authorization in the launch entry, or narrow the
   flags (vibe `--enabled-tools`; remove `--add-dir` where it widens the workspace).
8. **Routes.** `kilo-routes.cjs --print` regenerates a catalog deep-equal to `kilo-routes.json`
   (ignoring `generated`; both 701 lines, kilo 7.7.9). Hand checks of R-L3-004.2-3 all match the
   MODEL-MATRIX fallback table: kimi-k2.7-code high -> vercel (openrouter/huggingface cannot set
   effort); kimi-k3 (medium not offered) -> huggingface high, chosen by the alphabetical
   tie-break on equal 3/15 prices (all three routes equally priced); claude-haiku-4-5 xhigh ->
   vercel max, openrouter unfit ("highest level high is below xhigh"); mistral-medium-3.5 -> no
   suitable route, owner decides; deepseek-flash level unknown -> openrouter v4.1-flash max
   (cheapest suitable, own primary filtered out). Cosmetic: the Notes list of MODEL-MATRIX is
   numbered 1, 4, 2, 3 (`:173-179`).
9. **Self-test.** Two runs, 11/11 PASS, identical output, no flake. Expectations are consistent
   with the state table; zz-t6 encodes "exit 0 with no usable work" as `FAILED_EARLY` and lets
   the Kilo fallback spend an attempt - correct per the hard-failure definition, worth keeping in
   mind. Missing scenarios: the dead watchdog, stop-in-the-start-window, takeover refusal with
   outputs present, a job with no suitable route, and a surviving descendant. Cleanup removes
   `zz-*` files but leaves the fake output directories in the temp folder.
10. **K-launch.** The operator can start research without the owner's confirmation: step 5's
    condition is prose only and `--start` has no confirmation gate or flag; the launcher accepts
    any caller. The operator is forbidden to run client CLIs (rule 2) but nothing checks it;
    `--smoke` (step 4) does call models through the launcher. Exit-code reading is unsafe as
    written: rule 3 says stop on any unexpected exit, while `startJobs` returns 1 when at least
    one job is refused (`launch.cjs:554`) and step 5 still tells the operator to report and not
    retry; a strict reading of rule 3 ends the session after a partial start without reporting
    which watchdogs are running. State the expected exit codes per step (0 = all started,
    1 = at least one refused with output) and make the owner's confirmation explicit (for example
    a required first line in the journal).

## Part 7 - the implementer's incident

- What the repository and the machine still hold: the journal entry (`ARCHIVE.md:8508-8510`) says
  one pre-fix test run's watchdog looped while stopping processes found by PID alone, "PID 34972
  lineage", that no unrelated stop can be established, and that no PID or parent remains. FACT
  (this machine, 2026-09-25): no process 34972 and no process whose parent is 34972 exists now.
  The old code is not in the tree (launch-test.cjs is untracked and was never committed), the
  test logs under `.ai/runtime/improvement-research/` were cleaned by the test itself, so no
  direct reproduction of the incident is possible from the repository. HYPOTHESIS: the loop was
  `ensureGone`/repeated kills by number on a reused PID, the class the commit message names.
- Does the fix close that class? Mostly. Descendant kills now require a PID plus an equal
  creation time (`launch.cjs:193-211,240-243,289-302,566-568`), and the root is killed only while
  Node still owns its child handle. Residual, same class: the root kill itself is by PID alone,
  and both the root kill and `--stop` use `taskkill /T` (`:175`), which selects children by
  parent linkage, not by identity; a child whose recorded parent is an earlier user of that PID
  would still be stopped. Recommendation: kill leaf-by-leaf from the `known` map (PID plus
  creation time) and reserve `/T` for a final sweep after that list is empty.

## Ledger

Findings CB-12..CB-26 (with CB-17, CB-18, CB-19, CB-21 blocking) in
`docs/reviews/2026-09-25-core-arch-stage2-findings.md`. The owner launches the research only
after this report's fixes are answered and a diff pass clears them.
