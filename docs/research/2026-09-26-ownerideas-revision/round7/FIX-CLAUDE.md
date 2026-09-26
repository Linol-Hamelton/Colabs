Mode: ADVISORY
Baseline: d4c8f3c (HEAD 30ccf43, fix-loop dispatch); working tree status: dirty (round6 edits, this file, my journal)
Reviewer: Claude Opus 5.5, route claude CLI, effort high, 2026-09-26
Scope: stage-7 fix of B1..B3 (B3 = the W1 overlap on `protocol-manifest.json`) in `round6/`
Verdict: FIX COMPLETE

# Stage-7 fix (Claude)

- Frame `task:ownerideas-r7b-claude-fix`; session `claude-d990acada995d601`. Decides nothing,
  certifies nothing. Labels: [F] checked in this session, [I] inference.
- The prompt asks for "B1..B3 and the overlap". In the pre-check the overlap *is* B3 (check 4), so
  one row covers both. What was fixed: B1 (archived `R3-DISPATCH.json`), B2 (the golden row) and
  B3 (the manifest overlap).
- Unchanged: the five packages, E1/E2, risk classes, certification routes, executor dimensions and
  PROTO-DEC-0079..0086. The 16 required headings are still present in every package [F].

## Findings

| # | Fix | Reproduction that now passes |
|---|---|---|
| B1 | PKG-1 Inputs, S3, AC-4, validation command, STOP 3. The dispatch-parity file is now `tests/fixtures/dispatch/R3-DISPATCH.json` (an Allowed path already). PKG-1 creates it as a byte-identical copy of the archived file, whose sha256 `2af34835...5b7f` is pinned in S3. The archived path is read once as provenance (PROTO-DEC-0085 item 5). [F] All ten launch files of that dispatch were archived with F-06, so a copy cannot pass `check` with exit 0 under S3. AC-4 now expects exactly ten `ERROR reason=launch-missing slot=<id>` rows, no grammar row, and exit 1. S3 fixes that row format and the order: the whole file's grammar is checked before launch existence. The copy still covers `when`, `fallback`, `minBalance` and a route without `effort`, which this program's `DISPATCH.json` never uses. | `grep -n R3-DISPATCH PKG-1.md`: every hit is the fixture, except line 68 (the archive path, marked provenance). `sha256sum docs/research/archive/.../prompts/R3-DISPATCH.json` = `2af348353dbe3d0ff5182d7893f63399ec3d6a1b1dfac6d361d15ee22b245b7f` (LF, `eol=lf`). All 10 R3 launch paths are missing from the live tree; every launch path of this program's `DISPATCH.json` exists (node check). |
| B2 | PKG-2 golden-corpus paragraph. [F] The cited row was real: `git show 8fca7ae:docs/research/2026-09-26-ownerideas-revision/USAGE.md` line 21 is `r6-claude-final ... 0 \| 0 ... \| 1 \| FAILED`. At b946355, `run-chain.cjs` rewrote that row to DONE, which is the BACKLOG S-1 defect (last attempt only). The row is now cited by commit, never by the live file. The schema requires fields the row does not have, so each one now has a named source: `head` = fd789ac, the commit that added the slot; `launchSha256` at that commit; `dispatchVersion` = `"git:fd789ac"`; start = the committer time of fd789ac in UTC, `2026-09-26T12:39:40Z`, with end null; reasons `first` and `transient-retry`; `stallMin` 60 from that DISPATCH.json; `hardMin` 120, the PKG-1 S3 default; `completion` all false, null or none. Without these, STOP 3 would fire on `start` and `budget` even with a correct row. | `git show 8fca7ae:...USAGE.md \| sed -n 21p` prints the FAILED row. `git log -S r6-claude-final -- .../DISPATCH.json` gives fd789ac as the commit that added the slot. The values checked against S1-S3: 2 primary fresh attempts ≤ 2; UNCLASSIFIED allowed because the record is FAILED; `tokens.source = none` with nulls; owner selection with empty lists; `fallen` false. The pre-check's `FINAL-RESOLUTION:345` does not restate the row [F: grep], so the resolution needed no B2 change. |
| B3 = W1 overlap | Owner of the W1 `protocol-manifest.json` edit: **the operator at the W1 gate**. Neither executor edits it. [F] No W1 package can own the edit while the other stream runs, for two reasons. The validator fails on a listed file that does not exist yet (`validate-protocol.ps1:142-158`). `tests/manifest.test.cjs:68-72` fails on an on-disk test that is not listed. Whichever executor edited, it would either list files the other stream has not created, or leave the other stream's test unlisted. Moving the edit to W2 (PKG-3) would turn the W1 gate red. [I] So the one edit happens at the only point where both streams rest. It inserts the eight entries named exactly in PKG-1 S11 and PKG-2 S6, then the validator, the suite and the full `record`s run on the edited tree. Changes: PKG-1 and PKG-2 Stream and wave, Allowed paths (manifest removed), Required outputs (entries listed in the journal), S11 and S6 (exact entries; the pre-gate manifest-test failure is expected, and it is not a STOP 4 red), Integration conditions, Artifact plan. Resolution section 6 (W1 gate cell, the one-writer bullet, the integration check order). W2: PKG-3 is the only writer; W3: PKG-5. | `grep -n "insert entries only\|not an Allowed path" packages/*.md` lists PKG-1:91 and PKG-2:66 (not allowed), PKG-3:81 (W2) and PKG-5:73 (W3): one writer per wave. |

## Recommendations also applied (text corrections only; no scope change)

| # | Where | Change |
|---|---|---|
| N-1 | resolution section 2; PKG-2 Inputs | archived paths marked provenance; PKG-2 quotes 77/26/2.96 inline and drops the archived round-3 USAGE input |
| N-2 | resolution section 7, PKG-4 row | "R-L0-23" -> "R-L0-37, R-L0-38" |
| N-3 | PKG-4 S1 paragraph | "six factors are the parameters" -> "operationalize the four parameters", with the mapping (Novelty and Ambiguity; Reversibility and Protected paths; Coupling; Independent judgement), checked against `DECISIONS.md:3112-3117` |
| N-4 | resolution section 7, PKG-5 row | adds PKG-3 (the fall hook) |
| N-5 | PKG-4 S3 item 1 | names the wrap at `CORE-ARCH-4.md:75-76` (break after "когда") [F] |
| N-6 | PKG-1 S2 items 2 and 5 | `flag` adds kilo/mimo `--variant` (`run-chain.cjs:35,42`) [F]; codex `-C`, kilo `--dir` and vibe `--workdir` kept from run-chain |
| N-7 | PKG-1 AC-15; PKG-4 AC-5 | marked "reviewer check, not a mechanical gate" |

## For the re-check

- Re-run checks 4 and 5 (pre-check section 6). Also look at N-1..N-7, since they changed text.
- [I] The B3 choice makes the operator the writer of a protected root file for one mechanical
  insertion. The edit is covered by the W1 gate's validator, suite and full `record`s, and by the
  stage-12 frozen-candidate certification. If the owner prefers an executor, E1 can be re-invoked
  at the gate for this one step; the entry lists stay as they are.
- A path sweep over `round6/` found no other cited input missing from the live tree. Every other
  missing path is a file a package creates.
