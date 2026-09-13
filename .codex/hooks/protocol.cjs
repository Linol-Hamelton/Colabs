'use strict';

// Contract: https://learn.chatgpt.com/docs/hooks
const hooks = require('../../.ai/bin/protocol-hooks.cjs');
function main() { hooks.main('codex'); }
if (require.main === module) main();
module.exports = { main };
