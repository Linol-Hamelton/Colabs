# Three-repository review, 2026-09-17

A usage review of the AI Collaboration Protocol across its source repository
and its two installed product repositories, followed by a fix round.

- Source: `D:\Colabs` (protocol v1.9.0, `role: source`)
- Consumer: `D:\Block-Puzzle` (manifest v1.9.0, `role: installed`)
- Consumer: `D:\VPN` (manifest v1.9.0, `role: installed`)

Every claim below was reproduced with a command in this session. The two
consumer deep-dives were first drafted by read-only exploration agents whose
shell access was denied; their findings were re-checked directly before being
kept, and the rejected ones are listed at the end.

---

## 1. What the three repositories actually are

| Measure | Colabs (source) | Block-Puzzle | VPN |
| --- | --- | --- | --- |
| Declared protocol version | 1.9.0 | 1.9.0 | 1.9.0 |
| `-Verify` against source | n/a | 9 differences | 10 differences |
| Validator result | exit 0, 0 warnings | exit 0, 0 warnings | exit 0, 1 warning |
| Decision blocks | 21 (+template) | 25, all Accepted | 5 (1 Proposed) |
| Journals / entries | 26 / mixed | 14 / 23 | 21 / 22 |
| Evidence blocks | mixed formats | all format 4 | all format 4 |
| `.ai` state committed | yes | yes | **no, entirely untracked** |

The headline: both installed repositories declare v1.9.0, pass validation and
print "one protocol version everywhere: 1.9.0", while `setup-ai-protocol.ps1
-Target <project> -Verify` reports nine and ten managed files that differ from
the canonical version. The version string was updated; the content was not.

---

## 2. Best practices the evidence supports keeping

These were exercised in real work, not only in tests.

1. **Evidence instead of assertion.** 45 journal entries across the two
   products carry an Evidence block; no consumer journal records a `verify`
   failure for an honestly recorded entry. The mechanism did its job:
   Block-Puzzle's `deepseek-f7cc6b98736bc1f6.md` records a receipt with the
   exact tree digest, and a later reviewer could confirm it.
2. **Independent review changes outcomes.** Block-Puzzle's implementer session
   `gemini-1d2b79f3f6fdd167` recorded all DEC-0024 criteria as "fulfilled";
   review 14 (`deepseek-f7cc6b98736bc1f6.md:39`) overturned the status:
   *"Status 'Completed' was an overclaim; corrected."* The reviewer also
   rejected steps 3/4c because the wrong role had implemented them.
3. **The cooperative lock works without stealing.** VPN's archive records a
   contention that was respected (`ARCHIVE.md:161-163`); in this session an
   abandoned lock from a dead gemini process was recovered through
   `acquire --force`, exactly as documented.
4. **Non-blocking hooks.** Neither product disabled its hooks; the Stop
   reminder stayed advisory, and work continued.
5. **One manifest, one list.** No consumer has a missing-file failure. The
   three-outage class DEC-0012 removed has not recurred.
6. **ASCII-only PowerShell and LF.** The validator passes the encoding rules in
   all three repositories, including a CRLF host (VPN's own `.ps1` files stay
   CRLF while protocol files stay LF).
7. **Roles reduce duplicate work where they are written.** VPN's `TASK.md`
   carries a five-agent `## Roles` section and five distinct journals with
   disjoint subject areas. The first pilot's failure (one task, two answers)
   did not recur there.

---

## 3. Bad practices found and fixed in this session

Each fix has a regression test that fails on the old code.

### 3.1 A version string without the content (critical)

**Reproduced.** Run the installer without `-Force` against a project whose
managed files were edited or old: the manifest is rewritten with the source
version and the new managed list, while `Install-File` keeps every differing
managed file (`setup-ai-protocol.ps1`, the non-`-Force` branch). The validator
compared version strings only (`validate-protocol.ps1`, the version check), so
the result was a green protocol that was not the declared one. This is how both
products reached "1.9.0" while carrying 1.8-generation tooling.

**Fix.** The installed manifest now records `contentDigest`, a SHA-256 of every
managed file's canonical bytes. The validator recomputes them. A mismatch in
runtime tooling is a failure naming the file and the recovery command; a
mismatch in a document the host may reconcile (`AGENTS.md`, `CLAUDE.md`,
`.ai/docs/*`) is a warning. The manifest cannot hash itself.

