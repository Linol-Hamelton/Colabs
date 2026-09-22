# Claude - Cycle architecture fixation: independent certification, round 2

**Date**: 2026-09-21
**Reviewed commit**: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
**Working tree**: dirty
**Reviewer**: Claude (Opus 5), session claude-0ece36c7d1fe7334
**Scope**: architecture - literal conformance of documentation to PROTO-DEC-0041 and the `.ai/PLAN.md` cycle architecture policy
**scope-check**: PASS
**Verdict**: FAIL
**Mode**: CERTIFYING
**Receipt-Owner**: claude-0ece36c7d1fe7334

---

## Executive Summary

Four of the five round-1 findings are closed in the managed documents and verified here by
quotation. F-004 was half-applied: the self-authorizing escape clause is gone, but the
forbidden-path check is still a fixed global list instead of the Phase 0 frame the PLAN policy
names, and that list forbids the very `AGENTS.md` edit this dispatch authorized and round 1
required. That is a reproduced contract violation inside `.ai/docs/PROTOCOL.md`, a protected
path, so item 4 blocks it regardless of label. Three conditions clear this FAIL.

**Independence (item 2)**: input package and candidate tree only; the parallel certifier's and the
controller's reports were not opened.

## Scope and Evidence

- **Commands**: `validate-protocol.ps1` (exit 0, **1 warning**); `protocol-handoff.cjs verify
  --owner gemini-927b6b871251a111 --deep`; `git diff --name-only d38d2f2`; `git show -s`;
  `find`/`stat` for mtimes and budgets; `grep`/`sed` for every quotation below. **Not executed**:
  `test-protocol.ps1` (the parallel certifier's mandate). Windows 11 26200, Node v22.21.0, PS 5.1.
- **scope-check PASS**: everything with an mtime after the task frame (`.ai/DECISIONS.md`,
  `2026-09-20T20:19:09Z`) lies in `.ai/docs/**`, `AGENTS.md`, `templates/reviews/REVIEW.md`,
  `.ai/TASK.md`, `.ai/ARCHIVE.md`, `docs/reviews/**`, `.ai/worklog/**` - all dispatch-authorized.
  `PLAN.md`, `DECISIONS.md` and `REGISTRY.md` still carry `20:19Z`, so B8's "no line of
  PROTO-DEC-0041 or the PLAN policy changed" holds.

## Round-1 findings: verification

| ID | Verified at | Result |
|---|---|---|
| F-001 | `PROTOCOL.md:280`, `PAIRED-CYCLE.md:23` | **closed** in both; residual in the dispatch (R-002) |
| F-002 | dispatch criterion 4 (line 109) | **closed**: criterion satisfiable and satisfied |
| F-003 | `AGENTS.md:93-96`, `PROTOCOL.md:295`, `PAIRED-CYCLE.md:317` | **closed** in all three |
| F-004 | `PROTOCOL.md:113` | **half-closed** - R-001 |
| F-005 | validator, corpus, journals | **partly closed**; re-inflated by this round (R-003) |

- **F-001**: both files read, word for word, "A third reviewer is added only for an uncovered
  risk, contradicting reproductions, or an explicit owner directive (PROTO-DEC-0041 item 2)."
  Subject is the reviewer, the three triggers are exact, the substituted capability trigger is
  gone, and `grep -ri fifth .ai/docs/` returns nothing.
- **F-002**: criterion 4 now asks for no change to `validate-protocol.ps1` and `.ai/bin/` since
  the task's baseline snapshot, "подтверждённое UTC mtimes (handoff 2026-09-20T17:47:24Z,
  validator 17:47:43Z)". Both match to the second, and every `.ai/bin/*.cjs`, `.claude/hooks`,
  manifest, installer and `tests/**` mtime is `<= 18:09:54Z`, before the `20:19Z` frame. The old
  form was unsatisfiable because the baseline commit (`2026-09-19T19:33:36Z`) predates the
  authorized PROTO-DEC-0040 edits; this one is checkable and passes. mtime is weaker than a
  content hash - a per-file digest is a backlog candidate.
- **F-003**: all three carry the identical sentence, "The final check of a high-risk candidate
  requires no fewer than two parallel independent certifiers (PROTO-DEC-0041 item 2), a single
  reviewer cannot close a high-risk Completed task, and the certifiers must be outside execution
  and control (item 1)."

## Findings Ledger (PROTO-DEC-0041)

| ID | Requirement | Reproduction | Actual | Severity | Disposition |
|---|---|---|---|---|---|
| R-001 | PLAN policy line 181 with Phase 0 (line 150) | `sed -n '113p;359p' .ai/docs/PROTOCOL.md`; `git diff --name-only d38d2f2 -- AGENTS.md` | fixed list forbids this task's own authorized path | MEDIUM, protected path | confirmed |
| R-002 | PROTO-DEC-0041 item 2 | `sed -n '43p' docs/reviews/2026-09-20-deepseek-gemini-cycle-architecture-dispatch.md` | "пятый голос ... отсутствии capability у всех" survives | MEDIUM, not protected | confirmed |
| R-003 | dispatch criteria 2 and 6; anti-idle rule 4 | validator; `verify --deep`; `find docs/reviews -type f` | 1 WARN, stale receipt, stale TASK figures | MEDIUM | confirmed |

