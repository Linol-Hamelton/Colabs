# Backlog (PROTO-DEC-0076 triage)

- Kept here while `.ai/TASK.md` is at its size limit.
- Triage:
  - simple: fixed along the way;
  - medium: fixed between rounds;
  - complex and non-blocking: discussed and decided;
  - blocking: isolated in `docs/ops/PROBLEMS.md`.
- No new hypotheses are opened for now (PROTO-DEC-0076 item 4); the frozen ones are listed at the
  end.
- One line per item: id, what, source, state. The newest state wins; closed items keep their line
  with the closing commit.

## Simple

- S-1: `round3/USAGE.md` keeps only the last try per slot, and the verify wall time is wrong
  (the log predates the try). Source: run-chain. Closed 2026-09-27 for the kernel path
  (F-01, CR-F01-1): run records keep every attempt (`docs/specs/run-record.schema.md`);
  run-chain itself is superseded, not fixed.
- S-2: K-launch and the improvement research README name the second pass as the gate; the third
  pass governs. Source: F-3P-4. Open, in the L correction pass.
- S-3: the `launch.cjs` a-deepseek route `openai-compatible/deepseek/...` has no key in the Kilo
  CLI. Source: round-2 dispatch. Open, in the L correction pass.

- S-4: DeepSeek (owner-run critique of the workflowAI review, 2026-09-25) wrote its documents in
  English, as required, but its final chat report in Chinese, against "Talk to the owner in
  Russian" (package COMMON.md line 3). Fix applied to the package: the language rule is repeated
  at the point of use, as the last step of COMMON rule 6. Carry it into every prompt template in
  the next kernel batch. A script cannot check a chat reply, so this stays a prompt-level control.
  Closed 2026-09-27: language rule repeated at point of use in templates/prompts/COMMON.md and .ai/docs/PAIRED-CYCLE.md prompt templates.
- S-5: the ladder rung "DeepSeek V4.1 Max" in MODEL-ECONOMICS. Confirmed with owner (PACKET-1.md Q1): DeepSeek V4.1 Max = V4.1 Flash at max effort (`deepseek/deepseek-flash`, effort `max`). Closed 2026-09-27 (F-02, CR-F02-1).

- S-7: `launch-test.cjs` runs about 20 scenarios in parallel, and concurrent WMI queries once timed
  out `zz-t16` (Gemini, 1 of 4 runs; Mistral 3/3 and Codex 3/3 clean). Throttle the scenarios.
  Source: certifier 1. Open.
- S-8: `kilo-routes.json` lacks `deepseek/deepseek-flash`, so the first fallback of a-deepseek is
  the keyless route. Source: DeepSeek, both certifiers. Closed 2026-09-26: the generator now uses the
  owner-key provider `deepseek` and drops the keyless `openai-compatible`; snapshot regenerated;
  `--dry a-deepseek` shows primary `deepseek/deepseek-flash`, fallback openrouter.
- S-9: the R-L3-004.9 text from the DeepSeek response goes into `P-L3-004` (spec author, item 9
  of L-CORRECTION-4). Closed 2026-09-26: P-L3-004 0.5.
- S-10: Mistral (vibe) twice edited its journal entry after `record` (round-3 reverify; L
  certifier 2), which breaks the entry hash. Fixed each time by a new entry and a new record. Add
  "never edit an entry after record; add a new one" to the vibe client profile and to prompt
  templates. Source: coordinator. Closed 2026-09-27: added "never edit an entry after record; add a new one" to vibe client notes in .ai/docs/CLI-AGENTS.md, templates/ai/worklog/README.md, .ai/docs/PAIRED-CYCLE.md, and templates/prompts/COMMON.md.
- S-6: run-chain records a manual step's wall time as a negative number and its model as the name in
  the launch file ("DeepSeek V4.1"), while the step ran on `deepseek/deepseek-flash`. Source: the
  workflowAI review synthesis. Closed 2026-09-27 for the kernel path (F-01, CR-F01-1): a run
  record takes the model from the route and the wall time as end minus start, never negative
  (PKG-1 S8, PKG-2 AC-5).

## Medium

- Tests must not hardcode ids the live corpus can take: `tests/registry.test.cjs` tests 6/7 pinned
  `PROTO-DEC-0099`; the live `.ai/DECISIONS.md` reached 0099 on 2026-09-28 and the fixture-based
  validator run then failed with duplicate/edited-block FAILs (the fixture resolves the real corpus).
  Source: the failed merged-tree suite 2026-09-28. Immediate fix applied on v2.0.0 (computed id =
  max+1); rule for future tests: derive synthetic ids from the fixture or reserve a far range.
- Kilo client: `kilo.exe serve` (VS Code extension `kilocode.kilo-code-7.8.1`) grows its Working Set
  over a long operator session (16:02Z 3.98 GB -> 16:20Z 6.17 -> 16:23Z 8.24 GB peak; trimmed back
  to 3.7-4.0 GB by 16:27-16:32Z) while private memory holds ~8.3-8.6 GB; the spike pushed Available
  below the 8 GB gate for ~30 min on 2026-09-28. Source: operator samples during PROTO-DEC-0103.
  Protocol consequence: restart the operator by `STATE.md` at checkpoints.
- M-2A-res: wave-2A residuals F-2A-01 (the `W2A-EXECUTION.md` report sentence misdescribes the INDEX
  edit) and F-2A-05 (T30 does not exercise the bare default `docs/ops/RUNS.jsonl` path); both LOW,
  unverified, carried by MiMo's certifier reports. Sources: `docs/reviews/2026-09-28-mimo-wave2a-certification.md`
  (`2440fcc`), `...-certification-r2.md` (`0d87aff`); PROTO-DEC-0100 item 2. Open, next wave.
