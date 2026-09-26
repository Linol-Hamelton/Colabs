---
id: P-L3-005
version: 0.1
title: Set the model and effort of a client before the task begins
layer: L3
type: procedure
status: draft
roles: [coordinator, dispatcher, implementer]
stages: [dispatch, execute]
triggers: [dispatch, stage-enter:execute]
inputs: [task-frame, .ai/docs/clients.json]
outputs: [journal, signals]
back_edges: []
enforcement: S~
enforced_by: [.ai/bin/protocol-dispatch.cjs]
script_candidate: yes
evidence_class: [B, C]
evidence: [PROTO-DEC-0047, PROTO-DEC-0050, PROTO-DEC-0065, PROTO-DEC-0078, docs/core-arch/stage-4/MODEL-MATRIX.md:108-122]
cost_basis: unknown
---

# P-L3-005 Client model and effort

## Purpose

Every client sets its model and effort differently. This procedure defines how the coordinator, dispatcher, and implementer set the model and effort before the task begins without hardcoding client-specific flags or model identifiers into procedures.

## Rules

- R-L3-005.1. How a client sets its model and effort is registry data in `.ai/docs/clients.json` (`model.how`, `effort.how`, `effort.values`, `effort.note`), verified from the client's own help output with its version and date (PROTO-DEC-0047 item 9; 0050 item 3). This procedure never restates it (R-L0-12).
- R-L3-005.2. The model and the effort are set before the task begins: at launch, or with the client's own command right after launch and before the first task action, which counts as at launch (PROTO-DEC-0055 item 5; 0065 Consequences, transcriber's reading).
- R-L3-005.3. `flag` and `model-id`: the dispatcher builds them into the command from the registry template; nobody types them by hand (PROTO-DEC-0050 item 2).
- R-L3-005.4. `config`: the value is set in the client's own configuration, as `effort.note` says, before the launch, by one agent only, which keeps a backup, writes a journal entry and a record in the folder of the change (PROTO-DEC-0048 item 8).
- R-L3-005.5. `post-launch`: the executor's first action after orientation is the client command that `effort.note` names; the Launch line follows it.
- R-L3-005.6. Where `effort.how` indicates no setting is available: the effort cannot be set; the Launch line says effort=unknown and the run record's effortUsed is null.
- R-L3-005.7. A value outside the client's `effort.values` is never requested. The value that actually ran is recorded, not the requested one: in the Launch line (P-L2-002 R-L2-002.5) and in the run record's `modelRan` and `effortUsed` (PROTO-DEC-0047 item 9; 0078 item 5).

## Steps

1. **Read** (coordinator): the client's registry entry.
2. **Choose** (coordinator): the value from `effort.values`, per P-L2-002.
3. **Apply** (dispatcher, or the agent named by R-L3-005.4-5): the rule of its `how`.
4. **Confirm** (implementer): the Launch line.
5. **Mismatch** (coordinator): P-L2-002 back edge `7>5`.

## Stop conditions

Stop conditions, each going to P-L0-002 with a `procedure-gap` signal:
- the client is absent from the registry, or `present: false`;
- `probe` prints `VERSION_CHANGED` (re-verify the registry, 0050 item 3);
- `how` is `config` or `post-launch` and `effort.note` names no instruction.

## Back edges

None; P-L2-002 owns the relaunch.

## Evidence

- B, PROTO-DEC-0065 Context (clients differ; some take the model after start); B, the effort-unknown DeepSeek passes (P-L2-002 Evidence); C, the owner's words in 0065. Cost basis: unknown.

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| A note that is out of date | infrequent | moderate | Covered by the version probe of the client registry | One probe per dispatch | A registry update that changes flags without version change |
| A config change that leaks into other sessions | possible | substantial | Covered by the backup and the record of R-L3-005.4 | One backup file and worklog record | Concurrent sessions modifying the same client configuration file |

## Change log

- 0.1 — 2026-09-26 — gemini-ce0485aa5fe54c98 — first draft, A-12 (PROTO-DEC-0065 item 2) — review pending (PKG-5).
