# Worklog: copilot-cb20ea62bf2115da

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-18 - Implementing consensus corrections

Agent: copilot

Action: Implemented authenticated format-2 entry hashes for new Evidence
blocks, a transitional chain-root marker for the historical format-4 genesis,
Symbol-backed dirty snapshot metadata, and regression tests for Evidence
tampering and a real __dirty filename. Updated archive hashing and rehash
handling to preserve the new canonical form.

Result: validate-protocol.ps1 passed with 0 warnings; test-protocol.ps1 passed
178/178 tests; doctor passed with exit 0 and deep Merkle verification across 29
journals; Block-Puzzle and VPN were synchronized with -Force and verified.

Next step: Owner review and release decision.

Open: Evidence format-2 migration should be documented in a future protocol
decision; existing legacy receipts remain supported.

Evidence:
- anchor: a6a6d6194e08e313dce1328cc8af971962f91fa5, uncommitted changes present
- digest: sha256:8c175472dc548cd992daaf056874c7384258728defa22908d9c5beb04a96c3c3 over 88 tracked and untracked files
- digest format: 4
- recorded: 2026-09-18T18:57:34.906Z by copilot-cb20ea62bf2115da
- entry hash format: 2
- entry: sha256:1aa6f6d6b17d0006fbb219dddce25d6da842c6ee48714009fb68c5b0501913e6 of this entry without this block
- parent-entry: sha256:dfbce39dea2be4453fc3e663a568ccde65128c0f18685676e8d3bdb4cf0d7330
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 2s
- test-protocol.ps1: exit 0 in 83s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
## 2026-09-18 - Adversarial audit of v1.9.3-v1.9.4 hardening

Agent: copilot

Action: Audited the validator stub, 16-way runner, handoff and archive chain,
snapshot optimization, lock ownership, completion gate, runtime cleanup, and
downstream synchronization. Ran the validator, full regression suite, handoff
verification, deep verification, doctor, and both consumer verification
commands. Wrote the opposing review to
docs/reviews/2026-09-18-copilot-sdk-adversarial-audit-v1.9.4.md.

Result: BLOCKED. Found a high-confidence Evidence integrity bypass, a doctor
exit-code defect, a __dirty metadata collision, owner-only lock reentrancy,
and a transitional format-4 deep-verification incompatibility. The full
regression suite and downstream verification passed, but these integrity
findings prevent release certification.

Next step: Fix F-001 through F-005, then re-record and verify fresh Evidence
and rerun the full protocol checks.

Open: No code fixes were applied in this opposing review.

Evidence:
- anchor: a6a6d6194e08e313dce1328cc8af971962f91fa5, uncommitted changes present
- digest: sha256:badd07123ef0ed1719c9b02ada76bdd68899427b8103b4b8069f481b49ac56a3 over 84 tracked and untracked files
- digest format: 4
- recorded: 2026-09-18T17:07:43.436Z by copilot-cb20ea62bf2115da
- entry: sha256:dfbce39dea2be4453fc3e663a568ccde65128c0f18685676e8d3bdb4cf0d7330 of this entry without this block
- parent-entry: root
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 2s
- test-protocol.ps1: exit 0 in 77s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
