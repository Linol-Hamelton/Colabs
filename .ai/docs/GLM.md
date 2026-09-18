# GLM Project Integration

This repository runs the shared AI Collaboration Protocol. The rules live in
`AGENTS.md` and bind GLM (ChatGLM, GLM-4, GLM-Zero-Preview, and API adapters)
exactly as written there.

`AGENTS.md` is the single source of truth for protocol rules.

---

## 1. Role and Capabilities

In this collaboration protocol, GLM is recognized for:
- **Complex Reasoning & Architectural Auditing**: In-depth analysis of state models,
  concurrency primitives, and edge-case behaviors.
- **Multilingual Analysis & Code Review**: Rigorous cross-lingual verification
  of documentation, specifications, and comments.
- **Independent Verification**: Opposing review before handoff to ensure no
  unverified claims are certified.

---

## 2. Session Lifecycle Workflow

GLM participates as an assistant without native IDE hooks via the standardized
protocol engine:

### A. Starting a Session
At the start of every session, initialize explicitly via shell:
```bash
node .ai/bin/protocol-session.cjs start --agent glm
```

This command:
1. Mints a unique session ID.
2. Injects bounded project context (current task, assigned role, git status, and log).
3. Allocates an isolated session journal: `.ai/worklog/glm-<session-hash>.md`.
4. Outputs the owner name required for locking and evidence recording.

### B. Checking Authority & Current Task
- Read `.ai/TASK.md` and confirm your role under `## Roles`.
- Read `.ai/DECISIONS.md` before touching architecture or external contracts.
- Remember: proposals belong in `.ai/PLAN.md`; decisions in `DECISIONS.md` require
  an explicit `Approved by: <Human Name>` and are strictly append-only.

### C. Cooperative Locking
Before editing shared documents (`.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md`,
`.ai/ARCHIVE.md`):
```bash
node .ai/bin/protocol-lock.cjs acquire --owner <glm-owner-name>
```

When work on shared documents is finished:
```bash
node .ai/bin/protocol-lock.cjs release --owner <glm-owner-name>
```

If a previous process crashed:
- Inspect status with `node .ai/bin/protocol-lock.cjs status`.
- Clear an abandoned operation gate: `node .ai/bin/protocol-lock.cjs clear-operation`.
- If the previous holder is confirmed dead, pass `--force` to `acquire`.

### D. Journaling
Write strictly to your allocated journal (`.ai/worklog/glm-<id>.md`).
Each entry must contain all five required labels:
- `Agent: glm`
- `Action:`
- `Result:`
- `Next step:`
- `Open:`

Journals approaching 150 lines are automatically archived into `.ai/ARCHIVE.md`
via `autoArchiveWorklog`.

### E. Verification & Handoff
1. Run the validator:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
   ```
2. In the protocol source repository, run the regression suite:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
   ```
3. Record verifiable handoff evidence:
   ```bash
   node .ai/bin/protocol-handoff.cjs record --owner <glm-owner-name>
   ```
4. Perform the stop check:
   ```bash
   node .ai/bin/protocol-session.cjs stop --agent glm --session <session-id>
   ```
