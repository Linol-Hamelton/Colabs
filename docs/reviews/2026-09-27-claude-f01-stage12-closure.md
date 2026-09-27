# F-01 stage-12 closure - OwnerIdeas revision

- Frame: F-01, OwnerIdeas revision (S1, major). Stage 12, final closure (DISPATCH-OWNER.md "Этап 12").
- Closer: Claude, cloud session `claude-ad7cc4169e888ea8`, 2026-09-27 (UTC). Closer, not certifier.
- Reviewed: frozen CANDIDATE `7f199c5`; handoff HEAD `55e1e05`; apply commit `a140bea` on branch
  `claude/f01-closure`. Working tree when written: dirty (this receipt commit in progress).
- Scope: the closure criteria of DISPATCH-OWNER stage 12, and the closure disposition and receipt of
  P-L0-008 R-L0-22.56-22.67.
- Verdict: **CLOSED**. It takes effect when `v2.0.0` fast-forwards to this branch, after the owner's
  Windows lane passes on the branch head. That result goes into the closer's journal, not into this
  file.

## 1. Baseline and checks

| Check | Result | Source |
|---|---|---|
| Normative diff `7f199c5..55e1e05` (`.ai/bin tests docs/specs .ai/docs .ai/SIGNALS.md docs/ops protocol-manifest.json validate-protocol.ps1 AGENTS.md CLAUDE.md .claude`) | empty | cloud, `git diff --stat` |
| Operator Evidence at `55e1e05` | `verify`: "evidence matches the current tree" | cloud and owner |
| Owner Windows lane at `55e1e05` | `validate-protocol.ps1` exit 0 (1 warning); `test-protocol.ps1` 419/419, exit 0; `git status` clean after | owner run, 2026-09-27 |
| Apply commit `a140bea` | 70 renames at 100% similarity; 1 A plus 1 M for the frame README (the original moved unchanged; a pointer took its place); 19 M, each 1-2 lines except BACKLOG (+14/-5), the OPS-1 README (+28/-1) and the pointer | cloud, `git diff --name-status -M` and `--numstat` |
| Encoding of every changed blob | LF, no BOM | cloud |
| Node suites on `a140bea` | dispatch 26/26, runrecord 1/1, resolver 7/7, signals 9/9, hooks 28/28, lock 18/18, ledger 13/13, index 5/5, rulebook 54/54; tree clean after | cloud worktree |
| Dangling references from the active corpus | 0 (the script's post-check, plus a cloud `git grep`) | apply output; cloud |

The PowerShell-dependent suites (validator, installer, upgrade, gate, handoff and others) cannot run
in the cloud. The owner's Windows lane on the branch head decides the merge.

## 2. Closure criteria (DISPATCH-OWNER stage 12)

| Criterion | Status | Evidence |
|---|---|---|
| All mandatory packages done | yes | PKG-1..5 implemented; certification in section 3 |
| All blocking findings closed | yes | stage-9 F-1..F-5 closed (FINAL-DEEPSEEK section 2); round 3 has no open blocking item |
| Validators and tests passed | yes | section 1; the branch-head Windows run gates the merge |
| Documentation matches the implementation | yes, with one recorded exception | the codex usage parser (section 5, owner decision A) |
| No dangling references from removed or archived OwnerIdeas | yes | `MIGRATION.md` (deleted) and the cross-document synthesis (archived) are cited only from immutable records and the archive index |
| Current ideas have canonical destinations | yes | A-1..A-14 are placed by FINAL-RESOLUTION section 4. Implemented: P-L0-009, L0-ROOT R-L0-37, P-L3-005, `docs/specs/*`, `.ai/bin/*`. The rest go to F-03, BACKLOG or owner questions |
| Approved research candidates registered | yes | R-1/R-2 as C-R1, R-3 as F-02, R-4 as F-05, R-5 as C-R5, R-6 as F-04, R-7 as C-R7 (`FRAMES.md`) |
| No second active source of truth | yes | OwnerIdeas files are advisory seeds (R-L0-37, banners); round6 plans archived; the specs and code are canonical |

STOP-8 check: the implementation pre-empts no open owner question.
- There is no redaction logic (OQ-1).
- There is no capability-envelope logic (OQ-2).
- The stall default of 10 minutes is configurable within 5-120 (OQ-3), as FINAL-RESOLUTION stated.
- The new scripts are registered as `source` (OQ-4).

## 3. Certification record (frozen CANDIDATE `7f199c5`)

| Item | Result | Report (archived under `docs/research/archive/2026-09-26-ownerideas-revision/`) |
|---|---|---|
| PKG-1, PKG-3 | PASS, rounds 1 and 3 (Kimi, MiMo), including the S8 usage items | `round8/CERT-KIMI.md`, `CERT-*-PKG2-R3.md` |
| PKG-2 | PASS in round 3 after FAIL in rounds 1-2 (MiMo, reproduced; repaired r9d, r9e) | `round8/CERT-*-PKG2-R2.md`, `-R3.md` |
| PKG-5 | PASS, round 1 (not re-opened) | `round8/CERT-KIMI.md`, `CERT-MIMO.md` |
| PKG-4 | independent statement (Kimi) | `round8/CERT-KIMI.md` |
| Stage 11 verification | PASS (GPT-5.6 Sol), Mode CERTIFYING, SHA `7f199c5` | `round9/VERIFY-SOL.md` |
| Stage 12 DeepSeek verdict | PASS; accepted as-is with the recorded deviation (two `Verdict:` lines, both PASS) | `round9/FINAL-DEEPSEEK.md` |

Owner substitutions on record: MiMo-V2.6-Pro in place of Flash (2026-09-26); GPT-5.6 Sol for repair
verification (PROTO-DEC-0086 item 2).

## 4. Disposition and receipt CR-F01-1

Artifact set (R-L0-22.57):
- the frame directory;
- the package-declared artifacts (PKG-1..5 artifact plans);
- the seeds (`OwnerIdeas/`);
- the superseded records (BACKLOG lines).

The delta `7b6d17a..55e1e05` was used only as a cross-check. Its other files belong to other frames:
- F-02 `model-layer`;
- the cost-routes study;
- OPS-1;
- the first closure pass (F-06..F-16);
- immutable records.

| Disposition | Count | What |
|---|---|---|
| KEEP_ACTIVE | 63 | `.ai/bin/protocol-{dispatch,runrecord,signals}.cjs`; `.ai/docs/clients.json`, `CLI-AGENTS.md`, `dispatch/wake.md`, `dispatch/repair.md`; `docs/specs/*` (3); `protocol-manifest.json`; `.ai/SIGNALS.md`; `docs/ops/RUNS.jsonl`, `model-ladder.json`; 5 test files and 26 fixtures; CORE-ARCH-3/-4, L0-ROOT, P-L0-008, P-L0-009, S1-SUMMARY, P-L2-002, P-L3-004, P-L3-005; `FRAMES.md`, `CLOSURES.jsonl`; 7 review files |
| CANONICALIZED | 0 | - |
| ARCHIVE | 71 | the frame directory, including round6 (FINAL-RESOLUTION section 8), moved unchanged to `docs/research/archive/2026-09-26-ownerideas-revision/` |
| DELETE | 1 | `OwnerIdeas/MIGRATION.md` (byte-identical copy, C-1, applied at stage 3) |
| REPAIR | 1 | `docs/ops/BACKLOG.md`: C-3 done; M-4, M-8, S-1, S-6 closed for the kernel path |
| TRANSFER | 55 | see below |

TRANSFER targets (R-L0-22.60):
- **The test fixture, 40 files, to OPS-1 W5.** These are `prompts/DISPATCH.json` and
  `prompts/run/*`. `tests/dispatch.test.cjs` T5 reads them in place: the cloud trial move failed T5.
  They are executed inputs and stay unchanged. The paths cited inside them resolve through the
  archive INDEX row CR-F01-1. Owner decision A, 2026-09-27.
- **OwnerIdeas, 11 files, to the frames and candidates that consume them:**
  - Google_AX, MCP_Server and Rust: F-04;
  - RISK_COUNCIL: C-R1;
  - H-AUTH-02: F-03 (P-L0-009 `## Open`, OQ-2);
  - H-PROMPT-DELIVERY-01: C-R7;
  - benchmark, executor, task_profife and performers: F-02;
  - scripts: C-R5.
- **Runners, 4 files:** `run-chain.cjs` to OPS-1 W1; `launch.cjs`, `launch-test.cjs` and
  `launch-fake-client.cjs` to F-04/F-05.

Apply: one commit, `a140bea`, under the shared-document lock (R-L0-22.65). It was made by the
operator `kilo-f22faac486b5e567` with a fail-closed script written by the closer (branch
`claude/f01-closure-script`, `1b22bcb`). The cloud environment had refused the mass move, and the
owner decided the operator runs it. Active corpus: 4,082,183 to 3,142,600 bytes (-939,583) on
committed LF blobs; the Windows working copy measured 4,098,498 to 3,158,508. Dangling references: 0.
Competing authority: 0.

Receipt: appended to `docs/research/CLOSURES.jsonl`. The F-01 row carries
`receipt: CR-F01-1 a140bea K:63 C:0 A:71 D:1 R:1 T:55`, and the counter "Closed frames without a
receipt" is 0. The closer does not certify its own receipt (R-L0-22.70): `certified_by` is null, and
the deterministic post-check of the apply script is the verification. The frame status stays CLOSED
(R-L0-22.71).

## 5. Findings recorded (none blocks the closure)

1. **Codex usage parser under-count.**
   - `tokens used: 10 644` parses as 10, and the colon form parses as 0
     (`.ai/bin/protocol-dispatch.cjs:1202`).
   - Owner decision A: a recorded exception. Codex token figures in USAGE and RUNS are unreliable
     until the OPS-1 W0 fix.
2. **Dispatch tests are not hermetic.**
   - Tests write `*-launch.md` into the tracked tree, and the hang test rewrites `hang-launch.md`.
   - MiMo's first round-3 `record` failed under a concurrent run in another worktree.
   - Goes to OPS-1 W5.
3. **MiMo model identity is not observed.** Journals record the requested model only. The run cost
   ($0.42 for 733K/36K tokens) is consistent with a Pro-tier MiMo model and not with DeepSeek V4.1
   Flash. Goes to OPS-1 W4.
4. **Closure tooling defect.** The untracked `.ai/runtime/closure-receipts.cjs` hard-codes counts and
   overwrites `CLOSURES.jsonl` (`writeFileSync`), against R-L0-22.67. It must not be run again.
   Recorded in OPS-1.
5. **Cost-routes K-launch.** `cr-collector-a` ended early with an unconfirmed cause. This was the
   first real launches through the kernel dispatcher (A-13). Goes to OPS-1 W1/W7.
6. **FINAL-DEEPSEEK section 8 residuals R-1, R-3, R-4.** R-1: a PKG-2 audit prompt runs to 184
   lines against the 150 cap and needs an owner-approved expansion.
7. **Journal count** is about 150 against the cap of 100 (validator WARN). A pruning or archiving
   pass under the lock is still due.

## 6. Corrections to the handoff (STAGE12-READY.md, now archived)

- The `D:/Colabs-cert/*` worktrees are not this program's.
  - `b232a9e`, `89ce192` and `4ded1be` are the 2026-09-23 PROTO-DEC-0046 rulebook candidates.
  - `equinox-path` (`d38d2f2`) is from 2026-09-19.
  - Removing them is the owner's decision.
- "Compute the receipt with the `.ai/runtime/closure-*.cjs` tools" was not possible. The tools
  compute no counts for F-01 (finding 4). The tally above comes from the artifact set and the apply
  output.

## 7. Open owner decisions (carried, not blocking)

- **STOP-8 items:**
  - OQ-1 (redaction beyond journals);
  - OQ-2 (A-1 design block, in P-L0-009 `## Open`);
  - OQ-3 (stall default);
  - the F-02 gate and the DeepSeek identity mapping (in F-02).
- **OQ-4..OQ-11** of FINAL-RESOLUTION section 9. Where each belongs is listed in the OPS-1 README
  section "Transferred from the F-01 closure".
- Removal of the stale worktrees (section 6).
- The R-1 audit-prompt size.
- The GAPS section 6 inputs of the cost-routes study (they belong to OPS-1 D4).

## 8. Independence and limits

- The closer resolved the program (stages 3 and 6) and directed the r9f usage repair. For r9f the
  closer relies on the Kimi and MiMo round-3 verdicts, and checked facts only: files, tests, SHA.
- This cloud session has no PowerShell. `validate-protocol.ps1`, `test-protocol.ps1` and `record`
  were not run here, and no Evidence block is attached to the closer's journal entry. The Windows
  results are the owner's run (section 1) and the operator's verified Evidence at `55e1e05`.
- The observed MiMo model (finding 3) and the raw codex usage line were not inspected. Both need the
  workstation logs.

## 9. Next

- The owner runs the Windows lane on the branch head.
- If it is green, `v2.0.0` fast-forwards to `claude/f01-closure`. The transport branch
  `claude/f01-closure-script` is not merged and may be deleted.
- Then, on the owner's go: OPS-1 (`docs/research/2026-09-27-ops-layer/`).
