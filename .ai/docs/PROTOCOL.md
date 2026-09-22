# AI Collaboration Protocol - operator guide

This file is installed into every project that uses the protocol. It explains
how to run and maintain the protocol in that project. The rules themselves are
in `AGENTS.md`, which is the only place a rule is defined.

---

## What is installed

| Path                       | Purpose                                            |
| -------------------------- | -------------------------------------------------- |
| `AGENTS.md`                | the rules, shared by every agent                    |
| `CLAUDE.md`                | pointer so Claude Code loads those rules            |
| `.ai/docs/PROTOCOL.md`         | this guide                                          |
| `.ai/docs/PAIRED-CYCLE.md`     | reusable paired work cycle specification and prompts|
| `.ai/TASK.md`              | the current task and the open questions             |
| `.ai/PLAN.md`              | the proposed approach for larger work               |
| `.ai/DECISIONS.md`         | approved decisions, append-only                     |
| `.ai/worklog/`             | one journal per session, never shared               |
| `.ai/ARCHIVE.md`           | cold storage for old journal entries                |
| `.ai/runtime/`             | disposable session state and the lock, not tracked  |
| `.claude/`                 | hooks and settings that enforce the protocol        |
| `.codex/`                  | Codex hooks; see CODEX.md for activation            |
| `.ai/bin/protocol-hooks.cjs` | shared hook engine for Claude and Codex           |
| `.ai/bin/protocol-lock.cjs`| cooperative ownership of the shared documents       |
| `validate-protocol.ps1`    | health check                                        |
| `.ai/bin/protocol-handoff.cjs` | records and verifies protocol check evidence    |
| `.ai/bin/protocol-archive.cjs` | automated archiving and storage status tool     |

The installer, `test-protocol.ps1`, tests and templates stay in the protocol
source repository. They are not part of an installed project's daily commands.

---

## Daily commands

Check that the protocol is healthy. Run this before handing off.

```powershell
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
```

Run the host project's own test command for product changes. After changing
protocol tooling, run its regression suite from the protocol source repository:

```powershell
powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
```

Inspect who owns the shared documents right now.

```powershell
node .ai/bin/protocol-lock.cjs status
```

---

## Editing the shared documents

`.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md` and `.ai/ARCHIVE.md` have one
writer at a time. Take the lock first, edit, then release it.

```powershell
node .ai/bin/protocol-lock.cjs acquire --owner <your-session-id>
node .ai/bin/protocol-lock.cjs release --owner <your-session-id>
```

For long-lived supervisor processes, pass `--session-pid <pid>`. A supervisor PID can
be registered at session start via `protocol-session.cjs start --supervisor-pid <pid>`
(accepts any live integer PID > 4; registration protects the session's empty journal and
snapshot from premature pruning by external orchestrators, functioning as an anti-accident
guard). The lock command accepts `--session-pid <pid>` when it matches `process.pid`,
`process.ppid`, or the registered supervisor/session PID authenticated with
`--session-token <token>`. Reserved system PIDs (`pid <= 4`) and unaffiliated PIDs are
rejected. The session token is an anti-accident barrier (preventing accidental PID
collision and lock squatting in cooperative environments, not an anti-adversary barrier
against local filesystem access). Clearing an abandoned lock from a confirmed dead
process uses `clear-lock` or `acquire --force`. Forcefully clearing a live registered
lock requires `--force` and `--reason "<explanation>"` with an audit record.

A session journal needs no lock. Each session writes only its own file.

If `acquire` reports another owner, do not steal the lock. Run `status` and
look at `stale` and `heldForMinutes`. Age means the lock needs checking, not
that it may be taken: a slow live holder looks the same as a dead one. Once you
have confirmed the session is over, release it with the same
owner name, which is the documented recovery path:

```powershell
node .ai/bin/protocol-lock.cjs release --owner <the-reported-owner>
```

Releasing someone else's live lock loses their work. Check that the session is
really over first.

### Access authorization tiers and change legitimization (PROTO-DEC-0041, PLAN policy)

