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
}]).

factory('myCart', function() {
	var cart = JSON.parse(localStorage.azUAcart || '[]');

	var update = function() {
		localStorage.azUAcart = JSON.stringify(cart);
	};

	return {
		len: function() {
			return cart.length;
		},
		add: function(item) {
			cart.push(item.productID);
			update();
		},
		rem: function(index) {
			cart.splice(index, 1);
			update();
		},
		list: function() {
			return cart;
		},
		contains: function(item) {
			return cart.indexOf(item.productID) !== -1;
		},
		total: function() {
			var tot = 0;
			for (var x in cart) {
				tot += cart[x].cost;
			}
			return tot;
		},
		clear: function() {
			cart = [];
			update();
		}
	};
}).

factory('interface', ['$http', function ($http) {

	return {
		call: function(myAction, data) {
			return $http.post('http://uastore.wha.la/interface.php', data, {params:{action: myAction}});
		}
	};
}]);

// http://www.codeproject.com/Articles/576246/A-Shopping-Cart-Application-Built-with-AngularJS