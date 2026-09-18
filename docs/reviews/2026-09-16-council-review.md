# Council review of the protocol, 2026-09-16

Three assistants assessed this repository separately: DeepSeek, Qwen and Gemini.
None of them built it. Each ran the validator and the full suite, recorded
evidence, and named the command behind each claim. This is the consolidation.

## Method

Each reviewer started its own session, wrote one journal entry with evidence,
and changed no product file and made no commit. The consolidator reproduced
every finding kept below before accepting it. Findings that could not be
reproduced, or that turned out to describe documentation rather than code, were
rejected and are listed at the end with the reason.

## What holds

The claims in the task were true. The validator exits 0 with no warnings, 134
tests passed at the time of review, and a clean install reproduces locally.
All three reviewers independently judged the engineering sound: Git blob
identity instead of modification times, a lock that fails closed, preflight
before any write, and a validator that refuses to be green while enforcement is
switched off.

## Accepted findings

| Id | Severity | Finding | Found by |
| --- | --- | --- | --- |
| C1 | Critical | The evidence digest excluded `.ai/worklog/`, so a certified entry could be rewritten and `verify` still passed | DeepSeek, confirmed independently by Gemini |
| C2 | Critical | An interrupted lock operation left a gate directory that blocked every later acquire and release, with no recovery command | Gemini |
| H1 | High | `protocol-session.cjs stop` printed "Handoff recorded" when no entry had been written | Gemini |
| H2 | High | Writing the five labels out of order made one field swallow the rest, while the entry still counted as complete | Gemini |
| H3 | High | Decision immutability was a rule with no check; a written block could be rewritten and validation passed | DeepSeek, Gemini |
| H4 | High | Journal ownership is not enforced; one session can write a complete entry into another's journal | DeepSeek |
| M1 | Medium | One version string lived in three files and nothing compared them; they had drifted | DeepSeek, Gemini |
| M2 | Medium | Every session start creates a journal, so idle sessions leave empty files, with no tooling to clear them | Gemini, Qwen |
| M3 | Medium | One character per field passed as a complete handoff | DeepSeek |
| L1 | Low | A `--quick` receipt was indistinguishable from a full one except by an absent line | DeepSeek |

C1 is the one that mattered most. The protocol's central claim is that prose in
a journal is a claim while an Evidence block is a record. The record could be
rewritten after it was certified, which made the distinction hollow. The
exclusion was deliberate, to avoid the evidence invalidating itself the moment
it was written, but the consequence was never closed, never recorded in
DEC-0011 and never tested.

## Rejected

- **Windows only.** True, documented, and the declared scope. Not a defect.
- **Codex hooks need manual trust.** That is a security property: the owner
  grants trust and an installer must not do it on their behalf.
- **Hook performance.** Quoted as 584 ms from DEC-0015, which is the figure
  from before the fix recorded in that same block. Measured after: 99 ms on
  this repository.

## How the three compared

DeepSeek found the central defect and reasoned about consequences rather than
surfaces. Gemini found the most defects, three of them new, and named a
reproduction for every one. Qwen's first pass retold the documentation and
found nothing; its second pass corrected exactly the points the consolidator
had criticised, so it measures responsiveness to feedback rather than
independent review.

Every finding above came from running something. None came from reading a
document.
