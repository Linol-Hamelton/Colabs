# Round 2 challenge of zone A (contract / TCB)

- Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367
- Model: grok-4.5
- Model-maker: xAI
- Client: copilot (agent name `grok` per owner override; session agent `copilot`)
- Effort: high
- Task-frame / scope-id: task:vmc-r2-a (parent-scope program:validator-migration-council)
- UTC-date: 2026-09-25
- Mode: ADVISORY
- Target: zone A (`round1/A-contract-tcb.md` + companions)
- Owner override (chat, 2026-09-25): r2-a runs grok-4.5 / high (copilot, agent grok) instead of gpt-5.6-sol / max, same tier T6; recorded; no relaunch requested.
- Round-1 corpus: frozen at 5ace76c6ed76500740f22a7649c1cf9e535541b3.
- Independence: did not open any other `round2/` outputs before freezing this file.

Labels: FACT / INFERENCE / HYPOTHESIS / OPEN QUESTION. Citations are baseline `path:line` unless marked POST-BASELINE. Zone A states it proposes no target architecture (A-contract-tcb.md:12-14); challenged objects are its major constraint and design proposals.

---

## P1. TCB mechanism set (A-contract-tcb.md:19-56)

`A-contract-tcb.md:19-56`: PARTLY AGREE. Validator-in-TCB and dual-engine risk are evidenced; several "Needed: Yes" rows are stronger than binding authority.

1. Measured? PARTLY. TCB role FACT via handoff/gate (`protocol-handoff.cjs:25-28,94-107`; `validate-protocol.ps1:869-889`; CALL-GRAPH §2). Drift class FACT from cited 2026-09-20 reviews. No measurement proves each mechanism necessary vs optional.
2. Causal or correlated? Causal for "old alone is not correctness" (CONTRACT-MAP D-1..D-6). Correlated for "mutation is cheapest common-mode guard" (HYPOTHESIS at :46).
3. Necessary? Independent certification FACT-necessary (0038/0041). Differential FACT-necessary (0025 item 5). Golden/mutation/N-1/dual-on-real-tree are design claims (DECISION-BOUNDARY DBI-05/06/08 class D).
4. Simpler sufficient? Possibly: differential + independent expected results on defect/security classes + two certifiers, without full mutation matrix or permanent N-1. Zone C (`C-adversarial-simplifier.md:1-20`) argues test-split + 0071 for performance; that does not retire TCB needs if a port proceeds.
5. Settled by decision? Certification and differential: yes. Full mechanism inventory: no (DBI-08).
6. Reopens a decision? No if Node destination stays (DBI-01 A). Expanding to a second permanent engine fights 0039 item 3 end-state (A :52-53).
7. Semantic loss risk? Over-weighting old-as-oracle preserves D-1..D-6. Under-weighting golden fixtures loses defect-class pins.
8. Silent failure? Common-mode omission when fixtures never hit a check (A :46). Dual-run-only-at-phase-gates can miss per-fixture holes if mutation absent.
9. Diff verification sufficient? No alone; A correctly rejects parity-as-correctness; still must prove its larger set is minimum.
10. Shared incorrect assumption? Yes: both engines + fixtures from same CONTRACT-MAP reading could encode D-3/D-4/D-5.
11. Rollback possible? Mechanism docs reversible. Coupling to phase-6 deletion is the hard edge (P5).
12. Decomposition/integration risk? High if golden authors, mutation owners, and implementers split without one fixture authority (OPEN QUESTION A :55-56).
13. Owner asked what machines can settle? Expected-results authorship is partly 0041 procedure, partly staffing; apply §29 filter.
14. Model deciding for owner? Calling every row "Needed: Yes" is judgment beyond 0025/0038 text.
15. Falsify? Certified port where a dropped NORMATIVE check still passes differential+golden without mutation catching it; or a smaller set that still catches D-class defects.

Cross-zone: B (`B-performance-migration.md` §19 phase 2) adopts mutation/false-green; C does not require mutation. Unresolved here.

---

## P2. Differential design (A-contract-tcb.md:58-118)

`A-contract-tcb.md:58-118`: PARTLY AGREE. Full observable contract as compared object is FACT-strong; 12 fixture classes and normalisation allowlist are large and partly unprioritized.

