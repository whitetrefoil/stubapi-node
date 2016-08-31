// "eslint" Gulp Task & Helper Function
// ==========

'use strict';

const path = require('path');

const _          = require('lodash');
const fs         = require('fs-extra');
const gulp       = require('gulp');
const eslint     = require('gulp-eslint');
const gutil      = require('gulp-util');
const xmlbuilder = require('xmlbuilder');

const config = require('../config');

const messageHandlerFactory = (level, testcase) => {
  return message => {
    const attributes = { type: message.ruleId };
    const detailText = `L${message.line}:${message.column} - ${message.message}\n`
      + `Source: \`${message.source}\`\n`;

    testcase.ele(level, attributes, detailText);
  };
};

const caseHandlerFactory = suite => {
  return file => {
    const testcase = suite.ele('testcase', {
      name    : file.filePath,
      failures: file.errorCount,
      warnings: file.warningCount,
    });

    const messages = _.groupBy(file.messages, 'severity');

    _.forEach(messages['1'], messageHandlerFactory('warning', testcase));
    _.forEach(messages['2'], messageHandlerFactory('failure', testcase));
  };
};

const createSuite = results => {
  const testsuite = xmlbuilder.create('testsuite');
  testsuite.att('name', 'ESLint');
  testsuite.att('package', 'org.eslint');
  testsuite.att('tests', results.length);
  testsuite.att('failures', results.errorCount);
  testsuite.att('warnings', results.warningCount);

  _.forEach(results, caseHandlerFactory(testsuite));

  return testsuite;
};

const junitFormatter = results => {

  fs.ensureDirSync('test_results/junit');

  const testsuite = createSuite(results);

  fs.writeFileSync('test_results/junit/eslint.xml', testsuite.end({ pretty: true }));
};

const wrapFormatterWithRelativePath = (formatter = 'stylish') => {
  let format;

  if (_.isFunction(formatter)) {
    format = formatter;
  } else if (_.isString(formatter)) {
    try {
      // eslint-disable-next-line global-require
      format = require(`eslint/lib/formatters/${formatter}`);
    } catch (e) {
      throw new gutil.PluginError('Task "eslint"'
        , 'No such formatter found!'
        , { showStack: false }
      );
    }
  } else {
    throw new gutil.PluginError('Task "eslint"'
      , 'ESLint formatter must be a string, '
      + 'function or `undefined` (default value is "stylish").'
      , { showStack: false }
    );
  }

  return results => {
    // The original `results` is wired, it is an array,
    // but has some extra properties like an object.
    // `_.map`, `_.clone` cannot handle it.
    // Use `_.defaults` to workaround it.
    const resultsWithRelativePaths = _.map(results, result => {
      return _.extend({}, result, {
        filePath: path.relative(config.appRoot, result.filePath),
      });
    });
    return format(_.defaults(resultsWithRelativePaths, results));
  };
};


const processESLint = (files = [
  '**/*.js',
  '!node_modules/**',
  '!lib/**',
  '!lib-*/**',
  '!lib_*/**',
]) => {
  gulp.src(files)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.format(wrapFormatterWithRelativePath(junitFormatter)))
    .pipe(eslint.format(wrapFormatterWithRelativePath('html'), html => {
      fs.ensureDirSync('test_results/html');
      fs.writeFileSync('test_results/html/eslint.html', html);
    }))
  ;
};


gulp.task('eslint', () => {
  return processESLint();
});

module.exports.eslint = processESLint;
