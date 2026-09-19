# Worklog: deepseek-flash-8a681a17d5224abf

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-19 - Pilot baseline committed; trial prompt template prepared

Agent: deepseek-flash

Action: The stop-path fix was committed and pushed as `b587dc1`, the H1 pilot baseline. Wrote the trial prompt template `docs/reviews/2026-09-19-h1-pilot-trial-prompt-template.md`: per-trial placeholders (arm, task, repetition, worktree, model), the isolation rules (work only in the trial clone, never in `D:\Colabs`, no commit), the per-arm instructions (A control; B with the exact pinned Repomix digest command and the raw-vs-compressed rule; C with the single sandboxed MCP server only for MCP-capable clients), the protocol session start/stop commands, the short machine-readable report-back format (outcome, files read, digest/MCP usage, token usage or the bytes/4 fallback), the dispatcher notes (one fresh session per trial, at least three fixed models, controller collects and adjudicates) and the ten verbatim task prompts copied from the design. The template makes the addressee explicit: each trial goes to a fresh session of a participating model as the subject; the owner schedules sessions; DeepSeek collects data and writes the pilot report.

Result: The pilot is ready to run; no code changed. CI on `b587dc1` was still running at check time.

Next step: Owner schedules the first trials (recommended: Arm A, one model, one repetition of all ten tasks) and sends the filled template to each fresh session; the controller starts `pilot-data/trials.jsonl` and collects the metrics.

Open: pilot trials; Arm B/C conditional on thresholds; external audit round and cleanup/v2.0 afterwards.

Evidence:
- anchor: b587dc1aedaed57a1f8d6c61da90416c4369ef03, uncommitted changes present
- digest: sha256:e6d44c22e9793167147409cc64ec2bb319419a50abcaa6de3bd78b194380fd6e over 167 tracked and untracked files
- digest format: 4
- recorded: 2026-09-19T14:16:22.764Z by deepseek-flash-8a681a17d5224abf
- entry hash format: 2
- entry: sha256:4b486f10d5b160ebeeacf27e541babba79d12fd4dcd75e444676f77922b886ba of this entry without this block
- parent-entry: root
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 3s
- test-protocol.ps1: exit 0 in 116s
- reproduce: node .ai/bin/protocol-handoff.cjs verify

---

