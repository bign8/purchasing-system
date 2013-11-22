// This file contains a few controllers

angular.module('myApp.controllers', [
	'myApp.services',
	'ui.bootstrap'
]).

controller('IndexCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	myPage.setTitle("Upstream Academy", "Guiding accounting firms to high performance");
}]).

controller('ListProdCtrl', ['$scope', 'myPage', 'prodList', 'prodList2', 'myCart', function ($scope, myPage, prodList, prodList2, myCart) {
	myPage.setTitle("Our Products", "Some quote about products");

	// Set global passed variables
	$scope.myCart = myCart;
	$scope.products = prodList;
	$scope.prodList2 = prodList2.data;

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

controller('ListItemCtrl', ['$scope', 'myPage', '$routeParams', function ($scope, myPage, $routeParams) {
	console.log($routeParams);
	myPage.setTitle("Products", $routeParams.prodID);

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

	$scope.pageNo = 1;
	$scope.pageSize = 10;
}]).

controller('ShowItemCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	myPage.setTitle("Item YYY");
}]).

controller('CartCtrl', ['$scope', 'myPage', 'myCart', function ($scope, myPage, myCart) {
	myPage.setTitle("Shopping Cart");

	$scope.myCart = myCart;
}]).

controller('CheckoutCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	myPage.setTitle("Checkout");
}]).

controller('HeadCtrl', ['$scope', 'myPage', 'breadcrumbs', 'myCart', function ($scope, myPage, breadcrumbs, myCart) {
	$scope.myPage = myPage;
	$scope.breadcrumbs = breadcrumbs;
	$scope.myCart = myCart;

}]);