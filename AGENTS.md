# AGENTS.md

## AI Collaboration Protocol v1.9.0

Several AI coding assistants work in this repository: GPT/Codex, Claude,
DeepSeek, Gemini, Qwen, GLM, Mistral, Copilot, and others. They do not share chat
history. The filesystem is the only channel between them.

Read this file at the start of every session, then read `.ai/TASK.md`.

Chat history is not project memory. Never justify a claim with "we discussed
this earlier". If it is not in the repository, it did not happen.

---

## 1. Source of truth

Ranked. When two sources disagree, the higher one wins.

1. `.ai/DECISIONS.md` - approved decisions. Binding.
2. The working tree, plus `git status`, `git diff`, `git log`. What the code
   actually is.
3. `.ai/TASK.md` - what is being worked on now, and the open questions.
4. `.ai/PLAN.md` - the proposed approach. A draft until approved.
5. `.ai/worklog/` - one journal per session, newest first.
6. `.ai/ARCHIVE.md` - cold history.

If a higher source contradicts a lower one, the lower one is stale. Fix it or
say so in your journal. Do not act on the stale version.

`.ai/runtime/` is disposable session state and is not tracked. Nothing there
is a source of truth.

---

## 2. Authority

- A proposal written by an AI agent is not a decision.
- A decision exists only as an approved block (e.g. `PROTO-DEC-nnnn` for the
  protocol core, or `DEC-nnnn` in a product repository) in `.ai/DECISIONS.md`
  carrying `Approved by:` with a human name. That text records who authorized
  the work. It is a record, not proof; the owner remains the only one who can
  approve. Proposals belong in `.ai/PLAN.md`; `Proposed` status is forbidden in
  `DECISIONS.md`.
- Any agent may challenge any other agent. Record the disagreement in
  `.ai/TASK.md` under Open questions. Do not silently overwrite.
- The human owner decides. Ask rather than assume.

### Who does what

`.ai/TASK.md` may carry a `## Roles` section naming one assistant per line:

```markdown
## Roles

- qwen: implementer
- deepseek: reviewer, opposes the result before handoff
- claude: second reviewer only if the two disagree
- glm: complex reasoning, audits, or multilingual tasks
- mistral: code reviewer or implementer
- copilot: reviewer, architectural auditor, or implementer
```

The owner writes it. Nothing here assigns, rotates or enforces: the role text
is free, so a priority or a condition can be written into it, and the owner
changes it per task at will.

At session start each assistant is told its own role. One that is not named is
told so and told to ask before starting. This exists because the first pilot
gave one task to two assistants and received two answers to it.

An implementer may not unilaterally mark a task `Status: Completed` in
`.ai/TASK.md`. Completion requires independent verification by the assigned
opposing reviewer or the human owner.


---

## 3. Session start

Mandatory, in order:

1. Read `.ai/TASK.md`.
2. Run `git status --short --branch` and `git log --oneline -10`.
3. Read the recent journals in `.ai/worklog/`, including other agents'.
4. Read `.ai/DECISIONS.md` when the task touches architecture, data, or
   external contracts.
5. If `.ai/TASK.md` says there is no active task, ask the owner. Do not invent
   a task and do not start refactoring.

For Claude and Codex, an enabled and trusted SessionStart hook injects most of
this and names your journal file. The injection is bounded; reading omitted
files is still your job. Codex activation is described in .ai/docs/CODEX.md.

---

## 4. Session end

Mandatory, in order:

1. Review your own diff with `git diff`.
2. Run the checks in section 7. Report what you actually ran.
3. Write one entry in your session journal, with all five labels.
4. Update `.ai/TASK.md` if the state of the task changed.
5. Release the shared-document lock if you hold it.
6. Do not commit and do not push unless the owner instructed it.

An entry that says only "made changes" is not an entry. Say what changed, what
you verified, and what is still open. A claim about what you did not change
must still be true when the session ends.

---

## 5. Session journals

Each session writes exactly one file in `.ai/worklog/`. No session writes to
another session's file, so two agents can never overwrite each other and no
lock is needed here.

- Claude/Codex with active hooks: use the journal created by SessionStart.
  Use its basename without `.md` as the lock owner and evidence owner.
- Any other assistant, or one whose hooks are not active, starts its session
  explicitly and receives the same journal and the same context:

```bash
node .ai/bin/protocol-session.cjs start --agent <name>
```

  It prints the context, the session id and one owner name. Use that name for
  the journal, for the lock and for the evidence. `stop --agent <name>
  --session <id>` runs the same check the Stop hook runs.
- `README.md` in that directory is not a journal. Every other file is one.

Nothing inside one checkout can stop a session writing into another session's
journal. The separate files prevent collisions, not forgery. The validator warns
when a journal holds an entry naming a different agent, which catches a mistake
and not an intent. Treat the rule as binding on you and the warning as a check
on accidents.

`node .ai/bin/protocol-session.cjs prune` removes journals that hold no entry.
A journal with entries is history and is archived by hand under the lock.

Every entry needs all five labels, or the Stop hook will not count it:

```markdown
## YYYY-MM-DD - short title

Agent:

Action:

Result:

Next step:

Open:
```

---

## 6. Shared documents have one writer

`.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md` and `.ai/ARCHIVE.md` are
edited by one session at a time, through a cooperative lock.

```bash
node .ai/bin/protocol-lock.cjs acquire --owner <your-session-id>
node .ai/bin/protocol-lock.cjs release --owner <your-session-id>
```

The lock is cooperative, not an operating system barrier. It works only if
every participant takes it.

If a lock operation is interrupted it leaves a gate behind. `acquire` then
names it as abandoned and tells you to run
`node .ai/bin/protocol-lock.cjs clear-operation`, which refuses while the
process that made it is still alive.

