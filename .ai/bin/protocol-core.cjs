#!/usr/bin/env node
'use strict';
// protocol-core.cjs - lint, catalog, check-links and lcc for kernel records.
// Specification: docs/core-arch/stage-1/SPEC-protocol-core.md (CORE-ARCH stage 1, S1-T10), built
// as S3-T13 for certification package I-a. Enforces docs/core-arch/stage-1/procedure.schema.md and
// P-L0-004 (both approved by PROTO-DEC-0061). Output follows docs/specs/bin-output-schema.md.
// Inputs are repository files and the headings of .ai/DECISIONS.md only; no network, no model,
// no git history. Same tree, same output. Unknown input exits 2.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ENFORCES = 'PROTO-DEC-0061 (stage 1: procedure.schema.md, P-L0-004), PROTO-DEC-0047 item 8, PROTO-DEC-0049 item 2';
const PACKET_BUDGET = 40000; // CORE-ARCH-2 section 6
const SCALAR_KEYS = new Set(['id', 'version', 'title', 'layer', 'type', 'status', 'enforcement', 'script_candidate',
  'cost_basis', 'trial', 'superseded_by', 'owner_approval', 'last_applied']);
const LIST_KEYS = new Set(['roles', 'stages', 'triggers', 'inputs', 'outputs', 'tools', 'back_edges', 'enforced_by',
  'evidence_class', 'evidence', 'decision', 'supersedes']);
const TYPES = ['invariant', 'procedure', 'scenario', 'role', 'tool', 'application', 'metric', 'schema'];
const STATUSES = ['draft', 'review', 'trial', 'active', 'deprecated', 'retired', 'superseded'];
const ENFORCEMENT = ['S', 'S~', 'P', 'none'];
const EVIDENCE_CLASSES = ['A', 'B', 'C', 'D', 'E'];
// procedure.schema.md 2.1 and 2.2; role slots from CORE-ARCH-3 section 3 until L1 lands.
const ARTIFACTS = new Set(['task-frame', 'environment-manifest', 'orientation-line', 'candidate-package', 'evidence',
  'findings-ledger', 'attempt-results', 'signals', 'journal', 'stop-question', 'CATALOG', 'decisions-index',
  'review-report', 'record-draft']);
const STAGES = new Set(['intake', 'frame', 'triage', 'dispatch', 'execute', 'accept', 'freeze', 'close', 'session', 'research', 'any']);
const ROLES = new Set(['owner', 'coordinator', 'implementer', 'reviewer', 'certifier', 'shadow-certifier', 'auditor',
  'researcher', 'synthesiser', 'drafter', 'critic', 'fixer', 'procedure-author', 'dispatcher', 'all']);
const FULL_KEYS = ['id', 'version', 'title', 'layer', 'type', 'status', 'roles', 'stages', 'triggers', 'inputs', 'outputs',
  'back_edges', 'enforcement', 'script_candidate', 'evidence_class', 'evidence'];
const REQUIRED_KEYS = {
  procedure: FULL_KEYS, tool: FULL_KEYS, application: FULL_KEYS, metric: FULL_KEYS, scenario: FULL_KEYS,
  role: FULL_KEYS.filter(k => k !== 'back_edges'),
  invariant: ['id', 'version', 'title', 'layer', 'type', 'status', 'roles', 'stages', 'triggers', 'enforcement',
    'script_candidate', 'evidence_class', 'evidence'],
  schema: ['id', 'version', 'title', 'layer', 'type', 'status', 'evidence_class', 'evidence'],
};
const EIGHT = ['Purpose', 'Rules', 'Steps', 'Stop conditions', 'Back edges', 'Evidence', 'Risks', 'Change log'];
const REQUIRED_HEADINGS = {
  procedure: EIGHT, tool: EIGHT, application: EIGHT, metric: EIGHT,
  scenario: ['Purpose', 'Rules', 'Steps', 'Stage graph', 'Handoff artifacts', 'Stop conditions', 'Back edges', 'Evidence', 'Risks', 'Change log'],
  role: ['Purpose', 'Rules', 'Rights', 'Duties', 'Limits', 'Procedures', 'Evidence', 'Risks', 'Change log'],
  invariant: ['Purpose', 'Rules', 'Evidence', 'Change log'],
  schema: ['Change log'],
};
const WORK_PRODUCTS = [/^RULE-MAP\.md$/, /^TRIAL-NOTES\.md$/, /^SPEC-.*\.md$/, /^CATALOG\.md$/];
const EXIT2_CODES = new Set(['F1', 'F4', 'F5', 'F6', 'F9']);
const RECORD_ID = /^(?:P-L[0-9]-\d{3}|S-\d{3}|ROLE-[a-z][a-z0-9-]*|TOOL-[a-z][a-z0-9-]*|APP-[a-z][a-z0-9-]*|M-\d{3}|SCHEMA-[a-z][a-z0-9-]*)$/;
const BODY_ID = /\b(P-L[0-9]-\d{3}|S-\d{3}|ROLE-[a-z][a-z0-9-]*[a-z0-9]|TOOL-[a-z][a-z0-9-]*[a-z0-9]|M-\d{3})\b/g;
const DECISION_ID = /^(?:PROTO-)?DEC-\d{4}$/;

class InputError extends Error {}

