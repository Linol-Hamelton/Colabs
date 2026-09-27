Mode: ADVISORY
Baseline: 7b6d17a; working tree status: dirty
Reviewer: Claude Opus 5.5, route claude CLI, effort xhigh, 2026-09-26T09:55Z
Scope: stage-3 resolution of the frozen OwnerIdeas revision (13 sources, 4 round-1 reviews, 2 round-2 syntheses): cleanup, active, research and unresolved lists; Gemini and DeepSeek briefs
Verdict: REVIEW COMPLETE

- Frame `task:ownerideas-r3-claude` (parent program `ownerideas-revision`), role resolver; session
  `claude-658029b20c3f1e69`. Nothing here is a decision (AGENTS.md §2). The owner's dispatch makes
  this list the boundary the cleanup executes (`DISPATCH-OWNER.md:666-677`); it creates no block.
- Tree during the run: HEAD `a3645a1`, then `7494078` (operator journal only) with `.ai/ARCHIVE.md`
  modified by another session; untracked journals. The 19 inputs were re-verified after the move.
- Labels: **[F]** fact with `path:line` or decision id, checked in this session unless marked
  "(per review)"; **[I]** inference; **[Q]** open question.
- Disclosure [F]: I am the same participant (claude-opus-5-5; R-L1-002.1) as the author of
  `round1/REVIEW-CLAUDE.md`, and this model family wrote kernel records judged here (CORE-ARCH-1..7,
  P-L2-002, workflowAI) and two corpus files (`H-PROMPT-DELIVERY-01…md:7`,
  `SYNTHESIS-2026-09-25-cross-document.md:3`). I applied the evidence rules to round-1 Claude as to
  the others; §3.3 lists where they overturn it.

## 1. Executive summary

