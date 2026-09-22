# DeepSeek / Gemini Current-Cycle Resume Prompt

**Date**: 2026-09-20  
**Owner direction**: finalize the current recovery/product-pilot cycle using the MCP council synthesis  
**Execution order**: Gemini implementer -> DeepSeek independent reviewer/controller  
**User-facing language**: Russian (`ru-RU`)  
**Internal prompts and repository documentation**: English is permitted

## Read first

- `AGENTS.md`, `.ai/TASK.md`, `.ai/PLAN.md`
- `.ai/DECISIONS.md`, `PROTO-DEC-0034..0039`
- `docs/reviews/2026-09-20-mcp-council-round2-synthesis.md`
- `docs/reviews/2026-09-19-deepseek-course-correction-certification.md`
- `docs/reviews/2026-09-19-gemini-course-correction-implementation-report.md`
- `docs/reviews/archive/INDEX.md`

Do not treat chat history, model count, or external-tool output as Evidence.

## Binding disposition

1. Council result is B, but operationally A until the product-pilot report: no MCP/index experiment now.
2. H1 refuted the additive full raw-digest treatment only. B2/B3/B4/C2 remain closed by owner policy.
3. `PROTO-DEC-0036` and `PROTO-DEC-0039` remain Accepted and are not reopened by this prompt.
4. Do not install/configure Repomix MCP, Serena, Qdrant, or Kindex.
5. Do not append a decision or registry transition unless the owner gives a new explicit dated directive.
6. User-facing replies must be Russian. English is allowed for agent-to-agent work and repository artifacts.

## Gemini - implementation and closure pass

### G1. Baseline and ownership

1. Start or resume only your own protocol session and journal.
2. Run status/log, read recent journals, and acquire the shared lock before shared-document edits.
3. Preserve all unrelated dirty-tree work; do not commit or push unless the owner instructs it.

### G2. Reconcile factual wording

Verify that TASK/PLAN say:

- the tested raw whole-digest workflow was refuted;
- untested retrieval candidates were closed by owner priority/policy;
- a future experiment requires post-pilot owner-directed reopening;
- no protocol feature work occurs during the pilot except P0.

Do not edit existing decision blocks.

### G3. Corpus and journal closure

1. Measure the active `docs/reviews/` count and bytes; target <=60 files and <=600 KB after adding current artifacts.
2. Derive the protected keep-set from current-release certifying files, every path cited by the open task/decisions,
   and every path cited by a receipt that verifies against the pre-move tree.
3. Run doctor, gate-check, and receipt verification before moving anything.
4. Archive only files outside the protected set; append exact old -> new mappings to `docs/reviews/archive/INDEX.md`.
5. Re-run all three checks. Restore any path whose move breaks a binding.
6. Restore journals to <=30 only after confirming the target journal is not a live session. Never write another
   session's journal; use the normal archive/prune mechanisms.
7. Because tracked moves change the tree, perform final receipt recording only after all archive work is final.

### G4. Language preference

The current-cycle requirement is the replaceable `.ai/TASK.md` preference `ru-RU` for human-facing communication.
Do not implement a kernel feature during the freeze. In the implementation report, record the post-freeze proposal:
preserved `.ai/PREFERENCES.json` with `humanLanguage` and `internalDocumentationLanguage`, SessionStart injection,
installer preservation, validation, tests, and fallback behavior. It is a future owner-gated protocol-core change.

### G5. Verification and handoff

Run:

1. `git diff --check`
2. `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`
3. `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1`
4. `node .ai/bin/protocol.cjs doctor`
5. `node .ai/bin/protocol-handoff.cjs gate-check`

Publish one bounded implementation report and a precise journal entry. Do not mark TASK Completed. Release the lock.

## DeepSeek - independent adversarial review

After Gemini hands off:

1. Reproduce the protected keep-set, active review count/bytes, journal count, validator/tests, doctor and gate-check.
2. Verify no live-cited/current-certifying file moved, every archive mapping is exact, and no decision block changed.
3. Verify the H1 claim boundary and feature-freeze wording.
4. Verify Russian is the current human-facing preference and no kernel language feature was implemented.
5. Inspect Gemini's diff for unrelated edits and stale receipt claims.
6. Publish a CERTIFYING `PASS`, `FAIL`, or `BLOCKED` review with a receipt. Every FAIL/BLOCKED claim needs a
   reproduction. A FAIL returns to Gemini for a narrowly scoped remediation and re-review.

## Product-pilot gate

Only after a DeepSeek PASS and a frozen Colabs tree:

1. Ask the owner, in Russian, for one concrete objective and the five frozen metrics for `D:\Block-Puzzle`.
2. Ask separately for one objective and the five frozen metrics for `D:\VPN`.
3. If either is absent, stop before mutating that consumer repository.
4. Re-measure each consumer tree. Triage in two disjoint product sessions; no shared agent or task.
5. Product sessions may make their own triage commit after their own tests. The Colabs protocol session must not
   commit in consumer repositories.
6. Run the approved 10-20 task pilot and publish the comparative report.

Suggested disjoint assignment after owner metrics exist: Gemini -> Block-Puzzle; DeepSeek -> VPN. If DeepSeek must
remain the cross-pilot controller, the owner must name a different VPN implementer before work starts.

## Explicit non-goals

- no second MCP council round;
- no MCP or index trial;
- no Kindex/Serena/Qdrant/Repomix installation;
- no protocol v2.0 implementation;
- no language-preference kernel implementation;
- no decision transcription without a new owner directive;
- no claim of consensus based on model count.

## Completion output

Return to the owner in Russian with: Gemini report path, DeepSeek verdict path, exact active review/journal counts,
checks actually run, receipt status, remaining blockers, and the two product objectives/metrics still needed.
