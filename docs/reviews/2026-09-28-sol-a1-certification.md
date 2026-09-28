# Sol A-1 certification

Date: 2026-09-28T20:14:38Z
Reviewed commit: 8b74e4190be5b382eaed46b74f5755924dfab148
Working tree: dirty only for this certifier's review and session journal
Reviewer: GPT-5.6 Sol via Codex CLI 0.157.1
Provider: OpenAI, confirmed from this session's rollout metadata
Effort: Medium, confirmed from this session's turn context
Mode: CERTIFYING
Receipt-Owner: codex-518a4936ada98c03
Scope: full A-1 frozen tree, validator security semantics and regressions
Verdict: PASS

---

## Executive result

The frozen candidate fixes A-1 on both validator paths and in both repository roles. I reproduced
the pre-fix false green, reran the candidate tests, rebuilt the role/path/form matrix on fresh
fixtures, inspected the implementation, and attacked its declared boundaries. I found no defect
introduced by the candidate and no mandatory A-1 requirement left open.

The known blacklist and Node-engine limitations remain open, but they predate A-1, are explicitly
outside this candidate's contract, and are not weakened by it. They should be handled by the
separately authorised whitelist follow-up rather than by expanding this frozen fix.

## Independence and baseline

- I am neither A-1's author, executor, controller, nor a member of its executing pair.
- I did not read the parallel MiMo certifier's report or journal before fixing this result.
- Own rollout `01a0e99c-3d94-7a61-ab4b-756258abd70d` records provider `openai`, originator
  `codex_exec`, model `gpt-5.6-sol`, and effort `medium`; there is no tier mismatch.
- Start and end candidate SHA: `8b74e4190be5b382eaed46b74f5755924dfab148`.
- Frozen-tree scope from `git diff 74b46ff..HEAD --stat`: 9 files, limited to the two candidate
  files, unified prompt, executor and DeepSeek journals/review, and three launch documents.
- Implementation diff `74b46ff..7e51b89` was read in full. The Node gate engine is untouched;
  the PowerShell change is one helper and two call sites.

## Required-item results

| Item | Result | Independent evidence |
|---|---|---|
| 1. Scope and full implementation diff | PASS | Frozen stat has only the 9 launch-authorised paths; implementation has the expected 4 paths. |
| 2. Test-first | PASS | Pre-fix archive at `6f44903`: 2/4, with A-1 tests 3 and 4 failing; its validator is byte-identical to `74b46ff`. Frozen candidate: 4/4. |
| 3. Targeted families | PASS | `validator-gate` 4/4; combined `gate` 34, `validator-lightpath` 14, and `validator` 13: 61/61. |
| 4. Validator | PASS | Exit 0; PowerShell syntax/encoding inspection passed; one pre-existing journal-cap warning (109 > 100). |
| 5. Executor receipt | PASS | `verify --owner claude-0ff8b28052330de0 --deep` exits 1 as stale after later frozen-tree docs commits; this is expected, not candidate evidence. |
| 6. Parity | PASS | All 8 combinations of 2 roles x 2 routes x 2 canonical forms exit 1 with the A-1 refusal. |
| 7. Independent attacks | PASS | Results below confirm the declared boundary, old-rule subset, false-positive controls, culture, boundaries, and bounded cost. |

## Raw reproduction summary

Pre-fix `node --test tests/validator-gate.test.cjs`:

```text
# tests 4
# pass 2
# fail 2
not ok 3 - A-1: a READ-ONLY ADVISORY review fails the completion gate in both roles and on both paths
actual: installed strict/light and source light exit 0; source strict exits 1 without A-1 refusal
not ok 4 - A-1: advisory Mode values and markers are refused in any spelling, in the review header only
actual: list, emphasis, duplicate Mode, and quote variants exit 0
```

Frozen candidate:

```text
validator-gate: tests 4, pass 4, fail 0, exit 0
gate + validator-lightpath + validator: tests 61, pass 61, fail 0, exit 0
validate-protocol.ps1: Protocol OK. 1 warning(s)., exit 0
executor verify --deep: evidence is stale, exit 1
```

