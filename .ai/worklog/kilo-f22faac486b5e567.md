# Worklog: kilo-f22faac486b5e567

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

<!-- archived-parent: sha256:e130e0af995eb3584c29594c181b9ce9237a98cfcf5d1570ece9c8bec22046db -->

---

## 2026-09-27 - Owner directive: usage repair folded into round 3; freeze gate applied; r9e DONE, r9f running

Agent: kilo-f22faac486b5e567 (Kilo Code session; model deepseek-flash; client Kilo)

Action (owner directive 2026-09-27, recorded as the owner's decision):
- Race guard applied BEFORE any r8e cert started (both were NOT_STARTED; no fallback needed): added
  `r9f-repair-usage` (Gemini high; needs r9e; fix the PKG-1 S8 / PKG-3 S8 / 0075-item-9 usage and
  cost capture ported from `usageOf`, tests incl. the parser fixtures and the two `usage=none`
  reasons, no overlap with r9e files, no edits to protocol-runrecord.cjs or the schema) and the
  manual gate `r9g-freeze-candidate`; both round-3 certs now need r9e + r9f + r9g, and
  `r9-verify-codex` needs r9f + r9g too. The stale supervisor was stopped and a fresh one started
  so the new needs are loaded (a stale-load would have started the certs early). Commits `09a51bf`
  (pushed).
- `r9e-repair-pkg2` DONE (journal gemini-504809281e1dcdbc; report REPAIR-PKG2-R3-GEMINI.md).
  `r9f-repair-usage` STARTING; `r9g` waits for manual freeze; both certs gated.
- The freeze (`r9g`) step, per the directive: full local lane on the combined tree, a full `record`
  (not --quick) plus verify, ONE commit carrying both repairs with the message
  `fix(pkg-1,pkg-2): round-3 repairs - PKG-2 residuals R2-1..R2-4; usage and cost per attempt (PKG-1 S8, PKG-3 S8, 0075 item 9)`,
  push; that commit is the new CANDIDATE; afterwards nothing touching the normative tree is
  committed (checkpoints carry journals and reports only); then accept the r9g slot.
- Deviation recorded (owner acknowledged): checkpoint `9d3f84d` swept in mid-repair PKG-2 files
  (`protocol-runrecord.cjs`, `runrecord.test.cjs`, `golden.md`); harmless because the round-3
  certifiers judge the final frozen CANDIDATE tree.
- F-02 signals recorded: Kimi's round-1 PKG-2 PASS was overturned by MiMo with reproductions in
  rounds 1 and 2; and both round-1 certifiers passed PKG-1 while the S8 usage gap was present -
  evidence about certifier sensitivity for the model-evidence frame.

Result: The final allowed round is assembled correctly and gated; the usage/cost defect is under
repair.

Next step: r9f DONE -> operator freeze (lane + full record + one commit = new CANDIDATE) -> accept
r9g -> round-3 certs (Kimi and MiMo, PKG-2 + PKG-1/3 in full) -> on double PASS the Sol verification.

Open: r9f running; rounds used on PKG-2: 2 of 3; a reproduced round-3 FAIL goes to the owner.

Evidence:
- anchor: 09a51bf2d923b87e5f3a301f5484be649f4e2d3d, uncommitted changes present
- digest: sha256:277bfe5632a2d7fb152cf24b9f7aa39d5ad6de7e8cb10fee30b5a3887eff65d6 over 701 tracked and untracked files
- digest format: 4
- recorded: 2026-09-27T00:57:48.992Z by kilo-f22faac486b5e567
- entry hash format: 2
- entry: sha256:fa09e871fffcc704e126ca8065633f8b9681c448216d2147933e13ab4e4bc863 of this entry without this block
- parent-entry: sha256:af9cb68dede12c81badf5611a7073f220c9b92dab703c2ca3fb3d780dd132e8c
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 4s
- reproduce: node .ai/bin/protocol-handoff.cjs verify

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
