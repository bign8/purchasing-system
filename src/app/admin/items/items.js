angular.module('myApp.admin.items', [
	'myApp.common.services',
	'myApp.common.filters',
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


controller('ItemListModal', ['$scope', '$modalInstance', 'item', 'ItemService', function ($scope, $modalInstance, item, ItemService) {
	$scope.item = item;
	$scope.items = ItemService.allItems();

	var blank_item = function (parent_id) {
		return {};
	};
	$scope.clearItem = function( index, parentID ) {
		$scope.viewItems = $scope.viewItems.slice(0, index+1);
		$scope.viewItems[index] = blank_item(parentID);
	};
	var initValues = function() {
		$scope.viewItems = [];

		if ($scope.item.parentID) {
			var activeID = $scope.item.parentID, nextItem, hasMore = false;

			// hunt for children
			angular.forEach($scope.items, function (ele) {
				if (ele.parentID == activeID) hasMore = true;
			});
			$scope.viewItems.push( hasMore ? blank_item( activeID ) : null );

			// hunt for parents (including self)
			do {
				nextItem = $scope.items[ activeID ];
				$scope.viewItems.unshift( nextItem );
				activeID = nextItem.parentID;
			} while ( activeID );
		} else {
			$scope.viewItems.push( blank_item( null ) );
		}
	};
	initValues();

	$scope.$watch('viewItems', function (newValue, oldValue) {
		if (newValue === oldValue) return; // don't execute on initialization
		for (var i = 0; i < newValue.length; i++) {
			if ( !angular.equals(newValue[i], oldValue[i]) ) {
				if (newValue[i] !== null) // item changed : cleared : global
					$scope.item.parentID = newValue[i].itemID ? newValue[i].itemID : i > 0 ? newValue[i-1].itemID : null ;
				initValues();
				break;
			}
		}
	}, true);

	$scope.ok = function () { $modalInstance.close( $scope.item ); };
	$scope.cancel = function () { $modalInstance.dismiss('cancel'); };
}]).

controller('ItemListCtrl', ['$scope', 'items', '$location', 'ItemService', '$modal', function ($scope, items, $location, ItemService, $modal){
	$scope.items = items.list;
	$scope.myItem = items.item;
	$scope.active = false; // holds copied new item for editing
	$scope.origin = false; // holds pointer to list item
	$scope.tpls = ItemService.getTpls();
	$scope.fields = ItemService.getFields();
	$scope.allItems = ItemService.allItems();
	$scope.files_first = function (value) { return value.count == '0'; };
	$scope.equals = function (a,b) { return angular.equals(a,b); };

	// Item moving functions
	$scope.move = function () {
		var instance = $modal.open({
			templateUrl: 'app/admin/items/move.modal.tpl.html',
			controller: 'ItemListModal',
			resolve: {
				item: function () { return $scope.active; },
				items: ItemService.getItems,
			},
		});
		instance.result.then( function (new_item) {
			$scope.save().then(function () {
				$scope.go( new_item.parentID );
			});
		});
	};


	// nav functions
	$scope.go = function (itemID) {
		$scope.origin.isActive = false;
		itemID = itemID ? itemID : '' ;
		$location.path('/admin/items/' + itemID);
	};
	$scope.edit = function (item) {
		var validEdit = function() {
			// toggle reset
			$scope.origin.isActive = false;
			$scope.origin = item;
			$scope.origin.isActive = true;

			// Template data
			$scope.myTemplate = ItemService.getTpl(item);
			item.templateID = ($scope.myTemplate || {templateID:null}).templateID;

			// Copy and setup fields + prices
			$scope.active = angular.copy(item);
			$scope.myFields = ItemService.itemFields(item.itemID);
			$scope.myPrices = ItemService.getPrices(item.itemID);
		};
		if ($scope.active && !angular.equals( $scope.origin, $scope.active )) {
			var check = confirm('The current item has been modified.\nAre you sure you want to change without saving?');
			if (check) validEdit();
		} else {
			validEdit();
		}
	};
	if ($scope.items[0]) $scope.edit($scope.items[0]);

	// Item Functions
	$scope.cancel = function() {
		$scope.origin.isActive = false;
		$scope.active = false;
	};
	$scope.reset = function() {
		var addr = angular.copy( $scope.active.addr );
		$scope.active = angular.copy( $scope.origin );
		$scope.active.addr = addr;
	};
	$scope.save = function() {
		return ItemService.save($scope.active).then(function (res) {
			$scope.active = angular.copy( res );
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
			count: '0',
			image: null,
			code: null,
			templateID: $scope.myItem.templateID
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
	$scope.$watch('addField', function (value) {
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
	$scope.chgField = function(field) {
		ItemService.chgField(field).then(function (res) {
			field.required = res.required;
		});
	};

	// Template Function
	$scope.$watch('myTemplate.templateID', function (value) {
		if (!value) return;
		var test = true;
		if ($scope.active.templateID && value != $scope.active.templateID) 
			test = confirm("Are you sure you want to change the template?\nThis will break all sub-assigned prices.");

		if (test)
			$scope.active.templateID = value;
		else
			$scope.myTemplate = $scope.tpls[$scope.active.templateID];
	});

	// Price Functions
	$scope.priceDifferent = function (price) {
		if (!price.orig) return false;
		return !(
			angular.equals(price.settings, price.orig.settings) &&
			angular.equals(price.inCart,   price.orig.inCart  ) &&
			angular.equals(price.reasonID, price.orig.reasonID)
		);
	};
	$scope.priceReset = function (price) {
		price.settings = angular.copy( price.orig.settings );
		price.inCart   = angular.copy( price.orig.inCart   );
		price.reasonID = angular.copy( price.orig.reasonID );
	};
	$scope.priceSave = function (price) {
		delete price.orig;
		ItemService.setPrice(price).then(function (res) {
			price.orig = angular.copy( res );
		});
	};
	$scope.priceAdd = function () {
		var obj = {
			itemID: $scope.active.itemID,
			reasonID: $scope.myPrices.length ? "-1" : null,
			inCart: 'true',
			templateID: $scope.myTemplate.templateID,
			costReq: $scope.myTemplate.costReq,
			settings: {},
			exact: true,
		};
		obj.orig = angular.copy( obj );
		$scope.myPrices.unshift(obj);
	};
	$scope.priceRem = function (price) {
		var check = confirm('Are you sure you want to delete this price?\nYou can add it back by selecting the "Add" button.');
		if (check) ItemService.rmPrice(price).then(function () {
			$scope.myPrices.splice($scope.myPrices.indexOf(price), 1);
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
		if (!itemID) return [];
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
					angular.forEach(data.fields, function (field) { myFields [ field.fieldID  ] = field; });
					angular.forEach(data.ties,   function (tie)   { myTies   [ tie.tieID      ] = tie;   });
					angular.forEach(data.tpls, function (tpl) {
						tpl.itemReq = tpl.itemReq ? tpl.itemReq.split(',') : []; // convert requirement strings to arrays
						tpl.costReq = tpl.costReq ? tpl.costReq.split(',') : [];
						myTpls[ tpl.templateID ] = tpl;
					});
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
		allItems: function() {
			return myItems;
		},
		itemFields: function (itemID) {
			if (!itemID) return [];
			var ret = [], parents = getParents(itemID), ele;
			for (var key in myTies) {
				if ( parents.indexOf( myTies[key].itemID ) > -1 ) {        // in parents array
					ele = angular.copy( myFields[ myTies[key].fieldID ] ); // copy from source
					ele.exact = ( myTies[key].itemID == itemID );          // exact match
					angular.extend(ele, myTies[key]);                      // overwrites itemID, not good!
					ele.order = parseInt( myTies[key].order );             // convert order to integer
					ret.push( ele );
				}
			}
			return ret;
		},
		getPrices: function (itemID) {
			if (!itemID) return [];
			var ret = [], parents = getParents(itemID), ele;
			for (var key in myPrices) {
				if ( parents.indexOf( myPrices[key].itemID) > -1 ) { // in parents array
					ele = angular.copy( myPrices[key] );             // copy from source
					ele.exact = (ele.itemID == itemID);              // exact match
					ele.costReq = myTpls[ ele.templateID ].costReq;  // cost requirements
					ele.orig = angular.copy( ele );                  // make copy of origional
					ret.push( ele );
				}
			}
			return ret;
		},
		getFields: function () { return myFields; },
		getTpls: function() { return myTpls; },
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
		},
		chgField: function(field) {
			return interface.admin('item-chgTie', field).then(function (res) {
				myTies[field.tieID].required = res.required;
				return res;
			});
		},
		getTpl: function(item) {
			var template = item.templateID;
			while (!template && item.parentID) {
				item = myItems[ item.parentID ];
				template = item.templateID;
			}
			return template ? myTpls[ template ] : null;
		},
		setPrice: function(price) {
			return interface.admin('item-setPri', price).then(function (res) {
				myPrices[res.priceID] = angular.copy( res );
				res.orig = angular.copy( res );
				return res;
			});
		},
		rmPrice: function(price) {
			return interface.admin('item-rmPri', price).then(function () {
				delete myPrices[price.priceID];
			});
		}
	};
	return service;
}]);