/*
 * grunt-compile-handlebars
 * http://gruntjs.com/
 *
 * Copyright (c) 2014 Patrick Kettner, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

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

    clean: {
      test: ['tmp']
    },

    // Configuration to be run (and then tested).
    'compile-handlebars': {
      allStatic: {
        preHTML: 'test/fixtures/pre-dev.html',
        postHTML: 'test/fixtures/post-dev.html',
        template: 'test/fixtures/template.handlebars',
        templateData: 'test/fixtures/data.json',
        output: 'tmp/allStatic.html'
      },
      jsonHandlebars: {
        template: 'test/fixtures/sweedishTemplate.json',
        templateData: 'test/fixtures/sweedishData.json',
        output: 'tmp/sweedish.json'
      },
      dynamicTemplate: {
        template: '<h1>{{salutation}}{{punctuation}} {{location}}</h1>',
        templateData: 'test/fixtures/data.json',
        output: 'tmp/dynamicTemplate.html'
      },
      dynamicTemplateData: {
        template: 'test/fixtures/template.handlebars',
        templateData: {
          "salutation": "Hallo",
          "punctuation": ",",
          "location": "Welt"
        },
        output: 'tmp/dynamicTemplateData.html'
      },
      dynamicPre: {
        preHTML: '<header>INLINE HEADER</header>',
        template: 'test/fixtures/template.handlebars',
        templateData: 'test/fixtures/data.json',
        output: 'tmp/dynamicPre.html'
      },
      dynamicPost: {
        postHTML: '<footer>INLINE HEADER</footer>',
        template: 'test/fixtures/template.handlebars',
        templateData: 'test/fixtures/data.json',
        output: 'tmp/dynamicPost.html'
      },
      anyArray: {
        template: ['test/fixtures/deep/romanian.handlebars', 'test/fixtures/deep/german.handlebars'],
        templateData: ['test/fixtures/deep/romanian.json', 'test/fixtures/deep/german.json'],
        output: ['tmp/deep/romanian.html','tmp/deep/german.html'],
        helpers: ['test/helpers/super_helper.js'],
        partials: ['test/fixtures/deep/shared/foo.handlebars']
      },
      globbedTemplateAndOutput: {
        template: 'test/fixtures/deep/**/*.handlebars',
        templateData: 'test/fixtures/deep/**/*.json',
        output: 'tmp/deep/**/*.html',
        helpers: 'test/helpers/**/*.js',
        partials: 'test/fixtures/deep/shared/**/*.handlebars'
      },
      globalJsonGlobbedTemplate: {
        template: 'test/fixtures/deep/**/*.handlebars',
        templateData: 'test/fixtures/deep/**/*.json',
        output: 'tmp/deep/**/*.html',
        helpers: 'test/helpers/**/*.js',
        partials: 'test/fixtures/deep/shared/**/*.handlebars',
        globals: [
          'test/globals/info.json',
          'test/globals/textspec.json'
        ]
      },
      registerFullPath: {
        template: '<h1>{{salutation}}{{punctuation}} {{location}}</h1>{{> test/fixtures/deep/shared/pathTest}}',
        templateData: {
          "salutation": "Hallo",
          "punctuation": ",",
          "location": "Welt"
        },
        output: 'tmp/fullPath.html',
        partials: 'test/fixtures/deep/shared/**/*.handlebars',
        registerFullPath: true
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the 'test' task is run, first create some files to be cleaned,
  // then run this plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'compile-handlebars', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);
};
