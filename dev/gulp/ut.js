'use strict';

const chalk         = require('chalk');
const del           = require('del');
const gulp          = require('gulp');
const babel         = require('gulp-babel');
const istanbul      = require('gulp-babel-istanbul');
const injectModules = require('gulp-inject-modules');
const mocha         = require('gulp-mocha');
const plumber       = require('gulp-plumber');
const gutil         = require('gulp-util');

const config  = require('../config');
const helpers = require('../helpers');

gulp.task('ut', done => {

  process.env.BABEL_ENV = 'test';
  process.env.NODE_ENV  = 'test';

  del.sync('test_results');

  gulp.src([helpers.sourceAnd('**/*.js')], { base: config.sourceDir })
    .pipe(istanbul({ includeUntested: true }))
    .pipe(injectModules())

    .on('finish', () => {
      gulp.src(['tests/unit/**/*.spec.js'], { base: 'tests/unit' })
        .pipe(babel({ sourceMaps: false }))
        .pipe(injectModules())
        .pipe(plumber({
          errorHandler: err => { gutil.log(`Mocha: ${chalk.red(err.message)}`); },
        }))
        .pipe(mocha())
        .pipe(istanbul.writeReports({
          dir       : './test_results/coverage',
          reporters : ['clover', 'html'],
          reportOpts: {
            'clover'      : {
              dir : './test_results/coverage',
              file: 'clover.xml',
            },
            'html'        : {
              dir: './test_results/coverage',
            },
            'text-summary': { file: null },
          },
        }))
        .on('end', done)
      ;
    })
  ;
});
