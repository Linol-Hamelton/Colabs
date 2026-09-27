# Cleanup frame — execute the approved OwnerIdeas cleanup

Read `COMMON.md` first. Role: bounded cleanup executor; no architectural judgement. The approval is
`round3/RESOLUTION-CLAUDE.md` sections 5 and 9 plus owner decision PROTO-DEC-0079 item 8 (D10).

## Order (follow exactly)

1. **Section 9, steps 1-7, as written.** The commands are fail-closed: run each one exactly; on any
   `STOP` line stop that step and report the printed line; never repair by hand. Post-checks (a)-(d)
   run on the pre-banner state, as section 9 pins them.
2. **Status banners (owner addition, D10).** After all section 9 checks pass, add exactly one line as
   the FIRST line of each kept OwnerIdeas file, preserving the file's own line ending, changing
   nothing else. Run this command; it is idempotent:
   ```
   node -e "const fs=require('fs');const m=[['OwnerIdeas/benchmark.md','R-3'],['OwnerIdeas/executor.md','R-3'],['OwnerIdeas/task_profife.md','R-3'],['OwnerIdeas/performers.md','R-3'],['OwnerIdeas/scripts.md','R-5'],['OwnerIdeas/RISK_COUNCIL.md','R-1'],['OwnerIdeas/H-AUTH-02.md','A-1'],['OwnerIdeas/H-PROMPT-DELIVERY-01_canonical-task-file-vs-orchestrator-loading.md','R-7'],['OwnerIdeas/Google_AX.md','R-6'],['OwnerIdeas/MCP_Server.md','R-6'],['OwnerIdeas/Rust.md','R-6']];let n=0;for(const [p,fr] of m){const r=fs.readFileSync(p,'utf8');if(r.startsWith('Advisory seed;')){console.log('SKIP '+p);continue}const e=r.includes('\r\n')?'\r\n':'\n';fs.writeFileSync(p,'Advisory seed; consumed by '+fr+'; status: RESOLUTION-CLAUDE.md section 4.4'+e+r);n++}console.log('banners added '+n)"
   ```
   Expected: `banners added 11`. The frames come from RESOLUTION sections 5.3 and 7
   (R-3 model layer, R-5 write coordination, R-1 risk council, A-1 capability envelope, R-7 delivery
   variants, R-6 study A).
3. **Frame report.** Write `round4/CLEANUP-GEMINI.md`: every printed `OK` and check line from
   section 9, the final `git status --short OwnerIdeas/ docs/research/2026-09-26-ownerideas-revision/`
   (expected: `D` for MIGRATION.md and the synthesis, `M` for performers.md and scripts.md, `M` for
   the nine banner files, `??` for `archive/`), the banner output, the validator output, and the
   dangling-reference result. Short, tabular, no prose expansion.
4. **Close.** Five-label journal entry quoting the same lines, then
   `node .ai/bin/protocol-handoff.cjs record --quick --owner <your owner name>`.

## Bounds

- Change only `OwnerIdeas/` (the four section-9 paths and the banners), the new
  `docs/research/2026-09-26-ownerideas-revision/archive/` directory, `round4/CLEANUP-GEMINI.md` and
  your journal.
- Forbidden: any other file, including TASK, BACKLOG, CORPUS.md, historical records and the bodies
  of the kept files; staging, commit, tag, push, branch; banners beyond the one exact line; any
  reformatting.
- A mismatch is a STOP and a report, not a repair.
