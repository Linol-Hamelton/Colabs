# Launch: task:ownerideas-r8e-cert-mimo-pkg2

- Frame: `task:ownerideas-r8e-cert-mimo-pkg2` (parent program: `ownerideas-revision`). This role
  holds for this frame only.
- Role: certification round 3 (MiMo-V2.6-Pro; final allowed round) on the FROZEN CANDIDATE produced
  by the operator gate `r9g-freeze-candidate` (the repair commit carrying r9e + r9f; name the
  commit you find at HEAD in your header). The header states the owner's 2026-09-26 acceptance of
  MiMo-V2.6-Pro in place of Flash.
- Agent name / route: `mimo`, `xiaomi/mimo-v2.6-pro --variant high`.
- Read `prompts/COMMON.md`, `prompts/CERTIFY.md`, `round9/REPAIR-PKG2-R3-GEMINI.md`,
  `round9/REPAIR-USAGE-GEMINI.md` (re-verify your four residuals and the usage/cost items), and the
  packages. Prefer your own worktree at the CANDIDATE; if `git worktree add` is blocked in your
  environment, verify against committed blobs and say so.
- Scope (report limit raised to 250 lines):
  - **PKG-2 in full**, including F-PKG2-R2-1..R2-4;
  - **PKG-1 and PKG-3 in full** now, with the named criteria PKG-1 S8, PKG-3 S8 (including the
    `report` reason) and PROTO-DEC-0075 item 9 (cost recorded from the log, never estimated; the
    two distinct `usage=none` reasons in `report`);
  - PKG-5 keeps its round-1 verdict: state that it is not re-opened.
- Output: `docs/research/2026-09-26-ownerideas-revision/round8/CERT-MIMO-PKG2-R3.md`; header
  `Mode: CERTIFYING`, the full frozen CANDIDATE SHA, actual HEAD, the empty normative diff line,
  `Receipt-Owner`, scope, one `Verdict: PASS | FAIL`, the per-criterion table with reproductions. At
  most 250 lines; full `record` (not --quick); no commits; do not read the Kimi report of this round.
- This is round 3 of 3 (PROTO-DEC-0047 item 5): a reproduced FAIL goes to the owner with the
  reproduction; no automatic round 4.
