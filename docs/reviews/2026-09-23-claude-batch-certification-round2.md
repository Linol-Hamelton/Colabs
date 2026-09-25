# Round-2 independent certification, slot 2: remediated PROTO-DEC-0046 candidate

Mode: CERTIFYING
Receipt-Owner: claude-80166a24b194cba2
Reviewed commit: 89ce192bf6923d00b0328378be8c4b73fd47234b (one fix round over b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed)
Worktree: D:/Colabs-cert/claude2
HEAD at start: 89ce192bf6923d00b0328378be8c4b73fd47234b
Git status at start: clean except the untracked session journal created by SessionStart
HEAD at end: 89ce192bf6923d00b0328378be8c4b73fd47234b
Git status at end: clean except this report, docs/research/2026-09-23-claude-round2/ and this session's journal
Reviewer model: Claude Opus 5, session claude-80166a24b194cba2
Date (UTC): 2026-09-23
Scope: slot-2 angle, adversarial negative testing and internal consistency of the
remediated tree, with neutral requirements on every protected-path probe. Claims
under test: the two round-1 reports, the union ledger
docs/reviews/2026-09-23-batch-findings.md, and .ai/worklog/gemini-bc8f87d66fd614fa.md.
Independence: this session neither authored nor controlled the candidate and did
not write the specification under test. The slot-1 round-2 report was not read
before this verdict was fixed.

Verdict: FAIL

## Summary

The path contract and the run-time protected set are genuinely closed. F-001 and
F-C01 do not reproduce in any of 47 forms, the manifest fails closed on all 15
malformed shapes, discovery stays inside the candidate repository, output is
deterministic, and decision-block immutability now catches tampering in both
directions while accepting a lawful append. Twenty-three malformed ledger shapes
each hiding a confirmed `.ai/bin/` finding all exit 2.

Three reproduced defects remain, all on protected paths, so each blocks under
PROTO-DEC-0041 item 4 regardless of its severity label.

1. F-R2-01, the surviving direction of round-1 C01 / F-S2-01: a fully framed data
   row placed above the header is dropped in silence and the run reports PASS
   with exit 0, even when that row is a confirmed, reproduced finding on
   `.ai/bin/protocol-verdict.cjs`. That is the single outcome PROTO-DEC-0041
   item 4 exists to prevent. Recorded as attempt 2 on RC-ledger-parse, which
   exhausts the two-attempt budget for that root cause.
2. F-R2-02, a regression introduced by this fix round: check 4 now classifies
   roles by bare substring over the prose of `.ai/TASK.md`, with no negation
   handling, and against the candidate's own tree it reports the designated
   standing certifier as the author of the candidate.
3. F-R2-03, an internal contradiction: check 2 rejects the candidate's own union
   ledger as a ledger defect, so the budget PROTO-DEC-0046 item 4 defines cannot
   be computed from the repository's only findings ledger.

## Findings ledger

| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |
|---|---|---|---|---|---|---|---|---|
| F-R2-01 | RC-ledger-parse | spec section 2 says a malformed ledger is not a pass; a framed row above the header is dropped and the run reports PASS | .ai/bin/protocol-verdict.cjs | node docs/research/2026-09-23-claude-round2/probes.cjs rowdrop | 0 | HIGH | confirmed | 2 |
| F-R2-02 | RC-role-prose-substring | spec section 6 item 3 and PROTO-DEC-0041 item 1; role exclusion is a bare substring over TASK.md prose, so it excludes the designated certifier and admits an undeclared author | .ai/bin/protocol-scope.cjs | node docs/research/2026-09-23-claude-round2/probes.cjs roleprose | 1 | MEDIUM | confirmed | 1 |
| F-R2-03 | RC-attempt-contiguity | spec section 4 and PROTO-DEC-0046 item 4; check 2 rejects the candidate's own union ledger because its first recorded attempt is 2 | .ai/bin/protocol-verdict.cjs, docs/reviews/2026-09-23-batch-findings.md | node docs/research/2026-09-23-claude-round2/probes.cjs contiguity | 2 | MEDIUM | confirmed | 1 |
| F-R2-04 | RC-arg-parsing | spec section 7 says the tools read and report; an unrecognised CLI flag is accepted in silence, so a typo changes which inputs govern the check | .ai/bin/protocol-scope.cjs | node docs/research/2026-09-23-claude-round2/probes.cjs flags | 0 | LOW | confirmed | 1 |

Running the check on this report agrees with the verdict recorded here.

    node .ai/bin/protocol-verdict.cjs docs/reviews/2026-09-23-claude-batch-certification-round2.md
    Verdict: FAIL   exit 1

Check 2 on this report returns exit 2, naming RC-ledger-parse attempts as
non-contiguous. That is F-R2-03 reproducing on this very file: a round report
recording only the attempt it made cannot satisfy the contiguity rule.

## F-R2-01, the surviving row-drop direction

