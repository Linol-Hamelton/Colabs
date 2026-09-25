# INDEX draft - coordinator working notes (2026-09-23, deepseek)

Not a deliverable. Working notes for the final `INDEX.md` after all 13 documents carry both
primary and challenge. Kept in the repository per owner instruction.

## Pending set (verified against this directory at 2026-09-23T06:38Z)

Existing (9 of 13): Q01, Q02, Q05, Q06, Q08, Q09, Q10, Q11, Q12.
Missing primaries (Gemini, gated on batch remediation step C): Q03, Q04, Q07, Q13.
Pending challenges: Mistral on Q03 and Q07; Copilot on Q04; Gemini on Q01, Q08 and Q09;
DeepSeek on Q13 after Gemini's primary lands.
Completed pairs: Q02, Q05, Q06, Q10, Q11, Q12.

## Cross-cutting finding (reached independently by Q05, Q06, Q11 and Q12)

The measurement layer is not reliable enough for ratings, coefficients or calibration.

Numbers, cited as a snapshot with its timestamp (the metrics file appends a row at every
Stop, so any live count ages immediately):
- `.ai/runtime/metrics/sessions.jsonl`, snapshot 2026-09-23T06:38Z (challenge round):
  77 rows over 26 distinct sessions = 2.96x stop-event overcounting; 30 rows with null
  `firstEditMs`; 60 of 77 rows belong to Claude; zero rows for Mistral.
- R0 dataset (`docs/research/2026-09-23-r0-decision-dataset/`): 3 review-depth rows and
  5 round outcomes, against the 150-200 per surface that Jev calibration needs.

## Label discipline (meta-finding)

A `MEASURED` label without a measurement is itself a finding. Instances from this round:
- Q11's succession table is labelled MEASURED while its challenge shows no measurement
  behind it (Q11 section 11).
- Q02's primary attributes a 7/7 figure to `.ai/DECISIONS.md:1789` where no such wording
  exists, and cites `.ai/DECISIONS.md:1884` for a rule that lives at AGENTS.md:153 (Q02
  section 11).
- Q10's primary states inventory counts (120+ / ~50 / ~50) against measured 307 / 866 /
  593 / 45, and its five secondary-repository citations all point at lines that say
  something else or at facts absent from the file (Q10 section 11).

## Remaining chain (coordinator, 2026-09-23; rebuilt from the assignment table)

State update 2026-09-23T10:30Z: round-2 re-certification, Claude slot FAIL (report
docs/reviews/2026-09-23-claude-batch-certification-round2.md, receipt 10:22:16Z). Path
contract, protected set and immutability are genuinely closed (47 path forms, 15 manifest
shapes, 23 malformed ledger shapes all exit 2; tamper detection both directions). Open:
F-R2-01 framed row above the header dropped -> PASS, recorded attempt 2 on RC-ledger-parse
(budget exhausted); F-R2-02 role exclusion by bare substring over TASK.md prose excludes
the standing certifier (new regression); F-R2-03 the candidate's own union ledger is
rejected by check 2's contiguity rule, so the budget cannot be computed from the only
ledger; F-R2-04 unrecognised CLI flag accepted silently. Codex slot died on quota
(10:02:44Z), retry scheduled 13:40Z. No new fix round opened: the next step is the owner's
call. Gemini research running.

Owner decisions 2026-09-23T10:45Z (interactive resolution):
- Open a SECOND remediation round (RC-ledger-parse attempt 2 of 2, the LAST; other root
  causes attempt 1).
- F-R2-03: CROSS-FILE attempt counting for check 2 (all findings ledgers under
  docs/reviews/; contiguity of the union; identical duplicates merged; conflicting
  dispositions exit 2); record the rule in the spec.
- F-R2-02: exact role tokens parsed only from the structured `## Roles` entries plus a
  negation guard.
- F-R2-04: unknown CLI flags exit 2 in both tools.
- Round-3 certifiers: a fresh Claude (slot 1, replacing Codex) and a fresh Mistral
  (slot 2). Codex remains quota-blocked until 16:36 MSK and is dropped from this round.
- Gemini pauses research and runs the second fix round now; research resumes after handoff.

