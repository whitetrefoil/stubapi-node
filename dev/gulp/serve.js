'use strict';

require('babel-core/register');

const Promise      = require('bluebird');
const chalk        = require('chalk');
const childProcess = require('child_process');
const connect      = require('connect');
const del          = require('del');
const gulp         = require('gulp');
const gutil        = require('gulp-util');
const http         = require('http');
const Koa          = require('koa');
const path         = require('path');
const index        = require('../../src/index');
const config       = require('../config');
const helpers      = require('../helpers');
const processBabel = require('./babel');
const asynk        = Promise.coroutine;

// ### Starter functions

/**
 * @return {http.Server}
 */
const standaloneKoa = function standaloneKoa() {
  return index.koaStandalone();
};

/**
 * @return {http.Server}
 */
const standaloneConnect = function standaloneConnect() {
  return index.connectStandalone();
};

/**
 * @return {http.Server}
 */
const middlewareKoa = function middlewareKoa() {
  const app  = new Koa();
  const argv = index.argv;
  app.use(index.koaMiddleware);
  const server = http.createServer(app.callback());
  server.listen(argv.port);
  return server;
};

/**
 * @return {http.Server}
 */
const middlewareConnect = function middlewareConnect() {
  const app  = connect();
  const argv = index.argv;
  app.use(index.connectMiddleware);
  const server = http.createServer(app);
  server.listen(argv.port);
  return server;
};

/**
 * @return {ChildProcess}
 */
const cliKoa = function cliKoa() {
  return childProcess.fork('lib/index.js', ['--engine', 'koa']);
};

/**
 * @return {ChildProcess}
 */
const cliConnect = function cliConnect() {
  return childProcess.fork('lib/index.js');
};


// ### General functions to start / stop server.

/**
 * @type ChildProcess
 */
let server;

const killProcess = function killProcess() {
  if (server != null) {
    gutil.log(`Killing server PID ${server.pid}`);
    server.kill();
  }
};

const killServer = function killServer() {
  if (server != null && server.listening) {
    gutil.log('Killing server');
    server.close();
  }
};

/**
 * @param {function.<ChildProcess>} serverStarter
 * @return {undefined}
 */
const startProcess = function startProcess(serverStarter) {

  killProcess();

  gutil.log('Starting server in a fork process');
  server = serverStarter();
  gutil.log(`Server started with PID: ${chalk.bold(server.pid)}`);

  server.on('exit', (code, signal) => {
    gutil.log('Server has exited'
      + (code != null ? ` with code ${code}` : '')
      + (signal != null ? ` by signal ${signal}` : '')
      + '.');
  });

  server.on('error', err => {
    gutil.log('Something goes wrong with the server,'
      + ' you may have to kill it by yourself.'
      + `\nThe PID is: ${chalk.bold(server.pid)}`);
    gutil.log('Detail:\n');
    gutil.log(err);
  });
};

/**
 * @param {function.<http.Server>} serverStarter
 * @return {undefined}
 */
const startServer = function startServer(serverStarter) {

  killServer();

  gutil.log('Starting server');
  server = serverStarter();
  gutil.log('Server started');

  server.on('close', () => {
    gutil.log('Server has closed');
  });
};

/**
 * @param {function} serverStarter
 * @param {boolean} [isFork = false]
 * @returns {function}
 */
const generateTaskFn = function generateTaskFn(serverStarter, isFork = false) {
  return asynk(function *serveTask() {
    process.env.BABEL_ENV = config.isProduction ? 'production' : 'development';
    yield del(config.outputDir);
    yield processBabel();

    if (isFork) {
      startProcess(serverStarter);
    } else {
      startServer(serverStarter);
    }

    process.on('exit', () => {
      if (isFork) {
        killProcess();
      } else {
        killServer();
      }
    });

    const watcher = gulp.watch(helpers.sourceAnd('**/*.js'));

    watcher.on('change', asynk(function *rebuild(event) {
      const absPath    = event.path;
      const sourcePath = path.relative(config.sourceDir, absPath);

      if (event.type === 'deleted') {
        gutil.log(`Deleting "${sourcePath}`);
        yield del(helpers.outputAnd(sourcePath));
        yield del(helpers.outputAnd(sourcePath + '.map'));
      } else {
        gutil.log(`Building "${sourcePath}"`);
        yield processBabel(sourcePath);
      }

      if (isFork) {
        startProcess(serverStarter);
      } else {
        startServer(serverStarter);
      }
    }));
  });
};


// ### Declare tasks

gulp.task('standalone:koa', generateTaskFn(standaloneKoa));
gulp.task('standalone:connect', generateTaskFn(standaloneConnect));
gulp.task('middleware:koa', generateTaskFn(middlewareKoa));
gulp.task('middleware:connect', generateTaskFn(middlewareConnect));
gulp.task('cli:koa', generateTaskFn(cliKoa, true));
gulp.task('cli:connect', generateTaskFn(cliConnect, true));
