module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		activeDir: 'dev', // this gets overloaded with setPath
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
			release: {
				files: {
					'<%= activeDir %>/<%= pkg.name %>.js': ['src/**/*.js']
				},
			},
			vendor: {
				files: {
					'<%= activeDir %>/angular.js': ['vendor/angular/*.js'],
					'<%= activeDir %>/angular-ui.js': ['vendor/angular-ui/*.js']
				}
			}
		},

		concat:{
			build:{
				options: {
					banner: "<%= banner %>"
				},
				files: {
					'<%= activeDir %>/<%= pkg.name %>.js': ['src/**/*.js']
				}
			},
			index: {
				options: {
					process: true
				}, 
				files: {
					'<%= activeDir %>/index.html': ['src/index.html']
				}
			},
			vendor: {
				files: {
					'<%= activeDir %>/angular.js': ['vendor/angular/angular.js', 'vendor/angular/*.js'],
					'<%= activeDir %>/angular-ui.js': ['vendor/angular-ui/*.js'],
					'<%= activeDir %>/bootstrap.css': ['vendor/bootstrap/bootstrap.css']
				}
			}
		},

		clean: ['<%= activeDir %>/*'],

		jshint: {
			files: ['src/**/*.js'],
			options: { // documentation: http://www.jshint.com/docs/
				globals: {
					console: true,
					module: true
				},
				smarttabs: true
			}
		},

		watch: {
			files: ['src/**/*.js', 'src/index.html', 'src/partials/**/*.tpl.html'],
			tasks: ['build'],
			options: {
				livereload: 1337,
				interrupt: true,
				// spawn: false
			}
		},

		copy: {
			assets: {
				dest: '<%= activeDir %>',
				src: '**',
				expand: true,
				cwd: 'src/assets/'
			},
			partials: {
				flatten: true,
				expand: true,
				cwd: 'src/partials/',
				dest: '<%= activeDir %>/partials/',
				src: '*.tpl.html'
			}
		},

		connect: {
			server: {
				options: {
					port: 9001,
					base: 'build/',
					livereload: 1337
				}
			}
		},

		open: {
			all: {
				path: 'http://localhost:<%= connect.server.options.port%>'
			}
		}

		// php: { // install php to make this work
		// 	test: {
		// 		base: 'dev',
		// 		// open: true,
		// 		port: 5000
		// 	}
		// }
	});

	grunt.registerTask('setPath', function( arg1 ) {
		grunt.config.set( 'activeDir', arg1 );
		grunt.log.writeln('Setting build path to: ' + arg1 );
	});

	// Load plugins
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-open');
	// grunt.loadNpmTasks('grunt-php');

	// Define task(s)
	grunt.registerTask('default', ['build', 'connect', 'open', 'watch']);
	grunt.registerTask('build', ['setPath:build', 'jshint', 'clean', 'concat', 'copy']);
	grunt.registerTask('release', ['setPath:release', 'jshint', 'clean', 'uglify', 'concat:index', 'copy']);

};