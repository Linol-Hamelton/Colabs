# Codex independent batch certification, slot 1

Mode: CERTIFYING
Receipt-Owner: codex-1ac9cc1e40ead302
Reviewed commit: b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed
Worktree: D:\Colabs-cert\codex
HEAD at start: b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed
HEAD at end: b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed
Git status at start: clean; `git status --porcelain` emitted nothing before session start.
Git status at end: dirty; exact output recorded below.
Reviewer: GPT-6 Astra (Codex), independent certifier, outside execution and control
Date (UTC): 2026-09-23
Scope: executable rulebook, its specification, immutability, five A/B/C fixes; contract conformance
scope-check: FAIL
Verdict: FAIL

Ten reproduced findings remain open. The specified relative-path matrix passes; the complete candidate does not.
No other batch certification report, findings ledger, routing INDEX draft, or D:\Colabs material was opened.
The mandatory TASK/session context did contain earlier claims; none was treated as evidence or copied as a finding.

## Findings ledger

Each reproduction command below exits 0 when the probe runner finishes; this is not a passing assertion.
Every child command, cwd, stdout, stderr and actual exit is preserved in `docs/research/2026-09-23-codex-certification/*-results.json`.
The runner rebuilds its inputs from scratch under `.ai/runtime/codex-cert/`; it changes no candidate implementation file.

| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |
|---|---|---|---|---|---|---|---|---|
| C01 | ledger-lossy-parse | Spec section 2 malformed-ledger contract | .ai/bin/protocol-verdict.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs verdict | 0 | HIGH | confirmed | 1 |
| C02 | manifest-schema | PROTO-DEC-0046 item 3 protected-set contract; spec section 7 | .ai/bin/protocol-verdict.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs verdict | 0 | HIGH | confirmed | 1 |
| C03 | manifest-root-discovery | Spec section 1 repository-only and deterministic contract | .ai/bin/protocol-verdict.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs verdict | 0 | HIGH | confirmed | 1 |
| C04 | touched-input-exemption | Spec section 5 complete touched-set contract | .ai/bin/protocol-scope.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs scope | 0 | HIGH | confirmed | 1 |
| C05 | owner-source-guessing | Spec section 6 header and producer receipt contract | .ai/bin/protocol-scope.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs scope | 0 | HIGH | confirmed | 1 |
| C06 | spec-controller-omission | PROTO-DEC-0041 item 1 independence contract | docs/specs/2026-09-23-executable-rulebook-spec.md, .ai/bin/protocol-scope.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs scope | 0 | HIGH | confirmed | 1 |
| C07 | lossy-decision-comparison | AGENTS section 6 and DEC-0021 immutability contract | validate-protocol.ps1 | node docs/research/2026-09-23-codex-certification/probes.cjs immutable | 0 | HIGH | confirmed | 1 |
| C08 | text-as-judgement | PROTO-DEC-0041 item 4 and spec section 1 boundary | docs/specs/2026-09-23-executable-rulebook-spec.md, .ai/bin/protocol-verdict.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs verdict | 0 | MEDIUM | confirmed | 1 |
| C09 | path-alphabet | PROTO-DEC-0044 item 2 reverse-path-index contract | .ai/bin/protocol-index.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs layers | 0 | MEDIUM | confirmed | 1 |
| C10 | absolute-diagnostics | Spec section 1 item 3 same-output contract | .ai/bin/protocol-scope.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs boundary | 0 | LOW | confirmed | 1 |

## Reproductions and consequences

### C01: malformed findings disappear

