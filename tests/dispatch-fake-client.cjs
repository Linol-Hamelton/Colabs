'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const args = process.argv.slice(2);
const mode = args[0] || 'work';
const outdir = args[1] || '.';
const root = args[2] || '.';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const writeJournal = () => {
  const dir = path.join(root, '.ai', 'worklog');
  fs.mkdirSync(dir, { recursive: true });
  const journalFile = path.join(dir, 'gemini-0123456789abcdef.md');
  fs.writeFileSync(journalFile, '# Session journal\n\nEvidence: recorded\n', 'utf8');
};

const writeOutput = (content = 'result from fake client\n') => {
  const p = path.join(root, 'tests', 'fixtures', 'dispatch', 'out1.txt');
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
};

(async () => {
  switch (mode) {
    case 'work': {
      writeOutput();
      writeJournal();
      console.log('PROGRESS step 1 completed');
      console.log('PROGRESS step 2 completed');
      process.exit(0);
      break;
    }
    case 'auth-error': {
      console.log('Error: 401 Unauthorized - invalid credentials');
      process.exit(1);
      break;
    }
    case 'rate-limit': {
      console.log('HTTP 429 Too Many Requests - rate limit exceeded');
      process.exit(1);
      break;
    }
    case 'quota-exhausted': {
      console.log('Error: quota exceeded for current billing period; RESOURCE_EXHAUSTED');
      process.exit(1);
      break;
    }
    case 'model-unavailable': {
      console.log('Error: model gpt-unknown not found and does not exist');
      process.exit(1);
      break;
    }
    case 'network-error': {
      console.log('FetchError: ECONNRESET socket hang up network error');
      process.exit(1);
      break;
    }
    case 'provider-error': {
      console.log('HTTP 503 Service Unavailable: provider error overloaded');
      process.exit(1);
      break;
    }
    case 'process-crash': {
      writeOutput('partial work\n');
      console.log('PROGRESS useful progress line 1');
      process.exit(42);
      break;
    }
    case 'invalid-output-missing': {
      console.log('PROGRESS fake work without writing outputs');
      process.exit(0);
      break;
    }
    case 'invalid-output-empty': {
      writeOutput('');
      console.log('PROGRESS fake work writing 0 bytes');
      process.exit(0);
      break;
    }
    case 'silent': {
      await sleep(120000);
      process.exit(0);
      break;
    }
    case 'always-talking': {
      for (let i = 0; i < 300; i++) {
        console.log(`PROGRESS line ${i}`);
        await sleep(300);
      }
      process.exit(0);
      break;
    }
    case 'write-escape': {
      writeOutput();
      fs.writeFileSync(path.join(root, 'forbidden-escape.txt'), 'escaped write\n', 'utf8');
      writeJournal();
      process.exit(0);
      break;
    }
    case 'commit-escape': {
      writeOutput();
      writeJournal();
      spawnSync('git', ['add', '.'], { cwd: root });
      spawnSync('git', ['-c', 'user.name=Fake', '-c', 'user.email=fake@example.com', 'commit', '-m', 'unauthorized commit'], { cwd: root });
      process.exit(0);
      break;
    }
    case 'remote-escape': {
      writeOutput();
      writeJournal();
      spawnSync('git', ['remote', 'add', 'evil', 'https://example.com/evil.git'], { cwd: root });
      process.exit(0);
      break;
    }
    case 'push-escape': {
      writeOutput();
      writeJournal();
      const r = spawnSync('git', ['push', 'origin', 'HEAD'], { cwd: root, encoding: 'utf8' });
      console.log(`push result: ${r.status} ${r.stderr || ''}`);
      process.exit(0);
      break;
    }
    case 'env-dump': {
      writeOutput(JSON.stringify(process.env, null, 2));
      writeJournal();
      console.log('PROGRESS dumped env');
      process.exit(0);
      break;
    }
    case 'repair-mode': {
      const isResume = args.slice(1).some(a => a === '--resume' || a === '-r' || a.startsWith('--resume=') || a === 'resume' || a === '--session' || String(a).includes('dispatch-repair'));
      if (isResume) {
        writeOutput('repaired valid content\n');
        writeJournal();
        console.log('PROGRESS repair finished successfully');
        process.exit(0);
      } else {
        writeOutput('');
        console.log('SESSION_ID: fake-repair-session-1234');
        process.exit(0);
      }
      break;
    }
    case 'crash-resume': {
      const isResume = args.slice(1).some(a => a === '--resume' || a === '-r' || a.startsWith('--resume=') || a === 'resume' || a === '--session');
      if (isResume) {
        writeOutput('work completed after crash\n');
        writeJournal();
        console.log('PROGRESS crash resumed successfully');
        process.exit(0);
      } else {
        writeOutput('partial work\n');
        console.log('PROGRESS useful progress line 1');
        console.log('SESSION_ID: fake-crash-session-1234');
        process.exit(42);
      }
      break;
    }
    case 'stall-wake': {
      const hasWake = args.some(a => String(a).includes('wake.md'));
      const marker = path.join(os.tmpdir(), 'fake-stall-wakes.txt');
      let wakes = 0;
      try { wakes = parseInt(fs.readFileSync(marker, 'utf8'), 10) || 0; } catch {}
      if (hasWake) {
        wakes++;
        fs.writeFileSync(marker, String(wakes), 'utf8');
        console.log('SESSION_ID: fake-stall-session-1234');
        console.log(`PROGRESS wake ${wakes} acknowledged`);
        await sleep(120000);
      } else {
        try { fs.unlinkSync(marker); } catch {}
        console.log('SESSION_ID: fake-stall-session-1234');
        await sleep(120000);
      }
      process.exit(0);
      break;
    }
    case 'transient-retry': {
      const marker = path.join(os.tmpdir(), 'fake-transient.txt');
      if (!fs.existsSync(marker)) {
        fs.writeFileSync(marker, '1', 'utf8');
        console.log('HTTP 429 Too Many Requests: rate limit exceeded');
        process.exit(1);
      } else {
        try { fs.unlinkSync(marker); } catch {}
        writeOutput();
        writeJournal();
        console.log('PROGRESS succeeded on retry');
        process.exit(0);
      }
      break;
    }
    default: {
      console.error(`unknown fake client mode: ${mode}`);
      process.exit(2);
    }
  }
})();
