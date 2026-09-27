# Launch: task:ownerideas-r9b-repair-pkg5

- Frame: `task:ownerideas-r9b-repair-pkg5` (parent program: `ownerideas-revision`). This role holds
  for this frame only.
- Role: stage-10 targeted repair (Gemini) - fix only the confirmed PKG-5 findings.
- Agent name for the protocol: `gemini`. Model and route (frozen): Gemini 3.8 Flash, effort high,
  through agy.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `docs/research/2026-09-26-ownerideas-revision/prompts/REPAIR.md` (rules) and the PKG-5 confirmed
  findings in `round8/CERT-KIMI.md` (final): (1) `tests/signals.test.cjs` missing; (2) P-L3-005
  missing; (3) a parse bug in `.ai/bin/protocol-signals.cjs`; (4) CLI-AGENTS section 10 missing;
  (5) the W3 `protocol-manifest.json` entries per PKG-5 S9 missing. Also read
  `round6/packages/PKG-5.md` (the contract) and, if present,
  `round8/IMPLEMENTATION-REVIEW-DEEPSEEK.md` / `round8/CERT-MIMO.md` for extra PKG-5 findings.
- Rules: reproduce each finding first; fix only confirmed ones minimally inside PKG-5's allowed
  paths; refute with evidence if a reproduction fails; never redesign; run PKG-5's validation
  commands and `validate-protocol.ps1` + `test-protocol.ps1`; no commits.
- Output (exactly one file): `docs/research/2026-09-26-ownerideas-revision/round9/REPAIR-PKG5-GEMINI.md`.
- Journal first write MUST contain the `Launch:` and `Orientation:` lines with the frame id.