At `.ai/bin/protocol-verdict.cjs:253`, a blank line terminates parsing; non-framed rows are skipped.
At line 268, duplicate column names overwrite earlier values. These are independent malformed inputs to the same lossy parser.
`missing-leading-pipe`, `missing-trailing-pipe`, `blank-split`, `second-table`, `fenced-hidden-row` and `duplicate-header` each print:
`Verdict: PASS` / `No blocking or advisory findings detected.`; child exit 0.
The first five include a refuted attempt 1 followed by a confirmed protected finding at attempt 3; the duplicate header overwrites `confirmed` with `refuted`.
Each corresponding `--stop-rule` invocation also exits 0: `PASS: Root-cause stop rule satisfied across 1 group(s); no root cause reached attempt 3.`
Required result: malformed input exits 2, never a false all-clear. Additional schema holes: invalid `exit: banana` passes parsing, and extra cells are accepted.

### C02: missing manifest keys silently remove protection

At `.ai/bin/protocol-verdict.cjs:86` and 91, absent/wrong-type arrays are simply skipped.
Cases `manifest-missing-managed`, `manifest-missing-source`, `manifest-empty-managed`, `manifest-empty-source`, `manifest-wrong-type`, `manifest-empty-object` all exit 0 with `Verdict: RECOMMENDATION`.
Each contains a reproduced, confirmed, neutral-requirement finding on `validate-protocol.ps1` or `setup-ai-protocol.ps1` as appropriate.
Malformed JSON does fail closed: `BLOCKED: Cannot load protocol-manifest.json at run time: Expected property name or '}' in JSON at position 1 (line 1 column 2)`, exit 2.
An unusable source must not silently narrow the protected set.

### C03: manifest lookup escapes the candidate repository

`.ai/bin/protocol-verdict.cjs:25` walks ancestors from the ledger directory, then cwd, then falls back to the tool's repository.
The runner creates a separately committed Git repository `outer-*/candidate`, with a committed `probe.md` and no manifest.
Exact child command in that cwd: `node D:\Colabs-cert\codex\.ai\bin\protocol-verdict.cjs probe.md`.
With the parent's full manifest: `Verdict: FAIL`, exit 1. With the parent's valid `{managed:["unrelated.md"],source:["other.md"]}`: `Verdict: RECOMMENDATION`, exit 0.
Both runs use identical candidate bytes and HEAD; `git status --porcelain` afterward emits nothing, exit 0.
Neither run should borrow the external manifest; the missing candidate manifest requires exit 2.
`nested-manifest-shadow` also produces RECOMMENDATION/0 when a nearer `docs/reviews/protocol-manifest.json` shadows the root definition.

### C04: the scope input can hide a forbidden file

`.ai/bin/protocol-scope.cjs:137` removes scope and forbidden-list files from the touched set without any recorded authorization.
`forbidden-scope-file-bypass`: create an untracked `tests/scope.txt` containing `src/`; run `node <scope-tool> --baseline <fixture-HEAD> --scope tests/scope.txt`.
Actual: `SCOPE CHECK PASS: All 0 touched paths are inside declared scope and none are forbidden.`, exit 0.
Expected: the untracked file is both outside `src/` and forbidden by standing `tests/`; exit 1.
`scope-file-hidden` and `forbidden-file-hidden` also omit modified, tracked input files and print `All 3 touched paths`, exit 0.

### C05: unknown owners become independent through guesses

`.ai/bin/protocol-scope.cjs:233` searches the whole document, and line 278 substitutes the journal basename when no receipt exists.
`empty-journal-fallback`: an empty `empty-journal.md` becomes producer `empty-journal`; output `Independence check PASS: Reviewer 'reviewer-123' is independent of producer 'empty-journal'.`, exit 0; expected 2.
`body-only`: both identity fields occur only inside a fenced example after `---` and `## Example`; output claims reviewer-123 independent of builder-123, exit 0; expected 2.
`candidate-sha` accepts a 40-hex commit as the producer owner, exit 0; `override-real-producer` ignores the named journal's self-owner in favor of `--producer other-123`, exit 0.
These are observable input-validation failures, not a claim that tooling can detect hidden human control.

### C06: the specification omits a mechanically visible controller

