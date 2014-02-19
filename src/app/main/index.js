angular.module('myApp.main', [
	'myApp.main.cart',
	'myApp.main.checkout',
	'myApp.main.conference',
	'myApp.main.payment',
	'myApp.main.purchases',
	'myApp.main.recipt',
	'myApp.main.register',
	'myApp.main.reset',
	'myApp.main.user',
]).

config(['$routeProvider', function ( $routeProvider ){
	$routeProvider.when('/', {
		title: "Upstream Academy",
		subTitle: "Guiding accounting firms to high performance",
		templateUrl: 'app/main/index.tpl.html',
		controller: 'IndexCtrl',
		resolve: {
			fullCart: ['theCart', function (theCart) {
				return theCart.load();
			}]
		}
	});
}]).

controller('IndexCtrl', ['$scope', 'theCart', 'security', '$location', function ($scope, theCart, security, $location) {
	$scope.$watch(function() {return security.currentUser;}, function() {
		if (security.currentUser !== null) $location.path('/cart');
	}, true);
	$scope.theCart = theCart;
}]);