Round-1 F-S2-01 was recorded as "ledger rows outside the leading/trailing pipe
form are dropped silently and the run reports PASS", and the union ledger folded
it into C01 as `fixed-and-verified` at attempt 1. Rows after the table are now
caught: a blank line, prose, a second table, a fenced block, an unframed row and
a bulleted row all exit 2. Rows before the header are not. The header search in
`.ai/bin/protocol-verdict.cjs:259-269` scans for the first framed line carrying
`id`, `root-cause` and `requirement`; every line before that index is discarded
without inspection, and the contiguity guard at line 367 fires only for lines
after the separator. Reproduction, on a ledger whose only confirmed finding sits
one blank line above the header and names a protected path neutrally:

    node docs/research/2026-09-23-claude-round2/probes.cjs rowdrop
    exit=0  Verdict: PASS
    control, the same row inside the table:
    exit=1  Verdict: FAIL

Severity HIGH: the row is confirmed, has a reproduction, and lies on
`.ai/bin/`, so rule 2 owes FAIL and returns PASS instead.

## F-R2-02, role classification by substring, a regression

At b232a9e the role matcher tested one word, `implementer`. This fix round added
`controller`, `coordinator`, `author`, `executor` and `pair` as bare
`String.prototype.includes` tests over role prose
(`.ai/bin/protocol-scope.cjs:318-330`). The candidate's own `.ai/TASK.md:50`
reads:

- claude: standing default certifier. Fills the first of the two independent
  reviewer slots required by PROTO-DEC-0041 item 2, for any candidate it neither
  authored nor controlled

"authored" matches, so the clause that establishes this session's independence is
read as proof that it is the author:

    node .ai/bin/protocol-scope.cjs --independence <a review by claude-*>
    FAIL (exit 1): Independence violation: Reviewer owner 'claude-round2'
    appears as author (claude) in .ai/TASK.md roles. (PROTO-DEC-0041 item 1)

Proved to be a regression by running the same review and the same TASK.md through
both revisions of the module:

    b232a9e (pre-fix):  exit=0  independent
    89ce192 (post-fix): exit=1  REVIEWER_EXCLUDED_BY_TASK_ROLE

The opposite direction is worse and is not covered by the limit the spec declares
in section 6. On a synthetic roles section, a genuine author and a genuine
executor pass, while the explicit statement of independence is excluded:

    zeta: wrote the package and dispatched the wave   exit=0  independent
    eta:  designed and built the candidate            exit=0  independent
    iota: neither authored nor controlled this one    exit=1  EXCLUDED
    kappa: implementer                                exit=1  EXCLUDED

Spec section 6 declares that the check cannot detect a reviewer who is
independent on paper and controlled in practice. It does not declare that the
check misreads plain role text in both directions. This is the class the union
ledger recorded as closed under C08, RC-text-as-judgement, in the other tool.

Two smaller divergences in the same block: the implementation excludes
`coordinator` unconditionally, while PROTO-DEC-0041 item 1 excludes a coordinator
only from certifying what it controlled and spec section 6 does not mention the
role; and on the real TASK.md the rule reported for `deepseek` is `implementer`,
taken from the VPN-stream line, not `controller`. The exit code is the same in
the second case, so that one is a naming defect only.

## F-R2-03, check 2 cannot read the repository's own ledger

Spec section 4 requires exit 2 for non-contiguous attempts and gives (1, 3) as
the example, a gap. The implementation
(`.ai/bin/protocol-verdict.cjs:574-582`) additionally requires every group to
begin at 1, so a ledger recording only the current attempt is a ledger defect:

    node .ai/bin/protocol-verdict.cjs docs/reviews/2026-09-23-batch-findings.md --stop-rule
    LEDGER ERROR (exit 2): Ledger defect: root-cause 'RC-immutability-boundary'
    has non-contiguous attempts [2]; expected contiguous sequence starting at 1.

    node .ai/bin/protocol-verdict.cjs docs/reviews/2026-09-23-batch-findings.md
    Verdict: PASS   exit 0

PROTO-DEC-0046 item 4 sets the budget as "at most two attempts, counted in the
findings ledger by root-cause and attempt, not by the number of reports", which
is exactly what check 2 computes, and it cannot be computed here. Either the
implementation must accept a ledger whose first recorded attempt is above 1, or
every ledger must restate the full attempt history of each root cause and the
union ledger is incomplete. Both artifacts are inside the candidate, so the
candidate is internally inconsistent. The implementer's journal reports only
"protocol-verdict on closed ledger: PASS (exit 0)", which is check 1.

## What was verified and holds

- Ledger zoo, 23 malformed shapes each hiding a confirmed `.ai/bin/` finding:
  all exit 2 with and without `--stop-rule`, none yields PASS. Covers missing
  and extra columns, empty table, duplicate ids, duplicate headers, unframed
  rows in both directions, blank and prose splits, a second table, fenced and
  tilde-fenced hidden rows, short cells, invalid `exit`, non-numeric and zero
  `attempt`, out-of-domain disposition and severity, a missing separator, an
  empty required cell, an empty file, a row inside an HTML comment, and a row
  written as a bullet.