- [F] All 19 inputs match `round3/CORPUS.txt` (sha256, before and after the HEAD move).
- [I] Kimi and MiMo agree on substance. They differ in counting, and both lost minority rows that
  carried the strongest evidence. Three facts verified here change the cleanup; neither synthesis has
  them:
  1. `MIGRATION.md` is content-identical to the tracked council file `OWNER-PROMPT.md` (1,314 lines,
     0 differences after CRLF→LF; the council README says so at `README.md:4-5`). `CORPUS.md:39-43`
     reported "no byte-identical copy" because it compared raw bytes across CRLF and LF.
     → **DELETE**, not archive (DeepSeek's minority, restored).
  2. In `scripts.md` the **first** copy is the truncated one: lines 1-1513 equal 1516-3028, line 1514
     stops at "моделе", line 3029 ends "моделей.". → cut 1-1515. DeepSeek's round-1 cut (1516-3029)
     would keep the truncated copy.
  3. PROTO-DEC-0066 item 1 (`DECISIONS.md:2592`, immutable) names `Google_AX.md`, `MCP_Server.md`
     and `Rust.md` as the seeds of study A, which has not started (improvement-research `README.md`,
     Status). → `MCP_Server.md` stays; Gemini's archive proposal is rejected.
- **Cleanup approved (§5):** two whole-file actions (DELETE `MIGRATION.md`; ARCHIVE the 2026-09-25
  synthesis) and two block cuts (`performers.md:138-1344`, `scripts.md:1-1515`). Active OwnerIdeas
  shrinks from 465,900 B to 362,414 B, and no text is lost. Nine files stay whole. Every other
  proposed cut is rejected with its evidence (§5.3).
- **Classification.** The kernel has decided much more than it has built; the typical break is
  IMPLEMENTATION. Six items round-1 Gemini called IMPLEMENTED are downgraded to
  PARTIALLY_IMPLEMENTED, each with its break point (§4). Mistral's COMPLETE actions on unbuilt,
  unmeasured items are rejected.
- **Active (§6), in priority order:**
  1. a decision on the capability envelope (L0/L1; the break is at DECISION);
  2. the kernel dispatcher C-3 (L3; IMPLEMENTATION);
  3. the Node validator of PROTO-DEC-0077 (L3; IMPLEMENTATION, gated by M-7);
  4. the signals ledger of PROTO-DEC-0051;
  5. four decided-but-unapplied alignments;
  6. an L0 status rule for OwnerIdeas itself.
- **Research (§7):** seven frames. The model-layer frame is **blocked** by PROTO-DEC-0076 item 4,
  because its core hypotheses H-WAI-2..5 are frozen (`workflowAI.md:113-120,156`; BACKLOG C-5). Both
  syntheses missed this.
- **Owner questions (§8):** 14. The ones that shape the plan are:
  - U-1: five parallel executors against the two-stream cap of PROTO-DEC-0048 item 7;
  - U-2: whether `CLOSED` counts as certification under PROTO-DEC-0041 items 1-2;
  - U-3: whether a write broker is in scope at all;
  - U-9: whether PROTO-DEC-0070 items 5-6 were meant as a general rule.

## 2. Inputs and verification (hash checks)

| # | Input | sha256 (prefix) | Result |
|---:|---|---|---|
| 1-13 | `OwnerIdeas/` benchmark, executor, Google_AX, H-AUTH-02, H-PROMPT-DELIVERY-01, MCP_Server, MIGRATION, performers, RISK_COUNCIL, Rust, scripts, SYNTHESIS-2026-09-25, task_profife | as listed in `round3/CORPUS.txt:1-13` | 13 OK |
| 14-17 | `round1/REVIEW-CLAUDE`, `-DEEPSEEK`, `-GEMINI`, `-MISTRAL` | d9b890fd, 7cb71902, b2ede6e4, 825afcec | 4 OK |
| 18-19 | `round2/SYNTHESIS-KIMI`, `-MIMO` | 2a2ad503, c9df5d05 | 2 OK (MiMo as corrected in `a3645a1`) |

Command: `sha256sum -c docs/research/2026-09-26-ownerideas-revision/round3/CORPUS.txt` → 19 OK, run
twice.

Checks run in this session with node, after CRLF→LF normalisation:

| Check | Result [F] |
|---|---|
| `performers.md:139-1344` against `benchmark.md:949-2154` | 1,206 lines, 0 differences; `performers.md:138` is empty |
| `scripts.md:1-1513` against `:1516-3028` | 0 differences; `:1514` is `:3029` cut short; `:1515` is empty |
| All 13 files, lines of 60 or more characters | only benchmark↔performers share lines; the only repeats inside one file are in scripts.md (first pair 1↔1516) |
| `MIGRATION.md` against the council's `OWNER-PROMPT.md` | raw sha differs (CRLF against LF); normalised sha is `c1695ade…` for both; 1,314 lines, 0 differences |
| `:chatgpt-content-reference` markers | 10, all in benchmark.md: `:75, :93, :117, :143, :153, :192, :220, :246, :265, :892` |
| Inbound references to the cleanup targets (`git grep --untracked`) | 206 hits before this file existed, all in historical records (§5.4) |
| Kernel presence | absent: `.ai/core/`, `docs/core-arch/stage-3/`, `.ai/SIGNALS.md`, `.ai/bin/protocol-validate.cjs`, a dispatch script, `--candidate` in `protocol-handoff.cjs`. `test-protocol.ps1:17-18` runs only `tests/*.test.cjs` |

Kernel sources read to verify claims (COMMON: "read every other repository input from the working
tree"):
- DECISIONS PROTO-DEC-0034/0035/0036 (partial), 0041 items 1-6, 0047-0051, 0062-0078;
- `docs/ops/BACKLOG.md` and `docs/ops/PROBLEMS.md` P-1;
- `workflowAI.md` §3, §5, §6;
- `CORE-ARCH-3.md:207-219`, `CORE-ARCH-4.md:73-76`, `CORE-ARCH-6.md:24-28`, `CORE-ARCH-7.md:71-82`;
- `L0-ROOT.md` R-L0-04 and R-L0-09;
- `P-L2-002-model-selection.md:58-64` and `SPEC-protocol-core.md:1-30`;
- by grep: `protocol-lock.cjs` (liveness) and `run-chain.cjs:60-66` (pid plus start time);
- improvement-research `README.md` Status, and the council `README.md:1-12`.

**Not verified.** Named here, not guessed:
- whether Google AX and its primitives exist;
- the benchmark names and figures in `benchmark.md` (RepoProbe, AACR-Bench, SWE-Lancer, ArchBench…);
- the texts of CORE-ARCH-6 R-08/R-09, S-003, P-L0-002, P-L0-004 and L-CORRECTION-4 item 2;
- the context-window column of MODEL-MATRIX;
- round-1 line citations I did not open, marked "(per review)".

**Independence.** No later-stage output exists. I opened no file outside the frozen inputs except
the kernel sources above.

**Correction to the frozen record [F].** `CORPUS.md:39-43` says the scan found no byte-identical
copy and that `OWNER-PROMPT.md` is "a reworked extract". The raw-byte part is true. The claim that
it is not a copy is wrong. The file is not edited here, because it is frozen; §5.4 carries the
correction.

## 3. Synthesis comparison (where the two agree and disagree)

### 3.1 Agreement, confirmed against the four reviews

- Archive the 2026-09-25 synthesis (4/4). Take the validator council out of the active corpus
  (3/4 plus DeepSeek's DUPLICATE).
- The capability envelope is incomplete and has no single home (4/4 on substance).
- The kernel dispatcher is partial (4/4). The Node validator is designed, not built (4/4).
- Google AX, the Rust daemon and the MCP facade are study-A research (4/4 RESEARCH_CANDIDATE).
  MiMo's §3 gives AX 3/4 and its own full table (S65) gives 4/4; Claude X-16 is RESEARCH_CANDIDATE,
  so 4/4 is right.
- The risk council has not run (4/4). Bounded context is unmeasured research (4/4).
- The write broker has no artifact. Only its label is disputed.

### 3.2 Disagreements and errors, resolved by evidence

| Topic | Kimi | MiMo | Check [F] | Resolution |
|---|---|---|---|---|
| Duplicate consensus | 3/4, counting Gemini §8 and Mistral §8 | two sources (Claude, DeepSeek); Gemini never marks them | Gemini's ranges (`benchmark.md:1400-2201`, `scripts.md:1-54/55-108`) are refuted by the scan; Mistral gives no ranges | MiMo is right: two exact, independent ranges; the scan confirms both |
| `performers.md` range | 139-1344 | "Claude 139-1344 vs DeepSeek 186-1314, both plausible" | 139-1344 exact; DeepSeek's own §8 says 139-1344 | 139-1344, plus empty line 138 |
| Direction of the `scripts.md` cut | first copy | first copy | DeepSeek R1 cut the second copy; the first is truncated | cut 1-1515; DeepSeek's direction rejected |
| MIGRATION.md | archive after extracting methods | archive; "DUPLICATE = spent prompt copy" | content-identical to `OWNER-PROMPT.md` | DELETE; the methods survive at the same line numbers in `OWNER-PROMPT.md` |
| `MCP_Server.md` | 3/4 "archive or stale header" | split; keep until an extract pass | 0066 item 1 names it a seed; study A has not started | KEEP whole. Kimi's 3/4 counts "not adopted", not "archive" |
| Program conflicts P-1..P-3 | dropped | kept (§5.2-5.4) | P-1 and P-2 are real (0048 item 7; 0041 items 1-2) | restored as U-1, U-2 and U-14 |
| Lock identity (S49) | — | "no PID binding in the kernel path" | `protocol-lock.cjs:179-194`: optional `--session-pid` and token, liveness check, stale report | partly wrong. Shared-document lock liveness exists; executor-level lease and fencing do not |
| Telemetry | — | "any performance claim in benchmark.md rests on known-bad telemetry" | the ADDENDUM (`benchmark.md:2157-2200`) proposes metrics and claims no measured values; the 2.96× over-count is in the kernel's Stop telemetry (`CORE-ARCH-6.md:26`) | reworded: the ADDENDUM metrics have no reliable data source yet |
| Line citations | — | 0052/0053 "~3113/3194" | the headings are at `DECISIONS.md:2168` and `:2200` | corrected |
| Corpus size | — | "521 KB" | 465,900 B (`cat OwnerIdeas/*.md \| wc -c`) | corrected |
| Delivery variants | UNRESOLVED | freeze-measurement item | variant C is built (I-4); D is excluded by 0073; E by 0076 item 3 | only B against C stays open (R-7) |

### 3.3 Minority findings restored or corrected

1. MIGRATION.md is a duplicate of `OWNER-PROMPT.md`. Source: DeepSeek; verified. This also
   overturns round-1 Claude, which relied on CORPUS.md.
2. Cut the first copy of `scripts.md`. Source: Claude over DeepSeek; verified.
3. **Variant E is superseded.** Source: Gemini §7.6 and §10.4; both syntheses dropped it.
   Evidence: 0076 item 3, and 0076's rejection of "A model-run operator session for supervision"
   and "The Kilo operator is dropped" (`DECISIONS.md:3230-3231, 3247, 3252-3253`).
4. **OwnerIdeas has no status rule.** Source: Claude §5 and §11.10; both syntheses dropped it.
   AGENTS.md §1 ranks six sources and never names `OwnerIdeas/`. The 2026-09-25 synthesis was put
   there by an agent (`SYNTHESIS…:3-5`). The dispatch's closing condition, "no second active source
   of truth" (`DISPATCH-OWNER.md:975`), needs this rule.
5. **The model-layer research is frozen.** H-WAI-2..5 cover qualification criteria, local results
   outweighing benchmarks, per-class ladders and requalification (`workflowAI.md:113-120`), and
   C-5 says it "is not worked while that freeze stands" (`:156`). Claude R1 noted it in its W-09
   row; the syntheses dropped it.
6. **Ten dangling source markers in `benchmark.md`.** Source: Claude C-09. Kimi weakened it to 1/4
   "verify or remove"; MiMo kept it. It is kept as a precondition of R-3.
7. **Conflicts with decisions.** Kimi dropped these; MiMo kept them:
   - public benchmarks as a routing prior, against 0063 item 1;
   - the S-001 "artifact exists" rule, against 0075 item 6;
   - H-SEC-01, against R-L0-09.
8. **Reviewer precision against recall.** Source: Gemini §5 L2.4, at `benchmark.md:159-176`; both
   syntheses dropped it. Kept as an R-3 input. It sits beside dangling marker `:153`.
9. **Verification strength as a routing variable.** Sources: Gemini L2.3 and Mistral 5.3, at
   `task_profife.md:480,542` and `executor.md:642`. Kept in R-3.
10. **The launcher has never launched.** Source: Claude X-04, against Gemini's IMPLEMENTED. Study
    A and B are "not started" (README Status), and run-chain runs in the checkout (BACKLOG M-8).
11. **Corrections to round-1 Claude.**
    - MIGRATION.md: DELETE, not archive (item 1).
    - C-12 "IMPLEMENTED/KEEP" becomes IMPLEMENTED with the file deleted.
    - P-3 (the fallback rule) is not a conflict (§8 U-14).
12. **Rejected minority claims:**
    - Mistral 10.1: its quote "Neither agent can see a reply within its own turn" appears in no
      corpus file.
    - Mistral 3.1: DEC-0011 and DEC-0012 (2026-09-12) predate the corpus. MIGRATION.md lists them
      as current state (`MIGRATION.md:228-240`), not as a proposal.
    - Mistral §2: its line counts are wrong (benchmark 2,200 lines, not 1,185; MCP_Server 3,452,
      not about 1,314). It describes performers.md as a write-broker file; it is the model-profile
      inventory.
    - Mistral S82 (L0-L9 layering) comes from outside the corpus. It is not an OwnerIdeas item.

## 4. Corrected consensus register with surviving evidence

**Rules applied** (RESOLUTION.md Method 3, plus three made explicit):
- **E1:** a path or decision id beats prose.
- **E2:** an accepted decision beats an unbuilt idea.
- **E3:** PARTIALLY_IMPLEMENTED beats IMPLEMENTED when the chain is broken.
- **E4** (MiMo's R1, adopted): a design an accepted decision forbids is RESEARCH_CANDIDATE, and the
  conflict goes to §8.
- **E5:** COMPLETE needs an artifact, and a measurement when a gain is claimed.
- **E6:** a canonical source that is itself a proposal or "specification, not code" does not make an
  idea IMPLEMENTED.
- A majority does not override a reproduction (PROTO-DEC-0041 item 5).

### 4.1 IMPLEMENTED

The OwnerIdeas passage on each of these points duplicates the kernel. No action beyond A-2.

| ID | OwnerIdeas source | Canonical replacement | Evidence | Note |
|---|---|---|---|---|
| I-1 | scripts.md §20 `:648-661`: serialize singleton shared metadata | AGENTS.md §6; PROTO-DEC-0028/0029 | `protocol-lock.cjs` (owner name, optional `--session-pid` and token, `:179-194`); `tests/lock.test.cjs` | for the 5 shared documents; broker semantics → R-5 |
| I-2 | MIGRATION §6, §14: research frames skip concurrent full suites | PROTO-DEC-0071 | `protocol-handoff.cjs` `--quick`; COMMON step 4 | uncontested |
| I-3 | MIGRATION (whole): run the validator migration council | PROTO-DEC-0077; `final-plan-2.md` | council package, rounds 1-3 and verifications | the product is P-3 |
| I-4 | H-PROMPT-DELIVERY-01:28, variant C | PROTO-DEC-0050 item 2; 0073 items 2-3; 0074 item 1 | `run-chain.cjs` with `prompts/DISPATCH.json` runs this frame (`r3-claude.md`) | the comparison → R-7 |
| I-5 | MCP_Server.md §151-154: Markdown and Git stay readable truth | AGENTS.md §1; PROTO-DEC-0034; 0045 item 1 (per review) | AGENTS.md:16-35 | a standing constraint on any facade |
| I-6 | scripts.md §32, §35-36: deterministic first; fail closed; print the rows | PROTO-DEC-0047 item 8; 0049 item 2 | exit 2 on unknown in `.ai/bin` (per review) | the M0-M5 ladder → P-9 |
| I-7 | benchmark.md:1607-1960: multi-round research, then certification | PROTO-DEC-0052, 0053 | the council package end to end | S-003 wording → P-12 |
| I-8 | RISK H-IND-01, procedural half | PROTO-DEC-0041 items 1-2; 0047 items 1-3; 0057 | AGENTS §2 gate enforced by the validator | the diversity half → P-19 |
| I-9 | RISK H-SEC-03, journal part | AGENTS.md §7 | `protocol-handoff.cjs` record and Stop scan | runner logs → P-15 |

### 4.2 PARTIALLY_IMPLEMENTED

The Break column names the first missing link.

| ID | Idea (OwnerIdeas source) | Layer | Exists [F] | Break | Resolution of the label | → |
|---|---|---|---|---|---|---|
| P-1 | Capability envelope and the EXECUTE / DELEGATED-JUDGEMENT / OWNER-DECISION / STOP rule; permission inheritance on resume and fallback; owner-SPOF delegation (`H-AUTH-02.md:10-58`; RISK H-AUTH-01, H-OWNER-01 `:1440-1462`) | L0/L1 | 0070 items 4-6, which item 7 limits to the 0066 run; 0077 item 3 (git modes, launcher); 0078 items 3-4; 0047 item 7; 0062 item 3; P-L0-002 covers the stop half in prose | DECISION | 4/4 gap. Gemini's ACTIVE → PARTIAL by E1 | A-1 |
| P-2 | Kernel dispatcher and supervisor: three levels (workflow, stage, attempt), states, resume-first, error classes, budgets, launch pinning, watchdog, dependency readiness (AX §22-23, §33-34; RISK H-RUNTIME-01; scripts §25 `:755`) | L3 | 0050 item 4; 0051 item 4; 0075 items 1-7, 9-11; 0076 item 3; 0078 item 1. Only research runners exist: run-chain (M-4, M-8) and `launch.cjs` | IMPLEMENTATION (BACKLOG C-3) | 4/4. Gemini's IMPLEMENTED for the three levels (0075 item 1) and for recovery (0075 items 2-5) → PARTIAL by E3: run-chain lacks resume-first, error classes, the hard ceiling and pinning (M-4). Gemini/DeepSeek split on the AX DAG: what 0075 item 11 decides (dependency readiness) goes into C-3; the rest → R-6 | A-3 |
| P-3 | Node validator, PowerShell wrapper, differential check, TCB-safe update; split the test suite (MIGRATION; Rust.md §B `:184`, §Q; scripts Track A) | L3 | 0025 item 5; 0039 item 3; 0077; `final-plan-2.md` (suite 309 s, `validator.test.cjs` 283 s, `:92-95`); `protocol-validate.cjs` absent | IMPLEMENTATION; launch conditions M-7 open | 4/4 | A-4 |
| P-4 | Tier follows uncertainty and cost of error, not volume (`task_profife.md:295-329`) | L2 | 0074 item 4 and 0075 item 8 decided; `P-L2-002…md:62` still scores Size | PROCEDURE (BACKLOG M-5) | Claude; Gemini "policy" | A-6 |
| P-5 | Minimum-sufficient executor: floor, compatibility, quality and cost, budget; one primary and two substitutes (`executor.md:52-82, 244-265`) | L2/L3 | 0074 items 2-4; 0075 items 9-10; workflowAI §1.5; the runner names models, "a transitional breach of 0074 item 2" (`workflowAI.md:134-135`) | IMPLEMENTATION (the C-3 resolver) | three PARTIAL against Mistral's RESEARCH, split as MiMo does: the principle is PARTIAL, the formula → R-3 | A-3 |
| P-6 | Hard constraints filter, they do not score (`task_profife.md:361-378`) | L2/L3 | 0075 item 8, last sentence; no context-window data (per review) | IMPLEMENTATION (data) | Claude | A-3, A-12 |
| P-7 | Per-run record: model, client, effort, route, tries, cost, result (`benchmark.md:330-381`) | L2/L3 | the Launch line; Evidence; `USAGE.md`; Stop telemetry over-counts 2.96× (`CORE-ARCH-6.md:26`); 0075 item 9 requires recorded cost | IMPLEMENTATION (no schema) | 3/4 | A-10; quality fields → R-3 |
| P-8 | Stage state machine and artifact validity (AX §22; RISK H-STATE-01 `:810-841`) | L2 | 0075 items 6, 11, 14 decided; `CORE-ARCH-4.md:75-76` counts a node passed when its artifact "exists" | PROCEDURE (the proposal contradicts 0075 item 6) | Claude; MiMo S54a | A-6 |
| P-9 | Signals ledger, script candidates, maturity M0-M5, shadow promotion (scripts §29-36 `:853-1046`) | L2/L3 | 0045 item 6; 0047 item 8; 0051 items 1-3, 5; `.ai/SIGNALS.md` absent; 41 interim `Signal:` lines in active journals | IMPLEMENTATION | 3/4 | A-5 |
| P-10 | A private workspace per job, and git modes (AX §18-20; scripts §4) | L3 | `launch.cjs` certified RECOMMENDATION (BACKLOG C-7); never launched (README Status); run-chain runs in the checkout with the owner's credentials (M-8) | END-TO-END | Gemini's IMPLEMENTED → PARTIAL by E3 | A-13 |
| P-11 | Verifiable candidate package (AX §21 `:855-875`) | L2/L5 | Evidence and receipts; `--candidate` absent; designed in CORE-ARCH-6 §2 (per review) | IMPLEMENTATION | Claude only, uncontested | A-9 |
| P-12 | Research-cycle steps: compute what is decided, freeze the subject and the join-key questions (MIGRATION `:103-214`, now `OWNER-PROMPT.md` at the same lines) | L2 | 0052/0053 practice; missing from the S-003 record (per review) | PROCEDURE | Claude, DeepSeek | A-6 |
| P-13 | Navigation index over reviews and journals (Rust §T `:633-648`) | L3 | `protocol-index.cjs` and `tests/index.test.cjs` index decisions only; 0057 item 5 (package I-a) | IMPLEMENTATION | Claude | A-7 |
| P-14 | Procedure-graph checks (RISK H-GRAPH-01 `:894-930`) | L0/L3 | LCC-1..9 (P-L0-004 draft, per review); `SPEC-protocol-core.md:3` says "specification, not code" | IMPLEMENTATION for local checks; DECISION for global ones | Claude COMPLETE, DeepSeek RESEARCH, Mistral UNCLEAR; split | A-8; R-1 |
| P-15 | Redact secrets beyond journals: runner logs, `USAGE.md`, copied-back transcripts (RISK H-SEC-03 `:1132-1160`) | L3 | I-9; job credential scrub (L-CORRECTION-4, per review) | DECISION | four labels; PARTIAL by E3 | A-11 |
| P-16 | Kernel epoch and packet freshness (RISK H-FRESH-01 `:778-805`, H-VERSION-01 `:1383-1403`) | L0 | 0075 item 7 launch pinning (missing in run-chain, M-4) | IMPLEMENTATION for pinning; DECISION for the epoch | 3/4 | A-3; R-1 |
| P-17 | TCB map and self-update (RISK H-TCB-01 `:845-889`) | L0 | the validator only (`final-plan-2.md` §P; DBI-07) | DECISION | 3/4 | R-1 |
| P-18 | Bounded context: compiler, completeness harness, L0 A/B/C (RISK §4, §38-40; MCP §15-19) | L0/L2 | R-L0-02; loading levels; measured packets of 43,167-62,873 B against a 40,000 B hypothesis (`CORE-ARCH-3.md:209-218`, В-26) | IMPLEMENTATION; the premise is unmeasured | 4/4 | R-1 |
| P-19 | Epistemic diversity (RISK H-IND-01 `:1164-1199`) | L1 | 0075 item 13 chooses model, family or provider per workflow; the family rule was dropped (per review) | PROCEDURE | 3/4 | R-1 |
| P-20 | One core API behind CLI, MCP and AX (MCP §86-88, §156) | L3 | the validator API is designed (`final-plan-2.md` J); `SPEC-protocol-core.md` is a spec | IMPLEMENTATION | Gemini's IMPLEMENTED → PARTIAL by E6 | A-4; R-6 |
| P-21 | One output and error schema across `.ai/bin` (scripts §34; MCP §69-71) | L3 | exit 2 (0049 item 2); rows (0047 item 8); error classes (0075 item 4) | PROCEDURE | Claude | A-14 |
| P-22 | Tasks and dispatch files name roles, not models (performers; MCP §135) | L2 | 0073; 0074 item 2; the `launch.cjs` table was moved to a file (C-1, `1302554`); dispatch files still name models (`workflowAI.md:134-135`) | IMPLEMENTATION | Gemini's IMPLEMENTED → PARTIAL by E3 | A-3 |
| P-23 | Roles, not brands (performers §1; benchmark §1) | L1 | 0056; 0074 item 2; the stage-2 roles await owner approval (`TASK.md:68`) | DECISION (stage-2 approval) | Gemini's IMPLEMENTED → PARTIAL | CORE-ARCH stage 2 |
| P-24 | Model inventory and discovery (`performers.md:8-72`) | L3 | P-L3-002/003 were run once by hand; 0065 item 2 decides a per-client procedure for model and effort, not yet written | IMPLEMENTATION | 4/4 | A-12; automation is H-WAI-1 (frozen) → R-3 |
| P-25 | Golden comparative corpus and L0 A/B/C (AX §50-55; RISK §39-40) | L0/L2 | P-L0-007 draft; 0060 item 2 puts A/B/C after the kernel | IMPLEMENTATION | Claude | R-1 |

### 4.3 RESEARCH_CANDIDATE

Grouped into the frames of §7:
- **R-1:** trust boundary H-SEC-02; data-read authority H-SEC-01; cooperative against hostile mode
  H-AUTH-01; CATALOG O(N); dependency edges; trigger detector; read-widening; remote execution
  H-REMOTE-01; project-code context H-CODE-01.
- **R-3:**
  - a separate task-characterization layer (conflicts with 0062 item 2);
  - further factors: spec quality, testability, determinism, verification strength;
  - a static context estimator and weight validation;
  - a benchmark portfolio, geometric-mean fit and Bayesian update (with 10 dangling markers, and
    against 0063 item 1);
  - EAC/EAT, the escalation chain as the unit, λ, scarcity and regret;
  - shadow and lower-bound exploration; the 5-strategy experiment;
  - reviewer precision and recall; the performance ADDENDUM; non-circular calibration H-EVAL-01;
  - the 13-group MODEL PROFILE; qualification of the working pool; automated discovery (H-WAI-1).
- **R-4:** adaptive depth, parallelism and a dynamic council (AX §26, §58-63; RISK H-EVAL-02).
- **R-5:**
  - a write broker, request schema and conflict classes;
  - optimistic concurrency and idempotency keys;
  - lease and fencing;
  - backpressure and a validation farm;
  - more than two writers.
- **R-6:**
  - an AX backend; an MCP facade; a general core API;
  - a Rust daemon, snapshot, watcher and caches;
  - incremental validation;
  - an event DAG beyond C-3.
- **R-7:** delivery B against C; script and critical-section performance, including hooks.

### 4.4 SUPERSEDED and STALE passages

These stay inside kept files. The register tells a reader which authority wins.

| ID | Passage | Status | Current authority [F] |
|---|---|---|---|
| S-1 | `Rust.md:148-207`, `:1013`: a Rust core replaces Node and PowerShell | SUPERSEDED | PROTO-DEC-0025 item 5, 0039 item 3, 0077; `PROPOSAL-node-validator.md:38` |
| S-2 | `MCP_Server.md` read as an adoption path | STALE | 0034 item 2; 0036 item 1 ("no MCP adoption"); 0066 Consequences keep adoption governed by 0034/0036/0045 (`DECISIONS.md:2606`) |
| S-3 | `H-PROMPT-DELIVERY-01…md:29`, variant D (inject the text) | SUPERSEDED | 0073 items 2-3 |
| S-4 | `H-PROMPT-DELIVERY-01…md:30`, variant E (a model sequences the steps) | SUPERSEDED | 0076 item 3; alternatives rejected at `DECISIONS.md:3247`; Consequences at `:3252-3253` |
| S-5 | `H-PROMPT-DELIVERY-01…md:45-46`, Q6 (is a routing file a task inside a script?) | ANSWERED | 0073 item 2: the script takes paths "from a file named when it is run" |
| S-6 | `benchmark.md:939`, `executor.md:1185`, `performers.md:31-33`: T1-T9 as the current selection mechanism | STALE description | 0075 items 8-10; 0076 items 1-2; workflowAI §1.5 (floor, then the owner's ladder) |
| S-7 | `performers.md:14`: routes through Copilot, Antigravity, Vibe, Kilo | STALE | 0076 item 1: makers' CLIs only, one approval-gated exception |

Conflicts with decisions are not stale. They go to §8:
- `task_profife.md:12-30` against 0062 item 2 (U-7);
- `task_profife.md:146-194, 382-412` against 0075 item 8 (U-5);
- `benchmark.md:65-282, 514-578` against 0063 item 1 (U-6);
- `scripts.md:42-51` against 0048 item 7 (U-1, U-3);
- `RISK_COUNCIL.md:1499-1504` (in translation: "at least 6 researchers of different makers") against the routes of
  0076 item 1 (U-11);
- RISK H-SEC-01 `:1033-1070` against R-L0-09 (U-8).

## 5. Final cleanup list (DELETE / ARCHIVE / KEEP, paths and line ranges)

Line numbers are those of the frozen baseline (`7b6d17a`; working copies CRLF). Gemini executes
exactly C-1..C-5 (§9) and nothing else.

### 5.1 Whole-file actions

| ID | Path | Action | Justification [F] | Canonical replacement |
|---|---|---|---|---|
| C-1 | `OwnerIdeas/MIGRATION.md` | **DELETE** | content-identical to the tracked council copy (normalised sha `c1695ade…`, 1,314 lines, 0 differences); its council ran and closed (PROTO-DEC-0077); it has no value of its own (DISPATCH-OWNER §14) | `docs/research/2026-09-25-validator-migration-council/OWNER-PROMPT.md` (same text, same line numbers); `final-plan-2.md`; PROTO-DEC-0077 |
| C-2 | `OwnerIdeas/SYNTHESIS-2026-09-25-cross-document.md` | **ARCHIVE** → `docs/research/2026-09-26-ownerideas-revision/archive/SYNTHESIS-2026-09-25-cross-document.md`, moved unchanged | 4/4; agent-written; says it leaves OwnerIdeas once package L closes (`:3-5`), which it did (PROBLEMS P-1 closed); stale in parts (7 files, not 13) | superseded by this revision (round1-3); kept as provenance |

### 5.2 Intra-file duplicate blocks

| ID | Path and lines | Action | Evidence of zero loss [F] | Text that remains |
|---|---|---|---|---|
| C-3 | `OwnerIdeas/performers.md:138-1344` | **DELETE block**; the file becomes exactly lines 1-137 | `:139-1344` = `benchmark.md:949-2154`, 1,206 lines, 0 differences; `:138` is empty; 30,556 B removed | `benchmark.md:949-2154`; the unique inventory `performers.md:1-137` stays |
| C-4 | `OwnerIdeas/scripts.md:1-1515` | **DELETE block**; the file becomes exactly the former lines 1516-3029 | `:1-1513` = `:1516-3028`, 0 differences; `:1514` is `:3029` truncated; `:1515` is empty; 33,808 B removed | the former `:1516-3029` as new `:1-1514`; old line n (1-1514) maps to new line n, so cited section anchors keep their numbers |
| C-5 | new `docs/research/2026-09-26-ownerideas-revision/archive/INDEX.md` | **CREATE** (the exact text is in §9) | records every removal with its line map | — |

### 5.3 KEEP, and rejected proposals

| Path | Action | Why [F] | Condition for a later archive |
|---|---|---|---|
| `OwnerIdeas/Google_AX.md` | KEEP | seed named by 0066 item 1 (`DECISIONS.md:2592`); read by `improvement-research/prompts/A-research.md:32`; study A not started | study A synthesis records its disposition |
| `OwnerIdeas/MCP_Server.md` | KEEP | same (0066 item 1); the adoption reading is STALE (S-2) | same |
| `OwnerIdeas/Rust.md` | KEEP | same; `PROPOSAL-node-validator.md:38`; the core-binary part is SUPERSEDED (S-1) | same |
| `OwnerIdeas/RISK_COUNCIL.md` | KEEP | council not run; cited by `TASK.md:68`, BACKLOG C-4, council `README.md:149`, `DECISION-BOUNDARY.md:31,85` | the council closes (R-1) |
| `OwnerIdeas/H-AUTH-02.md` | KEEP | the top active gap (A-1); `TASK.md:68`; BACKLOG C-4 | a decision block adopts or rejects it |
| `OwnerIdeas/H-PROMPT-DELIVERY-01_…md` | KEEP | frozen hypothesis (`BACKLOG.md:109`; 0076 item 4); C built, D and E superseded (S-3, S-4) | the owner closes R-7 |
| `OwnerIdeas/benchmark.md` | KEEP | R-3 seed; the canonical side of the C-3 duplicate | R-3 closes; its 10 markers are resolved first |
| `OwnerIdeas/executor.md`, `OwnerIdeas/task_profife.md` | KEEP | R-3 seeds; TD-MODEL-QUALIFICATION lists the gap as open (`workflowAI.md:142-157`) | R-3 closes |
| `OwnerIdeas/performers.md:1-137` | KEEP | unique inventory; a volatile snapshot beside MODEL-MATRIX (Claude C-07, low confidence) | R-3 closes |
| `OwnerIdeas/scripts.md` (after C-4) | KEEP | seed of R-5 and P-9 | R-5 closes |

| Rejected proposal | By | Evidence |
|---|---|---|
| `benchmark.md:1400-2201` duplicates performers and executor | Gemini §8.1 | the file has 2,200 lines; executor shares no line of 60 or more characters with any file; the duplicate is removed on the performers side (C-3) |
| `scripts.md:1-54` duplicates `:55-108` | Gemini §8.2 | the first repeated pair is 1↔1516 |
| "outdated council rosters" | Gemini §8.3 | no line range; not executable |
| archive `MCP_Server.md` now; "patterns have been extracted into PROTO-DEC-0066 Study A" | Gemini §9.3 | study A has not run; the file is a named seed in an immutable block, and moving it would leave that block pointing at nothing |
| delete `scripts.md` 1516-3029 | DeepSeek §8, §14 | that is the complete copy |
| delete `MCP_Server.md` after extracting a mechanism list | DeepSeek §8 | extracting it is study A's work; §8 U-4 |
| partial archives: RISK "v1 history", MIGRATION §22-32, AX E/F/G, MCP §420-441, Rust §684-710 | Mistral §9 | some have no exact ranges; "less optimal" and "premature" are judgements for study A or the council; all sit inside files kept whole |
| "duplicate hypothesis listings" across benchmark, executor and Rust; `Rust.md` §733-746 | Mistral §8 | not duplicates by the scan; a paraphrase is not a copy |
| status banners on kept files | Claude R1 §13; DeepSeek §13.3 | an edit, not a delete or archive; outside Gemini's scope (`DISPATCH-OWNER.md:670-677`) → U-12 |

### 5.4 References after cleanup

[F] `git grep --untracked -F` for `MIGRATION.md`, `SYNTHESIS-2026-09-25-cross-document`,
`performers.md` and `scripts.md` found 206 hits before this file existed, and 300 after it (the
difference is this file). All are in historical records:
- `.ai/worklog/*`;
- `.ai/ARCHIVE.md`;
- this program's own files (`docs/research/2026-09-26-ownerideas-revision/**`);
- the closed council's `README.md:5` and `prompts/COMMON.md:9`.

No active document names them: TASK, PLAN, BACKLOG, PROBLEMS, DECISIONS, REGISTRY, core-arch, or the
study prompts. Historical records are not edited. INDEX.md (C-5) resolves every old path and line.
The frozen `CORPUS.md:39-43` claim is corrected by §2 of this file, not by an edit.

## 6. Final active list (L0-L3)

"Needs" means: **D** a decision (owner), **R** research, **I** implementation of an existing
decision.

| ID | Item | Layer | Where it should live | Exists | Missing | Needs |
|---|---|---|---|---|---|---|
| A-1 | Capability envelope and the four-outcome rule (P-1). Includes permission inheritance on resume and fallback (`H-AUTH-02.md:45`), expiry and supersession (`:46`), delegated-judgement bounds (`:37`), and the delegation artifact | L0/L1 | a decision block; an L0 procedure extending P-L0-002; enforcement in the dispatcher (A-3) | 0070 items 4-6 (one run only); 0077 item 3; 0078 items 3-4; 0047 item 7; 0062 item 3 | a kernel-wide rule; an envelope descriptor; a test of "exactly one admissible transition"; the seven H-AUTH-02 checks (`:41-48`) as acceptance tests | **D** (U-9), then I |
| A-2 | Status rule for OwnerIdeas: advisory seeds ranked below PLAN; a file leaves the active corpus when the frame that consumes it closes; agents never place their outputs there | L0 (source conflicts) | a decision, then AGENTS.md §1 or L0-ROOT | nothing (AGENTS.md:16-35; `CORPUS.md:5-6`) | the rule | **D**. [I] Satisfies the dispatch's closing condition without editing seed files |
| A-3 | Kernel dispatch script C-3: the workflowAI §1.5 resolver (P-5, P-22), a supervisor per 0075/0078, the 0051 item 4 watchdog, launch pinning (0075 item 7; P-16), hard-constraint filters (P-6), M-8, tests under `tests/*.test.cjs` | L3 | `.ai/bin/` plus the registry file of 0050 item 4 | research runners (M-4, M-8; `workflowAI.md:130-137`) | the kernel script and its tests | **I** (decided); high risk (0038 item 1) |
| A-4 | Node validator per `final-plan-2.md`, with the test-suite split (section M) and the validator API (P-20) | L3 | `.ai/bin/protocol-validate.cjs` and its wrapper | the design | code; the M-7 launch conditions (certifier preflight, phase-0 baseline, oracle cohort) | **I** (0077 items 1-2), gated by M-7 |
| A-5 | Signals ledger with the script-candidate and maturity ladder (P-9) | L2/L3 | a ledger file, `.ai/docs/CLI-AGENTS.md`, a kernel procedure (0051 item 5) | interim `Signal:` lines | the ledger, its grammar and its processing | **I** (0051) |
| A-6 | Apply decided but unapplied rules: P-L2-002 without Size (P-4, M-5); S-001 artifact validity (P-8); R-L3-004.4-5 against 0075 (M-5); research-cycle steps in S-003 (P-12) | L2/L3 | the records themselves | the decisions | the edits | **I**, through the next stage-2 fix round (0074/0075 Consequences) |
| A-7 | Navigation index over reviews and journals (P-13) | L3 | `protocol-index.cjs`, package I-a | the decisions index | reviews and journals | **I** (0057 item 5) |
| A-8 | `protocol-core.cjs` local checks (P-14) | L0/L3 | per `SPEC-protocol-core.md` (S3-T13) | the spec | code; shadow-only until P-L0-004 is approved (SPEC §1) | **I** (planned) |
| A-9 | `record --candidate` and the candidate package (P-11) | L2/L5 | `protocol-handoff.cjs` | Evidence and receipts | the flag and the package | **I** after its CORE-ARCH package is scheduled [Q] |
| A-10 | One run-record schema for the decided fields: cost and tries (0075 item 9), completion (item 6), a correct token count (P-7) | L2/L3 | read and written by A-3 | the pieces | the schema; the 2.96× fix | **I**; quality-outcome fields wait for R-3 |
| A-11 | Secret redaction beyond journals (P-15) | L3 | handoff and dispatcher | the journal scan | a rule and code | **D** (small), then I |
| A-12 | Per-client procedure for setting model and effort (0065 item 2; P-24) | L3 | a stage-4 procedure | none | the procedure | **I** (decided) |
| A-13 | First real launch of the private-clone launcher; Level-1 environment for run-chain (P-10) | L3 | `launch.cjs`, or folded into A-3 | a certified launcher | a launch; M-8; the M-3 re-resolution before K-launch | **I** (operation) |
| A-14 | One output and error schema across `.ai/bin` (P-21) | L3 | a convention adopted inside A-3 and A-4 | pieces | the schema | **I**, low priority |

## 7. Research list

None of these becomes an implementation task before its synthesis and a decision (DISPATCH-OWNER
§7). PROTO-DEC-0076 item 4 ("No new hypotheses are opened for now") gates every frame the owner has
not already launched.

| ID | Frame | Open question | Evidence gap | Layers | Inputs (kept seeds) | Gate |
|---|---|---|---|---|---|---|
| R-1 | Build the K4 packet-completeness harness, then run the RISK council | Does bounded context hold at scale? Which TCB, epoch, trust-boundary, data-read, graph and diversity rules does v2 need? | packets are 43-63 KB against 40 KB, never measured end to end; no PoC for H-SEC-02; no TCB list beyond the validator | L0-L3 | `RISK_COUNCIL.md`; `H-AUTH-02.md` | owner sequencing (BACKLOG C-4; U-10); the ≥6-makers condition (U-11) |
| R-2 | Epistemic diversity (inside R-1 or alone) | When is a different family or provider mandatory for high risk? | common-mode failure is unmeasured | L1 | RISK H-IND-01 | owner decision after R-1 |
| R-3 | One model-layer frame: task characterization, executor economics, benchmark-based qualification, outcome loop | Which task factors predict success? Does a local-outcome loop beat the owner's ladder? When do local results outweigh priors (H-WAI-3)? | 10 dangling source markers; no run records (A-10); conflicts with 0062 item 2 and 0063 item 1 | L2/L3 | `benchmark.md`, `executor.md`, `task_profife.md`, `performers.md:1-137` | **blocked**: H-WAI-2..5 frozen (0076 item 4; C-5); first recover the citations; U-5, U-6, U-7 |
| R-4 | Study B, adaptive execution depth | as PROTO-DEC-0066 item 1 frames it | not started | L2 | 0066 package | decided; waits for K-launch after M-3 |
| R-5 | Write coordination and scale | Does a real write bottleneck exist above two streams? If so: broker, optimistic concurrency, lease and fencing, or the lock | `scripts.md:1436-1450` asks for falsification; no workload above two streams exists under 0048 item 7 | L1/L3 | `scripts.md` (after C-4) | U-1, U-3; 0076 item 4 |
| R-6 | Study A (AX, MCP facade, Rust daemon and caches, incremental validation, general core API) | as 0066 item 1 frames it; Rust only if Node misses the target (Gemini §12.3) | AX existence unverified; no Node baseline yet | L3 | `Google_AX.md`, `MCP_Server.md`, `Rust.md` | decided; waits for K-launch after M-3; U-4 |
| R-7 | Low priority: delivery B against C (`H-PROMPT-DELIVERY-01` §4); script and hook performance (C-10) | as those files ask | only one B run and one C run are on record; hooks are unmeasured | L3 | `H-PROMPT-DELIVERY-01…md`; `scripts.md` Track A | frozen hypothesis (`BACKLOG.md:109`); the Node phase-0 baseline first |

## 8. Unresolved questions

Disagreements are quoted from their authors and not papered over.

- **U-1: five executors against the two-stream cap.**
  - Claude R1 P-1: "Stage 8 runs five executors in parallel (`DISPATCH-OWNER.md:815-829`), but 0048
    item 7 allows at most two active edit streams for code, kernel and main documents."
  - [F] 0048 item 7 exempts research only (`DECISIONS.md:2024-2026`).
  - Owner: exempt the program by a block, or sequence the five packages into two streams.
- **U-2: is `CLOSED` a certification?**
  - Claude R1 P-2: "[Q] Is `CLOSED` a certification?"
  - MiMo R-J: "`0041` independence bars them for core work".
  - [F] 0041 item 1 bars the author, the executor and the controller. Item 2 requires two parallel
    independent reviewers for protocol core.
  - Claude writes and launches the packages (stages 5-8). DeepSeek writes the plan and pre-checks
    it.
- **U-3: is a write broker in scope?**
  - Gemini §11.3: "A write broker with atomic file-level write requests and conflict detection
    unlocks true multi-agent parallelism."
  - Mistral §11.1: "Critical (implement immediately after dependencies)".
  - Claude R1 §12: "The lock and the copy-back are neighbours of a broker, not a partial broker."
  - DeepSeek §12: "the write-broker need is real, but the file's own §53 falsification list warns
    the bottleneck may not exist."
  - DeepSeek Q3: "Is a write broker in scope at all, or does the owner prefer the current 2–3-stream
    model (`PROTO-DEC-0048` item 7) indefinitely?"
  - I classify it RESEARCH (E4, E5). The scope question stays with the owner.
- **U-4: MCP facade.**
  - Claude R1 #4: "does a Colabs-owned facade count as 'adoption'?"
  - DeepSeek Q2: "Should `MCP_Server.md` keep its ~200-point mechanism inventory, or is the MCP line
    closed enough to archive the whole file?"
  - [F] 0036 item 1 says "no MCP adoption" inside the Track C and Repomix ruling.
  - The file stays until study A answers.
- **U-5: risk raises assurance, not the tier.** task_profife (`:146-194, 382-412`) against 0075
  item 8 (the consequence of an error is a tier input). BACKLOG C-8 (proposed 0079) is open.
- **U-6: public benchmarks as a routing prior.** `benchmark.md:65-282, 514-578` against 0063 item 1:
  "Third-party leaderboards and a model's memory are not sources". The question is whether that
  scope (rank and price) also covers evidence of competence.
- **U-7: a separate characterization layer.**
  - Gemini §11.1 calls it "the single necessary precursor to a functioning model resolver".
  - 0062 item 2: "No separate layer is added". The rejected alternatives there include "a separate
    complexity layer".
- **U-8: data-read authority.** RISK H-SEC-01 (`:1033-1070`) against R-L0-09, "Reading is never
  forbidden" (`L0-ROOT.md:73-75`).
- **U-9: is PROTO-DEC-0070 a general rule?** Claude R1: "The owner's wording is general … but item 7
  scopes it to one run. Did the owner mean a general principle?" This decides A-1.
- **U-10: RISK council sequencing.** DeepSeek Q1: "Does the owner intend `RISK_COUNCIL.md` to run as
  its own council now, or is `PROTO-DEC-0066` study A/B the intended path?"
- **U-11: council makers.** "Назначить минимум 6 независимых researchers разных model makers"
  (`RISK_COUNCIL.md:1499-1500`), against 0076 item 1 routes. Claude R1 counted five reachable
  makers.
- **U-12: banners on kept files.** Should the kept files carry a status banner pointing to §4.4? It
  is outside the cleanup scope and needs the owner.
- **U-13: "M3".** What does "M3" in the dispatch title mean? Claude R1 read it as BACKLOG M-3
  [I, unconfirmed].
- **U-14: the fallback rule.** Claude R1 P-3 asked whether "no fallback without an owner decision"
  should become a block. [I] It is not a conflict: 0075 item 3 sets ceilings ("at most"), and 0078
  item 3 governs a shortfall. Recording it is the owner's choice.

## 9. Handoff to Gemini (cleanup brief)

Role: cleanup executor (`DISPATCH-OWNER.md:668-677`). Bounded, no architectural judgement.

- **What Gemini may change:**
  - delete `OwnerIdeas/MIGRATION.md`;
  - move the 2026-09-25 synthesis;
  - cut `OwnerIdeas/performers.md` and `OwnerIdeas/scripts.md`;
  - create `docs/research/2026-09-26-ownerideas-revision/archive/` holding exactly two files;
  - write its own journal.
- **Forbidden:**
  - any other file, including TASK, BACKLOG, historical records, `CORPUS.md` and the kept files;
  - banners and reformatting;
  - staging, commit, tag, push or a branch.
- **No lock is needed.** None of these paths is a shared document (AGENTS §6).
- **STOP on any mismatch.** Report the printed line; do not repair by hand.
- **Shell.** File operations are given in PowerShell. In Git Bash use `rm`, `mkdir` and `mv` with
  the same paths.
- **Commands are fail-closed.** Every command below was run in Git Bash on 2026-09-26 against this
  tree, in dry mode, and printed the expected line. A write happens only after both the input hash
  and the output hash match. A shell that alters the argument makes node exit with an error before
  any write, which is a STOP.

1. **Preconditions.** Both must hold:
   - `git status --short OwnerIdeas/ docs/research/2026-09-26-ownerideas-revision/archive/` prints
     nothing;
   - the archive directory does not exist.
2. **C-1.** Run this check. It must print `OK identical`. Then
   `Remove-Item -LiteralPath OwnerIdeas/MIGRATION.md`.
   ```
   node -e "const fs=require('fs'),c=require('crypto');const H=s=>c.createHash('sha256').update(s,'utf8').digest('hex');const a=fs.readFileSync('OwnerIdeas/MIGRATION.md','utf8').replace(/\r\n/g,'\n');const b=fs.readFileSync('docs/research/2026-09-25-validator-migration-council/OWNER-PROMPT.md','utf8').replace(/\r\n/g,'\n');if(a===b&&H(a)==='c1695ade2cb593084b9291c617626997d5dcea565a6be4765b72a5a839afa8ff'){console.log('OK identical')}else{console.log('STOP not identical');process.exit(3)}"
   ```
3. **C-2.**
   - Create the directory: `New-Item -ItemType Directory docs/research/2026-09-26-ownerideas-revision/archive`.
   - Move the file: `Move-Item -LiteralPath OwnerIdeas/SYNTHESIS-2026-09-25-cross-document.md -Destination docs/research/2026-09-26-ownerideas-revision/archive/`.
   - The moved file's sha256 must equal
     `34b9f15083bbc36a2d429bd94e13c2a97df705116cfbb15ad18cea8f24efcebe`.
4. **C-3.** Run once without an argument; it must print `OK … dry`. Then append ` write`; it must
   print `OK performers f355fc48… write`.
   ```
   node -e "const fs=require('fs'),c=require('crypto');const H=s=>c.createHash('sha256').update(s,'utf8').digest('hex');const f='OwnerIdeas/performers.md';const r=fs.readFileSync(f,'utf8');const t=r.replace(/\r\n/g,'\n');if(H(t)==='7930ba7b5b0a650cd345474660206e1d5d49544524288ef798d038905de53263'){}else{console.log('STOP pre '+H(t));process.exit(3)}const o=t.split('\n').slice(0,137).join('\n')+'\n';if(H(o)==='f355fc48a8471fd402d008e3d29215bf5fcc12b74d1a80bba0d18f721e6093cd'){}else{console.log('STOP post '+H(o));process.exit(4)}const e=r.includes('\r\n')?'\r\n':'\n';if(process.argv[1]==='write'){fs.writeFileSync(f,o.replace(/\n/g,e))}console.log('OK performers '+H(o)+' '+(process.argv[1]||'dry'))"
   ```
5. **C-4.** Same procedure; it must print `OK scripts 8ec2a553… write`.
   ```
   node -e "const fs=require('fs'),c=require('crypto');const H=s=>c.createHash('sha256').update(s,'utf8').digest('hex');const f='OwnerIdeas/scripts.md';const r=fs.readFileSync(f,'utf8');const t=r.replace(/\r\n/g,'\n');if(H(t)==='1ceaa74b496bd74a8a4ba55abe03cfe0dd3ce2ef988336c27745d4a9e768536a'){}else{console.log('STOP pre '+H(t));process.exit(3)}const o=t.split('\n').slice(1515,3029).join('\n')+'\n';if(H(o)==='8ec2a55394550e7616c36f242d0b7384f18d56ac091568129b115af6861eb06d'){}else{console.log('STOP post '+H(o));process.exit(4)}const e=r.includes('\r\n')?'\r\n':'\n';if(process.argv[1]==='write'){fs.writeFileSync(f,o.replace(/\n/g,e))}console.log('OK scripts '+H(o)+' '+(process.argv[1]||'dry'))"
   ```
6. **C-5.** Write `docs/research/2026-09-26-ownerideas-revision/archive/INDEX.md`:
   - UTF-8 without BOM, LF;
   - with exactly the 12 lines between the fences below, without the three-space list indentation
     and ending with one newline;
   - its LF-normalised sha256 must be
     `24b0f8c798a9f513a73a01fd682c5c5b70a698926a2edb900157096fd296092b`.

   Do not write it through PowerShell redirection.
   ```markdown
   # OwnerIdeas cleanup index

   Append-only ledger of OwnerIdeas material taken out of the active corpus by the cleanup approved in
   `docs/research/2026-09-26-ownerideas-revision/round3/RESOLUTION-CLAUDE.md` section 5. Line numbers
   are those of the frozen baseline 7b6d17a; `git show 7b6d17a:<path>` returns the original text.

   | Original | Action | Text now at | Line map |
   |---|---|---|---|
   | OwnerIdeas/MIGRATION.md | DELETE, content-identical copy | docs/research/2026-09-25-validator-migration-council/OWNER-PROMPT.md | line n -> line n |
   | OwnerIdeas/SYNTHESIS-2026-09-25-cross-document.md | ARCHIVE, moved unchanged | docs/research/2026-09-26-ownerideas-revision/archive/SYNTHESIS-2026-09-25-cross-document.md | line n -> line n |
   | OwnerIdeas/performers.md lines 138-1344 | DELETE, copy of benchmark.md | OwnerIdeas/benchmark.md lines 949-2154 | line n (139-1344) -> benchmark.md line n+810; lines 1-137 stay |
   | OwnerIdeas/scripts.md lines 1-1515 | DELETE, truncated first copy | OwnerIdeas/scripts.md lines 1-1514 (formerly 1516-3029) | line n (1-1514) -> line n; line n (1516-3029) -> line n-1515 |
   ```
7. **Post-checks.** Each must pass:
   - (a) the nine kept files are unchanged; the check must print `checked 9 changed 0`:
     ```
     node -e "const fs=require('fs'),c=require('crypto');const skip=['OwnerIdeas/MIGRATION.md','OwnerIdeas/SYNTHESIS-2026-09-25-cross-document.md','OwnerIdeas/performers.md','OwnerIdeas/scripts.md'];let n=0,bad=0;for(const l of fs.readFileSync('docs/research/2026-09-26-ownerideas-revision/round3/CORPUS.txt','utf8').replace(/\r/g,'').split('\n')){const p=l.slice(66);if(l.length>66&&p.startsWith('OwnerIdeas/')&&skip.indexOf(p)<0){n++;const h=c.createHash('sha256').update(fs.readFileSync(p)).digest('hex');if(h===l.slice(0,64)){}else{bad++;console.log('CHANGED '+p)}}}console.log('checked '+n+' changed '+bad);process.exit(bad?5:0)"
     ```
   - (b) no dangling references; the check must print `unexpected 0`. A hit outside the allowed
     historical records is **reported, not edited**.
     ```
     node -e "const cp=require('child_process');const pats=['MIGRATION.md','SYNTHESIS-2026-09-25-cross-document','performers.md','scripts.md'];const allow=['.ai/worklog/','.ai/ARCHIVE.md','docs/research/2026-09-26-ownerideas-revision/','docs/research/2026-09-25-validator-migration-council/README.md','docs/research/2026-09-25-validator-migration-council/prompts/COMMON.md'];const args=['grep','--untracked','-n','-I','-F'];for(const p of pats){args.push('-e',p)}const r=cp.spawnSync('git',args,{encoding:'utf8'});let bad=0,ok=0;for(const l of r.stdout.split('\n')){if(l===''){continue}const f=l.split(':')[0];if(allow.some(a=>f===a||f.startsWith(a))){ok++}else{bad++;console.log('UNEXPECTED '+l.slice(0,200))}}console.log('allowed '+ok+' unexpected '+bad);process.exit(bad?6:0)"
     ```
   - (c) `git status --short OwnerIdeas/ docs/research/2026-09-26-ownerideas-revision/` shows
     exactly:
     - `D` for MIGRATION and for the synthesis;
     - `M` for performers and for scripts;
     - `??` for `archive/`.
   - (d) `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`; report what it printed.
8. **Close.** Write a five-label journal entry quoting every printed `OK` and check line, then run
   `node .ai/bin/protocol-handoff.cjs record --quick --owner <owner>`. The operator commits.
   Rollback, only on the owner's or operator's instruction:
   - `git checkout -- OwnerIdeas/`;
   - remove the `archive/` directory.

## 10. Handoff to DeepSeek (plan brief)

Role: author of the single plan (`DISPATCH-OWNER.md:681-690`). DeepSeek plans; it neither decides
nor certifies.

- **Boundary.** §4-§8 of this file are the boundary of the plan: every active item is in §6, every
  research item is in §7. The OwnerIdeas files are seeds for research, never requirements.
- **Items.** A-1..A-14 and R-1..R-7. Preserve their IDs so stage-4 critics can trace each one.
- **For each A-item, give:**
  - goal and layer;
  - home path;
  - the block it rests on, or the U-question it waits for;
  - scope and allowed paths;
  - dependencies;
  - verifiable acceptance criteria and validation commands;
  - risk class (0038) and certification route (0041 item 2), noting U-2;
  - its stream under 0048 item 7.
- **For each R-item, give:**
  - question and evidence gap;
  - gate (0076 item 4, owner sequencing);
  - inputs;
  - expected output and stop criteria.

  None becomes a task before its synthesis and a decision.
- **Hard constraints:**
  - At most two concurrent edit streams for code, kernel and main documents (0048 item 7) unless
    U-1 is ruled otherwise. State the assumption. If the plan feeds stage 5's five packages, show
    how they fit two streams.
  - No new hypotheses (0076 item 4). R-3 stays blocked while H-WAI-2..5 are frozen.
  - No separate characterization layer (0062 item 2).
  - Task and dispatch files name roles (0074 item 2), except the frozen models of this program
    (DISPATCH-OWNER §20).
  - No prompt text inside scripts (0073).
  - Kernel changes stay inside CORE-ARCH (0054 item 2; 0077 item 2) and are certified as high risk
    by two parallel reviewers outside execution and control (0038 item 1; 0041 items 1-2).
  - Reopen nothing without a trigger row in REGISTRY.
- **Suggested dependency order [I].** Advisory, for DeepSeek to confirm or reject with reasons:
  - **Wave 0, owner rulings:** U-1, U-2, U-9, A-2, and the research gating (U-3, U-10, and whether
    0076 item 4 lifts for R-3 or R-5).
  - **Wave 1, no rulings needed:**
    - A-6 alignments (one stream);
    - A-5 ledger;
    - A-12 procedure.
  - **Wave 2:** the two kernel streams.
    - A-3 dispatcher, with A-10, A-13 and A-14 folded in. Its permission layer waits for A-1's
      decision; its resolver, supervisor and watchdog do not.
    - A-4 Node validator, after M-7.
  - **Wave 3:**
    - A-1 enforcement in A-3;
    - A-7 and A-8 (package I-a);
    - A-9;
    - A-11.
  - **Research, parallel and exempt from the cap:**
    - R-1: the K4 harness first;
    - R-4 and R-6: after K-launch, which waits for M-3;
    - R-3 and R-5: only after their gates.
- **Flag, do not solve:** every U-question the plan depends on, and any item the plan cannot make
  verifiable. Return it as an open question rather than a design.
