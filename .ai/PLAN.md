# Development Plan

Status: Draft
Task: The first product pilot
Author: GPT/Codex, revised by Claude after wave 1
Date: 2026-09-12
Approval: Pending owner prioritization; this document is a proposal.

The owner subsequently requested project Codex configuration and further
development on 2026-09-12. TASK now tracks that authorized adapter and installer
preflight work. The product pilot below remains a separate proposal.

## Where wave 1 ended

Proposed by Codex in the 2026-09-12 audit, implemented and recorded as
DEC-0011 and DEC-0012.

- [x] Regressions for every reproduced counterexample: T1, T2, T3, T5, T9.
- [x] Validation refuses to be green for a protocol that is not running.
- [x] Effective Git ignore behaviour checked, not the presence of rule text.
- [x] Handoff carries evidence anchored to a tree digest.
- [x] CI on Windows PowerShell 5.1, including a clean install and an upgrade.
- [x] One manifest defines what the protocol owns; four lists became one.
- [x] Validation stops inspecting a host project's own source.
- [x] Documents, templates, lock fields and version identifier agree.

Not done from the original wave 1: T4, T6, T7, T8. They are narrower and none
of them produces a false green. T4 leaves a partial upgrade with backups on an
invalid hook structure; T7 accepts a Supersedes pointing at nothing; T8 picks
recent journals by modification time, which is unreliable after a clone.

## Production readiness, closed 2026-09-13

Recorded as DEC-0013. The Codex adapter round is DEC-0009 mechanics finished.

- [x] Codex adapter on a shared hook engine, with its own entry point.
- [x] Install footprint cut from 39 files to 22; source tooling stays here.
- [x] The protocol configures its own hooks and nothing else.
- [x] Dangling Supersedes fails validation.
- [x] Licence, contribution guide and security policy.
- [x] Version 1.4 consistent across manifest, rules and installer.

Open and deliberately not done: audit findings T6 and T8 in the SessionStart
hook, both narrow and neither able to produce a false green. The Codex adapter
has never run inside a real Codex host; if its schema is wrong the hooks simply
do not fire, which is the state before it existed.

## Objective

Find out whether this protocol reduces rework and context loss on real work,
before building anything further for it.

## Proposed approach

Run 10 to 20 comparable product tasks through the protocol with handoffs in
both directions, Claude to Codex and Codex to Claude. Include a defect fix, a
decision that gets superseded, two agents touching the same area, and a task
resumed after an interruption.

Measure, per task: constraints lost between sessions, work redone, questions
the owner had to answer, time for the next agent to become productive, and the
share of effort spent maintaining protocol documents rather than the product.

Compare against the cheapest alternative that could work: one task file and one
handoff note, with no lock, no hooks and no evidence.

## Alternatives considered

Continue hardening the tooling. Rejected for now: three rounds have improved
the scaffolding and none has produced evidence that it helps. T4, T6, T7 and
T8 are real but none of them can mislead a reader about the state of a project.

Build the Codex hook adapter first. Initially deferred until the pilot; the
owner has now explicitly requested Codex setup. The current implementation
reuses the shared engine and closes installer T4 as part of adding integration.
The pilot must still establish whether this mechanism earns its cost.

## Risks

The pilot measures a protocol used by its own authors, who know it well. The
numbers will flatter it. Agree the target metrics before starting, not after
seeing the result.

A product task large enough to need handoffs is also large enough to hide
whether the protocol or ordinary care produced the outcome. Prefer several
small comparable tasks over one large one.

## Validation

A published table of tasks and outcomes, including the failures, showing which
parts of the protocol earned their cost and which can be dropped.

## Review

- [ ] Owner names the first product objective
- [ ] Target metrics agreed before the first task
- [ ] Reviewed by GPT/Codex
- [ ] Approved by owner
