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
	$scope.fields = ItemService.getFields();

	$scope.go = function (itemID) {
		$scope.origin.isActive = false;
		itemID = itemID ? itemID : '' ;
		$location.path('/admin/items/' + itemID);
	};
	$scope.edit = function (item) {
		var validEdit = function() {
			$scope.origin.isActive = false;
			$scope.origin = item;
			$scope.origin.isActive = true;
			$scope.active = angular.copy(item);
			$scope.myFields = ItemService.itemFields(item.itemID);
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

	// Field Functions
	$scope.rmField = function ($event, field) {
		$event.stopPropagation();
		var check = confirm('Are you sure you want to remove: "'+field.name+'"\nYou can add it back by selecting the "Add Field" button.');
		if (check) ItemService.rmField(field).then(function() {
			$scope.myFields.splice($scope.myFields.indexOf(field), 1);
		});
	};
	$scope.$watch('addField', function(value) {
		if (!value) return;
		var found = false;
		for (var key in $scope.myFields) if ($scope.myFields[key].fieldID == value.fieldID) {
			alert('"' + value.name + '" has already been added to this item');
			$scope.addField = undefined;
			return;
		}
		ItemService.addField(value, $scope.active).then(function (field) {
			$scope.myFields.push(field);
			$scope.addField = undefined;
		});
	});
	$scope.mvField = function(direction, field) {
		var other;
		for (var key in $scope.myFields) if ($scope.myFields[key].order == (field.order + direction)) other = $scope.myFields[key];
		ItemService.mvField(field, other).then(function() {
			var temp = field.order;
			field.order = other.order;
			other.order = temp;
		});
	};
}]).

factory('ItemService', ['interface', '$q', '$route', function (interface, $q, $route) {
	var myItems  = {};
	var myPrices = {};
	var myTpls   = {};
	var myFields = {};
	var myTies   = {};

	// get list of parentID's (including self)
	function getParents(itemID) {
		var ret = [itemID], parent = myItems[itemID];
		while (parent.parentID) {
			parent = myItems[ parent.parentID ];
			ret.push( parent.itemID );
		}
		return ret;
	}

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
		itemFields: function (itemID) {
			var ret = [], parents = getParents(itemID), ele;
			for (var key in myTies) {
				if ( parents.indexOf( myTies[key].itemID ) > -1 ) { // in parents array
					ele = angular.copy( myFields[ myTies[key].fieldID ] );
					ele.tieID = key;
					ele.order = parseInt( myTies[key].order );
					ele.exact = ( myTies[key].itemID == itemID ); // exact match
					ret.push( ele );
				}
			}
			return ret;
		},
		getFields: function () {
			return myFields;
		},
		getTpls: function() {
			return myTpls;
		},
		rem: function(item) {
			return interface.admin('item-rem', item).then(function (res) {
				delete myItems[item.itemID];
			});
		},
		save: function(item) {
			return interface.admin('item-set', item).then(function (res) {
				myItems[res.itemID] = res;
				return res;
			});
		},
		rmField: function(field) {
			return interface.admin('item-rmTie', field).then(function (res) {
				delete myTies[field.tieID];
			});
		},
		addField: function(field, item) {
			field = angular.copy(field);
			return interface.admin('item-addTie', {field: field, item: item}).then(function (res) {
				field.tieID = res.tieID;
				field.order = parseInt( res.order );
				field.exact = true;
				return field;
			});
		},
		mvField: function(src, dest) {
			return interface.admin('item-mvTie', {src: src.tieID, dest: dest.tieID}).then(function (res) {
				if (res) {
					var temp = myTies[src.tieID].order;
					myTies[src.tieID].order = myTies[dest.tieID].order;
					myTies[dest.tieID].order = temp;
				}
			});
		}
	};
	return service;
}]);