# Owner directive - closure disposition (PROTO-DEC-0085, P-L0-008 0.4) and the first dry run

To: the program operator. Run this only after the F-02 admission directive (PROTO-DEC-0084,
P-L0-008 0.3) is committed. You transcribe, edit the listed files, prepare a dry-run manifest,
apply only what the owner confirms, and dispatch one review. You decide nothing and certify nothing.

Authority: the owner approved on 2026-09-26 that closing a piece of work includes disposing of its
own artifacts. He also approved the five amendments of the second critique:
- artifact ownership is not the whole baseline..HEAD delta;
- TRANSFER(target) replaces an artifact-level DEFER;
- CANONICALIZED leaves no second active authority;
- the receipt lives outside FRAMES.md;
- DELETE requires no open dependency.

He hands you this prompt himself (AGENTS.md section 2). Drafted in the advisory session
`claude-b00262b88c55444b`, which wrote nothing to the repository.

Provenance line:
`Approved by: RuslanFomenko (direct owner confirmation, 2026-09-26: closure disposition as part of Definition of Done, with the five amendments; decision text drafted by claude-b00262b88c55444b; transcribed by <your session>)`

## 0. Before you start

1. Check by content, not by number: the F-02 admission block (the block whose Decision item 1 states
   the F-02 primary question) and P-L0-008 0.3 (R-L0-22.55, candidate cap) must be committed. If
   not, stop and report. Decision numbers may have shifted: use the actual numbers in every
   reference below.
2. Journal line: `Intake: owner directive PROTO-DEC-0085 -> change P-L0-008 (closure disposition), M-011`.
3. Acquire the lock. Never steal it.

## 1. PROTO-DEC-0085 (append verbatim; next free number, adjust references if taken)

```
### PROTO-DEC-0085

Status: Accepted
Date: 2026-09-26
Reopen-trigger: owner-directive
Refines: PROTO-DEC-0083 (P-L0-008 R-L0-22.16, R-L0-22.17: what closing a frame requires)

Context:
Research, synthesis, plan and critique artifacts stayed active after their work closed, so the
owner had to notice the noise and order a revision (the OwnerIdeas program). docs/research/ holds
2.3 MB in 177 files with no budget, most of it from frames FRAMES.md already marks CLOSED. TASK.md
meets its 80-line limit at 20.5 KB, and TASK plus PLAN (44 KB) exceed the 40 KB packet budget. Line
and file-count limits therefore measure storage, not the attention agents spend.

Decision:
1. Closing a frame includes disposing of its own artifacts. A frame is CLOSED only after its
   closure disposition is applied and its closure receipt is recorded (P-L0-008 R-L0-22.56-22.71).
   Status: trial, under the P-L0-008 trial.
2. The artifact set is declared or attributable to the frame: its declared artifacts, its frame
   directory, files its own sessions created or changed, its declared seeds, and records its
   accepted outcome supersedes. The git delta between opening and closing commits is only a
   completeness cross-check, and an unattributable file goes to the gate owner.
3. Dispositions:
   - KEEP_ACTIVE;
   - CANONICALIZED: content in a named canonical source, original archived, at most a
     redirect-only non-authoritative stub;
   - ARCHIVE;
   - DELETE: only a byte-identical copy of text tracked elsewhere, an empty file or a generated
     file, and only with no open dependency, repaired references and a passing validator;
   - REPAIR;
   - TRANSFER(target): an open frame, open task, DEFER entry or candidate. A TRANSFER without a
     target blocks closure.
   In doubt: ARCHIVE, never DELETE.
4. Never changed by a closure: .ai/DECISIONS.md, .ai/ARCHIVE.md, docs/decisions/REGISTRY.md,
   session journals, and the content of review files. A review file moves only under
   PROTO-DEC-0037.
5. Every move is indexed (old path, new path, canonical replacement). References from the active
   corpus are repointed or replaced by provenance pointers. A citation of a moved path inside an
   immutable record (DECISIONS, REGISTRY, ARCHIVE.md, session journals, review files) is resolved
   through the archive index: it is never edited, it is not a dangling reference, and it never
   blocks a move. One closure is one commit under the lock; closures are applied one after
   another, never in parallel, because they share the index. Archive paths are provenance only:
   default-context builders and frame corpus lists exclude them.
6. The receipt is one line in docs/research/CLOSURES.jsonl, an append-only ledger. A wrong receipt
   is never rewritten; a correcting line with "supersedes": "<receipt id>" is appended. The
   FRAMES.md row carries only the receipt id, the commit and the disposition counts. The closer
   does not certify its own receipt; the deterministic closure check does, plus a certifier where
   a completion gate applies. A closure never changes a frame's status or verdict. A conflict it
   finds is reported as FRAME_STATUS_CONFLICT to the gate owner.
7. A leak detector runs after every fifth closed frame, at a milestone, and when a corpus budget
   is exceeded. It runs by hand until a scanner exists; its first three runs are dry runs; it
   reports the leakage rate (M-011).
8. First application: the frames already CLOSED without a receipt, as a dry-run manifest the owner
   confirms before anything moves.
9. Limits are split into an attention budget (default context: TASK, PLAN, injection, active
   research) and a storage budget (archive, effectively unbounded). New numbers, in bytes rather
   than lines, are set by a later owner decision from the active-corpus bytes measured after the
   first closure pass.
10. Carried by F-03 (CORE-ARCH stage 3, the L2 work cycle, stage id close):
    - the general closure procedure for every work item, not only frames;
    - the L0 invariant "one accepted provision has one active canonical source";
    - the scanner, built with the Node validator (PROTO-DEC-0077, A-4), WARN first.
    No new frame is opened for them.

Reasoning:
Cleanup at closure removes the mechanism that accumulates noise, instead of treating its effects in
periodic revisions. Ownership from declarations plus attribution survives parallel sessions,
where a raw git delta would sweep in other agents' work. A separate TRANSFER keeps DEFER a
question-level verdict. Archiving before deleting honours AGENTS.md sections 8 and 12. Keeping the
receipt out of FRAMES.md stops the registry from becoming a journal.

Alternatives rejected:
A separate cleanup layer; a periodic garbage collector as the main mechanism; ownership from the
git delta alone; DELETE as a default; the full receipt inside FRAMES.md; a new research frame for
cleanup.

Consequences:
P-L0-008 becomes 0.4. CORE-ARCH-6 defines M-011. docs/research/CLOSURES.jsonl and
docs/research/archive/INDEX.md are created. A dry-run manifest for the closed frames goes to the
owner. PROTO-DEC-0037 and AGENTS.md sections 8 and 12 stand; this block supersedes nothing.

Approved by: <provenance line>
```

