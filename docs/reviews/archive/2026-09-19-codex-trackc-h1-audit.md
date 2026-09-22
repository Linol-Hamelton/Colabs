# Codex - Track C and H1 external adversarial audit

**Date**: 2026-09-19  
**Reviewed commit**: 001af5005e490423c79f7f92919e0c204cf2ad4e  
**Working tree**: dirty  
**Reviewer**: GPT-6 / Codex, independent external reviewer  
**Scope**: Track C M0/C2 policy, C1 telemetry, H1 pilot artifacts and conclusions, governance regression checks  
**Verdict**: FAIL  
**Mode**: CERTIFYING  
**Receipt-Owner**: codex-a3a708dce028cffb  
**Receipt**: .ai/worklog/codex-a3a708dce028cffb.md

## Executive summary

FAIL for acceptance of the Track C package and the pilot report as written: incomplete handoffs can disappear from telemetry, the narrow-task statistics include smoke/retry observations, and trial rows contradict archived handoff results. The conservative conclusion **do not adopt MCP / do not proceed to Arm C** remains supported after correcting the arithmetic. This verdict does not reopen a decision or authorize implementation changes.

The existing regression suite passes 250/250. Validation exits 0 but reports one journal-count warning, so the requested zero-warning condition is not satisfied. A certifying review mode establishes the provenance of this audit; this FAIL cannot satisfy a task-completion gate.

## Scope and evidence

- Executed `docs/reviews/2026-09-19-track-c-h1-external-audit-prompt.md` under the owner's direct assignment. The stale role list in TASK does not override that assignment.
- HEAD and origin/main were `001af50`; implementation, tests, policy, decisions and registry have no working-tree changes relative to that baseline.
- Incoming changes: the controller's journal, two empty Claude journals, the pilot report, smoke report, two addenda and external audit prompt. Preserved these artifacts unchanged.
- Read the selection analysis, design, runbook, addenda, reports, trial template, PROTO-DEC-0029 through 0035, registry, protocol policy and relevant code/tests. Inspected the 20-commit history and dated design/decision commits.
- Environment: Windows, Node v22.21.0, Git 2.53.0.windows.2, Windows PowerShell 5.1.26100.9444.
- Reproduction companion: `docs/reviews/2026-09-19-codex-trackc-h1-probes.cjs`. Its telemetry/policy/sample mutations run only in fresh temporary fixtures or a local clone. It removes only verified temporary roots. It neither starts an MCP server nor installs packages.
- Runtime trial files are disposable, unsigned observations. This audit's receipt binds the report and repository tree, **not** the continued existence or authenticity of runtime metrics or provider usage cards. No runtime output is made a gate input.

### Commands and observed outcomes

| Command | Outcome |
|---|---|
| `node --test tests/hooks.test.cjs tests/session.test.cjs tests/codex.test.cjs` | Exit 0; 63/63 passed |
| `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` | Exit 0; 250/250 passed, including completed-gate and registry tests |
| `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` | Exit 0; `Protocol OK. 1 warning(s).` (32 journals) |
| `node .ai/bin/protocol-handoff.cjs gate-check` | Exit 0; `not applicable: task status is In progress` |
| `node .ai/bin/protocol.cjs doctor` | Exit 0; reports healthy; also reports legacy receipt warnings and journal-count status |
| `node docs/reviews/2026-09-19-codex-trackc-h1-probes.cjs telemetry` | Exit 0; reproduced missing events and exercised clock, rotation and write-failure cases |
| `node docs/reviews/2026-09-19-codex-trackc-h1-probes.cjs policy` | Exit 0; reproduced policy enforcement limits and stale receipt rejection |
| `node docs/reviews/2026-09-19-codex-trackc-h1-probes.cjs data` | Exit 0; independently recomputed cohorts and checked all 22 directories |
| `node docs/reviews/2026-09-19-codex-trackc-h1-probes.cjs sample` | Exit 0; archived A-T6 patch applies; 19/19 lock tests pass |
| `git worktree list`; `git branch --list` | Only `D:/Colabs 001af50 [main]`; only branch `main` |
| `git diff -- docs/decisions/REGISTRY.md .ai/DECISIONS.md` | Empty |

