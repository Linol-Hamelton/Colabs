Launch: model=DeepSeek 4.1 Flash effort=max client=kilo route=`kilo run -m deepseek/deepseek-flash`
Orientation: DeepSeek 4.1 Flash @ task:f02-collector-b (parent program:model-layer): collector B, model-by-benchmark evidence | rights=write round1/ outputs and own journal only | limits=no edits elsewhere, no other round1/ files opened, no commit/tag/push/branch | success=round1/model-benchmark-evidence.jsonl, round1/COVERAGE-B.md | role holds for this frame only

# Worklog: deepseek-25ba5a48071ffe96

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-26 - F-02 round 1 collector B: model-by-benchmark evidence

Agent: DeepSeek 4.1 Flash (session owner deepseek-25ba5a48071ffe96)

Action: Read the F-02 README and the launch file, then ran a bounded search pass over the nine seeded benchmarks of benchmark.md sections 2-8 (SWE-Bench Pro, SWE-Lancer IC, RepoProbe, ArchBench, AACR-Bench, Terminal-Bench, LiveCodeBench, Aider Polyglot, SWE-Lancer Manager) for every frozen working-set model, using official boards, vendor cards and named independent evaluators (Artificial Analysis via BenchLeader, Vals AI via BenchLeader, benchlm, llm-stats, llmboard, benchmarklist, llmlearner, vibecoderjournal, tbench.ai, anthropic.com, openai.com, Google model card, DeepSeek card via a guide page). Wrote `round1/model-benchmark-evidence.jsonl` (53 rows; script-validated: unique ids, all schema fields, allowed source_class/comparability; no row where nothing was found; the explicitly estimated DeepSeek SWE-Bench Pro cell excluded) and `round1/COVERAGE-B.md` (per-dimension and per-model draft, not-found matrix, comparability warnings). No file outside `round1/` and this journal was edited.

Result: Draft coverage: D-TERM COVERED (Terminal-Bench rows for all 11 rungs on at least one version); D-IMPL, D-ALGO, D-EDIT WEAK; D-ARCH, D-REV, D-CRIT MISSING because RepoProbe, ArchBench, AACR-Bench and both SWE-Lancer splits evaluate no frozen model at this snapshot. Draft model status: GPT-5.6 Sol, GPT-5.6 Terra, Gemini 3.8 Flash SUFFICIENT-provisional (4 dimensions each); the other eight rungs PARTIAL; none INSUFFICIENT. Material caveats: vendor-vs-independent gaps on Terminal-Bench 4.0 (Opus 5.5 xhigh 66.4 vendor vs 59.6 AA; Terra 23.6 vendor vs 35.4 AA max with a non-monotonic AA effort curve, high 1.5); SWE-Bench Pro validity contested by OpenAI's 2026-07-08 audit; Aider Polyglot only via third-party re-runs (maintainer board has no frozen rows); DeepSeek identity mapping assumed (frozen "V4.1 Max" = V4.1 Flash at max effort). Collector A's `round1/benchmark-registry.json` did not exist at write time, so benchmark_ids are unaligned; noted for round 2.

Next step: Round 2 - verifier re-opens sources (100% of vendor rows, 100% of top-position rows, >=20% seeded sample); collectors then rename benchmark_ids to A's registry ids and mark rows on benchmarks A excludes (rows stay).

Open: (1) benchmark_id alignment pending A's registry; (2) "DeepSeek V4.1 Max" identity mapping needs confirmation; (3) Terra TB 4.0 high-effort row (1.5%) needs a primary-source check; (4) Aider rows' partial comparability may be downgraded to none by the verifier; (5) no snapshots archived (no archiving tooling available in this run).

Evidence:
- anchor: 61d9a35b85bd248a69cdf34a79f820c5751f2e52, uncommitted changes present
- digest: sha256:ee3a47b725df33103b2b4e8c3ab863f2e020bd721db9ac4aee7c2d81700a22e9 over 585 tracked and untracked files
- digest format: 4
- recorded: 2026-09-26T12:25:28.423Z by deepseek-25ba5a48071ffe96
- entry hash format: 2
- entry: sha256:89880dc26c11deef2a87a2da8f2cf5e2ecc01b46cb0bc85068ff4a4be314c771 of this entry without this block
- parent-entry: root
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 4s
- reproduce: node .ai/bin/protocol-handoff.cjs verify

---

