// This file contains a few controllers

angular.module('myApp.controllers', [
	'myApp.services'
]).

controller('ListCatsCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	myPage.setTitle("Purchasing System");
}]).

controller('ListItemCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	myPage.setTitle("Users");
}]).

controller('HeadCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	$scope.myPage = myPage;
}]);