The audit journal carries the subsequent full `record` check results; use `verify --owner codex-a3a708dce028cffb --deep` to check its binding. A green receipt proves the checks' exit codes, not the absence of the findings below or validator warnings.

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| F-001 | HIGH | Stop omits unsuccessful handoffs from telemetry | Open; package acceptance blocker |
| F-002 | HIGH | Narrow medians and batch cost use an undisclosed mixed cohort | Open; report acceptance blocker |
| F-003 | MEDIUM | Trial handoff/timing fields do not faithfully represent archived metrics | Open; report acceptance blocker |
| F-004 | LOW | Current tree does not meet the zero-warning acceptance condition | Open; handoff hygiene |

### F-001 - Stop omits the events required to measure failure

Location: `.ai/bin/protocol-hooks.cjs:463`, `:476`, `:535`; PROTO-DEC-0035 item 1; design section 5.2.

Reproduce with the companion's `telemetry` mode. It starts a session in a fixture, changes one ordinary file, and calls Stop without a complete journal entry. Actual output includes:

```text
changed-without-journal: "AI protocol: 1 file(s) changed ... no new complete entry", rows: 0
no-SessionStart: "AI protocol: no SessionStart snapshot ...", rows: 0
```

The early returns precede telemetry construction and `recordSessionMetric`. The secret-warning branch also precedes that call, as confirmed by code inspection. A failed initial handoff followed by a repaired journal can therefore leave only its successful Stop in the data. This contradicts one JSONL record per Stop event and biases the metric explicitly defined as completion on the **initial** Stop without intervention.

Recommendation: calculate/attempt a fail-safe telemetry record on every Stop exit, including incomplete and missing-baseline cases, without copying journal content. Preserve current warning behavior and define unavailable measurements explicitly. Add targeted regressions for those exits. Consumers must select the first event for a trial/session rather than the last successful one. This is a required correction before declaring C1 instrumentation complete.

### F-002 - Smoke and retry contaminate the reported narrow medians

Location: `docs/reviews/2026-09-19-h1-pilot-report.md:21`, `:23`, `:24`; `trials.jsonl` rows 1 and 11 (one-based).

Reproduce with the companion's `data` mode. Its `all-rows-narrow` output exactly matches the published narrow results: A has **seven** observations, median total **493922**, median fresh **44728**; B has five observations. These seven A records include the explicitly smoke-only `rep:0` task 6 and both task-9 attempts (`rep:1`, `rep:2`).

By contrast, the declared repetition-1 cohort has five narrow observations per arm:

| Cohort and metric | Arm A median | Arm B median | Change B/A |
|---|---:|---:|---:|
| Rep 1 broad, total; A n=4, B n=5 | 846291 | 1462335 | +72.7934% |
| Rep 1 broad, fresh; A n=4, B n=5 | 73269 | 79935 | +9.0980% |
| Rep 1 narrow, total; n=5 each | 566954 | 908268 | +60.2014% |
| Rep 1 narrow, fresh; n=5 each | 45470 | 64913 | +42.7601% |
| Narrow with retry replacing A-T9, total; n=5 each | 566954 | 908268 | +60.2014% |
| Narrow with retry replacing A-T9, fresh; n=5 each | 44728 | 64913 | +45.1283% |
| All rows narrow, total; A n=7, B n=5 | 493922 | 908268 | +83.8890% |

Here total = input + cache read + output; fresh = input + output. Null input is excluded, not coerced to zero. The corrected repetition-1 cost is A **$0.307026 from nine available cards**, B **$0.495389 from ten**. The reported A ~$0.349 equals **$0.348970 from eleven available cards**, including the smoke and retry. Thus "$0.349 (9 cards)" is internally false, and +42% mixes cohorts. Missing A-T4 cost prevents a complete matched-batch cost comparison.

No evidence establishes deliberate gaming: the failed A-T9 and missing card are disclosed and retained. Nevertheless, silent smoke/retry inclusion changes task weights and is not the pre-registered same-task comparison. Publish a new correction/addendum with explicit cohort membership, counts, formulas and separate retry/smoke costs; preserve the historical report and raw records.

### F-003 - Trial rows contradict their own archives

Location: `.ai/runtime/pilot-data/trials.jsonl` row 10; `evidence/a-t9-deepseek/metrics.jsonl`; runbook section 4.

The companion's `data` mode reports:

```text
a-t9-deepseek: rowHandoff=true, metric.handoffComplete=false, journalComplete=[false]
all 22 trial rows: durationSec=null, firstEditMs=null, ts absent
```

