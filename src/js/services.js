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
	var fullCart = [];

	var update = function() {
		localStorage.azUAcart = JSON.stringify(cart);
	};

	return {
		len: function() {
			return cart.length;
		},
		add: function(item) {
			cart.push(item.itemID);
			update();
		},
		rem: function(index) {
			cart.splice(index, 1);
			fullCart.splice(index, 1);
			update();
		},
		contains: function(item) {
			return cart.indexOf(item.itemID) !== -1;
		},

		// fullCart data
		list: function() {
			return fullCart;
		},
		setFull: function(data) {
			fullCart = data;
		},
		total: function() {
			var tot = 0;
			fullCart.forEach(function(ele){
				tot += parseFloat(ele.cost);
			});
			// for (var x in fullCart) {
			// 	tot += parseFloat(fullCart[x].cost);
			// }
			return tot;
		},
		clear: function() {
			cart = [];
			fullCart = [];
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