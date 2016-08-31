'use strict';

require('./dev/config').initialize(__dirname);
require('./dev/helpers').initialize();

require('./dev/gulp/build');
require('./dev/gulp/eslint');
require('./dev/gulp/ut');
require('./dev/gulp/watch');
