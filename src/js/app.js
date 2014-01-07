// Initial application

angular.module('myApp', [
	'ngRoute',
	'myApp.controllers',
	'myApp.filters',
	'security',
	'myApp.services',
	'myApp.directives',
	'templates-main' // for html2js
]).

config(['$routeProvider', 'securityAuthorizationProvider', function( $routeProvider, securityAuthorizationProvider ){
	$routeProvider.

		// Working Pages

		when('/payment', {
			templateUrl: 'partials/custom-payment-form.tpl.html',
			controller: 'CustPayFormCtrl'
		}).

		// In-progress Pages
		
		// total computation needs fixing (requires register/:itemID page)
		when('/', { // Home - statically generated (static tpl with links)
			templateUrl: 'partials/index.tpl.html',
			controller: 'IndexCtrl',
			resolve: {
				fullCart: function(theCart) {
					return theCart.load();
				}
			}
		}).

		// when('/register/:itemID', {
		// 	templateUrl: 'partials/register-conf.tpl.html',
		// 	controller: 'RegisterConFormCtrl',
		// 	resolve: {
		// 		questions: function(interface, $route) {
		// 			return interface.cart('con', $route.current.params);
		// 		}
		// 	}
		// }).

		when('/register', {
			templateUrl: 'partials/register-form.tpl.html',
			controller: 'RegisterFormCtrl'
		}).

		// Staged pages

		// when('/products', { // List Products - render list of offered products
		// 	templateUrl: 'partials/list-products.tpl.html',
		// 	controller: 'ListProdCtrl',
		// 	resolve: {
		// 		prodList: function(interface, $route) {
		// 			return interface.call('getProducts', $route.current.params);
		// 		}
		// 	}
		// }).
		// when('/products/:prodID', { // List Items - render list of items offered within product
		// 	templateUrl: 'partials/list-items.tpl.html',
		// 	controller: 'ListItemCtrl',
		// 	resolve: {
		// 		itemList: function(interface, $route) {
		// 			return interface.call('getItems', $route.current.params);
		// 		}
		// 	}
		// }).
		// when('/products/:prodID/:itemID', { // Show Item details - include add to cart button
		// 	templateUrl: 'partials/show-item.tpl.html',
		// 	controller: 'ShowItemCtrl',
		// 	resolve: {
		// 		itemDetail: function(interface, $route) {
		// 			return interface.call('getItem', $route.current.params);
		// 		}
		// 	}
		// }).

		// // CART
		when('/cart', { // list items in cart
			templateUrl: 'partials/show-cart.tpl.html',
			controller: 'CartCtrl',
			resolve: {
				fullCart: function(theCart) {
					return theCart.load();
				},
				user: securityAuthorizationProvider.requireAuthenticatedUser
			}
		}).
		// when('/recipt', { // shows a recipt of items purchased for a specific order
		// 	templateUrl: 'partials/recipt-print.tpl.html',
		// 	controller: 'ReciptCtrl',
		// 	resolve: {
		// 		user: securityAuthorizationProvider.requireAuthenticatedUser
		// 	}
		// }).

		// // USER STUFF
		

		// when('/purchases', {
		// 	templateUrl: 'partials/list-purchases.tpl.html',
		// 	controller: 'ListPurchasesCtrl',
		// 	resolve: {
		// 		user: securityAuthorizationProvider.requireAuthenticatedUser,
		// 		items: function(interface) {
		// 			return interface.call('getPurchases');
		// 		}
		// 	}
		// }).


		// // TODO: build administration section
		// when('/admin', {
		// 	resolve: {
		// 		user: securityAuthorizationProvider.requireAdminUser
		// 	}
		// }).
		otherwise({ redirectTo: '/' });
}])

.run(['security', 'theCart', function(security, theCart) {
  // Get the current user when the application starts
  // (in case they are still logged in from a previous session)
  security.requestCurrentUser();

  // prefetch cart if necessary
  theCart.load();
}]);