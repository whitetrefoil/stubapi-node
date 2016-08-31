'use strict';

const Promise    = require('bluebird');
const gulp       = require('gulp');
const babel      = require('gulp-babel');
const header     = require('gulp-header');
const gIf        = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');

const config  = require('../config');
const helpers = require('../helpers');

const processBabel = function processBabel(file = '**/*.js') {
  return new Promise((resolve, reject) => {
    gulp.src(helpers.sourceAnd(file), { base: config.sourceDir })
      .pipe(gIf(!config.isProduction, header("import 'source-map-support/register';\n")))
      .pipe(sourcemaps.init())
      .pipe(babel({ sourceMaps: false }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(config.outputDir))
      .on('error', err => {
        return reject(err);
      })
      .on('end', () => {
        return resolve();
      });
  });
};

module.exports = processBabel;
