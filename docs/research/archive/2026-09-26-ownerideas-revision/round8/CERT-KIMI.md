Mode: CERTIFYING
Reviewed CANDIDATE: f3ab4b8b299c3fc783d9b6e22b61d1cdcfb15dcc
Actual repository HEAD: 6babdec550938199f2d707f9794681db11c91bde
Receipt-Owner: kimi-322149376b1a661c
Reviewer: Kimi K2.7 Code HighSpeed, route kimi, effort unknown, 2026-09-27 UTC
Scope: certification of PKG-1, PKG-2, PKG-3, PKG-5 (PKG-4 statement: yes)
Verdict: PASS

All checks run in an isolated worktree at `.ai/runtime/cert-kimi` checked out at CANDIDATE f3ab4b8b299c3fc783d9b6e22b61d1cdcfb15dcc; no `git checkout` was performed in the shared copy.

## Per-package verdict

| Package | Verdict | Evidence |
|---|---|---|
| PKG-1 ROUTES | PASS | `node --test tests/dispatch.test.cjs` 23/23 pass; `check` on DISPATCH.json exits 0 (28 slots); `check` on R3-DISPATCH.json exits 1 with exactly 10 `ERROR reason=launch-missing` rows; R3 fixture sha256 `2af348353dbe3d0ff5182d7893f63399ec3d6a1b1dfac6d361d15ee22b245b7f`; `probe` exits 0 for 8 workstation clients; no `docs/research/` path in `.ai/bin/protocol-dispatch.cjs`; pointer prefix appears exactly once. |
| PKG-2 RUN-RECORD | PASS | `node --test tests/runrecord.test.cjs` passes all T1-T14; `protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl` exits 0 (`SUMMARY records=1 invalid=0`); `sessions` exits 0. |
| PKG-3 DISPATCH | PASS | `node --test tests/resolver.test.cjs` 7/7 pass; real-ladder `resolve` for `floor-t7-kernel` exits 1 `ASK_OWNER reason=shortfall` with primary Mistral Medium 3.5 (rung 9) and one substitute Gemini 3.8 High (rung 5); `resolve` for `floor-t3-other` exits 0 with primary Mistral Medium 3.5 and substitutes Gemini 3.7 High (rung 7) and GPT-5.6 Luna (rung 6). |
| PKG-5 SIGNALS | PASS | `node --test tests/signals.test.cjs` 9/9 pass including dispatcher fall test T26; `protocol-signals.cjs check` exits 0 (`SUMMARY lines=97 signals=95 invalid=0`); `count` exits 0; CLI-AGENTS.md changed only by appending section 9 additions and section 10; `.ai/docs/clients.json` `effort.note` values set per S2/S8. |
| PKG-4 RECORDS | STATEMENT | PKG-4 files are within allowed paths; validator and full suite pass; P-L3-004 `enforced_by` updated, R-L0-37/R-L0-38 present once each, P-L0-009 created, B-24 closed per PROTO-DEC-0072. This medium-risk statement is provided by the Kimi certifier per PROTO-DEC-0079 D6; it is not a full adversarial certification. |

## Command evidence

### PKG-1
```
node --test tests/dispatch.test.cjs        # exit 0, 23/23 pass
node .ai/bin/protocol-dispatch.cjs check docs/research/2026-09-26-ownerideas-revision/prompts/DISPATCH.json
                                             # exit 0, slots=28
node .ai/bin/protocol-dispatch.cjs check tests/fixtures/dispatch/R3-DISPATCH.json
                                             # exit 1, 10 launch-missing rows
node .ai/bin/protocol-dispatch.cjs probe     # exit 0, 8 clients OK
```

### PKG-2
```
node --test tests/runrecord.test.cjs         # exit 0
node .ai/bin/protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl
                                             # exit 0, SUMMARY records=1 invalid=0
node .ai/bin/protocol-runrecord.cjs sessions # exit 0
```

### PKG-3
```
node --test tests/resolver.test.cjs          # exit 0, 7/7 pass
node .ai/bin/protocol-dispatch.cjs resolve tests/fixtures/resolver/real-ladder.json floor-t7-kernel
                                             # exit 1, ASK_OWNER shortfall
node .ai/bin/protocol-dispatch.cjs resolve tests/fixtures/resolver/real-ladder.json floor-t3-other
                                             # exit 0, primary + 2 substitutes
```

### PKG-5
```
node --test tests/signals.test.cjs           # exit 0, 9/9 pass
node .ai/bin/protocol-signals.cjs check      # exit 0, invalid=0
node .ai/bin/protocol-signals.cjs count      # exit 0
```

### Protocol-wide
```
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
                                             # exit 0, Protocol OK, 1 warning
powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
                                             # exit 0, 416 pass, 0 fail
```

## Findings (non-blocking)

1. PKG-5 S8: `vibe` and `kimi` have `effort.how = "config"` with `effort.note = null`. Per PKG-5 S8 this triggers the P-L0-002 stop condition; it is a finding, not a failure.
2. PKG-5 S8: P-L3-005 R-L3-005.6 is rendered as "Where `effort.how` indicates no setting is available" rather than the quoted "`none`: ...". The meaning is equivalent and AC-12 does not require verbatim body rule text.
3. PKG-5 audit prompt `docs/reviews/2026-09-26-mistral-ownerideas-pkg-2-audit-prompt.md` is 184 lines, exceeding the 150-line cap; content is complete but should be trimmed.

## Independence declaration

I did not execute or control the implementation. I certify only my own reading of the committed candidate. I did not read `round8/CERT-MIMO.md`.
