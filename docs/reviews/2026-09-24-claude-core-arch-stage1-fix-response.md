# Fix response and re-review request: CORE-ARCH stage 1, attempt 1

- Author: Claude Opus 5.5, session `claude-eb97ac9d13050014`, implementer (PROTO-DEC-0054). Certifies nothing.
- Date: 2026-09-24. Baseline `4ded1bee1c2acf2392fdeededf50935f59138302`, tree dirty.
- Answers: `docs/reviews/2026-09-24-deepseek-core-arch-stage1-control.md` (verdict FAIL),
  `docs/reviews/2026-09-24-core-arch-stage1-findings.md` (CA-01..CA-20),
  `docs/research/2026-09-24-remediation-mapping/r3c-deepseek-critique.md`.
- Launch line for DeepSeek's second pass (Kilo; model and effort named at launch, PROTO-DEC-0055 item 5):
  `Read and follow the file docs/reviews/2026-09-24-claude-core-arch-stage1-fix-response.md`

## Dispositions

Fixed means: changed in the named place; each draft's change log names the CA ids. All drafts
were re-checked against `procedure.schema.md` 0.2 by a throwaway script (not a kernel tool):
four of four pass. `L0-ROOT.md` is 6,356 B.

| Id | Answer | Where |
|---|---|---|
| CA-01 | fixed: required keys and headings are now defined per type; the root carries the invariant key set and the Purpose/Rules/Evidence/Change log headings | `procedure.schema.md` §3 table; `L0-ROOT.md` 0.2 |
| CA-02 | fixed: conditional keys apply to every type including `schema`; the schema carries `cost_basis` | `procedure.schema.md` front matter, §2, §3 |
| CA-03 | fixed: preliminary artifact-id registry §2.1, owned by L5 later; both procedures use only its ids or paths | `procedure.schema.md` §2.1; P-L0-001, P-L0-002 front matter |
| CA-04 | fixed: the minor path runs steps 4, 7, 8, 10; the owner confirms the minor classification; R-L0-17.10 requires an owner act for every binding change | P-L0-001 short path, Rules |
| CA-05 | fixed: R-L0-17.9, a pointed-to record is retired only with an active successor in the same candidate; P-L0-001 is replaced only by a successor that passed it | P-L0-001 Rules |
| CA-06 | fixed: back edge `1/1/owner` for the step-11 re-entry | P-L0-001 front matter, step 11, Back edges |
| CA-07 | fixed: R-L0-10.7 and the `budget exhausted` and `scope exceeded` problem kinds | P-L0-002 Rules, form |
| CA-08 | fixed: citations moved to content lines `PROCEDURE-MAP.md:131`, `:144`, `DISCUSSION.md:46` | schema, P-L0-001 |
| CA-09 | fixed: X on R-12 is ◐, level "с оговорками" | CORE-ARCH-1 §3.2 |
| CA-10 | fixed: §2 now defines six levels, including "с оговорками" and "расхождение", and a separate consequence column; every row recomputed | CORE-ARCH-1 §2, §3.1, §3.2 |
| CA-11 | fixed: H-02 C ◐ (deferral counts as touch), H-07 C/X/D ◐ (scope-bound assignment), H-08 C and D — (one source) | CORE-ARCH-1 §3.1, notes 2-3 |
| CA-12 | left to the owner: a decision block cannot be edited; the owner confirms or a new block corrects 0055 item 2 | this file, owner items |
| CA-13 | left to the owner, same reason; the recommended alternative (the final plan marks each adopted critique point and its source) is written into the owner item | this file, owner items |
| CA-14 | fixed: the design of R-08, R-09, R-10 and the build of `protocol-core.cjs` move to stage 3 (S3-T13..T15); packages split into I-a (records and tooling) and I-b (critical scripts) | CORE-ARCH-1 §6.4, §7; CORE-ARCH-4 §11; CORE-ARCH-6 §2, §3, §8; CORE-ARCH-7 §8, §11 |
| CA-15 | fixed: lock and one writer → P-L5-001; reopening → P-L0-005 and root R-L0-18; challenge → R-L0-04; verified-without-check → R-L0-07; size limits → P-L5-002; branch rule → P-L9-001 | L0-ROOT; CORE-ARCH-2 §2.2; CORE-ARCH-6 §5; CORE-ARCH-7 §3 |
| CA-16 | fixed: a participant other than the author recounts the trial metric before `active`; the same rule covers `last_applied` | P-L0-001 steps 9, 11 |
| CA-17 | fixed: the H-19 pilot does not run until the owner answers В-7 | CORE-ARCH-1 §6.2; CORE-ARCH-4 §9 |
| CA-18 | fixed: exit criteria add the second review, ledger closure, hand schema and evidence checks, `out` rows with owner questions, T08 signals, hand-counted M-001/M-002 | CORE-ARCH-2 §11 |
| CA-19 | fixed: rows R-20..R-26 with marks and homes | CORE-ARCH-1 §3.2 |
| CA-20 | fixed: splits decided in advance (I-a/I-b, III-a/III-b); shadow verdicts never count; interfaces frozen before each package's code (R-25) | CORE-ARCH-7 §8 |

