module.exports = function(grunt) {
	grunt.initConfig({
		// Grunt variables
		activeDir: 'dev',  // this gets overloaded with setPath
		uploadDir: 'dev/', // this gets overloaded with setPath
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
					livereload: 1337,
					//interrupt: true
				},
				files: ['src/**/*.js', 'src/index.html', 'src/**/*.tpl.html', 'src/php/**/*', 'src/assets/css.css'],
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
			}
		},
		'ftp-deploy': {
			php: {
				src: '<%= activeDir %>',
				exclusions: ['!build/**/*.php'], // overrides by onChange
				auth: "<%= settings.ftpDeploy.auth %>",
				dest: "<%= settings.ftpDeploy.dest %><%= uploadDir %>"
			},
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
		connect: {
			server: {
				options: {
					port: 4001,
					base: 'build',
					hostname: '*',
					middleware: function(connect, options) {
						var middlewares = [];
						if (!Array.isArray(options.base)) {
							options.base = [options.base];
						}
						var directory = options.directory || options.base[options.base.length - 1];
						options.base.forEach(function(base) {
							// Serve static files.
							middlewares.push(connect.static(base));
						});
						// Make directory browse-able.
						middlewares.push(connect.directory(directory));
						
						// ***
						// Not found - just serve index.html
						// ***
						middlewares.push(function(req, res){
							for(var file, i = 0; i < options.base.length; i++){
								file = options.base + "/index.html"; 
								if (grunt.file.exists(file)){
									require('fs').createReadStream(file).pipe(res);
									return; // we're done
								}
							}
							res.statusCode(404); // where's index.html?
							res.end();
						});
						return middlewares;
					}
				}
			}
		}
	});

	// Watching for php changes or not
	var changedFiles = Object.create(null);
	var onChange = grunt.util._.debounce(function() {
		var hasPhp = false, arr = Object.keys(changedFiles);
		for (var i = arr.length - 1; i >= 0; i--) if (arr[i].match(/\.php/)) hasPhp = true;
		grunt.config('ftp-deploy.php.exclusions', hasPhp ? ['build/**/*.{png,ico,txt,css,html,js}'] : ['**'] );
		changedFiles = Object.create(null);
	}, 200);
	grunt.event.on('watch', function(action, filepath, target) { // http://bit.ly/1fygfyP
		changedFiles[filepath] = action;
		onChange();
	});

	// Single commands to handle development + build routines
	grunt.registerTask('setPath', function( arg1 ) {
		grunt.config.set( 'activeDir', arg1 );
		var isBuild = (arg1 == 'build');
		grunt.config.set( 'uploadDir', isBuild ? 'dev/' : '');
		grunt.config.set( 'uglify.options.beautify', isBuild);      // set beautification link
		if (arg1 == 'build') grunt.config('copy.vendor.files', []); // don't copy vendor on watch builds
		grunt.log.writeln('Setting build path to: ' + arg1 );
	});

	// Exit grunt process
	grunt.registerTask('exit', 'Just exits.', function() { // http://bit.ly/1aoqnTn
		process.exit(0);
	});

	// Load plugins
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-ftp-deploy');
	grunt.loadNpmTasks('grunt-html2js');

	// Define task(s)
	grunt.registerTask('default', ['connect', 'watch']);
	grunt.registerTask('build',   ['setPath:build', 'process', 'ftp-deploy:php']);
	grunt.registerTask('release', ['setPath:release', 'process', 'ftp-deploy:app']);
	grunt.registerTask('process', ['jshint:files', 'clean', 'uglify', 'copy', 'html2js']);
};

// see https://github.com/gruntjs/grunt-contrib-watch#using-the-watch-event