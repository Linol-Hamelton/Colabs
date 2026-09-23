# DeepSeek - Round-3 batch certification: F-002/F-003/F-004 closed; F-001 partially open

**Date**: 2026-09-23
**Reviewed commit**: 82bf99a8e2bfcde3ff375b9995f3ab45edb7ddc5 (HEAD unchanged START and END)
**Working tree**: dirty; candidate tools/tests untracked; other sessions active (snapshots below)
**Reviewer**: DeepSeek (deepseek-flash), session `deepseek-db22ebbd5fd21de8`
**Scope**: architecture
**scope-check**: FAIL
**Verdict**: FAIL
**Mode**: CERTIFYING
**Receipt-Owner**: deepseek-db22ebbd5fd21de8
**Receipt**: `node .ai/bin/protocol-handoff.cjs record --owner deepseek-db22ebbd5fd21de8` at session end; the journal entry names this path.

---

## Executive Summary

Three of the four round-2 findings are closed and the immutability rule is no longer weakened.
F-002: the independence check no longer reads mtime and is stable across mtime swaps. F-003: the
block parser is heading-terminated again and a single trailing `---` is stripped, so an edit
after an in-block `---` is caught again. F-004: the scope check now unions untracked files and
fails an untracked forbidden path. F-001 is only partially closed: the reported spellings
(`./`, case, backslashes) now classify correctly and the substring over-match is gone, but a
protected path that is not root-anchored - an absolute drive path (`D:\Colabs\.ai\bin\x`,
the spelling this repository's own journals use) or a `..` prefix - is still silently downgraded
from FAIL to RECOMMENDATION, exit 0. The defect lies on the protected path
`.ai/bin/protocol-verdict.cjs`, so it blocks under PROTO-DEC-0041 item 4. Verdict: **FAIL**,
attempt 2 of the <=2 budget, F-001 returns to the owner.

---

## Scope and Evidence

- **Commands executed**: `validate-protocol.ps1 -Quiet`; `test-protocol.ps1`; `protocol-verdict.cjs`
  on 16 ledgers; `protocol-scope.cjs --baseline/--scope` and `--independence` on fixtures;
  fixture validator runs for the immutability directions.
- **Results**: `validate-protocol.ps1` exit `0`, `Protocol OK. 1 warning(s)` (32 journals / cap 30,
  WARN-first). `test-protocol.ps1` exit `0`, TAP `1..348`, `# pass 348`, `# fail 0`, 282 s.
- **Environment**: Windows, Node v22.21.0, PowerShell 5.1.26100.9444
- **Corpus reservation**: 55/60 files, 535,281/614,400 B before this report; +1 file -> 56/60.

### START snapshot (captured before reading the candidate)

```
$ git rev-parse HEAD
82bf99a8e2bfcde3ff375b9995f3ab45edb7ddc5
$ git status --porcelain
 M .ai/ARCHIVE.md
 M .ai/TASK.md
 D .ai/worklog/claude-827b0cd4dadc9605.md
 D .ai/worklog/claude-b743c39191cfcc27.md
 M .ai/worklog/claude-ebd3e8a8eb29a6d7.md
 M docs/specs/2026-09-23-executable-rulebook-spec.md
 M protocol-manifest.json
 M tests/validator.test.cjs
 M validate-protocol.ps1
?? .ai/bin/protocol-scope.cjs
?? .ai/bin/protocol-verdict.cjs
?? .ai/local-qwen/
?? .ai/worklog/deepseek-db22ebbd5fd21de8.md
?? .ai/worklog/gemini-4261c9c2e2da03ac.md
?? .ai/worklog/gemini-8a06ba8cb343bedc.md
?? docs/reviews/2026-09-23-deepseek-batch-certification-round2.md
?? docs/reviews/2026-09-23-deepseek-batch-certification.md
?? docs/reviews/2026-09-23-gemini-batch-adversarial-prompt.md
?? tests/rulebook.test.cjs
```

### END snapshot (captured after the suite and all fixtures)

```
$ git rev-parse HEAD
82bf99a8e2bfcde3ff375b9995f3ab45edb7ddc5
$ git status --porcelain
 M .ai/ARCHIVE.md
 M .ai/TASK.md
 D .ai/worklog/claude-827b0cd4dadc9605.md
 D .ai/worklog/claude-b743c39191cfcc27.md
 M .ai/worklog/claude-ebd3e8a8eb29a6d7.md
 M docs/specs/2026-09-23-executable-rulebook-spec.md
 M protocol-manifest.json
 M tests/validator.test.cjs
 M validate-protocol.ps1
?? .ai/bin/protocol-scope.cjs
?? .ai/bin/protocol-verdict.cjs
?? .ai/local-qwen/
?? .ai/worklog/claude-524e72a61aeb96b8.md
?? .ai/worklog/claude-ba1ae4453d5c231e.md
?? .ai/worklog/deepseek-db22ebbd5fd21de8.md
?? .ai/worklog/gemini-4261c9c2e2da03ac.md
?? .ai/worklog/gemini-8a06ba8cb343bedc.md
?? docs/reviews/2026-09-23-deepseek-batch-certification-round2.md
?? docs/reviews/2026-09-23-deepseek-batch-certification.md
?? docs/reviews/2026-09-23-gemini-batch-adversarial-prompt.md
?? tests/rulebook.test.cjs
```

HEAD is identical; the only movement is two new `claude-*` journals and one candidate journal
written by other sessions during the review. No candidate file changed between START and END.

---

## Closure verification (each with command and exit code)

| ID | Check | Reproduction | Exit | Status |
|---|---|---|---|---|
| F-001a | `./.ai/bin/x` now FAIL | A4 | 1 | closed |
| F-001b | `.AI/bin/x` now FAIL | A5 | 1 | closed |
| F-001c | `docs/database-notes.md` now RECOMMENDATION | A6, A13, A14 | 0 | closed |
| F-001d | **absolute `D:/Colabs/.ai/bin/x`** | A7 | **0** | **open** |
| F-001e | **absolute `C:/Colabs/.ai/bin/x`** | A8 | **0** | **open** |
| F-001f | **`x/../.ai/bin/x`** | A9 | **0** | **open** |
| F-001g | **`../.ai/bin/x`** | A10 | **0** | **open** |
| F-002a | no declared producer -> BLOCKED, identical under swapped mtimes | C1/C2 | 2,2 | closed |
| F-002b | producer == receipt-owner -> FAIL | C3 | 1 | closed |
| F-002c | independent reviewer -> PASS, stable across mtime swap | C4 | 0 | closed |
| F-002d | producer from candidate journal Evidence owner | C5 | 0 | closed |
| F-003a | append a new block -> no false edit | D0, D4 | 0 | closed |
| F-003b | genuine edit before an internal `---` | D2b, D1, D5 | 1 | closed |
| F-003c | genuine edit **after** an internal `---` (round-2 hole) | D2a | 1 | closed |
| F-003d | deletion of a committed block | D3 | 1 | closed |
| F-003e | separator-only churn, no text change | D6 | 0 | closed |
| F-004a | untracked forbidden `tests/evil.test.cjs` | E1 | 1 | closed |
| F-004b | untracked in-scope file, untracked scope file excluded | E2 | 0 | closed |

---

## F-001 (partially open) - protected-path classification is still not root-anchored

- **Requirement**: spec section 3 / PROTO-DEC-0041 item 4: "anything under `.ai/`" is protected;
  a confirmed finding with a reproduction on it is FAIL and cannot be lowered.
- **Location**: `.ai/bin/protocol-verdict.cjs:32-52`. The fix strips `^(\.\/)+` and `^\/+`,
  converts backslashes and lowercases, then matches `.ai/`/`.claude/` as a string prefix and
  `hooks|validator|gates|security|data` as exact segments. It never resolves the path against the
  repository root, so any spelling whose protected segment is not at the very start fails the
  prefix test.
- **Reproduction** (`%TEMP%\kilo\round3-attacks.cjs`, Part A; each ledger row is
  `confirmed`, `reproduction: node x`, `exit: 1`, `severity: LOW`, requirement `CLI check`):
  ```
  A1  .ai/bin/protocol-verdict.cjs          exit=1  Verdict: FAIL
  A4  ./.ai/bin/protocol-verdict.cjs        exit=1  Verdict: FAIL
  A5  .AI/bin/protocol-verdict.cjs          exit=1  Verdict: FAIL
  A7  D:/Colabs/.ai/bin/protocol-verdict.cjs exit=0 Verdict: RECOMMENDATION
  A8  C:/Colabs/.ai/bin/protocol-verdict.cjs exit=0 Verdict: RECOMMENDATION
  A9  x/../.ai/bin/protocol-verdict.cjs      exit=0 Verdict: RECOMMENDATION
  A10 ../.ai/bin/protocol-verdict.cjs        exit=0 Verdict: RECOMMENDATION
  ```
  A7-A10 print `-> Reason: confirmed finding with reproduction off protected paths` and exit 0.
- **Actual Result**: the same protected file, named with a drive-absolute path - the style this
  repository's own worklogs and reviews use throughout - is silently downgraded to an advisory,
  defeating item 4 in exactly the way the round-2 finding described. `..`-prefixed spellings do
  the same. The substring over-match direction is fixed (A6/A13/A14 exit 0 as required), so this
  is the residual of the same root cause, not a new one.
- **Disposition**: `confirmed` (residual); F-001 is not fully closed.
- **Recommendation / Proposed Fix**: canonicalise with the repository root before classifying,
  e.g. `const rel = path.relative(process.cwd(), path.resolve(process.cwd(), norm))` and reject or
  classify paths that escape the root; do not fall back to a string prefix only.
- **Proof of Closure**: A7-A10 exit 1 / `Verdict: FAIL`.

If the owner rules that non-root-anchored spellings are outside the ledger input contract, then
the four round-2 reproductions are closed and this residual is the only blocker; the tool should
then at least exit 2 on such input rather than downgrade it.

---

## Section-1 conditions, per check

| Check | 1. Recorded rule | 2. Repository-only inputs | 3. Deterministic | 4. Hand-reproducible |
|---|---|---|---|---|
| Verdict arithmetic | PROTO-DEC-0041 item 4, spec section 3 | ledger file only (`node:fs`, `node:path`); no network/model | yes, re-run stable; severity deleted before arithmetic | output names every driving row and the reason |
| Root-cause stop rule | PLAN escalation budget (<=2 attempts) | ledger only | yes | names root cause, attempt, dispositions |
| Scope / forbidden | PLAN legitimization rules, PROTOCOL.md:113 | `git diff -z` + `git ls-files --others -z` + repo files | yes | names each offending path and matched rule |
| Independence | PROTO-DEC-0041 item 1, spec section 6 | `--producer` / review header / candidate journal; TASK.md roles; no mtime | yes, identical under swapped mtimes (C1/C2) | names the rule that matched |
| Immutability fix | DEC-0021 | `git show HEAD:.ai/DECISIONS.md` vs working copy | yes | names the block id and outcome |

No check consults a model or the network: `protocol-verdict.cjs` requires only
`node:fs`/`node:path`; `protocol-scope.cjs` requires `node:fs`/`node:path`/`node:child_process`
and shells out to `git` only. No `Date`, `Math.random`, `mtime` or environment read remains
(grep over both tools). The spec section 5 text was updated to match the untracked-file fix; the
change strengthens the touched set and weakens nothing.

---

## Limits of This Certification

- The peer certifier's report (Copilot) was not read before this verdict was fixed.
- The candidate is uncommitted; the verdict is against HEAD `82bf99a` plus the working tree as
  measured. Other sessions wrote journals during the review; no candidate file moved.
- The residual F-001 finding rests on path spellings. It is reported because item 4 keys on the
  protected path and the tool cannot know that `D:\Colabs\.ai\bin\x` is not the file; the owner
  is the right party to confirm the input contract.
- F-003's fixtures use a valid minimal fixture; the real `.ai/DECISIONS.md` has no internal `---`.

---

## References

- Specification: `docs/specs/2026-09-23-executable-rulebook-spec.md`
- Adversarial prompt: `docs/reviews/2026-09-23-gemini-batch-adversarial-prompt.md`
- Round-1/round-2 reports: `docs/reviews/2026-09-23-deepseek-batch-certification.md`,
  `...-round2.md`
- Decisions: `PROTO-DEC-0038`, `PROTO-DEC-0041` (items 1-4), `DEC-0021` in `.ai/DECISIONS.md`
- Fixtures: `%TEMP%\kilo\round3-attacks.cjs`, `round3-immutability.cjs`
- Associated journal: `.ai/worklog/deepseek-db22ebbd5fd21de8.md`
