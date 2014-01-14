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

config(['$routeProvider', 'securityAuthorizationProvider', '$locationProvider', function( $routeProvider, securityAuthorizationProvider, $locationProvider ){
	$locationProvider.html5Mode(true);//.hashPrefix('!');

	$routeProvider.
		when('/payment', {
			templateUrl: 'partials/custom-payment-form.tpl.html',
			controller: 'CustPayFormCtrl'
		}).
		when('/register', {
			templateUrl: 'partials/register-form.tpl.html',
			controller: 'RegisterFormCtrl',
			resolve: {
				firms: ['interface', function (interface) {
					return interface.user('listFirms');
				}]
			}
		}).
		when('/', { // Home
			templateUrl: 'partials/index.tpl.html',
			controller: 'IndexCtrl',
			resolve: {
				fullCart: ['theCart', function (theCart) {
					return theCart.load();
				}]
			}
		}).
		when('/register/:itemID', {
			templateUrl: 'partials/register-conf.tpl.html',
			controller: 'RegisterConFormCtrl',
			resolve: {
				conference: ['interface', '$route', function(interface, $route) {
					return interface.cart('getOption', $route.current.params);
				}],
				user: securityAuthorizationProvider.requireAuthenticatedUser
			}
		}).
		when('/cart', { // list items in cart
			templateUrl: 'partials/show-cart.tpl.html',
			controller: 'CartCtrl',
			resolve: {
				preLoad: ['theCart', function (theCart) {
					return theCart.load(); // won't use data, will pre-fetch data
				}],
				discounts: ['interface', function (interface) {
					return interface.cart('getDiscount');
				}],
				user: securityAuthorizationProvider.requireAuthenticatedUser
			}
		}).
		when('/recipt', { // shows a recipt of items purchased for last order
			templateUrl: 'partials/recipt-print.tpl.html',
			controller: 'ReciptCtrl',
			resolve: {
				user: securityAuthorizationProvider.requireAuthenticatedUser
			}
		}).
		when('/purchases', {
			templateUrl: 'partials/list-purchases.tpl.html',
			controller: 'ListPurchasesCtrl',
			resolve: {
				user: securityAuthorizationProvider.requireAuthenticatedUser,
				items: ['interface', function(interface) {
					return interface.cart('getPurchases');
				}]
			}
		}).
		// when('/user', {
		// 	templateUrl: 'partials/user-form.tpl.html',
		// 	controller: 'UserFormCtrl',
		// 	resolve: {
		// 		firms: function(interface) {
		// 			return interface.user('listFirms');
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
}]).

run(['security', 'theCart', function(security, theCart) {
  // Get the current user when the application starts (in case they are still logged in from a previous session)
  security.requestCurrentUser();

  // prefetch cart if necessary
  theCart.load();
}]);