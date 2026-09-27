Mode: ADVISORY
Baseline: fefe187 (HEAD); stage-7 fix in the working tree (round6 edits uncommitted): FINAL-RESOLUTION-CLAUDE.md, PKG-1.md, PKG-2.md, PKG-4.md; fix baseline d4c8f3c..30ccf43; frozen corpus 7b6d17a; working tree status: dirty (round6 fixes, round7/FIX-CLAUDE.md, journals)
Reviewer: DeepSeek 4.1 Flash, route kilo, effort max (prompt-frozen; the route exposes no effort flag), 2026-09-26
Scope: stage-7 re-check of the B1..B3 fixes and of `round6/packages/PKG-1..5.md` for stale paths, invented fixtures, same-wave collisions and non-verifiable acceptance criteria
Verdict: PASS

# Stage-7 re-check (DeepSeek)

- Frame `task:ownerideas-r7c-deepseek-recheck`; role: verify, decide nothing (AGENTS.md section 2;
  `prompts/COMMON.md`). Labels: **[F]** checked in this session, **[I]** inference, **[Q]** open question.
- All three BLOCKING findings of `round7/PRE-CHECK-DEEPSEEK.md` now hold. I re-ran its checks 4 and 5
  (its section 6) and the four defect classes over the five packages; no new blocking defect found.

## 1. B1 (archived dispatch file) — FIXED

- [F] The stale path is gone, the archive path exists, and PKG-1 names the fixture whose sha256 it pins:
```
Test-Path 'docs/research/2026-09-25-validator-migration-council/prompts/R3-DISPATCH.json'          # False
Test-Path 'docs/research/archive/2026-09-25-validator-migration-council/prompts/R3-DISPATCH.json'  # True
(Get-FileHash -Algorithm SHA256 <archive above>).Hash   # 2AF34835...B245B7F
```
  The value equals the lowercase digest pinned at `PKG-1.md:226`.
- [F] Every `R3-DISPATCH` hit in `PKG-1.md` is now the fixture (`:66`, `:225`, `:367`, `:386`, `:458`)
  except `:68`, the one archive path marked "provenance only" (PROTO-DEC-0085 item 5).
- [F] The parity result is achievable: the archived file has exactly 10 slots and all 10 launch files
  are absent from the live tree, so AC-4's "ten `ERROR reason=launch-missing` rows, no grammar row,
  exit 1" is deterministic. The file exercises the claimed keys (`when` x1, `fallback` x4,
  `minBalance` x3, a route without `effort`).
- [I] `minBalance` sits inside `fallback` objects, which `run-chain.cjs:139` treats as a route; S3
  accepts it. Minor wording, not a defect.

## 2. B2 (golden corpus row) — FIXED

- [F] The cited row is real at the named commit and differs from the live file exactly as stated:
```
git show 8fca7ae:docs/research/2026-09-26-ownerideas-revision/USAGE.md   # line 21:
| r6-claude-final | claude | claude-opus-5-5 | high | 0 | 0 | 0.00 | 0/0 | 0.00 | 0 | 1 | FAILED |
Select-String .../USAGE.md -Pattern r6-claude-final   # live: ... | 13 | 466 | ... | 0 | 0 | DONE
git merge-base --is-ancestor 8fca7ae HEAD    # True (reachable)
```
- [F] The added field sources reproduce: `fd789ac` is an ancestor and the commit that added the slot
  to `DISPATCH.json`; its committer time is `2026-09-26T15:39:40+03:00` = `2026-09-26T12:39:40Z`; that
  file has `stallMin: 60` and no `version` key; the launch file exists at that commit.
- [F] The archived round-3 `USAGE.md` input is dropped and 77/26/2.96 is quoted inline
  (`PKG-2.md:48-50`); the resolution no longer restates the row (grep: only the frame name and fix log).
- [I] The record is expressible without an invented value: every field the row lacks has a named
  source or the document's stated `null`/`UNCLASSIFIED`/`"none"` default (STOP 3 does not fire).

## 3. B3 (W1 manifest overlap) — FIXED

- [F] W1 now has a single writer. `PKG-1.md:44,91` and `PKG-2.md:36,66` both state that neither
  executor edits `protocol-manifest.json`; the operator inserts the eight entries at the W1 gate.
  `PKG-3.md:81` (W2) and `PKG-5.md:73` (W3) are the only package writers; `PKG-4.md:72` forbids it.
- [F] The rationale reproduces: `validate-protocol.ps1:142-158` fails on a listed file that does not
  exist, and `tests/manifest.test.cjs:68-72` fails on an on-disk test that is not listed.
- [F] `.ai/docs/CLI-AGENTS.md` still has one writer per wave: PKG-1 (W1), PKG-3 (W2), PKG-5 (W3).
- [F] The counts agree: PKG-1 S11 = 5 entries, PKG-2 S6 = 3 entries = the "eight entries" of
  resolution section 6. Both packages carry the edit as an integration condition.

## 4. N-1..N-7 (text corrections) — applied

[F] N-1 archived paths marked provenance, figure inlined; N-2 resolution PKG-4 row reads
`R-L0-37, R-L0-38`; N-3 `PKG-4.md:111-114` maps the six factors onto the four parameters of
PROTO-DEC-0075 item 8 (verified against `.ai/DECISIONS.md:3112-3117`); N-4 resolution PKG-5 row adds
PKG-3; N-5 names the wrap at `CORE-ARCH-4.md:75-76` (line 75 ends "когда", line 76 begins
"существует"); N-6 kilo/mimo `--variant` added and codex `-C` kept (`run-chain.cjs:33,35,42`);
N-7 PKG-1 AC-15 and PKG-4 AC-5 marked "reviewer check, not a mechanical gate".

## 5. Re-scan of the four defect classes

| Class | Result | Basis |
|---|---|---|
| Stale paths | PASS | A sweep of every backticked path and every `docs/research/`, `.ai/`, `tests/`, `docs/`, `OwnerIdeas/` token in the resolution and the five packages found no missing input. Every missing path is one a package creates (or a schema name). `docs/ops/model-evidence/` and `.ai/core/` are future/forbidden names, not inputs. |
| Invented fixtures | PASS | The only non-synthetic fixture (R3) is a byte copy of a real archived file with a matching sha256; the golden record is sourced by commit. |
| Same-wave collisions | PASS | W1 PKG-1/PKG-2 disjoint; W2 PKG-3/PKG-4 disjoint; W3 PKG-5 alone. `protocol-manifest.json` and `.ai/docs/CLI-AGENTS.md` have one writer per wave. |
| Non-verifiable ACs | PASS | The two manual checks are marked reviewer checks (N-7); AC-4 is a deterministic row count; no AC depends on a file another same-wave package owns. |

## 6. Open questions and notes

- [Q] Carried from the pre-check: the header asks for `effort max`, while the kilo route exposes no
  effort flag; the journal Launch line records the route reality.
- [F] Independence: I read only the files named in the launch, pre-check and fix prompts. No commits,
  tags, pushes or branches; the only files written are this report and my journal.
