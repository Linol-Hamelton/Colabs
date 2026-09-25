# Round-3 certification of the PROTO-DEC-0046 batch candidate

Mode: CERTIFYING
Receipt-Owner: claude-5650b3506c953480
Reviewer model: Claude Opus 5
Date UTC: 2026-09-23
Slot: 1 of 2 under PROTO-DEC-0041 item 2, standing default certifier
Reviewed commit: 4ded1bee1c2acf2392fdeededf50935f59138302
Worktree: D:/Colabs-cert/claude3
HEAD at start: 4ded1bee1c2acf2392fdeededf50935f59138302
Git status at start: clean except one untracked session journal
HEAD at end: 4ded1bee1c2acf2392fdeededf50935f59138302
Git status at end: recorded in the closing section of this file
Scope: contract conformance of the second remediation round against the recorded rules, with neutral requirements on every path probe
Verdict: FAIL
Reproductions: docs/research/2026-09-23-claude-round3/probes.cjs

## Findings ledger

| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |
|---|---|---|---|---|---|---|---|---|
| F-R3-01 | RC-stoprule-collection-scope | Spec section 4 records the collection set as all findings ledgers under docs/reviews/ plus the target; the implementation also scans the target's own directory, an unrecorded source that can close a gap in the union | .ai/bin/protocol-verdict.cjs | node docs/research/2026-09-23-claude-round3/probes.cjs stoprulescope | 0 | MEDIUM | confirmed | 1 |
| F-R3-03 | RC-producer-record-absent | AGENTS sections 4, 5 and 7 require the producing session to write one journal entry with an Evidence block; nothing anchors 89ce192 or 4ded1be, so spec section 6 step 2 has no input | .ai/worklog, docs/reviews/2026-09-23-batch-findings-round3.md | node docs/research/2026-09-23-claude-round3/probes.cjs producer | 2 | HIGH | confirmed | 1 |
| F-R3-02 | RC-role-token-vocabulary | Spec section 6 item 3 records exact role tokens and one phrase; the matcher also fires on authored, controlled and a bare executing pair, admits without as a negation, and reverses a negation after but or however | .ai/bin/protocol-scope.cjs | node docs/research/2026-09-23-claude-round3/probes.cjs roletokens | 0 | LOW | confirmed | 1 |
| F-R3-05 | RC-immutability-trailing-whitespace | AGENTS section 6 append-only rule; blank lines added between a committed block's last line and its separator are normalised away and never reported | validate-protocol.ps1 | node docs/research/2026-09-23-claude-round3/probes.cjs immutability | 0 | INFO | confirmed | 1 |
| F-R3-04 | RC-ledger-reproduction-unresolvable | Spec section 2 makes reproduction a required field holding the exact command and check 1 consults it; 14 of 17 rows in the two repository ledgers name a script that is not in the repository | docs/reviews/2026-09-23-batch-findings-round3.md, docs/reviews/2026-09-23-batch-findings.md | node docs/research/2026-09-23-claude-round3/probes.cjs ledgerrepro | 0 | MEDIUM | confirmed | 1 |

## What the four remediated findings now do

All four round-2 findings are closed by execution, and I say so before the new ones
because the round should not be re-opened on them.

F-R2-01, RC-ledger-parse, attempt 2 of 2, the last: closed. Twenty-five shapes were run
against `protocol-verdict.cjs`, each with and without `--stop-rule`, in an isolated
fixture repository with its own `.git` and a copy of the manifest. A framed data row
above the header, a list-form row, an inline-code row, a blockquote row, an HTML-comment
row, a heading-form row, a four-space-indented row, an unframed pipe row, a
metadata-shaped line carrying pipes, a backtick fence, a tilde fence and an
info-string fence all exit 2, above the table and below it alike. A row between the
header and the separator exits 2. A second full table exits 2. Plain prose before the
header exits 2. No silent-drop direction survived. The root cause is closed on attempt 2
and does not return to the owner.

Two shapes exit 0 and are correct rather than dropped: a `Key: Value` line before the
header that carries no pipes, which spec section 2 line 90 admits as document metadata,
and prose or notes after the table that contain no row. Nothing is discarded in either.

