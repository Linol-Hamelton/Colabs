#!/usr/bin/env node

/**
 * protocol-runrecord.cjs - Run Record Library and CLI
 * Schema: run-record/1
 * 
 * Library exports:
 * - validateRecord(obj) -> string[]
 * - serializeRecord(obj) -> string
 * - appendRecord(file, obj)
 * - readRecords(file) -> obj[]
 * - renderUsage(records, options) -> string
 * - collapseSessions(rows) -> {sessions, rows}
 * 
 * CLI commands:
 * - validate <file.jsonl>
 * - append <file.jsonl> <record.json>
 * - render <file.jsonl> [--frame <id>] [--out <path.md>]
 * - sessions [--dir <metrics-dir>]
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ============================================================================
// S1-S3: Schema validation constants and helpers
// ============================================================================

const SCHEMA_VERSION = 'run-record/1';

const REQUIRED_KEYS = [
  'schema', 'runId', 'slot', 'frame', 'role', 'selection', 'resolution',
  'pins', 'attempts', 'budget', 'cost', 'completion', 'state', 'fallen',
  'transitions', 'outputs'
];

const KEY_ORDER = [
  'schema', 'runId', 'slot', 'frame', 'role', 'selection', 'resolution',
  'pins', 'attempts', 'budget', 'cost', 'completion', 'state', 'fallen',
  'transitions', 'outputs'
];

const SELECTION_VALUES = new Set(['owner', 'resolver']);

const STATE_VALUES = new Set(['DONE', 'BLOCKED', 'FAILED']);

const ATTEMPT_REASONS = new Set([
  'first', 'transient-retry', 'resume', 'route-change',
  'model-change', 'repair', 'quality-escalation'
]);

const ATTEMPT_KINDS = new Set(['fresh', 'resume']);

const ATTEMPT_ROUTE_ROLES = new Set(['primary', 'substitute-1', 'substitute-2']);

const MODEL_RAN_SOURCES = new Set(['client-output', 'requested', 'unknown']);

const TOKEN_SOURCES = new Set(['client-output', 'none']);

const COST_UNITS = new Set(['USD', 'credits', 'tokens', null]);

const STRUCTURAL_CHECK_VALUES = new Set(['pass', 'fail', 'none']);

const VALIDATOR_VALUES = new Set(['pass', 'fail', 'n/a']);

/* Canonical failure classes from PROTO-DEC-0075 item 4 (15 names) + NONE + UNCLASSIFIED */
const FAILURE_CLASSES = new Set([
  'NONE',
  'AUTH_ERROR', 'CONFIG_ERROR', 'MODEL_UNAVAILABLE', 'QUOTA_EXHAUSTED',
  'RATE_LIMIT', 'NETWORK_ERROR', 'PROVIDER_ERROR', 'PROCESS_CRASH',
  'STALL', 'TIMEOUT', 'INVALID_OUTPUT', 'VALIDATION_FAILURE',
  'SEMANTIC_FAILURE', 'DEPENDENCY_FAILURE', 'POLICY_FAILURE',
  'UNCLASSIFIED'
]);

// 11 states from PROTO-DEC-0075 item 11
const STATES_11 = new Set([
  'DISPATCHED', 'LAUNCHED', 'RUNNING', 'STALLED', 'RESUMING',
  'RECOVERING', 'WAITING', 'BLOCKED', 'FAILED', 'DONE', 'CANCELLED'
]);

// ============================================================================
// Resolution object validation
// ============================================================================

const RESOLUTION_REQUIRED = ['primary', 'substitutes', 'excluded', 'skipped', 'unverified'];

function validateRoute(obj, jsonPath) {
  const errors = [];
  
  if (typeof obj !== 'object' || obj === null) {
    errors.push(`${jsonPath}: must be an object`);
    return errors;
  }
  
  if (typeof obj.client !== 'string' || obj.client.length === 0) {
    errors.push(`${jsonPath}.client: must be a non-empty string`);
  }
  
  if (typeof obj.model !== 'string' || obj.model.length === 0) {
    errors.push(`${jsonPath}.model: must be a non-empty string`);
  }
  
  if (obj.effort !== null && typeof obj.effort !== 'string') {
    errors.push(`${jsonPath}.effort: must be a string or null`);
  }
  
  return errors;
}

