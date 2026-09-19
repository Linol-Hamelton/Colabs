'use strict';

// Audit reproductions only. Mutations are confined to fresh temporary fixtures.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const repo = path.resolve(__dirname, '../..');
const hooks = require(path.join(repo, '.ai/bin/protocol-hooks.cjs'));
const { makeProtocolFixture, write } = require(path.join(repo, 'tests/helpers.cjs'));
const cleanup = [];
const emit = (name, result) => console.log(JSON.stringify({ name, ...result }));
function command(root, cmd, args, options = {}) {
  const r = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 180000, maxBuffer: 8 * 1024 * 1024, ...options });
  if (r.error) throw r.error;
  return { exit: r.status, output: (r.stdout + r.stderr).trim() };
}
function telemetry() {
  const root = makeProtocolFixture({ after: fn => cleanup.push(fn) }, { realValidator: true });
  const input = { cwd: root, session_id: 'audit' };
  const start = hooks.run('SessionStart', input, 'codex');
  const journal = start.hookSpecificOutput.additionalContext.match(/Your worklog: (.+)\n/)[1];
  const metric = path.join(root, '.ai/runtime/metrics/sessions.jsonl');
  const count = () => fs.existsSync(metric) ? fs.readFileSync(metric, 'utf8').trim().split('\n').length : 0;
  write(root, 'audit-change.txt', 'change\n');
  let result = hooks.run('Stop', input, 'codex');
  emit('changed-without-journal', { result, rows: count() });
  assert.equal(count(), 0);
  result = hooks.run('Stop', { cwd: root, session_id: 'never-started' }, 'codex');
  emit('no-SessionStart', { result, rows: count() });
  write(root, journal, '## 2026-09-19 - Audit fixture\n\nAgent: codex\n\nAction: Probe.\n\nResult: Observed.\n\nNext step: None.\n\nOpen: None.\n');
  const paths = hooks.sessionPaths(root, 'audit', 'codex');
  const changeStart = value => {
    const state = JSON.parse(fs.readFileSync(paths.state, 'utf8'));
    state.startTime = value;
    fs.writeFileSync(paths.state, JSON.stringify(state));
  };
  changeStart(Date.now() + 600000);
  result = hooks.run('Stop', input, 'codex');
  emit('future-start', { result, rows: count() });
  assert.equal(result.durationSec, 0);
  changeStart('spoofed');
  emit('string-start', { result: hooks.run('Stop', input, 'codex'), rows: count() });
  const now = Date.now;
  const frozen = now();
  changeStart(frozen);
  try {
    Date.now = () => frozen;
    emit('frozen-clock', { result: hooks.run('Stop', input, 'codex') });
  } finally { Date.now = now; }
  const before = count();
  const twice = [hooks.run('Stop', input, 'codex'), hooks.run('Stop', input, 'codex')];
  emit('Stop-twice', { addedRows: count() - before, results: twice });
  fs.writeFileSync(metric, 'x'.repeat(hooks.METRICS_MAX_BYTES - 1));
  hooks.recordSessionMetric(root, { probe: 'cross-boundary' });
  emit('rotation-crossing', { bytes: fs.statSync(metric).size, rotated: fs.existsSync(path.join(path.dirname(metric), 'sessions.1.jsonl')) });
  hooks.recordSessionMetric(root, { probe: 'next-event' });
  emit('rotation-next-event', { bytes: fs.statSync(metric).size, rotatedBytes: fs.statSync(path.join(path.dirname(metric), 'sessions.1.jsonl')).size });
  const append = fs.appendFileSync;
  try {
    fs.appendFileSync = function(file, ...args) {
      if (path.resolve(file) === metric) throw Object.assign(new Error('audit permission denial'), { code: 'EACCES' });
      return append.call(fs, file, ...args);
    };
    emit('metrics-EACCES', { result: hooks.run('Stop', input, 'codex') });
  } finally { fs.appendFileSync = append; }
  // A real filesystem failure as well as injected permission denial.
  const dir = path.dirname(metric);
  fs.renameSync(dir, dir + '-saved');
  fs.writeFileSync(dir, 'not a directory');
  emit('metrics-ENOTDIR', { result: hooks.run('Stop', input, 'codex') });
}
function policy() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'colabs-audit-'));
  cleanup.push(() => {
    const resolved = fs.realpathSync(root);
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('colabs-audit-'));
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });
  assert.equal(command(repo, 'git', ['-c', 'core.autocrlf=false', 'clone', '--no-hardlinks', '--quiet', repo, root]).exit, 0);
  const validate = () => {
    const r = command(root, 'powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'validate-protocol.ps1']);
    return { exit: r.exit, lines: r.output.split('\n').filter(l => /WARN|FAIL|Protocol OK/.test(l)) };
  };
  emit('clone-baseline', validate());
  const registryPath = path.join(root, 'docs/decisions/REGISTRY.md');
  const registry = fs.readFileSync(registryPath, 'utf8');
  fs.appendFileSync(registryPath, '| PROTO-DEC-0034 | reopened | none | | | |\n| PROTO-DEC-0035 | reopened | none | | | |\n');
  emit('reopen-without-trigger', validate());
  fs.writeFileSync(registryPath, registry.replace('| PROTO-DEC-0034 | accepted |', '| PROTO-DEC-0034 | reopened |'));
  emit('edit-existing-registry-row', validate());
  fs.writeFileSync(registryPath, registry);
  write(root, '.mcp.json', JSON.stringify({ mcpServers: { unapproved: { command: 'node', args: ['not-launched.cjs'] } } }) + '\n');
  emit('unapproved-MCP-config', validate());
  emit('policy-pin-with-MCP-config', command(root, 'node', ['--test', 'tests/context-policy.test.cjs']));
  fs.unlinkSync(path.join(root, '.mcp.json'));
  const owner = 'codex-audit-fixture';
  write(root, `.ai/worklog/${owner}.md`, '## 2026-09-19 - Fixture receipt\n\nAgent: codex\n\nAction: Probe tree freshness.\n\nResult: Fixture only.\n\nNext step: None.\n\nOpen: None.\n');
  const handoff = args => command(root, 'node', ['.ai/bin/protocol-handoff.cjs', ...args]);
  const recorded = handoff(['record', '--owner', owner, '--quick']);
  assert.equal(recorded.exit, 0, recorded.output);
  emit('fixture-receipt-baseline', handoff(['verify', '--owner', owner, '--deep']));
  write(root, '.ai/runtime/audit-tool-index.json', '{}\n');
  emit('runtime-index-receipt', handoff(['verify', '--owner', owner, '--deep']));
  write(root, 'audit-tool-index.json', '{}\n');
  emit('outside-runtime-index-receipt', handoff(['verify', '--owner', owner, '--deep']));
}
function data() {
  const dir = path.join(repo, '.ai/runtime/pilot-data');
  const rows = fs.readFileSync(path.join(dir, 'trials.jsonl'), 'utf8').trim().split(/\r?\n/).map(JSON.parse);
  const median = a => { a.sort((a, b) => a - b); return a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2; };
  for (const selection of ['rep1', 'rep1-replace-A9', 'all-rows']) {
    const selected = rows.filter(r => selection === 'all-rows' || (selection === 'rep1' ? r.rep === 1 : (r.rep === 1 && !(r.arm === 'A' && r.task === 9)) || (r.arm === 'A' && r.task === 9 && r.rep === 2)));
    for (const broad of [true, false]) {
      const out = {};
      for (const arm of ['A', 'B']) {
        const r = selected.filter(r => r.arm === arm && (r.task <= 5) === broad && Number.isFinite(r.tokens_in));
        out[arm] = { n: r.length, total: median(r.map(r => r.tokens_in + r.cache_read + r.tokens_out)), fresh: median(r.map(r => r.tokens_in + r.tokens_out)) };
      }
      emit(`${selection}-${broad ? 'broad' : 'narrow'}`, { ...out, totalDelta: 100 * (out.B.total / out.A.total - 1), freshDelta: 100 * (out.B.fresh / out.A.fresh - 1) });
    }
    emit(`${selection}-cost`, Object.fromEntries(['A', 'B'].map(arm => { const a = selected.filter(r => r.arm === arm && Number.isFinite(r.cost_usd)); return [arm, { cards: a.length, cost: a.reduce((s, r) => s + r.cost_usd, 0) }]; })));
  }
  for (const r of rows) {
    const name = r.rep === 0 ? 'a-6-1-deepseek' : r.rep === 2 ? 'a-t9-repeat' : `${r.arm.toLowerCase()}-t${r.task}-deepseek`;
    const folder = path.join(dir, 'evidence', name);
    const metrics = fs.readFileSync(path.join(folder, 'metrics.jsonl'), 'utf8').trim().split(/\r?\n/).map(JSON.parse);
    const m = metrics.find(m => m.session === `${r.arm}-${r.task}-${r.rep === 0 || r.rep === 2 ? 1 : r.rep}-deepseek`) || metrics.at(-1);
    const journals = fs.readdirSync(folder).filter(n => /^pilot-.*\.md$/.test(n));
    const patch = fs.readFileSync(path.join(folder, 'diff.patch'));
    emit(name, { rowHandoff: r.handoffComplete, metric: m, journalComplete: journals.map(n => /^## \d{4}/m.test(fs.readFileSync(path.join(folder, n), 'utf8'))), patchBytes: patch.length, patchUtf16: patch[0] === 255 && patch[1] === 254, rowDuration: r.durationSec, rowTimestamp: r.ts ?? null });
  }
}
function sample() {
  const root = makeProtocolFixture({ after: fn => cleanup.push(fn) }, { realValidator: true });
  const bytes = fs.readFileSync(path.join(repo, '.ai/runtime/pilot-data/evidence/a-t6-deepseek/diff.patch'));
  const patch = bytes.toString(bytes[0] === 255 && bytes[1] === 254 ? 'utf16le' : 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const applied = command(root, 'git', ['apply', '--whitespace=nowarn', '-'], { input: patch });
  emit('A6-archived-patch-apply', applied);
  assert.equal(applied.exit, 0, applied.output);
  const tested = command(root, 'node', ['--test', 'tests/lock.test.cjs']);
  emit('A6-archived-patch-tests', tested);
  assert.equal(tested.exit, 0, tested.output);
}
try {
  const mode = process.argv[2] || 'all';
  if (mode === 'telemetry' || mode === 'all') telemetry();
  if (mode === 'policy' || mode === 'all') policy();
  if (mode === 'data' || mode === 'all') data();
  if (mode === 'sample' || mode === 'all') sample();
} finally { for (const fn of cleanup.reverse()) fn(); }
