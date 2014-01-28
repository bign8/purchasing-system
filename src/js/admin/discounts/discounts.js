angular.module('myApp.admin.discounts', ['myApp.services']).

config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
	$routeProvider.when('/admin/discounts', {
		title: 'Manage Discounts',
		templateUrl: 'js/admin/discounts/discounts.tpl.html',
		controller: 'DiscountsCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser,
			discounts: ['interface', function (interface) {
				return interface.admin('getDiscounts');
			}]
		}
	});
}]).

controller('DiscountsCtrl', ['$scope', 'discounts', 'interface', function ($scope, discounts, interface){
	$scope.discounts = discounts;
	$scope.clickCatch = function($event) { $event.stopPropagation(); };

	$scope.edit = function(discount) {
		console.log('editing');
		console.log(discount);
	};

	$scope.change = function(discount) {
		interface.admin('setDiscountActive', discount).then(function(res) {
			discount = res;
		});
	};
}]);