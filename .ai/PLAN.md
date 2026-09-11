# Development Plan

Status: Draft
Task: Proposed next iteration after the published v1.2 audit
Author: GPT/Codex
Date: 2026-09-12
Approval: Pending owner prioritization; this document is a proposal.

## Context

Audit target: 0b3b0947593bcac9c6981a01ad8e0080dc6fe69d.
Full findings and longer roadmap: docs/reviews/2026-09-12-claude-v1.2-audit.md.
The former hardening plan remains available at that immutable Git revision.
Its CI requirement is not complete; the current green local suite has 59 tests.

## Wave 1 objective

Make validation and handoff claims dependable, reject invalid upgrades before
mutation, enable CI and remove the remaining documentary contradictions.

## Proposed implementation sequence

1. Add failing regressions for missing installer, disableAllHooks, deletion
   of a latest journal entry, empty fields, invalid hook-group structure and
   overridden Git ignore patterns. Findings T1-T5/T9 define the cases.
2. Require all runtime entrypoints in validation. Report disabled integration
   explicitly without silently changing the owner's setting.
3. Precompute and validate every installer merge before writing. Verify
   effective ignore behavior, not just presence of ignore-rule text.
4. Require a newly prepended complete handoff while preserving earlier
   history; a changed hash alone is insufficient evidence.
5. Add Windows CI for PowerShell 5.1 and PowerShell 7 with Node 22, the
   validator, full suite, encoding and installer package checks.
6. Align TASK/PLAN, hook-assigned journal naming, lock status field names and
   stale-lock wording. A timeout never proves the owner session has ended.
7. Make version/manifest information consistent and capture reproducible
   validation evidence against the exact commit being proposed.

## Acceptance criteria

- [ ] Removing an installer entrypoint fails validation.
- [ ] Disabled hooks produce a clear integration-state diagnostic.
- [ ] Removing history never counts as a new handoff.
- [ ] Invalid existing hook structure leaves target bytes unchanged.
- [ ] Runtime/backups/local-settings effective ignore rules are checked.
- [ ] New tests and the existing suite pass on the supported Windows matrix.
- [ ] CI runs on the exact proposed commit and publishes results.
- [ ] Documents use actual field names, consistent statuses and journal paths.

## Later waves, gated by evidence

- Session start/status/handoff/doctor/archive commands with one session ID.
- Safe whole-journal archival, interruption recovery and decision references.
- Claude and Codex adapters tested inside their real hosts; project trust and
  installed versions are checked, not inferred from documentation alone.
- Pilot 10-20 product tasks; measure lost context, duplicate work, owner
  questions, handoff startup time and documentation overhead.
- Public distribution: owner-selected license, contribution/security process,
  versioned releases, migration tests, compatibility spec and conformance suite.

## Discussion and authority

Open points and replies remain in TASK under DEC-0007. No new discussion file
or decision is created merely by proposing this roadmap. Existing decisions
can be superseded only by an approved new block; old blocks stay immutable.
