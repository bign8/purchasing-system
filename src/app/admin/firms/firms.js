angular.module('myApp.admin.firms', [
	'myApp.common.services',
	'ui.bootstrap'
]).

config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
	$routeProvider.when('/admin/firms', {
		title: 'Manage Firms',
		templateUrl: 'app/admin/firms/list.tpl.html',
		controller: 'FirmListCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser,
			firms: ['FirmService', function (FirmService) {
				return FirmService.getList();
			}]
		}
	});
}]).

controller('FirmListCtrl', ['$scope', 'firms', '$modal', '$location', 'FirmService', function ($scope, firms, $modal, $location, FirmService){
	$scope.firms = firms;
	$scope.active = false; // holds copied new item for editing
	$scope.origin = false; // holds pointer to list item
	$scope.edit = function (firm) {
		var validEdit = function() {
			$scope.origin.isActive = false;
			$scope.origin = firm;
			$scope.origin.isActive = true;
			$scope.active = angular.copy(firm);
		};
		if ($scope.active && !angular.equals( $scope.origin, $scope.active )) {
			var check = confirm('The current firm has been modified.\nAre you sure you want to change without saving?');
			if (check) validEdit();
		} else {
			validEdit();
		}
	};
	$scope.cancel = function() {
		$scope.origin.isActive = false;
		$scope.active = false;
	};
	$scope.reset = function() {
		var addr = angular.copy( $scope.active.addr );
		$scope.active = angular.copy( $scope.origin );
		$scope.active.addr = addr;
	};
	$scope.equals = function (a,b) { return angular.equals(a,b); };
	$scope.save = function() {
		if (($scope.active.addr || {}).addressID === undefined ) return alert('Please enter a valid address.');
		FirmService.save($scope.active).then(function (res) {
			$scope.active = res;
			$scope.origin = res;
			$scope.firms = FirmService.theList();
		});
	};
	$scope.newFirm = function() {
		$scope.active = {};
		$scope.origin = {};
	};

	// handle set address clicks
	$scope.setAddr = function () {
		var modalInstance = $modal.open({ // insterts into db and returns full object
			templateUrl: 'common/modal/address/modal-address.tpl.html',
			controller: 'ModalAddressCtrl',
			resolve: { address: function() { return angular.copy( $scope.active.addr ); } }
		});
		modalInstance.result.then(function (address) {
			$scope.active.addr = address;
			$scope.origin.addr = address;
		});
	};

	$scope.rem = function ($event, firm) {
		$event.stopPropagation();
		var check = confirm('Are you sure you want to delete: "'+firm.name+'"\nThis action is permenent and cannot be undone.');
		if (check) FirmService.rem(firm).then(function () {
			$scope.firms.splice($scope.firms.indexOf(firm), 1);
		});
	};
}]).

factory('FirmService', ['interface', '$q', function (interface, $q) {
	var myFirms = {};
	var service = {
		getList: function () {
			var ret = $q.defer();
			if ( Object.keys(myFirms).length > 0 ) {
				ret.resolve( service.theList() );
				ret = ret.promise; // funky way to return a promise
			} else {
				ret = interface.admin('firm-init').then(function (data) {
					angular.forEach(data, function (firm) {
						myFirms[firm.firmID] = firm;
					});
					return data;
				});
			}
			return ret;
		},
		theList: function () {
			var arr = [];
			for (var key in myFirms) arr.push(myFirms[key]);
			return arr;
		},
		rem: function (discount) {
			return interface.admin('firm-rem', discount).then(function (res) {
				delete myFirms[discount.discountID];
			});
		},
		save: function (discount) {
			return interface.admin('firm-set', discount).then(function (res) {
				myFirms[res.firmID] = res;
				return res;
			});
		}
	};
	return service;
}]);