If `acquire` reports another owner, do not steal it. Run `status` and read
`stale` and `heldForMinutes`. Age is a reason to investigate, never a proof:
a slow live holder looks exactly like a dead one. Confirm the session is
actually over, then release it with the reported owner name. Releasing a live
holder's lock destroys their work. If `acquire` reports that the holding process
is dead, clear it with `clear-lock` or pass `acquire --force` to recover safely.

Other writing rules:

| File               | Rule                                               |
| ------------------ | -------------------------------------------------- |
| `.ai/DECISIONS.md` | append only; a written block is never edited again; proposals belong in `.ai/PLAN.md` |
| `.ai/TASK.md`      | replace sections; it is short by design             |
| `.ai/PLAN.md`      | replaced by the session that owns the task          |
| `.ai/ARCHIVE.md`   | append only                                         |

To replace a decision, append a new approved block with a `Supersedes:` line
naming the old one. Do not edit the old block, not even its status. The
decision log is the one file safe to trust precisely because nothing in it is
ever rewritten.

---

## 7. Checks and evidence

Before handing off, run the validator and the project's own checks. In the
protocol source repository (`role: source` in `protocol-manifest.json`), also
run its regression suite:

```powershell
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
```

The validator checks protocol health, encodings, size limits, hook wiring and
whether Git really ignores session state. In the source repository it also
checks the installer. Installed projects (`role: installed`) do not contain
`test-protocol.ps1` or the installer. Run the protocol suite from its source
repository after changing its tooling; use the host project's own test command
for product code.

A green validator is not a green project. Run the project's own tests too.
An installed project may declare `"testCommand": "<cmd>"` in
`protocol-manifest.json` (e.g. `npm test`, `flutter test`, `pytest`). `record`
then runs that command and stamps its exit code into the Evidence block.

Then attach evidence to your journal entry instead of asserting a result:

```bash
node .ai/bin/protocol-handoff.cjs record --owner <your-session-id>
```

It runs the validator, plus the protocol regression suite in the source role
(and the configured `testCommand` if present), records their real exit codes,
and stamps the entry with a digest of the exact tree they ran against.

Never write secret keys, passwords or tokens into a journal. `record` and the
Stop hook scan the entry and block handoff if unredacted credentials appear.

If an entry was edited after recording to redact an accidental secret or token,
refresh its entry hash legitimately with:

```bash
node .ai/bin/protocol-handoff.cjs rehash --owner <your-session-id> --reason "<explanation>"
```

The next agent re-checks with `node .ai/bin/protocol-handoff.cjs verify`, which
fails when the tree has moved since the evidence was recorded.

The block also carries a hash of the entry itself with the block removed, so an
entry cannot be rewritten after it was certified. `verify` recomputes it.

This is the difference between telling the next agent the suite passed and
letting them confirm it. Prose in a journal is a claim; an Evidence block is a
record. Never hand-write one.

---

## 8. Size limits

Enforced by `validate-protocol.ps1`.

| File                       | Limit     | On overflow                        |
| -------------------------- | --------- | ---------------------------------- |
| `.ai/TASK.md`              | 80 lines  | cut back to the current task only  |
| `.ai/worklog/<journal>.md` | 150 lines | move oldest entries to the archive |
| `.ai/PLAN.md`              | 200 lines | the task is too big; split it      |
| `.ai/worklog/` file count  | 30 files  | archive the oldest journals        |
| `.ai/DECISIONS.md`         | none      | never trimmed, never summarized    |
| `.ai/ARCHIVE.md`           | none      | never trimmed                      |

Archiving moves text. It never deletes text.

Automatic archiving is executed on `stop` and `record` when a session journal
exceeds 150 lines, moving older entries into `.ai/ARCHIVE.md` while preserving the
newest entry.

To archive entries manually from a session journal into `.ai/ARCHIVE.md`:

```bash
node .ai/bin/protocol-archive.cjs worklog <path-to-journal> [--keep <n>]
node .ai/bin/protocol-archive.cjs status
```


---

## 9. Before changing code

1. Know the current task.
2. Read the code you are about to change, not just its name.
3. Run `git status` and look for another session's uncommitted work. In a
   shared checkout, a change you did not make may belong to another agent.
4. Check `.ai/DECISIONS.md` for a constraint that already settles the question.
5. Write down an assumption in your journal entry when it matters.

Stay inside the task. No unrelated refactors, no drive-by renames, no
reformatting files you did not otherwise touch.

---

## 10. Git

Git is the durable layer, not a scratchpad.

- Commit at meaningful checkpoints, or when the owner asks.
- Do not push every intermediate change.
- Do not rewrite history that has been pushed.
- Branch for anything bigger than a small fix.
- Never commit a secret. Keys belong in environment variables.

---

## 11. Encoding

All text files: UTF-8 without a byte order mark, LF line endings. Enforced by
`.gitattributes` and the validator. The protocol installs no `.editorconfig`,
because indentation is the host project's decision.

PowerShell scripts are the exception and the trap. Windows PowerShell 5.1 reads
a `.ps1` file without a byte order mark as the system ANSI codepage. A
non-ASCII character in such a script is silently corrupted, and a script that
writes files propagates the corruption into everything it generates.

Rule: keep every `.ps1` file ASCII-only. The validator fails the build if a
non-ASCII byte appears in one.

---

## 12. Never

- Never treat your own proposal as approved.
- Never delete history to save context. Archive it.
- Never write to another session's journal.
- Never edit a decision block that is already written.
- Never release a lock you did not take without confirming the holder is gone.
- Never commit secrets.
- Never report work as verified when you did not run the check.
