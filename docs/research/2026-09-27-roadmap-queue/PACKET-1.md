# ROADMAP-1 packet 1 - answers in progress (transcription)

Source: Owner in chat, 2026-09-27T07:01Z (transcribed by kilo-e1b4dd4a82b08b8e under the
shared-document lock). The owner's message answers Q2 and accepts four amendments to `PROMPT.md`;
the message's Q3-Q7 field is the literal placeholder `<ваши ответы>` and Q1 is not answered yet.
`PROMPT.md` is not rewritten: these are recorded amendments, per the owner.

## Q2. Roles and certifiers - CONFIRMED

- Roles confirmed as in `PROMPT.md`:
  - operator: DeepSeek Flash (kilo), dispatches and relays only;
  - executor: Gemini 3.8 Flash high (agy), in its own session;
  - reviewer: DeepSeek Flash, in its own session, never the operator session;
  - owner lane: the owner or the operator runs the Windows suite.
- Certifier pair for waves 2A and 2B: **MiMo-V2.6-Pro and GPT-5.6 Sol** (the OPS-1 D5 proposal).
  A certifier slot never moves to another model without an owner record.

## Amendments to ROADMAP-1 - ACCEPTED

1. Wave 3, item 1: instead of a new exit criterion, the draft becomes the **Kernel v1 scope
   decision** (P-L0-008 R-L0-22.54, the open OQ-11), and the F-01 **DIG = 13** baseline is moved
   into `docs/research/FRAMES.md`.
2. Wave 3, item 3: the audit becomes the **DIG registry across all decisions**, with named
   producers:
   - Mistral: PROTO-DEC-0022..0047;
   - Gemini 3.8 Flash (agy): PROTO-DEC-0048..0067;
   - DeepSeek Flash, in its own session: PROTO-DEC-0068..0086 + A-1..A-14.
   - Verifier: **GPT-5.6 Sol** - a 20% sample plus every "not built" row.
   - Output into `drafts/`; coverage and duplication checks (`protocol-ledger.cjs cover` and
     `dup`) are mandatory; the frame is registered in FRAMES.md under the lock before it starts.
3. New **wave 2C**: CORE-ARCH stage 3, tasks S3-T01..S3-T15 except the triage/escalation part;
   executor Claude, review DeepSeek (PROTO-DEC-0054). Design documents only.
4. Wave 2A scope addition: investigate **why dispatcher runs are not written to
   `docs/ops/RUNS.jsonl`** (the file is present and 0 bytes).

## Full packet - answers complete

Source: Owner in chat, 2026-09-27T07:03Z (transcribed by kilo-e1b4dd4a82b08b8e under the lock).

- **Q1: ACCEPT the F-02 gate; DeepSeek V4.1 Max = V4.1 Flash at max effort** (also closes BACKLOG
  S-5 and OQ-11's S-5 part). Wave 1 item 1 (F-02 close-out) and the `MODEL-ECONOMICS.md` route note
  are unblocked.
- **Q3: yes** - pull W0, W1-retire and W5 from OPS-1 into wave 2A (PROTO-DEC-0048 item 6).
- **Q4: approve** the exclusive phase-0 baseline runs (Bv/Bs/Bn/Bm) and the Q2 pair
  (MiMo-V2.6-Pro + GPT-5.6 Sol) as the `final-plan-2.md` section AC item-3 preflight.
- **Q5: delete everything** - the branch `claude/f01-closure-script` and the worktrees
  `Colabs-cert/*` and `equinox-path` - after showing `git status` of each.
- **Q6: yes** - archive the oldest journals until at most 100 remain.
- **Q7: deferred to wave 3** (the GAPS section 6 premises move into the wave-3 owner questions).

The packet is complete; the step-4 stop is lifted. Wave 1 starts; wave 3 runs in parallel after the
audit frame is registered in FRAMES.md under the lock.
