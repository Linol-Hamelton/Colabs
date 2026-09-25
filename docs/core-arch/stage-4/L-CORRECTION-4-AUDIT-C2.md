# Package L, correction pass 4: launch of certifier 2

- For: the owner-named certifier 2, one of the two parallel independent certifiers that
  PROTO-DEC-0041 item 2 requires for this high-risk path (PROTO-DEC-0038 item 1). Certifier 1 was
  Gemini.
- Excluded, for independence: DeepSeek (implementer), Gemini (certifier 1), Opus (spec author).
- History:
  - a first attempt on GPT-6 Astra stopped on a Tier-mismatch (journal codex-129b857dadc9ecbc);
  - a second attempt on GPT-5.6 Sol ran `launch-test.cjs` three times, 129/129 each, but the
    provider's safety filter refused the security probes, so no report or Evidence exists.

  Neither attempt counts as a certification.
- Follow `docs/core-arch/stage-4/L-CORRECTION-4-AUDIT.md` in full, with these replacements, which
  win where that file names certifier 1:
  - agent name: your maker's (`mistral`, `codex`, ...); start with
    `node .ai/bin/protocol-session.cjs start --agent <that name>`;
  - journal line 1: `Launch: model=<actual id> effort=<value|unknown> client=<client>`; line 2:
    `Orientation: <model> @ task:l-correction-4-audit-c2 (parent program:core-arch): certifier 2 |
    success=your report`;
  - candidate: `130255471e0e610e48cfde2ff0c6ed369f4d4492`. Read and test only at that SHA, in a
    detached worktree under the system temp directory, removed afterwards;
  - report: `docs/reviews/2026-09-25-<agent name>-core-arch-L-correction-4-audit.md`, written with
    your file-writing tool; a chat reply is not the report;
  - independence: do not open `docs/reviews/2026-09-25-gemini-core-arch-L-correction-4-audit.md`,
    Gemini's journal, or the Codex attempt journals before your report is written. Then record in
    your journal the sha256 of your report and the words "did not open the certifier 1 report
    before this".
- All probes are authorised by the repository owner. They run on disposable local repositories
  with synthetic canary values, in a temporary worktree, and never touch a real remote or a real
  credential (PROTO-DEC-0077 item 3). If a tool still refuses a probe, write that item as BLOCKED
  with the refusal text, and finish the rest.
- Verify yourself, never accept as given: the implementer reports 129/129 test runs; one earlier
  run saw a timeout of `zz-t16`. Run `launch-test.cjs` three times in a row and report each exit.
- Talk to the owner in Russian; write the report in English. No commit, tag or push. End with the
  full `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>`, then a short report to
  the owner in Russian.
