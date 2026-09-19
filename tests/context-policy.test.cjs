'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { repoRoot } = require('./helpers.cjs');

test('C2: PROTOCOL.md defines context digest rules and external tooling policy anchors', () => {
  const protocolPath = path.join(repoRoot, '.ai/docs/PROTOCOL.md');
  const protocolText = fs.readFileSync(protocolPath, 'utf8');

  // Pinned repomix@1.18.0 command
  assert.match(protocolText, /npx -y repomix@1\.18\.0 --include "\.ai\/bin\/\*\*,validate-protocol\.ps1,test-protocol\.ps1,tests\/\*\*" --no-git-sort-by-changes --style xml --output \.ai\/runtime\/kernel-digest\.xml/);

  // Advisory / never auto-injected / never Evidence
  assert.match(protocolText, /never auto-injected/i);
  assert.match(protocolText, /never.*Evidence/i);

  // At most one MCP server and sandbox requirement
  assert.match(protocolText, /one MCP server/i);
  assert.match(protocolText, /--sandbox/);

  // Tool-schema budget <= 1500 tokens
  assert.match(protocolText, /1500 tokens/);
});

test('C2: AGENTS.md section 7 contains external tooling and MCP advisory pointer sentence', () => {
  const agentsPath = path.join(repoRoot, 'AGENTS.md');
  const agentsText = fs.readFileSync(agentsPath, 'utf8');

  assert.match(agentsText, /External tooling and MCP are optional accelerators; they are advisory, never\s+Evidence or gate inputs; see PROTOCOL\.md/);
});
