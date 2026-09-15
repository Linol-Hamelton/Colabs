#!/usr/bin/env node
'use strict';

// Session entry point for assistants without hooks.
//
// Claude and Codex get their journal and their context from a SessionStart
// hook. Any other assistant, reached through a chat panel or a custom
// endpoint, gets nothing: no journal, no injected state, no Stop reminder.
// It could still take part, because AGENTS.md section 5 defines the naming,
// but it had to know to do all of it by hand.
//
// This runs the same engine the hooks run, so a session started here is
// indistinguishable from a hooked one.
//
//   start --agent <name> [--session <id>]   create the journal, print context
//   stop  --agent <name> --session <id>     the Stop check, as a message
//   whoami --agent <name> --session <id>    print the journal and owner name
//
// The printed owner name is what to pass to protocol-lock.cjs and
// protocol-handoff.cjs, so one identity covers journal, lock and evidence.

const crypto = require('node:crypto');
const hooks = require('./protocol-hooks.cjs');

function parse(argv) {
  const command = argv[0];
  const options = {};
  for (let i = 1; i < argv.length; i += 1) {
    const value = argv[i + 1];
    if (!value) throw new Error(`Missing value for ${argv[i]}`);
    if (argv[i] === '--agent') options.agent = value;
    else if (argv[i] === '--session') options.session = value;
    else if (argv[i] === '--root') options.root = value;
    else throw new Error('Usage: protocol-session.cjs start|stop|whoami --agent <name> [--session <id>] [--root <path>]');
    i += 1;
  }
  if (!options.agent) throw new Error('This command needs --agent <name>, for example --agent qwen');
  if (!hooks.AGENT_NAME.test(options.agent)) {
    throw new Error('Agent name must be 2 to 24 lowercase letters, digits or hyphens, starting with a letter.');
  }
  return { command, options };
}

function main(argv) {
  const { command, options } = parse(argv);
  const input = { cwd: options.root || process.cwd() };

  if (command === 'start') {
    // A hookless assistant has no session id of its own. One is minted here and
    // printed, because every later command has to name the same session.
    input.session_id = options.session || crypto.randomBytes(8).toString('hex');
    const result = hooks.run('SessionStart', input, options.agent);
    const paths = hooks.sessionPaths(
      require('node:fs').realpathSync(input.cwd), input.session_id, options.agent);
    const owner = require('node:path').basename(paths.worklog, '.md');
    process.stdout.write(`${result.hookSpecificOutput.additionalContext}\n`);
    process.stdout.write('---\n\n');
    process.stdout.write(`Session id: ${options.session || input.session_id}\n`);
    process.stdout.write(`Owner name for the lock and for evidence: ${owner}\n`);
    process.stdout.write(`Journal: ${paths.worklog}\n`);
    return 0;
  }

  if (command === 'stop') {
    if (!options.session) throw new Error('stop needs the --session id that start printed');
    input.session_id = options.session;
    const result = hooks.run('Stop', input, options.agent);
    if (result && result.systemMessage) {
      process.stderr.write(`${result.systemMessage}\n`);
      return 1;
    }
    process.stdout.write('Handoff recorded for this session.\n');
    return 0;
  }

  if (command === 'whoami') {
    if (!options.session) throw new Error('whoami needs the --session id that start printed');
    const paths = hooks.sessionPaths(
      require('node:fs').realpathSync(input.cwd), options.session, options.agent);
    const owner = require('node:path').basename(paths.worklog, '.md');
    process.stdout.write(`${JSON.stringify({ owner, worklog: paths.worklog }, null, 2)}\n`);
    return 0;
  }

  throw new Error('Usage: protocol-session.cjs start|stop|whoami --agent <name> [--session <id>]');
}

if (require.main === module) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (error) { process.stderr.write(`AI protocol: ${error.message}\n`); process.exitCode = 1; }
}
module.exports = { main, parse };
