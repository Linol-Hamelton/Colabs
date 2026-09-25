# Study A — synthesiser prompt: one funnel from three

- Frame `task:research-a`. Your one role: synthesiser. You must not be one of the three study-A
  researchers (README dispatch table). You propose; you certify, decide and change nothing.
  Mode: ADVISORY. Directives: PROTO-DEC-0066. Author: `claude-opus-5-5` (coordinator), 2026-09-25.
- Start only when all three researchers' sets exist under `A/` (registry, cards, measurements,
  report). If one is missing or marked incomplete, report it and synthesise the rest; a missing
  report is pending, never agreement (R-L2-S003.6).

## 0. Before anything

1. `git rev-parse --show-toplevel` prints your job's working copy: a directory `colabs-research/<job>-...` under the
   system temp directory, a private clone of the checkout that the launcher made for this job
   (PROTO-DEC-0070, R-L3-004.9). Your outputs and journal are copied back when you finish. If it
   prints anything else, stop and report.
2. `node .ai/bin/protocol-session.cjs start --agent <the agent name of your job file>`; use the owner name it prints.
3. Journal line 1: `Launch: model=<id> effort=<value|unknown> client=<client>`.
4. Journal line 2: `Orientation: <model> @ task:research-a: synthesiser | rights=read, write two files | limits=section 3 of A-research.md | tools=<...> | success=section 2 | tier=T5`

## 1. Read

`BRIEF.md` (index, then O-01, O-03, O-04 and O-07 in full), `prompts/A-research.md`, and the three
researchers' four files each. The limits of section 3 of `A-research.md` bind you too.

## 2. Do

1. Merge the three registries into one. Map every researcher id to one canonical id `HA-nnn`.
   - Merge only the same mechanism. Two hypotheses with different mechanisms stay apart even when
     their titles match.
   - Record for each canonical hypothesis which researchers found it (1, 2 or 3). Agreement
     between researchers is a signal; it is not evidence that the effect exists.
   - Union the provenance tags; take the novelty class the evidence supports.
2. Report the funnel counts: per researcher, merged, after normalisation. Report the provenance
   distribution of the merged pool.
3. Screening disagreements: where two researchers' scores for one hypothesis differ by 2 or more,
   say why, and prefer a measurement over a score.
4. Measurements: put the three baselines side by side. Where they disagree beyond their stated
   spread, name the cause if you can find it, or mark the number disputed.
5. Deep set: take the strongest card per canonical hypothesis. Where cards conflict on mechanism,
   metric or risk, keep both views and say which evidence decides. Add hypotheses that only one
   researcher carded but the merged screening supports. Keep backlog and rejected lists; nothing
   good is dropped silently.
6. Synergies and the priority set by the O-04 value formula, with every input and its source shown.
7. Wave-2 test plan for the priority set, one entry per test under P-L0-007: variants, metric,
   number of runs, kill condition, the disposable-clone setup, and what each test needs installed
   or changed outside the repository (each such need is an owner decision, PROTO-DEC-0048 item 8).
8. Map each priority hypothesis to the kernel layer (L0-L9) and CORE-ARCH stage it would change,
   and to the decision blocks it would touch (PROTO-DEC-0034, 0036, 0039, 0045 and any other).
9. The AX answer: which of "use AX heavily", "use AX only for sandbox execution" and "AX currently
   adds too little" the evidence supports, and what would change that answer.

## 3. Outputs

- `A/synthesis-registry.md`: the merged table, with the columns of the researchers' registries
  plus `found-by` and `source-ids`.
- `A/synthesis.md`, at most 250 lines. Header: SHA, tree state, model and effort as launched,
  client, date UTC, the three input sets with their owners. Sections: steps 2 to 9 above, then
  at most ten owner questions.
- Label claims FACT, CLAIM or HYPOTHESIS. Do not quote the researchers' prose; cite `path:line`
  (PROTO-DEC-0048 item 3). Never write keys, tokens or passwords.
- Journal: a checkpoint line per step, a five-label entry at the end, then
  `node .ai/bin/protocol-handoff.cjs record --quick --owner <your owner name>` (the validator only; PROTO-DEC-0071).
