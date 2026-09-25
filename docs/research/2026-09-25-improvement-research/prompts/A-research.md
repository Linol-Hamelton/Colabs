# Study A — researcher prompt: what Google AX and every other improvement can give Colabs

- Frame `task:research-a`. Your one role: researcher (ROLE-researcher, draft). You propose; you
  certify, decide and change nothing. Mode: ADVISORY. Directives: PROTO-DEC-0066.
- Author: `claude-opus-5-5` (coordinator), 2026-09-25. Baseline `4ded1be`, working tree dirty.
- Owner's words: `docs/research/2026-09-25-improvement-research/BRIEF.md`. Read its index, then
  O-01, O-03, O-04 and O-07 in full. Where this prompt and the brief differ, the brief wins,
  except for the limits in section 3, which come from accepted decisions.

## 0. Before anything

1. `git rev-parse --show-toplevel` prints the `D:/Colabs` checkout, or you stop and report.
2. `node .ai/bin/protocol-session.cjs start --agent <the agent name of your job file>`; use the owner
   name it prints for your journal.
3. Journal line 1: `Launch: model=<id> effort=<value|unknown> client=<client>` (the values you run with).
4. Journal line 2: `Orientation: <model> @ task:research-a: researcher | rights=read, measure, write own files | limits=section 3 | tools=<what you have: shell, web, ...> | success=section 6 | tier=T6`
5. Do not open other researchers' files under `A/` until all four of yours are written. Say so in
   your journal when you finish.

## 1. Question

O-01: what can integrating Google AX, and any other change the sources below suggest, give Colabs
in speed, agent accuracy, context quality, convenience, architecture, security, scalability,
fault tolerance and cost? AX is one direction among many, not the answer to prove. "AX adds too
little now" is a valid finding (seed `OwnerIdeas/Google_AX.md` section 79).

## 2. Sources (O-03): use all of them, and tag each hypothesis with its provenance

- Seeds: `OwnerIdeas/Google_AX.md`, `OwnerIdeas/MCP_Server.md`, `OwnerIdeas/Rust.md`. They are the
  owner's hypotheses, not facts. Tag them `prov:O`. Their claims about AX, MCP or Rust are checked
  against primary sources before you rely on them.
- Repository (`prov:A` when measured or observed, `prov:B` when read from code or structure):
  `git ls-files` first, then `AGENTS.md`, `.ai/bin/*.cjs`, `validate-protocol.ps1`,
  `test-protocol.ps1`, `.claude/`, `.ai/DECISIONS.md`, `.ai/ARCHIVE.md`, `.ai/worklog/`,
  `docs/reviews/*findings*.md`, `Signal:` lines in journals, `docs/research/`, `docs/core-arch/`
  (the kernel redesign in progress; stage 1 L0 approved as design, stage 2 in review).
- External (`prov:C`), with URL and access date for every claim. Google AX facts come from
  `https://github.com/google/ax`: record the commit or tag you read, since the project expects
  breaking changes. MCP facts come from the specification site. Blogs and videos are leads only.
- Derived (`prov:D`): the questions of O-03 section 3, asked of Colabs itself.
- Measurement (`prov:A`): section 4. Failure-derived, contrarian, cross-domain (`prov:E`),
  combinatorial (`prov:F`) and negative hypotheses: O-03 sections 5-9.
- Provenance letters are the owner's scheme (O-03 section 10) plus `O`. They are not the kernel's
  evidence classes. For the kernel, every hypothesis here is a class C or D candidate until tested.

## 3. Limits (accepted decisions; they bind even where a seed says otherwise)

- Write only your four files under `A/` and your own journal. No edit to the kernel, `.ai/`,
  `docs/core-arch/`, shared documents or `OwnerIdeas/`. No commit.
- Install nothing and change nothing outside the repository: no Rust toolchain, AX, Kubernetes,
  MCP server, package or client setting (PROTO-DEC-0048 item 8, PROTO-DEC-0047 item 11). Prototypes
  and A/B tests belong to wave 2 (O-07).
- Measure in place only commands that write nothing tracked: `validate-protocol.ps1`,
  `test-protocol.ps1`, `node .ai/bin/protocol-index.cjs`, `node .ai/bin/protocol-handoff.cjs verify`,
  read-only `git` and `node` scripts. Anything that writes a journal, a lock or Evidence runs in a
  full copy of the working tree under the system temp directory, and the copy is deleted afterwards.
