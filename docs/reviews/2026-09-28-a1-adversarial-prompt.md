# Unified adversarial audit prompt: A-1 - an advisory review must never satisfy the completion gate

Issued: 2026-09-28 (UTC) at HEAD `6f44903`, dirty tree (the candidate commit follows this file).
Issuer: `claude-0ff8b28052330de0` (Claude Code, Claude Opus 5.5, effort max), the A-1 executor; it
certifies nothing. Scope: A-1 only. Verdict: none; this file is a prompt.
Authority: PROTO-DEC-0087 item 4; PROTO-DEC-0105 item 2; launch
`docs/research/2026-09-28-autocycle/LAUNCH-A1.md`; AGENTS.md section 2 (PROTO-DEC-0038 item 1).
Addressees: the two A-1 certifiers, Sol and MiMo (PROTO-DEC-0105 item 2), in parallel and
independently, each in its own session and worktree on the same frozen SHA, both outside execution
and control (PROTO-DEC-0041 items 1-2). Report <= 250 lines each.

## Candidate binding

- Branch `a1-installed-advisory`, base `74b46ff` (`v2.0.0` at launch). Commit `6f44903` holds the
  regression test alone, failing by design; the next commit holds the fix, one more test variant,
  one more control (the filled review template), this prompt and the executor journal. Audit the
  SHA the operator freezes.
- `git diff --stat 74b46ff <SHA>` must name exactly `validate-protocol.ps1`,
  `tests/validator-gate.test.cjs`, this file and `.ai/worklog/claude-0ff8b28052330de0.md`. Any
  other path is a finding. `.ai/bin/protocol-handoff.cjs` (gate-check) is untouched on purpose.
- Audit only: change no code, add no decision, run no repair.

## Defect and contract

AGENTS.md section 2: advisory outputs carry `[MODE: READ-ONLY ADVISORY]`, are explicitly
non-certifying, and an advisory review cannot satisfy the independent-review gate. Finding:
`docs/reviews/2026-09-27-claude-powershell-refactor-assessment.md:140`. At `74b46ff` both review
parsers of the validator (light path `:736-738`, strict path `:828-830`) failed only a Mode value
equal to `ADVISORY`, the marker was read nowhere, and gate-check runs in the source role only
(`:869`).

## The change (`validate-protocol.ps1`)

- New `Get-ProtocolAdvisoryReason` (`:580-605`). Both call sites (`:763-766`, `:855-858`) ask it
  where the exact compare stood: after the transcription check, before Reviewer and Verdict. FAIL
  text: `independent review <path> has Mode: <value>` or `... carries the advisory marker <text>`,
  then `; advisory reviews cannot satisfy the independent review gate` (unchanged for `ADVISORY`).
- Rule 1, Mode lines: at every line start of the header region, the zero-width pattern
  `` ^(?=[ \t]*(?:(?:[-*+]|\d+[.)])[ \t]+|>[ \t]*)*[*_`]*Mode(?![a-z0-9])[*_`]*\s*:\s*([^\r\n]+)) ``
  (IgnoreCase, CultureInvariant); FAIL when the value's ToUpperInvariant contains `ADVISORY`.
  Read on the raw header, HTML comments included.
- Rule 2, marker: `` \[[ \t*_`]*MODE[ \t*_`]*:[^\]\r\n]{0,80}ADVISORY[^\]\r\n]{0,80}\]? `` anywhere
  in the header after removing closed HTML comments of up to 4000 characters.
- Header region unchanged: text before the first `---` line, else before the first `## ` line, else
  the whole file. The body is never read. The source-role gate-check call (`:896`) is intact.
- Choices to attack: (a) substring, fail-closed: `Mode: CERTIFYING (not ADVISORY)` is refused;
  (b) Rule 2 skips comments because `templates/reviews/REVIEW.md:25-33` quotes the marker in a
  header comment, as does the real CERTIFYING review
  `docs/reviews/2026-09-19-mistral-vibe-v1.9.5-certification.md:13-20`; Rule 1 still reads comments
  so the old exact rule stays a subset; (c) zero-width scan, so one Mode line whose value runs onto
  the next line cannot swallow that line; (d) bounded quantifiers against quadratic scans.

## What the executor recorded (re-run it; do not trust it)

- Test-first: at `6f44903`, `node --test tests/validator-gate.test.cjs` fails tests 3 and 4 with
  their lists of cases not refused as advisory (8 and 4); at the candidate, 4/4 pass.
- Mutants, each killed: Rule 2 without the comment strip fails the template control (now
  `tests/validator-gate.test.cjs:233`); Rule 1 as a consuming scan accepts the header
  `- Mode:` / `Mode:` / `ADVISORY` (three lines), which the old exact rule refused.
- Parity probe (journal; same fixture in both roles; exit codes):

