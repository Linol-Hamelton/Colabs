# Worklog: kilo-a5143d29cc7dd8ff

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

<!-- archived-parent: sha256:0331233172e3af7001e34510d03e9af3818ab299375c4fd0a94fce98707d441f -->

---

## 2026-09-28 - AUTOCYCLE-1 Part B: probes (MiMo, codex Sol/Luna, Sonnet 5.5, GLM-vibe), measurements

Agent: kilo (DeepSeek Flash via kilo; operator session kilo-a5143d29cc7dd8ff)

Action: Ran work-queue item 2 (probes) serially after the reboot gate; appended 9 rows to
`docs/research/2026-09-28-autocycle/MEASUREMENTS.jsonl`; updated STATE.md (Probes section, goals,
measurements summary) and OWNER-QUEUE.md (OpenRouter credits; Sonnet 5.5 id). Probe calls:
- `kilo run -m openrouter/xiaomi/mimo-v2.6-pro` -> HTTP 402, afford 27065 of 32000 max_tokens
  (`.ai/runtime/probe-mimo-openrouter.txt`);
- `mimo run -m openrouter/xiaomi/mimo-v2.6-pro` -> HTTP 402, afford 27065 of 128000
  (`.ai/runtime/probe-mimo-OR-mimo.txt`);
- `mimo run -m xiaomi/mimo-v2.6-pro` x2 -> READY PONG/PONG2; identity from `--print-logs`:
  `service=llm providerID=xiaomi modelID=mimo-v2.6-pro`; first call $0.022708305, 52169 in / 4 out,
  second 74 in / 5 out with 52096 cache-read, $0.0002493156;
- `codex exec -m gpt-6-sol` -> READY PONG; rollout `turn_context.model=gpt-6-sol`; 22465 in / 6 out;
- `codex exec -m gpt-6-luna` -> READY PONG; rollout `turn_context.model=gpt-6-luna`; 21947 in / 6 out;
- `claude -p --model claude-sonnet-5-5` -> `[claude-code:unrecognized_model]`;
- `claude -p --model sonnet` -> READY PONG; `modelUsage.canonicalModel=claude-sonnet-5`;
- `vibe -p` -> READY PONG; fresh warning 2026-09-28T11:59:58Z "Active model 'glm-5-3' is not in your
  configured models; falling back to default model 'mistral-medium-3.5'"; config models array holds
  only mistral-medium-3.5.

Result: Probes complete; pool confirmed: DeepSeek Flash (kilo), Gemini 3.8 (agy), codex
Sol/Luna/Terra, vibe = Mistral, MiMo via the xiaomi route only (OpenRouter blocked by credits).
Marginal probe spend $0.02296. OWNER-QUEUE gained the OpenRouter credit item and the Sonnet 5.5 id
item; the cycle-level package is sent at the cycle close, not now.

Next step: work-queue item 3 - 2A recovery 3 (prompt-only unified adversarial audit by the Gemini
executor on `kernel-batch-1` @ 5bc9940), then the freeze and the MiMo + Sol certification; the MiMo
route decision sits in OWNER-QUEUE and does not block the audit session.

Open: OpenRouter credits (owner); Sonnet 5.5 id (owner).

Evidence:
- anchor: 01e6304f425e14f702aa82e5a752e3fb2ba8d922, uncommitted changes present
- digest: sha256:cda25400e61c6beeb8e3550961a0bd221887be91d8208d318c5d538e99df3475 over 780 tracked and untracked files
- digest format: 4
- recorded: 2026-09-28T12:01:34.952Z by kilo-a5143d29cc7dd8ff
- entry hash format: 2
- entry: sha256:1b670e6a21c9dc2d4862aaf2f045ef2217bb21b7144730f81bb6d285aee04dda of this entry without this block
- parent-entry: sha256:0331233172e3af7001e34510d03e9af3818ab299375c4fd0a94fce98707d441f
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 4s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
