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
});