// Other Helpers
// -----

'use strict';

const path = require('path');

const config = require('./config');


/**
 * @returns {object} the same object of what to be exported.
 */
module.exports.initialize = () => {

  module.exports.rootAnd = pathInRoot => {
    return path.join(config.appRoot, pathInRoot);
  };

  module.exports.sourceAnd = pathInSource => {
    return path.join(config.sourceDir, pathInSource);
  };

  module.exports.outputAnd = pathInOutput => {
    return path.join(config.outputDir, pathInOutput);
  };

  return module.exports;
};
