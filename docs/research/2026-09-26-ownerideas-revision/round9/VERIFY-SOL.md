Mode: CERTIFYING
Reviewed CANDIDATE: 7f199c50589ce3b5b34680e70be21e9a43aeeac1 (full SHA; confirmed with `git rev-parse HEAD` in a detached worktree)
Receipt-Owner: codex-8459a69abda6f8ba
Reviewer: GPT-5.6 Sol, route codex, effort medium, 2026-09-27 UTC
Scope: stage-11 verification of the repaired implementation
Verdict: PASS

## Baseline and method

- FACT: `git rev-parse HEAD` in the detached verification worktree returned
  `7f199c50589ce3b5b34680e70be21e9a43aeeac1`; its initial and final
  `git status --porcelain` were empty.
- FACT: `prompts/VERIFY.md:6,32` still names the earlier candidate `f3ab4b8`, while its input rule
  at `prompts/VERIFY.md:13-14` permits a later repair candidate. The later frozen implementation is
  `7f199c5`, and both final certification reports identify that SHA
  (`round8/CERT-KIMI-PKG2-R3.md:2-8`; `round8/CERT-MIMO-PKG2-R3.md:2-8`).
- INFERENCE: the later explicit frozen candidate governs the stale literal in the report template;
  reporting `f3ab4b8` would certify blobs that do not contain the final repairs.
- FACT: all executable checks below ran independently in a detached worktree at `7f199c5`; the two
  live registry/resolver probes ran outside the restricted sandbox so the installed clients were
  visible. No repair was made.

## Stage-9 findings F-1 through F-5

| Finding | Independent reproduction on `7f199c5` | Result |
|---|---|---|
| F-1, missing PKG-5 audit prompt (`round8/IMPLEMENTATION-REVIEW-DEEPSEEK.md:84-91`) | `docs/reviews/2026-09-26-gemini-ownerideas-pkg-5-audit-prompt.md` exists, is 31 lines, and has a distinct probe for AC-1 through AC-15 (`:13-31`) | resolved |
| F-2, wrong run-record classes (`IMPLEMENTATION-REVIEW-DEEPSEEK.md:93-104`) | Replaced a golden attempt class in memory: `AUTH_ERROR` produced `[]`; obsolete `SCOPE` produced the canonical-enum error. The canonical set is in `.ai/bin/protocol-runrecord.cjs:69-75` and pass-through mapping in `.ai/bin/protocol-dispatch.cjs:996-1007` | resolved |
| F-3, incomplete output-schema class list (`IMPLEMENTATION-REVIEW-DEEPSEEK.md:106-116`) | `docs/specs/bin-output-schema.md:27-41` names all fifteen classes and the actual `protocol-scope.cjs` / `protocol-verdict.cjs` inventory | resolved |
| F-4, tests pollute canonical stores (`IMPLEMENTATION-REVIEW-DEEPSEEK.md:118-130`) | Dispatch tests ran 26/26 including the guard; `git status --porcelain` remained empty. Test-wide isolated stores are set at `tests/dispatch.test.cjs:24-48`; runtime overrides are read at `.ai/bin/protocol-dispatch.cjs:1587-1597` | resolved |
| F-5, stale registry / non-reproducible AC-15 (`IMPLEMENTATION-REVIEW-DEEPSEEK.md:132-142`) | Live probes: `vibe` = `vibe 2.25.8`, `claude` = `2.1.283 (Claude Code)`, both exit 0. Live resolver rows exactly matched PKG-3 AC-15: T7 kernel chose vibe plus agy and exited 1 with `ASK_OWNER reason=shortfall`; T3 other chose vibe plus agy and codex and exited 0 | resolved |

## Later repair claims

