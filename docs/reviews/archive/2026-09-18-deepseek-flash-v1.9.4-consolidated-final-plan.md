# DeepSeek (deepseek-flash) - Consolidated Final v1.9.4 Implementation Plan

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5 (a6a6d61)  
**Working tree**: dirty (green: validator exit 0, doctor exit 0, suite 178/178)  
**Reviewer**: DeepSeek (model `deepseek/deepseek-flash`, session `deepseek-flash-ebd6eb9397ed3784`)  
**Scope**: consensus consolidation | security | integrity | release plan  
**Verdict**: RECOMMENDATION (one release blocker remains)  
**Status**: proposal; owner selected all recommended options in the 2026-09-18 final round.  
**Supersedes**: `docs/reviews/2026-09-18-deepseek-flash-v1.9.4-final-hardening-plan.md` (its P-1..P-3 are now implemented; this file re-scopes the remainder).

---

## Part 0. Ground truth at consolidation time

Measured in this session after the latest patch round:

- `validate-protocol.ps1` -> exit 0, `Protocol OK. 0 warning(s)`.
- `node .ai/bin/protocol.cjs doctor` -> exit 0, `Protocol Healthy`.
- `test-protocol.ps1` -> 178/178 pass.
- `verify --deep --owner gemini-381fc7800a864cde` -> passes (transitional root now accepted at any depth).
- `rehash` round-trip -> entry edit fails, `rehash` succeeds, `verify` passes.
- `__dirty` file -> `hooks.snapshot` no longer throws; `tests/hooks.test.cjs` imports the module.
- `--session-pid 4` -> **still accepted**; `clear-lock` refuses forever. Sole confirmed release blocker.
- Session runtime record `.ai/runtime/<owner>.json` has no nonce/token field yet.

Fixed and verified this round: `__dirty` collision, Evidence authentication for
format 2, `rehash` sanitized-marker ordering, transitional archive root at depth,
`doctor` exit code, 7-day liveness guard, duplicate/ancestor detection.
Refuted: ReDoS; duplicate masking; ancestor-walk gap; the "Model C post-hoc
fallacy" claim (no review contains it; my report confirmed the defects and their
fixes, not their non-existence).

---

## Part 1. Consolidated verdict on every model proposal

| Source | Proposal | Consolidated decision | Reason |
|---|---|---|---|
| Claude Opus | Registered nonce/token for lock ownership; 7-day liveness | **Adopted / already present** | Token design is the only robust fix for PID spoofing; the 7-day guard already exists (`protocol-session.cjs:254`). |
| Copilot SDK | Nonce + runtime registration; explicit legacy policy; ordering rule; doctor regression | **Adopted** | Matches the owner's six decisions; legacy policy is the honest reading of format-1 receipts. |
| DeepSeek Flash | P-1..P-9; PID squatting; legacy labelling; shared canonical hash | **Adopted as the base** | Independently reproduced; forms P-1..P-6 below. |
| Gemini | Symbol fix, format-2 Evidence, transitional root; earlier false refutations | **Fix intent adopted, synthesis claims corrected** | The code fixes are correct; the synthesis wrongly dismissed `__dirty`/Evidence/7-day and proposed an unsafe PID range check. |
| Mistral Medium 3.5 | Explicit fast-validator flag; ReDoS refuted | **Partially adopted** | Keep filename inference but assert the exclusion set in a test; explicit `{ fastValidator:false }` remains available. ReDoS refutation accepted. |
| Qwen Hostile | PASS on 8 items | **No unique open item** | Nothing to add beyond the reproduced items. |
| CodeGeeX / GLM | Archive boundary and review-template gaps | **Partially adopted** | Template bolding was real and is fixed. The claimed `docs/reviews/2026-09-18-codegeex-adversarial-audit-v1.9.3.md` does not exist. |
| Qoder | Suite permanently failing; timeout tuning | **Not reproduced** | Suite is 178/178; no timeout change needed. |
| "Model D" | Narrow the format-4 genesis exception | **Adopted, improved** | The narrow condition is right; the current form accepts a legacy `chain root: transitional` marker anywhere, so P-2 adds unique-root + orphan detection. |
| "Model C" | Claimed Gemini invented the defects | **Struck from the record** | Not found in any review; the opposite was documented. |

