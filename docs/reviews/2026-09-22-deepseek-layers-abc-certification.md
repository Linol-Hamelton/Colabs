# DeepSeek - Layers A/B/C independent certification (PROTO-DEC-0044)

**Date**: 2026-09-22 (UTC)
**Reviewed commit**: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
**Working tree**: dirty (Layers A/B/C uncommitted over earlier uncommitted work on the same tree)
**Reviewer**: DeepSeek (deepseek-flash), session `deepseek-c13aad462dc55cde`, owner `deepseek-c13aad462dc55cde`
**Scope**: adversarial certification of the PROTO-DEC-0044 package; protocol core (PROTO-DEC-0038 item 1)
**scope-check**: PASS
**Verdict**: FAIL
**Mode**: CERTIFYING
**Receipt-Owner**: deepseek-c13aad462dc55cde
**Receipt**: `node .ai/bin/protocol-handoff.cjs record --owner deepseek-c13aad462dc55cde` at session end; the journal entry names this review path.

## Executive Summary

The package is structurally sound on isolation and staleness (C-1, C-4), the full suite and
validator pass, and the installer delivers both tools. It fails on path encoding: `git ls-files`
is consumed without `-z` or `core.quotePath=false`, so under the default configuration Layer A
silently omits qualifying large documents with non-ASCII names and Layer C mis-counts them as
different units. That is the exact silent-omission failure both layers exist to remove, on a
protected path, and it is reproduced below twice. Four smaller undeclared limits were also
confirmed. Two further observations are INFO.

## Commands Executed (real output)

