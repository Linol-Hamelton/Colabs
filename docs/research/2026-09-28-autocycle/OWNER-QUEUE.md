# OWNER-QUEUE (single writer: the operator; read by the owner in the morning)

One line per item: what, why it needs the owner, options, since when (ISO), cycle. Seeded
2026-09-28 by Claude with the items already known to need the owner.

- Packet 2: Kernel v1 choice (variants A/A'/B/C/D of `docs/research/2026-09-27-roadmap-queue/SUPERVISOR-PREREG.md`); reserved (AUTOCYCLE section 6 item 8); the operator fills the table overnight. Since 2026-09-27.
- A-1 merge: security semantics; reserved. Since 2026-09-28.
- V3 (c)/(d): the wave-1 author paragraph plus the owner's line (PROTO-DEC-0089). Since 2026-09-27.
- Certifiers for `kernel-batch-2` (if the batch reaches freeze tonight). Since 2026-09-28.
- GLM route: a separate technical task (provider documentation or API for the model id; PASS = log without "falling back"). Since 2026-09-28.
- F-C01 host review-path contract (TASK.md open question): on the pilot path. Since 2026-09-23.
- Optional round-6 synthesis (C01 item 5): not run tonight. Since 2026-09-28.
- Round-6 leftover `docs/reviews/2026-09-27-round6-consensus-discussion.md`: remainder of the failed synthesis; not used and not committed (per the owner's instruction); options: redo as a Mistral advisory after the reboot or discard. Since 2026-09-28.
- Kilo PID 42968 kept alive in Part A: live `kilo.exe serve` tree hosting the operator session, with two live agy background runners (perf1 M1-LAUNCH.md, w3 LAUNCH-W3-GEMINI.md); the kill condition ("no live task and not your own tree") was not met; owner to decide if it must be stopped. Since 2026-09-28.
- w3 worktree untracked `docs/research/2026-09-27-roadmap-queue/drafts/.ai/`: uncommitted, not the operator's; options: ignore, commit, or delete. Since 2026-09-28.
- OpenRouter credits BLOCK MiMo on that route (402: afford ~27065 tokens; kilo asks 32000, mimo asks 128000). MiMo works via the `xiaomi` provider route (verified 2026-09-28, identity in the mimo log). Options: top up OpenRouter, or record the xiaomi route as the MiMo route for the 2A/A-1 certifier work. Since 2026-09-28.
- Capability update "Claude Sonnet 5.5": the id `claude-sonnet-5-5` is unrecognized by the Claude CLI; the alias `sonnet` resolves to `claude-sonnet-5`. Confirm the intended model/id or correct the capability section. Since 2026-09-28.
- agy route down (2026-09-28): four dispatch failures in 30 min (400 location; `loadCodeAssist` EOF; `streamGenerateContent` EOF; model not recognized). Owner checks the VPN; after "VPN ok" one retry; then, per PROTO-DEC-0093, the successor is Gemini 3.8 Flash via the Gemini API (kilo/OpenRouter) or STOP to the owner. Recovery 3 (C01 item 6c) waits. Since 2026-09-28.
- Environment gate FAIL (2026-09-28T12:52Z): Pool Nonpaged 985.5 MB vs the post-reboot baseline 690.63 MB (+42.7%, limit +20%), slow growth +3.1 MB/min; other checks OK. Heavy steps paused per section 10. Ruling needed: waive the quiet-boot baseline under observation, or keep the pause. Since 2026-09-28.
