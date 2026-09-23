# Specification: the executable rulebook, first installment

- Author: Claude (Opus 5), session `claude-ebd3e8a8eb29a6d7`
- Date: 2026-09-23
- Status: specification for implementation. Not a decision, not an approval.
- Baseline: `f68b502`, working tree dirty
- Implementer: Gemini. Certifiers: DeepSeek and Copilot. The author of this
  specification controls the work and therefore certifies none of it
  (PROTO-DEC-0041 item 1).

## 0. Why this shape

Three independent measurements converge. The cycle-architecture task spent eight
certification rounds and every finding was textual consistency. The layers A/B/C round
cost two certifier sessions plus a prompt session for five small defects, and its
DeepSeek/Gemini split was resolved not by more review but by applying a rule that was
already written down (PROTO-DEC-0041 item 4), at the cost of a human turn and a session.
`docs/research/2026-09-22-kilo-candidate-tool-evaluation.md` measured that the S3
bottleneck was closed deterministically by the decisions index, and that the omission and
copy classes are caught by Layers A and C while an LLM memory cannot catch them by
construction. The Jev evaluation measured that the cost is whole review rounds and owner
attention, not per-decision latency.

One conclusion: **the expensive thing is people and frontier models applying by hand
rules that are already recorded.** This specification converts the mechanically checkable
part of the recorded rulebook into checks. It converts nothing else.

## 1. The boundary, which is the load-bearing part

A rule may become a check only when all four hold:

1. It is **already recorded** in `.ai/DECISIONS.md` or in an owner-approved PLAN policy.
   A check never introduces a rule. If the implementation needs a rule that is not
   written, it stops and reports; it does not invent one.
2. Its inputs are **repository state only**: files, git, the findings ledger. No model is
   consulted. No network. No external service.
3. Its output is **the same for the same tree**, every time, on any machine.
4. Being wrong is **visible**: a reader can reproduce the computation by hand from the
   same inputs.

Everything else stays with models and the owner. Explicitly **not** mechanizable, and not
to be approximated:

- whether a claimed defect is real - that needs a reproduction, which is judgement about
  what was reproduced;
- whether a fix is correct;
- severity, where no protected path is involved;
- engineering disputes between reviewers;
- trade-offs the owner owns;
- anything requiring intent to be read.

**This is not external tooling.** The validator already enforces recorded rules: size
caps, encodings, hook wiring, decision-block immutability. These checks are the same
class. PROTO-DEC-0034 governs tools whose output is a *judgement* - MCP servers, LLM
evaluators such as Jev - and they remain advisory, never Evidence, never a gate input.
A deterministic computation over repository state, enforcing a decision that is already
binding, is validator work. If an implementation ever needs a model to answer, that check
is out of scope by rule 2 and must be dropped rather than weakened.

## 2. The findings ledger

Checks 1 and 2 need one machine-readable artifact that does not exist yet. It is written
by reviewers, human-readable, and lives beside the review it belongs to:
`docs/reviews/<date>-<task>-findings.md`.

One table, one row per finding:

| field | meaning | required |
|---|---|---|
| `id` | unique within the ledger, e.g. `F-003` | yes |
| `root-cause` | identifier grouping findings with one cause, e.g. `RC-git-parsing` | yes |
| `requirement` | the recorded rule or invariant violated | yes |
| `paths` | repository paths the finding touches, comma-separated | yes |
| `reproduction` | the exact command, or `none` | yes |
| `exit` | that command's exit code, or `n/a` | yes |
| `severity` | the reviewer's label: HIGH / MEDIUM / LOW / INFO | yes |
| `disposition` | `confirmed` / `refuted` / `fixed-and-verified` / `deferred-by-owner` / `unresolved` | yes |
| `attempt` | remediation attempt number for this `root-cause`, starting at 1 | yes |

`severity` is recorded and is **never** an input to the verdict. It orders work; it does
not decide. That separation is the whole point of PROTO-DEC-0041 item 4.

The `paths` field holds repository-root-relative paths. Backslashes are normalised to `/`
and a leading `./` is stripped. Any absolute form - POSIX `/...`, a Windows drive `X:`
including drive-relative `X:path`, and UNC `\\...` or `//...` - and any `..` segment,
before or after normalisation, makes the row unparseable and the check exits `2` (BLOCKED).
No lexical canonicalisation against a root is performed (PROTO-DEC-0046 item 2).

A malformed ledger is not a pass. Any check that cannot parse it exits `BLOCKED`.

## 3. Check 1 - verdict arithmetic

Command: `protocol-verdict.cjs <ledger-path>`

