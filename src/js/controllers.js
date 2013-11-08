// This file contains a few controllers

angular.module('myApp.controllers', [
	'myApp.services'
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

	$scope.products = [
		{ productID: '00', name: 'Product 00', link: 'product-00', desc: 'Something descriptive aobut product 00' },
		{ productID: '01', name: 'Product 01', link: 'product-01', desc: 'Something descriptive aobut product 01' },
		{ productID: '02', name: 'Product 02', link: 'product-02', desc: 'Something descriptive aobut product 02' },
		{ productID: '03', name: 'Product 03', link: 'product-03', desc: 'Something descriptive aobut product 03' },
		{ productID: '04', name: 'Product 04', link: 'product-04', desc: 'Something descriptive aobut product 04' },
		{ productID: '05', name: 'Product 05', link: 'product-05', desc: 'Something descriptive aobut product 05' },
		{ productID: '06', name: 'Product 06', link: 'product-06', desc: 'Something descriptive aobut product 06' },
		{ productID: '07', name: 'Product 07', link: 'product-07', desc: 'Something descriptive aobut product 07' },
		{ productID: '08', name: 'Product 08', link: 'product-08', desc: 'Something descriptive aobut product 08' },
		{ productID: '09', name: 'Product 09', link: 'product-09', desc: 'Something descriptive aobut product 09' },
		{ productID: '10', name: 'Product 10', link: 'product-10', desc: 'Something descriptive aobut product 10' },
		{ productID: '11', name: 'Product 11', link: 'product-11', desc: 'Something descriptive aobut product 11' },
		{ productID: '12', name: 'Product 12', link: 'product-12', desc: 'Something descriptive aobut product 12' },
		{ productID: '13', name: 'Product 13', link: 'product-13', desc: 'Something descriptive aobut product 13' },
		{ productID: '14', name: 'Product 14', link: 'product-14', desc: 'Something descriptive aobut product 14' },
		{ productID: '15', name: 'Product 15', link: 'product-15', desc: 'Something descriptive aobut product 15' },
		{ productID: '16', name: 'Product 16', link: 'product-16', desc: 'Something descriptive aobut product 16' },
		{ productID: '17', name: 'Product 17', link: 'product-17', desc: 'Something descriptive aobut product 17' },
		{ productID: '18', name: 'Product 18', link: 'product-18', desc: 'Something descriptive aobut product 18' },
		{ productID: '19', name: 'Product 19', link: 'product-19', desc: 'Something descriptive aobut product 19' },
		{ productID: '20', name: 'Product 20', link: 'product-20', desc: 'Something descriptive aobut product 20' },
		{ productID: '21', name: 'Product 21', link: 'product-21', desc: 'Something descriptive aobut product 21' },
		{ productID: '22', name: 'Product 22', link: 'product-22', desc: 'Something descriptive aobut product 22' },
		{ productID: '23', name: 'Product 23', link: 'product-23', desc: 'Something descriptive aobut product 23' },
		{ productID: '24', name: 'Product 24', link: 'product-24', desc: 'Something descriptive aobut product 24' },
		{ productID: '25', name: 'Product 25', link: 'product-25', desc: 'Something descriptive aobut product 25' },
		{ productID: '26', name: 'Product 26', link: 'product-26', desc: 'Something descriptive aobut product 26' },
		{ productID: '27', name: 'Product 27', link: 'product-27', desc: 'Something descriptive aobut product 27' },
		{ productID: '28', name: 'Product 28', link: 'product-28', desc: 'Something descriptive aobut product 28' },
		{ productID: '29', name: 'Product 29', link: 'product-29', desc: 'Something descriptive aobut product 29' }
	];
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