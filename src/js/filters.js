angular.module('myApp.filters', []).

filter('pagination', function() {
	return function(inputArray, selectedPage, pageSize) {
		var start = (selectedPage-1)*pageSize;
		return inputArray.slice(start, start + pageSize);
	};
});