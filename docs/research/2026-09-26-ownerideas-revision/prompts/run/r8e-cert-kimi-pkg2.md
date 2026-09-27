# Launch: task:ownerideas-r8e-cert-kimi-pkg2

- Frame: `task:ownerideas-r8e-cert-kimi-pkg2` (parent program: `ownerideas-revision`). This role
  holds for this frame only.
- Role: certification round 3 (Kimi; final allowed round) on the FROZEN CANDIDATE produced by the
  operator gate `r9g-freeze-candidate` (the repair commit carrying r9e + r9f; the launch file is
  being read after the freeze, so name the commit you find at HEAD in your header).
- Agent name / route: `kimi`, `moonshot-ai/kimi-k2.7-code-highspeed` (the same model as before; do
  not switch to a subscription route unless it is confirmed to be the same model).
- Read `prompts/COMMON.md`, `prompts/CERTIFY.md` (rules; Mode CERTIFYING; HEAD line; worktree-only,
  never `git checkout` in the shared copy), `round9/REPAIR-PKG2-R3-GEMINI.md`,
  `round9/REPAIR-USAGE-GEMINI.md`, `round8/CERT-MIMO-PKG2-R2.md` (the residuals you must see
  resolved), and the packages.
- Scope (report limit raised to 250 lines):
  - **PKG-2 in full**, including the residuals F-PKG2-R2-1..R2-4;
  - **PKG-1 and PKG-3 in full** now, with the named criteria PKG-1 S8, PKG-3 S8 (including the
    `report` reason) and PROTO-DEC-0075 item 9 (cost recorded from the log, never estimated);
  - PKG-5 keeps its round-1 verdict: state that it is not re-opened.
- Output: `docs/research/2026-09-26-ownerideas-revision/round8/CERT-KIMI-PKG2-R3.md`; header
  `Mode: CERTIFYING`, the full frozen CANDIDATE SHA, actual HEAD, the empty normative diff line
  (`git diff --stat <CANDIDATE> HEAD -- .ai/bin tests docs/specs .ai/docs .ai/SIGNALS.md docs/ops protocol-manifest.json`),
  `Receipt-Owner`, scope, one `Verdict: PASS | FAIL`, per-criterion table with reproductions. At
  most 250 lines; full `record` (not --quick); no commits; do not read the MiMo report of this round.
- This is round 3 of 3 (PROTO-DEC-0047 item 5): a reproduced FAIL goes to the owner with the
  reproduction; no automatic round 4.
