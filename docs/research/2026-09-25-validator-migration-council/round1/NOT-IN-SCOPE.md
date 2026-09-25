Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367
Model: Gemini 3.1 Pro (High)
Model-maker: Google
Client: agy
Effort: High
Task-frame / scope-id: task:vmc-r1-c
UTC-date: 2026-09-25
Mode: ADVISORY

## NOT IN SCOPE

1. **setup-ai-protocol.ps1**
   - **LATER**
   - Reason: It is rarely run (only 86 calls, 96s total in M-07) and not on the critical path (M-11). Not part of the core per-task workflow. PROPOSAL section 3 item 6 explicitly excludes it from step 1.

2. **Full test-protocol.ps1 orchestration**
   - **LATER**
   - Reason: The test runner works; the bottleneck is the validator subprocess overhead and sequential test design (M-11), not the orchestrator itself.

3. **Launcher process inspection**
   - **LATER**
   - Reason: M-13 shows `Get-CimInstance` is extremely slow under load, but PROPOSAL section 3 item 6 excludes it from step 1 validator port. Process liveness extraction is already scheduled for v2.0 (PROTO-DEC-0039 item 3).

4. **Other PowerShell scripts**
   - **NEVER / NO EVIDENCE**
   - Reason: No measurements or data presented suggest any other scripts cause measurable performance issues.

5. **Rust rewrite**
   - **NEVER / NO EVIDENCE**
   - Reason: CORE-ARCH-1 H-13 rejected Python, and PROPOSAL section 2 notes Rust only appears in owner hypotheses. Node is the only runtime already required everywhere.

6. **MCP integration**
   - **NEVER / NO EVIDENCE**
   - Reason: Completely unrelated to the validator performance bottleneck or platform capability issues.

7. **AX integration**
   - **NEVER / NO EVIDENCE**
   - Reason: Irrelevant to resolving the validation delay or cross-platform Evidence gaps.

8. **General build-system rewrite**
   - **NEVER / NO EVIDENCE**
   - Reason: Explicitly forbidden by OWNER-PROMPT §21 ("Do not expand the validator migration into a general infrastructure rewrite.").
