angular.module('myApp.admin.discounts', ['myApp.services']).

config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider) {
	$routeProvider.when('/admin/discounts', {
		title: 'Manage Discounts',
		templateUrl: 'js/admin/discounts/discounts.tpl.html',
		controller: 'AdminDiscountsCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser,
			discounts: ['interface', function (interface) {
				return interface.admin('getDiscounts');
			}]
		}
	});
}]).

controller('AdminDiscountsCtrl', ['$scope', 'discounts', function($scope, discounts){
	$scope.discounts = discounts;
}]);