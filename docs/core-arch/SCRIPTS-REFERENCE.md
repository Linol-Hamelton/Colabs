# Script part of the kernel: decisions, state, gaps (reference)

- Status: reference for the owner and the CORE-ARCH implementer. Not a decision, not a proposal.
- Author: `claude-e108f8be9e0e2049` (Claude Opus 5.5), 2026-09-27, baseline `606b23a`.
- Sources read: `.ai/DECISIONS.md`, `docs/decisions/REGISTRY.md`, `docs/core-arch/` (CORE-ARCH-1..7,
  stage-1, stage-2, stage-4), `docs/specs/`, `docs/research/` (validator-migration council
  `final-plan-2.md`, ownerideas-revision archive `FINAL-RESOLUTION-CLAUDE.md` A-items, F-17 DIG drafts),
  `docs/reviews/` (2026-09-27 performance audit), `OwnerIdeas/` (`scripts.md`, `Rust.md`, advisory seeds).

## 1. What runs, and who calls it (measured by caller graph at `606b23a`)

| Script | Runtime callers | State |
|---|---|---|
| `protocol-hooks.cjs` | Claude/Codex hooks, handoff, session, archive, validator | wired |
| `protocol-handoff.cjs` | hooks, `protocol.cjs`, validator (`gate-check`), CI | wired |
| `protocol-session.cjs`, `protocol-lock.cjs`, `protocol-archive.cjs` | hooks, handoff, `protocol.cjs` | wired |
| `protocol-dispatch.cjs` (+ `protocol-runrecord.cjs`, `protocol-signals.cjs`) | operator by hand | wired as a CLI; `docs/ops/RUNS.jsonl` still empty (2A item 4) |
| `protocol-ledger.cjs`, `protocol-verdict.cjs` | none | built and accepted as converged (PROTO-DEC-0048 item 2); standalone by design (rulebook spec section 7) |
| `protocol-scope.cjs` | none | built; its prose-parsing root causes stopped the batch (PROTO-DEC-0048 context); standalone |
| `protocol-index.cjs` | none | built; AGENTS section 9 step 4 tells agents to run it |
| `protocol-core.cjs` (A-8) | none at `606b23a` | not built; built on branch `core-landing-ia`, called by the validator there |
| `validate-protocol.ps1`, `setup-ai-protocol.ps1`, `test-protocol.ps1` | record, CI, tests | PowerShell; Node port decided (0077), not started (A-4) |

Four scripts that decisions call the executable rulebook have never been wired into any runtime path
(`git log -S` over hooks, handoff, session, validator and CI finds no reference ever). That is the
"new procedures of the old kernel are off" gap; the "new kernel is not connected" gap is `.ai/core/`,
which did not exist although PROTO-DEC-0060 item 3 and 0061 item 2 name it the kernel's home.

## 2. Decisions that govern the script part

| Theme | Decisions | What they require of scripts |
|---|---|---|
| Node engine | PROTO-DEC-0025 item 5; 0039 item 3; **0077** (`final-plan-2.md`) | validator as a Node library + stable CLI, differential verification against PowerShell, rollback, retirement; cloud runs fail closed |
| Script standard | **0047 item 8**; 0049 item 2 | fail closed (unknown input exit 2), name the enforced decision, print the rows, golden corpus of real failures |
| Output schema | A-14 (`docs/specs/bin-output-schema.md`) | `TOKEN key=value` rows, exits 0/1/2; ten older scripts retrofit in package II |
| Rulebook | **0046** (ledger path contract, protected set); **0048** items 2, 6, 7 | ledger + verdict accepted; kernel work only for critical failures, then design; at most two edit streams |
| Kernel tooling | **0061** (stage 1 approved incl. `SPEC-protocol-core.md`); 0057 item 5 (navigation index in I-a) | `protocol-core.cjs lint/catalog/check-links/lcc` (A-8) and the navigation index (A-7) land with package I-a |
| Candidate evidence | A-9 (CORE-ARCH-7 section 8, package I-b) | `record --candidate` in `protocol-handoff.cjs` |
| Recording | **0071**, 0072 | `record --quick` for research and design frames, full record for code; T7 floor by frame action |
| Dispatcher line | **0079** (priority), 0075, 0080-0086 | one launch path (A-13 done), run record (A-10 partial: RUNS empty), resolver v0 (A-3 partial), signals (A-5), per-client effort (A-12 draft) |
| Certification | 0038 item 1, 0041 items 1-2, 0055 item 3 | kernel packages: unified adversarial prompt, two parallel independent certifiers (I-a: Codex and Gemini) |

## 3. A-items (FINAL-RESOLUTION appendix; F-17 DIG draft by DeepSeek, spot-checked)

| Item | Script work | State |
|---|---|---|
| A-3 | resolver v0, supervisor, watchdog | partial (priorities 1-3 in `protocol-dispatch.cjs`) |
| A-4 | Node validator | not started; gate slice prototype + parity 17/17 in `tools/perf/gate-slice.cjs` |
| A-7 | navigation index over reviews/journals | not built (package I-a) |
| A-8 | `protocol-core.cjs` | built on `core-landing-ia` |
| A-9 | `record --candidate` | not built (package I-b) |
| A-10 | run record, usage rendering, Stop telemetry reader | partial; RUNS.jsonl empty |
| A-11 | redaction beyond journals | owner question OQ-1 |
| A-13 | private-clone launch | built; first real launch not run |
| A-14 | output schema | spec written; retrofit of ten scripts pending (package II) |

## 4. OwnerIdeas seeds on scripts (advisory, ranked below PLAN; PROTO-DEC-0079 item 7)

- `scripts.md` (frame R-5): Track A performance audit (done 2026-09-27, `docs/reviews/2026-09-27-claude-powershell-refactor-assessment.md`),
  Track B single-writer write broker (not decided), Track C procedure-to-script conversion by maturity
  (the mechanism already decided: P-L0-001 trigger `signal:script-candidate`, rulebook spec section 1).
- `Rust.md` (frame R-6): Rust core, PowerShell out of the hot path, fewer process spawns, incremental
  snapshot, watcher, caches. Measured: no CPU-bound hotspot; Rust not justified (audit section 7).

## 5. Order of work that the decisions allow

1. Package I-a on branch `core-landing-ia`: `.ai/core/` (L0 records of 0061), `protocol-core.cjs`,
   CATALOG, validator check. Landing into `v2.0.0` needs the owner (0061 item 2 orders it after
   stages 2 and 3) and certification by Codex and Gemini (0055 item 3).
2. Performance wave 1 (test-only, owner-approved in chat 2026-09-27): write-based fixture seeding,
   split of `validator.test.cjs`; then A-1 fix as a separate commit.
3. Node validator per 0077 G1-G5, starting with the completion-gate slice (parity proven).
4. Package I-b scripts: `record --candidate` (A-9), ledger collection, exhaustion (R-05..R-07).
5. Package II: A-14 retrofit; wiring of the rulebook checks (verdict, scope) into `gate-check` as
   designed there, which the first rulebook installment deliberately did not do (spec section 7).
