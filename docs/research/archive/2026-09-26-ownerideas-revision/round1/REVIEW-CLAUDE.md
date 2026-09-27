Mode: ADVISORY
Baseline: 7b6d17a; working tree status: dirty
Reviewer: claude-opus-5-5, route claude CLI, effort xhigh, 2026-09-26
Scope: the 13 OwnerIdeas files of CORPUS.md, traced into DECISIONS (to PROTO-DEC-0078), docs/core-arch, docs/ops, .ai/bin, tests, the validator and the research that fixes each status
Verdict: REVIEW COMPLETE

- Frame: `task:ownerideas-r1-claude` (parent program `ownerideas-revision`), independent reviewer 2 of 4.
  Session `claude-3fdb2418bfa55427`. Nothing here is a decision (AGENTS.md section 2).
- Dirty tree: untracked journals and, at start, the untracked revision package.
- POST-BASELINE OBSERVATION: while I worked, HEAD moved to `43fe7f4`. `1c51908` commits the revision
  package and `43fe7f4` changes one line of `.ai/TASK.md`. The 13 corpus files still match the
  CORPUS.md sha256 values, so no conclusion here depends on the move.
- Labels: **[F]** fact, with `path:line` or a decision id. **[I]** inference. **[Q]** open question.
- Chain: IDEA → DEC → PROC → IMPL → TEST → E2E. "Break" names the first missing link.

## 1. Executive summary

- [F] I read all 13 files in full: 20,591 lines, every sha256 equal to `CORPUS.md:12-24`. Ten
  files are research prompts or programs, two are hypotheses (H-AUTH-02, H-PROMPT-DELIVERY-01) and one
  is an agent-written synthesis. None is a specification or a decision.
- [F] The kernel has decided far more than it has built:
  - Decisions 0050, 0051, 0067 and 0074-0077 settle dispatch, supervision, recovery, resolver order
    and the validator migration.
  - The procedures that carry them are drafts or trials under `docs/core-arch/`.
  - `.ai/core/` does not exist (`ls .ai/`; kernel home per 0060 item 3), and neither does
    `docs/core-arch/stage-3/`.
  - None of `protocol-core.cjs`, `protocol-dispatch.cjs`, `protocol-signals.cjs`,
    `protocol-journal.cjs` or `protocol-validate.cjs` is in `.ai/bin/` (`git ls-files`).
  - Every L3 mechanism lives in two research-directory scripts that the protocol suite never
    runs, because `test-protocol.ps1:17` globs `tests/*.test.cjs` only:
    - `docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs`;
    - `docs/research/2026-09-25-improvement-research/prompts/launch.cjs`.

  For L0-L3 the typical break point is IMPL.
- [I] The six most valuable omissions, in order (section 11):
  1. deterministic authorization (H-AUTH-02). Today it exists only for one research run
     (0070 items 5-7);
  2. the kernel dispatcher and supervisor, with a single-writer lease (BACKLOG C-3);
  3. the bounded-context premise. It has never been measured, and the hand-built packets are already
     43-63 KB against a 40 KB budget (`CORE-ARCH-3.md:209-218`);
  4. an instruction/data trust boundary and data-read authority;
  5. separating task characterization from assurance;
  6. a per-run outcome record. Without one, model qualification cannot be based on evidence.
- [F] Cleanup candidates:
  - two intra-file duplicates, both DELETE candidates:
    - `performers.md:139-1344` repeats `benchmark.md:949-2154` line for line;
    - `scripts.md:1-1515` is a truncated first copy of `:1516-3029`;
  - two ARCHIVE candidates: `MIGRATION.md` (the council it framed has closed) and
    `SYNTHESIS-2026-09-25-cross-document.md` (it declares itself temporary, and parts are stale).
  - [I] `Google_AX.md`, `MCP_Server.md` and `Rust.md` must stay, because they seed study A of
    PROTO-DEC-0066, which has not started.
- [F] These contradictions need the owner (section 10):
  - 0048 item 7 (at most two edit streams, kept by `DECISIONS.md:2245`) against the dispatch's five
    parallel executors;
  - 0062 item 2 against a separate characterizer layer;
  - 0075 item 8 against the rule "risk raises assurance, not the executor tier";
  - 0063 item 1 against using benchmark priors;
  - 0036 item 1 against an MCP facade;
  - 0025 item 5 and 0077 against a Rust core;
  - 0073 item 3 against delivery variant D;
  - 0076 item 1 against the RISK council's six or more model makers;
  - R-L0-09 against H-SEC-01;
  - the dispatch's closing cycle against 0041 items 1-2.
- Counts over 68 rows (Appendix A):
  - IMPLEMENTED 5, PARTIALLY_IMPLEMENTED 30, ACTIVE 11, RESEARCH_CANDIDATE 15;
  - SUPERSEDED 1, DUPLICATE 2, ARCHIVE_CANDIDATE 2, UNCLEAR 2.

  [I] The row granularity is my own.
- Disclosure [F]. My model family (claude-opus-5-5) wrote much of the kernel footprint reviewed
  here, including CORE-ARCH-1..7, P-L2-002, workflowAI and L-CORRECTION-4, and it wrote the corpus
  file `SYNTHESIS-2026-09-25-cross-document.md:3`. Under R-L1-002.1 that makes it the same
  participant. This advisory review certifies nothing, but readers should weigh my agreement with
  those records accordingly.

## 2. Inventory reviewed

| File | Lines | Read | Nature | Stated purpose |
|---|---:|---|---|---|
| Google_AX.md | 2085 | full | research prompt (80 sections) | what Google AX can give Colabs; seed of study A |
| MCP_Server.md | 3452 | full | research prompt (200 sections) | Colabs as an MCP server or servers; seed of study A |
| Rust.md | 1019 | full | research prompt | runtime speed, a Rust core, work elimination; seed of study A |
| MIGRATION.md | 1314 | full | council prompt | the validator migration council |
| RISK_COUNCIL.md | 3115 | full | council specification | design-level audit of the v2 kernel |
| H-AUTH-02.md | 58 | full | hypothesis | bounded execution authorization |
| H-PROMPT-DELIVERY-01_…md | 69 | full | hypothesis, agent-written | task delivery variants A-E |
| SYNTHESIS-2026-09-25-cross-document.md | 139 | full | agent synthesis | clusters K1-K10 and a proposed order |
| benchmark.md | 2200 | full | analysis plus research program | benchmark-driven model resolver |
| executor.md | 1185 | full | research program | minimum-sufficient executor, EAC formula |
| task_profife.md | 1582 | full | analysis plus research program | task characterization layer |
| performers.md | 1344 | full | model-profile inventory plus a copy | inventory of the model layer (+ duplicate) |
| scripts.md | 3029 | full | research program, twice | write broker, script runtime, procedure-to-script |

