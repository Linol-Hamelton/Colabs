---
id: SCHEMA-procedure
version: 0.6
title: Shape of every kernel record: front matter, body sections, loading levels
layer: L0
type: schema
status: draft
evidence_class: [B, C]
evidence: [docs/research/2026-09-24-remediation-mapping/PROCEDURE-MAP.md:131, docs/research/2026-09-24-remediation-mapping/PROCEDURE-MAP.md:144, PROTO-DEC-0049]
cost_basis: unknown
---

# Procedure schema (draft 0.6)

- Status: draft of CORE-ARCH stage 1, task S1-T01. Not binding until approved (PROTO-DEC-0054 item 1).
- Pattern borrowed from graphmemory `src/graphs/*-types.ts`: the shape of a record is defined
  once, apart from the records and apart from the code that reads them.
- Every file under `.ai/core/L*-*/` (after landing) starts with a front-matter block that
  matches this schema. `protocol-core.cjs lint` (spec: S1-T10) checks it.

## 1. Front-matter grammar

The front matter is a restricted subset of YAML, so a fixed-grammar parser can read it
without a YAML library (PROTO-DEC-0049 item 2):

```
front_matter ::= "---" LF { field LF } "---" LF
field        ::= key ":" SP value
key          ::= [a-z][a-z0-9_]*
value        ::= scalar | list
scalar       ::= <one line, no leading "[", no "#" comment>
list         ::= "[" [ item { "," SP item } ] "]"
item         ::= <token without "," "[" "]">
```

- One field per line. No nesting, no multi-line values, no anchors, no comments.
- Keys appear at most once.
- Exit 2 (unknown input, never guessed): a grammar violation, an unknown key, a value outside
  its enumeration or registry, or a malformed form (a scalar where a list is expected, a bad
  id, `evidence`, `back_edges` or `supersedes` item, a rule id without its anchor).
- Exit 1 (a well-formed record that breaks a rule): a missing required or conditional key,
  missing or misordered required headings, `active` without `owner_approval` and `decision`.
- Order of keys is free; `lint --fix-order` may normalise it, never the values.

## 2. Fields

| Key | Req. | Type | Allowed values / form | Meaning |
|---|---|---|---|---|
| `id` | yes | scalar | `P-L<0-9>-<nnn>`, `S-<nnn>`, `ROLE-<slot>`, `TOOL-<name>`, `APP-<name>`, `M-<nnn>`, `SCHEMA-<name>` | permanent identifier, never reused |
| `version` | yes | scalar | `<major>.<minor>` | major changes meaning; minor clarifies |
| `title` | yes | scalar | one line, ≤ 100 chars | the summary level of loading |
| `layer` | yes | scalar | `L0`..`L9` | the one home layer |
| `type` | yes | scalar | `invariant`, `procedure`, `scenario`, `role`, `tool`, `application`, `metric`, `schema` | kind of record |
| `status` | yes | scalar | `draft`, `review`, `trial`, `active`, `deprecated`, `retired`, `superseded` | lifecycle state (P-L0-001) |
| `roles` | yes | list | role slots from L1, or `all` | who must load it (declared minimum, never a ceiling) |
| `stages` | yes | list | stage ids from section 2.2, or `any` | when it applies |
| `triggers` | yes | list | short tokens, e.g. `signal:procedure-gap`, `owner-directive`, `stage-enter:acceptance` | what starts it |
| `inputs` | yes | list | artifact ids from section 2.1 or repo-relative paths | what it reads |
| `outputs` | yes | list | artifact ids from section 2.1 or repo-relative paths | what it writes |
| `tools` | no | list | `TOOL-*` ids | tools it carries (L3) |
| `back_edges` | yes | list | `<from-step>><to-step>/<budget>/<exit>`, e.g. `7>4/2/owner` | every loop with its source, target, budget and where it exits; `[]` if none |
| `enforcement` | yes | scalar | `S`, `S~`, `P`, `none` | script, partly script, prose only, decided but not built |
| `enforced_by` | cond. | list | repo-relative script paths | required when `enforcement` is `S` or `S~` |
| `script_candidate` | yes | scalar | `yes`, `no:<unmet spec §1 condition number>` | result of the four-condition test |
| `evidence_class` | yes | list | `A`, `B`, `C`, `D`, `E` | why it exists (CORE-ARCH-2 §3) |
| `evidence` | yes | list | `DEC-*`, `PROTO-DEC-*`, `sig-*`, `path:line` | where the evidence is; prose claims do not count |
| `cost_basis` | cond. | scalar | `attempts=<n>`, `minutes=<n>`, `owner=<n>`, `unknown` | required for class B |
| `trial` | cond. | scalar | `metric=<M-id>; kill=<condition>; until=<YYYY-MM-DD or batch-id>` | required for class C and D while `status: trial` |
| `decision` | cond. | list | `PROTO-DEC-*` | required when the record is binding (`active` and not advisory) |
| `supersedes` | no | list | ids with version, e.g. `P-L2-004@1.2`, or `legacy:<path>:<line>` for pre-kernel text | predecessor |
| `superseded_by` | cond. | scalar | id with version | required when `status: superseded` |
| `owner_approval` | cond. | scalar | decision id or `none` | required for `active` |
| `last_applied` | no | scalar | batch id or date | information only; never a reason to retire (PROTO-DEC-0060) |

