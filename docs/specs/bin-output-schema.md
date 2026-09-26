# Binary Output and Exit Code Schema (A-14)

Status: Specified (PROTO-DEC-0047 item 8, PROTO-DEC-0049 item 2, PROTO-DEC-0075 item 4)

## 1. Line Format

Every stdout line emitted by conforming scripts must follow structured key-value syntax:

    TOKEN key=value key="value with spaces" ...

- `TOKEN` is an uppercase ASCII identifier (`^[A-Z][A-Z_]*$`) from the command's documented token set.
- `key` is a lower-case or camelCase identifier.
- `value` is unquoted if it contains no whitespace or quotes; values containing whitespace must be enclosed in double quotes (`"..."`). Internal double quotes must be escaped.
- The first line of a command execution names the command and its parameters: e.g. `CHECK dispatch=<path> slots=<n>`.
- Scripts print the structured rows behind their result before exiting (PROTO-DEC-0047 item 8).

## 2. Exit Codes

All conforming scripts strictly adhere to the uniform three-state exit model:

- `0`: Success — command completed normally, or there is nothing to do.
- `1`: Resolvable refusal or operational failure — a condition that an owner, operator, or workflow supervisor can resolve (e.g. missing launch file, absent client binary, held start lock, slot BLOCKED, verification mismatch).
- `2`: Unknown or malformed input — unknown command, unrecognized flag or key, schema/grammar violation, unsafe path or shell metacharacter (PROTO-DEC-0049 item 2). Conforming scripts never guess intent and immediately emit an `ERROR reason=...` row before exiting 2.

## 3. Failure Classes

Whenever a line reports a failure classification (`class=<name>`), `<name>` must strictly be one of the fifteen canonical classes established by PROTO-DEC-0075 item 4:

    AUTH_ERROR | CONFIG_ERROR | MODEL_UNAVAILABLE | QUOTA_EXHAUSTED |
    RATE_LIMIT | NETWORK_ERROR | PROVIDER_ERROR | PROCESS_CRASH |
    STALL | TIMEOUT | INVALID_OUTPUT | VALIDATION_FAILURE |
    SEMANTIC_FAILURE | DEPENDENCY_FAILURE | POLICY_FAILURE

## 4. Scope and Applicability

This schema applies to new kernel protocol tooling:
- `.ai/bin/protocol-dispatch.cjs`
- `.ai/bin/protocol-runrecord.cjs`
- `.ai/bin/protocol-signals.cjs`

The ten existing `.ai/bin` scripts (`protocol.cjs`, `protocol-session.cjs`, `protocol-lock.cjs`, `protocol-handoff.cjs`, `protocol-archive.cjs`, `protocol-ledger.cjs`, `protocol-hooks.cjs`, `protocol-index.cjs`, `protocol-scope.cjs`, `protocol-verdict.cjs`) are not yet conforming; retrofit with CORE-ARCH package II.
