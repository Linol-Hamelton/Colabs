# Round 1, researcher A: semantics, contract, TCB

- Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367
- Model: deepseek-flash-4.1
- Model-maker: DeepSeek
- Client: Kilo (agent name `deepseek`)
- Effort: unknown (not exposed by this route; owner-assigned slot, tier T8)
- Task-frame / scope-id: task:vmc-r1-a (parent-scope program:validator-migration-council)
- UTC-date: 2026-09-25
- Mode: ADVISORY

Labels: FACT / INFERENCE / HYPOTHESIS / OPEN QUESTION. Zone A does not propose the target
architecture (zone B owns it, zone C tests it); this report records the contract and TCB
constraints that any target must satisfy. Companion artefacts: `DECISION-BOUNDARY.md`,
`VALIDATOR-CALL-GRAPH.md`, `VALIDATOR-CONTRACT-MAP.md`. Measurements are cited as
`MEASUREMENTS.md M-nn`; the two single validator runs I made on a copy of the baseline are
labelled as such and are not Evidence.

## 1. The TCB question (owner §10)

FACT: the validator is inside the trusted computing base. It is invoked by `record` on every
Evidence handoff (`.ai/bin/protocol-handoff.cjs:25-28,94-107`), it decides the Completed-task
gate, and it is the only runtime caller of the Node `gate-check`
(`validate-protocol.ps1:869-889`). `PROTO-DEC-0038 item 1` already names validator and gates
protected; `PROTO-DEC-0054 item 5` keeps that rule for CORE-ARCH. The two-language pair
(PowerShell gate logic plus Node `gateCheck`, `protocol-handoff.cjs:934-1412`) is one TCB with
two implementations.

