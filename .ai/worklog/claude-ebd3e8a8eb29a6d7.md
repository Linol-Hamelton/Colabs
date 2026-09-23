# Worklog: claude-ebd3e8a8eb29a6d7

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-23 - F-C01 traced to my specification; new premise recorded as PROTO-DEC-0046

Agent: claude-ebd3e8a8eb29a6d7

Action: Reproduced the round-3 residual of F-001 with a control row, and the F-C01 finding
from the owner-requested Codex assessment, then traced both to their cause. Put the points
where Codex and I diverged to the owner as four questions, and on the owner's answers
appended PROTO-DEC-0046 with its registry row under the lock. Repaired a split bullet I had
left in `.ai/TASK.md` and added a pointer to the new decision.

Result: F-001 residual confirmed: `.ai/bin/x.cjs` -> FAIL exit 1 and control
`docs/notes.md` -> RECOMMENDATION exit 0, while `D:/Colabs/.ai/bin/x.cjs`,
`C:/Colabs/.ai/bin/x.cjs`, `../.ai/bin/x.cjs` and `x/../.ai/bin/x.cjs` all -> RECOMMENDATION
exit 0. My first probe reported FAIL for every form and was wrong: its requirement named an
invariant, and rule 3 yields FAIL off protected paths for that reason alone, so the probe
tested nothing about path recognition. F-C01 confirmed with a neutral requirement:
`validate-protocol.ps1`, `protocol-manifest.json` and `setup-ai-protocol.ps1` -> RECOMMENDATION
exit 0; `.claude/hooks/protocol-hooks.cjs` -> FAIL only because a directory happens to be
named `hooks`. Cause, mine: spec line 89 took the protected list "verbatim from PROTO-DEC-0038
item 1", but check 1 executes PROTO-DEC-0041 item 4, whose list adds manifest and core; and
all three recorded lists name concepts rather than paths. I conceded to Codex that contract A
is a clarification needing an owner decision, not a rule already implied. Owner chose: reject
`..` with exit 2; protected set from the manifest's `managed` and `source` plus `.ai/`,
`.claude/`, `.codex/`; certifiers Codex and a fresh Claude session, because DeepSeek now
coordinates and by PROTO-DEC-0041 item 1 certifies nothing it dispatched; budget <=2 on the
new premise. Appending 0046 after 0045 - which was committed as the last block - produced no
immutability false positive, a live confirmation of Gemini's F-003 fix on the real file.
Validator exit 0, one warning: 33 journals against 30.

Next step: DeepSeek coordinates; Gemini implements PROTO-DEC-0046 items 2, 3 and 5 and aligns
the specification; the candidate is committed; Codex and a fresh Claude session certify in
parallel on that SHA in separate worktrees with neutral-requirement probes.

Open: I authored the specification, so I fill neither slot. The Jev evaluation still exists
only outside the repository. Journals are over their cap and must be unloaded before the
round writes anything.

Evidence:
- anchor: 82bf99a8e2bfcde3ff375b9995f3ab45edb7ddc5, uncommitted changes present
- digest: sha256:470850eb8305d59a4a6a18e4aa4f19fac5342ac201870198d5eab614d76b529f over 317 tracked and untracked files
- digest format: 4
- recorded: 2026-09-23T04:25:50.142Z by claude-ebd3e8a8eb29a6d7
- entry hash format: 2
- entry: sha256:295503bbf5307a37f2624adfd713cafc2257e7ca601f436e1b65d69be7496e41 of this entry without this block
- parent-entry: sha256:8b8b17a1ad4bb3f4abc4659665f10cff5758a1681f48aa50de05656d682ea981
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 3s
- test-protocol.ps1: exit 0 in 260s
- reproduce: node .ai/bin/protocol-handoff.cjs verify

---


## 2026-09-23 - Checkpoint committed, false positive cleared, 7.2 GB reclaimed

Agent: claude-ebd3e8a8eb29a6d7

Action: Committed the specification, PROTO-DEC-0045 and the budget unload as `82bf99a`
(29 paths), stating in the message that layers A/B/C and the rulebook are not certified
and that the immutability check still needs fixing. Then executed the owner's named
deletion. Before deleting I looked at each target rather than trusting my own earlier
framing of it.

Result: The validator returned to **Protocol OK, 0 warnings** immediately after the
commit, which confirms the diagnosis: the decision-block immutability check attributes
the `---` separator to the preceding block, so the false positive was an artefact of
appending after that block had been committed last, not an edit. Moving the baseline
cleared it without weakening the rule. `D:\mcp-memory-data\vector-stack` is deleted,
7.2 GB reclaimed, and that tree now holds only `sqlite/` - the two databases the live
Codex configuration names. I did **not** delete `D:\mcp-stack\database-storage`, and that
is a correction of my own earlier claim rather than a deviation from the instruction: I
had described it as bulk data, and it measures 0.1 MB in three files -
`vpn-project.db` 49 KB, `mcp-gateway.db` 32 KB, `rag-vectors.db` 32 KB. Deleting it would
free nothing and destroy project databases, one of them named for the VPN product, so the
trade the owner approved does not exist there.

Next step: dispatch the three prompts - Gemini implements
`docs/specs/2026-09-23-executable-rulebook-spec.md` with its negative tests; DeepSeek
composes the unified adversarial prompt and certifies the batch, which is that package
plus the five layers A/B/C fixes plus the immutability-check defect; Copilot persists the
Jev evaluation into the repository under the section 5.5 fallback and assembles the R0
offline dataset.

Open: `D:\mcp-stack\database-storage` needs an owner decision on its own terms now that
its contents are known; nothing was deleted there. The immutability check is masked, not
fixed - the next agent who commits and then appends a decision meets it again. Layers
A/B/C and the rulebook remain uncertified, and I authored the specification, so I fill
neither reviewer slot. The Jev evaluation is still only in a temp directory and by
AGENTS section 1 has not happened yet.

Evidence:
- anchor: 82bf99a8e2bfcde3ff375b9995f3ab45edb7ddc5, uncommitted changes present
- digest: sha256:498594d2ae801b74526147ca4b5412919b3f405cf30fc7983ab28d2f89a66bb7 over 312 tracked and untracked files
- digest format: 4
- recorded: 2026-09-22T22:53:41.441Z by claude-ebd3e8a8eb29a6d7
- entry hash format: 2
- entry: sha256:8b8b17a1ad4bb3f4abc4659665f10cff5758a1681f48aa50de05656d682ea981 of this entry without this block
- parent-entry: sha256:bd2d01eefaf5aa02ebebdac92d7a042988d2b4f3b553b8e5b473af8bd4c7f309
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 4s
- test-protocol.ps1: exit 0 in 340s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
