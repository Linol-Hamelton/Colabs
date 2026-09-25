// Preload: logs every PowerShell spawn made through child_process, with its wall time.
const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const LOG = process.env.PS_PROBE_LOG;
const isPs = cmd => /(^|[\\/])(powershell|pwsh)(\.exe)?$/i.test(String(cmd)) || /^\s*"?(powershell|pwsh)(\.exe)?"?\s/i.test(String(cmd));
const what = (cmd, args) => {
  const a = Array.isArray(args) ? args : [];
  const i = a.indexOf('-File');
  if (i >= 0) return path.basename(String(a[i + 1]));
  if (a.includes('-Command')) return 'inline -Command';
  return String(cmd).slice(0, 50);
};
const note = (cmd, args, ms) => { try { fs.appendFileSync(LOG, `${ms}\t${what(cmd, args)}\n`); } catch { /* best effort */ } };
for (const name of ['spawnSync', 'execFileSync']) {
  const orig = cp[name];
  cp[name] = function (cmd, args, ...rest) {
    if (!isPs(cmd)) return orig.call(this, cmd, args, ...rest);
    const t = Date.now();
    try { return orig.call(this, cmd, args, ...rest); } finally { note(cmd, args, Date.now() - t); }
  };
}
const origExecSync = cp.execSync;
cp.execSync = function (cmd, ...rest) {
  if (!isPs(cmd)) return origExecSync.call(this, cmd, ...rest);
  const t = Date.now();
  try { return origExecSync.call(this, cmd, ...rest); } finally { note(cmd, [], Date.now() - t); }
};
const origSpawn = cp.spawn;
cp.spawn = function (cmd, args, ...rest) {
  const c = origSpawn.call(this, cmd, args, ...rest);
  if (isPs(cmd)) { const t = Date.now(); c.on('exit', () => note(cmd, args, Date.now() - t)); }
  return c;
};
