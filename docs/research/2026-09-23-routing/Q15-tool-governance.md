# Q15 - Tool governance: skills, MCP servers and connectors

- Question: governance of skills, MCP servers and connectors at project, task-class and session level.
- Primary: copilot. Challenger: mistral. Date: 2026-09-23.
- Commit SHA: `89ce192bf6923d00b0328378be8c4b73fd47234b` (`git rev-parse HEAD`).
- Working tree: dirty (`git status --short --branch`).
- Inventory commands actually run: `node .ai/bin/protocol-session.cjs start --agent copilot`; `git status --short --branch`; `git log --oneline -10`; `git rev-parse HEAD`; `git ls-files`; read-only `Get-ChildItem` config inventory; `agy mcp list`; read-only PowerShell structural parsers for Claude, Codex, Kilo and vibe; `git -C <repo> ls-files | Measure-Object -Line` for four repositories.

## 1. Decomposition

1. Inventory the active client surfaces without activating or installing anything.
2. Separate project defaults, task-class policy and session overrides.
3. Measure schema-token tax, invocation/fallback/duplicate-read costs and quality.
4. Preserve protocol authority: external output can assist retrieval, never decide completion.
5. Define a reversible A/B trial and owner-only forks.

## 2. Essential factors

- **FACT**: Native-only is the control at zero schema tokens and zero daemons; the routed alternative is zero MCP by default, one replacement backend, then a confirming native slice (`docs/reviews/2026-09-20-mcp-council-final-round2-synthesis.md:35-37`).
- **FACT**: The policy must be default-deny with a project allowlist; a description justifies a trial, not activation. Activation must be explicit, version-pinned, sandboxed and removable.
- **FACT**: “Enabled” is not the same as “paid schema”: every client needs host-visible `tools/list` bytes/tokens and injection/caching/billing measurement (`docs/reviews/2026-09-20-mcp-council-final-round2-synthesis.md:56-59`).
- **CLAIM**: Skills are lower-risk than MCP only when they are inert instructions or deterministic local commands; a skill that adds connectors, network, writable state or hidden auto-discovery belongs under the MCP policy.
- **HYPOTHESIS**: A task-class allowlist (for example, one read-only symbol retriever for S1) is safer and cheaper than session-global enablement.

## 3. Blind spots

1. **HYPOTHESIS**: Config counts may overstate live tools: a client can ignore, lazy-load or cache descriptions; without `tools/list` and host injection traces, schema cost is UNKNOWN.
2. **HYPOTHESIS**: A zero-config surface may still inherit organization, plugin, environment or account connectors not visible in these files.
3. **HYPOTHESIS**: The Codex “five enabled” anchor may reflect defaults rather than five servers actually invoked; invocation logs and server startup evidence are absent.
4. **HYPOTHESIS**: The 8,627-token Codex user-config tax is not identical to MCP schema tax; it includes the full user configuration and may include non-tool instructions.
5. **HYPOTHESIS**: A replacement-only experiment can still duplicate reads if the client silently re-reads returned paths; duplicate-read volume must be counted, not inferred.

## 4. Evidence

### Zero-cost client inventory

| Client/surface | Read-only result | Schema-token cost |
|---|---|---|
| Claude project | **FACT**: repository `.claude/settings.json` has permissions and SessionStart/Stop hooks, but no MCP server declaration (`D:\Colabs\.claude\settings.json:1-36`). Project `.mcp.json` and user `C:\Users\Dmitry\.claude\.mcp.json` are missing (measured by `Test-Path`, 2026-09-23). | **MEASURED**: 0 configured project MCP schema tokens. **UNKNOWN** for inherited/plugin runtime schema. |
| Claude user/plugins | **FACT**: user settings has `enableAllProjectMcpServers` and `enabledPlugins`; the structural parser saw 169 settings lines and 15 plugin-manifest lines without printing values (`C:\Users\Dmitry\.claude\settings.json:1-169`; `C:\Users\Dmitry\.claude\plugins\installed_plugins.json:1-15`). | **UNKNOWN**: no `tools/list` capture; plugin descriptions are not a schema-token measurement. |
| Codex project | **FACT**: repository `.codex/config.toml` only sets approval/sandbox defaults and no MCP sections (`D:\Colabs\.codex\config.toml:1-8`). | **MEASURED**: 0 project-config schema tokens. |
| Codex user | **MEASURED**: the owner anchor is 11 MCP servers, 5 enabled, including a memory stack with SQLite at 0 bytes (`docs/research/2026-09-23-routing/INDEX-draft.md:106-112`). The user configuration costs 8,627 input tokens/call: 190,204 versus 181,577 with `--ignore-user-config`, about 5.7x the 1,500-token policy budget (`docs/research/2026-09-23-routing/INDEX-draft.md:109-112`). | **MEASURED**: 8,627 input tokens/call for the whole user-config surface. **UNKNOWN**: isolated MCP-description share. |
| Kilo | **MEASURED**: `C:\Users\Dmitry\.config\kilo\kilo.json` is 244 characters, has `$schema` and `provider`, and has no `mcp` or `skills` keys; JSONC exists separately but was not parsed (`C:\Users\Dmitry\.config\kilo\kilo.json:1-11`; `kilo.jsonc:1-30`). | **MEASURED**: 0 configured MCP entries in parsed JSON. **UNKNOWN** for JSONC/plugin runtime schema. |
| agy | **MEASURED**: `agy mcp list` returned “No MCP servers configured” (command run 2026-09-23; no secrets printed). | **MEASURED**: 0 configured MCP schema tokens. |
| vibe | **MEASURED**: `C:\Users\Dmitry\.vibe\config.toml` has 3 lines, no sections and no MCP/server/tool/skill/plugin keys (structural parser, 2026-09-23). | **MEASURED**: 0 configured MCP schema tokens. |

