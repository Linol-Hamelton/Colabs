# 2A recovery 3 - FALLEN record (agy executor line)

Date: 2026-09-28. Status: the agy executor line for recovery 3 is FALLEN. Per PROTO-DEC-0095 item 1
the attempt is single and is not retried; the successor is vibe with the same narrow task.

## Attempts (all infrastructure, before any task work)

1. 12:02Z - `400 FAILED_PRECONDITION: User location is not supported` (bg pid 26432).
2. 12:07Z - `loadCodeAssist: EOF` (bg pid 8724).
3. 12:09Z - ran ~18 min with no output and no file; ended `streamGenerateContent: EOF` (bg pid 17736).
4. 12:29Z - `invalid model selection: model gemini-3.8-flash-high is not recognized as a known model`
   (bg pid 28936).
5. 13:05Z - the PROTO-DEC-0095 single attempt with the VPN-ok confirmation:
   `loadCodeAssist: EOF` (bg pid 7932); a diagnostic `agy models` at 13:11Z returned
   `loadCodeAssist: Bad Gateway` (HTTP 502).

No task work was produced by any attempt: no prompt file, no journal entry, no commit. The agy route
is unstable after the reboot. Per PROTO-DEC-0095 item 2, H-4 stays "to verify". No other agy run
happens today (item 1).

## Successor

vibe, `LAUNCH-2A-RECOVERY3-VIBE.md`: Mistral Medium 3.5 until a GLM probe PASSes; the same narrow
deliverable (the unified adversarial audit prompt <= 150 lines bound to the candidate).
