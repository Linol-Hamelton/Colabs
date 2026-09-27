# Worklog: kilo-f22faac486b5e567

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

<!-- archived-parent: sha256:1683048495e471c8da286ff32ae894055041b76e0afddf0ee1b2090d02dddf54 -->

---

## 2026-09-27 - Freeze complete: CANDIDATE 7f199c5; round-3 certification started

Agent: kilo-f22faac486b5e567 (Kilo Code session; model deepseek-flash; client Kilo)

Action:
- `r9f-repair-usage` DONE (REPAIR-USAGE-GEMINI.md, REPAIR COMPLETE; parsers kilo-json/copilot-credits/codex-tokens, actual/cumulative cost, two `usage=none` reasons, negative strings not matched; T27-T29). `r9e`'s report covers F-PKG2-R2-1..R2-4.
- Freeze check (owner rules): `git status --short -- .ai/bin tests docs/specs .ai/docs protocol-manifest.json` showed exactly `M .ai/bin/protocol-dispatch.cjs`, `M tests/dispatch.test.cjs`, `?? tests/fixtures/dispatch/usage/`; no stray untracked `*-launch.md` (`t21-launch.md` is a tracked fixture); `hang-launch.md` clean; r9f's process had exited.
- Local lane, sequential: `validate-protocol.ps1` exit 0; `test-protocol.ps1` exit 0 (419/419); full `record` (validate 0, suite 0) then `verify` - evidence matches the tree.
- Freeze commit **7f199c50589ce3b5b34680e70be21e9a43aeeac1** with the agreed message (carries only the r9f files; the diff `b8781ca..7f199c5` contains both repairs). Pushed. `r9g` accepted with the SHA and lane results. A journal-only commit followed (`6944958`); nothing normative after the CANDIDATE.
- Round-3 certification started on the frozen CANDIDATE: `r8e-cert-kimi-pkg2` and `r8e-cert-mimo-pkg2` STARTING (supervisor bgp_0e08d1b2; the previous one had exited).
- Observed, untouched: a parallel session packaged and launched the cost-routes research (`docs/research/2026-09-27-cost-routes-research/`, collectors running) from the owner prompt; its files stay out of our commits.

Result: The round-3 CANDIDATE is frozen and the final certification round is in flight.

Next step: read both round-3 verdicts; on double PASS release the Sol verifier; then STOP-7/8 and the readiness report.

Open: round-3 certs running (rounds used on PKG-2: 3 of 3; a reproduced FAIL goes to the owner).

Evidence:
- anchor: 69449589eeb3f31d4acaea20872a309c22e9caa7, uncommitted changes present
- digest: sha256:4ab866b8251b90ae95b601cd51b7e2e148cae53143c07c7d2a4c89ce465682c5 over 714 tracked and untracked files
- digest format: 4
- recorded: 2026-09-27T01:50:58.688Z by kilo-f22faac486b5e567
- entry hash format: 2
- entry: sha256:baa1f41eefd0c60b3bcd02647c15402f3fb040f542e67ad07d54dfcd0a4ed465 of this entry without this block
- parent-entry: sha256:b2cd851bf39cec97b5e8bba528e8dfd77143d262efef637b5a6478616964c780
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 5s
- reproduce: node .ai/bin/protocol-handoff.cjs verify

---


## 2026-09-27 - Owner correction: transient launch fixtures are not an r9f defect; stage-12 finding logged

Agent: kilo-f22faac486b5e567 (Kilo Code session; model deepseek-flash; client Kilo)

Action (owner correction 2026-09-27, recorded):
- `t20-/t24-/...-launch.md` under `tests/fixtures/dispatch/` are pre-existing PKG-1 test design
  (written and deleted by the dispatch tests), not r9f defects and not a reason to send r9f back.
- The freeze (`r9g`) runs only when r9f is DONE and no test process is running (the agy pid has
  exited); the operator runs the local lane sequentially, never in parallel with another test run.
  A leftover untracked `*-launch.md` is junk from an interrupted run: delete, rerun the lane, check
  again. `tests/fixtures/dispatch/hang-launch.md` must show no ` M`; if modified, restore with
  `git checkout --` and rerun. r9f goes back only if its own work is missing (dispatch.test.cjs
  changes, usage fixtures, passing T27-T29).
- Logged as a STAGE-12 finding: the dispatch tests are not hermetic; they write into the tracked
  tree (pre-existing PKG-1 design; the r9c hygiene repair did not fully close the `*-launch.md`
  class).
- `prompts/run/r9g-freeze-candidate.md` updated accordingly.

Result: The freeze procedure now matches the owner's corrected rules.

Next step: r9f DONE and its process exited -> freeze check -> lane -> freeze commit (new CANDIDATE)
-> round-3 certs.

Open: r9f running.

Evidence:
- anchor: 401bcb32db9c5567679651e44002fa9f600db8f6, uncommitted changes present
- digest: sha256:c737b52beed9d02fa254cfe0c39a8ffe4dff90a37463ce3052b5c04fe2c61a13 over 714 tracked and untracked files
- digest format: 4
- recorded: 2026-09-27T01:46:52.992Z by kilo-f22faac486b5e567
- entry hash format: 2
- entry: sha256:b2cd851bf39cec97b5e8bba528e8dfd77143d262efef637b5a6478616964c780 of this entry without this block
- parent-entry: sha256:1683048495e471c8da286ff32ae894055041b76e0afddf0ee1b2090d02dddf54
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 5s
- test-protocol.ps1: exit 0 in 518s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
