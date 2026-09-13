# Worklog: claude-20260913-stability

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-13 - Evidence survives the commit that follows it

Agent: Claude (Opus 5), session claude-20260913-stability

Action:
The final check of the previous session failed on its own evidence. Speeding up
the snapshot had given a file two identities: SHA-256 of its content while
untracked, and the Git index record once tracked. Committing the work therefore
moved the digest, and a receipt written minutes earlier stopped matching. That
is exactly the property DEC-0011 had built in and DEC-0015 removed without
noticing.

Gave a file one identity in every state: the Git blob hash, read from the index
when the file is clean and computed here from the same definition when it is
not. A symlink is identified by the blob of its target, which is what Git
stores. Numbered the format 3 and released 1.5.1.

Result:
The digest is byte-identical before `git add`, after it, and after the commit,
and a real edit is still detected. Evidence recorded before a commit now
verifies after it, which a regression asserts. A clean committed tree is read
zero times during a snapshot, asserted by counting reads rather than by
inspecting a string, because both paths now produce the same string by design.
115 tests pass. Recorded as DEC-0016.

Next step:
Install the protocol on the product repository and run the first real task.

Open:
- The identity is a SHA-1 blob hash because that is what Git stores. It guards
  against drift between sessions, not against a crafted collision. An agent
  able to forge one could edit the journal directly.
- I caught this only because the closing check ran against the session's own
  evidence. A change to the snapshot should always be followed by recording and
  verifying across a commit, which is now a test rather than a habit.
- Still no product task.

Evidence:
- anchor: 3e91ded2a9e9aece6f13d676a03508f15c7d7c3b, uncommitted changes present
- digest: sha256:c10bb36820bfe796acb5b8e1c5a7d07b96a822494d7a48aee03096002956e0ab over 44 tracked and untracked files
- digest format: 3
- recorded: 2026-09-13T12:47:08.389Z by claude-20260913-stability
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 2s
- test-protocol.ps1: exit 0 in 242s
- reproduce: node scripts/protocol-handoff.cjs verify
