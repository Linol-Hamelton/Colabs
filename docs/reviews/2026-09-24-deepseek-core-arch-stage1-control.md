# Control report - CORE-ARCH stage 1 (DeepSeek, controller and reviewer)

- Reviewed commit SHA: `4ded1bee1c2acf2392fdeededf50935f59138302` (`git rev-parse HEAD`, re-checked after
  writing; no commit or push was made).
- Working tree: dirty (expected: session journals, untracked program files and drafts).
- Reviewer: DeepSeek, owner `deepseek-fdcb7c2e7af91ffb`; client Kilo (VS Code); model
  `deepseek/deepseek-flash`; reasoning effort `unknown` as launched. The control prompt requests tier T3
  (strongest DeepSeek model, highest effort); the launch line is recorded in my journal as launched
  (PROTO-DEC-0055 item 5) and the mismatch is reported to the owner, not treated as a defect of the drafts.
- Date: 2026-09-24 (UTC). Scope: Part 2 (transcription check), Part 3 (adversarial review of the stage-1
  drafts, nine angles), Part 4 (stage control). Part 1 is the separate critique file.
- Mode: ADVISORY (PROTO-DEC-0055 item 3: as controller I certify nothing).
- **Verdict: FAIL.** The drafts' structure is sound, but there are mandatory defects: the root does not
  pass the schema it is supposed to obey, the minor-version short path lets an agent activate changed
  binding text without the owner, evidence citations mispoint, four AGENTS.md rules lose their home in
  the plans, and Package I's composition contradicts the stage graph. Every claim below carries an exact
  line; the ledger carries one reproduction row per finding.
- Commands run: `git rev-parse --show-toplevel`, `git rev-parse HEAD`, `git status --short --branch`,
  `git log --oneline -10`, `node .ai/bin/protocol-session.cjs start --agent deepseek`, `Get-Item` /
  `Get-ChildItem` (sizes, counts), `Get-Content` line checks, `Select-String` over DECISIONS, REGISTRY,
  the syntheses and PROCEDURE-MAP, `git -C D:\Colabs-backup-2026-09-24-pre-core-arch rev-parse HEAD`,
  one `webfetch` of the graphmemory `architecture.md` URL, and the protocol validator via
  `protocol-handoff.cjs record` at the end.
- Related files: `docs/research/2026-09-24-remediation-mapping/r3c-deepseek-critique.md`;
  `docs/reviews/2026-09-24-core-arch-stage1-findings.md`.

## Part 2 - Transcription check (PROTO-DEC-0054, PROTO-DEC-0055)

Method: compare each block against the owner words quoted in its `Approved by` line and against the
limits it claims to preserve. Labels as in the critique.

1. FACT: the backup of PROTO-DEC-0054 item 6 exists and is at the named HEAD: `Test-Path
   D:\Colabs-backup-2026-09-24-pre-core-arch` is true and `git -C ... rev-parse HEAD` prints
   `4ded1be`. The owner's "возможно сделать резервную копию" is recorded as done; the record is accurate.
2. PROTO-DEC-0054 items 2, 3 and 6 map onto quoted words. Item 1's program framing and file naming
   (`CORE-ARCH-<n>.md`) are not in the quotes; they rest on the unquoted Context paraphrase
   (`.ai/DECISIONS.md:2240` versus `:2259`). Item 4's sequencing, review before the stage is presented
   to the owner, is also an addition. CLAIM: both are reasonable readings of "first stage" and "run the
   kernel work as code", but as transcription they are unverified. RECOMMENDATION: if the owner's
   program sentence is available, append it to the provenance; otherwise leave as paraphrase.
3. No standing limit is dropped in PROTO-DEC-0054 beyond the two suspensions the owner named: the
   two-stream cap and one-coordinator limit of PROTO-DEC-0048 item 7 stand (`.ai/DECISIONS.md:2245`),
   the product hold stands, and 0030/0038/0041/0034/0036/0045 are preserved (`:2247`). FACT: the
   brand-per-line practice and the DeepSeek/Gemini stream naming are suspended only for CORE-ARCH.
