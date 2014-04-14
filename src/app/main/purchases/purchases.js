angular.module('myApp.main.purchases', [
	'myApp.common.services'
]).

config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider){
	$routeProvider.when('/purchases', {
		title: "&nbsp;",
		templateUrl: 'app/main/purchases/purchases.tpl.html',
		controller: 'ListPurchasesCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAuthenticatedUser,
			items: ['interface', function (interface) {
				return interface.cart('getPurchases');
			}]
		}
	});
}]).

controller('ListPurchasesCtrl', ['$scope', 'items', '$modal', function ($scope, items, $modal){
	$scope.items = items;
	angular.forEach($scope.items, function (ele) {
		if (ele.stamp) ele.stamp = new Date( ele.stamp );
	});
	$scope.showAttendees = function( item ) {
		$modal.open({
			templateUrl: 'app/main/purchases/modal-list.tpl.html',
			controller: 'ModalListAttendeesCtrl',
			resolve: {
				item: function() { return item; }
			}
		});
	};
}]).

controller('ModalListAttendeesCtrl', ['$scope', '$modalInstance', 'item', '$location', function ($scope, $modalInstance, item, $location) {
	$scope.item = item;
	$scope.ok = function () { $modalInstance.close('all good'); };
	$scope.cancel = function () { $modalInstance.dismiss('cancel'); };
	$scope.more = function () {
		$location.path('/conference/' + item.itemID);
		$modalInstance.dismiss('more');
	};
}]);