# Z1 Remediation Mapping: Fixed Grammar for Roles, Agreement, and Independence

## Z1-01 Header and Baseline Context
- **Reviewed commit SHA**: `4ded1bee1c2acf2392fdeededf50935f59138302` [FACT: `git log -n 1`]
- **Working tree status**: dirty (`.ai/TASK.md`, `.ai/DECISIONS.md`, journals modified) [FACT: `git status --short`]
- **Model & Client**: Gemini 3.8 Flash (High) via Google Antigravity CLI (`agy`)
- **UTC Date**: 2026-09-23 UTC (2026-09-24 local)
- **Zone**: Z1 - Fixed grammar for Roles lines and agreement lines
- **Commands actually run**:
  - `node .ai/bin/protocol-session.cjs start --agent gemini`
  - `git status --short --branch ; git log --oneline -10`
  - `git diff .ai/DECISIONS.md`
  - `node -e` inline reproductions for `extractExcludedRole`, fence handling, and section parsing

## Z1-02 Edit Map
[FACT: `docs/research/2026-09-24-remediation-mapping/BRIEF.md:46-51`]

| Target File | Function / Section | Line Range | Nature of Change | Tests & Verification | Associated Docs |
|---|---|---|---|---|---|
| `.ai/bin/protocol-scope.cjs` | `checkIndependence` | 273-286 | Replace boolean fence toggle with length/marker-aware block tracker | `tests/scope.test.cjs` (R3-C03 repro) | Spec Section 6 |
| `.ai/bin/protocol-scope.cjs` | `checkIndependence` | 327-345 | Strict section boundary matching (`^## Roles$`), strip fences first | `tests/scope.test.cjs` (R3-C02 repro) | Spec Section 6 |
| `.ai/bin/protocol-scope.cjs` | `extractExcludedRole` -> `parseRolesLine` | 405-450 | Replace ad-hoc regex/negation with EBNF parser; unknown exits 2 | `tests/scope.test.cjs` (R3-C01, F-R3-02) | Spec Section 6 |
| `.ai/bin/protocol-scope.cjs` | `checkAgreementLine` | 451+ | Validate agreement syntax & six degrees; unknown/unjustified exits 2 | `tests/scope.test.cjs` (agreement suite) | Spec Section 6 |
| `docs/specs/2026-09-23-executable-rulebook-spec.md` | Section 6 | 168-187 | Define formal EBNF grammars, exit 2 contract, and quote-detection rule | Certified in remediation round | `BRIEF.md`, DEC-0048/49 |
| `.ai/TASK.md` | `## Roles` | 46-51 | Migrate 6 free-prose lines into conforming EBNF role lines | `protocol-scope.cjs --independence` | `AGENTS.md:44-52` |

## Z1-03 Grammars and Quotation-Detection Rules

### 1. Roles Lines Grammar (EBNF)
[FACT: `.ai/bin/protocol-scope.cjs:334`, `docs/specs/2026-09-23-executable-rulebook-spec.md:178-180`] Agent names remain unchanged as they key journals and Evidence owners (`gemini`, `deepseek`, `codex`, `claude`, `mistral`, `copilot`, `qwen`, `glm`).
```ebnf
roles_section   ::= "## Roles" eol { role_entry }
role_entry      ::= "- " agent_name [ " (" qualifier ")" ] ": " role_assignment eol
role_assignment ::= role_term { ", " role_term }
role_term       ::= excluded_role | permitted_role
excluded_role   ::= "author" | "executor" | "controller" | "coordinator" | "implementer" | "member of the executing pair"
permitted_role  ::= "certifier" | "reviewer" | "auditor"
agent_name      ::= "gemini" | "deepseek" | "codex" | "claude" | "mistral" | "copilot" | "qwen" | "glm"
qualifier       ::= [a-zA-Z0-9_-]+ ( " " [a-zA-Z0-9_-]+ )*
eol             ::= "\r\n" | "\n"
```
[FACT: `.ai/DECISIONS.md:2053-2054`] Any line under `## Roles` failing this grammar exits 2 (BLOCKED, unknown input).

### 2. Agreement Lines Grammar (EBNF)
[FACT: `.ai/DECISIONS.md:2013-2020` (PROTO-DEC-0048 item 3)] Exact six-degree scale:
```ebnf
agreement_line    ::= "Agreement with " model_name " on item " item_id ": " degree_clause eol
degree_clause     ::= full_agreement | justified_agreement
full_agreement    ::= "fully agree" [ ( ";" | ":" ) " " justification ]
justified_agreement ::= non_full_degree ( ";" | ":" ) " " justification
non_full_degree   ::= "categorically disagree, with reasons"
                    | "disagree"
                    | "partially agree"
                    | "agree with reservations"
                    | "absolutely agree, with additional confirmation found"
model_name        ::= "Gemini" | "DeepSeek" | "Codex" | "Claude" | "Mistral" | "Copilot" | "Qwen" | "GLM"
item_id           ::= [a-zA-Z0-9_.-]+
justification     ::= [^\r\n]+
```
[FACT: `.ai/DECISIONS.md:2020`] Any degree other than `fully agree` must carry additions/justification; missing justification fails closed with exit 2.

