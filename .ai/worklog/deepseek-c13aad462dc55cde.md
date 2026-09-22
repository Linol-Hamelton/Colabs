# Worklog: deepseek-c13aad462dc55cde

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-22 - Independent certification of PROTO-DEC-0044 (layers A/B/C): FAIL

Agent: deepseek-c13aad462dc55cde

Action: Executed the unified adversarial audit prompt
`docs/reviews/2026-09-22-claude-layers-abc-adversarial-prompt.md` as one of the two
parallel independent certifiers of PROTO-DEC-0044, working from the repository with
fixtures under the disposable temp root. Re-ran both required checks for real:
`validate-protocol.ps1` exit 0 with 1 warning (journals 31/30, WARN-first) and
`test-protocol.ps1` 315/315 exit 0 in 338703 ms. Attacked C-1..C-10 with reproductions:
corrupted all three `.ai/runtime/` artifacts and re-ran the validator (output identical,
exit 0); shaped repositories for the context budget, quoted paths, no-commit and
3000-file indexes, and a git-absent PATH; extracted Layer B behaviour on empty,
numbered, heading-like and template blocks plus same-byte-count staleness; quantified
the reverse index against the real decision corpus; built non-git corpus fixtures with
junctions, missing directories and duplicate record sets. Wrote the verdict report to
`docs/reviews/2026-09-22-deepseek-layers-abc-certification.md` (169 lines, within the
250 cap and reserved against the corpus budget; corpus after writing 57/60 files,
593,998/614,400 B).

Result: **FAIL**, one HIGH finding reproduced twice: `git ls-files` is consumed without
`-z` or `core.quotePath=false`, so under the default configuration a 155 KB
Cyrillic-named document is silently absent from Layer A's inventory while the same
fixture surfaces it with `core.quotePath=false`, and Layer C counts the C-quoted string
as a unit, reporting the real unit and its real record as missing/unexpected. This is
the silent-omission failure both layers exist to remove, on protected paths
(PROTO-DEC-0041 item 4 blocks). Four further confirmed findings: missing producer/records
directories silently treated as empty with `dup` exit 0 and a report naming a
nonexistent path as "compared" (MEDIUM); the reverse index drops 4 of 60 real repo path
references, all extensionless root files (LOW, undeclared); uncaught ENOENT stack traces
on absent source/corpus roots (LOW); non-git `cover` silently omits junction/symlink
directories (LOW). Isolation (C-1), staleness (C-4), scope discipline (C-9) and
installer propagation (C-10) all verified as claimed; validator, suite, index figures
(44 blocks/85 paths/14,800 B) and cover exit-code semantics reproduce.

Next step: the author holds the package; a fix round should address F-1 first (use
`git ls-files -z`) and then F-2..F-5, after which a fresh adversarial prompt and two
new independent certifications are required before any task citing PROTO-DEC-0044 may
be marked Completed. This report does not certify completion and must not be counted
as a PASS.

Open: two fixtures of the prompt (quote and newline filenames) are impossible on NTFS,
so only the code path was read for those; the "545 characters in three repositories"
figure was not independently reproduced outside this checkout; the unreadable-file case
of C-7 is unresolved and cannot block. The other certifier's report was not read before
this verdict was fixed, as required.

Evidence:
- anchor: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1, uncommitted changes present
- digest: sha256:f8af378e5899a68cbb2f7cbc94c749cab2dbc1416211d2fbe34ce14ddacad7eb over 269 tracked and untracked files
- digest format: 4
- recorded: 2026-09-22T18:14:50.696Z by deepseek-c13aad462dc55cde
- entry hash format: 2
- entry: sha256:e9e3d8eb1ac09e46779d3c99f8fca4756ad4e8fd961805a22c835d664852b8bf of this entry without this block
- parent-entry: root
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 3s
- test-protocol.ps1: exit 0 in 238s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