function validateResolution(resolution, jsonPath, selection) {
  const errors = [];
  
  if (typeof resolution !== 'object' || resolution === null) {
    errors.push(`${jsonPath}: must be an object`);
    return errors;
  }
  
  // Check required keys
  for (const key of RESOLUTION_REQUIRED) {
    if (!(key in resolution)) {
      errors.push(`${jsonPath}.${key}: required field missing`);
    }
  }
  
  // ladderSnapshot: required for resolver, optional for owner
  if (selection === 'resolver') {
    if (resolution.ladderSnapshot === null || typeof resolution.ladderSnapshot !== 'string') {
      errors.push(`${jsonPath}.ladderSnapshot: must be a non-null string for selection=resolver`);
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(resolution.ladderSnapshot)) {
      errors.push(`${jsonPath}.ladderSnapshot: must be YYYY-MM-DD format`);
    }
  } else if (resolution.ladderSnapshot !== null && typeof resolution.ladderSnapshot !== 'string') {
    errors.push(`${jsonPath}.ladderSnapshot: must be a string or null`);
  }
  
  // primary
  if (resolution.primary) {
    errors.push(...validateRoute(resolution.primary, `${jsonPath}.primary`));
  }
  
  // substitutes
  if (Array.isArray(resolution.substitutes)) {
    resolution.substitutes.forEach((sub, i) => {
      errors.push(...validateRoute(sub, `${jsonPath}.substitutes[${i}]`));
    });
  } else {
    errors.push(`${jsonPath}.substitutes: must be an array`);
  }
  
  // excluded, skipped, unverified: arrays of objects with specific keys
  const arrayFields = [
    { key: 'excluded', itemKeys: ['rung', 'reason'] },
    { key: 'skipped', itemKeys: ['rung', 'reason'] },
    { key: 'unverified', itemKeys: ['rung', 'constraint'] }
  ];
  
  for (const { key, itemKeys } of arrayFields) {
    if (!Array.isArray(resolution[key])) {
      errors.push(`${jsonPath}.${key}: must be an array`);
    } else {
      resolution[key].forEach((item, i) => {
        if (typeof item !== 'object' || item === null) {
          errors.push(`${jsonPath}.${key}[${i}]: must be an object`);
        } else {
          for (const ik of itemKeys) {
            if (typeof item[ik] !== 'string') {
              errors.push(`${jsonPath}.${key}[${i}].${ik}: must be a string`);
            }
          }
        }
      });
    }
  }
  
  // approval and shortfall are optional strings or null
  if (resolution.approval !== null && typeof resolution.approval !== 'string') {
    errors.push(`${jsonPath}.approval: must be a string or null`);
  }
  if (resolution.shortfall !== null && typeof resolution.shortfall !== 'string') {
    errors.push(`${jsonPath}.shortfall: must be a string or null`);
  }
  
  // For selection=owner, excluded/skipped/unverified must be empty
  if (selection === 'owner') {
    for (const key of ['excluded', 'skipped', 'unverified']) {
      if (!Array.isArray(resolution[key]) || resolution[key].length > 0) {
        errors.push(`${jsonPath}.${key}: must be an empty array for selection=owner`);
      }
    }
  }
  
  return errors;
}

// ============================================================================
// Pins validation
// ============================================================================

const PINS_REQUIRED = ['head', 'launchFile', 'launchSha256', 'dispatchVersion'];

function validatePins(pins, jsonPath) {
  const errors = [];
  
  if (typeof pins !== 'object' || pins === null) {
    errors.push(`${jsonPath}: must be an object`);
    return errors;
  }
  
  for (const key of PINS_REQUIRED) {
    if (!(key in pins)) {
      errors.push(`${jsonPath}.${key}: required field missing`);
    }
  }
  
  if (pins.head && !/^[0-9a-f]{40}$/.test(pins.head)) {
    errors.push(`${jsonPath}.head: must be 40 hex characters`);
  }
  
  if (pins.launchFile && typeof pins.launchFile !== 'string') {
    errors.push(`${jsonPath}.launchFile: must be a string`);
  }
  
  if (pins.launchSha256 && !/^[0-9a-f]{64}$/.test(pins.launchSha256)) {
    errors.push(`${jsonPath}.launchSha256: must be 64 hex characters`);
  }
  
  if (pins.roleSha256 !== null && pins.roleSha256 !== undefined) {
    if (pins.roleSha256 === null) {
      // null is allowed
    } else if (!/^[0-9a-f]{64}$/.test(pins.roleSha256)) {
      errors.push(`${jsonPath}.roleSha256: must be 64 hex characters or null`);
    }
  }
  
  if (pins.corpusHash !== null && pins.corpusHash !== undefined) {
    if (pins.corpusHash === null) {
      // null is allowed
    } else if (!/^[0-9a-f]{64}$/.test(pins.corpusHash)) {
      errors.push(`${jsonPath}.corpusHash: must be 64 hex characters or null`);
    }
  }
  
  if (pins.dispatchVersion && typeof pins.dispatchVersion !== 'string') {
    errors.push(`${jsonPath}.dispatchVersion: must be a string`);
  }
  
  return errors;
}

// ============================================================================
// Attempt validation
// ============================================================================

const ATTEMPT_REQUIRED = [
  'n', 'kind', 'reason', 'routeRole', 'route', 'modelRan',
  'start', 'class', 'tokens', 'usage'
];

