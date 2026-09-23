# Claude - PROTO-DEC-0046 batch certification (slot 2)

Mode: CERTIFYING
Receipt-Owner: claude-b2f03ba7c2ab2bb6
Reviewer model: Claude Opus 5 (`claude-opus-5`)
Date (UTC): 2026-09-23
Producer: gemini (implementer per `.ai/TASK.md` roles); coordinator DeepSeek
Reviewed commit SHA: `b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed` (detached, worktree `D:\Colabs-cert\claude`)
Working tree at start: dirty (untracked session journal only)
Angle: adversarial negative testing and internal consistency (slot 2); no peer report read.
Capabilities: FS_WRITE, SHELL_EXEC, EVIDENCE_SIGN, REPO_READ

## Verdict

FAIL

Two reproduced defects lie on protected paths (`.ai/bin/protocol-verdict.cjs`,
`validate-protocol.ps1`). Under PROTO-DEC-0041 item 4 they block regardless of the
severity label, and neither may be lowered to RECOMMENDATION.

## Tree state snapshots

Start:

```
$ git rev-parse HEAD
b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed
$ git status --porcelain
?? .ai/worklog/claude-5bfad735458a7c56.md
```

End: recorded in `.ai/worklog/claude-b2f03ba7c2ab2bb6.md`. This session added only this
review, one archived review plus its INDEX row, and its own journal; no tracked candidate
file was modified.

## Checks run in this worktree

| check | result |
|---|---|
| `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` | exit 0, `Protocol OK. 0 warning(s).` |
| `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` | exit 0, `# pass 362 # fail 0`, 273.6 s |
| `node .ai/bin/protocol-scope.cjs --baseline 82bf99a --scope <touched set>` | exit 1, 0 out-of-scope, 8 forbidden (below) |

Scope measurement: 44 touched paths from the pre-change baseline `82bf99a` (tracked diff
plus untracked, `-z`/NUL). No path is out of scope. Eight match the standing default
forbidden list: `.ai/DECISIONS.md`, `.ai/bin/protocol-scope.cjs`,
`.ai/bin/protocol-verdict.cjs`, `docs/decisions/REGISTRY.md`, `protocol-manifest.json`,
`tests/rulebook.test.cjs`, `tests/validator.test.cjs`, `validate-protocol.ps1`. All eight
are exactly the surface PROTO-DEC-0046 items 2/3/5 authorise. The exit 1 records the
absence of a Phase 0 frame declaring that authorised exception, not an unauthorised touch.

## Findings ledger

| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |
|---|---|---|---|---|---|---|---|---|
| F-S2-01 | RC-row-drop | ledger rows outside the leading/trailing pipe form are dropped silently and the run reports PASS | .ai/bin/protocol-verdict.cjs | node .ai/bin/protocol-verdict.cjs D:/tmp/cert2/zoo/z11-notrailpipe.md | 0 | HIGH | confirmed | 1 |
| F-S2-02 | RC-hr-normalise | committed decision blocks accept an inserted or removed `---` line undetected | validate-protocol.ps1 | powershell -ExecutionPolicy Bypass -File ./validate-protocol.ps1 | 0 | HIGH | confirmed | 1 |
| F-S2-03 | RC-exit-field | the `exit` cell is a rule 1 input but is never checked against the recorded field domain | .ai/bin/protocol-verdict.cjs | node .ai/bin/protocol-verdict.cjs D:/tmp/cert2/zoo/z06-bad-exit.md | 0 | LOW | confirmed | 1 |
| F-S2-04 | RC-substring-word | rule 1 matches a bare word inside the reproduction cell and accepts a disposition outside the recorded list | .ai/bin/protocol-verdict.cjs | node .ai/bin/protocol-verdict.cjs D:/tmp/cert2/misc/m1-word-probe.md | 2 | LOW | confirmed | 1 |
| F-S2-05 | RC-test-gap | no test binds the dropped-row class, the excluded `tests/` class, or the root-prefixed form | tests/rulebook.test.cjs | node --test tests/rulebook.test.cjs | 0 | MEDIUM | confirmed | 1 |

### F-S2-01 - malformed ledger rows are dropped, and the run reports PASS (BLOCKING)

`parseFindingsLedger` accepts a line only when it both starts and ends with `|`
(`.ai/bin/protocol-verdict.cjs:251`), and breaks out of the table on the first blank line
once a row exists (`:253`). Every other line is `continue`d, silently. A confirmed,
reproduced finding on a protected path therefore disappears and the tool prints
`Verdict: PASS` / `No blocking or advisory findings detected.` / exit 0. Three inputs, each
a single-character or single-blank-line slip a reviewer makes by hand:

```
$ node .ai/bin/protocol-verdict.cjs D:/tmp/cert2/zoo/z10-noleadpipe.md   # row lacks leading |
Verdict: PASS / No blocking or advisory findings detected. / exit=0
$ node .ai/bin/protocol-verdict.cjs D:/tmp/cert2/zoo/z11-notrailpipe.md  # lacks trailing |
Verdict: PASS / exit=0
$ node .ai/bin/protocol-verdict.cjs D:/tmp/cert2/zoo/z12-blankline.md    # blank line first
Verdict: PASS / exit=0
```

