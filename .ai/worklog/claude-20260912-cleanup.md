# Worklog: claude-20260912-cleanup

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-12 - Cleanup, workflow assessment, connection guide

Agent: Claude (Opus 5), session claude-20260912-cleanup

Action:
Started by checking the CI run the owner's push had triggered. It failed. The
validator required `scripts/protocol-handoff.cjs` while the installer's
manifest never shipped it, so every install was born broken. That was the third
instance of one defect, and a fourth surfaced while fixing it: the test
fixtures kept their own file list too. Replaced all four with
`protocol-manifest.json`, which the installer, the validator and the fixtures
now derive from, plus tests that fail when it and the disk disagree.

Then assessed installation properly instead of describing it. Built two
realistic host projects: one with its own README, ignore rules, Claude
permissions and a `PostToolUse` hook, and one whose history holds CRLF. The
first install behaved: nothing of the host's was replaced, permissions and
their hook survived, `.gitignore` was merged. The second exposed a real
adoption blocker: the validator inspected every file Git could see, so the
host's own CRLF source failed validation on day one. Narrowed inspection to
protocol-owned files. That contradicts the contract two of Codex's tests
encoded, so I moved their violation files into owned paths and added coverage
that host files are ignored.

Removed the last remnant of the one-journal-per-agent model: `claude.md` and
`codex.md`. Their entries and the two oldest session journals moved whole into
`.ai/ARCHIVE.md`, the first time that procedure has run. Deleted the merged
branches, rewrote `.ai/PLAN.md` around the pilot, and wrote the connection
guide from what the two installs actually did.

Result:
79 tests pass, up from 70. The validator exits 0 here and in both host
projects, including the CRLF one. Recorded as DEC-0012.

Next step:
Owner names the first product objective. `.ai/PLAN.md` proposes the pilot.

Open:
- CI ran green on `main` for the first time: validation, the suite, a clean
  install and an idempotent upgrade, all on Windows PowerShell 5.1.
- Fixed one more defect found by using the tool right after the merge:
  bare `verify` picked a journal by modification time, which a checkout
  scrambles, so it reported stale evidence for a tree that had matching
  evidence in another journal. It now asks whether any journal matches.
- Installing `.gitattributes` into an existing repository changes line-ending
  normalization for that whole project. Backed up, but it needs a human look.
- The protocol still has no product task behind it after four rounds.
- Audit findings T4, T6, T7 and T8 remain open; none produces a false green.

Evidence:
- anchor: 6b157403f00155a06d5fa8cd10747a6e0dc82a47, uncommitted changes present
- digest: sha256:2d95bbc4a9596931cdfa04bb5931f6b4177184d9cb01bb2242182848f3a995b9 over 35 tracked and untracked files
- recorded: 2026-09-11T23:45:56.146Z by claude-20260912-cleanup
- validate-protocol.ps1: exit 0 in 2s
- test-protocol.ps1: exit 0 in 158s
- reproduce: node scripts/protocol-handoff.cjs verify
