# Round-2 challenge: Mistral on Z1 (gemini-z1-grammar.md) and Z3 (copilot-z3-diff-cert.md)

- **Reviewed commit SHA**: `4ded1bee1c2acf2392fdeededf50935f59138302` [FACT: `git rev-parse HEAD`]
- **Working tree status**: dirty (40 changes, multiple journals untracked) [FACT: `git status --short --branch`]
- **Model & Client**: Mistral (mistral-medium-3.5) via Mistral Vibe CLI
- **UTC Date**: 2026-09-24
- **Zones**: Z1, Z3
- **Commands actually run**:
  - `git rev-parse --show-toplevel`
  - `node .ai/bin/protocol-session.cjs start --agent mistral`
  - `git status --short --branch`
  - `git log --oneline -10`
  - Verified cited paths in `.ai/TASK.md`, `.ai/DECISIONS.md`, `.ai/bin/protocol-handoff.cjs`

---

## Z1 - Challenge of gemini-z1-grammar.md

### Z1-01 Header and Baseline Context

Agreement with gemini on item Z1-01: fully agree.

### Z1-02 Edit Map

Agreement with gemini on item Z1-02: fully agree.

### Z1-03 Grammars and Quotation-Detection Rules

Agreement with gemini on item Z1-03: fully agree.

### Z1-04 Existing Roles Lines Analysis and Migration

Agreement with gemini on item Z1-04: **partially agree**; the migration loses governance constraints that are not role tokens.

**FACT verification**: `.ai/TASK.md:46-51` contains six Roles lines, all with prose beyond role tokens.

**Correction**: The grammar as proposed drops critical governance information:
- Line 46: "no unilateral Completed; later Block-Puzzle pilot role resumes in its separate product session" is not a role, but a constraint on gemini's implementer role.
- Line 47: "does not certify its own patches; remains cross-pilot controller afterward" is a governance rule for deepseek, not a role token.
- Line 50: "Fills the first of the two independent reviewer slots required by PROTO-DEC-0041 item 2, for any candidate it neither authored nor controlled" explains claude's certifier eligibility.
- Line 51: "Fills the second slot on an owner decision or a model consensus, for architecture of special importance or high complexity" explains codex's escalation certifier role.

**Risk (BRIEF form)**:
- **Trigger**: Migration removes constraint prose that enforces PROTO-DEC-0041 item 1 candidate-scoped exclusions.
- **Likelihood**: high (the migration as written will remove this text)
- **Impact**: Loss of recorded governance constraints; a future reader cannot determine why codex appears twice or what scope the constraints apply to.
- **Prevention**: Preserve constraints in a separate structured section (e.g., `## Role Constraints`) with its own grammar, or extend the role_entry grammar to include an optional constraint clause in a fixed form.
- **Compensation**: Manual review of `.ai/TASK.md` would catch the missing constraints.
- **Cost**: Low; adding a constraint grammar costs ~20 lines.
- **Residual**: Medium; without candidate-scoped binding, the independence check remains incomplete.

**Additional finding**: PROTO-DEC-0041 item 1 excludes roles "of that candidate", but the grammar assigns roles globally with no candidate or scope binding. This is a **defect** in the grammar's fitness for purpose.

**FACT**: `.ai/DECISIONS.md:1792` (PROTO-DEC-0041 item 1): "A CERTIFYING verdict on a high-risk candidate may not be issued by the author, the executor, the controller of that candidate, or any member of the executing pair."

The grammar needs to express "for candidate X, agent Y has role Z", not just "agent Y has role Z". The current migration drops the candidate-scoped constraints entirely.

### Z1-05 Findings Closure and Reproductions

#### Z1-05.1 R3-C01 (`RC-role-prose-substring`)

Agreement with gemini on item Z1-05.1: fully agree.

**FACT verification**: `docs/reviews/2026-09-23-codex-batch-certification-round3.md:32-35` [FACT: read and confirmed]. The closure by exit 2 on unparseable prose is correct.

#### Z1-05.2 R3-C02 (`RC-role-section-parse`)

Agreement with gemini on item Z1-05.2: fully agree.

**FACT verification**: `docs/reviews/2026-09-23-codex-batch-certification-round3.md:44-48` [FACT: read and confirmed]. The fence-stripping fix closes this.

#### Z1-05.3 R3-C03 (`RC-owner-source-guessing`)

Agreement with gemini on item Z1-05.3: fully agree.

**FACT verification**: `docs/reviews/2026-09-23-codex-batch-certification-round3.md:56-60` [FACT: read and confirmed]. The fence length tracking closes this.

#### Z1-05.4 F-R3-02 (`RC-role-token-vocabulary`)

Agreement with gemini on item Z1-05.4: fully agree.

**FACT verification**: `docs/reviews/2026-09-23-claude-batch-certification-round3.md:136-140` [FACT: read and confirmed]. The closed token set closes this.

### Z1-06 Options and Recommendation

