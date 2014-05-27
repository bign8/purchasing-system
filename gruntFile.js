module.exports = function(grunt) {
	grunt.initConfig({
		// Grunt variables
		activeDir: 'dev',  // this gets overloaded with setPath
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

		// Processes configurations
		uglify: {
			release: {
				files: {
					'<%= activeDir %>/js.js': ['src/**/*.js', '!src/assets/**/*.js']
				},
			},
		},
		clean: ['<%= activeDir %>/*'],
		jshint: {
			files: ['src/**/*.js'],
			config: ['package.json', 'gruntfile.js'],
			options: { // documentation: http://www.jshint.com/docs/
				globals: {
					console: true,
					module: true
				},
				smarttabs: true
			}
		},
		watch: {
			options: { nospawn: true },
			app: {
				options: {
					livereload: 13337,
					interval: 5007
					//interrupt: true
				},
				files: ['src/**/*.js', 'src/index.html', 'src/**/*.tpl.html', 'src/php/**/*.php', 'src/assets/css.css'],
				tasks: ['build']
			},
			config: {
				options: {
					event: ['changed']
				},
				files: ['package.json', 'gruntfile.js'],
				tasks: ['jshint:config', 'exit']
			}
		},
		copy: {
			main: {
				files:[
					{dest: '<%= activeDir %>', src: '**', expand: true, cwd: 'src/assets/'},        // assets
					{dest: '<%= activeDir %>/index.html', src: 'src/index.html'},                   // index
					{dest: '<%= activeDir %>/libinc', src: '*/*.php', expand: true, cwd: 'vendor'}, // vendor
					{dest: '<%= activeDir %>', src: '**/*.php', cwd: 'src/php', expand: true}       // php
				]
			},
			dbOut: {
				dest: 'bak/dev/ua-purchase.sqlite3',
				src:  '<%= activeDir %>/libinc/ua-purchase.sqlite3'
			},
			dbIn: {
				dest: '<%= activeDir %>/libinc/ua-purchase.sqlite3',
				src:  'bak/dev/ua-purchase.sqlite3'
			}
		},
		'ftp-deploy': {
			app: {
				src: 'release',
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
					// removeRedundantAttributes: true,
					// removeScriptTypeAttributes: true,
					// removeStyleLinkTypeAttributes: true
				}
			},
			main: {
				src: 'src/**/*.tpl.html',
				dest: '<%= activeDir %>/js-tpl.js'
			}
		},
		php: {
			watch: {
				options: {
					keepalive: true,
					open: true,
					base: 'build',
					port: '4001',
					hostname: 'localhost',
				}
			}
		}
	});

	// Single commands to handle development + build routines
	grunt.registerTask('setPath', function( arg1 ) {
		grunt.config.set( 'activeDir', arg1 );
		grunt.config.set( 'uglify.options.beautify', arg1 == 'build'); // set beautification link
		// if (arg1 == 'build') grunt.config('copy.vendor.files', []); // don't copy vendor on watch builds
		grunt.log.writeln('Setting build path to: ' + arg1 );
	});

	// Exit grunt process
	grunt.registerTask('exit', 'Just exits.', function() { // http://bit.ly/1aoqnTn
		process.exit(0);
	});

	// Load plugins
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-ftp-deploy');
	grunt.loadNpmTasks('grunt-html2js');
	grunt.loadNpmTasks('grunt-php');

	// Define task(s)
	grunt.registerTask('default', ['watch']);
	grunt.registerTask('build',   ['setPath:build', 'process']);
	grunt.registerTask('release', ['setPath:release', 'process', 'ftp-deploy']);
	grunt.registerTask('process', ['copy:dbOut', 'jshint:files', 'clean', 'uglify', 'copy:main', 'html2js', 'copy:dbIn']);
};

// see https://github.com/gruntjs/grunt-contrib-watch#using-the-watch-event