Access to repository paths and operations is structured into five authorization tiers:
- **T0 READ**: Reviewers and analysts; file modifications are prohibited.
- **T1 SCOPED WRITE**: Implementer; write access is limited strictly to paths declared in the authorized block scope.
- **T2 SHARED DOCUMENTS**: `.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md`, `.ai/ARCHIVE.md`, and in the protocol source repository `docs/decisions/REGISTRY.md`; editable only by the single active session holding the shared-document lock.
- **T3 PRODUCT REPOSITORIES**: Dedicated product sessions operating inside the product workspace (e.g. `D:\Block-Puzzle`, `D:\VPN`); protocol sessions do not write or commit in product repositories.
- **T4 INSTALL/CONFIG**: Installer and environment tests; executed exclusively in disposable `TEMP` fixtures.

**Block Authorization Record (BARC)**:
Before implementation of a block begins, a BARC record is established:
`BlockID | requester | approver | scope paths | purpose | baseline SHA | budget (tokens/time) | expiry (single-use)`.

**Change Legitimization**:
A modification is legitimate only when all five conditions are satisfied:
1. Actual `diff` is a subset of the authorized scope (`diff ⊆ authorized scope`).
2. No path declared forbidden in the Phase 0 frame of this task is touched; where the frame is silent, the standing default list is `AGENTS.md`, `QUICKSTART.md`, kernel, hooks, gates, manifest, tests, decisions and registry.
3. The author of the change is not the reviewer.
4. A verifiable evidence receipt binds the final tree, and the reviewer's session journal explicitly cites its own review artifact.
5. An entry exists in the findings ledger with diff statistics and a verdict.

**Manual reviewer duty (explicit)**:
Checks (1) and (2) are **not executed by current automated tooling**, and the feature freeze forbids introducing a new kernel gate. Therefore, verifying scope adherence is a **mandatory manual reviewer duty recorded in the findings ledger**: the reviewer runs `git diff --name-only <baseline>`, compares the changed files against the declared block scope, and records a `scope-check: PASS|FAIL` line with the path list in the ledger. Automated enforcement is a backlog candidate for post-freeze evaluation.

---

## Session journals

Each session writes exactly one file in `.ai/worklog/`. No session writes to
another session's file, so two agents can never overwrite each other.

With active Claude/Codex hooks, SessionStart creates the journal and prints its
name. Use its basename without `.md` as the lock and evidence owner. Without
active hooks, choose one session id for both. Keep an existing journal if hooks
are configured midway through the session. See [Codex activation](CODEX.md).

`README.md` in that directory is not a journal; it explains the convention.

An entry needs all five labels, or the Stop hook will not count it:

```markdown
## YYYY-MM-DD - short title

Agent:

Action:

Result:

Next step:

Open:
```

---

## Handing off with evidence

A journal entry is a claim. An Evidence block is a record. Before handing off,
let the tooling write the record instead of typing it:

```powershell
node .ai/bin/protocol-handoff.cjs record --owner <your-session-id>
```

In an installed project it runs the validator. In the protocol source repository
it also runs the protocol regression suite. It writes the actual exit codes
into your journal and records a digest of the tree. Product tests must be run
separately and described in the journal; protocol evidence does not certify
them. A failing protocol check makes `record` fail. Use `--quick` to run only
the validator while iterating in the source repository.

The next agent, or you after a break, confirms it:

```powershell
node .ai/bin/protocol-handoff.cjs verify
```

Without a target this asks whether any journal holds evidence for the current
tree; if none matches, it reports each recorded mismatch. Add `--owner <session-id>` to judge
one journal on its own. It fails when no evidence matches the current tree, or
when the matching evidence records a failing check. `node .ai/bin/protocol-handoff.cjs state` prints the current anchor
without running anything.

The digest covers Git-normalized content and mode. Clean files reuse their
index identity; changed files use Git's path-specific normalization and mode
rules. Evidence therefore survives staging and committing unchanged work,
including CRLF files in Windows projects. Session journals and runtime state
are excluded, so writing the evidence does not invalidate it.