function validateAttempt(attempt, jsonPath) {
  const errors = [];
  
  if (typeof attempt !== 'object' || attempt === null) {
    errors.push(`${jsonPath}: must be an object`);
    return errors;
  }
  
  // Check required keys
  for (const key of ATTEMPT_REQUIRED) {
    if (!(key in attempt)) {
      errors.push(`${jsonPath}.${key}: required field missing`);
    }
  }
  
  // n: >= 1
  if (typeof attempt.n !== 'number' || attempt.n < 1 || !Number.isInteger(attempt.n)) {
    errors.push(`${jsonPath}.n: must be an integer >= 1`);
  }
  
  // kind
  if (!ATTEMPT_KINDS.has(attempt.kind)) {
    errors.push(`${jsonPath}.kind: must be "fresh" or "resume"`);
  }
  
  // reason
  if (!ATTEMPT_REASONS.has(attempt.reason)) {
    errors.push(`${jsonPath}.reason: must be one of ${Array.from(ATTEMPT_REASONS).join(', ')}`);
  }
  
  // routeRole
  if (!ATTEMPT_ROUTE_ROLES.has(attempt.routeRole)) {
    errors.push(`${jsonPath}.routeRole: must be one of ${Array.from(ATTEMPT_ROUTE_ROLES).join(', ')}`);
  }
  
  // route
  if (attempt.route) {
    errors.push(...validateRoute(attempt.route, `${jsonPath}.route`));
  }
  
  // effortUsed: string or null
  if (attempt.effortUsed !== null && typeof attempt.effortUsed !== 'string') {
    errors.push(`${jsonPath}.effortUsed: must be a string or null`);
  }
  
  // modelRan
  if (typeof attempt.modelRan !== 'object' || attempt.modelRan === null) {
    errors.push(`${jsonPath}.modelRan: must be an object`);
  } else {
    if (!MODEL_RAN_SOURCES.has(attempt.modelRan.source)) {
      errors.push(`${jsonPath}.modelRan.source: must be one of ${Array.from(MODEL_RAN_SOURCES).join(', ')}`);
    }
    if (attempt.modelRan.id !== null && typeof attempt.modelRan.id !== 'string') {
      errors.push(`${jsonPath}.modelRan.id: must be a string or null`);
    }
  }
  
  // sessionId: string or null
  if (attempt.sessionId !== null && typeof attempt.sessionId !== 'string') {
    errors.push(`${jsonPath}.sessionId: must be a string or null`);
  }
  
  // start: ISO-8601 UTC
  if (typeof attempt.start !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(attempt.start)) {
    errors.push(`${jsonPath}.start: must be ISO-8601 UTC format (YYYY-MM-DDTHH:MM:SSZ)`);
  }
  
  // end: ISO-8601 UTC or null
  if (attempt.end !== null) {
    if (typeof attempt.end !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(attempt.end)) {
      errors.push(`${jsonPath}.end: must be ISO-8601 UTC format or null`);
    } else if (attempt.start && attempt.end && attempt.end < attempt.start) {
      errors.push(`${jsonPath}.end: must be >= start (BACKLOG S-6)`);
    }
  }
  
  // exitCode: int or null
  if (attempt.exitCode !== null && (typeof attempt.exitCode !== 'number' || !Number.isInteger(attempt.exitCode))) {
    errors.push(`${jsonPath}.exitCode: must be an integer or null`);
  }
  
  // class
  if (!FAILURE_CLASSES.has(attempt.class)) {
    errors.push(`${jsonPath}.class: must be one of ${Array.from(FAILURE_CLASSES).join(', ')}`);
  }
  
  // tokens
  if (typeof attempt.tokens !== 'object' || attempt.tokens === null) {
    errors.push(`${jsonPath}.tokens: must be an object`);
  } else {
    if (!TOKEN_SOURCES.has(attempt.tokens.source)) {
      errors.push(`${jsonPath}.tokens.source: must be one of ${Array.from(TOKEN_SOURCES).join(', ')}`);
    }
    if (attempt.tokens.source === 'none') {
      if (attempt.tokens.in !== null || attempt.tokens.out !== null) {
        errors.push(`${jsonPath}.tokens: source "none" requires in and out to be null`);
      }
    } else {
      if (attempt.tokens.in !== null && (typeof attempt.tokens.in !== 'number' || !Number.isInteger(attempt.tokens.in))) {
        errors.push(`${jsonPath}.tokens.in: must be an integer or null`);
      }
      if (attempt.tokens.out !== null && (typeof attempt.tokens.out !== 'number' || !Number.isInteger(attempt.tokens.out))) {
        errors.push(`${jsonPath}.tokens.out: must be an integer or null`);
      }
    }
  }
  
  // usage
  if (typeof attempt.usage !== 'object' || attempt.usage === null) {
    errors.push(`${jsonPath}.usage: must be an object`);
  } else {
    if (attempt.usage.amount !== null && typeof attempt.usage.amount !== 'number') {
      errors.push(`${jsonPath}.usage.amount: must be a number or null`);
    }
    if (attempt.usage.unit !== null) {
      if (typeof attempt.usage.unit !== 'string') {
        errors.push(`${jsonPath}.usage.unit: must be a string or null`);
      } else if (!COST_UNITS.has(attempt.usage.unit)) {
        errors.push(`${jsonPath}.usage.unit: must be one of USD, credits, tokens, or null`);
      }
    }
  }
  
  return errors;
}