F-R2-03, cross-file counting: closed, and the recorded rule is not wider than the owner
decision. The repository's own two ledgers now satisfy the stop rule, exit 0 over 13
root-cause groups. A single-file gap of 1 and 3 exits 2, a single file whose only attempt
is 2 exits 2, a union that still leaves 1 and 3 exits 2, a union that closes the gap
exits 0, identical duplicate pairs merge and exit 0, conflicting dispositions for one
pair exit 2, a third contiguous attempt exits 1 and names the group, and a malformed
sibling ledger exits 2 even when the target itself is clean. Files not named for findings
are not collected, and the archive subdirectory is not recursed.

F-R2-02, role exclusion: the regression is gone. With the real `.ai/TASK.md` of this
tree, a review whose `Receipt-Owner` is a `claude-` session is independent, exit 0, while
the declared implementer is excluded by name, exit 1. Only the structured `## Roles`
section is read: the prose of `## Current state`, which names Claude as author and
controller in other people's sentences, is not scanned. A declared author is excluded and
the four recorded negation forms all pass.

F-R2-04, unknown flags: closed. Both tools exit 2 on an unknown long flag, an unknown
short flag, a valued form of a known flag, a wrong-case flag, an extra positional
argument, a flag missing its value, and no arguments at all.

## Keep-verified classes, re-tested by execution

Path alphabet, 26 of 26 correct. Relative forms with backslashes, a leading `./`, spaces
and non-ASCII characters normalise; POSIX roots, UNC in both slash directions, `X:`,
`X:path`, drive-with-backslash, every `..` position before and after normalisation, a
bare dot and a bare `./` all raise the row as unparseable. The index alphabet accepts
Unicode and `+` and still rejects angle-bracket placeholders.

Manifest fail-closed, 19 of 19 correct. Absent, empty, non-object, invalid JSON, missing
`managed`, missing `source`, empty arrays, wrong-typed arrays and non-string entries all
exit 2. A nested repository without its own manifest does not borrow an ancestor's, exit
2. A manifest planted in a subdirectory of a repository does not shadow the root one. The
protected set is whole paths and directory prefixes only: `tests/` is not protected, a
substring lookalike is not protected, and a LOW finding on `.ai/bin/` is still FAIL.

Verdict arithmetic, 10 of 10 correct in rule order. Unresolved blocks, a confirmed
reproduced row on a protected path fails regardless of severity, a mixed row with one
protected path fails, an off-protected row recording an invariant or contract violation
fails, a negated invariant does not, a confirmed row whose reproduction is none stays at
RECOMMENDATION and is named in the output, and refuted or fixed-and-verified rows on
protected paths pass.

Touched-set completeness. Tracked modifications and untracked files are both in the set,
the scope and forbidden input files do not exempt themselves, and a path with Cyrillic and
diaeresis characters is still reported verbatim with `core.quotepath` set to true, which
is the defect that failed the layers A/B/C round. A prefix is not a directory match, an
exclusion normalises a trailing slash, and the standing default forbidden list catches
`.ai/bin/`. Every diagnostic is repository-relative.

Decision-block immutability, both directions. A lawful append now exits 0 with only the
registry warning, which closes the defect recorded as the last entry of TASK Open
questions. A one-character change in an old block, a trailing space, an inserted blank
line inside a block body, an inserted separator inside a block body, a blank line at end
of file and a deleted block are all reported. The single tolerated shape is F-R3-05.

Independence, seven probes. An owner name that exists only inside a fenced example in the
candidate journal is not read, exit 2; the same identity unfenced resolves, exit 0. A
reviewer equal to the producer exits 1, a reviewer holding a declared excluded role exits
1, a missing `Receipt-Owner` exits 2, a `Receipt-Owner` reachable only inside a fence
exits 2, and a forty-hex commit SHA is refused as an owner name, exit 2.

Checks run by me on this tree: `validate-protocol.ps1` exits 0 with 0 warnings, and
`test-protocol.ps1` result is recorded in the Evidence block of my journal entry rather
than quoted here, because a number I paste is a claim and the block is a record.

## Why the verdict is FAIL