Digest format 4 is current. Evidence recorded under an earlier format remains
in the journals but is reported as not comparable rather than stale; run
`record` again to refresh it.

The block carries a hash of the entry with the block removed, so rewriting the
entry afterwards makes `verify` fail. Authenticated receipts carry `- entry hash format: 2`
covering certified Evidence metadata. Receipts lacking this marker are classified as legacy
unauthenticated receipts: legacy unauthenticated receipts are editable and not tamper-evident;
`- entry hash format: 2` is the only authenticated format; upgrade by recording a new entry.
`verify --owner <id>` fails closed unless `--allow-legacy` is passed
for read-only review, and no-owner `verify` excludes legacy receipts from matching handoffs.
`doctor` reports the legacy count and exits 0. To upgrade a journal to format 2, record a
new entry with `record`; historical entries are never rewritten. Never hand-write an Evidence
block: a hand-written one is a claim again, and its entry hash will not match.

If an entry was edited after certification to redact an accidental secret or token,
refresh its entry hash legitimately with:

```powershell
node .ai/bin/protocol-handoff.cjs rehash --owner <session-id> --reason "<explanation>"
```

It updates the entry hash and stamps a `- sanitized:` marker.

If a lock operation is interrupted, `acquire` says so and names the recovery:

```powershell
node .ai/bin/protocol-lock.cjs clear-operation
```

It refuses while the process that made the gate is still running.

```powershell
node .ai/bin/protocol-session.cjs prune
```

moves empty journals left by idle sessions into `.ai/runtime/pruned/` quarantine
instead of deleting them permanently. An active live session (evaluated supervisor-first,
falling through to the transient process PID) or active lock holder is never pruned,
even with `--force`. If the session state is present but liveness cannot be verified (for
example a foreign host), the journal is preserved during standard runs and quarantined
only under `--force` with an explicit audit warning. If the state file is missing or
unreadable, the empty journal is treated as unknown liveness and falls back to the
recency window; once it is older than `RECENT_WINDOW` it is quarantined. Content-bearing
journals are always protected by `holdsContent` and never quarantined.

Automatic archiving runs on `stop` and `record` whenever a journal exceeds 150 lines,
moving older entries into `.ai/ARCHIVE.md` while keeping the newest entry. During
`record`, the final line count is computed with the fresh Evidence block *before*
writing; if the projected journal exceeds 150 lines, older entries are auto-archived
first. If the single newest entry plus preamble and fresh Evidence still exceeds 150
lines, `record` exits non-zero with an actionable error and leaves the journal unmodified,
guaranteeing that `record` never produces an invalid journal over 150 lines.

The 30-journal cap is evaluated across the Git index (`git ls-files --cached --others --exclude-standard`).
Decommissioning a session journal is a three-step procedure:
1. `node .ai/bin/protocol-archive.cjs worklog <path> --keep 0` (move all entries to `.ai/ARCHIVE.md`)
2. `node .ai/bin/protocol-session.cjs prune` (quarantine the empty journal)
3. `git add -A -- <removed-path>` (stage the removal in the index, keeping the index count <= 30)

If the emptied journal is still inside `RECENT_WINDOW`, `prune` defers it (recent empty journals are preserved); for a deliberate removal of a journal you have just emptied, run `prune --force`, which overrides the recency window for empty, non-live journals.

When a second batch is archived into an existing `.ai/ARCHIVE.md`, the boundary entry's canonicalized body must hash-match its `- entry:` label. This boundary canonicalization deviation was resolved and is pinned by `tests/archive.test.cjs` ("P5-F2: second batch boundary in ARCHIVE.md remains valid across archive batches and verify --deep"). For historical context and proofs, see `docs/reviews/2026-09-18-deepseek-flash-p5-gate-review.md`.

### Review modes, capability model, and verdict vocabulary (PROTO-DEC-0041)

