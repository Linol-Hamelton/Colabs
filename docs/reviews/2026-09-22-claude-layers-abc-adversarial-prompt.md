# Unified adversarial audit prompt: layers A, B and C (PROTO-DEC-0044)

- Author of the candidate and of this prompt: Claude (Opus 5), session `claude-ebd3e8a8eb29a6d7`
- Date: 2026-09-22
- Baseline commit: `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1`; working tree dirty, uncommitted
- Risk class: protocol core (PROTO-DEC-0038 item 1) - two parallel independent certifiers required
- Certifiers: DeepSeek and Gemini, working simultaneously on this same package
- The author certifies nothing here and must not be asked to arbitrate a finding

## 1. What you are attacking

`PROTO-DEC-0044` in `.ai/DECISIONS.md` and its implementation:

| Path | Change |
|---|---|
| `.ai/bin/protocol-hooks.cjs` | new `inventory()`; a `Large tracked documents` block in `context()` |
| `.ai/bin/protocol-index.cjs` | new; derives `.ai/runtime/decisions-index.md`; `--check` |
| `.ai/bin/protocol-ledger.cjs` | new; `cover` and `dup` subcommands |
| `AGENTS.md` | section 3 step 3; section 5 item 7; section 9 item 4 |
| `protocol-manifest.json` | both new tools in `managed`; both test files in `tests` |
| `tests/hooks.test.cjs` | +2 tests |
| `tests/index.test.cjs`, `tests/ledger.test.cjs` | new, 5 and 8 tests |
| `docs/decisions/REGISTRY.md` | one appended row |

Reported state at handoff: `validate-protocol.ps1` exit 0, `0 warning(s)`;
`test-protocol.ps1` 315/315 exit 0. **Re-run both yourself. Do not accept those numbers.**

## 2. Rules of engagement

- Reproduce before you claim. A `FAIL` or `BLOCKED` needs at least one reproduction per
  claim: the command, its output, its exit code. Without one it is advisory and cannot
  block completion (AGENTS section 2).
- Verdict is exactly one token: `PASS`, `RECOMMENDATION`, `FAIL`, `BLOCKED`
  (PROTO-DEC-0041 item 3). A mandatory open defect is `FAIL`; a check you could not run
  is `BLOCKED`; `RECOMMENDATION` covers only optional improvements.
- Any reproduced defect that violates a recorded invariant, or lies on a protected path
  (core, security, data, gates, hooks, validator, manifest), blocks regardless of the
  severity label you choose (PROTO-DEC-0041 item 4).
- Work from the repository, not from this prompt. If the tree contradicts anything
  written here, the tree wins and you say so.
- Do not read the other certifier's report before fixing your own verdict. Your
  submissions are compared by content hash.
- Report <= 250 lines. Header must carry `Mode: CERTIFYING`, `Receipt-Owner: <your owner
  name>`, reviewed commit and tree state. Your journal entry must name your review path.
- Start your own session first: `node .ai/bin/protocol-session.cjs start --agent <name>`.

## 3. Claims to break, in order of what it would cost to be wrong

### C-1. The tools cannot influence a gate (PROTO-DEC-0034 item 1, PROTO-DEC-0044 item 4)

Claimed: all three outputs are advisory, live under `.ai/runtime/`, and never become
Evidence or a gate input; absence of any tool degrades to identical gate semantics.
Attack: delete `.ai/runtime/`, corrupt `decisions-index.md`, make the tools non-executable,
then run the completion gate and `protocol-handoff.cjs record`. Does anything change?
Can you construct any path where a tool's output alters a verdict, a receipt or a
completion check? A single such path is `FAIL`.

### C-2. Layer A does not displace injected context

Claimed: the block is bounded, and in the three repositories tested the section list with
and without it is identical, growth exactly 545 characters against `MAX_CONTEXT = 9500`.
Attack: build a repository shaped to push the block against the budget - many large
tracked documents, a long TASK.md, many journals. Does a journal, a decision heading or
the TASK section get silently truncated? Silent loss of injected context is `FAIL`.

### C-3. Layer A's inventory is robust input handling

