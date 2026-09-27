'use strict';
// Prototype of one validator slice as a pure Node function, with a parity harness.
// The slice is the completion gate of validate-protocol.ps1 (heavy path and cited reviews; the
// light path and the Node `gate-check` are outside it). The harness replays
// tests/validator.test.cjs "completed tasks require a prompt and independent review completion gate"
// step by step, running the real PowerShell validator and this function on the same files, and
// compares the gate FAIL sets and the test's assertions.
//   node tools/perf/gate-slice.cjs            (parity run, ~1-2 minutes, writes only a temp fixture)
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { repoRoot } = require('./lib.cjs');

const strict = new TextDecoder('utf-8', { fatal: true });
const readText = full => { try { return strict.decode(fs.readFileSync(full)); } catch { return null; } };

function isSafe(base, rel) {
  if (!rel || !rel.trim()) return false;
  const norm = rel.trim().replace(/\\/g, '/');
  if (norm.includes('..') || norm.startsWith('/') || path.isAbsolute(norm) || /^[a-zA-Z]:/.test(norm)) return false;
  const baseFull = path.resolve(base).replace(/[\\/]+$/, '');
  const target = path.resolve(baseFull, norm);
  if (!(target === baseFull || target.startsWith(baseFull + path.sep) || target.startsWith(baseFull + '/'))) return false;
  let current = baseFull;
  for (const segment of target.slice(baseFull.length).split(/[\\/]/).filter(Boolean)) {
    current = path.join(current, segment);
    try { if (fs.lstatSync(current).isSymbolicLink()) return false; } catch { /* missing is fine */ }
  }
  return true;
}

// Pure core. Inputs: task text, role and three capabilities. Output: structured diagnostics.
function completionGate({ taskText, role, readRel, existsRel, safeRel }) {
  const out = [];
  const fail = (rule, message) => out.push({ status: 'FAIL', rule, message });
  const pass = (rule, message) => out.push({ status: 'PASS', rule, message });
  const statuses = [...taskText.matchAll(/^Status:[ \t]*(.*)$/gm)];
  if (statuses.length !== 1 || !/^Completed(?:[ .;:-]|$)/.test(statuses[0][1].trim())) return out;
  const gate = taskText.match(/^## Completion gate[ \t]*\r?\n([\s\S]*?)(?=^## |(?![\s\S]))/m);
  if (!gate) { fail('GATE-001', 'completed task requires a ## Completion gate section with an adversarial prompt and independent review'); return out; }
  const field = name => gate[1].match(new RegExp('^[ \\t]*- ' + name + ':[ \\t]*(\\S+)[ \\t]*$', 'm'));
  const promptField = field('Adversarial review prompt');
  const reviewField = field('Independent review');
  const norm = m => m[1].trim().replace(/\\/g, '/').replace(/^\.\//, '');
  if (promptField && reviewField && norm(promptField) === norm(reviewField)) fail('GATE-002', 'adversarial prompt and independent review must be separate artifacts');
  for (const [label, m] of [['adversarial review prompt', promptField], ['independent review', reviewField]]) {
    if (!m) { fail('GATE-003', `completed task is missing its ${label} field`); continue; }
    const rel = norm(m);
    if (!safeRel(rel)) { fail('GATE-004', `${label} must be a safe path inside the repository root: ${rel}`); continue; }
    if (role === 'source' && !rel.startsWith('docs/reviews/')) { fail('GATE-005', `in source repository, ${label} must be under docs/reviews/: ${rel}`); continue; }
    if (!existsRel(rel)) { fail('GATE-006', `completed task ${label} is missing: ${rel}`); continue; }
    const content = readRel(rel);
    if (content === null || content.trim().length === 0) { fail('GATE-007', `completed task ${label} must not be empty: ${rel}`); continue; }
    if (label === 'adversarial review prompt') {
      if (!/(?:unified[\s\S]{0,80}adversarial|adversarial[\s\S]{0,80}unified)[\s\S]{0,80}prompt/i.test(content)) fail('GATE-008', `${label} must identify a unified adversarial audit prompt: ${rel}`);
      else pass('GATE-008', `completion gate prompt found: ${rel}`);
      continue;
    }
    const lines = content.split(/\r?\n/);
    let end = lines.findIndex(l => l.trim() === '---');
    if (end === -1) end = lines.findIndex(l => l.startsWith('## '));
    const header = end === -1 ? content : end <= 0 ? '' : lines.slice(0, end).join('\n');
    if (/(?:transcribed\s+(?:from\s+chat\s+)?by|transcription\s+fallback)/i.test(content)) { fail('GATE-009', `independent review ${rel} is transcribed; transcribed reviews cannot satisfy the independent review gate`); continue; }
    const headerField = name => header.match(new RegExp('^[ \\t]*(?:\\*\\*)?\\b' + name + '\\b(?:\\*\\*)?\\s*:\\s*([^\\r\\n]+)', 'mi'));
    const mode = headerField('Mode');
    if (mode && mode[1].trim().toUpperCase() === 'ADVISORY') { fail('GATE-010', `independent review ${rel} has Mode: ADVISORY; advisory reviews cannot satisfy the independent review gate`); continue; }
    const reviewer = headerField('Reviewer');
    const verdict = headerField('Verdict');
    if (!reviewer) fail('GATE-011', `independent review must name a Reviewer: ${rel}`);
    else if (!verdict || !['PASS', 'RECOMMENDATION'].includes(verdict[1].trim().toUpperCase())) fail('GATE-012', `independent review must have a PASS or RECOMMENDATION verdict: ${rel}`);
    else pass('GATE-012', `independent review certified: ${rel}`);
  }
  const seen = new Set();
  for (const m of taskText.matchAll(/docs\/reviews\/[a-z0-9._-]+\.md/gi)) {
    const rel = m[0];
    if (seen.has(rel.toLowerCase())) continue;
    seen.add(rel.toLowerCase());
    if (!existsRel(rel)) fail('GATE-013', `completed task cites missing review artifact: ${rel}`);
    else { const c = readRel(rel); if (c === null || c.trim().length === 0) fail('GATE-014', `completed task cites empty review artifact: ${rel}`); }
  }
  return out;
}

function gateForRoot(root) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'protocol-manifest.json'), 'utf8'));
  return completionGate({
    taskText: readText(path.join(root, '.ai', 'TASK.md')) || '',
    role: manifest.role || 'source',
    readRel: rel => readText(path.join(root, rel)),
    existsRel: rel => { try { return fs.statSync(path.join(root, rel)).isFile(); } catch { return false; } },
    safeRel: rel => isSafe(root, rel),
  });
}

