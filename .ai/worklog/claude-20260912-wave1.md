# Worklog: claude-20260912-wave1

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-12 - Wave 1: truthful checks and evidence-carrying handoff

Agent: Claude (Opus 5), session claude-20260912-wave1

Action:
Read the Codex audit and reproduced its three sharpest findings before
touching anything: a deleted installer, `disableAllHooks`, and ignore rules
cancelled by a later negation all left validation green. Committed the audit
as `8d71e78` first so per-round authorship stays recoverable, which the audit
itself named as a gap.

Then closed the class rather than the instances. Every runtime entry point is
now a required file and a missing installer fails loudly instead of skipping
its own self-check. Disabled hooks fail with the reason. Ignore rules are
checked by asking Git what it ignores, not by reading the file for expected
text. Fixed the entry parser that counted an empty final field followed by a
separator as filled.

Built `scripts/protocol-handoff.cjs`: `record` runs the checks, writes their
real exit codes into this journal and stamps the entry with a digest of the
tree they ran against; `verify` recomputes it. Made the digest cover content
and mode only, after discovering that `git add` moved it while the files were
unchanged. Made the SessionStart hook create the journal it names, which is
the gap I fell into last session. Added CI, the decision template's
`Supersedes` field, corrected lock field names, one version identifier, and an
archiving procedure that actually reduces the file count.

Result:
70 tests pass, up from 59; eleven are new and each covers one counterexample.
The validator exits 0 here and fails with a precise message on each of the
three reproduced fixtures. Recorded as DEC-0011.

One defect of my own, found and fixed mid-session: a lost backslash turned the
journal parser's character classes into the literal letters s and S, so every
field matched empty and no entry was complete. `node --check` passed because
the code stayed valid JavaScript. It is the exact argument for this session's
work: a green syntax check certified nothing about behaviour.

Next step:
Owner names a first product task, or authorizes the push that lets CI run for
the first time.

Open:
- CI has never executed. Its commands pass locally; the workflow itself is
  unproven until pushed.
- Still no product task after three rounds of scaffolding. That is the only
  evidence that would show whether any of this reduces rework.
- Codex has no hook adapter, so evidence stays voluntary on that side.
- Whole-journal archiving is now specified but has never been run.

Evidence:
- anchor: 8d71e78e6f6edb68ebb165d47760027f038b6d54, uncommitted changes present
- digest: sha256:c0da70a42ae731e8266cc69d85428eda420211b19b702ffd91aa058d23e5910c over 34 tracked and untracked files
- recorded: 2026-09-11T23:07:59.158Z by claude-20260912-wave1
- validate-protocol.ps1: exit 0 in 2s
- test-protocol.ps1: exit 0 in 147s
- reproduce: node scripts/protocol-handoff.cjs verify