Spec line 167 prescribes equality or an `implementer` role, while `.ai/DECISIONS.md:1792` excludes author, executor, controller and the executing pair.
The fixture TASK explicitly declares `controller: coordinator and controller of this candidate`.
`controller`: `Receipt-Owner: controller-123`, `Producer: builder-123` yields `Independence check PASS: Reviewer 'controller-123' is independent of producer 'builder-123'.`, exit 0; expected 1.
Code line 301 follows the defective spec's implementer-only test. The spec's caveat about invisible practical control does not cover explicitly recorded control.

### C07: comparison normalization erases written changes

`validate-protocol.ps1:999` and 1003 remove separators using a multiline `$` anchor and discard trailing whitespace; the heading's content is excluded too.
The fixture commits DEC-0001 containing an internal separator, two rule paragraphs and an approval line, then changes one thing at a time.
`separator-add` inserts `---\n` immediately before `Keep the second rule.`; `heading-edit` appends ` Altered` to `### DEC-0001`; `last-line-space` adds a space after `Approved by: Fixture Owner`.
Each validator run prints `[PASS] 1 committed decision blocks are unchanged` and `Protocol OK. 2 warning(s).`, exit 0; expected 1.
Fixture warnings are the missing registry and idle template task, present in the unchanged control as well.
Text replacement, line insertion/deletion, internal whitespace and separator removal are detected; lawful append is accepted. Full matrix below.

### C08: the spec substitutes word occurrence for a recorded violation

Spec line 111 says the requirement merely "names an invariant or contract"; decision 0041 item 4 (line 1795) instead requires a reproduced violation.
The specification's own section 1 excludes judging whether a defect is real and introducing an unwritten rule.
`negative-invariant-mention` on `docs/notes.md`, requirement `No invariant or contract applies; optional spelling correction`: FAIL/1 solely because of the words.
`binding-citation-only`, requirement `PROTO-DEC-0041 item 3: a mandatory open defect is FAIL`, same off-protected path: RECOMMENDATION/0.
`.ai/bin/protocol-verdict.cjs:380` therefore cannot implement the recorded rule reliably; the ledger needs an approved, explicit classification or this judgment must stay manual.
Line 341 adds another unrecorded text heuristic: a fixed finding reproduced with `node tests/unrunnable.test.cjs`, exit 0, becomes BLOCKED/2 solely because of the filename (`unrunnable-filename`).

### C09: reverse index still loses existing path tokens

`.ai/bin/protocol-index.cjs:23` and 79 reject Unicode and `+` before checking existence.
`layers` calls exported `boundPaths` with backticked `LICENSE`, `docs/reviews/*.md`, `.ai/bin/a.cjs`, `docs/a+name.md`, `docs/источник.md`; the last two exist in the fixture.
Actual output: `[".ai/bin/a.cjs","LICENSE","docs/reviews/*.md"]`, runner exit 0. Both existing documentation paths disappear.
The broader claim that valid tokens are recognized is false. The narrower wildcard/bare-LICENSE correction does work.

### C10: error output depends on checkout location

`boundary` copies the same fixture, including Git history, into `location-a-*` and `location-b-*` and runs identical relative arguments.
For `--baseline <same-SHA> --scope absent.txt`, both child exits are 2, but stderr embeds the distinct absolute checkout paths at `.ai/bin/protocol-scope.cjs:55`.
Actual outputs are `BLOCKED (exit 2): Scope file not found: D:\Colabs-cert\codex\.ai\runtime\codex-cert\location-a-hKZnD9\absent.txt` and the same prefix ending `location-b-MI0fyd\absent.txt`.
This violates the literal same-output boundary; it does not change the exit/verdict. Clarify the approved output contract or use root-relative diagnostics.

## Full path and protection grid

All path probes use `observed mismatch`, confirmed, LOW, `node probe.cjs`, exit 1, attempt 1. No invariant/contract keyword masks recognition.

