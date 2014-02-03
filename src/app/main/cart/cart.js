angular.module('myApp.main.cart', [

]).

config(['$routeProvider', 'securityAuthorizationProvider', function ( $routeProvider, securityAuthorizationProvider ){
	$routeProvider. when('/cart', {
		title: "Shopping Cart",
		subTitle: "Checkout",
		templateUrl: 'app/main/cart/cart.tpl.html',
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
	});
}]).

controller('CartCtrl', ['$scope', '$modal', 'interface', '$location', 'theCart', 'discounts', 'appStrings', function ($scope, $modal, interface, $location, theCart, discounts, appStrings) {
	$scope.theCart = theCart;
	$scope.discounts = discounts;
	$scope.discountMsg = false;
	$scope.submitMsg = false;

	theCart.registerObserver(function() { // update discounts with cart updates
		interface.cart('getDiscount').then(function(res) {
			$scope.discounts = res;
		});
		checkWarn();
	});
	var checkWarn = function() {
		var found = false;
		angular.forEach(theCart.get(), function(item) {
			if (item.warn) found = true;
		});
		$scope.submitMsg = (found) ? appStrings.cart.warn : false ;
	};
	checkWarn();

	$scope.total = function() { // Cart total calculation
		return $scope.theCart.total() - $scope.discountTotal();
	};
	$scope.discountTotal = function() { // On the fly discount summation
		var total = 0;
		angular.forEach($scope.discounts, function (item) {
			total += parseFloat( item.amount );
		});
		return total;
	};
	$scope.addDiscount = function(code) { // add discount
		interface.cart('addDiscount', {code:code}).then(function (res) {
			$scope.discountMsg = appStrings.cart.disc_yep; // assign a reset-able message
			$scope.discounts.push( res ); // add object on good callback
		}, function(res) {
			$scope.discountMsg = appStrings.cart['disc_' + res]; // assign a reset-able message
		});
	};
	$scope.remDiscount = function(myDiscount) { // remove discount
		interface.cart('remDiscount', myDiscount).then(function(res) {
			$scope.discounts = res;
		});
	};
	$scope.saveCart = function(medium) { // save price (everything else is already on server)
		if ($scope.total() < 0) {
			$scope.submitMsg = appStrings.cart.negative;
			return;
		}
		var fail = false;
		angular.forEach(theCart.get(), function(item) { // verify options are set
			if ( item.hasOptions && !item.cost.set ) fail = true;
		});
		if (fail) {
			$scope.submitMsg = appStrings.cart.needOpt;
			return;
		}
		angular.forEach(theCart.get(), function(item) { // verify double purchases
			if (item.warn) fail = true;
		});
		if (fail) {
			$scope.submitMsg = appStrings.cart.prevPer;
			return;
		}
		$scope.submitMsg = appStrings.cart.checkOut;
		interface.cart('save', {cost:$scope.total(), medium:medium}).then(function() {
			var cart = {
				list: theCart.get(),
				disTotal: $scope.discountTotal(),
				total: $scope.total(),
				medium: medium
			};
			localStorage.setItem('UA-recipt', JSON.stringify( cart )); // store off cart

			if (medium == 'online') { // direct accordingly
				var obj = appStrings.paypal.uri;
				obj[appStrings.paypal.totalParam] = cart.total;
				document.location = appStrings.paypal.url + '?' + $.param(obj);
			} else {
				$location.path('/recipt'); // go to checkout page
			}
			theCart.setDirty(); // make sure empty cart gets loaded into the system
		});
	};
}]);