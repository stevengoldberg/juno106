/*global grunt */
module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: [
        'lib/**/*.js',
        'test/**/*.js'
      ]
    },

    mochacov: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/*.js']
      },
      cov: {
        options: {
          reporter: 'html-cov'
        },
        src: ['test/*.js']
      },
      options: {
        require: ['should']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-cov');

  grunt.registerTask('test', ['jshint', 'mochacov:test']);
  grunt.registerTask('cov', ['mochacov:cov']);
};