Open contradictions resolved: the tree is green now, so claims that `__dirty`,
format-2 Evidence, transitional root, `doctor` and cleanup are still broken are
stale; claims that the suite permanently fails are refuted. The only
reproducible blocker is arbitrary live-PID lock acceptance.

---

## Part 2. Owner decisions recorded in this round

- **D1 (Fork 1)**: lock ownership = PID + session nonce from the registered runtime record.
- **D2 (Fork 2)**: legacy Evidence = label and re-record; never rewrite history.
- **D3 (Fork 3)**: archive terminal = unique root + orphan detection, no hardcoded hash.
- **D4 (Fork 4)**: one shared canonical-hash helper in `protocol-hooks.cjs`.
- **D5 (Fork 5)**: ordering rule plus a gate check; no hard Stop-block.
- **D6 (Fork 6)**: bump 1.9.4, atomic commit, annotated tag, `-Force` sync of both consumers.

These choices are owner input; the formal decision block (PROTO-DEC-0028 draft in
Part 5) still needs the owner's `Approved by:` line before it is appended to
`.ai/DECISIONS.md`. An agent may not write that line.

---

## Part 3. Final implementation plan

Order is mandatory. P-1..P-3 are release blockers; nothing may be tagged until
all of P-1..P-6 pass and an independent reviewer re-audits.

### P-1 (BLOCKER, D1) - Bind lock liveness to a registered session, not to an arbitrary PID

Files: `.ai/bin/protocol-hooks.cjs`, `.ai/bin/protocol-session.cjs`,
`.ai/bin/protocol-lock.cjs`, `tests/lock.test.cjs`, `.ai/docs/PROTOCOL.md`, `QUICKSTART.md`.

1. `hooks.run` state gains `nonce`: generated once at SessionStart
   (`crypto.randomBytes(32).toString('hex')`), preserved across Stop via
   `previous.nonce`; export `sessionNonce(root, owner)` or the existing `readState`.
2. `protocol-session.cjs start` prints `Session token: <nonce>` next to the owner
   name. `whoami` prints it too for scripted use.
3. `protocol-lock.cjs`:
   - accepted `--session-pid`: `process.pid`, `process.ppid`, or a PID stored in
     `.ai/runtime/<owner>.json` when `--session-token` matches that record's nonce
     (compare SHA-256 of the token, never store the raw token in the lock file);
   - reject `pid <= 4`, non-integers, out-of-range, dead PIDs, and any PID without
     one of the three bindings;
   - store `pid` (actual CLI/supervisor), `sessionPid` (declared), and
     `tokenHash` separately;
   - `clear-lock`/`acquire --force`: a lock whose `sessionPid` is alive and whose
     `tokenHash` still matches a registered record is **live** and cannot be
     cleared without an explicit `--force` plus a printed audit warning;
   - locks without `tokenHash` (pre-1.9.4) stay cooperative-by-owner; `status`
     reports `liveness: cooperative` so nothing pretends to be verified.
4. Tests: PID 4 rejected; unrelated live PID (test runner) rejected without token;
   own PID and ppid accepted; registered PID + correct token accepted; wrong token
   rejected; dead PID rejected; foreign host reported `unknown` and preserved;
   `--force` recovery of a confirmed dead lock still works.
5. Positive consequence: closes the DoS and restores a truthful liveness model.
   Negative consequence: supervisors must pass a token from session start; mixed
   1.9.3/1.9.4 teams see cooperative liveness until they upgrade. Documented.

### P-2 (BLOCKER, D3) - Archive terminal uniqueness and orphan detection

File: `.ai/bin/protocol-handoff.cjs` (`verifyArchivedChain`, `verifyJournalChain`).

1. Build a record graph: `hash -> { parentEntry, chainRoot, format, authenticated }`
   where `authenticated = /- entry hash format:\s*2/`.