1. Measured? Consumers of exit/tokens/Evidence FACT (CALL-GRAPH §4; M-01 240 lines). Fixture coverage gaps not measured.
2. Causal? Yes that CI/tests/Evidence parse contract (`protocol.yml:31-36`; tests). Normalisation choices are preventive design.
3. Necessary? Full 12-class matrix before any shadow run not proven; security/defect classes first is simpler staging.
4. Simpler? Start with CM FAIL/WARN branches + path/encoding/gate/installed; add Git-state/capability later. Mutation minimum list (:112-116) is broad.
5. Settled? Diff required (DBI-04 A). Design open (DBI-05 D).
6. Reopen? Normalising message text or counters would reopen de-facto CI contract; A forbids that (:99-105): good.
7. Lost semantics? Over-normalisation risk; under-normalisation yields locale-flaky FAIL (Sort-Object culture, A §6 #14).
8. Silent fail? Allowlist creep without review; EXPECTED copied from OLD (A warns :66-68).
9. Diff sufficient? Only with independent EXPECTED and mutation/false-green; sufficiency unproven until corpus exists.
10. Shared assumption? EXPECTED author reading only PS source shares blind spots (D-5 heading depth; D-4 extension list).
11. Rollback? Harness additive (A §5 phases 0-2): yes.
12. Integration risk? Three live parsers + Evidence line must stay bit-stable while harness evolves.
13. Owner-settleable by machine? Fixture taxonomy mostly yes; D-1..D-6 disposition needs explicit plan (A §7) if verdicts change.
14. Model-as-owner? Elevating ACCIDENTAL rows (CM-13/21/38) to NORMATIVE via fixtures freezes accidents.
15. Falsify? Zero unexplained diffs that still miss a production FAIL class; or normalisation hiding a real semantic change.

Cross-zone: B targets 0 unexplained mismatch under A's normalizer; C warns parity false confidence on same OS. Tension: multi-OS fixtures vs single-host MEASUREMENTS.

---

## P3. PowerShell boundary table (A-contract-tcb.md:120-149)

`A-contract-tcb.md:120-149`: PARTLY AGREE on move-pure-work / retain-native-parser; DISAGREE in part on bash-absent=FAIL absolute and on installer self-check as same class as parser without cost proof.

1. Measured? Parser/installer need PS FACT (CALL-GRAPH §5; `validate-protocol.ps1:237-245,1077-1102`). Per-check cost H (MEASUREMENTS reading; DBI-38).
2. Causal? Parser grammar dependence causal. Installer-in-validator coupling causal for false-green comment (:1086-1089) but not proven on critical path (M-07 mostly suite/installer tests).
3. Necessary? Retain PS parser subprocess: strong. Keep installer self-check inside validator forever: weaker (C NOT-IN-SCOPE installer LATER).
4. Simpler? Byte ASCII in Node (A #2) yes. Defer installer execution to install/upgrade tasks; validator checks presence+digest only.
5. Settled? DEC-0001 ASCII yes. No decision names parser retention (DBI-20 D).
6. Reopen? Silent drop of parser reopens protected-path completeness. Changing bash-absent FAIL may touch DEC-0003 hook expectations.
7. Lost semantics? JS Date rollover vs TryParseExact (A #8); .NET `\z`/`(?ms)` (A #9).
8. Silent fail? WARN "not run" on cloud while Windows users break (C cloud section); A requires named WARN not PASS (:152-154) but still softens gate.
9. Diff sufficient? Only with hermetic missing-PS and invalid-.ps1 fixtures (B no-PS row).
10. Shared assumption? Both engines skip parser when PS missing → common green-without-syntax.
11. Rollback? Boundary policy reversible until wrapper defaults flip.
12. Integration? record always spawns PS today (`protocol-handoff.cjs:89-105`); Node path must not invent skip flags.
13. Owner? Cloud mandatory-check set is policy (DBI-24 D) if trade-offs remain.
14. Model-as-owner? Asserting bash-absent must stay FAIL while PROTO-DEC-0019 any-assistant can work without Claude hooks is contested (DBI-25).
15. Falsify? Host without bash and without `.claude/hooks/*.sh` still FAILs; or Node parser substitute with zero false negatives on suite PS corpus.

Cross-zone: C keeps PS syntax subprocess (agree A #1). B defers missing-PS outcome to A. C marks installer LATER; A keeps invoke-when-PS-present.

---

## P4. Environment matrix (A-contract-tcb.md:151-165)

`A-contract-tcb.md:151-165`: AGREE on WARN≠PASS and exit 0/1 only; PARTLY AGREE that PASS-with-named-WARNs is an acceptable Evidence end-state for cloud.

1. Measured? Windows PS5.1 positive path FACT (CONTRACT-MAP header probe). Cloud no-PS evidenced mainly via proposal quote (DBI-24; H-3).
2. Causal? spawn ENOENT blocks record today — causal pressure, n small.
3. Necessary? Degradation rules necessary if cloud Evidence is a goal; not if cloud stays non-certifying.
4. Simpler? Keep full Evidence Windows-only until parser/installer policy closed (B OPEN QUESTION handoff).
5. Settled? BLOCKED not a validator exit: FACT aligned CM-47 / 0041 item 3.
6. Reopen? Treating WARN-only cloud record as equal to full Windows record reopens what Evidence attests without text saying so.
7. Lost? Case-sensitive paths; reparse absence (cloud row).
8. Silent fail? CI fails on WARN (`protocol.yml:33`) vs agents checking only exit 0.
9. Diff sufficient? Need paired fixtures per environment row, not one Linux-normalized golden.
10. Shared assumption? "Named WARN is honest" while product still breaks on Windows.
11. Rollback? Policy-only; yes.
12. Integration? installed vs source differ (CM-07); matrix under-specifies installed cloud.
13. Owner? Whether cloud Evidence is first-class is policy if architectures differ.
14. Model-as-owner? Declaring PASS-with-WARNs sufficient without owner cloud policy.
15. Falsify? Cloud PASS+WARN accepted then invalid `.ps1` breaks Windows CI; or WARN text unstable across hosts.

---

## P5. Rollback design (A-contract-tcb.md:167-186)

`A-contract-tcb.md:167-186`: AGREE on interface freeze and late deletion authority; PARTLY AGREE on phase labels borrowed without A owning architecture.

1. Measured? Tag `v1.9.5` / manifest 1.9.6 FACT (A :171-172). Receipt engine-independence INFERENCE if Evidence line format holds (`protocol-handoff.cjs:62-87`).
2. Causal? Public command rename breaks docs/CI (CALL-GRAPH §1).
3. Necessary? Keep PS in-tree until observation: yes for 0025. Phase numbering as stated: convenience.
4. Simpler? Two anchors only: pre-switch release tag; pre-deletion tag.
5. Settled? Receipt formats frozen 0039 item 3. Rollback plan itself DBI-37 D.
6. Reopen? Deleting PS before observation reopens oracle requirement.
7. Lost? Installer self-check last-line FAIL text if wrapper changes shell identity (A §6 #15).
8. Silent fail? New additive Evidence fields old `verify` ignores but humans treat as required.
9. Diff sufficient? Rollback drill must re-run old path on same fixtures, not only git revert claim.
10. Shared assumption? "Digest engine-independent" assumes snapshot code unchanged during handoff split (DBI-19 C open).
11. Rollback possible? Phases 0-5 mostly yes; phase 6 least — A correct. Wrapper-only downgrade insufficient if modules removed (B phase 4).
12. Integration? record/wrapper switch is one branch (A :176) — concentrated risk.
13. Owner? Phase 6 deletion authority yes. Timing DBI-02/42 separate.
14. Model-as-owner? Naming phase 6 gates without owner-approved plan.
15. Falsify? Revert leaves green suite but broken installed digest; or verify fails on new-engine receipts after rollback.

Cross-zone: B phase table more operational; A supplies anchors. Compatible if merged; conflict if criteria diverge.

---

## P6. Decision-boundary map (DECISION-BOUNDARY.md DBI-01..43)

`DECISION-BOUNDARY.md:22-90`: AGREE overall; PARTLY AGREE on edge classes.

1. Measured? Decision citations FACT-checkable at baseline.
2. Causal? G-2 explains undated timing — causal reading of two accepted blocks.
3. Necessary? Class exercise necessary per owner §4 before architecture.
4. Simpler? n/a — this is the simpler prerequisite.
5. Settled? DBI-01 Node A matches 0025/0039; B also treats Node destination closed.
6. Reopen? Misclassifying DBI-02 as A would fake timing authority — A correctly keeps D/F (DBI-42).
7. Lost? Treating PROPOSAL as authority — A avoids (COMMON §6).
8. Silent fail? Forgetting research outputs are not decisions in R3.
9. Diff n/a.
10. Shared assumption? README vs launch G-1 owner-resolved; r2-a override is parallel (this header).
11. Rollback n/a.
12. Integration n/a for docs.
13. Owner questions deferred to filter correctly.
14. Risk: DBI-08 mandatory+open bundle invites overclaim (A notes split).
15. Falsify? Binding quote that Node is not decided; or pilot gate already satisfied so DBI-02 collapses — neither shown.

Cross-zone: B aligns F for early timing. C questions need-now — consistent with DBI-02 open; A does not claim mechanisms imply migrate-now.

---

## P7. Contract map and defects (VALIDATOR-CONTRACT-MAP.md)

`VALIDATOR-CONTRACT-MAP.md` CM-01..49 and D-1..D-6; A §7: PARTLY AGREE. Map is right artifact; confound flags load-bearing; disposition ledger incomplete.

1. Measured? Positive/CRLF probe FACT in map header (not in MEASUREMENTS.md).
2. Causal? CM-35 evaluation order load-bearing if reordered.
3. Necessary? Behaviour-complete target (A §7) necessary for port; fixing D-* needs explicit ledger.
4. Simpler? Freeze map; default preserve defect unless dual-engine fix accepted.
5. Settled? Many CM NORMATIVE via tests/DEC; D-2 floors conflict — open (DBI-23).
6. Reopen? Fixing D-3 `..` substring changes safe-path in PS and Node together.
7. Lost? CM-38 ACCIDENTAL citation regex if "fixed" opportunistically.
8. Silent fail? D-1: no `[FAIL]` line but exit 1 — greppers see clean.
9. Diff sufficient? Only if crash fixtures excluded or pinned (confound column).
10. Shared assumption? Both engines reimplement D-3 mirror (`protocol-handoff.cjs:893`) — shared bug.
11. Rollback? Defect-preserve is safest story.
12. Integration? D-6 silent skip installed missing file — installer/validator pair.
13. Owner? Node floor D-2 may be delegated once stated; D-3 may be owner if review paths change.
14. Model-as-owner? Relabeling ACCIDENTAL→NORMATIVE without consumer proof.
15. Falsify? Dual-engine green while D-1 ACL path invisible to token parsers; or floor change breaks installed hosts (H-6).

Cross-zone: B demands exception ledger in phase 0; C focuses silent drop of Windows FS semantics — complementary.

---

## P8. Hidden semantic dependencies (A-contract-tcb.md:188-220)

`A-contract-tcb.md:188-220`: AGREE as inventory; PARTLY AGREE that all 18 are equal blockers.

1. Measured? Several FACT with paths (SKIP_GATE, Evidence line, FAST_CHECKS, HEAD: WARN). Culture ordering H-5.
2. Causal? #2 SKIP_GATE handshake causal deadlock-breaker (0032 item 8).
3. Necessary? Freeze output tokens, SKIP_GATE, Evidence line, exit codes: yes. #15 running-shell installer identity: narrower.
4. Simpler? Rank P0 contract vs P1 internal couplings for DAG.
5. Settled? Evidence format A (DBI-18).
6. Reopen? Changing summary grammar without authority.
7. Lost? `-Quiet` PASS suppression (#18).
8. Silent fail? #6 FAST_CHECKS stub ignored → suite cost doubles (not silent wrong).
9. Diff n/a directly; feeds fixture design.
10. Shared assumption? Line-count shared with archive by comment only (#9).
11. Rollback? Depends on caller switches.
12. Integration? Highest: gate-check last-line parse (#3) + handoff cycle (CALL-GRAPH §8).
13. Owner? n/a for inventory.
14. Model-as-owner? n/a if left as inventory.
15. Falsify? Port green while PROTOCOL_TEST_POWERSHELL path broken; or journal Agent-line WARN semantics change unnoticed.

---

## Global contradictions (cite only; do not resolve)

| Topic | A | Other |
|---|---|---|
| Migrate urgency | Mechanisms if porting; timing DBI-02 D | C: not strictly necessary now (test split/0071) |
| Installer in validator | Keep invoke when PS present | C NOT-IN-SCOPE LATER; B notes proposal incomplete |
| Bash absent | FAIL while wrappers present | DBI-25 open; 0019 any-assistant tension |
| Mutation | Needed for NORMATIVE FAIL checks | C silent; B phase-2 includes |
| No-PS Evidence | PASS + named WARNs | B: not assumed certifiable until A/owner policy |

## OPEN QUESTIONS (written, not asked)

- OQ-1: Minimum TCB subset if mutation budget is cut (P1/P2).
- OQ-2: Cloud Evidence first-class vs Windows-only full attestations (P4).
- OQ-3: Independent EXPECTED authorship staffing under 0041 (A :55-56).
- OQ-4: Default disposition preserve vs fix for each D-1..D-6 (P7).
- OQ-5: Bash-absent severity when Claude hooks absent (P3/DBI-25).

## Challenge summary

Zone A is strongest as contract/TCB evidence map and weakest where "Needed: Yes" outruns decisions or measurements (full mutation, PASS-with-WARN cloud sufficiency, installer self-check retention, bash FAIL absolute). Do not treat A as architecture; do not treat its mechanism inventory as certified scope. Round-3 must keep DBI-02 timing open and fuse A contract freeze with B phasing and C simplicity falsifiers.
