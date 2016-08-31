// Common configuration for Gulp put here.

// Default Settings
// -----

'use strict';

/**
 * @param {string} appRoot - root directory of the application.
 * @returns {object} the same object of what to be exported.
 */
module.exports.initialize = (appRoot) => {

  module.exports.appRoot = appRoot;

  module.exports.sourceDir = 'src';

  module.exports.outputDir = 'lib';

  return module.exports;
};
