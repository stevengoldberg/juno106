grunt-npm-install
=================

This task behaves pretty much like the `npm install` command. It can install current project dependencies or specific modules.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-npm-install --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-npm-install');
```

## The "npm_install" task

### Overview
Unlike with other tasks, you do not need to add a special property to the object passed into `grunt.initConfig()`. Instead you need to pass npm module names as arguments to the task.

### Usage Examples

#### Installing dependencies
```js
grunt.registerTask('default', ['npm-install']);
```

#### Installing specific modules
This is how you would configure the task to install the `lodash` and `async` npm modules.

```js
grunt.registerTask('default', ['npm-install:lodash:async']);
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
### v0.2.0
Fixed lint errors and bumped minor version because of NPM breaking changes.

### v0.1.2
Updated NPM dependency to version ^2.5.1.

### v0.1.1
Updated NPM dependency to version ~1.4.3.

### v0.1.0
Initial version