Owner amendments 2026-09-23T12:15Z (significant, recorded verbatim in effect):
- CERTIFIER SELECTION: the order Codex -> Claude -> DeepSeek is an AVAILABILITY order,
  applied as "first available AND independent of the candidate", not three checks.
  (Round-3 slots already follow it: Codex quota-blocked -> Claude slot 1; next available
  independent for slot 2 is Mistral; DeepSeek is excluded as coordinator.)
- Q03/Q04 EXTENSION (Gemini, not yet started): build a registry of EVERY main model per
  provider and each provider's effort scale, taken from `--help` and `models` output,
  never guessed. Measured 2026-09-23: claude `--effort low|medium|high|xhigh|max`;
  copilot `--reasoning-effort none|minimal|low|medium|high|xhigh|max`; agy `--effort
  low|medium|high`; codex has no effort flag, only `-c model_reasoning_effort`; vibe
  exposes neither effort nor model in `--help`. Scales differ; record native values, a
  normalised tier mapping, the verification date and CLI version, and the value actually
  used, not the one requested. CLI versions measured 2026-09-23: claude 2.1.278,
  copilot 1.0.88, codex 0.154.0, vibe 2.25.5, agy 1.2.9.
- Q12 EXTENSION (DeepSeek primary): evaluate CodeBurn (npm `codeburn` 0.9.25, local, reads
  session files): which of our clients it covers (Kilo, agy, copilot, vibe, claude, codex),
  what it measures (tokens, cost, time), what it cannot (quality), and how to join it with
  the findings ledger by session. Read-only reports only; NO `codeburn guard` (it installs
  hooks, PROTO-DEC-0034). Installing it even for evaluation needs the owner's explicit
  approval. Measured 2026-09-23: it is NOT installed on this machine (not on PATH, not in
  the npm global list), so the document must say what is knowable without installing and
  mark the rest as missing data pending that approval.
- NEW Q14 - certification model: two certifiers vs a confirmer reviewing the first's report
  vs a single senior expert, by risk class; plus a SHADOW certifier (Mistral or Copilot)
  run in parallel, recorded but not counted toward the gate, scored against the final
  outcome as the route into the succession chain. Primary: Codex when available;
  challenger: DeepSeek. Evidence base: F-C01, the round-3 F-003 closure later overturned,
  the Gemini PASS on an existing blocker.
- CERTIFIER SLOTS, ROUND 3 (owner correction 2026-09-23T12:40Z, supersedes the 10:45Z
  line): slot 1 = a fresh Claude; slot 2 = CODEX (quota resets 16:36 MSK; the fix round has
  not frozen yet, so Codex will be available at freeze time; certification takes priority
  over Codex's Q14 dispatch). Mistral is NOT in the availability order (Codex -> Claude ->
  DeepSeek) and was declined for a binding slot; it runs as a SHADOW certifier - same
  package, parallel, verdict recorded, not counted toward the gate. DeepSeek runs a
  non-certifying adversarial pass: reproduced findings block (PROTO-DEC-0041 item 4), but
  it issues no PASS.
- Q09/Q11 EVIDENCE (owner note): provider instability is a form of leave, not only quota.
  Measured 2026-09-23: Gemini's fix round hung for about forty minutes mid-turn (agy pid
  8420; last write 14:31 MSK; no child processes; killed and resumed), and the first resume
  died on `Eligibility check failed ... EOF` before doing any work. Record as leave
  evidence in Q09 and succession evidence in Q11.
- NEW Q15 - tool governance (skills, MCP servers, connectors) at project, task-class and
  session level. Primary: Copilot. Challenger: Mistral. Start with a zero-cost inventory of
  the active surface per client (Claude settings/.mcp.json/plugins, Codex config.toml, Kilo,
  agy mcp, vibe config) with schema-token cost. Measured anchors: the Codex config has 11
  MCP servers, 5 enabled, including a memory stack whose SQLite layer is 0 bytes; the user
  config costs 8,627 input tokens per call (190,204 vs 181,577 with --ignore-user-config),
  about 5.7x the 1,500-token budget of PROTO-DEC-0034 item 2. Build on PROTO-DEC-0034 and
  the MCP council's section-5 trial template rather than a new one: default-deny with a
  project allowlist; forced use only for the protocol's own deterministic tools, never an
  external tool in a gate path; descriptions justify a trial, never activation; paired A/B
  in worktrees on one frozen SHA, with schema tokens, invocation rate, fallback rate and
  duplicate reads alongside quality, time and cost.

