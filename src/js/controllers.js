// This file contains a few controllers

angular.module('myApp.controllers', [
	'myApp.services',
	'ui.bootstrap'
]).

controller('IndexCtrl', ['$scope', 'theCart', 'security', function ($scope, theCart, security) {
	$scope.$watch(function() {return security.currentUser;}, function() {
		if (security.currentUser !== null) security.redirect('/cart');
	}, true);
	$scope.theCart = theCart;
}]).

controller('HeadCtrl', ['$scope', 'myPage', 'breadcrumbs', 'theCart', 'security', function ($scope, myPage, breadcrumbs, theCart, security) {
	$scope.myPage = myPage;
	$scope.breadcrumbs = breadcrumbs;
	$scope.theCart = theCart;
	$scope.security = security;
}]).

controller('ModalAddressCtrl', ['$scope', '$modalInstance', 'address', 'interface', 'appStrings', function ($scope, $modalInstance, address, interface, appStrings){
	$scope.address = address || {addressID:null, addr2: null};
	$scope.ok = function() {
		// use interface to add/edit address in db
		var fun = ($scope.address.addressID === null) ? 'add' : 'edit' ;
		interface.user(fun + 'Address', $scope.address).then(function (res) {
			$scope.address.addressID = JSON.parse(res);
			$modalInstance.close($scope.address);
		}, function() {
			$scope.message = appStrings.address.error;
		});
	};
	$scope.cancel = function() {
		$modalInstance.dismiss();
	};
}]);