Fresh parity fixture output for each canonical declaration:

| Role | Route | Mode declaration | Marker declaration |
|---|---|---:|---:|
| installed | strict | exit 1, A-1 refusal | exit 1, A-1 refusal |
| installed | light | exit 1, A-1 refusal | exit 1, A-1 refusal |
| source | strict | exit 1, A-1 plus Node refusal | exit 1, A-1 plus Node refusal |
| source | light | exit 1, A-1 refusal | exit 1, A-1 refusal |

## Attack results

The exact probe header was `Date`, `Reviewer`, the text below, and `Verdict: PASS`, with no body
unless stated. These were run through the real PowerShell validator in an installed-role strict
fixture.

| Probe text or shape | Exit | Assessment |
|---|---:|---|
| `Mode: CERTIFYING` | 0 | non-vacuous control |
| `Mode: ADVISORY` | 1 | old exact refusal remains a subset |
| `- **Mode:** read-only advisory` | 1 | case, list, and emphasis covered |
| canonical Mode with CRLF | 1 | CRLF covered |
| canonical marker with no header terminator | 1 | whole-file header covered |
| marker split before `ADVISORY]` | 0 | known malformed-marker residual |
| `\| Mode \| READ-ONLY ADVISORY \|` | 0 | known table-cell residual |
| `#Mode: ADVISORY` | 0 | known exotic-prefix residual |
| `Mode: READ-ONLY` | 0 | known installed-role non-whitelist residual |
| no Mode field | 0 | known installed-role non-whitelist residual |
| marker in a closed short HTML comment | 0 | actual template-safe control |
| marker after 4,001 comment characters | 1 | declared bounded-comment behavior |
| marker inside a header-region fenced block | 1 | declared header-region behavior |
| marker below the first `---` | 0 | declared body exclusion; confirms R4 drift |
| `---` on line zero | 1 | empty header fails for missing Reviewer, not spuriously for A-1 |

Cost probe on otherwise identical valid certifying headers:

```text
50 KB of unmatched "<!--": exit 0, 3117 ms
200 KB of unmatched "<!--": exit 0, 6241 ms
```

A 4x hostile input caused about 2x elapsed time in this bounded sample; no super-linear failure was
observed. Under `tr-TR`, lowercase advisory text containing `{x}` returned the expected reason,
covering CultureInvariant matching and safe `-f` formatting. An empty-header direct call returned
null. Normal test execution also exercises the PowerShell 5.1 enum cast, `foreach` return, and the
case-insensitive local/parameter name.

Independent corpus/subset scan over 117 active review files using the exact candidate helper:

```text
refused: 30
certifying headers: 39
certifying headers refused: 0
old-exact-rule refusals accepted by candidate: 0
```

## DeepSeek residual closure table

| Residual | Independent result | Blocks A-1? | Disposition |
|---|---|---|---|
| R1: Node gate-check still compares Mode exactly and ignores the marker | Confirmed at `protocol-handoff.cjs:1146,1244`; source invocation remains guarded at `validate-protocol.ps1:896`. | No | Unchanged engine outside A-1; canonical forms now fail first in the validator. |
| R2: installed role lacks a positive CERTIFYING/Receipt-Owner whitelist | Confirmed: missing Mode and `Mode: READ-ONLY` both exit 0. | No | Pre-existing broader gate design; requires separately authorised whitelist work. |
| R3: header-only marker blacklist, bounded comments, malformed escapes | Confirmed: split marker, table cells, and exotic prefix exit 0; body text is excluded. | No | Explicit candidate boundary; none is a regression or a compliant advisory declaration. |
| R4: PAIRED-CYCLE says rejection occurs anywhere in the file | Confirmed at `.ai/docs/PAIRED-CYCLE.md:349`; both engines parse a header region. | No | Pre-existing documentation drift, outside A-1's allowed paths. |

## Final judgment

A-1 is fit to merge at the frozen SHA. The result is limited to this candidate: it does not certify
the broader installed-role completion-gate design, close R1-R4, or convert DeepSeek's advisory
review into certification. The owner retains merge authority under PROTO-DEC-0105 item 2.
