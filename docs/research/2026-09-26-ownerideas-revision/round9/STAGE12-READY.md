# Stage 12 ready - F-01 closure handoff (owner-run in the cloud)

Program: F-01 "OwnerIdeas revision and implementation", stream S1,
`docs/research/2026-09-26-ownerideas-revision/`. Stage 11 and stage 12 verdicts are in
(Sol PASS, DeepSeek PASS); the candidate is frozen, the handoff is pushed, and the operator
announces the handoff commit SHA. This file is the input for the cloud closure of F-01.

## Candidate and commits
- Frozen CANDIDATE (normative freeze): `7f199c5` - round-3 repairs (PKG-2 R2-1..R2-4; usage and
  cost per attempt; PKG-1 S8, PKG-3 S8, PROTO-DEC-0075 item 9). Nothing normative after it:
  `git diff 7f199c5..HEAD -- .ai/bin tests docs/specs .ai/docs protocol-manifest.json` is empty;
  later commits carry journals, reports and this file only.
- Checkpoints after the freeze: `a4c286c` USAGE.md at the frozen candidate; `e11907a`
  FINAL-DEEPSEEK.md; `a421d14` kilo journal - morning answers; `b81014b` kilo journal - full
  evidence record; the handoff commit (this file + the re-recorded journal), SHA in `git log -1`.
- Base of the cloud-review snapshot: `1fd27ce` (checkpoint, stages 8-11 in flight).

## Local lane (frozen tree)
- `validate-protocol.ps1`: exit 0; `test-protocol.ps1`: exit 0 (full suite).
- Evidence: `.ai/worklog/kilo-f22faac486b5e567.md` carries a FULL `protocol-handoff.cjs record`
  (not `--quick`); `protocol-handoff.cjs verify` says "matches" on the pushed handoff HEAD.

## Receipt to append (STOP-7; R-L0-22.56-22.67)
- Append to the F-01 row in `docs/research/FRAMES.md` and to `docs/research/CLOSURES.jsonl`:
  `receipt: CR-F01-1 <sha> K:n C:n A:n D:n R:n T:n`, then set the counter row
  `Closed frames without a receipt` from 1 to 0. Apply under the shared-document lock; one apply
  commit per closure (R-L0-22.65); the receipt row is appended after that commit exists.
- `<sha>` = the commit that applied the F-01 closure disposition (first-pass precedent:
  `.ai/runtime/closure-shas-*.json`). A wrong receipt is corrected only by an appended line that
  names the receipt it supersedes.
- K/C/A/D/R/T are the disposition tally (KEEP_ACTIVE, CANONICALIZED, ARCHIVE, DELETE, REPAIR,
  TRANSFER per R-L0-22.58) of the F-01 artifact set built at apply time (R-L0-22.57). No ready
  counts file exists - compute, do not reuse first-pass numbers. Computing path (first pass,
  untracked, `.ai/runtime/` is disposable): `closure-scan.cjs` (artifact set + active bytes),
  `apply-closure.cjs` (apply commit + archive INDEX row), `closure-receipts.cjs` (receipt line,
  FRAMES fields, counter). Tally inputs for F-01: the declared artifact plans in
  `round6/packages/PKG-1..5.md` plus the frame directory itself.
- If stage 12 ends NOT_CLOSED: F-01 becomes TRANSITION-PENDING (STOP-7).

## Verdicts and certifications (frozen candidate)
- Stage 11: `round9/VERIFY-SOL.md` - Verdict PASS (GPT-5.6 Sol).
- Stage 12: `round9/FINAL-DEEPSEEK.md` - Verdict PASS, F-1..F-5 closed; accepted as-is (`e11907a`)
  with the recorded deviation: two `Verdict:` lines (header and closing, both PASS) and the items
  in sections 7 and 9.
- Certifiers (`round8/`): `CERT-KIMI.md` - PKG-1/2/3/5 PASS, PKG-4 STATEMENT; `CERT-MIMO.md` -
  PKG-2 FAIL in round 1 (adjudicated by reproduction in r9d/r9e); `CERT-KIMI-PKG2-R3.md` and
  `CERT-MIMO-PKG2-R3.md` - PKG-2, PKG-1 and PKG-3 round-3 PASS incl. the named S8 items;
  PKG-5 keeps its round-1 verdict (not re-opened).
- Open owner decisions do NOT block (STOP-8): OQ-1, OQ-2, OQ-3, the F-02 gate and the DeepSeek
  identity mapping stay open; list them in the closure report.

## Morning answers (owner, 2026-09-27)
- Recorded in `.ai/worklog/kilo-f22faac486b5e567.md`, commit `a421d14` (STOP-7, STOP-8, the
  codex-parser exception - codex token figures in USAGE/RUNS are unreliable until the OPS-1 W0
  fix - FINAL-DEEPSEEK accepted as-is, cost-routes GAPS section 6 outside this closure).

## Worktrees and processes
- `git worktree list` (verbatim, taken at `b81014b`; the first row advances with the handoff):
D:/Colabs                              b81014b [v2.0.0]
D:/Colabs/.kilo/worktrees/equinox-path d38d2f2 (detached HEAD)
D:/Colabs-cert/claude                  b232a9e (detached HEAD)
D:/Colabs-cert/claude2                 89ce192 (detached HEAD)
D:/Colabs-cert/claude3                 4ded1be (detached HEAD)
D:/Colabs-cert/codex                   b232a9e (detached HEAD)
D:/Colabs-cert/codex2                 89ce192 (detached HEAD)
D:/Colabs-cert/codex3                 4ded1be (detached HEAD)
D:/Colabs-cert/mistral-shadow          4ded1be (detached HEAD)
- `equinox-path` is NOT part of this program (its commits are H1 pilot / Track C audit work); it is
  a clean detached HEAD at d38d2f2 and is left untouched - the owner decides whether to remove it.
  `Colabs-cert/*` are the detached certifier checkouts for this program.
- no running sessions or test processes.
