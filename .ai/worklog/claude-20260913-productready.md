# Worklog: claude-20260913-productready

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-13 - Production readiness: delivery boundary and release documents

Agent: Claude (Opus 5), session claude-20260913-productready

Action:
Found the Codex adapter round uncommitted after that session ran out of limits.
Committed it unchanged first, then assessed it: 99 tests green, one hook engine
for both hosts, honest documentation of the Codex trust step. Good work, and it
had already closed audit finding T4 by building every merge before the first
write.

Then measured what an install actually does to a product repository. It put 39
files there, fifteen of them the installer, this protocol's own test suite and
its templates. It wrote a `.codex/config.toml` setting an approval policy and a
sandbox mode, and when a project had no `.gitattributes` it copied this
repository's own, whose `* text=auto eol=lf` governs every file the project
owns. An `.editorconfig` with `root = true` did the same for editors.

Split the manifest into what is installed and what stays here, taught the
validator the two roles so an installed project never demands an absent
installer, stopped writing the Codex config and the editor config entirely, and
made a fresh `.gitattributes` carry the same scoped block a merge would add.
Closed T7: a Supersedes naming no decision now fails. Added the licence, the
contribution guide and the security policy, and bumped the version to 1.4.

Result:
An install is 22 files instead of 39, and a host project's own source keeps its
line endings and editor settings. 103 tests pass, eleven of them new. The
validator exits 0 here and inside an installed project. Recorded as DEC-0013,
with the licence choice left open as DEC-0014.

The stale-lock detection built two sessions ago earned itself: the Codex
session had held the shared lock for 124 minutes and the tool reported it,
named the recovery command, and refused to steal it.

Next step:
Owner names the first product objective. Nothing further should be built for
this protocol before it has carried real work.

Open:
- DEC-0014 is Proposed. An agent may not choose a licence for its owner.
- The Codex adapter has never run inside a real Codex host.
- `codex-20260912-adapter` never wrote the journal its lock named, so its round
  is described here from the diff rather than from its own handoff.
- Projects installed before v1.4 keep the files this version stopped shipping.
- Four rounds of scaffolding, still no product task.

Evidence:
- anchor: 3b3a9735777a11e5fb12343f08afa944a9780d97, uncommitted changes present
- digest: sha256:347c40f4e0fe9ef7f5efd2c55ce1a58e2b7ac4ae638b0b42a14ae4e5aa699426 over 44 tracked and untracked files
- recorded: 2026-09-12T21:13:11.325Z by claude-20260913-productready
- validate-protocol.ps1: exit 0 in 2s
- test-protocol.ps1: exit 0 in 210s
- reproduce: node scripts/protocol-handoff.cjs verify
