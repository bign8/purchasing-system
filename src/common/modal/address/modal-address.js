angular.module('myApp.common.modal.address', []).

controller('ModalAddressCtrl', ['$scope', '$modalInstance', 'address', 'interface', 'appStrings', function ($scope, $modalInstance, address, interface, appStrings){
	$scope.address = address || {addressID:null, addr2: ''};
	$scope.ok = function() {
		// use interface to add/edit address in db
		var fun = ($scope.address.addressID === null || $scope.address.addressID === undefined) ? 'add' : 'edit' ;
		interface.user(fun + 'Address', $scope.address).then(function (res) {
			$scope.address.addressID = JSON.parse(res);
			$modalInstance.close($scope.address);
		}, function() {
			$scope.message = appStrings.address.error();
		});
	};
	$scope.cancel = function() {
		$modalInstance.dismiss();
	};
}]);