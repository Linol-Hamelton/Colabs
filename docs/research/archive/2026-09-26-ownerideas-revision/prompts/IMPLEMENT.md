# Stage 8 — implementation of the five accepted packages

Read `COMMON.md` first. You implement the accepted specification; you do not redesign it. Your
launch file names your stream and your packages. Mode ADVISORY.

## Inputs

- `round6/FINAL-RESOLUTION-CLAUDE.md` (section 6: the stream/wave table; the integration
  conditions) and `round6/packages/PKG-1.md` .. `PKG-5.md` (your packages only);
- `round7/RECHECK-DEEPSEEK.md` (the re-check that cleared the packages);
- PROTO-DEC-0079..0086; `docs/core-arch/stage-1/P-L0-008-research-governor.md`;
  `docs/research/FRAMES.md`.

## Rules

1. Implement exactly what each package specifies: goal, scope, allowed paths, forbidden paths,
   required outputs, acceptance criteria, validation commands, integration conditions.
2. Never widen scope, never change the approved architecture, never take an owner-level decision,
   never open a frame, never change a model assignment. No research inside a package.
3. If a contradiction cannot be resolved inside the package text, or the package's STOP condition
   fires: stop that package and return it as a finding, not as a guess. Other packages in your
   stream may continue if they are independent.
4. Both edit streams run in the same working tree. Touch only files inside your packages' allowed
   paths; a forbidden path is a STOP, not an exception.
5. Run every validation command each package names, in order, and paste the real output in your
   report. A failing command is a finding, not something to silence.
6. No commits, tags, pushes or branches. Leave the changes in the working tree; the operator
   commits after review.
7. Respect the stream/wave table: a later wave's package starts only when its dependencies in the
   table are satisfied (its own stream's earlier packages always; the other stream's where the
   table says so).

## Output

- Your report file (the path in your launch file): per package — status (IMPLEMENTED / PARTIAL /
  STOPPED), files changed (path list), validation commands with their real output, acceptance
  criteria each marked met or not, integration conditions and dependency state, findings.
- Five-label journal entry and `record --quick`, with the frame line `Orientation: ... @ <your frame>`.
- Last chat message: short report to the owner in Russian (per package: done/stopped, top findings).
