# Problems: isolated blocking defects (PROTO-DEC-0076 item 5)

A blocking defect stops a named piece of work. Each entry states:
- what it blocks;
- the evidence;
- the isolation, meaning what continues around it;
- the way out.

Closed entries stay, with the closing commit.

## P-1: package L push block defeated (F-3P-1) - OPEN

- Blocks: K-launch of the improvement research (PROTO-DEC-0066), the only consumer of the research
  launcher.
- Evidence: `docs/reviews/2026-09-25-deepseek-core-arch-stage2-review-packageL-third-pass.md`
  (FAIL, HIGH): a job pushes past the `insteadOf` rule with `git -c` or `GIT_CONFIG_GLOBAL`, and the
  clone shows no trace.
- Isolation: nothing else uses `launch.cjs`. The council ran on its own runner, which gives jobs no
  push path of their own: the jobs work in the checkout, where no step pushes.
- Way out:
  1. the owner decides C-1 (the council's F-3P-1 proposal);
  2. the L correction pass implements it, together with S-2, S-3, M-1 and M-2;
  3. a fourth review pass on package L.

## P-2: council participants without Evidence - OPEN, non-blocking unless certification needs it

- Blocks: nothing now. It would block a certification that requires Evidence from every
  participant.
- Evidence:
  - `codex-fda1eee5684e0097` (critique-a): cut by the OpenAI limit before its entry;
  - `mistral-verify-001` (the first verification): hand-made journal, because the runner gave vibe
    no shell.
- Isolation: both outputs are complete and were accepted by the coordinator with recorded reasons.
- Way out:
  - resume the codex session after its limit resets, to write its entry;
  - the Mistral verification is superseded by `verification-2.md`, whose participant has Evidence.
