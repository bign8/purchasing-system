// Initial application

angular.module('myApp', [
	'ngRoute',
	'myApp.controllers',
	'myApp.filters',
	'security',
	'myApp.services',
	'myApp.directives'
]).

config(['$routeProvider', 'securityAuthorizationProvider', function( $routeProvider, securityAuthorizationProvider ){
	$routeProvider.
		when('/', { // Home - statically generated (static tpl with links)
			templateUrl: 'partials/index.tpl.html',
			controller: 'IndexCtrl'
		}).
		when('/products', { // List Products - render list of offered products
			templateUrl: 'partials/list-products.tpl.html',
			controller: 'ListProdCtrl',
			resolve: {
				prodList: function(interface, $route) {
					return interface.call('getProducts', $route.current.params);
				}
			}
		}).
		when('/products/:prodID', { // List Items - render list of items offered within product
			templateUrl: 'partials/list-items.tpl.html',
			controller: 'ListItemCtrl',
			resolve: {
				itemList: function(interface, $route) {
					return interface.call('getItems', $route.current.params);
				}
			}
		}).
		when('/products/:prodID/:itemID', { // Show Item details - include add to cart button
			templateUrl: 'partials/show-item.tpl.html',
			controller: 'ShowItemCtrl',
			resolve: {
				itemDetail: function(interface, $route) {
					return interface.call('getItem', $route.current.params);
				}
			}
		}).

		// CART
		when('/cart', { // list items in cart
			templateUrl: 'partials/show-cart.tpl.html',
			controller: 'CartCtrl',
			resolve: {
				fullCart: function(printCart) {
					return printCart.load();
				},
				user: securityAuthorizationProvider.requireAuthenticatedUser
			}
		}).
		when('/cart/recipt', { // shows a recipt of items purchased for a specific order
			templateUrl: 'partials/recipt-print.tpl.html',
			controller: 'ReciptCtrl',
			resolve: {
				user: securityAuthorizationProvider.requireAuthenticatedUser
			}
		}).

		// USER STUFF
		when('/register', {
			templateUrl: 'partials/register-form.tpl.html',
			controller: 'RegisterFormCtrl'
		}).
		when('/purchases', {
			// TODO: show list of past purchases and allow modification/re-download
			templateUrl: 'partials/list-purchases.tpl.html',
			controller: 'ListPurchasesCtrl',
			resolve: {
				user: securityAuthorizationProvider.requireAuthenticatedUser,
				items: function(interface) {
					return interface.call('getPurchases');
				}
			}
		}).
		when('/payment', {
			templateUrl: 'partials/custom-payment-form.tpl.html',
			controller: 'CustPayFormCtrl'
		}).
		when('/admin', {
			// TODO: build administration section
			resolve: {
				user: securityAuthorizationProvider.requireAdminUser
			}
		}).
		otherwise({ redirectTo: '/' });
}])

.run(['security', function(security) {
  // Get the current user when the application starts
  // (in case they are still logged in from a previous session)
  security.requestCurrentUser();
}]);