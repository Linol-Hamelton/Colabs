#!/usr/bin/env node
'use strict';

// Unified Operator CLI for AI Collaboration Protocol (v1.9.0)
// Provides unified `doctor`, `status`, and command dispatching.

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

function findRoot(dir = process.cwd()) {
  let current = path.resolve(dir);
  while (true) {
    if (fs.existsSync(path.join(current, 'AGENTS.md')) && fs.existsSync(path.join(current, '.ai'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return path.resolve(dir);
}

function runSilent(cmd, cwd) {
  try {
    return { ok: true, output: execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' }).trim() };
  } catch (err) {
    return { ok: false, error: err.message, output: (err.stdout || '').trim() };
  }
}

function doctor(root) {
  console.log('AI Collaboration Protocol - Health Diagnostic (doctor)');
  console.log(`Repository Root: ${root}\n`);
  let issues = 0;

  // 1. Runtime dependencies
  console.log('=== 1. Runtime Environment ===');
  const nodeVer = process.version;
  const nodeMajor = parseInt(nodeVer.replace('v', '').split('.')[0], 10);
  if (nodeMajor >= 18) {
    console.log(`[PASS] Node.js: ${nodeVer} (>= 18.0.0 required)`);
  } else {
    console.log(`[FAIL] Node.js: ${nodeVer} is too old (>= 18.0.0 required)`);
    issues++;
  }

  const gitRes = runSilent('git --version', root);
  if (gitRes.ok) {
    console.log(`[PASS] Git: ${gitRes.output}`);
  } else {
    console.log('[FAIL] Git executable not found in PATH');
    issues++;
  }

  const psRes = runSilent('powershell -NoProfile -Command "$PSVersionTable.PSVersion.ToString()"', root);
  const pwshRes = runSilent('pwsh -NoProfile -Command "$PSVersionTable.PSVersion.ToString()"', root);
  if (pwshRes.ok) {
    console.log(`[PASS] PowerShell Core (pwsh): ${pwshRes.output}`);
  } else if (psRes.ok) {
    console.log(`[PASS] Windows PowerShell: ${psRes.output}`);
  } else {
    console.log('[FAIL] Neither pwsh nor powershell found in PATH');
    issues++;
  }

  // 2. Protocol workspace structure
  console.log('\n=== 2. Protocol Structure & Manifest ===');
  const manifestPath = path.join(root, 'protocol-manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      console.log(`[PASS] protocol-manifest.json present (role: ${manifest.role || 'unknown'}, version: ${manifest.protocolVersion || 'unknown'})`);
    } catch {
      console.log('[FAIL] protocol-manifest.json is invalid JSON');
      issues++;
    }
  } else {
    console.log('[FAIL] protocol-manifest.json missing');
    issues++;
  }

  const coreDocs = ['AGENTS.md', '.ai/TASK.md', '.ai/PLAN.md', '.ai/DECISIONS.md', '.ai/ARCHIVE.md'];
  for (const doc of coreDocs) {
    const full = path.join(root, doc);
    if (fs.existsSync(full)) {
      console.log(`[PASS] ${doc} present`);
    } else {
      console.log(`[FAIL] ${doc} missing`);
      issues++;
    }
  }

  // 3. Concurrency and Lock Health
  console.log('\n=== 3. Lock & Operation Gate Status ===');
  const lockModule = require('./protocol-lock.cjs');
  try {
    const lockStatus = lockModule.operate(root, 'status');
    if (lockStatus.lock) {
      console.log(`[WARN] Lock held by: ${lockStatus.lock.owner} (held for ${lockStatus.lock.heldForMinutes || 0}m, alive: ${lockStatus.lock.alive})`);
    } else {
      console.log('[PASS] Shared writer lock is free (lock: null)');
    }
    if (lockStatus.operationInProgress) {
      console.log('[WARN] Operation gate is currently active');
    } else {
      console.log('[PASS] Operation gate clean');
    }
  } catch (err) {
    console.log(`[FAIL] Lock inspection error: ${err.message}`);
    issues++;
  }

  // 4. Document size limits
  console.log('\n=== 4. Document Limits ===');
  const archiveModule = require('./protocol-archive.cjs');
  archiveModule.archiveStatus(root);

  console.log('\n======================================');
  if (issues === 0) {
    console.log('Verdict: Protocol Healthy. All checks passed.');
  } else {
    console.log(`Verdict: Issues Found (${issues} failure(s)). Inspect details above.`);
  }
}

function status(root) {
  console.log('AI Collaboration Protocol - Status');
  console.log(`Root: ${root}\n`);
  const lockModule = require('./protocol-lock.cjs');
  const lockStatus = lockModule.operate(root, 'status');
  console.log(`Lock: ${lockStatus.lock ? lockStatus.lock.owner + ' (alive: ' + lockStatus.lock.alive + ')' : 'free'}`);

  const archiveModule = require('./protocol-archive.cjs');
  archiveModule.archiveStatus(root);
}

function clean(root, options = {}) {
  console.log('AI Collaboration Protocol - Maintenance & Cleanup');
  console.log(`Repository Root: ${root}\n`);
  const sessionModule = require('./protocol-session.cjs');

  console.log('--- 1. Quarantining empty journals ---');
  const pruneArgs = ['prune', '--root', root];
  if (options.dryRun) pruneArgs.push('--dry-run');
  if (options.force) pruneArgs.push('--force');
  try { sessionModule.main(pruneArgs); } catch (e) { console.log(`Prune: ${e.message}`); }

  console.log('\n--- 2. Cleaning runtime snapshots & temporary files ---');
  const cleanArgs = ['cleanup-runtime', '--root', root];
  if (options.dryRun) cleanArgs.push('--dry-run');
  if (options.force) cleanArgs.push('--force');
  try { sessionModule.main(cleanArgs); } catch (e) { console.log(`Cleanup: ${e.message}`); }
}

function telemetry(root) {
  console.log('AI Collaboration Protocol - Telemetry & Efficiency Metrics');
  console.log(`Repository Root: ${root}\n`);

  const worklogDir = path.join(root, '.ai', 'worklog');
  const archivePath = path.join(root, '.ai', 'ARCHIVE.md');

  const journals = fs.existsSync(worklogDir)
    ? fs.readdirSync(worklogDir).filter(name => name.endsWith('.md') && name !== 'README.md')
    : [];

  let activeEntries = 0;
  let certifiedEntries = 0;
  let chainedEntries = 0;
  const agentCounts = {};

  function processText(text) {
    const sections = text.split(/(?=^## \d{4}-\d{2}-\d{2} - )/m);
    for (const section of sections) {
      if (!/^## \d{4}-\d{2}-\d{2} - /m.test(section)) continue;
      activeEntries++;
      const agentMatch = section.match(/^Agent:\s*([^\r\n]+)/m);
      if (agentMatch) {
        const agent = agentMatch[1].trim().toLowerCase();
        agentCounts[agent] = (agentCounts[agent] || 0) + 1;
      }
      if (/^Evidence:/m.test(section)) {
        certifiedEntries++;
      }
      if (/parent-entry:\s*sha256:[a-f0-9]{64}/m.test(section)) {
        chainedEntries++;
      }
    }
  }

  for (const j of journals) {
    try {
      const content = fs.readFileSync(path.join(worklogDir, j), 'utf8');
      processText(content);
    } catch { }
  }

  let archivedCount = 0;
  if (fs.existsSync(archivePath)) {
    try {
      const archiveText = fs.readFileSync(archivePath, 'utf8');
      const matches = archiveText.match(/^## \d{4}-\d{2}-\d{2} - [^\r\n]+/mg);
      if (matches) archivedCount = matches.length;
    } catch { }
  }

  console.log('=== Collaboration Overview ===');
  console.log(`Active Journals:    ${journals.length}`);
  console.log(`Active Entries:     ${activeEntries}`);
  console.log(`Archived Entries:   ${archivedCount}`);
  console.log(`Total Hand-offs:    ${activeEntries + archivedCount}`);
  console.log(`Certified Evidence: ${certifiedEntries} entries`);
  console.log(`Merkle Chained:     ${chainedEntries} entries\n`);

  console.log('=== Activity by Assistant ===');
  const sortedAgents = Object.entries(agentCounts).sort((a, b) => b[1] - a[1]);
  if (sortedAgents.length) {
    for (const [agent, count] of sortedAgents) {
      const bar = '#'.repeat(Math.min(count, 30));
      console.log(`  ${agent.padEnd(14)} : ${count.toString().padStart(3)} [${bar}]`);
    }
  } else {
    console.log('  No agent entries recorded yet.');
  }

  console.log('\n=== Storage & Runtime Footprint ===');
  const runtimeDir = path.join(root, '.ai', 'runtime');
  if (fs.existsSync(runtimeDir)) {
    const runtimeFiles = fs.readdirSync(runtimeDir).filter(f => !fs.statSync(path.join(runtimeDir, f)).isDirectory());
    console.log(`Active Runtime Artifacts: ${runtimeFiles.length} file(s)`);
  }
}

function printUsage() {
  console.log(`AI Collaboration Protocol CLI (v1.9.0)

Usage: node .ai/bin/protocol.cjs <command> [options]

Commands:
  doctor       Run diagnostic health check of tools, locks, and workspace
  status       Display active lock holder and document storage limits
  clean        Quarantine empty journals and clean orphaned/stale runtime files
  telemetry    Display collaboration statistics, agent participation, and integrity metrics
  help         Show this help message
`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const root = findRoot();
  const options = {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
  };

  if (command === 'doctor') {
    doctor(root);
  } else if (command === 'status') {
    status(root);
  } else if (command === 'clean') {
    clean(root, options);
  } else if (command === 'telemetry') {
    telemetry(root);
  } else if (command === 'help' || !command || command === '--help' || command === '-h') {
    printUsage();
  } else {
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { doctor, status, clean, telemetry, findRoot };

