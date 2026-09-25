# VALIDATOR-CALL-GRAPH

- Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367
- Model: deepseek-flash-4.1
- Model-maker: DeepSeek
- Client: Kilo (agent name `deepseek`)
- Effort: unknown (not exposed by this route; owner-assigned slot, tier T8)
- Task-frame / scope-id: task:vmc-r1-a (parent-scope program:validator-migration-council)
- UTC-date: 2026-09-25
- Mode: ADVISORY

Scope: every code path that invokes `validate-protocol.ps1`, duplicates its behaviour, parses its
output or exit codes, or calls PowerShell only to reach validation logic, plus code comments that
state a parity by hand (role file, "Tools"; owner §5). All paths and line numbers are at the
baseline. HISTORICAL material in `.ai/ARCHIVE.md`, `.ai/worklog/*` and `docs/reviews/archive/` is
excluded from the graph (FACT by construction: only live/executable and normative-document sites
are listed; archive quotes are evidence of past behaviour, not callers).

Method (FACT): `git grep` at the baseline for `validate-protocol`, `gate-check`,
`PROTOCOL_SKIP_GATE`, `Protocol OK`, `Protocol BROKEN`, `[PASS]`, `[WARN]`, `[FAIL]`,
`runPowerShell`, `spawnSync`, `powershell`; then full reads of `validate-protocol.ps1`,
`.ai/bin/protocol-handoff.cjs`, `tests/helpers.cjs`, `tests/validator.test.cjs`,
`tests/validator-syntax.test.cjs`, `.github/workflows/protocol.yml`, and targeted reads of the
other named files. Inventory (`git ls-tree`): 503 files at the baseline; the validator corpus of
owner §5 is present and larger than 15 files.

## 1. Direct invocations of validate-protocol.ps1

| # | Caller | Site (baseline) | How | Consumes |
|---|---|---|---|---|
| 1 | `record` (and `record --quick`) | `.ai/bin/protocol-handoff.cjs:25-28, 30-48, 89-107` | spawns `powershell.exe` (`pwsh` off Windows) `-NoProfile -ExecutionPolicy Bypass -File <root>/validate-protocol.ps1`; env `PROTOCOL_SKIP_GATE=1` when quick (`:97`) | exit status only (`runCheck` returns `{name, code, seconds}`); the line `- validate-protocol.ps1: exit N in Ns` is written into the Evidence block (`:130-132`) |
| 2 | regression suite | `tests/helpers.cjs:22-27` `runPowerShell` | spawns `$PROTOCOL_TEST_POWERSHELL` (set to the running shell by `test-protocol.ps1:25`) or `powershell.exe`/`pwsh` | exit status and stdout+stderr; `runPowerShell('validate-protocol.ps1', ...)` in 9 test files: `tests/validator.test.cjs:13`, `tests/validator-syntax.test.cjs:10`, `tests/manifest.test.cjs:63,81,91,132,155`, `tests/registry.test.cjs:10,34`, `tests/review-findings.test.cjs:186,197,213`, `tests/installer.test.cjs:38,232`, `tests/upgrade.test.cjs:24`, `tests/codex.test.cjs:134,143` |
| 3 | CI validation step | `.github/workflows/protocol.yml:28-36` | captures `$output`, fails the job on `$LASTEXITCODE -ne 0` or on `[WARN]`/`[FAIL]` | exit code and the two status tokens (a parser of both) |
| 4 | CI installed-project step | `.github/workflows/protocol.yml:55` | runs the validator copied into the target install | exit code |
| 5 | documented human command | `AGENTS.md:332`, `CLAUDE.md:25`, `QUICKSTART.md:86`, `README.md:80,160`, `CONTRIBUTING.md:16`, `.ai/docs/PROTOCOL.md:41`, `.ai/docs/PAIRED-CYCLE.md:225,256`, `.ai/docs/COPILOT.md:67`, `.ai/docs/GLM.md:78`, `.github/copilot-instructions.md:46` | `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` | the whole printed report and exit code |
| 6 | permission allow-list | `.claude/settings.json:8` | pre-approves the command (not an invocation) | — |
| 7 | test stub, same name | `tests/helpers.cjs:89-92` | under `PROTOCOL_TEST_FAST_CHECKS=1`, `seedProtocol` overwrites the fixture's `validate-protocol.ps1` with a 2-line stub printing the header and `Protocol OK. 0 warning(s).` | fixtures in suites that are not validator-related |
| 8 | record interface test | `tests/handoff.test.cjs:138-165` | installs the protocol, runs `record`, asserts `validate-protocol.ps1: exit 0` in stdout and in the Evidence block | the check line written by `record` |