| Path form | Actual verdict / exit | Expected |
|---|---|---|
| `.ai/bin/x.cjs` | FAIL / 1 | same |
| `./.ai/bin/x.cjs` | FAIL / 1 | same |
| `.ai\bin/x.cjs` | FAIL / 1 | same |
| `.AI/BIN/X.CJS` and lowercase | FAIL / 1 | same |
| `/x` | BLOCKED / 2 | same |
| `D:/x` | BLOCKED / 2 | same |
| `D:x` | BLOCKED / 2 | same |
| `\\host\x` | BLOCKED / 2 | same |
| `//host/x` | BLOCKED / 2 | same |
| `../x` | BLOCKED / 2 | same |
| `x/../y` | BLOCKED / 2 | same |
| `x/..` | BLOCKED / 2 | same |
| `x\..\y` | BLOCKED / 2 | same |
| empty cell | BLOCKED / 2 | same |
| `./D:x`, `.//host/x`, `.`, `./`, comma list `a,..` | BLOCKED / 2 each | same |
| Every managed/source entry (31 total) | FAIL / 1 each | same |
| Novel `.claude/x`, `.codex/x`, `.ai/bin/x.cjs` | FAIL / 1 each | same |
| `validate-protocol.ps1`, `protocol-manifest.json`, `setup-ai-protocol.ps1` | FAIL / 1 each | same |
| `tests/rulebook.test.cjs`, `docs/notes.md` | RECOMMENDATION / 0 each | same |
| `docs/data/gate/validator.md`, `.ai-other/x`, `validate-protocol.ps1.bak` | RECOMMENDATION / 0 each | same |

Neutral `docs/notes.md` returns RECOMMENDATION/0; changing only requirement to `recorded invariant` returns FAIL/1. This demonstrates why neutral probes are necessary.
All four valid severity labels give FAIL/1 on `.ai/bin/x.cjs`. No reproduction gives RECOMMENDATION/0; unresolved and explicitly unrunnable give BLOCKED/2.

## Malformed ledger, stop and immutability matrices

| Ledger shape | Verdict mode exit | Stop mode exit |
|---|---:|---:|
| Missing column; duplicate ID; invalid severity; invalid disposition; invalid attempt | 2 each | 2 each |
| Missing leading or trailing pipe on the confirmed row | 0 PASS each | 0 each |
| Blank before confirmed row; second table; fenced hidden row | 0 PASS each | 0 each |
| Duplicate disposition header overwrites confirmed | 0 PASS | 0 |
| Short row; empty exit; empty table | 2 each | 2 each |
| Prose before intact confirmed row; extra cell on that row | 1 each | 2 each (attempt gap) |
| Invalid exit `banana` | 1 (accepted schema) | 0 |

Attempts `[1]`, `[1,2]`, `[1,1,2]` pass/0. `[1,2,3]`, `[3,2,1]` and interleaved A1,B1,A2,B2,A3 trigger STOP/1.
`[1,3]`, `[2]`, `[3]`, `[1,2,4]` yield ledger error/2. Mixed confirmed/fixed dispositions do not hide the maximum. C01 bypasses both computations before grouping.

| Decision mutation | Actual validator exit | Expected |
|---|---:|---:|
| Unchanged; append with separator; append without separator | 0 each | 0 each |
| Body text changed; line inserted; line deleted | 1 each | 1 each |
| Separator added inside body | 0 | 1 |
| Separator removed inside body | 1 | 1 |
| Internal double space | 1 | 1 |
| Space at end of approval line | 0 | 1 |
| Heading text changed | 0 | 1 |
| Block deleted; level-4 subheading inserted | 1 each | 1 each |

## Boundary and unified-prompt coverage