`cond.` means required under the condition in the Meaning column; `lint` enforces each condition.
`yes` means required for the types that section 3 lists as needing the full key set; section 3
says which keys each type needs. Conditional keys apply to every type without exception.

### 2.1 Artifact ids (preliminary registry)

The owner of this registry is L5 (CORE-ARCH-6 section 5). Until stage 5 lands, this list is the
registry, and `inputs`/`outputs` may name only these ids or a repo-relative path:

`task-frame`, `environment-manifest`, `orientation-line`, `candidate-package`, `evidence`,
`findings-ledger`, `attempt-results`, `signals`, `journal`, `stop-question`, `CATALOG`,
`decisions-index`, `review-report`, `record-draft`.

A new id is added here (and later in L5) through P-L0-001, never by using it first.

### 2.2 Stage ids (preliminary registry)

Owned by L2 (CORE-ARCH-4) once stage 3 lands. Until then `stages` may name only:
`intake`, `frame`, `triage`, `dispatch`, `execute`, `accept`, `freeze`, `close`, `session`,
`research`, or `any`. Added in 0.4 after the S1-T08 trial found `research` used and undefined.

## 3. Required body sections, in order

A procedure body is free prose inside these headings. `lint` checks that the headings exist
and are in order; it never parses the prose.

1. `## Purpose` — one paragraph: the failure class it prevents or the gain it produces.
2. `## Rules` — numbered atomic rules, each `<rule-id>. <one normative sentence>`. Rule ids are
   anchored:
   - in L0, `R-L0-<nn>` is a rule of the root (`L0-ROOT.md`), and a procedure's rules are its
     sub-rules `R-L0-<nn>.<k>`; the root must define `R-L0-<nn>`;
   - in every other layer, the anchor is the record's own id without its type prefix:
     `R-L2-008.<k>` in P-L2-008, `R-L2-S003.<k>` in S-003, `R-L1-certifier.<k>` in ROLE-certifier;
     the record is the anchor, and no separate root line is needed;
   - a rule id is defined once, in one record (LCC-1).
3. `## Steps` — numbered steps; each names its actor slot, input and output.
4. `## Stop conditions` — when to stop and go to P-L0-002.
5. `## Back edges` — prose for each `back_edges` entry.
6. `## Evidence` — the dossier: one line per class entry with its reference and cost.
7. `## Risks` — table in the PROTO-DEC-0049 item 4 form: risk, likelihood, impact, coverage,
   cost, residual.
8. `## Change log` — one line per version: version, date, author session, reviewer, decision.

Required keys and headings by type:

