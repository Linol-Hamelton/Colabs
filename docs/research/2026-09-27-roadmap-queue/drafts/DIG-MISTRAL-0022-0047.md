# DIG Registry Audit - Mistral Medium 3.5 (vibe)

**Frame:** F-17  
**Producer:** Mistral Medium 3.5 (vibe)  
**Producer Range:** PROTO-DEC-0022..0047  
**Date:** 2026-09-27  
**Session:** mistral-2ec25694fd2cbf1c

---

## Counts

- **Total items:** 129
- **Built:** 118
- **Partial:** 11
- **Not built:** 0

---

| Item | Status | Proof (path or commit) | Note |
|---|---|---|---|
| PROTO-DEC-0023 item 1 | built | .ai/bin/protocol-archive.cjs:262 | autoArchiveWorklog function exists |
| PROTO-DEC-0023 item 2 | built | .ai/bin/protocol-session.cjs:244 | prune moves to .ai/runtime/pruned/ |
| PROTO-DEC-0024 item 1 | built | .ai/bin/protocol-handoff.cjs:850 | rehash command implemented |
| PROTO-DEC-0024 item 2 | built | .ai/bin/protocol-session.cjs:67, AGENTS.md | GLM and Mistral support added |
| PROTO-DEC-0025 item 1 | built | git tag v1.9.4 | Atomic release commits with annotated tags |
| PROTO-DEC-0025 item 2 | built | .ai/bin/protocol-handoff.cjs | In-journal Merkle verification (verify command) |
| PROTO-DEC-0025 item 3 | built | .ai/bin/protocol-session.cjs:350-357 | 24-hour TTL with lazy pruning |
| PROTO-DEC-0025 item 4 | built | protocol-manifest.json | role: source vs installed distinction |
| PROTO-DEC-0025 item 5 | built | git ls-files | Node.js migration complete: all protocol files are .cjs, no .js files exist |
| PROTO-DEC-0026 item 1 | built | docs/reviews/ (100+ files) | Long-form reports stored as Git-tracked documents |
| PROTO-DEC-0026 item 2 | built | AGENTS.md section 5 | Review document as primary deliverable |
| PROTO-DEC-0026 item 3 | built | AGENTS.md section 5 | Chat panel output limited to executive verdict |
| PROTO-DEC-0026 item 4 | built | templates/reviews/REVIEW.md | Mandatory header template exists |
| PROTO-DEC-0026 item 5 | built | AGENTS.md section 5.5 | Chat fallback transcription route |
| PROTO-DEC-0026 item 6 | built | docs/reviews/archive/ | Review files archived, not deleted |
| PROTO-DEC-0027 item 1 | built | AGENTS.md section 2 | Mandatory Adversarial Peer Review Prompt rule |
| PROTO-DEC-0027 item 2 | built | .ai/bin/protocol-archive.cjs:271 | Cooperative Lock Preservation in autoArchiveWorklog |
| PROTO-DEC-0027 item 3 | built | .ai/bin/protocol-archive.cjs:81 | Windows Atomic Rename Resilience with retries |
| PROTO-DEC-0027 item 4 | built | .ai/bin/protocol-handoff.cjs:168 | Backward Compatibility for Legacy Evidence |
| PROTO-DEC-0027 item 5 | built | .ai/bin/protocol-archive.cjs | Fail-Closed Deep Archive Cryptographic Audit (verify --deep) |
| PROTO-DEC-0027 item 6 | built | .ai/bin/protocol-hooks.cjs:220 | Unified Heading Regular Expression (DATE_HEADING_REGEX) |
| PROTO-DEC-0027 item 7 | built | .ai/bin/protocol-session.cjs:350-357 | Liveness-First Runtime Cleanup |
| PROTO-DEC-0028 item 1 | built | .ai/bin/protocol-hooks.cjs:471 | Lock liveness binds to registered session with nonce |
| PROTO-DEC-0028 item 2 | built | .ai/bin/protocol-handoff.cjs:168 | Legacy Evidence labelled, never rewritten |
| PROTO-DEC-0028 item 3 | built | .ai/bin/protocol-archive.cjs | Archive chain verification with terminal root check |
| PROTO-DEC-0028 item 4 | built | .ai/bin/protocol-hooks.cjs:642 | Canonical entry-body hash in protocol-hooks.cjs |
| PROTO-DEC-0028 item 5 | built | docs/reviews/2026-09-19-*-prompt.md | Audit and council participants persist prompt and report |
| PROTO-DEC-0028 item 6 | built | git tag v1.9.4 | Release version v1.9.4 annotated and tagged |
| PROTO-DEC-0029 item 1 | built | .ai/bin/protocol-session.cjs | Unified Three-Way Liveness Contract (isSessionAlive) |
| PROTO-DEC-0029 item 2 | built | .ai/bin/protocol-session.cjs | Explicit Call-Site Polarity |
| PROTO-DEC-0029 item 3 | built | .ai/bin/protocol-session.cjs | Recency Heuristic Fallback (15-minute window) |
| PROTO-DEC-0029 item 4 | built | .ai/bin/protocol-session.cjs | Relaxed Supervisor Registration |
| PROTO-DEC-0031 item 1 | built | AGENTS.md section 2 | Four Required Capabilities for certifying review |
| PROTO-DEC-0031 item 2 | built | templates/reviews/REVIEW.md | Review Mode and Header Fields (Mode: CERTIFYING/ADVISORY) |
| PROTO-DEC-0031 item 3 | built | AGENTS.md section 2 | Defect Reproduction Mandate for FAIL/BLOCKED |
| PROTO-DEC-0032 item 1 | built | .ai/bin/protocol-handoff.cjs:880 | gate-check subcommand introduced |
| PROTO-DEC-0032 item 2 | built | .ai/bin/protocol-handoff.cjs | Independent review Mode: CERTIFYING and Receipt-Owner required |
| PROTO-DEC-0032 item 3 | built | .ai/bin/protocol-handoff.cjs | Journal must reference review path |
| PROTO-DEC-0032 item 4 | built | .ai/bin/protocol-handoff.cjs | Cited review must carry valid ISO Date |
| PROTO-DEC-0032 item 5 | built | .ai/bin/protocol-handoff.cjs | Mode: ADVISORY cannot satisfy gate |
| PROTO-DEC-0032 item 6 | built | .ai/bin/protocol-handoff.cjs | Receipt field optional and informational |
| PROTO-DEC-0032 item 7 | built | .ai/bin/protocol-handoff.cjs | role: installed skips gate-check |
| PROTO-DEC-0032 item 8 | built | .ai/bin/protocol-handoff.cjs | Evidence recording runs with PROTOCOL_SKIP_GATE=1 |
| PROTO-DEC-0033 item 1 | built | docs/decisions/REGISTRY.md | Append-only table maintained |
| PROTO-DEC-0033 item 2 | built | docs/decisions/REGISTRY.md | Status values: accepted, frozen, reopened, superseded |
| PROTO-DEC-0033 item 3 | built | docs/decisions/REGISTRY.md | Reopen triggers closed taxonomy |
| PROTO-DEC-0033 item 4 | built | AGENTS.md section 6 | REGISTRY.md covered by cooperative lock |
| PROTO-DEC-0033 item 5 | built | validate-protocol.ps1 | Validator enforces checks with WARN/FAIL |
| PROTO-DEC-0033 item 6 | built | docs/decisions/REGISTRY.md | Legacy decision ids seeded |
| PROTO-DEC-0034 item 1 | partial | .ai/DECISIONS.md:1612-1615 | Universal context digest defined but repomix@1.18.0 not installed; .ai/runtime/kernel-digest.xml not generated |
| PROTO-DEC-0034 item 2 | built | AGENTS.md section 11, .ai/docs/CLI-AGENTS.md | MCP and external tooling policy enforced |
| PROTO-DEC-0035 item 1 | built | .ai/bin/protocol-hooks.cjs:596 | Stop telemetry instrumentation exists |
| PROTO-DEC-0035 item 2 | built | docs/research/2026-09-19-h1-pilot-design.md | Pilot design and pre-registered thresholds |
| PROTO-DEC-0036 item 1 | built | PROTO-DEC-0036 | Track C / Repomix closed permanently |
| PROTO-DEC-0036 item 2 | built | PROTO-DEC-0034 | PROTO-DEC-0034 remains in force |
| PROTO-DEC-0036 item 3 | built | PROTO-DEC-0036 | Local 8B/9B models stay on disk but never subjects |
| PROTO-DEC-0036 item 4 | built | PROTO-DEC-0036 | Reversal evidence condition defined |
| PROTO-DEC-0036 item 5 | built | PROTO-DEC-0036 | No deletion executed by this decision |
| PROTO-DEC-0037 item 1 | built | docs/reviews/archive/ | Two-tier corpus implemented |
| PROTO-DEC-0037 item 2 | built | .ai/bin/protocol.cjs:33 | Classify-first with doctor exists |
| PROTO-DEC-0037 item 3 | built | .ai/bin/protocol-archive.cjs:227-230,262 | Hard cap enforced with size limits |
| PROTO-DEC-0037 item 4 | built | .ai/PLAN.md | Synthesis section 5 keep-list adopted |
| PROTO-DEC-0037 item 5 | built | PROTO-DEC-0037 | Never-touch list defined |
| PROTO-DEC-0038 item 1 | built | AGENTS.md section 2 | Full adversarial prompt+report pairs mandatory for core |
| PROTO-DEC-0038 item 2 | built | AGENTS.md section 2 | Docs/config/one-line fixes need one reviewer statement |
| PROTO-DEC-0038 item 3 | built | AGENTS.md section 2 | Prompt and report artifacts size-capped (150/250 lines) |
| PROTO-DEC-0038 item 4 | built | AGENTS.md, QUICKSTART.md | Documentation updated |
| PROTO-DEC-0038 item 5 | built | - | No new monitoring or enforcement layers added |
| PROTO-DEC-0039 item 1 | built | PROTO-DEC-0039 | Feature freeze in effect |
| PROTO-DEC-0039 item 2 | partial | .ai/PLAN.md:51-54 | Product pilot described but execution pending |
| PROTO-DEC-0039 item 3 | partial | .ai/PLAN.md:74-76 | v2.0 scope scheduled but not yet implemented |
| PROTO-DEC-0039 item 4 | partial | .ai/DECISIONS.md:1700-1702 | Audit closure actions partially complete (Qoder->advisory, Codex receipt re-recorded, C1a accepted, journals restored) |
| PROTO-DEC-0039 item 5 | partial | .ai/DECISIONS.md:1703-1704 | Record pass described but not yet executed (order: Gemini -> DeepSeek -> Codex) |
| PROTO-DEC-0040 item 1 | built | .ai/docs/PAIRED-CYCLE.md | PAIRED-CYCLE.md authorized and present |
| PROTO-DEC-0040 item 2 | built | PROTO-DEC-0040 | Scope definition for remediation |
| PROTO-DEC-0040 item 3 | partial | PROTO-DEC-0040:3 | Roles assigned (Codex, Gemini, DeepSeek) but implementation work pending |
| PROTO-DEC-0040 item 4 | partial | PROTO-DEC-0040:4 | Full core process described but certification work pending |
| PROTO-DEC-0040 item 5 | built | PROTO-DEC-0037 | PROTO-DEC-0037 retention rules remain binding |
| PROTO-DEC-0040 item 6 | built | PROTO-DEC-0039 | PROTO-DEC-0039 remains in force outside exception |
| PROTO-DEC-0041 item 1 | built | AGENTS.md section 2 | Certification independence for high-risk candidates |
| PROTO-DEC-0041 item 2 | built | AGENTS.md section 2 | Minimum two parallel independent reviewers for high-risk |
| PROTO-DEC-0041 item 3 | built | AGENTS.md section 2 | Closed verdict vocabulary (PASS, RECOMMENDATION, FAIL, BLOCKED) |
| PROTO-DEC-0041 item 4 | built | PROTO-DEC-0041 | Objective blocking rule and severity rubric |
| PROTO-DEC-0041 item 5 | built | PROTO-DEC-0041 | Symmetry of evidence |
| PROTO-DEC-0041 item 6 | built | .ai/PLAN.md | PLAN-level policy remains unrecorded |
| PROTO-DEC-0042 item 1 | built | PROTO-DEC-0042 | Receipt freshness bound to task, not later history |
| PROTO-DEC-0042 item 2 | built | PROTO-DEC-0042 | Certifying reviewer receipt binds tree as of certification |
| PROTO-DEC-0042 item 3 | built | PROTO-DEC-0042 | Producer and controller receipts for paired cycle |
| PROTO-DEC-0042 item 4 | built | PROTO-DEC-0042 | verify --deep exit 1 on closed task receipt is not a finding |
| PROTO-DEC-0042 item 5 | built | PROTO-DEC-0042 | Refines PROTO-DEC-0040 item 4 freshness semantics |
| PROTO-DEC-0042 item 6 | built | PROTO-DEC-0042 | Cycle-architecture acceptance criterion satisfied |
| PROTO-DEC-0043 item 1 | built | protocol-manifest.json:21, .ai/docs/CLI-AGENTS.md | CLI-AGENTS.md added to managed list |
| PROTO-DEC-0043 item 2 | built | .ai/docs/CLI-AGENTS.md | Call is dispatch, transfers no authority |
| PROTO-DEC-0043 item 3 | built | .ai/docs/CLI-AGENTS.md | Called agent starts own session with protocol-session.cjs start |
| PROTO-DEC-0043 item 4 | built | .ai/docs/CLI-AGENTS.md | Terminal output is not Evidence |
| PROTO-DEC-0043 item 5 | built | .ai/docs/CLI-AGENTS.md | Invoking agent and writing prompt is control of that work |
| PROTO-DEC-0043 item 6 | built | .ai/docs/CLI-AGENTS.md | Least privilege default for agent calls |
| PROTO-DEC-0043 item 7 | built | .ai/docs/CLI-AGENTS.md | DeepSeek participates through IDE/chat interface |
| PROTO-DEC-0043 item 8 | built | PROTO-DEC-0043 | Bounded exception to freeze, documentation only |
| PROTO-DEC-0044 item 1 | built | .ai/bin/protocol-hooks.cjs:348 | Layer A: inventory at session start via git ls-files |
| PROTO-DEC-0044 item 2 | built | .ai/bin/protocol-index.cjs | Layer B: addressable index via protocol-index.cjs |
| PROTO-DEC-0044 item 3 | built | .ai/bin/protocol-ledger.cjs | Layer C: coverage and independence via protocol-ledger.cjs |
| PROTO-DEC-0044 item 4 | built | PROTO-DEC-0044 | All three outputs advisory under PROTO-DEC-0034 |
| PROTO-DEC-0044 item 5 | built | protocol-manifest.json:22-23 | protocol-index.cjs and protocol-ledger.cjs in managed |
| PROTO-DEC-0044 item 6 | built | tests/index.test.cjs, tests/ledger.test.cjs | Tests exist for index and ledger |
| PROTO-DEC-0045 item 1 | built | PROTO-DEC-0045 | No memory engine or graph backend adopted |
| PROTO-DEC-0045 item 2 | built | PROTO-DEC-0045 | CodeGraph recorded as alternative S1 arm |
| PROTO-DEC-0045 item 3 | built | PROTO-DEC-0045 | Jev advisory only, stays outside gate |
| PROTO-DEC-0045 item 4 | built | PROTO-DEC-0045 | Legacy disposition by measured reference |
| PROTO-DEC-0045 item 5 | built | PROTO-DEC-0045 | No deletion executed by this decision |
| PROTO-DEC-0045 item 6 | built | docs/specs/2026-09-23-executable-rulebook-spec.md | Executable rulebook specification |
| PROTO-DEC-0046 item 1 | built | PROTO-DEC-0046 | New premise for F-001/F-C01 root cause |
| PROTO-DEC-0046 item 2 | built | docs/specs/2026-09-23-executable-rulebook-spec.md:79-81 | Ledger path contract with normalised paths |
| PROTO-DEC-0046 item 3 | built | protocol-manifest.json:5-32, .ai/DECISIONS.md:1960-1962 | Protected set from manifest (managed+source lists) plus .ai/, .claude/, .codex/ |
| PROTO-DEC-0046 item 4 | built | PROTO-DEC-0046 | Remediation budget of at most two attempts |
| PROTO-DEC-0046 item 5 | built | tests/rulebook.test.cjs | Tests for protected-path classes |
| PROTO-DEC-0046 item 6 | partial | PROTO-DEC-0046:6 | Certification by DeepSeek coordination described but implementation work pending (certifiers: Codex and fresh Claude session) |
| PROTO-DEC-0047 item 1 | built | PROTO-DEC-0047 | Certifier selection order |
| PROTO-DEC-0047 item 2 | built | PROTO-DEC-0047 | Verdict asymmetry |
| PROTO-DEC-0047 item 3 | built | PROTO-DEC-0047 | Certifier count by risk |
| PROTO-DEC-0047 item 4 | built | PROTO-DEC-0047 | Shadow certification |
| PROTO-DEC-0047 item 5 | built | PROTO-DEC-0047 | Batch cap of three certification rounds |
| PROTO-DEC-0047 item 6 | built | PROTO-DEC-0047 | Executor liveness definition |
| PROTO-DEC-0047 item 7 | built | PROTO-DEC-0047 | Permission grants with narrow defaults |
| PROTO-DEC-0047 item 8 | partial | docs/specs/2026-09-23-executable-rulebook-spec.md:1-4 | Script standard for checks and validations (spec exists, implementation pending) |
| PROTO-DEC-0047 item 9 | partial | PROTO-DEC-0047:9 | Client registry for models and settings (described in DEC-0047, not yet implemented as kernel logic) |
| PROTO-DEC-0047 item 10 | partial | PROTO-DEC-0047:10 | Cost measurement with CodeBurn (mentioned in DEC-0047, npm codeburn not installed, requires owner approval) |
| PROTO-DEC-0047 item 11 | built | PROTO-DEC-0047 | Tool governance with default-deny |
| PROTO-DEC-0047 item 12 | built | PROTO-DEC-0047 | Scope limitation for this block |
