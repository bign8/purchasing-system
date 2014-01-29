angular.module('myApp.admin.discounts', [
	'myApp.services',
	'ui.bootstrap'
]).

config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
	$routeProvider.when('/admin/discounts', {
		title: 'Manage Discounts',
		templateUrl: 'js/admin/discounts/list.tpl.html',
		controller: 'DiscountListCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser,
			discounts: ['interface', function (interface) {
				return interface.admin('getDiscounts');
			}]
		}
	}).when('/admin/discounts/:discountID', {
		title: 'Edit discount',
		templateUrl: 'js/admin/discounts/edit.tpl.html',
		controller: 'DiscountEditCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser,
			discount: ['interface', function (interface) {
				return interface.admin('getDiscount');
			}]
		}
	});
}]).

controller('DiscountListCtrl', ['$scope', 'discounts', 'interface', '$modal', '$location', function ($scope, discounts, interface, $modal, $location){
	$scope.discounts = discounts;
	$scope.clickCatch = function($event) { $event.stopPropagation(); };

	$scope.edit = function(discount) {
		console.log('editing');
		console.log(discount);
		$location.path('/admin/discounts/' + discount.discountID);
	};

	$scope.change = function(discount) {
		interface.admin('setDiscountActive', discount).then(function(res) {
			discount = res;
		});
	};

	$scope.rem = function($event, discount) {
		$event.stopPropagation();
		var modalInstance = $modal.open({
			templateUrl: 'discountConfirmDelete.tpl.html',
			controller: ['$scope', '$modalInstance', 'discount', function($scope, $modalInstance, discount) {
				$scope.discount = discount;
				$scope.yes = function() { $modalInstance.close(); };
				$scope.no = function() { $modalInstance.dismiss(); };
			}],
			resolve: {
				discount: function() { return discount; }
			}
		});
		modalInstance.result.then(function() {
			interface.admin('remDiscount', discount).then(function() {
				$scope.discounts.splice($scope.discounts.indexOf(discount), 1);
			});
		});
	};
}]).

controller('DiscountEditCtrl', ['$scope', 'discount', 'interface', '$modal', function ($scope, discount, interface, $modal) {
	$scope.discount = discount;
}]);