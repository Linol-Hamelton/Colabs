# PKG-4 RECORDS - decided but unapplied rules written into the kernel records (A-6 part, A-2, A-1 part a)

Mode: ADVISORY (a package prompt, not a decision). Author: `claude-e59d6a50882e9e39` (stage 5-6
resolver, resumed session of `claude-b68b3491ee12ebd9`), 2026-09-26. Resolution:
`../FINAL-RESOLUTION-CLAUDE.md`. The executor implements this file; it does not redesign it. Every
replacement text below is binding as written: copy it, do not reword it.

## ID

`PKG-4` (program `ownerideas-revision`, stage 8). Items:
- A-6, the part that is transcription: P-L2-002 (tier without volume, the 0072 floor text, the 0086
  item 5 note); P-L3-004 (R-L3-004.4-6 and .8 aligned to PROTO-DEC-0075, `enforced_by` updated);
  S-001 completion in CORE-ARCH-4 section 3; CORE-ARCH-3 section 12 В-24 closed;
- A-2, the OwnerIdeas status rule, as root rule R-L0-37;
- A-1 part a, the L0 procedure P-L0-009 (the four outcomes), anchored by root rule R-L0-38.

## Goal

Write accepted decisions into the kernel records that still contradict them, so that no candidate
kernel record states a rule an accepted block has replaced. Nothing here decides anything: every
new sentence is the transcription of a named block.

## Scope

In scope: the seven files of Allowed paths, edited exactly as S1-S7 say.

Out of scope, never done here:
- the S-003 research-cycle steps (TRANSFER to F-03; resolution section 4.2);
- the A-1 design block and its enforcement (owner question OQ-2; later dispatcher increment);
- P-L2-002 step 5 alignment to the resolver and F-02's task requirements (the next P-L2-002
  revision after the F-02 gate; OQ-5);
