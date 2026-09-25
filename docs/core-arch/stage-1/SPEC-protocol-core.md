# Specification: `protocol-core.cjs` - lint, catalog, check-links, lcc (CORE-ARCH stage 1, S1-T10)

- Status: specification, not code. Built in S3-T13 before package I-a (CORE-ARCH-1 §6.4).
- Author: `claude-eb97ac9d13050014`, 2026-09-24. Baseline `4ded1be`, tree dirty.
- Form: section 1 of `docs/specs/2026-09-23-executable-rulebook-spec.md` (inputs, outputs, exit
  codes, boundary) and the script standard of PROTO-DEC-0047 item 8.

## 1. Boundary (the four conditions)

1. **Recorded rule.** Each check enforces `procedure.schema.md` and P-L0-004 once they are approved
   by a decision block. Until then the tool runs in shadow only and says so in its first output line.
2. **Repository state only.** Inputs are files under the repository root and the headings of
   `.ai/DECISIONS.md`. No network, no model, no git history except `git ls-files`.
3. **Same tree, same output.** Output is sorted by path, then line, then code; no timestamps in
   the body; the CATALOG header carries only source hashes.
4. **Visible when wrong.** Every result row names `path:line`, the check code and the offending
   value, so a reader can redo it by hand.

Not mechanised, and never approximated: whether evidence says what it claims, whether a record
is right, the minor/major line, LCC-7 (invariants).

## 2. Commands

### `lint <path|dir>...`

- Reads each `*.md` with a front-matter block. A file without one is skipped only under a `stage-*`
  work-product allowlist (`RULE-MAP.md`, `TRIAL-NOTES.md`, `SPEC-*.md`); elsewhere it is exit 2.
- Checks, each with a code:
  - `F1` grammar of `procedure.schema.md` §1 (one field per line, no nesting, no duplicate key)
    and unknown keys;
  - `F2` keys required for the record's `type` (§3 table);
  - `F3` conditional keys (`enforced_by`, `cost_basis`, `trial`, `decision`, `superseded_by`,
    `owner_approval`);
  - `F4` enumerations (`type`, `status`, `layer`, `enforcement`, `script_candidate`,
    `evidence_class`);
  - `F5` registries: `inputs`/`outputs` in §2.1 or a repo-relative path; `stages` in §2.2 or `any`;
    `roles` in the L1 slot catalog (until L1 lands: CORE-ARCH-3 §3) or `all`;
  - `F6` forms: `id`, `version`, `evidence` items (`DEC-nnnn`, `PROTO-DEC-nnnn`, `sig-…`,
    `path:line`), `back_edges` items (`<from>><to>/<budget>/<exit>`), `supersedes` items
    (`id@version` or `legacy:<path>:<line>`);
  - `F7` required `##` headings for the type, in their relative order;
  - `F8` a `status: active` record without `owner_approval` and `decision`;
  - `F9` rule ids: each `## Rules` item has an anchored id (schema §3), defined once across the
    scanned records; an L0 sub-rule whose root rule is not in `L0-ROOT.md` fails.
- Exit, as schema §1 states it: 0 all pass; 1 any F2, F3, F7 or F8 failure (a well-formed record
  breaking a rule); 2 any F1, F4, F5, F6 or F9 failure (unknown or malformed input
  is never guessed, PROTO-DEC-0049 item 2).

### `catalog [--root <dir>] [--check]`

- Default root `.ai/core/`; during design `--root docs/core-arch` scans `stage-*/`.
- Writes `CATALOG.md` (to `.ai/core/` after landing, to `.ai/runtime/` during design): one row per
  record, sorted by layer then id: `id | version | layer | type | status | roles | stages |
  triggers | title` - the exists and summary levels of loading.
- Header: sha256 of every source file, sorted. `--check` recomputes and exits 1 when stale,
  writing nothing.
- Exit: 0 written or fresh; 1 stale under `--check`; 2 a source fails F1.

### `check-links [--root <dir>]`

- Resolves every id reference in front matter (`supersedes`, `superseded_by`, `tools`, `decision`,
  `owner_approval`, id items of `evidence`) and every record id written in a body (`P-L<n>-<nnn>`,
  `S-<nnn>`, `ROLE-*`, `TOOL-*`, `M-<nnn>`) to a record or to a decision heading in `.ai/DECISIONS.md`.
- `--design` (the default under `--root docs/core-arch`): a reference to a record not yet written
  is printed as a `pending` row with the stage that owns its id (from CORE-ARCH stage tables) and
  does not fail; an id that no stage plans is a dangling reference. At a package freeze the tool
  runs without `--design`, and every reference must resolve.
- Every `path:line` in `evidence` exists, the line number is within the file, and the line is not
  blank (gap G8 of the S1-T08 trial). Whether the line says what is claimed stays with the reviewer.
- Exit: 0 all resolve; 1 any dangling reference or bad line; 2 an unparseable reference.

### `lcc <layer> [--root <dir>]`

- Runs LCC-1..LCC-6, LCC-8 and LCC-9 of P-L0-004 and prints the journal line with `7=manual`.
- LCC-1: a rule id defined (`R-L<n>-…` at the start of a rule line) in more than one record.
- LCC-8: bytes of the largest packet the layer implies, against CORE-ARCH-2 §6.
- LCC-9: every RULE-MAP row whose home is in the layer names an existing record or a pending stage.
- Exit: 0 all automated checks pass; 1 any fails; 2 an input is missing or unparseable.

## 3. Script standard (PROTO-DEC-0047 item 8)

- Fails closed: unknown input exits 2; a test targets silent pass-through for each command.
- Names the decision it enforces in `--help` (the stage-1 approval block, once written).
- Prints the rows behind its result.
- Golden corpus of real failures: CA-01 (root without invariant keys), CA-02 (class B without
  `cost_basis`), CA-03 (unknown artifact ids), CA-06 (back edge without budget), CA-08 (heading line
  cited as content), CA-S1 (back edge without source), S-003 first draft (path in `supersedes`),
  G7 (a lint that loses its escapes must fail its own tests, not pass everything).
- Runs in shadow beside the hand check for the whole of stage 2 before it is trusted.
- Certified with package I-a; re-verified whenever the schema version changes.
- Files: `.ai/bin/protocol-core.cjs` (managed), `tests/core.test.cjs` (test list).

## 4. Registry alignment (CA-03)

The preliminary artifact ids of schema §2.1 and the L5 catalog of CORE-ARCH-6 §5 now use the same
names. Three ids of §2.1 had no L5 row (`decisions-index`, `review-report`, `record-draft`); they
were added to CORE-ARCH-6 §5 in the same change as this specification.