Kernel and evidence read in full:
- `.ai/DECISIONS.md:1145-1627` and `:1660-3359` (PROTO-DEC-0025..0036 and 0038..0078);
- `.ai/TASK.md`, `docs/decisions/REGISTRY.md` (the rows cited);
- CORE-ARCH-1, -4, -5, -6, -7, and CORE-ARCH-3 sections 5-12;
- stage-1 `L0-ROOT.md`, `P-L0-002`, `procedure.schema.md` sections 2-4;
- stage-2 `P-L1-002`, `P-L2-002`, `trial/S2-T10`;
- stage-4 `workflowAI.md`, `L-CORRECTION-4.md`;
- `PROPOSAL-role-resolver-supervisor.md` sections 1-6;
- `docs/ops/BACKLOG.md`, `PROBLEMS.md`, `MODEL-ECONOMICS.md`;
- improvement-research `README.md`;
- `final-plan-2.md` sections A-J;
- the MCP council final synthesis, lines 1-40.

Read in part (grep or head): `run-chain.cjs`, `launch.cjs`, `protocol-lock.cjs`, `protocol-handoff.cjs`,
`test-protocol.ps1`, `protocol-manifest.json`, `P-L0-007`, Q02, `MODEL-MATRIX.md`.

Not read:
- CORE-ARCH-2 and `OWNER-DECISION-execution-model-2026-09-25.md` in full. For the second I relied on
  0075, which says the owner's text wins, so [Q] a residual difference is possible;
- the stage-2 ROLE records;
- the archived reviews.

[Q] Encounters under COMMON "Independence":
- `git status` showed other reviewers' journals (`mistral-11f7b47fbc2a17b0`, `deepseek-a271dafb79d5d421`,
  `gemini-5fc14557972bfb5f`);
- a directory listing showed `round1/REVIEW-DEEPSEEK.md`.

I opened none of them.

## 3. Implemented ideas

```
OwnerIdeas source: scripts.md §20 (:648-661), singleton mutation resources are serialized
Canonical replacement: AGENTS.md §6 one-writer lock over TASK/PLAN/DECISIONS/ARCHIVE/REGISTRY; PROTO-DEC-0028, 0029
Evidence: AGENTS.md:267-324; .ai/bin/protocol-lock.cjs:123-254; tests/lock.test.cjs
Status: IMPLEMENTED (cooperative mutual exclusion; no FIFO or transaction semantics, which belong to the broker row X-05)
```
```
OwnerIdeas source: MIGRATION.md §6 and §14 (:284-313, :597-622); research frames must not run concurrent full suites
Canonical replacement: PROTO-DEC-0071 (research frames record Evidence with --quick); final-plan-2.md section N
Evidence: .ai/DECISIONS.md:2858-2862; .ai/bin/protocol-handoff.cjs:10,26-27,43; this frame's COMMON.md step 4
Status: IMPLEMENTED (for research frames; the incremental and standard paths are row X-12)
```
```
OwnerIdeas source: MIGRATION.md (whole): run a validator migration council with a frozen baseline, 3 rounds, draft, 2 critiques and a final plan
Canonical replacement: docs/research/2026-09-25-validator-migration-council/final-plan-2.md; PROTO-DEC-0077
Evidence: the council tree (round1..3, draft-decision.md, critique-A/b, verification-2.md); .ai/DECISIONS.md:3280-3299; REGISTRY.md:96-97
Status: IMPLEMENTED (the research run; its product, the Node validator, is not built, row X-11)
```
```
OwnerIdeas source: H-PROMPT-DELIVERY-01 variant C (:28); SYNTHESIS §4; the one-line pointer to a canonical task file
Canonical replacement: PROTO-DEC-0050 item 2, 0073 items 2-3, 0074 item 1
Evidence: .ai/DECISIONS.md:2085-2092, 2953-2961, 3007-3008; run-chain.cjs plus prompts/DISPATCH.json, which run this very frame end to end
Status: IMPLEMENTED (the delivery form; the comparative measurement is row C-01)
```
```
OwnerIdeas source: MCP_Server.md §151-154 (:2532-2566): Markdown and Git stay human-readable truth, usable offline and without a server
Canonical replacement: AGENTS.md §1 source ranking; PROTO-DEC-0034 (the filesystem is the only project memory); PROTO-DEC-0045 item 1
Evidence: AGENTS.md:16-35; .ai/DECISIONS.md:1561, 1914
Status: IMPLEMENTED (a standing constraint on any future facade)
```

[F] One more principle is present but out of scope: dropping a metric that changes no decision
(scripts.md:1221-1223; task_profife.md:1238-1253) is PROTO-DEC-0047 item 11 (`DECISIONS.md:1985`) for
metrics. For resolver fields it is not applied yet (row W-09).

## 4. Partially implemented ideas

Ids are my own and are keyed to Appendix A.

