'use strict';

// Keep the Claude entrypoint and exports compatible with existing installs.
const hooks = require('../../.ai/bin/protocol-hooks.cjs');
if (require.main === module) hooks.main();
module.exports = hooks;
