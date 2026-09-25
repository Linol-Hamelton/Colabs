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
  (the log predates the try). Source: run-chain. Open.
- S-2: K-launch and the improvement research README name the second pass as the gate; the third
  pass governs. Source: F-3P-4. Open, in the L correction pass.
- S-3: the `launch.cjs` a-deepseek route `openai-compatible/deepseek/...` has no key in the Kilo
  CLI. Source: round-2 dispatch. Open, in the L correction pass.

- S-4: DeepSeek (owner-run critique of the workflowAI review, 2026-09-25) wrote its documents in
  English, as required, but its final chat report in Chinese, against "Talk to the owner in
  Russian" (package COMMON.md line 3). Fix applied to the package: the language rule is repeated
  at the point of use, as the last step of COMMON rule 6. Carry it into every prompt template in
  the next kernel batch. A script cannot check a chat reply, so this stays a prompt-level control.
  Fixed in the package; the template change is open.
- S-5: the ladder rung "DeepSeek V4.1 Max" in MODEL-ECONOMICS. Kilo names `deepseek/deepseek-flash`
  "DeepSeek V4.1 Flash", and the session recorded effort as unknown. Confirm with the owner that
  "Max" is the effort level, and record the route id and effort in the ladder table. Open.

- S-6: run-chain records a manual step's wall time as a negative number and its model as the name in
  the launch file ("DeepSeek V4.1"), while the step ran on `deepseek/deepseek-flash`. Source: the
  workflowAI review synthesis. Open.

## Medium

- M-1: a transient `.git/index.lock` can raise a spurious SCOPE_STOP. Policy: bounded retry with
  backoff; never delete a lock another git process holds. Source: F-3P-5. Open, L correction pass.
- M-2: the `launch.cjs` job table (models, routes, outputs) is in code. Move it to a file.
  Source: PROTO-DEC-0073. Open, L correction pass.
- M-3: the improvement-research jobs use copilot, grok, kimi and Kilo routes, which are outside
  the owner's ladder and CLI-only rule. Re-resolve them by `workflowAI.md` section 1.5.
  Source: PROTO-DEC-0076. Open, before K-launch.
- M-4: run-chain implements only part of PROTO-DEC-0075: resume-first, error classes, the hard
  ceiling and launch-input pinning are missing. Source: PROTO-DEC-0075. Open, between rounds.
- M-5: the stage-2 notes of report S:
  - `roles: [all]`, frame-field syntax, fixture count;
  - the P-L2-002 rubric aligned to PROTO-DEC-0075 items 8-9;
  - R-L3-004.4-5 aligned to 0075 items 2-3 and 7.

  Source: DeepSeek report S; 0072; 0075. Open, next stage-2 fix round.
- M-6: `workflowAI.md` findings. The synthesis is done
  (`docs/research/2026-09-25-workflowai-review/synthesis.md`) and R1-R8 are applied (2026-09-25),
  with owner questions Q1-Q4 marked in place. Source: this cycle. Open until the owner answers.

## Complex, non-blocking (discuss and decide)

- C-1: F-3P-1 architecture. `final-plan-2.md` Part 2 argues for the hybrid (variant 9) with the Q8
  acceptance suite. Needs an owner decision, then the L correction pass implements it. Source:
  council round 3.
- C-2: the validator migration plan (`final-plan-2.md` Part 1; its proposed decision block is in
  section AB). Needs an owner decision. Source: the council.
- C-3: the kernel dispatch script: resolver per `workflowAI.md` plus supervisor per PROTO-DEC-0075,
  replacing the research runners. Source: PROTO-DEC-0050 item 4, 0074-0076.
- C-4: sequencing of RISK_COUNCIL and H-AUTH-02. Owner. Source: earlier session.
- C-5: TD-MODEL-QUALIFICATION (PROTO-DEC-0076 item 2; `workflowAI.md` section 6). Its parts
  overlap H-WAI-2..5 (frozen) and C-3. The owner sets closure criteria when the freeze lifts.
  Recorded, not worked.
- C-6: the group tie-break of `workflowAI.md` 1.5 step 6 (synthesis D3). The owner decides Q2.
  Source: the workflowAI review.

## Frozen hypotheses (not expanded, PROTO-DEC-0076 item 4)

- H-PROMPT-DELIVERY-01 (`OwnerIdeas/`);
- H-WAI-1..6 (`workflowAI.md` section 3);
- L-GIT-01 (answered by the council, see C-1).
