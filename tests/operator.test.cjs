'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { repoRoot, makeProtocolFixture, run } = require('./helpers.cjs');

function operatorTool(root, args) {
  return run(process.execPath, [path.join(repoRoot, '.ai/bin/protocol.cjs'), ...args,
    '--root', root], root);
}

test('operator doctor reports protocol health and deep Merkle audit', t => {
  const root = makeProtocolFixture(t);
  const result = operatorTool(root, ['doctor']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Protocol Healthy/);
  assert.match(result.stdout, /Merkle Chain & Integrity Audit/);
});

test('operator status reports lock and document status', t => {
  const root = makeProtocolFixture(t);
  const result = operatorTool(root, ['status']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Lock: free/);
  assert.match(result.stdout, /\.ai\/TASK\.md:/);
});

test('operator clean with dry-run does not modify files', t => {
  const root = makeProtocolFixture(t);
  const result = operatorTool(root, ['clean', '--dry-run']);
  assert.equal(result.status, 0, result.stderr);
});

test('operator telemetry reports collaboration metrics', t => {
  const root = makeProtocolFixture(t);
  const result = operatorTool(root, ['telemetry']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Telemetry & Efficiency Metrics/);
});