- the state table of P-L3-004 (it stays the research launcher's record, S2 item 9);
- `AGENTS.md` (managed; PROTO-DEC-0083 item 7 kept it unchanged; resolution Kimi N-4);
- any file under `.ai/`, `.claude/`, `tests/`, `docs/ops/`, `docs/research/`, `OwnerIdeas/`.

## Stream and wave

E2, wave W2. It runs concurrently with PKG-3 (E1). The two packages share no file: PKG-3 writes
`.ai/`, `docs/ops/`, `tests/` and `protocol-manifest.json`; PKG-4 writes only `docs/core-arch/`.

## Inputs

- Decisions (read each block in `.ai/DECISIONS.md`): PROTO-DEC-0059; 0070 items 4-6; 0072; 0074
  items 2-5 and Consequences; 0075 items 1-8, 11 and Consequences; 0076 item 1; 0079 item 7; 0081;
  0083 items 1, 7; 0085; 0086 item 5.
- `docs/core-arch/stage-1/procedure.schema.md` (the record shape; rule-id anchoring, section 3).
- The records you change, read in full before editing: `docs/core-arch/stage-2/P-L2-002-model-selection.md`
  0.4; `docs/core-arch/stage-4/P-L3-004-route-failover.md` 0.5; `docs/core-arch/stage-1/L0-ROOT.md`
  0.5; `docs/core-arch/CORE-ARCH-4.md` section 3; `docs/core-arch/CORE-ARCH-3.md` section 12;
  `docs/core-arch/stage-1/S1-SUMMARY.md`.
- `docs/core-arch/stage-1/P-L0-002-stop-and-ask.md` 0.4 (P-L0-009 extends it; read only).
- `round6/packages/PKG-3.md` S3, S5-S8 and PKG-1 S3-S5 (what the kernel dispatcher does; P-L3-004
  points at it).

## Allowed paths

Change:
- `docs/core-arch/stage-2/P-L2-002-model-selection.md` (S1)
- `docs/core-arch/stage-4/P-L3-004-route-failover.md` (S2)
- `docs/core-arch/CORE-ARCH-4.md` (S3)
- `docs/core-arch/CORE-ARCH-3.md` (S4)
- `docs/core-arch/stage-1/L0-ROOT.md` (S5)
- `docs/core-arch/stage-1/S1-SUMMARY.md` (S7)
- your own journal

Create:
- `docs/core-arch/stage-1/P-L0-009-authorised-action.md` (S6)

## Forbidden paths

Everything not listed above, including: `AGENTS.md`; `.ai/**`; `.claude/`; hooks; the validator;
`protocol-manifest.json`; PKG-3's files; `docs/core-arch/stage-1/trial/S-003-research-cycle.md`;
`docs/core-arch/stage-1/P-L0-002-stop-and-ask.md`; `docs/core-arch/stage-1/P-L0-008-research-governor.md`;
`docs/core-arch/stage-2/trial/`; `docs/core-arch/OWNER-DECISION-execution-model-2026-09-25.md`;
`docs/research/**`; `OwnerIdeas/`; another session's journal. No commit, tag, push or branch.

## Dependencies

- W1 integrated and committed (PKG-1 exists, so `.ai/bin/protocol-dispatch.cjs` is a real path).
- The P-L3-004 edit (S2) is integrated only after PKG-3 passes its AC-7 to AC-11 (Integration
  conditions). Keep it in its own file so the operator can hold it back alone.

## Required outputs

1. The six changed files and the one new file, edited exactly as S1-S7.
2. A five-label journal entry listing each S-section with the lines changed, and a full `record`
   Evidence block.

No audit-prompt file: this is a medium-risk package (see Risk class).

## Specification (binding)

General rules for every edit:
- Change only the text named. Keep every other line byte-identical, including line endings (LF).
- Bump `version`, update the intro line that states the draft number, and append one change-log
  line in the record's own form:
  `- <new version> — <YYYY-MM-DD> — <your session owner name> — <what changed, with the block ids> — review pending (PKG-4).`
- `evidence:` lists gain the block ids named in each section, appended at the end of the list.

### S1 P-L2-002 0.4 -> 0.5 (PROTO-DEC-0072, 0074 item 4, 0075 item 8, 0086 item 5)

1. Intro line "Draft 0.4, CORE-ARCH stage 2" becomes "Draft 0.5, CORE-ARCH stage 2".
2. In the step-2 factor table, delete the row `| Size | ≤ 3 files | 4-15 | > 15 or a new module |`
   and append this row as the last row of the table:

   `| Independent judgement | the work follows a precise specification or a fixed procedure | review or critique that another participant checks | a judgement others rely on without re-deriving it: certification, architecture, or a high-responsibility synthesis, specification or audit |`

   Directly after the table, add this paragraph:

   > Volume is not a factor: the tier follows uncertainty and the consequence of an error
   > (PROTO-DEC-0074 item 4, 0075 item 8). The six factors are the parameters of 0075 item 8. Context
   > window, modality, tools, route capability and language support are hard constraints, checked
   > when the route is resolved, not scored.
3. Step 3: replace the sentence "Hard floors: a kernel change or a certification is at least T7; a
   protected path is at least T4." with:

   > Hard floors: a certification is at least T7, and so is a task that directly creates, changes or
   > applies a candidate kernel record, kernel code or protocol tooling. A research, design or review
   > frame that produces only advisory artefacts does not take that floor because its result may
   > later change the kernel, and a review-only task takes the rubric's tier unless another rule sets
   > a higher floor (PROTO-DEC-0072). A protected path is at least T4.
4. Section "Tier table": after its first paragraph, add:

   > The ranks T1-T9 are relative inside one provider: "T7" of one provider does not name the same
   > capability as "T7" of another (PROTO-DEC-0086 item 5, recorded as an input of this revision).
   > PROTO-DEC-0059 is unchanged.
5. Section "Evidence": append the line
   `- C - PROTO-DEC-0074 item 4 and 0075 item 8: the tier follows uncertainty and the consequence of an error, never volume; Size is replaced by the fourth parameter of 0075 item 8, independent judgement, so the sum still runs 0-12 and the PROTO-DEC-0059 mapping is unchanged. The ten-task rubric trial scored Size and predates this change.`
6. `evidence:` gains `PROTO-DEC-0072, PROTO-DEC-0074, PROTO-DEC-0075, PROTO-DEC-0086`.

### S2 P-L3-004 0.5 -> 0.6 (PROTO-DEC-0075 items 2-3, 5, 7, 11; 0076 item 1; 0051 item 4)

1. Front matter: `enforced_by: [.ai/bin/protocol-dispatch.cjs]`; `inputs:` gains
   `.ai/docs/clients.json, docs/ops/model-ladder.json` (keep the existing items); `evidence:` gains
   `PROTO-DEC-0075, PROTO-DEC-0076, PROTO-DEC-0079`.
2. The intro paragraph ("Draft 0.1 of a CORE-ARCH stage-4 record, ... when it is written.") is
   replaced by:

   > Draft 0.6 of a CORE-ARCH stage-4 record, in trial use by the owner since 2026-09-25
   > (PROTO-DEC-0067). `S~`: the kernel dispatch script `.ai/bin/protocol-dispatch.cjs` implements it
   > (`.ai/docs/CLI-AGENTS.md` section 9). The research launcher implemented 0.5 and is superseded
   > for new dispatches; its state table is kept below as its record.
3. After R-L3-004.3, insert a new paragraph (not a rule id):

   > R-L3-004.2-3 are suspended while PROTO-DEC-0076 item 1 holds: every model call goes through a
   > maker's CLI, the approval-gated DeepSeek rung is the only exception, and Kilo is not a fallback
   > router.
4. Replace R-L3-004.4 with:

   > - R-L3-004.4. Recovery after a classified failure follows PROTO-DEC-0075 items 2-4: the action
   >   follows the failure class, every new attempt has a stated reason, and a known-failing
   >   operation is never repeated. The budget is the first attempt and one retry on the primary,
   >   two attempts on each of two substitutes, at most six fresh invocations in all, with resumes
   >   counted apart. The substitutes are the resolver's (0075 item 10) or the owner's `fallback`
   >   routes. The one automatic Kilo attempt of 0.5 is withdrawn.
5. Replace R-L3-004.5 with:

   > - R-L3-004.5. After useful work has started, a crash or a stall is resumed first (0075 item 2).
   >   A fresh executor starts only when the resume path is exhausted and the budget of R-L3-004.4
   >   allows it, and only after the previous process tree is confirmed gone (R-L3-004.7).
6. Replace R-L3-004.6 with:

   > - R-L3-004.6. A stall is judged by progress signals: no progress for the step's stall interval
   >   (default 10 minutes; a dispatch file may set 5-120). The hard ceiling per step (default 120
   >   minutes) runs from the step's first launch and progress does not reset it: a heartbeat never
   >   keeps a looping step alive (0075 item 5). A stalled session is woken by resume up to three
   >   times before it is recorded as fallen (0051 item 4).
7. Replace R-L3-004.8 with:

   > - R-L3-004.8. Reaching the hard ceiling of R-L3-004.6 is TIMEOUT: the step is BLOCKED and the
   >   session is never resumed (0075 items 3, 5). The idle and hard caps of PROTO-DEC-0050 item 2
   >   stand in this form.
8. After R-L3-004.9, append a new rule:

   > - R-L3-004.10. Before the first attempt the dispatcher pins HEAD, the launch file and every
   >   copied-in file by sha256, and the dispatch file version. A pinned input that changes blocks
   >   the next attempt, or the owner starts a new launch revision; a HEAD change alone does not block
   >   (0075 item 7).

   Also append one sentence to the end of the first bullet of R-L3-004.9 (the bullet that begins
   "The copy."): "Under the kernel dispatcher the clone lives under
   `<system temp>/colabs-dispatch/`, and the git mode is read from the slot's `git` key in the
   dispatch file."
9. Section "Timers": its title becomes "### Timers of the research launcher (0.5; superseded for new
   dispatches by R-L3-004.6)". Section "State table": insert before the table the sentence "This is
   the research launcher's table. The kernel dispatcher's states are those of PROTO-DEC-0075 item 11
   (`.ai/docs/CLI-AGENTS.md` section 9)." Neither table is otherwise changed.
