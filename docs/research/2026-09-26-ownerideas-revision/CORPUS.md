# Frozen corpus: OwnerIdeas — manifest and sync verification

Baseline commit: `7b6d17a` (adds five sources that existed only on disk). The corpus is read from
the working tree; the index stores LF, the working copies keep CRLF exactly as the eight files
tracked before the sync. OwnerIdeas is not protocol-owned (validate-protocol.ps1 `Test-ProtocolOwned`),
so its line endings are the owner's business and not a validator finding.

## Manifest (sha256 of the working-tree file, 2026-09-26)

| File | Bytes | sha256 |
|---|---:|---|
| `OwnerIdeas/benchmark.md` | 57,328 | `28e47890702cc21c6e733d42a8d94db2ac666b730bf68bc775fd14e81f5d177b` |
| `OwnerIdeas/executor.md` | 24,778 | `82ce32ac9974464f47f59820fa17dbf5e9f4d072fabaed785e12effc4b9b42a2` |
| `OwnerIdeas/Google_AX.md` | 34,828 | `34f0a2ffac9b0d8b949ebe6c8beba5fe3e470e0ac94847b188416eaf26973993` |
| `OwnerIdeas/H-AUTH-02.md` | 1,520 | `f78aa98b66605ca41ca1a731f24338308c90dc63b8bc8de5ef37d026bad35eba` |
| `OwnerIdeas/H-PROMPT-DELIVERY-01_canonical-task-file-vs-orchestrator-loading.md` | 4,054 | `3a59d7c2109c4bf5268e1aaaebb61883345d0a747dbecf147b49bf0ff8078b54` |
| `OwnerIdeas/MCP_Server.md` | 54,534 | `a90d753471d9cd36ee86ad251ea13aecff4dc5831789bdd87b0bf79de3bf7429` |
| `OwnerIdeas/MIGRATION.md` | 27,051 | `7c10072f7de5f2ee09a0db06a8a6832aafc7bd731cdf0fbb0c27c8a737984600` |
| `OwnerIdeas/performers.md` | 56,659 | `73b81d2599e435452e0efc96ee2ad4ab7a6bdee25b5664ec6953aa092c2442e5` |
| `OwnerIdeas/RISK_COUNCIL.md` | 58,612 | `7ded33805d04190754bda3afba627702d56d16a45e8bdfae2c0515e701d7914f` |
| `OwnerIdeas/Rust.md` | 25,866 | `c7f29f49801b25528e8beb7cd2a27de1b8cd930b4834b544518bce1dea3f33b7` |
| `OwnerIdeas/scripts.md` | 67,617 | `a12f3957b3d45b5581fd013083da81422a0383151d488735b9d604e1148802b3` |
| `OwnerIdeas/SYNTHESIS-2026-09-25-cross-document.md` | 12,071 | `34b9f15083bbc36a2d429bd94e13c2a97df705116cfbb15ad18cea8f24efcebe` |
| `OwnerIdeas/task_profife.md` | 40,982 | `0641bd1dd460c20e94eba4022ca3e48fb549fa3df4c963020d01e2e25eb096cc` |

`SYNTHESIS-2026-09-25-cross-document.md` is a cross-document synthesis of the corpus written
2026-09-25 by an earlier session (committed in `1302554`) and placed by the owner in `OwnerIdeas/`;
it is part of the corpus to review, not a source of truth about the kernel.

## Sync verification (owner dispatch section 1)

Checked 2026-09-26 by `kilo-f22faac486b5e567` before the revision started:

1. **All of the corpus is in Git.** 13 of 13 files are tracked at `7b6d17a`. Five files existed
   only on disk before the sync (`benchmark.md`, `executor.md`, `performers.md`, `scripts.md`,
   `task_profife.md`); `7b6d17a` added them.
2. **No local file is missing from the repository.** `git status` for `OwnerIdeas/` was clean after
   the sync: nothing modified, nothing deleted, nothing untracked.
3. **No stale or duplicate copy of a corpus file.** A sha256 scan of the 532 markdown files under
   `docs/`, `.ai/`, `templates/`, `tests/` and the repository root found no byte-identical copy of
   any corpus file. Known derived artifacts (for example
   `docs/research/2026-09-25-validator-migration-council/OWNER-PROMPT.md`, a reworked extract of
   `MIGRATION.md`) are not copies and are not sources of truth; they live outside the corpus.
4. **Local and repository content match.** The tracked blobs are LF; the working copies are CRLF,
   the same shape as the eight files tracked before the sync; Git reports the directory clean.
5. **No credential-like literals** in the five added files (scan for key/token/password/private-key/
   Bearer patterns; one false positive: `TASK-CHARACTERIZATION` matching `sk-`).

Frozen for round 1: reviewers read the corpus from the working tree at the baseline commit and must
not use any other copy, translation or excerpt of it.
