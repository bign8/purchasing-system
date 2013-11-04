module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		developmentDir: 'dev',
		productionDir: 'build',
		pkg: grunt.file.readJSON('package.json'),
		banner:
			'/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
			' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
			' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n */\n',

		uglify: {
			options: {
				banner: "<%= banner %>"
			},
			prod: {
				src: 'src/*.js',
				dest: '<%= productionDir %>/<%= pkg.name %>.js'
			}
		},

		concat:{
			dev:{
				options: {
					banner: "<%= banner %>"
				},
				src:['src/*.js'],
				dest:'<%= developmentDir %>/<%= pkg.name %>.js'
			},
			indexDev: {
				src: ['src/index.html'],
				dest: '<%= developmentDir %>/index.html',
				options: {
					process: true
				}
			},
			indexProd: {
				src: ['src/index.html'],
				dest: '<%= productionDir %>/index.html',
				options: {
					process: true
				}
			}
		},

		clean: {
			dev: ['<%= developmentDir %>/*'],
			prod: ['<%= productionDir %>/*']
		},

		jshint: {
			files: ['src/*.js'],
			options: { // documentation: http://www.jshint.com/docs/
				globals: {
					console: true,
					module: true
				}
			}
		},

		watch: {
			files: ['src/*.js'],
			tasks: ['default'],
			options: {
				livereload: true
			}
		}
	});

	// Load plugins
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Define task(s).
	grunt.registerTask('default', ['jshint', 'clean:dev', 'concat:dev', 'concat:indexDev']);
	grunt.registerTask('prod', ['jshint', 'clean:prod', 'uglify:prod', 'concat:indexProd']);
	grunt.registerTask('view', ['watch']);

};