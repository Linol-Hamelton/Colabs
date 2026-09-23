# Worklog: copilot-b516462b0e6f9a59

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---
## 2026-09-23 - Assemble R0 offline decision dataset

Agent: copilot

Action: Inspected AGENTS.md, .ai/TASK.md, the tracked-file inventory, docs/reviews/archive/INDEX.md, existing review artifacts, and docs/research/2026-09-20-cycle-history/evidence.json. Wrote only docs/research/2026-09-23-r0-decision-dataset/ with README.md, archive_classification.csv, review_depth.csv, findings.csv, and round_outcomes.csv.

Result: Dataset contains 180 archive-index mapping rows, 3 explicit review-depth rows, 17 explicit finding/disposition rows, and 5 explicit round/wave outcome rows. Sources are named in every row; README records that this is not a complete task census, causal comparison, reviewer-recall estimate, or complete round count.

Next step: Run protocol validation and record handoff evidence for this journal/tree.

Open: Review history does not support unsourced task-level depth labels or hidden-round totals; those claims were omitted or marked as policy-only.

Evidence:
- anchor: b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed, uncommitted changes present
- digest: sha256:86af032b26f2ded0078b3f70e57184d0e3cb49d7cf9c0d3e369af1eac48e1891 over 325 tracked and untracked files
- digest format: 4
- recorded: 2026-09-23T05:51:16.640Z by copilot-b516462b0e6f9a59
- entry hash format: 2
- entry: sha256:95e32e48404bd97455c97ea8c75274a50e2365fda0e2fbef6f2dfdee868c0077 of this entry without this block
- parent-entry: root
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 3s
- test-protocol.ps1: exit 0 in 282s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
