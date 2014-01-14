module.exports = function(grunt) {
	grunt.initConfig({
		activeDir: 'dev', // this gets overloaded with setPath
		pkg: grunt.file.readJSON('package.json'),
		settings: {
			ftpDeploy: {
				auth: {
					host: 'ftp.modwest.com',
					port: 21,
					authKey: 'modwest'
				},
				dest: '/htdocs/payment/'
			}
		},

		uglify: {
			release: {
				files: {
					'<%= activeDir %>/js.js': ['src/**/*.js']
				},
			},
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
				atBegin: true
			},
			files: ['src/**/*.js', 'src/index.html', 'src/**/*.tpl.html', 'src/php/**/*', 'src/assets/css.css'],
			tasks: ['build']
		},
		copy: {
			main: {
				dest: '<%= activeDir %>',
				src: '**',
				expand: true,
				cwd: 'src/assets/'
			},
			index: {
				dest: '<%= activeDir %>/index.html',
				src: 'src/index.html'
			}
		},
		'ftp-deploy': {
			php: {
				src: 'src/php',
				auth: "<%= settings.ftpDeploy.auth %>",
				dest: "<%= settings.ftpDeploy.dest %>"
			},
			app: {
				src: '<%= activeDir %>',
				exclusions: ['build/**/*.png', 'build/**/*.txt', 'build/**/*.ico'],
				auth: "<%= settings.ftpDeploy.auth %>",
				dest: "<%= settings.ftpDeploy.dest %>"
			}
		},
		html2js: {
			options: {
				htmlmin: {
					collapseBooleanAttributes: true,
					collapseWhitespace: true,
					// removeAttributeQuotes: true,
					removeComments: true,
					// removeEmptyAttributes: true,
					removeRedundantAttributes: true,
					// removeScriptTypeAttributes: true,
					// removeStyleLinkTypeAttributes: true
				}
			},
			main: {
				src: 'src/**/*.tpl.html',
				dest: '<%= activeDir %>/js-tpl.js'
			}
		}
	});

	grunt.registerTask('setPath', function( arg1 ) {
		grunt.config.set( 'activeDir', arg1 );
		grunt.config.set( 'uglify.options.beautify', arg1 == 'build'); // set beautification link
		grunt.log.writeln('Setting build path to: ' + arg1 );
	});

	// Load plugins
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-ftp-deploy');
	grunt.loadNpmTasks('grunt-html2js');

	// Define task(s)
	grunt.registerTask('default', ['watch']);

	grunt.registerTask('build', ['setPath:build', 'process']);
	grunt.registerTask('release', ['setPath:release', 'process']);
	grunt.registerTask('process', ['jshint', 'clean', 'uglify', 'copy', 'html2js', 'ftp-deploy']);
};

// see https://github.com/gruntjs/grunt-contrib-watch#using-the-watch-event