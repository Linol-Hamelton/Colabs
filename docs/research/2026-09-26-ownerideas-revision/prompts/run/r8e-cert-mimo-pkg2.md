# Launch: task:ownerideas-r8e-cert-mimo-pkg2

- Frame: `task:ownerideas-r8e-cert-mimo-pkg2` (parent program: `ownerideas-revision`). This role
  holds for this frame only.
- Role: certification round 3 (MiMo-V2.6-Pro) - **PKG-2 only** on the final CANDIDATE produced by
  the round-3 repair (`round9/REPAIR-PKG2-R3-GEMINI.md`; commit to be named in the report header).
  Re-verify your four residual items (F-PKG2-R2-1..R2-4). PKG-1, PKG-3 and PKG-5 keep their PASS
  verdicts; state that. The header states the owner's 2026-09-26 acceptance of MiMo-V2.6-Pro.
- Agent name / route: `mimo`, `xiaomi/mimo-v2.6-pro --variant high`.
- Read `prompts/COMMON.md`, `prompts/CERTIFY.md` and the repair report. Prefer a worktree; if
  `git worktree add` is blocked, verify against committed blobs and say so.
- Output: `docs/research/2026-09-26-ownerideas-revision/round8/CERT-MIMO-PKG2-R3.md`; header
  `Mode: CERTIFYING`, full CANDIDATE SHA, actual HEAD, the empty normative diff line, `Receipt-Owner`,
  scope, one `Verdict: PASS | FAIL`, the per-criterion table with reproductions. At most 150 lines;
  full `record` (not --quick); no commits; do not read the Kimi report of this round.
