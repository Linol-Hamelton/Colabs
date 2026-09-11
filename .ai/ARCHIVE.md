# Worklog Archive

Cold storage for worklog entries moved out of `.ai/worklog/`. Never trimmed,
never summarized away.

Entries keep the exact text they had when they were current. Add the agent name
and the date they were archived; change nothing else.

Information needed to understand an accepted decision belongs in
`.ai/DECISIONS.md`, not here. This file is history, not authority.

---

## Archive

No archived entries yet.

---

## Archiving procedure

Two different limits, two different operations.

A journal passed its 150-line limit:

1. Cut its oldest entries.
2. Paste them below, under a heading naming the journal and the archive date.
3. Leave the newest entries in place, enough to explain the current state.

`.ai/worklog/` passed 30 files:

1. Pick the oldest journals whose sessions have ended. A journal is closed when
   no lock names it and its newest entry carries evidence or a Next step that
   the following session already acted on.
2. Move each closed journal here whole, heading and all, then delete the file.
   Moving entries out of a journal never reduces the file count; only this does.
3. Ownership does not block this. The rule against writing to another session's
   journal protects a live session; a closed journal is archived by whoever
   holds the shared-document lock.

Never rewrite an entry while moving it.
