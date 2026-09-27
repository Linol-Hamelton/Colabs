# Stream continuation — finish your stream after the W1 gate (W2/W3) and fix your own findings

Read `COMMON.md` first. The W1 gate is done: both W1 packages are integrated and committed by the
operator. You now finish YOUR stream and fix findings that belong to YOUR packages. Never touch the
other stream's packages. Mode ADVISORY.

## Inputs

- `round6/FINAL-RESOLUTION-CLAUDE.md` section 6 (the wave table) and your own packages;
- `round8/CERT-KIMI.md`, `round8/CERT-MIMO.md`, `round8/IMPLEMENTATION-REVIEW-DEEPSEEK.md` (when
  it exists): the findings and FAIL claims that concern your packages;
- your own report `round8/IMPLEMENT-E1-GEMINI.md` or `round8/IMPLEMENT-E2-MISTRAL.md` (where your
  stream stopped and why).

## What to do

1. Fix every confirmed finding that concerns your packages: reproduce it first; fix only if the
   reproduction holds; otherwise refute it with the reproduction output. A certification split is
   adjudicated by evidence, never by vote.
2. Implement the remaining packages of your stream per the wave table and their full contracts
   (allowed paths, validation commands, acceptance criteria, integration conditions).
3. Run the W2/W3 integration checks: the package validation commands, and
   `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` +
   `test-protocol.ps1` with real exit codes.
4. No new decisions, no scope widening, no model changes, no commits. STOP conditions stay:
   block and return a finding instead of deciding.

## Output

- Append to your stream report (the same file) a `## Continuation` section: per package - status,
  findings fixed/refuted with evidence, files changed, validation outputs, open items.
- Five-label journal and `record --quick` with `Orientation: ... @ <your frame>` as the FIRST
  journal write; the runner matches the frame by that line (an earlier attempt without it was
  misread as NO_START).