**Tests.** `tests/upgrade.test.cjs`: *an installed project that keeps an older
managed engine fails validation*, *a plain install cannot claim a version it
did not deliver*, *a reconciled AGENTS.md warns but does not fail validation*,
*the installed manifest records a digest for every managed file*.

**Why this matters here specifically.** Block-Puzzle's installed `AGENTS.md` is
282 lines against the source's 319 and does not contain the rule that an
implementer may not unilaterally mark a task `Completed` (source section 2).
The implementer session that overclaimed completion ran against that copy.

### 3.2 `prune` deleted substantive journals (high)

**Reproduced.** `protocol-session.cjs prune` treated any journal whose heading
was not exactly `## YYYY-MM-DD - ` as empty. VPN's `qwen-93434ba75446b758.md`
uses `## 2026-09-17 01:23:16 UTC - Complete Audit Entry` and holds a full audit
with `### Agent`-style labels. Its own archive records the loss and the
restoration from the transcript (`D:\VPN\.ai\ARCHIVE.md:1066-1071`), and names
the repair as belonging to the protocol source repository.

**Fix.** A journal is empty only when it holds no ATX heading and no entry
label. Nonstandard headings are preserved.

**Tests.** *prune keeps a journal with a nonstandard heading that holds an
entry* (fails on the old code) and *prune still removes a journal that holds
nothing*.

### 3.3 An installed project was told to run a file it does not have (medium)

**Reproduced.** `CLAUDE.md` ended with "run both checks", listing
`test-protocol.ps1`, which is source-only. VPN hand-edited its installed
`CLAUDE.md` to remove the order (`D:\VPN\.ai\ARCHIVE.md:1268-1269`) - a hand
edit an upgrade would have silently reverted.

**Fix.** `CLAUDE.md` now orders the validator and explains that the regression
suite exists only in the source repository; installed projects run their own
test command.

### 3.4 Two storage limits disagreed (medium)

**Reproduced.** `protocol-archive.cjs status` reported `.ai/TASK.md: /120`,
while `validate-protocol.ps1` fails above 80. Total command output was
mutually inconsistent.

**Fix.** The archive tool reports 80, with a comment pointing at the validator.

**Test.** `tests/archive.test.cjs` now asserts the 80-line figure.

### 3.5 Documentation claimed a mechanism that is not installed (low)

**Reproduced.** `AGENTS.md` section 11 said encoding is "Enforced by
`.gitattributes`, `.editorconfig` and the validator". No install writes or
ships an `.editorconfig` since DEC-0013, and the source `.editorconfig` is not
in the manifest.

**Fix.** The claim now names only the two mechanisms that exist and says why
`.editorconfig` is absent.

### 3.6 The operator guide pinned a version that had moved (low)

**Reproduced.** `.ai/docs/PROTOCOL.md` said "Version 1.5.2 uses digest format
4" while the repository was at 1.9.0.

**Fix.** The text names the digest format without pinning a release.

---

## 4. Confirmed problems left open, with recommendations

These were reproduced but are larger than a patch, or need an owner decision.
They are listed in `.ai/TASK.md` under Open questions.

1. **VPN's decision log is untracked, so its central guarantee is inert.**
   `.ai/` is untracked at 216 commits; the validator can only warn, and the
   append-only check cannot compare anything. Direct evidence: DEC-0004 was
   appended as `Proposed` with an empty approval
   (`D:\VPN\.ai\ARCHIVE.md:353`), then edited in place to `Accepted` with
   `Approved by: RuslanFomenko`
   (`D:\VPN\.ai\worklog\gemini-85430f74879e98e0.md:14`,
   `D:\VPN\.ai\DECISIONS.md:151-204`). The recorded practice violates the
   stated rule, and nothing could see it. Recommendation: commit `.ai/` state
   in that project, and strengthen the validator warning to say the
   immutability guarantee is off until it is committed.
2. **Format variants bypass every journal check.** The validator's owner check
   matches only `^Agent:`; `latestCompleteEntry` and the Stop hook match only
   `## YYYY-MM-DD - ` and `Label:` lines. A journal written in heading style is
   invisible: not counted as a handoff, not checked for ownership, and (before
   this fix) deleted by `prune`. Recommendation: a format lint that warns on
   any dated-ish heading that is not canonical, instead of silently ignoring
   it.
