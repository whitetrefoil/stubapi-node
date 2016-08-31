'use strict';

const Promise      = require('bluebird');
const del          = require('del');
const gulp         = require('gulp');
const gutil        = require('gulp-util');
const path         = require('path');
const config       = require('../config');
const helpers      = require('../helpers');
const processBabel = require('./babel');
const asynk        = Promise.coroutine;

gulp.task('watch', asynk(function *buildTask() {

  yield del(config.outputDir);
  yield processBabel();

  const watcher = gulp.watch(helpers.sourceAnd('**/*.js'));

  watcher.on('change', asynk(function *rebuild(event) {
    const absPath    = event.path;
    const sourcePath = path.relative(config.sourceDir, absPath);

    if (event.type === 'deleted') {
      gutil.log(`Deleting "${sourcePath}`);
      yield del(helpers.outputAnd(sourcePath));
      yield del(helpers.outputAnd(sourcePath + '.map'));
      return;
    }

    gutil.log(`Building "${sourcePath}"`);
    yield processBabel(sourcePath);
  }));
}));
