# Worklog: kilo-f22faac486b5e567

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

<!-- archived-parent: sha256:1683048495e471c8da286ff32ae894055041b76e0afddf0ee1b2090d02dddf54 -->

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
- anchor: 1fae6547fd062dc3b77dfc1ba1c274d494387981, uncommitted changes present
- digest: sha256:dfd9696c7428b3b6d62538721352bfd5500b95ca8e31075da1e572fcbe926ab1 over 709 tracked and untracked files
- digest format: 4
- recorded: 2026-09-27T01:19:47.062Z by kilo-f22faac486b5e567
- entry hash format: 2
- entry: sha256:2e0def64bf49c34b144082f7011e53e2a5fb9bfaf578249403c6ed12dccdc1c2 of this entry without this block
- parent-entry: sha256:1683048495e471c8da286ff32ae894055041b76e0afddf0ee1b2090d02dddf54
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 6s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
