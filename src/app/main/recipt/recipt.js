angular.module('myApp.main.recipt', [
	'security'
]).

config(['$routeProvider', 'securityAuthorizationProvider', function( $routeProvider, securityAuthorizationProvider ){
	$routeProvider.when('/recipt', {
		title: "Recipt",
		subTitle: "from last purchase",
		templateUrl: 'app/main/recipt/recipt.tpl.html',
		controller: 'ReciptCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAuthenticatedUser
		}
	});
}]).

controller('ReciptCtrl', ['$scope', function ($scope) {
	$scope.recipt = JSON.parse(localStorage.getItem('UA-recipt'));
}]);