- Path contract and protected set, 47 forms, every one with a neutral
  requirement: 20 rejected forms exit 2, covering POSIX absolute and root,
  drive absolute in both slash directions, drive-relative, UNC in both forms,
  a leading backslash, leading, middle and trailing `..`, `..` reachable only
  after backslash normalisation, bare `..`, `.`, `./` and `./.`. Fourteen
  protected forms return FAIL and thirteen unprotected forms return
  RECOMMENDATION, including `tests/` and `tests`, the substring neighbours
  `validate-protocol.ps1.bak`, `xvalidate-protocol.ps1`, `.aix/y`,
  `.ai-notes/y` and `templates/reviews/REVIEW.md.orig`, and the concept names
  `validator`, `manifest`, `core` and `hooks`.
- Manifest, 15 shapes: absent, empty, invalid JSON, array, null, string, empty
  object, each key missing, each key an empty array, wrong type, and non-string,
  blank or null entries all fail closed at exit 2. Discovery does not borrow an
  ancestor's manifest and a nested manifest does not shadow the repository root.
  The tool hard-codes none of the candidate's own paths: against a foreign
  manifest, `validate-protocol.ps1` is correctly unprotected.
- Determinism: three ledgers, each run twice and then again with the ledger and
  manifest modification times swapped; stdout and exit code identical every time.
- Immutability, both directions on disposable fixtures against the candidate's
  real validator: an inserted bare `---`, an altered heading, a trailing space on
  the approval line and an edit after an internal separator are each caught at
  exit 1; a lawful append with a separator, a lawful append without one, and a
  genuine trailing separator alone are each accepted at exit 0. Removing a
  genuine trailing separator is not reported, which is consistent with treating
  that separator as document structure rather than block content.
- Independence derivations: producer taken only from declared inputs, no
  basename fallback, a 40-hex SHA refused as an owner, and an undeterminable
  owner on either side exits 2.
- Scope: the scope and forbidden input files do not exempt themselves from the
  touched set; untracked files are included; diagnostics carry no absolute path;
  a missing scope file, an unresolvable baseline and a scope file with no
  declared paths each exit 2.
- Round-1 C09 closed: the path alphabet accepts Unicode and `+`. A backticked
  token containing a space is still not a path, by design; that output is
  advisory in any case, never Evidence.
- Specification alignment: the old claim that the protected list came verbatim
  from PROTO-DEC-0038 item 1 is gone, and sections 2, 3 and 6 now match
  PROTO-DEC-0046 items 2 and 3 and the implemented behaviour.

Checks run by this session on the candidate tree, quoting only measured output:

    powershell -ExecutionPolicy Bypass -File ./validate-protocol.ps1
    Protocol OK. 0 warning(s).   exit 0
    46 committed decision blocks are unchanged

    powershell -ExecutionPolicy Bypass -File ./test-protocol.ps1
    tests 371   pass 371   fail 0   exit 0   duration 304s

## Observations, not blocking

- Rule 3 still classifies by regex over the free text of the `requirement` cell
  (`.ai/bin/protocol-verdict.cjs:505-510`). Spec section 3 was amended in this
  round to describe exactly that, so the two agree, and misclassification tends
  toward FAIL. The residual gap runs the other way: a reproduced violation of a
  recorded rule, off protected paths, whose requirement avoids the words
  "invariant" and "contract", is returned as RECOMMENDATION.
- Disposition and severity are matched case-insensitively, and a ledger whose
  header and rows carry the same extra column parses. Neither yields PASS on a
  confirmed protected-path finding, and spec section 2 forbids neither. Where
  the certification prompt asked for exit 2 here, the repository says otherwise
  and the repository wins.
- A manifest entry naming a directory without a trailing slash protects the
  directory node but not its contents. Every `managed` and `source` entry in
  this candidate is a file, so there is no live gap; an installed project
  declaring its own set could hit it.
- The union ledger's C06 note cites `.ai/bin/protocol-scope.cjs` line 301 for the
  item-1 exclusion. Line 301 is the unknown-owner throw; the exclusion is at
  lines 304-334 and 349-360. Spec line 167 is likewise one line above the clause
  cited. Documentation only.
- `node .ai/bin/protocol-session.cjs prune` deleted three tracked empty journals
  and this session's own journal, which SessionStart had just created. The
  tracked deletions were restored with `git checkout` and the journal recovered
  from `.ai/runtime/pruned/`, so the tree is unchanged.
  `.ai/bin/protocol-session.cjs` is not part of this candidate's diff, so this
  is pre-existing and outside the scope of this certification.

## Required to clear

F-R2-01 and F-R2-02 must be fixed, and F-R2-03 resolved in one direction or the
other with the losing artifact corrected. RC-ledger-parse is now at attempt 2, so
under the PLAN escalation budget and PROTO-DEC-0046 item 4 a third failure on that
root cause stops the work and returns the area to the owner. Reproductions:
docs/research/2026-09-23-claude-round2/probes.cjs, groups `rowdrop`, `roleprose`,
`contiguity`, `flags`, `zoo`, `paths`, `manifest`, `all`.
