# Run Record Schema `run-record/1`

One JSON object per line (JSON Lines format). Keys MUST appear in the exact order specified below. Unknown keys make a record invalid.

## Schema version

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `schema` | string | `"run-record/1"` | YES | Schema identifier. Must be exactly this value. |

## Identity

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `runId` | string | `R-<YYYYMMDDTHHMMSSZ>-<slot>` | YES | Unique run identifier. `slot` matches `[A-Za-z0-9._-]{1,64}`. |
| `slot` | string | `[A-Za-z0-9._-]{1,64}` | YES | Slot identifier, extracted from `runId`. |
| `frame` | string | non-empty | YES | Task frame or scope identifier (PROTO-DEC-0057 item 1). |

## Role and Selection

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `role` | string\|null | any string or `null` | NO | Role assigned to this run. `null` until dispatch file names roles (PROTO-DEC-0074 item 2). |
| `selection` | string | `"owner"` or `"resolver"` | YES | Who selected this route (PROTO-DEC-0084 item 9). |

## Resolution

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `resolution` | object | see below | YES | Resolution details (PROTO-DEC-0075 item 10; workflowAI section 1.6). |

### `resolution` object

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `ladderSnapshot` | string\|null | `YYYY-MM-DD` or `null` | NO | Date of the ladder snapshot. Required when `selection = "resolver"`. |
| `primary` | object | see below | YES | Primary route chosen. |
| `substitutes` | array | of route objects | YES | Substitute routes, in order. |
| `excluded` | array | of `{rung, reason}` | YES | Rungs excluded from consideration. Empty when `selection = "owner"`. |
| `skipped` | array | of `{rung, reason}` | YES | Rungs skipped during resolution. Empty when `selection = "owner"`. |
| `unverified` | array | of `{rung, constraint}` | YES | Hard constraints that could not be checked (PROTO-DEC-0075 item 8). Empty when `selection = "owner"`. |
| `approval` | string\|null | any string or `null` | NO | Approval reference. |
| `shortfall` | string\|null | any string or `null` | NO | Shortfall description. |

### Route object (for `primary` and `substitutes`)

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `client` | string | any string | YES | Client identifier. |
| `model` | string | any string | YES | Model identifier. |
| `effort` | string\|null | any string or `null` | NO | Effort level. |

## Pins

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `pins` | object | see below | YES | Pinned inputs (PROTO-DEC-0075 item 7). |

### `pins` object

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `head` | string | 40 hex characters | YES | Git commit hash. |
| `launchFile` | string | path | YES | Path to launch file. |
| `launchSha256` | string | 64 hex characters | YES | SHA-256 of launch file. |
| `roleSha256` | string\|null | 64 hex characters or `null` | NO | SHA-256 of role file, or `null`. |
| `corpusHash` | string\|null | 64 hex characters or `null` | NO | SHA-256 of corpus, or `null`. |
| `dispatchVersion` | string | any string | YES | Dispatch version identifier. |

## Attempts

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `attempts` | array | of attempt objects | YES | Attempt history, in time order (PROTO-DEC-0075 items 2-3). Minimum 1 attempt. |

### Attempt object

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `n` | integer | >= 1 | YES | Attempt number. |
| `kind` | string | `"fresh"` or `"resume"` | YES | Attempt kind. |
| `reason` | string | enum | YES | Reason: `first`, `transient-retry`, `resume`, `route-change`, `model-change`, `repair`, `quality-escalation` (PROTO-DEC-0075 item 2). |
| `routeRole` | string | enum | YES | `"primary"` or `"substitute-1"` or `"substitute-2"`. |
| `route` | object | route object | YES | Route used for this attempt. |
| `effortUsed` | string\|null | any string or `null` | NO | Effort level actually used. |
| `modelRan` | object | see below | YES | Model that actually ran. |
| `sessionId` | string\|null | any string or `null` | NO | Session identifier. |
| `start` | string | ISO-8601 UTC | YES | Start timestamp. |
| `end` | string\|null | ISO-8601 UTC or `null` | NO | End timestamp. Must be >= `start` (BACKLOG S-6). |
| `exitCode` | integer\|null | any integer or `null` | NO | Process exit code. |
| `class` | string | enum | YES | Classification: `NONE`, one of fifteen names from PROTO-DEC-0075 item 4, or `UNCLASSIFIED`. `UNCLASSIFIED` only allowed on non-last attempts of DONE records (PROTO-DEC-0049 item 2). |
| `tokens` | object | see below | YES | Token usage. |
| `usage` | object | see below | YES | Usage information. |

