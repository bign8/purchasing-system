angular.module('myApp.main.payment', [
	
]).

config(['$routeProvider', function( $routeProvider ){
	$routeProvider.when('/payment', {
		title: 'Custom Payment',
		subTitle: 'form',
		templateUrl: 'app/main/payment/payment.tpl.html',
		controller: 'CustomPaymentCtrl'
	});
}]).

controller('CustomPaymentCtrl', ['$scope', 'theCart', '$location', 'appStrings', function ($scope, theCart, $location, appStrings){
	var orig = {
		itemID: -1,
		productID: -1,
		name: appStrings.pay.customPayName,
		template: 'custom',
		img: null
	};
	$scope.item = angular.copy(orig);
	$scope.add = function() {
		var promise = theCart.add( $scope.item );
		promise.then(function (res) {
			if (res) {
				$scope.message = appStrings.payment.success();
				$scope.item = angular.copy(orig);
				$location.path('/cart');
			} else {
				$scope.message = appStrings.payment.failure();
			}
		});
	};
}]);