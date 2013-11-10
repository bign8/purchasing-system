// This file contains a few controllers

angular.module('myApp.controllers', [
	'myApp.services',
	'ui.bootstrap'
]).

controller('IndexCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	myPage.setTitle("Upstream Academy", "Guiding accounting firms to high performance");
}]).

controller('ListProdCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	myPage.setTitle("Product Lines", "Some quote about products");

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
			return $scope.reverse ? 'glyphicon-chevron-down' : 'glyphicon-chevron-up' ;
		} else {
			return '';
		}
	};

	$scope.pageNo = 1;
	$scope.pageSize = 10;

	$scope.products = [];
	for (var i=0; i<45; i++) {
		$scope.products.push({
			productID: i,
			name: 'Product ' + ("0" + i).slice(-2),
			link: 'product-' + ("0" + i).slice(-2),
			desc: 'Description of product ' + ("0" + i).slice(-2)
		});
	}

	// $scope.showPage = ;

}]).

controller('ListItemCtrl', ['$scope', 'myPage', '$routeParams', function ($scope, myPage, $routeParams) {
	console.log($routeParams);
	myPage.setTitle("Products", $routeParams.prodID);
}]).

controller('ShowItemCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	myPage.setTitle("Item YYY");
}]).

controller('CartCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	myPage.setTitle("Shopping Cart");
}]).

controller('CheckoutCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	myPage.setTitle("Checkout");
}]).

controller('HeadCtrl', ['$scope', 'myPage', 'breadcrumbs', function ($scope, myPage, breadcrumbs) {
	$scope.myPage = myPage;
	$scope.breadcrumbs = breadcrumbs;


}]);