module.exports = { completionGate, gateForRoot, isSafe };

if (require.main === module) {
  const h = require(path.join(repoRoot, 'tests', 'helpers.cjs'));
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'colabs-perf-gate-'));
  for (const args of [['init', '-b', 'main'], ['-c', 'user.name=T', '-c', 'user.email=t@t', 'commit', '--allow-empty', '-m', 'x']]) h.git(root, args);
  h.seedProtocol(root, { realValidator: true });
  const W = (rel, text) => h.write(root, rel, text);
  const setRole = role => { const p = path.join(root, 'protocol-manifest.json'); const m = JSON.parse(fs.readFileSync(p, 'utf8')); m.role = role; fs.writeFileSync(p, JSON.stringify(m, null, 2)); };
  const G = '# Current Task\n\nStatus: Completed.\n\n## Completion gate\n\n';
  const P = '- Adversarial review prompt: docs/reviews/prompt.md\n- Independent review: docs/reviews/review.md\n';
  const R = v => `# Independent review\n\nDate: 2026-09-19\nReviewer: opposing-agent\n\nVerdict: ${v}\n`;
  const U = '# Unified adversarial audit prompt\n\nPrompt content.\n';
  // Same mutations and expectations as tests/validator.test.cjs, in the same order.
  const steps = [
    ['no gate', () => W('.ai/TASK.md', '# Current Task\n\nStatus: Completed.\n'), /completed task requires a ## Completion gate/],
    ['compliant PASS', () => { W('.ai/TASK.md', G + P); W('docs/reviews/prompt.md', '# Unified adversarial audit prompt\n\nThis unified adversarial review prompt covers every changed item.\n'); W('docs/reviews/review.md', R('PASS')); }, 'ok'],
    ['BLOCKED verdict', () => W('docs/reviews/review.md', R('BLOCKED')), /must have a PASS or RECOMMENDATION verdict/],
    ['same artifact', () => W('.ai/TASK.md', G + '- Adversarial review prompt: docs/reviews/review.md\n- Independent review: docs/reviews/review.md\n'), /must be separate artifacts/],
    ['no reviewer', () => { W('.ai/TASK.md', G + P); W('docs/reviews/review.md', '# Independent review\n\nDate: 2026-09-19\nVerdict: PASS\n'); }, /must name a Reviewer/],
    ['not unified prompt', () => { W('docs/reviews/review.md', R('RECOMMENDATION')); W('docs/reviews/prompt.md', '# Regular prompt\n\nPlease review.\n'); }, /must identify a unified adversarial audit prompt/],
    ['RECOMMENDATION ok', () => W('docs/reviews/prompt.md', U), 'ok'],
    ['empty prompt', () => W('docs/reviews/prompt.md', '   \n\n'), /must not be empty/],
    ['empty review', () => { W('docs/reviews/prompt.md', U); W('docs/reviews/review.md', ''); }, /must not be empty/],
    ['cites missing', () => { W('docs/reviews/review.md', R('PASS')); W('.ai/TASK.md', '# Current Task\n\nStatus: Completed.\n\nSee docs/reviews/missing-analysis.md.\n\n## Completion gate\n\n' + P); }, /cites missing review artifact/],
    ['cites existing', () => W('docs/reviews/missing-analysis.md', '# Analysis\n\nContent.\n'), 'ok'],
    ['cites empty', () => W('docs/reviews/missing-analysis.md', '   \n'), /cites empty review artifact/],
    ['source outside docs/reviews', () => { W('.ai/TASK.md', G + '- Adversarial review prompt: custom-reviews/prompt.md\n- Independent review: custom-reviews/review.md\n'); W('custom-reviews/prompt.md', U); W('custom-reviews/review.md', R('PASS')); }, /in source repository, adversarial review prompt must be under docs\/reviews\//],
    ['installed custom path ok', () => setRole('installed'), 'ok'],
    ['traversal', () => W('.ai/TASK.md', G + '- Adversarial review prompt: ../outside-prompt.md\n- Independent review: custom-reviews/review.md\n'), /must be a safe path inside the repository root/],
    ['template title ok', () => { setRole('source'); W('.ai/TASK.md', G + P); W('docs/reviews/review.md', R('PASS')); W('docs/reviews/prompt.md', '# Unified Adversarial Audit Prompt: Wave A Remediation\n\nPrompt content.\n'); }, 'ok'],
    ['old title fails', () => W('docs/reviews/prompt.md', '# Mandatory Adversarial Review Prompt: Wave A Remediation\n\nPrompt content.\n'), /must identify a unified adversarial audit prompt/],
  ];
  let psMs = 0, nodeMs = 0, mismatches = 0;
  try {
    for (const [label, mutate, expect] of steps) {
      mutate();
      let t = performance.now();
      const r = h.runPowerShell('validate-protocol.ps1', ['-Quiet'], root);
      const ps = performance.now() - t; psMs += ps;
      const psOut = (r.stdout || '') + (r.stderr || '');
      t = performance.now();
      const diag = gateForRoot(root);
      const node = performance.now() - t; nodeMs += node;
      const nodeFails = diag.filter(d => d.status === 'FAIL').map(d => d.message).sort();
      const psFails = psOut.split(/\r?\n/).filter(l => l.startsWith('[FAIL] ') && !l.includes('gate-check:')).map(l => l.slice(7)).sort();
      const psOk = expect === 'ok' ? r.status === 0 : (r.status === 1 && expect.test(psOut));
      const nodeOk = expect === 'ok' ? nodeFails.length === 0 : expect.test(diag.map(d => d.message).join('\n'));
      const same = JSON.stringify(psFails) === JSON.stringify(nodeFails);
      if (!psOk || !nodeOk || !same) mismatches++;
      console.log(`${psOk ? 'ok' : 'XX'} ${nodeOk ? 'ok' : 'XX'} ${same ? 'same' : 'DIFF'} ${String(Math.round(ps)).padStart(6)} ms ${node.toFixed(2).padStart(7)} ms  ${label}${same ? '' : `  ps=${JSON.stringify(psFails)} node=${JSON.stringify(nodeFails)}`}`);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
  console.log(`PowerShell ${Math.round(psMs)} ms, Node ${nodeMs.toFixed(1)} ms, steps ${steps.length}, mismatches ${mismatches}`);
  process.exitCode = mismatches ? 1 : 0;
}
