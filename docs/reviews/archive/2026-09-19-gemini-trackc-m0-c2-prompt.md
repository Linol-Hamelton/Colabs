# Gemini Track C Dispatch - M0 Context Digest and C2 External-Tooling Policy

**Date**: 2026-09-19  
**Implementer**: Gemini  
**Auditor**: DeepSeek - audits the item before its commit  
**Basis**: approved plan revision 2, section 6 (Track C); MCP selection analysis `docs/reviews/2026-09-19-deepseek-flash-mcp-selection-analysis.md`; owner decisions M1-M5 accepted.  
**Release state**: v1.9.5 released (`28f1e01`, annotated tag `v1.9.5`).  
**Precondition**: the owner opens the Track C task in `.ai/TASK.md` (`Status: In progress`, new objective) before validation; while TASK stays `Completed`, every new doc write stales the certified receipts and the standalone validator shows the expected gate failure - do not edit journals or TASK to silence it.

**Scope**: documentation plus one policy-pin test. No MCP server is installed, no runtime code changes, no new dependencies, no network calls in tests.

---

## Part A - M0: the universal, MCP-free context digest

Add a subsection **"Context digest (optional, on demand)"** to `.ai/docs/PROTOCOL.md` covering:

1. Purpose: a compact orientation artifact for every assistant (MCP-capable or not), so repeated whole-kernel reading is replaced by one on-demand file. The digest is advisory: never auto-injected into SessionStart, never cited in Evidence, never a gate input.
2. Exact command (pinned): `npx -y repomix@1.18.0 --include ".ai/bin/**,validate-protocol.ps1,test-protocol.ps1,tests/**" --no-git-sort-by-changes --style xml --output .ai/runtime/kernel-digest.xml`; add `--compress` for orientation only. Document that `--compress` is lossy and experimental and must not be used for implementation or audit work.
3. Rules: output lives under `.ai/runtime/` (git-ignored, disposable, digest-excluded); the file starts with a header naming the source tree digest (`node .ai/bin/protocol-handoff.cjs state`) and the Repomix version; discard on mismatch; absence of the tool degrades silently to normal file reads; no `package.json`/dependency is added; version pins change only by an owner-approved edit.
4. Measured sizes (from the selection analysis): core runtime scripts ~21.8k tokens raw / ~3.9k compressed; full kernel+tests ~88.1k raw / ~18.2k compressed - use raw for audits, compressed only for orientation.

## Part B - C2: MCP and external-tooling policy

Add a subsection **"MCP and external tooling policy"** to `.ai/docs/PROTOCOL.md` with these binding rules:

1. Advisory only: tool, cache, graph or MCP output is never Evidence and never influences a gate; the completion gate must never depend on external state.
2. At most **one** MCP server per adoption phase; total tool-schema budget <= 1500 tokens; servers must be local-only, workspace-sandboxed, version-pinned, with network tools disabled (for Repomix: `--mcp --sandbox`).
3. Hooks must never auto-install, download or spawn MCP servers; adoption is an explicit owner-approved configuration per client.
4. Derived indexes and caches live under `.ai/runtime/` (disposable); capability differences between agents must not change gate weight; when a server is unavailable the workflow degrades to identical gate semantics.
5. Secrets: tool output can carry credentials; the journal scanner is pattern-based only; never paste raw tool output containing secrets into journals or reviews.

Add one pointer sentence in `AGENTS.md` section 7: external tooling and MCP are optional accelerators; they are advisory, never Evidence or gate inputs; see PROTOCOL.md.

## Part C - Policy-pin test

Add `tests/context-policy.test.cjs` (register it in `protocol-manifest.json`), asserting the PROTOCOL.md anchors exist: the pinned `repomix@1.18.0` command, "never auto-injected", "never ... Evidence", "one MCP server", the `--sandbox` requirement, the schema budget, and the AGENTS.md pointer sentence. Keep it text-based like the A4 policy pin; no network.

## Part D - Decision draft

`PROTO-DEC-0034` (context digest and MCP policy) in your report for the owner; do not insert it into `.ai/DECISIONS.md` (the controller transcribes after approval and adds its registry row).

## Out of scope

C1 instrumentation and the H1 pilot (separate item); Serena/Qdrant evaluation; any MCP installation or client configuration files.

## Acceptance and evidence

- Full `test-protocol.ps1` green (expect one more test file), `validate-protocol.ps1` exit 0 with 0 warnings (with the Track C task open in TASK.md).
- The report includes the exact digest command, no network was used, and the policy text is quoted.
- Journal entry (five labels), `record --owner gemini-434bcd8012e0f38c`, `verify --deep` exit 0; stop for DeepSeek's audit; no commit, no push.

## Rules

- Do not modify implementation code, decision blocks, the registry, other sessions' journals or historical reviews.
- UTF-8 without BOM and LF; `.ps1` ASCII-only.
- Stop and ask on any contradiction with the repository or any red check.
