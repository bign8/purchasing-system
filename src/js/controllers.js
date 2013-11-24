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

controller('CartCtrl', ['$scope', 'myPage', 'myCart', 'fullCart', 'security', function ($scope, myPage, myCart, fullCart, security) {
	myPage.setTitle("Shopping Cart");

	myCart.setFull(fullCart.data);
	$scope.myCart = myCart;

	$scope.checkout = function() {
		console.log('TODO: Check if user is logged in, then checkout or go through user add process');
		if (security.currentUser === null) {
			console.log('needs auth');
		} else {
			console.log('auth granted');
		}
		// console.log(security.currentUser);
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
}]);