## 2. Files to change

1. `.ai/DECISIONS.md`: append 0085.
2. `docs/core-arch/stage-1/P-L0-008-research-governor.md` becomes 0.4.
   - Append rules R-L0-22.56-22.71 exactly as in Appendix A, after R-L0-22.55. No existing id
     moves.
   - Front matter: add `PROTO-DEC-0085` to `decision` and `evidence`; outputs add
     `docs/research/CLOSURES.jsonl` and `docs/research/archive/INDEX.md`; triggers add
     `frame-closure`; `version: 0.4`.
   - Steps: after step 5, add step `5a. **Closure** (coordinator; gate owner for doubts)`: build
     the artifact set, then dispose, apply, check, and write the receipt (R-L0-22.56-22.67).
   - Risks table: add
     `| Closure moves or deletes something still needed | medium | high | declared ownership R-L0-22.57; ARCHIVE by default R-L0-22.62; one commit per closure R-L0-22.65; dry run first | one manifest per closure | semantic misclassification caught only at the gate |`
   - Change log:
     `- 0.4 — 2026-09-26 — <your session> (transcription; text by claude-b00262b88c55444b) — closure disposition R-L0-22.56-22.71 (PROTO-DEC-0085) — reviewer <reviewer>: <verdict>.`
3. `docs/core-arch/CORE-ARCH-6.md`, section 6:
   - add the row:
     `| M-011 | Утечка при закрытии: артефакты закрытых рамок, найденные детектором после CLOSED, на одну закрытую рамку; байты активного корпуса до и после каждого закрытия | docs/research/CLOSURES.jsonl, отчёты детектора | жива ли процедура закрытия P-L0-008; бюджеты внимания |`
   - update every inventory mention `M-001..M-010` → `M-001..M-011` (lines 16, 158, 171);
   - grep that none remains.
4. Create `docs/research/CLOSURES.jsonl`, empty. Create `docs/research/archive/INDEX.md` with the
   header of Appendix B.
5. `docs/research/FRAMES.md`: in the header, state that a CLOSED row carries
   `receipt: <CR-id> <sha> K:n C:n A:n D:n R:n T:n`. Add the counter row `Closed frames without a
   receipt | <n> | <date> | R-L0-22.56`.
