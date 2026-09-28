# Kernel v1 scope - decision draft (ROADMAP-1 wave 3, item 1)

Drafter: Mistral Medium 3.5 via vibe (session `mistral-0adda986fd362c51`), 2026-09-28. A draft,
not a decision: it carries no verdict and certifies nothing. It answers the wave-3 item-1
reassignment (PACKET-1 amendment 1): the Kernel v1 scope decision per P-L0-008 R-L0-22.54 and the
carried owner question OQ-11 (OPS-1 README, "Owner questions carried from F-01"). Binding text:
R-L0-22.53 (kernel-completion contract) and R-L0-22.54 (scope is a separate owner decision;
performance blocks completion only where a hot path exceeds its own latency budget) in
`docs/core-arch/stage-1/P-L0-008-research-governor.md`.

Numbers below cite their sources inline. DIG counts come from the F-17 registry files in this
directory (`DIG-MISTRAL-0022-0047.md`, `DIG-GEMINI-0048-0067.md`, `DIG-DEEPSEEK-0068-0086.md`) and
the operator's `COVER-DUP.md` totals: 331 rows, 292 built, 29 partial, 10 not built.

## 1. What "the current kernel" is

The tracked protocol tooling at HEAD `c2a843b`: the `.ai/bin/` Node scripts (session, handoff,
archive, hooks, lock, index, ledger, dispatch, runrecord, signals, scope, verdict, protocol),
`validate-protocol.ps1`, `test-protocol.ps1`, `protocol-manifest.json`, `docs/specs/`, and the
templates. Load-bearing pieces are built and certified: the dispatcher `.ai/bin/protocol-dispatch.cjs`
(BACKLOG C-3, certified in F-01 rounds 1-3, receipt CR-F01-1), run records (A-10 built,
`docs/specs/run-record.schema.md`), resolver v0 (PROTO-DEC-0079 item 1, priorities 1-3 built).
Validator state at the phase-0 baseline: exit 0, 0 warnings (BASELINE.md section 4.1).

## 2. Options

| | A. Minimal v1 (owner-mandated wording) | B. v1 + kernel physical landing | C. v1 + Node port |
|---|---|---|---|
| Ships | current kernel + merged 2A; the Node port (2B), CORE-ARCH stage 3 and OPS-1 B/C continue in parallel with the product pilots | A + package I-a/I-b: `.ai/core/` landing, `protocol-core.cjs` code (S3-T13), `record --candidate` (S3-T14), navigation index (A-7) | A + the full Node validator port: `protocol-validate.cjs` + 4 modules + gate leaf, differential harness, contract CM-01..CM-49, retirement (final-plan-2.md sections F, I, Q) |
| Stays out | 2B, stage 3, OPS-1 B/C, packages I-a/I-b, and the 10 "not built" DIG rows (dispositions, section 4) | 2B, stage-3 remainder, OPS-1 B/C | stage 3, OPS-1 B/C, packages I-a/I-b |
| Cost/effort class | low: zero new implementation beyond 2A already in flight (6 items, one batch, one candidate); calendar gated only by the 2A certification flow | medium-heavy: needs stage 2 + stage 3 complete first (PROTO-DEC-0061 item 2; wave-4 line in FRAMES.md), then package I-a/I-b as their own candidates | heavy: 7 phases (final-plan-2.md section Q), each gate its own candidate with two certifiers, mutation qualification per NORMATIVE FAIL check; measured in weeks |
| Consequence if chosen | earliest pilot resume (the outstanding TASK.md acceptance items); DIG-in-scope closes by owner DEFER of the 10 rows; PowerShell stays the single validator engine, so cloud recording stays fail-closed (PROTO-DEC-0077 item 1) | pilots wait for stage 3 + two packages; clears 4 of the 10 not-built rows (PROTO-DEC-0060 item 3, A-7, A-8, A-9) but builds ahead of the design it implements | pilots blocked longest; removes the structural drivers (cloud recording, hand-parity drift, TCB self-hosting; final-plan-2.md section D) but its speed benefit is unmeasured (section D: the language is not shown to be causal) |

Baseline reference for any option: Bv = 6.182 s, Bs = 590.781 s (the full suite; "591 s"),
Bn (suite) = 2,370 processes, Bm (suite) = 2,575.15 MB - all from `BASELINE.md` sections 3-4,
the frozen phase-0 baseline (PACKET-1 Q4).

