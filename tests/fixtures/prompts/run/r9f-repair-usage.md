# Launch: task:ownerideas-r9f-repair-usage

- Frame: `task:ownerideas-r9f-repair-usage` (parent program: `ownerideas-revision`). This role holds
  for this frame only. You certify nothing; you repair one confirmed defect.
- Agent name for the protocol: `gemini`. Model and route (frozen): Gemini 3.8 Flash, effort high,
  through agy.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `prompts/REPAIR.md` (reproduce first; minimal fix; refute with evidence if a reproduction fails;
  no redesign; no commits), then the specs named below.

## Finding (a defect against the packages' own specs; not a new feature)

- PKG-1 S8 (`round6/packages/PKG-1.md:309`) requires "port `usageOf`" from
  `docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs:158-170`.
- PKG-3 S8 (`PKG-3.md:278-281`) requires the usage table to render from the records and `report` to
  say WHY usage is missing.
- PROTO-DEC-0075 item 9 requires cost to be recorded.
- Today `.ai/bin/protocol-dispatch.cjs` hard-codes: tokens `{in:null,out:null,source:'none'}` and
  usage `{amount:null,unit:null}` (~1785); an all-null cost (~1916); and a report line
  "client reported no tokens/cost" that never reads the log (~2036). The `usage` key of
  `.ai/docs/clients.json` is read nowhere.

## Scope

a. Parse each attempt's usage from that attempt's own log after the attempt ends, dispatched by
   `clientCfg.usage`. Semantics are ported from `usageOf`:
   - `kilo-json` (kilo and mimo): the sum of step-finish `part.cost` gives
     usage `{amount, unit:"USD"}`; the sum of `part.tokens.input`/`output` gives
     tokens `{in, out, source:"client-output"}`.
   - `copilot-credits`: the sum of `/AI Credits\s+([0-9.]+)/` gives usage `{amount, unit:"credits"}`.
   - `codex-tokens`: the sum of `/tokens used\s*\r?\n?\s*([0-9,]+)/i` gives usage
     `{amount, unit:"tokens"}`; tokens stays null with source "none".
   - none, or nothing found: null and source "none". Never estimate a number (PKG-2 P-7).
b. Record cost:
   - `actual` = the sum of the attempts' amounts when all attempts that carry a number share one
     unit, else actual=null and unit=null;
   - `cumulative` = the running sum for the slot within this dispatch, same rule;
   - `estimated` = null.
c. `report` gives two distinct reasons:
   - `"usage=none (client usage=none in clients.json)"`;
   - `"usage=none (parser <key> found no usage in log)"`.
   The old wording is removed.

## Out of scope (follow-up after stage 12)

- kimi stream-json, claude `--output-format`, agy/vibe, quota snapshots;
- new usage enum values; client command changes;
- any edit to `.ai/bin/protocol-runrecord.cjs` or `docs/specs/run-record.schema.md`. If one seems
  needed: STOP and report to the owner.

## Files allowed

- `.ai/bin/protocol-dispatch.cjs`;
- `tests/dispatch.test.cjs`;
- new `tests/fixtures/dispatch/usage/*`.
No overlap with the r9e files (`tests/runrecord.test.cjs`, `tests/fixtures/runrecord/*`,
`.ai/bin/protocol-runrecord.cjs`). If there is: STOP.

## Tests (hermetic: temp dirs; `git status` clean after the suite)

- one fixture per parser (kilo, mimo, copilot `AI Credits 12.5`, codex `tokens used\n12,345`);
- a `usage=none` client; a log without usage;
- a two-attempt sum; mixed units giving actual=null;
- `validateRecord(...)` returns `[]` in every case;
- `renderUsage` shows the cost with r9e's final headers;
- both report reasons;
- "line 503" and "429 tokens" are not parsed as usage.

## Output

- `docs/research/2026-09-26-ownerideas-revision/round9/REPAIR-USAGE-GEMINI.md`: one row per scope
  item (reproduction before, change, reproduction after), the validation commands with real output
  (`node --test tests/dispatch.test.cjs`; `validate-protocol.ps1`), files touched.
- No commits, tags, pushes or branches; no writes outside the allowed files and your report/journal.
  Journal first write MUST contain the `Launch:` and `Orientation:` lines with the frame id.
