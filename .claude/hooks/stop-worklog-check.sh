#!/usr/bin/env bash
# Warnings never block the user. Operational failures must remain visible.
set -u

if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' '{"systemMessage":"AI protocol: Node.js is missing; the handoff check is unavailable. Run validate-protocol.ps1."}'
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)" || exit 1
exec node "$SCRIPT_DIR/protocol-hooks.cjs" Stop