| Id | Idea (source) | Existing [F] | Missing | Break |
|---|---|---|---|---|
| G-01 | Deterministic EXECUTE / DELEGATED-JUDGEMENT / OWNER-DECISION / STOP (H-AUTH-02:8-16,50-58; MIGRATION:62-99,1173-1203) | 0070 items 5-6 (`DECISIONS.md:2800-2810`), but item 7 scopes them to the 0066 run; P-L0-002 covers the STOP half in prose (`enforcement: P`, `P-L0-002:14`); 0062 item 3; 0078 item 3 | a kernel-wide rule; a DELEGATED-JUDGEMENT class; a machine-verifiable "exactly one admissible transition" test; no L0 record | DEC |
| G-04 | Kernel epoch, packet freshness and in-flight compatibility (RISK:778-805,1383-1403) | schema `version` and `supersedes` (`procedure.schema.md:50,70`); 0075 item 7 launch pinning (`DECISIONS.md:3103-3111`), missing in run-chain (BACKLOG M-4) | kernel epoch or policy hash; task pinned to a kernel snapshot; compatibility range; migration semantics in P-L0-001 | IMPL |
| G-05 | TCB map and self-update for every TCB component (RISK:845-889; MIGRATION:458-494) | for the validator only: final-plan-2 section P, DBI-07 (`final-plan-2.md:77-79`) | the TCB list (resolver, compiler, verdict, scope, dispatcher, watchdog, lock) and an N-1 or differential policy for each | PROC |
| G-08 | Owner as a single point of failure: delegation, batching, asynchronous answers, safe waits (RISK:1440-1462) | 0062 item 3 (coordinator within a recorded delegation); P-L0-002 step 5; 0078 items 3-4; structured polls | the delegation artifact (an L5 proposal only, `CORE-ARCH-7.md:79-80`); timeout semantics; an owner-only list | PROC |
| R1-01 | Epistemic independence as well as procedural (RISK:1164-1199) | R-L1-002.1 (participant = model); 0056 item 2 rotation; 0075 item 13 (family or provider per workflow, `DECISIONS.md:3153-3156`); the family rule was dropped (`CORE-ARCH-3.md:110-111`) | common-mode detection; when diversity is mandatory for high risk | PROC |
| R1-02 | A capability envelope per task (H-AUTH-02:24-48; AX:680-743; MCP:980-1046) | ROLE Rights (prose); task-frame `scope`/`forbidden` (proposal, `CORE-ARCH-4.md:79-102`); git modes default-deny (0077 item 3; L-CORRECTION-4 item 3, launcher only); 0047 items 7, 11; 0070 item 4 | a single envelope covering network, secrets, command classes, expiry and delegated-judgement bounds; kernel enforcement; the H-AUTH-02 checks 1-7 (cwd is not a sandbox, a diff is not prevention, …) | PROC |
| R1-04 | File and interface ownership, one integrator, more than two parallel streams (MIGRATION:626-708,1237-1260; scripts:620-644) | 0048 item 7 cap of two streams, kept by 0054 item 3 (`DECISIONS.md:2024-2026,2245`); final-plan-2 sections S-T (migration only) | a kernel procedure for N parallel packages; a lift or exception to the cap | DEC |
| W-02 | Volume is not intelligence: drop Size from the tier (task_profife:295-329) | decided: 0075 item 8 (`DECISIONS.md:3112-3119`); proposal B1 (`PROPOSAL-role-resolver-supervisor.md:50`) | `P-L2-002:62` still scores Size, a stale record (BACKLOG M-5) | PROC |
| W-05 | Hard technical constraints are filters, not scores (task_profife:361-378; benchmark:485-510; executor:691-711) | 0075 item 8, last sentence; workflowAI 1.5 step 2 (`workflowAI.md:48-49`) | a context-window, modality and tool table per model (`performers.md:64`; MODEL-MATRIX has none); a scripted resolver | IMPL |
| W-07 | Minimum-sufficient executor: floor, then compatibility, then independence, then the cheapest admissible rung plus two substitutes (executor:52-82,244-265; benchmark:696-727) | 0074 items 2-4; 0075 items 9-10; `workflowAI.md:45-69`; the ladder (`MODEL-ECONOMICS.md:13-44`) | the resolver script (C-3). The runner names models, "a transitional breach of 0074 item 2" (`workflowAI.md:135-136`) | IMPL |
| W-11 | A per-run outcome record with tuple identity (model, version, client, effort, tools, class, role) and accepted completion (benchmark:330-381,1398-1417; Q02:13) | the `Launch:` line (R-L2-002.5); Evidence; `USAGE.md` from run-chain; Stop telemetry (0035), over-counted 2.96× (`CORE-ARCH-6.md:26`); M-007 (proposal) | the outcome variable (accepted first pass, repairs, escalations, escaped defects); one run-record schema (`SYNTHESIS:88-90`); tokens | IMPL |
| W-13 | Stage state machine plus an artifact validity contract (AX:879-897; RISK:810-841; scripts:436-465) | 0075 items 6, 11, 14 decided (`DECISIONS.md:3097-3102,3137-3144,3157-3162`); run-chain states (`run-chain.cjs:104-120`) | S-001 counts a node passed when its artifact *exists* (`CORE-ARCH-4.md:75-76`), weaker than 0075 item 6; freshness, provenance and not-superseded; no stage-3 records | PROC |
| W-14 | A machine-verifiable handoff package (AX:855-875) | Evidence and receipts (`protocol-handoff.cjs`); 0042; R-08/R-09 designed and marked "critical, package I-b" (`CORE-ARCH-6.md:31-55`) | `record --candidate` (0 matches in `protocol-handoff.cjs`); the candidate package | IMPL |
| W-15 | Research-cycle steps: compute what is decided, freeze the subject, freeze join-key questions, closer reads the primaries (MIGRATION:103-214; RISK:59-94; benchmark:2065-2120) | 0052/0053; S-003 trial record; the validator council practice; 0046 item 6 (one SHA); `baseline` in the task-frame proposal (`CORE-ARCH-4.md:91`) | these steps are absent from the S-003 record | PROC |
| W-17 | Procedure-to-script: scriptability scoring, maturity M0-M5, shadow promotion, monoculture guards (scripts:807-1046) | spec §1 four conditions; 0045 item 6; 0047 item 8 (shadow before trust, golden corpus, fail closed; `DECISIONS.md:1982`); 0051 item 3; R-L0-15; schema `script_candidate`; built: verdict, scope, ledger, index | the signals ledger (`.ai/SIGNALS.md` absent; interim `Signal:` lines in 18 journals, 58 archived); a procedure inventory and scores; maturity levels | IMPL |
| W-18 | A comparative benchmark: a task set with known expected results, isolated variables, L0 A/B/C (AX:1390-1517,1821-1878; RISK:1986-2089) | P-L0-007 draft (2-3 tasks, one model; `P-L0-007:37-51`); 0060 item 2 A/B/C after the kernel | a fixed golden task corpus and harness | IMPL |
| X-01 | Kernel dispatcher and supervisor (AX:1086-1122; RISK:934-971; scripts:729-751) | 0050 item 4, 0075 item 11 decided; run-chain (pid plus start time, `run-chain.cjs:60-64`; states; one fallback); launch.cjs (P-L3-004 trial) | the kernel script (C-3, `BACKLOG.md:98-99`); tests in the protocol suite (`test-protocol.ps1:17`) | IMPL |
| X-02 | Single active mutating executor: lease, fencing, generation, operation id, idempotency (RISK:934-971; scripts:542-561,755-771; MCP:2190-2243) | 0067 items 4, 6 (no second executor after useful work, no parallel runs); pid plus start time in run-chain; lock session tokens (0028/0029) | lease, fencing and idempotency keys; cloud, remote and Kilo cases | PROC |
| X-03 | Resume-first, error-aware recovery (AX:306-337,1104-1122) | 0051 item 4; 0075 items 2-4 (`DECISIONS.md:3074-3092`); P-L3-004 trial | run-chain lacks resume and error classes (M-4); R-L3-004.4-5 conflict with 0075 (M-5) | IMPL |
| X-04 | Workspace per job, git architecture (AX:788-851; scripts:156-198) | launch.cjs: a private clone per attempt, scoped copy-back (`launch.cjs:22-23`), git modes, ls-remote audit; certified RECOMMENDATION twice (`PROBLEMS.md:30-34`) | never launched (K-launch pending); run-chain runs in the checkout with the owner's credentials (M-8) | E2E |
| X-07 | Ports and adapters: one core API behind CLI, MCP and AX; no domain logic in transport (MCP:1733-1776,2582-2592; AX:1271-1287) | `validate(root, options)` designed (`final-plan-2.md:179-192`); SYNTHESIS K1 | an API boundary beyond the validator; nothing built | IMPL |
| X-08 | Bounded structured script output and stable error codes (scripts:972-996; MCP:499-520,1482-1516) | exit 2 for unknown (0049 item 2); "print the rows" (0047 item 8); execution error classes (0075 item 4); some JSON output (`protocol-lock.cjs:297`) | a uniform output and error schema across `.ai/bin` | PROC |
| X-09 | Worklog, review and decision indexes (Rust:633-648; MCP:2766-2800) | decisions index built (0044 item 2; `protocol-index.cjs`; `tests/index.test.cjs`) | the navigation index over reviews and journals (0057 item 5; package I-a) | IMPL |
| X-10 | Model inventory and discovery (performers:8-72; H-WAI-1) | P-L3-002/003 run once by hand (MODEL-MATRIX); `kilo-routes.cjs` | automated discovery; the per-client model and effort procedure (0065 item 2, S4-T10) | IMPL |
| X-11 | Node validation core, PowerShell wrapper, differential verification, TCB-safe update (MIGRATION:413-593) | 0025 item 5; 0039 item 3; 0077; final-plan-2 A-AC | no implementation (`protocol-validate.cjs` absent); launch conditions M-7 open | IMPL |
| X-12 | Fast, standard and full paths; incremental validation DAG (Rust:452-516; scripts:370-415) | `--quick` (row in section 3); final-plan-2 section N | the incremental or affected-check map; a standard handoff path | DEC |
| X-13 | Split the test suite (Rust:573-597) | measured: `tests/validator.test.cjs` takes 283 s of 309 s (`final-plan-2.md:94-95`); plan section M | not done | IMPL |
| X-20 | Secret propagation beyond journals (RISK:1132-1160) | secret scan in record and Stop (AGENTS §7); credential scrub for jobs (L-CORRECTION-4 item 2) | redaction of runner and launcher logs, `USAGE.md` and copied-back transcripts | PROC |
| K-02 | Bounded active context: packet compiler, completeness harness, L0 A/B/C (RISK:273-313,1923-2089; MCP:596-642) | R-L0-02 (`L0-ROOT.md:39-43`); loading levels (`procedure.schema.md:134-152`); compile-packet proposal (`CORE-ARCH-7.md:92-104`); S2-T10 hand-built packets | the compiler; precision and recall; completeness tests; **measured over budget: 43,167-62,873 B against 40,000 B** (`CORE-ARCH-3.md:215-218`) | IMPL |
| K-07 | Global procedure-graph checks (RISK:894-930,2134-2168) | LCC-1..9 (P-L0-004 draft); per-record `back_edges` budgets; check-links in SPEC (not built) | deadlock, orphan and no-eligible-certifier checks over the whole graph | IMPL |

