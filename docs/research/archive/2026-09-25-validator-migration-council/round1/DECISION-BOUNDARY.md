# DECISION-BOUNDARY

- Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367
- Model: deepseek-flash-4.1
- Model-maker: DeepSeek
- Client: Kilo (agent name `deepseek`)
- Effort: unknown (not exposed by this route; owner-assigned slot, tier T8)
- Task-frame / scope-id: task:vmc-r1-a (parent-scope program:validator-migration-council)
- UTC-date: 2026-09-25
- Mode: ADVISORY

Owner §4, executed before any architecture proposal. Every issue below is in exactly one class.
Evidence is a decision block + item, or a `path:line` at the baseline. Facts about the launch
itself are marked separately. A proposal (including `docs/core-arch/PROPOSAL-node-validator.md`)
is never treated as a decision.

Classes: **A** ALREADY DECIDED · **B** ACTIVE TRIAL · **C** APPROVED DIRECTION, IMPLEMENTATION
OPEN · **D** OPEN ARCHITECTURAL QUESTION · **E** IMPLEMENTATION DETAIL ALREADY DELEGATED ·
**F** REOPEN WOULD BE REQUIRED · **G** SOURCE CONFLICT · **H** UNKNOWN.

## 1. Issues

| # | Issue | Class | Authority / evidence at the baseline | Note |
|---|---|---|---|---|
| DBI-01 | Is the validation engine moved to Node at all ("Node or not")? | **A** | PROTO-DEC-0025 item 5 (`.ai/DECISIONS.md:1171`): "Cross-platform validation engine migration to Node.js is scheduled for the v2.0 roadmap, requiring differential verification against the PowerShell reference implementation." PROTO-DEC-0039 item 3 (`.ai/DECISIONS.md:1709`) repeats it as v2.0 scope. Owner §4 sentence applies verbatim. | Not an open question. A different engine (Python/Rust) would be F. |
| DBI-02 | When does the migration happen? | **D** | PROTO-DEC-0039 item 3: "scheduled after the pilot report"; PROTO-DEC-0048 item 1 defers product work; the owner asked for a proposal to move it earlier (`docs/core-arch/PROPOSAL-node-validator.md:1-8,44-46`) and has not decided. | §24 question 1. Real trade-off (pilot evidence vs writing validator changes twice); owner owns timing. |
| DBI-03 | Is a non-Node engine (Python, Rust) open? | **A** (F note) | PROTO-DEC-0025 item 5 names Node; CORE-ARCH-1 H-13 rejects Python (`docs/core-arch/CORE-ARCH-1.md:80`); Node is the only runtime already required (`.ai/bin/*.cjs`, hooks, suite: `PROPOSAL-node-validator.md:38-40`). Rust appears only in owner idea seeds. | Choosing another engine = reopening PROTO-DEC-0025 item 5 (trigger `owner-directive`). |
| DBI-04 | Is differential verification against the PowerShell reference mandatory? | **A** | PROTO-DEC-0025 item 5; PROTO-DEC-0039 item 3 ("with differential verification against the PowerShell reference"). | Design of it is DBI-05. |
| DBI-05 | Parity mechanism: fixtures, normalisation, oracle scope, mutation | **D** | No decision. Owner §11 defines the required design; §23 question 9 tests it; §24 question 7 answers it. | Zone A supplies constraints (A-contract-tcb.md §2), zone B designs, zone C falsifies. |
| DBI-06 | Is the old implementation the correctness oracle? | **D** | No decision. Owner §10 distinguishes "same implementation agrees with itself" from independent evidence; owner §23 question 10 (common-mode). Evidence of oracle limits: CONTRACT-MAP defects D-1..D-6. | Constraint: oracle for *behaviour*, not for *correctness*; independent expected fixtures required for the defect classes. |
| DBI-07 | Is the validator part of the TCB? | **A** (classification) | The validator decides whether a Completed task's review binding is valid (PROTO-DEC-0032 items 1-3) and thus participates in validating its own replacement; PROTO-DEC-0038 item 1 names validator and gates protected; PROTO-DEC-0054 item 5 keeps 0038/0041 for CORE-ARCH. `OwnerIdeas/RISK_COUNCIL.md:845-889` (owner idea, not binding) lists validator in the TCB and asks this exact question. | The classification is evidence-supported; the mechanism set is DBI-08. |
| DBI-08 | Which TCB/self-update mechanisms the migration needs | **A** for the mandatory ones; **D** for the set and shape | Mandatory: independent certification (PROTO-DEC-0038 item 1; PROTO-DEC-0041 items 1-2, 4-5) and a differential run against the old engine (PROTO-DEC-0025 item 5). Open: N-1 verifier, frozen compatibility layer, golden/independent expected fixtures, mutation tests, dual execution on real state (owner §10/§11; no block names them). | One class per row is impossible for a bundle; split in DBI-09, DBI-10, DBI-17, DBI-37 and A-contract-tcb.md §1. |
| DBI-09 | Certification of a protocol-core change (the migration candidate) | **A** | PROTO-DEC-0038 item 1 (full prompt+report pair for validator/gates/`.ai/`), PROTO-DEC-0041 item 2 (two parallel independent reviewers for high risk), item 1 (author/executor/controller excluded), item 4 (protected-path defect blocks), PROTO-DEC-0047 item 3 (count by risk), PROTO-DEC-0057 item 4 (author never certifies, even in a separate task). | No owner question; procedure is settled. |
| DBI-10 | Who occupies the certifier slots for the migration? | **A** for the rule, owner-named for names | PROTO-DEC-0047 item 1 availability order after the independence filter; `.ai/TASK.md:73` records Codex limits exhausted. | If no independent certifier is available, PROTO-DEC-0047 item 1 + item 5 apply; a genuine slot gap is an owner question. |
| DBI-11 | What counts as "kernel change" / T7 floor for frames | **A** | PROTO-DEC-0072 items 1-4 (floor follows the frame's action, not downstream purpose); PROTO-DEC-0038 item 1 names the core paths. | This council changes no candidate record and takes no floor (README:100-103). |
| DBI-12 | CORE-ARCH freeze exception and ordering | **A** | PROTO-DEC-0054 item 2 (kernel edits allowed inside the program), item 5 (0038/0041 unchanged); PROTO-DEC-0061 item 2 (L0 lands with package I-a, after stages 2-3). | The proposal's preferred order (port before I-a, `PROPOSAL-node-validator.md:44-46,95`) departs from PROTO-DEC-0061 item 2 sequencing; that is a plan-level ordering choice for the owner (D). |
| DBI-13 | Research-cycle structure of this council | **A** | PROTO-DEC-0052 items 1-4; PROTO-DEC-0053 items 1-3; README procedure map; COMMON §2. | Outputs advisory (PROTO-DEC-0052 item 4; PROTO-DEC-0053 item 2). |
| DBI-14 | One role per model per frame; frames and scope-ids | **A** | PROTO-DEC-0056 item 2; PROTO-DEC-0057 item 3; COMMON §2. | Each step is its own frame `task:vmc-<step>`. |
| DBI-15 | Model selection, tiers, effort | **B** | P-L2-002 in trial (README:47); PROTO-DEC-0056 item 3 (draft P-L2-002 used until approved); PROTO-DEC-0058/0059; PROTO-DEC-0072 item 1 (floor). | Council table owner-approved 2026-09-25 (README:107-108) with one owner reassignment, see G-1. |
| DBI-16 | Launch route / fallback / liveness | **A** | PROTO-DEC-0067 item 1 (maker CLI first, Kilo fallback, cheapest suitable route inside Kilo); README:137-139 (the council has no launcher; the owner launches). P-L3-004 is on trial in the improvement-research launcher only (PROTO-DEC-0067 item 7; PROTO-DEC-0068). | No launcher edge for this council. |
| DBI-17 | Quick vs full Evidence | **A** | PROTO-DEC-0071 items 1-2: research/design frames record `--quick` (validator only); full `record` mandatory for code, kernel, protocol tooling. Enforcement site: `.ai/bin/protocol-handoff.cjs:97` sets `PROTOCOL_SKIP_GATE=1` for quick; `validate-protocol.ps1:870` honors it. | Owner §14's questions are settled for research frames; the migration's implementation frames are code changes, so full `record` (unless the owner amends). The validator has no internal "quick mode"; `-Quiet` only hides PASS lines. |
| DBI-18 | Evidence format, receipts, freshness | **A** | PROTO-DEC-0024, PROTO-DEC-0025 items 2-3, PROTO-DEC-0032 items 1-8, PROTO-DEC-0040 item 4, PROTO-DEC-0042 items 1-4; PROTO-DEC-0039 item 3 freezes existing hashes and receipt formats. | Constraint on any port: keep the Evidence line format `- <check>: exit N in Ns` and receipt formats byte-compatible. |
| DBI-19 | Split `protocol-handoff.cjs` into snapshot/evidence/gate | **C** | PROTO-DEC-0039 item 3 names it as v2.0 scope: approved direction, implementation not started. | Call graph shows the same file also owns `gateCheck`, which duplicates the completion gate. |
| DBI-20 | What remains PowerShell-specific | **D** | No decision names the parser check; DEC-0001 requires `.ps1` ASCII-only but no parser. Code: `validate-protocol.ps1:237-245` (parser + byte check), `:1085-1102` (installer self-check). | §12 decision per operation in A-contract-tcb.md §3. |
| DBI-21 | Documented commands keep working | **C** | Owner §17 ("existing documented commands should keep working unless an approved decision explicitly changes them"); `AGENTS.md:332`, `CLAUDE.md:25`, `.ai/docs/PROTOCOL.md:41` etc. document `powershell ... validate-protocol.ps1`. | Direction settled; wrapper vs replacement is implementation (E/D). |
| DBI-22 | Node as runtime requirement | **A** | PROTO-DEC-0025 item 5; reality today: `.ai/bin/*.cjs` and hooks already require Node (`validate-protocol.ps1:344-360`). | The floor is DBI-23. |
| DBI-23 | Minimum Node version | **D** | No decision. Drift in code: validator accepts any version (`:347-350`); `test-protocol.ps1:13` requires >= 22; `.ai/bin/protocol.cjs:43` says ">= 18.0.0". | CONTRACT-MAP D-2. Small but policy-visible in installed hosts; candidate for delegated resolution once stated. |
| DBI-24 | Cloud / no-PowerShell contract | **D** | Owner §13; no decision. Evidence: a cloud session could not record (`PROPOSAL-node-validator.md:26-27`, `spawnSync pwsh ENOENT`, session `claude-ad7cc4169e888ea8`, quoted by the proposal). | Constraint: capability absence must not silently weaken checks; see environment matrix in A-contract-tcb.md §4. |
| DBI-25 | Bash / Git-Bash as a hard requirement | **D** | No decision. Current behaviour: no working GNU bash → FAIL (`validate-protocol.ps1:392-418`), because the Claude hooks are bash. | §13 boundary decision; PROTO-DEC-0019 lets any assistant take part, hooks are Claude-specific. |
| DBI-26 | Installer (`setup-ai-protocol.ps1`) migration | **D** | Owner §21 requires a NOW/LATER/NEVER disposition; DEC-0008 defines its copy role; `setup-ai-protocol.ps1:250-262` owns `contentDigest` that the validator verifies. PROPOSAL 3.6 excludes it from step 1. | Coupling: validator CM-46 depends on it. |
| DBI-27 | Suite orchestration (`test-protocol.ps1`) migration | **D** | Owner §21; DEC-0009 (suite runs locally and in CI); measurements M-03/M-04. | Cost driver is DBI-38/zone B. |
| DBI-28 | Other scripts, Rust, MCP, AX, build system, launcher introspection | **A** for MCP/launcher; **F** for Rust; **D** for the rest | MCP: PROTO-DEC-0045 item 1 (no memory engine/graph backend adopted; PROTO-DEC-0066 study A is research only). Launcher: PROTO-DEC-0067 item 7 + PROTO-DEC-0068 (P-L3-004 trial). Rust: F under DBI-03. Build system: no decision, no evidence. | §21 dispositions; do not expand scope (owner §21 last line). |
| DBI-29 | Scope and permissions of this research | **A** | Owner §3; COMMON §5; PROTO-DEC-0047 item 7 (narrow grants; full bypass needs recorded owner authorisation); README:140-142 (PROTO-DEC-0070 flags are for the improvement research only; this council launches interactively/narrow). | No implementation, no commits (owner §0/§3). |
| DBI-30 | Research outputs are not decisions | **A** | PROTO-DEC-0052 item 4; PROTO-DEC-0053 item 2; owner §3, §33. | — |
| DBI-31 | Frozen subject: baseline SHA | **A** | Owner §2. Baseline `a4e6aef86440bc0e8da8f06c8f1d3f65af254367` named by the owner. Post-baseline only as POST-BASELINE OBSERVATION. | FACT: commit `9a936dd` (post-baseline) changes no validator-core path (`git diff a4e6aef..HEAD -- validate-protocol.ps1 test-protocol.ps1 setup-ai-protocol.ps1 protocol-manifest.json .ai/bin tests .claude .codex .github` is empty). |
| DBI-32 | Prompt/report size caps for the council | **A** | PROTO-DEC-0038 item 3; COMMON §7. | Data artefacts uncapped, COMMON §7. |
| DBI-33 | Independence inside the round | **A** | PROTO-DEC-0052 item 2 (no reading peers before freezing; journal statement), PROTO-DEC-0056 item 2; COMMON §6. | Journal note + file hash at freeze. |
| DBI-34 | Exclusion of the proposal's author / package authors | **A** | COMMON §6 last item (precedent PROTO-DEC-0053 item 3); README constraint (vii). The proposal names its author session (`PROPOSAL-node-validator.md:5`). | The proposal is an input to test, not a decision. |
| DBI-35 | Evidence for researchers (`--quick`), no full suite | **A** | PROTO-DEC-0071; COMMON §5 (do not run `test-protocol.ps1`; a needed full suite is an OPEN QUESTION for the coordinator). | Measurements reuse MEASUREMENTS.md (owner §6). |
| DBI-36 | Procedure-gap signals | **A** | PROTO-DEC-0051; COMMON §5 (`Signal:` lines until the ledger exists). | See journal. |
| DBI-37 | Rollback plan | **D** | Owner §20; no decision describes rollback for this migration. Anchors: PROTO-DEC-0025 item 1 (atomic release commits + annotated tags), PROTO-DEC-0042 (receipts stay bound to their task). | Design in A-contract-tcb.md §5; facts to reuse: tags `v1.9.5` is the newest (FACT, `git tag` at baseline); manifest declares 1.9.6 uncommitted. |
| DBI-38 | Where a validator run's 3 s go, by check | **H** | MEASUREMENTS.md, "Reading": "Not measured at all: where the 3 s of one validator run go, by check". | Zone B/perf; measure only if needed (owner §6). |
| DBI-39 | `pwsh` 7 behaviour (validator, installer, tests) | **H** | MEASUREMENTS.md: "`pwsh` not timed". Suite support exists (`tests/helpers.cjs:23`, `test-protocol.ps1:25`). | §13 matrix input; deterministic single commands can measure it. |
| DBI-40 | Installed-host compatibility of the validator | **A/C** | DEC-0013 (manifest splits source/installed), DEC-0009 (state survives upgrades), PROTO-DEC-0032 item 7 (installed skips gate-check), `validate-protocol.ps1:948-986` (digest). | Constraint: the port must keep the installed role free of journals and source tooling. |
| DBI-41 | Product pilot timing vs v2 order | **A** | PROTO-DEC-0039 items 1-2; PROTO-DEC-0048 item 1 (no product work until protocol stable); PROTO-DEC-0054 item 2 (kernel-only exception). | Ordering tension with DBI-02, see G-2. |
| DBI-42 | Changing "after the pilot report" | **F** | To move the port earlier than PROTO-DEC-0039 item 3, an owner-approved change is needed: trigger row in `docs/decisions/REGISTRY.md` (`owner-directive`), per PROTO-DEC-0033 item 3 and AGENTS section 6. | The council recommends; only the owner crosses this line. Note: the owner already asked for the proposal, which is not yet a decision. |
| DBI-43 | Owner-question filter | **A** | Owner §29; PROTO-DEC-0052 item 4. Zero owner questions is valid. | Applied per question in round 3. |

## 2. Source conflicts (class G, recorded, not resolved here)

| # | Conflict | Evidence | Resolution state |
|---|---|---|---|
| G-1 | The baseline README model table assigns `r1-a` to `claude-fable-5-1 / high` (README.md:80); the owner's launch message of 2026-09-25 reassigns `r1-a` to `deepseek-flash-4.1` (Kilo, agent name `deepseek`), "same tier T8, no Fable credits", and states that for this slot this line replaces the README model table at the baseline. | README.md:78-93; owner launch message; journal Launch line of `deepseek-08b98f3e57049e13`. | Resolved by the owner in the launch instruction. Recorded here because the file and the instruction disagree at the baseline. Consequence: the r1-a slot's maker is DeepSeek; constraint (i) (different makers within a round) holds for r1-a/r1-b/r1-c. |
| G-2 | PROTO-DEC-0039 item 3 ("after the pilot report") vs PROTO-DEC-0048 item 1 (no product work until the protocol is stable): the pilot that would trigger v2.0 is itself deferred by the protocol-first order. | `.ai/DECISIONS.md:1709` and PROTO-DEC-0048 item 1. | Both accepted; the later block reorders work. Not an unresolved conflict between equal sources: no reopen triggered, no trigger row exists. Recorded because it is why DBI-02 has no date. |
| G-3 | `PROPOSAL-node-validator.md` option A proposes the port "before CORE-ARCH package I-a lands" (`:44-46,95`), while PROTO-DEC-0061 item 2 schedules L0 records to land with package I-a and stages 2-3 come first. | proposal lines above; PROTO-DEC-0061 item 2. | Proposal, not a decision: the ordering choice is exactly DBI-02/DBI-12 and belongs to the owner. No action for the council beyond recording it. |

## 3. Unknowns (class H)

- H-1: per-check cost of a validator run (DBI-38; MEASUREMENTS says not measured).
- H-2: `pwsh` 7 timings and behaviour for the validator, installer and suite (DBI-39).
- H-3: the real capability set of a cloud agent host the project would use (Node, git, bash present; PowerShell absent assumed from one observed session; distribution unknown).
- H-4: whether `setup-ai-protocol.ps1` runs correctly under `pwsh` on Linux (only Windows PowerShell 5.1 is exercised by CI; `.github/workflows/protocol.yml:19` uses `windows-latest`).
- H-5: unreported accidental behaviours: culture-sensitive ordering (`Sort-Object -Unique`, `validate-protocol.ps1:218,251,305`), ANSI colour emission under pwsh, PowerShell parameter-binding error text and exit code on a wrongly-called script.
- H-6: consumer fleet state for installed-role compatibility: Block-Puzzle and VPN are at committed protocolVersion 1.9.0 without the Layer A/B/C tools (PROTO-DEC-0044 consequences); a migration must not assume they run the current validator.
- H-7: the risk council's timing (README relation; `OwnerIdeas/RISK_COUNCIL.md`); H-TCB-01 is intended to consume this council's final plan, but the owner decides when.

## 4. Coverage of the owner §4 topic list

| §4 topic | Rows |
|---|---|
| validator implementation/runtime | DBI-01, DBI-19, DBI-20, DBI-22 |
| v2 timing | DBI-02, DBI-12, DBI-41, DBI-42, G-2 |
| CORE-ARCH exceptions | DBI-11, DBI-12, G-3 |
| certification of protocol-core changes | DBI-07, DBI-09, DBI-10, DBI-11 |
| independent certification | DBI-09, DBI-10, DBI-33, DBI-34 |
| differential verification | DBI-04, DBI-05, DBI-06 |
| PowerShell compatibility | DBI-20, DBI-21, DBI-25, DBI-39, DBI-27 |
| Node/runtime requirements | DBI-01, DBI-22, DBI-23, DBI-24 |
| cloud execution | DBI-24, DBI-25, H-3 |
| Evidence / protocol-handoff | DBI-17, DBI-18, DBI-19, DBI-35 |
| quick vs full validation | DBI-17, DBI-35 |
| scope and permissions | DBI-26, DBI-28, DBI-29, DBI-30 |
| current research execution rules | DBI-13, DBI-14, DBI-15, DBI-16, DBI-31, DBI-32, DBI-33, DBI-34, DBI-36, DBI-43 |

## 5. Notes

- NOTE (not G): `.ai/docs/PROTOCOL.md` contains a non-ASCII glyph in the English text ("Controller
  ≠ certifier"); it renders as mojibake in a cp1251-configured viewer but the file is valid UTF-8
  (the baseline validator passes it with 0 warnings). Report tools that assume ASCII should quote
  it as U+2260 or transliterate.
- Post-baseline observation, recorded for completeness only: after `a4e6aef`, commit `9a936dd`
  changed only research/launcher, archive, task and journal files; nothing in the validator's
  contract surface. No conclusion here depends on it.
