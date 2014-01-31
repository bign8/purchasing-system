angular.module('myApp.admin.discounts', [
	'myApp.services',
	'ui.bootstrap'
]).

config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
	$routeProvider.when('/admin/discounts', {
		title: 'Manage Discounts',
		templateUrl: 'app/admin/discounts/list.tpl.html',
		controller: 'DiscountListCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser,
			discounts: ['DiscountService', function (DiscountService) {
				return DiscountService.getList();
			}]
		}
	}).when('/admin/discounts/:discountID', {
		title: 'Edit discount',
		templateUrl: 'app/admin/discounts/edit.tpl.html',
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

	$scope.setGlobal = function() {
		$scope.viewProd = DiscountService.blankProd;
		$scope.viewItem = DiscountService.blankItem;
	};
	$scope.clearItem = function() {
		$scope.viewItem = DiscountService.blankItem;
	};
	var initValues = function() {
		if (discount.productID) {
			$scope.clearItem();
			angular.forEach($scope.products, function (product) { // find product
				if (product.productID == discount.productID) $scope.viewProd = product;
			});
		} else if (discount.itemID) {
			angular.forEach($scope.items, function (item) { // find item
				if (item.itemID == discount.itemID) $scope.viewItem = item;
			});
			angular.forEach($scope.products, function (product) { // find item's parent product
				if (product.productID == $scope.viewItem.productID) $scope.viewProd = product;
			});
		} else {
			$scope.setGlobal();
		}
	};
	initValues();

	$scope.$watch('viewProd', function (val) {
		$scope.discount.productID = val.productID;
		$scope.discount.productName = (val.productID) ? val.name : null;
	});
	$scope.$watch('viewItem', function (val) {
		$scope.discount.itemID = val.itemID;
		$scope.discount.itemName = (val.itemID) ? val.name : null;
	});

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
		initValues();
	};
	$scope.save = function() {
		DiscountService.save($scope.discount).then(function() {
			$location.path('/admin/discounts/');
		});
	};
}]).

filter('filterProductIDNull', function() {
	return function(list, prod) {
		var result = [];
		angular.forEach(list, function (item) {
			if (item.productID == (prod||{}).productID || item.productID === null) result.push(item);
		});
		return result;
	};
}).

factory('DiscountService', ['interface', '$q', function (interface, $q) {
	var casheDiscounts = {};
	var service = {
		getList: function () {
			var ret = $q.defer();
			if ( Object.keys(casheDiscounts).length > 0 ) {
				var arr = [];
				for (var key in casheDiscounts) arr.push(casheDiscounts[key]);
				ret.resolve(arr);
				ret = ret.promise; // funky way to return a promise
			} else {
				ret = interface.admin('getDiscountData').then(function (data) {
					service.items = data.items;
					service.products = data.products;
					service.items.unshift(service.blankItem);
					service.products.unshift(service.blankProd);

					angular.forEach(data.discounts, function(discount) {
						discount.amount = parseInt(discount.amount);
						casheDiscounts[discount.discountID] = discount;
					});
					return data.discounts;
				});
			}
			return ret;
		},
		getDiscount: function (discountID) {
			if (discountID == 'new') {
				return service.getList().then(function () { // load all
					return service.blankDiscount;
				});
			} else {
				return casheDiscounts[discountID] || service.getList().then(function () { // allways load all
					return casheDiscounts[discountID];
				});
			}
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
		products: [],
		blankItem: {itemID:null, productID:null, name:'--- Select an Item ---'},
		blankProd: {productID:null, name:'--- Select a Product ---'},
		blankDiscount:{itemID:null, productID:null, productName:null, itemName:null}
	};
	return service;
}]);