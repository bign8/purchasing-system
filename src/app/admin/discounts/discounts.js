angular.module('myApp.admin.discounts', [
	'myApp.common.services',
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
			controller: ['$scope', '$modalInstance', 'discount', function ($scope, $modalInstance, discount) {
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
	
	// Initilize items to be indexed by itemID
	$scope.items = {};
	angular.forEach(DiscountService.items, function (item) {
		$scope.items[item.itemID ? item.itemID : 0] = item;
	});

	$scope.setGlobal = function() {
		$scope.discount.itemID = null;
		initValues();
	};
	$scope.clearItem = function( index, parentID ) {
		$scope.viewItems = $scope.viewItems.slice(0, index+1);
		$scope.viewItems[index] = DiscountService.blankItem(parentID);
	};
	var initValues = function() {
		$scope.viewItems = [];

		if ($scope.discount.itemID) {
			var activeID = $scope.discount.itemID, nextItem, hasMore = false;

			// hunt for children
			angular.forEach($scope.items, function (ele) {
				if (ele.parentID == activeID) hasMore = true;
			});
			$scope.viewItems.push( hasMore ? DiscountService.blankItem( activeID ) : null );

			// hunt for parents (including self)
			do {
				nextItem = $scope.items[ activeID ];
				$scope.viewItems.unshift( nextItem );
				activeID = nextItem.parentID;
			} while ( activeID );
		} else {
			$scope.viewItems.push( DiscountService.blankItem( null ) );
		}
	};
	initValues();

	$scope.$watch('viewItems', function (newValue, oldValue) {
		if (newValue === oldValue) return; // don't execute on initialization
		for (var i = 0; i < newValue.length; i++) {
			if ( !angular.equals(newValue[i], oldValue[i]) ) {
				if (newValue[i] === null) {
					// fix re-init error
				} else if (newValue[i].itemID) {
					$scope.discount.itemID = newValue[i].itemID; // changed itemID
				} else if (i > 0) {
					$scope.discount.itemID = newValue[i-1].itemID; // cleared current item;
				} else {
					$scope.discount.itemID = null; // set to a global discount
				}
				i = newValue.length; // exit loop
				initValues();
			}
		}
	}, true);

	$scope.$watch('discount.code', function (val) { // check for duplicate codes
		var clean = true;
		angular.forEach(DiscountService.theList(), function(thisDis) {
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

filter('filterItem', function() {
	return function(list, parentID) {
		var result = [];
		angular.forEach(list, function (item, key) {
			if ( item.parentID == parentID || null ) result.push(item); // add item as necessary
		});
		return result;
	};
}).

factory('DiscountService', ['interface', '$q', function (interface, $q) {
	var myDiscounts = {};
	var service = {
		getList: function () {
			var ret = $q.defer();
			if ( Object.keys(myDiscounts).length > 0 ) {
				ret.resolve( service.theList() );
				ret = ret.promise; // funky way to return a promise
			} else {
				ret = interface.admin('discount-init').then(function (data) {
					service.items = data.items;
					// service.items.unshift(service.blankItem);

					angular.forEach(data.discounts, function (discount) {
						discount.amount = parseInt(discount.amount);
						myDiscounts[discount.discountID] = discount;
					});
					return data.discounts;
				});
			}
			return ret;
		},
		theList: function () {
			var arr = [];
			for (var key in myDiscounts) arr.push(myDiscounts[key]);
			return arr;
		},
		getDiscount: function (discountID) {
			if (discountID == 'new') {
				return service.getList().then(function () { // load all
					return service.blankDiscount;
				});
			} else {
				return myDiscounts[discountID] || service.getList().then(function () { // allways load all
					return myDiscounts[discountID];
				});
			}
		},
		setActive: function (discount) {
			return interface.admin('discount-active', discount).then(function (res) {
				myDiscounts[res.discountID] = res;
				return res;
			});
		},
		rem: function (discount) {
			return interface.admin('discount-rem', discount).then(function (res) {
				delete myDiscounts[discount.discountID];
			});
		},
		save: function (discount) {
			return interface.admin('discount-set', discount).then(function (res) {
				myDiscounts[res.discountID] = res;
			});
		},
		items: [],
		blankItem: function (parentID) {
			return {parentID:parentID, name:'--- Select an Item ---'};
		},
		blankDiscount:{itemID:null, parentID:null, itemName:null}
	};
	return service;
}]);