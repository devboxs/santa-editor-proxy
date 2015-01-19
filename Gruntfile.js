'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            all: {
                src: [
                    'app.js',
                    'src/*.js'
                ]
            },
            teamcity: {
                options: {
                    format: 'checkstyle',
                    'output-file': 'target/eslint.xml'
                },
                src: ['<%= eslint.all.src %>']
            }
        }
    });

    grunt.loadNpmTasks('grunt-eslint');

    grunt.registerTask('default', ['eslint']);

    grunt.registerTask('teamcity-check', ['eslint:teamcity']);
    grunt.registerTask('teamcity', ['build_sources', 'teamcity-check']);

    grunt.registerTask('all', ['default']);
};
