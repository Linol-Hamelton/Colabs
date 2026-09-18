# AI Collaboration Protocol - Quickstart & Onboarding Guide

A fast, practical guide for human developers and AI assistants (Claude, Codex, DeepSeek, Gemini, Qwen, Copilot, GLM, Mistral) collaborating in this repository.

The filesystem is the only channel between assistants. Chat history is not project memory.

---

## 1. Quick Start: The 3-Step Loop

For assistants with hooks (Claude, Codex), session setup and stop checks happen automatically.
For all other assistants (chat panels, custom endpoints, CLI), use the explicit loop:

```bash
# Step 1: Start your session (prints your assigned session ID, lock owner, and context)
node .ai/bin/protocol-session.cjs start --agent <your-name>

# Step 2: Acquire lock before editing shared docs (.ai/TASK.md, .ai/PLAN.md, .ai/DECISIONS.md)
node .ai/bin/protocol-lock.cjs acquire --owner <your-session-id>
# ... edit shared docs ...
node .ai/bin/protocol-lock.cjs release --owner <your-session-id>

# Step 3: Record verified evidence and conclude session
node .ai/bin/protocol-handoff.cjs record --owner <your-session-id>
node .ai/bin/protocol-session.cjs stop --agent <your-name> --session <your-session-id>
```

---

## 2. Core Protocol Rules

1. **One Writer for Shared Documents**: Always acquire the lock with `protocol-lock.cjs` before modifying `.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md`, or `.ai/ARCHIVE.md`.
2. **Append-Only Decisions**: An approved decision block in `.ai/DECISIONS.md` is permanent. Never edit or delete existing decisions; write a new block with `Supersedes: DEC-xxxx` to amend.
3. **Dedicated Session Journals**: Each session writes only to its own journal in `.ai/worklog/<agent>-<id>.md`. Never modify another session's journal.
4. **Verifiable Evidence**: Never write or fake test results. Use `protocol-handoff.cjs record` to stamp your journal with authenticated format-2 Evidence. Receipts without format 2 are legacy unauthenticated (`verify --owner` requires `--allow-legacy`).
5. **Encoding & Standards**: UTF-8 without BOM, LF line endings for all text files. All PowerShell (`.ps1`) scripts must remain strictly ASCII-only (no Unicode characters).
6. **Extended Analysis in docs/reviews/**: In-depth architectural evaluations, multi-agent audits, and consensus reports belong in `docs/reviews/YYYY-MM-DD-<agent>-<topic>.md` using `templates/reviews/REVIEW.md`. Journals reference the review and carry verifiable evidence; chat output is limited to a concise executive verdict.
7. **Mandatory Adversarial Review Prompt**: Regardless of who implements changes, after finishing a plan or task the implementer must author an exhaustive unified prompt covering all changes to solicit adversarial review, defect-hunting, optimization proposals, or certification of optimality before completion. A completed task must list the prompt and an independent review under `## Completion gate` in `.ai/TASK.md`; the validator rejects missing artifacts or a `FAIL`/`BLOCKED` verdict.

---

## 3. Lock Contention & Troubleshooting

If `protocol-lock.cjs acquire` reports that the lock is held:

```bash
# Inspect lock status and holder PID
node .ai/bin/protocol-lock.cjs status
```

- **If holder process is alive**: Wait or coordinate. Never steal an active session's lock.
- **If holder process is dead/abandoned**: Clear the lock safely:
  ```bash
  node .ai/bin/protocol-lock.cjs acquire --owner <your-session-id> --force
  ```
- **If an operation gate is stuck**:
  ```bash
  node .ai/bin/protocol-lock.cjs clear-operation
  ```

> [!NOTE]
> `protocol-lock.cjs` supports `--session-pid <pid>` for supervisor processes, bound to `process.pid`, `process.ppid`, or a registered session matching `--session-token <token>` (registered via `protocol-session.cjs start --supervisor-pid <pid>`). System PIDs (`pid <= 4`) and unaffiliated PIDs are rejected. The session token serves as an anti-accident barrier against collision and squatting. Clearing a live registered lock requires `--force --reason "<explanation>"`. For transient CLI sessions, locks are tracked cooperatively by owner identity.

---

## 4. Operator CLI Commands

Use the unified operator tool `.ai/bin/protocol.cjs` for diagnostics, monitoring, and maintenance:

```bash
node .ai/bin/protocol.cjs doctor      # Full diagnostic check of tools, git, locks, and workspace
node .ai/bin/protocol.cjs status      # Quick view of current lock holder and document line counts
node .ai/bin/protocol.cjs clean       # Quarantine empty journals and remove orphaned runtime state
node .ai/bin/protocol.cjs telemetry   # Collaboration metrics, agent participation, and integrity stats
```

---

## 5. Workspace Directory Structure

```text
├── AGENTS.md                  # Protocol specification & behavioral rules (start here)
├── QUICKSTART.md              # This 1-page onboarding guide
├── README.md                  # Installation, host adapters, and architecture overview
├── protocol-manifest.json     # Managed paths, tool roles, and integrity manifest
├── validate-protocol.ps1      # Protocol health, encoding, and size limit validator
├── test-protocol.ps1          # Protocol regression test suite
├── docs/reviews/              # Architecture reviews, council syntheses, and audits
├── templates/reviews/         # REVIEW.md template for technical reports
└── .ai/
    ├── TASK.md                # Active task, roles, and open questions (max 80 lines)
    ├── PLAN.md                # Proposed architectural and technical approach (max 200 lines)
    ├── DECISIONS.md           # Approved architectural decisions (append-only)
    ├── ARCHIVE.md             # Cold historical ledger of archived journal entries
    ├── bin/                   # Node.js protocol engines (lock, handoff, session, doctor)
    ├── docs/                  # Host adapter documentation (CODEX.md, COPILOT.md, GLM.md, etc.)
    └── worklog/               # Session journals (one per session, max 150 lines each)
```
