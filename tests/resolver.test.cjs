'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const dispatch = require('../.ai/bin/protocol-dispatch.cjs');

test('AC-1: ladder file matches S2 for every rung; stale sectionSha256 exits 1 ladder-stale', () => {
  const repoRoot = path.resolve(__dirname, '..');
  const ladderPath = path.resolve(repoRoot, 'docs/ops/model-ladder.json');
  assert.ok(fs.existsSync(ladderPath), 'docs/ops/model-ladder.json must exist');

  const ladder = dispatch.loadLadder(ladderPath, repoRoot);
  assert.equal(ladder.schema, 'ladder/1');
  assert.equal(ladder.rungs.length, 11, 'ladder must contain 11 rungs');

  // Verify section sha256 check
  const check = dispatch.verifyLadderSectionSha256(ladder, repoRoot);
  assert.ok(check.ok, 'sectionSha256 must match MODEL-ECONOMICS.md ladder section');

  // Stale sectionSha256 test
  const fakeLadder = JSON.parse(JSON.stringify(ladder));
  fakeLadder.source.sectionSha256 = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const checkStale = dispatch.verifyLadderSectionSha256(fakeLadder, repoRoot);
  assert.equal(checkStale.ok, false, 'tampered sectionSha256 must fail verification');

  // Verify CLI exits 1 with ladder-stale
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-ladder-stale-'));
  const staleLadderPath = path.join(tmp, 'stale-ladder.json');
  fs.writeFileSync(staleLadderPath, JSON.stringify(fakeLadder, null, 2), 'utf8');

  const r = spawnSync(process.execPath, [
    path.resolve(repoRoot, '.ai/bin/protocol-dispatch.cjs'),
    'resolve',
    'tests/fixtures/resolver/real-ladder.json',
    'floor-t3-other',
    '--ladder',
    staleLadderPath
  ], { cwd: repoRoot, encoding: 'utf8' });

  assert.equal(r.status, 1);
  assert.ok(r.stdout.includes('ERROR reason=ladder-stale'), 'must emit ERROR reason=ladder-stale');

  fs.rmSync(tmp, { recursive: true, force: true });
});

test('AC-2: fixture ladder, floor T3, no exclusions: primary is largest rung number, substitutes go up in order', () => {
  const repoRoot = path.resolve(__dirname, '..');
  const ladder = dispatch.loadLadder('tests/fixtures/resolver/fixture-ladder.json', repoRoot);
  const disp = dispatch.loadDispatch('tests/fixtures/resolver/fixture-dispatch.json');
  const slot = disp.slots.find(s => s.id === 'slot-ac2-no-exclusions');
  assert.ok(slot, 'slot-ac2-no-exclusions must exist');

  const res = dispatch.resolveSlot(slot, ladder, {}, { skipProbe: true });
  assert.equal(res.selection, 'resolver');
  assert.ok(res.primary, 'primary must be selected');

  // Admissible rungs from fixture-ladder:
  // Rung 5 (order 5), Rung 4 (order 4), Rung 3 (order 3), Rung 2 (order 2), Rung 1 (order 1)
  // Largest rung is Rung 5
  assert.equal(res.primary.rung, 5);
  assert.equal(res.primary.model, 'model-5');

  // Substitutes go up ladder: decreasing rung number
  assert.equal(res.substitutes.length, 2);
  assert.equal(res.substitutes[0].rung, 4);
  assert.equal(res.substitutes[1].rung, 3);
});

