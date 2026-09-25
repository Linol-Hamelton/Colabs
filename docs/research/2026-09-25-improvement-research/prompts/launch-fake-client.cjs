'use strict';

// Fake client for launch-test.cjs: behaves like a CLI that fails, hangs, works or crashes.
// usage: node launch-fake-client.cjs <mode> <outdir>. Calls no model and touches only <outdir>.

const fs = require('node:fs');
const path = require('node:path');

const [mode, out] = process.argv.slice(2);
const write = (n, text) => fs.writeFileSync(path.join(out, `f${n}.md`), text);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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
    default: process.exit(9);
  }
})();
