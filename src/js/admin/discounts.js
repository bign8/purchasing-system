angular.module('myApp.admin.discounts', ['myApp.services']).

config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider) {
	$routeProvider.when('/admin/discounts', {
		title: 'Manage Discounts',
		templateUrl: 'partials/admin/discounts.tpl.html',
		controller: 'AdminDiscountsCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser
		}
	});
}]).

controller('AdminDiscountsCtrl', ['$scope', function($scope){
	$scope.magic = 'test';
}]);