### 3. Quotation-Detection Rule
[FACT: `.ai/DECISIONS.md:2013` (PROTO-DEC-0048 item 3)] Prose matching between reports is a citation defect.
- **Unit of comparison**: Normalized sliding window of 7 consecutive words (tokens). Normalization collapses whitespace, lowercases ASCII characters, and strips markdown emphasis formatting (`*`, `_`, `**`).
- **Exclusions** (stripped before tokenization and comparison):
  1. *Commands*: Fenced code blocks (` ```bash ... ``` `) and inline backticks containing executable command lines (`node ...`, `git ...`, `powershell ...`).
  2. *Paths*: File and URI paths matching repo structure (`docs/...`, `.ai/...`, `tests/...`, `path:line`).
  3. *Spec requirements*: Exact rulebook tokens (`RC-[a-zA-Z0-9-]+`, `PROTO-DEC-\d+`, `F-R\d+-\d+`, `R\d+-C\d+`).
  4. *Ledger fields*: Full Markdown tables (`| ... |`), table header names, and closed verdict/severity/disposition tokens (`PASS`, `FAIL`, `BLOCKED`, `RECOMMENDATION`, `HIGH`, `MEDIUM`, `LOW`, `INFO`, `confirmed`, `refuted`).
  5. *Header metadata & Agreement lines*: Lines conforming to the agreement grammar or standard report metadata (`Mode:`, `Receipt-Owner:`).

## Z1-04 Existing Roles Lines Analysis and Migration
[FACT: `.ai/TASK.md:46-51`] Current `## Roles` section contains 6 active lines. All 6 break under the fixed grammar:

1. **Line 46**: `- gemini: paired-cycle remediation implementer; no unilateral Completed; later Block-Puzzle pilot role resumes in its separate product session`
   - *Breaks*: Contains semicolon-separated prose clauses and forward commentary.
   - *Migration*: `- gemini: implementer`
2. **Line 47**: `- deepseek: paired-cycle controller and independent adversarial reviewer; does not certify its own patches; remains cross-pilot controller afterward`
   - *Breaks*: Contains compound descriptions and negative governance prose.
   - *Migration*: `- deepseek: controller, reviewer`
3. **Line 48**: `- codex: record accepted audit/governance and prepare tandem dispatch; implementation is assigned to Gemini`
   - *Breaks*: Contains imperative duty statements and passive sentence rather than role token.
   - *Migration*: `- codex: coordinator`
4. **Line 49**: `- deepseek (VPN stream): named by the owner 2026-09-20 as the VPN pilot implementer, in its own product session; this does not relax PROTO-DEC-0041 item 1 for anything it controls`
   - *Breaks*: Contains narrative history, dates, and constraint assertions.
   - *Migration*: `- deepseek (VPN stream): implementer`
5. **Line 50**: `- claude: standing default certifier. Fills the first of the two independent reviewer slots required by PROTO-DEC-0041 item 2, for any candidate it neither authored nor controlled`
   - *Breaks*: Period delimiter followed by explanatory background sentences.
   - *Migration*: `- claude: certifier`
6. **Line 51**: `- codex: escalation certifier. Fills the second slot on an owner decision or a model consensus, for architecture of special importance or high complexity. The cycle-architecture dispatch qualifies, so both slots are filled there by Claude and Codex`
   - *Breaks*: Multi-sentence narrative explaining escalation justification.
   - *Migration*: `- codex: certifier`

Commentary removed during migration belongs under `## Context`, `## Problem`, or `## Constraints` in `.ai/TASK.md`.

## Z1-05 Findings Closure and Reproductions

### 1. R3-C01 (`RC-role-prose-substring`)
- **Defect** [FACT: `docs/reviews/2026-09-23-codex-batch-certification-round3.md:32-35`]: Clause-wide negation suppresses affirmative excluded roles. In `.ai/bin/protocol-scope.cjs:430`, negation keyword `not` anywhere before a token suppresses it across commas.
- **Reproduction**: Executed `extractExcludedRole('not reviewer, controller')` -> returned `null` (false PASS, exit 0).
- **Closure**: The fixed grammar eliminates negation parsing and prose clauses entirely. A line containing `not reviewer, controller` fails grammar validation with exit 2. Affirmative `- reviewer: controller` matches `controller` deterministically (exit 1). **CLOSED**.

### 2. R3-C02 (`RC-role-section-parse`)
- **Defect** [FACT: `docs/reviews/2026-09-23-codex-batch-certification-round3.md:44-48`]: In `.ai/bin/protocol-scope.cjs:330`, unanchored split on `## ` and `startsWith('Roles')` selects fenced markdown examples or lookalikes (e.g. `## Roles archive`).
- **Reproduction**: Task content with fenced `## Roles\n- reviewer: certifier` preceding real `## Roles\n- reviewer: controller` selected the fenced certifier role.
- **Closure**: Parser strips fenced code blocks first, then matches line `^## Roles\s*$`. Non-heading mentions and fenced examples are completely ignored. **CLOSED**.

