// Initial application

angular.module('myApp', [
	'ngRoute',
	'myApp.admin',
	'myApp.controllers',
	'myApp.directives',
	'myApp.filters',
	'security',
	'myApp.services',
	'myApp.directives',
	'templates-main', // for html2js

	'myApp.main' // to split things up
]).

config(['$routeProvider', '$locationProvider', function ( $routeProvider, $locationProvider ){
	$locationProvider.html5Mode(true).hashPrefix('!');
	$routeProvider.otherwise({ redirectTo: '/' });
}]).

run(['security', 'theCart', function(security, theCart) {
  // Get the current user when the application starts (in case they are still logged in from a previous session)
  security.requestCurrentUser();

  // prefetch cart if necessary
  theCart.load();
}]).

controller('HeadCtrl', ['$scope', 'myPage', 'breadcrumbs', 'theCart', 'security', function ($scope, myPage, breadcrumbs, theCart, security) {
	$scope.myPage = myPage;
	$scope.breadcrumbs = breadcrumbs;
	$scope.theCart = theCart;
	$scope.security = security;
}]);