The A-T9 journal contains only its session preamble. Its metric is timestamped `2026-09-19T15:14:07.269Z`, duration 90 s, changedFiles 0, handoffComplete false. Every archived trial metric has a numeric duration, and narrow successful trials have first-edit values, but these were not transferred to the trial rows. Parallel timing confounds justify excluding timing from inference; they do not justify replacing collected measurements with unexplained nulls.

Archived main-trial Stop records give A repetition-1 completion **9/10**, B **10/10**. That is a statement about the available records, not a certified initial-Stop rate: F-001 means earlier failed Stop calls may be absent. The B-T5 metrics file also contains a `paritytest` / `T5SUBDIR` probe event; session identity must select its actual `B-5-1-deepseek` row.

Recommendation: derive a corrected, separately versioned analysis table from exact trial/session identifiers; retain original rows, mark timing as confounded, preserve retry identity, and report initial versus eventual handoff separately. Do not infer the whole pilot's quality from narrow task-specific tests or a retry's outcome.

### F-004 - Zero-warning condition is not met

Run the standalone validator. It reports:

```text
[WARN] 32 session journals in .ai/worklog; archive the oldest into .ai/ARCHIVE.md
Protocol OK. 1 warning(s).
```

There were 31 journals before this audit session and 32 after its required journal was created (README excluded). Thus this is partly incoming state and partly the audit's required artifact, not a C1 regression. Historical receipts reporting zero warnings describe older trees. No other session's journal was removed or rewritten to manufacture a clean result.

Before the acceptance handoff, the coordinator should restore the count through the documented archive/prune/index workflow with liveness checks. This audit does not authorize deleting history or another active session's journal.

## Deep dives and negative reproductions

### Pre-registration, omissions and conclusion robustness

`git log -1 --format='%H %cI' -- docs/reviews/2026-09-19-h1-pilot-design.md .ai/DECISIONS.md` names `5b34ae0...`, committed **2026-09-19T13:33:28Z**. It includes the task battery and PROTO-DEC-0035 thresholds. `b587dc1` follows at 14:11:50Z; `001af50` at 14:19:25Z. The earliest archived trial metric is smoke at **14:40:55.580Z**; main A metrics start at **15:14:07.269Z**; the last B metric is **16:40:38.020Z**. All 23 archived metric records name the full `001af50` SHA (22 trials plus the B-T5 probe).

This corroborates that the committed tasks and thresholds preceded execution. The stronger requested comparison against timestamps **in trials.jsonl is impossible**: those rows contain no timestamps. Usage-card arrival time, exact provider snapshot, and transcript-level adherence are not independently established. Uncommitted addenda have date-only headers and no pre-run immutable timestamp; the cost addendum explicitly discusses a batch already running. They must not be presented as fully pre-registered execution rules.

The primary token threshold is unchanged. Fresh-only accounting is an additional sensitivity view rather than a new acceptance metric; it is not used to rescue B. The model label `DeepSeek V4 Pro` is not evidence of an immutable provider snapshot. This is a preliminary single-model, one-repetition, parallel batch, with a retry and modified adjudication; it is not the planned three-repetition/multi-model controlled study. No inference of universal causal inefficiency is warranted.

Missing A-T4 does change the possible median, but cannot reverse the stop decision: allowing any nonnegative missing value gives the full five-task A broad total median between **674703 and 1017879**. B's 1462335 is still **43.7% to 116.7% higher**. For fresh tokens, A's median lies between **63119 and 83419**; B's 79935 yields at best a **4.18% reduction**, far short of 25%. Narrow tasks fail the +5% ceiling in every explicit cohort above. There is no reason to proceed to Arm C.

The report openly discloses parallel launch, more extensive B audits, missing A-T4 usage, one repetition and the 2306-second B-T2 outlier. The more-thorough-audits observation does not change its acceptance threshold. The negative result was not hidden. The claim that a confirmation "can only confirm the negative" is methodologically too strong: a future observation can differ; it simply cannot retroactively convert this stopped pilot into a pass without a new authorized design.

### Archive coverage and three sampled trials

