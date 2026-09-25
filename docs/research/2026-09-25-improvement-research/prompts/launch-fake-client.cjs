'use strict';

// Fake client for launch-test.cjs: behaves like a CLI that fails, hangs, works or crashes.
// usage: node launch-fake-client.cjs <mode> <outdir>. Calls no model and touches only <outdir>.

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const [mode, out, root, bare] = process.argv.slice(2);
const write = (n, text) => { fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(path.join(out, `f${n}.md`), text); };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
// A detached grandchild that outlives this process, as a client's helper may (CB-17, CB-24).
const orphan = () => {
  const c = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 60000)'], { detached: true, stdio: 'ignore', windowsHide: true });
  c.unref(); fs.writeFileSync(path.join(out, 'orphan.pid'), String(c.pid));
};

(async () => {
  switch (mode) {
    case 'fail': console.log('Error: 401 Unauthorized - not logged in'); process.exit(1); break;
    case 'ratelimit-hang': console.log('stream error: 429 rate limit exceeded'); await sleep(60000); break;
    case 'ratelimit-loop': for (let i = 0; i < 300; i += 1) { console.log('stream error: 429 rate limit exceeded; retrying in 1s'); await sleep(700); } process.exit(1); break;
    case 'work': for (let i = 1; i <= 2; i += 1) { await sleep(1000); write(i, `part ${i}\n`); console.log(`wrote ${i}`); } process.exit(0); break;
    case 'work-hang': write(1, 'part 1\n'); await sleep(60000); break;
    case 'cpu-then-work': { const end = Date.now() + 8000; let x = 0; while (Date.now() < end) x += Math.sqrt(x + 1); write(1, 'a\n'); write(2, 'b\n'); process.exit(0); break; }
    case 'work-crash': write(1, 'part 1\n'); await sleep(500); process.exit(3); break;
    case 'exit0-nothing': process.exit(0); break;
    // Lives long enough for the watchdog's first scans to see the grandchild, even under the load of
    // the whole self-test on Windows, where one process-table read can take seconds.
    case 'orphan-exit': orphan(); write(1, 'a\n'); write(2, 'b\n'); await sleep(6000); process.exit(0); break;
    case 'orphan-hang': orphan(); write(1, 'a\n'); await sleep(3000); process.exit(0); break;
    case 'orphan-hang-long': orphan(); write(1, 'a\n'); await sleep(9000); process.exit(0); break;
    // F-L1, F-L2: adds a remote and creates a branch in the copy it runs in, as a push would need.
    case 'git-escape': {
      write(1, 'a\n');
      const { spawnSync } = require('node:child_process');
      spawnSync('git', ['-C', root, 'remote', 'add', 'evil', path.join(require('node:os').tmpdir(), 'zz-evil.git')]);
      spawnSync('git', ['-C', root, 'update-ref', 'refs/heads/zz-probe', 'HEAD']);
      await sleep(8000); process.exit(0); break;
    }
    // Item 4: push through the known `-c` insteadOf residual (prevention-impossible by config), so
    // that only the audit can see it; and the same push reverted, the audit's named blind.
    case 'push-bypass':
    case 'push-transient': {
      write(1, 'a\n'); write(2, 'b\n');
      const { execFileSync } = require('node:child_process');
      const url = `file:///${String(bare).replace(/\\/g, '/')}`;
      const push = args => execFileSync('git', ['-c', `url.${url}.insteadOf=no-push://blocked`, 'push', '-q', 'no-push://blocked', ...args], { cwd: root, stdio: 'ignore' });
      if (mode === 'push-bypass') push(['HEAD:refs/heads/zz-bypass']);
      else { push(['HEAD:refs/heads/zz-transient']); push([':refs/heads/zz-transient']); }
      await sleep(800); process.exit(0); break;
    }
    // Item 6 (M-1): hold .git/index.lock briefly (clears before the bounded retries give up) and
    // permanently (the launcher must stop with "stale index.lock" and keep the copy).
    case 'index-lock-brief': {
      const lock = path.join(root, '.git', 'index.lock');
      fs.writeFileSync(lock, '');
      await sleep(1200);
      try { fs.rmSync(lock, { force: true }); } catch { /* gone */ }
      write(1, 'a\n'); write(2, 'b\n'); process.exit(0); break;
    }
    case 'index-lock-permanent': {
      fs.writeFileSync(path.join(root, '.git', 'index.lock'), '');
      write(1, 'a\n'); write(2, 'b\n'); await sleep(1500); process.exit(0); break;
    }
    // Item 2: dump the job environment and the effective git config of the copy it runs in.
    case 'env-dump': {
      write(1, `${JSON.stringify(process.env, null, 1)}\n`);
      const { spawnSync } = require('node:child_process');
      const r = spawnSync('git', ['config', '--show-origin', '-l'], { cwd: root, encoding: 'utf8' });
      write(2, `${r.stdout || ''}${r.stderr || ''}`);
      process.exit(0); break;
    }
    // PROTO-DEC-0070: writes its output, then a file outside its scope in the copy it runs in.
    case 'escape': write(1, 'a\n'); fs.mkdirSync(path.join(root, 'OwnerIdeas'), { recursive: true }); fs.writeFileSync(path.join(root, 'OwnerIdeas', 'zz-escape.md'), 'x\n'); await sleep(8000); process.exit(0); break;
    default: process.exit(9);
  }
})();