## 3. Exit criterion for the chosen scope (proposed for Option A)

v1 is DONE when all five hold at the merged head (branch `v2.0.0` after the 2A merge commit):

- **E1. Suite and baseline gate.** The owner lane runs the exclusive workstation measurement once
  with the same harness (`.ai/runtime/measure-baseline.ps1`; BASELINE.md section 2):
  `validate-protocol.ps1` exit 0 with 0 warnings; full `test-protocol.ps1` exit 0. Wall times are
  recorded beside the frozen baseline: Bv(v1) vs 6.182 s, Bs(v1) vs 590.781 s (BASELINE.md). Proposed
  acceptance bounds for the owner to confirm or replace: Bv(v1) <= 2 x Bv (12.4 s) and
  Bs(v1) <= 1.25 x Bs (~739 s) - 2A adds tests (W5) and throttles scenarios (S-7), so some growth is
  expected; R-L0-22.54 keeps performance a completion blocker only on a hot path exceeding its own
  budget, so beyond-bound numbers force a review, not an automatic fail.
- **E2. 2A certification gate.** The batch is merged through the full high-risk flow: DeepSeek
  adversarial review (`W2A-REVIEW-TASK.md`, diff `a4312e8..HEAD` on `kernel-batch-1`), one fix pass,
  CANDIDATE SHA freeze, owner-lane full suite green on the candidate, unified adversarial audit
  prompt (<= 150 lines), two parallel independent certifiers (MiMo-V2.6-Pro and GPT-5.6 Sol,
  PACKET-1 Q2), both verdicts PASS/RECOMMENDATION persisted under `docs/reviews/`, merge commit,
  TASK completion gate filled. Measurable: batch cap respected (at most 3 certification rounds on
  distinct frozen candidates, PROTO-DEC-0047 item 5) and zero mandatory findings open at merge.
- **E3. Usage-coverage gate (A-10 chain).** Every line of `docs/ops/RUNS.jsonl` at the v1 head
  passes run-record schema validation (`protocol-runrecord.cjs`; golden validation, 14/14 in
  `tests/runrecord.test.cjs`, CERT-KIMI 2026-09-26) and satisfies: usage/tokens present, or the
  explicit not-exposed marker `tokens.source = "none"` with `in = out = null` (P-7,
  `docs/specs/run-record.schema.md:108`). Criterion: zero rows with neither. Coverage is over run
  records, never over clients. The file is 0 bytes today (PACKET-1 amendment 4; A-13 partial in
  `DIG-DEEPSEEK-0068-0086.md`), so E3 additionally requires at least one real dispatcher row
  written by the 2A root-cause fix (W2A-REVIEW-TASK check 4e proves the append in a temp root);
  the check is a script over the file, not prose.
- **E4. DIG disposition gate.** Each of the 10 "not built" rows (1 in `DIG-GEMINI-0048-0067.md`,
  9 in `DIG-DEEPSEEK-0068-0086.md`, 0 in `DIG-MISTRAL-0022-0047.md`) carries an owner-approved
  disposition from section 4, so DIG within the v1 scope is zero (R-L0-22.53) with the remainder
  DEFERred by the owner (R-L0-22.42 records the ACCEPT-to-DEFER move as an owner decision,
  reported beside DIG).
- **E5. Lifecycle gate.** One real dispatched task exercises the lifecycle end to end - success,
  recoverable failure with retry or repair, blocked-with-escalation (R-L0-22.53): the dispatcher
  implements the completion contract and error-class retry ladder (PROTO-DEC-0075 items 2, 6, 11;
  tests `dispatch.test.cjs` 21/21, `resolver.test.cjs` 7/7 per CERT-KIMI 2026-09-26), and the E3
  first real row is its end-to-end evidence.

## 4. Disposition of every "not built" DIG row (Option A)