10. Steps 4 and 5 are replaced by:

    > 4. **Recover** (dispatcher). On a classified failure, act by R-L3-004.4-5 and the class table of
    >    `.ai/docs/CLI-AGENTS.md` section 9.
    > 5. **Hand off** (dispatcher). A BLOCKED or FAILED step writes its run record and the report of
    >    the work done (PROTO-DEC-0076 item 3); the owner decides.

    The back edge `4>2/1/owner` and its prose stay unchanged.
11. Section "Divergence from PROTO-DEC-0051 item 4 (CB-22)": append the sentence "The kernel
    dispatcher implements the wakes; this divergence applies only to the superseded research
    launcher."
12. Change log line for 0.6 names 0075 items 2-3, 5, 7 and 0076 item 1.

### S3 CORE-ARCH-4 section 3 (PROTO-DEC-0075 items 1, 6, 14)

1. Replace the sentence "Узел считается пройденным, когда существует его выходной артефакт (L5)."
   with:

   > Узел считается пройденным только по контракту завершения PROTO-DEC-0075 п.6: процесс завершён и
   > его код выхода записан; выходной артефакт (L5) существует и не пуст; он проходит минимальную
   > структурную проверку и требуемый специализированный валидатор; Evidence записано; супервизор
   > зарегистрировал этап как завершённый. Завершение процесса, этапа и задачи — разные состояния
   > (п.1); задача завершена по п.14.
