# Calling another agent from the terminal

Several assistants work in these repositories and they do not share chat history.
Most of them can be started directly from a terminal. This file is the contract for
that: who can be called, how, and what a call does and does not transfer.

It is a managed protocol document. The installer copies it into every project, so
the same rules hold in the protocol source repository and in every host project.

Read `AGENTS.md` first. Nothing here weakens it.

---

## 1. The roster

Verified on the owner's workstation on 2026-09-22 by running each binary. A command
that is not on this list is not part of the protocol; do not invent one.

| Command | Models | Non-interactive flag | Notes |
| --- | --- | --- | --- |
| `agy` | Gemini 3.8 / 3.7 / 3.6 Flash (High/Medium/Low), Gemini 3.1 Pro, and others | `-p` / `--print` | `agy models` lists ids; `--effort low\|medium\|high`; `--agent`, `--add-dir`, `--sandbox` |
| `codex` | GPT-6 Astra and others | `codex exec` | `-s/--sandbox`, `-C/--cd`, `-m/--model`, `--ephemeral`, `-c key=value` |
| `claude` | Opus 5 and others | `-p` / `--print` | `--model`, `--add-dir`, `--permission-mode` |
| `copilot` | several, `--model auto` picks | `-p` / `--prompt` | `--reasoning-effort`, `--agent`, `--context`, `--fleet` |
| `vibe` | Mistral 2 models | `-p` / `--prompt` | `--max-turns`, `--max-price`, `--max-tokens`, `--workdir`, `--enabled-tools` |

`agy models` and `copilot --model auto` change over time. Check the list rather than
hard-coding a model id in a script, and record the id you actually used.

### DeepSeek has no terminal client

There is no `deepseek` CLI on this workstation, and the obvious substitutions were
tested and failed for a measurable reason, not a configuration mistake:

- `codex` with `wire_api = "chat"` pointed at `https://api.deepseek.com/v1`:
  refused. Codex CLI 0.154.0 dropped the chat-completions wire protocol and accepts
  only `wire_api = "responses"`; DeepSeek's API is chat-completions.
- `codex` with `wire_api = "responses"` through OpenRouter (`deepseek/deepseek-chat`):
  authenticates and starts a session, then fails with `context_length_exceeded` -
  181,577 input tokens against the model's 163,840 limit, with `--ignore-user-config`
  already removing the local MCP stack. The Codex harness instructions alone exceed
  what a DeepSeek model can hold.

So DeepSeek participates through its IDE or chat interface, and its output reaches the
repository through the section 5.5 transcription fallback in `AGENTS.md`, marked
`[MODE: READ-ONLY ADVISORY]` unless the session itself ran `protocol-session.cjs start`
and produced its own receipt. Re-test when either a DeepSeek model ships a larger
context or a smaller harness is available; record the measurement, not an impression.

The verified per-client data is `.ai/docs/clients.json` (section 9); the table above is the 2026-09-22 snapshot.

---

## 2. A call is a dispatch, never a transfer of authority

Calling another agent hands over a task. It hands over nothing else.

- The called agent is bound by the same `AGENTS.md` and the same `.ai/DECISIONS.md`.
- A caller cannot grant an approval it does not have. An owner approval comes from the
  owner, and a proposal stays a proposal until then.
- A caller cannot authorise a callee to skip the completion gate, to mark
  `Status: Completed`, or to write a `PASS` it has not earned.
- A caller cannot widen the freeze, the forbidden paths or the scope of a task by
  writing a wider scope into the prompt.

If a prompt asks for something the protocol forbids, the called agent refuses that
part, does the rest, and records the refusal in its own journal.

---

## 3. The called agent owns its own session

Before doing any work, the called agent starts its own protocol session in the target
repository:

```bash
node .ai/bin/protocol-session.cjs start --agent <name>
```

That prints its context, its session id and one owner name. The callee uses that owner
name for its journal, its lock and its evidence.

- One journal per session. Nobody writes into another session's journal, and a caller
  never records a receipt for a callee.
- The caller does not hold the shared-document lock while a callee needs it. One writer
  at a time, whoever that writer is.
