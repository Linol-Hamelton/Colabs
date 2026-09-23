#!/usr/bin/env node
'use strict';

// protocol-scope.cjs - Checks 3 & 4 of docs/specs/2026-09-23-executable-rulebook-spec.md
// Check 3: Scope and forbidden-path check (--baseline <sha> --scope <paths-file>)
// Check 4: Author is not the reviewer (--independence <review-path>)

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// Standing default forbidden paths from .ai/docs/PROTOCOL.md:113:
// "the standing default list is AGENTS.md, QUICKSTART.md, kernel, hooks, gates, manifest, tests, decisions and registry."
const STANDING_DEFAULT_FORBIDDEN = [
  'AGENTS.md',
  'QUICKSTART.md',
  'protocol-manifest.json',
  'docs/decisions/REGISTRY.md',
  '.ai/DECISIONS.md',
  'docs/decisions/',
  'validate-protocol.ps1',
  'setup-ai-protocol.ps1',
  'test-protocol.ps1',
  '.ai/bin/',
  '.claude/hooks/',
  '.codex/hooks/',
  'tests/',
];

function normalizePath(p) {
  return p.trim().replace(/\\/g, '/');
}

function pathMatches(candidate, target) {
  const normCandidate = normalizePath(candidate);
  const normTarget = normalizePath(target);
  if (normTarget.endsWith('/')) {
    return normCandidate.startsWith(normTarget) || normCandidate === normTarget.slice(0, -1);
  }
  // A prefix is NOT a directory match
  return normCandidate === normTarget || normCandidate.startsWith(`${normTarget}/`);
}

