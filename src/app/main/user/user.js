angular.module('myApp.main.user', [
	'ui.bootstrap',
	'myApp.main.user.add',
]).

config(['$routeProvider', function ( $routeProvider ){
	$routeProvider.when('/user', {
		title: "Account Settings",
		templateUrl: 'app/main/user/user.tpl.html',
		controller: 'UserCtrl',
		resolve: {
			firms: ['interface', function (interface) {
				return interface.user('listFirms');
			}],
			user: ['interface', function (interface) {
				return interface.user('getFullUser');
			}],
			groups: ['interface', function (interface) {
				return interface.user('getFirmMem');
			}]
		}
	});
}]).

controller('UserCtrl', ['$scope', 'myPage', '$modal', 'interface', 'security', 'user', 'firms', 'groups', 'appStrings', function ($scope, myPage, $modal, interface, security, user, firms, groups, appStrings) {
	myPage.setTitle("Account Settings", "for " + user.legalName);
	$scope.origUser = angular.copy( user );
	$scope.firms = firms;
	$scope.groups = groups;

	var firstLoad = true, oldUserAddr = {addressID:undefined};
	$scope.$watch('same', function(value) {
		if (firstLoad) { firstLoad = false; return; }
		if (value) {
			oldUserAddr = $scope.user.addr;
			$scope.user.addr = $scope.user.firm.addr;
		} else {
			$scope.user.addr = oldUserAddr;
		}
	});
	$scope.$watch('user.firm.addr', function(value) {
		if ($scope.same) $scope.user.addr = value;
	});

	$scope.reset = function() {
		$scope.user = angular.copy( $scope.origUser );
		$scope.same = $scope.user.addr.addressID == $scope.user.firm.addr.addressID;
		$scope.enableFirm = false;
		$scope.passVerify = "";
	};
	$scope.reset();

	$scope.store = function() {
		if ($scope.user.oldPass && $scope.passVerify !== $scope.user.password) {
			$scope.message = appStrings.user.passMatch();
			return;
		}
		if ($scope.user.firm.addr.addressID === undefined) {
			$scope.message = appStrings.user.firmAddr();
			return;
		}
		if ($scope.user.addr.addressID === undefined) {
			$scope.message = appStrings.user.userAddr();
			return;
		}
		if ($scope.user.phone.replace(/[^0-9]/g, '').length != 10) {
			$scope.message = appStrings.register.invalidPhone();
			return;
		}
		
		interface.user('updateUser', $scope.user).then(function() {
			$scope.message = appStrings.user.success(); // some sort of callback on close
			security.forceCurrentUser();
			myPage.setTitle("Account Settings", "for " + $scope.user.legalName);

			// Clear password fields
			$scope.user.oldPass = '';
			$scope.user.password = '';
			$scope.passVerify = '';

			$scope.origUser = angular.copy( $scope.user );
			$scope.settings.$setPristine(true);
		}, function (err) {
			if (err == 'dup') {
				$scope.message = appStrings.user.dupEmail();
			} else if (err == 'badPass') {
				$scope.message = appStrings.user.badPass();
			} else {
				$scope.message = appStrings.user.failure();
			}
		});
	};

	$scope.check = function(a, b) { return angular.equals(a, b); };
	$scope.modifyFirm = function() {
		$scope.enableFirm = true;
		$scope.firmNew = "";
	};
	$scope.selectFirm = function() {
		$scope.user.firm = $scope.firmNew;
		$scope.enableFirm = false;
	};
	$scope.newFirm = function() {
		$scope.user.firm = {};
		$scope.enableFirm = false;
	};
	$scope.addFirmCode = function () {
		interface.user('addFirmCode', {code:$scope.firmCode}).then(function (group) {
			$scope.groups.push(group);
		}, function (res) {
			if (res == 'dup') {
				$scope.message = appStrings.user.dupCode();
			} else if (res == 'dne') {
				$scope.message = appStrings.user.dneCode();
			} else {
				$scope.message = appStrings.user.errCode();
			}
		});
		$scope.firmCode = '';
		$scope.settings.firmCode.$setPristine();
	};
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