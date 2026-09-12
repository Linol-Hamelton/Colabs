# Current Task

Status: In progress
Owner: RuslanFomenko
Last update: 2026-09-12

## Objective

Configure a project-local Codex adapter using useful Claude practices, then
advance the protocol after Claude's two completed improvement sessions.
Authorized by the owner's 2026-09-12 request in this session.

## Acceptance criteria

- [ ] Add portable Codex SessionStart/Stop hooks with isolated journals.
- [ ] Reuse the existing engine and retain Claude compatibility.
- [ ] Install/upgrade both adapters while preserving host settings.
- [ ] Reject invalid integration settings before any install writes (T4).
- [ ] Test the adapters, installer, validator and handoff evidence.
- [ ] Document activation and distinguish static from live checks.

## Current state

Started from clean main at 78f10f3, after DEC-0011 and DEC-0012.
Baseline validator exits 0; the suite passes 81 tests with no skips.
Branch: codex/project-adapter. Codex user settings already exist on this PC;
the project folder is new. Global model preferences remain inherited.

## Active agent

- Codex, session codex-20260912-adapter, holds the shared-document lock.
- Installer delegate owns setup-ai-protocol.ps1 and tests/installer.test.cjs.

## Open questions

1. The project still has no product pilot; the owner has not named a product.
2. T6, T7 and T8 remain separate findings. T4 is in this task's scope.
3. Codex host trust/activation must be distinguished from adapter tests.
4. The repository still has no licence, release tags or contribution process.

## Next

Complete the Codex integration and installer preflight. Then run the product
pilot from PLAN when the owner supplies its objective.
