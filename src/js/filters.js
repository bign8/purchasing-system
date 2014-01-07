angular.module('myApp.filters', []).

filter('pagination', function() {
	return function(inputArray, selectedPage, pageSize) {
		var start = (selectedPage-1)*pageSize;
		return inputArray.slice(start, start + pageSize);
	};
}).

filter('truncate', function () {
	return function (text, length, end) {
		if (isNaN(length)) length = 10;
		if (end === undefined) end = "...";

		if (text.length <= length || text.length - end.length <= length) {
			return text;
		} else {
			return String(text).substring(0, length-end.length) + end;
		}

	};
}).

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