angular.module('myApp.filters', []).

filter('pagination', function() {
	return function(inputArray, selectedPage, pageSize) {
		var start = (selectedPage-1)*pageSize;
		return inputArray.slice(start, start + pageSize);
	};
}).

// Override angular-ui to fix a fex dom issues and styling things with pagination
run(['$templateCache', function($templateCache){
	$templateCache.put('template/pagination/pagination.html', 
		"<div style=\"text-align:center\" ng-hide=\"totalPages == 1\"><ul class=\"pagination pagination-sm\">\n" +
		"  <li ng-repeat=\"page in pages\" ng-class=\"{active: page.active, disabled: page.disabled}\"><a ng-click=\"selectPage(page.number)\">{{page.text}}</a></li>\n" +
		"  </ul>\n" +
		"</div>\n" +
		"");
	}
]);