3. **`.ai/runtime/` accumulates.** Block-Puzzle holds snapshot, MCP probe and
   schema residue from sessions whose journals no longer exist; VPN has 19
   snapshots. `prune` removes a snapshot only alongside its journal.
   Recommendation: a `runtime` cleanup that removes snapshots older than the
   newest journals.
4. **Protocol decision numbers dangle inside installed files.** The tools and
   documents cite `DEC-0009`, `DEC-0012`, `DEC-0013`, `DEC-0015`, `DEC-0016`,
   `DEC-0021`, none of which exist in an installed project's decision log;
   VPN's tooling cites them while its `DECISIONS.md` holds five unrelated
   product decisions. Recommendation: keep those citations out of installed
   files, or install a small protocol provenance index that resolves them.
5. **A redacted Evidence entry can never verify again.** VPN chose to redact a
   secret from a certified entry and accepted that its `entry:` hash is
   permanently stale (`D:\VPN\.ai\PLAN.md:44-46`). The only refresh is
   `record` again after redaction. Recommendation: state that recovery in the
   operator guide, and have `record` detect a stale entry hash and say
   "re-recorded after redaction" rather than leaving the next reader to
   rediscover it.

---

## 5. Controversial practices that need an owner ruling

1. **Line limits versus churn.** The limits are enforced and respected, but in
   a busy repository they cause continuous manual archiving: VPN archived five
   entries from one journal inside one day
   (`D:\VPN\.ai\ARCHIVE.md:615,732,823,937,1089`), and one live journal sits at
   149/150 while `TASK.md` sits at exactly 80/80. Options: raise the journal
   limit, make `protocol-archive.cjs` run automatically on overflow, or keep
   the pressure and accept the churn as the cost of short context.
2. **Append-only decisions versus approving a proposal.** A `Proposed` block
   cannot become `Accepted` without editing it, which the rule forbids. The
   template ships `Status: Proposed | Accepted`, so proposals are expected, yet
   the only compliant answer to one is a second block. Colabs' own DEC-0014 is
   still `Proposed` for exactly this reason. Options: define approval as a new
   block that supersedes; or allow one sanctioned edit (status and approval
   line only) recorded as an amendment.
3. **Per-repository `DEC-nnnn` numbering.** Protocol and product decisions
   share one namespace and both start at 0001. Block-Puzzle's product
   `DEC-0013` and the protocol's `DEC-0013` are unrelated, and the product
   branch `dec-0024/av-polish` names a decision the protocol repository does
   not have. Each file is internally consistent, so this is a human-facing
   hazard, not a mechanical one. Options: a project prefix in the ID, a
   separate namespace for protocol decisions, or documenting that the two
   logs never cross-reference.
4. **`prune` semantics.** It now removes only genuinely empty journals, but it
   still deletes without a backup. Options: default to `--dry-run`, or keep
   `--dry-run` optional now that the heuristic is conservative.

---

## 6. Claims examined and rejected

- **"Windows-only."** True, documented, and the declared scope.
- **"Codex hooks need manual trust."** A security property, not a defect. The
  consequence is recorded: no Codex journal exists in either product, so the
  Codex half of the integration is wired but unproven in live use.
- **"Hook performance."** Re-measured after DEC-0015; not a current defect.
- **"The protocol costs more than it returns."** Not established by this
  review; the products did real work with substantive journals, and no journal
  is predominantly protocol bookkeeping. The line-limit churn above is the
  closest thing to a measured cost.

---

## 7. Verification of this round

- `setup-ai-protocol.ps1` and `validate-protocol.ps1` changed together; the
  installer's own read-only self-check is part of validation.
- Full suite: `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1`,
  **164 tests pass, 0 fail** (158 before this round; six regressions added).
- Validator: `exit 0, 0 warnings` in the source repository.
- The two consumer repositories were read only. No file in either was changed,
  and neither was upgraded: the fix prevents the false green from recurring,
  but applying it to those projects is the owner's call
  (`setup-ai-protocol.ps1 -Target <project> -Force`, which keeps `.ai` state).
- Version note: DEC-0021's v1.9.0 is still uncommitted. This round adds to that
  work and keeps the 1.9.0 label; the owner decides whether to fold both into
  the v1.9.0 release or tag this round separately.
