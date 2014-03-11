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

	// Global Variables
	$scope.list = FileService.files ;
	$scope.path = '';
	$scope.parent = [];

	// Navigation
	var arrPath = [];
	$scope.drill = function (folder) {
		if (!folder.children) return;
		arrPath.push(folder.name);
		$scope.parent.push($scope.list);
		$scope.list = folder.children;
		$scope.path = arrPath.join('/') + (arrPath.length ? '/' : '') ;
	};
	$scope.back = function () {
		arrPath.pop();
		$scope.list = $scope.parent.pop();
		$scope.path = arrPath.join('/') + (arrPath.length ? '/' : '') ;
	};

	// Editing
	$scope.rem = function ($event, file) {
		$event.stopPropagation();
		FileService.rem($scope.path, file, $scope.list);
	};
	$scope.edit = function ($event, file) {
		$event.stopPropagation();
		var newName = prompt("Enter new file location:", file.name);
		if (newName !== null) FileService.edit($scope.path, file, newName, $scope.list).then(function () {
			alert('If you moved your file to a new location, please refresh your brower.');
		});
	};
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
					return service.files;
				});
			}
			return ret;
		},
		
		rem: function(path, file, list) {
			return interface.admin('file-rem', {
				file: path + file.name
			}).then(function (res) {
				list.splice( list.indexOf(file), 1 );
			});
		},

		edit: function(path, file, newName, list) {
			return interface.admin('file-edit', {
				path: path,
				file: file.name,
				newName: newName
			}).then(function (res) {
				file.name = newName;
			});
		},
	};
	return service;
}]);