## 5. Missing L0–L3 mechanisms

| Level | Mechanism (OwnerIdeas source) | What exists [F] | Gap | Row |
|---|---|---|---|---|
| L0 invariants | Instruction/data trust boundary: repo text, tool output and reports never instruct (RISK:1074-1128) | R-L0-04: prompts and calls transfer no authority (`L0-ROOT.md:52-56`); 0043 item 2 | nothing on untrusted repository, tool or MCP content | G-02 |
| L0 invariants | Data-read authority separate from kernel reading (RISK:1033-1070) | R-L0-09 "Reading is never forbidden" (`L0-ROOT.md:73-75`, approved design 0061) | secrets, PII and out-of-scope data | G-03 |
| L0 stop/ask | The "execute without asking" half (H-AUTH-02) | P-L0-002 stop half only | the owner stays a runtime bottleneck | G-01 |
| L0 lifecycle | In-flight versioning, kernel epoch | P-L0-001 lifecycle states | tasks straddling a kernel change | G-04 |
| L0 source conflicts | A status for OwnerIdeas itself | AGENTS §1 ranks five sources and never names `OwnerIdeas/`; the validator treats it as not protocol-owned (`CORPUS.md:5-6`) | [I] no rule says owner-idea files are advisory, or when they leave the active corpus. That is the gap this dispatch exists to close (DISPATCH-OWNER §4) | §11-10 |
| L0 decision change | TCB self-update policy | validator only | the other TCB parts | G-05 |
| L1 rights | A machine-readable envelope bound to role and frame | ROLE Rights in prose | network, secret and expiry authority; enforcement | R1-02 |
| L1 rights | Permission inheritance on resume, fallback and restart (H-AUTH-02:45-46) | 0070 item 7 (expiry, scoped) | no rule for inheritance | R1-03 |
| L1 independence | Epistemic diversity, common mode | the model-id rule | diversity criteria | R1-01 |
| L1 ownership | Parallel file ownership above two streams | 0048 item 7 | a procedure or exception | R1-04 |
| L2 characterization | A task profile vector separate from model choice (task_profife) | P-L2-002 rubric (six factors) | spec quality, testability, determinism, horizon, context | W-01, W-04 |
| L2 selection | The resolver; EAC and escalation chain | workflowAI 1.5 in prose | script; formula; evidence | W-07, W-08 |
| L2 acceptance | Candidate package; artifact validity | designs | build and alignment | W-13, W-14 |
| L2 assurance | Risk sets review depth; calibration without circular truth (RISK:1203-1231) | 0041, 0047 item 4 (shadow scored against the "final outcome") | external ground truth | W-03, W-16 |
| L2 workflow | Adaptive depth and parallelism | study B approved, not run (`README.md:85-93`) | everything | W-12 |
| L3 dispatch/supervision | Kernel dispatcher, watchdog, lease | research tools only | kernel script and tests | X-01, X-02 |
| L3 failover | Resume-first, error classes | decided | built only partly | X-03 |
| L3 locks/write coordination | Broker or queue, optimistic concurrency, conflict packets, backpressure (scripts) | cooperative lock; copy-back without a conflict check | the whole broker | X-05 |
| L3 discovery/routing | Automated discovery, capability data | manual P-L3-002 run | script; context-window data | X-10, W-05 |
| L3 tooling | Core API, structured output | the validator API only | general | X-07, X-08 |
| L3 automation | Signals ledger, script maturity | spec and decisions | ledger, inventory | W-17 |

## 6. Research candidates

