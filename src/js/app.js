// Initial application

angular.module('myApp', [
	'ngRoute',
	'myApp.admin',
	'myApp.controllers',
	'myApp.directives',
	'myApp.filters',
	'security',
	'myApp.services',
	'myApp.directives',
	'templates-main', // for html2js

	'myApp.main' // to split things up
]).

config(['$routeProvider', 'securityAuthorizationProvider', '$locationProvider', function( $routeProvider, securityAuthorizationProvider, $locationProvider ){
	$locationProvider.html5Mode(true).hashPrefix('!');

	$routeProvider.
		when('/', { // Home
			title: "Upstream Academy",
			subTitle: "Guiding accounting firms to high performance",
			templateUrl: 'partials/index.tpl.html',
			controller: 'IndexCtrl',
			resolve: {
				fullCart: ['theCart', function (theCart) {
					return theCart.load();
				}]
			}
		}).
		when('/register/:itemID', {
			title: 'Register',
			templateUrl: 'partials/register-conf.tpl.html',
			controller: 'RegisterConFormCtrl',
			resolve: {
				conference: ['interface', '$route', function (interface, $route) {
					return interface.cart('getOption', $route.current.params);
				}],
				user: securityAuthorizationProvider.requireAuthenticatedUser
			}
		}).
		when('/cart', { // list items in cart
			title: "Shopping Cart",
			subTitle: "Checkout",
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
		otherwise({ redirectTo: '/' });
}]).

run(['security', 'theCart', function(security, theCart) {
  // Get the current user when the application starts (in case they are still logged in from a previous session)
  security.requestCurrentUser();

  // prefetch cart if necessary
  theCart.load();
}]);