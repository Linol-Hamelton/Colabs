# Launch: task:f02-verifier

- Frame: `task:f02-verifier` (parent frame: F-02, `docs/research/2026-09-26-model-layer/README.md`). This role holds for this frame only.
- Role: independent verifier, round 2 (README section "Round 2"). You decide nothing; the gate owner decides.
- Agent name for the protocol: `mistral`. Model and route (owner-named, fixed): Mistral Medium 3.5, effort max (client configuration), through vibe.
- README first: `docs/research/2026-09-26-model-layer/README.md` (binding contract). Read the round-1 outputs: `round1/benchmark-registry.json`, `round1/model-benchmark-evidence.jsonl`, `round1/methodology.md`, `round1/CITATIONS.md`, `round1/COVERAGE-A.md`, `round1/COVERAGE-B.md`.
- Round-2 work (README):
  - re-open sources independently and check: 100% of registry entries for existence; 100% of `vendor` rows; 100% of the rows deciding a top position; a seeded random sample of at least 20% of the remaining rows (record the seed);
  - set `verification` on every row you touched and `existence_verified` on every registry entry;
  - challenge comparability and coverage; assemble the merged `round1/COVERAGE.md` from `COVERAGE-A.md` and `COVERAGE-B.md`, marking your corrections;
  - `round2/VERIFICATION.md`, at most 250 lines, with a verdict PASS / RECOMMENDATION / FAIL and a reproduction for each FAIL claim.
- Do not edit files outside `docs/research/2026-09-26-model-layer/` and your journal. No commits, tags, pushes or branches.
- Close with a five-label journal entry and `record --quick`; frame line: `Orientation: ... @ task:f02-verifier`.