2. After the dated bullet "**2026-09-25, PROTO-DEC-0066:** ..." in the header list, add the bullet
   `- **<YYYY-MM-DD>, PKG-4 (PROTO-DEC-0075 п.6):** правило ствола §3 приведено к контракту завершения.`

### S4 CORE-ARCH-3 section 12 (PROTO-DEC-0072 Consequences)

Replace the two lines of the bullet "**В-24.** Считается ли «правкой ядра» ..." with:

> - **В-24.** Закрыт: PROTO-DEC-0072 — пол T7 задаётся действием текущей рамки: он действует, когда
>   задача создаёт, меняет или применяет запись-кандидат ядра, код ядра или инструментарий
>   протокола, и всегда для сертификации; исследовательская, проектная или ревью-рамка, которая
>   пишет только рекомендательные артефакты, его не наследует.

### S5 L0-ROOT 0.5 -> 0.6 (PROTO-DEC-0079 item 7; 0081; 0070 items 5-6)

1. Intro line "Draft 0.4, CORE-ARCH stage 1." becomes "Draft 0.6, CORE-ARCH stage 1." (the 0.5 bump
   left it stale).
2. Under "### Invariants", after R-L0-03, insert:

   > R-L0-37. OwnerIdeas files are advisory seeds, ranked below the plan. A file leaves the active
   > corpus when the frame that consumes it closes (P-L0-008). Agents never place their outputs in
   > `OwnerIdeas/`. Why: owner seeds were read as sources of truth, and a second active source for
   > a decided rule costs review rounds (PROTO-DEC-0079 item 7).
3. Under "### How to act", after R-L0-10, insert:

   > R-L0-38. An action that a recorded source already allows unambiguously, and that widens no
   > scope, authority or permission, is taken without asking the owner again, and its basis is
   > recorded; the owner is asked only in the cases P-L0-009 lists. Why: repeated confirmations make
   > the owner the bottleneck of every run (PROTO-DEC-0070 items 5-6, made general by 0081).
4. "## Where to go next": after "Missing rule: P-L0-002." insert "Action already allowed, or whether
   to ask: P-L0-009."
5. "## Evidence": append `- R-L0-37: PROTO-DEC-0079 item 7. R-L0-38: PROTO-DEC-0070 items 5-6, 0081.`
6. `evidence:` gains `PROTO-DEC-0070, PROTO-DEC-0079, PROTO-DEC-0081`.

Why 37 and 38, not 23 [I]: P-L0-008 0.1 used R-L0-23..R-L0-36 as root-level ids, and its 0.2 change
log maps them away (`P-L0-008-research-governor.md:261`). Journals and plans still cite them in the
0.1 sense (for example `round4/PLAN-DEEPSEEK.md:317`), so reusing them would make old citations
point at new rules.

### S6 New record P-L0-009 (PROTO-DEC-0081; 0070 items 4-6; P-L0-002)

Create `docs/core-arch/stage-1/P-L0-009-authorised-action.md` with exactly this front matter:

```
---
id: P-L0-009
version: 0.1
title: Next action - execute, delegated judgement, owner decision or stop
layer: L0
type: procedure
status: draft
roles: [all]
stages: [any]
triggers: [before-owner-question, action-not-named-by-step]
inputs: [task-frame, journal, decisions-index]
outputs: [journal, stop-question, signals]
back_edges: []
enforcement: P
script_candidate: no:1
evidence_class: [C]
evidence: [PROTO-DEC-0070, PROTO-DEC-0081]
---
```