test('AC-3: each exclusion reason produced by its own fixture', () => {
  const repoRoot = path.resolve(__dirname, '..');
  const ladder = dispatch.loadLadder('tests/fixtures/resolver/fixture-ladder.json', repoRoot);
  const disp = dispatch.loadDispatch('tests/fixtures/resolver/fixture-dispatch.json');

  // 1. route-unknown (Rung 6 has client kilo, model null)
  const slotAll = { id: 'slot-all', launch: 'tests/fixtures/resolver/launch.md', role: 'test', floor: 'T1', long: false };
  const resAll = dispatch.resolveSlot(slotAll, ladder, {}, { skipProbe: true });
  const routeUnknown = resAll.excluded.find(e => e.reason === 'route-unknown');
  assert.ok(routeUnknown, 'route-unknown must be produced');
  assert.equal(routeUnknown.rung, 6);

  // 2. context-window (Rung 7 has contextWindow: 1000, contextMin: 5000)
  const slotCtx = disp.slots.find(s => s.id === 'slot-ac3-context');
  const resCtx = dispatch.resolveSlot(slotCtx, ladder, {}, { skipProbe: true });
  const ctxEx = resCtx.excluded.find(e => e.reason === 'context-window');
  assert.ok(ctxEx, 'context-window must be produced');
  assert.equal(ctxEx.rung, 7);

  // 3. below-floor (Rung 8 has tiers: [2], floor T3)
  const slotFloor = disp.slots.find(s => s.id === 'slot-ac2-no-exclusions');
  const resFloor = dispatch.resolveSlot(slotFloor, ladder, {}, { skipProbe: true });
  const belowFloor = resFloor.excluded.find(e => e.reason === 'below-floor');
  assert.ok(belowFloor, 'below-floor must be produced');
  assert.equal(belowFloor.rung, 8);

  // 4. tier-unknown (Rung 9 has tiers: [])
  const tierUnknown = resAll.excluded.find(e => e.reason === 'tier-unknown');
  assert.ok(tierUnknown, 'tier-unknown must be produced');
  assert.equal(tierUnknown.rung, 9);

  // 5. independence (slot-ac3-independence excludes model-5, fam-4, Google)
  const slotIndep = disp.slots.find(s => s.id === 'slot-ac3-independence');
  const resIndep = dispatch.resolveSlot(slotIndep, ladder, {}, { skipProbe: true });
  const indepEx = resIndep.excluded.filter(e => e.reason === 'independence');
  assert.ok(indepEx.length >= 3, 'independence exclusions must be produced');

  // 6. needs-approval (Rung 10 has approval: owner-long-task, slot long: true, no approval)
  const slotAppr = disp.slots.find(s => s.id === 'slot-ac3-needs-approval');
  const resAppr = dispatch.resolveSlot(slotAppr, ladder, {}, { skipProbe: true });
  const needsAppr = resAppr.skipped.find(s => s.reason === 'needs-approval');
  assert.ok(needsAppr, 'needs-approval must be produced');
  assert.equal(needsAppr.rung, 10);

  // When approved, it is kept!
  const slotGranted = disp.slots.find(s => s.id === 'slot-ac3-approved');
  const resGranted = dispatch.resolveSlot(slotGranted, ladder, {}, { skipProbe: true });
  assert.ok(!resGranted.skipped.some(s => s.rung === 10 && s.reason === 'needs-approval'), 'approved rung must not be skipped');

  // 7. unavailable (Rung 11 client absent-client-binary fails probe)
  const resUnavail = dispatch.resolveSlot(slotAll, ladder, {}, {
    probeFn: (client) => ({ ok: client !== 'absent-client-binary', state: client === 'absent-client-binary' ? 'ABSENT' : 'OK' })
  });
  const unavail = resUnavail.skipped.find(s => s.reason === 'unavailable');
  assert.ok(unavail, 'unavailable must be produced');
  assert.equal(unavail.rung, 11);
});

test('AC-4: null context window produces UNVERIFIED row and keeps the rung', () => {
  const repoRoot = path.resolve(__dirname, '..');
  const ladder = dispatch.loadLadder('tests/fixtures/resolver/fixture-ladder.json', repoRoot);
  const disp = dispatch.loadDispatch('tests/fixtures/resolver/fixture-dispatch.json');
  const slotCtx = disp.slots.find(s => s.id === 'slot-ac3-context');

  const res = dispatch.resolveSlot(slotCtx, ladder, {}, { skipProbe: true });
  assert.ok(res.unverified.length > 0, 'must produce UNVERIFIED entries');
  const unvRung1 = res.unverified.find(u => u.rung === 1);
  assert.ok(unvRung1, 'Rung 1 (null contextWindow) must produce UNVERIFIED row');
  assert.equal(unvRung1.constraint, 'contextMin');
  assert.ok(res.admissible.some(r => r.rung === 1), 'Rung 1 must be kept in admissible list');
});

