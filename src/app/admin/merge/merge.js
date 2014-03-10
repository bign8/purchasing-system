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

	$scope.$watchCollection('[firm1, firm2]', function (newValues) {
		if (!newValues[0] || !newValues[1]) return;
		var index = ['name', 'website', 'addrName', 'addr1', 'addr2', 'city', 'state', 'zip'];
		for (var i in index) {
			i = index[i];
			$scope.merge[i] = (newValues[0][i] == newValues[1][i]) ? newValues[0][i] : '';
		}
	});

}]).

factory('MergeService', ['interface', '$q', '$route', function (interface, $q, $route) {
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
		
		save: function(merge) {
			return interface.admin('merge-set', merge).then(function (res) {
				myMerges[res.mergeID] = res;
				return res;
			});
		}
	};
	return service;
}]);