4. **Does PROTO-DEC-0055 item 2 read more into the owner's answer to question 3 than it says?** Yes, in
   one respect. The quoted answer names the second critic (`.ai/DECISIONS.md:2289`, "вторую критику дает
   Gemini"). The block additionally declares `CORE-ARCH-1.md` to be step (b) of PROTO-DEC-0053
   (`:2275`), and the draft itself records "В-3 — засчитано" (`docs/core-arch/CORE-ARCH-1.md:287`).
   Question В-3 asked two things: whether to count the draft as step (b), and who criticises it if Codex
   is unavailable. The owner answered the second; the first is inferred, though naming a critic for a
   text implies treating it as the draft. RECOMMENDATION: a one-line owner confirmation, or a provenance
   note recording the inference.
5. **Does PROTO-DEC-0055 item 3 keep Gemini independent of any candidate it would certify?** In the
   letter of PROTO-DEC-0041 item 1, yes: Gemini is not the author, executor or controller of a kernel
   candidate, is not the step (d) fixer and edits no program candidate (`:2276`). Residual, reported for
   the owner: the fixer must answer every point of Gemini's critique (PROTO-DEC-0053 item 1(d),
   `.ai/DECISIONS.md:2215`), so accepted critique points become design content that the certified
   candidates implement. The closest precedent went the other way: the author of a specification was
   excluded from certifying the candidate that implemented it (PROTO-DEC-0046 item 6, `:1949`).
   RECOMMENDATION: record the owner's explicit acknowledgment that a design critique is neither
   authorship nor control for this cycle, or require the final plan to mark which critique points were
   adopted and from whom, so certifiers can see what Gemini contributed.
6. PROTO-DEC-0055 item 5 adds one rule beyond the quote: a session may not switch models, and a mismatch
   is reported for a relaunch (`:2278`). The quoted words name launch-time selection only. The addition
   is consistent with the non-interactive clients and with this launch; flag it as interpretation.
7. No standing limit is dropped in PROTO-DEC-0055: item 2 keeps PROTO-DEC-0053's independence and fixed
   agreement form, item 3 keeps 0041 item 2 and 0047 item 1 for replacements, item 4 keeps the
   base-layer status of L0. The "Codex's limits are exhausted" reason in item 2 is not in the quoted
   words but is recorded in `.ai/TASK.md:67`.

## Part 3 - Adversarial review of the stage-1 drafts (nine angles, each with a verdict)

### 1. Self-application - FAIL

- L0-ROOT.md:1-12 lacks required front-matter keys: `triggers`, `inputs`, `outputs`, `back_edges`,
  `enforcement`, `script_candidate` (procedure.schema.md:52-59 marks each `yes`), and declares
  `evidence_class: [A, B]` without `cost_basis`, which procedure.schema.md:139-140 makes exit 1.
- Its body has no `Purpose`, `Rules` or `Evidence` heading (headings at L0-ROOT.md:19, :26, :34, :58,
  :75, :94, :99); procedure.schema.md:89 requires those four for an invariant. `lint` as specified
  rejects the root.
- procedure.schema.md is not self-applicable either: it carries `evidence_class: [B, C]` (:8) without
  `cost_basis`; its own rule at :62 and table at :139-140 give exit 1, and the schema-record exemption
  at :91-93 does not speak about conditional fields.
- P-L0-001 and P-L0-002 pass as written: I checked every required and conditional field by hand
  (id/version/title/layer/type/status/roles/stages/triggers/inputs/outputs/back_edges/enforcement/
  script_candidate/evidence_class/evidence/cost_basis/trial), the role names against the stage-2 slot
  catalog (CORE-ARCH-3:60-75), the body headings and their order, and the change log. `enforcement:
  none` correctly omits `enforced_by`; `cost_basis: unknown` and `owner=unknown` are allowed forms.
