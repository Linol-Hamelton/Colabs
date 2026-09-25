# Z4 Research Report: Five-Minute Idle Exit (Watchdog)

## Header
- **Commit SHA**: 4ded1bee1c2acf2392fdeededf50935f59138302
- **Model**: Qwen
- **Client**: Qwen
- **UTC Date**: 2026-09-24
- **Zone**: Z4 - Five-minute idle exit (watchdog)
- **What Actually Read**: 
  - d:\Colabs\docs\research\2026-09-24-remediation-mapping\BRIEF.md
  - d:\Colabs\.ai\DECISIONS.md (blocks PROTO-DEC-0047 and PROTO-DEC-0049 item 3)
  - d:\Colabs\.ai\runtime\metrics\sessions.jsonl
  - d:\Colabs\.ai\bin\protocol-hooks.cjs and d:\Colabs\.ai\bin\protocol-session.cjs
  - C:\Users\Dmitry\.gemini\antigravity-cli\builtin\skills\agy-customizations\docs\hooks.md
  - d:\Colabs\.ai\docs\CLI-AGENTS.md

## Edit Map
| File | Function | Line Range | Change | Tests | Documents |
|------|----------|------------|--------|-------|-----------|
| .ai/bin/protocol-watchdog.cjs | watchdog logic | TBD | New watchdog implementation | tests/watchdog.test.cjs | .ai/docs/CLI-AGENTS.md |
| .ai/bin/protocol-session.cjs | session monitoring | TBD | Integration with watchdog | tests/session.test.cjs | AGENTS.md |
| .ai/bin/protocol-hooks.cjs | activity signals | TBD | Activity heartbeat updates | tests/hooks.test.cjs | hooks.md |

## Observable Signals by Client

### Claude Code
- **Activity Signal**: Transcript growth in `.ai/worklog/<session>.md`, journal mtime updates, tool events in session state file
- **Location**: `.ai/worklog/claude-*.md`, `.ai/runtime/claude-*.json`
- **Detectable Without Cooperation**: CLAIM - Yes, through filesystem monitoring of worklog and state files

### Codex
- **Activity Signal**: Transcript growth in `.ai/worklog/<session>.md`, journal mtime updates, tool events in session state file
- **Location**: `.ai/worklog/codex-*.md`, `.ai/runtime/codex-*.json`
- **Detectable Without Cooperation**: CLAIM - Yes, through filesystem monitoring of worklog and state files

### agy (Gemini)
- **Activity Signal**: Transcript growth in `.ai/worklog/<session>.md`, journal mtime updates, tool events in session state file, transcriptPath from hook payload
- **Location**: `.ai/worklog/agi-*.md`, `.ai/runtime/agi-*.json`, transcriptPath from hook payload
- **Detectable Without Cooperation**: CLAIM - Yes, through filesystem monitoring; transcriptPath provides additional signal

### Kilo Code
- **Activity Signal**: Transcript growth in `.ai/worklog/<session>.md`, journal mtime updates, tool events in session state file
- **Location**: `.ai/worklog/kilo-*.md`, `.ai/runtime/kilo-*.json`
- **Detectable Without Cooperation**: CLAIM - Yes, through filesystem monitoring of worklog and state files

### Copilot CLI
- **Activity Signal**: Transcript growth in `.ai/worklog/<session>.md`, journal mtime updates, tool events in session state file
- **Location**: `.ai/worklog/copilot-*.md`, `.ai/runtime/copilot-*.json`
- **Detectable Without Cooperation**: CLAIM - Yes, through filesystem monitoring of worklog and state files

### vibe
- **Activity Signal**: Transcript growth in `.ai/worklog/<session>.md`, journal mtime updates, tool events in session state file
- **Location**: `.ai/worklog/vibe-*.md`, `.ai/runtime/vibe-*.json`
- **Detectable Without Cooperation**: CLAIM - Yes, through filesystem monitoring of worklog and state files

## Watchdog Sketch

### Inputs
- Session state file (`.ai/runtime/<agent>-<id>.json`) containing last activity timestamp
- Worklog file (`.ai/worklog/<agent>-<id>.md`) for mtime monitoring
- Process ID of the running agent session
- Configurable idle timeout (default: 5 minutes)

### Actions on Stall
1. **Log the stall**: Record timestamp and session details
2. **Attempt graceful shutdown**: Send SIGTERM to the process
3. **Wait briefly**: Allow 10 seconds for graceful shutdown
4. **Force termination**: Send SIGKILL if process still running
5. **Record outcome**: Log the termination in session metrics

### Exit Codes
- `0`: Normal operation, no stall detected
- `1`: Stall detected and process terminated successfully  
- `2`: Stall detected but process termination failed
- `3`: Invalid input parameters

## False-Stall Risks and Coverage

### Long Test Suite (e.g., protocol suite ~270s)
- **Risk**: A test suite running longer than 5 minutes could trigger false stall
- **Coverage**: FACT - The protocol suite runs about 270s (4.5 minutes), which is under the 5-minute threshold. However, longer test suites could exceed this. Implement adaptive timeouts or activity pings during long operations.

### Slow Model Turn
- **Risk**: A slow model response could cause perceived inactivity
- **Coverage**: Monitor actual processing activity rather than just waiting periods. If the model is actively processing, the session state should reflect ongoing activity.

### Waiting Permission Prompt
- **Risk**: Interactive prompts could cause extended idle periods
- **Coverage**: Implement heartbeat mechanism where the session periodically updates its state file to indicate it's waiting for user input rather than stalled.

## Solution Options

### Option 1: Filesystem-Based Monitoring (Recommended)
- **Approach**: Monitor worklog mtime and session state files for updates
- **Pros**: Works across all clients, doesn't require client cooperation, robust
- **Cons**: May have slight delay due to filesystem sync timing

### Option 2: Process-Level Monitoring
- **Approach**: Monitor actual process activity and system calls
- **Pros**: More accurate activity detection
- **Cons**: Platform-specific, requires more complex implementation

### Option 3: Hybrid Approach
- **Approach**: Combine filesystem monitoring with optional client heartbeats
- **Pros**: Most comprehensive detection, allows for client-specific optimizations
- **Cons**: More complex implementation

**Recommendation**: Option 1 (Filesystem-Based Monitoring) as it works reliably across all clients without requiring client cooperation, aligns with existing session tracking mechanisms.

## Risk Register

| Trigger | Likelihood | Impact | Prevention | Compensation | Cost | Residual |
|---------|------------|--------|--------------|--------------|------|----------|
| False positive termination during long operations | Medium | High | Adaptive timeouts, heartbeat during long ops | Manual restart of terminated session | Low | Medium |
| Failure to detect truly stalled processes | Low | Medium | Multiple monitoring signals (file + process) | Manual intervention required | Low | Low |
| Race conditions during session startup/shutdown | Low | Low | Proper locking and state synchronization | Logging for troubleshooting | Low | Very Low |
| Platform-specific file monitoring issues | Low | Medium | Cross-platform testing and fallbacks | Separate monitoring mechanisms | Medium | Low |

## Net Gain
The watchdog mechanism provides substantial value by preventing stalled agents from consuming resources indefinitely. The implementation cost is moderate with well-understood risks that can be mitigated. The benefit of reliable session cleanup and resource management outweighs the complexity of implementation.

## Not Verified
- Actual performance characteristics under various load conditions
- Specific timeout values optimal for different types of operations
- Cross-platform behavior of file monitoring mechanisms
- Integration with all mentioned client types in real-world scenarios