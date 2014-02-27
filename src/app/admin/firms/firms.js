angular.module('myApp.admin.firms', [
	'myApp.common.services',
	'ui.bootstrap'
]).

config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
	$routeProvider.when('/admin/firms', {
		title: 'Manage Firms',
		templateUrl: 'app/admin/firms/list.tpl.html',
		controller: 'FirmListCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser,
			firms: ['FirmService', function (FirmService) {
				return FirmService.getList();
			}]
		}
	});
	// .when('/admin/firms/:discountID', {
	// 	title: 'Edit discount',
	// 	templateUrl: 'app/admin/firms/edit.tpl.html',
	// 	controller: 'DiscountEditCtrl',
	// 	resolve: {
	// 		user: securityAuthorizationProvider.requireAdminUser,
	// 		discount: ['FirmService', '$route', function (FirmService, $route) {
	// 			return FirmService.getDiscount($route.current.params.discountID);
	// 		}]
	// 	}
	// });
}]).

controller('FirmListCtrl', ['$scope', 'firms', '$modal', '$location', 'FirmService', function ($scope, firms, $modal, $location, FirmService){
	$scope.firms = firms;
	$scope.active = false; // holds copied new item for editing
	$scope.origin = false; // holds pointer to list item
	$scope.edit = function (firm) {
		$scope.origin.isActive = false;
		$scope.origin = firm;
		$scope.origin.isActive = true;
		$scope.active = angular.copy(firm);
	};
	$scope.cancel = function() {
		$scope.origin.isActive = false;
		$scope.active = false;
	};

	// handle set address clicks
	$scope.setAddr = function () {
		var modalInstance = $modal.open({ // insterts into db and returns full object
			templateUrl: 'common/modal/address/modal-address.tpl.html',
			controller: 'ModalAddressCtrl',
			resolve: { address: function() { return angular.copy( $scope.active.addr ); } }
		});
		modalInstance.result.then(function (address) {
			$scope.active.addr = address;
			$scope.origin.addr = address;
		});
	};

	// $scope.rem = function ($event, discount) {
	// 	$event.stopPropagation();
	// 	var modalInstance = $modal.open({
	// 		templateUrl: 'discountConfirmDelete.tpl.html',
	// 		controller: ['$scope', '$modalInstance', 'discount', function ($scope, $modalInstance, discount) {
	// 			$scope.discount = discount;
	// 			$scope.yes = function() { $modalInstance.close(); };
	// 			$scope.no = function() { $modalInstance.dismiss(); };
	// 		}],
	// 		resolve: {
	// 			discount: function() { return discount; }
	// 		}
	// 	});
	// 	modalInstance.result.then(function () {
	// 		FirmService.rem(discount).then(function () {
	// 			$scope.firms.splice($scope.firms.indexOf(discount), 1);
	// 		});
	// 	});
	// };
}]).

