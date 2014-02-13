angular.module('myApp.main', [
	'myApp.main.reset',
	'myApp.main.payment',
	'myApp.main.recipt',
	'myApp.main.purchases',
	'myApp.main.register',
	'myApp.main.user',
	'myApp.main.cart',
	'myApp.main.conference',
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
		if (security.currentUser !== null) $location.replace('/cart');
	}, true);
	$scope.theCart = theCart;
}]);