Reviews under `docs/reviews/` (or host owner-selected in-repository review paths for installed projects) operate in one of two modes:
- **CERTIFYING**: Requires four orchestrator-verified capabilities: `FS_WRITE`, `SHELL_EXEC`, `EVIDENCE_SIGN`, and `REPO_READ`. The review header declares `Mode: CERTIFYING` and identifies its session via `Receipt-Owner: <owner-id>` (or legacy `Session:`). The reviewer binds its verdict by recording verifiable handoff evidence in its session journal mentioning the review document path.
- **ADVISORY**: Applied whenever any capability is absent (e.g. read-only models, chat panels, or external audits). Advisory reviews carry `Mode: ADVISORY` (or `[MODE: READ-ONLY ADVISORY]`), are persisted via the section 5.5 chat transcription fallback, and are explicitly marked non-certifying. An advisory review cannot satisfy the independent-review completion gate.

#### Closed verdict vocabulary (forward-only from 2026-09-20)
For new review artifacts cited by completion gates with `Date > 2026-09-20`, exactly one verdict token is permitted:
`PASS | RECOMMENDATION | FAIL | BLOCKED`.
- Explanations belong in the body of the review, never appended to the verdict token.
- Conditional approvals or reservations are expressed as `FAIL` with an explicit list of required conditions.
- A mandatory open defect must receive `FAIL`.
- An absent required check, inaccessible environment, or missing capability must receive `BLOCKED`.
- `RECOMMENDATION` is reserved strictly for optional, non-blocking improvements.
- **Historical artifacts and gate enforcement**: History is append-only and never rewritten; historical review artifacts dated on or before `2026-09-20` remain permanently valid as historical records and are never edited in place. The completion gate, however, strictly validates the exact verdict token (`PASS` or `RECOMMENDATION`) for any review artifact it evaluates, regardless of the artifact's date (only `Mode` and `Receipt-Owner` possess legacy grandfathering warnings). Therefore, if a historical review with a non-standard verdict token is ever cited by a new completion gate, it must be reissued as a new dated artifact rather than modified in place.
- **Scale of historical divergence**: A point-in-time repository census taken at the adoption of PROTO-DEC-0041 (evaluating exact trimmed token equality after stripping bold markers) found that about half of existing review artifacts carrying a `Verdict` line matched the closed set (56 exact vs 59 non-exact across 57 distinct custom forms; later censuses vary with tree evolution).

#### Review composition, independence, and parallelism
Review staffing scales with task risk:
- **Low risk** (documentation, config outside core/security/data): Implementer + 1 independent reviewer.
- **Normal risk** (product code outside high risk): Implementer + independent reviewer per block + independent integration pass.
- **High risk** (protocol core, security, data, invariants, upgrade/migration paths): Implementer + block reviewers + **no fewer than two parallel independent** reviewers on final verification, with the certifier operating outside execution and control.

Core invariants governing review execution:
1. **Certification independence**: A `CERTIFYING` verdict on a high-risk candidate may not be issued by the author, the executor, the controller of that candidate, or any member of the executing pair.
2. **Controller ≠ certifier**: The coordinator/controller shapes tasks, dispatches waves, and may review other independent work, but may never certify what it directed or controlled. This resolves the DeepSeek-as-interface dilemma: the interface role is preserved, but the right to certify its own management is denied.
3. **Mandatory parallelism**: Primary reviewers within a verification pass receive the identical input package, work concurrently, and do not read each other's findings before recording their own. (Scientific basis: Kaesberg et al., ACL Findings 2025: response diversity enhances accuracy, whereas discussion rounds before voting reduce it).
4. **Distinct mandates**: When two or more parallel reviewers are assigned, each is given a distinct angle of attack (e.g., reproducibility and evidence; contracts and edge-case boundaries; governance and scope compliance). Identical mandates duplicate findings and waste resources.
5. **No brand trust**: Roles in `.ai/TASK.md` designate functional slots, not model brands. Capability for `CERTIFYING` is determined by operational environment (filesystem access, shell execution, evidence signing), never by the model title in a report header.
6. **Third reviewer rule**: A third reviewer is added only for an uncovered risk, contradicting reproductions, or an explicit owner directive (PROTO-DEC-0041 item 2). General curiosity is not a valid basis.
- Core team composition: DeepSeek, Claude, GPT/Codex, Gemini (operational rationale: three CLIs, DeepSeek as user interface, all four integrated; owner budget decision, not a claimed statistical optimum).

