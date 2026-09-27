# Worklog: kilo-f22faac486b5e567

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

<!-- archived-parent: sha256:e130e0af995eb3584c29594c181b9ce9237a98cfcf5d1570ece9c8bec22046db -->

---

## 2026-09-27 - Round 2: Kimi PASS, MiMo FAIL with residual PKG-2 items; t26 cleanup; round-3 running

Agent: kilo-f22faac486b5e567 (Kilo Code session; model deepseek-flash; client Kilo)

Action:
- Round-2 results on CANDIDATE b8781ca: **Kimi PASS** (F-PKG2-1 fixed with the real head `fd789acdb6558400576644822622544c41296980` and sha256 `8bcb2e8d...`; F-PKG2-2 golden DONE present; worktree at the CANDIDATE). **MiMo FAIL**: round-1 items fixed, but four residual items F-PKG2-R2-1..R2-4 (S4 render headers `Model ran`/`Effort used` vs `Model`/`Effort`; missing golden-Markdown equality test; no CLI-stdout pattern test `^[A-Z][A-Z_]*( |$)`; one more AC-9 gap), plus the non-empty normative diff caused by an operator artifact.
- Operator fix: `75452bc` (a checkpoint) had swept in the transient `tests/fixtures/dispatch/t26-launch.md`; removed from tracking and deleted (`b8db360`, pushed). The normative diff `b8781ca..HEAD -- .ai/bin tests docs/specs .ai/docs .ai/SIGNALS.md docs/ops protocol-manifest.json` is empty again (verified).
- Round 3 (final allowed) dispatched (`ac56d15`): `r9e-repair-pkg2` (Gemini high; fix only the four residual items; reproduce first) and `r8e-cert-kimi-pkg2` / `r8e-cert-mimo-pkg2` (PKG-2 only; PKG-1/3/5 keep their verdicts). `r9-verify-codex` needs the round-3 repair and both round-3 certs. r9e STARTING (supervisor bgp_0e0523521).

Result: The PKG-2 defect is narrowing; round 3 is the last allowed certification round before a STOP.

Next step: r9e DONE -> commit (new CANDIDATE) -> local lane -> round-3 certs -> if both PASS release the Sol verifier; else STOP (4th round forbidden).

Open: r9e running; rounds used on PKG-2: 2 of 3.

Evidence:
- anchor: ac56d151a4dd9e83f9ca2f824ea8bf2f85313f8e, uncommitted changes present
- digest: sha256:90f327e7f515041c0dac8a8adb2e0064b1ae5eb118b9fe8784dc188c2bf965e6 over 697 tracked and untracked files
- digest format: 4
- recorded: 2026-09-27T00:46:50.135Z by kilo-f22faac486b5e567
- entry hash format: 2
- entry: sha256:af9cb68dede12c81badf5611a7073f220c9b92dab703c2ca3fb3d780dd132e8c of this entry without this block
- parent-entry: sha256:e130e0af995eb3584c29594c181b9ce9237a98cfcf5d1570ece9c8bec22046db
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 5s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