// ============================================================================
// Budget validation
// ============================================================================

function validateBudget(budget, jsonPath, attempts) {
  const errors = [];
  
  if (typeof budget !== 'object' || budget === null) {
    errors.push(`${jsonPath}: must be an object`);
    return errors;
  }
  
  // Check types
  if (typeof budget.freshUsed !== 'number' || !Number.isInteger(budget.freshUsed)) {
    errors.push(`${jsonPath}.freshUsed: must be an integer`);
  }
  if (typeof budget.resumes !== 'number' || !Number.isInteger(budget.resumes)) {
    errors.push(`${jsonPath}.resumes: must be an integer`);
  }
  if (typeof budget.stallMin !== 'number' || !Number.isInteger(budget.stallMin)) {
    errors.push(`${jsonPath}.stallMin: must be an integer`);
  }
  if (typeof budget.hardMin !== 'number' || !Number.isInteger(budget.hardMin)) {
    errors.push(`${jsonPath}.hardMin: must be an integer`);
  }
  
  // Validate counts against attempts if provided (PROTO-DEC-0075 items 3, 5)
  if (Array.isArray(attempts)) {
    const freshCount = attempts.filter(a => a.kind === 'fresh').length;
    const resumeCount = attempts.filter(a => a.kind === 'resume').length;
    
    if (budget.freshUsed !== freshCount) {
      errors.push(`${jsonPath}.freshUsed: must equal ${freshCount} (actual fresh attempt count)`);
    }
    if (budget.resumes !== resumeCount) {
      errors.push(`${jsonPath}.resumes: must equal ${resumeCount} (actual resume count)`);
    }
    
    // Budget constraints (PROTO-DEC-0075 item 3)
    // Maximum 2 fresh attempts with routeRole = primary
    const primaryFresh = attempts.filter(a => a.kind === 'fresh' && a.routeRole === 'primary');
    if (primaryFresh.length > 2) {
      errors.push(`${jsonPath}: maximum 2 fresh attempts with routeRole=primary (has ${primaryFresh.length})`);
    }
    
    // Maximum 2 fresh attempts per substitute
    const freshBySubstitute = {};
    attempts.filter(a => a.kind === 'fresh' && a.routeRole !== 'primary').forEach(a => {
      freshBySubstitute[a.routeRole] = (freshBySubstitute[a.routeRole] || 0) + 1;
    });
    for (const [sub, count] of Object.entries(freshBySubstitute)) {
      if (count > 2) {
        errors.push(`${jsonPath}: maximum 2 fresh attempts for substitute ${sub} (has ${count})`);
      }
    }
    
    // Maximum 6 fresh attempts in total
    if (freshCount > 6) {
      errors.push(`${jsonPath}: maximum 6 fresh attempts in total (has ${freshCount})`);
    }
  }
  
  return errors;
}

// ============================================================================
// Cost validation
// ============================================================================

function validateCost(cost, jsonPath) {
  const errors = [];
  
  if (typeof cost !== 'object' || cost === null) {
    errors.push(`${jsonPath}: must be an object`);
    return errors;
  }
  
  const numericKeys = ['estimated', 'actual', 'cumulative'];
  for (const key of numericKeys) {
    if (cost[key] !== null && typeof cost[key] !== 'number') {
      errors.push(`${jsonPath}.${key}: must be a number or null`);
    }
  }
  
  if (cost.unit !== null) {
    if (typeof cost.unit !== 'string') {
      errors.push(`${jsonPath}.unit: must be a string or null`);
    } else if (!COST_UNITS.has(cost.unit)) {
      errors.push(`${jsonPath}.unit: must be one of USD, credits, tokens, or null`);
    }
    
    // Check if any numeric is present, unit is required
    const hasNumeric = numericKeys.some(k => cost[k] !== null);
    if (hasNumeric && cost.unit === null) {
      errors.push(`${jsonPath}.unit: required when any numeric field is present`);
    }
  }
  
  return errors;
}

// ============================================================================
// Completion validation
// ============================================================================

const COMPLETION_REQUIRED = [
  'processEnded', 'exitCode', 'outputsPresent', 'outputsNonEmpty',
  'structuralCheck', 'validator', 'evidence', 'supervisorDone'
];

