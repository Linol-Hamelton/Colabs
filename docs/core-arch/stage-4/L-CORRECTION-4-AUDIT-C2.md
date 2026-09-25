# Package L, correction pass 4: launch of certifier 2

- For: Codex (GPT-5.6 Sol), run by the owner. You are **certifier 2** of the two parallel
  independent certifiers that PROTO-DEC-0041 item 2 requires for this high-risk path (PROTO-DEC-0038
  item 1). Certifier 1 was Gemini.
- Follow `docs/core-arch/stage-4/L-CORRECTION-4-AUDIT.md` in full, with these replacements, which
  win where that file names certifier 1:
  - agent name `codex`: start with `node .ai/bin/protocol-session.cjs start --agent codex`;
  - journal line 1: `Launch: model=<actual id> effort=<value> client=<Codex CLI or extension>`;
    line 2: `Orientation: <model> @ task:l-correction-4-audit-c2 (parent program:core-arch):
    certifier 2 | success=your report`;
  - candidate: `130255471e0e610e48cfde2ff0c6ed369f4d4492`. Read and test only at that SHA, in a
    detached worktree under the system temp directory, removed afterwards;
  - report: `docs/reviews/2026-09-25-codex-core-arch-L-correction-4-audit.md`;
  - independence: do not open `docs/reviews/2026-09-25-gemini-core-arch-L-correction-4-audit.md`
    or Gemini's journal before your report is written. After it is written, you may compare, and
    you record in your journal the sha256 of your report and the words "did not open the certifier 1
    report before this".
- Known context you must verify yourself, never accept as given: the implementer reports 129/129
  test runs. Certifier 1 saw one timeout of scenario `zz-t16` in one of four runs, under concurrent
  WMI queries. Run `launch-test.cjs` three times in a row and report each exit.
- Talk to the owner in Russian; write the report in English. No commit, tag or push. End with the
  full `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>`, then a short report to
  the owner in Russian.
