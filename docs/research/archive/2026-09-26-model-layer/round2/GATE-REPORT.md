# F-02 gate report - downgraded and rejected rows (owner STOP-3 item 4)

Source: `round2/VERIFICATION.md` (PASS with RECOMMENDATIONS) and `round2/model-benchmark-evidence.jsonl`.
Nothing is deleted anywhere; this is the list the gate owner asked for, grouped by model.
Verdict context: 0 rows REJECTED; 20 CONFIRMED; 27 UNVERIFIED; registry 13/14 exist (`rulebench-doc` 404).

| Model (effort) | Rows | full | partial | none | Rows held out of profiles (reason) |
|---|---:|---:|---:|---:|---|
| DeepSeek V4.1 (Max) | 4 | 1 | 3 | 0 | b-053 aider-polyglot (directional only; aggregator, maintainer board outdated) |
| GPT-5.6 Luna (Max) | 2 | 1 | 1 | 0 | b-051 aider-polyglot (directional only; aggregator, maintainer board outdated) |
| GPT-5.6 Luna (XHigh) | 1 | 1 | 0 | 0 | - |
| GPT-5.6 Luna (unknown) | 2 | 0 | 2 | 0 | b-005 swe-bench-pro (do not pool V1/V2) |
| GPT-5.6 Sol (Max) | 4 | 3 | 1 | 0 | b-049 aider-polyglot (directional only; aggregator, maintainer board outdated) |
| GPT-5.6 Sol (Medium) | 2 | 2 | 0 | 0 | - |
| GPT-5.6 Sol (XHigh) | 1 | 0 | 1 | 0 | b-008 swe-bench-pro-v2 (do not pool V1/V2) |
| GPT-5.6 Sol (unknown) | 3 | 0 | 3 | 0 | b-003 swe-bench-pro (do not pool V1/V2) |
| GPT-5.6 Terra (High) | 3 | 3 | 0 | 0 | b-017 terminal-bench-4.0 High (non-monotonic effort curve; exclude until AA explains); b-029 terminal-bench-2.1 High (non-monotonic effort curve; exclude until AA explains); b-042 terminal-bench-hard High (non-monotonic effort curve; exclude until AA explains) |
| GPT-5.6 Terra (Max) | 3 | 1 | 2 | 0 | b-050 aider-polyglot (directional only; aggregator, maintainer board outdated) |
| GPT-5.6 Terra (XHigh) | 2 | 1 | 1 | 0 | b-009 swe-bench-pro-v2 (do not pool V1/V2) |
| GPT-5.6 Terra (unknown) | 3 | 0 | 3 | 0 | b-004 swe-bench-pro (do not pool V1/V2) |
| Gemini 3.6 Flash (High) | 2 | 2 | 0 | 0 | - |
| Gemini 3.6 Flash (unknown) | 1 | 0 | 1 | 0 | b-006 swe-bench-pro (do not pool V1/V2) |
| Gemini 3.7 Flash (High) | 3 | 3 | 0 | 0 | - |
| Gemini 3.7 Flash (unknown) | 2 | 0 | 2 | 0 | - |
| Gemini 3.8 Flash (High) | 5 | 3 | 2 | 0 | b-007 swe-bench-pro-v2 (do not pool V1/V2); b-052 aider-polyglot (directional only; aggregator, maintainer board outdated) |
| Gemini 3.8 Flash (unknown) | 2 | 0 | 2 | 0 | - |
| Mistral Medium 3.5 (unknown) | 2 | 1 | 1 | 0 | - |
| Opus 5.5 (High) | 1 | 1 | 0 | 0 | - |
| Opus 5.5 (Max) | 1 | 0 | 1 | 0 | b-001 swe-bench-pro (do not pool V1/V2) |
| Opus 5.5 (Medium) | 1 | 1 | 0 | 0 | - |
| Opus 5.5 (XHigh) | 2 | 1 | 1 | 0 | - |
| Opus 5.5 (unknown) | 1 | 0 | 1 | 0 | b-002 swe-bench-pro (do not pool V1/V2) |

## Coverage downgrades (per model, strict reading)

- All 11 frozen working models: evidence status PARTIAL (only D-TERM is COVERED).
- Dimensions WEAK: D-IMPL, D-ALGO, D-EDIT (below the COVERED threshold: fewer than 6 models or no HIGH benchmark).
- Dimensions MISSING: D-ARCH, D-REV, D-DOC, D-CRIT, D-SYN (no public rows; D-CRIT proxy SWE-Lancer Manager did not reach WEAK evidence).
- D-CRIT proxy rule applies: a proxy WEAK is never read as benchmark coverage (PROTO-DEC-0084 item 3).

## Registry

- `rulebench-doc`: FAIL, source 404; `existence_verified=false` set; the entry stays in the registry (nothing deleted).
- 6 OpenAI vendor URLs returned 403 (access restriction, not invalidity); noted per row.

## Owner inputs requested at the gate

1. Confirm the DeepSeek identity mapping: V4.1 Max = V4.1 Flash at max effort (inferred; rows b-024, b-025, b-049, b-053).
2. Note the T-rank relativity question (PROTO-DEC-0086 item 5) as input for the next P-L2-002 revision.
