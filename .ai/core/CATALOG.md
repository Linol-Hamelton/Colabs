# CATALOG

Derived by `node .ai/bin/protocol-core.cjs catalog`; never edit by hand. Loading levels: exists and summary (procedure.schema.md section 4).

## Sources

- sha256:944858690f7e9fa4c3e236a30634b734162cdade069fb83b101c0e2b0258d4ef  .ai/core/L0-ROOT.md
- sha256:1bca4978c9128b93b488c81598d54f534ae06d578239d2fccf526cbf726a4ee0  .ai/core/L0-meta/P-L0-001-procedure-lifecycle.md
- sha256:3ea1cb08bdcf3c9277c5aefc462049e4fbfdfccf2c4c3ef71d92a49dd55662f9  .ai/core/L0-meta/P-L0-002-stop-and-ask.md
- sha256:fadfa73b8a76064101339bba6d85c1fa05d13a1b9831b3e6ce9456dbcd337849  .ai/core/L0-meta/P-L0-003-source-conflict.md
- sha256:ccbcf1587c835dbd4a1b552c6aa756f10987b1ae33fc5d027b0d9f5f936b92e3  .ai/core/L0-meta/P-L0-004-layer-consistency.md
- sha256:70abbab08d62bae5b79576a3f74d010eb1796e03c69185446b15fd8bf32c862a  .ai/core/L0-meta/P-L0-005-decision-change.md
- sha256:03bf5354b92d7ef92cce13ee87ecfffdf2b4f07f38432f680aaef5e96485904a  .ai/core/L0-meta/P-L0-006-retire-or-improve-candidates.md
- sha256:2f831815b9d5d8dfd0d6445041015167796c8fcecbf09d16a799fbc7b2bf7588  .ai/core/L0-meta/P-L0-007-comparative-test.md
- sha256:6a63a52d0fa43b5ffa8091ba47e2bd88160e40d8c6dbdeb9ecdf2838d0703361  .ai/core/L0-meta/P-L0-008-research-governor.md
- sha256:1a871d399be6977405c73497dd031ef7f4177e5b9dbd167a8ebbb6a61ded54ea  .ai/core/schema/procedure.schema.md

## Records

| id | version | layer | type | status | roles | stages | triggers | title |
|---|---|---|---|---|---|---|---|---|
| P-L0-000 | 0.7 | L0 | invariant | active | all | any | session-start | Kernel root - why the kernel exists, its invariants, and how everything else is found |
| P-L0-001 | 0.6 | L0 | procedure | active | procedure-author, reviewer, coordinator | any | signal:procedure-gap, signal:fall, signal:script-candidate, owner-directive, research-consensus, incident | Procedure lifecycle - how a kernel procedure is created, changed and retired |
| P-L0-002 | 0.5 | L0 | procedure | active | all | any | rule-not-found, source-conflict, tool-blocked, scope-exceeded, budget-exhausted, premise-wrong | Stop and ask when a rule is missing, conflicting or blocked |
| P-L0-003 | 0.3 | L0 | procedure | active | all | any | source-conflict | Resolve a conflict between two sources of truth |
| P-L0-004 | 0.5 | L0 | procedure | active | procedure-author, reviewer | any | stage-exit, package-freeze | Layer consistency check before a layer lands or the next layer starts |
| P-L0-005 | 0.2 | L0 | procedure | active | all | any | owner-directive, owner-approval, reopen-trigger | Record, supersede and reopen decisions |
| P-L0-006 | 0.2 | L0 | procedure | active | coordinator, reviewer | any | signal:procedure-gap, signal:fall, review-finding, stop-question, trial-kill, source-conflict, owner-directive | Find candidates to improve or retire a kernel record |
| P-L0-007 | 0.3 | L0 | procedure | active | coordinator, implementer, reviewer | any | retirement-candidate, program-exit, owner-directive | Comparative test of kernel variants - A/B for a retirement candidate, A/B/C for the whole kernel |
| P-L0-008 | 0.5 | L0 | procedure | trial | all | any | frame-open, frame-round, frame-gate, frame-close, frame-closure, owner-directive | Research governor - every frame ends in a decision; new research is not an output |
| SCHEMA-procedure | 0.7 | L0 | schema | active |  |  |  | Shape of every kernel record: front matter, body sections, loading levels |
