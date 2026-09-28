# Worklog: mistral-e5b0a7370dee2904

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-28 - 2A fix round 2: W5 test hermeticity (F-2A-03) and S-7 pool bound

Agent: mistral (model: Mistral Medium 3.5 per LAUNCH-2A-FIX-ROUND2; effort: not-exposed; usage: not-exposed; no client usage line is printed by this environment)

Action: Executed docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-FIX-ROUND2.md (task:roadmap-2a-fix-round2). Checked the task's named sources against the inventory: tests/dispatch.test.cjs, tests/dispatch-fake-client.cjs, .ai/bin/protocol-dispatch.cjs, docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs all tracked and read end to end; docs/reviews/2026-09-28-sol-wave2a-certification.md does not exist in this worktree yet (Sol certifies in a different worktree), so the S-7 probe was rebuilt from the launch file's reproduction (own scenarios spawned before the pool, 2+4=6). Fix 1 (W5): added failing test W5 first (journal import must land in the test temp root; failed with "the imported journal must land inside the test temp root"), then bound journal imports via new env PROTOCOL_JOURNAL_IMPORT_ROOT honored in importResults (.ai/bin/protocol-dispatch.cjs), retargeted T6/T20-T26/T28/T30 journal assertions and cleanup to the suite temp root, and extended the guard test to fail on any gemini-0123456789abcdef path in the real tree (tracked or untracked). Fix 2 (S-7): added the instrumented spawn (spawnOne) counting simultaneous --one children plus a final PASS/FAIL row; pre-fix full run printed FAIL S-7 PROBE_MAX_ONE=6 (exit 1), then routed the two own watchdog scenarios through the same bounded pool with the slot released exactly once at the child's exit event.

Result: tests/dispatch.test.cjs 29/29 pass (28 before + new W5); killed-suite check (run killed mid-suite) showed git status clean of the fake journal during and after; node --test tests/resolver.test.cjs 7/7; launch-test.cjs --pure 55 PASS/0 FAIL; instrumented full run printed PASS S-7 (PROBE_MAX_ONE=4) with all scenarios PASS on three consecutive runs (one earlier run had a pre-existing zz-t22 STARTING timing flake, and one pre-fix run had the same class of flake on zz-t15 - watchdog tick timing, unrelated to the pool change). BLOCKED: git add/git commit are denied by this session's tool approval callback, so the required per-fix commits could not be created and the tree carries both fixes uncommitted; the operator must run the four commits (test W5; fix W5; test S-7; fix S-7) or re-dispatch. Not run in this environment (denied): validate-protocol.ps1, test-protocol.ps1, protocol-handoff.cjs record; their exit codes are NOT evidence here.

Next step: owner/operator commits the four steps with explicit paths, freezes the new SHA, then the DeepSeek diff review and the repeat certification (MiMo + Sol, Sol at Medium) per the launch file.

Open: PROTOCOL_JOURNAL_IMPORT_ROOT is a new dispatcher env contract (test-only override, production default unchanged); the S-7 slot is now held until the child exit event, so a slot can free seconds before the scenario's own report fires (by design; bounded at 4 live children). zz-t22/zz-t15 watchdog-timing flakes observed once each across five full runs on this machine.

Evidence:
- anchor: 42fd623d399509692213e6df14ac547cbec57a0b, uncommitted changes present
- digest: sha256:212f667285e21f3f073d478c9caebe924b572845afc55bc74935a0eb981e33fa over 757 tracked and untracked files
- digest format: 4
- recorded: 2026-09-28T14:14:49.814Z by mistral-e5b0a7370dee2904
- entry hash format: 2
- entry: sha256:c011004247564c8caf3d5d099425da03ec2b2b919831992c80975cd90aa2cb18 of this entry without this block
- parent-entry: root
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 4s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
