angular.module('myApp.admin.purchases', [
	'myApp.common.services',
]).

config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
	$routeProvider.when('/admin/purchases', {
		title: 'Manage Purchases',
		templateUrl: 'app/admin/purchases/list.tpl.html',
		controller: 'PurchaseListCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser,
			purchases: ['PurchaseService', function (PurchaseService) {
				return PurchaseService.getList();
			}]
		}
	});
}]).

controller('PurchaseListCtrl', ['$scope', 'PurchaseService', function ($scope, PurchaseService){
	$scope.service = PurchaseService;
	$scope.active = false;
	$scope.list = false;
	$scope.addItem = false;

	$scope.select = function(area, id) {
		$scope.active = PurchaseService[area][id];
		$scope.list = PurchaseService.purchases[ area.charAt() + id ] || false; // direct assign!
		angular.forEach($scope.list, function (value) {
			value.item = PurchaseService.items[value.itemID];
		});
	};

	$scope.rem = function(item) {
		console.log(item);
		var check = confirm('Are you sure you want to remove: "'+item.item.name+'"?');
		if (check) PurchaseService.rem(item).then(function() {
			$scope.list.splice($scope.list.indexOf(item), 1);
			if (!$scope.list.length) $scope.list = false;
		});
	};

	$scope.add = function() {
		PurchaseService.add({
			itemID: $scope.addItem.itemID,
			contactID: $scope.active.contactID || null,
			firmID: $scope.active.firmID || null,
			isMember: $scope.addItem.templateID == '2'
		}, $scope.addItem.itemID).then(function (res) {
			$scope.addItem = false;
		});
	};
}]).

factory('PurchaseService', ['interface', '$q', '$route', function (interface, $q, $route) {
	var service = {
		purchases: {},
		items: {},
		contacts: {},
		firms: {},

		getList: function () {
			var ret = $q.defer();
			if ( Object.keys( service.purchases ).length > 0 ) {
				ret.resolve( service.purchases );
				ret = ret.promise; // funky way to return a promise
			} else {
				ret = interface.admin('purchase-init').then(function (data) {
					var index;
					angular.forEach( data.purchases, function (purchase) {
						index = purchase.contactID ? ('c' + purchase.contactID) : ('f' + purchase.firmID) ;
						if (service.purchases.hasOwnProperty( index )) {
							service.purchases[index].push(purchase);
						} else {
							service.purchases[index] = [purchase];
						}
					});
					angular.forEach( data.items,    function (item)    { service.items    [ item.itemID       ] = item;    });
					angular.forEach( data.contacts, function (contact) { service.contacts [ contact.contactID ] = contact; });
					angular.forEach( data.firms,    function (firm)    { service.firms    [ firm.firmID       ] = firm;    });
					return service.purchases;
				});
			}
			return ret;
		},
		
		rem: function(purchase) {
			return interface.admin('purchase-rem', purchase).then(function (res) {
				delete service.purchases[purchase.purchaseID];
			});
		},

		add: function(ele, itemID) {
			return interface.admin('purchase-add', ele).then(function (res) {
				console.log(res);
				var index = res.contactID ? ('c' + res.contactID) : ('f' + res.firmID) ;
				res.item = service.items[itemID];
				if (service.purchases[index].length) {
					service.purchases[index].push(res);
				} else {
					service.purchases[index] = [res];
				}
				return res;
			});
		}
	};
	return service;
}]);