| Type | Required front-matter keys | Required `##` headings, in this relative order |
|---|---|---|
| `procedure`, `tool`, `application`, `metric` | every key marked `yes` in section 2 | the eight above |
| `scenario` | every key marked `yes` | the eight above, plus `Stage graph` and `Handoff artifacts` after `Steps` |
| `role` | every key marked `yes` except `back_edges` | `Purpose`, `Rules`, `Rights`, `Duties`, `Limits`, `Procedures`, `Evidence`, `Risks`, `Change log` |
| `invariant` | `id`, `version`, `title`, `layer`, `type`, `status`, `roles`, `stages`, `triggers`, `enforcement`, `script_candidate`, `evidence_class`, `evidence` | `Purpose`, `Rules`, `Evidence`, `Change log` |
| `schema` | `id`, `version`, `title`, `layer`, `type`, `status`, `evidence_class`, `evidence` | `Change log` |

- Conditional keys (`enforced_by`, `cost_basis`, `trial`, `decision`, `superseded_by`,
  `owner_approval`) apply to every type, including `invariant` and `schema`.
- Other `##` headings may appear between the required ones. `lint` checks only that the
  required headings exist and keep this relative order.
- `###` subheadings are free.

## 4. Loading levels

Levels of loading, not of permission; reading is never forbidden (L0 R-L0-09):

| Level | What an agent receives | Source |
|---|---|---|
| exists | `id`, `title` | CATALOG line |
| summary | exists + `roles`, `stages`, `triggers`, `status` | CATALOG line |
| full | the whole file | the file |

A packet (CORE-ARCH-7) loads `full`:
- the root;
- records whose `roles` name the slot explicitly and whose `stages` name the stage or `any`;
- schema records named in the `inputs` of those records.

Records with `roles: [all]` apply to everyone but load at `summary` level; each one is opened
in full when its trigger fires, and the root names where to go for each trigger. Everything
else loads at `summary`. Why: with `all` loaded in full, the procedure-author packet of L0 was
49,495 B against a 40,000 B budget (LCC-8, CA-S2); under this rule it is 34,897 B.

## 5. Examples

Valid:

```
---
id: P-L0-002
version: 0.1
title: Stop and ask when a rule is missing, conflicting or blocked
layer: L0
type: procedure
status: draft
roles: [all]
stages: [any]
triggers: [rule-not-found, source-conflict, tool-blocked, scope-exceeded]
inputs: [journal]
outputs: [stop-question, journal]
back_edges: []
enforcement: P
script_candidate: no:1
evidence_class: [A, C]
evidence: [docs/research/2026-09-23-kernel-architecture/DISCUSSION.md:167, docs/research/2026-09-23-kernel-architecture/DISCUSSION.md:179]
---
```

Invalid, with the exit each produces:

| Front matter | Exit | Why |
|---|---|---|
| `roles: certifier` | 2 | list expected, scalar given |
| `status: approved` | 2 | not in the enumeration |
| `enforcement: S` without `enforced_by` | 1 | conditional field missing |
| `evidence_class: [B]` without `cost_basis` | 1 | class B needs its cost |
| `evidence: [we saw this often]` | 2 | not an id or `path:line` |
| a nested `roles:` block on several lines | 2 | nesting is outside the grammar |

## Change log

- 0.1 — 2026-09-24 — claude-eb97ac9d13050014 — reviewer DeepSeek: FAIL (CA-02, CA-03, CA-08) — no decision.
- 0.2 — 2026-09-24 — claude-eb97ac9d13050014 — keys and headings by type; conditional keys apply to all types; artifact-id registry 2.1; citations moved to content lines — reviewer DeepSeek r2: verified.
- 0.3 — 2026-09-24 — claude-eb97ac9d13050014 — back-edge form names its source step (implementer-found CA-S1) — reviewer DeepSeek r3: verified.
- 0.4 — 2026-09-24 — claude-eb97ac9d13050014 — `legacy:` form in `supersedes`; stage-id registry 2.2 (both from the S1-T08 trial) — reviewer DeepSeek S1-T11: FAIL (CA-24 class, CA-26).
- 0.5 — 2026-09-24 — claude-eb97ac9d13050014 — rule-id anchoring defined for every layer (CA-24); one exit-code rule for lint, consistent with SPEC and the examples (CA-26); `all` records load at summary until triggered (CA-S2) — reviewer DeepSeek: RECOMMENDATION.
- 0.6 — 2026-09-24 — claude-eb97ac9d13050014 — `last_applied` is information only (PROTO-DEC-0060) — review pending (stage-1 re-check).
