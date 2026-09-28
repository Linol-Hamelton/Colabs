# Launch: task:ownerideas-r8d-cert-mimo-pkg2

- Frame: `task:ownerideas-r8d-cert-mimo-pkg2` (parent program: `ownerideas-revision`). This role
  holds for this frame only.
- Role: certification round 2 (MiMo-V2.6-Pro) - **PKG-2 only** on the new CANDIDATE produced by the
  targeted PKG-2 repair. PKG-1, PKG-3 and PKG-5 keep their round-1 verdicts (yours: PASS on all
  three; state this in the report). Re-verify your two round-1 PKG-2 FAIL items
  (`round8/CERT-MIMO.md`): the pins and the golden DONE record.
- Agent name for the protocol: `mimo`. Model and route (frozen): MiMo-V2.6-Pro through the `mimo`
  CLI, `--variant high`. The header states the owner accepted MiMo-V2.6-Pro over Flash on
  2026-09-26.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `docs/research/2026-09-26-ownerideas-revision/prompts/CERTIFY.md`, then
  `round9/REPAIR-PKG2-GEMINI.md` and the PKG-2 package. Prefer your own worktree at the new
  CANDIDATE; if `git worktree add` is blocked in your environment, verify against committed blobs
  with `git show` and say so in the report.
- Output (exactly one file): `docs/research/2026-09-26-ownerideas-revision/round8/CERT-MIMO-PKG2-R2.md`.
  Header `Mode: CERTIFYING`, the full new-CANDIDATE SHA, the actual HEAD, the empty normative diff
  line, `Receipt-Owner`, scope "PKG-2 round 2 (PKG-1/3/5 from round 1: PASS)", one overall
  `Verdict: PASS | FAIL`, the per-criterion table with your reproductions. At most 150 lines.
- Full `protocol-handoff.cjs record` at the end (not --quick); no commits; no edits outside the
  report and journal; do not read `round8/CERT-KIMI-PKG2-R2.md`.