In each ledger the dropped row is
`F-2 | RC | CLI check | .ai/bin/x | node x | 1 | LOW | confirmed | 1`. The leading-pipe case
is worse than a typo: that is a valid GitHub-flavored markdown table row, so a human reads
three rows and the tool reads two.

Check 2 is defeated the same way. `D:/tmp/cert2/stop/s10-drop3.md` holds attempts 1, 2 and
3 on one root cause, the attempt-3 row lacking only its trailing pipe; `--stop-rule` prints
`PASS: Root-cause stop rule satisfied across 1 group(s); no root cause reached attempt 3.`
and exits 0.

Recorded requirements violated: spec section 7, "Not treat a missing file, an empty
directory or an unparseable ledger as a pass"; spec section 2, "A malformed ledger is not
a pass"; spec section 3, "Output names every row that drove the verdict". The path is
protected, so PROTO-DEC-0041 item 4 applies: this is the erroneous non-blocking verdict
that item 4 exists to prevent.

### F-S2-02 - the immutability fix weakens the immutability check (BLOCKING, regression)

`validate-protocol.ps1:999,1003` now strips a trailing `---` from each block body before
comparison, on both the committed and the current side. In `(?ms)` mode `$` matches at
every line end and `\s*` spans newlines, so the replacement removes *any* `---` line
followed by whitespace, in both bodies, everywhere - not only a trailing separator. An
inserted or deleted `---` inside an already-written block is therefore invisible.

Disposable fixture: `git archive HEAD` into `D:\tmp\immrepo`, `git init`, one commit;
baseline there is `Protocol OK. 0 warning(s).`, exit 0.

```
# insert a --- line before the Approved by: line of committed PROTO-DEC-0046
$ git diff --stat -- .ai/DECISIONS.md
 .ai/DECISIONS.md | 2 ++
$ powershell -ExecutionPolicy Bypass -File ./validate-protocol.ps1
Protocol OK. 0 warning(s).
exit=0
```

Same edit, with `validate-protocol.ps1` restored from `82bf99a` and nothing else changed:

```
[FAIL] PROTO-DEC-0046 was edited after it was written; a decision block is never rewritten
Protocol BROKEN. 1 failure(s), 0 warning(s).
exit=1
```

So the pre-batch validator caught it and the candidate does not: a reproduced regression.
Deletion is masked symmetrically - removing the internal `---` line (and its blank line)
from a committed block leaves `git diff` showing `1 file changed, 2 deletions(-)` while
the validator reports `Protocol OK`, exit 0.

The weakening is bounded: `\s*` matches only whitespace, so no prose can be altered
undetected. It is still a weakening, and `.ai/TASK.md` records the constraint explicitly -
"the immutability rule itself must not be weakened to fix it" - against AGENTS section 6
("a written block is never edited again") and section 12. A `---` inserted before an
`Approved by:` line renders the approval as detached from the block it approves.

The three intended directions do work, verified on the same fixture: append a new block
after a committed last block -> exit 0 (the original defect is fixed); edit text after an
internal `---` -> exit 1; edit text before an internal `---` -> exit 1; delete a whole
block -> exit 1 (`PROTO-DEC-0047 was deleted`).

### F-S2-03 - the `exit` cell is a verdict input and is never validated

Spec section 2 records `exit` as "that command's exit code, or `n/a`", and rule 1 reads it
(`.ai/bin/protocol-verdict.cjs:339`). `severity`, `disposition` and `attempt` are each
checked against their domain; `exit` is checked only for emptiness.

```
$ node .ai/bin/protocol-verdict.cjs D:/tmp/cert2/zoo/z06-bad-exit.md   # exit cell is 'banana'
Verdict: RECOMMENDATION
exit=0
```

It cannot by itself turn a protected FAIL into a pass, which is why it is the weakest of
the three; it is nevertheless a reproduced deviation from the recorded contract on a
protected path.

### F-S2-04 - substring matching on the reproduction cell, and an unrecorded disposition

Rule 1 applies `/unrunnable/i` to the whole `reproduction` cell (`:341`), so a refuted
row whose command merely contains that word forces BLOCKED:

```
$ node .ai/bin/protocol-verdict.cjs D:/tmp/cert2/misc/m1-word-probe.md
Verdict: BLOCKED
Driving finding(s):
  [F-1] ... disposition: refuted, repro: node t.cjs --case unrunnable-path
    -> Reason: check recorded as unrunnable
exit=2
```

`unrunnable` is also accepted as a `disposition`, outside the five values spec section 2
records. Both err toward BLOCKED, the safe direction, so neither can hide a defect; but
concept-name substring matching is the class PROTO-DEC-0046 item 3 ruled out for paths,
and the disposition vocabulary is a recorded contract the implementation widened. The
first draft of the ledger above tripped this rule on its own F-S2-04 reproduction path,
which is how cheaply it fires.

### F-S2-05 - test adequacy against PROTO-DEC-0046 item 5