2. A record is terminal when: `format < 4`, or `parentEntry` is `root`/`legacy`,
   or `chainRoot === 'transitional'`. A non-authenticated record may terminate via
   `transitional` only if it is the unique parentless record in the archive.
3. Walk from `archivedParent`; require termination at exactly one terminal and no
   additional parentless record anywhere in the archive. More than one root, or a
   record whose `parent-entry` is absent and which is not a valid terminal, fails
   with `archive contains an orphaned segment; history may have been truncated`.
4. In `verifyJournalChain`, a non-oldest section whose Evidence lacks
   `parent-entry` is no longer skipped silently: format 2 already fails on the
   hash; legacy sections are reported as `legacy-unauthenticated` under P-3.
5. Scope note in code: this detects truncation, orphans and cycles; a full rewrite
   or deletion of whole archive segments remains outside the threat model
   (consistent with DEC-0016).
6. Tests: strip a middle link -> fail; strip the genesis link -> accepted only as
   the transitional root; a second transitional marker -> fail; duplicate -> fail.
7. Positive: closes the legacy-marker truncation. Negative: more code and fixtures;
   a fully rewritten archive is still not detectable by design.

### P-3 (BLOCKER, D2) - Legacy Evidence is labelled, never silently certified

Files: `.ai/bin/protocol-handoff.cjs`, `.ai/bin/protocol.cjs`, docs.

1. `reportOne`: if the newest entry lacks `entry hash format: 2`, return non-zero:
   `evidence is not authenticated (legacy format); re-record to refresh`, unless
   `--allow-legacy` is passed, which prints the same statement as a warning and
   exits 0 for read-only review.
2. No-owner `verify` scan: legacy receipts never count as a matching handoff.
3. `doctor`: prints the count of unauthenticated receipts; in the source role it is
   a warning, in installed projects an informational line.
4. Migration: only `record` on a new entry upgrades a journal; historical entries
   are never rewritten (adding the marker changes the parent hash and cascades).
5. Tests: legacy newest entry fails without the flag and passes with it; a format-2
   entry is unaffected; `doctor` count is correct.
6. Positive: no false claim of authenticity. Negative: existing journals report
   non-zero until their newest entry is re-recorded; documentation must say so.

### P-4 (MEDIUM, D4) - One canonical hash implementation, anchored field parsing

Files: `.ai/bin/protocol-hooks.cjs`, `.ai/bin/protocol-handoff.cjs`,
`.ai/bin/protocol-archive.cjs`.

1. Move `canonicalEntryBody` and the format-2 detector (`ENTRY_HASH_FORMAT = 2`,
   `hasEntryHashFormat2(section)`) into `protocol-hooks.cjs`; export and re-export
   from handoff for compatibility.
2. Delete `protocol-archive.cjs`'s private `entryBody`; use the shared helper in
   `extractEntryHash`/`parseArchiveEntryHashes`/`archivedHash`.
3. Anchor `entry:` capture everywhere to
   `/^[ \t]*-[ \t]+entry:[ \t]*(sha256:[a-f0-9]{64})\b/m` so `- parent-entry:`
   can never be captured as the entry hash.
4. Tests: format-2 archive round-trip keeps the `archived-parent` marker; dedup
   stays one label; tampered archived body fails; a field order with
   `parent-entry` before `entry` still parses correctly.
5. Positive: removes the DEC-0012 duplication class. Negative: touches two modules
   and their tests; no functional change expected.

### P-5 (MEDIUM, D5) - Review-artifact ordering and gate coverage

Files: `AGENTS.md`, `validate-protocol.ps1`, `docs/reviews/`.

1. Add one sentence to `AGENTS.md` section 5: an audit or council participant
   persists its prompt and report under `docs/reviews/` **before** emitting the
   chat summary; a chat-only audit is non-compliant.
2. Completion gate: keep the existing file-existence and verdict checks; add one
   check that the prompt and review are distinct files in `docs/reviews/` (exists)
   and that a report cited by TASK must exist (exists). No new hard rule for
   In-Progress turns, per D5.
