# Stage 10 — repair cycle (Gemini): fix only the confirmed findings

Read `COMMON.md` first. The stage-9 review and the two certifications found defects. You repair
only what is confirmed; you never widen scope, never redesign, never change a model assignment.
Output: `round9/REPAIR-GEMINI.md`.

## Inputs

- `round8/IMPLEMENTATION-REVIEW-DEEPSEEK.md` (the findings list), `round8/CERT-KIMI.md` and
  `round8/CERT-MIMO.md` (per-package verdicts and FAIL reproductions);
- `round6/FINAL-RESOLUTION-CLAUDE.md`, `round6/packages/PKG-1..5.md` (the contract);
- the implemented working tree and `round8/IMPLEMENT-E1-GEMINI.md`, `round8/IMPLEMENT-E2-MISTRAL.md`.

## Rules

1. For each finding: reproduce it first. If the reproduction holds, fix it with the minimal change
   that satisfies the package contract. If it does not hold, refute it with the reproduction
   output - do not change working code on a wrong finding.
2. The certification split on PKG-1 (Kimi PASS, MiMo FAIL) is adjudicated by evidence: reproduce
   MiMo's FAIL claim; fix or refute accordingly.
3. PKG-3's `WAITING_W1_GATE` resolves only when PKG-1's wave-1 deliverable is actually complete
   per PKG-1 and the resolution's wave table; if PKG-1 is incomplete, finish PKG-1 first - it is
   PKG-3's dependency.
4. Stay inside the packages' allowed paths; forbidden paths remain forbidden; run every package
   validation command and paste real outputs; a command that fails and is not fixed stays a
   finding.
5. No new decisions, frames, models or scope; a contradiction you cannot resolve inside the
   contract is a finding, not a decision.
6. No commits, tags, pushes or branches; leave changes in the working tree.

## Output

- `round9/REPAIR-GEMINI.md`: one row per finding (source, package, reproduction before, change,
  reproduction after or refutation), plus a summary of validation commands. Header `Mode: ADVISORY`,
  `Baseline: <reviewed commits>`, `Reviewer: Gemini 3.8 Flash, route agy, effort high`, date,
  `Verdict: REPAIR COMPLETE` or `PARTIAL` with the open items.
- Five-label journal and `record --quick` with `Orientation: ... @ task:ownerideas-r9-repair-gemini`.