Hand computation: check 1 filters dispositions/reproduction then intersects declared path sets; check 2 groups by root cause and compares the sorted unique attempts with 1..n; check 3 compares Git's touched set with scope/forbidden membership; check 4 compares declared identities/roles.
The `boundary` relocation controls give byte-identical ordinary outputs/exits for all four checks (1,0,0,0); this is an execution check on Windows, not proof for every machine.
Check 1 fails repository-only/determinism on C03 and recorded-rule fidelity on C08. Check 2 is repository-only/deterministic but inherits C01; its max-attempt rule is in PLAN.
Check 3 invents an input-file exemption (C04) and fails literal output equality (C10). Check 4's metadata guesses (C05) and incomplete spec (C06) prevent conformance to decision 0041.
No network/model consultation exists in the four code paths. Their arithmetic is inspectable by hand; wrong outputs are visible in the saved fixtures and JSON.
Scope controls: non-ASCII untracked `src/новый.md` counts as one path; untracked `tests/forbidden.txt` fails/1; `src-old` does not match `src/`; trailing-slash exclusion fails/1 as intended; missing baseline/scope and empty scope fail/2.
Independence controls: same owner and implementer role fail/1; missing identities fail/2; declared journal passes/0 with exactly identical output before and after swapping mtimes.
A/B/C: tracked Cyrillic 51,000-byte source is injected; corpus retains the same Unicode name; `logs/` excludes file `logs` but keeps `logs-old/keep.txt`; non-Git junction `loop` is explicitly listed as skipped; missing records/dup inputs exit 2; identical records across sets exit 1. RC3 has C09.
The unified prompt's claimed regex ending a block at any `---` is stale: the candidate still ends at headings and adds separator stripping instead. The actual candidate, not that description, was tested (C07).
The spec's old certifier names and the prompt's 20-test claim are also stale; decision 0046 and this owner's direct dispatch govern this run.

## Checks, scope and handoff

Ran `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`: exit 0, `Protocol OK. 0 warning(s).` before review artifacts.
First full suite: exit 1, 361/362; its invalid-Git fixture climbed into the enclosing worktree because TEMP was deliberately inside it. This is not counted as a candidate regression.
Isolated full suite: exit 0, 362/362 passed, no skips; duration 284142.8879 ms. Full logs from both runs are preserved beside the probes.
The repeat sets TEMP/TMP to `.ai/runtime/codex-cert/tmp` and GIT_CEILING_DIRECTORIES to that same directory, so invalid fixtures cannot discover the outer checkout. No test code changed.
Total custom observations: 183 across verdict (127), scope (25), immutability (13), layers (8), relocation (10); complete output is saved beside the runner. Two early Layer-A probe setup errors were corrected (nonexported helper, then missing fixture TASK), not presented as candidate defects.
Measured implementation scope with `git diff --numstat f68b502 b232a9e -- <11 code/test/manifest paths>`; all eleven are within the declared batch surfaces. Inventory was independently checked using `git ls-files`; the named sources exist.
Full pre-change name/status inventory is saved as `candidate-scope.txt` beside the probes; it also records governance, archival and research changes in the checkpoint, without reading prohibited reports.
This session changes no candidate executable/specification/test. It adds this report, probe artifacts and its own journal, and records findings in TASK under lock.
For the 60-file corpus cap, the closed 2026-09-19 CI-hotfix audit was classified as historical (absent from current TASK/PLAN/decision/registry references), moved byte-for-byte to archive, and indexed. SHA256: 0c5908f49add694b277998dc4f78f1f5e0aebf34b19858456da6f56875c0a73f.
Ran `node .ai/bin/protocol-verdict.cjs docs/reviews/2026-09-23-codex-batch-certification.md`: `Verdict: FAIL`, exit 1, all ten rows drive the verdict. Tool and reviewer agree; full output is in `report-verdict.json`.
Receipt is generated by `node .ai/bin/protocol-handoff.cjs record --owner codex-1ac9cc1e40ead302`; its journal explicitly cites this review. No commit or push; no implementation fix; no task completion.

```text
 M .ai/TASK.md
 D docs/reviews/2026-09-19-deepseek-flash-ci-hotfix-audit.md
 M docs/reviews/archive/INDEX.md
?? .ai/worklog/codex-1ac9cc1e40ead302.md
?? docs/research/2026-09-23-codex-certification/
?? docs/reviews/2026-09-23-codex-batch-certification.md
?? docs/reviews/archive/2026-09-19-deepseek-flash-ci-hotfix-audit.md
```