### Repository and policy anchors

- **MEASURED**: tracked-file counts at inventory time were Colabs 324, Block-Puzzle 593, VPN 866 and `Битва за луну` 45 (the command and comparable counts are recorded in `docs/research/2026-09-23-routing/Q12-metrics-logging.md:5`).
- **FACT**: PROTO-DEC-0034 makes external output advisory-only, forbids gate dependence, permits at most one local sandboxed pinned MCP server and caps total schema at 1,500 tokens (`.ai/DECISIONS.md:1552-1556`).
- **FACT**: hooks must not auto-install, download or spawn MCP servers (`.ai/docs/PROTOCOL.md:344-346`).
- **FACT**: the council trial is six tasks minimum, two per S1/S2/S3 stratum, three repetitions, one pinned client/model; S3 is a native-negative-control; adoption thresholds are >=25% broad fresh-token reduction, <=+5% narrow regression, schema <=1,500 and no quality/handoff regression (`docs/reviews/2026-09-20-mcp-council-final-round2-synthesis.md:54-63`).
- **CLAIM**: the memory stack’s empty SQLite layer is evidence of storage state, not evidence that its MCP descriptions cost zero; schema and invocation remain separate measurements (`.ai/DECISIONS.md:1911-1917`).
- **FACT**: the current native-only ruling says no MCP experiment before the product-pilot report (`docs/reviews/2026-09-20-mcp-council-final-round2-synthesis.md:40-43`).

## 5. What history can and cannot support

History supports the zero-cost inventory, the Codex whole-config token anchor, the 1,500-token limit, and a reproducible trial shape. It cannot support per-client schema rankings: no raw `tools/list` capture, host injection trace, invocation denominator, fallback denominator, duplicate-read count or comparable quality set exists. It cannot infer that configured, enabled, discovered and invoked are equivalent. The 8,627 figure is a whole user-config cost, not a measured MCP-only cost.

## 6. Interaction with binding rules

- **FACT**: PROTO-DEC-0034 controls the boundary: no external tool in Evidence or a gate, one local server at most, sandbox/version pinning, 1,500-token cap and native fallback (`.ai/DECISIONS.md:1552-1556`).
- **FACT**: PROTO-DEC-0041 item 1 bars a caller/controller from certifying work it controls; an external connector cannot manufacture independence (`.ai/DECISIONS.md:1855-1859`).
- **FACT**: PROTO-DEC-0036 remains closed for MCP adoption; the owner-approved native-only ruling and no-experiment-now state are recorded (`docs/reviews/2026-09-20-mcp-council-final-round2-synthesis.md:40-43`).
- **FACT**: PROTO-DEC-0036/0044’s deterministic Layers A/B/C are advisory and disposable, never gate inputs (`.ai/DECISIONS.md:1895-1902`).
- **CLAIM**: use the council section-5 template unchanged: one frozen SHA, paired worktrees, replacement-only, raw and host-visible schema tokens, invocation rate, fallback rate, duplicate reads, quality, time, cost, setup amortisation and provenance.

## 7. Interaction with the other 14 questions

**CLAIM**: Q01/Q02 need tool availability and domain fit; Q03/Q04 need requested-versus-applied effort; Q05 needs attempts and fallback reasons; Q06 needs connector boundaries; Q08 needs token/cost ceilings; Q09/Q10 need outage and elapsed-time telemetry; Q11 needs deputy independence; Q12 needs joinable event fields; Q13 needs retention/capacity; Q14 needs architecture and certification constraints. Q07 is the adjacent decision-data question. None can treat a tool’s own output as a gate fact.

## 8. Options

