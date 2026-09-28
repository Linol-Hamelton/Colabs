# Worklog: codex-e7ed7431f3ebf38f

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-28 - H1 certifying review: installed-role protected set

Agent: codex (`GPT-5.6 Luna` via OpenAI Codex client; effort `xhigh`; usage `not-exposed`; certifier outside execution and control)

Action:
- Started protocol session `379fb43e2b6913a5`, owner `codex-e7ed7431f3ebf38f`; checked `.ai/TASK.md`, Git status/log, full tracked inventory, recent journals, decisions, launch, adversarial prompt, and candidate diff.
- Executed the adversarial prompt against frozen SHA `476b488abba8fb5614a81105241e8b806d820d54` without reading the other H1 certifier's artifacts before freezing this review.
- Ran targeted rulebook tests and validator; independently ran candidate/pre-fix matrices, archived test tree `28d13cc`, and a fresh real installer probe.

Result:
- Created `docs/reviews/2026-09-28-luna-h1-certification.md` with `Mode: CERTIFYING`, `Receipt-Owner: codex-e7ed7431f3ebf38f`, and overall `PASS`.
- Targeted suite: 63/63 PASS, exit 0; validator exit 0 with one pre-existing journal-count WARN.
- Candidate matrix cases 1-9: `FAIL/1`, `FAIL/1`, `FAIL/1`, `RECOMMENDATION/0`, `RECOMMENDATION/0`, `BLOCKED/2`, `BLOCKED/2`, `BLOCKED/2`, `FAIL/1`.
- Pre-fix archive: 56/63 pass, 7 red cases `1,2,3,4,5,7,9`; fresh install pre-fix `BLOCKED/2`, candidate `FAIL/1`.
- No mandatory finding remains; the stale older launch-note prediction is informational only.

Next step:
- Run `protocol-handoff.cjs record --quick --owner codex-e7ed7431f3ebf38f`, verify `matches`, then commit only the review and this journal on `cert-h1-luna`.

Open:
- Full `test-protocol.ps1` was not rerun per launch instruction; operator evidence records 432/432 PASS. No code, decision, frozen report, push, or merge performed.

Evidence:
- anchor: 476b488abba8fb5614a81105241e8b806d820d54, uncommitted changes present
- digest: sha256:7269e3af57d69ca1dacb4708aabcfd3959e39358dcbbb27273b78d843611e9bf over 1905 tracked and untracked files
- digest format: 4
- recorded: 2026-09-28T20:30:03.990Z by codex-e7ed7431f3ebf38f
- entry hash format: 2
- entry: sha256:05b63bd474b455b9bbefa504050e5b8145b44365b8edf231faa9c0dfa1e74466 of this entry without this block
- parent-entry: root
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 5s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
