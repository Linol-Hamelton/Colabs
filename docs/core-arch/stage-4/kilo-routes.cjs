'use strict';

// Records the Kilo routes of every ranked model of MODEL-MATRIX.md, from the local Kilo
// catalog. Read-only: runs `kilo models <provider> --verbose` and writes kilo-routes.json
// beside this file. A research-program aid under P-L3-002 and P-L3-004 (drafts), not kernel code.
//
//   node docs/core-arch/stage-4/kilo-routes.cjs          refresh kilo-routes.json
//   node docs/core-arch/stage-4/kilo-routes.cjs --print  print the table without writing

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const OUT = path.join(__dirname, 'kilo-routes.json');
const PROVIDERS = ['google', 'openai', 'openrouter', 'vercel', 'huggingface', 'openai-compatible'];
// Maker's own provider inside Kilo (P-L3-004 R-L3-004.2: first among equal prices).
const OWN = { anthropic: [], openai: ['openai'], google: ['google'], deepseek: ['openai-compatible'], mistral: [], xai: [], moonshot: [], microsoft: [] };
// Pinned ids only: no "~...-latest" aliases, no "-fast" or "-pro" serving variants (R-L3-004.3).
const MODELS = {
  'claude-fable-5-1': { maker: 'anthropic', ids: ['openrouter/anthropic/claude-fable-5.1', 'vercel/anthropic/claude-fable-5.1'] },
  'claude-opus-5-5': { maker: 'anthropic', ids: ['openrouter/anthropic/claude-opus-5.5', 'vercel/anthropic/claude-opus-5.5'] },
  'claude-haiku-4-5': { maker: 'anthropic', ids: ['openrouter/anthropic/claude-haiku-4.5', 'vercel/anthropic/claude-haiku-4.5'] },
  'gpt-6-astra': { maker: 'openai', ids: ['openai/gpt-6-astra', 'openrouter/openai/gpt-6-astra', 'vercel/openai/gpt-6-astra'] },
  'gpt-5.6-sol': { maker: 'openai', ids: ['openai/gpt-5.6-sol', 'openrouter/openai/gpt-5.6-sol', 'vercel/openai/gpt-5.6-sol'] },
  'gpt-5.6-luna': { maker: 'openai', ids: ['openai/gpt-5.6-luna', 'openrouter/openai/gpt-5.6-luna', 'vercel/openai/gpt-5.6-luna'] },
  'gemini-3.8-flash': { maker: 'google', ids: ['google/gemini-3.8-flash', 'openrouter/google/gemini-3.8-flash', 'vercel/google/gemini-3.8-flash'] },
  'gemini-3.1-pro': { maker: 'google', ids: ['google/gemini-3.1-pro-preview', 'openrouter/google/gemini-3.1-pro-preview', 'vercel/google/gemini-3.1-pro-preview'] },
  'gemini-3.7-flash': { maker: 'google', ids: ['google/gemini-3.7-flash', 'openrouter/google/gemini-3.7-flash', 'vercel/google/gemini-3.7-flash'] },
  'deepseek-flash': { maker: 'deepseek', ids: ['openai-compatible/deepseek/deepseek-flash', 'openrouter/deepseek/deepseek-v4.1-flash', 'vercel/deepseek/deepseek-v4.1-flash', 'huggingface/deepseek-ai/DeepSeek-V4.1-Flash'] },
  'mistral-medium-3.5': { maker: 'mistral', ids: ['openrouter/mistralai/mistral-medium-3-5', 'vercel/mistral/mistral-medium-3.5'] },
  'grok-4.5': { maker: 'xai', ids: ['openrouter/x-ai/grok-4.5', 'vercel/spacexai/grok-4.5'] },
  'kimi-k3': { maker: 'moonshot', ids: ['openrouter/moonshotai/kimi-k3', 'vercel/moonshotai/kimi-k3', 'huggingface/moonshotai/Kimi-K3'] },
  'kimi-k2.7-code': { maker: 'moonshot', ids: ['openrouter/moonshotai/kimi-k2.7-code', 'vercel/moonshotai/kimi-k2.7-code', 'huggingface/moonshotai/Kimi-K2.7-Code'] },
  'mai-code-1.1-flash': { maker: 'microsoft', ids: [] },
};

function catalog() {
  const found = new Map();
  for (const p of PROVIDERS) {
    let out = '';
    try { out = execFileSync('kilo', ['models', p, '--verbose'], { encoding: 'utf8', maxBuffer: 1 << 28, shell: true, stdio: ['ignore', 'pipe', 'ignore'] }); }
    catch (error) { out = error.stdout || ''; }
    out = out.replace(/\r\n/g, '\n');
    const blocks = out.split(/^(?=[a-z][\w.-]*\/\S+\n\{)/m);
    for (const b of blocks) {
      const nl = b.indexOf('\n');
      if (nl < 0) continue;
      const id = b.slice(0, nl).trim();
      try { found.set(id, JSON.parse(b.slice(nl + 1).trim())); } catch { /* not a model block */ }
    }
  }
  return found;
}

function main(argv) {
  const cat = catalog();
  let version = 'unknown';
  try { version = execFileSync('kilo', ['--version'], { encoding: 'utf8', shell: true, stdio: ['ignore', 'pipe', 'ignore'] }).trim().split(/\s+/).pop(); } catch { /* keep unknown */ }
  const result = { generated: new Date().toISOString(), kilo: version, source: 'kilo models <provider> --verbose', models: {} };
  for (const [model, def] of Object.entries(MODELS)) {
    result.models[model] = def.ids.map(id => {
      const j = cat.get(id);
      const provider = id.split('/')[0];
      if (!j) return { route: id, provider, present: false };
      return {
        route: id, provider, present: true, own: OWN[def.maker].includes(provider), status: j.status,
        input: j.cost ? j.cost.input : null, output: j.cost ? j.cost.output : null,
        variants: Object.keys(j.variants || {}), toolcall: Boolean(j.capabilities && j.capabilities.toolcall),
        reasoning: Boolean(j.capabilities && j.capabilities.reasoning), context: j.limit ? j.limit.context : null,
      };
    });
  }
  const text = `${JSON.stringify(result, null, 2)}\n`;
  if (argv.includes('--print')) process.stdout.write(text);
  else { fs.writeFileSync(OUT, text, 'utf8'); process.stdout.write(`wrote ${path.relative(process.cwd(), OUT)} (kilo ${version})\n`); }
  const missing = Object.values(result.models).flat().filter(r => !r.present).map(r => r.route);
  if (missing.length) { process.stdout.write(`absent from the catalog: ${missing.join(', ')}\n`); return 1; }
  return 0;
}

process.exitCode = main(process.argv.slice(2));