| Id | Idea | Home (layer) | Exists | Missing | Needs |
|---|---|---|---|---|---|
| K-01 | The RISK council as the design audit of v2 (RISK whole; P0 = "must close before v2 is the default", `:2518-2530`) | L0-L9 | nothing run; sequencing is with the owner (BACKLOG C-4; `TASK.md:68`) | the whole run | research; the K4 harness first (SYNTHESIS §2.4) |
| K-03 | CATALOG summary is an O(N) tax (RISK:602-641) | L0/L2 | "Everything else loads at summary" (`procedure.schema.md:151`); S2-T10 packets "Catalog (summary): all other records" (`S2-T10:22`) | a scale experiment (RISK:2092-2130) | research |
| K-04 | Explicit dependency edges for packet completeness (RISK:645-694) | L0 schema | fields end at `back_edges` and `tools` (`procedure.schema.md:55-61`) | proof or disproof that the current fields suffice | research |
| K-05 | Who detects triggers (RISK:698-735) | L0/L2 | "opened in full when its trigger fires" (`procedure.schema.md:149-150`), no detector named | a deterministic or judgement split | research |
| K-06 | Read-widening accounting (RISK:741-775) | L8 | the `Read-widening:` line (proposal, `CORE-ARCH-7.md:76-77`) | metrics | research |
| W-01 | Task characterization as its own layer (task_profife:468-504) | L2 | P-L2-002 mixes scoring and choosing | conflicts with 0062 item 2 | research, then an owner decision |
| W-04 | Spec quality, testability and determinism as routing factors | L2 | proposal E1 (`PROPOSAL…:86-89`) | evidence | research |
| W-06 | A static pre-launch context estimator (task_profife:1043-1069) | L2/L3 | hand byte counts | predictive value | research (a script candidate) |
| W-08 | EAC/EAT, escalation chain as the unit, time price λ, scarcity multiplier, regret (executor; benchmark:605-767) | L2 | headroom tie-break (0078 item 2) | model, data | research |
| W-09 | Class-level capability profiles, benchmark portfolio, prior plus local fusion, recalibration (benchmark; performers:125-137) | L2/L3 | TD-MODEL-QUALIFICATION (`workflowAI.md:142-157`); H-WAI-3/4 frozen | everything; conflicts with 0063 item 1 | research |
| W-10 | Controlled lower-bound and shadow exploration for executors (executor:301-358,948-962) | L2 | shadow certifiers only (0047 item 4) | a policy | research |
| W-12 | Adaptive execution depth, speculative N-way work, dynamic council (AX:962-976,1586-1672; RISK:1235-1266) | L2 | study B framed (0066) | the run; a holdout design against overfitting | research (study B) |
| X-05 | Write broker, queue, conflict detection, backpressure; "an LLM does not wait for a write right" (scripts:1483-1487) | L3 | lock; 0048 item 7 | measurements at 5-15 agents; its own falsifiers (`scripts:1436-1450`) | research |
| X-14 | Daemon, incremental snapshot, watcher, caches, git batching, process count (Rust C-F, J, O; MCP:1616-1684,2719-2762) | L3 | excluded from the migration (`final-plan-2.md:175-176`) | measurements | research (study A) |
| X-15 | Colabs as an MCP facade (MCP whole) | L3 adapter | research allowed by 0066; adoption blocked by 0036 item 1 | reopen trigger | research (study A) |
| X-16 | Google AX backend, ExecutionBackend abstraction, local-first, resource limits (AX whole) | L3 | study A framed | [Q] AX existence and API are unverified in the repository | research (study A) |
| X-17 | Remote or cloud execution without a shared filesystem (RISK:975-1029) | L3/L5 | cloud Evidence fail-closed (0077 item 1) | Workspace and ArtifactTransport | research |
| X-18 | A project-code context resolver (RISK:1295-1341) | L3 | native-only (0036, 0045); S1 arms gated by triggers (0045 item 2) | trigger evidence | research, gated |
| C-01 | Delivery variants B/C/E measured (H-PROMPT-DELIVERY-01) | L3 | frozen (`BACKLOG.md:109`) | measurements; drop D | research (low) |
| G-02, G-03, G-09 | Trust boundary, data-read authority, threat-model modes | L0 | see section 5 | policy options | research, then a decision |

[I] Proposed grouping, so that one brief is not dispatched four times:
- (a) a model-layer program merging benchmark, executor, task_profife and the unique part of
  performers. They share one master brief (`benchmark.md:996-1603`) and overlap H-WAI-2..5;
- (b) the RISK council;
- (c) study A as approved: AX, MCP, Rust;
- (d) study B;
- (e) write coordination and scale (scripts).

## 7. Superseded / stale material

| Passage | Why stale [F] | Current authority |
|---|---|---|
| Rust.md:148-207,1013 "a Rust core; fold Node and PowerShell into Rust" | the validator engine is Node with differential verification; Rust needs a class F reopen (`final-plan-2.md:71-75,148`) | PROTO-DEC-0025 item 5, 0039 item 3, 0077 |
| MCP_Server.md whole, as an adoption path | "no MCP adoption" (`DECISIONS.md:1612`); at most one server within 1,500 tokens (`:1553`); native-only stands (`:1914`) | 0034 item 2, 0036 item 1, 0045 item 1; research only under 0066 |
| H-PROMPT-DELIVERY-01 variant D (:29) | a script's message is a pointer and nothing more (`DECISIONS.md:2958-2959`). Q6 (:45-46) is answered by 0073 item 2 | 0073 |
| benchmark.md:939-945, executor.md:1185, performers.md:31-33 "T1-T9 is today's selection mechanism" | practice moved to the owner's ladder, floor, then cheapest rung (`workflowAI.md:45-60`; `MODEL-ECONOMICS.md:13-44`); P-L3-003 ranks were replaced in practice | 0076 items 1-2, 0075 items 9-10 |
| performers.md:14 routes "Copilot, Antigravity, Vibe, Kilo" | CLI only; Kilo only for DeepSeek Max; copilot outside the ladder (`MODEL-ECONOMICS.md:42-44`) | 0076 item 1 |
| MIGRATION.md:864-869,1014-1017 "choose models via P-L2-002; ranked Anthropic flagship" | roles, not models; the ladder decides | 0074 item 2, 0076 |
| SYNTHESIS:7-14 ("seven files"), :84-87 ("blocked only by P-1"), :131 ("close L-CORRECTION-4") | P-1 closed (`PROBLEMS.md:11,30-37`); C-7 done (`BACKLOG.md:91-93`); the corpus now has 13 files | PROBLEMS, BACKLOG |
| RISK_COUNCIL:1499-1504 "at least 6 researchers of different makers" | the current routes reach 5 makers (Anthropic, OpenAI, DeepSeek, Google, Mistral) | 0076 item 1 |
| task_profife.md:8 "P-L2-002 at 4a85a23" | still accurate: the rubric is unchanged. Not stale, but the record it describes is stale (row W-02) | 0075 item 8 |

## 8. Delete candidates

Only exact duplicates qualify. [F] AGENTS.md:459-467 forbids "delete history instead of archiving it",
so whole files go to section 9.

| Target | Evidence of zero loss [F] | Keep |
|---|---|---|
| `performers.md:139-1344` | line-for-line equal to `benchmark.md:949-2154` after CRLF normalisation (1,206 lines, 0 differences; node comparison in this session) | performers.md:1-137 (the unique inventory) |
| `scripts.md:1-1515` | lines 1-1513 are a prefix of 1516-3029; line 1514 is truncated ("моделе"); line 1515 is blank | scripts.md:1516-3029 (the complete copy) |

## 9. Archive candidates

| File | Why | Condition before moving [I] |
|---|---|---|
| `MIGRATION.md` | its council ran and closed. Its authority is `final-plan-2.md` plus PROTO-DEC-0077, and a reworked extract already lives at `…/validator-migration-council/OWNER-PROMPT.md` (`CORPUS.md:41-43`) | first carry its reusable methods (owner-question filter :1173-1203, decision boundary :163-214, subject freeze :103-131) into S-003 and L0 (rows W-15, G-01) |
| `SYNTHESIS-2026-09-25-cross-document.md` | agent-written; says it moves out of OwnerIdeas once package L closes (:3-5), which has happened; stale in parts (section 7) | relocate to `docs/research/`; do not cite it as current |
| After study A runs: `Google_AX.md`, `MCP_Server.md`, `Rust.md` | seeds of 0066 study A, not yet run (`README.md:9-11,85-93`) | archive only once study A records their disposition |
| After the RISK council: `RISK_COUNCIL.md`; after the model-layer frame: benchmark, executor, task_profife, performers | consumed research specifications | as above |

## 10. Contradictions between OwnerIdeas and current kernel

