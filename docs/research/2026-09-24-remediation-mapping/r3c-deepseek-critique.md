# Round-3 critique of CORE-ARCH-1 (DeepSeek, PROTO-DEC-0053 step (c))

- Author: DeepSeek, owner `deepseek-fdcb7c2e7af91ffb`, client Kilo. Model `deepseek/deepseek-flash`,
  effort `unknown` as launched (the control prompt asks for T3; recorded as launched, PROTO-DEC-0055 item 5).
- Date: 2026-09-24 (UTC). Baseline `4ded1bee1c2acf2392fdeededf50935f59138302`, tree dirty.
  Input: `docs/core-arch/CORE-ARCH-1.md`.
- Mode: ADVISORY. A critique is not a decision (PROTO-DEC-0052 item 4, PROTO-DEC-0053 item 2).
- Independence: I did not open `docs/research/2026-09-24-remediation-mapping/r3c-gemini-critique.md`
  before this file was written; it did not exist when I listed the directory.
- Method: every C, X and D cell of CORE-ARCH-1 sections 3.1 and 3.2 was checked against the synthesis
  the cell cites (CORE-ARCH-1:31-33). No other report's prose is quoted; each claim carries a
  `path:line` I opened. Labels: FACT (line opened), CLAIM (inference), HYPOTHESIS (prediction).

## 1. Check of the C/X/D marks in section 3.1 (H-01..H-21)

All 21 rows checked. Correct as marked: H-01 (footnote 1 verified against S-claude-20, S-codex-11,
S-deepseek-15), H-02's E/O/M cells, H-03, H-04..H-06, H-09's C/X/D, H-10, H-11, H-20, and the E/O/M
cells of H-12..H-19, H-21.

Findings (CLAIM unless a line is cited):

- **H-02, C cell (`—`, CORE-ARCH-1:65).** Claude's synthesis defers the L0 question explicitly:
  `rule-not-found (Q-L0)` sits in its deferral list (FACT r3-claude-synthesis.md:227). The same line
  justifies H-03's C `◐` (CORE-ARCH-1:88 footnote 2). If deferring Q-L0 touches H-03's stop rule, it
  touches the stop-rule half of H-02: `—` should be `◐`, or the matrix needs a stated rule that a
  deferral counts as touch only once per topic.
- **H-07, C and D cells (`—`, CORE-ARCH-1:70).** H-07 has two halves: not brand-bound, and assigned
  per task. Both syntheses propose scope-bound role assignment (FACT r3-claude-synthesis.md:22-28;
  r3-deepseek-synthesis.md:10, :13), which is the second half. `—` understates both cells; at least
  `◐`.
- **H-08, C and D cells (`◐`, CORE-ARCH-1:71).** The only direct statement of the session-line claim
  is Codex's (FACT r3-codex-synthesis.md:16). Neither C nor D states it; both discuss candidate-scoped
  exclusion instead (r3-claude-synthesis.md:26-28; r3-deepseek-synthesis.md:10). The two `◐` cells
  have no traceable supporting line. The итог `большинство` also needs an opposing source; there is
  none, and §2 reserves majority for two against one (CORE-ARCH-1:50).
- **Consolidation rule (CORE-ARCH-1:44-56 versus the итог column).** §2 defines three outcomes: full
  consensus (all who touched give `✔`), majority (two against one), single source. The matrix uses
  categories §2 never defines (`сильный`, `принято с переосмыслением`, `класс C`, `открыто`) and
  contradicts §2 in four rows: H-03 `полный` with C `◐` (:66); H-09 `полный` with E `◐` (:72);
  H-15 `сильный` and H-16 `сильный` although every source that touched them gives `✔` (:78, :79),
  which §2 calls full consensus. As written, the document's base rule is not the rule its matrix
  applies; H-15/H-16 should be `полный` or §2 must define "strong".

## 2. Check of the C/X/D marks in section 3.2 (R-01..R-19)

All 19 rows checked against the same three syntheses.

- R-01..R-11, R-13..R-15, R-17..R-19: every C, X and D mark matches the cited synthesis. Spot lines:
  roles syntax C `(scope)` / X `@` / D `(scope: id)` (r3-claude-synthesis.md:22-25,
  r3-codex-synthesis.md:23, r3-deepseek-synthesis.md:10); agreement window X 7 / D 8 / C около 12
  (r3-codex-synthesis.md:28, r3-deepseek-synthesis.md:16, r3-claude-synthesis.md:54-55); attempt-2
  states (r3-claude-synthesis.md:70-75, r3-codex-synthesis.md:42, r3-deepseek-synthesis.md:24);
  clean-tree answer (r3-codex-synthesis.md:54); locator (r3-codex-synthesis.md:59,
  r3-deepseek-synthesis.md:32); signals md/jsonl/md (r3-claude-synthesis.md:174,
  r3-codex-synthesis.md:102, r3-deepseek-synthesis.md:48).
- **R-16, verified at the source:** FACT `docs/decisions/REGISTRY.md:50` carries
  `DEC-0014 | superseded | PROTO-DEC-0022`; `.ai/DECISIONS.md:1025` carries `Supersedes: DEC-0014`
  and `:1056` closes it. C `✔` and X `✔` are right; D `✘` is the recorded dissent.
