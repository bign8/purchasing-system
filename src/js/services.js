angular.module('myApp.services', [

]).

factory('myPage', function( ){
	var pageTitle = "Upstream Academy Shop";
	var subTitle = "";

	return {
		setTitle: function( newTitle, newSubTitle ){
			pageTitle = newTitle;
			subTitle = newSubTitle;
		},
		getTitle: function() {
			return pageTitle;
		},
		getSubTitle: function() {
			return subTitle;
		}
	};
}).

factory('breadcrumbs', ['$rootScope', '$location', function ($rootScope, $location) {
	var breadcrumbs = [];

	$rootScope.$on('$routeChangeSuccess', function(event, current) {
		var pathElements = $location.path().split('/'), result = [], i;
		var breadcrumbPath = function (index) {
			return '/' + (pathElements.slice(0, index + 1)).join('/');
		};

		if (pathElements[1] !== '') { // remove empty navigation to home
			pathElements.shift();
			for (i=0; i<pathElements.length; i++) {
				result.push({
					name: pathElements[i],
					path: '#' + breadcrumbPath(i)
				});
			}
		}

		breadcrumbs = result;
	});

	return {
		getAll: function() {
			return breadcrumbs;
		},
		getFirst: function() {
			return breadcrumbs[0] || {};
		},
		onPage: function( crumb ) {
			return crumb == (breadcrumbs[breadcrumbs.length-1] || {name:'undefined'}).name;
		}
	};
}]);