| # | OwnerIdeas position | Kernel position [F] | Note |
|---|---|---|---|
| 1 | a separate Task Characterization layer (task_profife:12-30) | "No separate layer is added" (0062 item 2, `DECISIONS.md:2483`) | adopting it needs a new block |
| 2 | risk raises assurance depth, not the executor (task_profife:146-194,382-412) | the consequence of an error is a tier input (0075 item 8); floors T7/T4 (0059 item 2) | BACKLOG C-8 (proposed 0079) sides with OwnerIdeas; open |
| 3 | public benchmarks as the routing prior (benchmark:65-282,514-578) | "Third-party leaderboards … are not sources" for strength (0063 item 1, `:2510`) | scope: rank and price; competence evidence needs a ruling |
| 4 | Colabs as an MCP server (MCP whole) | "no MCP adoption" (0036 item 1); C2 limits (0034 item 2) | [Q] does a Colabs-owned facade count as "adoption"? final-plan-2 G reads MCP as closed |
| 5 | a Rust core (Rust:148-180,1013) | a Node engine (0025 item 5; 0077) | class F reopen |
| 6 | variant D, where the orchestrator injects text (H-PROMPT:29) | pointer only (0073 item 3) | |
| 7 | RISK round 1 with 6 or more makers (RISK:1499-1504) | CLI-only routes (0076 item 1) | |
| 8 | "reading is never forbidden" is under test (RISK:1033-1070) | R-L0-09, approved design (0061 item 1) | the security carve-out is missing |
| 9 | transition when the artifact is valid (RISK:810-841) | S-001 "passed when the artifact exists" (`CORE-ARCH-4.md:75-76`) against 0075 item 6 | an internal kernel inconsistency |
| 10 | 10-15 concurrent writing agents (scripts:42-51) | at most 2 edit streams (0048 item 7; `:2245`) | research does not count (0069) |

Program-level conflicts found while reading the dispatch. These are not corpus content, and I report
them without resolving them:
- **P-1.** Stage 8 runs five executors in parallel (`DISPATCH-OWNER.md:815-829`), but 0048 item 7
  allows at most two active edit streams for code, kernel and main documents.
- **P-2.** Closure runs DeepSeek, then Claude (`:915-975`). Claude dispatches the executors
  (stage 8) and writes their packages (stages 5-6), so it controls the candidate, and DeepSeek
  writes the plan (stage 3). If the implementation touches protocol core, 0041 items 1-2, 0057
  item 4 and R-L1-002.2 bar both of them from certifying, and they require two parallel
  independent certifiers. [Q] Is `CLOSED` a certification?
- **P-3.** "Fallback to another model is not allowed without an owner decision" (`:1073-1080`) is
  stricter than 0075 items 3 and 10. `DISPATCH.json` sets no fallback, so the two are consistent in
  practice. [Q] Should this be recorded as a block for the program?

## 11. Highest-value omissions

1. **Deterministic authorization (G-01, R1-02, R1-03), L0-L1.**
   - [F] "When the rules admit exactly one admissible action, act and record the basis" exists only
     inside 0070, which ends with the 0066 run (item 7).
   - P-L0-002 lists stop triggers but no execute rule.
   - [I] Every multi-stage chain, this one included, therefore escalates to the owner by default.
2. **The kernel dispatcher and supervisor with a lease (X-01, X-02, X-03), L3.** [F] Seven accepted
   blocks describe it, and no kernel script implements it. The two research tools are untested by the
   suite, and one of them runs jobs with the owner's credentials (M-8).
3. **Bounded context is unmeasured and already over budget (K-02..K-05), L0/L2.** [F] Packets run
   43-63 KB against 40 KB. The summary tier grows O(N). Records have no dependency edges and triggers
   have no detector. [I] This is the premise of CORE-ARCH, and it is untested.
4. **The trust boundary and data-read authority (G-02, G-03), L0.** [F] Nothing in L0-ROOT or the
   decisions separates instructions from repository or tool data. R-L0-09 blocks a least-privilege
   carve-out.
5. **Characterization against selection against assurance (W-01..W-05), L2.** [F] P-L2-002 still
   scores Size. The conflicts with 0062 item 2 and 0075 item 8 are unresolved (C-8).
6. **No outcome record, so no evidence loop (W-11, W-09), L2/L3.** [F] TD-MODEL-QUALIFICATION lists
   the loop as missing (`workflowAI.md:153`). [I] The model research of benchmark and executor cannot
   be validated without it.
7. **Artifact validity (W-13), L2.** An existence-based trunk contradicts the decided completion
   contract.
8. **The signals ledger (W-17), L2/L3.** 0051 is decided but not built, so procedure-gap and
   script-candidate signals stay scattered across journals.
9. **Write coordination above two streams (R1-04, X-05), L1/L3.** The program's own stage 8 needs it.
10. **OwnerIdeas has no status or lifecycle rule (L0 source conflicts).** [I] This is the cause of the
    "second source of truth" risk the dispatch names, and the SYNTHESIS file shows it happening.

## 12. Uncertain classifications

- **X-16 Google AX.** [Q] The repository gives no evidence that "Google AX (Agent eXecution)" and its
  Task, Workspace, Gateway and Model primitives exist as described. I did not verify this externally,
  so study A must.
- **C-09 benchmark facts.** [F] `benchmark.md` has 10 dangling `:chatgpt-content-reference` markers
  (for example :75, :93, :117). Its sources are absent. The existence and figures of RepoProbe,
  ArchBench, AACR-Bench and SWE-Lancer are unverified, so this row is UNCLEAR.
- **C-07 performers.md:1-137.** The inventory's state column is partly verified (context windows are
  absent from MODEL-MATRIX, confirmed). It is a snapshot that can go stale, and it competes with
  MODEL-MATRIX and MODEL-ECONOMICS. I keep it ACTIVE as a research input, with low confidence.
- **X-05 the broker.** I chose RESEARCH_CANDIDATE over PARTIALLY_IMPLEMENTED. The lock and the
  copy-back are neighbours of a broker, not a partial broker.
- **C-01 H-PROMPT-DELIVERY-01.** RESEARCH (low) or ARCHIVE: variant C is built and D is excluded.
  Owner call.
- **"M3".** [I] I read it as BACKLOG M-3, the re-resolution before K-launch of study A
  (`BACKLOG.md:56-57`; `SYNTHESIS:133`).
- **0076 item 4.** [Q] "No new hypotheses are opened." Does this revision's research list open
  hypotheses, or only classify them? I assumed it only classifies.
- **0070 items 5-6.** [Q] The owner's wording is general ("Повторное подтверждение владельца не
  требуется…"), but item 7 scopes it to one run. Did the owner mean a general principle?

## 13. Recommended next actions

Advisory. Owner decisions come first because they gate the plan.

1. **The owner rules on the section 10 conflicts before stage 3 resolves the boundary:**
   - P-1 and P-2, the program's own execution;
   - #1-#3, the model layer;
   - #4, whether an MCP facade counts as "adoption";
   - G-01, whether 0070 items 5-6 become a kernel rule.
