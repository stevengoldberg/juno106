# grunt-contrib-jasmine v0.8.2 [![Build Status: Linux](https://travis-ci.org/gruntjs/grunt-contrib-jasmine.svg?branch=master)](https://travis-ci.org/gruntjs/grunt-contrib-jasmine)

> Run jasmine specs headlessly through PhantomJS.



## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-contrib-jasmine --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-contrib-jasmine');
```




## Jasmine task
_Run this task with the `grunt jasmine` command._

Automatically builds and maintains your spec runner and runs your tests headlessly through PhantomJS.

#### Run specs locally or on a remote server

Run your tests on your local filesystem or via a server task like [grunt-contrib-connect][].

#### Customize your SpecRunner with templates

Use your own SpecRunner templates to customize how `grunt-contrib-jasmine` builds the SpecRunner. See the
[wiki](https://github.com/gruntjs/grunt-contrib-jasmine/wiki/Jasmine-Templates) for details and third party templates for examples.

##### AMD Support

Supports AMD tests via the [grunt-template-jasmine-requirejs](https://github.com/jsoverson/grunt-template-jasmine-requirejs) module

##### Third party templates

- [RequireJS](https://github.com/jsoverson/grunt-template-jasmine-requirejs)
- [Code coverage output with Istanbul](https://github.com/maenu/grunt-template-jasmine-istanbul)
- [StealJS](https://github.com/jaredstehler/grunt-template-jasmine-steal)

[grunt-contrib-connect]: https://github.com/gruntjs/grunt-contrib-connect


### Options

#### src
Type: `String|Array`

Your source files. These are the files that you are testing. If you are using RequireJS your source files will be loaded as dependencies into your spec modules and will not need to be placed here.

#### options.specs
Type: `String|Array`

Your Jasmine specs.

#### options.vendor
Type: `String|Array`

Third party libraries like jQuery & generally anything loaded before source, specs, and helpers.

#### options.helpers
Type: `String|Array`

Non-source, non-spec helper files. In the default runner these are loaded after `vendor` files

#### options.styles
Type: `String|Array`

CSS files that get loaded after the jasmine.css

#### options.version
Type: `String`  
Default: '2.0.1'

This is the jasmine-version which will be used. currently available versions are:

* 2.0.1
* 2.0.0

*Due to changes in Jasmine, pre-2.0 versions have been dropped and tracking will resume at 2.0.0*

#### options.outfile
Type: `String`  
Default: `_SpecRunner.html`

The auto-generated specfile that phantomjs will use to run your tests.
Automatically deleted upon normal runs. Use the `:build` flag to generate a SpecRunner manually e.g.
`grunt jasmine:myTask:build`

#### options.keepRunner
Type: `Boolean`  
Default: `false`  

Prevents the auto-generated specfile used to run your tests from being automatically deleted.

#### options.junit.path
Type: `String`  
Default: undefined

Path to output JUnit xml

#### options.junit.consolidate
Type: `Boolean`  
Default: `false`

Consolidate the JUnit XML so that there is one file per top level suite.

#### options.junit.template
Type: `String`  
Default: undefined

Specify a custom JUnit template instead of using the default `junitTemplate`.

#### options.host
Type: `String`  
Default: ''

The host you want PhantomJS to connect against to run your tests.

e.g. if using an ad hoc server from within grunt

```js
host : 'http://127.0.0.1:8000/'
```

Without a `host`, your specs will be run from the local filesystem.

#### options.template
Type: `String` `Object`  
Default: undefined

Custom template used to generate your Spec Runner. Parsed as underscore templates and provided
the expanded list of files needed to build a specrunner.

You can specify an object with a `process` method that will be called as a template function.
See the [Template API Documentation](https://github.com/gruntjs/grunt-contrib-jasmine/wiki/Jasmine-Templates) for more details.

#### options.templateOptions
Type: `Object`  
Default: `{}`

Options that will be passed to your template. Used to pass settings to the template.

#### options.polyfills
Type: `String|Array`

Third party polyfill libraries like json2 that are loaded at the very top before anything else. es5-shim is loaded automatically with this library.

#### options.display
Type: `String`  
Default: `full`

  * `full` displays the full specs tree
  * `short` only displays a success or failure character for each test (useful with large suites)
  * `none` displays nothing

#### options.summary
Type: `Boolean`  
Default: `false`

Display a list of all failed tests and their failure messages

### Flags

Name: `build`

Turn on this flag in order to build a SpecRunner html file. This is useful when troubleshooting templates,
running in a browser, or as part of a watch chain e.g.

```js
watch: {
  pivotal : {
    files: ['src/**/*.js', 'specs/**/*.js'],
    tasks: 'jasmine:pivotal:build'
  }
}
```

### Filtering specs

**filename**
`grunt jasmine --filter=foo` will run spec files that have `foo` in their file name.

**folder**
`grunt jasmine --filter=/foo` will run spec files within folders that have `foo*` in their name.

**wildcard**
`grunt jasmine --filter=/*-bar` will run anything that is located in a folder `*-bar`

**comma separated filters**
`grunt jasmine --filter=foo,bar` will run spec files that have `foo` or `bar` in their file name.

**flags with space**
`grunt jasmine --filter="foo bar"` will run spec files that have `foo bar` in their file name.
`grunt jasmine --filter="/foo bar"` will run spec files within folders that have `foo bar*` in their name.

#### Example application usage

- [Pivotal Labs' sample application](https://github.com/jsoverson/grunt-contrib-jasmine-example)


#### Basic Use

Sample configuration to run Pivotal Labs' example Jasmine application.

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    pivotal: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*Spec.js',
        helpers: 'spec/*Helper.js'
      }
    }
  }
});
```

#### Supplying a custom template

Supplying a custom template to the above example

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    customTemplate: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*Spec.js',
        helpers: 'spec/*Helper.js',
        template: 'custom.tmpl'
      }
    }
  }
});
```

#### Supplying template modules and vendors

A complex version for the above example

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    customTemplate: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*Spec.js',
        helpers: 'spec/*Helper.js',
        template: require('exports-process.js')
        vendor: [
          "vendor/*.js",
          "http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"
        ]
      }
    }
  }
});
```

#### Sample RequireJS/NPM Template usage

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    yourTask: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*Spec.js',
        template: require('grunt-template-jasmine-requirejs')
      }
    }
  }
});
```

NPM Templates are just node modules, so you can write and treat them as such.

Please see the [grunt-template-jasmine-requirejs](https://github.com/jsoverson/grunt-template-jasmine-requirejs) documentation
for more information on the RequireJS template.


## Release History

 * 2015-01-08   v0.8.2   Fixes to test summary reporting.
 * 2014-10-20   v0.8.1   Now removes listeners when using the build flag. Adds handler for fail.load.
 * 2014-07-26   v0.8.0   Plugin now uses Jasmine 2.0.4 from npm. Updates other dependencies. Added "options.polyfills".
 * 2014-07-26   v0.7.0   Merged 153 to add stack trace to summary. Updated for Jasmine 2.0.1 Merged 133 for minimal output Merged 139 changing file exclusion logic
 * 2014-05-31   v0.6.5   Option to allow specifying a junitTemplate.
 * 2014-04-28   v0.6.4   Indent level fix. Moved scripts inside the body tag.
 * 2014-01-29   v0.6.0   Jasmine 2.0.0 support Improved logging support Various merges/bugfixes
 * 2013-08-02   v0.5.2   Fixed breakage with iframes /44 Added filter flag / 70 Fixed junit failure output /77
 * 2013-06-18   v0.5.1   Merged /69 grunt async not called when tests fail OR keepRunner is true
 * 2013-06-15   v0.5.0   updated rimraf made teardown async, added Function.prototype.bind polyfill breaking (templates) changed input options for getRelativeFileList breaking (usage) failing task on phantom error (SyntaxError, TypeError, et al)
 * 2013-04-03   v0.4.2   bumped grunt-lib-phantomjs to 0.3.0/1.9 (closes merged addressed
 * 2013-03-08   v0.4.0   bumped grunt-lib-phantomjs to 0.2.0/1.8 allowed spec/vendor/helper list to return non-matching files (e.g. for remote, http) merged merged
 * 2013-02-24   v0.3.3   Added better console output (via Gabor Kiss @Neverl)
 * 2013-02-17   v0.3.2   Ensure Gruntfile.js is included on npm.
 * 2013-02-15   v0.3.1   First official release for Grunt 0.4.0.
 * 2013-01-22   v0.3.1rc7   Exposed phantom and sendMessage to templates
 * 2013-01-22   v0.3.0rc7   Updated dependencies for grunt v0.4.0rc6/rc7
 * 2013-01-08   v0.3.0rc5   Updating to work with grunt v0.4.0rc5. Switching to this.filesSrc api. Added JUnit xml output (via Kelvin Luck @vitch) Passing console.log from browser to verbose grunt logging Support for templates as separate node modules Removed internal requirejs template (see grunt-template-jasmine-requirejs)
 * 2012-12-03   v0.2.0   Generalized requirejs template config Added loader plugin Tests for templates Updated jasmine to 1.3.0
 * 2012-11-24   v0.1.2   Updated for new grunt/grunt-contrib apis
 * 2012-11-07   v0.1.1   Fixed race condition in requirejs template
 * 2012-11-07   v0.1.0   Ported grunt-jasmine-runner and grunt-jasmine-task to grunt-contrib

---

Task submitted by [Jarrod Overson](http://jarrodoverson.com)

*This file was generated on Thu Jan 08 2015 16:18:55.*