6. `docs/decisions/REGISTRY.md`, separate commit:
   - `| PROTO-DEC-0085 | accepted | owner-directive | <sha> | none | Closure disposition: a frame is CLOSED only with applied disposition and a receipt; declared/attributable artifact set; KEEP_ACTIVE, CANONICALIZED, ARCHIVE, restricted DELETE, REPAIR, TRANSFER(target); receipts in CLOSURES.jsonl; leak detector (M-011); attention vs storage budgets; general procedure, L0 invariant and scanner carried by F-03 |`
   - `| PROTO-DEC-0083 | accepted | owner-directive | <sha> | none | Refined by PROTO-DEC-0085: closing a frame requires closure disposition and a receipt (P-L0-008 0.4) |`

Do NOT touch: AGENTS.md, `.ai/bin/`, the validator, `tests/`, hosts, or any existing DECISIONS block.
Move nothing yet: moves happen only in section 4, after the owner confirms.

## 3. Checks, commit, review

1. Check P-L0-008 0.4 against the schema. `git grep` must return exactly one definition for each
   of R-L0-22.56-22.71.
2. Run the validator (0 errors, output verbatim).
3. Release the lock. Commit, then commit REGISTRY. Run `record`, then write the journal entry.
4. Review:
   - One reviewer, not Claude and not DeepSeek. Output
     `docs/reviews/2026-09-26-<reviewer>-p-l0-008-0.4-closure-review.md`, at most 250 lines.
   - The Baseline must be the reviewed commit.
   - Scope: 0085, R-L0-22.56-22.71, and the Appendix C dry-run method.
   - Check first for any way a closure could lose text that exists nowhere else.
   - Verdict: PASS, RECOMMENDATION or FAIL, with reproductions.

## 4. First application: dry run over frames already CLOSED

Scope, in this order: F-06, F-07, F-09, F-10, F-11, F-13, F-14, F-15, F-16.
- F-08 and F-12 are not frames. List them in a separate section marked "owner decides".
- Excluded: F-01 (its program is still implementing), F-02 and F-03 (ACTIVE), F-04 and F-05
  (SUSPENDED).

Produce `docs/research/CLOSURE-MANIFEST-2026-09-26.md` per Appendix C. Show it to the owner. Wait.
After confirmation:
- apply one commit per frame (R-L0-22.65), each with its receipt line and its FRAMES.md receipt
  field;
- then archive the manifest itself in the last commit, recorded in that frame's receipt;
- report the active-corpus bytes before and after (definition in Appendix C).

---

## Appendix A - rules R-L0-22.56-22.71 (append after R-L0-22.55)

R-L0-22.56. A frame is CLOSED only after its closure disposition is applied and its closure receipt is recorded, and a frame whose artifact set is empty closes with an empty receipt.

R-L0-22.57. The artifact set of a frame is its declared artifacts, its frame directory, the files its own sessions created or changed, its declared seeds and the records its accepted outcome supersedes; the git delta between its opening and closing commits is only a completeness cross-check, and a file in that delta not attributable to the frame goes to the gate owner.

R-L0-22.58. Each artifact receives exactly one disposition: KEEP_ACTIVE, CANONICALIZED, ARCHIVE, DELETE, REPAIR or TRANSFER.

R-L0-22.59. CANONICALIZED means the normative content now lives in a named canonical source and the original is archived, and a stub left for links is redirect-only, non-authoritative and outside the active corpus.

R-L0-22.60. TRANSFER names the open frame, open task, DEFER entry or candidate that takes the artifact or its open part, and a TRANSFER without a target blocks closure.

R-L0-22.61. DELETE is allowed only for a byte-identical copy of text tracked elsewhere, an empty file or a generated file, and only when no open frame, decision in progress or uncertified candidate depends on it, its references are repaired and the validator passes.

R-L0-22.62. In any doubt the disposition is ARCHIVE, never DELETE, and a semantically unclear artifact goes to the gate owner.

R-L0-22.63. A closure never changes `.ai/DECISIONS.md`, `.ai/ARCHIVE.md`, `docs/decisions/REGISTRY.md`, session journals or the content of review files, and a review file is only moved under PROTO-DEC-0037.

R-L0-22.64. Every move is recorded in the archive index as old path, new path and canonical replacement; every reference from the active corpus is repointed or replaced by a provenance pointer; and a citation inside an immutable record (DECISIONS, REGISTRY, ARCHIVE.md, session journals, review files) is resolved through the archive index, is never edited, is not a dangling reference and never blocks a move.

R-L0-22.65. The disposition of one closure is applied in one commit under the shared-document lock, so that one revert restores it, and closures are applied one after another, never in parallel.

R-L0-22.66. The closure check requires zero dangling references from the active corpus, zero competing active sources for a canonicalized decision, and a recorded change of active-corpus bytes.