2. **Cleanup (stage 3 list, Gemini):**
   - delete the two duplicate blocks (section 8);
   - relocate SYNTHESIS;
   - archive MIGRATION.md after row W-15 carries its methods;
   - keep Google_AX, MCP and Rust until study A;
   - add a status header to each remaining file: "advisory seed; consumed by <frame>".
3. **COMPLETE work for the plan (stage 3, DeepSeek), in dependency order:**
   - P-L2-002 realignment (W-02, M-5);
   - S-001 aligned to 0075 item 6 (W-13);
   - `record --candidate` and the package (W-14);
   - the signals ledger (W-17);
   - the kernel dispatcher with the workflowAI resolver, 0075 recovery and a lease, and with its
     tests in `tests/` (X-01..X-03, W-07);
   - the navigation index (X-09);
   - the test split, then the migration's M-7 (X-13, X-11);
   - the run-record schema (W-11).
4. **RESEARCH frames, each gated by the owner:**
   - the K4 harness, then the RISK council (K-01..K-07, G-02..G-05);
   - one merged model-layer program (W-01, W-03, W-04, W-06, W-08..W-10);
   - studies A and B as approved;
   - write coordination and scale (X-05).
5. **A rule for OwnerIdeas.** Owner-idea files are advisory seeds ranked below PLAN, and they are
   archived once the frame that consumes them closes.

## Appendix A — Required summary table (R1-REVIEW §11)

Action: KEEP | RESEARCH | COMPLETE; "—" on cleanup rows, whose disposition is the Status.
[Q] The vocabulary has no cleanup verb.