- If the callee changes the tree, it writes its own entry with all five labels and runs
  `protocol-handoff.cjs record --owner <its own owner name>`.

A call that runs in print mode inside another agent's terminal still produces a real
tree change when it edits files. Print mode is not a reason to skip the journal.

---

## 4. Terminal output is not evidence

What a callee prints into the caller's terminal is a claim. It is exactly as good as
prose in a journal, and it is not an Evidence block.

- Evidence is the callee's own journal entry plus its own `record` receipt.
- A result that exists only as stdout or in a chat panel is advisory. Persist it, if it
  matters, through the section 5.5 transcription fallback, with the header that
  fallback requires, and mark it non-certifying.
- Never paste a callee's claimed test result into your own entry as if you ran it. Name
  who ran it and link their receipt, or run it yourself.

---

## 5. Calling someone does not make you independent of them

Independence is a property of the work, not of the process boundary.

An agent that invokes another agent and writes its prompt has shaped and controlled
that work. By PROTO-DEC-0041 item 1 it may not then issue a `CERTIFYING` verdict on the
result. The certifier of a high-risk candidate stands outside both execution and
control, and a high-risk candidate needs two such reviewers working in parallel on the
same input package.

This is the rule most easily lost when dispatching becomes cheap. A caller can produce
five opinions in five minutes; none of them is an independent review of the caller's
own task.

---

## 6. Safe invocation

Default to the least privilege that still lets the task finish.

- Prefer a read-only or sandboxed run for anything that only needs to look:
  `codex exec -s read-only`, `agy --sandbox`, `vibe --enabled-tools <list>`.
- Do not pass `--dangerously-skip-permissions`, `--dangerously-bypass-approvals-and-sandbox`,
  `--allow-all-tools`, `--auto-approve` or `--yolo` unless the owner authorised that run.
  Record it in your entry when you do.
- Scope the workspace explicitly: `--add-dir`, `-C/--cd`, `--workdir`. A callee should
  not discover a second repository by accident.
- Bound the run where the CLI supports it: `vibe --max-turns --max-price --max-tokens`,
  `codex exec --ephemeral`, `--print-timeout` for `agy`.
- Never put a key, token or password into a prompt or a command line. Keys live in
  environment variables; the handoff scanner blocks entries that carry them.
- Run the callee in the repository the task belongs to. A protocol session in one
  checkout does not commit in another.

---

## 7. What a dispatch prompt must carry

A dispatch that omits these produces a round of clarification instead of work:

1. The repository and the exact start command for the callee's own session.
2. The task, and what is explicitly out of scope.
3. Forbidden paths, and the baseline commit SHA the work starts from.
4. What counts as done, stated so it can be checked by running something.
5. Who reviews, and the reminder that the callee may not mark its own work Completed.
6. The closing steps: `git diff`, a five-label journal entry, then `record`, and report
   the exit codes it actually printed.

---

## 8. Propagation

This file is listed under `managed` in `protocol-manifest.json`, so the installer
delivers it to every project and an upgrade refreshes it. A project whose installed
copy predates this file does not have it until it is upgraded; check
`protocolVersion` in its `protocol-manifest.json` before assuming these rules are
present there.

---

## 9. Kernel dispatch (source repository only)

Kernel agent dispatches are governed by `.ai/bin/protocol-dispatch.cjs`:

- Prompts are files. A dispatch never injects prompt prose inline on the command line; the invocation carries the one pointer line: `Read and follow the file <launch>`.
- Client commands are built only by `.ai/bin/protocol-dispatch.cjs` from `.ai/docs/clients.json`.
- Flags are accepted only as verified from `--help`, with binary version and verification date recorded.
- A new failure mode goes into the registry (`.ai/docs/clients.json`), not only into an individual run (PROTO-DEC-0050 item 3).
- Every attempt runs in a private clone with the Level-1 environment (PROTO-DEC-0070, PROTO-DEC-0077 item 3): detached HEAD, remotes removed, no-push rule enforced, and credential canaries stripped.
- Liveness is evaluated per PROTO-DEC-0075 item 5 (heartbeat progress, useful output growth, stall and hard limits).
- The old runners are superseded for new dispatches.
- Recovery follows PROTO-DEC-0075 as implemented here.
- Resolver order: For slots without an explicit route, selection evaluates ladder rungs across route data completeness, hard constraints (contextMin per PROTO-DEC-0075 item 8), floor checks (max(tiers) >= floor per PROTO-DEC-0059 item 2; tier-unknown if empty), independence exclusions (PROTO-DEC-0075 item 13), approval gates (needs-approval for owner-long-task when long=true and unapproved per PROTO-DEC-0076 item 1, PROTO-DEC-0078 item 4), and liveness probes (levels 0-1). Admissible rungs are sorted cheaper-first by largest rung number then lowest declared order. Substitutes proceed up the ladder by decreasing rung number then increasing order. Terminal cases (no admissible rung, or shortfall on kernel/certification stages) stop execution before launch per PROTO-DEC-0078 item 3 and workflowAI 1.5; escalation occurs only on verified failure per PROTO-DEC-0079 item 2.
- Supervisor recovery: Actions per failure class follow the Russian owner text and PROTO-DEC-0075 items 3, 5, 11. The attempt budget allows the primary its initial run plus one retry on retryable classes, two attempts per substitute, at most six fresh invocations in total, and resumes counted separately (up to three wakes per attempt per PROTO-DEC-0051 item 4, and one resume per crash or repair). Hard timeout stops the step as BLOCKED. Resume-first semantics govern STALL (wake pointer to `.ai/docs/dispatch/wake.md`) and PROCESS_CRASH, while INVALID_OUTPUT/VALIDATION_FAILURE triggers one repair resume with pointer to a synthesized repair file holding `.ai/docs/dispatch/repair.md` and failing check rows. Non-retryable classes (AUTH_ERROR, CONFIG_ERROR, MODEL_UNAVAILABLE, QUOTA_EXHAUSTED) fail over immediately to substitutes. RATE_LIMIT (60s wait) and NETWORK_ERROR/PROVIDER_ERROR (30s wait) retry once before failover.
- Launch pinning, completion contract, and run records: Before the first attempt, the supervisor records launch pins (HEAD commit SHA, launch file path and sha256, copyIn file hashes, dispatch sha256). Pre-attempt hash verification blocks modified inputs as `pin-changed` unless `--revise` initiates a new launch revision. A step achieves DONE only when the process exit code is recorded, all declared outputs exist and are non-empty valid UTF-8, slot validation exits 0, copied-back journal contains an `Evidence:` line, and supervisor certifies `supervisorDone`. Every settled step appends a run record satisfying `docs/specs/run-record.schema.md` to `docs/ops/RUNS.jsonl`, which serves as the source for `renderUsage` and dispatch reporting.
- This dispatch mechanism is not installed into host projects until the owner decides.

---

## 10. Signals ledger (source repository only)

The signals ledger `.ai/SIGNALS.md` is append-only and written only through `.ai/bin/protocol-signals.cjs`. Its line grammar lives in `docs/specs/signals-ledger.md` (one home; R-L0-12).

- Signal types (`procedure-gap`, `script-candidate`, `fall`) are recorded per PROTO-DEC-0051 items 2-4.
- Any participant can record a signal with `add`. A `Signal:` journal line is still accepted from a participant that cannot run the script, and the next `import` brings it in once by hash without modifying journals.
- At batch planning, the coordinator runs `plan --batch <id> --stamp` and records groups and dispositions with `update`; an `ESCALATE` row goes to the owner (PROTO-DEC-0051 item 2).
- A `script-candidate` is tested against the four conditions of executable rulebooks and recorded as `script:<path>` or `kept-by-assistant:<n>` (PROTO-DEC-0051 item 3).
- Falls come automatically from the kernel dispatcher upon attempt fall (S6; PROTO-DEC-0051 item 4).
- Ledger consumers are P-L0-001 and P-L0-006; M-008 counts come from `node .ai/bin/protocol-signals.cjs count`.
- While `CLI-AGENTS.md` is installed into host projects (`managed`), `.ai/SIGNALS.md` and `protocol-signals.cjs` are registered as `source` and remain in this repository only.