- Artifact ids: `inputs`/`outputs` use `signals-ledger`, `decisions-index`, `procedure-draft`,
  `evidence-dossier`, `review-report` (P-L0-001:11-12; P-L0-002:11-12); the L5 catalog defines
  `signals`, `CATALOG`, `attempt-results`, `findings ledger` and others (CORE-ARCH-6:95-109). The schema
  says "artifact ids from L5" (:53-54), so lint cannot be built until the two lists are aligned.
- Can P-L0-001 retire itself? Mechanically yes: class E re-entry (step 11, :106-109) reaches step 8 and
  archive; but nothing requires an active successor first, so R-L0-17 in the root (L0-ROOT.md:90-92)
  would point at a retired record and the kernel would have no lifecycle procedure. That is a defect of
  the procedure, not of the question.

### 2. Evidence - FAIL

- All references resolve. `PROTO-DEC-0041/0044/0045/0050/0054` exist; DISCUSSION.md:85, :167, :179 say
  what P-L0-001:141-142 and P-L0-002:83, :87-89 claim; P-L0-002's note that the external synthesis is
  not persisted matches CORE-ARCH-1:289-290; PROTO-DEC-0050's evidence claim is at
  `.ai/DECISIONS.md:2081` and `:2084`.
- Three citations mispoint at the line that would carry the claim: `PROCEDURE-MAP.md:129` and `:142`
  are the headings "One rule, several homes" and "Conflicts found" (content: :131-140 and :144-156),
  cited in procedure.schema.md:9 and P-L0-001:18, :136; `DISCUSSION.md:47` is the tail of a sentence
  whose head is `:46`, cited in P-L0-001:137.
- Because the angle asks that the cited line say what the draft claims, this is FAIL: three of the
  seven evidence lines in the four drafts do not.

### 3. Root - FAIL

- Size: 4,799 bytes, under the 8,000 B cap (measured). No procedural rule that belongs in a branch:
  R-L0-17 is a pointer, R-L0-11/13/15/16 are invariants.
- AGENTS.md section 12 coverage: six of seven items are in R-L0-07 (L0-ROOT.md:53-56). MISSING:
  "Never report work as verified when you did not run the check" (AGENTS.md:467). R-L0-06 labels claims
  and requires a measurement for "measured", which is adjacent but not the same rule.
- Minor: "Where to go next" promises P-L0-003 and P-L0-004 (L0-ROOT.md:97) before they exist (S1-T09);
  in an always-loaded record, unbuilt ids should be marked pending.

### 4. Authority - FAIL

- Normal path: owner approval precedes `active` (R-L0-17.6, P-L0-001:50-51; step 8 :97-99; step 10
  :103-105). No path grants a permission, and no path skips review.
- FAIL: the minor-version short path runs only steps 4, 7, 10 (P-L0-001:111-115), skipping step 8;
  the reviewer alone decides what is minor (:113-115); step 10 sets `status: active` (:103-105). An
  author-reviewer-coordinator sequence can therefore change the normative text of a binding record and
  activate it with no owner act. The guard "wording that changes what any role must, may or must not do
  is always major" (:115) leaves the classification with the same reviewer.
- Self-retirement: see angle 1; add an active-successor rule.

### 5. Loops - RECOMMENDATION

- The three declared back edges each carry a budget and an exit (P-L0-001:14, :126-131) and match the
  schema's `<to-step>/<budget>/<exit>` form.
- Gap: the step-11 re-entry to step 1 (:106-109) is a cycle with neither a budget nor a `back_edges`
  entry; LCC-6 would flag it. The stop route to P-L0-002 is not a loop.

### 6. Taboo - PASS, with one recommendation