Body, in this order (the eight required headings of `procedure.schema.md` section 3, plus `## Open`
between `## Risks` and `## Change log`):
- Title line `# P-L0-009 Next action: the four outcomes`, then the line "Draft 0.1 of CORE-ARCH stage
  1, written by PKG-4 of the OwnerIdeas program. Not binding until approved. Anchored by R-L0-38;
  extends P-L0-002."
- `## Purpose`: one paragraph: an agent either asks the owner again for what is already allowed,
  which makes the owner a bottleneck, or acts on its own reading of what is "obviously" allowed,
  which widens authority silently; this procedure names the four outcomes of a next action and the
  closed list of cases in which the owner is asked.
- `## Rules`, exactly these six:

  > - R-L0-38.1. STOP. An action outside the task's allowed scope, or onto a forbidden path, is not
  >   taken. A change already outside the scope stops the work at once, and P-L0-002 steps 1-3
  >   follow (PROTO-DEC-0070 item 4; R-L0-10.8).
  > - R-L0-38.2. OWNER-DECISION. The owner is asked, through the stop-question of P-L0-002, only when
  >   authority is missing; scope, permissions or delegation would widen; an exception to a rule is
  >   needed; binding sources conflict unresolved; several materially different admissible options
  >   remain and no procedure delegates the choice; a previously unauthorised irreversible action is
  >   needed; a provided budget or back-edge is exhausted; or the rules give UNKNOWN rather than a
  >   definite result (PROTO-DEC-0070 item 6).
  > - R-L0-38.3. DELEGATED-JUDGEMENT. When several admissible actions remain and a role or a
  >   procedure explicitly delegates the choice, the participant chooses without owner confirmation
  >   and records the choice, the alternatives and the delegating source (PROTO-DEC-0070 item 6).
  > - R-L0-38.4. EXECUTE. When the rules and the current state admit exactly one admissible action,
  >   and an approved decision, an active procedure, a task frame, a recorded authorisation or another
  >   recorded delegation allows it unambiguously without widening scope, authority or permissions,
  >   the participant takes it and records the basis (PROTO-DEC-0070 item 5).
  > - R-L0-38.5. A basis is a recorded source, cited by its decision id or `path:line`. A
  >   participant's own judgement that an action is obvious, implied or equivalent is not a basis
  >   (PROTO-DEC-0070 item 5: "recorded").
  > - R-L0-38.6. The outcomes are tested in the order STOP, OWNER-DECISION, DELEGATED-JUDGEMENT,
  >   EXECUTE; the first that applies is the outcome.
- `## Steps`: four numbered steps, actor "any role": (1) test R-L0-38.1, and on STOP go to P-L0-002;
  (2) test the eight cases of R-L0-38.2, and on a match go to P-L0-002 step 4 with the case named in
  block 2 of the stop-question; (3) test R-L0-38.3, and on a match choose and record in the journal
  the outcome, the choice, the alternatives and the source; (4) test R-L0-38.4, and on a match act
  and record in the journal the outcome, the action and the basis. No match in steps 1-4 is the case
  "the rules give UNKNOWN" of R-L0-38.2.
- `## Stop conditions`: "The outcomes STOP and OWNER-DECISION are the stops; both continue in
  P-L0-002."
- `## Back edges`: "None."
- `## Evidence`: two lines: "- C - PROTO-DEC-0070 items 4-6 (owner terms for the PROTO-DEC-0066 run)
  made a general kernel rule by PROTO-DEC-0081." and "- C - R-L0-38.6 (the order) is the resolver's
  proposal (`round6/packages/PKG-4.md`, stage 5-6), not the owner's words; it tests the fail-safe
  outcomes first."
- `## Risks`: a table in the PROTO-DEC-0049 item 4 form with exactly these rows:
  | Risk | Likelihood | Impact | Coverage | Cost | Residual |
  |---|---|---|---|---|---|
  | A basis read too broadly | medium | high | R-L0-38.5: a basis is a cited recorded source; the reviewer checks the citation | one citation per action | no script checks it until the capability envelope exists |
  | The owner is asked too often | medium | medium | the closed list of R-L0-38.2 | none | a thin rule set yields UNKNOWN often |