- A hypothesis that needs a closed question reopened names the block and the reopening rule:
  - MCP adoption: PROTO-DEC-0036, items 1, 4 and 5; its test must use the pre-registered metric
    and thresholds of item 4;
  - external tools: PROTO-DEC-0034, item 2 (never Evidence, never a gate input);
  - the Node validator plan: PROTO-DEC-0039, item 3; a Rust core competes with it;
  - memory engines and graph backends: PROTO-DEC-0045, item 1.
  Such a hypothesis is kept and marked; it is not dropped.
- Label claims FACT (with a `path:line` you opened or a measurement you ran), CLAIM or HYPOTHESIS.
  Do not quote other reports' prose; cite `path:line` (PROTO-DEC-0048 item 3).
- Never write keys, tokens or passwords.

## 4. Measurements (wave 1)

Build the baseline before most hypotheses: SessionStart and Stop hooks, `protocol-session start`,
`protocol-lock` acquire and release, `protocol-handoff record` and `verify`, `validate-protocol.ps1`,
`test-protocol.ps1`, `protocol-index`, and the git commands these run. For each: at least three
runs, median and spread, cold or warm, and a breakdown by component (git, PowerShell, Node, file
system, process start) where you can get one. Windows first. Also measure context: the size in
bytes of what a session loads at start. Let each anomaly produce a new hypothesis (O-03 section 4).

## 5. Method: the funnel of O-04

1. Wide pass: at least 100 distinct hypotheses if the domain allows. Do not pad the count. Cover
   every O-01 direction, the three seeds and the directions you find. Answer the contrarian pair
   or triple for AX, MCP, Rust, a daemon, a database, a cache, parallel agents, a multi-model
   council and a filesystem watcher.
2. Normalise: merge true duplicates only, never different mechanisms; cluster; report counts
   before and after. Show the provenance distribution; if one class dominates, run a targeted
   search for the thin classes and show the distribution again.
3. Screen every survivor, 0-3 each: effect, frequency, applicability, cost, technical risk, risk
   to protocol guarantees, testability, likelihood the effect exists. A measurement overrides a
   score.
4. Deep pass: cards for the strongest ones, about 20-30, without a hard cap in either direction.
5. Backlog for good hypotheses without a card; rejected list for any that a measurement refuted.
6. Synergies: combinations (A+B, A+C, B+C, A+B+C) where they could change the architecture.
7. Priority set by the O-04 value formula, with each input stated and measured inputs marked.

Statuses stay UNKNOWN unless a wave-1 measurement settles them.

## 6. Outputs (file names use your model id)

- `A/<model>-registry.md`: one table, one row per wide-pass hypothesis. Columns: `id`
  (`A-<model>-nnn`), `title`, `mechanism` (1-3 sentences), `directions`, `prov`, `source`
  (`path:line` or URL), `novelty` (KNOWN IN COLABS, KNOWN EXTERNALLY, NOVEL COMBINATION, NOVEL
  DERIVATION), `cluster`, the eight screening scores, `disposition` (card, backlog, merged into
  `<id>`, rejected).
- `A/<model>-cards.md`: one card per deep hypothesis, fields in this order: the card fields of
  O-04 section 4, then provenance, observation, links, related ids, novelty, confidence, and the
  kernel decisions it touches. After the cards: the backlog, then the rejected list (O-04 sections
  5-6).
- `A/<model>-measurements.md`: every command with runs, timings, machine and date.
- `A/<model>-report.md`, at most 250 lines. Header: SHA, tree state, model and effort as launched,
  client, date UTC, sources reached and unreachable. Then:
  - baseline and bottleneck tree;
  - funnel counts;
  - provenance distribution before and after the targeted search;
  - the AX and Colabs responsibility boundary, answering the questions of seed sections 41-45 and
    77 as far as the evidence allows;
  - synergies;
  - priority set;
  - wave-2 test plan: per hypothesis the variants, metric, runs and kill condition, for P-L0-007;
  - open questions for the owner.

## 7. Journal and hand-off

- One checkpoint line per funnel stage; `Signal:` lines for procedure gaps you meet.
- More than five minutes with no reading, writing or reasoning is a stall (PROTO-DEC-0049 item 3).
- If your context runs short, finish the file you are on, mark in it which stage is incomplete,
  and hand off. Never leave an unmarked partial file.
- End with a complete five-label entry, then
  `node .ai/bin/protocol-handoff.cjs record --quick --owner <your owner name>` (the validator only; PROTO-DEC-0071).
