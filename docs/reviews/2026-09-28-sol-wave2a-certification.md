# ROADMAP-1 wave 2A frozen-candidate certification (Sol)

- Reviewed commit SHA: `5ce521932bec2b56f198ecb2fb23018449caffd0`
- Candidate code commit: `5bc99403cd79730d871d61a27651bde3b383be73`
- Candidate range: `a4312e8..5bc9940`
- Working tree status: dirty only with this certifier's journal and review while the report was written
- Reviewer model: `GPT-5.6 Sol` (Codex rollout `01a0e826-f3e6-7363-818b-c91177651aa8` records `gpt-5.6-sol`, effort `medium`)
- Date (UTC): 2026-09-28
- Scope: independent certification of wave 2A items A-G under the unified adversarial prompt
- Mode: CERTIFYING
- Receipt-Owner: `codex-96801ade53c50a18`
- Verdict: FAIL

## Executive result

The candidate cannot be certified. Two required properties fail with reproductions:

1. W5 is not hermetic while running: several dispatch tests deliberately import
   `.ai/worklog/gemini-0123456789abcdef.md` into the tracked checkout and remove it only in
   `finally`. This violates the explicit requirement that tests write nothing into the tracked tree.
2. S-7 does not bound all concurrent scenarios to four. Two `own` watchdog scenarios start outside
   the worker pool, after which the pool starts four more. An instrumented full run measured six
   simultaneous `--one` scenario children.

The complete dispatch suite and launch-test suite still pass, so both defects are coverage/contract
escapes rather than ordinary red tests. PROTO-DEC-0041 item 4 makes a reproduced contract violation
blocking regardless of its prior LOW label.

## Baseline and independence

- The current head was `5ce5219`; `git diff 5bc9940..HEAD --stat` contained only the recovery prompt,
  launch documents, and the prompt author's journal. `git diff 48365b2..5bc9940` also contained only
  review/task documents, so candidate code is identical at `48365b2` and `5bc9940`.
- Before candidate inspection, the local rollout confirmed client/model/effort as Codex,
  `gpt-5.6-sol`, `medium`. This reviewer did not read the other certifier's artifact.
- Initial candidate status was clean except for this session's newly created journal.

## Per-item verdicts

### A. W0 codex usage parser - PASS

- `node --test --test-name-pattern="W0" tests/dispatch.test.cjs`: 1/1 pass.
- Direct adversarial probes produced: `7,654.` -> 7654; `tokens used abc` -> not found;
  `1.25k` -> 1250; and `5k` plus `252` NBSP `154` -> 257154 with both raw matches preserved.
- The real NBSP pair is covered by W0 and resolves to 252154.
- Setting an attempt's `rawUsage` to number `42` produced
  `root.attempts[0].rawUsage: must be a string or null` from `validateRecord`.

### B. W5 hermetic fixtures - FAIL

Passing subchecks:

- Blob comparison across the old and new fixture prefixes: old 40, new 40, mismatches 0.
- `DISPATCH.json` still has 38 slots; the old prompts directory is absent and the archive exists.
- The INDEX diff adds only CR-W5-1; the pre-change INDEX blob containing CR-F01-1 is identical.
- `getRepoRoot()` returned `cwd` with no environment override, the override when set, and explicit
  `opts.repoRoot` ahead of the environment. The full dispatch suite passed 28/28.
- Normal completion and killed probes at approximately 5 and 7 seconds left only this certifier's
  journal in `git status --porcelain`.

Blocking reproduction at reviewed head `5ce5219` / candidate code `5bc9940`:

```powershell
rg -n "gemini-0123456789abcdef|Journal must have been imported|unlinkSync\(journalPath" tests/dispatch.test.cjs tests/dispatch-fake-client.cjs
```

Observed: the fake client writes the journal at `tests/dispatch-fake-client.cjs:18`; T6 binds the
destination to the real checkout at `tests/dispatch.test.cjs:217`, requires it to exist at lines
241-242, and deletes it only at line 246. Equivalent cleanup occurs for T20-T26 and T30. The full
suite reports T6 PASS because the test asserts the forbidden tracked-tree import. Final cleanliness
does not satisfy `LAUNCH-2A.md:31-32`, which separately requires both no tracked-tree writes and clean
status after a killed run.

Item verdict is FAIL.

### C. W1-retire - PASS

- `git show cf99cdf^..cf99cdf -- <run-chain.cjs>` shows exactly one added header comment; the file
  remains present and points new programs to `.ai/bin/protocol-dispatch.cjs`.
- Search of active `*.cjs`, `*.js`, and `*.ps1` files found no invocation outside the retired file.
- The comment says `OPS-1 W1` rather than the later prompt's `OPS-1 W1-retire`, but it satisfies the
  original one-line semantic requirement in `LAUNCH-2A.md:38-40`; this is not a defect.

### D. Canonical RUNS store repair - RECOMMENDATION

