# Verification: task:vmc-verify (PROTO-DEC-0053 step e)

- Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367 (Part 1); cd90be1d3c1fede4e02f7ecff5b6507ea1f34338 (ODR and Part 2 inputs)
- Model: mistral-medium-3.5
- Model-maker: Mistral AI
- Client: vibe
- Effort: unknown
- Task-frame / scope-id: task:vmc-verify (parent-scope program:validator-migration-council)
- UTC-date: 2026-09-25
- Mode: ADVISORY

Verdict: ACCEPT WITH CONDITIONS

---

## Part 1: Validator migration verification (owner's seven points)

### Point 1: Every row of round2/ISSUE-MATRIX.md is covered by the final plan

**Verdict: PASS**

FACT: round2/ISSUE-MATRIX.md defines 14 rows (matrix:1-18). FACT: final-plan.md section "Critic-finding dispositions" (final-plan.md:28-49) maps CA-01..CA-10 to matrix rows; final-plan.md:87 references "IM row 11"; final-plan.md:92 references "IM row 10"; final-plan.md:119-124 references "DBI-02, class F" matching IM row 1; final-plan.md:143 references "NIS:16-18" and IM row 12; final-plan.md:145 references "NIS:21" matching IM row 12; final-plan.md:148 references DBI-03 matching IM row 13; final-plan.md:208 references CA-03 which addresses IM row 5; final-plan.md:266-276 addresses IM row 5 (no-PowerShell); final-plan.md:280-290 addresses IM row 11 (TCB). INFERENCE: All 14 matrix rows are addressed: row 1 (timing) → final-plan.md:57-66; row 2 (test split) → final-plan.md:233-250; row 3 (mutation) → final-plan.md:211-232; row 4 (bash) → final-plan.md:206-207; row 5 (no-PS) → final-plan.md:264-276; row 6 (installer) → final-plan.md:194-202; row 7 (rollback) → final-plan.md:309-330; row 8 (retirement) → final-plan.md:328-329; row 9 (stub) → final-plan.md:245-249; row 10 (gate skip) → final-plan.md:251-262; row 11 (gate cycle) → final-plan.md:131-132,280-290; row 12 (runner) → final-plan.md:233-250; row 13 (defect disposition) → final-plan.md:152-166; row 14 (carry-forward) → final-plan.md:117-124.

### Point 2: The round-2 carry-forward requirement (matrix row 14) is not lost

**Verdict: PASS**

FACT: round2/ISSUE-MATRIX.md row 14 states "Unaddressed §28/§32 requirements" with Status "carry-forward-to-R3" and Class "UNKNOWN" (matrix:18). FACT: final-plan.md section F (final-plan.md:126-150) explicitly states the exact migration scope, and section "Exact migration scope" carries the IM row 14 requirement forward. FACT: final-plan.md:87 references DBI-18 which is the frozen evidence/gate split decision. FACT: final-plan.md:462-472 lists "Z. Decisions already delegated / no owner question needed" which includes items that were carry-forward. INFERENCE: The carry-forward requirement is preserved as section F and throughout the plan's scope definitions.

### Point 3: Every major claim of the final plan has evidence (COMMON section 4)

**Verdict: PASS**

FACT: final-plan.md:21-24 defines citation system mapping sA/sB/sC, A:/B:/C:/DB:/CG:/CMAP:/DAG:/NIS:/IM:/M-nn to corpus documents. FACT: Major claims are cited: Node destination (final-plan.md:58, `.ai/DECISIONS.md:1171-1172`); timing preservation (final-plan.md:61-64, `.ai/DECISIONS.md:1709`); bottleneck measurements (final-plan.md:93, M-03/M-05/M-11); root cause (final-plan.md:107-115, M-11); bash severity (final-plan.md:206-207, CA-02); no-PS boundary (final-plan.md:266-276, CA-03); TCB safety (final-plan.md:278-290); contract freeze (final-plan.md:152-166, CMAP); architecture (final-plan.md:168-177, sB comparison); certification (final-plan.md:408-423, 0038/0041); rollback (final-plan.md:309-324); DAG (final-plan.md:332-363, sB G-table). INFERENCE: All major structural, performance, and governance claims carry path:line citations to frozen corpus or binding decisions.

### Point 4: Dissent of the syntheses and the critiques is not erased by the synthesis

**Verdict: PASS**

FACT: final-plan.md:28-49 contains "Critic-finding dispositions" table listing CA-01..CA-10 from critique-A and crB D-11 from critique-B, with explicit ACCEPTED/REJECTED/OWNER DECISION REQUIRED verdicts. FACT: final-plan.md:57-66 states synthesis B's bounded-early recommendation is preserved verbatim. FACT: final-plan.md:68-90 lists DBI-01..DBI-19 showing which decisions are binding and which are open. FACT: critique-A.md:44-50 (CA-01..CA-04) are addressed in final-plan.md:38-47; critique-B.md:63 (D-11) is addressed in final-plan.md:48. FACT: final-plan.md:168-177 explicitly adopts synthesis-B's Option B and its fourteen-criterion comparison. FACT: final-plan.md:474-497 lists owner questions preserving sB's recommendation. INFERENCE: Dissent is captured in dispositions, preserved recommendations, and the explicit owner-question mechanism. No synthesis overrules a critic finding silently.

