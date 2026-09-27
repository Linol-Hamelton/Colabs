'use strict';

// protocol-core.cjs (SPEC-protocol-core.md, CORE-ARCH package I-a). Each check is bound to the
// failure that would have caught a real defect (spec section 3 golden corpus), plus the invalid
// examples of procedure.schema.md section 5 and the fail-closed rules of PROTO-DEC-0047 item 8.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { repoRoot, run, makeProtocolFixture, runPowerShell, write } = require('./helpers.cjs');

const TOOL = path.join(repoRoot, '.ai', 'bin', 'protocol-core.cjs');
const core = (cwd, ...args) => {
  const r = run(process.execPath, [TOOL, ...args], cwd);
  return { status: r.status, out: r.stdout + r.stderr };
};

const HEADINGS = ['Purpose', 'Rules', 'Steps', 'Stop conditions', 'Back edges', 'Evidence', 'Risks', 'Change log'];
function record(fields, { headings = HEADINGS, rules = ['- R-L2-900.1. A rule.'] } = {}) {
  const fm = Object.entries(fields).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n');
  const body = headings.map(h => (h === 'Rules' ? `## Rules\n\n${rules.join('\n')}\n` : `## ${h}\n\nText.\n`)).join('\n');
  return `---\n${fm}\n---\n\n# Record\n\n${body}`;
}
const VALID = {
  id: 'P-L2-900', version: '0.1', title: 'A test procedure', layer: 'L2', type: 'procedure', status: 'draft',
  roles: '[implementer]', stages: '[execute]', triggers: '[owner-directive]', inputs: '[task-frame]', outputs: '[journal]',
  back_edges: '[]', enforcement: 'P', script_candidate: 'no:1', evidence_class: '[A]', evidence: '[PROTO-DEC-0001]',
};

// A throwaway repository root: manifest marker, decision headings, content lines to cite.
function corpus(t, files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'colabs-core-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }));
  const put = (rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };
  put('protocol-manifest.json', '{}\n');
  put('.ai/DECISIONS.md', '# Decisions\n\n### PROTO-DEC-0001\n\nStatus: Accepted\n\n### PROTO-DEC-0002\n\nStatus: Superseded by PROTO-DEC-0001\n');
  put('docs/notes.md', '# Notes\n\nA content line.\n\nAnother content line.\n');
  for (const [rel, text] of Object.entries(files)) put(rel, text);
  return root;
}
const lintOne = (t, fields, options) => {
  const root = corpus(t, { '.ai/core/P-L2-900.md': record({ ...VALID, ...fields }, options) });
  return core(root, 'lint', '.ai/core');
};

test('a well-formed record passes lint', t => {
  const r = lintOne(t, {});
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /^LINT /m);
  assert.match(r.out, /^RESULT exit=0 findings=0/m);
});

test('schema section 5 invalid examples produce the documented exit codes', t => {
  for (const [fields, exit, code] of [
    [{ roles: 'certifier' }, 2, 'F6'],
    [{ status: 'approved' }, 2, 'F4'],
    [{ enforcement: 'S' }, 1, 'F3'],
    [{ evidence_class: '[B]' }, 1, 'F3'],
    [{ evidence: '[we saw this often]' }, 2, 'F6'],
  ]) {
    const r = lintOne(t, fields);
    assert.equal(r.status, exit, `${JSON.stringify(fields)}\n${r.out}`);
    assert.match(r.out, new RegExp(`code=${code} `), r.out);
  }
  const root = corpus(t, { '.ai/core/x.md': record(VALID).replace('roles: [implementer]', 'roles:\n  - implementer') });
  const nested = core(root, 'lint', '.ai/core');
  assert.equal(nested.status, 2, nested.out);
  assert.match(nested.out, /code=F1 /);
});

test('golden corpus: CA-01 root without invariant keys, CA-02 class B without cost, CA-03 unknown artifact', t => {
  const rootRecord = record({ id: 'P-L0-000', version: '0.1', title: 'Root', layer: 'L0', type: 'invariant', status: 'draft', evidence_class: '[A]', evidence: '[PROTO-DEC-0001]' },
    { headings: ['Purpose', 'Rules', 'Evidence', 'Change log'], rules: ['R-L0-01. A root rule.'] });
  const ca01 = core(corpus(t, { '.ai/core/L0-ROOT.md': rootRecord }), 'lint', '.ai/core');
  assert.equal(ca01.status, 1, ca01.out);
  assert.match(ca01.out, /code=F2 .*value=roles/);
  const ca02 = lintOne(t, { evidence_class: '[B, C]' });
  assert.equal(ca02.status, 1, ca02.out);
  assert.match(ca02.out, /code=F3 .*value=cost_basis/);
  const ca03 = lintOne(t, { inputs: '[task-frame, packet-spec]' });
  assert.equal(ca03.status, 2, ca03.out);
  assert.match(ca03.out, /code=F5 .*value=packet-spec/);
});