### Gate freshness check

When a task is marked `Status: Completed`, `node .ai/bin/protocol-handoff.cjs gate-check` (invoked by `validate-protocol.ps1` in `role: source`) enforces that the completion gate's independent review is genuinely bound to a verified session:
- **Binding rule**: The review header specifies `Receipt-Owner: <owner-id>` (or `Session:`). That owner's journal (`.ai/worklog/<owner-id>.md`) must contain a dated entry explicitly mentioning the cited review path (normalized forward slashes), and that entry's Evidence block must verify against the current tree via deep receipt check (`verify --deep`).
- **Legacy cutoff (`2026-09-19`)**: Legacy grandfathering applies strictly to reviews with a valid, present `Date <= 2026-09-19`; omitting `Mode` or `Receipt-Owner` emits a warning (`[WARN]`) rather than failing validation, provided their evidence verifies. Reviews dated after `2026-09-19` strictly require `Mode: CERTIFYING` and `Receipt-Owner`. A missing or invalid `Date` fails the gate immediately.
- **Installed role**: In `role: installed`, `gate-check` is skipped by the validator because consumer repositories do not retain protocol session journals.
- **Empty Receipt field**: The `Receipt:` field in the review header is optional and informational; an empty or omitted field passes verification.

### Completion gate and light-path contract (PROTO-DEC-0038, Wave C)

Tasks marked `Status: Completed` in `.ai/TASK.md` must satisfy the completion gate evaluated by both PowerShell (`validate-protocol.ps1`) and Node (`node .ai/bin/protocol-handoff.cjs gate-check`).

- **Strict path (default)**: Required whenever core protocol files, hooks, gates, validators, tests, decisions, or consumer security/data paths are changed. Requires both `- Adversarial review prompt:` and `- Independent review:`. In `role: source`, both files must be located under `docs/reviews/`. In `role: installed`, any safe in-root path is valid. The independent review requires `Mode: CERTIFYING`, `Receipt-Owner: <owner-name>`, header region containing `Reviewer:` and `Verdict:` (`PASS` or `RECOMMENDATION`), and verifiable deep evidence binding in the owner's session journal. The final check of a high-risk candidate requires no fewer than two parallel independent certifiers (PROTO-DEC-0041 item 2), a single reviewer cannot close a high-risk Completed task, and the certifiers must be outside execution and control (item 1).
- **Light path (risk-scaled)**: For low-blast-radius documentation and configuration edits under PROTO-DEC-0038.
  - Requires: `- Scope: docs | config`, `- Baseline: <40-hex sha>`, and `- Independent review: <path>`.
  - **Baseline validation**:
    - The baseline must be an immutable 40 lowercase hex character string matching `^[0-9a-f]{40}$`. Moving references (`HEAD`, branch names, tags, short SHAs, relative refs) are rejected before calling Git, forcing the strict path.
    - The SHA must verify via `git rev-parse --verify <sha>^{commit}` and be confirmed as an ancestor of HEAD via `git merge-base --is-ancestor <sha> HEAD`.
    - The baseline must be recorded in the task dispatch before implementation starts. The reviewer independently confirms that the baseline covers all task work.
    - Missing, unresolved, non-ancestor baselines, or an empty diff against baseline force the strict path.
  - **Evaluation order**:
    1. Raw changed set computed from baseline via `git diff --name-only <sha>` plus untracked `git ls-files --others --exclude-standard`, excluding strictly and only `.ai/worklog/**`, `.ai/runtime/**`, and `.ai/TASK.md`. (The review artifact is NOT excluded here).
    2. Protected paths priority: the raw set is checked against all protected paths (`.ai/**` [except 3], `.claude/**`, `.github/**`, `.codex/**`, `tests/**`, `templates/**`, `docs/decisions/**`, root `AGENTS.md`, `CLAUDE.md`, `protocol-manifest.json`, `validate-protocol.ps1`, `setup-ai-protocol.ps1`, `test-protocol.ps1`, and executable extensions `.ps1`, `.psm1`, `.cjs`, `.mjs`, `.js`, `.ts`, `.sh`, `.bat`, `.cmd`, `.py`). Any match forces the strict path unconditionally; a core edit cannot be hidden by declaring it as the review artifact.
    3. Review exclusion: the independent review artifact is removed from the changed set.
    4. Non-empty check: if the remaining set is empty, strict path is forced (fail-safe).
    5. Scope allowlist: for `Scope: docs`, every file must be under `docs/` (excluding `docs/decisions/`) with `.md`, `.txt`, or `.rst` extension, OR root `README.md` / `CHANGELOG.md`. For `Scope: config`, files must be in `.gitattributes`, `.gitignore`, `.editorconfig`.
  - **Review format**: Header region (before first `---` or `## `) must have `Reviewer:` and `Verdict:` (`PASS` or `RECOMMENDATION`). `Mode: ADVISORY` and transcription markers are rejected.
  - In `role: source`, the review path must be under `docs/reviews/`.
  - **Residual risk**: Baseline is a declaration. The verified baseline is printed on gate success and must be cited in journals and reviews.