- `## Open`: "Not decided; waits for the design block of PROTO-DEC-0081 (owner question OQ-2 of the
  OwnerIdeas stage-5 resolution): the capability envelope descriptor (the seed
  `OwnerIdeas/H-AUTH-02.md:27-38`); inheritance of permissions on resume and fallback (`:46`); expiry
  and supersession of an authorisation (`:47`); the bounds of delegated judgement (`:38`); the
  delegation artifact; the seven seed checks as acceptance tests (`:42-49`). Enforcement in the
  dispatcher waits for them (PROTO-DEC-0081 Consequences)."
- `## Change log`: `- 0.1 — <YYYY-MM-DD> — <your session owner name> — first draft, A-1 part a (PROTO-DEC-0081) — review pending (PKG-4).`

### S7 S1-SUMMARY

1. The `L0-ROOT.md` row: `0.5` becomes `0.6`, and "22 правила" becomes "24 правила".
2. After the `P-L0-008` row, add:
   `| \`P-L0-009\` | 0.1 | следующее действие: исполнить, делегированное суждение, решение владельца, стоп (PROTO-DEC-0070, 0081); оболочка возможностей не решена |`

## Acceptance criteria

| # | Criterion | Check |
|---|---|---|
| AC-1 | `git diff --name-only` and `git status --short` show only the seven Allowed paths plus your journal | C |
| AC-2 | P-L2-002 has no `Size` row, has the `Independent judgement` row last, six factor rows, and the step-3 floor text of S1 item 3 verbatim | F |
| AC-3 | P-L2-002 carries the 0086 item 5 paragraph and the new Evidence line; `version: 0.5` | F |
| AC-4 | P-L3-004 R-L3-004.4, .5, .6, .8 and .10 read exactly as S2; `enforced_by` names only `.ai/bin/protocol-dispatch.cjs`; the suspension paragraph follows R-L3-004.3; `version: 0.6` | F |
| AC-5 | No sentence of P-L3-004 0.6 outside the kept launcher tables still says that one automatic Kilo attempt is made, that no executor starts automatically after useful work, or that progress resets the hard timer | F (search for "Kilo", "useful work", "resets") |
| AC-6 | CORE-ARCH-4 section 3 carries the S3 text; CORE-ARCH-3 В-24 reads "Закрыт: PROTO-DEC-0072" | F |
| AC-7 | L0-ROOT defines R-L0-37 and R-L0-38 once each, and no other file in `docs/core-arch/` defines them; `version: 0.6` | C (`git grep -n "R-L0-3[78]\." docs/core-arch`) |
| AC-8 | P-L0-009 front matter is exactly S6's; its `##` headings are Purpose, Rules, Steps, Stop conditions, Back edges, Evidence, Risks, Open, Change log in that order; its rules are R-L0-38.1-38.6 only | F (`git grep -n "^## " <file>`) |
| AC-9 | Every block id cited in the new text exists in `.ai/DECISIONS.md` and says what the citation claims (list each in the journal with its line) | F |
| AC-10 | Every changed record's change log has exactly one new line, and every front-matter line still matches the grammar of `procedure.schema.md` section 1 | F |
| AC-11 | The validator and the full suite pass on the integrated tree | C |

## Validation commands

```
git status --short
git diff --stat
git grep -n "R-L0-3[78]\." docs/core-arch
git grep -n "^## " docs/core-arch/stage-1/P-L0-009-authorised-action.md
git grep -n -i "kilo\|useful work\|resets" docs/core-arch/stage-4/P-L3-004-route-failover.md
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
node .ai/bin/protocol-handoff.cjs record --owner <your owner name>
```

Report each exit code. For AC-5, list every remaining hit of the search with its line and why it is
allowed (a kept launcher table, the suspended R-L3-004.2-3, or the withdrawal sentence itself).

## Integration conditions

- The W2 gate: the operator runs the validator, the suite and each executor's full `record` in turn
  with both streams at rest.
- The operator commits PKG-4 path-scoped. `P-L3-004-route-failover.md` is committed only if PKG-3
  passed AC-7 to AC-11. Otherwise it is held back, and the rest of PKG-4 is committed without it.
- A PKG-3 finding that changes the dispatcher's behaviour from PKG-3 S5-S7 makes S2 stale. The held
  P-L3-004 edit then returns to the resolver as a finding, and the executor does not rewrite it.

