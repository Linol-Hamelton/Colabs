# DIG registry - drafts

Frame **F-17** (advisory audit, `docs/research/FRAMES.md`): "decided but not built" across
PROTO-DEC-0022..0086 and A-1..A-14. Registered 2026-09-27 (owner packet 1, amendments 1-2).

Producers and files (one file each, output only here):

| Producer | Range | File |
|---|---|---|
| Mistral Medium 3.5 (vibe) | PROTO-DEC-0022..0047 | `DIG-MISTRAL-0022-0047.md` |
| Gemini 3.8 Flash high (agy) | PROTO-DEC-0048..0067 | `DIG-GEMINI-0048-0067.md` |
| DeepSeek Flash (kilo) | PROTO-DEC-0068..0086 + A-1..A-14 | `DIG-DEEPSEEK-0068-0086.md` |

Row format (one row per numbered item of every decision in the range):

```
| Item | Status | Proof (path or commit) | Note |
|---|---|---|---|
| PROTO-DEC-0022 item 3 | built / partial / not built / described | `path:line` or commit sha, `-` if not built | optional |
```

Statuses: `described` means the decision exists only as a written rule (no code, test or validator
artefact); added 2026-09-28 by PROTO-DEC-0096 item 2 for the targeted correction. Every file starts
with counts: total items, built, partial, described, not built. No verdicts, no certification. The
operator runs `protocol-ledger.cjs cover` and `dup` over this directory after all three producers
finish; the GPT-5.6 Luna verifier checked a 20% sample plus every "not built" row (2026-09-28), and
after the PROTO-DEC-0096 correction re-checks only the corrected rows. Mistral never verifies the
Mistral range (PROTO-DEC-0095 item 6).
