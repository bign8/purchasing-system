// Initial application

angular.module('myApp', [
	'ngRoute',
	'myApp.controllers'
]).

config(['$routeProvider', function( $routeProvider ){
	$routeProvider.
		when('/cats', {templateUrl: 'partials/list-cat.tpl.html', controller: 'ListCatsCtrl'}).
		when('/cats/:categoryID', {templateUrl: 'partials/list-item.tpl.html', controller: 'ListItemCtrl'}).
		otherwise({redirectTo: '/cats'});
}]);


/*

/ = Home - dynamically generated (static tpl with links)
/Products = List Products - render list of offered products
/Products/:prodID = List Items - render list of items within product
/Products/:prodID/:itemID = Show Item details (add to cart)
/Cart = View items in cart
/Cart/checkout = form generated for checkout

*/