| # | Row (registry file) | Missing | Proposed v1 disposition |
|---|---|---|---|
| 1 | PROTO-DEC-0060 item 3 (`DIG-GEMINI-0048-0067.md`) | `.ai/core/` does not exist | OUT. DEFER; trigger: CORE-ARCH package I-a after stages 2 and 3 (PROTO-DEC-0061 item 2; FRAMES.md wave-4 line) |
| 2 | PROTO-DEC-0079 item 3 (`DIG-DEEPSEEK-0068-0086.md`) | task-characterization component absent from P-L2-002 0.5 | OUT. DEFER to the next P-L2-002 revision, already recorded as pending by PROTO-DEC-0086 item 5 (T1-T9 provider-relative note) |
| 3 | PROTO-DEC-0084 item 5 (same file) | canonical `docs/ops/model-evidence/` not created; F-02 evidence archived | OUT. DEFER; trigger: the first consumer that needs live model evidence (the F-02 set is frozen with `source_commit`/`source_blob`, model-layer README) |
| 4 | PROTO-DEC-0085 item 9 (same file) | attention/storage budget numbers still line-based | OUT. Stays an owner decision by the row's own text ("await a later owner decision") |
| 5 | PROTO-DEC-0085 item 10 (same file) | general closure procedure, L0 invariant, scanner | OUT. TRANSFER to F-03 stage 3 (CORE-ARCH continues in parallel under Option A) |
| 6 | A-4 (same file) | Node validator port not started | OUT. Continues as wave 2B per `final-plan-2.md` (in parallel under Option A) |
| 7 | A-7 (same file) | navigation index over reviews/journals | OUT. DEFER; trigger: CORE-ARCH package I-a (PROTO-DEC-0057 item 5) |
| 8 | A-8 (same file) | `protocol-core.cjs` is spec only | OUT. TRANSFER to F-03 stage 3, task S3-T13 |
| 9 | A-9 (same file) | `record --candidate` not implemented | OUT. TRANSFER to F-03 package I-b, task S3-T14 |
| 10 | A-11 (same file) | redaction beyond journals has no accepted block | OUT. Owner question OQ-1 (OPS-1 README); nothing exists to implement until the owner answers |

Rule for the 29 partial rows (11 in the Mistral file, 3 in the Gemini file, 15 in the DeepSeek
file; COVER-DUP.md): scope membership decides. Partials belonging to the parallel programs are
outside v1 by construction of Option A (pilot items PROTO-DEC-0039 items 2-5; stage-3-carried
PROTO-DEC-0085 item 7; suspended studies PROTO-DEC-0066 item 6). A partial inside the v1 scope
must reach "built" at the v1 head or take an owner disposition like the rows above.

## 5. Recommendation

**Option A.** Reasoning: (1) it is the only option that unblocks the product pilots, which are the
actual outstanding acceptance items (TASK.md: pilots run native-only; PROTO-DEC-0048 deferred
product work until protocol stability, and the load-bearing kernel surfaces are built, certified
and at 0 warnings); (2) it is the minimal scope that can honestly reach DIG-in-scope = 0 using the
governor's own DEFER mechanism, without waiting on programs whose value is unproven (2B's speed
benefit is explicitly unmeasured, final-plan-2.md section D; stage 3 design is incomplete);
(3) it reopens nothing: 2B proceeds under its own section-AC launch conditions, already satisfied
by PACKET-1 Q2/Q4 plus BASELINE.md, and stage 3 proceeds as wave 2C.

## 6. Risks that would falsify the recommendation

1. 2A fails certification beyond the three-round cap (PROTO-DEC-0047 item 5): the v1 head cannot be
   cut; the owner narrows the batch (PROMPT.md stop rule: a FAIL after the round budget goes to the
   owner).
2. The RUNS.jsonl root cause is structural and survives 2A: E3 becomes unmeasurable on real data;
   fallback is the hermetic temp-root append proof (W2A-REVIEW-TASK check 4e) plus moving the first
   real row into the pilot program.
3. A certifier slot is empty at the 2A gate: PROTO-DEC-0041 item 2 needs two parallel independent
   certifiers, and GPT-5.6 Sol already hit a limit timeout on 2026-09-27 (`GLM-PROBE.md`), which is
   why the DIG verification moved to GLM-5.3 and then stalled on the fallback route.
4. Bs(v1) regresses beyond the proposed E1 bound: the bound is a draft proposal, not a measured
   number; the owner may set record-only.
5. The GPT-5.6 Sol DIG verifier (20% sample plus every "not built" row) revises the registry: counts
   and section 4 shift; the disposition table is re-checked at the owner gate before approval.
6. A pilot turns out to need cloud Evidence: Option A keeps cloud recording fail-closed
   (PROTO-DEC-0077 item 1); that requirement would falsify A in favor of C's structural
   deliverables.