### `modelRan` object

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `id` | string\|null | any string or `null` | YES | Model identifier. |
| `source` | string | `"client-output"` or `"requested"` or `"unknown"` | YES | Source of model information. |

### `tokens` object

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `in` | integer\|null | any integer or `null` | NO | Input tokens. |
| `out` | integer\|null | any integer or `null` | NO | Output tokens. |
| `source` | string | `"client-output"` or `"none"` | YES | Token source. `"none"` requires `in = out = null` (P-7). |

### `usage` object

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `amount` | number\|null | any number or `null` | NO | Usage amount. |
| `unit` | string\|null | `"USD"` or `"credits"` or `"tokens"` or `null` | NO | Usage unit. Required when `amount` is present. |

## Budget

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `budget` | object | see below | YES | Budget tracking (PROTO-DEC-0075 items 3, 5). |

### `budget` object

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `freshUsed` | integer | any integer | YES | Count of fresh attempts. |
| `resumes` | integer | any integer | YES | Count of resume attempts. |
| `stallMin` | integer | any integer | YES | Stall timeout in minutes. |
| `hardMin` | integer | any integer | YES | Hard timeout in minutes. |

Budget constraints (PROTO-DEC-0075 item 3):
- Maximum 2 fresh attempts with `routeRole = primary`
- Maximum 2 fresh attempts per substitute
- Maximum 6 fresh attempts in total
- `budget.freshUsed` must equal the count of fresh attempts
- `budget.resumes` must equal the count of resume attempts

## Cost

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `cost` | object | see below | YES | Cost information (PROTO-DEC-0075 item 9). |

### `cost` object

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `estimated` | number\|null | any number or `null` | NO | Estimated cost. |
| `actual` | number\|null | any number or `null` | NO | Actual cost. |
| `cumulative` | number\|null | any number or `null` | NO | Cumulative cost. |
| `unit` | string\|null | `"USD"` or `"credits"` or `"tokens"` or `null` | NO | Cost unit. Required when any numeric field is present. |

## Completion

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `completion` | object | see below | YES | Completion details (PROTO-DEC-0075 item 6). |

### `completion` object

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `processEnded` | boolean | `true` or `false` | YES | Whether the process ended. |
| `exitCode` | integer\|null | any integer or `null` | NO | Final exit code. Required for `state = "DONE"`. |
| `outputsPresent` | boolean | `true` or `false` | YES | Whether outputs exist. |
| `outputsNonEmpty` | boolean | `true` or `false` | YES | Whether outputs are non-empty. |
| `structuralCheck` | string | `"pass"` or `"fail"` or `"none"` | YES | Structural check result. |
| `validator` | string | `"pass"` or `"fail"` or `"n/a"` | YES | Validator result. |
| `evidence` | string\|null | path or `null` | NO | Evidence path. |
| `supervisorDone` | boolean | `true` or `false` | YES | Whether supervisor marked complete. |

DONE requirement (PROTO-DEC-0075 item 6): When `state = "DONE"`, all of these must be true:
- `processEnded`
- `exitCode` is not null
- `outputsPresent`
- `outputsNonEmpty`
- `structuralCheck = "pass"`
- `validator !== "fail"`
- `evidence` is not null
- `supervisorDone`

## State

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `state` | string | enum | YES | Current state: `"DONE"`, `"BLOCKED"`, or `"FAILED"` (PROTO-DEC-0075 item 11). |
| `fallen` | boolean | `true` or `false` | YES | `true` only when `state = "FAILED"` and the last attempt `class = "STALL"` (PROTO-DEC-0051 item 4). |

## Transitions

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `transitions` | array | of transition objects | YES | State transition history. |

### Transition object

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `from` | string | state enum | YES | Previous state. Must be one of the eleven states from PROTO-DEC-0075 item 11. |
| `to` | string | state enum | YES | New state. Must be one of the eleven states from PROTO-DEC-0075 item 11. |
| `at` | string | ISO-8601 UTC | YES | Timestamp of transition. |
| `reason` | string | non-empty | YES | Reason for transition. |

## Outputs

| Key | Type | Format | Required | Description |
|---|---|---|---|---|
| `outputs` | array | of strings (paths) | YES | Repository-relative paths of outputs. |
