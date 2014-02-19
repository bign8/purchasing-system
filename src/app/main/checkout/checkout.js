angular.module('myApp.main.checkout', []).

config(['$routeProvider', 'securityAuthorizationProvider', function ( $routeProvider, securityAuthorizationProvider ){
	$routeProvider. when('/checkout/:medium', {
		controller: 'CheckoutCtrl',
		template: '<div>Saving Cart...</div>',
		resolve: {
			preLoad: ['theCart', function (theCart) {
				return theCart.load(); // won't use data, will pre-fetch data
			}],
			params: ['$route', function ($route) {
				return $route.current.params;
			}],
			user: securityAuthorizationProvider.requireAuthenticatedUser
		}
	});
}]).

controller('CheckoutCtrl', ['$scope', 'interface', '$location', 'theCart', 'params', function ($scope, interface, $location, theCart, params) {
	interface.cart('save', {cost:theCart.fullTotal(), medium:params.medium}).then(function() {
		var cart = {
			list: theCart.cart,
			disTotal: theCart.totDiscount(),
			total: theCart.fullTotal(),
			medium: params.medium
		};
		localStorage.setItem('UA-recipt', JSON.stringify( cart )); // store off cart
		$location.path('/recipt'); // go to checkout page
		theCart.setDirty(); // make sure empty cart gets loaded into the system
	});
}]);