function validateCompletion(completion, jsonPath, state) {
  const errors = [];
  
  if (typeof completion !== 'object' || completion === null) {
    errors.push(`${jsonPath}: must be an object`);
    return errors;
  }
  
  for (const key of COMPLETION_REQUIRED) {
    if (!(key in completion)) {
      errors.push(`${jsonPath}.${key}: required field missing`);
    }
  }
  
  // processEnded
  if (typeof completion.processEnded !== 'boolean') {
    errors.push(`${jsonPath}.processEnded: must be a boolean`);
  }
  
  // exitCode: int or null
  if (completion.exitCode !== null && (typeof completion.exitCode !== 'number' || !Number.isInteger(completion.exitCode))) {
    errors.push(`${jsonPath}.exitCode: must be an integer or null`);
  }
  
  // booleans
  const boolKeys = ['outputsPresent', 'outputsNonEmpty', 'supervisorDone'];
  for (const key of boolKeys) {
    if (typeof completion[key] !== 'boolean') {
      errors.push(`${jsonPath}.${key}: must be a boolean`);
    }
  }
  
  // structuralCheck
  if (!STRUCTURAL_CHECK_VALUES.has(completion.structuralCheck)) {
    errors.push(`${jsonPath}.structuralCheck: must be "pass", "fail", or "none"`);
  }
  
  // validator
  if (!VALIDATOR_VALUES.has(completion.validator)) {
    errors.push(`${jsonPath}.validator: must be "pass", "fail", or "n/a"`);
  }
  
  // evidence: string or null
  if (completion.evidence !== null && typeof completion.evidence !== 'string') {
    errors.push(`${jsonPath}.evidence: must be a string or null`);
  }
  
  // If state is DONE, validate all required fields
  if (state === 'DONE') {
    const doneChecks = [
      { field: 'processEnded', value: true },
      { field: 'exitCode', check: v => v !== null },
      { field: 'outputsPresent', value: true },
      { field: 'outputsNonEmpty', value: true },
      { field: 'structuralCheck', value: 'pass' },
      { field: 'validator', check: v => v !== 'fail' },
      { field: 'evidence', check: v => v !== null },
      { field: 'supervisorDone', value: true }
    ];
    
    for (const check of doneChecks) {
      const field = check.field;
      const value = completion[field];
      let valid = false;
      
      if ('value' in check) {
        valid = value === check.value;
      } else if ('check' in check) {
        valid = check.check(value);
      }
      
      if (!valid) {
        errors.push(`${jsonPath}.${field}: for state=DONE, must be valid (see PROTO-DEC-0075 item 6)`);
      }
    }
  }
  
  return errors;
}

// ============================================================================
// Transitions validation
// ============================================================================

function validateTransition(transition, jsonPath) {
  const errors = [];
  
  if (typeof transition !== 'object' || transition === null) {
    errors.push(`${jsonPath}: must be an object`);
    return errors;
  }
  
  const required = ['from', 'to', 'at', 'reason'];
  for (const key of required) {
    if (!(key in transition)) {
      errors.push(`${jsonPath}.${key}: required field missing`);
    }
  }
  
  if (typeof transition.from !== 'string' || !STATES_11.has(transition.from)) {
    errors.push(`${jsonPath}.from: must be one of the 11 states`);
  }
  if (typeof transition.to !== 'string' || !STATES_11.has(transition.to)) {
    errors.push(`${jsonPath}.to: must be one of the 11 states`);
  }
  if (typeof transition.at !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(transition.at)) {
    errors.push(`${jsonPath}.at: must be ISO-8601 UTC format`);
  }
  if (typeof transition.reason !== 'string' || transition.reason.length === 0) {
    errors.push(`${jsonPath}.reason: must be a non-empty string`);
  }
  
  return errors;
}

// ============================================================================
// Main validation function
// ============================================================================

