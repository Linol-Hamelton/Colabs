# Unified Adversarial Audit Prompt: Course Correction Recovery Package

**Date**: 2026-09-19  
**Author**: Gemini 3.8 Flash (implementer, lock holder)  
**Target Reviewers**: DeepSeek-Flash (assigned opposing reviewer/auditor), Codex  
**Scope**: Protocol core verification of course correction recovery package (PROTO-DEC-0036..0039, review archive, grand-consensus v2, TASK, PLAN, AGENTS, QUICKSTART)  
**Class**: Protocol Core (mandatory adversarial prompt+report per PROTO-DEC-0038)  
**Baseline**: `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1`, working tree dirty  

---

## 1. Instructions to Opposing Reviewers

You are tasked with conducting an exhaustive, independent adversarial audit of the course correction recovery package implemented by Gemini under the shared-document lock.

Your duty is to hunt aggressively for:
1. **Invariants & Regressions**: Any broken protocol invariant, validator warning or failure, broken Merkle chain, dangling reference, or test failure.
2. **Decision & Registry Integrity**: Violations of append-only rules in `.ai/DECISIONS.md` or `docs/decisions/REGISTRY.md`, incorrect reopen triggers, invalid provenance formats, or overbroad supersession of PROTO-DEC-0027.
3. **Corpus Archival Safety**: Any file moved from `docs/reviews/` that was cited in `.ai/worklog/*.md` or carried an active `Mode: CERTIFYING` header, any broken receipt verification, or inaccuracies in `docs/reviews/archive/INDEX.md`.
4. **Reissue Compliance**: Failure of `2026-09-19-grand-consensus-systemic-course-correction-v2.md` to remove unverified claims, improper Mode declaration, or encoding/mojibake defects.
5. **Task & Plan Compliance**: Line limit breaches (TASK <= 80, PLAN <= 200), omission of verbatim metrics (`PLAN.md:63-68`), or omission of the mandatory two-repository pilot structural mitigations (triage first, disjoint sessions, kill criterion).
6. **Documentation Alignment**: Inconsistencies between PROTO-DEC-0038 and `AGENTS.md` / `QUICKSTART.md`.

---

## 2. Specific Audit Checklist

Reviewers must explicitly evaluate and report on each of the following checklist items:

### Item 1: Decision Blocks & Registry Entries
- Verify `PROTO-DEC-0036`, `0037`, `0038`, `0039` in `.ai/DECISIONS.md`.
- Confirm all four blocks specify `Reopen-trigger: owner-directive`.
- Confirm all four blocks carry `Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19, transcribed by gemini-b67e88f213c39b83)`.
- Confirm `PROTO-DEC-0036` records the corrected cohort numbers (+72.79% broad total, +9.10% fresh; +60.20% narrow total, +42.76% fresh) and states that the stop rule was executed.
- Confirm `PROTO-DEC-0038` explicitly supersedes **PROTO-DEC-0027 item 1 only**, leaving items 2-7 in force.
- Confirm four corresponding rows were appended to `docs/decisions/REGISTRY.md` with status `accepted` and trigger `owner-directive`. Confirm no pre-existing rows were altered.

### Item 2: Review Corpus Archival & Receipt Safety
- Verify that `docs/reviews/archive/INDEX.md` contains an accurate `old path -> new path` entry for each of the 70 archived files.
- Verify that no file cited by live journals in `.ai/worklog/*.md` or carrying `Mode: CERTIFYING` was moved, except the superseded original grand-consensus file.
- Verify that `node .ai/bin/protocol.cjs doctor` and `node .ai/bin/protocol-handoff.cjs gate-check` run cleanly.

### Item 3: Grand Consensus Reissue v2
- Verify `docs/reviews/2026-09-19-grand-consensus-systemic-course-correction-v2.md` declares `Supersedes:` in the header, `Mode: ADVISORY`, and `Receipt-Owner: none`.
- Confirm the unverified `Approved by` line and `Status: Accepted` in the draft block were removed.
- Confirm cp1251 box-drawing/mojibake characters were converted to clean ASCII art.
- Confirm the original grand-consensus file remains immutable in `docs/reviews/archive/`.

### Item 4: TASK.md and PLAN.md Alignment
- Confirm `.ai/TASK.md` is <= 80 lines (measured 48 lines), retains `Status: In progress` without a completion gate, retains assigned roles (`gemini: implementer`, `deepseek: reviewer, auditor, controller`), and reflects the recovery package state.
- Confirm `.ai/PLAN.md` is <= 200 lines (measured 60 lines), preserves `## Objective` and metrics 63-68 verbatim, establishes the two parallel pilot streams (`D:\Block-Puzzle` and `D:\VPN`), and mandates the triage-first rule, disjoint sessions, and kill criterion.

### Item 5: AGENTS.md and QUICKSTART.md
- Confirm `AGENTS.md` section 2 and `QUICKSTART.md` section 2 correctly reflect the risk-scaled review policy (PROTO-DEC-0038).
- Confirm `AGENTS.md` section 8 includes the active `docs/reviews/` cap (60 files / 600 KB).

---

## 3. Required Verdict and Output Format

- Opposing reviewers must render an explicit verdict: `PASS`, `RECOMMENDATION`, `FAIL`, or `BLOCKED`.
- For any `FAIL` or `BLOCKED` verdict, the reviewer MUST provide concrete, reproducible commands or proof (per PROTO-DEC-0031).
- Certifying reviews require `Mode: CERTIFYING` and `Receipt-Owner: <id>` with verified handoff evidence; reviewers without execution capability report as `[MODE: READ-ONLY ADVISORY]`.
- Publish the report to `docs/reviews/2026-09-19-deepseek-course-correction-certification.md` (capped at <= 250 lines per PROTO-DEC-0038).