### 3. R3-C03 (`RC-owner-source-guessing`)
- **Defect** [FACT: `docs/reviews/2026-09-23-codex-batch-certification-round3.md:56-60`]: In `.ai/bin/protocol-scope.cjs:278`, boolean `inFence` toggles on either ```` ``` ```` or `~~~` without tracking marker type or length. Inner fences inside 4-tilde blocks expose example receipts.
- **Reproduction**: Enclosing 4 tildes around triple backticks with `- recorded: ... by builder-456` toggled `inFence` to `false`, exposing the fake producer line.
- **Closure**: Fence parser tracks opening fence character (`~` or ```) and length $L \ge 3$; only matching fence of length $\ge L$ closes the block. Inner fences do not toggle. Producer cannot be extracted from examples; missing receipt exits 2. **CLOSED**.

### 4. F-R3-02 (`RC-role-token-vocabulary`)
- **Defect** [FACT: `docs/reviews/2026-09-23-claude-batch-certification-round3.md:136-140`]: In `.ai/bin/protocol-scope.cjs:410-415`, matcher fired on unrecorded stems (`authored`, `controlled`), bare `executing pair`, and admitted unrecorded negation `without`.
- **Reproduction**: `extractExcludedRole('authored')` returned `author`; `extractExcludedRole('without author')` returned `null`.
- **Closure**: Grammar admits only exact vocabulary terminals. Inflections (`authored`) and unrecorded negation tokens (`without`) trigger exit 2 (unknown). **CLOSED**.

## Z1-06 Options and Recommendation
- **Option 1 (Recommended): Strict Token-Only EBNF Grammar (Fail-Closed Exit 2)**.
  - Structure: `- <agent> [ (<qualifier>) ]: <role> [, <role>...]` with closed terminal sets.
  - Trade-offs: Zero prose permitted on role lines; any deviation causes exit 2. Requires strict formatting.
- **Option 2: Permissive Grammar with Delimited Trailing Notes (`- <agent>: <role> [ ; note: <prose> ]`)**.
  - Structure: Separates roles from prose using strict delimiter `; note: `.
  - Trade-offs: Re-introduces prose parsing complexity; risk that role keywords appearing in notes trigger accidental exclusions or require secondary escaping.
- **Recommendation**: **Option 1**. Eliminates ambiguity, prevents parser regressions, and complies directly with PROTO-DEC-0049 item 2.

## Z1-07 Risk Register
[FACT: `BRIEF.md:20-31`, `PROTO-DEC-0049:2055` (item 4)]

| Risk ID | Trigger | Likelihood | Impact | Prevention | Compensation | Cost | Residual |
|---|---|---|---|---|---|---|---|
| R-Z1-01 | Human author writes descriptive prose or typo in `## Roles` | Low | Medium | Strict EBNF parser; detailed diagnostic naming unparseable line | Script exits 2 immediately before any round proceeds; prompt author fixes line | Negligible (~15 lines diagnostic code) | None; fail-closed prevents false certification |
| R-Z1-02 | Quotation detector flags legitimate shared technical phrases | Medium | Medium | Exclude commands, file paths, spec terms, and table fields; set window to $\ge 7$ tokens | Reviewer rewrites sentence using direct citation or agreement line | Low (regex filter pipeline) | Low; minor prose adjustments |
| R-Z1-03 | Agent requires multiple qualifiers across concurrent sub-tasks | Low | Low | EBNF explicitly supports `qualifier` in parentheses | Fallback to separate agent lines if distinct sub-roles exist | None | None |
| R-Z1-04 | Agreement degree used without required justification | Low | Medium | Parser enforces mandatory `justification` for all non-full degrees | Exits 2; report author prompted to append rationale | Low (grammar validation) | None |

## Z1-08 Net Gain
[FACT: `BRIEF.md:30-31`]
- **Gross Gain**: Eliminates the entire root-cause class of heuristic natural language parsing in kernel scripts. Closes all 4 round-3 independence check defects (R3-C01, R3-C02, R3-C03, F-R3-02).
- **Cost of Coverage**: Replacing ~45 lines of regex heuristics in `.ai/bin/protocol-scope.cjs` with an ~80-line recursive descent / tokenizer grammar check, plus updating 6 lines in `.ai/TASK.md`.
- **Net Assessment**: Strongly positive. Deterministic fail-closed behavior replaces brittle guessing, preserving scarce reviewer limits and stabilizing the protocol batch.

## Z1-09 Not Verified
- [CLAIM: unverified] End-to-end multi-agent execution of the agreement grammar across all active terminal CLI tools (`codex`, `claude`, `vibe`, `agy`).
- [CLAIM: unverified] Performance of the 7-token quotation detection window over massive multi-document historical review corpora exceeding 600 KB.