function repoRootFrom(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, 'protocol-manifest.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) throw new InputError('repository root not found (no protocol-manifest.json above the working directory)');
    dir = parent;
  }
}
const REPO = (() => { try { return repoRootFrom(process.cwd()); } catch { return process.cwd(); } })();
const rel = p => path.relative(REPO, p).split(path.sep).join('/');
// Ordinal comparison: the same tree gives the same bytes on every machine and locale.
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function q(value) {
  const s = String(value);
  return /^[^\s"]+$/.test(s) ? s : `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}
function row(token, fields) {
  return [token, ...Object.entries(fields).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${k}=${q(v)}`)].join(' ');
}

// ---------- parsing ----------

// Returns { fm, fmLines: {key: line}, body, bodyStart, findings } or { fm: null } when no front matter.
function parseRecord(file) {
  const text = fs.readFileSync(file, 'utf8');
  const findings = [];
  const add = (code, line, value, message) => findings.push({ code, path: rel(file), line, value, message });
  if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) return { fm: null, text, findings };
  const lines = text.split('\n');
  const close = lines.findIndex((l, i) => i > 0 && l.replace(/\r$/, '') === '---');
  if (close < 0) { add('F1', 1, '---', 'front matter is not closed'); return { fm: {}, fmLines: {}, text, lines, bodyStart: lines.length, findings }; }
  const fm = {};
  const fmLines = {};
  for (let i = 1; i < close; i++) {
    const raw = lines[i];
    const n = i + 1;
    if (raw.includes('\r')) { add('F1', n, raw.trim(), 'CR in front matter; use LF'); continue; }
    const m = raw.match(/^([a-z][a-z0-9_]*): (.*)$/);
    if (!m) { add('F1', n, raw, 'not a "key: value" line of the grammar (nesting, comment or malformed key)'); continue; }
    const [, key, value] = m;
    if (Object.hasOwn(fm, key)) { add('F1', n, key, 'duplicate key'); continue; }
    if (!SCALAR_KEYS.has(key) && !LIST_KEYS.has(key)) { add('F1', n, key, 'unknown key'); continue; }
    if (value.trim() === '' || value !== value.trim()) { add('F1', n, value, 'empty value or surrounding spaces'); continue; }
    let parsed;
    if (value.startsWith('[')) {
      if (!value.endsWith(']')) { add('F1', n, value, 'list not closed'); continue; }
      const inner = value.slice(1, -1);
      parsed = inner === '' ? [] : inner.split(', ');
      if (parsed.some(item => item === '' || /[,[\]]/.test(item) || item !== item.trim())) {
        add('F1', n, value, 'list items must be separated by ", " and contain no "," "[" "]"'); continue;
      }
    } else {
      if (value.includes('#')) { add('F1', n, value, 'comment marker "#" in a scalar'); continue; }
      parsed = value;
    }
    if (LIST_KEYS.has(key) && !Array.isArray(parsed)) { add('F6', n, value, `list expected for ${key}, scalar given`); continue; }
    if (SCALAR_KEYS.has(key) && Array.isArray(parsed)) { add('F6', n, value, `scalar expected for ${key}, list given`); continue; }
    fm[key] = parsed;
    fmLines[key] = n;
  }
  return { fm, fmLines, text, lines, bodyStart: close + 1, findings };
}

// `##` headings and rule lines of the body, outside fenced code blocks.
function bodyStructure(rec) {
  const headings = [];
  const rules = [];
  const listItemsWithoutId = [];
  let fence = false;
  let section = null;
  for (let i = rec.bodyStart; i < rec.lines.length; i++) {
    const line = rec.lines[i].replace(/\r$/, '');
    if (/^(```|~~~)/.test(line)) { fence = !fence; continue; }
    if (fence) continue;
    const h = line.match(/^## (.+?)\s*$/);
    if (h) { headings.push({ name: h[1], line: i + 1 }); section = h[1]; continue; }
    if (section !== 'Rules') continue;
    const r = line.match(/^(?:- )?(R-L[0-9]-[A-Za-z0-9]+(?:\.\d+)*)\. /);
    if (r) rules.push({ id: r[1], line: i + 1 });
    else if (/^- /.test(line)) listItemsWithoutId.push({ line: i + 1, text: line.slice(0, 60) });
  }
  return { headings, rules, listItemsWithoutId };
}

function isRepoPath(value) {
  return /^[A-Za-z0-9._\-/]+$/.test(value) && !value.startsWith('/') && !value.split('/').includes('..') && /[/.]/.test(value);
}

// ---------- lint ----------

function lintRecord(rec, file) {
  const f = rec.findings;
  const fm = rec.fm;
  const at = key => rec.fmLines[key] || 1;
  const add = (code, key, value, message) => f.push({ code, path: rel(file), line: at(key), value, message });
  // F4 enumerations
  if (fm.type !== undefined && !TYPES.includes(fm.type)) add('F4', 'type', fm.type, 'type outside the enumeration');
  if (fm.status !== undefined && !STATUSES.includes(fm.status)) add('F4', 'status', fm.status, 'status outside the enumeration');
  if (fm.layer !== undefined && !/^L[0-9]$/.test(fm.layer)) add('F4', 'layer', fm.layer, 'layer must be L0..L9');
  if (fm.enforcement !== undefined && !ENFORCEMENT.includes(fm.enforcement)) add('F4', 'enforcement', fm.enforcement, 'enforcement outside the enumeration');
  if (fm.script_candidate !== undefined && !/^(yes|no:[1-4])$/.test(fm.script_candidate)) add('F4', 'script_candidate', fm.script_candidate, 'script_candidate must be yes or no:<1-4>');
  for (const c of fm.evidence_class || []) if (!EVIDENCE_CLASSES.includes(c)) add('F4', 'evidence_class', c, 'evidence class outside A..E');
  // F5 registries
  for (const key of ['inputs', 'outputs']) for (const v of fm[key] || []) if (!ARTIFACTS.has(v) && !isRepoPath(v)) add('F5', key, v, 'not an artifact id of schema 2.1 nor a repo-relative path');
  for (const v of fm.stages || []) if (!STAGES.has(v)) add('F5', 'stages', v, 'stage not in schema 2.2');
  for (const v of fm.roles || []) if (!ROLES.has(v)) add('F5', 'roles', v, 'role slot not in the L1 catalog (CORE-ARCH-3 section 3)');
  // F6 forms
  if (fm.id !== undefined && !RECORD_ID.test(fm.id)) add('F6', 'id', fm.id, 'malformed record id');
  if (fm.version !== undefined && !/^\d+\.\d+$/.test(fm.version)) add('F6', 'version', fm.version, 'version must be <major>.<minor>');
  if (fm.title !== undefined && fm.title.length > 100) add('F6', 'title', fm.title.slice(0, 40), 'title longer than 100 characters');
  for (const v of fm.evidence || []) if (!(DECISION_ID.test(v) || /^sig-[A-Za-z0-9._-]+$/.test(v) || /^[A-Za-z0-9._\-/]+:\d+$/.test(v))) add('F6', 'evidence', v, 'evidence item must be DEC-nnnn, PROTO-DEC-nnnn, sig-... or path:line');
  for (const v of fm.back_edges || []) if (!/^\d+>\d+\/\d+\/[a-z][a-z-]*$/.test(v)) add('F6', 'back_edges', v, 'back edge must be <from>><to>/<budget>/<exit>');
  for (const v of fm.supersedes || []) if (!(/^[A-Z][A-Za-z0-9-]*@\d+\.\d+$/.test(v) || /^legacy:[A-Za-z0-9._\-/]+:\d+$/.test(v))) add('F6', 'supersedes', v, 'supersedes item must be id@version or legacy:<path>:<line>');
  if (fm.superseded_by !== undefined && !/^[A-Z][A-Za-z0-9-]*@\d+\.\d+$/.test(fm.superseded_by)) add('F6', 'superseded_by', fm.superseded_by, 'superseded_by must be id@version');
  for (const v of fm.decision || []) if (!/^PROTO-DEC-\d{4}$/.test(v)) add('F6', 'decision', v, 'decision item must be PROTO-DEC-nnnn');
  if (fm.owner_approval !== undefined && !(fm.owner_approval === 'none' || DECISION_ID.test(fm.owner_approval))) add('F6', 'owner_approval', fm.owner_approval, 'owner_approval must be a decision id or none');
  if (fm.cost_basis !== undefined && !/^(?:(?:attempts|minutes|owner)=\d+|unknown)$/.test(fm.cost_basis)) add('F6', 'cost_basis', fm.cost_basis, 'cost_basis must be attempts=<n>, minutes=<n>, owner=<n> or unknown');
  if (fm.trial !== undefined && !/^metric=M-\d{3}; kill=.+; until=.+$/.test(fm.trial)) add('F6', 'trial', fm.trial.slice(0, 40), 'trial must be "metric=<M-id>; kill=<condition>; until=<date or batch>"');
  for (const v of fm.tools || []) if (!/^TOOL-[a-z][a-z0-9-]*$/.test(v)) add('F6', 'tools', v, 'tools item must be TOOL-<name>');
  for (const v of fm.enforced_by || []) if (!isRepoPath(v)) add('F6', 'enforced_by', v, 'enforced_by item must be a repo-relative path');
  // F2 required keys by type
  const type = TYPES.includes(fm.type) ? fm.type : null;
  if (!fm.type) add('F2', 'id', 'type', 'required key missing');
  if (type) for (const key of REQUIRED_KEYS[type]) if (!Object.hasOwn(fm, key)) add('F2', 'id', key, `required key missing for type ${type}`);
  // F3 conditional keys
  if (['S', 'S~'].includes(fm.enforcement) && !fm.enforced_by) add('F3', 'enforcement', 'enforced_by', 'enforcement S or S~ requires enforced_by');
  if ((fm.evidence_class || []).includes('B') && !fm.cost_basis) add('F3', 'evidence_class', 'cost_basis', 'evidence class B requires cost_basis');
  if (fm.status === 'trial' && (fm.evidence_class || []).some(c => c === 'C' || c === 'D') && !fm.trial) add('F3', 'status', 'trial', 'class C or D in trial requires trial');
  if (fm.status === 'superseded' && !fm.superseded_by) add('F3', 'status', 'superseded_by', 'status superseded requires superseded_by');
  // F8 active without approval
  if (fm.status === 'active' && (!fm.owner_approval || fm.owner_approval === 'none' || !fm.decision || !fm.decision.length)) add('F8', 'status', 'active', 'status active requires owner_approval and decision');
  // F7 headings
  const body = bodyStructure(rec);
  if (type) {
    let lastIndex = -1;
    for (const name of REQUIRED_HEADINGS[type]) {
      const index = body.headings.findIndex(h => h.name === name);
      if (index < 0) f.push({ code: 'F7', path: rel(file), line: rec.bodyStart, value: name, message: `required heading "## ${name}" missing` });
      else if (index < lastIndex) f.push({ code: 'F7', path: rel(file), line: body.headings[index].line, value: name, message: `heading "## ${name}" out of order` });
      else lastIndex = index;
    }
  }
  return body;
}

// F9 across records: anchoring and single definition.
function lintRules(records) {
  const findings = [];
  const root = records.find(r => r.fm && r.fm.id === 'P-L0-000');
  const rootRules = new Set(root ? root.body.rules.map(x => x.id) : []);
  const defined = new Map();
  for (const r of records) {
    if (!r.fm || !r.body) continue;
    const id = r.fm.id || '';
    for (const item of r.body.listItemsWithoutId) findings.push({ code: 'F9', path: r.rel, line: item.line, value: item.text, message: 'a "## Rules" item without an anchored rule id' });
    for (const rule of r.body.rules) {
      const where = { code: 'F9', path: r.rel, line: rule.line, value: rule.id };
      if (defined.has(rule.id)) findings.push({ ...where, message: `rule id also defined at ${defined.get(rule.id)}` });
      else defined.set(rule.id, `${r.rel}:${rule.line}`);
      if (id === 'P-L0-000') {
        if (!/^R-L0-\d{2}$/.test(rule.id)) findings.push({ ...where, message: 'the root defines R-L0-<nn> only' });
      } else if (r.fm.layer === 'L0') {
        const m = rule.id.match(/^(R-L0-\d{2})\.\d+$/);
        if (!m) findings.push({ ...where, message: 'an L0 record defines sub-rules R-L0-<nn>.<k> of a root rule' });
        else if (!root) findings.push({ ...where, message: 'root L0-ROOT.md (P-L0-000) not among the scanned records' });
        else if (!rootRules.has(m[1])) findings.push({ ...where, message: `root rule ${m[1]} is not defined in L0-ROOT.md` });
      } else {
        const anchor = anchorFor(r.fm);
        if (!anchor || !rule.id.startsWith(`${anchor}.`)) findings.push({ ...where, message: `rule id must be anchored as ${anchor || '<record anchor>'}.<k>` });
      }
    }
  }
  return findings;
}
function anchorFor(fm) {
  const id = fm.id || '';
  let m = id.match(/^P-(L[0-9]-\d{3})$/);
  if (m) return `R-${m[1]}`;
  m = id.match(/^S-(\d{3})$/);
  if (m && fm.layer) return `R-${fm.layer}-S${m[1]}`;
  m = id.match(/^(?:ROLE|TOOL|APP|SCHEMA)-(.+)$/);
  if (m && fm.layer) return `R-${fm.layer}-${m[1]}`;
  m = id.match(/^M-(\d{3})$/);
  if (m && fm.layer) return `R-${fm.layer}-M${m[1]}`;
  return null;
}

// ---------- corpus ----------

function listMarkdown(target) {
  const abs = path.resolve(target);
  if (!fs.existsSync(abs)) throw new InputError(`no such path: ${target}`);
  const st = fs.statSync(abs);
  if (st.isFile()) return [abs];
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => cmp(a.name, b.name))) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.md')) out.push(p);
    }
  })(abs);
  return out;
}

function loadRecords(targets, { skipUnlisted = false } = {}) {
  const records = [];
  const errors = [];
  const seen = new Set();
  for (const t of targets) {
    for (const file of listMarkdown(t)) {
      if (seen.has(file)) continue;
      seen.add(file);
      const rec = parseRecord(file);
      rec.file = file;
      rec.rel = rel(file);
      if (rec.fm === null) {
        if (WORK_PRODUCTS.some(re => re.test(path.basename(file))) || skipUnlisted) continue;
        errors.push({ code: 'F1', path: rec.rel, line: 1, value: path.basename(file), message: 'no front matter and not an allowlisted work product' });
        continue;
      }
      records.push(rec);
    }
  }
  return { records, errors };
}

function lint(targets) {
  if (!targets.length) throw new InputError('lint needs at least one path');
  const { records, errors } = loadRecords(targets);
  const findings = [...errors];
  for (const r of records) { r.body = lintRecord(r, r.file); findings.push(...r.findings); }
  // A sub-rule needs its root; find it next to the scanned records when it was not passed.
  if (!records.some(r => r.fm.id === 'P-L0-000') && records.some(r => r.fm.layer === 'L0')) {
    for (const candidate of new Set(records.map(r => path.join(path.dirname(r.file), 'L0-ROOT.md')))) {
      if (fs.existsSync(candidate)) { const root = parseRecord(candidate); root.file = candidate; root.rel = rel(candidate); root.body = bodyStructure(root); records.push({ ...root, rootOnly: true }); break; }
    }
  }
  findings.push(...lintRules(records).filter(x => !records.find(r => r.rel === x.path && r.rootOnly)));
  return { records: records.filter(r => !r.rootOnly), findings: sortFindings(findings) };
}

function sortFindings(list) {
  return list.sort((a, b) => cmp(a.path, b.path) || a.line - b.line || cmp(a.code, b.code) || cmp(String(a.value), String(b.value)));
}
function exitFor(findings) {
  if (findings.some(x => EXIT2_CODES.has(x.code))) return 2;
  return findings.length ? 1 : 0;
}

// ---------- catalog ----------

function designRoot(root) { return /(^|\/)docs\/core-arch(\/|$)/.test(rel(path.resolve(root))); }

function catalogText(root) {
  const { records, errors } = loadRecords([root], { skipUnlisted: designRoot(root) });
  const f1 = [...errors, ...records.flatMap(r => r.findings.filter(x => x.code === 'F1'))];
  const sources = records.map(r => r.file).sort((a, b) => cmp(rel(a), rel(b)));
  const rows = records.map(r => r.fm).sort((a, b) => cmp(a.layer || '', b.layer || '') || cmp(a.id || '', b.id || ''));
  const list = v => (Array.isArray(v) ? v.join(', ') : (v || ''));
  const lines = ['# CATALOG', '', 'Derived by `node .ai/bin/protocol-core.cjs catalog`; never edit by hand. Loading levels: exists and summary (procedure.schema.md section 4).', '', '## Sources', ''];
  for (const s of sources) lines.push(`- sha256:${crypto.createHash('sha256').update(fs.readFileSync(s)).digest('hex')}  ${rel(s)}`);
  lines.push('', '## Records', '', '| id | version | layer | type | status | roles | stages | triggers | title |', '|---|---|---|---|---|---|---|---|---|');
  for (const fm of rows) lines.push(`| ${[fm.id, fm.version, fm.layer, fm.type, fm.status, list(fm.roles), list(fm.stages), list(fm.triggers), fm.title].map(x => String(x || '').replace(/\|/g, '/')).join(' | ')} |`);
  return { text: lines.join('\n') + '\n', f1, count: rows.length };
}

function catalogTarget(root) {
  return designRoot(root) ? path.join(REPO, '.ai', 'runtime', 'CATALOG.md') : path.join(path.resolve(root), 'CATALOG.md');
}

// ---------- check-links ----------

function decisionHeadings() {
  const file = path.join(REPO, '.ai', 'DECISIONS.md');
  if (!fs.existsSync(file)) throw new InputError('.ai/DECISIONS.md not found');
  const ids = new Set();
  for (const m of fs.readFileSync(file, 'utf8').matchAll(/^### ((?:PROTO-)?DEC-\d{4})\s*$/gm)) ids.add(m[1]);
  return ids;
}
function supersededDecisions() {
  const text = fs.readFileSync(path.join(REPO, '.ai', 'DECISIONS.md'), 'utf8');
  const out = new Set();
  for (const m of text.matchAll(/^### ((?:PROTO-)?DEC-\d{4})\s*\n+Status:[ \t]*Superseded/gm)) out.add(m[1]);
  return out;
}
function signalIds() {
  const file = path.join(REPO, '.ai', 'SIGNALS.md');
  if (!fs.existsSync(file)) return new Set();
  return new Set([...fs.readFileSync(file, 'utf8').matchAll(/\bsig-[A-Za-z0-9._-]+/g)].map(m => m[0]));
}
// Ids that the CORE-ARCH program plans: a record drafted in a stage directory, or an id named in a
// CORE-ARCH program document. A forward reference to one is PENDING in design mode, not DANGLING.
function plannedIds() {
  const dir = path.join(REPO, 'docs', 'core-arch');
  const planned = new Map();
  if (!fs.existsSync(dir)) return planned;
  for (const stage of fs.readdirSync(dir).filter(n => /^stage-\d+$/.test(n)).sort()) {
    for (const file of listMarkdown(path.join(dir, stage))) {
      const rec = parseRecord(file);
      if (rec.fm && rec.fm.id && !planned.has(rec.fm.id)) planned.set(rec.fm.id, rel(file));
    }
  }
  for (const f of fs.readdirSync(dir).filter(n => /^CORE-ARCH-\d+\.md$/.test(n)).sort()) {
    for (const m of fs.readFileSync(path.join(dir, f), 'utf8').matchAll(BODY_ID)) if (!planned.has(m[1])) planned.set(m[1], `docs/core-arch/${f}`);
  }
  return planned;
}
function checkLine(target) {
  const m = target.match(/^(.*):(\d+)$/);
  if (!m) return 'unparseable';
  const file = path.join(REPO, m[1]);
  if (!isRepoPath(m[1]) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return 'missing file';
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const n = Number(m[2]);
  if (n < 1 || n > lines.length) return `line ${n} beyond ${lines.length}`;
  if (lines[n - 1].trim() === '') return `line ${n} is blank`;
  // CA-08: a heading cited as content. Whether a content line says what is claimed stays with the reviewer.
  if (/^#{1,6} /.test(lines[n - 1])) return `line ${n} is a heading, not content`;
  return null;
}

function checkLinks(root, design) {
  const { records, errors } = loadRecords([root], { skipUnlisted: designRoot(root) });
  const rows = [];
  const add = (token, r, line, ref, extra = {}) => rows.push({ token, path: r.rel, line, ref, ...extra });
  const unparseable = [...errors, ...records.flatMap(r => r.findings.filter(x => x.code === 'F1'))];
  const known = new Set(records.map(r => r.fm.id));
  const decisions = decisionHeadings();
  const signals = signalIds();
  const planned = plannedIds();
  const resolveId = (r, line, ref) => {
    if (known.has(ref)) return;
    if (design && planned.has(ref)) add('PENDING', r, line, ref, { planned: planned.get(ref) });
    else add('DANGLING', r, line, ref);
  };
  for (const r of records) {
    const fm = r.fm;
    const at = key => r.fmLines[key] || 1;
    for (const v of fm.supersedes || []) {
      if (v.startsWith('legacy:')) { const bad = checkLine(v.slice(7)); if (bad) add('BAD_LINE', r, at('supersedes'), v, { reason: bad }); }
      else resolveId(r, at('supersedes'), v.split('@')[0]);
    }
    if (fm.superseded_by) resolveId(r, at('superseded_by'), fm.superseded_by.split('@')[0]);
    for (const v of fm.tools || []) resolveId(r, at('tools'), v);
    for (const v of fm.decision || []) if (!decisions.has(v)) add('DANGLING', r, at('decision'), v);
    if (fm.owner_approval && fm.owner_approval !== 'none' && !decisions.has(fm.owner_approval)) add('DANGLING', r, at('owner_approval'), fm.owner_approval);
    for (const v of fm.evidence || []) {
      if (DECISION_ID.test(v)) { if (!decisions.has(v)) add('DANGLING', r, at('evidence'), v); }
      else if (v.startsWith('sig-')) { if (!signals.has(v)) add('DANGLING', r, at('evidence'), v); }
      else { const bad = checkLine(v); if (bad) add('BAD_LINE', r, at('evidence'), v, { reason: bad }); }
    }
    for (let i = r.bodyStart; i < r.lines.length; i++) {
      for (const m of r.lines[i].matchAll(BODY_ID)) if (m[1] !== fm.id) resolveId(r, i + 1, m[1]);
    }
  }
  const sorted = rows.sort((a, b) => cmp(a.path, b.path) || a.line - b.line || cmp(a.ref, b.ref));
  const dedup = sorted.filter((x, i) => i === 0 || !(x.path === sorted[i - 1].path && x.line === sorted[i - 1].line && x.ref === sorted[i - 1].ref));
  return { rows: dedup, unparseable, records };
}

// ---------- lcc ----------

function lcc(layer, root, design) {
  if (!/^L[0-9]$/.test(layer)) throw new InputError(`layer must be L0..L9, got ${layer}`);
  const all = lint([root]);
  const records = all.records;
  const inLayer = records.filter(r => r.fm.layer === layer);
  if (!inLayer.length) throw new InputError(`no records of layer ${layer} under ${root}`);
  const layerOf = new Map(records.map(r => [r.fm.id, r.fm.layer]));
  const results = {};
  const ids = list => [...new Set(list)].sort();
  // LCC-1 one home and anchoring (F9 findings of this layer)
  const f9 = all.findings.filter(x => x.code === 'F9' && inLayer.some(r => r.rel === x.path));
  results[1] = ids(f9.map(x => x.value));
  // LCC-2 direction: a reference down to another layer is allowed only as a forward reference to a
  // record a named stage writes (design mode: planned; strict mode, a package freeze: resolved).
  const links = checkLinks(root, design);
  const unresolvedHere = links.rows.filter(x => inLayer.some(r => r.rel === x.path) && RECORD_ID.test(x.ref) && (x.token === 'DANGLING' || (!design && x.token === 'PENDING')));
  results[2] = ids(unresolvedHere.map(x => `${x.path.split('/').pop()}>${x.ref}`));
  // LCC-3 decisions: every referenced decision exists and is not superseded
  const known = decisionHeadings();
  const superseded = supersededDecisions();
  const decRefs = inLayer.flatMap(r => [...(r.fm.decision || []), ...(r.fm.evidence || []).filter(v => DECISION_ID.test(v)), r.fm.owner_approval].filter(Boolean).filter(v => v !== 'none'));
  results[3] = ids(decRefs.filter(v => !known.has(v) || superseded.has(v)));
  // LCC-4 roles; LCC-5 tools; LCC-6 loops (form and prose)
  results[4] = ids(inLayer.flatMap(r => (r.fm.roles || []).filter(v => !ROLES.has(v))));
  const toolIds = new Set(records.filter(r => r.fm.type === 'tool').map(r => r.fm.id));
  const planned = plannedIds();
  results[5] = ids(inLayer.flatMap(r => (r.fm.tools || []).filter(t => !toolIds.has(t) && !(design && planned.has(t)))));
  results[6] = ids(inLayer.flatMap(r => {
    const bad = (r.fm.back_edges || []).filter(v => !/^\d+>\d+\/\d+\/[a-z][a-z-]*$/.test(v));
    const hasProse = r.body.headings.some(h => h.name === 'Back edges');
    return [...bad, ...((r.fm.back_edges || []).length && !hasProse ? [`${r.fm.id}:no-prose`] : [])];
  }));
  // LCC-8 budget: largest full-load packet of a slot in this layer (root + records naming the slot)
  const rootRec = records.find(r => r.fm.id === 'P-L0-000');
  const size = r => Buffer.byteLength(r.text);
  let largest = { slot: '-', bytes: 0 };
  for (const slot of [...ROLES].filter(s => s !== 'all')) {
    const members = inLayer.filter(r => (r.fm.roles || []).includes(slot));
    if (!members.length) continue;
    const bytes = (rootRec ? size(rootRec) : 0) + members.filter(r => r !== rootRec).reduce((a, r) => a + size(r), 0);
    if (bytes > largest.bytes) largest = { slot, bytes };
  }
  results[8] = largest.bytes > PACKET_BUDGET ? [`${largest.slot}=${largest.bytes}B`] : [];
  // LCC-9 coverage: RULE-MAP rows homed in this layer name an existing record or a planned one
  const map = [path.join(path.resolve(root), 'RULE-MAP.md'), path.join(REPO, 'docs', 'core-arch', 'stage-1', 'RULE-MAP.md')].find(p => fs.existsSync(p));
  const missing = [];
  if (map) {
    for (const line of fs.readFileSync(map, 'utf8').split('\n')) {
      const cells = line.split('|').map(c => c.trim());
      if (cells.length < 7 || !/^[A-Z]+-\d+/.test(cells[1] || '') || cells[5] !== layer) continue;
      for (const m of cells[4].matchAll(BODY_ID)) if (!layerOf.has(m[1]) && !(design && planned.has(m[1]))) missing.push(`${cells[1]}>${m[1]}`);
    }
  }
  results[9] = ids(missing);
  return { results, largest, map: map ? rel(map) : null };
}

// ---------- CLI ----------

const HELP = `protocol-core.cjs - kernel record tooling (enforces ${ENFORCES})

  lint <path|dir>...                   schema checks F1-F9; exit 0 pass, 1 rule broken, 2 malformed
  catalog [--root <dir>] [--check]     write or verify CATALOG.md (default root .ai/core)
  check-links [--root <dir>] [--design|--strict]
                                       resolve record, decision, signal and path:line references
  lcc <layer> [--root <dir>] [--design|--strict]
                                       LCC-1..6, 8, 9 of P-L0-004; LCC-7 is manual
  verify [--root <dir>]                lint + catalog --check + check-links (design) in one run,
                                       used by validate-protocol.ps1 when .ai/core exists

Design mode is the default for a root under docs/core-arch: references to records that a CORE-ARCH
program document plans are PENDING, not DANGLING. At a package freeze run --strict.`;

function parseOptions(args, allowed) {
  const opts = { positional: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith('--')) { opts.positional.push(a); continue; }
    const name = a.slice(2);
    if (!(name in allowed)) throw new InputError(`unknown flag ${a}`);
    if (allowed[name] === 'value') {
      if (i + 1 >= args.length || args[i + 1].startsWith('--')) throw new InputError(`flag ${a} needs a value`);
      opts[name] = args[++i];
    } else opts[name] = true;
  }
  return opts;
}

function modeFor(root, opts) {
  if (opts.design && opts.strict) throw new InputError('--design and --strict are exclusive');
  if (opts.design) return true;
  if (opts.strict) return false;
  return designRoot(root);
}

function main(argv) {
  const [command, ...rest] = argv;
  const out = [];
  const print = line => out.push(line);
  try {
    if (!command || command === '--help' || command === 'help') { console.log(HELP); return 0; }
    if (command === 'lint') {
      const opts = parseOptions(rest, {});
      if (!opts.positional.length) throw new InputError('lint needs at least one path');
      const { records, findings } = lint(opts.positional);
      const code = exitFor(findings);
      print(row('LINT', { paths: opts.positional.join(','), records: records.length, enforces: 'PROTO-DEC-0061' }));
      for (const x of findings) print(row('FINDING', { code: x.code, path: `${x.path}:${x.line}`, value: x.value, reason: x.message }));
      print(row('RESULT', { exit: code, findings: findings.length, malformed: findings.filter(x => EXIT2_CODES.has(x.code)).length }));
      console.log(out.join('\n'));
      return code;
    }
    if (command === 'catalog') {
      const opts = parseOptions(rest, { root: 'value', check: 'flag' });
      if (opts.positional.length) throw new InputError(`unexpected argument ${opts.positional[0]}`);
      const root = opts.root || path.join(REPO, '.ai', 'core');
      if (!fs.existsSync(root)) throw new InputError(`no such root: ${root}`);
      const { text, f1, count } = catalogText(root);
      const target = catalogTarget(root);
      print(row('CATALOG', { root: rel(path.resolve(root)), records: count, target: rel(target), mode: opts.check ? 'check' : 'write' }));
      if (f1.length) {
        for (const x of f1) print(row('FINDING', { code: x.code, path: `${x.path}:${x.line}`, value: x.value, reason: x.message }));
        print(row('RESULT', { exit: 2, reason: 'a source fails F1' }));
        console.log(out.join('\n'));
        return 2;
      }
      const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
      if (opts.check) {
        const fresh = current === text;
        print(row('RESULT', { exit: fresh ? 0 : 1, state: fresh ? 'fresh' : (current === null ? 'missing' : 'stale') }));
        console.log(out.join('\n'));
        return fresh ? 0 : 1;
      }
      if (current !== text) { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, text); }
      print(row('RESULT', { exit: 0, state: current === text ? 'fresh' : 'written' }));
      console.log(out.join('\n'));
      return 0;
    }
    if (command === 'check-links') {
      const opts = parseOptions(rest, { root: 'value', design: 'flag', strict: 'flag' });
      if (opts.positional.length) throw new InputError(`unexpected argument ${opts.positional[0]}`);
      const root = opts.root || path.join(REPO, '.ai', 'core');
      if (!fs.existsSync(root)) throw new InputError(`no such root: ${root}`);
      const design = modeFor(root, opts);
      const { rows, unparseable, records } = checkLinks(root, design);
      const failing = rows.filter(x => x.token !== 'PENDING');
      const code = unparseable.length ? 2 : (failing.length ? 1 : 0);
      print(row('CHECK_LINKS', { root: rel(path.resolve(root)), records: records.length, mode: design ? 'design' : 'strict' }));
      for (const x of unparseable) print(row('FINDING', { code: x.code, path: `${x.path}:${x.line}`, value: x.value, reason: x.message }));
      for (const x of rows) print(row(x.token, { path: `${x.path}:${x.line}`, ref: x.ref, planned: x.planned, reason: x.reason }));
      print(row('RESULT', { exit: code, pending: rows.filter(x => x.token === 'PENDING').length, dangling: rows.filter(x => x.token === 'DANGLING').length, badLines: rows.filter(x => x.token === 'BAD_LINE').length }));
      console.log(out.join('\n'));
      return code;
    }
    if (command === 'verify') {
      // One process for the validator: lint, catalog freshness and, where the design corpus exists,
      // check-links in design mode. A host project without docs/core-arch skips check-links and says so.
      const opts = parseOptions(rest, { root: 'value' });
      if (opts.positional.length) throw new InputError(`unexpected argument ${opts.positional[0]}`);
      const root = opts.root || path.join(REPO, '.ai', 'core');
      if (!fs.existsSync(root)) throw new InputError(`no such root: ${root}`);
      const results = [];
      const lintResult = lint([root]);
      results.push(['lint', exitFor(lintResult.findings), lintResult.findings.map(x => row('FINDING', { code: x.code, path: `${x.path}:${x.line}`, value: x.value, reason: x.message }))]);
      const cat = catalogText(root);
      const target = catalogTarget(root);
      const fresh = fs.existsSync(target) && fs.readFileSync(target, 'utf8') === cat.text;
      results.push(['catalog', cat.f1.length ? 2 : (fresh ? 0 : 1), fresh ? [] : [row('STALE', { path: rel(target), reason: 'run: node .ai/bin/protocol-core.cjs catalog' })]]);
      if (fs.existsSync(path.join(REPO, 'docs', 'core-arch'))) {
        const links = checkLinks(root, true);
        const failing = links.rows.filter(x => x.token !== 'PENDING');
        results.push(['check-links', links.unparseable.length ? 2 : (failing.length ? 1 : 0), failing.map(x => row(x.token, { path: `${x.path}:${x.line}`, ref: x.ref, reason: x.reason }))]);
      } else {
        results.push(['check-links', 0, [row('SKIPPED', { check: 'check-links', reason: 'no docs/core-arch design corpus in this checkout' })]]);
      }
      const code = Math.max(...results.map(r => r[1]));
      print(row('VERIFY', { root: rel(path.resolve(root)), enforces: 'PROTO-DEC-0061' }));
      for (const [name, exit, rows] of results) { rows.forEach(r => print(r)); print(row('CHECK', { name, exit })); }
      print(row('RESULT', { exit: code }));
      console.log(out.join('\n'));
      return code;
    }
    if (command === 'lcc') {
      const opts = parseOptions(rest, { root: 'value', design: 'flag', strict: 'flag' });
      if (opts.positional.length !== 1) throw new InputError('lcc needs exactly one layer, for example L0');
      const layer = opts.positional[0];
      const root = opts.root || path.join(REPO, '.ai', 'core');
      if (!fs.existsSync(root)) throw new InputError(`no such root: ${root}`);
      const design = modeFor(root, opts);
      const { results, largest, map } = lcc(layer, root, design);
      const cell = n => (results[n].length ? `fail:${results[n].join(',')}` : 'pass');
      print(row('LCC', { layer, root: rel(path.resolve(root)), mode: design ? 'design' : 'strict', rulemap: map || 'none', largestPacket: `${largest.slot}=${largest.bytes}B`, budget: `${PACKET_BUDGET}B` }));
      for (const n of [1, 2, 3, 4, 5, 6, 8, 9]) print(row('LCC_CHECK', { id: `LCC-${n}`, result: cell(n) }));
      print(row('LCC_CHECK', { id: 'LCC-7', result: 'manual' }));
      const failed = [1, 2, 3, 4, 5, 6, 8, 9].filter(n => results[n].length);
      print(row('JOURNAL', { line: `LCC: ${layer} | ${[1, 2, 3, 4, 5, 6].map(n => `${n}=${cell(n)}`).join(' | ')} | 7=manual | 8=${cell(8)} | 9=${cell(9)}` }));
      print(row('RESULT', { exit: failed.length ? 1 : 0, failed: failed.map(n => `LCC-${n}`).join(',') || 'none' }));
      console.log(out.join('\n'));
      return failed.length ? 1 : 0;
    }
    throw new InputError(`unknown command ${command}`);
  } catch (error) {
    if (error instanceof InputError) {
      console.log([...out, row('ERROR', { reason: error.message })].join('\n'));
      return 2;
    }
    console.log([...out, row('ERROR', { reason: `internal: ${error.message}` })].join('\n'));
    return 2;
  }
}

module.exports = { parseRecord, lint, catalogText, checkLinks, lcc, main };

if (require.main === module) process.exitCode = main(process.argv.slice(2));