| Source | Idea | Related layer | Current implementation | Canonical source | Status | Action | Confidence |
|---|---|---|---|---|---|---|---|
| H-AUTH-02; MIGRATION §1,§29 | G-01 EXECUTE/DELEGATED/OWNER/STOP rule | L0 | scoped to one run; STOP half in prose | 0070 items 5-7; P-L0-002 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| RISK H-SEC-02 | G-02 instruction/data trust boundary | L0 | none (R-L0-04 partial) | — | ACTIVE | RESEARCH | high |
| RISK H-SEC-01 | G-03 data-read authority | L0 | contradicted by R-L0-09 | L0-ROOT.md:73-75 | ACTIVE | RESEARCH | high |
| RISK H-FRESH-01, H-VERSION-01 | G-04 kernel epoch, in-flight compatibility | L0 | launch pinning decided | 0075 item 7 | PARTIALLY_IMPLEMENTED | RESEARCH | medium: scope unclear |
| RISK H-TCB-01; MIGRATION §10 | G-05 TCB map and self-update | L0 | validator only | final-plan-2 P | PARTIALLY_IMPLEMENTED | RESEARCH | high |
| RISK H-OWNER-01 | G-08 owner SPOF mitigation | L0/L1 | delegation in 0062 | 0062 item 3; 0078 | PARTIALLY_IMPLEMENTED | COMPLETE | medium: partly practice |
| RISK H-AUTH-01 | G-09 cooperative vs hostile mode | L0 | publication threat model only | final-plan-2 Part 2 | ACTIVE | RESEARCH | medium |
| RISK H-IND-01 | R1-01 epistemic diversity | L1 | model-id rule; 0075 item 13 | P-L1-002 | PARTIALLY_IMPLEMENTED | RESEARCH | high |
| H-AUTH-02; AX §14-15; MCP §35-39 | R1-02 capability envelope | L1/L3 | git modes (launcher); task-frame proposal | 0077 item 3; 0070 item 4 | PARTIALLY_IMPLEMENTED | RESEARCH | high |
| H-AUTH-02 checks 5-6 | R1-03 permission inheritance on resume/fallback | L1/L3 | none | — | ACTIVE | COMPLETE | medium |
| MIGRATION §15,§31; scripts §19 | R1-04 parallel ownership above two streams | L1 | cap of 2 | 0048 item 7 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| task_profife | W-01 separate characterization layer | L2 | none; conflicts with 0062 item 2 | P-L2-002 | RESEARCH_CANDIDATE | RESEARCH | high |
| task_profife §6 | W-02 no Size in tier | L2 | decided; record stale | 0075 item 8 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| task_profife §3,§9 | W-03 risk sets assurance, not executor | L2 | contrary rule in 0075 item 8; C-8 open | 0074 item 4 | ACTIVE | RESEARCH | medium: owner values |
| task_profife §4-5; executor §19-21 | W-04 spec quality, testability, determinism factors | L2 | none | — | RESEARCH_CANDIDATE | RESEARCH | high |
| task_profife §8; benchmark §14 | W-05 hard constraints as filters | L2/L3 | procedure only; no data | 0075 item 8; workflowAI 1.5 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| task_profife prompt §6 | W-06 static context estimator | L2/L3 | none | — | RESEARCH_CANDIDATE | RESEARCH | medium |
| executor; benchmark §21 | W-07 minimum-sufficient resolver (floor, then cheapest rung) | L2/L3 | prose procedure; runner names models | workflowAI 1.5; 0074-0075 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| executor §4-8,§25-34 | W-08 EAC/EAT, escalation chain, λ, scarcity, regret | L2 | none | — | RESEARCH_CANDIDATE | RESEARCH | high |
| benchmark; performers:125-137 | W-09 class capability profiles, benchmark prior, local fusion | L2/L3 | TD recorded; H-WAI frozen | workflowAI §6 | RESEARCH_CANDIDATE | RESEARCH | high |
| executor §9-10,§31-32 | W-10 lower-bound and shadow exploration | L2 | shadow for certifiers only | 0047 item 4 | RESEARCH_CANDIDATE | RESEARCH | medium |
| benchmark §10,§15; SYNTHESIS §3; AX §31 | W-11 outcome record with tuple and accepted completion | L2/L3 | Launch line, USAGE, telemetry | R-L2-002.5; 0035 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| AX §26,§58-63; RISK H-EVAL-02 | W-12 adaptive depth and parallelism | L2 | study B framed, not run | 0066 | RESEARCH_CANDIDATE | RESEARCH | high |
| AX §22; RISK H-STATE-01 | W-13 state machine and artifact validity | L2/L3 | decided; S-001 weaker | 0075 items 6, 11, 14 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| AX §21 | W-14 verifiable handoff and candidate package | L2/L5 | Evidence yes; `--candidate` no | CORE-ARCH-6 §2 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| MIGRATION §2,§4; RISK §0; benchmark Q1-Q20 | W-15 research-cycle steps | L2 | practice, not in S-003 | 0052/0053 | PARTIALLY_IMPLEMENTED | COMPLETE | medium |
| RISK H-EVAL-01 | W-16 non-circular calibration | L2 | shadow scored against the outcome | 0047 item 4 | ACTIVE | RESEARCH | medium |
| scripts Track C | W-17 procedure-to-script pipeline and signals ledger | L2/L3 | rules plus four scripts; no ledger | 0047 item 8; 0051 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| AX §50-55,§71-73; RISK §39-40 | W-18 golden comparative task corpus | L0/L2 | P-L0-007 draft | 0060 item 2 | PARTIALLY_IMPLEMENTED | RESEARCH | medium |
| AX §22-23,§33; RISK H-RUNTIME-01 | X-01 kernel dispatcher and supervisor | L3 | research tools only; not in suite | 0050 item 4; 0075 item 11 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| RISK H-RUNTIME-01; scripts §16,§25 | X-02 lease, fencing, idempotency | L3 | pid plus start time (research) | 0067 items 4, 6 | PARTIALLY_IMPLEMENTED | RESEARCH | high |
| AX §C,§34,§39 | X-03 resume-first, error-class recovery | L3 | decided; partly built | 0051 item 4; 0075 items 2-4 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| AX §18-20; scripts §4 | X-04 workspace per job, git modes | L3 | launcher built, never launched | 0070; 0077 item 3 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| scripts Track B | X-05 write broker, queue, backpressure | L3 | cooperative lock only | AGENTS §6 | RESEARCH_CANDIDATE | RESEARCH | medium: may be partial |
| scripts §20 | X-06 singleton resources serialized | L3 | lock over 5 shared documents | AGENTS §6; protocol-lock.cjs | IMPLEMENTED | KEEP | high |
| MCP §86-88,§156 | X-07 core API behind adapters | L3 | validator API designed | final-plan-2 J | PARTIALLY_IMPLEMENTED | COMPLETE | medium: scope beyond validator open |
| scripts §34; MCP §69-71 | X-08 structured output, error schema | L3 | exit 2; partial JSON | 0049 item 2; 0047 item 8 | PARTIALLY_IMPLEMENTED | COMPLETE | medium |
| Rust T; MCP §174-176 | X-09 navigation and worklog indexes | L3 | decisions index only | 0044 item 2; 0057 item 5 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| performers:8-72 | X-10 automated model discovery | L3 | manual one-off run | P-L3-002/003 | PARTIALLY_IMPLEMENTED | COMPLETE | medium |
| MIGRATION | X-11 Node validator, differential, TCB-safe | L3 | not built | 0077; final-plan-2 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| Rust L-N; scripts §10-11 | X-12 fast, standard and full paths; incremental | L3 | quick only | 0071 | PARTIALLY_IMPLEMENTED | RESEARCH | high |
| Rust Q | X-13 test-suite split | L3 | planned | final-plan-2 M | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| Rust C-F,J,O; MCP §77-84,§169-173 | X-14 daemon, snapshot, watcher, caches | L3 | excluded for now | final-plan-2 I | RESEARCH_CANDIDATE | RESEARCH | high |
| MCP_Server | X-15 Colabs MCP facade | L3 | none; adoption blocked | 0036 item 1; 0066 | RESEARCH_CANDIDATE | RESEARCH | medium: scope of "adoption" |
| Google_AX | X-16 AX backend, ExecutionBackend, local-first | L3 | none | 0066 study A | RESEARCH_CANDIDATE | RESEARCH | low: AX unverified |
| RISK H-REMOTE-01 | X-17 remote execution without a shared FS | L3/L5 | cloud fail-closed | 0077 item 1 | RESEARCH_CANDIDATE | RESEARCH | medium |
| RISK H-CODE-01 | X-18 project-code context resolver | L3 | native-only; S1 arms gated | 0036; 0045 item 2 | RESEARCH_CANDIDATE | RESEARCH | medium |
| RISK H-SEC-03 | X-20 secret propagation in runner logs | L3 | journal scan; env scrub | AGENTS §7; L-CORRECTION-4 | PARTIALLY_IMPLEMENTED | COMPLETE | medium |
| RISK_COUNCIL | K-01 the v2 design audit council | L0-L9 | not run | BACKLOG C-4 | RESEARCH_CANDIDATE | RESEARCH | high |
| RISK §4,§38-40; MCP §15-19 | K-02 bounded context, compiler, completeness | L0/L2 | design; over budget | procedure.schema §4 | PARTIALLY_IMPLEMENTED | RESEARCH | high |
| RISK H-CTX-02 | K-03 CATALOG O(N) tax | L0/L2 | written into the schema | procedure.schema:151 | ACTIVE | RESEARCH | high |
| RISK H-CTX-03 | K-04 dependency edges | L0 | absent | procedure.schema:47-73 | ACTIVE | RESEARCH | high |
| RISK H-CTX-04 | K-05 trigger detector | L0/L2 | absent | procedure.schema:149-150 | ACTIVE | RESEARCH | medium |
| RISK H-CTX-05 | K-06 read-widening accounting | L8 | proposal line | CORE-ARCH-7 §4 | ACTIVE | RESEARCH | medium |
| RISK H-GRAPH-01 | K-07 global graph checks | L0/L3 | LCC draft | P-L0-004 | PARTIALLY_IMPLEMENTED | COMPLETE | medium |
| H-PROMPT-DELIVERY-01 | C-01 delivery comparison (C built, D excluded) | L3 | frozen | BACKLOG:109; 0073 | RESEARCH_CANDIDATE | RESEARCH | medium: may be archive |
| MIGRATION.md (file) | C-02 consumed council prompt | — | council closed | final-plan-2; 0077 | ARCHIVE_CANDIDATE | — | high |
| SYNTHESIS…md (file) | C-03 agent synthesis, self-declared temporary | — | stale in parts | PROBLEMS P-1 | ARCHIVE_CANDIDATE | — | high |
| performers.md:139-1344 | C-04 copy of benchmark:949-2154 | — | — | benchmark.md | DUPLICATE | — | high |
| scripts.md:1-1515 | C-05 truncated first copy | — | — | scripts.md:1516-3029 | DUPLICATE | — | high |
| Rust.md:148-207,1013 | C-06 Rust core replaces Node and PowerShell | L3 | Node chosen | 0025 item 5; 0077 | SUPERSEDED | — | medium: other hot paths stay research |
| performers.md:1-137 | C-07 model-profile inventory snapshot | L2/L3 | partly verified | MODEL-MATRIX; MODEL-ECONOMICS | ACTIVE | RESEARCH | low: snapshot |
| MCP §151-154 | C-08 Markdown and Git as readable truth | L0 | standing | AGENTS §1; 0034 | IMPLEMENTED | KEEP | high |
| benchmark.md:65-282 | C-09 external benchmark facts without sources | L2 | none | — | UNCLEAR | RESEARCH | low: citations dangle |
| scripts §6-9,§39; Rust §1-2 | C-10 script and critical-section performance audit | L3 | validator and suite measured only | final-plan-2 C-D | UNCLEAR | RESEARCH | low: hooks unmeasured |
| MIGRATION §6,§14 | C-11 research frames record --quick; no concurrent full suites | L2/L3 | built and used | 0071; protocol-handoff.cjs:10 | IMPLEMENTED | KEEP | high |
| MIGRATION (whole) | C-12 validator migration council run | L2 | ran; plan accepted | final-plan-2; 0077 | IMPLEMENTED | KEEP | high |
| H-PROMPT-DELIVERY-01 variant C | C-13 one-line pointer to a canonical task file, script-sequenced | L3 | built; runs this frame | 0050 item 2; 0073; 0074 item 1 | IMPLEMENTED | KEEP | high |
