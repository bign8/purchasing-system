// Initial application

angular.module('myApp', [
	'ngRoute',
	'myApp.controllers',
	'myApp.filters'
]).

config(['$routeProvider', function( $routeProvider ){
	$routeProvider.
		when('/', { // Home - statically generated (static tpl with links)
			templateUrl: 'partials/index.tpl.html',
			controller: 'IndexCtrl'
		}).
		when('/products', { // List Products - render list of offered products
			templateUrl: 'partials/list-products.tpl.html',
			controller: 'ListProdCtrl'
		}).
		when('/products/:prodID', { // List Items - render list of items offered within product
			templateUrl: 'partials/list-items.tpl.html',
			controller: 'ListItemCtrl'
		}).
		when('/products/:prodID/:itemID', { // Show Item details - include add to cart button
			templateUrl: 'partials/show-item.tpl.html',
			controller: 'ShowItemCtrl'
		}).
		when('/cart', { // list items in cart
			templateUrl: 'partials/show-cart.tpl.html',
			controller: 'CartCtrl'
		}).
		when('/cart/checkout', { // generated checkout form (ask all the questions here)
			templateUrl: 'partials/checkout-questions.tpl.html',
			controller: 'CheckoutCtrl'
		}).
		otherwise({ redirectTo: '/' });
}]);