R-L0-22.67. The closure receipt is one line in the append-only ledger `docs/research/CLOSURES.jsonl`, a wrong receipt is corrected only by an appended line that names the receipt it supersedes, and the frame row in `docs/research/FRAMES.md` carries only the receipt id, commit and disposition counts.

R-L0-22.68. Archive paths are provenance only: default-context builders and frame corpus lists exclude them, and an active document links into an archive only as a provenance pointer.

R-L0-22.69. A leak detector runs after every fifth closed frame, at a milestone and when a corpus budget is exceeded, by hand until a scanner exists; its first three runs are dry runs, and it reports M-011.

R-L0-22.70. The closer never certifies its own receipt: the deterministic closure check verifies it, and a certifier also does where a completion gate applies.

R-L0-22.71. A closure never changes a frame's status or verdict, and a status or verdict it finds wrong is reported to the gate owner as FRAME_STATUS_CONFLICT.

## Appendix B - archive index and receipt formats

`docs/research/archive/INDEX.md` header:

```markdown
# Research archive index (P-L0-008 R-L0-22.64)

Provenance only (R-L0-22.68): not part of the active corpus or default context. One row per moved
or deleted artifact. Edited only under the shared-document lock.

| Date | Receipt | Old path | New path (or DELETED) | Canonical replacement | Disposition | Reason |
|---|---|---|---|---|---|---|
```

`docs/research/CLOSURES.jsonl`: one JSON object per line, append-only, edited under the lock:

```json
{"receipt":"CR-F06-1","frame":"F-06","date":"2026-09-26","baseline":"<sha at frame opening or unknown>","closure_commit":"<sha>","artifacts":[{"path":"...","action":"ARCHIVE","destination":"...","canonical_replacement":"PROTO-DEC-0077","target":null,"reason":"..."}],"counts":{"K":0,"C":0,"A":0,"D":0,"R":0,"T":0},"active_bytes_before":0,"active_bytes_after":0,"dangling_refs":0,"competing_authority":0,"checked_by":"<session>","certified_by":null}
```

## Appendix C - dry-run manifest method

**Active corpus** means tracked files under `docs/research/` (outside any `archive/`),
`docs/reviews/` (outside `archive/`), `OwnerIdeas/`, `docs/core-arch/`, `docs/ops/`, `.ai/docs/`,
plus `.ai/TASK.md`, `.ai/PLAN.md` and `AGENTS.md`. Report its bytes with the command you used.

For each frame in scope:
1. Build the artifact set (R-L0-22.57). Cross-check it against `git log --name-only` for the
   frame's paths.
2. For every artifact, grep references from the active corpus, excluding the artifact's own frame
   directory and all archives. Record who references it.
3. Propose one disposition with a reason and a confidence of HIGH, MEDIUM or LOW. LOW always goes
   to the owner.

Known dependencies. Check them, do not assume:
- F-06: `final-plan-2.md` is the design input of A-4, the Node validator in the OwnerIdeas plan →
  likely KEEP_ACTIVE or TRANSFER(A-4), not ARCHIVE.
- F-14: `PROCEDURE-MAP.md` is the input map named by PROTO-DEC-0053 and may be read by CORE-ARCH
  (F-03) → check before archiving.
- F-16 and F-13 are the canonical sources of DEFER D-01 and D-02. They may be archived only if
  the DEFER row is repointed to the archive path, which is allowed because DEFER items are out of
  agent context.
- Any artifact referenced by TASK, PLAN, core-arch, `docs/ops`, an open or suspended frame, or
  OwnerIdeas is not ARCHIVEd until that reference is repointed (REPAIR in the same commit) or the
  owner decides.

Manifest table, one row per artifact:

| Frame | Artifact | Referenced by (active) | Proposed | Destination | Canonical replacement / target | Reason | Confidence |
|---|---|---|---|---|---|---|---|

Citations from immutable records (DECISIONS, REGISTRY, ARCHIVE.md, journals, reviews) are listed
in the "Referenced by" column for information only. They never block a move (R-L0-22.64).
References from core-arch, TASK, PLAN, docs/ops, open frames or OwnerIdeas do block, until REPAIR
or an owner decision.

Close the manifest with this summary:
- artifacts examined;
- totals per disposition (KEEP_ACTIVE, TRANSFER, CANONICALIZED, ARCHIVE, DELETE, REPAIR) and
  AMBIGUOUS;
- unexpected git-delta files;
- open dependencies detected;
- broken references in the active corpus, before and after (expected);
- any FRAME_STATUS_CONFLICT;
- expected active-corpus bytes before and after;
- the list of LOW-confidence rows for the owner.

After applying, report:
- active corpus before, after and the reduction in percent;
- leak candidates remaining after closure.
