# Launch: task:ownerideas-r8e-cert-kimi-pkg2

- Frame: `task:ownerideas-r8e-cert-kimi-pkg2` (parent program: `ownerideas-revision`). This role
  holds for this frame only.
- Role: certification round 3 (Kimi) - **PKG-2 only** on the final CANDIDATE produced by the
  round-3 repair (`round9/REPAIR-PKG2-R3-GEMINI.md`; commit to be named in the report header).
  PKG-1, PKG-3 and PKG-5 keep their earlier PASS verdicts; state that.
- Agent name / route: `kimi`, `moonshot-ai/kimi-k2.7-code-highspeed`.
- Read `prompts/COMMON.md`, `prompts/CERTIFY.md`, `round8/CERT-MIMO-PKG2-R2.md` (residual items),
  and the repair report. Prefer a worktree at the new CANDIDATE (`git worktree add
  .ai/runtime/cert-kimi3 <sha>`); never `git checkout` in the shared copy.
- Output: `docs/research/2026-09-26-ownerideas-revision/round8/CERT-KIMI-PKG2-R3.md`; header
  `Mode: CERTIFYING`, full CANDIDATE SHA, actual HEAD, the empty normative diff line
  (`git diff --stat <CANDIDATE> HEAD -- .ai/bin tests docs/specs .ai/docs .ai/SIGNALS.md docs/ops protocol-manifest.json`),
  `Receipt-Owner`, scope, one `Verdict: PASS | FAIL`, per-criterion table with the reproductions.
  At most 150 lines; full `record` (not --quick); no commits; do not read the MiMo report of this round.