How to replace machinery that helps decide whether its replacement is valid. FACT: old and new
cannot share a correctness assumption. The old engine encodes current defects (CONTRACT-MAP
D-1..D-6), so "the old engine agrees" is behaviour evidence, not correctness evidence. HYPOTHESIS
(strong, from the repo's own history): parity alone also fails silently when both engines omit a
check the contract requires; the 2026-09-20 paired-cycle reviews found exactly this class
(`docs/reviews/2026-09-20-claude-paired-cycle-wave-c-re-review.md:40-41`, F-3/F-4: two engines
kept in parity by hand had drifted).

Mechanism-by-mechanism answer; "needed" means the migration cannot be certified without it.

| Owner §10 mechanism | Needed? | Why, and its limit |
|---|---|---|
| Old implementation as oracle | Yes, during migration only | `PROTO-DEC-0025 item 5` requires differential verification against the PowerShell reference. Oracle of *behaviour*; wrong for the defect classes. |
| Differential tests | Yes | Same decision. Every fixture runs both engines and stores OLD, NEW, EXPECTED, DIFF (section 2). |
| Golden fixtures | Yes | Independent of both engines; the only way to pin defect classes and common-mode assumptions. Expected results authored by a party that did not implement the check. |
| Mutation tests | Yes for every NORMATIVE check that can FAIL | Differential execution cannot prove a check exists: remove it from the new engine and the old still fails, so parity may hold if the fixture never exercises it. A mutation (drop one check) must change the fixture's expected result. Owner §11 asks whether mutation testing is useful: yes, and it is the cheapest guard against the §23-question-10 common-mode failure. |
| Independent expected-results fixtures | Yes for encoding, path safety, gate, Evidence, installed-role classes | These are the classes with recorded defects or security weight; expected results frozen before implementation. |
| Old/new dual execution on real repository state | Yes at phase gates, not per test | `MEASUREMENTS.md M-01` 3 s per run and `M-06` 201 validator calls per suite: a per-test dual run doubles the already critical path. Run both engines on the real tree at each phase exit and in CI on the frozen tree. |
| Independent certification | Yes, already binding | `PROTO-DEC-0038 item 1` and `PROTO-DEC-0041 items 1-2`: two parallel certifiers, outside execution and control, author/controller excluded (`PROTO-DEC-0057 item 4`). |
| N-1 verifier | During migration and for later validator changes; not permanent | `PROTO-DEC-0025 item 5` and `PROTO-DEC-0039 item 3` end in a single Node validator. Keeping both complete engines forever contradicts the reduction the migration exists to make; the N-1 role belongs to the last certified engine (git history plus the frozen release tag, `v1.9.5` at the baseline). |
| Frozen compatibility layer | Yes, as an interface freeze | Public command name, `-Quiet`, `[PASS]/[WARN]/[FAIL]`, summary lines, exit 0/1, Evidence line. Not frozen code: `PROTO-DEC-0039 item 3` says receipt formats and hashes are frozen, not deleted. |

Not needed: a new gate or verdict vocabulary (`PROTO-DEC-0040 item 5`; `PROTO-DEC-0041 item 3` is
closed already); a receipt schema migration (`PROTO-DEC-0042`; `PROTO-DEC-0039 item 3`); a second
permanent evidence path (doubles the trust surface for no property). OPEN QUESTION for the plan:
who authors the independent expected results, given `PROTO-DEC-0041 item 1` excludes the
implementer and the controller.

## 2. Differential verification design (owner §11)

FACT (call graph): three live consumers parse the validator's output or exit code — CI
(`.github/workflows/protocol.yml:31-36`), the suites (`tests/validator.test.cjs:18-29` and
siblings), and the Evidence line producer/consumer (`protocol-handoff.cjs:130-132`;
`MEASUREMENTS.md M-01` counts 240 such lines). FACT: one consumer depends on an environment
variable, `PROTOCOL_SKIP_GATE=1` (`protocol-handoff.cjs:97`; `validate-protocol.ps1:870`).
Therefore the compared object is the whole observable contract, not only FAIL verdicts.

Per fixture, record: INPUT, OLD_RESULT, NEW_RESULT, NORMALISED_OLD, NORMALISED_NEW,
EXPECTED_RESULT, DIFF. EXPECTED_RESULT is authored independently; where it disagrees with the old
engine, the fixture documents the defect and the planned resolution.

Fixture classes (owner's list, with the baseline example that seeds each):

1. positive: baseline copy of the tree, exit 0; the CRLF probe is the negative twin (FACT: my
   single run).
2. negative: each FAIL branch in CONTRACT-MAP rows CM-08..CM-46 (missing file, bad JSON, drift).
3. boundary: line limits exactly at/over (`tests/validator.test.cjs:180-190`); journal count 100;
   corpus 200 files / 2 MB; scope allow-list edge.
4. malformed files: invalid JSON/YAML, broken `.ps1`, BOM, UTF-16, lone CR.
5. Git-state variants: no commits, nested root, linked worktree, detached, dirty, uncommitted
   `.ai/DECISIONS.md` (WARN branch), registry rows edited.
6. path variants: absolute, drive-relative, UNC, `..` forms, `./` prefixes, backslashes,
   non-ASCII names, names containing spaces/brackets (`tests/validator-syntax.test.cjs:38-45`).
7. encoding variants: BOM, invalid UTF-8, NUL, CRLF, non-ASCII in `.ps1`/`.sh`.
8. manifest variants: missing, malformed, role source/installed, required file removed,
   `contentDigest` malformed/mismatched/missing-file.
9. decision/supersede variants: four-digit ids, duplicate, missing status/date/approval,
   placeholder approval, Proposed, self-supersede, dangling supersede, immutability edits,
   internal `---` cases (`tests/validator.test.cjs:622-749`).
10. review/gate variants: light vs strict selection, protected-path forcing, separate artifacts,
    phrase in the prompt, header region, transcribed/ADVISORY/verdict, cited review scan,
    `PROTOCOL_SKIP_GATE`, gate-check binding pass/stale/missing journal.
11. installed/source variants: installed skip of gate-check, owner-chosen review path, digest
    WARN/FAIL split.
12. capability variants (added): PowerShell absent, pwsh present, bash absent, node absent/old.

Normalisation — allowed (each needs a written justification in the harness):

- the absolute root in the `Root:` line and in messages: replace with `<root>`, separators `/`.
- line endings CRLF -> LF; trailing spaces per line; trailing empty lines.
- ANSI escape sequences: strip (present under pwsh; absent under Windows PowerShell capture).
- resolved executable paths in `Bash available: <path>`, Node/Git versions: placeholder `<path>`,
  `<version>`; the *presence* of the line stays compared.
- nothing else. Not normalised: status token, message text, line order, counters (`N files`,
  `N commits`, `N warning(s)`), WARN vs FAIL levels, relative paths, exit code.

Rules: two consecutive runs of one engine on the same fixture must produce identical normalised
output (determinism), with locale and `Sort-Object` culture pinned; any unexplained semantic
difference FAILS; a difference explainable only as "same meaning" is not a normalisation rule until
written into the allowlist and reviewed; the normalisation allowlist is part of the certified
artefact set, not of the implementation.

Mutation testing: one mutation per NORMATIVE check that can contribute a FAIL or WARN. Minimum
set: BOM, invalid UTF-8, CR, PS non-ASCII, PS syntax, required file, line limit, journal cap,
corpus cap, registry coverage, decision structure, supersede existence, TASK status, light/strict
selection, prompt phrase, review header, cited review, gate-check call, version drift, digest
drift, hook-disable, ignore probes, safe path, symlink, installer check. Each mutation must make
the fixture's expected normalised result change; a mutation that does not is a hole in the
fixture, not a passing test.

## 3. The PowerShell boundary (owner §12), one decision per operation

FACT: the validator spawns `git` (~8-12 calls), `node` (5), `bash` (3-4) and the installer
(`validate-protocol.ps1:1090-1092`), so "doing the checks in Node" still leaves subprocesses; the
question is only which *platform* capability remains.

| # | Operation (baseline) | Decision | Reason |
|---|---|---|---|
| 1 | PowerShell parser on `.ps1/.psm1/.psd1` (`:237-245`) | Retain a PowerShell subprocess; capability-conditional; **WARN** with an explicit "not run" line when PowerShell is absent | Only PowerShell can parse PowerShell with its own grammar; a reimplementation risks false negatives and adds a new TCB. WARN, never a silent pass; keep the pure-byte ASCII check unconditional. |
| 2 | Non-ASCII byte scan (`:237-240`) | Move to the new runtime | Pure byte scan; `DEC-0001` stays enforced everywhere. |
| 3 | Installer self-check (`:1077-1102`) | Keep the installer unchanged (not step 1); invoke it only when PowerShell exists; absence -> WARN "installer self-check not run"; installer file missing -> FAIL as today | Installer presence is checkable without PowerShell; running it proves installability on this host, not protocol health. `setup-ai-protocol.ps1` owns the installed `contentDigest` (`,:250-262`). |
| 4 | Bash availability + `-n` on two `.sh` wrappers (`:392-418`) | Retain; missing GNU bash stays **FAIL** while the `.claude/hooks/` wrappers are present | Those wrappers are the only unasked enforcement; a protocol with hooks that cannot run is broken, not degraded. State the consequence in the message. |
| 5 | Console encoding forcing (`:10`) | Move; new engine emits UTF-8 | Output contract; needed for non-ASCII names. |
| 6 | Process launching and argv quoting (`Invoke-External:30-58`, hand-rolled quoting at `:34-36`) | Move to Node `spawn` with argv arrays; delete the quoting routine; keep cwd = root and UTF-8 capture | The quoting exists only because PowerShell 5.1 mishandles native stderr; it is a portability hazard, not behaviour. |
| 7 | Reparse-point/symlink detection (`:107-115`, `:222`) | Move to `lstat`/`realpath`; junction fixtures mandatory | Windows attribute bit 1024 does not exist elsewhere; the Node mirror already uses `lstat` (`protocol-handoff.cjs:890-932`). |
| 8 | Date validation (`TryParseExact`) (`:450`) | Move; strict calendar validation (reject rollover dates such as 2026-02-30) | `tests/validator.test.cjs:203` pins `2026-02-30` as FAIL; JS `Date` silently rolls over. |
| 9 | .NET regex semantics (`:424`, `:996` and others) | Port deliberately: inline `(?ms)` to flags, `\z` to an explicit end anchor, `\r\n` handling; fixture each parser change | `\z` does not exist in JS and `$` differs under `/m`; a naive port changes the decision-block and immutability checks. |
| 10 | Git invocation (`:168-187,517,535,991`, light path `:605-609`) | Move to Node `spawn` (pattern exists in `.ai/bin/*`) | No shell; `-z` NUL parsing stays. |
| 11 | JSON reading (`ConvertFrom-Json`) | Move to `JSON.parse` with explicit fixtures for duplicate keys/comments | Parser strictness differs; manifest/settings/registry are gate inputs. |

Net boundary: two optional host capabilities remain — the PowerShell parser (check 1) and the
installer execution (check 3). Both are named in output; neither may disappear silently. No
"zero PowerShell" goal: technology purity is not a property (owner §12 last lines).

## 4. Environment matrix (owner §13)

| Environment | What runs | What degrades | Evidence (`record`) | Verdict rule |
|---|---|---|---|---|
| Windows + Windows PowerShell 5.1 | full baseline behaviour (FACT: my single positive run, exit 0, 0 warnings) | nothing | full | current semantics |
| Windows + pwsh 7 | parser, installer, git, node, bash (expected) | colour/encoding differences; installer under pwsh unverified (H) | full after measurement | same as baseline only after the pwsh fixtures pass; OPEN QUESTION until measured |
| Node + git + bash, no PowerShell (cloud, Linux) | every check except parser and installer self-check | two explicit WARN lines naming the skipped checks | `record` and `gate-check` are Node, so they work; the PS validator is the only blocked path | PASS with named WARNs; a check that never ran may not be reported as PASS |
| Cloud agent (Linux, no PowerShell) | as the row above, path semantics differ | case-sensitive paths, no Windows reparse attributes | as above | as above; the plan must state which checks are mandatory in cloud Evidence |
| linked git worktree | supported today (`validate-protocol.ps1:161-162`; `tests/validator.test.cjs:267-275`) | none expected | works (git only) | unchanged |

Rule: absence of a capability emits its own `[WARN]` naming the check; it never converts to
`[PASS]` and never silently weakens a check. `FAIL` is for a check that ran and failed.
`BLOCKED` is a review verdict token (`PROTO-DEC-0041 item 3`), not a validator exit code: the
validator has only 0 and 1 (CONTRACT-MAP CM-47).

## 5. Rollback (owner §20)

- Last known-good implementation: the PowerShell validator and its Node companions at the last
  certified release — FACT: newest tag at the baseline is `v1.9.5`; the tree declares 1.9.6
  uncommitted (`protocol-manifest.json:3`). For the migration, the plan must additionally name the
  frozen implementation baseline SHA and keep the PowerShell engine in-tree until phase 6.
- Wrapper routing back: possible only if the public `validate-protocol.ps1` stays the dispatcher.
  Requirement: the old path remains present and unmodified (freeze except P0, both engines).
- Reversible units: phase 0 fixtures/contract (docs); phase 1 Node module (additive); phase 2
  differential harness (additive); phase 3 caller switch in `record` and the wrapper (one branch,
  revertible as one commit); phase 4 wrapper default; phase 5 observation (evidence only);
  phase 6 deletion of the duplicated old logic — the least reversible step, explicit owner
  authority before it.
- Artifacts after rollback: Evidence lines name the check and `exit N in Ns`; the tree digest is
  engine-independent (`protocol-handoff.cjs:62-87` snapshot), so receipts recorded by the new
  engine remain valid under `PROTO-DEC-0042`. No re-record is required. Any extra line the new
  engine writes must be additive and ignorable by `verify`.
- Schema migration: none. Receipt and hash formats are frozen, not deleted
  (`PROTO-DEC-0039 item 3`); the output contract is an interface, not a schema.
- User commands: unchanged (`validate-protocol.ps1` and the documented `powershell ... -File`
  form); changing the name or the summary/exit contract is an artifact-visible, effectively
  irreversible change and needs explicit authority.
- Not reversible in practice: deleting the PowerShell engine before the observation phase;
  renaming the Evidence check; changing `gate-check` semantics for existing journals. Each needs
  the owner before crossing (owner §20).

## 6. Hidden semantic dependencies found (owner §22 "hidden semantic dependencies")

1. Status tokens `[PASS]/[WARN]/[FAIL]`, the two summary lines and exit 0/1 are parsed by CI and
   tests and quoted by reviews, including historical ones.
2. `PROTOCOL_SKIP_GATE=1` is the deadlock-breaker between `record` and `gate-check`
   (`PROTO-DEC-0032 item 8`); the port must keep the env-var handshake or replace both ends.
3. `gate-check` is invoked by path and its exit code and *last non-empty output line* are parsed
   (`validate-protocol.ps1:876-885`) — an interface independent of its internals.
4. The Evidence line `- <check>: exit N in Ns` is a measurement interface (`MEASUREMENTS.md M-01`,
   M-02); 240 historical lines use it.
5. `PROTOCOL_TEST_POWERSHELL` selects the shell for the whole suite (`tests/helpers.cjs:23`,
   `test-protocol.ps1:25`); a replacement that ignores it breaks the pwsh path.
6. `PROTOCOL_TEST_FAST_CHECKS=1` installs a stub validator for non-validator suites
   (`tests/helpers.cjs:62-92`); a port must keep the stub hook or the suite doubles in cost.
7. The manifest is the single source for the required set here, in the installer and in fixture
   seeding; three consumers must stay in step (`PROTO-DEC-0012`).
8. Installer-produced `contentDigest` is verified in installed role; LF checkout bytes are
   required for both sides (`.gitattributes`, `setup-ai-protocol.ps1:250-262`).
9. Line counting semantics are shared with `protocol-archive.cjs` by hand (`:224-231`).
10. Decision-block parsing exists twice inside the validator (structure and immutability) and
    again in `protocol-index.cjs`; a ported parser must keep all three coherent.
11. Decision/registry checks read `HEAD:`; a fresh repository gets WARN, not FAIL — a deliberate
   fresh-install path (`validate-protocol.ps1:993`).
12. `$Root` comes from `$PSScriptRoot`, not cwd; scripts are run from anywhere.
13. Windows path semantics (drive letters, UNC, trailing separators, reparse attributes) are
    load-bearing in safe-path, scope and corpus checks.
14. Enumeration order depends on `Sort-Object -Unique` culture (`:218,251,305`); the port must fix
    an ordinal order or the parity diff will be locale-dependent.
15. The installer self-check spawns the *running shell* (`:1090`), so the validator's behaviour
    depends on how the validator was started.
16. Corpus size compares against `2MB` (2097152 B) while docs say "2 MB"; byte semantics must be
    pinned.
17. `.ai/worklog/` is inspected even when ignored, and `docs/reviews/archive/` is excluded from
    the budget; both are deliberate (comments `:191`, `:256-262`).
18. `-Quiet` suppresses PASS lines only; tests and reviews use it as a stable CLI contract.

## 7. Constraints recorded for zones B and C (no architecture proposed)

- Any target must be behaviour-complete against CONTRACT-MAP, including WARN lines, degraded
  capability lines, and the exact output/exit contract; no check may silently disappear.
- The TCB mechanism set of section 1 is a requirement; its shape is zone B's proposal and zone
  C's falsification target.
- Fixing CONTRACT-MAP defects D-1..D-6 during migration changes verdicts on edge fixtures and
  must be decided explicitly, in both engines, with fixtures; otherwise the defect is preserved
  and recorded as such.
- The rollback anchor (PowerShell engine in-tree, public command frozen) must hold until the
  observation phase is certified; phase 6 needs explicit owner authority.
