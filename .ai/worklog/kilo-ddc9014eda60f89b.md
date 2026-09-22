# Worklog: kilo-ddc9014eda60f89b

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-22 - Candidate tool evaluation (CodeGraph, Serena, Graphiti, Cognee, Letta, Mem0)

Agent: kilo-ddc9014eda60f89b

Action: Owner-directed research while a peer session works: evaluated six candidates
(CodeGraph, Serena, Graphiti, Cognee, Letta, Mem0) against the fleet's measured plans,
experiments and data. Read the session start set (TASK/PLAN/DECISIONS/PROTOCOL),
PROTO-DEC-0034/0036/0039/0044, the H1 correction, the MCP council Round-2 synthesis, the
DeepSeek MCP selection analysis, the archived 2026-09-22 arena/layer entries and the
active sessions' journals; fetched the six projects' official READMEs and GitHub metadata
on 2026-09-22 and measured this host read-only (31.7 GB RAM, i9-13900HX, RTX 4060 Laptop,
Docker 28.5.1, uv 0.10.3, Python 3.14/3.13, Node v22.21.0, Ollama present, rg MISSING).
Persisted the advisory report `docs/research/2026-09-22-kilo-candidate-tool-evaluation.md`
(142 lines, 21,644 B, UTF-8 LF, deliberately outside the near-full `docs/reviews/` corpus).
No install, daemon, benchmark, shared document, lock, decision block or product repository
was touched.

Result: All six dispositions are defer/reject with named change-triggers; none should be
adopted now (PROTO-DEC-0036/0039 and the council's native-only ruling). Key findings:
(1) the measured bottleneck is stratum S3 (prose/governance), not the S1 symbol
navigation Serena/CodeGraph target, so the preregistered Serena premise is not met;
(2) the three measured 2026-09-22 failures (omission, 95 byte-identical records,
+14,000 B/day governance growth) are already closed deterministically by Layers A/B/C
(DECISIONS 117,321 B -> 13,932 B index, 8.4x); (3) CodeGraph (`colbymchenry/codegraph`:
71,817 stars, MIT, v1.6.0, single MCP tool, Rust+SQLite, Windows, Dart/Kotlin/Swift) is a
new same-class candidate, distinct from the rejected CodeGraphContext, and should be held
as the alternative S1 arm; (4) Graphiti/Cognee/Mem0 add non-deterministic external memory
that PROTO-DEC-0034 already rejected, on top of the undecided ~8 GB legacy stack;
(5) Letta (`letta-ai/letta-code`) is a full stateful agent runtime, not a component.
`validate-protocol.ps1` exit 0, 0 warnings.

Next step: the owner can take the two decisions that need no experiment now - keep-or-delete
for `D:\mcp-memory-data`/`D:\mcp-stack` and the postponed DeepSeek mapping run - and fold
this report into the post-pilot decision without a new council. If an S1 bottleneck ever
materialises, the report records the additions to the already preregistered spec.

Open: No candidate was installed or benchmarked; MCP schema cost, Windows behaviour and
Dart/Kotlin/Swift quality remain UNKNOWN until measured. The S3 statement rests on the
current TASK measurement, not a re-derivation. `rg` missing on this host is a native-arm
data point for the pilot method. The tree is dirty (checkpoint
`proto-dec-0044/layers-abc-checkpoint`) and a peer session is active, so this receipt binds
the current tree and may stale as that session edits.

Evidence:
- anchor: f68b50222ba3afa92dd3be36f4197ac8307d9511, uncommitted changes present
- digest: sha256:b8de215444bb7892d5c5db3861fcbfc845e2218c466a2714fbb39761fd4a1495 over 269 tracked and untracked files
- digest format: 4
- recorded: 2026-09-22T20:06:41.895Z by kilo-ddc9014eda60f89b
- entry hash format: 2
- entry: sha256:1ffeb7014fea557b98360f207133790e7dd7b36c6ec719105e548506f72b0861 of this entry without this block
- parent-entry: root
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 3s
- test-protocol.ps1: exit 0 in 236s
- reproduce: node .ai/bin/protocol-handoff.cjs verify

---


