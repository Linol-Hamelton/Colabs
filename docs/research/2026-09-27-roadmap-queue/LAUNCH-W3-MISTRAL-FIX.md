# Launch: task:roadmap-w3-dig-mistral-fix (Mistral Medium 3.5 via vibe, own session)

One targeted correction of `docs/research/2026-09-27-roadmap-queue/drafts/DIG-MISTRAL-0022-0047.md`
in the worktree `D:\Colabs\.ai\runtime\w3` (branch `roadmap-wave3`), before the GPT-5.6 Sol
verifier. Owner rules (2026-09-27):

1. A row is **built** only with a code, test or validator `path:line`, or a commit sha. A decision
   block or an AGENTS.md/prose section alone is **partial (described, not enforced)**.
2. The words "may" and "unclear" are forbidden. Every **partial** names the missing part.
3. Priority on the host/installed-path items: **PROTO-DEC-0025, 0037, 0038, 0040, 0046** - for each
   of those, find the real delivered path (`validate-protocol.ps1`, `.ai/bin/*`, hooks,
   `protocol-manifest.json` entries) and cite `path:line`, or downgrade to partial with the missing
   part named.
4. Target: **at least 80% of rows carrying a `path:line`**. Recompute the percentage in the header
   of the corrected file (count of rows with `path:line` over total rows).
5. If after the correction the file is still below 80%, do not invent proofs: state the final
   percentage and stop; the operator reports to the owner for a possible reassignment of the range.

## Session

- `node .ai/bin/protocol-session.cjs start --agent mistral`; use the printed owner name.
- Read-only outside your draft file, your journal and your evidence. Do not touch the DeepSeek
  draft, the README or anything else.
- Do not run `test-protocol.ps1`; run `validate-protocol.ps1` once and `record --quick` at the end.
- Commit the corrected file on this branch with explicit paths; do not push.
- Journal: five labels plus model/effort and usage.
