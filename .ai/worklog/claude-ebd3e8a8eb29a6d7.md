# Worklog: claude-ebd3e8a8eb29a6d7

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-23 - Executable rulebook specified; legacy stack settled by measured reference

Agent: claude-ebd3e8a8eb29a6d7

Action: Two evaluations arrived - `docs/research/2026-09-22-kilo-candidate-tool-evaluation.md`
in the repository, and a Jev decision-fabric study that exists only in a temp directory
outside it. Wrote `docs/specs/2026-09-23-executable-rulebook-spec.md`, the specification
for the kernel automation package, and recorded PROTO-DEC-0045 with its registry row
under the lock. Before settling the legacy trees I checked what the live Codex
configuration actually references, rather than deciding by directory size.

Result: The specification reframes the package. It is not three more checks; it converts
the mechanically checkable part of the recorded rulebook into deterministic checks over
repository state, and its load-bearing section is the boundary - four conditions a rule
must meet to become a check, and an explicit list of what stays with models and the owner.
The highest-value check is the one yesterday exposed rather than one of the three
originally listed: verdict arithmetic, making PROTO-DEC-0041 item 4 executable, so that
two certifiers splitting on severity never again costs a human turn. It needs one new
artifact, a machine-readable findings ledger, in which `severity` is recorded and is
never an input to the verdict. The legacy check found what size alone would have hidden:
`~/.codex/mcp-memory-stack/run-dbhub-l4-a.cmd` and `-b.cmd` name
`D:/mcp-memory-data/sqlite/memory_a.db` and `memory_b.db` - the two files measured at 0
bytes - while nothing in that configuration references the 7.2 GB `vector-stack/` or
`D:\mcp-stack`. Deleting both trees wholesale, which is what I had implied was safe,
would have removed paths the live stack names. PROTO-DEC-0045 therefore keeps
`sqlite/`, marks `vector-stack/` and `mcp-stack/database-storage` delete-eligible, and
executes no deletion: both trees are outside version control and there is no undo.

Next step: Gemini implements the specification with its negative tests; DeepSeek composes
the unified adversarial prompt and certifies the batch, which is this package together
with the five layers A/B/C fixes under the PLAN batching rule; Copilot persists the Jev
report into the repository under the section 5.5 fallback and assembles the R0 offline
dataset. I authored the specification and therefore control the work, so I certify none
of it - the two slots are DeepSeek and Copilot.

Open: The Jev evaluation is 97,822 B in a temp directory and is not project memory until
persisted; by AGENTS section 1 it has not happened yet. Layers A/B/C remain FAIL and
uncertified. Check 4 cannot detect a reviewer independent on paper and controlled in
practice, which the specification declares rather than hides. Whether to execute the two
delete-eligible paths is an owner instruction naming the path, not a decision block.

Evidence:
- anchor: f68b50222ba3afa92dd3be36f4197ac8307d9511, uncommitted changes present
- digest: sha256:daece71fc44fa0e4cf55bf2961749cecde389cdc09fb6d8253cd787e5202f102 over 270 tracked and untracked files
- digest format: 4
- recorded: 2026-09-22T21:22:37.733Z by claude-ebd3e8a8eb29a6d7
- entry hash format: 2
- entry: sha256:bd2d01eefaf5aa02ebebdac92d7a042988d2b4f3b553b8e5b473af8bd4c7f309 of this entry without this block
- parent-entry: sha256:c6ca5fcb83160e4b1a41b7500bf7543ec06a09f57d3c74b0605b0f534e5f6b2d
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 1 in 3s
- test-protocol.ps1: exit 0 in 231s
- reproduce: node .ai/bin/protocol-handoff.cjs verify

---



## 2026-09-22 - Budgets unloaded; batching rule recorded in PLAN

Agent: claude-ebd3e8a8eb29a6d7

Action: Both budgets were at their caps and blocked the next round from writing anything.
Reviews: reclassified the active corpus, since the earlier "uncited" rule no longer
produced any candidate - every one of the 58 was referenced somewhere. Narrowed the
criterion to citation from active sources (TASK, PLAN, DECISIONS, REGISTRY, AGENTS,
`.ai/docs`) and re-checked each candidate against `tests/` and the validator as well,
which is what saved `2026-09-17-three-repository-review.md`: it is cited by
`tests/upgrade.test.cjs` and my first classifier missed that. Archived six closed Sep-19
artifacts with INDEX mappings. Journals: no empty ones existed, so `prune` was useless;
archived the six oldest Sep-20 journals entry-by-entry into `.ai/ARCHIVE.md` and removed
the emptied files. Recorded the owner-approved batching rule in `.ai/PLAN.md`.

Result: Corpus 52/60 files and 503,355/614,400 B, from 58 and 602,153 - eight slots and
111 KB for the batched round. Journals 25/30 from 30. `.ai/ARCHIVE.md` went 147 -> 155
entries, exactly the eight archived, so nothing was lost. `validate-protocol.ps1` exit 0
with **0 warnings**; `test-protocol.ps1` **321/321** exit 0. Two tooling frictions cost
several cycles and are worth naming rather than forgetting. First, archiving a journal
updates its mtime, after which `prune` refuses it as a "recent empty journal" - the two
operations do not compose, so the emptied files had to be removed by hand. Second, the
validator counts journals from the **git index**, not the filesystem: deleting a tracked
journal does not reduce the count until the deletion is staged, which is why the warning
persisted while the directory already held 25. Also trimmed my own PLAN addition four
times to fit the 200-line cap, which the validator enforces as a hard failure.

Next step: implement the deferred kernel automation package - root-cause stop bound to one
findings ledger, executable scope check, author-not-reviewer - then one batched
certification round covering it together with layers A/B/C, as approved.

Open: Layers A/B/C remain **FAIL and uncertified**; the five fixes have had no independent
review and I wrote them, so I certify none. The batching rule is PLAN-level and reversible,
not a decision block. A tracked-but-deleted path is still skipped in silence by the
inventory, which is defensible but undecided. Journals will drift back toward the cap
whenever reconnects create sessions, so the index-versus-filesystem counting difference
will resurface for whoever hits it next.

Evidence:
- anchor: f68b50222ba3afa92dd3be36f4197ac8307d9511, uncommitted changes present
- digest: sha256:b8de215444bb7892d5c5db3861fcbfc845e2218c466a2714fbb39761fd4a1495 over 269 tracked and untracked files
- digest format: 4
- recorded: 2026-09-22T20:02:03.105Z by claude-ebd3e8a8eb29a6d7
- entry hash format: 2
- entry: sha256:c6ca5fcb83160e4b1a41b7500bf7543ec06a09f57d3c74b0605b0f534e5f6b2d of this entry without this block
- parent-entry: sha256:069a4f77e41453d1e5cd6e1944c2bb81c4c78968d240432796f454c605d256d2
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 3s
- test-protocol.ps1: exit 0 in 280s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