function validateRecord(obj) {
  const errors = [];
  
  if (typeof obj !== 'object' || obj === null) {
    return ['root: must be a non-null object'];
  }
  
  // Check for unknown keys
  const objKeys = Object.keys(obj);
  for (const key of objKeys) {
    if (!KEY_ORDER.includes(key)) {
      errors.push(`root.${key}: unknown key`);
    }
  }
  
  // Check schema version
  if (obj.schema !== SCHEMA_VERSION) {
    errors.push(`root.schema: must be "${SCHEMA_VERSION}"`);
  }
  
  // Check required keys
  for (const key of REQUIRED_KEYS) {
    if (!(key in obj)) {
      errors.push(`root.${key}: required field missing`);
    }
  }
  
  // Check key order - all KEY_ORDER keys that exist must appear in that order
  const keyOrderIndex = new Map(KEY_ORDER.map((k, i) => [k, i]));
  let lastIndex = -1;
  for (const key of objKeys) {
    if (keyOrderIndex.has(key)) {
      const currentIndex = keyOrderIndex.get(key);
      if (currentIndex < lastIndex) {
        errors.push(`root: keys must appear in order: ${KEY_ORDER.join(', ')}`);
        break;
      }
      lastIndex = currentIndex;
    }
  }
  
  // runId
  if (typeof obj.runId !== 'string') {
    errors.push('root.runId: must be a string');
  } else {
    if (!/^R-\d{4}\d{2}\d{2}T\d{2}\d{2}\d{2}Z-[A-Za-z0-9._-]{1,64}$/.test(obj.runId)) {
      errors.push('root.runId: must match R-<YYYYMMDDTHHMMSSZ>-<slot>');
    }
  }
  
  // slot
  if (typeof obj.slot !== 'string') {
    errors.push('root.slot: must be a string');
  } else if (!/^[A-Za-z0-9._-]{1,64}$/.test(obj.slot)) {
    errors.push('root.slot: must match [A-Za-z0-9._-]{1,64}');
  }
  
  // Extract slot from runId and verify (only if both are valid strings)
  if (typeof obj.runId === 'string' && typeof obj.slot === 'string') {
    const runIdParts = obj.runId.split('-');
    if (runIdParts.length >= 2) {
      const extractedSlot = runIdParts.slice(2).join('-');
      if (extractedSlot !== obj.slot) {
        errors.push('root.slot: must match the slot part of runId');
      }
    }
  }
  
  // frame
  if (typeof obj.frame !== 'string' || obj.frame.length === 0) {
    errors.push('root.frame: must be a non-empty string');
  }
  
  // role
  if (obj.role !== null && typeof obj.role !== 'string') {
    errors.push('root.role: must be a string or null');
  }
  
  // selection
  if (!SELECTION_VALUES.has(obj.selection)) {
    errors.push(`root.selection: must be "owner" or "resolver"`);
  }
  
  // resolution
  if (obj.resolution) {
    errors.push(...validateResolution(obj.resolution, 'root.resolution', obj.selection));
  }
  
  // pins
  if (obj.pins) {
    errors.push(...validatePins(obj.pins, 'root.pins'));
  }
  
  // attempts
  if (Array.isArray(obj.attempts)) {
    if (obj.attempts.length === 0) {
      errors.push('root.attempts: must have at least one attempt');
    } else {
      // Validate each attempt
      obj.attempts.forEach((attempt, i) => {
        errors.push(...validateAttempt(attempt, `root.attempts[${i}]`));
      });
      
      // Validate attempt ordering (n should be sequential)
      for (let i = 0; i < obj.attempts.length; i++) {
        if (obj.attempts[i].n !== i + 1) {
          errors.push(`root.attempts[${i}].n: attempt numbers must be sequential starting from 1`);
          break;
        }
      }
      
      // Validate budget against attempts
      if (obj.budget) {
        errors.push(...validateBudget(obj.budget, 'root.budget', obj.attempts));
      }
    }
  } else {
    errors.push('root.attempts: must be an array');
  }
  
  // budget
  if (obj.budget) {
    errors.push(...validateBudget(obj.budget, 'root.budget', obj.attempts));
  }
  
  // cost
  if (obj.cost) {
    errors.push(...validateCost(obj.cost, 'root.cost'));
  }
  
  // completion
  if (obj.completion) {
    errors.push(...validateCompletion(obj.completion, 'root.completion', obj.state));
  }
  
  // state
  if (!STATE_VALUES.has(obj.state)) {
    errors.push(`root.state: must be one of ${Array.from(STATE_VALUES).join(', ')}`);
  }
  
  // fallen
  if (typeof obj.fallen !== 'boolean') {
    errors.push('root.fallen: must be a boolean');
  } else {
    // fallen must be false unless state is FAILED and last attempt class is STALL
    if (obj.fallen === true) {
      if (obj.state !== 'FAILED') {
        errors.push('root.fallen: can only be true when state is FAILED');
      } else if (Array.isArray(obj.attempts) && obj.attempts.length > 0) {
        const lastAttempt = obj.attempts[obj.attempts.length - 1];
        if (lastAttempt.class !== 'STALL') {
          errors.push('root.fallen: can only be true when the last attempt class is STALL');
        }
      }
    }
  }
  
  // transitions
  if (Array.isArray(obj.transitions)) {
    obj.transitions.forEach((transition, i) => {
      errors.push(...validateTransition(transition, `root.transitions[${i}]`));
    });
  } else {
    errors.push('root.transitions: must be an array');
  }
  
  // outputs
  if (Array.isArray(obj.outputs)) {
    obj.outputs.forEach((output, i) => {
      if (typeof output !== 'string') {
        errors.push(`root.outputs[${i}]: must be a string (path)`);
      }
    });
  } else {
    errors.push('root.outputs: must be an array');
  }
  
  return errors;
}

// ============================================================================
// Serialization
// ============================================================================

