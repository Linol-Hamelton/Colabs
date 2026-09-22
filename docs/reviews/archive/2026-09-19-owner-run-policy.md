# Owner Run Policy - Model Usage for Tests, Analysis and Coding

**Date**: 2026-09-19  
**Recorded by**: DeepSeek (deepseek-flash), controller  
**Owner directive (direct chat confirmation, 2026-09-19)**: future **test runs** are performed only on **free models**. **Paid models** are reserved for **analysis and coding**. **Gemini is the exception**: it has higher limits and may also be used for test runs, but "without fanaticism".

## Implications for the H1 pilot and future experiments

1. No further paid-subject pilot batches: the DeepSeek V4 Pro repetitions 2-3 are cancelled; the codex confirmation batch does not resume on paid quota (already exhausted; resets Sep 20 01:53).
2. Confirmation runs use free access only: `agy` (Antigravity CLI) is the current free path; `claude` via `agy` is acceptable within the Gemini exception quota; Qwen Code stays unused until its account issue is resolved.
3. Paid-model usage now covers: adversarial audits, plan/architecture analysis, implementation (coding) support - the same roles the protocol's gate model already assumes.
4. Cost discipline from the cost-policy addendum remains in force (batch estimates, pre-approval, one repetition for any non-free subject, cheapest adequate model otherwise).