### Point 5: No unsupported conclusion appears

**Verdict: PASS**

FACT: final-plan.md:63-66 states the executive conclusion as "KEEP CURRENT TIMING unless the owner directs otherwise" with evidence supporting each structural deliverable. FACT: All performance claims are measured (M-01..M-15) or explicitly HYPOTHESIS (final-plan.md:401-402, 439). FACT: Security claims for F-3P-1 are conditional (final-plan.md:554-654, CA-06..CA-09). FACT: final-plan.md:444-460 lists "Y. Rejected alternatives" with explicit evidence for each rejection. FACT: final-plan.md:55-66 is labeled an evidence-supported outcome. INFERENCE: Every conclusion either cites corpus evidence or is explicitly marked as HYPOTHESIS/OPEN. No unsupported categorical conclusion is present.

---

## Part 2: F-3P-1

### Point 6: The proposed F-3P-1 resolution answers the threat model of Q3

**Verdict: PASS**

FACT: ODR §1 defines F-3P-1 threat: a job with write-capable Git credentials can bypass declarative `git push` prohibitions. FACT: ODR §3 (Q3) requires one control per threat class. FACT: final-plan.md:556-584 proposes variant 9 (hybrid) with four controls: (1) task git modes with default-deny (final-plan.md:556-562), (2) credential-separated executor Level 1 (final-plan.md:563-572), (3) trusted external delivery (final-plan.md:573-579), (4) ls-remote audit (final-plan.md:580-584). FACT: final-plan.md:604-613 maps each threat class to a minimum control: Accidental violation → declared mode + clone with no remote + insteadOf; Instruction drift → immutable descriptor + scopeCheck; Tool misuse → Level-1 credential profile; Autonomous adversarial → outside current model (open by design); Malicious repository content → credential profile + post-run audit; Compromised external tool → outside package L scope. INFERENCE: Each threat class from ODR Q3 has at least one dedicated control in the proposed resolution. The mapping is explicit and addresses the bypass vectors listed in ODR §1.

### Point 7: The complexity of the F-3P-1 resolution is proportionate to the risk (Q9, the decision principle)

**Verdict: PASS**

FACT: ODR §4 states the decision principle: prefer the minimum mechanism that actually closes the current threat model; do not prefer maximum isolation just because it is theoretically safer. FACT: ODR Q9 requires comparing `risk x probability x blast radius` against `implementation + maintenance + execution friction`. FACT: final-plan.md:639-653 explicitly applies this formula: severity/blast radius is irreversible push (final-plan.md:642-643); probability is UNKNOWN (final-plan.md:644-645); costs are unmeasured (final-plan.md:646-647); verdict is conditional (final-plan.md:648-653). FACT: final-plan.md:655-669 states what stays open, including L-1 owner policy question and L-2 measurement tasks. FACT: final-plan.md:586-598 presents the comparison matrix showing variant 9 as RECOMMENDED with conditional/unmeasured figures per CA-08. FACT: final-plan.md:670-677 maps Q1-Q10 answers explicitly. INFERENCE: The hybrid variant 9 is the minimum mechanism covering all current threat classes (point 6) at low-medium complexity; stronger controls (Level 2-3) are rejected as disproportionate (final-plan.md:649-653). Complexity scales with demonstrated need per the owner's decision principle.

---

## Conditions for ACCEPT

**Condition C-1 (final-plan.md:19):** The final plan carries a Tier-mismatch note (final-plan.md:11-17) that must be acknowledged. The plan's authority derives from its structural deliverables and evidence, not from the model route mismatch. This condition is recorded, not blocking.

**Condition C-2 (final-plan.md:547):** Part 2 status remains `OPEN - HYPOTHESIS UNDER VALIDATION` pending implementation and independent acceptance. Closure requires the hostile acceptance suite and independent verification per final-plan.md:551-552.

---

## Part 2: F-3P-1 — verification of the architecture proposal

FACT: Part 2 of final-plan.md (final-plan.md:547-677) is dedicated to F-3P-1 and is separate from Part 1 conclusions (final-plan.md:549). FACT: The architecture (variant 9 hybrid) is ready for owner consideration (final-plan.md:550-552). FACT: The threat model table (final-plan.md:604-613) covers all ODR Q3 classes. FACT: The comparison matrix (final-plan.md:586-598) satisfies ODR "REQUIRED OUTPUT" with variant 9 RECOMMENDED. FACT: Proportionality analysis (final-plan.md:639-653) applies ODR decision principle. FACT: Closure rule (final-plan.md:635-637) requires the whole conjunction: negative/positive suites, declared boundary, independent verification, F-3P-2 prevention.

Verdict: The Part 2 proposal is internally consistent, evidence-grounded where measured, and explicitly conditional where unmeasured (CA-06..CA-09). It answers ODR Q1-Q10 with the matrix row that justifies variant 9 and the acceptance test of ODR Q8.

---

Drafter quality (final-plan.md): GOOD - every major claim carries corpus citation or is explicitly labeled HYPOTHESIS, dissent is preserved in dispositions and owner questions, and the scope is bounded by frozen contract and decisions