| Option | Cost/time | Risk |
|---|---|---|
| A. Do less: native-only plus project allowlist documentation; no activation. | Zero installs; one documentation pass. | Leaves schema/fallback denominators unknown, but preserves current safety. |
| B. Bounded routed trial: one read-only candidate, one frozen SHA, council template, no gate role. | Moderate setup and three-repetition trial; schema/invocation telemetry required. | Index drift, duplicate reads, daemon failure and client-specific schema inflation. |
| C. Session-global connectors/plugins. | Lowest per-task policy friction; potentially immediate. | Highest blast radius: hidden schema tax, network/state leakage, no clean attribution; reject under current rules. |

## 9. Recommendation, and the forks only the owner can decide

Recommend **A now**: default-deny, native-only, project allowlists empty unless an explicit owner directive names a task class and candidate. Permit forced use only for the protocol’s own deterministic tools; never force an external tool in a gate path. If the owner later selects B, reuse the council template and stop on any threshold breach; descriptions may justify the trial but never activate it.

Owner forks: (1) whether any task class may receive a routed read-only candidate before both product pilots finish; (2) whether plugin/skill installation counts as external tooling when it has no MCP server; (3) whether the owner accepts the whole-config Codex tax as a routing blocker despite unknown MCP-only share; (4) retention and privacy limits for invocation/fallback telemetry.

## 10. Missing data

Raw `tools/list` and host-visible schema tokens for every client; Claude plugin-expanded schemas; Codex exact five active servers and invocation records; Kilo JSONC semantics; connector inheritance from account/org/environment; skill activation logs; per-task invocation, fallback and duplicate-read denominators; quality labels on matched S1/S2/S3 tasks; exact schema-token tokenizer and cache/billing semantics; frozen product-pilot SHA and task manifest.

## 11. Challenge

Challenger: pending


### Challenger's independent blind-spot list (mistral, saved before reading the primary document)

- Zero-cost inventory: does not account for implicit costs (CPU, memory, I/O) that are not monetized but have real resource impact; completeness cannot be verified without auditing every binary in the tool chain.
- Schema-token claims: distinction between measured vs UNKNOWN is not defined; no evidence that UNKNOWN tokens are tracked or surfaced in telemetry; may silently drop schema violations.
- Default-deny + project-allowlist: enforcement mechanism is unspecified; no concrete policy document or gate implementation cited; allowlist scope (per-repo, per-branch, per-agent) is ambiguous.
- "Forced use only for the protocol's own deterministic tools": boundary is not defined; no exclusion list for non-deterministic or external tools; "only" is not enforceable without a blocklist.
- A/B trial metrics: schema tokens, invocation rate, fallback rate, duplicate reads are listed but not tied to PROTO-DEC-0034 item 2 baseline requirements; section-5 template compliance (MCP council) is not demonstrated.
- Unsourced claims: any assertion without a file:line citation is unverifiable; primary may include architectural claims not grounded in code or config.

### Challenger's attack on the primary document (mistral, after reading)

- Line 20 FACT claim: "The policy must be default-deny with a project allowlist" is unsourced. PROTO-DEC-0034 item 2 (`.ai/DECISIONS.md:1552-1556`) mandates at most one sandboxed pinned server with <=1,500 schema tokens, but does NOT require a project allowlist or default-deny enforcement mechanism.
- Line 22 CLAIM: "Skills are lower-risk than MCP only when..." is unsourced and self-contradictory; line 22 immediately states skills with connectors/network/writable state belong under MCP policy, undermining the risk distinction.
- Line 42 MEASURED: Codex "11 MCP servers, 5 enabled" is cited to `INDEX-draft.md:106-112` (a draft, not a primary source). No raw `tools/list` or Codex config file path:line cited; violates the primary's own section 5 template requirement for host-visible schema tokens.
- Line 66 CLAIM: "use the council section-5 template unchanged" but section 5 of `docs/reviews/2026-09-20-mcp-council-final-round2-synthesis.md:56-59` requires raw `tools/list` bytes and tokens + host-visible injection traces, all listed as MISSING in the primary's line 88.
- Line 82 Recommendation: "forced use only for the protocol's own deterministic tools" is unbounded; no exclusion list or enforcement gate cited. "Deterministic" is not defined for tools.
- A/B metrics (line 66) not tied to PROTO-DEC-0034 item 2: schema budget <=1,500 is a hard cap, but the primary lists "schema tokens" as a metric without stating how breaches trigger stop per `.ai/DECISIONS.md:1583-1584`.
- Zero-cost misnomer: line 37 table uses "Zero-cost client inventory" but lines 39-44 show multiple UNKNOWN schema-token costs, contradicting "zero-cost".
- Line 88 Missing data: raw `tools/list` and host-visible schema tokens are required by both PROTO-DEC-0034 item 2 and the council template, yet remain missing; the primary cannot satisfy its own cited requirements.