Protected set: Check 1 executes PROTO-DEC-0041 item 4. The protected set is read at run
time from repository state: every entry of `managed` and of `source` in
`protocol-manifest.json`, plus anything under `.ai/`, `.claude/` and `.codex/`.
`tests/` is excluded from the protected set (it stays protected for scope purposes by
the standing default forbidden list in `.ai/docs/PROTOCOL.md`). Matching is on
normalised whole paths and directory prefixes only; never a substring or a concept name
(PROTO-DEC-0046 item 3).

Computation, in order, first match wins:

1. Any row with `disposition: unresolved`, or with a required check the reviewer recorded
   as unrunnable -> **BLOCKED**.
2. Any row with `disposition: confirmed` **and** `reproduction` not `none` **and**
   `paths` intersecting the protected list -> **FAIL**. The `severity` field is not
   consulted. This is item 4 made executable.
3. Any row with `disposition: confirmed` and a reproduction, off protected paths ->
   **FAIL** if the requirement names an invariant or contract, otherwise
   **RECOMMENDATION**.
4. Otherwise -> **PASS**.

A `confirmed` row whose `reproduction` is `none` is advisory by AGENTS section 2 and must
not raise the verdict above `RECOMMENDATION`; the tool says so in its output rather than
silently ignoring the row.

Exit codes: `0` PASS or RECOMMENDATION, `1` FAIL, `2` BLOCKED or unparseable.
Output names every row that drove the verdict, so the arithmetic is auditable by hand.

The tool computes; it does not write a verdict into any review file. A reviewer remains
the author of their own verdict and may disagree - in which case the disagreement is
recorded under Open questions, as AGENTS section 2 already requires.

## 4. Check 2 - root-cause stop

Command: `protocol-verdict.cjs <ledger-path> --stop-rule`

From the PLAN escalation budget: at most two remediation attempts per root cause.
Group rows by `root-cause`; take the maximum `attempt`. If any group reaches 3, exit `1`
and name the group, the attempts and their dispositions. The message says what the rule
requires: stop and return the area or the premise to the owner, not open another round.

It must not silently pass a group whose attempts are non-contiguous (1, 3): that is a
ledger defect, so `2`.

## 5. Check 3 - scope

Command: `protocol-scope.cjs --baseline <sha> --scope <paths-file>`

From the PLAN legitimization rules, which currently say these checks "have no executor in
the current tooling, so they are a manual reviewer duty". Computation:

1. Tracked changes (`git diff --name-only <baseline>`) plus untracked files
   (`git ls-files --others --exclude-standard`) give the actual touched set. Use
   `-z` everywhere and split on NUL: a C-quoted non-ASCII path silently dropped is
   exactly the defect that failed the layers A/B/C certification, and untracked
   files must not bypass scope or forbidden checks.
2. Every touched path must be inside the declared scope. Exclusions normalise a trailing
   slash, and a prefix is not a directory match.
3. No path declared forbidden in the Phase 0 frame is touched; where the frame is silent,
   the standing default list in `.ai/docs/PROTOCOL.md` applies.

Exit `0` when the diff is a subset and no forbidden path is touched, `1` otherwise naming
each offending path, `2` when the baseline or the scope file is missing or unreadable. A
missing input is never read as an empty set.

## 6. Check 4 - author is not the reviewer

Command: `protocol-scope.cjs --independence <review-path>`

From PROTO-DEC-0041 item 1. Computation, from repository state only:

1. Read `Receipt-Owner` from the review header.
2. Read the producer's owner name from the candidate's own journal entry and receipt.
3. Exit `1` if they are equal, or if the review's owner appears as an implementer of the
   candidate in `.ai/TASK.md` roles, naming which rule matched.
4. Exit `2` if either owner cannot be determined. Unknown is not independent.

It cannot detect a reviewer who is independent on paper and controlled in practice. That
limit is declared here so that no one reads a `0` as proof of independence; it is the
absence of a detectable violation, nothing more.

## 7. What the implementation must not do

- Not write to `.ai/DECISIONS.md`, `.ai/TASK.md`, `.ai/PLAN.md`, the registry or any
  review file. These tools read and report.
- Not change any existing gate, verdict vocabulary, receipt format or completion
  requirement.
- Not consult a model, the network, or any external service.
- Not introduce a rule. Where a needed rule is unwritten, stop and report.
- Not treat a missing file, an empty directory or an unparseable ledger as a pass.

## 8. Acceptance

Each check ships with negative tests bound to the input that would have caught the real
failure: a C-quoted non-ASCII path in the scope diff; a ledger whose only confirmed
finding is labelled LOW but touches `.ai/bin/`, which must still be FAIL; a third attempt
on one root cause; a review whose `Receipt-Owner` equals the producer's; a malformed
ledger; a missing baseline. `validate-protocol.ps1` stays at 0 warnings and the suite
stays green, with the new tests registered in `protocol-manifest.json`.

The batch certified in one round is this package together with the five layers A/B/C
fixes, per the batching rule recorded in `.ai/PLAN.md`.
