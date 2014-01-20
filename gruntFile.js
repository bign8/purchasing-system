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
					{dest: '<%= activeDir %>', src: '**', expand: true, cwd: 'src/assets/'},
					{dest: '<%= activeDir %>/index.html', src: 'src/index.html'}
				]
			},
			php: {
				dest: '<%= activeDir %>',
				src: ['**/*.php'],
				cwd: 'src/php',
				expand: true
			},
			vendor: {
				files: [
					{dest: '<%= activeDir %>/libinc', src: '*/*.php', expand: true, cwd: 'vendor'}
				]
			}
		},
		'ftp-deploy': {
			php: {
				src: '<%= activeDir %>',
				exclusions: ['!build/**/*.php'], // overrides by onChange
				auth: "<%= settings.ftpDeploy.auth %>",
				dest: "<%= settings.ftpDeploy.dest %>"
			},
			app: {
				src: '<%= activeDir %>',
				exclusions: ['build/**/*.{php,png,ico,txt}'],
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
		}
	});

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

	grunt.registerTask('setPath', function( arg1 ) {
		grunt.config.set( 'activeDir', arg1 );
		grunt.config.set( 'uglify.options.beautify', arg1 == 'build'); // set beautification link
		if (arg1 == 'build') grunt.config('copy.vendor.files', []); // don't copy vendor on watch builds
		grunt.log.writeln('Setting build path to: ' + arg1 );
	});

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

	// Define task(s)
	grunt.registerTask('default', ['watch']);

	grunt.registerTask('build', ['setPath:build', 'process']);
	grunt.registerTask('release', ['setPath:release', 'process']);
	grunt.registerTask('process', ['jshint:files', 'clean', 'uglify', 'copy', 'html2js', 'ftp-deploy']);
};

// see https://github.com/gruntjs/grunt-contrib-watch#using-the-watch-event