### Decision registry

The repository maintains an append-only decision ledger at `docs/decisions/REGISTRY.md` mapping every decision ID to its current lifecycle status (`accepted`, `frozen`, `reopened`, `superseded`), reopen trigger, freeze commit, supersedes link, and evidence reference:
- **Format and status**: The table follows `| id | status | reopen-trigger | frozen-at | supersedes | evidence |`. The effective status of any decision ID is strictly its last appended row. Existing rows are never modified or removed.
- **Trigger taxonomy**: Reopening an accepted decision strictly requires an appended row with an authorized reopen-trigger: `invariant-broken`, `metric-drop`, `new-external-data`, `security-finding`, `owner-directive`, or `higher-source-contradiction` (or `none` for standard acceptance).
- **WARN-first validation**: In `role: source`, `validate-protocol.ps1` runs non-blocking checks emitting warnings (`[WARN]`):
  1. Missing registry (`docs/decisions/REGISTRY.md`).
  2. Incomplete coverage (missing registry entries for IDs in `.ai/DECISIONS.md`, or unrecognized IDs in the registry).
  3. Immutability violation (modifications or deletions of existing rows relative to `HEAD:docs/decisions/REGISTRY.md`).
  4. New decision block without `Reopen-trigger:` (any new decision ID present in working copy `.ai/DECISIONS.md` but not in `HEAD` must declare `Reopen-trigger:`).
- **Shared-document lock**: Modifications to `docs/decisions/REGISTRY.md` are covered by the shared-document lock protocol (`protocol-lock.cjs`).

### Context digest (optional, on demand)

1. **Purpose**: A compact orientation artifact for every assistant (MCP-capable or not), so repeated whole-kernel reading is replaced by one on-demand file. The digest is advisory: never auto-injected into SessionStart, never cited in Evidence, never a gate input.
2. **Exact command (pinned)**:
   ```bash
   npx -y repomix@1.18.0 --include ".ai/bin/**,validate-protocol.ps1,test-protocol.ps1,tests/**" --no-git-sort-by-changes --style xml --output .ai/runtime/kernel-digest.xml
   ```
   Add `--compress` for orientation only. `--compress` is lossy and experimental (tree-sitter signature extraction) and must not be used for implementation or audit work.
3. **Operational rules**:
   - Output lives strictly under `.ai/runtime/` (git-ignored, disposable, and digest-excluded).
   - The file starts with a header naming the source tree digest (`node .ai/bin/protocol-handoff.cjs state`) and the Repomix version (`1.18.0`); discard on mismatch.
   - Absence of the tool degrades silently to normal file reads.
   - No `package.json` or external repository dependencies are added; version pins change only by an owner-approved edit.
