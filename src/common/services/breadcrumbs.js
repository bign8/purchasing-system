angular.module('myApp.common.services.breadcrumbs', []).

factory('breadcrumbs', ['$rootScope', '$location', 'interface', function ($rootScope, $location, interface) {
	var breadcrumbs = [];

	$rootScope.$on('$routeChangeSuccess', function(event, current) {
		var pathElements = $location.path().split('/'), result = [], i;
		var breadcrumbPath = function (index) {
			return '/' + (pathElements.slice(0, index + 1)).join('/');
		};

		// pretty crumb cash and calling function
		function prettyCrumb(obj) {
			if (!$location.path().match(/\/(reset)\//)) {
				var crumbCashe = JSON.parse(localStorage.getItem('crumbCashe') || "{}");
				if (crumbCashe.hasOwnProperty(obj.path)) { // in in cashe
					obj.name = crumbCashe[obj.path];
				} else { // otherwise
					interface.app('prettyCrumb', obj).then(function (label) {
						crumbCashe[obj.path] = label; // assign cashe
						breadcrumbs[obj.index].name = label; // assign value out
						localStorage.setItem('crumbCashe', JSON.stringify(crumbCashe));
					});
				}
			}
			return obj.name;
		}

		// Pretty path elements (thanks http://phpjs.org/functions/ucfirst/)
		function ucfirst (str) {
			str += '';
			var f = str.charAt(0).toUpperCase();
			return f + str.substr(1);
		}

		if (pathElements[1] !== '' && pathElements[1] !== 'cart') { // remove empty navigation to home
			pathElements.shift();

			for (i=0; i<pathElements.length; i++) {
				if (pathElements[i] == 'conference') pathElements[i] = 'event';
				var obj = {
					name: ucfirst(pathElements[i]),
					path: breadcrumbPath(i),
					index: i, // used for prettyCrumb
				};
				if ( obj.name.match(/^[0-9a-fA-F]+$/) ) obj.name = prettyCrumb(obj); // make that ugly (hex) crumb pretty
				result.push(obj);
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
			if (crumb === '' && breadcrumbs.length === 0) return true;
			return crumb == (breadcrumbs[breadcrumbs.length-1] || {name:'undefined'}).name;
		}
	};
}]);