test('golden corpus: CA-06 back edge without budget, CA-S1 without source, S-003 path in supersedes', t => {
  for (const [fields, value] of [
    [{ back_edges: '[7>4/owner]' }, '7>4/owner'],
    [{ back_edges: '[>4/2/owner]' }, '>4/2/owner'],
    [{ supersedes: '[docs/core-arch/stage-1/S-003.md]' }, 'docs/core-arch/stage-1/S-003.md'],
  ]) {
    const r = lintOne(t, fields);
    assert.equal(r.status, 2, r.out);
    assert.match(r.out, /code=F6 /);
    assert.ok(r.out.includes(value), r.out);
  }
});

test('headings: missing and misordered required headings fail with exit 1 (F7)', t => {
  const missing = lintOne(t, {}, { headings: HEADINGS.filter(h => h !== 'Risks') });
  assert.equal(missing.status, 1, missing.out);
  assert.match(missing.out, /code=F7 .*Risks/);
  const order = [...HEADINGS];
  [order[5], order[6]] = [order[6], order[5]];
  const misordered = lintOne(t, {}, { headings: order });
  assert.equal(misordered.status, 1, misordered.out);
  assert.match(misordered.out, /out of order/);
});

test('an active record needs owner_approval and decision (F8)', t => {
  const r = lintOne(t, { status: 'active' });
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /code=F8 /);
  const ok = lintOne(t, { status: 'active', owner_approval: 'PROTO-DEC-0001', decision: '[PROTO-DEC-0001]' });
  assert.equal(ok.status, 0, ok.out);
});

test('rule ids are anchored and defined once (F9)', t => {
  const unanchored = lintOne(t, {}, { rules: ['- R-L2-777.1. Wrong anchor.'] });
  assert.equal(unanchored.status, 2, unanchored.out);
  assert.match(unanchored.out, /code=F9 .*anchored as R-L2-900/);
  const bare = lintOne(t, {}, { rules: ['- A rule without an id.'] });
  assert.equal(bare.status, 2, bare.out);
  const twice = corpus(t, {
    '.ai/core/a.md': record(VALID),
    '.ai/core/b.md': record({ ...VALID, id: 'P-L2-901' }, { rules: ['- R-L2-901.1. Own.', '- R-L2-900.1. Stolen.'] }),
  });
  const r = core(twice, 'lint', '.ai/core');
  assert.equal(r.status, 2, r.out);
  assert.match(r.out, /also defined at/);
  const orphan = corpus(t, {
    '.ai/core/L0-ROOT.md': record({ id: 'P-L0-000', version: '0.1', title: 'Root', layer: 'L0', type: 'invariant', status: 'draft', roles: '[all]', stages: '[any]', triggers: '[session-start]', enforcement: 'P', script_candidate: 'no:4', evidence_class: '[A]', evidence: '[PROTO-DEC-0001]' },
      { headings: ['Purpose', 'Rules', 'Evidence', 'Change log'], rules: ['R-L0-01. Root rule.'] }),
    '.ai/core/p.md': record({ ...VALID, id: 'P-L0-901', layer: 'L0' }, { rules: ['- R-L0-02.1. No root rule 02.'] }),
  });
  const o = core(orphan, 'lint', '.ai/core');
  assert.equal(o.status, 2, o.out);
  assert.match(o.out, /root rule R-L0-02 is not defined/);
});

test('G7: garbage input and unlisted files never pass silently; unknown flags exit 2', t => {
  const garbage = core(corpus(t, { '.ai/core/x.md': '---\n{ not: front matter\n---\n' }), 'lint', '.ai/core');
  assert.equal(garbage.status, 2, garbage.out);
  const bare = core(corpus(t, { '.ai/core/notes.md': '# No front matter\n' }), 'lint', '.ai/core');
  assert.equal(bare.status, 2, bare.out);
  const flag = core(repoRoot, 'lint', '.ai/core', '--fast');
  assert.equal(flag.status, 2, flag.out);
  assert.match(flag.out, /^ERROR reason="unknown flag --fast"/m);
  const command = core(repoRoot, 'deploy');
  assert.equal(command.status, 2, command.out);
  const missing = core(repoRoot, 'lint', 'no/such/dir');
  assert.equal(missing.status, 2, missing.out);
});