Owner additions 2026-09-23T12:52Z:
- HANGS AND LIVENESS (record under Q09/Q11 and as a Layer-1 dispatcher requirement). First
  rule out the likeliest cause: an executor waiting on an interactive tool-permission
  prompt looks exactly like a hang - run executors non-interactively (agy --print /
  --sandbox) with a narrow, pre-granted permission set. Then treat liveness as PROGRESS,
  not process: no tree write, no journal update and no stdout for T minutes (15 for
  implementation work) means stalled. Executors must write ONE checkpoint line to their
  journal after each block, so a fresh session can resume from the file. The
  "inspect the tree -> finish -> close" resume prompt is standardised as a template
  (C:\Users\Dmitry\AppData\Local\Temp\kilo\resume-template.txt). Budget: two recoveries per
  executor; on the third, hand the task to a deputy instead of raising a warning - for this
  batch the deputies are DeepSeek (coordinator) or Copilot, because Claude and Codex are its
  certifiers. Observed evidence: agy runs were already print-mode with pre-granted
  permissions and still stalled twice (about forty minutes of silence; then an
  `Eligibility check failed ... EOF` on the next attempt), so permission prompts are ruled
  out and API-stream instability is the likely cause - count it as leave evidence.
- SCRIPTS REPLACING AI WORK (owner endorsement, for the synthesis). Standard for every
  script: fail closed (unknown input exits 2, with a test for silent pass-through
  specifically - all four of this week's worst script defects were silent passes); name the
  recorded decision it enforces; print the rows behind its result; carry a golden corpus of
  real past failures as regression tests; run in shadow alongside the manual check before it
  is trusted; be certified like kernel code; be re-verified when an input format changes.
  The "script or AI" criterion is the four conditions of section 1 of
  docs/specs/2026-09-23-executable-rulebook-spec.md.
- PERMISSION FLAGS REGISTRY (owner-measured from `--help`, 2026-09-23, for Q03/Q04):
  agy `--dangerously-skip-permissions`, `--mode accept-edits|plan`, `--sandbox`,
  `--print-timeout` (default 0s = wait forever); claude `--dangerously-skip-permissions`,
  `--allowedTools`; copilot `--allow-all-tools` (required for non-interactive mode);
  vibe `--auto-approve`, `--yolo`, `--smart-approve`, `--enabled-tools`,
  `--max-turns/--max-price/--max-tokens`; codex exec `--approve-for-me`,
  `--dangerously-bypass-approvals-and-sandbox`, `-s`. Narrow grants are preferred; full
  bypass only inside a disposable worktree with the owner's authorisation recorded
  (.ai/docs/CLI-AGENTS.md section 6). Dispatcher practice from here: agy relaunches carry
  `--print-timeout` (bounded turn; 45m for implementation turns, 20m for
  verification-only resumes) and `--log-file`, so a stall becomes an exit code and a
  permission prompt becomes visible in the log.

Assignment table (primary / challenger) with state at 2026-09-23T06:55Z:
- Q01 DeepSeek / Gemini - primary done; challenge pending (Gemini).
- Q02 Copilot / DeepSeek - complete.
- Q03 Gemini / Mistral - pending both.
- Q04 Gemini / Copilot - pending both.
- Q05 DeepSeek / Copilot - complete.
- Q06 Copilot / Mistral - complete.
- Q07 Gemini / Mistral - pending both.
- Q08 Copilot / Gemini - primary done; challenge pending (Gemini).
- Q09 Mistral / Gemini - primary done; challenge pending (Gemini).
- Q10 Mistral / DeepSeek - complete.
- Q11 Mistral / Copilot - complete.
- Q12 DeepSeek / Mistral - complete.
- Q13 Gemini / DeepSeek - pending both.

Chain:
1. Codex retry on `b232a9e` at 11:36 local; collect its report; union its findings with
   Claude's round-2 findings.
2. One remediation round C, implementer Gemini (ledger
   `docs/reviews/2026-09-23-batch-findings.md`, `protocol-verdict.cjs` run;
   RC-immutability-boundary attempt 2/2 last; RC-ledger-parse attempt 1).
3. As soon as C is handed off (Gemini reports), run IN PARALLEL:
   a. freeze the result (new commit) and re-certify with Codex + a fresh Claude session in
      separate worktrees at that SHA; copy both reports into the shared tree;
   b. Gemini's research primaries **Q03, Q04, Q07, Q13** and its challenges on
      **Q01, Q08, Q09**. Research writes only under `docs/research/2026-09-23-routing/`;
      Gemini pauses research only if re-certification returns a finding that needs it.
4. Dispatch the remaining challenges as their primaries land: **Mistral on Q03 and Q07**,
   **Copilot on Q04**, DeepSeek on Q13.
5. Before writing INDEX: verify against the directory that each of the 13 questions carries
   both a primary and a challenge.
6. Write the final `INDEX.md` from this draft: one row per question with recommendation,
   owner forks and quoted open disagreements; no synthesis, no decision.

Round-3 certification outcome (coordinator, 2026-09-23T18:50Z):- Frozen candidate 4ded1bee1c2acf2392fdeededf50935f59138302 (path-scoped freeze, DEC-0047
  item 12; validator 0 warnings, suite 376/376 at freeze).
- Verdicts: fresh Claude slot 1 FAIL (report
  docs/reviews/2026-09-23-claude-batch-certification-round3.md); Codex slot 2 FAIL
  (docs/reviews/2026-09-23-codex-batch-certification-round3.md); Mistral SHADOW PASS
  (docs/reviews/2026-09-23-mistral-shadow-certification-round3.md, recorded, not counted).
  All four round-2 findings are closed by execution (RC-ledger-parse closes at attempt 2).
- New blocking root causes, attempt 1 (union): RC-cross-file-scope (F-R3-01 / R3-C04:
  --stop-rule discovery reaches the target's own directory, so an undeclared sibling can
  supply a missing attempt 1 and turn a required exit 2 into exit 0 - the one that
  matters); RC-role-prose-substring residuals (F-R3-02 / R3-C01: stems and unrecorded
  negations instead of the exact-token rule); R3-C02 (role-section parse inputs);
  R3-C03 (owner-source-guessing in the candidate-journal direction); RC-immutability
  blank-line cases (F-R3-05 / R3-C05: blank lines between a committed block's end and its
  separator go unreported; predates the candidate). F-R3-03 (HIGH): the frozen tree lacks
  the implementer's journal and Evidence for the remediation round, so the candidate cannot
  satisfy its own Check 4 from repository state - a freeze-path-scoping defect of the
  coordinator. F-R3-04: 14 of 17 reproduction commands in the ledgers name scripts absent
  from the repository.
- Per DEC-0047 item 5 this was the LAST automatic certification of the batch; the coordinator
  opens no new round and returns this list to the owner.
- Shadow divergence (Claude/Codex FAIL vs Mistral PASS) is recorded for Q14 scoring.

Pipeline blockers 2026-09-23T19:12Z:
- Codex quota exhausted again until Sep 24 02:30 local. The Q14 primary document is saved
  (172 lines) and challenged (deepseek A1-A6 appended), but its journal close and receipt are
  pending on the quota; the close-out attempt exited on the same limit.
- agy (Gemini) is logged out: `error getting token source: You are not logged into
  Antigravity`; both research attempts exited without work. Owner interactive re-login is
  required before Gemini's primaries Q03/Q04/Q07/Q13 and its challenges on Q01/Q08/Q09 can
  start. (Earlier failures were network EOF and model-resolution; the last is credential.)
- Completed pairs: Q02, Q05, Q06, Q10, Q11, Q12, Q14 (primary saved, challenged), Q15
  (primary copilot, challenge mistral). Pending: Gemini's four primaries and three
  challenges; Mistral on Q03/Q07; Copilot on Q04; DeepSeek on Q13; the final INDEX after the
  directory check.



## agy permission diagnosis (coordinator, 2026-09-23T20:40Z)

Interactive agy works: it prompts per command and option 3 persists the command prefix to
settings.json. Headless print mode cannot prompt and soft-denies the shell permission
("Print mode: soft-denying tool confirmation \"RunCommand\""), which is the cause of every
narrow-grant exit today; the owner reproduced this by hand and approved commands
interactively. Remedies: persist the core prefixes (git, node, Get-ChildItem, Select-String,
file writes) via option 3, or authorise --dangerously-skip-permissions for the agy research
dispatches (CLI-AGENTS section 6 record). Full notes: C:\Users\Dmitry\AppData\Local\Temp\kilo\gemini-manual-launch.md.
