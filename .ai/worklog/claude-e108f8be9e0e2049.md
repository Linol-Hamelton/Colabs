# Worklog: claude-e108f8be9e0e2049

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-27 - Pre-registered lens for the Kernel v1 choice; F-17 early reading

Agent: claude-e108f8be9e0e2049 (Claude Code, model `claude-opus-5-5`; supervisor; usage not
exposed by the client)

Action: at the owner's request wrote `docs/research/2026-09-27-roadmap-queue/SUPERVISOR-PREREG.md`
(untracked, main checkout): variants A/A'/B/C/D, nine signals S1-S9 with source, arrival and
switching thresholds, facts known today (F-C01 host path contract, VPN triage open, kilo/agy usage
not exposed - own earlier "usage for every client" criterion corrected). Then read the F-17 drafts
on `roadmap-wave3` (`12946ff`, `27dc95a`) and appended a dated early reading plus an evidence-density
rule for S4.

Result: DeepSeek range 8% not built, none on the pilot path, 101 `path:line` proofs for 111 rows.
Mistral range 19 `path:line` proofs for 129 rows, 0 not built, several self-citing "built" rows; it
covers the host/installed-path decisions, so S2 is unreadable until it is corrected.

Next step: owner decides on a targeted Mistral correction before the Sol verifier; the note is
committed by the operator with an explicit path, not passed to the KERNEL-V1-SCOPE drafter.

Open: the note's header states which drafts predated it; its rules section is unchanged since.

Evidence:
- anchor: e8756a1ab774b4e14ad31351e68443a61a11ed53, uncommitted changes present
- digest: sha256:fe058f19a59e1585b570ff8378171c453269e0df94d59c19842f872fe5f63e7d over 748 tracked and untracked files
- digest format: 4
- recorded: 2026-09-27T14:52:59.635Z by claude-e108f8be9e0e2049
- entry hash format: 2
- entry: sha256:b4e16914d49ae9cb6204329ce1cc1e1cac579a8e77a8f6e75f795f53dc064959 of this entry without this block
- parent-entry: sha256:506e4a80636025b744648ea1a5be87f3c34bed8644b69734c074ea38957ce521
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 6s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
## 2026-09-27 - ROADMAP-1 supervision pass (owner request): 2A guard, headroom, wave-3 start

Agent: claude-e108f8be9e0e2049 (Claude Code, model `claude-opus-5-5`; supervisor at the owner's
request; authors and certifies nothing in ROADMAP-1; usage not exposed by the client)

Action: read TASK, PROMPT.md, PACKET-1, LAUNCH-2A, BASELINE, the kilo and wave-1 journals, git log
since 05:00, the running process list and the kb1 worktree. Found: (1) W5 trap - the 40-file
fixture is owner decision A "executed inputs stay unchanged" (CLOSURES.jsonl CR-F01-1; F-01 closure
report lines 86-89) while `DISPATCH.json` holds 38 repo-relative paths into the old directory and
LAUNCH-2A asks to repoint references; (2) journal cap at exactly 100, kb1 at 101; (3) waves 3 and 2C
not started after 13:20 with no recorded reason, wave-3 drafter for items 1/2/4 unnamed; (4) the
wave-1 "pre-tool hook reserves commit" claim unsupported; (5) minor: 2A base is a4312e8, BASELINE
lacks the stub/real tagging `final-plan-2.md` section V asks before G0. Gave the owner three operator
prompts (2A review mandates, archive to 90, wave-3 start); the owner relayed them.

Result: the operator applied all three - `3d216fb` (W2A-REVIEW-TASK with checks a-e), `31b64d4`
(10 journals archived whole, 90 remain), `ad5490f` (F-17 registered, DIG = 13), worktree
`.ai/runtime/w3` cut; the executor committed W0 itself (`fbff763`). Validator on `ad5490f`:
`Protocol OK. 0 warning(s)`. No file of mine changed besides this journal.

Next step: the owner confirms the operator holds the answers on the wave-3 drafter and on wave 2C;
the 2A reviewer checks failing-test-first per item by running each new test against its parent.

Open: `31b64d4` archived `gemini-927b6b871251a111` and `deepseek-59c81998639a4feb`, named in a
closed TASK criterion (PROTO-DEC-0042 receipts) and as `Receipt-Owner` of 10 historical reviews;
their text is in ARCHIVE.md but `verify --deep` for them no longer resolves - harmless while no
Completion gate cites them. `ad5490f` dropped the blank line between the Frames table and the DEFER
heading in FRAMES.md (cosmetic).

Evidence:
- anchor: ad5490f149e0ab0fd82a7c05928ab69a4ff1c110, uncommitted changes present
- digest: sha256:aeb1ec7d31d2af25fc36282df40fed0cdfe389d429c4bf22ce47f4d700b843c0 over 747 tracked and untracked files
- digest format: 4
- recorded: 2026-09-27T14:38:29.788Z by claude-e108f8be9e0e2049
- entry hash format: 2
- entry: sha256:506e4a80636025b744648ea1a5be87f3c34bed8644b69734c074ea38957ce521 of this entry without this block
- parent-entry: root
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 8s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