## 2. Outbound processes the validator itself spawns (its own call edges)

- `git`: `rev-parse --is-inside-work-tree` and `--show-toplevel` (`:168-169`), `ls-files --cached --others --exclude-standard -z` (`:179`), `rev-list --all --count` (`:182`), `show HEAD:docs/decisions/REGISTRY.md` (`:517`), `show HEAD:.ai/DECISIONS.md` (`:535`, `:991`), `check-ignore -q --no-index` x3 (`:913-914`); light path: `rev-parse --verify`, `merge-base --is-ancestor`, `diff --name-only`, `ls-files --others` (`:605-609`).
- `node`: `--version` (`:347`); `--check` on `.ai/bin/protocol-hooks.cjs`, `.claude/hooks/protocol-hooks.cjs`, `.codex/hooks/protocol.cjs` (`:351-357`); `node .ai/bin/protocol-handoff.cjs gate-check --root <root>` (`:876`).
- `bash`: `--version` on Git-Bash candidates (`:405`); `-n` on `.claude/hooks/session-start.sh` and `stop-worklog-check.sh` (`:414`).
- PowerShell (the running shell): `setup-ai-protocol.ps1` self-check via `(Get-Process -Id $PID).Path` (`:1090-1092`), which itself spawns `git` (`setup-ai-protocol.ps1:329-338`) and re-reads the manifest (`:344-358`).
- Reverse edge into Node: the validator is the only caller of `gate-check` at runtime; `gate-check` re-implements the completion-gate logic in Node (`protocol-handoff.cjs:934-1412`). The pair is a cycle: `record` -> validator -> `gate-check`, with `PROTOCOL_SKIP_GATE=1` breaking it during Evidence recording (PROTO-DEC-0032 item 8; `tests/gate.test.cjs:290-291` states the contract).

## 3. Behaviour duplicated, or kept in parity by hand

| # | Site A | Site B | Relation |
|---|---|---|---|
| 1 | `validate-protocol.ps1:88-122` `Test-ProtocolSafePath` | `.ai/bin/protocol-handoff.cjs:890-932` `isSafeInRoot` | Comment at `:889` says "Semantics are identical ... (parity required)". The two are re-implementations: PS rejects `..` anywhere, tests each segment for the reparse attribute bit 1024, then a full-path prefix check; Node uses `lstatSync().isSymbolicLink()` per segment plus `realpathSync`. |
| 2 | `validate-protocol.ps1:583-891` completion gate (light + strict path) | `.ai/bin/protocol-handoff.cjs:934-1412` `gateCheck` | Same algorithm in two languages: scope/baseline parse, raw changed set, protected lists (`validate-protocol.ps1:627-629` vs `protocol-handoff.cjs:1016-1035`), review exclusion, scope allow-lists, header region, Reviewer/Verdict/Mode-ADVISORY/transcribed checks. Node adds Date/Mode-CERTIFYING/Receipt-Owner and receipt binding; PS adds the "unified adversarial" phrase and TASK-cited-review checks. |
| 3 | `validate-protocol.ps1:304-316` line limits and `:66-72` `Get-LineCount` | `.ai/bin/protocol-archive.cjs:224-231` limits and its `getLineCount` | Comment at `:225-226`: "Kept in step with validate-protocol.ps1. When these two disagreed, `status` reported a limit the validator did not enforce." |
| 4 | `validate-protocol.ps1:954-986` installed `contentDigest` verification | `setup-ai-protocol.ps1:250-262` digest production | Comment at `setup-ai-protocol.ps1:342-343`: one manifest "read here and by validate-protocol.ps1"; the installer writes `sha256:` of the source bytes, the validator recomputes for `role: installed`. |
| 5 | manifest-derived required set (`validate-protocol.ps1:130-153,200-213`) | `tests/helpers.cjs:73-94` `seedProtocol` | Fixtures derive their file set from the same manifest (`managed` + `source` + `tests` + `integration`), a third consumer that must agree. |
| 6 | protected-path concepts | `.ai/bin/protocol-scope.cjs:12-28` `STANDING_DEFAULT_FORBIDDEN` (includes `validate-protocol.ps1:21`) | Rulebook check 3/4 repeats the protected/forbidden-path concept in a third implementation. |
| 7 | `.ai/bin/protocol.cjs:40-155` `doctor` | validator | Overlapping checks (Node, Git, PowerShell presence, manifest presence, managed docs presence, lock, journal Merkle). Separate tool, no call edge either way. |

