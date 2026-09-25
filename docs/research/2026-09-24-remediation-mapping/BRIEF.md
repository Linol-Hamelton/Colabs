# Remediation mapping - brief for Mistral, GLM, Copilot and Qwen

- Status: research dispatch. Advisory, not certifying, not implementing. It authorises no
  edit outside your own report and journal.
- Date: 2026-09-24. Written by claude-ebd3e8a8eb29a6d7 at the owner's request.
- Governing decisions: PROTO-DEC-0048 and PROTO-DEC-0049 in `.ai/DECISIONS.md`. Read both
  blocks in full first.
- Baseline: candidate `4ded1be`. Round-3 findings: `docs/reviews/2026-09-23-codex-batch-certification-round3.md`
  and `docs/reviews/2026-09-23-claude-batch-certification-round3.md`.

## Purpose

DeepSeek and Gemini will implement the remediation round. Before they start, map for each
zone:
1. where the decision is made;
2. which files, functions and lines will change;
3. which tests and documents follow from that;
4. which risks the change carries, and how to cover each of them.

## How to treat risk - binding, PROTO-DEC-0049 item 4

Find and forecast risks in order to prevent and compensate for them and to reach the gain.
Do not use them to justify dropping the work. A found risk is not a verdict. A poor
measurement of an untuned setup is evidence against that configuration, not against the
approach.

For every risk, give: trigger; likelihood (low, medium, high); impact; prevention (what
stops it); compensation (what limits the damage); cost of that coverage; residual.

Close each zone with the net gain after coverage. Recommend rejection only if you can
show that coverage is impossible at acceptable cost or that the net gain is negative.

## Zones - one owner each

| Zone | Owner | Report file |
|---|---|---|
| Z1 Fixed grammar for roles and agreement | GLM, replaced by Gemini 2026-09-24 | `gemini-z1-grammar.md` |
| Z2 Budget exhaustion, immutability, ledger collection scope | Mistral | `mistral-z2-budget-scope.md` |
| Z3 Diff-based certification, producer Evidence, reproductions | Copilot | `copilot-z3-diff-cert.md` |
| Z4 Five-minute idle exit (watchdog) | Qwen | `qwen-z4-idle-exit.md` |

All reports go in `docs/research/2026-09-24-remediation-mapping/`.

### Z1 - GLM: fixed grammar (0049 item 2, 0048 item 3)

Starting points:
- `.ai/bin/protocol-scope.cjs`: `checkIndependence` from line 211, `extractExcludedRole`
  from line 405;
- the Roles section of `.ai/TASK.md`;
- spec section 6 of `docs/specs/2026-09-23-executable-rulebook-spec.md`;
- the round-3 findings R3-C01, R3-C02, R3-C03 and F-R3-02.

Deliver:
- a grammar, in EBNF or an equivalent form, for Roles lines;
- a grammar for agreement lines: `agree with <model> on item N: <degree>` plus a
  justification, with the six-step scale of PROTO-DEC-0048 item 3;
- how a quotation between two reports is detected: the unit of comparison, and exclusions
  for commands, paths, spec requirements and quoted ledger fields;
- which existing Roles lines break, and how they would be migrated;
- for each of the four round-3 findings, whether the grammar closes it.

### Z2 - Mistral: budget exhaustion, immutability, collection scope

Starting points:
- `.ai/bin/protocol-verdict.cjs`: `checkStopRule` from line 628, and cross-file
  collection in `main` from lines 724-790;
- `validate-protocol.ps1` around lines 520-530 and 990-1050;
- spec section 4;
- the findings R3-C04 = F-R3-01, R3-C05 and F-R3-05.

Deliver:
- the smallest change that keeps collection inside the set recorded in spec section 4;
- a procedure, as a proposal only, that closes the cycle as failed at once and hands the
  case to audit when a root cause exhausts its budget: who audits, what is handed over,
  and what the implementer may no longer do;
- how that procedure could prevent the blank-line class of R3-C05, for example an
  append-only tool or a byte-prefix comparison. Mark this as audit input, not a third
  attempt;
- where the proposal can live, given that `.ai/PLAN.md` is at its 200-line cap.

### Z3 - Copilot: diff-based certification, Evidence, reproductions

Starting points:
- `templates/reviews/REVIEW.md`;
- the completion-gate checks in `validate-protocol.ps1`;
- `.ai/bin/protocol-handoff.cjs` (`record` and `verify`);
- spec section 2, the reproduction field;
- the findings F-R3-03 and F-R3-04.

Deliver:
- how a certifier receives exactly the diff `4ded1be..<new>` plus the list of findings
  that diff claims to close;
- where the automatic full-tree run is attached;
- which review-header fields change;
- how the rule that a producing session records Evidence for its candidate is checked;
- how a reproduction inside the repository is checked, and how a sanctioned external
  borrowing is recorded: path, sha256, sanction;
- the risks of reviewing only the diff, such as a defect in unchanged code triggered by
  changed code, with their coverage.

### Z4 - Qwen: idle exit (0049 item 3)

Starting points:
- `.ai/runtime/metrics/sessions.jsonl`;
- the SessionStart and Stop paths in `.ai/bin/protocol-hooks.cjs` and
  `.ai/bin/protocol-session.cjs`;
- the agy hook contract in `~/.gemini/antigravity-cli/builtin/skills/agy-customizations/docs/hooks.md`
  (read-only). Its hook payload carries `transcriptPath`;
- `.ai/docs/CLI-AGENTS.md`.

Deliver, for each client (Claude, Codex, agy, Kilo, Copilot, vibe):
- which observable signal shows reading, writing or reasoning: transcript growth, journal
  mtime, tool events or log lines;
- whether five minutes with none of them can be detected without the client's
  cooperation.

Then:
- sketch a watchdog: its inputs, what it does on a stall (exit, resume, escalate under
  PROTO-DEC-0047 item 6) and its exit codes;
- give the false-stall risks, such as a long test suite or a slow model turn, and how to
  cover each.

## Rules for all four

1. Start with `node .ai/bin/protocol-session.cjs start --agent <name>`, unless hooks
   already started your session. Follow `AGENTS.md`.
2. Write only your own report and your own journal.
   - Do not edit code, tests, `.ai/`, `AGENTS.md`, the spec, the other reports or any
     product repository.
   - Do not commit. Do not take the lock.
3. Work independently. Do not open another zone's report before yours is written. Where
   you agree with another participant, state it in the PROTO-DEC-0048 item 3 form; never
   quote.
4. Header: commit SHA; clean or dirty tree; model and client; UTC date; zone; the
   commands you actually ran.
5. Labels and citations:
   - Label every claim FACT, CLAIM or HYPOTHESIS.
   - A FACT about the repository carries a `path:line` you opened.
   - A FACT about an external tool carries its source and date.
   - Anything known only from training is marked "unverified".
6. Required sections: the edit map (file, function, line range, change, tests,
   documents); at least two solution options with a recommendation; the risk register in
   the form above; the net gain; what you did not verify.
7. Stay within 250 lines. Write a checkpoint line in your journal after each section.
   Five minutes without progress is a stall; say so and stop rather than wait.
8. Never write keys, tokens or passwords.
9. Without file access, answer in chat under `[MODE: READ-ONLY ADVISORY]` for the owner to
   transcribe.
