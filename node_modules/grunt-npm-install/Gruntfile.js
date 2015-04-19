/*
 * grunt-npm-install
 * https://github.com/iclanzan/grunt-npm-install
 *
 * Copyright (c) 2013 Sorin Iclanzan
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  grunt.registerTask('chdir', 'Change the cwd.', function (path) {
    console.log('*** Current: ', process.cwd(), ' *** Next: ', path);
    process.chdir(path);
  });

  grunt.registerTask('write', 'Write content to a file.', grunt.file.write);

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', [
    'clean',
    'write:tmp/package.json:{"name"\\: "fake", "dependencies"\\: {"jassi"\\:""}}',
    'chdir:tmp',
    'npm-install',
    'npm-install:q',
    'npm-install:lodash:async',
    'chdir:' + process.cwd().replace(/[A-Za-z]:\\/, '/'), // Windows friendly
    'nodeunit'
  ]);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
