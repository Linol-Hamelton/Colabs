# Codex - Assessment of Claude's path-contract and certification proposal

**Date**: 2026-09-23 (UTC)
**Reviewed commit**: 82bf99a8e2bfcde3ff375b9995f3ab45edb7ddc5
**Working tree**: dirty; pre-existing candidate tools/tests are untracked
**Reviewer**: Codex (GPT-6), session codex-0fbe73da5f39d5b7
**Scope**: architecture; owner-requested assessment, not batch certification
**scope-check**: PASS
**Verdict**: FAIL
**Mode**: ADVISORY
**Receipt-Owner**: codex-0fbe73da5f39d5b7
**Receipt**: own session journal, recorded with protocol-handoff.cjs

## Executive Summary

Prefer A, but reject the assertion that rejecting absolute paths and `..` is enough
to finish the candidate. The current tool also downgrades confirmed findings on the
ordinary repository-relative `validate-protocol.ps1` and `protocol-manifest.json`.
The verdict concerns readiness of the proposed closure; this assessment fills neither
independent certification slot, since peer reports were deliberately read.

## Sources, scope and evidence

Read AGENTS, TASK, git status/log/inventory, recent Claude/Gemini/DeepSeek journals,
DECISIONS 0040-0045, the approved PLAN policy, specification, all three batch reports,
Gemini's unified prompt, verdict/scope implementations and relevant regression tests.
Checked named sources against `git ls-files`; candidate tools and tests are present
but untracked, while the spec and historical decisions are tracked. The large
cycle-history sources surfaced by inventory are historical context, not substituted
for the current implementation. Reviewed the Kilo evaluation's S3/decision-index basis.
The Jev evaluation remains absent at the TASK-named repository path; its empirical
claims cannot independently support this recommendation.

Writes authorized by this assessment: own prompt/report/journal, disposable runtime
fixtures, and a locked TASK Open questions entry. No candidate code/spec/tests changed.
Local probes used the actual CLI. `node --test tests/rulebook.test.cjs`: 26/26 passed.
Full protocol checks and their real exit codes are recorded in the journal Evidence.

## Reproduction: path branch isolated from the requirement branch

Save the following ledger in a disposable file, then run
`node .ai/bin/protocol-verdict.cjs <ledger-file>`. Substitute only `paths` unless noted.

```markdown
| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |
|---|---|---|---|---|---|---|---|---|
| F-1 | RC-path | CLI check | .ai/bin/x.cjs | node x | 1 | LOW | confirmed | 1 |
```

These are classifier fixtures: `node x` is a stored reproduction string, not a claim
that a real defect in x was executed. The actual reproduced defect is CLI arithmetic.

| paths / changed field | Observed verdict | Exit |
|---|---|---|
| `.ai/bin/x.cjs` | FAIL | 1 |
| `docs/notes.md` | RECOMMENDATION | 0 |
| `D:/Colabs/.ai/bin/x.cjs` | RECOMMENDATION | 0 |
| `C:/Colabs/.ai/bin/x.cjs` | RECOMMENDATION | 0 |
| `../.ai/bin/x.cjs` | RECOMMENDATION | 0 |
| `x/../.ai/bin/x.cjs` | RECOMMENDATION | 0 |
| `/home/u/colabs/.ai/bin/x.cjs` | RECOMMENDATION | 0 |
| `D:.ai/bin/x.cjs` | RECOMMENDATION | 0 |
| UNC `\\server\share\.ai\bin\x.cjs` | RECOMMENDATION | 0 |
| `validate-protocol.ps1` | RECOMMENDATION | 0 |
| `protocol-manifest.json` | RECOMMENDATION | 0 |
| `validate-protocol.ps1`, requirement `invariant X` | FAIL | 1 |

### F-C01: ordinary validator and manifest paths are not protected

Requirement: PROTO-DEC-0041 item 4 explicitly protects validator and manifest;
PROTO-DEC-0038 also names validator. Expected for the last two ordinary-path probes
with neutral requirement: FAIL/1. Actual: RECOMMENDATION/0. Disposition: confirmed.
Location: `.ai/bin/protocol-verdict.cjs`, PROTECTED_PREFIXES/PROTECTED_SEGMENTS and
isProtectedPath. Exact segment `validator` does not match `validate-protocol.ps1`;
no constant identifies `protocol-manifest.json`. Rule 3 can hide both failures.
The test titled "validator / gate / hooks" exercises only `hooks/pre-commit.sh`.
Proof of closure: separate neutral-requirement CLI tests for each real protected
entry, with FAIL/1, and ordinary controls remaining RECOMMENDATION/0.
This is a mapping defect, distinct from path syntax; A alone cannot repair it.