## Risk class and certification route

- **Medium** (PROTO-DEC-0038 item 2): documentation of candidate kernel records under
  `docs/core-arch/`, which is not a protected path of 0038 item 1. No invariant of the installed
  protocol changes: `AGENTS.md` is untouched, and all records stay drafts or trials.
- One independent reviewer statement (0038 item 2). Either certifier of PROTO-DEC-0086 item 1
  (Kimi K2.7 Code HighSpeed or MiMo-V2.6-Flash) satisfies it, on the frozen candidate after stage 12.
- The executor, Claude and DeepSeek certify nothing here (0079 item 6).

## Artifact plan

| Path | Action | Disposition at program closure |
|---|---|---|
| `docs/core-arch/stage-2/P-L2-002-model-selection.md` | changed (0.5) | KEEP_ACTIVE |
| `docs/core-arch/stage-4/P-L3-004-route-failover.md` | changed (0.6) | KEEP_ACTIVE |
| `docs/core-arch/CORE-ARCH-4.md`, `docs/core-arch/CORE-ARCH-3.md` | changed (one section each) | KEEP_ACTIVE (CORE-ARCH program documents) |
| `docs/core-arch/stage-1/L0-ROOT.md` | changed (0.6) | KEEP_ACTIVE |
| `docs/core-arch/stage-1/P-L0-009-authorised-action.md` | created (0.1 draft) | KEEP_ACTIVE; its `## Open` items are TRANSFER(OQ-2) |
| `docs/core-arch/stage-1/S1-SUMMARY.md` | changed (two rows) | KEEP_ACTIVE |
| `OwnerIdeas/H-AUTH-02.md` | cited, not edited | stays with A-1 (TRANSFER(OQ-2)); it leaves the corpus when A-1's design frame closes (R-L0-37) |

## Executor requirements

| Dimension | Level | Why |
|---|---|---|
| D-IMPL | LOW | no code |
| D-ARCH | LOW | the structure is fixed here |
| D-REV | LOW | |
| D-TERM | LOW | |
| D-ALGO | LOW | |
| D-EDIT | HIGH | exact replacements in six records, other lines byte-identical |
| D-DOC | HIGH | long records, rule ids, front-matter grammar, two languages |
| D-CRIT | MEDIUM | finding a sentence that still contradicts a block (AC-5, AC-9) and stopping |
| D-SYN | LOW | |

Minimum tier: **T7**. The package changes candidate kernel records (PROTO-DEC-0072 item 3,
transcriber's reading in its Consequences). The owner named E2 = Mistral Medium 3.5 max (0086 item 2),
which fills T1-T9 of its provider (`MODEL-MATRIX.md:132`).

## STOP conditions

Block, record a finding and a `Signal:` line (PROTO-DEC-0051 item 5), and do not decide, when:
1. A sentence named for replacement is not in the record as quoted here (the record changed after
   stage 6). Report the current text; do not guess the replacement.
2. A replacement text would contradict another sentence of the same record that this package does
   not change, other than the ones AC-5 allows.
3. A cited block does not say what the replacement text claims (AC-9).
4. A new rule id collides with an existing definition (AC-7).
5. The suite is red before your first edit.
6. Any edit outside Allowed paths would be needed, including `AGENTS.md`, P-L0-002 or S-003.
7. You find a new idea or an unresolved design question, for example an envelope field, a better
   factor scale, or a state-table rewrite. It becomes a finding (a candidate, cap 5, or a question
   to the owner) and never widens this package.

## Evidence and closing steps

1. Start your own session: `node .ai/bin/protocol-session.cjs start --agent <name>`.
   - Line 1: `Launch: model=<id> effort=<value|unknown> client=<client>`.
   - Line 2: `Orientation: <model> @ task:ownerideas-pkg-4 (parent program:ownerideas-revision):
     executor E2 | success=PKG-4 AC-1..AC-11`.
2. Write a checkpoint line after each of S1-S7 (PROTO-DEC-0047 item 6).
3. At the end: `git diff`, then a five-label entry listing each AC with its result and the AC-9
   citation list.
4. Run `record --owner <owner>` (full) and report the exit codes.
5. Last chat message: a short report to the owner in Russian.
