# Worklog: mistral-385c3d2443b430ad

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-28 - F-18 collector A: benchmark catalog rows for general/reasoning/agentic scope

Agent: mistral (vibe session mistral-385c3d2443b430ad; model Mistral Medium 3.5 - per LAUNCH-COLLECTOR-A.md, requested glm-5-3, ran mistral-medium-3.5 while the alias is unresolved, PROTO-DEC-0094 B.1; direct vibe-log reads are outside this session's approval boundary, so the operator's launch-file statement is the recorded evidence for the model label)

Action: Frame F-18 collector A per docs/research/2026-09-28-bench-catalog/LAUNCH-COLLECTOR-A.md. Session start via protocol-session.cjs (git status/log injected; the large-tracked-doc inventory was injected by the hook - arbitrary shell and git commands beyond .ai/bin/* were denied by the session approval callback, so `git ls-files` and reading other agents' newest journals could not be run directly; noted here per section 3). Collected public-source evidence for the collector-A scope: MMLU-Pro, GPQA Diamond, ARC-AGI-1/2/3, HLE, AIME 2025, OMEGA, SWE-bench Verified/Lite/Multilingual/Multimodal/Pro, LiveCodeBench, SWE-Lancer, OSWorld, tau-bench/tau2-bench, GAIA. Sources: official pages (arcprize.org leaderboard and per-model result pages, swebench.com, labs.scale.com, osworld-v1.xlang.ai, livecodebench.github.io, sierra-research/tau2-bench, HF spaces) plus tracked leaderboards (Artificial Analysis, BenchLM, llm-stats, Epoch AI, OpenRouter, steel.dev, pricepertoken, Vals.ai). Wrote docs/research/2026-09-28-bench-catalog/CATALOG-A.jsonl (18 rows, 82 score entries, every score with source URL) and COVER-A.md (evidence per row). Dimension enum used exactly as the launch file defines it; F-02's own names (D-ALGO, D-TERM, D-CRIT) are recorded in notes where they differ. Vendor claims (Mistral HF card, DeepSeek model card, Google announcement table) are marked as vendor claims in notes.

Result: CATALOG-A.jsonl validates: 18/18 rows parse, all required keys present, status/dimension/contamination_risk enums respected, 82 scores each carrying model/score/source_url. Unknowns kept unknown: OMEGA has no public per-model scores (empty scores array, named models in notes); Mistral Medium 3.5 has no ARC-AGI entry; no Opus 5.5/Gemini 3.8/Mistral AIME 2025 rows were found. Not verified in this pass: the ARC-AGI 3 memorization allegation is recorded as an allegation (community report of the paper), not a finding; aggregator figures (requesty.ai) are marked as aggregator-sourced. No commit, no push (operator collects), no decisions, no verdicts, no TASK.md/PLAN.md edits.

Next step: operator merges with collector B into CATALOG.jsonl and runs the cover/dup checks; the independent verifier (MiMo-V2.6-Pro, 20% sample) samples these rows.

Open: shell access was restricted to node .ai/bin/* by the approval callback - the mandatory git ls-files inventory and cross-agent journal reading (section 3) were only partially satisfiable via the session-start injection; flagging for the operator. HLE and MMLU-Pro show protocol-split leaderboards (closed-book vs tool-assisted; Vals vs BenchLM rows) - cross-board comparability is invalid and is noted per row.

Evidence:
- anchor: 99555b9c33a51c7fc7fac52893f2f7c690ff1681, uncommitted changes present
- digest: sha256:35ccbc6dd63c9bf4f34c487549e0c5d095d6c7b093ee6a605083f8ecb708fe6f over 1873 tracked and untracked files
- digest format: 4
- recorded: 2026-09-28T13:24:35.376Z by mistral-385c3d2443b430ad
- entry hash format: 2
- entry: sha256:64d9b3af9bfb555564b0708895ad31ca553ca07c0e9768428ed480825cadd322 of this entry without this block
- parent-entry: root
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 11s
- reproduce: node .ai/bin/protocol-handoff.cjs verify

---

