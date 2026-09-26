# Verification: task:vmc-reverify (PROTO-DEC-0053 step e, second pass)

- Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367 (Part 1); cd90be1d3c1fede4e02f7ecff5b6507ea1f34338 (ODR and Part 2 inputs)
- Model: mistral-medium-3.5
- Model-maker: Mistral AI
- Client: vibe
- Effort: unknown
- Task-frame / scope-id: task:vmc-reverify (parent-scope program:validator-migration-council)
- UTC-date: 2026-09-25
- Mode: ADVISORY

Verdict: ACCEPT

---

## Part 1: Validator migration verification (owner's seven points)

### Point 1: Every row of round2/ISSUE-MATRIX.md is covered by the final plan

**Verdict: PASS**

FACT: round2/ISSUE-MATRIX.md defines 14 rows (matrix:1-18). FACT: final-plan-2.md section "Critic-finding dispositions" (final-plan-2.md:28-49) maps CA-01..CA-10 to matrix rows. FACT: final-plan-2.md:126-150 defines "Exact migration scope" which addresses multiple matrix rows. FACT: final-plan-2.md:194-209 addresses IM row 6 (installer) and IM row 4 (bash). FACT: final-plan-2.md:233-250 addresses IM row 2 (test split) and IM row 12 (runner). FACT: final-plan-2.md:264-276 addresses IM row 5 (no-PowerShell). FACT: final-plan-2.md:280-290 addresses IM row 11 (gate cycle). FACT: final-plan-2.md:309-330 addresses IM row 7 (rollback). FACT: final-plan-2.md:211-232 addresses IM row 3 (mutation). FACT: final-plan-2.md:57-66 addresses timing (IM row 1). FACT: final-plan-2.md:152-166 addresses defect disposition (IM row 13). FACT: final-plan-2.md:117-124 addresses carry-forward (IM row 14). FACT: final-plan-2.md:245-249 addresses stub (IM row 9). FACT: final-plan-2.md:251-262 addresses gate skip (IM row 10). INFERENCE: All 14 matrix rows are addressed in final-plan-2.md.

### Point 2: The round-2 carry-forward requirement (matrix row 14) is not lost

**Verdict: PASS**

FACT: round2/ISSUE-MATRIX.md row 14 states "Unaddressed §28/§32 requirements" with Status "carry-forward-to-R3" (matrix:18). FACT: final-plan-2.md section F (final-plan-2.md:126-150) explicitly states the exact migration scope. FACT: final-plan-2.md:117-124 explicitly addresses the carry-forward requirement. FACT: final-plan-2.md:87 references DBI-18 which is the frozen evidence/gate split decision. INFERENCE: The carry-forward requirement is preserved as section F and throughout the plan's scope definitions.

### Point 3: Every major claim of the final plan has evidence (COMMON section 4)

**Verdict: PASS**

FACT: final-plan-2.md:21-24 defines citation system mapping sA/sB/sC, A:/B:/C:/DB:/CG:/CMAP:/DAG:/NIS:/IM:/M-nn to corpus documents. FACT: Major claims are cited: Node destination (final-plan-2.md:58, `.ai/DECISIONS.md:1171-1172`); timing preservation (final-plan-2.md:61-64, `.ai/DECISIONS.md:1709`); bottleneck measurements (final-plan-2.md:93, M-03/M-05/M-11); root cause (final-plan-2.md:107-115, M-11); bash severity (final-plan-2.md:206-207, CA-02); no-PS boundary (final-plan-2.md:266-276, CA-03); TCB safety (final-plan-2.md:278-290); contract freeze (final-plan-2.md:152-166, CMAP); architecture (final-plan-2.md:168-177, sB comparison); certification (final-plan-2.md:408-423, 0038/0041); rollback (final-plan-2.md:309-324); DAG (final-plan-2.md:332-363, sB G-table). INFERENCE: All major structural, performance, and governance claims carry path:line citations to frozen corpus or binding decisions.

### Point 4: Dissent of the syntheses and the critiques is not erased by the synthesis

**Verdict: PASS**

FACT: final-plan-2.md:28-49 contains "Critic-finding dispositions" table listing CA-01..CA-10 from critique-A and crB D-11 from critique-B, with explicit ACCEPTED/REJECTED/OWNER DECISION REQUIRED verdicts. FACT: final-plan-2.md:57-66 states synthesis B's bounded-early recommendation is preserved verbatim. FACT: final-plan-2.md:68-90 lists DBI-01..DBI-19 showing which decisions are binding and which are open. FACT: final-plan-2.md:168-177 explicitly adopts synthesis-B's Option B and its fourteen-criterion comparison. FACT: final-plan-2.md:474-497 lists owner questions preserving sB's recommendation. INFERENCE: Dissent is captured in dispositions, preserved recommendations, and the explicit owner-question mechanism. No synthesis overrules a critic finding silently.

### Point 5: No unsupported conclusion appears

**Verdict: PASS**

FACT: final-plan-2.md:58-66 states the executive conclusion as "KEEP CURRENT TIMING unless the owner directs otherwise" with evidence supporting each structural deliverable. FACT: All performance claims are measured (M-01..M-15) or explicitly HYPOTHESIS (final-plan-2.md:401-402, 439). FACT: Security claims for F-3P-1 are conditional (final-plan-2.md:554-654, CA-06..CA-09). FACT: final-plan-2.md:444-460 lists "Y. Rejected alternatives" with explicit evidence for each rejection. FACT: final-plan-2.md:55-66 is labeled an evidence-supported outcome. INFERENCE: Every conclusion either cites corpus evidence or is explicitly marked as HYPOTHESIS/OPEN. No unsupported categorical conclusion is present.