| role / path / review header | `74b46ff` | candidate |
|---|---|---|
| installed / strict / `Mode: READ-ONLY ADVISORY` | 0 | 1 (validator) |
| installed / strict / marker, Date 2026-09-28 or 2026-09-19 | 0 | 1 (validator) |
| installed / light / either form | 0 | 1 (validator) |
| source / strict / `Mode: READ-ONLY ADVISORY` | 1 (gate-check: must be CERTIFYING) | 1 (both) |
| source / strict / marker | 1 (gate-check: missing Mode) | 1 (both) |
| source / strict / marker, Date 2026-09-19 | 0 (gate-check legacy waiver) | 1 (validator) |
| source / light / either form | 0 | 1 (validator; gate-check still passes) |

- A-1 was wider than its finding: the source role accepted both forms on the light path, and a
  legacy-dated marker review on the strict path.
- Hostile ~200 KB headers, installed fixture: baseline 2196 ms; 50k `<!--` 5992 ms; 33k `[MODE:`
  1854 ms; 200k `*` 1890 ms; 100k `* ` 2190 ms; 33k `Mode:` lines 2360 ms; all exit 0.

## Required checks (raw output for each)

1. Scope: the `git diff --stat` above, then read all of `git diff 74b46ff <SHA>`.
2. Test-first: in a worktree at `6f44903`, `node --test tests/validator-gate.test.cjs`: the two A-1
   tests fail with their case lists; at `<SHA>`, 4/4 pass.
3. Targeted families at `<SHA>`: `node --test` on `tests/validator-gate.test.cjs`,
   `tests/validator-lightpath.test.cjs`, `tests/gate.test.cjs` and `tests/validator.test.cjs`. The
   full suite belongs to the operator's quiet window (LAUNCH-A1), not to you unless dispatched.
4. `powershell -ExecutionPolicy Bypass -File validate-protocol.ps1`: exit 0 (covers ASCII).
5. `node .ai/bin/protocol-handoff.cjs verify --owner claude-0ff8b28052330de0 --deep`.
6. Parity: rebuild the matrix on a fresh fixture with `tests/helpers.cjs` (the executor's inline
   probe is quoted in its journal); both roles must refuse both forms on both paths.
7. Your own probes from the list below, each with the exact review text and the exit code.

## Attack list

1. False negatives: an advisory declaration in a header that `<SHA>` still certifies (spelling,
   Unicode, emphasis, tables, HTML, a split marker, a value on the next line).
2. False positives: a legitimate certifying review that `<SHA>` refuses (the review template,
   `.ai/docs/PAIRED-CYCLE.md` Template 3, corpus reviews under `docs/reviews/`).
3. Subset: a header that the old exact rule refused and `<SHA>` accepts.
4. Header region: `---` on line 0, neither `---` nor `## `, CRLF, very long files.
5. Culture and case: Turkish-I and other current cultures.
6. Cost: any header that makes a scan super-linear.
7. PowerShell 5.1: enum cast from a string, `return` inside `foreach`, `-f` with braces in the
   value, an empty header, `$HeaderRegion` shadowing the caller's `$headerRegion`.
8. Test validity: vacuity (controls pass on the same fixture), the light route falling back to the
   strict path (asserted), state leaking between cases.
9. Parity: any role, path and form where the two roles disagree.

## Known residuals (outside A-1's allowed files; confirm or refute, do not fix)

- R1: Node gate-check still compares Mode exactly (`.ai/bin/protocol-handoff.cjs:1146` light,
  `:1244` strict) and never reads the marker. The validator now fails first, but a standalone
  `gate-check` run still passes the light-path and legacy-dated cases in the table.
- R2: the installed role still requires neither `Mode: CERTIFYING` nor `Receipt-Owner`: a review
  with no Mode line, or with a non-certifying value that lacks the word ADVISORY
  (`SHADOW-CERTIFYING`, `READ-ONLY`), still certifies there.
- R3: the marker is read only in the header region (as launched) and outside HTML comments (this
  candidate's deviation, choice (b)); hiding it there is no stronger than omitting it (R2).
- R4: `.ai/docs/PAIRED-CYCLE.md:349` says `Mode: ADVISORY` is rejected anywhere in the file; both
  engines read only the header region. The drift predates A-1.

## Your report

- `docs/reviews/2026-09-28-<you>-a1-certification.md`, header per `templates/reviews/REVIEW.md`:
  Reviewer, Date, Reviewed commit `<SHA>`, Working tree, `Mode: CERTIFYING`, your Receipt-Owner,
  Scope, and one verdict token (PASS, RECOMMENDATION, FAIL or BLOCKED).
- Keep the marker and advisory Mode values out of your header (above the first `---` line, or the
  first `## ` heading if there is no `---`): the candidate refuses such a review by design. Quote
  them below it.
- A FAIL or BLOCKED needs a reproduction per claim (AGENTS.md section 2). Then write a journal entry
  naming the review path and run `node .ai/bin/protocol-handoff.cjs record --owner <you>`.
