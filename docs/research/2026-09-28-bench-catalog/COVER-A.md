# COVER-A: evidence per benchmark row (collector A, frame F-18)

One line per CATALOG-A.jsonl row: benchmark - evidence URL(s) accessed 2026-09-28. The score
source for each individual value is in the row's `scores[].source_url`; this cover lists the
evidence used for the row's existence and key fields.

- MMLU-Pro - https://huggingface.co/spaces/TIGER-Lab/MMLU-Pro (leaderboard); scores: https://benchlm.ai/benchmarks/mmluPro, https://pricepertoken.com/leaderboards/benchmark/mmlu-pro, https://llm-stats.com/benchmarks/mmlu-pro, https://benchlm.ai/compare/gemini-3-1-pro-vs-gemini-3-8-flash, https://benchlm.ai/compare/claude-opus-5-vs-gpt-5-5-pro, https://benchlm.ai/models/deepseek-v4-1-flash
- GPQA Diamond - https://epoch.ai/benchmarks/gpqa-diamond (canary/password note); scores: https://artificialanalysis.ai/evaluations/gpqa-diamond, https://intuitionlabs.ai/articles/gpqa-diamond-ai-benchmark, https://benchlm.ai/compare/claude-opus-5-vs-gpt-5-5-pro, https://www.requesty.ai/models/mistral/mistral-medium-3-5
- ARC-AGI-1 - https://arcprize.org/leaderboard (all v1 scores); contamination allegation via https://www.reddit.com/r/singularity/comments/1jj2kez/arcagi2_leaderboard/
- ARC-AGI-2 - https://arcprize.org/arc-agi/2 and https://arcprize.org/leaderboard (all v2 scores); https://arcprize.org/results/anthropic-claude-opus-5, https://arcprize.org/results/anthropic-claude-opus-5-5
- ARC-AGI-3 - https://arcprize.org/leaderboard (all v3 scores); corroborated by https://benchlm.ai/benchmarks/arcagi3
- Humanity's Last Exam (HLE) - https://labs.scale.com/leaderboard/humanitys_last_exam (official; HLE-Rolling update note); scores: https://artificialanalysis.ai/evaluations/humanitys-last-exam, https://benchlm.ai/benchmarks/hle, https://cellcog.ai/blog/gemini-3-8-flash/ (vendor claim)
- AIME 2025 - https://artificialanalysis.ai/evaluations/aime-2025 (scores); https://llm-stats.com/benchmarks/aime-2025, https://benchlm.ai/benchmarks/aime2025, https://www.kaggle.com/benchmarks/open-benchmarks/aime-2025 (task structure)
- OMEGA - https://allenai.org/blog/omega (only source; no public leaderboard found, scores stay unknown)
- SWE-bench Verified - https://www.swebench.com/ (official leaderboards); scores: https://llm-stats.com/benchmarks/swe-bench-verified, https://benchlm.ai/benchmarks/swe-bench-verified, https://leaderboard.steel.dev/leaderboards/swe-bench-verified/, https://localaimaster.com/models/swe-bench-explained-ai-benchmarks, https://www.morphllm.com/claude-benchmarks, https://www.morphllm.com/deepseek-v4, https://huggingface.co/mistralai/Mistral-Medium-3.5-128B (vendor claim), https://llm-stats.com/models/compare/claude-opus-5-5-vs-claude-sonnet-5
- SWE-bench Lite - https://www.swebench.com/ (tabs); scores: https://pricepertoken.com/leaderboards/benchmark/swe-bench-lite
- SWE-bench Multilingual - https://www.swebench.com/multilingual-leaderboard.html (structure); scores: https://llm-stats.com/benchmarks/swe-bench-multilingual, https://llm-stats.com/models/compare/claude-opus-5-5-vs-claude-sonnet-5
- SWE-bench Multimodal - https://www.swebench.com/ and https://github.com/swe-bench/SWE-bench (integration note); scores: https://llm-stats.com/benchmarks/swe-bench-multimodal, https://benchlm.ai/benchmarks/swe-bench-multimodal
- SWE-bench Pro - https://labs.scale.com/leaderboard/swe_bench_pro (official); scores: https://llm-stats.com/benchmarks/swe-bench-pro, https://www.morphllm.com/claude-benchmarks, https://www.datacamp.com/blog/gemini-3-8-flash-cyber (vendor claim), https://localaimaster.com/models/swe-bench-explained-ai-benchmarks (SEAL top)
- LiveCodeBench - https://livecodebench.github.io/leaderboard.html (official); scores: https://artificialanalysis.ai/evaluations/livecodebench, https://benchlm.ai/benchmarks/livecodebench, https://llm-stats.com/benchmarks/livecodebench, https://pricepertoken.com/leaderboards/benchmark/livecodebench
- SWE-Lancer - https://github.com/swelancer/leaderboard (data + grading + leaderboard); scores: https://llm-stats.com/benchmarks/swe-lancer, https://llm-stats.com/benchmarks/swe-lancer-(ic-diamond-subset); paper https://arxiv.org/abs/2502.12115
- OSWorld - https://osworld-v1.xlang.ai/ (official, 369 tasks, verified-leaderboard rules); scores: https://benchlm.ai/benchmarks/osworld-verified, https://llm-stats.com/benchmarks/osworld, https://leaderboard.steel.dev/leaderboards/osworld/; OSWorld 2.0 vendor figures via https://cellcog.ai/blog/gemini-3-8-flash/ and https://www.mindstudio.ai/blog/gemini-3-8-flash-harness-demos
- tau-bench / tau2-bench - https://github.com/sierra-research/tau2-bench (official repo, v1.0.1 note, taubench.com); scores: https://benchlm.ai/benchmarks/tau2-bench, https://openrouter.ai/benchmarks/tau2-bench-airline, https://www.requesty.ai/models/mistral/mistral-medium-3-5, https://pricepertoken.com/leaderboards/benchmark/tau2
- GAIA - https://huggingface.co/spaces/gaia-benchmark/leaderboard (official, server-side scoring); scores: https://leaderboard.steel.dev/leaderboards/gaia/, https://rapidclaw.dev/blog/gaia-benchmark-leaderboard-2026, https://pricepertoken.com/leaderboards/benchmark/gaia

Ladder-model check (PROTO-DEC-0094 B.1/B.5): this session ran as Mistral Medium 3.5; the
"falling back" log check is recorded by the operator in LAUNCH-COLLECTOR-A.md (requested
glm-5-3, ran mistral-medium-3.5 while the alias is unresolved). Direct vibe-log reads are
outside this session's approval boundary; no model label was recorded from self-report.