The 22 rows map one-to-one to 22 archive directories: 20 repetition-1 trials, one smoke trial and one A-T9 retry. Archives contain 135 files: 91 Markdown, 22 patches and 22 JSONL files. No orphan/missing directory was found. Provider usage exports/cards and complete test transcripts are absent from these archived file types; token amounts are supplied table values whose arithmetic can be audited, not authenticated provider billing.

| Sample | Journal, metric and diff cross-check |
|---|---|
| A-T1 broad | Complete journal `pilot-a-59c83390245ab89a.md`; 225 s, firstEdit 177958 ms, changedFiles 1, handoff true. Journal points to the separately archived liveness report. Empty tracked diff is consistent with creating an untracked report. Trial timing nulls disagree with the available metric. |
| B-T1 broad | Complete `pilot-b-075861865757c8b0.md`; 223 s, changedFiles 0, firstEdit null, handoff true; empty diff. Journal records raw pinned digest generation and an npm-cache retry. Its prose baseline says b587dc1, while the metric says 001af50; trust the explicit measured Git SHA for this check and flag the stale prose. No retained digest proves what was actually read. |
| A-T6 narrow | Complete `pilot-a-da116431254262a3.md`; 134 s, firstEdit 39446 ms, changedFiles 2, handoff true. Patch adds the constant/export and assertion only to the two requested files. Decoded its UTF-16LE PowerShell capture into an isolated fixture; `git apply` exits 0 and 19/19 lock tests pass. |

Nonempty patches were captured as UTF-16LE; raw `git apply` consumers need decoding. The reproduction companion handles that without altering the archive. Main-only worktree/branch output confirms pilot worktree cleanup; this cannot prove deletion of arbitrary external temporary directories.

Advisory observation checksums at audit time: `trials.jsonl` SHA-256 **f77ed8ffd3db72bc038f93bb0a49421984e7b534f2e950f75455ef2ad9cff404**; archive manifest SHA-256 **5c3885ff93c46f57dee52458e108ae1f62ccba3d3ecd3000dcf2380691b9e5be**. The latter hashes sorted forward-slash relative names under pilot-data, NUL, each file's SHA-256 hex, newline. These identify the observations examined, not signed runtime evidence.

### Telemetry fault matrix

Run the companion's `telemetry` mode; observed negatives and controls:

| Attack/control | Actual observation | Assessment |
|---|---|---|
| Changed file without new journal | Warning; zero metrics rows | F-001 reproduced |
| Stop without SessionStart | Warning; zero metrics rows | F-001 contract gap, baseline unavailable |
| Future numeric startTime | durationSec=0, firstEditMs=0 | Negative-time guard works |
| String startTime | durationSec=0, firstEditMs=null | Does not crash; malformed data indistinguishable from real zero |
| Freeze Date.now at startTime | durationSec=0 | No negative result or crash; timestamp uses separate Date construction |
| Stop twice after a successful handoff | Two additional rows; both handoffComplete=false | Correct per-event emission; naive per-row rate would miscount sessions |
| Append across 1 MiB boundary | 1048602 bytes, no rotated file | Threshold checked before append, not a strict size cap |
| Next append | Active file 23 bytes; previous 1048602 bytes rotated | Normal rotation works |
| Inject EACCES specifically at metric append | Stop returns normal telemetry | Write failure cannot escape metric writer |
| Replace metrics directory with ordinary file | Stop returns normal telemetry | Real filesystem failure is fail-safe |

EACCES was injected at the Node filesystem boundary; no host ACL was changed. This is a deterministic reproduction of permission denial, supplemented by the real ENOTDIR path failure. Rotation is best-effort, not an atomic multi-writer audit ledger; concurrent rotation loss and arbitrary large input records were not certified absent. Mutable startTime and last-mtime-derived firstEditMs remain advisory proxies, not tamper-resistant measurements.

### Policy, registry and gate controls

M0's exact command pins `repomix@1.18.0`, disables Git-change sorting, writes under `.ai/runtime/`, and preserves raw data for audits/implementation. C2 states advisory-only output, one server per phase, <=1500 schema tokens, local/sandboxed/pinned operation, no hook auto-install/spawn and identical gate degradation. AGENTS section 7 points to it. The manifest registers the two policy-pin tests, and they pass. Their regexes protect selected text anchors, not actual configuration or every rule.

`git ls-files --cached --others --exclude-standard` found no package manifests/locks, node_modules paths or MCP configuration files; runtime scripts/hook configs contain no Repomix/MCP invocation. This is a repository-scoped result, not a claim about all user-installed apps or host processes.

