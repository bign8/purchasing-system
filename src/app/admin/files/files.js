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
	$scope.list = FileService.files;
	$scope.path = '';
	$scope.parent = [];

	// Navigation
	var arrPath = [];
	function render_path() { $scope.path = arrPath.join('/') + (arrPath.length ? '/' : '') ; }
	$scope.drill = function (folder) {
		if (!folder.children) return;
		arrPath.push(folder.name);
		$scope.parent.push($scope.list);
		$scope.list = folder.children;
		render_path();
	};
	$scope.back = function () {
		arrPath.pop();
		$scope.list = $scope.parent.pop();
		render_path();
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

			// Store reset data structures
			$scope.parent = [];
			FileService.files = [];

			// re-fetch (big pull)
			FileService.getList().then(function (new_list) {
				$scope.list = new_list;

				// re-drill for each element in `arrPath`
				for (var i = 0; i < arrPath.length; i++) {
					for (var j = 0; j < $scope.list.length; j++) {

						// find element and `drill`
						if (arrPath[i] == $scope.list[j].name) {
							$scope.parent.push( $scope.list );
							$scope.list = $scope.list[j].children;
							break;
						}
					}
				}
			}, function () {
				// error!
			});
		});
	};

	// Upload
	$scope.$watch('myFile', function (value) {
		if (value) $scope.myName = value.name;
	});
	$scope.upload = function (file, name) {
		$scope.percent = true;
		FileService.upload(file, name, $scope.path, function (percent) {
			$scope.percent = percent;
			$scope.$apply();
		}).then(function ( res ) {
			$scope.list.push(res);
			$scope.myFile = null;
			$scope.myName = '';
			$scope.uploadForm.$setPristine(true);
		}, function ( res ) {
			alert('There was an error uploading your file!');
			console.log(res);
		})['finally'](function () {
			$scope.percent = false;
		});
	};
	$scope.percent = false;
}]).

directive('fileModel', ['$parse', function ($parse) {
	return { // http://uncorkedstudios.com/blog/multipartformdata-file-upload-with-angularjs
		restrict: 'A',
		link: function (scope, element, attrs) {
			var model = $parse(attrs.fileModel);
			var modelSetter = model.assign;
			element.bind('change', function() {
				scope.$apply(function() {
					modelSetter(scope, element[0].files[0]);
				});
			});
		}
	};
}]).

filter('bytes', function() { // https://gist.github.com/thomseddon/3511330
	return function(bytes, precision) {
		if (isNaN(parseFloat(bytes)) || !isFinite(bytes) || bytes == '0') return '-';
		if (typeof precision === 'undefined') precision = 1;
		var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
			number = Math.floor(Math.log(bytes) / Math.log(1024));
		return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
	};
}).

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
				// file.name = newName;
			});
		},

		upload: function(file, name, path, cb) {
			var ret = $q.defer();

			var fd = new FormData();
			fd.append('file', file);
			fd.append('name', name);
			fd.append('path', path);

			function uploadProgress(evt) {
				var msg = evt.lengthComputable ? Math.round(evt.loaded * 100 / evt.total) : '---';
				cb(msg + '%');
			}
			function uploadComplete(evt) {
				if (evt.target.status == '200')
					ret.resolve({
						name: name,
						children: false,
						size: evt.target.response.substring(6)
					});
				else ret.reject(evt.target.response);
			}
			function uploadFailed(evt) {
				alert("There was an error attempting to upload the file.");
			}
			function uploadCanceled(evt) {
				alert("The upload has been canceled by the user or the browser dropped the connection.");
			}

			var xhr = new XMLHttpRequest();
			xhr.upload.addEventListener("progress", uploadProgress, false);
			xhr.addEventListener("load", uploadComplete, false);
			xhr.addEventListener("error", uploadFailed, false);
			xhr.addEventListener("abort", uploadCanceled, false);
			xhr.open("POST", "/interface.php?c=admin&a=file-upload");
			xhr.send(fd);
			
			return ret.promise;
		}
	};
	return service;
}]);