# CITATIONS - Citation Recovery Table (Round 1)

Frame: `task:f02-collector-a` (parent frame: F-02, `docs/research/2026-09-26-model-layer/README.md`)  
Collector: `gemini` (Gemini 3.8 Flash high via agy)  
Date: 2026-09-26 (UTC)  
Target: `OwnerIdeas/benchmark.md` `:chatgpt-content-reference` markers (10 total, indices 0–9)

## Executive Summary

All 10 dangling `:chatgpt-content-reference` markers in `OwnerIdeas/benchmark.md` were investigated against primary source literature, conference proceedings, vendor technical reports, and benchmark repositories. 
- **10 of 10 claims were successfully verified** with primary source URLs, publication dates, and author/maintainer provenance.
- Zero claims were refuted or required deletion; all supported real, published software engineering and LLM evaluation benchmarks.
- Each marker in `OwnerIdeas/benchmark.md` is replaced by an explicit markdown citation link carrying the source name and publication date.

---

## Recovery Table

| Index | Location in `benchmark.md` | Claim Text & Subject | Verified Primary Source | Publication Date | Source Class | Status | Replacement in `benchmark.md` |
|---|---|---|---|---|---|---|---|
| `0` | Section 2.A, line 76 | SWE-Bench Pro: harder, realistic, contamination-resistant successor to SWE-Bench Verified; bug fixes, features, optimizations, security, UI/UX; long-horizon multi-file changes (averaging 107 LOC across 4.1 files). | [Scale AI Research: SWE-Bench Pro](https://scale.com/blog/swe-bench-pro) (Technical announcement & report; [Paper](https://scale.com/research/swe_bench_pro); [Dataset](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro)) | 2025-09-19 (updated 2026-09-21) | `maintainer` | **VERIFIED** | `[Scale AI SWE-bench Pro, 2025-09-19](https://scale.com/blog/swe-bench-pro)` |
| `1` | Section 2.A, line 94 | SWE-Lancer IC: real-world freelance software engineering tasks with economic value; bug fixes, features, frontend, performance, verified by end-to-end tests. | [OpenAI Preparedness: SWE-Lancer Paper](https://arxiv.org/abs/2502.12115) (arXiv:2502.12115 [cs.SE]; [Blog](https://openai.com/index/swe-lancer); [Repo](https://github.com/openai/preparedness/tree/main/project/swelancer)) | 2025-02-18 | `maintainer` / `vendor` | **VERIFIED** | `[OpenAI SWE-Lancer, 2025-02-18](https://arxiv.org/abs/2502.12115)` |
| `2` | Section 3, line 118 | RepoProbe: evaluates repository-level code comprehension across 500 questions and 50 repositories; designed to combat edit bias. | [Tencent Hunyuan: RepoProbe Paper](https://arxiv.org/abs/2608.04783) (41st IEEE/ACM ASE 2026, arXiv:2608.04783 [cs.SE]; [Repo](https://github.com/Tencent-Hunyuan/RepoProbe)) | 2026-08-07 | `maintainer` | **VERIFIED** | `[Tencent Hunyuan RepoProbe, 2026-08-07](https://arxiv.org/abs/2608.04783)` |
| `3` | Section 3, line 144 | ArchBench: 2026 benchmark/platform for software architecture tasks (design, evaluation, trade-off reasoning, system decomposition); younger than SWE-bench. | [IEEE ICSA-C 2026: ArchBench Paper](https://doi.org/10.1109/icsa-c68850.2026.00037) ("ArchBench: Benchmarking Generative-AI for Software Architecture Tasks", 23rd IEEE ICSA-C 2026, DOI: 10.1109/icsa-c68850.2026.00037) | 2026-06 (online 2026-08-14) | `independent` | **VERIFIED** | `[ArchBench (IEEE ICSA-C), 2026-06](https://doi.org/10.1109/icsa-c68850.2026.00037)` |
| `4` | Section 4, line 154 | AACR-Bench: repository-level automatic code review benchmark; 200 PRs, 50 projects, 10 languages, expert-verified dataset. | [Alibaba Aone: AACR-Bench Paper](https://arxiv.org/abs/2601.19494) (arXiv:2601.19494 [cs.SE]; [Repo](https://github.com/alibaba/aacr-bench); [Dataset](https://huggingface.co/datasets/Alibaba-Aone/aacr-bench)) | 2026-01-28 | `maintainer` | **VERIFIED** | `[Alibaba AACR-Bench, 2026-01-28](https://arxiv.org/abs/2601.19494)` |
| `5` | Section 5, line 193 | Terminal-Bench: end-to-end tasks in terminal environments (compilation, environment setup, servers, ML, CLI execution). | [Harbor Framework: Terminal-Bench Platform](https://www.tbench.ai/) ([Docs & Repo](https://github.com/harbor-framework/terminal-bench); continuous releases up to v4.0 2026-09-24) | 2025-01-15 (v1.0; v4.0 2026-09-24) | `maintainer` | **VERIFIED** | `[Harbor Framework Terminal-Bench, 2025-01-15](https://www.tbench.ai/)` |
| `6` | Section 6, line 221 | LiveCodeBench: code generation, execution, test prediction, self-repair; continuously updated to prevent contamination. | [LiveCodeBench Paper](https://arxiv.org/abs/2403.07974) (arXiv:2403.07974 [cs.SE]; [Platform](https://livecodebench.github.io/); [Repo](https://github.com/LiveCodeBench/LiveCodeBench)) | 2024-03-12 (updated continuously) | `maintainer` | **VERIFIED** | `[LiveCodeBench, 2024-03-12](https://livecodebench.github.io/)` |
| `7` | Section 7, line 247 | Aider Polyglot: 225 difficult problems in C++, Go, Java, JS, Python, Rust; specifically tests code editing and patch formatting reliability. | [Aider Polyglot Leaderboard & Report](https://aider.chat/2024/12/21/polyglot.html) ([Harness Repo](https://github.com/paul-gauthier/aider/tree/main/benchmark)) | 2024-12-21 | `maintainer` | **VERIFIED** | `[Aider Polyglot Benchmark, 2024-12-21](https://aider.chat/2024/12/21/polyglot.html)` |
| `8` | Section 8, line 266 | SWE-Lancer Manager: managerial tasks evaluating candidate technical proposals against real engineering manager decisions. | [OpenAI Preparedness: SWE-Lancer Paper](https://arxiv.org/abs/2502.12115) (Section 3.2 "Manager Tasks", arXiv:2502.12115 [cs.SE]) | 2025-02-18 | `maintainer` / `vendor` | **VERIFIED** | `[OpenAI SWE-Lancer Manager Tasks, 2025-02-18](https://arxiv.org/abs/2502.12115)` |
| `9` | Section 25, line 893 | ArchBench: recommendation to include ArchBench in portfolio with lower initial confidence due to novelty. | [IEEE ICSA-C 2026: ArchBench Paper](https://doi.org/10.1109/icsa-c68850.2026.00037) ("ArchBench: Benchmarking Generative-AI for Software Architecture Tasks", 23rd IEEE ICSA-C 2026) | 2026-06 (online 2026-08-14) | `independent` | **VERIFIED** | `([ArchBench (IEEE ICSA-C), 2026-06](https://doi.org/10.1109/icsa-c68850.2026.00037))` |

---

## Detailed Evidence Notes

### Marker 0: SWE-bench Pro (`scale.com/blog/swe-bench-pro`)
Scale AI introduced SWE-bench Pro to address ceiling effects and data contamination on SWE-bench Verified. The benchmark contains 1,865 task instances (731 in public split, 858 held-out, 276 private commercial) across 41 repositories (11 public, 12 held-out, 18 enterprise startups). Tasks span bug fixes, feature requests, optimization, and security, requiring multi-file modifications averaging 107.4 lines across 4.1 files.

### Marker 1 & Marker 8: SWE-Lancer IC & Manager (`arxiv.org/abs/2502.12115`)
Published by OpenAI Preparedness (February 2025). Tasks are sampled from real Upwork freelance jobs with verified economic budgets ($1M total prize pool equivalent). The benchmark comprises two tracks:
- **IC (Individual Contributor)**: 198 offline-executable coding issues across real commercial freelance projects evaluated against end-to-end test suites.
- **Manager**: Technical proposal and design evaluation tasks where models review conflicting architecture/implementation pitches and select the optimal solution, scored against the ground-truth decisions of human engineering managers.

### Marker 2: RepoProbe (`arxiv.org/abs/2608.04783`)
Accepted at the 41st IEEE/ACM International Conference on Automated Software Engineering (ASE 2026). Developed by Tencent Hunyuan. Evaluates repository comprehension rather than code generation. Includes 500 open-ended technical questions derived from real GitHub Discussions across 50 diverse open-source repositories, using checklist-based verification protocols to penalize "edit bias" (modifying code without understanding system dependencies).

### Marker 3 & Marker 9: ArchBench (`doi.org/10.1109/icsa-c68850.2026.00037`)
Published in the proceedings of the 2026 IEEE 23rd International Conference on Software Architecture Companion (ICSA-C 2026, DOI 10.1109/icsa-c68850.2026.00037) by Bassam Adnan, Aviral Gupta, Sreemaee Akshathala, and Karthik Vaidhyanathan. Focuses specifically on software architecture reasoning: architectural design generation, trade-off analysis, architectural evaluation, and system decomposition.

### Marker 4: AACR-Bench (`arxiv.org/abs/2601.19494`)
Authored by Alibaba Aone / Alibaba Cloud (January 2026). Comprises 200 real pull requests sampled across 50 active repositories spanning 10 programming languages (C++, Go, Java, JavaScript, Python, Rust, etc.). Evaluates defect detection precision and recall in context-aware automatic code review against expert human reviewer annotations.

### Marker 5: Terminal-Bench (`tbench.ai`)
Maintained by Harbor Framework. Provides an execution harness evaluating autonomous coding agents on end-to-end terminal workflows in sandboxed Linux containers, including package compilation, server debugging, system dependency resolution, and shell scripting. Active releases: 2.1 (89 tasks), Hard (28 tasks), and 4.0 (66 tasks, released September 2026).

### Marker 6: LiveCodeBench (`arxiv.org/abs/2403.07974`)
Developed by Naman Jain et al. (UC Berkeley / MIT / Cornell). Continuously updated benchmark harvesting novel competition problems from LeetCode, AtCoder, and Codeforces to ensure contamination-free evaluation. Evaluates four distinct coding capabilities: code generation, self-repair, execution prediction, and test output prediction.

### Marker 7: Aider Polyglot (`aider.chat/2024/12/21/polyglot.html`)
Created by Paul Gauthier for the Aider agent harness. Evaluates models on 225 difficult programming problems across 6 major languages (C++, Go, Java, JavaScript, Python, Rust). Specifically measures patch application integrity, edit block formatting conformance, and multi-file code editing reliability.
