/*
 * grunt-contrib-jasmine
 * http://gruntjs.com/
 *
 * Copyright (c) 2015 GruntJS Team
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // node api
  var fs   = require('fs'),
      path = require('path');

  // npm lib
  var phantomjs = require('grunt-lib-phantomjs').init(grunt),
      chalk = require('chalk'),
      _ = require('lodash');

  // local lib
  var jasmine = require('./lib/jasmine').init(grunt, phantomjs);

  var junitTemplate = __dirname + '/jasmine/templates/JUnit.tmpl';

  var status = {};

  var symbols = {
    none : {
      check : '',
      error : '',
      splat : ''
    },
    short : {
      check : '.',
      error : 'X',
      splat : '*'
    },
    full : {
      check : '✓',
      error : 'X',
      splat : '*'
    }
  };

  //With node.js on Windows: use symbols available in terminal default fonts
  //https://github.com/visionmedia/mocha/pull/641
  if (process && process.platform === 'win32') {
    symbols = {
      none : {
        check : '',
        error : '',
        splat : ''
      },
      short : {
        check : '.',
        error : '\u00D7',
        splat : '*'
      },
      full : {
        check : '\u221A',
        error : '\u00D7',
        splat : '*'
      }
    };
  }

  grunt.registerMultiTask('jasmine', 'Run jasmine specs headlessly through PhantomJS.', function() {

    // Merge task-specific options with these defaults.
    var options = this.options({
      version : '2.0.1',
      timeout : 10000,
      styles : [],
      specs : [],
      helpers : [],
      vendor : [],
      polyfills : [],
      outfile : '_SpecRunner.html',
      host : '',
      template : __dirname + '/jasmine/templates/DefaultRunner.tmpl',
      templateOptions : {},
      junit : {},
      ignoreEmpty: grunt.option('force') === true,
      display: 'full',
      summary: false,
  });

    if (grunt.option('debug')) {
      grunt.log.debug(options);
    }

    setup(options);

    // The filter returned no spec files so skip phantom.
    if (!jasmine.buildSpecrunner(this.filesSrc, options)) {
      return removePhantomListeners();
    }

    // If we're just building (e.g. for web), skip phantom.
    if (this.flags.build) {
      removePhantomListeners();
      return;
    }

    var done = this.async();
    phantomRunner(options, function(err, status) {
      var success = !err && status.failed === 0;

      if (err) {
        grunt.log.error(err);
      }
      if (status.failed === 0) {
        grunt.log.ok('0 failures');
      } else {
        grunt.log.error(status.failed + ' failures');
      }

      teardown(options, function() {
        done(success);
      });
    });

  });

  function phantomRunner(options, cb){
    var file = options.outfile;

    if (options.host) {
      if (!(/\/$/).test(options.host)) options.host = options.host + '/';
      file = options.host + options.outfile;
    }

    grunt.verbose.subhead('Testing jasmine specs via phantom').or.writeln('Testing jasmine specs via PhantomJS');
    grunt.log.writeln('');

    phantomjs.spawn(file, {
      failCode : 90,
      options : options,
      done : function(err){
        cb(err,status);
      }
    });
  }

  function teardown(options, cb) {
    removePhantomListeners();

    if (!options.keepRunner && fs.statSync(options.outfile).isFile()) {
      fs.unlink(options.outfile);
    }

    if (!options.keepRunner) {
      jasmine.cleanTemp(cb);
    } else {
      cb();
    }
  }

  function removePhantomListeners() {
    phantomjs.removeAllListeners();
    phantomjs.listenersAny().length = 0;
  }

  function setup(options) {
    var indentLevel = 1,
        tabstop = 2,
        thisRun = {},
        suites = {},
        currentSuite;

    status = {
      failed   : 0
    };

    function indent(times) {
      return new Array(+times * tabstop).join(' ');
    }

    phantomjs.on('fail.load', function() {
      grunt.log.writeln();
      grunt.warn('PhantomJS failed to load your page.', 90);
    });

    phantomjs.on('fail.timeout', function() {
      grunt.log.writeln();
      grunt.warn('PhantomJS timed out, possibly due to an unfinished async spec.', 90);
    });

    phantomjs.on('console', function(msg) {
      thisRun.cleanConsole = false;
      if(options.display === 'full') {
        grunt.log.writeln('\n' + chalk.yellow('log: ') + msg);
      }
    });

    phantomjs.on('error.onError', function(string, trace){
      if (trace && trace.length) {
        grunt.log.error(chalk.red(string) + ' at ');
        trace.forEach(function(line) {
          var file = line.file.replace(/^file:/,'');
          var message = grunt.util._('%s:%d %s').sprintf(path.relative('.',file), line.line, line.function);
          grunt.log.error(chalk.red(message));
        });
      } else {
        grunt.log.error("Error caught from PhantomJS. More info can be found by opening the Spec Runner in a browser.");
        grunt.warn(string);
      }
    });

    phantomjs.onAny(function() {
      var args = [this.event].concat(grunt.util.toArray(arguments));
      grunt.event.emit.apply(grunt.event, args);
    });

    phantomjs.on('jasmine.jasmineStarted', function() {
      grunt.verbose.writeln('Jasmine Runner Starting...');
      thisRun.startTime = (new Date()).getTime();
      thisRun.executedSpecs = 0;
      thisRun.passedSpecs = 0;
      thisRun.failedSpecs = 0;
      thisRun.skippedSpecs = 0;
      thisRun.summary = [];
    });

    phantomjs.on('jasmine.suiteStarted', function(suiteMetaData) {
      currentSuite = suiteMetaData.id;
      suites[currentSuite] = {
        name : suiteMetaData.fullName,
        timestamp : new Date(suiteMetaData.startTime),
        errors : 0,
        tests : 0,
        failures : 0,
        testcases : []
      };
      if(options.display === 'full') {
        grunt.log.write(indent(indentLevel++));
        grunt.log.writeln(chalk.bold(suiteMetaData.description));
      }
    });

    phantomjs.on('jasmine.suiteDone', function(suiteMetaData) {
      suites[suiteMetaData.id].time = suiteMetaData.duration / 1000;

      if(indentLevel > 1) {
        indentLevel--;
      }
    });

    phantomjs.on('jasmine.specStarted', function(specMetaData) {
      thisRun.executedSpecs++;
      thisRun.cleanConsole = true;
      if(options.display === 'full') {
        grunt.log.write(indent(indentLevel) + '- ' + chalk.grey(specMetaData.description) + '...');
      } else if(options.display === 'short' ) {
        grunt.log.write(chalk.grey('.'));
      }
    });

    phantomjs.on('jasmine.specDone', function(specMetaData) {
      var specSummary = {
        assertions : 0,
        classname : suites[currentSuite].name,
        name : specMetaData.description,
        time : specMetaData.duration / 1000,
        failureMessages : []
      };

      suites[currentSuite].tests++;

      var color = 'yellow',
          symbol = 'splat';
      if (specMetaData.status === "passed") {
        thisRun.passedSpecs++;
        color = 'green';
        symbol = 'check';
      } else if (specMetaData.status === "failed") {
        thisRun.failedSpecs++;
        status.failed++;
        color = 'red';
        symbol = 'error';
        suites[currentSuite].failures++;
        suites[currentSuite].errors += specMetaData.failedExpectations.length;
        specSummary.failureMessages = specMetaData.failedExpectations.map(function(error){
          return error.message;
        });
        thisRun.summary.push({
          suite: suites[currentSuite].name,
          name: specMetaData.description,
          errors: specMetaData.failedExpectations.map(function(error){
            return {
              message: error.message,
              stack: error.stack
            };
          })
        });
      } else {
        thisRun.skippedSpecs++;
      }

      suites[currentSuite].testcases.push(specSummary);

      // If we're writing to a proper terminal, make it fancy.
      if (process.stdout.clearLine) {
        if(options.display === 'full') {
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          grunt.log.writeln(
            indent(indentLevel) +
              chalk[color].bold(symbols.full[symbol]) + ' ' +
              chalk.grey(specMetaData.description)
          );
        } else if(options.display === 'short') {
          process.stdout.moveCursor(-1);
          grunt.log.write(chalk[color].bold(symbols.short[symbol]));
        }
      } else {
        // If we haven't written out since we've started
        if (thisRun.cleanConsole) {
          // then append to the current line.
          if (options.display !== 'none') {
            grunt.log.writeln('...' + symbols[options.display][symbol]);
          }
        } else {
          // Otherwise reprint the current spec and status.
          if (options.display !== 'none') {
            grunt.log.writeln(
              indent(indentLevel) + '...' +
              chalk.grey(specMetaData.description) + '...' +
              symbols[options.display][symbol]
            );
          }
        }
      }

      specMetaData.failedExpectations.forEach(function(error, i){
        var specIndex = ' ('+(i+1)+')';
        if(options.display === 'full') {
          grunt.log.writeln(indent(indentLevel + 1) + chalk.red(error.message + specIndex));
        }
        phantomjs.emit('onError', error.message, error.stack);
      });

    });

    phantomjs.on('jasmine.jasmineDone', function(){
      var dur = (new Date()).getTime() - thisRun.startTime;
      var specQuantity = thisRun.executedSpecs + (thisRun.executedSpecs === 1 ? " spec " : " specs ");

      grunt.verbose.writeln('Jasmine runner finished');

      if (thisRun.executedSpecs === 0) {
        // log.error will print the message but not fail the task, warn will do both.
        var log = (options.ignoreEmpty) ? grunt.log.error : grunt.warn;

        log('No specs executed, is there a configuration error?');
      }

      if(options.display === 'short') {
        grunt.log.writeln();
      }

      if(options.summary && thisRun.summary.length) {
        grunt.log.writeln();
        logSummary(thisRun.summary);
      }

      if (options.junit && options.junit.path) {
        writeJunitXml(suites);
      }

      grunt.log.writeln('\n' + specQuantity + 'in ' + (dur / 1000) + "s.");
    });

    function logSummary(tests) {
        grunt.log.writeln('Summary (' + tests.length + ' tests failed)');
        _.forEach(tests, function(test){
            grunt.log.writeln(chalk.red(symbols[options.display]['error']) + ' ' + test.suite + ' ' + test.name);
            _.forEach(test.errors, function(error){
              grunt.log.writeln(indent(2) + chalk.red(error.message));
              logStack(error.stack, 2);
            });
        });
    }

    function logStack(stack, indentLevel) {
      var lines = (stack || '').split('\n');
      for (var i = 0; i < lines.length && i < 11; i++) {
        grunt.log.writeln((indent(indentLevel) + lines[i]));
      }
    }

    function writeJunitXml(testsuites){
      var template = grunt.file.read(options.junit.template || junitTemplate);
      if (options.junit.consolidate) {
        var xmlFile = path.join(options.junit.path, 'TEST-' + testsuites.suite1.name.replace(/[^\w]/g, '') + '.xml');
        grunt.file.write(xmlFile, grunt.util._.template(template, { testsuites: _.values(testsuites)}));
      } else {
        _.forEach(testsuites, function(suiteData){
          var xmlFile = path.join(options.junit.path, 'TEST-' + suiteData.name.replace(/[^\w]/g, '') + '.xml');
          grunt.file.write(xmlFile, _.template(template, { testsuites: [suiteData] }));
        });
      }
    }

    phantomjs.on('jasmine.done', function(elapsed) {
      phantomjs.halt();
    });

    phantomjs.on('jasmine.done.PhantomReporter', function() {
      phantomjs.emit('jasmine.done');
    });

    phantomjs.on('jasmine.done_fail', function(url) {
      grunt.log.error();
      grunt.warn('PhantomJS unable to load "' + url + '" URI.', 90);
    });
  }

};
