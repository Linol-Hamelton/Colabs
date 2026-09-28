# Operator <-> advisor channel (procedure for the operator)

Owner-approved 2026-09-28: the operator talks to the local Claude advisor directly through the Claude
CLI; the owner sees short reports. Starts after the 2A merge (after S6). Until then the owner relays.
The advisor's rules are in `ADVISOR-BRIEF.md`; this file is the operator's side.

## 1. When to send a request

Send a request where you would otherwise report to the owner and wait for a prompt:
- a milestone reached (certification verdicts, merge, S5/S6, cycle end);
- a STOP or an ambiguity you cannot settle from DECISIONS, AUTOCYCLE-PROMPT or STATE;
- a reserved item: send it to the advisor for a recommendation AND to the owner (section 5); the
  owner decides.
One request at a time. No new request while a reply is pending.

## 2. Request file

`docs/research/2026-09-28-autocycle/advisor/NNN-REQUEST.md` (NNN = 001, 002, ...):

```text
# ADV-NNN request
Состояние: <HEAD SHA v2.0.0, candidate SHA, ссылка на STATE.md>
Что произошло: <факты с путями и SHA>
Что я собираюсь делать: <план>
Вопрос: <что нужно решить>
Зарезервировано?: да/нет (по разделу 6 AUTOCYCLE-PROMPT)
STATUS: READY
```

Commit and push the request before the call (explicit path).

## 3. The call

First call (creates the advisor session), from `D:\Colabs`:

```text
claude -p "Ты - советник владельца. Прочитай docs/research/2026-09-28-autocycle/advisor/ADVISOR-BRIEF.md целиком, затем advisor/001-REQUEST.md, и ответь по формату брифа." --model opus --output-format json --allowedTools "Read,Grep,Glob,Edit(docs/research/2026-09-28-autocycle/advisor/**),Edit(.ai/worklog/**),Bash(git status:*),Bash(git log:*),Bash(git diff:*),Bash(git show:*),Bash(git ls-files:*),Bash(node .ai/bin/protocol-handoff.cjs:*),Bash(node docs/research/2026-09-28-autocycle/tools/mailbox.cjs:*)"
```

- Effort High: before the first call, check `claude --help` for an effort option. If it exists, add it with
  the value `high` to every call (first and resumed) and record it in MEASUREMENTS `effort`. If it does not,
  the owner sets High once in Claude Code settings and the operator records `effort=owner-setting`.
- Save `session_id` from the JSON output into `STATE.md` as `advisor_session=<id>` (not a secret).
- Later calls: the same command with `--resume <advisor_session>` and the prompt
  «Прочитай advisor/NNN-REQUEST.md и ответь по формату брифа.»
- The full JSON output goes to `.ai/runtime/advisor-NNN.json` (PROTO-DEC-0100 item 3).

## 4. After the call

1. Accept the reply only if `advisor/NNN-REPLY.md` exists and its last line is `STATUS: READY`.
2. Commit by explicit paths: the reply and the advisor's journal. Push (fetch first; no force).
3. MEASUREMENTS row: `role=advisor`, `client=claude`, `model_ran` from the JSON model usage field
   (`model_ran_source=api-field`, else `not-exposed`), `cost_shadow_usd` = the JSON total cost,
   `cost_marginal_usd` = 0 (subscription), `wall_s` from the JSON duration.
4. «Решения советника» and «Промпт оператору»: execute; record each decision in your journal and
   STATE as `ADV-NNN (selection=advisor)`. Never as a PROTO-DEC block, never with `Approved by:`.
5. «К владельцу»: stop that branch, add the OWNER-QUEUE line, send the owner a separate message.

Failure: non-zero exit, no reply, or no READY line within 20 minutes -> one retry after >= 5 minutes;
then STOP and one line to the owner. If `--resume` fails (session lost): start a new session with the
first-call command, adding the last three request/reply pairs to the prompt; note it in STATE.

## 5. What the owner sees

After each exchange, 3-5 lines in chat:

```text
[ADV-NNN] запрос: <одна строка> -> вердикт: <одна строка>
Исполняю: <что>
Советник отклонил/поправил: <что> | нет
Дальше: <что>
```

Separate messages, always: every STOP, every «К владельцу» item, every OWNER-QUEUE line.
Once per cycle: name one request/reply pair (the most consequential) for the owner to read in full.

## 6. What does not change

- Owner decisions and PROTO-DEC blocks: only from the owner's own messages.
- The delegated-merge rule, the reserved list, the budget thresholds, the environment gate.
- The advisor certifies nothing it directed (ADVISOR-BRIEF section 3).
