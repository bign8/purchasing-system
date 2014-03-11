angular.module('myApp.admin.files', [
	'myApp.common.services',
]).

config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
	$routeProvider.when('/admin/files', {
		title: 'Manage Files',
		templateUrl: 'app/admin/files/list.tpl.html',
		controller: 'FileListCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser,
			merges: ['FileService', function (FileService) {
				return FileService.getList();
			}]
		}
	});
}]).

controller('FileListCtrl', ['$scope', 'FileService', function ($scope, FileService){
	$scope.files = FileService.files;
	// $scope.firm1 = false;
	// $scope.firm2 = false;
	// $scope.merge = {};

	$scope.list = angular.copy( $scope.files );
	$scope.path = '/';
	$scope.parent = [];
	$scope.arrPath = [];
	$scope.drill = function (folder) {
		$scope.parent.push($scope.list);
		$scope.arrPath.push(folder.name);
		$scope.list = angular.copy( folder.children );
	};
	$scope.back = function () {
		$scope.list = $scope.parent.pop();
		$scope.arrPath.pop();
	};

	// // Handle resetting + saving
	// $scope.reset = function() {
	// 	$scope.firm1 = false;
	// 	$scope.firm2 = false;
	// 	$scope.merge = {};
	// };
	// $scope.save = function() {
	// 	FileService.save($scope.merge, $scope.firm1.firmID, $scope.firm2.firmID).then(function () {
	// 		alert('Changes saved successfully!');
	// 		$scope.reset();
	// 	});
	// };
}]).

factory('FileService', ['interface', '$q', function (interface, $q) {
	var service = {
		files: [],

		getList: function () {
			var ret = $q.defer();
			if ( service.files.length > 0 ) {
				ret.resolve( service.files );
				ret = ret.promise; // funky way to return a promise
			} else {
				ret = interface.admin('file-init').then(function (data) {
					service.files = data;
					// angular.forEach(data.files, function (file) { service.files.push( file ); });
					return service.files;
				});
			}
			return ret;
		},
		
		save: function(merge, destID, srcID) {
			return interface.admin('file-set', {
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