`inventory()` parses `git ls-files` output by splitting on newlines and calls `statSync`
per surviving path. Attack: a filename containing a newline or a quote; `core.quotePath`
behaviour; a path that exists in the index but not on disk; a repository with no commits;
`git` missing from `PATH`; a very large index. Does it throw, hang, or mis-parse? The hook
runs at every session start, so an exception there is `FAIL`, not a `RECOMMENDATION`.

### C-4. Layer B never becomes a source of truth and detects its own staleness

Claimed: the index points at blocks and never restates them; the source sha256 is recorded;
`--check` exits 1 when `.ai/DECISIONS.md` has moved. Attack: edit `.ai/DECISIONS.md` in
ways that keep the byte count identical; hand-edit the recorded hash; delete the index;
run `--check` in a repository with no `.ai/DECISIONS.md`. Also attack the extraction:
a block whose `Decision:` is empty, numbered differently, or opens with a heading-like
phrase. Does any output invite a reader to rely on the index instead of the block?

### C-5. Layer B's reverse path index is honest

Claimed: `boundPaths` takes only backticked tokens, so prose cannot leak in. Attack: a
decision block containing a backticked token that is not a path, or a real path that the
filter drops. A path that a decision genuinely binds but the index omits is the dangerous
direction - someone edits a file believing no decision governs it. Quantify how many of
the 44 blocks' real path references the index misses.

### C-6. Layer C's corpus is the repository, not the prompt

Claimed: `cover` uses `git ls-files` where available and a directory walk otherwise, and
was exercised on the non-git `D:\mcp-stack`. Attack: symlinks - the walk uses
`entry.isDirectory()`, so a symlinked directory is neither recursed nor counted; confirm
whether that silently omits corpus content, and whether a symlink cycle can hang it.
Attack the exclusion semantics: the author's own prompt wrote `$report/` for what is a
file, and the two readings disagreed by one unit. Is the prefix matching correct for a
path that is a prefix of another (`logs` vs `logs-old`)?

### C-7. Layer C's exit codes mean what they say

Claimed: a record with no unit is always a defect (exit 1); a unit with no record is only
a defect under `--expect-all`. Attack that boundary, and attack `dup`: does the `--out`
file get compared against itself; does a directory passed twice inflate the count; what
happens with an empty directory, a missing directory, or an unreadable file?

### C-8. The declared limits are complete and honest

The author declared these, in `.ai/worklog/claude-ebd3e8a8eb29a6d7.md` and in
PROTO-DEC-0044: the 50,000 B floor and eight-row cap in Layer A are judgement, not
measurement; Layer B's first-sentence extraction yields a thin line for a block opening
with a heading-like phrase (PROTO-DEC-0041 is the example); Layer C assumes the
one-record-per-unit path layout and compares whole files, so a partial or reworded copy is
invisible to `dup`. **Your job is to prove that list incomplete.** An undeclared limit of
the same weight is a finding; a declared limit is not, unless the declaration understates it.

### C-9. Scope discipline

Run `git status --porcelain` and `git diff --stat` against the baseline. Does the change
touch anything outside the table in section 1? PROTO-DEC-0044 item 6 claims no gate,
verdict vocabulary, receipt format or completion requirement changed, and that
PROTO-DEC-0034, 0036, 0038, 0039, 0040, 0041, 0042 and 0043 stay in force unweakened.
Verify that claim literally, decision by decision.

### C-10. Propagation claim

PROTO-DEC-0044 item 5 puts both tools in `managed`. Verify the installer actually delivers
them and that `tests/manifest.test.cjs` and `tests/installer.test.cjs` still hold. Confirm
the stated consequence that installed projects at `protocolVersion` 1.9.0 do not receive
them until upgraded.

## 4. What a finding must contain

ID; the requirement or invariant violated; the exact command and its output; the observed
result against the expected one; severity by the PROTO-DEC-0041 item 4 rubric; and your
disposition (`confirmed` / `refuted` / `unresolved`). Duplicates merge by cause. The
number of findings is not a measure of anything.

## 5. Where to put your report

`docs/reviews/2026-09-22-<agent>-layers-abc-certification.md`. The active corpus stands at
56 files / 589,822 B against a 60 file / 614,400 B cap, so reserve your space before you
write and keep within 250 lines. Then record evidence with
`protocol-handoff.cjs record --owner <your owner name>` and cite the review path in your
journal entry.