`tests/rulebook.test.cjs` passes the adequacy test asked of it on the protected-path
classes: every negative protected-path case uses a neutral `requirement`
(`CLI check`, `CLI script check`, `validation script`), so none is rescued by rule 3 -
were path recognition broken, each would fall to RECOMMENDATION/0 and the `status === 1`
assertion would fail. `F-005` correctly pairs `reproduction: none` with a requirement that
does name an invariant, and still expects RECOMMENDATION. The fixture copies the real
`protocol-manifest.json`, so `F-P04`/`F-P05`/`F-P06` genuinely exercise the run-time
manifest read rather than a hard-coded list.

Gaps: no test asserts that `tests/` is *not* protected, though PROTO-DEC-0046 item 3
states it; no test covers the root-prefixed `\.ai\bin\x` form the code rejects; and the
malformed-ledger test covers missing column, duplicate id and invalid severity but not the
dropped-row class, which is why F-S2-01 shipped.

## What holds

Verified by direct probe, all deterministic (every check run twice, byte-identical
stdout and exit; scope check re-run after `touch`ing input mtimes - identical).

- Path contract (PROTO-DEC-0046 item 2), 22 forms: every rejected form exits 2 -
  `/home/u/...`, `D:/...`, `D:\...`, `D:.ai/...`, `c:.ai/...`, `\\server\share\...`,
  `//server/share/...`, `\.ai\bin\x`, `../...`, `x/../...`, `.ai/bin/../bin/x`,
  `..\...`, `x\..\...`, `./../...`, `.`, `..`, `.//.ai/...`, and a multi-path cell
  where only the second path is bad. Accepted forms normalise and classify:
  `.ai\bin\...`, `./.ai/bin/...`, `.ai//bin//x`, `.AI/BIN/X`, `.ai`, leading whitespace.
  `%2e%2e` is not decoded - no lexical canonicalisation, as item 2 requires.
- Protected set (item 3) read at run time from the manifest: `.ai/`, `.claude/`,
  `.codex/`, `validate-protocol.ps1`, `protocol-manifest.json`, and the `source` entry
  `setup-ai-protocol.ps1` and `templates/reviews/REVIEW.md` all FAIL/1 on a neutral
  requirement. Off-protected controls stay RECOMMENDATION/0: `tests/rulebook.test.cjs`
  (item 3's explicit exclusion), `docs/security/data-notes.md`,
  `docs/validate-protocol.ps1.md`, `protocol-manifest.json.bak`, `.aixx/bin/x`,
  `src/.ai/bin/x`. No substring or concept name protects anything.
- Severity independence: HIGH / MEDIUM / LOW / INFO and lowercase variants on the same
  row give the same exit - 1 on a protected path, 0 off it. A confirmed row with
  `reproduction: none` on a protected path with an "invariant"-naming requirement stays
  RECOMMENDATION/0 and says so.
- Malformed ledger zoo: missing column, empty table, duplicate id, non-numeric `attempt`,
  `attempt` 0 or `+1`, unknown disposition - all exit 2. `CONFIRMED` in upper case on a
  protected path still FAILs.
- Stop rule: 2 attempts pass/0; a third exits 1 and names the group; `(1,3)`, a group
  starting at 2, and a lone attempt 5 all exit 2 as ledger defects.
- Check 3: untracked files are in the touched set; a non-ASCII untracked path
  (`docs/Битва-за-луну.md`) and a non-ASCII tracked modification (`docs/Луна.md`) are both
  named, not dropped; a prefix is not a directory match; missing baseline, missing scope
  file, empty scope file and a missing `--baseline` each exit 2.
- Check 4: `Receipt-Owner` equal to the producer exits 1; a reviewer named implementer in
  `.ai/TASK.md` roles exits 1; the producer is derived only from declared inputs
  (`--producer`, a `Producer`/`Candidate` header, or a named candidate journal's receipt
  owner) and an undeterminable owner on either side exits 2. mtime is never consulted.
- Spec-vs-code consistency: old line 89 ("Protected paths, taken verbatim from
  PROTO-DEC-0038 item 1") is replaced by the PROTO-DEC-0041 item 4 statement with the
  run-time manifest set, matching PROTO-DEC-0046 item 3 including the `tests/` exclusion;
  the section 2 paths paragraph matches item 2; section 5 now records the untracked-files
  addition that check 3 implements. The remaining spec-vs-code divergences are F-S2-03
  and F-S2-04.

## Conditions for a PASS on the next round

1. Close F-S2-01: a ledger line inside the table that does not parse as a row must exit 2,
   and no row may be discarded without being named. Bind a test to each input above.
2. Close F-S2-02 without weakening immutability: normalise only one trailing separator at
   the very end of a body, anchored to the end of the string, not every `---` line. Add a
   negative test for the inserted and deleted internal `---`.
3. F-S2-03 and F-S2-04 are recommendations on their own; they lie on a protected path and
   should be closed in the same round rather than deferred.

## Limits of this review

A `0` from check 4 is the absence of a detectable violation, not proof of independence; the
tools were probed, not proved. This review fills one of the two independent slots
PROTO-DEC-0041 item 2 requires and closes nothing on its own.
