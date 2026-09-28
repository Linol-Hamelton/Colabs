# Session journal - mimo-4aeecec4ecf66249

## 2026-09-28 - F-18 bench catalog 20% sample verification (MiMo)

Agent: mimo (MiMo-V2.6-Pro via mimo CLI)

Action: Independent verifier of frame F-18 per `docs/research/2026-09-28-bench-catalog/LAUNCH-F18-VERIFY.md`. Sampled CATALOG.jsonl rows 5,10,15,20,25,30,35,40,45,48 (file order). Opened each row `url` and every `scores[].source_url` on the public web (WebFetch; Firecrawl where client-rendered or 403-blocked). Judged existence/owner/status/measures/dimension/contamination and every recorded score against the cited source. Wrote `docs/reviews/2026-09-28-mimo-bench-catalog-verification.md`. Edited no CATALOG/COVER/MERGE files.

Result: 9 CONFIRM / 0 REJECT / 1 UNSURE (row 20: datacamp.com score source HTTP 403 for Gemini 3.8 Flash 61.6%; the other three scores and the Scale identity confirmed). Overall verdict RECOMMENDATION per the launch rule. Baseline `e31a31a7e7be4c7a86ed984ea95fc5153cd94dd3`. Review is Mode: CERTIFYING, Receipt-Owner `mimo-4aeecec4ecf66249`.

Next step: commit the review + this journal on `bench-catalog` with explicit paths; do not push; do not merge into `v2.0.0`. Operator/owner may re-check row 20 Gemini score when DataCamp is reachable.

Open: row 20 `Gemini 3.8 Flash` 61.6% remains unverified (HTTP 403). Row 15 score labels include "(greedy)" which is not stated in the cited results.json (value and model id themselves correct). Protocol start noted that TASK.md role list does not name mimo; the F-18 launch file names this verifier role for this frame only (frame-aware assignment shim), and the owner dispatched this session to execute that launch file.

Evidence:
- anchor: e31a31a7e7be4c7a86ed984ea95fc5153cd94dd3, uncommitted changes present
- digest: sha256:9bf2a2133529ac2a27f4fe16a8df30b3f976f3d2a5e6bb400b5e422e64a12964 over 1880 tracked and untracked files
- digest format: 4
- recorded: 2026-09-28T18:56:32.565Z by mimo-4aeecec4ecf66249
- entry hash format: 2
- entry: sha256:366f5c5b80a27dd36b69fb098852145145ff7684de3c848d823cee78da6a33b4 of this entry without this block
- parent-entry: root
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 6s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
