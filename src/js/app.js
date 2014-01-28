// Initial application

angular.module('myApp', [
	'ngRoute',
	'myApp.controllers',
	'myApp.directives',
	'myApp.filters',
	'security',
	'myApp.services',
	'myApp.directives',
	'templates-main' // for html2js
]).

config(['$routeProvider', 'securityAuthorizationProvider', '$locationProvider', function( $routeProvider, securityAuthorizationProvider, $locationProvider ){
	$locationProvider.html5Mode(true).hashPrefix('!');

	$routeProvider.
		when('/payment', {
			title: 'Custom Payment',
			subTitle: 'form',
			templateUrl: 'partials/custom-payment-form.tpl.html',
			controller: 'CustPayFormCtrl'
		}).
		when('/register', {
			title: 'Registration',
			subTitle: 'Form',
			templateUrl: 'partials/register-form.tpl.html',
			controller: 'RegisterFormCtrl',
			resolve: {
				firms: ['interface', function (interface) {
					return interface.user('listFirms');
				}]
			}
		}).
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
		when('/reset/:hash', {
			title: 'Reset Password',
			templateUrl: 'partials/reset-password.tpl.html',
			controller: 'ResetPassCtrl',
			resolve: {
				check: ['interface', '$route', function (interface, $route) {
					return interface.user('checkReset', $route.current.params);
				}]
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
		when('/recipt', { // shows a recipt of items purchased for last order
			title: "Recipt",
			subTitle: "from last purchase",
			templateUrl: 'partials/recipt-print.tpl.html',
			controller: 'ReciptCtrl',
			resolve: {
				user: securityAuthorizationProvider.requireAuthenticatedUser
			}
		}).
		when('/purchases', {
			title: "Previous Purchases",
			templateUrl: 'partials/list-purchases.tpl.html',
			controller: 'ListPurchasesCtrl',
			resolve: {
				user: securityAuthorizationProvider.requireAuthenticatedUser,
				items: ['interface', function(interface) {
					return interface.cart('getPurchases');
				}]
			}
		}).
		when('/user', {
			title: "Account Settings",
			templateUrl: 'partials/user-form.tpl.html',
			controller: 'UserFormCtrl',
			resolve: {
				firms: ['interface', function(interface) {
					return interface.user('listFirms');
				}],
				user: ['interface', function(interface) {
					return interface.user('getFullUser');
				}]
			}
		}).

		// Administration pages
		when('/admin', {
			title: 'Administration',
			templateUrl: 'partials/admin/index.tpl.html',
			resolve: {
				user: securityAuthorizationProvider.requireAdminUser
			}
		}).
		when('/admin/discounts', {
			title: 'Manage Discounts',
			templateUrl: 'partials/admin/discounts.tpl.html',
			resolve: {
				user: securityAuthorizationProvider.requireAdminUser
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