Run companion `policy` mode. In an isolated clone:

```text
baseline validation: exit 0, 0 warnings
append reopened rows for PROTO-DEC-0034/0035 with trigger none: exit 0, 0 warnings
edit committed PROTO-DEC-0034 status in place: exit 0, append-only warning
add unapproved .mcp.json (never launch it): validator exit 0, 0 warnings; policy tests 2/2
record --quick, then verify --deep: exit 0
add .ai/runtime/audit-tool-index.json: verify --deep exit 0
add audit-tool-index.json outside runtime: verify --deep exit 1, evidence is stale
```

The MCP policy is procedural; the text-pin tests do not detect configuration adoption. Registry validation covers all 35 IDs and preserves 39 committed rows, but does not enforce reopen transition semantics. It correctly warns on an in-place row edit. These are known-scope enforcement limits: PROTO-DEC-0033 explicitly selected WARN-first presence/coverage/immutability/new-block checks and deferred status-vocabulary validation. No accepted decision is reopened here; these probes are input to a future owner decision, not new blockers against the already accepted registry design.

The existing completed-gate regression suite passes. The live task remains In progress, so its gate-check correctly reports not applicable. Runtime exclusion and nonignored outside-runtime freshness behavior were exercised with a real quick fixture receipt; that quick receipt is solely for the probe, not this audit's full handoff. An ignored external cache need not enter the digest, so outside-runtime detection should not be overstated as universal.

## Delta list, alternatives and cleanup/v2.0 criteria

### Required before package acceptance / cleanup handoff

1. Fix F-001's unsuccessful-event loss and independently review the correction. Cover initial failure followed by success, absent baseline and repeated Stop; keep telemetry fail-safe and excluded from gates.
2. Publish a new pilot correction with fixed cohort membership, recomputed medians/costs, missing-data bounds, separate smoke/retry outcomes and explicit handoff rates. Preserve the historical report/data (F-002/F-003).
3. Preserve/export the raw archive before any runtime cleanup if future reproducibility is required. Runtime data is intentionally disposable; its survival is not guaranteed by this report's receipt.
4. Restore the journal limit with the normal cooperative workflow and reconcile stale TASK Current state/Next text. Retain In progress until a valid independent acceptance path exists (F-004).

### Recommendations for the next authorized phase

- Prefer an explicit analysis script and immutable pre-run trial manifest over manual spreadsheet-style accumulation. Capture usage exports, exact model identifiers, first-stop identity, timestamps and exclusions. Show IQR with a stated convention when repeating the study.
- Compare task-specific file selection against targeted raw subsets before another whole-kernel digest experiment. Compressed digests cannot substitute for full audit/implementation evidence under the current policy.
- Retain cheap single-model screening as a cost-control option, but label its inference limits. A new exploratory study requires its own prospective design; do not retry this experiment until it passes.
- Consider schema validation for registry transitions and optional MCP configuration linting only through an owner-approved scope. Do not add a daemon or runtime dependency merely to enforce prose policy.
- For v2.0, demand measurable product-task benefit over a task file plus handoff note, a bounded maintenance cost, reproducible negative results and regression coverage of actual failure paths. More tooling or more prose is not itself evidence of improvement.

### Accepted residuals for this verdict

The single-model/one-repetition/parallel result does not establish universal causality; missing A-T4 usage and absent provider exports limit precision; runtime metrics are mutable and disposable; mtime/clock values are proxies; policy adoption and registry lifecycle remain partly cooperative. None of these limitations supports overriding the observed negative gate. No Arm C run, implementation change, dependency installation, commit, push or decision/registry edit was performed in the main checkout.

## References

- Audit prompt: `docs/reviews/2026-09-19-track-c-h1-external-audit-prompt.md`.
- Reproductions: `docs/reviews/2026-09-19-codex-trackc-h1-probes.cjs`.
- Session and full check receipt: `.ai/worklog/codex-a3a708dce028cffb.md`.
- Binding decisions: `.ai/DECISIONS.md`, PROTO-DEC-0031 through 0035; lifecycle ledger: `docs/decisions/REGISTRY.md`.
- Pilot design, runbook, template, smoke/report and addenda dated 2026-09-19 under `docs/reviews/`.
