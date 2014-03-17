angular.module('myApp.common.directives.notify', []).

directive('notify', ['$timeout', '$sce', function($timeout, $sce) { // extending from ui.bootstrap.alert
	return {
		restrict:'EA',
		replace: true,
		template: '<div ng-show="localMessage">'+
			'	<alert type="localMessage.type" close="clearMessage()">' +
			'		<h4 ng-show="localMessage.pre">{{localMessage.pre}}</h4>' + 
			'		<span ng-bind-html="cleanHTML"></span>' +
			'	</alert>'+
			'</div>',
		scope: {
			'message': '='
		},
		link: function($scope) {
			var timer;
			$scope.localMessage = false;
			$scope.clearMessage = function() {
				$scope.localMessage = false;
			};
			$scope.$watch('message', function(val) {
				if (!val) return;
				$timeout.cancel(timer);
				$scope.cleanHTML =  $sce.trustAsHtml(val.msg);
				$scope.localMessage = val;
				if (val) timer = $timeout($scope.clearMessage, (val.delay || 15)*1000);
			}, true);
		}
	};
}]);