- `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> exit 0,
  "Protocol OK. 1 warning(s)."; the warning is the journal count only (31/30, WARN-first).
- `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` -> exit 0; 315/315 pass,
  0 fail; duration 338703 ms. Both handoff numbers reproduce.
- `node .ai/bin/protocol-index.cjs` -> `.ai/runtime/decisions-index.md: 44 block(s), 85 path(s),
  14800 bytes`; `--check` -> exit 0, "current". Matches PROTO-DEC-0044.
- Environment: Windows 10, Node v22.21.0, PowerShell 5.1; git with `core.quotePath` unset (default true).

## Findings Ledger (PROTO-DEC-0041)

| ID | Requirement | Candidate | Reproduction | Actual Result | Severity | Disposition |
|---|---|---|---|---|---|---|
| F-1 | DEC-0044 item 1: inventory keeps extensions, drops only <50,000 B, injects the eight largest; item 3: cover accounts for every unit | hooks.cjs:328, ledger.cjs:42 | see F-1 | Non-ASCII paths are C-quoted by git; Layer A silently drops them, Layer C invents quoted pseudo-units | HIGH | confirmed |
| F-2 | Advisory report must state what was measured; corpus is taken from the repository | ledger.cjs:33-75 | see F-2 | A missing records/producer directory is silently treated as empty; `dup` reports "compared" a path that does not exist, exit 0 | MEDIUM | confirmed |
| F-3 | AGENTS.md section 9: the index tells which decisions name the path about to change | index.cjs:72-84 | see F-3 | 4 of 60 real repo path references are dropped (extensionless root files); undeclared in C-8's list | LOW | confirmed |
| F-4 | Tool must fail with an actionable message, not a stack trace | index.cjs:86-89, ledger.cjs:51-60 | see F-4 | Uncaught ENOENT stack on absent DECISIONS.md or `--root`; exit 1 but no diagnosis | LOW | confirmed |
| F-5 | cover corpus walk: units of the corpus | ledger.cjs:51-59 | see F-5 | Junction/symlink directories are neither recursed nor named; content silently absent from the ledger | LOW | confirmed |
| F-6 | The inventory block is bounded and displaces nothing | hooks.cjs:366-367 | see F-6 | Real displacement exists (7->5 journal headings in a tight fixture) but every reduction is explicitly labelled | INFO | observation |
| F-7 | Validator 0 warnings claim at handoff | validate-protocol.ps1 output | re-run | 31 journals/30 cap, WARN-first; caused by the two certifier journals, validator exit 0 | INFO | observation |

## F-1 - HIGH - git C-quoting silently drops non-ASCII paths

- **Requirement**: PROTO-DEC-0044 item 1 (the inventory keeps document extensions outside the
  skip list, drops only anything under 50,000 B, and injects the eight largest) and item 3
  (`cover` accounts for every unit of the corpus with a record or an explicit absence).
- **Location**: `.ai/bin/protocol-hooks.cjs:328` (`git(root, ['ls-files'])` split on newlines);
  `.ai/bin/protocol-ledger.cjs:42` (same call, same split).
- **Reproduction (Layer A)**: fixture git repo with 10 x 120-210 KB ASCII `docs/big-*.md`,
  `docs/крупный.md` (155 KB), `docs/index-only.md` tracked but deleted from disk; commit,
  then `node .ai/bin/protocol-hooks.cjs SessionStart` with `{"cwd":<fixture>,"session_id":"x"}`.
  - `git ls-files` output line: `"docs/\320\272\321\200\321\203\320\277\320\275\321\213\320\271.md"` (quoted, escaped).
  - Observed: block lists `big-01..big-08`, "... 2 more", exit 0; `крупный` absent.
  - Control: `git config core.quotePath false`, same hook -> block lists `docs/крупный.md (155 KB)`,
    "... 3 more". The file qualifies under every stated rule; only the parser drops it.
- **Reproduction (Layer C)**: same fixture repo made git-visible with `крупный.md` and
  `records/крупный.md.md`; `node .ai/bin/protocol-ledger.cjs cover --records records --out out.md`
  -> exit 1, `units 4, with record 1, without 3, unexpected 1`. The 4 "units" include two
  C-quoted strings; the real unit and its real record are both reported as missing/unexpected.
- **Actual Result**: silent omission in Layer A (the failure the layer was built to prevent);
  wrong unit attribution and a false defect report in Layer C. The fleet has Cyrillic-named
  material and an owner working in ru-RU, so this is reachable, not theoretical.
- **Disposition**: confirmed.
- **Recommendation**: use `git ls-files -z` and split on NUL (the same module already does this
  in `snapshot()`), or add `-c core.quotePath=false`; prefer `-z`, which also survives newlines.
- **Proof of Closure**: re-run both fixtures and require `крупный.md` in the top-8 and a
  `records/крупный.md.md` match.

## F-2 - MEDIUM - missing input directories are silently treated as empty

- **Requirement**: the tool reports what was measured; `dup` reports records shared between
  producers (PROTO-DEC-0044 item 3).
- **Location**: `.ai/bin/protocol-ledger.cjs:64-75` (`listFiles` returns [] when the directory
  does not exist), `:42-49` (walk on a nonexistent root).
- **Reproduction**: `node .ai/bin/protocol-ledger.cjs dup producer1 does-not-exist --out out/dup.md`
  -> exit 0; report header reads `- compared: .../producer1, .../does-not-exist` and
  `identical across sets: 0`. `cover --records no-such-dir` -> exit 0,
  `units 5, without record 5`.
- **Actual Result**: a typo'd or unmounted producer path produces a clean-looking "no duplicates"
  report and exit 0; indistinguishable from a real clean comparison. In the arena use case this
  is the copy detector silently not checking one arm.
- **Disposition**: confirmed.
- **Recommendation**: resolve and validate every directory first; exit non-zero naming the path
  before writing any report.
- **Proof of Closure**: `dup p1 missing` exits non-zero with the path named; a regression test.

## F-3 - LOW - reverse index drops extensionless root files (undeclared limit)

- **Requirement**: AGENTS.md section 9 item 4, "including which decisions name the path you are
  about to change".
- **Location**: `.ai/bin/protocol-index.cjs:72-84` (`token.includes('/') || PATH_EXTENSION`).
- **Reproduction**: script over the real `.ai/DECISIONS.md` and the built index: 295 backticked
  tokens, 60 resolve to existing repo paths, 4 are absent from the reverse map:
  `.gitattributes`, `.gitignore`, `LICENSE`, `.editorconfig`.
- **Actual Result**: a reader asking "which decisions bind `.gitattributes`?" gets no row,
  although decisions 0009-0010 region discuss it. Contextual mentions only today; the promise
  is still not held for those paths, and C-8's declared-limits list does not name this.
- **Disposition**: confirmed.
- **Recommendation**: admit slash-less tokens whose name exists at the repo root.
- **Proof of Closure**: the four tokens appear in the reverse section of a rebuilt index.

## F-4 - LOW - uncaught ENOENT stack instead of a diagnosis

- **Location**: `.ai/bin/protocol-index.cjs:86-89`; `.ai/bin/protocol-ledger.cjs:51-60`.
- **Reproduction**: in a directory without `.ai/DECISIONS.md`,
  `node protocol-index.cjs --check` -> exit 1, stderr begins `node:fs:441` ENOENT stack;
  `cover --root no-such-root` -> exit 1, `node:fs:1583` readdir stack.
- **Actual Result**: non-zero exit is correct, the message is not: no file named, no action given.
- **Disposition**: confirmed. **Recommendation**: wrap `main` and print
  `DECISIONS.md not found under <root>; install the protocol there`.
- **Proof of Closure**: the two commands print a one-line diagnosis and exit 1.

## F-5 - LOW - non-git walk omits junction/symlink directories

- **Location**: `.ai/bin/protocol-ledger.cjs:51-59` (`entry.isDirectory()` / `entry.isFile()`).
- **Reproduction**: non-git corpus with `a.md`, `b.md`, `sub/c.md` and a directory junction
  `linked` -> a sibling directory holding `d.md`; `cover --root corpus --out out.md` -> exit 1,
  `units 4` (a, b, c, and the excluded-set controls). `d.md` is absent and unnamed.
- **Actual Result**: silently omitted corpus content in the non-git branch (the `D:\mcp-stack`
  case). No hang: the walk never follows links, so the symlink-cycle half of C-6 is refuted.
- **Disposition**: confirmed. **Recommendation**: detect reparse points and either recurse with
  a visited-set or report them explicitly as unaccounted.
- **Proof of Closure**: the junction's unit appears, or the report names the omitted link.

## F-6 / F-7 - INFO observations

- F-6: shaped repo, 12 journals, large TASK, qualifications present: with the block, 5 journal
  headings (4 full); without it, 7 headings (5 full). Displacement is real, so the prompt's
  "section list identical" claim is not general; the decision's word is "bounded" (block <= 900),
  and every reduction is labelled ("Not injected in full", "N additional worklog(s) omitted").
  No silent truncation.
- F-7: validator reports `[WARN] 31 session journals ... (cap 30, PROTO-DEC-0037 WARN-first)` and
  exit 0. The warning is produced by the certifier sessions' own journals (including this one).

## Claim-by-Claim Disposition

| Claim | Disposition |
|---|---|
| C-1 tools cannot influence a gate | CONFIRMED. No code path: grep finds no consumer of the three outputs in hooks/validator/handoff/lock/session/archive; the receipt digest excludes `.ai/runtime/` (handoff.cjs:1004-1011); `.ai/runtime/` is git-ignored (.gitignore:14). Empirically: corrupted all three runtime artifacts, re-ran the validator -> output byte-identical, exit 0. |
| C-2 no displacement | PARTLY REFUTED, not blocking. Displacement measured (F-6); all losses labelled; bounded claim holds. |
| C-3 inventory robust input handling | PARTLY REFUTED: quoted paths mis-parse silently (F-1). No-throw cases verified: index-only path deleted from disk (skipped), repo with no commits (exit 0, "(No commits yet.)"), 3000-file index (hook exit 0 in 1,627 ms), git absent from PATH (hook degrades to "hook check unavailable", exit 0 — pre-existing `rootFor` behaviour). |
| C-4 index staleness and honesty | CONFIRMED for the claims made. `--check`: 0 current; 1 after a same-byte-count edit; 1 missing; the header states it is not a source of truth and never Evidence. Not claimed: tamper resistance (a hand-edited hash line would pass — noted, not a defect). Empty `Decision:`, `(a)`-numbered, template `PROTO-DEC-nnnn`, heading-like colophon all handled; 45 `###` headings = 44 blocks + template. |
| C-5 reverse path index honest | CONFIRMED with F-3: backticks-only prevents prose leakage; 56/60 real references indexed, 4 dropped as F-3. |
| C-6 corpus from the repository | CONFIRMED except F-5 (junctions) and the author's own `$report/` self-correction, which the tool handles as documented: `--exclude logs` keeps `logs-old` (prefix semantics correct). |
| C-7 exit codes | CONFIRMED for cover: record-without-unit always exit 1; gap exits 0 alone and 1 under `--expect-all`. `dup`: across=1/exit 1, within=exit 0, empty dirs exit 0; a directory passed twice reports "within", no across inflation; `--out` is written after the comparison, so it is never compared with itself. Gaps: F-2/F-4. Unreadable regular file: not run (no reliable Windows fixture) — unresolved, cannot block. |
| C-8 declared limits complete | REFUTED: F-2, F-3, F-4, F-5 are undeclared limits of comparable weight. The declared ones (50 KB floor, 8-row cap, first-sentence extraction, whole-file `dup`) were each reproduced as declared. |
| C-9 scope discipline | CONFIRMED. Attributable mtimes cluster 11:12 (Layer A) and 19:23-19:45 (Layer B/C) exactly on the table paths plus `.ai/DECISIONS.md`, the journal, `.ai/TASK.md`, `.ai/ARCHIVE.md` and `archive/INDEX.md` (the required record/room-making artifacts). No gate, verdict vocabulary, receipt format or completion requirement touched; decision blocks 0034-0043 are unmodified and unweakened. |
| C-10 propagation | CONFIRMED. Installer into a temp target: exit 0, both `.ai/bin/protocol-index.cjs` and `.ai/bin/protocol-ledger.cjs` delivered; installed manifest role `installed`, version 1.9.6, both listed; manifest/installer tests held in the 315/315 run. Projects at 1.9.0 do not have the new files until upgraded. |

## Limits of This Certification

- The quote-character and newline filename cases are impossible to create on NTFS; only the
  code path was read for those. The Cyrillic case is the reproducible representative of F-1.
- The "growth exactly 545 characters in three repositories" figure was not independently
  reproduced (the three repositories are outside this checkout); boundedness was measured instead.
- The unreadable-file case of C-7 is unresolved; it is not grounds for blocking.
- The other certifier's report was not read before this verdict was fixed.

## References

- Decision: PROTO-DEC-0044 (`.ai/DECISIONS.md:1874`); prompt:
  `docs/reviews/2026-09-22-claude-layers-abc-adversarial-prompt.md`.
- Fixture scripts used: `C:\Users\Dmitry\AppData\Local\Temp\kilo\abc-audit\*.cjs` (outside the
  repository, disposable).
- Associated journal: `.ai/worklog/deepseek-c13aad462dc55cde.md`.
