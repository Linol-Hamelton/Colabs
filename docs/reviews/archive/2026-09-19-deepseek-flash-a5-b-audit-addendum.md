# DeepSeek (deepseek-flash) - A5/B Audit Addendum: Registry Test Brittleness (AUD5-5)

**Date**: 2026-09-19  
**Reviewed state**: Item 5 working tree after the sanctioned `PROTO-DEC-0033` transcription plus the micro-fix; implementer receipt fresh  
**Reviewer**: DeepSeek (deepseek-flash), auditor/controller  
**Scope**: extends `docs/reviews/2026-09-19-deepseek-flash-a5-b-audit.md` with the finding discovered after the transcription  
**Conflict declaration**: authored the specification; the transcription that exposed the finding was performed by this reviewer under the owner's approval.  
**Mode**: CERTIFYING  
**Verdict**: **PASS** - finding closed.

## AUD5-5 (LOW, test brittleness) - discovered and fixed

- **Symptom**: after the `PROTO-DEC-0033` transcription appended five registry rows, `validate-protocol.ps1` stayed green (33 decision blocks, 37 registry entries, 0 warnings) while `test-protocol.ps1` failed: `tests/registry.test.cjs:32` asserted `inspected decision registry with 32 entries`, a hardcoded seed count.
- **Root cause**: the test pinned the data size instead of deriving it, and the append-only registry grows by design; the original audit ran before the growth, so it could not expose the brittleness.
- **Fix (Gemini micro-fix)**: the expected count is derived from `validRegistryContent` table rows; the assertion builds a `RegExp` from that number. Only the test file was touched.
- **Independent verification**: `node --test tests/registry.test.cjs` 7/7; `test-protocol.ps1` 236/236 exit 0; `validate-protocol.ps1` exit 0 with 0 warnings and `inspected decision registry with 37 entries`; `verify --owner gemini-434bcd8012e0f38c --deep` exit 0.
- **Disposition**: closed. Future registry growth no longer breaks the suite. The grep run at diagnosis time found no other hardcoded registry or decision counts.

## References

- Base audit: `docs/reviews/2026-09-19-deepseek-flash-a5-b-audit.md`
- Micro-fix prompt: `docs/reviews/2026-09-19-gemini-v1.9.5-item5-testfix-prompt.md`
- `PROTO-DEC-0033`, `docs/decisions/REGISTRY.md`