## 4. Parsers of output and exit codes

- Exit codes: `tests/validator.test.cjs:18-29` (`status === 0`, `status === 1`), `tests/validator-syntax.test.cjs:14-25` (same), `tests/review-findings.test.cjs:187,198,214`, `tests/registry.test.cjs:35,45`, CI `protocol.yml:33`.
- Status tokens `[PASS]`/`[WARN]`/`[FAIL]`: CI `protocol.yml:33`; test message assertions across the validator suites (e.g. `validator.test.cjs:43,54,60`); no other live consumer greps the tokens (FACT: `git grep` finds only CI and tests).
- Final summary line: `tests/registry.test.cjs:37` matches `/Protocol OK\. 0 warning\(s\)\./`; humans and reviews quote it as acceptance evidence (e.g. `docs/reviews/2026-09-23-claude-batch-certification.md:40`); `docs/reviews/2026-09-23-claude-batch-certification.md:120` quotes `Protocol BROKEN. 1 failure(s), 0 warning(s).`
- Evidence line: produced at `protocol-handoff.cjs:130-132`; constructed by hand in `tests/handoff-chain.test.cjs:162,305,...` and `tests/handoff.test.cjs:79,85,112`; asserted at `tests/handoff.test.cjs:146,150,165`. `MEASUREMENTS.md M-01` counts 240 such lines, so the exact `name: exit N in Ns` form is the de-facto measurement interface.
- Documented semantics: `.ai/docs/PROTOCOL.md:404-408` ("reports exit 1"), `AGENTS.md:332-333` (commands), `docs/core-arch/PROPOSAL-node-validator.md:49` (a future engine must reproduce "the same output lines ... and exit codes").
- `-Quiet`: hides `[PASS]` only (`validate-protocol.ps1:19-28`); used by tests (`validator.test.cjs:13`, `manifest.test.cjs:63`, `registry.test.cjs:10`, `review-findings.test.cjs:186`) and by review commands (e.g. `docs/reviews/2026-09-23-claude-batch-certification.md`).

## 5. PowerShell reached only to obtain validation logic

- `record --quick` spawns PowerShell for the validator and nothing else: `CHECKS` is `[{validate-protocol.ps1, quick:true}, {test-protocol.ps1, quick:false}]` (`protocol-handoff.cjs:25-28`), and on `role: installed` only the quick check exists (`:43`).
- The whole test suite reaches validation through `runPowerShell` (`tests/helpers.cjs:22-27`); `test-protocol.ps1:25` points it at the current shell.
- CI runs every check under `shell: powershell` (`protocol.yml:29,39,46,50,59`).
- Effect of a no-PowerShell host: `powershell()` falls back to `pwsh` off Windows (`protocol-handoff.cjs:89-92`); a spawn error aborts `record` (`:105`). Observed in `docs/core-arch/PROPOSAL-node-validator.md:26-27` (`spawnSync pwsh ENOENT` in cloud session `claude-ad7cc4169e888ea8`, quoted by the proposal; the proposal is not a decision).
- Two operations genuinely need a PowerShell process: (a) the PowerShell parser check (`validate-protocol.ps1:237-245`, `Parser::ParseFile`); (b) the installer self-check (`:1085-1102`). Everything else the validator executes is `git`, `node`, `bash` or filesystem work.

