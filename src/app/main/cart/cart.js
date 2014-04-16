angular.module('myApp.main.cart', []).

config(['$routeProvider', 'securityAuthorizationProvider', function ( $routeProvider, securityAuthorizationProvider ){
	$routeProvider. when('/cart', {
		title: "Shopping Cart",
		subTitle: "Checkout",
		templateUrl: 'app/main/cart/cart.tpl.html',
		controller: 'CartCtrl',
		resolve: {
			preLoad: ['theCart', function (theCart) {
				theCart.setDirty();
				return theCart.load(); // won't use data, will pre-fetch data
			}],
			user: securityAuthorizationProvider.requireAuthenticatedUser
		}
	});
}]).

controller('CartCtrl', ['$scope', '$modal', 'interface', '$location', 'theCart', 'appStrings', function ($scope, $modal, interface, $location, theCart, appStrings) {
	$scope.theCart = theCart;
	$scope.discountMsg = false;
	$scope.submitMsg = false;

	theCart.registerObserver(function() {
		checkWarn();
	});
	var checkWarn = function() {
		var found = false;
		angular.forEach(theCart.cart, function(item) {
			if (item.warn) found = true;
		});
		$scope.submitMsg = (found) ? appStrings.cart.warn() : false ;
	};
	checkWarn();

	$scope.addDiscount = function(code) { // add discount
		theCart.addDiscount(code).then(function (res) {
			$scope.discountMsg = appStrings.cart.disc_yep(); // assign a reset-able message
		}, function (res) {
			$scope.discountMsg = appStrings.cart['disc_' + res](); // assign a reset-able message
		});
	};
	$scope.saveCart = function(medium) { // save price (everything else is already on server)
		if (theCart.fullTotal() < 0) {
			$scope.submitMsg = appStrings.cart.negative();
			return;
		}
		var fail = false;
		angular.forEach(theCart.cart, function(item) { // verify options are set
			if ( item.hasOptions && !item.cost.set ) fail = true;
		});
		if (fail) {
			$scope.submitMsg = appStrings.cart.needOpt();
			return;
		}
		angular.forEach(theCart.cart, function(item) { // verify double purchases
			if (item.warn) fail = true;
		});
		if (fail) {
			$scope.submitMsg = appStrings.cart.prevPur();
			return;
		}
		$scope.submitMsg = appStrings.cart.checkOut();
		interface.cart('save', {cost:theCart.fullTotal(), medium:medium}).then(function() {
			var cart = {
				list: theCart.cart,
				disTotal: theCart.totDiscount(),
				total: theCart.fullTotal(),
				medium: medium
			};
			localStorage.setItem('UA-receipt', JSON.stringify( cart )); // store off cart

			if (medium == 'online') { // direct accordingly
				var obj = appStrings.paypal.uri;
				obj[appStrings.paypal.totalParam] = cart.total;
				document.location = appStrings.paypal.url + '?' + param(obj);
			} else {
				$location.path('/receipt'); // go to checkout page
			}
			theCart.setDirty(); // make sure empty cart gets loaded into the system
		});
		var param = function(obj) {
			var ret = [];
			for ( var idx in obj ) ret.push( encodeURIComponent(idx) + '=' + encodeURIComponent(obj[idx]) );
			return ret.join( '&' ).replace(/%20/g, '+');
		};
	};
}]);