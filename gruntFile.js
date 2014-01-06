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
			// vendor: {
			// 	files: {
			// 		'<%= activeDir %>/angular.js': ['vendor/angular/*.js'],
			// 		'<%= activeDir %>/angular-ui.js': ['vendor/angular-ui/*.js']
			// 	}
			// }
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
			// vendor: {
			// 	files: {
			// 		'<%= activeDir %>/angular.js': ['vendor/angular/angular.js', 'vendor/angular/*.js'],
			// 		'<%= activeDir %>/angular-ui.js': ['vendor/angular-ui/*.js'],
			// 		'<%= activeDir %>/bootstrap.css': ['vendor/bootstrap/bootstrap.css']
			// 	}
			// }
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
			options: {
				livereload: 1337,
				interrupt: true,
				// spawn: false
			},
			local: {
				files: ['src/**/*.js', 'src/index.html', 'src/**/*.tpl.html', 'src/php/**/*', 'src/assets/css.css'],
				tasks: ['build']
			},
			remote: {
				files: ['src/**/*.js', 'src/index.html', 'src/**/*.tpl.html', 'src/php/**/*', 'src/assets/css.css'],
				tasks: ['build-remote']
			}
		},

		copy: {
			assets: {
				dest: '<%= activeDir %>',
				src: '**',
				expand: true,
				cwd: 'src/assets/'
			},
			// partials: {
			// 	flatten: true,
			// 	expand: true,
			// 	cwd: 'src/partials/',
			// 	dest: '<%= activeDir %>/partials/',
			// 	src: '*.tpl.html'
			// },
			// js_partials: {
			// 	expand: true,
			// 	cwd: 'src/js/',
			// 	src: ['**/*.tpl.html'],
			// 	dest: '<%= activeDir %>/'
			// }
		},

		connect: {
			server: {
				options: {
					port: 9001,
					base: 'build/',
					livereload: 1337,
					hostname: '*'
				}
			}
		},

		open: {
			all: {
				path: 'http://localhost:<%= connect.server.options.port%>'
			}
		},

		'ftp-deploy': {
			phpOnly: {
				auth: {
					// host: 'uastore.wha.la',
					host: 'ftp.modwest.com',
					port: 21,
					// authKey: 'uastore'
					authKey: 'modwest'
				},
				src: 'src/php',
				// dest: '/'
				dest: '/htdocs/payment/'
			},
			theApp: {
				auth: {
					// host: 'uastore.wha.la',
					host: 'ftp.modwest.com',
					port: 21,
					// authKey: 'uastore'
					authKey: 'modwest'
				},
				src: 'build/',
				// dest: '/',
				dest: '/htdocs/payment/',
				exclusions: ['build/**/*.png']
			}
		},

		// php: { // install php to make this work
		// 	test: {
		// 		base: 'dev',
		// 		// open: true,
		// 		port: 5000
		// 	}
		// }

		html2js: {
			main: {
				src: 'src/**/*.tpl.html',
				dest: '<%= activeDir %>/<%= pkg.name %>-tpl.js'
			}
		}
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
	grunt.loadNpmTasks('grunt-ftp-deploy');
	grunt.loadNpmTasks('grunt-html2js');
	// grunt.loadNpmTasks('grunt-php');

	// Define task(s)
	grunt.registerTask('default', ['build', 'connect', 'open', 'watch:local']);
	grunt.registerTask('remote', ['build-remote', 'watch:remote']);

	grunt.registerTask('build', ['setPath:build', 'jshint', 'clean', 'concat', 'copy', 'html2js', 'ftp-deploy:phpOnly']);
	grunt.registerTask('build-remote', ['build', 'ftp-deploy:theApp']);

	grunt.registerTask('release', ['setPath:release', 'jshint', 'clean', 'uglify', 'concat:index', 'copy']);

};