## 6. Comments that state a parity or a coupling by hand (part of the graph)

- `protocol-handoff.cjs:889` — "Semantics are identical to Test-ProtocolSafePath in validate-protocol.ps1 (parity required)".
- `protocol-archive.cjs:225-226` — limits "kept in step with validate-protocol.ps1".
- `setup-ai-protocol.ps1:342-343` — one manifest read by installer and validator; `:250-253` — "The validator compares these".
- `validate-protocol.ps1`: `:127-129` (required set from the manifest, DEC-0012), `:161-162` (linked worktree `.git` file), `:191` (inspect ignored core state), `:196-199` (ownership is manifest plus owned dirs), `:249-250` (journal growth, AGENTS.md section 8, PROTO-DEC-0037/0057), `:256-257` (corpus budget, PROTO-DEC-0057), `:362-363` (Codex trust store vs repository definition), `:392-393` (Windows system32 bash may be WSL), `:580-582` (completed-task gate, AGENTS.md), `:597-600` (risk-scaled gate, C40-01..05), `:893-896` (hooks are the part that runs unasked), `:909-911` (ignore rules asked of Git, not read), `:925` (one version, three files, DEC-0021), `:948-953` (content digest), `:988-989` (append-only decisions, DEC-0021), `:1061-1062` (journal ownership cannot be enforced inside one checkout), `:1086-1089` (installer self-check closes a false-green gap), `:1104-1108` (exit contract).
- `tests/helpers.cjs:62-71` — which suites must use the real validator under fast checks.

## 7. Checked and excluded (no validator edge)

- `.ai/bin/protocol-hooks.cjs` — no invocation; `:655` only tells the user to run the validator when the hook itself fails. SessionStart/Stop run Node only.
- `.ai/bin/protocol-session.cjs`, `protocol-lock.cjs`, `protocol-index.cjs`, `protocol-ledger.cjs`, `protocol-verdict.cjs` — no invocation, no output parsing; `protocol-verdict.cjs` and `protocol-scope.cjs` use `git` directly.
- `.claude/hooks/protocol-hooks.cjs` and `.codex/hooks/protocol.cjs` — thin re-exports of `.ai/bin/protocol-hooks.cjs`.
- `setup-ai-protocol.ps1` — never invokes the validator; tests and CI run the validator after an install.
- `docs/core-arch/**` (`PROPOSAL-node-validator.md` is the proposal under test) and `docs/specs/**` — documents, not callers.

## 8. Facts with immediate design weight (for zones B and C)

- FACT: the graph is cyclic. `record` -> validator -> `gate-check` (Node), and `gate-check` re-implements part of the validator. Any port that moves the validator to Node must decide how this cycle collapses; leaving both halves in two engines keeps the parity burden that reviews already caught drifting (`docs/reviews/2026-09-20-claude-paired-cycle-wave-c-re-review.md:40-41`, findings F-3 and F-4).
- FACT: three live parsers depend on the output/exit contract (CI, tests, Evidence-line consumers), and one consumer (`record --quick`) depends on `PROTOCOL_SKIP_GATE=1`.
- FACT: the validator's own runtime cost is dominated by process spawns it makes per run (git ~8-12, node 5, bash 3-4, plus the installer self-check), not by the check code; `MEASUREMENTS.md M-06` counts 201 validator calls per suite at 2.91 s each.
- INFERENCE: the installer self-check inside the validator is the largest hidden coupling to migrate: it makes the validator a launcher of the PowerShell installer, and the installed-role digest contract (`setup-ai-protocol.ps1:250-262`) is its other half.
