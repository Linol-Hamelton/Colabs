# Worklog: mistral-31c0a7ec3787702f

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-28 - registry fixture: reproduced 6/7 FAIL pre-fix, verified 8/8 PASS post-fix

Agent: mistral (vibe). Requested model glm-5-3; actual model mistral-medium-3.5, recorded as used per PROTO-DEC-0094 B.1 (GLM-5.3 only on a PASSing probe, otherwise Mistral Medium 3.5, and it is recorded as used). The B.5 "falling back" log check could not be completed: the vibe log read was denied in this session, so the model identity comes from the session's launch context, not from a verified log.

Action:
- Reproduced the registry tests 6/7 failure on the pre-fix tree (HEAD 268e4fe): ran the HEAD test logic byte-faithfully from disposable session state (.ai/runtime/mistral-repro/registry-prefix.test.cjs, only the helpers.cjs require adapted to an absolute path so repoRoot still resolves; no tracked file touched). Result: 6 pass / 2 fail. Validator output: "[FAIL] duplicate decision: PROTO-DEC-0099" and "[FAIL] PROTO-DEC-0099 was edited after it was written; a decision block is never rewritten". Cause: .ai/DECISIONS.md now carries a real PROTO-DEC-0099 (line 4519), so the fixture's hardcoded synthetic id collides with the live decision log.
- Confirmed the working-tree fix in tests/registry.test.cjs (uncommitted) against git diff: nextDecId = max(PROTO-DEC-NNNN in validDecisionsContent) + 1, zero-padded to 4 digits, used in the synthetic decision block, the registry row and the assert.match of checks 6 and 7; nothing else changed. No code was modified in this session.
- Verified: node --test tests/registry.test.cjs -> 8/8 PASS (tests 8, pass 8, fail 0).

Result: Pre-fix failure reproduced exactly as reported (2 fail with the duplicate/edit FAIL lines); post-fix suite green 8/8. No commit, no push (not authorized by this dispatch).

Next step: Independent adversarial review of the fix before any Completed status (validator/tests are protocol core under PROTO-DEC-0038 item 1); commit/push only on owner instruction.

Open: The vibe log "falling back" check (PROTO-DEC-0094 B.5) is unverified for this session (log read denied); the model record above is the honest fallback. The scratch repro file in .ai/runtime/mistral-repro/ is disposable session state kept for the reviewer.

Evidence:
- anchor: 268e4fe64426723331c70408024129089b2985de, uncommitted changes present
- digest: sha256:9c713ae02bd17b6800dc005eac543c55a4b1df888ffbd5cb074071330282adca over 1872 tracked and untracked files
- digest format: 4
- recorded: 2026-09-28T17:05:56.218Z by mistral-31c0a7ec3787702f
- entry hash format: 2
- entry: sha256:14c594d79219bbc960c3527e5585a2be01a6aa4d39ef176c84127cfa464fccda of this entry without this block
- parent-entry: root
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 11s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
