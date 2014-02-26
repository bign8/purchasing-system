angular.module('myApp.main.user.add', []).

config(['$routeProvider', 'securityAuthorizationProvider', function ( $routeProvider, securityAuthorizationProvider ){
	$routeProvider.when('/user/add/:code', {
		title: 'Add Firm Code',
		templateUrl: 'app/main/user/add/add.tpl.html',
		controller: 'AddMemberCtrl',
		resolve: {
			item: ['interface', '$route', function (interface, $route) {
				return interface.user('softFirmCode', $route.current.params);
			}],
			user: securityAuthorizationProvider.requireAuthenticatedUser
		}
	});
}]).

controller('AddMemberCtrl', ['$scope', 'item', 'theCart', 'appStrings', '$location', '$interval',
	function ($scope, item, theCart, appStrings, $location, $interval) {
		if (typeof item == 'string') {
			switch (item) {
				case 'dup': $scope.message = appStrings.user.dupCode(); break;
				case 'dne': $scope.message = appStrings.user.dneCode(); break;
				default:    $scope.message = appStrings.user.errCode(); break;
			}
		} else {
			theCart.setDirty();
			$scope.message = appStrings.user.goodCode();
		}

		$scope.counter = 15;
		var timer = $interval(function() {
			if ($scope.counter <= 1) {
				$interval.cancel( timer );
				$location.path('/user');
			} else $scope.counter -= 1;
		}, 1000);
	}
]);