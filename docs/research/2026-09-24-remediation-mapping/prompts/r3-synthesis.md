# Round-3 prompt - independent synthesis (DeepSeek, Claude, Codex)

You are one of three round-3 synthesisers in the multi-agent protocol of D:\Colabs. The
other two write the same synthesis in parallel. This prompt applies to all three; your
name and output file are given in the one line that sent you here.

## Step 0 - where you are

Run `git rev-parse --show-toplevel`. If it does not print `D:/Colabs`, stop at once and
report the directory you are in.

Unless hooks already started your session, run
`node .ai/bin/protocol-session.cjs start --agent <your name>`. Follow AGENTS.md, and use
the owner name it prints.

## Independence - binding

Do not open another round-3 synthesis (`r3-*-synthesis.md`) until your own is written.
PROTO-DEC-0052 item 2 requires your journal to state explicitly that you did not open
them.

Refer to other reports by item ID. Never quote them. When you agree or disagree with a
point, use the fixed form of PROTO-DEC-0048 item 3: `Agreement with <model> on item <ID>:
<degree>.` The six degrees are worded exactly as that block words them, and a
justification is required for every degree except "fully agree".

## Read

1. `.ai/DECISIONS.md`, blocks PROTO-DEC-0048 to PROTO-DEC-0053. These are the binding
   frame of this round.
2. In `docs/research/2026-09-24-remediation-mapping/`:
   - `BRIEF.md` (its "How to treat risk" section is binding) and `ROUND2.md`;
   - `PROCEDURE-MAP.md`: the layer map with its overlaps, conflicts K1-K5 and empty
     cells. It holds data only, and its recommendations are yours to make;
   - round 1: `gemini-z1-grammar.md`, `mistral-z2-budget-scope.md`,
     `copilot-z3-diff-cert.md`, `qwen-z4-idle-exit.md`;
   - round 2: `r2-mistral-z1-z3.md`, `r2-copilot-z2-z4.md`, `r2-gemini-z4-z2.md`,
     `r2-deepseek-synthesis.md`.
3. Any code or document those reports cite, whenever you rely on the citation. Open the
   `path:line` yourself.

## What the synthesis must decide - the scope of the current remediation round

The round is defined by PROTO-DEC-0048 to 0053. For each item below give:
- the solution you propose;
- the edit map: file, function, line range, change, tests, documents;
- risk coverage in the BRIEF form: trigger, likelihood, impact, prevention, compensation,
  cost, residual;
- the net gain.

Items:
- **Z1** Fixed grammar for Roles and agreement lines (0048 item 3, 0049 item 2). Include
  binding each role to a candidate or scope, and where the constraints that the migration
  would drop should live.
- **Z2** The R3-C04 = F-R3-01 collection-scope fix. The budget-exhaustion-to-audit
  procedure (0048 item 4), and whether `checkStopRule` can close the cycle by itself.
  R3-C05 stays an accepted exception with no third attempt.
- **Z3** Diff-based re-certification package, producer Evidence, in-repository
  reproductions and sanctioned borrowing (0048 item 5, 0049 item 1). Say whether "clean
  tree" producer Evidence is attainable in the shared checkout.
- **Z4** Wake-then-fail watchdog (0049 item 3, 0051 item 4): the per-client activity
  signal, resume by session id, the FALLEN record.
- **D** Dispatch script, client registry and execution profiles, and the
  `.ai/docs/CLI-AGENTS.md` update (0050).
- **S** Signals ledger: file, grammar, and processing at batch planning (0051).
- **C** Research-cycle and kernel-change scenario (0052, 0053).
- **K** Conflicts K2-K5 in PROCEDURE-MAP.md, and which home is canonical for each of the
  seven rules that have several homes.

Then:
1. **Order and batching.** Give the implementation order, the dependencies between
   items, and what can run in parallel on the two edit streams, DeepSeek and Gemini
   (0048 item 7).
2. **Out of scope.** List what you would defer to the kernel redesign
   (`docs/research/2026-09-23-kernel-architecture/`), and why.
3. **Where the round-2 reports conflict.** Say which side the evidence supports, and
   re-run a reproduction where the two sides disagree on a FACT. Reproduction beats rank
   (PROTO-DEC-0041 item 5).
4. **Owner-only questions.**

Label every claim FACT, CLAIM or HYPOTHESIS. Every repository FACT carries a `path:line`
you opened.

## Output

Write only:
- `docs/research/2026-09-24-remediation-mapping/r3-<your name>-synthesis.md`, with a
  header giving: SHA; dirty or clean tree; model and client; UTC date; the commands you
  actually ran; and the statement that you did not open the other round-3 syntheses.
  Maximum 250 lines, including the header. Number your points S-<name>-01, S-<name>-02,
  and so on, so the draft and the critiques can refer to them.
- your own journal: one entry with the five labels, and a checkpoint line after each
  section.

Do not:
- edit code, tests, `.ai/`, the other reports or any product repository;
- take the lock or commit.

If five minutes pass without progress, that is a stall: say so and stop.

The next steps under PROTO-DEC-0053:
1. The owner names one of the three synthesisers to draft a decision from all three
   syntheses.
2. The other two critique the draft.
3. The owner names who fixes the final plan.
