angular.module('myApp.admin.merge', [
	'myApp.common.services',
]).

config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
	$routeProvider.when('/admin/merge', {
		title: 'Manage Merges',
		templateUrl: 'app/admin/merge/list.tpl.html',
		controller: 'MergeListCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser,
			merges: ['MergeService', function (MergeService) {
				return MergeService.getList();
			}]
		}
	});
}]).

controller('MergeListCtrl', ['$scope', 'MergeService', function ($scope, MergeService){
	$scope.firms = MergeService.firms;
	$scope.firm1 = false;
	$scope.firm2 = false;
	$scope.merge = {};

	// An on-change event
	$scope.$watchCollection('[firm1, firm2]', function (newValues) {
		if (!newValues[0] || !newValues[1]) return;
		angular.forEach(['name', 'website', 'addrName', 'addr1', 'addr2', 'city', 'state', 'zip'], function (i) {
			$scope.merge[i] = (newValues[0][i] == newValues[1][i]) ? newValues[0][i] : '';
		});
	});

	// Handle resetting + saving
	$scope.reset = function() {
		$scope.firm1 = false;
		$scope.firm2 = false;
		$scope.merge = {};
	};
	$scope.save = function() {
		MergeService.save($scope.merge, $scope.firm1.firmID, $scope.firm2.firmID).then(function () {
			alert('Changes saved successfully!');
			$scope.reset();
		});
	};
}]).

factory('MergeService', ['interface', '$q', function (interface, $q) {
	var service = {
		firms: {},
		getList: function (mergeID) {
			var ret = $q.defer();
			if ( Object.keys( service.firms ).length > 0 ) {
				ret.resolve( service.firms );
				ret = ret.promise; // funky way to return a promise
			} else {
				ret = interface.admin('merge-init').then(function (data) {
					angular.forEach(data, function (firm) { service.firms[ firm.firmID ] = firm;  });
					return service.firms;
				});
			}
			return ret;
		},
		
		save: function(merge, destID, srcID) {
			return interface.admin('merge-set', {
				merge: merge,
				destID: destID,
				srcID: srcID
			}).then(function (res) {
				service.firms[ destID ] = res;
				delete service.firms[ srcID ];
				return res;
			});
		}
	};
	return service;
}]);