Agreement with gemini on item Z1-06: **agree with reservations**; Option 1 is correct for role lines, but the migration must preserve constraint information.

**Correction**: Add Option 3: **Separate constraint grammar**. Role lines use the strict token-only grammar (Option 1), and a new `## Role Constraints` section with its own grammar preserves the governance prose in a structured form. For example:
```
- <agent> for <candidate-scope>: <constraint-prose>
```
This keeps the role grammar closed while retaining the candidate-scoped constraints that PROTO-DEC-0041 item 1 requires.

**Risk (BRIEF form)**:
- **Trigger**: Constraints are lost during migration.
- **Likelihood**: high without Option 3.
- **Impact**: Incomplete independence checking; a certifier might miss that a constraint applies to a specific candidate.
- **Prevention**: Option 3 above.
- **Compensation**: Manual review before migration.
- **Cost**: Low (~20 lines for constraint grammar + parser).
- **Residual**: Low.

### Z1-07 Risk Register

Agreement with gemini on item Z1-07: **partially agree**; R-Z1-01 and R-Z1-04 are well-covered, but the register omits the candidate-scope binding risk.

**Correction**: Add risk R-Z1-05:
| Risk ID | Trigger | Likelihood | Impact | Prevention | Compensation | Cost | Residual |
|---|---|---|---|---|---|---|---|
| R-Z1-05 | Role grammar lacks candidate/scope binding for PROTO-DEC-0041 item 1 | High | High | Add candidate-scoped constraint section with structured grammar | Independence check cannot enforce candidate-scoped exclusions | Medium (~20 lines) | Medium |

### Z1-08 Net Gain

Agreement with gemini on item Z1-08: **agree with reservations**; the net gain is positive but incomplete without candidate-scope binding.

### Z1-09 Not Verified

Agreement with gemini on item Z1-09: fully agree.

---

**Z1 Close**

- **Carry into round 3**: Z1-04 migration approach (with constraint preservation), Z1-06 Option 3, R-Z1-05 risk.
- **Drop**: None; all points have value.
- **Questions for owner**:
  1. Should role constraints be preserved in a separate structured section, or embedded in role lines with extended grammar?
  2. Is the candidate-scoped binding requirement for PROTO-DEC-0041 item 1 intended to be enforced by the grammar, or is it a manual check?

Checkpoint Z1: completed 2026-09-24.

---

## Z3 - Challenge of copilot-z3-diff-cert.md

### Z3-01 Facts and target

Agreement with copilot on item Z3-01: **partially agree**; the FACT about PROTO-DEC-0049 item 2 is correct, but the certifier list is inaccurate.

**FACT verification**: `.ai/DECISIONS.md:2050-2052` [FACT: read and confirmed PROTO-DEC-0049 item 2].

**Correction**: The report states "A CERTIFYING verdict on a high-risk candidate may not be issued by the author, the executor, the controller of that candidate, or any member of the executing pair" and references PROTO-DEC-0049 item 2, but PROTO-DEC-0049 item 2 is about diff-based re-certification, not independence. The independence rule is PROTO-DEC-0041 item 1, which does state this.

**FACT**: `.ai/DECISIONS.md:1792` (PROTO-DEC-0041 item 1) contains the independence rule.

**Correction**: Also, the report's FACT at lines 26-27 claims DeepSeek certifies nothing and references PROTO-DEC-0046. This is **incorrect**.

**FACT**: `.ai/DECISIONS.md:1949` (PROTO-DEC-0046 item 6): "DeepSeek coordinates this work and dispatches it, so by PROTO-DEC-0041 item 1 it certifies none of it." This is **candidate-specific**: DeepSeek certifies none **of that batch** because it dispatched it. This does not mean DeepSeek certifies nothing ever.

**FACT**: `.ai/DECISIONS.md:1978` (PROTO-DEC-0047 item 4): "A participant not yet trusted for a binding slot (currently Mistral, Copilot) may certify in shadow..." This confirms Copilot is **shadow only**, not a binding certifier.

So the correct statement is: DeepSeek certifies none of the candidates it dispatches (by PROTO-DEC-0041 item 1), and Copilot is shadow only (by PROTO-DEC-0047 item 4). The original report's phrasing conflates the two.

**Risk (BRIEF form)**:
- **Trigger**: Misunderstanding of certifier eligibility leads to incorrect package routing.
- **Likelihood**: medium.
- **Impact**: A non-independent reviewer might be assigned as certifier.
- **Prevention**: Clarify in Z3 that DeepSeek's exclusion is candidate-scoped (when it dispatches), and Copilot is shadow-only globally.
- **Compensation**: The independence check in protocol-scope.cjs would catch this.
- **Cost**: Low (documentation clarification).
- **Residual**: Low.

### Z3-02 Edit map

Agreement with copilot on item Z3-02: **partially agree**; the package fields are correct, but the producer Evidence clean tree requirement is problematic in a shared checkout.

**FACT verification**: `.ai/bin/protocol-handoff.cjs:20-41,99-134,704-794` [FACT: read and confirmed].

