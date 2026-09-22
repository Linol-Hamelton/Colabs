# Worklog: claude-ebd3e8a8eb29a6d7

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

<!-- archived-parent: sha256:9d88c1697dab26365606adba646850cf48a69c9bd0eb542e50f540dd9aa7d612 -->

---

## 2026-09-22 - Credentials removed from D:\mcp-stack; Qwen stubs removed from this repo

Agent: claude-ebd3e8a8eb29a6d7

Action: On the owner's instruction, removed four untracked stub files that the Qwen run
had written into the wrong repository (`docs/compression/Qoder/`, 3,035 B across four
files documenting a failed access attempt), and removed the hardcoded credential literals
from `D:\mcp-stack`. That corpus is not a git repository, so there is no undo: I copied
all six affected files to the session scratchpad before touching them and confirmed every
file was LF, so no line-ending conversion was introduced. Verified first that the three
DeepSeek keys and the GitHub token exist as persistent user-level environment variables,
because the naive edit - deleting the literal - would have left the gateway unable to
start. `DEEPSEEK_API_KEY` itself is not set at user level, which is why the batch files
were carrying it.

Result: Zero credential literals remain across all 59 units of the corpus, rescanned for
`sk-`, `AIza`, `ghp_` and `xox` shapes. The three Node servers now read the key from the
environment and throw a named error instead of falling back silently
(`mcp-gateway.js:37-40`, `deepseek-multi-server.js:15-18`, `mentor-server.js:15-18`); all
three still pass `node --check`. The two batch files resolve `DEEPSEEK_API_KEY` from
`%DEEPSEEK_MAIN_KEY%` at run time. In `continue-with-mcp.yaml` the three documenting
comments are redacted, and the GitHub token at line 76 now uses `${env:...}` - which is
the file's own convention, already in use on lines 8, 16, 62, 84 and 94, so line 76 was
the single entry that deviated from it. A second credential class turned up during the
rescan that the first pass had missed: a GitHub personal access token, which grants
repository access and is more dangerous than a model key. No credential value was written
into any protocol artifact, journal or report at any point.

Next step: the owner dispatches the two certifiers against
`docs/reviews/2026-09-22-claude-layers-abc-adversarial-prompt.md`. Nothing in this entry
is part of that package; it is product-side hygiene in a separate corpus.

Open: **Removal is not rotation.** Every one of these values sat in plaintext on disk and
in a file that `install-autostart.bat` registers, so they must be treated as exposed and
rotated by the owner regardless of this edit; nothing reached git history, since that
corpus is not a repository. The batch files now depend on user-level environment
variables, so an autostart entry running as SYSTEM rather than as the user would resolve
them empty - the servers would fail loudly with the new guard rather than silently using
a stale key, which is the better failure, but it is a behaviour change worth knowing. I
did not restart or test any server: the prompt for that corpus forbade starting services,
and verification is the owner's call.

Evidence:
- anchor: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1, uncommitted changes present
- digest: sha256:81899adef81fd0b8fc6c69bf01c9638c1bcaeb3ea63c4f7d669a07ab507925d0 over 268 tracked and untracked files
- digest format: 4
- recorded: 2026-09-22T18:06:18.017Z by claude-ebd3e8a8eb29a6d7
- entry hash format: 2
- entry: sha256:0f31be05f355a0c3e62ecf2cc091aea1e3eb27595316cc6728b85818e6c08244 of this entry without this block
- parent-entry: sha256:9d88c1697dab26365606adba646850cf48a69c9bd0eb542e50f540dd9aa7d612
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 3s
- test-protocol.ps1: exit 0 in 241s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
