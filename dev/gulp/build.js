'use strict';

const Promise      = require('bluebird');
const del          = require('del');
const gulp         = require('gulp');
const gutil        = require('gulp-util');
const config       = require('../config');
const processBabel = require('./babel');
const asynk        = Promise.coroutine;

gulp.task('build', asynk(function *buildTask() {
  // TODO: env
  gutil.log(`Deleting "${config.outputDir}"`);
  yield del(config.outputDir);
  gutil.log('Done deleting, start processing babel');
  yield processBabel();
  gutil.log('Done building.');
}));
