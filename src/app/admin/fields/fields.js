angular.module('myApp.admin.fields', [
	'myApp.common.services',
	'ui.bootstrap'
]).

config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
	$routeProvider.when('/admin/fields', {
		title: 'Manage Fields',
		templateUrl: 'app/admin/fields/list.tpl.html',
		controller: 'FieldListCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser,
			fields: ['FieldService', function (FieldService) {
				return FieldService.getList();
			}]
		}
	});
}]).

controller('FieldListCtrl', ['$scope', 'fields', 'FieldService', function ($scope, fields, FieldService){
	$scope.fields = fields;
	$scope.types = FieldService.types;

	$scope.active = false;
	$scope.editing = false;
	$scope.edit = function (field) {
		$scope.active.active = false;
		field.active = true;
		$scope.active = field;
		$scope.editing = angular.copy( $scope.active );
	};
	$scope.same = function () { return angular.equals($scope.active, $scope.editing); };
	$scope.reset = function () { $scope.editing = angular.copy( $scope.active ); };
	$scope.new = function () {
		$scope.edit({
			type: 'text',
			toStore: 'yes',
			settings: null
		});
	};
	$scope.isList = false;
	$scope.$watch('editing.type', function ( value ) {
		if (!value) return;
		$scope.isList = false;
		switch (value) {
			case 'radioboxes':
			case 'otherCheckbox':
			case 'otherSelect':
				$scope.isList = true;
				if (!$scope.editing.settings || !$scope.editing.settings.hasOwnProperty('length')) $scope.editing.settings = ['']; break;
			case 'text': $scope.editing.settings = null; break;
			default: $scope.editing.settings = '';
		}
		if (value === $scope.active.type) $scope.editing.settings = angular.copy( $scope.active.settings );
	});

	$scope.isLastEmpty = false;
	$scope.$watch('editing.settings', function (value) {
		if ( $scope.isList && value.length ) $scope.isLastEmpty = (value[ value.length - 1 ] === '');
	}, true);

	$scope.drop = function (item) {
		var idx = $scope.editing.settings.indexOf(item);
		$scope.editing.settings.splice(idx, 1);
	};
	$scope.save = function () {
		FieldService.save($scope.editing).then(function (res) {
			$scope.editing.fieldID = angular.copy( res.fieldID ); // get new firmID if it's a new item
			$scope.active.settings = angular.copy( res.settings );
		});
	};
}]).

factory('FieldService', ['interface', '$q', function (interface, $q) {
	var service = {
		fields: {},
		types: [],
		getList: function () {
			var ret = $q.defer();
			if ( Object.keys(service.fields).length > 0 ) {
				ret.resolve( service.fields );
				ret = ret.promise; // funky way to return a promise
			} else {
				ret = interface.admin('field-init').then(function (fields) {
					angular.forEach(fields, function (field) {
						service.fields[field.fieldID] = field;
						if (service.types.indexOf(field.type) === -1) service.types.push(field.type);
					});
					return service.fields;
				});
			}
			return ret;
		},
		save: function (field) {
			return interface.admin('field-set', field).then(function (res) {
				service.fields[res.fieldID] = res;
				return res;
			});
		},
	};
	return service;
}]);