- F-18 row 20 (`swe-bench-pro`): the score `Gemini 3.8 Flash 61.6%` is unverified (the cited
  `datacamp.com` source returned HTTP 403 in the MiMo verification); stays marked unverified,
  recheck at the next catalog touch. Source: `docs/reviews/2026-09-28-mimo-bench-catalog-verification.md`
  (`81cab28`); owner instruction 2026-09-28. Open (low).
- M-1: a transient `.git/index.lock` can raise a spurious SCOPE_STOP. Policy: bounded retry with
  backoff; never delete a lock another git process holds. Source: F-3P-5. Open, L correction pass.
- M-2: the `launch.cjs` job table (models, routes, outputs) is in code. Move it to a file.
  Source: PROTO-DEC-0073. Open, L correction pass.
- M-3: the improvement-research jobs use copilot, grok, kimi and Kilo routes, which are outside
  the owner's ladder and CLI-only rule. Re-resolve them by `workflowAI.md` section 1.5.
  Source: PROTO-DEC-0076. Open, before K-launch.
- M-4: run-chain implements only part of PROTO-DEC-0075: resume-first, error classes, the hard
  ceiling and launch-input pinning are missing. Source: PROTO-DEC-0075. Closed 2026-09-27: superseded by
  `.ai/bin/protocol-dispatch.cjs` (PKG-1, PKG-3; F-01, CR-F01-1); run-chain is not fixed and
  leaves through OPS-1 W1.
- M-5: the stage-2 notes of report S:
  - `roles: [all]`, frame-field syntax, fixture count;
  - the P-L2-002 rubric aligned to PROTO-DEC-0075 items 8-9;
  - R-L3-004.4-5 aligned to 0075 items 2-3 and 7.

  Source: DeepSeek report S; 0072; 0075. Open, next stage-2 fix round.
- M-6: `workflowAI.md` findings. The synthesis is done and R1-R8 are applied; the owner's answers
  to Q1-Q5 are in PROTO-DEC-0078 and in the file. Closed 2026-09-25.
- M-7: the launch conditions of the validator migration (`final-plan-2.md` section AC, items
  2-6):
  - the freeze cover is named (PROTO-DEC-0077 item 2: CORE-ARCH under 0054 item 2);
  - a certifier-availability preflight;
  - the phase-0 baseline measurements run exclusively on the workstation;
  - the oracle dependency cohort of CA-04 goes into G1's contract set;
  - the L correction pass for Part 2.

  Open.
- M-8: `run-chain.cjs` runs jobs in the checkout with the owner's git credentials; push is prevented
  only by prompt rules (Level 0). Apply the Level-1 environment and the `ls-remote` audit of
  L-CORRECTION-4 items 2 and 4 to run-chain too, or move it into the kernel dispatch script (C-3).
  Source: coordinator's self-audit, 2026-09-25. Closed 2026-09-27 for the kernel path:
  `protocol-dispatch.cjs` runs each attempt in a private clone at Level 1 (PKG-1, A-13; F-01,
  CR-F01-1). run-chain stays Level 0 and was still used on 2026-09-27; its retirement is OPS-1 W1.

## Complex, non-blocking (discuss and decide)

- C-1: F-3P-1 architecture. Decided: PROTO-DEC-0077 item 3. Implemented in 1302554 by DeepSeek
  (L-CORRECTION-4, covering S-2, S-3, M-1 and M-2) and certified by Gemini and Mistral
  (RECOMMENDATION, 2026-09-26). F-3P-1 stays a hypothesis under validation; the publisher and the
  UNPROVED cases are future work. Done as a correction pass.
- C-2: the validator migration plan. Decided: PROTO-DEC-0077 items 1-2 (early bounded migration
  inside CORE-ARCH; cloud Evidence fail-closed). Next: the section AC launch conditions (M-7).
- C-7: certification of L-CORRECTION-4 (high-risk, 0038 item 1). Done 2026-09-26: the unified
  audit prompt was used, with two parallel independent certifiers (0041 item 2), Gemini and
  Mistral, both RECOMMENDATION.
- C-8: owner-approval question, PROTO-DEC-0079 (proposed by another agent). An implementation
  from a senior spec takes its tier from the rubric, not the T7 floor, and the floor moves to the
  spec, the review and certification. Not needed for L-CORRECTION-4, since item 9 is now the spec
  author's. Open.
- C-3: the kernel dispatch script: resolver per `workflowAI.md` plus supervisor per PROTO-DEC-0075,
  replacing the research runners. Source: PROTO-DEC-0050 item 4, 0074-0076. Done 2026-09-27:
  `.ai/bin/protocol-dispatch.cjs` (PKG-1, PKG-3), certified in rounds 1-3 (F-01, CR-F01-1).
- C-4: sequencing of RISK_COUNCIL and H-AUTH-02. Owner. Source: earlier session.
- C-5: TD-MODEL-QUALIFICATION (PROTO-DEC-0076 item 2; `workflowAI.md` section 6). Its parts
  overlap H-WAI-2..5 (frozen) and C-3. The owner sets closure criteria when the freeze lifts.
  Recorded, not worked.
- C-6: the group tie-break of `workflowAI.md` 1.5 step 6 (synthesis D3). The owner decides Q2.
  Source: the workflowAI review.

## Frozen hypotheses (migrated)

`docs/research/FRAMES.md` is the only registry of DEFER entries and candidates (P-L0-008;
PROTO-DEC-0084 item 10). The former frozen hypotheses live there:

- H-WAI-1..6 (`workflowAI.md` section 3) → DEFER D-03 (trigger: run records accumulated, A-10);
- H-PROMPT-DELIVERY-01 (`OwnerIdeas/`) → merged into candidate C-R7;
- L-GIT-01 → CLOSED (answered by the council, see C-1).
