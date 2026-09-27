# GLM-5.3 probe for the DIG verification (operator, 2026-09-28)

Reason for the replacement: GPT-5.6 Sol is unavailable (owner: limit timeout, 2026-09-27). The
round-4 decision (PROTO-DEC-0089) names GLM-5.3 as the DIG verification model after a CLI probe;
its failure routes to the MiMo-V2.6-Pro reserve (PROTO-DEC-0089 item 4).

Method: `VIBE_ACTIVE_MODEL=glm-5.3 vibe -p "State the exact model name and ID you are running as,
on one short line. Then answer: 2+2=?" --max-turns 1 --trust --output streaming` with a UTF-8
console. Probe artifacts live in the wave-3 worktree (`.ai/runtime/glm-probe-*.txt`).

Observations:
- The run did not reject the alias and completed (`generationStatus: completed`, no client error).
- The assistant's self-report, verbatim: `I'm Mistral Vibe (CLI agent) running Mistral Large 24.02. 2+2=4.`
  Self-reports are unreliable and this one contradicts GLM-5.3.
- The client output carries no model field; `~/.vibe/logs/vibe.log` and the session index do not
  record the model id for the session.
- Probe 1 failed on console encoding; probe 2 (default output mode) captured nothing - this build
  prints only in `--output streaming`.

Result: **INCONCLUSIVE** - the route works, the actual model id is not confirmed by the client
output. Awaiting the owner: accept the route as GLM-5.3 (weak confirmation only) / retry with a
stronger method / treat as a probe failure and use the MiMo-V2.6-Pro reserve for this verifier
slot as well.
