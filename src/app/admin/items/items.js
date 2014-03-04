angular.module('myApp.admin.items', [
	'myApp.common.services',
	'ui.bootstrap'
]).

config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
	$routeProvider.when('/admin/items/:itemID?', {
		title: 'Manage Items',
		templateUrl: 'app/admin/items/list.tpl.html',
		controller: 'ItemListCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser,
			items: ['ItemService', function (ItemService) {
				return ItemService.getList();
			}]
		}
	});
}]).

controller('ItemListCtrl', ['$scope', 'items', '$location', 'ItemService', function ($scope, items, $location, ItemService){
	$scope.items = items.list;
	$scope.myItem = items.item;
	$scope.active = false; // holds copied new item for editing
	$scope.origin = false; // holds pointer to list item
	$scope.tpls = ItemService.getTpls();

	$scope.go = function (itemID) {
		$scope.origin.isActive = false;
		itemID = itemID ? itemID : '' ;
		$location.path('/admin/items/' + itemID);
	};
	$scope.edit = function (item) {
		// item.templateID = item.templateID || $scope.myItem.templateID; // pull from parent if not defined
		var validEdit = function() {
			$scope.origin.isActive = false;
			$scope.origin = item;
			$scope.origin.isActive = true;
			$scope.active = angular.copy(item);
		};
		if ($scope.active && !angular.equals( $scope.origin, $scope.active )) {
			var check = confirm('The current item has been modified.\nAre you sure you want to change without saving?');
			if (check) validEdit();
		} else {
			validEdit();
		}
	};
	$scope.cancel = function() {
		$scope.origin.isActive = false;
		$scope.active = false;
	};
	$scope.reset = function() {
		var addr = angular.copy( $scope.active.addr );
		$scope.active = angular.copy( $scope.origin );
		$scope.active.addr = addr;
	};
	$scope.equals = function (a,b) { return angular.equals(a,b); };
	$scope.save = function() {
		ItemService.save($scope.active).then(function (res) {
			$scope.active = res;
			$scope.origin = res;
			$scope.items = ItemService.theList().list;
			$scope.origin.isActive = true;
		});
	};
	$scope.newItem = function() {
		$scope.edit({
			parentID: $scope.myItem ? $scope.myItem.itemID : null,
			settings: {},
			onFirm: 'true',
			image: null,
			code: null
		});
	};
	$scope.rem = function ($event, item) {
		$event.stopPropagation();
		var check = confirm('Are you sure you want to delete: "'+item.name+'"\nThis action is permenent and cannot be undone.');
		if (check) ItemService.rem(item).then(function () {
			$scope.items.splice($scope.items.indexOf(item), 1);
			$scope.active = false;
		});
	};
}]).

factory('ItemService', ['interface', '$q', '$route', function (interface, $q, $route) {
	var myItems  = {};
	var myPrices = {};
	var myTpls   = {};
	var myFields = {};
	var myTies   = {};

	var service = {
		getList: function (itemID) {
			var ret = $q.defer();
			if ( Object.keys(myItems).length > 0 ) {
				ret.resolve( service.theList(itemID) );
				ret = ret.promise; // funky way to return a promise
			} else {
				ret = interface.admin('item-init').then(function (data) {
					angular.forEach(data.items,  function (item)  { myItems  [ item.itemID    ] = item;  });
					angular.forEach(data.prices, function (price) { myPrices [ price.priceID  ] = price; });
					angular.forEach(data.tpls,   function (tpl)   { myTpls   [ tpl.templateID ] = tpl;   });
					angular.forEach(data.fields, function (field) { myFields [ field.fieldID  ] = field; });
					angular.forEach(data.ties,   function (tie)   { myTies   [ tie.tieID      ] = tie;   });
					return service.theList(itemID);
				});
			}
			return ret;
		},
		theList: function () {
			var ret = {list: [], item: false}, itemID = $route.current.params.itemID || null;
			for (var key in myItems) if (myItems[key].parentID == itemID) ret.list.push(myItems[key]);
			if (itemID) ret.item = myItems[itemID];
			return ret;
		},
		getTpls: function() {
			return myTpls;
		},
		rem: function (item) {
			return interface.admin('item-rem', item).then(function (res) {
				delete myItems[item.itemID];
			});
		},
		save: function (item) {
			return interface.admin('item-set', item).then(function (res) {
				myItems[res.itemID] = res;
				return res;
			});
		}
	};
	return service;
}]);