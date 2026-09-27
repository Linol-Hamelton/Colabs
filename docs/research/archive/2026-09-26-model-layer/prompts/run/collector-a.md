# Launch: task:f02-collector-a

- Frame: `task:f02-collector-a` (parent frame: F-02, `docs/research/2026-09-26-model-layer/README.md`). This role holds for this frame only.
- Role: collector A - benchmark registry, methodology, citation recovery (README section "Round 1", collector A). You decide nothing; the gate owner decides.
- Agent name for the protocol: `gemini`. Model and route (owner-named, fixed): Gemini 3.8 Flash, effort high, through agy.
- README first: `docs/research/2026-09-26-model-layer/README.md` (the contract, schemas, normalization, exit conditions). It is binding; the "Out of scope" list is a STOP list.
- Round-1 deliverables (collector A):
  - `round1/CITATIONS.md` - the recovery table for the 10 `:chatgpt-content-reference` markers in `OwnerIdeas/benchmark.md` (verified source URL+date, or the claim removed);
  - `round1/benchmark-registry.json` - the six benchmark dimensions plus SWE-Lancer Manager for D-CRIT, per the README schema;
  - `round1/methodology.md` - the normalization and provenance rules verbatim;
  - `round1/COVERAGE-A.md` - your per-dimension coverage draft (COVERED / WEAK / MISSING with reasons).
- Write `round1/COVERAGE-A.md`, not `round1/COVERAGE.md`: collector B writes `COVERAGE-B.md` in parallel; two writers on one path would lose one draft. The merged audit is assembled at round 2 from both files.
- Do not edit files outside `docs/research/2026-09-26-model-layer/round1/` except `OwnerIdeas/benchmark.md` markers (replace a marker with its verified source or remove the claim it supported) and your journal. No commits, tags, pushes or branches.
- Protocol, mandatory and first: start your session (`node .ai/bin/protocol-session.cjs start --agent gemini`) and make the FIRST journal write contain both lines `Launch: model=... effort=... client=...` and `Orientation: <model> @ task:f02-collector-a ... independent collector A | success=<your output>` before any other work; the runner matches the frame by that Orientation line (an earlier attempt without it was misread as NO_START).
- Close with a five-label journal entry and `record --quick`; frame line as above.
