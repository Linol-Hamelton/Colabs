# K-launch route memo (BACKLOG M-3, ROADMAP-1 wave 3, item 2)

Drafter: Mistral Medium 3.5 via vibe (session `mistral-0adda986fd362c51`), 2026-09-28. A draft, not a
decision; no verdict, no certification.

## Question

Run Studies A and B (frames F-04, F-05) on `.ai/bin/protocol-dispatch.cjs` instead of
`launch.cjs` plus M-3, or keep the old path? The frames are SUSPENDED with resume condition
"K-launch ready", responsible party the owner, review date **2026-10-03** for both
(`docs/research/FRAMES.md`). Unblocking them unblocks CORE-ARCH stage 3: the stage-3 design waits
for Study B (`FRAMES.md` row F-03), and Study B's synthesis feeds the triage/escalation part of
stage 3 (O-08, improvement-research README) - the one part wave 2C excludes (PACKET-1 amendment 3),
so without Study B that part, and with it the stage's completion, stays open.

## The two paths, with numbers

**Old path: `docs/research/2026-09-25-improvement-research/prompts/launch.cjs`** (P-L3-004 trial)
plus the strict job table `prompts/jobs.json` (M-2 closed). 8 jobs: 3 A-researchers, 1 A-synth,
3 B-researchers, 1 B-synth; rubric tiers T6 for researchers, T5 for syntheses (README). Self-test
129/129, command parse check 25/25, role preflight read-only (README). Attempts run in disposable
private clones at Level 1 (PROTO-DEC-0070; R-L3-004.9). Blockers: **M-3 open, before K-launch** -
the jobs use copilot, grok, kimi and Kilo routes, outside the owner's ladder and CLI-only rule,
to be re-resolved by `workflowAI.md` section 1.5 (`docs/ops/BACKLOG.md` M-3); plus S-3 (the
a-deepseek keyless route has no key) and S-2 (the gate-pass naming), both open.

**New path: `.ai/bin/protocol-dispatch.cjs`** (kernel dispatcher, PROTO-DEC-0073/0074/0075;
certified in F-01 rounds 1-3, BACKLOG C-3, receipt CR-F01-1). Slots carry roles and resolver v0
picks model and route from the owner ladder (PROTO-DEC-0074 items 2-3: one primary plus up to two
substitutes); supervisor with error-class retry ladder (PROTO-DEC-0075 items 2, 5); private-clone
Level-1 launch (A-13); every attempt writes a run record to `docs/ops/RUNS.jsonl` (A-10).
Blockers: **no real launch has ever run** - A-13 is partial, RUNS.jsonl is 0 bytes, and the
PACKET-1 amendment-4 root cause (why dispatcher runs are not written) is under the wave-2A review
(`W2A-REVIEW-TASK.md` check 4); per-step money/token budget is not in v0 (PROTO-DEC-0075 item 3
partial); the research job table still names models per job rather than roles
(PROTO-DEC-0074 item 2 partial, `jobs.json:6`).

**W1-retire context:** wave 2A marks `run-chain.cjs` retired with a one-line pointer and points
new programs to `protocol-dispatch.cjs` (`LAUNCH-2A.md`, W2A-REVIEW-TASK check 3). Strictly,
W1-retire retires `run-chain.cjs`, not the improvement-research `launch.cjs`; but a new K-launch on
`launch.cjs` would be a new program on a retired-path sibling, outside the ladder rule, with M-3
needing manual closure every time it runs.

## Options

1. **Switch**: re-express the 8 jobs as dispatcher role slots (tier per the README rubric; swapping
   a job's model is an owner decision, README), let resolver v0 pick routes from the ladder. M-3
   dissolves by construction: the jobs no longer carry bespoke routes (the b-mistral "no Kilo route
   reaches max" fallback becomes the resolver's substitute ladder). Run records and usage land in
   RUNS.jsonl (A-10 chain). Cost: one dispatch-file edit plus the first real launch, which is an
   owner act (A-13).
2. **Keep** `launch.cjs` and close M-3 by hand: re-resolve the four off-ladder routes per
   `workflowAI.md` section 1.5 in `jobs.json`, fix S-2/S-3 text, launch as originally documented
   (K-launch.md in a Kilo session). Cost: bounded manual work now, but M-3 stays a standing gate
   for every future research program, and the launch stays outside the kernel run-record chain.
3. **Hybrid**: one grandfathered `launch.cjs` run with M-3 closed by hand, and the switch to
   `protocol-dispatch.cjs` registered as the mandatory path for the next research program.

## Recommendation

**Option 1 (switch), with an explicit trigger.** Trigger: the wave-2A merge (W1-retire pointer plus
the RUNS.jsonl root-cause fix in the batch) AND one verified real dispatcher launch that appends a
RUNS.jsonl row. The dispatcher is the certified kernel path, it closes M-3 by construction, and it
produces the run records Studies A/B themselves need later (F-02's frozen hypotheses reopen on
accumulated run records, DEFER D-03 in FRAMES.md). **Fallback:** if the trigger has not fired by
the frames' review date 2026-10-03, resume via Option 3 for this one launch - M-3 hand-closed per
`workflowAI.md` 1.5, S-2/S-3 corrected in the same pass - so CORE-ARCH stage 3 is not blocked past
the review date, and the switch becomes mandatory for the next program. Either way, K-launch itself
remains an owner act, and the frames' FRAMES.md rows move from SUSPENDED to ACTIVE only on the
owner's go (R-L0-22.27).
