# MCP / Bounded-Context Council - Adversarial Synthesis

**Date (UTC)**: 2026-09-20  
**Reviewed commit**: `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1`  
**Working tree**: dirty (shared recovery-package work in progress)  
**Reviewer**: GPT-6 / Codex  
**Scope**: Round-2 synthesis, experimental boundary, current-cycle disposition  
**Verdict**: **RECOMMENDATION - B; SUFFICIENT TO FINALIZE THE CURRENT PLAN**  
**Mode**: CERTIFYING for local reproductions; all transcribed participant answers remain READ-ONLY ADVISORY  
**Receipt-Owner**: `codex-1d88d4ac0104f8a6`  

## Input register

1. Codex independent audit: `docs/reviews/2026-09-20-codex-independent-mcp-architecture-audit.md`.
2. External Round-1 answer supplied by the owner; model identity was not present in the text. Attachment SHA-256
   `5B90E6336725F2F59A51AACB7F78384AEF37247CE228B6BF70E117F2FCEDB316`, 14,300 bytes.
   `[MODE: READ-ONLY ADVISORY]`
3. GLM 5.1 answer supplied by the owner. Attachment SHA-256
   `80C54811C06C60B75B8E19E9C829BFAB75EDAA6A119870B2B584C7AA5654785C`, 7,429 bytes.
   `[MODE: READ-ONLY ADVISORY]`
4. Qoder answer supplied inline by the owner. It summarizes the council prompt but gives no A/B/C verdict,
   reproductions, candidate adjudication, experiment, or governance ruling. `[MODE: READ-ONLY ADVISORY]`

The attachment paths are session-local and are not repository evidence. The hashes identify the exact owner-supplied
inputs used for this synthesis. No participant count is treated as a vote.

## Sufficiency ruling

The information is sufficient to finalize the current improvement-cycle plan. A second discussion round would not
resolve a remaining strategic disagreement: every substantive answer recommends B (prepare a bounded future
experiment while preserving the product freeze), and the remaining differences are factual or protocol errors that
can be rejected from repository evidence.

Operational meaning of B:

- no MCP/index installation, configuration, or experiment during the current freeze;
- H1 is described narrowly as refuting the tested additive full-raw-digest workflow;
- B2/B3/B4/C2 remain closed by accepted owner policy, not labelled empirically refuted;
- the next work is audit closure, corpus/journal hygiene, and the two product pilots;
- a future retrieval experiment is only a post-pilot, owner-directed branch.

## Agreement and disagreement

| Issue | Codex | External Round 1 | GLM 5.1 | Qoder | Synthesis |
|---|---|---|---|---|---|
| Current action | B | B | B | no verdict | B |
| H1 boundary | raw full digest only | same | same in conclusion | not adjudicated | verified |
| Arm C cancellation | valid stop rule | valid | incorrectly marked untested | not adjudicated | valid but not evidence about untested candidates |
| Notebook diagnosis | false | false | false | only repeats question | false; zero `.ipynb` |
| Freeze | preserve | preserve | preserve | repeats constraint | preserve |
| Future experiment | one candidate at a time | proposes sequential candidates | bundles control + two candidates | none | one candidate/server at a time |
| Corpus breach | resolve before final receipts | same | journal-only remedy | none | classify review corpus and journals separately |

## Rejected or corrected claims

1. Qoder is not a Round-1 council answer. It is a prompt summary and cannot support a decision.
2. GLM swaps the H1 treatment label: the full raw digest was Arm B, not Arm A.
3. GLM proposes `Status: Proposed` in `DECISIONS.md`; proposals are forbidden there. A future decision must be a
   human-approved Accepted block appended only after a valid registry trigger.
4. GLM estimates Repomix MCP schema at 200-400 tokens without a measurement. Reject the estimate.
5. GLM's 10 tasks x 3 arms x 3 repetitions design is 90 trial sessions, not two sessions. It also violates the
   one-candidate/server rule by testing scoped CLI and MCP together.
6. GLM's suggestion to retain full transcripts under active `docs/reviews/` conflicts with the corpus cap. Raw trial
   data belongs in runtime storage; a compact immutable manifest/report is the tracked artifact.
7. The external Round-1 answer says `rg` is absent. Current reproduction finds ripgrep 15.2.0 on PATH. The native
   control remains `rg` plus direct reads, with built-in search as a client-specific equivalent.
8. Kindex schema is not exactly measured. Its current default surface is nevertheless ineligible pending a pinned
   `tools/list` measurement and a read-only subset; do not describe the exact token count as established.

## Final current-cycle plan

### Phase 0 - Audit closure

1. Correct task/plan wording without editing accepted decisions.
2. Keep `PROTO-DEC-0036` operationally closed and `PROTO-DEC-0039` active.
3. Restore active reviews to <=60 files / 600 KB using the `PROTO-DEC-0037` protected keep-set.
4. Restore journals to <=30 without touching a live session's journal.
5. Run validator, regression suite, doctor, gate-check, and a final ordered receipt pass on the frozen tree.

### Phase 1 - Product pilots

1. The owner names one objective and freezes the five metrics for each consumer repository.
2. Re-measure both dirty trees; do not trust the historical 43/34 counts.
3. Triage each repository in a disjoint product session, finish-or-revert, run product tests, and make one triage
   commit inside that consumer session.
4. Run the approved 10-20 task pilot against the one-task-file + one-handoff-note control.
5. Publish the product-pilot report before any protocol feature work.

### Phase 2 - Conditional post-pilot branch

Only if the product report shows a material retrieval bottleneck and the owner issues a dated directive:

1. append an `owner-directive` registry trigger under the shared lock;
2. append a new approved decision narrowing/superseding `PROTO-DEC-0036`;
3. test one candidate at a time against native `rg` + direct reads;
4. first candidate: Repomix MCP grep/slice or scoped CLI, selected explicitly, never bundled;
5. a first-family pass authorizes replication, not adoption.

## Human communication language

For the current repository and owner, user-facing communication is Russian (`ru-RU`). Agent-to-agent prompts and
repository documentation may remain English to reduce token cost. This is recorded in `.ai/TASK.md` as a replaceable
project preference.

A kernel-level implementation is deferred by the feature freeze. The preferred post-freeze design is a preserved
state file such as `.ai/PREFERENCES.json` with `humanLanguage` and `internalDocumentationLanguage`, injected at
session start and never overwritten on upgrade. It requires an explicit freeze exception or the product-pilot report,
installer/validator tests, and the full protocol-core adversarial review path.

## Dissent and unknowns

Minority A remains credible: do no further retrieval research because native search is adequate and protocol work has
already displaced product work. No evidence supports C (test now).

Future measurements, not current-plan blockers: exact target-client schemas; Serena `.cjs` reference accuracy;
Qdrant ingestion/rebuild economics; Kindex read-only subset availability; cross-model replication.

## Dispatch

Implementation and independent review are defined in
`docs/reviews/2026-09-20-deepseek-gemini-cycle-resume-prompt.md`.