## Assessment of Claude's reasoning

1. **Support A.** A lexical, repository-relative input contract avoids dependence on
   checkout location and host path semantics. Reject malformed paths before computing
   verdicts, across all rows. State the grammar for POSIX roots, Windows drive-absolute
   and drive-relative paths, UNC/device roots, both separators, and `..` segments.
   Specify whether `./`, repeated separators, case variants and backticks are accepted
   or rejected. Do not let individual implementations silently invent these rules.
2. **Qualify the argument against B.** `path.resolve`/`relative` against the current
   checkout is unsuitable as proposed. Reproduced with Node's win32/posix variants:
   D:/Colabs as root gives `.ai\bin\x.cjs`, whereas /home/u/colabs as root gives
   `D:/Colabs/.ai/bin/x.cjs` for the same input string. But lexical normalization under
   a fixed virtual root can be deterministic; canonicalization in general is not
   mathematically incompatible with the boundary. A is the smaller practical choice.
3. **Reject "A introduces no rule" as stated.** "Repository paths" does not uniquely
   mean canonical relative strings without `..`. `x/../.ai/bin/x.cjs` can denote an
   in-repository file; `../.ai/bin/x.cjs` escapes this checkout and is not the same file.
   Nor is C:/Colabs necessarily this D:/Colabs repository. Their silent acceptance is
   the concern. A is an explicit contract refinement requiring the proposed owner ruling.
4. **Support the stop, preserve history.** PLAN allows two remediation attempts per
   root cause; DeepSeek records attempt 2 and the owner supplies Claude's concession.
   Do not infer attempt count just from three review filenames: round 1 reviewed an
   absent candidate. The reports lack one shared ledger with root-cause/attempt columns,
   so the exact count is reported history, not independently reconstructed arithmetic.
   Any owner-authorized continuation must retain F-001, past attempts and the new
   premise/budget; relabelling an attempt is not an authorization mechanism.
5. **Commit helps identification, not isolation.** A candidate commit should be named
   explicitly uncertified. The current scope checker still reads working-tree changes
   and untracked files after a commit. A quiet checkout or separate reviewer worktrees
   at one candidate SHA is needed. Check candidate scope against the PRE-change baseline;
   resetting baseline to the candidate can make the intended change disappear from diff.
   Define allowed review-artifact writes and receipt sequencing before starting.
6. **Two independent certifiers remain required.** Different model families are a
   preference, not a rule or proof of independence. A fresh Claude session is not
   automatically independent of its author's task framing. Select sessions outside
   execution/control, with actual capabilities; both need the same frozen package,
   simultaneous work and separate attack angles. This consultation is not one slot.
7. **Praise the controlled self-correction.** Claude identified why `invariant X`
   masked the path defect and disclosed the budget inconsistency. DeepSeek preserved
   a reproduced failure despite a green suite. Keep both behaviours in the next review.

## Urgent recommendations to the owner

Approve A only with an explicit grammar and bounded continuation, while retaining the
new F-C01 mapping finding. Require tests against actual protected repository filenames,
not just synthetic directory names, and no `invariant|contract` words in path probes.
The requirement-text regex itself remains a limitation: a phrase such as `contractual
wording suggestion` on docs returns FAIL; naming a decision ID alone does not encode
whether its rule is an invariant. Future mechanization should consume an explicit
reviewer classification, not infer intent from prose; this is a separate contract
question and not authorization for a new implementation in this session.

Before implementation/review dispatch, reconcile stale TASK state, reserve journal
capacity, and publish a current unified prompt: Gemini's existing prompt still describes
the superseded `---`-terminating immutability regex. Its immutable historical copy stays.
Measured before these artifacts: 56 review files / 546167 B; worklog directory 32 files
including README (31 session journals). Recover capacity without touching live sessions.
Commit only on owner authorization, isolate the candidate, then run the required pair.
Do not promise "one small change and ready": F-C01 already falsifies that premise.

## References

- `docs/specs/2026-09-23-executable-rulebook-spec.md`, sections 1-4.
- `docs/reviews/2026-09-23-deepseek-batch-certification{,-round2,-round3}.md`.
- `docs/reviews/2026-09-23-gemini-batch-adversarial-prompt.md`.
- `.ai/DECISIONS.md`: PROTO-DEC-0038, 0041-0045; `.ai/PLAN.md` escalation policy.
- Own assessment prompt: `2026-09-23-codex-path-contract-assessment-prompt.md`.