// Check 3: Scope check
function checkScope(baseline, scopeFile, forbiddenFile, cwd = process.cwd()) {
  if (!baseline) {
    throw new Error('Missing required argument: --baseline <sha>');
  }
  if (!scopeFile) {
    throw new Error('Missing required argument: --scope <paths-file>');
  }

  const resolvedScope = path.resolve(cwd, scopeFile);
  if (!fs.existsSync(resolvedScope)) {
    throw new Error(`Scope file not found: ${normalizePath(path.relative(cwd, resolvedScope))}`);
  }

  let scopeLines;
  try {
    const rawScope = fs.readFileSync(resolvedScope, 'utf8');
    scopeLines = rawScope
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => line.replace(/^[-*]\s+/, '').replace(/^`|`$/g, ''))
      .map(normalizePath)
      .filter(Boolean);
  } catch (err) {
    throw new Error(`Cannot read scope file: ${err.message}`);
  }

  if (scopeLines.length === 0) {
    throw new Error('Scope file contains no valid declared paths (missing input is never read as empty set)');
  }

  // Split scope into inclusions and exclusions
  const exclusions = [];
  const inclusions = [];
  for (const s of scopeLines) {
    if (s.startsWith('!')) {
      exclusions.push(normalizePath(s.slice(1)));
    } else {
      inclusions.push(s);
    }
  }

  // Verify git baseline commit
  try {
    execFileSync('git', ['rev-parse', '--verify', `${baseline}^{commit}`], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    throw new Error(`Baseline commit cannot be resolved: '${baseline}'`);
  }

  // Get touched paths: tracked changes (git diff -z) PLUS untracked files (git ls-files -z)
  let diffOutput;
  try {
    diffOutput = execFileSync('git', ['diff', '--name-only', '-z', baseline], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    throw new Error(`git diff failed against baseline '${baseline}': ${err.message}`);
  }

  let untrackedOutput;
  try {
    untrackedOutput = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    throw new Error(`git ls-files failed: ${err.message}`);
  }

  const trackedList = diffOutput
    .toString('utf8')
    .split('\0')
    .map(normalizePath)
    .filter(Boolean);

  const untrackedList = untrackedOutput
    .toString('utf8')
    .split('\0')
    .map(normalizePath)
    .filter(Boolean);

  const touchedPaths = Array.from(new Set([...trackedList, ...untrackedList]));

  // Determine forbidden paths
  let forbiddenList = [];
  if (forbiddenFile) {
    const resolvedForbidden = path.resolve(cwd, forbiddenFile);
    if (!fs.existsSync(resolvedForbidden)) {
      throw new Error(`Forbidden paths file not found: ${normalizePath(path.relative(cwd, resolvedForbidden))}`);
    }
    forbiddenList = fs
      .readFileSync(resolvedForbidden, 'utf8')
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'))
      .map(l => l.replace(/^[-*]\s+/, '').replace(/^`|`$/g, ''))
      .map(normalizePath);
  } else {
    // Check Phase 0 frame in .ai/TASK.md if present
    const taskPath = path.resolve(cwd, '.ai', 'TASK.md');
    let frameDeclaredForbidden = false;
    if (fs.existsSync(taskPath)) {
      const taskText = fs.readFileSync(taskPath, 'utf8');
      const forbiddenMatch = taskText.match(/(?:forbidden paths?|Phase 0 forbidden)[^\n:]*:\s*([^\n]+)/i);
      if (forbiddenMatch) {
        const declared = forbiddenMatch[1].split(',').map(normalizePath).filter(Boolean);
        if (declared.length > 0) {
          forbiddenList = declared;
          frameDeclaredForbidden = true;
        }
      }
    }
    // Where frame is silent, standing defaults apply
    if (!frameDeclaredForbidden) {
      forbiddenList = STANDING_DEFAULT_FORBIDDEN.map(normalizePath);
    }
  }

  const offendingOutOfScope = [];
  const offendingForbidden = [];

  for (const touched of touchedPaths) {
    // 1. Scope check: must match at least one inclusion and no exclusions
    let inScope = false;
    for (const inc of inclusions) {
      if (pathMatches(touched, inc)) {
        inScope = true;
        break;
      }
    }
    if (inScope) {
      for (const exc of exclusions) {
        if (pathMatches(touched, exc)) {
          inScope = false;
          break;
        }
      }
    }

    if (!inScope) {
      offendingOutOfScope.push(touched);
    }

    // 2. Forbidden check
    for (const forb of forbiddenList) {
      if (pathMatches(touched, forb)) {
        offendingForbidden.push({ path: touched, forbiddenMatch: forb });
        break;
      }
    }
  }

  return {
    touchedCount: touchedPaths.length,
    touchedPaths,
    offendingOutOfScope,
    offendingForbidden,
    passed: offendingOutOfScope.length === 0 && offendingForbidden.length === 0,
  };
}

// Check 4: Independence check
function checkIndependence(reviewPath, options = {}) {
  const cwd = options.cwd || process.cwd();
  if (!reviewPath) {
    throw new Error('Missing review path for --independence');
  }

  const resolvedReview = path.resolve(cwd, reviewPath);
  if (!fs.existsSync(resolvedReview)) {
    throw new Error(`Review file not found: ${normalizePath(path.relative(cwd, resolvedReview))}`);
  }

  const reviewContent = fs.readFileSync(resolvedReview, 'utf8');

  // Review header only: prose before the first '---' or first '## ' heading
  let headerContent = reviewContent;
  const firstHr = reviewContent.search(/(?:^|\n)\s*---\s*(?:\n|\z)/);
  const firstH2 = reviewContent.search(/(?:^|\n)\s*##\s+/);
  let cutoff = -1;
  if (firstHr !== -1 && firstH2 !== -1) cutoff = Math.min(firstHr, firstH2);
  else if (firstHr !== -1) cutoff = firstHr;
  else if (firstH2 !== -1) cutoff = firstH2;
  if (cutoff !== -1) {
    headerContent = reviewContent.slice(0, cutoff);
  }
  // Strip code fences if present in header
  headerContent = headerContent.replace(/```[\s\S]*?```/g, '');

  // 1. Read Receipt-Owner from the review header
  let reviewerOwner = null;
  const receiptOwnerMatch = headerContent.match(/(?:^|\n)\s*>?\s*(?:\*\*)?Receipt-Owner(?:\*\*)?:\s*([a-zA-Z0-9._-]+)/i);
  if (receiptOwnerMatch) {
    reviewerOwner = receiptOwnerMatch[1].trim();
  } else {
    const sessionMatch = headerContent.match(/(?:^|\n)\s*>?\s*(?:\*\*)?Session(?:\*\*)?:\s*([a-zA-Z0-9._-]+)/i);
    if (sessionMatch) {
      reviewerOwner = sessionMatch[1].trim();
    }
  }

  if (!reviewerOwner) {
    throw new Error(`Cannot determine Receipt-Owner from review header: ${normalizePath(path.relative(cwd, resolvedReview))}`);
  }

  // 2. Read producer's owner name from declared repository inputs only:
  // a) candidate journal's own Evidence owner (--candidate-journal option or review Candidate journal field)
  // b) Producer / Candidate field in the review header (non-SHA only)
  // c) --producer option (cannot override a declared journal's recorded owner)
  // NEVER order candidates by filesystem mtime.
  let candidateJournalPath = options.candidateJournal || null;
  if (!candidateJournalPath) {
    const journalMatch = headerContent.match(/(?:^|\n)\s*>?\s*(?:\*\*)?(?:Candidate journal|Producer journal)(?:\*\*)?:\s*`?([^\n`\r]+)`?/i);
    if (journalMatch) {
      candidateJournalPath = journalMatch[1].trim();
    }
  }

  let producerOwner = null;
  if (candidateJournalPath) {
    const jPath = path.resolve(cwd, candidateJournalPath);
    if (fs.existsSync(jPath)) {
      const jText = fs.readFileSync(jPath, 'utf8');
      const recMatch = jText.match(/- recorded:[^\n]+by\s+([a-zA-Z0-9._-]+)/i);
      if (recMatch) {
        producerOwner = recMatch[1].trim();
      }
      // No basename fallback
    }
  }

  if (!producerOwner) {
    // Check if review explicitly states candidate / producer owner in header
    const candidateMatch = headerContent.match(/(?:^|\n)\s*>?\s*(?:\*\*)?(?:Candidate(?: session)?|Producer|Author session)(?:\*\*)?:\s*`?([a-zA-Z0-9._-]+)`?/i);
    if (candidateMatch) {
      const val = candidateMatch[1].trim();
      // No 40-hex commit SHA as owner
      if (!/^[0-9a-fA-F]{40}$/.test(val)) {
        producerOwner = val;
      }
    }
  }

  if (!producerOwner && options.producer) {
    const val = options.producer.trim();
    if (!/^[0-9a-fA-F]{40}$/.test(val)) {
      producerOwner = val;
    }
  }

  // Spec Rule 4: Exit 2 if either owner cannot be determined. Unknown is not independent.
  if (!producerOwner) {
    throw new Error('Cannot determine candidate producer owner name from declared repository inputs (--producer, review Producer/Candidate header, or candidate journal Evidence owner). Unknown is not independent.');
  }

  // Check TASK.md for excluded roles per PROTO-DEC-0041 item 1:
  // "author, the executor, the controller of that candidate, or any member of the executing pair"
  const excludedRoles = new Map();
  const taskPath = options.task ? path.resolve(cwd, options.task) : path.resolve(cwd, '.ai', 'TASK.md');
  if (fs.existsSync(taskPath)) {
    const taskContent = fs.readFileSync(taskPath, 'utf8');
    const rolesSection = taskContent.split(/##\s+/).find(s => s.startsWith('Roles'));
    if (rolesSection) {
      const lines = rolesSection.split(/\r?\n/);
      for (const line of lines) {
        const match = line.match(/^-\s*([a-zA-Z0-9_.-]+)(?:\s*\([^)]+\))?:\s*([^\n;]+)/i);
        if (match) {
          const agent = match[1].toLowerCase();
          const roleDesc = match[2].toLowerCase();
          if (roleDesc.includes('implementer')) {
            excludedRoles.set(agent, 'implementer');
          } else if (roleDesc.includes('controller')) {
            excludedRoles.set(agent, 'controller');
          } else if (roleDesc.includes('coordinator')) {
            excludedRoles.set(agent, 'coordinator');
          } else if (roleDesc.includes('author')) {
            excludedRoles.set(agent, 'author');
          } else if (roleDesc.includes('executor')) {
            excludedRoles.set(agent, 'executor');
          } else if (roleDesc.includes('pair')) {
            excludedRoles.set(agent, 'executing pair');
          }
        }
      }
    }
  }

  // Spec Rule 3: Exit 1 if they are equal, or if the review's owner appears in an excluded role
  // in .ai/TASK.md roles, naming which rule matched.
  if (reviewerOwner === producerOwner) {
    return {
      independent: false,
      exitCode: 1,
      rule: 'RECEIPT_OWNER_EQUALS_PRODUCER',
      reviewerOwner,
      producerOwner,
      message: `Independence violation: Reviewer Receipt-Owner ('${reviewerOwner}') is identical to candidate producer owner ('${producerOwner}'). (PROTO-DEC-0041 item 1)`
    };
  }

  const reviewerAgent = reviewerOwner.split('-')[0].toLowerCase();
  if (excludedRoles.has(reviewerAgent)) {
    const matchedRole = excludedRoles.get(reviewerAgent);
    return {
      independent: false,
      exitCode: 1,
      rule: 'REVIEWER_EXCLUDED_BY_TASK_ROLE',
      reviewerOwner,
      producerOwner,
      message: `Independence violation: Reviewer owner '${reviewerOwner}' appears as ${matchedRole} (${reviewerAgent}) in .ai/TASK.md roles. (PROTO-DEC-0041 item 1)`
    };
  }

  return {
    independent: true,
    exitCode: 0,
    reviewerOwner,
    producerOwner,
    message: `Independence check PASS: Reviewer '${reviewerOwner}' is independent of producer '${producerOwner}'.`
  };
}

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--baseline') {
      options.baseline = argv[++i];
    } else if (arg === '--scope') {
      options.scope = argv[++i];
    } else if (arg === '--forbidden') {
      options.forbidden = argv[++i];
    } else if (arg === '--independence') {
      options.independence = argv[++i];
    } else if (arg === '--producer') {
      options.producer = argv[++i];
    } else if (arg === '--candidate-journal') {
      options.candidateJournal = argv[++i];
    } else if (arg === '--cwd') {
      options.cwd = argv[++i];
    }
  }
  return options;
}

function main(argv) {
  const options = parseArgs(argv);

  if (options.independence) {
    try {
      const res = checkIndependence(options.independence, options);
      if (!res.independent) {
        process.stdout.write(`FAIL (exit 1): ${res.message}\n`);
        return 1;
      }
      process.stdout.write(`${res.message}\n`);
      return 0;
    } catch (err) {
      process.stderr.write(`BLOCKED (exit 2): ${err.message}\n`);
      return 2;
    }
  }

  if (options.baseline || options.scope) {
    try {
      const res = checkScope(options.baseline, options.scope, options.forbidden, options.cwd);
      if (!res.passed) {
        process.stdout.write('SCOPE CHECK FAILED (exit 1):\n');
        if (res.offendingOutOfScope.length > 0) {
          process.stdout.write('Offending out-of-scope paths:\n');
          for (const p of res.offendingOutOfScope) {
            process.stdout.write(`  - OUT_OF_SCOPE: ${p}\n`);
          }
        }
        if (res.offendingForbidden.length > 0) {
          process.stdout.write('Offending forbidden paths:\n');
          for (const f of res.offendingForbidden) {
            process.stdout.write(`  - FORBIDDEN: ${f.path} (matched rule '${f.forbiddenMatch}')\n`);
          }
        }
        return 1;
      }
      process.stdout.write(`SCOPE CHECK PASS: All ${res.touchedCount} touched paths are inside declared scope and none are forbidden.\n`);
      return 0;
    } catch (err) {
      process.stderr.write(`BLOCKED (exit 2): ${err.message}\n`);
      return 2;
    }
  }

  process.stderr.write('Usage:\n');
  process.stderr.write('  protocol-scope.cjs --baseline <sha> --scope <paths-file> [--forbidden <file>]\n');
  process.stderr.write('  protocol-scope.cjs --independence <review-path> [--producer <owner>]\n');
  return 2;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = {
  STANDING_DEFAULT_FORBIDDEN,
  pathMatches,
  checkScope,
  checkIndependence,
  main,
};