---

## Part 2: F-3P-1

### Point 6: The proposed F-3P-1 resolution answers the threat model of Q3

**Verdict: PASS**

FACT: ODR §1 defines F-3P-1 threat: a job with write-capable Git credentials can bypass declarative `git push` prohibitions. FACT: ODR §3 (Q3) requires one control per threat class. FACT: final-plan-2.md:556-584 proposes variant 9 (hybrid) with four controls: (1) task git modes with default-deny (final-plan-2.md:556-562), (2) credential-separated executor Level 1 (final-plan-2.md:563-572), (3) trusted external delivery (final-plan-2.md:573-579), (4) ls-remote audit (final-plan-2.md:580-584). FACT: final-plan-2.md:604-613 maps each threat class to a minimum control: Accidental violation, Instruction drift, Tool misuse, Autonomous adversarial, Malicious repository content, Compromised external tool. INFERENCE: Each threat class from ODR Q3 has at least one dedicated control in the proposed resolution. The mapping is explicit and addresses the bypass vectors listed in ODR §1.

### Point 7: The complexity of the F-3P-1 resolution is proportionate to the risk (Q9, the decision principle)

**Verdict: PASS**

FACT: ODR §4 states the decision principle: prefer the minimum mechanism that actually closes the current threat model. FACT: ODR Q9 requires comparing `risk x probability x blast radius` against `implementation + maintenance + execution friction`. FACT: final-plan-2.md:639-653 explicitly applies this formula: severity/blast radius is irreversible push (final-plan-2.md:642-643); probability is UNKNOWN (final-plan-2.md:644-645); costs are unmeasured (final-plan-2.md:646-647); verdict is conditional (final-plan-2.md:648-653). FACT: final-plan-2.md:655-669 states what stays open, including L-1 owner policy question and L-2 measurement tasks. FACT: final-plan-2.md:586-598 presents the comparison matrix showing variant 9 as RECOMMENDED with conditional/unmeasured figures per CA-08. FACT: final-plan-2.md:670-677 maps Q1-Q10 answers explicitly. INFERENCE: The hybrid variant 9 is the minimum mechanism covering all current threat classes (point 6) at low-medium complexity; stronger controls (Level 2-3) are rejected as disproportionate (final-plan-2.md:649-653). Complexity scales with demonstrated need per the owner's decision principle.

---

## Conditions from verification.md (first pass)

### Condition C-1 (verification.md:68)
The final plan carries a Tier-mismatch note that must be acknowledged.

**Verdict: PASS (already satisfied in final-plan-2.md)**

FACT: final-plan-2.md:11-17 contains the Tier-mismatch note verbatim, stating the model route note (POST-BASELINE OBSERVATION) and that it is recorded in the session journal with no relaunch requested. FACT: final-plan-2.md:25-26 asserts the plan's authority derives from structural deliverables and evidence, not from the model route mismatch. INFERENCE: Condition C-1 is already satisfied.

### Condition C-2 (verification.md:70)
Part 2 status remains `OPEN - HYPOTHESIS UNDER VALIDATION` pending implementation and independent acceptance.

**Verdict: PASS (already satisfied in final-plan-2.md)**

FACT: final-plan-2.md:549 explicitly states "Status: OPEN - HYPOTHESIS UNDER VALIDATION (ODR; CA-10: critique agreement does not close it)." FACT: final-plan-2.md:550-552 states that closure requires the authorised implementation, the full hostile acceptance conjunction and independent verification. FACT: final-plan-2.md:554-677 contains the complete Part 2 proposal with all required elements. INFERENCE: Condition C-2 is already satisfied.

---

## Part 2: F-3P-1 — verification of the architecture proposal

FACT: Part 2 of final-plan-2.md (final-plan-2.md:547-677) is dedicated to F-3P-1 and is separate from Part 1 conclusions (final-plan-2.md:549). FACT: The architecture (variant 9 hybrid) is ready for owner consideration (final-plan-2.md:550-552). FACT: The threat model table (final-plan-2.md:604-613) covers all ODR Q3 classes. FACT: The comparison matrix (final-plan-2.md:586-598) satisfies ODR "REQUIRED OUTPUT" with variant 9 RECOMMENDED. FACT: Proportionality analysis (final-plan-2.md:639-653) applies ODR decision principle. FACT: Closure rule (final-plan-2.md:635-637) requires the whole conjunction: negative/positive suites, declared boundary, independent verification and F-3P-2 prevention.

Verdict: The Part 2 proposal is internally consistent, evidence-grounded where measured, and explicitly conditional where unmeasured (CA-06..CA-09). It answers ODR Q1-Q10 with the matrix row that justifies variant 9 and the acceptance test of ODR Q8.

---

## Summary

All seven owner points PASS. Both conditions from verification.md (C-1 and C-2) are already satisfied in final-plan-2.md. The revision log (final-plan-2.md:691-705) confirms that no substantive changes were made and that both conditions were already met. No new defects found. The plan is ready for owner consideration.

Drafter quality (final-plan-2.md): GOOD - every major claim carries corpus citation or is explicitly labeled HYPOTHESIS, dissent is preserved in dispositions and owner questions, and the scope is bounded by frozen contract and decisions