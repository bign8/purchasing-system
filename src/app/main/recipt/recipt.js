angular.module('myApp.main.receipt', [
	'security'
]).

config(['$routeProvider', 'securityAuthorizationProvider', function( $routeProvider, securityAuthorizationProvider ){
	$routeProvider.when('/receipt', {
		title: "Receipt",
		subTitle: "from last purchase",
		templateUrl: 'app/main/recipt/recipt.tpl.html',
		controller: 'ReciptCtrl',
		resolve: {
			user: securityAuthorizationProvider.requireAuthenticatedUser
		}
	});
}]).

controller('ReciptCtrl', ['$scope', function ($scope) {
	$scope.recipt = JSON.parse(localStorage.getItem('UA-receipt'));
}]);