module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt, {
        pattern: ['grunt-*'],
        scope: 'devDependencies'
    });

    grunt.initConfig({

        // A reference to data defined inside of this project's package.json
        pkg: grunt.file.readJSON('package.json'),


        /* Nearly every task defined below follows the convention:
         *
         *    taskname: {
         *
         *        // Default options that will be applied to every target.
         *        options: { }
         *
         *        // Every task has to have at least one target. If the task is
         *        // run without specifying the target the every target will run.
         *
         *        target: {
         *            // Special actions that should be run depending on the
         *            // environment.
         *        }
         *
         * For more information: http://gruntjs.com/configuring-tasks
         */

        // Remove artificats from a previous build.
        clean:  {
            prod: ['_SpecRunner.html', 'dist'],
            dev: ['_SpecRunner.html', 'index.html']
        },

        // Build index.html from index.hbs
        'compile-handlebars': {

            prod: {
                template: 'build/index.hbs',
                templateData: {
                    main: 'js/main',
                    src: 'js/<%= pkg.name %>.min.js'
                },
                output: 'dist/index.html'
            },

            dev: {
                template: 'build/index.hbs',
                templateData: {
                    main: 'js/init',
                    src: 'js/vendor/require.js',

                    // Add scripts to .grunt.config.json
                    scripts: []
                },
                output: 'index.html'
            }

        },

        handlebars: {
            options: {
                namespace: 'Handlebars.templates',
                processName: function(filePath) {
                    var path = filePath.split('/');
                    var name = path[path.length - 1];
                    return name.slice(0, name.length - 4);
                },
                extension: 'hbs'
            },
            guide: {
                files: {
                    'style_guide/build/js/sg-templates.js': 'style_guide/templates/*.hbs'
                }
            }
        },

        // Copy over any build artificats that need to belong in the dist
        // folder that are not managed by RequireJS or SASS.
        copy: {

            prod: {
                files: [{
                    expand: true,
                    src: ['images/**'],
                    dest: 'dist/'
                },{
                    expand: true,
                    src: ['icons/**'],
                    dest: 'dist/'
                },{
                    expand: true,
                    src: ['fonts/**'],
                    dest: 'dist/'
                }]
            }
        },

        // Concat and compile the SCSS files and output result to a location
        // on the filesystem that is reachable (different for prod/dev).
        sass: {

            options: {
                style: 'expanded'
            },

            prod: {
                files: [{
                    expand: true,
                    cwd: 'css',
                    src: ['**/style.scss'],
                    dest: 'dist/css/',
                    ext: '.min.css'
                }]
            },

            dev: {
                files: [{
                    expand: true,
                    cwd: 'css',
                    src: ['**/style.scss'],
                    dest: 'css/',
                    ext: '.css'
                }]
            }
        },

        autoprefixer: {

            prod: {
            },

            dev: {
                src: 'css/style.css',
                dest: 'css/style.min.css'
            }
        },

        // Concat and uglify the code the JS code and output the result to the
        // dist folder.
        requirejs: {

            options: {
                mainConfigFile: 'js/init.js',
                baseUrl: 'js',
                name: 'main',
                out: 'dist/js/<%= pkg.name %>.min.js',
                include: 'requireLib'
            },

            prod: {}
        },

        // Run the JS unit tests.
        /*jasmine: {

            options: {
                display: 'full',
                outfile: '_SpecRunner.html',
                keepRunner: true,*/
                //specs: 'spec/**/*-spec.js',
                /*helpers: [ 'spec/*helper.js'],
                template: require('grunt-template-jasmine-requirejs'),
                templateOptions: {
                    requireConfigFile: 'js/init.js',
                    requireConfig: {
                        deps: ['jquery', 'underscore', 'backbone', 'backbone.marionette'],
                        baseUrl: 'js',
                        map: {
                            config: {
                                communicator: 'communicator'
                            }

                        },
                        paths: {
                            specdir: '../spec'
                        }
                    }
                }
            },

            prod: {}
        },*/

        // Run these tasks concurrently.
        concurrent: {

            options: {
                logConcurrentOutput: true
            },

            prod: {
                tasks: ['sass:prod', 'requirejs:prod']
            },

            dev: {
                tasks: ['watch:rebuild']
            }
        },

        watch: {

            // When the files change compile the sass and reload the browser.
            rebuild: {
                files: ['templates/**/*.hbs', 'js/**/*.js', 'css/**/*.scss'],
                tasks: ['sass:dev', 'autoprefixer:dev'],
                options: {
                }
            },

            guide: {
                files: ['css/**/*.scss', 'style_guide/**/*.hbs', 'style_guide/**/*.css'],
                tasks: ['sass:dev', 'handlebars:guide']
            }
        },

        defaultTask: function() {

            var text = "\nThe default task has not been configured.\n\n" +

            "You can override the default task as well any other attribute\n" +
            "in Grunt.config.init by creating '.grunt.config.json' in the\n" +
            "root of this project.\n\n" +

            "For example, if you want to override this task (defaultTask)\n" +
            "with 'watch:rebuild' add the following to .grunt.config.json:\n\n" +

            "{ 'defaultTask': ['watch:rebuild'] }\n\n" +

            "Note: .grunt.config.json has been added to .gitignore.";

            grunt.log.writeln(grunt.util.normalizelf(text));

            grunt.task.run('build:dev');
        }

    });

    // If local config exists, use it to override values defined above
    if(grunt.file.exists('.grunt.config.json')) {
        grunt.config.merge(grunt.file.readJSON('.grunt.config.json'));
    }

    // Tasks run on the build server for integration and production.
    grunt.registerTask('build', ['clean:prod', 'compile-handlebars:prod', 'copy:prod', 'concurrent:prod']);

    // Tasks to run in local development environment.
    grunt.registerTask('build:dev', ['clean:dev', 'compile-handlebars:dev', 'sass:dev', 'autoprefixer:dev']);

    grunt.registerTask('guide', ['sass:dev', 'handlebars:guide', 'connect']);

    grunt.registerTask('default', 'The default task', grunt.config.get('defaultTask'));
};