controller('DiscountEditCtrl', ['$scope', 'discount', 'FirmService', '$location', function ($scope, discount, FirmService, $location) {
	// $scope.orig = angular.copy(discount);
	// $scope.discount = angular.copy(discount);
	
	// // Initilize items to be indexed by itemID
	// $scope.items = FirmService.items; var itemHash = {}; // for parent hunt
	// angular.forEach(FirmService.items, function (item) {
	// 	itemHash[item.itemID ? item.itemID : 0] = item;
	// });

	// $scope.setGlobal = function() {
	// 	$scope.discount.itemID = null;
	// 	initValues();
	// };
	// $scope.clearItem = function( index, parentID ) {
	// 	$scope.viewItems = $scope.viewItems.slice(0, index+1);
	// 	$scope.viewItems[index] = FirmService.blankItem(parentID);
	// };
	// var initValues = function() {
	// 	$scope.viewItems = [];

	// 	if ($scope.discount.itemID) {
	// 		var activeID = $scope.discount.itemID, nextItem, hasMore = false;

	// 		// hunt for children
	// 		angular.forEach($scope.items, function (ele) {
	// 			if (ele.parentID == activeID) hasMore = true;
	// 		});
	// 		$scope.viewItems.push( hasMore ? FirmService.blankItem( activeID ) : null );

	// 		// hunt for parents (including self)
	// 		do {
	// 			nextItem = itemHash[ activeID ];
	// 			$scope.viewItems.unshift( nextItem );
	// 			activeID = nextItem.parentID;
	// 		} while ( activeID );
	// 	} else {
	// 		$scope.viewItems.push( FirmService.blankItem( null ) );
	// 	}
	// };
	// initValues();

	// $scope.$watch('viewItems', function (newValue, oldValue) {
	// 	if (newValue === oldValue) return; // don't execute on initialization
	// 	for (var i = 0; i < newValue.length; i++) {
	// 		if ( !angular.equals(newValue[i], oldValue[i]) ) {
	// 			if (newValue[i] !== null) // item changed : cleared : global
	// 				$scope.discount.itemID = newValue[i].itemID ? newValue[i].itemID : i > 0 ? newValue[i-1].itemID : null ;
	// 			$scope.discount.itemName = $scope.discount.itemID ? itemHash[$scope.discount.itemID].name : null; // assign itemName
	// 			i = newValue.length; // exit loop
	// 			initValues();
	// 		}
	// 	}
	// }, true);

	// $scope.$watch('discount.code', function (val) { // check for duplicate codes
	// 	var clean = true;
	// 	angular.forEach(FirmService.theList(), function(thisDis) {
	// 		if (thisDis.code == val && thisDis.discountID != $scope.discount.discountID) clean = false;
	// 	});
	// 	$scope.editForm.code.$setValidity('duplicate', clean);
	// });
	// $scope.equals = function (a,b) { return angular.equals(a,b); };
	// $scope.reset = function() { 
	// 	$scope.discount = angular.copy($scope.orig);
	// 	$scope.editForm.$setPristine(true);
	// 	initValues();
	// };
	// $scope.save = function() {
	// 	FirmService.save($scope.discount).then(function() {
	// 		$location.path('/admin/firms/');
	// 	});
	// };
}]).

factory('FirmService', ['interface', '$q', function (interface, $q) {
	var myFirms = {};
	var service = {
		getList: function () {
			var ret = $q.defer();
			if ( Object.keys(myFirms).length > 0 ) {
				ret.resolve( service.theList() );
				ret = ret.promise; // funky way to return a promise
			} else {
				ret = interface.admin('firm-init').then(function (data) {
					// service.items = data.items;
					// service.items.unshift(service.blankItem);

					angular.forEach(data, function (firm) {
						myFirms[firm.firmID] = firm;
					});
					return data;
				});
			}
			return ret;
		},
		theList: function () {
			var arr = [];
			for (var key in myFirms) arr.push(myFirms[key]);
			return arr;
		},
		// getDiscount: function (discountID) {
		// 	if (discountID == 'new') {
		// 		return service.getList().then(function () { // load all
		// 			return {itemID:null, parentID:null, itemName:null, compound:'false'}; // blank discount
		// 		});
		// 	} else {
		// 		return myFirms[discountID] || service.getList().then(function () { // allways load all
		// 			return myFirms[discountID];
		// 		});
		// 	}
		// },
		// setActive: function (discount) {
		// 	return interface.admin('firm-active', discount).then(function (res) {
		// 		myFirms[res.discountID] = res;
		// 		return res;
		// 	});
		// },
		// rem: function (discount) {
		// 	return interface.admin('firm-rem', discount).then(function (res) {
		// 		delete myFirms[discount.discountID];
		// 	});
		// },
		// save: function (discount) {
		// 	return interface.admin('firm-set', discount).then(function (res) {
		// 		myFirms[res.discountID] = res;
		// 	});
		// },
		// items: [],
		// blankItem: function (parentID) {
		// 	return {parentID:parentID, name:'--- Select an Item ---'};
		// }
	};
	return service;
}]);