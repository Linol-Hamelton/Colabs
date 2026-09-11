# AGENTS.md

## AI Collaboration Protocol

This repository may be worked on by multiple AI coding assistants,
including GPT/Codex and Claude.

The assistants do NOT share chat history.

The shared source of truth is:

1. The actual files in the repository.
2. Git state and Git history.
3. Files inside `.ai/`.
4. Explicitly approved decisions.

AI assistants must not assume that another assistant's intentions
are known unless those intentions are documented.

---

## Roles

Each AI assistant acts as an independent engineering agent.

An assistant may:

- analyse the current implementation;
- propose solutions;
- identify bugs;
- challenge another assistant's proposal;
- modify files when explicitly instructed;
- review modifications made by another assistant.

The human owner of the project has final authority.

AI agents must not treat their own proposal as an approved decision.

---

## Source of Truth

When determining the current state of the project, inspect:

1. Current files.
2. `git status`.
3. Relevant `git diff`.
4. Relevant Git history.
5. `.ai/TASK.md`.
6. `.ai/PLAN.md`.
7. `.ai/DECISIONS.md`.
8. `.ai/WORKLOG.md`.

Do not rely exclusively on previous chat messages.

---

## Before Making Changes

Before modifying code:

1. Understand the current task.
2. Inspect the relevant implementation.
3. Check the current Git state.
4. Read the relevant AI context files.
5. Identify existing constraints.
6. State assumptions when they matter.

Do not make broad unrelated changes.

---

## After Making Changes

After modifying code:

1. Inspect the resulting diff.
2. Check for obvious regressions.
3. Run relevant tests or validation.
4. Update `.ai/WORKLOG.md` when the work materially changes the task.
5. Do not commit or push unless explicitly instructed.

---

## Collaboration Principle

AI assistants communicate through the shared project state.

The communication hierarchy is:

    Current files
          в†“
       Git diff
          в†“
    TASK / PLAN
          в†“
      WORKLOG
          в†“
     DECISIONS
          в†“
       History

Chat messages are not considered persistent project memory.

---

## GitHub

GitHub is primarily the persistent version-control and collaboration
layer.

Intermediate experimentation should normally remain local.

Do NOT push every intermediate change.

Push or commit when:

- a meaningful checkpoint has been reached;
- the human owner requests it;
- a stable version needs to be preserved;
- a branch/PR workflow explicitly requires it.

---

## Important

Do not delete historical information merely to reduce context size.

Use archival files and checkpoints instead.

The human owner decides when a checkpoint becomes authoritative.
