angular.module('myApp.common.filters.replace', []).

filter('replace', function() { // https://github.com/angular/angular.js/pull/3877
	return function(input, replacements){

		// Handle invalid replacements
		if (!angular.isObject(replacements)) {
			return input;
		}

		// Perform replacements
		angular.forEach(replacements, function (to, from) {
			// Convert to regular expression for global replacement
			var regex = new RegExp(from, "g");
			input = input.replace(regex, to);
		});

		return input;
	};
});