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
			discounts: ['DiscountService', function (DiscountService) {
				return DiscountService.getList();
			}]
		}
	}).when('/admin/discounts/:discountID', {
		title: 'Edit discount',
		templateUrl: 'js/admin/discounts/edit.tpl.html',
		controller: 'DiscountEditCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser,
			discount: ['DiscountService', '$route', function (DiscountService, $route) {
				return DiscountService.getDiscount($route.current.params.discountID);
			}]
		}
	});
}]).

controller('DiscountListCtrl', ['$scope', 'discounts', '$modal', '$location', 'DiscountService', function ($scope, discounts, $modal, $location, DiscountService){
	$scope.discounts = discounts;
	$scope.clickCatch = function ($event) { $event.stopPropagation(); };
	$scope.edit = function (discount) { $location.path('/admin/discounts/' + discount.discountID); };
	$scope.change = function (discount) {
		DiscountService.setActive(discount).then(function(res) {
			discount = res;
		});
	};
	$scope.rem = function ($event, discount) {
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
		modalInstance.result.then(function () {
			DiscountService.rem(discount).then(function () {
				$scope.discounts.splice($scope.discounts.indexOf(discount), 1);
			});
		});
	};
}]).

controller('DiscountEditCtrl', ['$scope', 'discount', 'DiscountService', '$location', function ($scope, discount, DiscountService, $location) {
	$scope.orig = angular.copy(discount);
	$scope.discount = angular.copy(discount);
	$scope.items = DiscountService.items;
	$scope.products = DiscountService.products;
	
	var resetValues = function() {
		if (discount.productID) { // Initialize values
			$scope.prodID = angular.copy( discount.productID );
			$scope.itemID = null; // clear filter
		} else if (discount.itemID) {
			angular.forEach($scope.items, function(item) {
				if (item.itemID == discount.itemID) $scope.prodID = item.productID;
			});
			$scope.itemID = angular.copy( discount.itemID );
		} else {
			$scope.prodID = $scope.itemID = null; // clear filter
		}
	};
	resetValues();

	$scope.$watch('prodID', function (val) {
		$scope.discount.itemID = $scope.itemID = (val) ? null : $scope.discount.itemID;
		$scope.discount.productID = val;
	});
	$scope.$watch('itemID', function (val) {
		$scope.discount.itemID = val;
		$scope.discount.productID = (val) ? null : $scope.prodID;
	});
	$scope.setGlobal = function() {
		$scope.prodID = null;
		$scope.itemID = null;
		$scope.discount.itemID = null;
		$scope.discount.productID = null;
	};

	$scope.$watch('discount.code', function (val) { // check for duplicate codes
		var clean = true;
		angular.forEach(DiscountService.getList(), function(thisDis) {
			if (thisDis.code == val && thisDis.discountID != $scope.discount.discountID) clean = false;
		});
		$scope.editForm.code.$setValidity('duplicate', clean);
	});
	$scope.equals = function (a,b) { return angular.equals(a,b); };
	$scope.reset = function() { 
		$scope.discount = angular.copy($scope.orig);
		$scope.editForm.$setPristine(true);
		resetValues();
	};
	$scope.save = function() {
		DiscountService.save($scope.discount).then(function() {
			$location.path('/admin/discounts/');
		});
	};
}]).

filter('filterProductIDNull', function() {
	return function(list, productID) {
		var result = [];
		angular.forEach(list, function (item) {
			if (item.productID == productID || item.productID === null) result.push(item);
		});
		return result;
	};
}).

factory('DiscountService', ['interface', function (interface) {
	var casheDiscounts = {};
	var service = {
		getList: function () {
			var ret = [];
			if ( Object.keys(casheDiscounts).length > 0 ) {
				for (var key in casheDiscounts) ret.push(casheDiscounts[key]);
			} else {
				ret = interface.admin('getDiscountData').then(function (data) {
					service.items = data.items;
					service.products = data.products;
					service.items.unshift({itemID:null, productID:null, name:'--- Select an Item ---'});
					service.products.unshift({productID:null, name:'--- Select a Product ---'});

					angular.forEach(data.discounts, function(discount) {
						casheDiscounts[discount.discountID] = discount;
					});
					return data.discounts;
				});
			}
			return ret;
		},
		getDiscount: function (discountID) {
			return casheDiscounts[discountID] || service.getList().then(function () { // allways load all
				return casheDiscounts[discountID];
			});
		},
		setActive: function (discount) {
			return interface.admin('setDiscountActive', discount).then(function (res) {
				casheDiscounts[res.discountID] = res;
				return res;
			});
		},
		rem: function (discount) {
			return interface.admin('remDiscount', discount).then(function (res) {
				delete casheDiscounts[discount.discountID];
			});
		},
		save: function (discount) {
			return interface.admin('setDiscount', discount).then(function (res) {
				casheDiscounts[res.discountID] = res;
			});
		},
		items: [],
		products: []
	};
	return service;
}]);