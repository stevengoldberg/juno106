/*
* grunt-compile-handlebars
* https://github.com/patrickkettner/grunt-compile-handlebars
*
* Copyright (c) 2014 Patrick Kettner, contributors
* Licensed under the MIT license.
*/

'use strict';

module.exports = function(grunt) {
  var merge = require('lodash.merge');
  var alce = require('alce');
  var handlebars;

  // Normalizes the input so that it is always an array for the forEach loop
  var getConfig = function(config) {
    if (!config) return [];
    var files = grunt.file.expand(config);
    if (files.length) {
      return files;
    }
    return [config];
  };

  // Guesses the file extension based on the string after the last dot of the of the filepath
  var filetype = function(filepath) {
    var extension = filepath.split('/').pop().split('.');
    extension.shift();
    extension = extension.join('.');
    if (extension) {
      extension = '.' + extension;
    }
    return extension;
  };

  // Gets the final representation of the input, wether it be object, or string
  var parseData = function(data, dontParse) {
    // grunt.file chokes on objects, so we check for it immiedietly
    if (typeof data === 'object') {
      return data;
    }

    // `data` isn't an object, so its probably a file
    try {
      // alce allows us to parse single-quote JSON (which is tehcnically invalid, and thereby chokes JSON.parse)
      data = grunt.file.read(data);
      if (!dontParse) {
        data = alce.parse(data);
      }
    }
    catch (e) {}

    return data;
  };

  // Checks if the input is a glob and if so, returns the unglobbed version of the filename
  var isGlob = function(filename) {
    if (!filename) return;
    var match = filename.match(/[^\*]*/);
    if (match[0] !== filename) {
      return match.pop();
    }
  };

  // Figures out the name of the file before any globs are used, so the globbed outputs can be generated
  var getBasename = function(filename, template, outputInInput) {
    var basename;
    var glob;

    template = Array.isArray(template) ? filename : template;
    glob = isGlob(template);
    if (outputInInput) {
      basename = filename.split('.').pop();
    }
    else if (glob) {
      basename = filename.slice(glob.length, filename.length).split('.');
      basename.pop();
    }
    else {
      basename = filename.split('/').pop().split('.');
      basename.pop();
    }
    return basename.join('.');
  };

  var getName = function(filename, basename, index) {
    if (Array.isArray(filename)) {
      var file = filename[index];
      if (file) return file;
      grunt.log.error('You need to assign the same number of ouputs as you do templates when using array notation.');
      return;
    }
    if (typeof filename === 'object') {
      return filename;
    }
    if (grunt.file.exists(filename)) {
      return filename;
    }
    if (isGlob(filename) !== undefined) {
      return isGlob(filename) + basename + filetype(filename);
    }
    return filename;
  };

  var mergeJson = function(source, globals) {
    var json = {}, fragment;

    globals.forEach(function (global) {
      if (!grunt.file.exists(global)) {
        grunt.log.error("JSON file " + global + " not found.");
      }
      else {
        try {
          fragment = grunt.file.readJSON(global);
        }
        catch (e) {
          grunt.fail.warn(e);
        }
        merge(json, fragment);
      }
    });


    if (typeof source === 'object') {
      merge(json, source);
    }

    return json;
  };

  var shouldRegisterFullPaths = function(itShould, type) {

    if (itShould && typeof itShould === 'string') {
      itShould = itShould.toLowerCase().indexOf(type) === 0;
    }

    return itShould;
  };

  grunt.registerMultiTask('compile-handlebars', 'Compile Handlebars templates ', function() {
    var fs = require('fs');
    var config = this.data;
    var templates = getConfig(config.template);
    var templateData = config.templateData;
    var helpers = getConfig(config.helpers);
    var partials = getConfig(config.partials);
    var outputInInput = config.outputInInput === true;
    var done = this.async();

    handlebars = config.handlebars || require('handlebars');

    helpers.forEach(function (helper) {
        var name = shouldRegisterFullPaths(config.registerFullPath, 'helpers') ?
          // full path, minus extention
          helper.replace(/\.[^/.]+$/, "") :
          // just the file's name
          getBasename(helper, config.helpers);

        if (handlebars.helpers[name]) {
          grunt.log.error(name + ' is already registered, clobbering with the new value. Consider setting `registerFullPath` to true');
        }

        handlebars.registerHelper(name, require(fs.realpathSync(helper)));
    });

    partials.forEach(function (partial) {
        var name = shouldRegisterFullPaths(config.registerFullPath, 'partials') ?
          // full path, minus extention
          partial.replace(/\.[^/.]+$/, "") :
          // just the file's name
          getBasename(partial, config.partials);

        if (handlebars.partials[name]) {
          grunt.log.error(name + ' is already registered, clobbering with the new value. Consider setting `registerFullPath` to true');
        }

      handlebars.registerPartial(name, fs.readFileSync(fs.realpathSync(partial), "utf8"));
    });

    templates.forEach(function(template, index) {
      var compiledTemplate = handlebars.compile(parseData(template, true));
      var basename = getBasename(template, config.template);
      var outputBasename = getBasename(template, config.template, outputInInput);
      var html = '';
      var json;


      if (config.preHTML) {
        html += parseData(getName(config.preHTML, basename, index));
      }

      json = mergeJson(parseData(getName(templateData, basename, index)), config.globals || []);

      html += compiledTemplate(json);

      if (config.postHTML) {
        html += parseData(getName(config.postHTML, basename, index));
      }

      grunt.file.write(getName(config.output, outputBasename, index), html);
    });

    process.nextTick(done);
  });
};