test('catalog is deterministic, --check writes nothing, and a changed record makes it stale', t => {
  const root = corpus(t, { '.ai/core/a.md': record(VALID), '.ai/core/b.md': record({ ...VALID, id: 'P-L2-901' }, { rules: ['- R-L2-901.1. B.'] }) });
  const missing = core(root, 'catalog', '--root', '.ai/core', '--check');
  assert.equal(missing.status, 1, missing.out);
  assert.equal(fs.existsSync(path.join(root, '.ai/core/CATALOG.md')), false);
  assert.equal(core(root, 'catalog', '--root', '.ai/core').status, 0);
  const first = fs.readFileSync(path.join(root, '.ai/core/CATALOG.md'), 'utf8');
  assert.equal(core(root, 'catalog', '--root', '.ai/core').status, 0);
  assert.equal(fs.readFileSync(path.join(root, '.ai/core/CATALOG.md'), 'utf8'), first);
  assert.match(first, /\| P-L2-900 \| 0\.1 \| L2 \| procedure \| draft \|/);
  assert.equal(core(root, 'catalog', '--root', '.ai/core', '--check').status, 0);
  fs.appendFileSync(path.join(root, '.ai/core/a.md'), '\nMore text.\n');
  const stale = core(root, 'catalog', '--root', '.ai/core', '--check');
  assert.equal(stale.status, 1, stale.out);
  assert.match(stale.out, /state=stale/);
});

test('check-links: dangling ids, missing decisions, blank and heading lines fail (CA-08)', t => {
  const cite = line => lintFree({ evidence: `[docs/notes.md:${line}]` });
  function lintFree(fields) {
    const root = corpus(t, { '.ai/core/a.md': record({ ...VALID, ...fields }) });
    return core(root, 'check-links', '--root', '.ai/core', '--strict');
  }
  assert.equal(cite(3).status, 0, cite(3).out);
  for (const [line, reason] of [[2, /blank/], [1, /heading/], [99, /beyond/]]) {
    const r = cite(line);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, reason);
  }
  const dec = lintFree({ evidence: '[PROTO-DEC-0099]' });
  assert.equal(dec.status, 1, dec.out);
  assert.match(dec.out, /^DANGLING .*ref=PROTO-DEC-0099/m);
  const root = corpus(t, { '.ai/core/a.md': record(VALID).replace('Text.', 'See P-L2-777 for details.') });
  const id = core(root, 'check-links', '--root', '.ai/core', '--strict');
  assert.equal(id.status, 1, id.out);
  assert.match(id.out, /^DANGLING .*ref=P-L2-777/m);
});

test('lcc prints the journal line of P-L0-004 and fails on a superseded decision (LCC-3)', t => {
  const root = corpus(t, { '.ai/core/a.md': record({ ...VALID, evidence: '[PROTO-DEC-0002]' }) });
  const r = core(root, 'lcc', 'L2', '--root', '.ai/core', '--strict');
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /^JOURNAL line="LCC: L2 \| 1=pass \| 2=pass \| 3=fail:PROTO-DEC-0002 \| 4=pass \| 5=pass \| 6=pass \| 7=manual \| 8=pass \| 9=pass"/m);
  assert.equal(core(root, 'lcc', 'L11').status, 2);
});

test('the landed kernel verifies: lint, fresh catalog and resolvable references', () => {
  const r = core(repoRoot, 'verify');
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /^CHECK name=lint exit=0/m);
  assert.match(r.out, /^CHECK name=catalog exit=0/m);
  assert.match(r.out, /^CHECK name=check-links exit=0/m);
  // L0 lands before L1-L2: its forward references are PENDING in design mode. The package I-a
  // freeze runs --strict, which passes only once the referenced L1/L2 records have landed.
  const design = core(repoRoot, 'lcc', 'L0', '--design');
  assert.equal(design.status, 0, design.out);
  assert.match(design.out, /^JOURNAL line="LCC: L0 \| 1=pass \| 2=pass \| 3=pass \| 4=pass \| 5=pass \| 6=pass \| 7=manual \| 8=pass \| 9=pass"/m);
  const strict = core(repoRoot, 'lcc', 'L0', '--strict');
  assert.equal(strict.status, 1, strict.out);
  assert.match(strict.out, /LCC-2 result=fail:.*P-L0-009/);
});

test('the validator fails when a kernel record breaks the schema, and passes a clean kernel', t => {
  const root = makeProtocolFixture(t, { realValidator: true });
  assert.ok(fs.existsSync(path.join(root, '.ai/core/L0-ROOT.md')), 'fixtures carry the kernel');
  const clean = runPowerShell('validate-protocol.ps1', ['-Quiet'], root);
  assert.equal(clean.status, 0, clean.stdout + clean.stderr);
  const file = path.join(root, '.ai/core/L0-meta/P-L0-005-decision-change.md');
  write(root, '.ai/core/L0-meta/P-L0-005-decision-change.md', fs.readFileSync(file, 'utf8').replace('status: active', 'status: approved'));
  const broken = runPowerShell('validate-protocol.ps1', ['-Quiet'], root);
  assert.equal(broken.status, 1, broken.stdout + broken.stderr);
  assert.match(broken.stdout + broken.stderr, /\[FAIL\] kernel: FINDING code=F4 /);
  assert.match(broken.stdout + broken.stderr, /\[FAIL\] kernel: STALE /);
});