function serializeRecord(obj) {
  // Create a new object with keys in the correct order
  const ordered = {};
  for (const key of KEY_ORDER) {
    if (key in obj) {
      ordered[key] = obj[key];
    }
  }
  return JSON.stringify(ordered) + '\n';
}

// ============================================================================
// File operations
// ============================================================================

function appendRecord(file, obj) {
  const errors = validateRecord(obj);
  if (errors.length > 0) {
    const errMsg = errors.join('; ');
    throw new Error(`Validation failed: ${errMsg}`);
  }
  
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const serialized = serializeRecord(obj);
  fs.appendFileSync(file, serialized);
}

function readRecords(file) {
  if (!fs.existsSync(file)) {
    return [];
  }
  
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const records = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    try {
      const obj = JSON.parse(line);
      const errors = validateRecord(obj);
      if (errors.length > 0) {
        throw new Error(`Invalid record at line ${i + 1}: ${errors.join('; ')}`);
      }
      records.push(obj);
    } catch (err) {
      throw new Error(`Unparseable or invalid line at ${i + 1}: ${err.message}`);
    }
  }
  
  return records;
}

// ============================================================================
// Render usage table
// ============================================================================

function renderUsage(records, options = {}) {
  const { frame } = options;
  
  if (!Array.isArray(records) || records.length === 0) {
    return 'No records to render.\n';
  }
  
  // Filter by frame if specified
  const filtered = frame ? records.filter(r => r.frame === frame) : records;
  
  const rows = filtered.map(record => {
    const lastAttempt = record.attempts[record.attempts.length - 1];
    const client = lastAttempt.route?.client || '-';
    const model = lastAttempt.modelRan?.id || '-';
    const effort = lastAttempt.effortUsed || '-';
    
    const kind = lastAttempt.kind;
    
    // Wall time: first start to last end
    let wallMin = '-';
    if (record.attempts.length > 0) {
      const firstStart = record.attempts[0].start;
      const lastEnd = record.attempts[record.attempts.length - 1].end;
      
      if (firstStart && lastEnd) {
        const startDate = new Date(firstStart);
        const endDate = new Date(lastEnd);
        const diffMs = endDate - startDate;
        const diffMin = Math.round(diffMs / 60000);
        wallMin = diffMin.toString();
      } else if (firstStart) {
        // Only start available
        wallMin = '-';
      }
    }
    
    // Tokens
    const tokensIn = lastAttempt.tokens?.in ?? null;
    const tokensOut = lastAttempt.tokens?.out ?? null;
    const tokensStr = tokensIn !== null || tokensOut !== null 
      ? `${tokensIn ?? '-'}/${tokensOut ?? '-'}`
      : '-';
    
    // Cost
    let costStr = '-';
    if (record.cost) {
      const actual = record.cost.actual ?? null;
      const unit = record.cost.unit ?? null;
      if (actual !== null && unit !== null) {
        costStr = `${actual.toFixed(2)} ${unit}`;
      } else if (actual !== null) {
        costStr = actual.toFixed(2);
      }
    }
    
    const runId = record.runId || '-';
    const slot = record.slot || '-';
    const selection = record.selection || '-';
    const state = record.state || '-';
    
    return { runId, slot, selection, client, model, effort, kind, wallMin, tokens: tokensStr, cost: costStr, state };
  });
  
  // Build markdown table
  const headers = ['Run', 'Slot', 'Selection', 'Client', 'Model', 'Effort', 'Fresh/Resume', 'Wall min', 'Tokens in/out', 'Cost', 'State'];
  
  let md = '| ' + headers.join(' | ') + ' |\n';
  md += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
  
  for (const row of rows) {
    const cells = [
      row.runId,
      row.slot,
      row.selection,
      row.client,
      row.model,
      row.effort,
      row.kind,
      row.wallMin,
      row.tokens,
      row.cost,
      row.state
    ];
    md += '| ' + cells.join(' | ') + ' |\n';
  }
  
  return md + '\n';
}

// ============================================================================
// Collapse sessions
// ============================================================================

function collapseSessions(rows) {
  const sessionsMap = new Map();
  
  for (const row of rows) {
    const session = row.session || 'unknown';
    
    if (!sessionsMap.has(session)) {
      sessionsMap.set(session, {
        session,
        rows: [],
        stops: 0,
        lastTs: row.ts || '',
        agent: row.agent || '',
        changedFiles: 0,
        handoffComplete: row.handoffComplete || false
      });
    }
    
    const entry = sessionsMap.get(session);
    entry.rows.push(row);
    entry.stops = entry.rows.length; // Count all rows as stops
    
    // Update lastTs if this row is newer
    if (row.ts && (!entry.lastTs || row.ts > entry.lastTs)) {
      entry.lastTs = row.ts;
      entry.agent = row.agent || entry.agent;
      entry.changedFiles = Math.max(entry.changedFiles, row.changedFiles || 0);
      entry.handoffComplete = row.handoffComplete || entry.handoffComplete;
    }
  }
  
  const sessions = Array.from(sessionsMap.values());
  
  return {
    sessions,
    rows: rows.length
  };
}