4. **Measured sizes**: Core runtime scripts are ~21.8k tokens raw / ~3.9k compressed; full kernel+tests is ~88.1k raw / ~18.2k compressed. Use raw for audits and implementation, and compressed only for orientation.

### MCP and external tooling policy

1. **Advisory only**: Tool, cache, graph or MCP output is never Evidence and never influences a gate; the completion gate must never depend on external state.
2. **At most one MCP server**: At most one MCP server per adoption phase; total tool-schema budget <= 1500 tokens; servers must be local-only, workspace-sandboxed, version-pinned, with network tools disabled (for Repomix: `--mcp --sandbox`).
3. **No automatic installation**: Hooks must never auto-install, download or spawn MCP servers; adoption is an explicit owner-approved configuration per client.
4. **Disposable storage and graceful degradation**: Derived indexes and caches live under `.ai/runtime/` (disposable); capability differences between agents must not change gate weight; when a server is unavailable the workflow degrades to identical gate semantics.
5. **Secret hygiene**: Tool output can carry credentials; the journal scanner is pattern-based only; never paste raw tool output containing secrets into journals or reviews.

### Telemetry and session metrics

Stop hooks emit fail-safe session telemetry to `.ai/runtime/metrics/sessions.jsonl` (`{ts, session, agent, changedFiles, durationSec, firstEditMs, handoffComplete, gitHead}`) with automatic rotation at 1 MB to `sessions.1.jsonl`. Metrics are disposable runtime data, never written into journals, and never cited as Evidence or gate inputs. Every Stop exit records exactly one metrics row, including missing baselines, changed files without journal updates, and secret warnings. Consumers select the first event per session/trial because failed handoffs are now recorded too, and the metric of interest is the initial Stop outcome.

---

## Paired work cycle (PROTO-DEC-0041, PLAN policy)

For multi-assistant workflows using an implementer and reviewer/controller pair (e.g., Gemini and DeepSeek; roles are configured per task by the owner as illustrative examples, never auto-assigned), see `.ai/docs/PAIRED-CYCLE.md` for the authoritative specification.

The architecture organizes collaborative engineering into seven disciplined phases, each with a defined output and checkable exit gate:
- **Phase 0: Frame** (problem, scope, risk class, success criteria, immutable 40-hex baseline, forbidden paths, owner, executor).
- **Phase 1: Diagnosis** (reproduced problem; fact/hypothesis/gap map).
- **Phase 1a: External research** (conditional upon recorded external trigger).
- **Phase 2: Solution** (one recommendation, at most two real alternatives including doing nothing).
- **Phase 3: Plan and adversarial review** (ordered blocks, contracts, tests, rollback; adversarial plan review).
- **Phase 4: Implementation done-checked** (block-by-block implementation + tests + reviewer signoff, followed by an integration pass).
- **Phase 5: Final adversarial audit** (findings ledger against the complete candidate; certifier outside execution and control).
- **Phase 6: Closure and backlog** (reconciled long-term documentation, registered decisions, next backlog items).

### Closed dictionary of terms
- **Phase**: Bounded stage of work with a defined output and a checkable transition gate.
- **Primary pass**: A single evaluation of a specific artifact version against the agreed scope.
- **Discussion round**: Participants submit their position once on a common input packet; the controller issues a disposition.
- **Remediation**: Modification addressing a confirmed defect. Verification of this fix is the subsequent pass, never an unconstrained general council.
- **Independence**: The reviewer is not the author of the change; for high-risk final verification, the reviewer is additionally neither the author of disputed premises nor the controller of execution.
- **Defect**: A unique violation of a verifiable requirement. A verdict, a finding count, or a document count is not a defect.
- **Uncertainty**: Incomplete data or missing capability. Yields `BLOCKED` or an explicit open inquiry, never a confirmed defect and never `PASS`.
- **Verification version**: Concrete Git commit SHA plus working tree status and Evidence receipt digest. A raw `HEAD` reference on a dirty tree is insufficient.