- `protocol-runrecord validate docs/ops/RUNS.jsonl`: 2 valid, 0 invalid.
- `protocol-dispatch report <cost-routes DISPATCH.json>` rendered both restored records.
- Both `pins.launchSha256` values equal SHA-256 of their current launch files.
- `../escape.jsonl`, `/abs.jsonl`, `C:\\escape.jsonl`, and empty `runsFile` values were rejected.
- T30 passes and proves `dispatch.runsFile`; CLI/environment/dispatch/default precedence is correctly
  ordered in both run and report code.
- F-2A-05 remains open: T30 does not exercise a dispatch with no `runsFile` at all, so it does not
  directly assert an append to the bare default `docs/ops/RUNS.jsonl`. This is an incomplete-coverage
  recommendation, not a refutation of the observed implementation behavior.

### E. S-7 throttle - FAIL

Passing subchecks:

- `launch-test.cjs --pure`: 53/53 assertions pass.
- `launch-test.cjs --one zz-t1`: exit 0.
- A full instrumented run completed with every scenario reporting PASS.

Blocking reproduction at reviewed head `5ce5219` / candidate code `5bc9940`:

```powershell
node -e "const cp=require('child_process'),path=require('path');const orig=cp.spawn;let active=0,max=0;cp.spawn=function(command,args,opts){const child=orig.apply(this,arguments);const tracked=Array.isArray(args)&&args.includes('--one');if(tracked){active++;if(active>max){max=active;console.log('PROBE_ACTIVE_ONE='+active);}child.once('exit',()=>{active--;});}return child;};process.on('exit',()=>console.log('PROBE_MAX_ONE='+max));const target=path.resolve('docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs');process.argv=['node',target];require(target);"
```

Observed before the all-PASS scenario report:

```text
PROBE_ACTIVE_ONE=1
PROBE_ACTIVE_ONE=2
PROBE_ACTIVE_ONE=3
PROBE_ACTIVE_ONE=4
PROBE_ACTIVE_ONE=5
PROBE_ACTIVE_ONE=6
PROBE_MAX_ONE=6
```

Source explains the measurement: lines 460-471 start the two `own` cases through
`deadWatchdog(id, report)` before the pool; lines 474-485 then allow four non-`own` cases. Thus the
actual scenario bound is six, not four, and the `own` terminal paths do not release pool slots.

Item verdict is FAIL.

### F. S-10 vibe client note - PASS

- T3 (and the substring-matched T30) passed; resolver passed 7/7.
- Escalated `protocol-dispatch probe vibe` returned `state=OK version="vibe 2.25.8"`, exit 0. The
  sandbox-only attempt had returned ABSENT because it could not spawn the installed executable.
- Exact fields: `note = "never edit an entry after record; add a new entry"`; `resume.note =
  "supports --resume [SESSION_ID]; never edit an entry after record; add a new entry"`.

### G. Range hygiene - RECOMMENDATION

- The six named item commits are distinct; commits after `fa74541` through `5bc9940` contain only
  reports, task documents, and journals. No PowerShell file changed. `git diff --check` reports only
  Markdown hard-break/trailing-space issues in two report/journal files, not code corruption.
- Reflog contains the known single `reset: moving to HEAD~1` at `fbff763`; later history is linear.
- Validator exits 0 and reports UTF-8/LF/PowerShell checks PASS, with one environmental warning:
  104 journals exceed the cap of 100.
- F-2A-01 remains open: `W2A-EXECUTION.md:42` still says CR-F01-1 was updated, while the diff appends
  CR-W5-1 and leaves CR-F01-1 untouched. Correct the report in a forward artifact; do not rewrite
  immutable history.

## Known-item dispositions

- F-2A-01: OPEN, LOW documentation-to-tree divergence; recommendation.
- F-2A-02: OPEN as an undisclosed W5 refactor, but independently verified behavior-preserving;
  default, environment override, explicit option, and 28/28 dispatch tests pass.
- F-2A-03: OPEN and BLOCKING; the literal tracked-tree journal import violates W5 hermeticity.
- F-2A-04: CONFIRMED INFO; one local reset is visible, final history is linear.
- F-2A-05: OPEN, LOW incomplete coverage; T30 does not assert the bare default append path.
- F-2A-06: OPEN environmental warning; current count is 104 journals, validator still exits 0.

## Checks run

- Full `tests/dispatch.test.cjs`: 28/28 pass (121.7 s).
- `tests/resolver.test.cjs`: 7/7 pass.
- `launch-test.cjs --pure`: 53/53 pass; `--one zz-t1`: exit 0; instrumented full scenarios: all PASS,
  but measured concurrency 6.
- RUNS validator/report, unsafe-path probes, parser probes, blob-hash comparison, pin-hash comparison,
  killed-run probes, commit/reflog/scope inspection, and `git diff --check` as described above.
- `validate-protocol.ps1`: exit 0, one pre-existing/environmental journal-count warning.

## Final verdict

FAIL. Do not count this candidate toward the completion gate. Fix both blocking reproductions, freeze
a new candidate, and run a new independent certification round; this review authorizes no fix.