3. Resolve the missing artifact: `docs/reviews/2026-09-18-multi-model-consensus-refutation.md`
   does not exist. Either create it as a real synthesis of the model verdicts
   (recommended, one page: per-model verdict table + adopted/rejected items) or
   strike the reference from the consensus document. Owner's choice within P-5.
4. Positive: the ordering rule is now explicit and checkable at completion.
   Negative: mid-session chat-only answers remain unenforceable by design.

### P-6 (MEDIUM, D6) - Release, tag, consumers

1. After P-1..P-5 are green: bump `protocolVersion` to `1.9.4` in
   `protocol-manifest.json`, `AGENTS.md`, `setup-ai-protocol.ps1` and any doc that
   carries the version; one atomic commit; annotated tag `v1.9.4`
   (PROTO-DEC-0025 item 1).
2. Re-record the newest entry of each active journal to format 2 with a stated
   reason; run `verify --deep`.
3. `setup-ai-protocol.ps1 -Target D:\Block-Puzzle -Force` and `-Target D:\VPN -Force`,
   then `-Verify` for both; managed hashes must match the source manifest. Their
   own commits remain in their own sessions (DEC-0025 item 4).
4. Update `QUICKSTART.md`/`.ai/docs/PROTOCOL.md` for `--session-token`,
   `--allow-legacy`, and the legacy policy.
5. Positive: reproducible, bisectable release; consumers get the fix. Negative:
   writes into both consumer repositories and requires their later commits; the
   owner explicitly authorized this in D6.

### P-7 (LOW) - Explicitly rejected or deferred proposals

- Adding `configurable: true` to the `DIRTY_SYMBOL` define: rejected, the symbol is
  defined once and no collision exists (verified by test).
- Removing filename-based fast-validator inference entirely (Mistral F-001):
  deferred; instead add a regression asserting the current exclusion set so a new
  validator test cannot silently take the stub. Explicit `{ fastValidator:false }`
  stays available.
- Hard Stop-hook blocking for missing reports: rejected, contradicts DEC-0003.
- Pinning a genesis hash in code: rejected, project-specific constant in protocol
  source.
- Timeout tuning (Qoder): rejected, no reproduced need at 178/178.

---

## Part 4. Acceptance criteria and verification gate

1. `validate-protocol.ps1` -> exit 0, 0 warnings.
2. `test-protocol.ps1` -> 0 failures (178+ tests, including the new lock, legacy,
   orphan and shared-hash regressions).
3. `node .ai/bin/protocol.cjs doctor` -> exit 0.
4. `verify --deep` on the real repository -> exit 0; `verify` on a legacy receipt
   -> non-zero without `--allow-legacy`.
5. `acquire --session-pid 4` -> rejected; unrelated live PID without token ->
   rejected; registered PID + token -> accepted; `clear-lock` on a live
   registered lock -> refused.
6. `setup-ai-protocol.ps1 -Verify` for `D:\Block-Puzzle` and `D:\VPN` -> exit 0;
   managed hashes identical to source.
7. Independent opposing review (AGENTS.md section 2) certifies the result before
   any `Status: Completed` claim.

---

## Part 5. Proposed decision block (owner to approve and append)

