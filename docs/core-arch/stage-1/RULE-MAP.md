# RULE-MAP: AGENTS.md → kernel records (CORE-ARCH stage 1, task S1-T07)

A stage work product, not a kernel record: it has no front matter and never lands in `.ai/core/`.

- Source: `AGENTS.md` at baseline `4ded1be` (467 lines, protocol v1.9.6), read in full.
- Each row is one atomic rule or one inseparable group of steps. `Lines` are `AGENTS.md` line
  numbers; every non-blank line that is not a heading or a `---` separator belongs to exactly one
  row. A throwaway scratchpad script checked that (result in the journal of
  `claude-eb97ac9d13050014`).
- `Home` is the one record that will carry the rule after landing (R-L0-12). `+` names records
  that keep only a pointer. Record ids that no stage file had planned before this map are marked
  **new**.
- `Class` (CORE-ARCH-2 §3): A kept because proven useful; B kept, added after measured harm;
  D kept in a changed form; E retired. `pointer` marks a line that only points elsewhere.
- Why this is not `protocol-ledger.cjs cover`: `cover` counts files of a corpus, not lines of one
  document, so the S1-T07 acceptance as written cannot be run. Recorded as a signal; the line
  check above replaces it for this map.

| Id | Lines | Rule (short) | Home | Layer | Class | Note |
|---|---|---|---|---|---|---|
| AR-001 | 5-7 | several assistants, no shared memory, filesystem is the channel | L0 R-L0-01 | L0 | A | |
| AR-002 | 9 | read AGENTS.md, then TASK, at session start | P-L2-010 | L2 | A | becomes "read the root and your packet" after migration |
| AR-003 | 11-12 | chat is not memory | L0 R-L0-08 | L0 | A | |
| AR-004 | 18-26 | source ranking | L0 R-L0-03 | L0 | A | |
| AR-005 | 28-29 | lower source is stale: fix or report, never act on it | L0 R-L0-03 + P-L0-003 | L0 | A | |
| AR-006 | 31-32 | `.ai/runtime/` is disposable and never a source | P-L5-003 **new** | L5 | A | state rule, not ranking |
| AR-007 | 38 | an agent's proposal is not a decision | L0 R-L0-04 | L0 | A | |
| AR-008 | 39-42 | a decision is an approved block with a human name; the text is a record, not proof | P-L0-005 | L0 | A | the sentence ends at the start of line 43 |
| AR-009 | 43-47 | transcription of a direct owner approval by the lock holder, with provenance | P-L0-005 + R-L0-04 | L0 | A | PROTO-DEC-0030 |
| AR-010 | 48-49 | proposals live in PLAN; `Proposed` is forbidden in DECISIONS | P-L0-005 | L0 | A | |
| AR-011 | 50-51 | any agent may challenge; record the disagreement; never overwrite | L0 R-L0-04 | L0 | A | CA-15 |
| AR-012 | 52 | the owner decides; ask rather than assume | L0 R-L0-04 + P-L0-002 | L0 | A | |
| AR-013 | 56-71 | `## Roles`, one assistant per line, free role text, owner writes | SCHEMA-assignment (L1; named ASSIGNMENT-GRAMMAR in CORE-ARCH-3) | L1 | D, E | free text retired (0049 item 2); brand key replaced (0054 item 3) |
| AR-014 | 73-75 | each session is told its role; an unnamed one asks first | P-L1-001 | L1 | A | DEC-0020 |
| AR-015 | 77-79 | the implementer never marks Completed alone | ROLE-implementer | L1 | A | |
| AR-016 | 81 | pointer to PAIRED-CYCLE | S-002 | L2 | pointer | |
| AR-017 | 83-87 | a CLI call is a dispatch: no authority transfer, own session and journal, stdout is not Evidence, the caller cannot certify | P-L2-006 + R-L0-04 + R-L0-05 | L2 | A | split rule: authority part is L0, procedure part L2 |
| AR-018 | 91-103 | high risk: unified adversarial prompt, closed verdicts, no Completed without it; two parallel independent certifiers outside execution and control | P-L2-004 + R-L0-05 | L2 | A | 0038, 0041 |
| AR-019 | 104-106 | low risk: one independent reviewer statement | P-L2-004 | L2 | A | |
| AR-020 | 107-108 | prompts ≤ 150 lines, reports ≤ 250 | P-L7-001 | L7 | B | cap was broken (268 lines, S-claude-16) |
| AR-021 | 110-125 | completion-gate section in TASK; prompt and review exist; PASS/RECOMMENDATION; `Mode: CERTIFYING`; receipt verifies; journal names the review; FAIL/BLOCKED cannot certify | P-L2-004 (gate section) | L2 | A | 0032 |
| AR-022 | 127-131 | certifying needs four capabilities, set by the orchestrator; header names `Receipt-Owner` | ROLE-certifier | L1 | A | 0031 |
| AR-023 | 132-135 | advisory outputs are marked and cannot satisfy the gate | P-L7-001 + P-L2-004 | L7 | A | |
| AR-024 | 137-138 | FAIL or BLOCKED needs one reproduction per claim, else advisory | P-L2-004 + R-L0-06 | L2 | A | |
| AR-025 | 144-147 | session start: read TASK, status and log | P-L2-010 | L2 | A | |
| AR-026 | 148-153 | take the inventory; check a task's source list against it | L0 R-L0-16 | L0 | B | 0044 |
| AR-027 | 154-156 | read recent journals; read DECISIONS when architecture, data or contracts are touched | P-L2-010 | L2 | A | |
| AR-028 | 157-158 | no active task: ask the owner, invent nothing | P-L0-002 | L0 | A | |
| AR-029 | 160-162 | the hook injection is bounded; reading omitted files is the agent's job; Codex pointer | P-L2-010 + TOOL-protocol-hooks | L2 | A | |
| AR-030 | 168-177 | session end: own diff, checks, one entry, TASK, lock release, no commit | P-L2-010 | L2 | A | |
| AR-031 | 179-181 | an entry says what changed, what was verified, what is open; a "did not change" claim stays true | P-L2-011 | L2 | A | |
| AR-032 | 187-189 | one journal per session; never write another's | P-L2-011 + R-L0-07 | L2 | A | split: invariant in the root |
| AR-033 | 191-202 | journal and owner name come from the hook or from `session start` | P-L2-010 | L2 | A | |
| AR-034 | 203 | `README.md` in the worklog is not a journal | P-L2-011 | L2 | A | |
| AR-035 | 205-209 | the validator warns on a foreign-agent entry; the rule binds, the warning checks accidents | P-L2-011 | L2 | A | |
| AR-036 | 211-212 | prune empty journals; a journal with entries is archived by hand under the lock | P-L5-002 | L5 | A | |
| AR-037 | 214-228 | five labels per entry | P-L2-011 | L2 | A | |
| AR-038 | 232 | a journal is at most 150 lines | P-L5-002 | L5 | A | |
| AR-039 | 233-251 | extended analysis: report in `docs/reviews/`, linked from the journal, chat short, mandatory header | P-L7-001 | L7 | A | 0026 |
| AR-040 | 252-255 | chat transcription fallback | P-L7-001 | L7 | A | |
| AR-041 | 256-257 | review files are immutable; revisions are new files or `Superseded by` | P-L7-001 | L7 | A | |
| AR-042 | 258-263 | `cover` and `dup` over a corpus; advisory only | TOOL-protocol-ledger | L3 | A | 0044 |
| AR-043 | 269-294 | shared documents: one writer through the cooperative lock; abandoned gates; never steal; confirm a holder is gone | P-L5-001 | L5 | A | CA-15 |
| AR-044 | 296-304 | writing rules per shared file | P-L5-001 + P-L0-005 | L5 | A | split: DECISIONS and REGISTRY rows are L0 |
| AR-045 | 306-309 | replace a decision only by a new block with `Supersedes:` | P-L0-005 | L0 | A | |
| AR-046 | 311-321 | reopening needs a trigger row of one of six kinds, each with its proof | P-L0-005 | L0 | A | CA-15 |
| AR-047 | 327-346 | before handoff run the validator, the suite in the source role, and the project's own tests | P-L2-010 + TOOL-validate | L2 | A | |
| AR-048 | 348-356 | attach Evidence with `record`, never assert | SCHEMA-evidence **new** | L5 | A | |
| AR-049 | 358-359 | no secret in a journal; `record` and Stop scan for it | R-L0-07 + SCHEMA-evidence | L0 | A | split: invariant in the root |
| AR-050 | 361-366 | `rehash` after a redaction | SCHEMA-evidence | L5 | A | |
| AR-051 | 368-376 | `verify`; the entry hash; never hand-write Evidence | SCHEMA-evidence | L5 | A | |
| AR-052 | 378-379 | external tools and MCP are advisory, never Evidence or gate input | P-L3-001 **new** (tool governance) | L3 | A | 0034, 0047 item 11 |
| AR-053 | 385-408 | size limits and archiving, automatic and manual | P-L5-002 | L5 | A | |
| AR-054 | 415-424 | before changing code: task, read the code, status, decisions index, assumptions | P-L9-001 | L9 | A | |
| AR-055 | 426-427 | stay inside the task; no drive-by refactors | P-L9-001 | L9 | A | |
| AR-056 | 433-437 | git is durable: meaningful commits, no pushing every change, no rewriting pushed history | P-L9-001 | L9 | A | |
| AR-057 | 438 | branch for anything bigger than a small fix | P-L9-001 | L9 | A | CA-15 |
| AR-058 | 439 | never commit a secret; keys in environment variables | R-L0-07 + P-L9-001 | L0 | A | |
| AR-059 | 445-455 | UTF-8 without BOM, LF; `.ps1` ASCII-only | P-L9-002 **new** (encoding) | L9 | A | DEC-0001 |
| AR-060 | 461-467 | the Never list | L0 R-L0-07 (+R-L0-04 for 461) | L0 | A | |

