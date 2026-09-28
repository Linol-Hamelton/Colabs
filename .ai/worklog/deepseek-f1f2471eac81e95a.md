# Worklog: deepseek-f1f2471eac81e95a

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-28 - H1 installed-role protected set: independent advisory fix review

Agent: deepseek-f1f2471eac81e95a (DeepSeek Flash via kilo, separate `kilo run` session)

Action: Executed `LAUNCH-H1-REVIEW.md` on branch `h1-installed-protected-set` (cwd =
this worktree). Read `LAUNCH-H1.md`, the adversarial prompt, PROTO-DEC-0107 item 1,
PROTO-DEC-0047 item 8 and the rulebook spec; reviewed `git diff 606fcc5..d31ebb6`.
Reviewed commit `d31ebb6` (HEAD `0c2b36a` = launch file only). Ran the two mandated
regressions myself and, independently, a 33-case old-vs-new matrix probe, a pre-fix
test-tree run and the end-to-end fresh-install probe. Verdict PASS, Mode ADVISORY
(not certifying). Wrote `docs/reviews/2026-09-28-deepseek-h1-fix-review.md` (184 lines).

Result:
- Semantics hold exactly. Candidate tool: installed role `managed`+`.ai/`,`.claude/`,`.codex/`;
  case1 `validate-protocol.ps1` FAIL/1; case2 `protocol-manifest.json` FAIL/1; case3
  `.ai/bin/...` FAIL/1 (prefix); case4 off-protected RECOMMENDATION/0; case5
  `setup-ai-protocol.ps1` RECOMMENDATION/0 (source excluded); case6 missing/empty
  `managed` 2; case7 present `source` key 2 (also `source:[]`, `source:null`); case8
  role `"host"`, `42`, `null`, `"Installed"`, `" installed"` all 2; legacy no-role and
  `role:"source"` unchanged. All failures exit 2 via `Cannot load protocol-manifest.json`.
- Prototype safety: `__proto__:{role:"installed"}` keeps legacy semantics (FAIL/1);
  `__proto__:{source:[...]}` does not smuggle source (installed form accepted, inherited
  source ignored). `Object.prototype.hasOwnProperty.call` used for both role and source.
- Regressions (mine): `node --test tests/rulebook.test.cjs` -> 63/63 pass, exit 0.
  `validate-protocol.ps1` -> exit 0, 1 pre-existing WARN (109 journals, cap 100).
- Pre-fix proof: `git archive 28d13cc` to temp; `node --test tests/rulebook.test.cjs`
  there -> 63 tests, 56 pass, 7 fail, exit 1. Red subtests 55,56,57,58,59,61,63 = cases
  1,2,3,4,5,7,9; case4 `2 !== 0`, case7 `0 !== 2`, case9 `2 !== 1`. Matches the
  implementer's corrected account; refutes `LAUNCH-H1.md:44-45`. (F-001, INFO.)
- End-to-end probe: temp target + `setup-ai-protocol.ps1 -InitGit` exit 0; installed
  manifest `role=installed`, no `source`; pre-fix tool exit 2 (`source must be a non-empty
  array`), installed candidate tool `Verdict: FAIL`, exit 1.
- Scope clean: only the declared five files; forbidden files
  (`tests/validator-gate.test.cjs`, `validate-protocol.ps1`, `setup-ai-protocol.ps1`,
  `protocol-manifest.json`, `tests/handoff.test.cjs`) untouched; verdict diff confined to
  the header comment + `loadProtectedSet`; tests appended only; spec change one paragraph.
- No HIGH/MEDIUM/LOW finding; no mandatory defect. F-002 (INFO): prompt line 94 says
  CERTIFYING but the launch says ADVISORY; followed the launch.

Next step: Hand the candidate to the PROTO-DEC-0107 item 2 certifiers (GPT-5.6 Luna +
MiMo-V2.6-Pro). This ADVISORY PASS is not a certificate and does not close H1. Owner may
optionally fix `LAUNCH-H1.md:44-45` to the observed prefix red set.

Open: `LAUNCH-H1.md` pre-fix prediction text is wrong (INFO, docs only). The H1 completion
gate still needs a certifying (Mode: CERTIFYING) review from a named certifier. No push, no
merge, no edit of candidate files or `.ai/DECISIONS.md` per the launch.

Evidence:
- anchor: 0c2b36a9c4b52fe46b96f318975e73b2d2759984, uncommitted changes present
- digest: sha256:59697bbd481bb2f5150a69818d2e6beebdba9822abb366e7773ae1892b98a34c over 1902 tracked and untracked files
- digest format: 4
- recorded: 2026-09-28T19:46:17.451Z by deepseek-f1f2471eac81e95a
- entry hash format: 2
- entry: sha256:edc4a590edc4e5966254b51c46cd5d3fd1221f009dcc832e9698f7787afe4633 of this entry without this block
- parent-entry: root
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 6s
- reproduce: node .ai/bin/protocol-handoff.cjs verify

---

