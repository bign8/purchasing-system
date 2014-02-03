angular.module('myApp', [
	'ngRoute',        // ng-route for in-page routing
	'security',       // handles all authentication
	'templates-main', // for html2js
	
	'myApp.admin',    // administration section
	'myApp.common',   // directives / filters / modal / services
	'myApp.main',     // to split things up
]).

config(['$routeProvider', '$locationProvider', function ( $routeProvider, $locationProvider ){
	$locationProvider.html5Mode(true).hashPrefix('!');
	$routeProvider.otherwise({ redirectTo: '/' });
}]).

run(['security', 'theCart', function(security, theCart) {
	security.requestCurrentUser();
	theCart.load();
}]).

controller('HeadCtrl', ['$scope', 'breadcrumbs', 'myPage', 'security', 'theCart', function ($scope, breadcrumbs, myPage, security, theCart) {
	$scope.breadcrumbs = breadcrumbs;
	$scope.myPage = myPage;
	$scope.security = security;
	$scope.theCart = theCart;
}]);