```markdown
### PROTO-DEC-0028

Status: Accepted
Date: 2026-09-18

Context:
The v1.9.4 hardening round closed the __dirty collision, Evidence authentication
(format 2), rehash ordering and the transitional archive root, but left three
release-blocking gaps: --session-pid accepts any live PID, allowing lock
squatting (reproduced with Windows PID 4); format-1 Evidence receipts remain
unauthenticated and were silently certified; and the archive terminal rule
accepts a legacy `chain root: transitional` marker at any depth, allowing silent
history truncation. The canonical entry-hash logic is also duplicated between
protocol-handoff.cjs and protocol-archive.cjs.

Decision:
1. Lock liveness binds to a registered session: a nonce is generated at session
   start and stored in .ai/runtime/<owner>.json; --session-pid is accepted only
   for the current PID, the parent PID, or a registered PID presented with the
   matching --session-token. System PIDs (<= 4) are rejected.
2. Legacy Evidence is labelled, never rewritten: verify fails without
   --allow-legacy, doctor counts unauthenticated receipts, and migration means
   recording new evidence.
3. Archive chain verification requires exactly one terminal root and rejects
   orphaned segments; a non-authenticated transitional root is accepted only as
   the unique parentless record.
4. The canonical entry-body hash lives once in protocol-hooks.cjs and is used by
   both handoff and archive.
5. Audit and council participants persist prompt and report under docs/reviews/
   before emitting the chat summary.
6. The release version is bumped to 1.9.4, committed atomically, annotated with
   tag v1.9.4, and the consumers D:\Block-Puzzle and D:\VPN are force-synchronized
   and verified; their own commits remain in their own sessions.

Reasoning:
Each item replaces an unverifiable claim with either a registered secret, an
explicit legacy label, or a graph invariant that can be tested. Fail-closed
behaviour is preserved; no historical text is rewritten.

Alternatives rejected:
Numeric-range-only PID validation (DoS by PID 4); mass re-hashing of historical
journals (breaks the parent chain and immutability); a hardcoded genesis hash
(project constant in protocol source); a blocking Stop hook for missing reports
(contradicts DEC-0003).

Consequences:
Supervisors pass a session token; old receipts report unauthenticated until
re-recorded; archive verification gains orphan/root tests; both consumers receive
the new managed files and commit them in their own sessions.

Approved by: _owner to fill in_
```

---

## References

- `docs/reviews/2026-09-18-copilot-consensus-critical-analysis.md`
- `docs/reviews/2026-09-18-grand-adversarial-consensus-v1.9.4.md`
- `docs/reviews/2026-09-18-deepseek-flash-consensus-verification.md`
- `docs/reviews/2026-09-18-deepseek-flash-v1.9.4-final-hardening-plan.md` (superseded)
- `.ai/DECISIONS.md`: PROTO-DEC-0021, PROTO-DEC-0025, PROTO-DEC-0026, PROTO-DEC-0027
- `.ai/worklog/deepseek-flash-ebd6eb9397ed3784.md`

---

## Addendum (2026-09-18, after reviewing Gemini's consolidated plan)

A-1 (adopted; scope fix to P-3). The legacy Evidence policy is scoped, not
repo-wide-fatal. `verify --owner <id>` / `verify --journal` returns non-zero for a
legacy newest entry without `--allow-legacy`. The no-owner scan and `doctor`
classify legacy receipts as valid-but-unauthenticated and warn; a handoff or
completion requires the acting session's newest entry to be format 2. Rationale:
29 historical journals belong to other sessions and must never be rewritten
(AGENTS.md section 5), so a repo-wide hard failure would leave the repository
permanently red and contradict immutability. Acceptance criterion 4 becomes:
`verify --owner <fresh format-2>` exit 0; `verify --owner <legacy>` non-zero
without `--allow-legacy`; `doctor` reports the legacy count and still exits 0
when no other issue exists.

A-2 (rejected). Excluding `- sanitized:` lines from the format-2 hash. The current
definition (insert the marker, then hash) is already recorded and verified: a
body edit fails, `rehash` succeeds, and verification passes. Changing the hash
definition now would create a third semantics and invalidate existing format-2
receipts. The shared helper is moved verbatim; only the field-anchoring regex is
tightened.

A-3 (rejected). `configurable: true` on the `DIRTY_SYMBOL` define (defined once,
no collision) and a `pid <= 100` allowlist (platform-brittle and blocks legitimate
low PIDs). The approved PID policy is binding-based: own PID, parent PID, or a
registered PID presented with the matching session token; `pid <= 4` and
unaffiliated PIDs are rejected.

A-4 (adopted, minor). The Completion-gate check also verifies that the cited
prompt and review files are non-empty.

A-5 (fact checks on the alternative plan). The condition
`record.chainRoot === 'transitional'` without a position guard is already in the
current code; the claimed "hidden rehash bug" is not reproducible (round-trip
passes), so no hash change is needed; the release command `-Force -Verify` cannot
sync because `$CheckOnly = $Verify -or $SelfInstall` makes it verify-only, so the
sequence must be `-Force` first, then `-Verify`. Orphan detection (present here,
absent there) stays in P-2.