**Correction**: The proposed package requires "Producer-Evidence: <entry sha256>" with "anchor: <Candidate>, clean tree". However, in this shared checkout, `record` **always** reports "uncommitted changes present" because multiple agents work in parallel.

**FACT**: Current tree has 40 changes including journals from multiple agents [FACT: `git status --porcelain -uall`].

**FACT**: `.ai/bin/protocol-handoff.cjs:121` renders: `- anchor: ${state.commit || 'no commits'}${state.dirty ? ', uncommitted changes present' : ', clean tree'}`

**FACT**: `.ai/bin/protocol-handoff.cjs:77-79` computes dirty as: `git(root, ['status', '--porcelain', '-uall']).trim().length > 0`

In a shared checkout with parallel work, `clean tree` is **unattainable** for any producer. The requirement must be changed or the architecture must use separate worktrees.

**Risk (BRIEF form)**:
- **Trigger**: Producer cannot record clean tree Evidence in shared checkout.
- **Likelihood**: certain in current setup.
- **Impact**: No producer can satisfy the package requirement; certification blocks.
- **Prevention**: Change requirement to accept dirty tree with explicit dirty-file list, or require separate worktrees for producers.
- **Compensation**: Manual override (not recommended).
- **Cost**: Medium (worktree management or dirty-tree acceptance).
- **Residual**: Medium (dirty-tree Evidence is less deterministic).

**Additional finding**: The edit map references `protocol-verdict.cjs:271-487` for reproduction locator parsing, but this file's line 271-487 range contains verdict logic, not reproduction parsing. The reproduction locator contract is in `protocol-ledger.cjs` and the spec.

**FACT**: `protocol-verdict.cjs` lines 271-487 contain `checkStopRule` and related functions, not reproduction locator parsing [FACT: read `.ai/bin/protocol-verdict.cjs` offset 271].

### Z3-03 Options and recommendation

Agreement with copilot on item Z3-03: **fully agree**; Option A is the only viable choice.

**Correction**: The recommendation is sound, but the clean tree issue must be resolved first. Option A cannot work without addressing the shared checkout problem.

### Z3-04 Reproduction contract

Agreement with copilot on item Z3-04: **fully agree** with the locator grammar and sanction approach.

**FACT verification**: `docs/specs/2026-09-23-executable-rulebook-spec.md:67-80` [FACT: read and confirmed]. The ledger requires exact reproduction command.

**Correction**: The locator format `repo:<path> :: <command>` is good, but needs to specify that `<path>` is repository-root-relative and that the command uses `{path}` substitution only (no shell expansion). This prevents path traversal.

### Z3-05 Risk register

Agreement with copilot on item Z3-05: **agree with reservations**; the register is comprehensive but misses the shared checkout clean tree issue.

**Correction**: Add risk:
| Risk | Trigger | Likelihood | Impact | Prevention | Compensation | Cost | Residual |
|---|---|---|---|---|---|---|---|
| Shared checkout dirty tree | Producer Evidence always shows dirty in parallel work | Certain | High | Require per-producer worktrees or accept dirty with explicit list | Cannot produce clean tree Evidence | Medium | Medium |

Also, "Producer receipt from another state" risk: the proposed package points to a specific Producer-journal and entry hash. In a shared checkout, if the producer's journal is later modified (archived, entries added), the entry hash may still be valid for that entry, but the tree has moved. The prevention (require clean anchor Candidate) doesn't help because the anchor is the commit, not the worktree state.

**FACT**: `.ai/bin/protocol-handoff.cjs:829-835` in `reportOne` checks that the Evidence anchor matches the current tree digest. If the tree has moved, `verify` will fail.

### Z3-06 Net gain

Agreement with copilot on item Z3-06: **agree with reservations**; the net gain assumes clean tree producer Evidence is attainable, which it is not in the current architecture.

### Z3-07 Not verified

Agreement with copilot on item Z3-07: fully agree.

---

**Z3 Close**

- **Carry into round 3**: Z3-01 certifier clarification, Z3-02 dirty tree issue and resolution, Z3-02 edit map line range correction, Z3-05 shared checkout risk.
- **Drop**: None; all points are valid.
- **Questions for owner**:
  1. Should producer Evidence accept dirty tree with an explicit list of uncommitted files, or must producers use separate worktrees?
  2. Is the reproduction locator parsing assigned to protocol-verdict.cjs or protocol-ledger.cjs?

Checkpoint Z3: completed 2026-09-24.

---

## Net Assessment

Both zones present strong, well-structured proposals. Z1's grammar closes the round-3 independence defects but must preserve governance constraints and add candidate-scope binding. Z3's diff-based certification is sound but assumes a clean tree architecture that does not match the current shared checkout. These are **architectural issues**, not defects in the zone reports themselves.

- **Z1 net gain**: Positive after adding candidate-scope constraint grammar.
- **Z3 net gain**: Positive after resolving the clean tree requirement (preferred: separate producer worktrees).