Three of the five rows sit on protected paths with a reproduction, so PROTO-DEC-0041
item 4 decides without consulting severity. None of them is a round-2 finding reopened;
all five are new root causes at attempt 1, so the escalation budget is untouched.

F-R3-01 is the one that matters most. Spec section 4, as amended by this candidate,
records exactly one collection source for the union: findings ledgers under
`docs/reviews/`, plus the target. The implementation adds two more, the target's own
directory and a `docs/reviews` beneath it. A reviewer who keeps a ledger outside
`docs/reviews`, which is what the round-3 ledger's own Sources line says the Codex slot
did, gets a union computed over a set nobody declared. The probe shows the permissive
direction: a required exit 2 becomes exit 0 because an undeclared sibling supplied the
missing attempt 1. Spec section 7 forbids introducing a rule, and this is one.

F-R3-03 is a governance gap, not a code defect. The second remediation round wrote no
journal entry and left no Evidence block anchored at either 89ce192 or 4ded1be; the newest
Gemini journals cover attempt 1 and the b232a9e round, and the archived F-001 to F-004
entry is anchored at 82bf99a. The dispatch that reached me says the implementer recorded
its claims in its session journal. The repository says otherwise, and the repository wins.
The practical consequence is executable: the candidate's own Check 4 cannot be satisfied
from repository state, because spec section 6 step 2 has no producer journal to read.

F-R3-02 is small and conservative in direction, and I record it because the rule it
departs from was written down by the owner on the same day, for this exact check, after
this exact check misfired once. The recorded set is exact tokens. The matcher is stems
plus an unrecorded negation vocabulary. It currently reaches the right answer on the real
roles file, but it reaches it by a rule that is not the one recorded.

F-R3-05 predates this candidate. It reproduces unchanged against the validators at
89ce192 and b232a9e, so it is not a regression of the fix and the owner may well scope it
out. It is in the ledger because it is reproduced and on a protected path, and because
deciding that for the owner is not my job.

F-R3-04 is off protected paths and the arithmetic puts it at RECOMMENDATION, correctly.
It is still the reason I persisted my own reproductions as a script in the repository
instead of citing a path in a temporary directory.

## Disagreements with the dispatch, and with the tool

The dispatch names `docs/reviews/2026-09-23-claude-batch-certification-round2.md` as a
claim under test. That file is not in this worktree and has never existed on any branch
of this repository. The round-3 ledger names it as a source. I could not test it, and the
four F-R2 findings were reconstructed from the round-3 ledger rows alone.

The dispatch says `docs/reviews` stands at 60 active files, at the cap. It stood at 59
files and 592,028 bytes when I started. This report is the sixtieth, which meets the cap
rather than breaching it, and leaves the byte budget with room.

I ran `protocol-verdict.cjs` on this file. It agrees with my verdict: FAIL, exit 1,
naming F-R3-01, F-R3-03, F-R3-02 and F-R3-05 as the driving rows and not consulting
severity. The exact output is in my journal entry. There is no disagreement to record.

Two observations about the tool that are not findings. First, a certification report that
carries ledger rows is invisible to `--stop-rule` unless its filename contains the word
findings, so certifier attempts do not enter the union by default; that follows from the
recorded rule rather than departing from it. Second, the preamble rule of spec section 2
means a findings ledger cannot carry a prose abstract above its table, which forces a
report like this one to put its table first and all of its reasoning after; that is a
consequence worth knowing before the shape spreads to other reviews.

## What would close this

Narrow the collection in `--stop-rule` to the recorded source, or record the wider source
in the spec and have the owner approve the widening. Have the producing session write its
journal entry and receipt for the tree at 4ded1be, or have the owner accept a named
substitute. Replace the role stems and the unrecorded negations with the exact tokens the
owner wrote down, or record the vocabulary actually intended. Decide whether F-R3-05 is in
scope at all. F-R3-04 needs the round-2 report and the probe scripts moved into the
repository, which is a coordinator action rather than an implementer one.

Git status at end: one untracked session journal under `.ai/worklog/`, this report, and
`docs/research/2026-09-23-claude-round3/probes.cjs`. Nothing tracked was modified; the
tools, the spec, the validator, the tests and every shared document are byte-identical to
4ded1be.
