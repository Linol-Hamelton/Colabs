Launch: model=xiaomi/mimo-v2.6-pro effort=high client=mimo
Orientation: MiMo-V2.6-Pro @ task:ownerideas-r8-cert-mimo (parent program: ownerideas-revision): independent certifier of the high-risk packages | success=docs/research/2026-09-26-ownerideas-revision/round8/CERT-MIMO.md

## 2026-09-26 - r8 high-risk certification (PKG-1/2/3/5)

Agent: mimo (MiMo-V2.6-Pro, route mimo, effort high)

Action: Independent ADVISORY certification of PKG-1, PKG-2, PKG-3, PKG-5 against their package
specs, FINAL-RESOLUTION-CLAUDE.md, and IMPLEMENT-E1-GEMINI.md / IMPLEMENT-E2-MISTRAL.md. Ran
each package's validation commands myself on HEAD 0680b6fc369e10f9ff7926ebda7af56a8fcbc265
with a dirty tree. Did not read round8/CERT-KIMI.md. Edited only CERT-MIMO.md and this journal.

Result: All four packages FAIL (report: docs/research/2026-09-26-ownerideas-revision/round8/CERT-MIMO.md).
- PKG-1 FAIL: bin-output-schema.md still says twelve classes (missing VALIDATION_FAILURE,
  DEPENDENCY_FAILURE, SEMANTIC_FAILURE) and names protocol-telemetry.cjs / protocol-audit.cjs
  (absent from git ls-files); CLI-AGENTS section 9 lost the required "old runners superseded"
  bullet; AC-16 suite red.
- PKG-2 FAIL on AC-10 only (suite red); AC-1..AC-9 MET (runrecord tests 14/14, golden validates).
- PKG-3 FAIL: T20 transient-retry test flaked (attempt=2 expected, attempt=1 then DONE observed);
  AC-7/AC-12/AC-14 unverified. Resolver 7/7 green. AC-15 rows recorded with vibe VERSION_CHANGED
  (primary gemini-3.8-flash-high rung=5, rung 9 unavailable, ASK_OWNER shortfall).
- PKG-5 FAIL: .ai/SIGNALS.md header line 4 mismatch (Signal on line 4; S2 needs blank line);
  tests/signals.test.cjs and pkg-5 audit prompt missing; S9 manifest entries missing; T26 fall
  hook writes 2 lines not 1; clients.json effort.note for vibe and kimi nulled (AC-14).
Commands: node --test tests/dispatch.test.cjs (21 tests, 1 fail T20 run1 / 22 tests 1 fail T26);
node --test tests/runrecord.test.cjs (fail 0); node --test tests/resolver.test.cjs (fail 0);
protocol-dispatch check DISPATCH.json exit 0; check R3-DISPATCH.json exit 1 (10 launch-missing);
sha256 R3 fixture 2af348353dbe3d0ff5182d7893f63399ec3d6a1b1dfac6d361d15ee22b245b7f matches S3;
probe exit 1 (vibe VERSION_CHANGED 2.25.8 vs 2.25.5); runrecord validate golden exit 0;
sessions ratio=6.11 (281/46, measurement only); signals check/count/list exit 2 header mismatch;
validate-protocol.ps1 exit 0 (1 WARN journals 119>100); test-protocol.ps1 red on T26 (and T20 flake).

Next step: Operator/owners decide rework order. Restore bin-output-schema to the 15
PROTO-DEC-0075 item 4 names and the real ten script paths; restore the CLI-AGENTS old-runners
bullet; fix SIGNALS.md header and the double fall line; add tests/signals.test.cjs and the
pkg-5 audit prompt; insert S9 manifest entries; restore clients.json effort.note values;
stabilize T20. Re-certify after the tree is final.

Open:
- [Q] PROTO-DEC-0086 names MiMo-V2.6-Flash; this launch freezes MiMo-V2.6-Pro. Confirm override.
- [Q] Who re-verifies clients.json after vibe 2.25.8, and should nulled effort.note values be
  restored from the prior registry text ("configured via agent toml" / "thinking effort from config.toml")?
- Tree was still moving during certification (T26 appeared mid-run; P-L3-005 and signals fixtures
  appeared between checks). Verdicts bind to the commands and outputs recorded above.

Evidence:
- anchor: 1fd27ce65fa1e557a6f144ebc879cfedb81a5af0, uncommitted changes present
- digest: sha256:a1ee94a02af50698a0b11331f5c389149fc877faf763547bf3b1be7db2bd3787 over 684 tracked and untracked files
- digest format: 4
- recorded: 2026-09-26T20:43:36.373Z by mimo-a59c7fed6ea7a79c
- entry hash format: 2
- entry: sha256:8d6b5038c8039d9a13fc7c85b0a91ff5ff21b243b089716a0e03552b7b3eb4ca of this entry without this block
- parent-entry: root
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 10s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
