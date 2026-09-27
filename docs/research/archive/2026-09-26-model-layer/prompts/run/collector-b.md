# Launch: task:f02-collector-b

- Frame: `task:f02-collector-b` (parent frame: F-02, `docs/research/2026-09-26-model-layer/README.md`). This role holds for this frame only.
- Role: collector B - model-by-benchmark evidence (README section "Round 1", collector B). You decide nothing; the gate owner decides.
- Agent name for the protocol: `deepseek`. Model and route (owner-named, fixed): DeepSeek 4.1 Flash, effort max, through `kilo run -m deepseek/deepseek-flash`.
- README first: `docs/research/2026-09-26-model-layer/README.md` (the contract, schemas, normalization, exit conditions). It is binding; the "Out of scope" list is a STOP list.
- Round-1 deliverables (collector B):
  - `round1/model-benchmark-evidence.jsonl` - one JSON object per line, one observation per line, for every frozen working model across the benchmarks of benchmark.md sections 2-8, per the README schema and provenance rules;
  - `round1/COVERAGE-B.md` - your per-model coverage draft (SUFFICIENT / PARTIAL / INSUFFICIENT with reasons).
- Write `round1/COVERAGE-B.md`, not `round1/COVERAGE.md`: collector A writes `COVERAGE-A.md` in parallel; two writers on one path would lose one draft. The merged audit is assembled at round 2 from both files.
- At the end of round 1, align `benchmark_id`s with A's `round1/benchmark-registry.json` if it exists; rows on benchmarks A EXCLUDES stay but are marked (README).
- Do not edit files outside `docs/research/2026-09-26-model-layer/round1/` and your journal. No commits, tags, pushes or branches.
- Close with a five-label journal entry and `record --quick`; frame line: `Orientation: ... @ task:f02-collector-b`.
