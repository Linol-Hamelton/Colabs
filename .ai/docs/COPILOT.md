# GitHub Copilot Project Integration

This repository runs the shared AI Collaboration Protocol. The rules live in
`AGENTS.md` and bind GitHub Copilot (VS Code extension, Copilot Chat, Copilot CLI,
and GitHub Codespaces) exactly as written there.

`.github/copilot-instructions.md` is the project entrypoint automatically read
by Copilot in workspace context. `AGENTS.md` is the single source of truth for
protocol rules.

---

## 1. How Copilot Participates

GitHub Copilot operates as a supported assistant alongside Claude, Codex,
DeepSeek, Gemini, Qwen, GLM, and Mistral.

Unlike Claude and Codex (which feature IDE-managed lifecycle hooks), Copilot
connects through the standard protocol session entrypoint:

```bash
node .ai/bin/protocol-session.cjs start --agent copilot
```

This command:
1. Mints a unique session ID.
2. Injects bounded repository context (current task, assigned role, recent git diff/log).
3. Allocates an isolated session journal: `.ai/worklog/copilot-<session-hash>.md`.
4. Outputs the owner name required for locking and evidence recording.

---

## 2. Session Lifecycle Workflow

### A. Session Start
1. Run `node .ai/bin/protocol-session.cjs start --agent copilot`.
2. Inspect the injected context and `.ai/TASK.md`.
3. Verify your assigned role under `## Roles`.
4. Run `git status --short --branch` and `git log --oneline -10`.

### B. Cooperative Locking
Before modifying `.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md`, or `.ai/ARCHIVE.md`:
```bash
node .ai/bin/protocol-lock.cjs acquire --owner <copilot-owner-name>
```

When work on shared documents is finished:
```bash
node .ai/bin/protocol-lock.cjs release --owner <copilot-owner-name>
```

### C. Journaling
Document all work in your dedicated journal (`.ai/worklog/copilot-<id>.md`).
Each journal entry must include all five required fields:
- `Agent: copilot`
- `Action:` (what was changed or investigated)
- `Result:` (concrete outputs or test results)
- `Next step:` (logical next task or handoff)
- `Open:` (unresolved questions or blocks)

Older entries are automatically archived into `.ai/ARCHIVE.md` when the journal
approaches the 150-line limit.

### D. Verification and Handoff
1. Run the validator:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
   ```
2. For protocol core changes in this repository, run the regression suite:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
   ```
3. Record verifiable handoff evidence:
   ```bash
   node .ai/bin/protocol-handoff.cjs record --owner <copilot-owner-name>
   ```
4. Perform the stop check:
   ```bash
   node .ai/bin/protocol-session.cjs stop --agent copilot --session <session-id>
   ```

---

## 3. Host and Workspace Configuration

- `.github/copilot-instructions.md`: automatically loaded by GitHub Copilot in
  VS Code, Visual Studio, and GitHub Codespaces.
- Custom prompts or slash commands can be mapped directly to the protocol CLI
  entrypoints.
- Copilot must never write directly to other assistants' journals, bypass the
  lock, or mark tasks completed without opposing review or human owner approval.