// ============================================================================
// CLI
// ============================================================================

function printUsage() {
  console.log(`USAGE node .ai/bin/protocol-runrecord.cjs <command> [args]

Commands:
  validate <file.jsonl>    Validate records in a JSON Lines file
  append <file.jsonl> <record.json>  Append a validated record to a file
  render <file.jsonl> [--frame <id>] [--out <path.md>]  Render usage table
  sessions [--dir <dir>]   Collapse and count sessions from metrics

Exit codes:
  0: ok
  1: refusal
  2: unknown or malformed`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    printUsage();
    process.exit(2);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'validate': {
      if (args.length < 2) {
        console.log('ERROR reason=missing-file');
        process.exit(2);
      }
      const file = args[1];
      
      try {
        const records = readRecords(file);
        console.log(`SUMMARY records=${records.length} invalid=0`);
        process.exit(0);
      } catch (err) {
        // Try to parse error message for line number
        const match = err.message.match(/line\s+(\d+)/);
        const lineNum = match ? match[1] : 'unknown';
        console.log(`INVALID line=${lineNum} error="${err.message}"`);
        console.log(`SUMMARY records=0 invalid=1`);
        process.exit(2);
      }
      break;
    }
    
    case 'append': {
      if (args.length < 3) {
        console.log('ERROR reason=missing-arguments');
        process.exit(2);
      }
      const file = args[1];
      const recordJson = args[2];
      
      try {
        const record = JSON.parse(fs.readFileSync(recordJson, 'utf8'));
        appendRecord(file, record);
        console.log(`APPENDED runId=${record.runId}`);
        process.exit(0);
      } catch (err) {
        if (err.message.includes('Validation failed')) {
          console.log(`INVALID line=0 error="${err.message}"`);
          process.exit(2);
        } else {
          console.log(`ERROR reason=invalid-record error="${err.message}"`);
          process.exit(2);
        }
      }
      break;
    }
    
    case 'render': {
      if (args.length < 2) {
        console.log('ERROR reason=missing-file');
        process.exit(2);
      }
      
      const file = args[1];
      let frame = null;
      let outPath = null;
      
      for (let i = 2; i < args.length; i++) {
        if (args[i] === '--frame' && i + 1 < args.length) {
          frame = args[++i];
        } else if (args[i] === '--out' && i + 1 < args.length) {
          outPath = args[++i];
        }
      }
      
      try {
        const records = readRecords(file);
        const rendered = renderUsage(records, { frame });
        
        if (outPath) {
          fs.writeFileSync(outPath, rendered);
          console.log(`WROTE path=${outPath}`);
        } else {
          process.stdout.write(rendered);
        }
        process.exit(0);
      } catch (err) {
        console.log(`ERROR reason=render-failed error="${err.message}"`);
        process.exit(2);
      }
      break;
    }
    
    case 'sessions': {
      let dir = '.ai/runtime/metrics';
      
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--dir' && i + 1 < args.length) {
          dir = args[++i];
        }
      }
      
      try {
        // Read sessions.jsonl and sessions.1.jsonl
        const files = ['sessions.jsonl', 'sessions.1.jsonl'];
        let allRows = [];
        
        for (const filename of files) {
          const filepath = path.join(dir, filename);
          if (fs.existsSync(filepath)) {
            const content = fs.readFileSync(filepath, 'utf8');
            const lines = content.split('\n').filter(line => line.trim() !== '');
            
            lines.forEach(line => {
              try {
                const row = JSON.parse(line);
                allRows.push(row);
              } catch (e) {
                // Skip unparseable lines
              }
            });
          }
        }
        
        const result = collapseSessions(allRows);
        
        for (const session of result.sessions) {
          console.log(`SESSION session=${session.session} agent=${session.agent} stops=${session.stops} lastTs=${session.lastTs} changedFiles=${session.changedFiles} handoffComplete=${session.handoffComplete}`);
        }
        
        console.log(`SUMMARY rows=${result.rows} sessions=${result.sessions.length} ratio=${(result.rows / result.sessions.length).toFixed(2)}`);
        process.exit(0);
      } catch (err) {
        console.log(`ERROR reason=unparseable-line error="${err.message}"`);
        process.exit(2);
      }
      break;
    }
    
    default: {
      console.log(`ERROR reason=unknown-command command=${command}`);
      process.exit(2);
    }
  }
}

// ============================================================================
// Module exports
// ============================================================================

module.exports = {
  validateRecord,
  serializeRecord,
  appendRecord,
  readRecords,
  renderUsage,
  collapseSessions
};

// Run CLI if not required as module
if (require.main === module) {
  main();
}