### R-001 - MEDIUM - Forbidden-path check is unsatisfiable for this candidate

`PROTOCOL.md:113`: "No forbidden path is touched (`AGENTS.md`, `QUICKSTART.md`, kernel, hooks,
gates, manifest, tests, decisions, registry)." The escape clause is correctly removed, so the
condition is absolute - while `PROTOCOL.md:359` in the same file, `PLAN.md:150` and
`PAIRED-CYCLE.md:43` all say Phase 0 declares "forbidden paths" per task, and `PLAN.md:181`
words the check as "no forbidden path touched", i.e. the frame's set, not a global list.

Reproduction: `git diff --name-only d38d2f2 -- AGENTS.md` returns `AGENTS.md`. The dispatch puts
that path in scope (line 5: "Риск: HIGH (`.ai/**`, `templates/**`, возможно `AGENTS.md`)"), its
forbidden list (line 23) omits it, and round-1 condition 2 required the edit. So legitimization
condition 2 fails for the candidate certifying itself; `tests`, `decisions` and `registry` fail
the same way for the authorized PROTO-DEC-0040 work in this tree. The list is not item 4's
protected set either, which governs blocking severity rather than scope legitimacy. Installed in
a consumer repository, the clause forbids every owner-approved edit to `AGENTS.md` or `tests/`.

**Fix**: bind condition 2 to the frame - "No path declared forbidden in the Phase 0 frame of this
task is touched" - and state any standing list as that frame's default, not as an override of it.

### R-002 - MEDIUM - The dispatch keeps the round-1 paraphrase

Dispatch B2 (line 43) still reads "пятый голос только при неснятом конфликте с воспроизведениями,
отсутствии capability у всех или директиве владельца": the participant subject and the capability
trigger F-001 removed from the managed documents. The dispatch was edited this round (criterion
4), so immutability was not the obstacle. Off protected paths it does not block by itself, but it
is the instruction a re-run of this cycle would follow. **Fix**: restate line 43 as item 2 words
it, or append a dated note marking the clause superseded.

### R-003 - MEDIUM - Closure state is not final

- Validator exit 0, **1 warning**: "32 session journals in .ai/worklog (cap 30)". The implementer
  restored exactly 30, leaving no headroom for the two journals item 2 guarantees will exist, so
  the two certifier sessions put it back over cap. Rule 4 means reserving to 28, not 30.
- `verify --owner gemini-927b6b871251a111 --deep` reports the evidence **stale**: recorded
  `sha256:6986db...`, tree now `sha256:ac6545...`. Cause: `docs/reviews/archive/INDEX.md` (mtime
  `2026-09-21T02:04:25Z`) is the only non-journal file touched after the receipt (`01:48:13Z`),
  with the move of `2026-09-20-codex-cycle-architecture-certification.md` (6,227 B) into
  `archive/`. Per the dispatch, any edit after step 6 voids the receipts; steps 6-8 must re-run.
- `.ai/TASK.md:55` claims "corpus 59 files / 608,292 B ... 30 journals, 0 warnings". Measured
  before this artifact: **58 files / 602,065 B**, 32 journals, 1 warning - 2 files and 12,335 B of
  headroom against the cap (60 files, 614,400 B) for two mandated reports. Both are now written
  and the corpus stands at 60 files / ~615 KB: the byte cap is breached, and archiving under the
  lock is the remedy. No review text was destroyed - both files deleted from the active corpus
  are present in `docs/reviews/archive/`.

## Conditions to clear this FAIL

1. **R-001** - rewrite `PROTOCOL.md:113` against the Phase 0 frame. Mandatory, blocking.
2. **R-002** - restate or supersede dispatch line 43. Mandatory, non-blocking.
3. **R-003** - archive journals to 28 or fewer and the corpus back under 600 KiB, then run closure
   steps 6-8 in order: TASK figures refreshed to measured values, `record` for every owner,
   `verify --deep` for every owner.
4. Round-1 backlog F-006 to F-009 is unchanged and still does not gate closure.

A `FAIL` cannot certify completion; `Status: In progress` is correct. Item 2 is satisfied only
when the second parallel certifier records its own verdict on the same version.

## References

`.ai/DECISIONS.md` PROTO-DEC-0041; `.ai/PLAN.md` "Cycle architecture policy"; round 1
`docs/reviews/2026-09-21-claude-cycle-architecture-certification.md`; dispatch and prompt
`docs/reviews/2026-09-20-deepseek-gemini-cycle-architecture-dispatch.md`,
`docs/reviews/2026-09-20-gemini-cycle-architecture-adversarial-prompt.md`; journal
`.ai/worklog/claude-0ece36c7d1fe7334.md`.