### Execution rules and basis
- **One primary pass per phase**: A repetition is strictly forbidden unless triggered by one of exactly four conditions: (1) confirmed defect; (2) changed candidate or scope; (3) new external information; (4) incomplete closure proof. Repetition is never scheduled in advance.
- **Mapping of owner's 12 stages**: The owner's operational stages map directly onto these seven phases; "audit of results" and "corrective cycles" are repetitions of phases 4 and 5, not separate phases.
- **Scientific foundation**: Kaesberg et al. (ACL Findings 2025: increasing the number of agents improves accuracy, while discussion rounds before voting reduce it); Porter (88 inspections: one reviewer is less effective than two, but two reviewers are no less effective than four; sequential inspections double calendar interval without effectiveness gains). Principle: **pay for width (parallel independent review), not for depth (sequential discussion rounds)**.

---

## Installing and upgrading

Run installation and upgrade commands from the protocol source repository;
the installed project deliberately has no installer. For a new project:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-ai-protocol.ps1 -Target D:\my-project -InitGit
```

For an existing Git repository use the same command without `-InitGit`. Then
open that repository in your agent, follow [Codex hook activation](CODEX.md)
when applicable, and fill `.ai/TASK.md` with the first product objective.

If `AGENTS.md` already holds project-specific rules, normal installation keeps
it. Reconcile those rules with the protocol before using `-Force`; managed
files are replaced on upgrade, with backups. Review `git diff` after installing.

**Measured upgrade behavior**: A plain upgrade (`setup-ai-protocol.ps1 -Target D:\my-project`)
updates `protocol-manifest.json` to the current protocol version (e.g. 1.9.6) and
restores newly added managed files that were missing in the target (such as
`.ai/docs/PAIRED-CYCLE.md`), but deliberately preserves existing managed tooling to avoid
overwriting host modifications. As a result, older managed files (such as `AGENTS.md`
and hook scripts) remain in place, causing a version and content-digest mismatch where
`validate-protocol.ps1` reports exit 1.

Report what has drifted from the canonical version without changing anything:

```powershell
.\setup-ai-protocol.ps1 -Target D:\my-project -Verify
```

To bring the target repository to full parity with the canonical protocol version,
upgrade the managed tooling while keeping the project's own `.ai` state:

```powershell
.\setup-ai-protocol.ps1 -Target D:\my-project -Force
```

`-Force` replaces managed files and keeps backups. It never resets populated
`.ai` state and never discards unrelated project configuration.

---

## What the hooks cost

SessionStart runs once per session. Stop runs after every response, so its cost
is paid continuously and is the one that matters.

Both ask Git what changed and read only those files. A clean tracked file is
identified by the blob hash already in the Git index and is never opened. On a
five-thousand-file repository the Stop hook takes about a third of a second,
nearly all of it Git's own calls. On a repository of 558 files holding 118 MB
the snapshot takes about 120 ms and opens one file.

If a session feels slow, measure before assuming:

```
node .ai/bin/protocol-handoff.cjs state
```

It prints the file count and the digest without running any checks.

---

## Encoding

Every `.ps1` file is ASCII-only. Windows PowerShell 5.1 reads a file with no
byte order mark as the system ANSI codepage, so a non-ASCII character in a
script is silently corrupted, and a script that writes files spreads that
corruption. All other text is UTF-8 without a byte order mark, with LF
endings. `validate-protocol.ps1` enforces both.

---

## When something is wrong

| Symptom                                   | Where to look                          |
| ----------------------------------------- | -------------------------------------- |
| validator reports a failure               | the named file; fix, then rerun         |
| installer refuses to run                  | a missing source file in the manifest   |
| `acquire` reports another owner           | `status`, then the recovery path above  |
| Stop hook keeps asking for an entry       | the entry is missing one of five labels |
| hook says no snapshot for this session    | start or resume the session in this checkout |
