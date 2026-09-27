# Launch: task:ownerideas-r8d-cert-kimi-pkg2

- Frame: `task:ownerideas-r8d-cert-kimi-pkg2` (parent program: `ownerideas-revision`). This role
  holds for this frame only.
- Role: certification round 2 (Kimi) - **PKG-2 only** on the new CANDIDATE produced by the targeted
  PKG-2 repair. PKG-1, PKG-3 and PKG-5 keep their round-1 verdicts (yours: PASS on all three;
  state this in the report).
- Agent name for the protocol: `kimi`. Model and route (frozen): Kimi K2.7 Code HighSpeed through
  the `kimi` CLI.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `docs/research/2026-09-26-ownerideas-revision/prompts/CERTIFY.md` (rules; HEAD line; no checkout
  in the shared copy - use `git worktree add .ai/runtime/cert-kimi2 <new CANDIDATE>` if workable,
  otherwise verify against committed blobs with `git show` and say so), then
  `round9/REPAIR-PKG2-GEMINI.md`, `round8/CERT-MIMO.md` (PKG-2 FAIL items) and the PKG-2 package.
- Output (exactly one file): `docs/research/2026-09-26-ownerideas-revision/round8/CERT-KIMI-PKG2-R2.md`.
  Header `Mode: CERTIFYING`, the full new-CANDIDATE SHA, the actual HEAD, the empty normative diff
  line, `Receipt-Owner`, scope "PKG-2 round 2 (PKG-1/3/5 from round 1: PASS)", one overall
  `Verdict: PASS | FAIL`, the per-criterion table. At most 150 lines.
- Full `protocol-handoff.cjs record` at the end (not --quick); no commits; no edits outside the
  report and journal; do not read `round8/CERT-MIMO-PKG2-R2.md`.