## What the map shows

- 60 rows. By layer (counted by the check script): L0 17, L1 4, L2 18, L3 2, L5 9, L7 5, L9 5; none in L4, L6 or L8, which
  confirms that those layers have no rules in `AGENTS.md` today (the thin cells of PROCEDURE-MAP).
- Split rules (fit two layers, DISCUSSION §9 question 1 asks for this data): AR-017, AR-032,
  AR-044, AR-049. Each keeps its invariant part in the root and its procedure part in a branch.
- Changed or retired: AR-013 only (roles: free text retired, brand key replaced).
- New homes no stage had planned: P-L5-003 runtime state, SCHEMA-evidence, P-L3-001 tool
  governance, P-L9-002 encoding. They go into stages 4, 5 and 6 (see CORE-ARCH-5 §6,
  CORE-ARCH-6 §5, CORE-ARCH-7 §5).
- Nothing in sections 1-12 is left `out`.

## Change log

- 0.1 — 2026-09-24 — claude-eb97ac9d13050014 — first map, line coverage checked by script — review pending (S1-T11).
- 0.2 — 2026-09-25 — claude-eb97ac9d13050014 — AR-013 names the record stage 2 wrote (SCHEMA-assignment); no mapping changed (LCC-9 of L1) — review pending (stage 2).
