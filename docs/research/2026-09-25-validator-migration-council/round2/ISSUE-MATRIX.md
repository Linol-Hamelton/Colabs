# ISSUE-MATRIX

| Id | Issue | Zone A | Zone B | Zone C | Challenges | Evidence cited | Status | Class of owner §4 |
|---|---|---|---|---|---|---|---|---|
| 1 | Migrate urgency / Timing | Mechanisms if porting; timing DBI-02 D | Bounded early migration, leaves timing to owner | Not strictly necessary now (test split/0071) | B & C challenge: destination is decided (A), only timing is open (D) | `round1/C-adversarial-simplifier.md:13-18`; `PROPOSAL:83-86` | challenged | D |
| 2 | Test splitting (latency) | UNKNOWN | Agrees split reduces tail, models ~94s | Test splitting collapses critical path | C challenged: test split is valid but doesn't replace mandated port | `MEASUREMENTS.md` M-11, M-04, `test-protocol.ps1:28-29` | confirmed | A |
| 3 | TCB Mechanism (Mutation) | Needed for NORMATIVE FAIL checks | Phase 2 includes mutation | UNKNOWN | A challenged: full mutation not proven necessary | `round1/A-contract-tcb.md:46`; DBI-08 | challenged | D |
| 4 | Bash absent severity | FAIL while wrappers present | Defers missing-PS outcome to A | DBI-25 open; 0019 tension | A challenged: bash absent FAIL tension with 0019 | `validate-protocol.ps1:237-243` | challenged | D |
| 5 | Missing PowerShell / No-PS Evidence | PASS + named WARNs | Non-green or fail-closed without approved rule | Warns of silent fail if checks skipped | A challenged: PASS+WARN reopens Evidence attestations | `protocol.yml:31-36`; `PROPOSAL:54-57` | evidence-conflict | D |
| 6 | Installer in validator | Keep invoke when PS present | Notes proposal incomplete; unmeasured | NOT-IN-SCOPE LATER | A challenged: retention lacking cost proof | `validate-protocol.ps1:1083-1100` | challenged | D |
| 7 | Rollback Granularity | Wrapper routes back; switch is one commit | Whole release, not wrapper-only | UNKNOWN | X-3 conflict: whole release vs wrapper-only | `.ai/bin/protocol-handoff.cjs:121` | challenged | D |
| 8 | Retirement Authority | Owner authority | New protected candidate, two certifiers | UNKNOWN | X-4 conflict noted | None | challenged | D |
| 9 | Fast-check stub | Keep the stub hook | Explicit fixture modes replace stub | UNKNOWN | X-6 contradiction noted | `tests/helpers.cjs:89-92` | challenged | D |
| 10 | Gate skip scope | Quick only | Quick and full both skip gate | UNKNOWN | X-1 contradiction: E-2 shows both skip | `.ai/bin/protocol-handoff.cjs:25-28,97` | evidence-conflict | A |
| 11 | Gate cycle | UNKNOWN | Gate callback kept at boundary | UNKNOWN | X-7 contradiction: port must decide collapse | `round1/VALIDATOR-CALL-GRAPH.md:95` | unresolved | D |
| 12 | Runner scope | UNKNOWN | Test runner and Node runner in D11 | Orchestration LATER | X-8 contradiction | `round1/NOT-IN-SCOPE.md:16-18` | challenged | D |
| 13 | Default disposition for D-1..D-6 | Default preserve defect | Needs exception ledger | UNKNOWN | OQ-4: explicitly decide preserve vs fix | `round1/VALIDATOR-CONTRACT-MAP.md:84-89` | unresolved | D |
| 14 | Unaddressed §28/§32 requirements | Pending | Pending | Pending | No round-1 report covers all requirements completely | None | carry-forward-to-R3 | UNKNOWN |
