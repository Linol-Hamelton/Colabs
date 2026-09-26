# Launch: task:ownerideas-r2-mimo

- Frame: `task:ownerideas-r2-mimo` (parent program: `ownerideas-revision`). This role holds for
  this frame only.
- Role: synthesiser B — the MiMo synthesis over the frozen round-1 corpus. Your own synthesis only;
  the outcome of this frame is the single output file below.
- Agent name for the protocol: `mimo`. Model and route (frozen, do not change): MiMo-V2.6-Pro,
  effort high (`--variant high`), through the `mimo` CLI with model `xiaomi/mimo-v2.6-pro`.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `docs/research/2026-09-26-ownerideas-revision/prompts/SYNTHESIS.md`. The frozen corpus list is
  `docs/research/2026-09-26-ownerideas-revision/round2/CORPUS.txt`; verify every hash in it.
- Output (exactly one file): `docs/research/2026-09-26-ownerideas-revision/round2/SYNTHESIS-MIMO.md`.
- Do not open `round2/SYNTHESIS-KIMI.md` or any file under `round1/` other than the four reviews
  listed in `CORPUS.txt`. Work independently.