- The reading rule cannot be used to avoid work: reading is a minimum, an anomaly outside the set must
  be reported (L0-ROOT.md:60-62). The stop rule requires a search, a query record and a mandatory
  recommendation block, and the draft names the taboo risk with coverage (P-L0-002:50-51, :60-69, :96).
- Recommendation: the trigger `budget-exhausted` (P-L0-002:10) has no matching category in the
  stop-question form's Problem list (:65) and no rule in R-L0-10.x (:35-41); a stop caused by an
  exhausted budget cannot be expressed in the form that owns all stops. Also "Search once" (:50-51) is
  a weak duty; M-002 is the only check that stops stay real.

### 7. Loss - FAIL

Rules of AGENTS.md sections 1-12 that neither L0 nor any later layer's plan homes (checked
CORE-ARCH-2..7 for each):

- Cooperative lock and the one-writer rule for shared documents (AGENTS.md:267-294): no record planned
  anywhere; the coordinator's duty to hold the lock (CORE-ARCH-3:63) presupposes an unplanned rule.
- Decision reopen-trigger semantics (AGENTS.md:311-321): no planned home; the seven canonical homes
  (CORE-ARCH-7:52-60) do not include it.
- "Any agent may challenge any other agent; record the disagreement in TASK Open questions"
  (AGENTS.md:50-51): no planned home.
- The verification-report ban (AGENTS.md:467): missing from the root (angle 3) and unplanned.
- Secondary: branch guidance (AGENTS.md:438) and the numeric size limits of section 8 have no declared
  record home beyond the validator.

### 8. Reference - PASS

- Checked against the fetched `graphmemory` `architecture.md` and PROTO-DEC-0034, 0036, 0045. What the
  plans transfer is deterministic, in-repository mechanism only: types apart from behaviour, md +
  frontmatter as source, derived catalog, link integrity, one-writer/read-free queue, loading levels.
  Explicitly refused: MCP server and runtime, memory or graph backend, embeddings, BM25/ML search,
  Python, file watchers, and access levels as permission (CORE-ARCH-1:172-180, CORE-ARCH-2:200-206,
  CORE-ARCH-5:132-134). No adopted-runtime or MCP path, therefore no violation of 0034/0036/0045.

### 9. Evidence classes - RECOMMENDATION

- Class C cannot become `active` on opinion alone: two independent support marks, a metric, a kill
  criterion, a deadline and a trial are required (CORE-ARCH-2:93, :100; P-L0-001:48-49, :100-102).
- Gap: the trial's success is declared by the coordinator and immediately sets `active`
  (P-L0-001:100-102); nothing independent verifies the metric or the result, and "at least two
  independent marks" is hand-counted with "independent" undefined. Recommendation: the reviewer (step 7
  or a short re-review) confirms the trial outcome before step 10, or the metric is computed by script
  (CORE-ARCH-6:142). The same applies to class E detection via `last_applied`.

## Part 4 - Stage control

### 4.1 Tasks S1-T06..S1-T12 (CORE-ARCH-2:259-265)

Order accepted: T06 -> T07 -> T08 -> T09 -> T10 -> T11 -> T12; T07 may run in parallel with T06
(independent inputs). Nothing lands in the kernel; landing stays in Package I.

