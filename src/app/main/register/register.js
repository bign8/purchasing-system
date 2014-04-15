angular.module('myApp.main.register', [
	'ui.bootstrap'
]).

config(['$routeProvider', function ( $routeProvider ){
	$routeProvider.when('/register', {
		title: 'Registration',
		subTitle: 'Form',
		templateUrl: 'app/main/register/register.tpl.html',
		controller: 'RegisterFormCtrl',
		resolve: {
			firms: ['interface', function (interface) {
				return interface.user('listFirms');
			}]
		}
	});
}]).

controller('RegisterFormCtrl', ['$scope', '$modal', 'interface', 'security', 'firms', 'appStrings', function ($scope, $modal, interface, security, firms, appStrings){

	// find firm vs. register
	$scope.firms = firms;
	$scope.firmModified = false;
	$scope.clearFirm = function () {
		$scope.user.firm = '';
		$scope.firmModified = false;
		$scope.registration.$setPristine(true);
	};

	// initialize empty user
	$scope.user = {
		preName: '',
		firm: '',
		addr: {},
		same: false
	};
	$scope.modifyFirm = function() { $scope.firmModified = true; };

	// validate email address
	$scope.formState = 0;
	$scope.checkEmail = function() {
		interface.user('checkEmail', {email: $scope.user.email}).then(function (res) {
			$scope.formState = 1;
		}, function (res) {
			$scope.formState = -1;
		});
	};

	// pw-reset
	$scope.resetMsg = null;
	$scope.pwReset = function() {
		security.reset( $scope.user.email ).then(function() {
			$scope.resetMsg = appStrings.register.resetGood();
		}, function() {
			$scope.resetMsg = appStrings.register.resetBad();
		});
	};

	// handle registration clicks
	$scope.register = function() {
		if ($scope.user.passCheck !== $scope.user.password) {
			$scope.message = appStrings.register.passMatch();
			return;
		}
		if (($scope.user.firm.addr || {}).addressID === undefined) {
			$scope.message = appStrings.register.firmAddr();
			return;
		}
		if ($scope.user.addr.addressID === undefined) {
			$scope.message = appStrings.register.userAddr();
			return;
		}
		if ($scope.user.phone.replace(/[^0-9]/g, '').length != 10) {
			$scope.message = appStrings.register.invalidPhone();
			return;
		}

		interface.user('addUser', $scope.user).then(function() {
			$scope.message = appStrings.register.success(); // some sort of callback on close
			security.requestCurrentUser();
			// security.redirect('/cart');
			window.history.back(); // go to last page!
		}, function (err) {
			$scope.message = (err=='dup') ? appStrings.register.duplicate() : appStrings.register.failure() ;
		});
	};

	// For same address handling
	var oldUserAddr = {};
	$scope.$watch('user.same', function(value) {
		if (value) {
			oldUserAddr = $scope.user.addr;
			$scope.user.addr = $scope.user.firm.addr;
		} else {
			$scope.user.addr = oldUserAddr;
		}
	});

	// handle set address clicks
	$scope.setAddr = function (slug) {
		var myAddress = (slug == 'firm') ? ($scope.user.firm || {}).addr : $scope.user.addr ;
		
		var modalInstance = $modal.open({ // insterts into db and returns full object
			templateUrl: 'common/modal/address/modal-address.tpl.html',
			controller: 'ModalAddressCtrl',
			resolve: { address: function() { return angular.copy( myAddress ); } }
		});
		modalInstance.result.then(function(address) {
			if (slug == 'firm') {
				$scope.user.firm = typeof($scope.user.firm)=='string' ? {name:''} : $scope.user.firm;
				$scope.user.firm.addr = address;
				if ($scope.same) $scope.user.addr = address;
			} else {
				$scope.user.addr = address;
			}
		});
	};
}]);