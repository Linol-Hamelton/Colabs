# Decision Registry

Append-only ledger of architectural decision statuses, freeze baselines, and reopen triggers.

Rules:
- The current status of any decision ID is determined by its **last** recorded row in this file.
- Existing rows are immutable and must never be edited, reordered, or deleted.
- Status transitions (e.g., accepting, freezing, or reopening a decision) are recorded by appending a new row.
- Status values: `accepted`, `frozen`, `reopened`, `superseded`.
- For `superseded` rows the evidence column names the superseding decision ID.

| id | status | reopen-trigger | frozen-at | supersedes | evidence |
|---|---|---|---|---|---|
| DEC-0001 | accepted | none | | | |
| DEC-0002 | accepted | none | | | |
| DEC-0003 | accepted | none | | | |
| DEC-0004 | accepted | none | | | |
| DEC-0005 | accepted | none | | | |
| DEC-0006 | accepted | none | | | |
| DEC-0007 | accepted | none | | | |
| DEC-0008 | accepted | none | | | |
| DEC-0009 | accepted | none | | DEC-0003, DEC-0005, DEC-0008 | |
| DEC-0010 | accepted | none | | | |
| DEC-0011 | accepted | none | | | |
| DEC-0012 | accepted | none | | | |
| DEC-0013 | accepted | none | | | |
| DEC-0014 | accepted | none | | | |
| DEC-0015 | accepted | none | | | |
| DEC-0016 | accepted | none | | | |
| DEC-0017 | accepted | none | | | |
| DEC-0018 | accepted | none | | | |
| DEC-0019 | accepted | none | | | |
| DEC-0020 | accepted | none | | | |
| DEC-0021 | accepted | none | | | |
| PROTO-DEC-0022 | accepted | none | | DEC-0014 | |
| PROTO-DEC-0023 | accepted | none | | | |
| PROTO-DEC-0024 | accepted | none | | | |
| PROTO-DEC-0025 | accepted | none | | | |
| PROTO-DEC-0026 | accepted | none | | | |
| PROTO-DEC-0027 | accepted | none | | | |
| PROTO-DEC-0028 | accepted | none | | | |
| PROTO-DEC-0029 | accepted | none | | | |
| PROTO-DEC-0030 | accepted | none | | | |
| PROTO-DEC-0031 | accepted | none | | | |
| PROTO-DEC-0032 | accepted | none | | | |
| PROTO-DEC-0033 | accepted | none | | | |
| DEC-0003 | superseded | none | | | PROTO-DEC-0009 |
| DEC-0005 | superseded | none | | | PROTO-DEC-0009 |
| DEC-0008 | superseded | none | | | PROTO-DEC-0009 |
| DEC-0014 | superseded | none | | | PROTO-DEC-0022 |
| PROTO-DEC-0034 | accepted | none | | | |
| PROTO-DEC-0035 | accepted | none | | | |
| PROTO-DEC-0036 | accepted | owner-directive | | | |
| PROTO-DEC-0037 | accepted | owner-directive | | | |
| PROTO-DEC-0038 | accepted | owner-directive | | PROTO-DEC-0027 | |
| PROTO-DEC-0039 | accepted | owner-directive | | | |
| PROTO-DEC-0039 | reopened | owner-directive | d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1 | | 2026-09-20 RuslanFomenko accepted the paired-cycle audit and directed remediation; PROTO-DEC-0040 |
| PROTO-DEC-0040 | accepted | owner-directive | | PROTO-DEC-0039 (items 1 and 2f; bounded exception only) | .ai/DECISIONS.md; docs/reviews/2026-09-20-codex-paired-cycle-review.md; docs/reviews/2026-09-20-deepseek-gemini-paired-cycle-remediation-prompt.md |
| PROTO-DEC-0039 | accepted | owner-directive | d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1 | | Freeze continues with the finite PROTO-DEC-0040 exception; product pilot and post-pilot restrictions unchanged |
| PROTO-DEC-0041 | accepted | owner-directive | d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1 | refines PROTO-DEC-0038 item 1 (no supersession) | .ai/DECISIONS.md; docs/research/2026-09-20-cycle-architecture/claude-final-decision.md; docs/reviews/2026-09-20-deepseek-gemini-cycle-architecture-dispatch.md |
| PROTO-DEC-0042 | accepted | owner-directive | d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1 | refines PROTO-DEC-0040 item 4 (no supersession) | Receipt freshness bound to the attested task; measured 2026-09-22: producer/controller exit 0, certifiers exit 1 by closure order; cycle-architecture criterion met, product pilots unblocked |
| PROTO-DEC-0043 | accepted | owner-directive | d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1 | | Terminal agent-to-agent invocation contract .ai/docs/CLI-AGENTS.md added to managed; roster verified by execution; DeepSeek terminal path measured impossible (context budget); bounded exception to PROTO-DEC-0039 item 1 |
| PROTO-DEC-0044 | accepted | owner-directive | d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1 | | Layers A/B/C: session-start inventory, derived decisions index, coverage and duplicate ledger; all advisory under PROTO-DEC-0034 item 1; bounded exception to PROTO-DEC-0039 item 1; validator 0 warnings, suite 315/315 |
| PROTO-DEC-0045 | accepted | owner-directive | f68b502 | | Legacy stack keep-or-delete by measured reference; no memory engine or graph backend adopted; Jev advisory only; executable rulebook specified in docs/specs/2026-09-23-executable-rulebook-spec.md |
| PROTO-DEC-0046 | accepted | owner-directive | 82bf99a | refines PROTO-DEC-0044 and 0045 (no supersession) | New premise for F-001/F-C01: repo-relative ledger paths, absolute and .. forms exit 2; protected set from manifest managed+source plus .ai .claude .codex; certifiers Codex + fresh Claude, DeepSeek coordinates and certifies nothing; budget <=2 |
| PROTO-DEC-0047 | accepted | owner-directive | b232a9e | refines PROTO-DEC-0041 item 1 (no supersession) | Availability-ordered certifiers with independence filter; verdict asymmetry; certifier count by risk; shadow certification; batch cap; executor liveness and narrow grants; script standard; client registry; CodeBurn as cost only; default-deny tool governance |
| PROTO-DEC-0048 | accepted | owner-directive | 4ded1be | exercises PROTO-DEC-0047 item 5 "continue" (no supersession) | Batch finished, not narrowed; A/B/C, ledger, verdict accepted as converged, R3-C04=F-R3-01 fix authorised; independence check weakened not removed (no quotation, fixed-form graded agreement); R3-C05 accepted exception, budget exhaustion closes to audit; producer Evidence and in-repo reproductions with sanctioned-borrowing exception; critical fixes only before design; two-stream cap for edits, not research; outside-repo edits journaled at both ends |
| PROTO-DEC-0049 | accepted | owner-directive | 4ded1be | refines PROTO-DEC-0047 items 6 and 7 (no supersession) | Diff-based re-certification from round 2 with automatic full-tree suite; fixed grammar with exit 2 for roles, agreement and ledger inputs; idle exit after five minutes at zero tokens; risk search serves coverage, not refusal; agy runs without prompts behind a PreToolUse deny gate once its deny path is verified |
| PROTO-DEC-0050 | accepted | owner-directive | 4ded1be | implements PROTO-DEC-0047 item 9 (no supersession) | Failures become procedures, workarounds temporary; dispatch by prompt files, one fixed line, script-assembled commands, verified flags, tree check, idle exit, one restart; client execution profiles with environment and known failure modes; dispatch script, registry and CLI-AGENTS update join the current remediation round |
| PROTO-DEC-0051 | accepted | owner-directive | 4ded1be | refines PROTO-DEC-0049 item 3 (no supersession) | One append-only signals ledger with fixed grammar (procedure-gap, script-candidate, fall); procedure-gap and script-candidate processing at batch planning; wake-then-fail watchdog: resume by session id up to three times, then FALLEN, which is a fall signal for investigation |
| PROTO-DEC-0052 | accepted | owner-directive | 4ded1be | narrows PAIRED-CYCLE section 5 item 3 to implementation cycles (no supersession) | Research cycles: round 1 one owner per zone; round 2 challenges plus one synthesis; round 3 independent syntheses without mutual reading; one final plan by an owner-named participant; outputs advisory; scenario written into the kernel this round |
| PROTO-DEC-0053 | accepted | owner-directive | 4ded1be | supersedes PROTO-DEC-0052 items 2 and 5 (final-plan step only) | Kernel-change decision procedure: three independent syntheses, a draft decision by an owner-named synthesiser, independent critiques by the other two, final plan fixed by an owner-named one of the three; Claude synthesis by a fresh session |
| PROTO-DEC-0054 | accepted | owner-directive | 4ded1be | temporary exception to PROTO-DEC-0039 item 1 and PROTO-DEC-0048 item 6 for the CORE-ARCH program; brand binding of DEC-0020 and 0048 item 7 lifted for it (no supersession) | CORE-ARCH program opened (docs/core-arch/CORE-ARCH-n.md); kernel edits allowed inside it until revoked or closed; roles per task, not per brand; Claude implementer, DeepSeek reviewer; layer consistency check before each next layer; 0038/0041 certification unchanged; Graph Memory is a reference only; backup D:\Colabs-backup-2026-09-24-pre-core-arch |
| PROTO-DEC-0055 | accepted | owner-directive | 4ded1be | supersedes PROTO-DEC-0053 item 1 step (c) and item 3 for the remediation-mapping cycle (critic identities only) | Remediation items R-01..R-19 re-homed into CORE-ARCH stages, no separate Gemini round; CORE-ARCH-1 is step (b), critiques by DeepSeek and Gemini; packages I-III certified by Codex and Gemini, Claude and DeepSeek excluded, Gemini not fixer; L0 meta-root is the base layer, stage 1 proceeds; sessions launched with explicit model and effort |
| PROTO-DEC-0056 | accepted | owner-directive | 4ded1be | confirms PROTO-DEC-0055 item 2 reading (no supersession) | CORE-ARCH-1 is step (b); roles by executors not brands, one role per model per task, model rotation between steps; model and effort chosen by the model-selection procedure (draft P-L2-002 in trial); deepseek-flash 4.1 passes stand; CA-28 closed; corpus caps raised instead of archiving, navigation index is the means, numbers open |
| PROTO-DEC-0057 | accepted | owner-directive | 4ded1be | supersedes PROTO-DEC-0037 item 3 (review-corpus cap numbers only) | Readings of 0054 items 1 and 4 and 0055 item 5 confirmed; stage-review order is for kernel work, standard cycle goes reviewer -> certifier, certifier PASS approves, FAIL or RECOMMENDATION goes to the owner; one task = one task frame (scope-id); author, executor or controller never certifies its candidate even in a separate task; caps 200 files / 2 MB reviews and 100 journals, WARN-first; navigation index in package I-a; CA-13 closed |
| PROTO-DEC-0058 | accepted | owner-directive | 4ded1be | withdraws the draft tier table of P-L2-002 0.1, never a decision (no supersession) | Five rules of P-L2-002 confirmed; author-suggested tier cells rejected; tier-table participants by the six-step discovery procedure P-L3-002 (providers by CLI, models from provider help, flagship/second/workhorse, candidate matrix, effort levels by query, three levels nearest the centre); nine tiers T1-T9 = 3 model ranks x 3 effort levels; score mapping, tier order and short or even effort lists open |
| PROTO-DEC-0059 | accepted | owner-directive | 4ded1be | completes PROTO-DEC-0058 (no supersession) | Nine tiers model-rank first (workhorse T1-T3, second T4-T6, flagship T7-T9); sum 0-12 mapped 0,1-2,3,4-5,6,7-8,9,10-11,12 to T1..T9; floors T7 for kernel change or certification, T4 for protected path; even effort lists shift up; fewer than three levels are repeated |
| PROTO-DEC-0060 | accepted | owner-directive | 4ded1be | none | Stage 1 approval after a re-check; three-batch disuse retirement rejected; procedures for finding retire-or-improve candidates and for A/B testing a retirement candidate; A/B/C test after the kernel work (new kernel / old kernel / none, 2-3 tasks, one model, a repository clone); new kernel in .ai/core/; external synthesis persisted |
| PROTO-DEC-0061 | accepted | owner-directive | 4ded1be | none | CORE-ARCH stage 1 approved after two re-checks (RECOMMENDATION): the stage-1 records are the approved design of L0, landing in .ai/core/ with package I-a certified by Codex and Gemini; stage 2 (L1 roles) opens |
| PROTO-DEC-0062 | accepted | owner-directive | 4ded1be | none | Model discovery (P-L3-002) before stage 2; model choice stays in L2 with the table in L3; coordinator assigns roles within a recorded owner delegation; asynchronous-review pilot from stage 2 (design N+1 while N is reviewed, nothing lands, at most two stages in review) |
| PROTO-DEC-0063 | accepted | owner-directive | 4ded1be | none | Model strength and price from the provider official pages when the client catalog is silent (flagship = most capable, second = next, workhorse = lowest output price for general and coding work); no third-party rankings; a model belongs to its maker matrix, copilot and agy are routes; one role per model regardless of client; P-L3-003 run now as a trial |
| PROTO-DEC-0064 | accepted | owner-directive | 4ded1be | none | Google ranks 3.8 Flash / 3.1 Pro / 3.7 Flash; OpenAI workhorse gpt-5.6-luna; DeepSeek flash 4.1 flagship, v4-pro second; makers with fewer than three models repeat their models (higher above, lower fills lower ranks); xAI, Moonshot, Microsoft ranked now via P-L3-003 |
| PROTO-DEC-0065 | accepted | owner-directive | 4ded1be | none | deepseek-v4-pro not used, deepseek-flash 4.1 fills all DeepSeek ranks; a per-client procedure for setting model and effort after launch is to be written (stage 4); stage 2 (L1 roles) starts under the async-review pilot |
| PROTO-DEC-0066 | accepted | owner-directive | 4ded1be | none | Two research studies now inside CORE-ARCH: A, what Google AX and other improvements give Colabs (seeds in OwnerIdeas/), B, an adaptive execution-depth policy (task type, F1-F5, risk escalation, pattern, then P-L2-002); multi-source hypotheses with provenance; funnel output; three independent researchers plus a synthesiser each; measure only, prototypes and A/B later under P-L0-007; stage-3 triage waits for study B |
| PROTO-DEC-0067 | accepted | owner-directive | 4ded1be | supersedes PROTO-DEC-0049 item 3 (idle bound of dispatch watchdogs only) | Route order: maker official CLI first, Kilo as fallback router, cheapest suitable Kilo route, stronger route when effort or capabilities fall short, no new candidates; adaptive failover: switch only on hard failure before useful work, liveness signals, soft 2-3 min inspect, hard 7-10 min probable hang, configurable; no automatic second executor after useful work; one Kilo attempt then owner; no parallel primary and fallback; P-L3-004 on trial in the research launcher |
| PROTO-DEC-0068 | accepted | owner-directive | e44686b | supersedes PROTO-DEC-0067 (scope of its Supersedes line only) | The O-11 timers of 0067 item 3 replace the 0049 item 3 idle bound only in the research launcher launch.cjs and in P-L3-004 while on trial; launch-round2.cjs and the kernel dispatch script keep 0049 item 3 in full (CB-12, option A); no code change |
| PROTO-DEC-0069 | accepted | owner-directive | e44686b | none | Adds the missing O-08 sentences to 0066 item 6: the improvement research runs in parallel with the stage-2 review, does not count under the two-stream limit of 0048 item 7, and touches no kernel record (CB-13) |
| PROTO-DEC-0070 | accepted | owner-directive | e44686b | none | One-run authorisation for the 0066 research (CB-21): vibe --enabled-tools minimal list with --auto-approve only for it; copilot --allow-all-tools non-interactive with an explicitly limited working directory, --no-ask-user only if its --help confirms it; researchers read, measure read-only, write only own artefacts, journal and runtime state; no kernel, product or governance edits, no commit, tag or push; any diff outside scope is a STOP; no re-confirmation of already authorised actions, with a listed set of cases that go to the owner; ends with the run |
| PROTO-DEC-0071 | accepted | owner-directive | eb34621 | none | Research and design cycles: researchers, synthesisers and council participants record Evidence with protocol-handoff record --quick (validator only); a full record (validator plus regression suite) stays mandatory for any change to code, the kernel or protocol tooling |
| PROTO-DEC-0072 | accepted | owner-directive | 87257cc | none | Closes В-24: the P-L2-002 T7 floor follows what the current task frame does, not its downstream purpose; research, design and review frames that produce only advisory artefacts and change no candidate kernel record, kernel code or protocol tooling take no T7 floor; T7 applies from the task that directly creates, changes or applies them, and always to certification; review-only tasks are tiered by the rubric |
| PROTO-DEC-0073 | accepted | owner-directive | cd90be1 | none | Scripts and instructions stay abstract: a dispatch or control script holds no prompt text, task instruction or task-specific file path in its code; it runs a file named when it is started and controls the execution; its message to an agent is only a pointer to a file; client command syntax may stay in the script |
| PROTO-DEC-0074 | accepted | owner-directive | 88376ed | none | Tasks and schedules name roles, never models; the model is resolved at launch with a primary and two substitutes; seniority follows uncertainty and cost of error, not volume, with the ladder worker -> middle -> senior advice -> senior fix; timeouts follow observable file progress; retries, rubric weights, ceiling, error classes and cost cap stay open in PROPOSAL-role-resolver-supervisor.md |
| PROTO-DEC-0075 | accepted | owner-directive | fced02b | none | Three-level execution model (workflow, stage, attempt); error-aware supervised recovery with a primary and two substitutes, at most five fresh invocations, resume counted apart, per-class behaviour; liveness plus hard ceiling; completion contract; launch input pinning; tier by uncertainty and consequence, capability floor before cost; dynamic resolver; lightweight supervisor; semantic repair is a workflow stage with loop limits; supersedes the restart rule of 0050 item 2; owner text verbatim in docs/core-arch/OWNER-DECISION-execution-model-2026-09-25.md |