| Claim set | Independent evidence | Result |
|---|---|---|
| PKG-2 real pins and golden DONE row (`round9/REPAIR-PKG2-GEMINI.md:17-18`) | Run-record tests verified the real Git object pins, rejected invented pins, and validated exact on-disk serialisation of the DONE and historical rows | resolved |
| PKG-2 residuals R2-1..R2-4 (`round9/REPAIR-PKG2-R3-GEMINI.md:17-20`) | CLI emitted two `VALID line=` rows; render headers were `Model ran` / `Effort used`; T13 matched `golden.md` byte-for-byte; the all-command stdout-pattern check passed | resolved |
| PKG-5 implementation claims (`round9/REPAIR-PKG5-GEMINI.md:16-25`) | Signals tests ran 9/9; live ledger `check` returned 95 signals and 0 invalid; dispatcher T26 exercised fall, no-resume procedure-gap, and ledger-error tolerance | resolved |
| Usage and cost repair (`round9/REPAIR-USAGE-GEMINI.md:13-15`) | Dispatch T27-T29 reproduced all three parsers, negative strings, per-attempt usage, same-unit sums, mixed-unit null totals, and both distinct missing-usage reasons (`tests/dispatch.test.cjs:1182-1518`) | resolved |
| Hygiene and fixture lifecycle (`round9/REPAIR-HYGIENE-GEMINI.md:16-26`) | Dispatch T6-T29 and the final tracked-file guard all completed; no tracked or untracked residue remained in the verification worktree | resolved |

## Regression and package checks

| Command | Exit | Observed result |
|---|---:|---|
| `node --test tests/runrecord.test.cjs` | 0 | T1-T14, repository-pin negative test, golden equality, CLI pattern |
| `node --test tests/resolver.test.cjs` | 0 | 7/7 including AC-15 fixture cross-check |
| `node --test tests/signals.test.cjs` | 0 | 9/9 |
| `node --test tests/dispatch.test.cjs` | 0 | 26/26 including T27-T29 and guard |
| `protocol-runrecord.cjs validate .../golden.jsonl` | 0 | 2 valid rows, 0 invalid |
| `protocol-signals.cjs check` | 0 | 97 lines, 95 signals, 0 invalid |
| `protocol-signals.cjs count` | 0 | 95 total, 91 open |
| Dispatcher `check` on program dispatch | 0 | 36 slots |
| Dispatcher `check` on parity fixture | 1 | exactly 10 expected `launch-missing` rows |
| `validate-protocol.ps1` | 0 | protocol healthy; one WARN-only journal-count notice (142 > 100) |
| `test-protocol.ps1` | 0 | 419/419 tests, 0 failures, 523039 ms |
| final `git status --porcelain`; `git diff --check` | 0 | no output |

## Plan, package, and scope conformance

- FACT: the five package outputs and their manifest registrations are present; the manifest test is
  included in the green full suite. The package path contracts are at `round6/packages/PKG-1.md:75-103`,
  `PKG-2.md:54-78`, and the corresponding Allowed/Forbidden sections of PKG-3..5.
- FACT: implementation history separates W1 package commits (`78a22f0`, `4793cb0`), the W2/W3
  integration checkpoint (`1fd27ce`), hygiene (`aa52c42`), PKG-2 pin repair (`b8781ca`), and final
  usage/residual repair (`7f199c5`). The repair commit paths are package implementation/test paths
  plus their reports and own journals; no second implementation was introduced.
- FACT: the single-source boundaries remain explicit: `.ai/docs/clients.json` is the client registry
  (`.ai/docs/CLI-AGENTS.md:50,174-176`); `docs/ops/model-ladder.json` is hash-gated
  (`.ai/bin/protocol-dispatch.cjs:634-635`); `docs/ops/RUNS.jsonl` feeds rendering and reporting
  (`.ai/docs/CLI-AGENTS.md:183`); `docs/specs/signals-ledger.md` is the one signals grammar
  (`.ai/docs/CLI-AGENTS.md:190`).
- FACT: PKG-4 has `P-L2-002` 0.5 with `Independent judgement`, root rules R-L0-37/R-L0-38 exactly
  once, and `P-L0-009` 0.1 with R-L0-38.1-.6 (`P-L2-002-model-selection.md:3,67,149`;
  `L0-ROOT.md:50,86`; `P-L0-009-authorised-action.md:3,30-49`).
- INFERENCE: the repaired candidate conforms to the approved resolution and package boundaries;
  the only observed warning is the pre-existing WARN-first journal-count condition, not a candidate
  defect or an unmet package criterion.

## Closed result

FACT: no open blocking item was reproduced. Every stage-9 finding and later repair claim tested in
scope is resolved, the package validations and full protocol suite are green, and the candidate
worktree remains unchanged.