- **R-12, X cell (`✘`, CORE-ARCH-1:112).** Codex's own degree on the same issue is "agree with
  reservations", not opposition: it demands several signals and refuses CPU as a sole override
  (FACT r3-codex-synthesis.md:69), and calls a CPU-based exemption a future policy refinement
  (r3-codex-synthesis.md:84). `✘` overstates; `◐` matches the synthesis. The majority outcome and
  D's secondary-CPU resolution do not change.
- R-05 note: C and D both delete `protocol-verdict.cjs:731-732` (r3-claude-synthesis.md:61-65,
  r3-deepseek-synthesis.md:21); X adds collection tests (r3-codex-synthesis.md:36). `✔` on all three
  is correct.

## 3. Hypotheses of the three syntheses the matrices omit

None of these is a row of either matrix, although the consolidation cites its syntheses as its inputs:

- Per-client activity and resume adapters, including measured resume flags per client and the Kilo
  "no CLI" outcome (r3-deepseek-synthesis.md:37; r3-codex-synthesis.md:70-84).
- Wake and restart accounting: wakes stay in one ledger attempt; dispatcher exit alphabet 0/1/2
  (r3-claude-synthesis.md:145-147).
- Validator warning for reports over the line cap (r3-claude-synthesis.md:189).
- Requested versus observed model and effort logging, unavailable observation as `unknown`
  (r3-codex-synthesis.md:93).
- Byte-identical candidate package for both certifiers (r3-codex-synthesis.md:55).
- Frozen interface list before coding starts: `Task-id`, package field names, signal grammar,
  stop-rule first tokens, exit alphabet (r3-deepseek-synthesis.md:60).
- The agreement checker's home, a new managed script (r3-deepseek-synthesis.md:16); R-04 keeps the
  grammar but names no home.

Some are homed in later CORE-ARCH layers; the point is that the consolidation matrices, which claim
to carry what the syntheses converged on, do not carry them.

## 4. Agreement, in the fixed form of PROTO-DEC-0048 item 3

Agreement with claude on item 3.3-R-01: agree with reservations.
Justification: X's form fixes the syntax, but the resolution does not say where a scope id is minted
or how a new session is bound to an existing scope line (the proof H-08 needs); C and D carry that
binding (r3-claude-synthesis.md:22-28; r3-deepseek-synthesis.md:10, :13), and without it `scope` is
not deterministically evaluable.

Agreement with claude on item 3.3-R-06: agree with reservations.
Justification: `OWNER-EXCEPTION` at exit 0 closes a root cause while the defect may stand; the
resolution should carry the approving decision reference, forbid retry and open the audit record, as
D states (r3-deepseek-synthesis.md:24). CORE-ARCH-4:119-120 adds the reference; P-L0-001 steps 9 and
11 do not yet name it.

Agreement with claude on item 3.3-R-10: fully agree.

Agreement with claude on item 3.3-R-12: agree with reservations.
Justification: "extends the window at most once per wake and only while the child test output grows"
is new text combining X's objection (r3-codex-synthesis.md:69) and D's process sampling
(r3-deepseek-synthesis.md:40); neither synthesis defines "growing output", so the condition needs its
own test.

Agreement with claude on item 3.3-R-13: fully agree.

Agreement with claude on item 3.3-R-14: fully agree.

Agreement with claude on item 3.3-R-15: fully agree.

Agreement with claude on item 3.3-R-16: fully agree.
(Confirmed at the source: `docs/decisions/REGISTRY.md:50`, `.ai/DECISIONS.md:1025`, `:1056`.)

Agreement with claude on item 3.3-R-17: fully agree.

Agreement with claude on item 4.1: fully agree.

Agreement with claude on item 4.2: fully agree.

Agreement with claude on item 4.3: fully agree.

Agreement with claude on item 4.4: fully agree.

Agreement with claude on item 4.5: agree with reservations.
Justification: "one rule, one home" cannot be honoured by the plans as written; the shared-document
lock procedure (AGENTS.md:267-294) and the decision reopen-trigger rules (AGENTS.md:311-321) have no
planned record home anywhere in CORE-ARCH-2..7 (CORE-ARCH-7:52-60 lists only seven rules).

Agreement with claude on item 4.6: agree with reservations.
Justification: the pillar is intact, but its application rests on the transcription question in the
control report Part 2: whether Gemini's critique of the design draft is compatible with its certifier
slot is asserted in PROTO-DEC-0055 item 3 (`.ai/DECISIONS.md:2276`) and not yet confirmed by the
owner in those words.

Agreement with claude on item 4.7: fully agree.

Agreement with claude on item 4.8: agree with reservations.
Justification: P-L0-001 declares three back edges with budgets, but its own step-11 re-entry to step 1
has neither a budget nor a `back_edges` entry
(docs/core-arch/stage-1/P-L0-001-procedure-lifecycle.md:14, :106-109), so the pillar is not yet
applied to the record that carries it.

Agreement with claude on item 4.9: fully agree.

Agreement with claude on item 4.10: fully agree.

## 5. Result

Mark check: 40 rows (21 + 19) verified against the named syntheses; four finding clusters, all in
CORE-ARCH-1 or its footnotes, none in the 3.2 majority outcomes except R-12's X degree. The
consolidation's ten pillars stand for me except 4.5, 4.6 and 4.8 with the reservations above. The
matrices' omissions are listed in section 3. These findings transfer to the control report and the
findings ledger.