test('AC-5: shortfall: kernel or certification exits 1 ASK_OWNER; other starts and records shortfall', () => {
  const repoRoot = path.resolve(__dirname, '..');
  const ladder = dispatch.loadLadder('tests/fixtures/resolver/fixture-ladder.json', repoRoot);
  const disp = dispatch.loadDispatch('tests/fixtures/resolver/fixture-dispatch.json');

  // slot-ac5-shortfall-kernel (floor T6 only has Rung 5, needed substitutes: 2, actual: 0)
  const slotKernel = disp.slots.find(s => s.id === 'slot-ac5-shortfall-kernel');
  const resKernel = dispatch.resolveSlot(slotKernel, ladder, {}, { skipProbe: true });
  assert.equal(resKernel.terminal, 'shortfall');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'resolver-ac5-'));
  const testRegPath = path.join(tmp, 'clients.json');
  fs.writeFileSync(testRegPath, JSON.stringify({
    schema: 'clients/1',
    clients: {
      codex: {
        binary: 'node',
        present: true,
        version: process.version,
        verifiedOn: '2026-09-26',
        source: 'node --version',
        command: ['node', '-e', 'process.exit(0)'],
        model: { how: 'none', listing: null },
        effort: { how: 'none', values: null, note: null },
        env: {},
        resume: { command: null, sessionId: null, note: 'none' },
        usage: 'none',
        failureModes: []
      }
    }
  }), 'utf8');

  try {
    // CLI execution on kernel shortfall exits 1 with ASK_OWNER
    const rK = spawnSync(process.execPath, [
      path.resolve(repoRoot, '.ai/bin/protocol-dispatch.cjs'),
      'resolve',
      'tests/fixtures/resolver/fixture-dispatch.json',
      'slot-ac5-shortfall-kernel',
      '--ladder',
      'tests/fixtures/resolver/fixture-ladder.json',
      '--registry',
      testRegPath
    ], { cwd: repoRoot, encoding: 'utf8' });
    assert.equal(rK.status, 1);
    assert.ok(rK.stdout.includes('ASK_OWNER reason=shortfall'), 'must emit ASK_OWNER reason=shortfall');

    // slot-ac5-shortfall-other (stageKind other proceeds with shortfall recorded)
    const slotOther = disp.slots.find(s => s.id === 'slot-ac5-shortfall-other');
    const resOther = dispatch.resolveSlot(slotOther, ladder, {}, { skipProbe: true });
    assert.equal(resOther.terminal, null);
    assert.ok(resOther.shortfall.includes('shortfall='), 'must record shortfall description');

    const rO = spawnSync(process.execPath, [
      path.resolve(repoRoot, '.ai/bin/protocol-dispatch.cjs'),
      'resolve',
      'tests/fixtures/resolver/fixture-dispatch.json',
      'slot-ac5-shortfall-other',
      '--ladder',
      'tests/fixtures/resolver/fixture-ladder.json',
      '--registry',
      testRegPath
    ], { cwd: repoRoot, encoding: 'utf8' });
    assert.equal(rO.status, 0);
    assert.ok(rO.stdout.includes('RESOLVE slot=slot-ac5-shortfall-other'), 'must print RESOLVE');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('AC-6: slot with route never runs the resolver (selection = owner)', () => {
  const repoRoot = path.resolve(__dirname, '..');
  const ladder = dispatch.loadLadder('tests/fixtures/resolver/fixture-ladder.json', repoRoot);
  const disp = dispatch.loadDispatch('tests/fixtures/resolver/fixture-dispatch.json');
  const slotOwner = disp.slots.find(s => s.id === 'slot-ac6-owner-selection');

  const res = dispatch.resolveSlot(slotOwner, ladder, {});
  assert.equal(res.selection, 'owner');
  assert.equal(res.primary.client, 'claude');
  assert.equal(res.primary.model, 'claude-opus-5-5');
  assert.equal(res.substitutes.length, 1);
  assert.equal(res.substitutes[0].client, 'codex');
  assert.equal(res.excluded.length, 0);
  assert.equal(res.skipped.length, 0);
  assert.equal(res.unverified.length, 0);
});

test('AC-15: real-ladder cross-check with all clients live', () => {
  const repoRoot = path.resolve(__dirname, '..');
  const ladder = dispatch.loadLadder('docs/ops/model-ladder.json', repoRoot);
  const disp = dispatch.loadDispatch('tests/fixtures/resolver/real-ladder.json');

  const slotKernel = disp.slots.find(s => s.id === 'floor-t7-kernel');
  const slotOther = disp.slots.find(s => s.id === 'floor-t3-other');

  // Test with all clients simulated live (probeFn returning ok: true)
  const mockLiveProbe = () => ({ ok: true, state: 'OK' });

  // 1. floor-t7-kernel
  const resK = dispatch.resolveSlot(slotKernel, ladder, {}, { probeFn: mockLiveProbe });
  assert.equal(resK.primary.label, 'Mistral Medium 3.5');
  assert.equal(resK.primary.rung, 9);
  assert.equal(resK.substitutes.length, 1);
  assert.equal(resK.substitutes[0].label, 'Gemini 3.8 High');
  assert.equal(resK.substitutes[0].rung, 5);
  assert.equal(resK.terminal, 'shortfall');

  // Verify exclusions
  const tierUnkK = resK.excluded.filter(e => e.reason === 'tier-unknown').map(e => e.label);
  assert.ok(tierUnkK.includes('GPT-5.6 Sol Medium'));
  assert.ok(tierUnkK.includes('GPT-5.6 Terra High'));
  assert.ok(tierUnkK.includes('Gemini 3.6 High'));

  const belowFloorK = resK.excluded.filter(e => e.reason === 'below-floor').map(e => e.label);
  assert.ok(belowFloorK.includes('Opus 5.5 XHigh'));
  assert.ok(belowFloorK.includes('Opus 5.5 High'));
  assert.ok(belowFloorK.includes('Opus 5.5 Medium'));
  assert.ok(belowFloorK.includes('GPT-5.6 Luna XHigh'));
  assert.ok(belowFloorK.includes('Gemini 3.7 High'));

  const routeUnkK = resK.excluded.find(e => e.reason === 'route-unknown');
  assert.equal(routeUnkK.label, 'DeepSeek V4.1 Max');

  // 2. floor-t3-other
  const resO = dispatch.resolveSlot(slotOther, ladder, {}, { probeFn: mockLiveProbe });
  assert.equal(resO.primary.label, 'Mistral Medium 3.5');
  assert.equal(resO.primary.rung, 9);
  assert.equal(resO.substitutes.length, 2);
  assert.equal(resO.substitutes[0].label, 'Gemini 3.7 High');
  assert.equal(resO.substitutes[0].rung, 7);
  assert.equal(resO.substitutes[1].label, 'GPT-5.6 Luna XHigh');
  assert.equal(resO.substitutes[1].rung, 6);
  assert.equal(resO.terminal, null);
});
