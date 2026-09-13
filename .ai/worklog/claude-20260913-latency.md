# Worklog: claude-20260913-latency

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-13 - Hook cost on a real repository

Agent: Claude (Opus 5), session claude-20260913-latency

Action:
Committed the interrupted Codex round first, unchanged. It had written the
journal its earlier session owed, fixed a defect v1.4 shipped, where the default
handoff invoked a test runner that release had deliberately stopped installing,
made a missing owner fail rather than stamp another journal, and added the
integration files to the scoped Git attributes so a host CRLF rule cannot
corrupt hook JSON on checkout. It also ran Codex CLI 0.154.0 against the
adapter and confirmed both hooks are discovered, enabled and untrusted.

Then measured the one production risk nobody had quantified. Both hooks took a
content hash of every file Git could see, and Stop runs after every response.
On a generated five-thousand-file repository: 584 ms of hashing against 70 ms
for Git itself, projecting to roughly six seconds per response at fifty
thousand files. Measured read-only against the owner's own product repository,
which holds 118 MB across 558 files because of screenshots, hashing alone took
238 ms.

Rewrote the snapshot to trust what Git already computed: a clean tracked file
is identified by the blob hash in the index and is never opened, and only what
`git status` reports as changed or untracked is read. Numbered the snapshot
format and recorded it in each Evidence block, so evidence written under the
old format is reported as not comparable instead of stale.

Result:
The Stop hook fell from about 850 ms to about 330 ms on five thousand files,
and what remains is Git's own three calls rather than anything that grows with
content. On the owner's product repository the snapshot takes 122 ms and opens
one file of 558. Change detection verified unchanged across edit, revert, add
and delete. 113 tests pass, seven of them new. Recorded as DEC-0015.

Next step:
Install the protocol on the product repository and run the first real task.
Everything that can be verified without real work has now been verified.

Open:
- I deliberately did not build upgrade pruning or an uninstall command. No
  project has ever installed the protocol, so there are no stale installs to
  prune. Building for a situation that does not exist is the habit this round
  was supposed to break.
- Evidence recorded before this change cannot be compared against a tree
  measured after it. It says so, and re-recording refreshes it.
- Five rounds of scaffolding, still no product task.

Evidence:
- anchor: 54c0623c73fbfe628e2b0c8c0430813d91796be6, uncommitted changes present
- digest: sha256:6d755f025e46fe61f7ed5c94050f1ac73dcd9973c226b79e48ae3123e2abcb3b over 44 tracked and untracked files
- digest format: 2
- recorded: 2026-09-13T12:26:58.869Z by claude-20260913-latency
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 2s
- test-protocol.ps1: exit 0 in 237s
- reproduce: node scripts/protocol-handoff.cjs verify