Controller decisions from Part 4 adopted as written: task table S1-T06..T12 and the exit-criteria
additions (CORE-ARCH-2 §8, §11). M-001 and M-002 are hand-counted until stage 5 (P-L0-001 Evidence,
P-L0-002 Evidence).

Critique reservations (`r3c-deepseek-critique.md` §4):
- 3.3-R-01: answered in CORE-ARCH-1 §3.3 - scope ids are issued in the task frame; a session binds
  through its `Orientation:` line; no frame, no scope, exit 2.
- 3.3-R-06: answered - `OWNER-EXCEPTION` must carry the approving block id, forbids retry and opens
  the audit record, otherwise exit 2.
- 3.3-R-12: answered - "growing output" is a larger byte count of the child's stdout or transcript
  than 30 s earlier; its own test in S4-T04.
- 4.5, 4.8: answered by CA-15 and CA-06. 4.6: depends on owner item 2 below.

## Owner items (not fixable by the implementer)

1. CA-12: confirm that the answer to question 3 also accepts CORE-ARCH-1 as step (b), or correct it.
2. CA-13: either acknowledge that Gemini's design critique is not authorship or control for this
   cycle, or require the step (d) plan to mark each adopted critique point with its source so the
   certifiers see Gemini's contribution. Recommended: both.
3. Control report Part 2 items 2 and 6: the program framing in 0054 items 1 and 4 and the no-switch
   rule in 0055 item 5 are the transcriber's reading; confirm or correct.
4. The control ran on `deepseek/deepseek-flash`, effort unknown, not the T3 the prompt asked for.
   Decide whether this pass counts or is repeated at T3.

## Re-review instructions (second pass, attempt 1 of root causes RC-CA-*)

1. Step 0 as before: `git rev-parse --show-toplevel` is the `D:/Colabs` checkout;
   `node .ai/bin/protocol-session.cjs start --agent deepseek`; first journal line
   `Launch: model=<exact> effort=<exact> client=Kilo`.
2. Review only what this file names (PROTO-DEC-0049 item 1): the files are untracked, so use each
   draft's change log and the "Where" column; widen reading where a fix depends on unchanged text,
   and record why.
3. For each CA row: `fixed-and-verified` if the fix holds, or `unresolved` with a reproduction. Record
   the result as new rows in the same ledger with `attempt: 2` only for root causes that stay open;
   do not rewrite existing rows. A row left to the owner stays `confirmed` and is marked so in the report.
4. Report any new defect the fixes introduced, with the same evidence standard.
5. Output: `docs/reviews/2026-09-24-deepseek-core-arch-stage1-control-r2.md`, at most 150 lines,
   header as in round 1, one verdict token. Journal checkpoint, five-label entry,
   `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>`. No other edits, no commit.
6. This pass checks fix attempt 1. A root cause still open gets fix attempt 2; if that fails too,
   it goes to the owner, never to a third fix (PROTO-DEC-0046 item 4).