| Task | Decision | Acceptance check | Budget |
|---|---|---|---|
| S1-T06 | keep, scope widened | every confirmed `CA-nn` row of the findings ledger is `fixed-and-verified` or rejected with a reason recorded in the ledger; the critique's findings are answered the same way | 2 attempts per root cause |
| S1-T07 | keep, acceptance changed | RULE-MAP has one row per atomic rule of AGENTS.md sections 1-12 with `AGENTS.md:line`, home or `out` plus reason and owner question; `protocol-ledger.cjs cover` over the map reports no unit without a record; the four loss findings (angle 7) are homed or explicitly out | 2 attempts per root cause |
| S1-T08 | keep, acceptance strengthened | three trial records pass the schema by hand, one exercise covers a FAIL/back-edge case; every gap becomes a `Signal:` line with `rc=` and a ledger row | 2 attempts per gap root cause |
| S1-T09 | keep | P-L0-003 and P-L0-004 pass the schema by hand; P-L0-003 covers the `budget-exhausted` stop of P-L0-002 | 2 attempts per root cause |
| S1-T10 | keep | spec states inputs, outputs and exit codes in the spec section 1 form; includes the id registry that aligns `inputs`/`outputs` with L5 (CA-03) | 2 attempts per root cause |
| S1-T11 | change, scope extended | verdict PASS/RECOMMENDATION on the revised drafts as a diff review (PROTO-DEC-0049 item 1) plus LCC-1..9 for L0 recorded; not only T07-T10 | one review; fixes under T06 budget |
| S1-T12 | keep | one-page summary, owner questions list (В-1..В-23 status), signals found by T08 | 1 |

### 4.2 Exit criteria (CORE-ARCH-2:292-299) - gaps

Add: (a) the revised drafts pass the second review (PASS/RECOMMENDATION) after the fix round; (b) every
`CA-nn` row is closed or rejected with a reason; (c) all four drafts pass the schema by hand and all
evidence lines resolve and support their claims by hand (until lint exists); (d) RULE-MAP's criterion
allows an explicit `out` with an owner question, as in 4.1; (e) signals from S1-T08 are dispositioned or
carried explicitly into T12. The remaining criteria stand.

### 4.3 Stages 2-6 at plan level

- **Ordering error, high impact.** Package I's composition includes Evidence-per-candidate (R-08, R-09)
  and the reproduction locator (R-10) and `protocol-core.cjs lint/catalog/check-links`
  (CORE-ARCH-7:122), but those are designed in stage 5 (CORE-ARCH-1:265-266) and the tool is scheduled
  for stage 6 (CORE-ARCH-2:191; no build task in S1). The graph freezes Package I right after L2
  (CORE-ARCH-7:148). Either those items move into stages 1-3, or their design moves into Package II and
  the freeze order changes; as written the plan cannot execute. (Ledger CA-14.)
- **Dependency note.** The stage-1 `trial` fields reference M-001 and M-002, which are defined only in
  stage 5 (CORE-ARCH-6:119-120); the trials can run with hand-counted metrics, but the plan should say
  so, or define the two metrics in stage 1.
- **Three-round feasibility (PROTO-DEC-0047 item 5).** Package I as composed (L0+L1+L2, tooling and ten
  re-homed remediation items) is the largest risk to the three-round cap; Package III already has an
  unnumbered IIIb fallback (CORE-ARCH-7:182) with no trigger before exhaustion. Recommendation: decide
  the splits (I-a records / I-b tooling; IIIb trigger) before the corresponding freeze, not at budget
  exhaustion. Package II is mostly new files and is plausible within three rounds.
- **Certifiers.** Before freezing Package I the owner must confirm the replacement order for Codex
  (limits exhausted; PROTO-DEC-0055 item 3 fallback) and record the Part 2 item 5 acknowledgment about
  Gemini. CORE-ARCH-7:124 lists "shadow" certifiers beside binding ones for Package III; the text should
  say explicitly that shadow verdicts never count toward the gate (PROTO-DEC-0047 item 4).
- **Contradictions with accepted decisions:** one found - CORE-ARCH-1:217-220 states the H-19
  no-wait-review pilot is applied inside the program while В-7 remains open (:298); a class C pilot needs
  the owner's approval first. Others checked (0039/0045/0046/0047/0048/0049/0052/0053/0054) and found
  consistent at plan level.
- **Self-test:** S-004 as the program's own path (CORE-ARCH-4:149-151) is coherent with PROTO-DEC-0054
  item 4; keep it, and record its result as the stage-2 lesson.

Verdict summary: FAIL, with all findings fixable in the T06/T07/T09/T10 fix round; no finding is a
reason to abandon the L0 structure.
