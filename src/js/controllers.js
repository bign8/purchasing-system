// This file contains a few controllers

angular.module('myApp.controllers', [
	'myApp.services',
	'ui.bootstrap'
]).

controller('IndexCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	myPage.setTitle("Upstream Academy", "Guiding accounting firms to high performance");
}]).

controller('ListProdCtrl', ['$scope', 'myPage', 'prodList', function ($scope, myPage, prodList) {
	myPage.setTitle("Our Products", "Some quote about products");

	// Set global passed variables
	prodList.data.forEach(function(ele) {
		console.log(ele);
		if (ele.img === null) {
			ele.img = 'http://lorempixel.com/360/250/business';
		}
	});
	$scope.products = prodList.data;

	// toggling list view style
	$scope.showAsList = false;

	// list sort
	$scope.sortField = undefined;
	$scope.reverse = false;
	$scope.sort = function (fieldName) {
		if ($scope.sortField === fieldName) {
			$scope.reverse = !$scope.reverse;
		} else {
			$scope.sortField = fieldName;
			$scope.reverse = false;
		}
	};
	$scope.sortIcon = function (fieldName) {
		if ($scope.sortField === fieldName) {
			return $scope.reverse ? 'icon-chevron-down' : 'icon-chevron-up' ;
		} else {
			return '';
		}
	};

	// pagination
	$scope.pageNo = 1;
	$scope.pageSize = 12;

}]).

controller('ListItemCtrl', ['$scope', 'myPage', '$routeParams', 'itemList', 'myCart', function ($scope, myPage, $routeParams, itemList, myCart) {
	myPage.setTitle("Products", $routeParams.prodID);

	// Set global passed variables
	$scope.myCart = myCart;
	itemList.data.forEach(function(ele) {
		if (ele.img === null) {
			ele.img = 'http://lorempixel.com/360/250/business';
		}
	});
	$scope.items = itemList.data;

	// toggling list view style
	$scope.showAsList = false;

	// list sort
	$scope.sortField = undefined;
	$scope.reverse = false;

	$scope.sort = function (fieldName) {
		if ($scope.sortField === fieldName) {
			$scope.reverse = !$scope.reverse;
		} else {
			$scope.sortField = fieldName;
			$scope.reverse = false;
		}
	};

	$scope.sortIcon = function (fieldName) {
		if ($scope.sortField === fieldName) {
			return $scope.reverse ? 'icon-chevron-down' : 'icon-chevron-up' ;
		} else {
			return '';
		}
	};

	// pagination
	$scope.pageNo = 1;
	$scope.pageSize = 12;
}]).

controller('ShowItemCtrl', ['$scope', 'myPage', 'itemDetail', function ($scope, myPage, itemDetail) {
	myPage.setTitle(itemDetail.data.name);

	if (itemDetail.data.img === null) {
		itemDetail.data.img = 'http://lorempixel.com/360/250/business';
	}

	$scope.item = itemDetail.data;
}]).

controller('CartCtrl', ['$scope', 'myPage', 'myCart', 'security', 'printCart', function ($scope, myPage, myCart, security, printCart) {
	myPage.setTitle("Shopping Cart");

	$scope.myCart = myCart;
	$scope.printCart = printCart;

	$scope.checkout = function() {
		console.log('TODO: Check if user is logged in, then checkout or go through user add process');
		if (security.currentUser === null) {
			console.log('needs auth');
		} else {
			console.log('auth granted');
		}
	};
}]).

controller('CheckoutCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	myPage.setTitle("Checkout");
}]).

controller('HeadCtrl', ['$scope', 'myPage', 'breadcrumbs', 'myCart', 'security', function ($scope, myPage, breadcrumbs, myCart, security) {
	$scope.myPage = myPage;
	$scope.breadcrumbs = breadcrumbs;
	$scope.myCart = myCart;
	$scope.security = security;
}]).

controller('LististPurchasesCtrl', ['$scope', 'myPage', function ($scope, myPage){
	myPage.setTitle("Previously purchased items");
}]).

controller('CustPayFormCtrl', ['$scope', 'myPage', 'myCart', function ($scope, myPage, myCart){
	myPage.setTitle("Custom Payment Form");

	$scope.myCart = myCart;

	$scope.item = {
		itemID: -1,
		productID: -1,
		name: 'Custom Payment',
		settings: null,
		img: null,
		blurb: 'This is a custom field'
	};
}]).

controller('RegisterFormCtrl', ['$scope', 'myPage', '$modal', function ($scope, myPage, $modal){
	myPage.setTitle("Registration Form");

	$scope.user = {
		preName: '',
		firm: {addr: {addrID: null, addr2: null}},
		addr: {addrID: null, addr2: null}
	};

	$scope.same = false; // set based on the similarity of the id's (when editing)
	var firstLoad = true, oldUserAddr = null;
	$scope.$watch('same', function(value) {
		if (firstLoad) {
			firstLoad = false;
			return;
		}
		if (value) {
			oldUserAddr = $scope.user.addr;
			$scope.user.addr = $scope.user.firm.addr;
		} else {
			$scope.user.addr = oldUserAddr;
		}
	});

	$scope.setAddr = function (slug) {
		// open modal here with address form
		// modal insterts into db and returns full object
		
		var myAddress = (slug == 'firm') ? $scope.user.firm.addr : $scope.user.addr ;

		function applyAddr(addr) {
			if (slug == 'firm') {
				$scope.user.firm.addr = addr;
			} else {
				$scope.user.addr = addr;
			}
		}

		var modalInstance = $modal.open({
			templateUrl: 'partials/modal-address.tpl.html',
			controller: 'ModalAddressCtrl',
			resolve: {
				address: function() { return angular.copy( myAddress ); }
			}
		});

		modalInstance.result.then(function(address) {
			console.log(address);
			applyAddr(address);
		});
	};
}]).

controller('ModalAddressCtrl', ['$scope', '$modalInstance', 'address', 'interface', function($scope, $modalInstance, address, interface){
	$scope.address = address;
	$scope.ok = function() {
		// use interface to add/edit address in db
		var fun = ($scope.address.addrID === null) ? 'add' : 'edit' ;
		interface.call(fun + 'Address', $scope.address).then(function (res) {
			$scope.address.addrID = res.data;
			$modalInstance.close($scope.address);
		}, function (err) {
			console.log(err);
			console.log("There has been an error adding you address\nPlease try again or contact Upstream Academy for further assistance");
		});
	};
	$scope.cancel = function() {
		$modalInstance.dismiss();
	};
}]);