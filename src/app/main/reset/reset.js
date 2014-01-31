angular.module('myApp.main.reset', [
	// 'myApp.services',
	// 'security'
]).

config(['$routeProvider', function( $routeProvider ){
	$routeProvider.when('/reset/:hash', {
		title: 'Reset Password',
		templateUrl: 'app/main/reset/index.tpl.html',
		controller: 'ResetPassCtrl',
		resolve: {
			check: ['interface', '$route', function (interface, $route) {
				return interface.user('checkReset', $route.current.params);
			}]
		}
	});
}]).

// TODO: have checkReset return inputs (remove $route dependency)
controller('ResetPassCtrl', ['$scope', 'check', 'security', '$route', 'appStrings', function ($scope, check, security, $route, appStrings) {
	$scope.check = check;
	$scope.user = angular.copy( $route.current.params );
	$scope.message = false;
	$scope.processing = false;

	$scope.changePass = function() {
		$scope.processing = true;
		if ($scope.user.passVerify != $scope.user.password) {
			$scope.message = appStrings.reset.match;
			return;
		}
		security.resetPass($scope.user.hash, $scope.user.password).catch(function() {
			$scope.message = appStrings.reset.error;
			processing = false;
		});
	};
}]);