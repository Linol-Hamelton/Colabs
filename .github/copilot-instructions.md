# GitHub Copilot Instructions

This repository operates under a shared multi-agent collaboration protocol.
The rules live in `AGENTS.md` and bind GitHub Copilot exactly as written there.

Read `AGENTS.md` and `.ai/docs/COPILOT.md`.

## Mandatory Protocol Rules for Copilot

1. **Session Lifecycle**:
   At the start of every session, initialize your session explicitly via shell:
   ```bash
   node .ai/bin/protocol-session.cjs start --agent copilot
   ```
   This command prints your active session ID, your assigned role from `.ai/TASK.md`,
   and your dedicated session journal path: `.ai/worklog/copilot-<id>.md`.

2. **Check Current Task**:
   Always read `.ai/TASK.md`. Verify the `## Roles` section. If no active task
   is declared, ask the owner before taking action. Do not invent tasks.

3. **Single Writer on Shared Documents**:
   Take the cooperative lock before editing `.ai/TASK.md`, `.ai/PLAN.md`,
   `.ai/DECISIONS.md`, or `.ai/ARCHIVE.md`:
   ```bash
   node .ai/bin/protocol-lock.cjs acquire --owner <your-owner-name>
   ```
   Always release the lock when you finish:
   ```bash
   node .ai/bin/protocol-lock.cjs release --owner <your-owner-name>
   ```

4. **Session Journal**:
   Write all session actions strictly to your own assigned journal in `.ai/worklog/`.
   Never edit another assistant's journal. Every entry must contain all 5 required labels:
   `Agent:`, `Action:`, `Result:`, `Next step:`, `Open:`.

5. **Decisions are Append-Only**:
   An AI proposal is never a decision. Binding architectural and contract decisions
   belong in `.ai/DECISIONS.md` only with an explicit `Approved by: <Human Name>`.
   Drafts belong in `.ai/PLAN.md`.

6. **Pre-Handoff Verification & Evidence**:
   Before handing off work, run the protocol validator:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
   ```
   Then attach verifiable evidence to your journal:
   ```bash
   node .ai/bin/protocol-handoff.cjs record --owner <your-owner-name>
   ```
