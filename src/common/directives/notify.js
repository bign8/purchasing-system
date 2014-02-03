angular.module('myApp.common.directives.notify', []).

directive('notify', ['$timeout', '$sce', function($timeout, $sce) { // extending from ui.bootstrap.alert
	return {
		restrict:'EA',
		replace: true,
		template: '<div ng-show="message">'+
			'	<alert type="message.type" close="clearMessage()" class="alert-block">' +
			'		<h4 ng-show="message.pre">{{message.pre}}</h4>' + 
			'		<span ng-bind-html="cleanHTML"></span>' +
			'	</alert>'+
			'</div>',
		scope: {
			'message': '='
		},
		link: function($scope) {
			var timer;
			$scope.clearMessage = function() {
				$scope.message = false;
			};
			$scope.$watch('message', function(val) {
				if (!val) return;
				$timeout.cancel(timer);
				$scope.cleanHTML =  $sce.trustAsHtml(val.msg);
				if (val) timer = $timeout($scope.clearMessage, (val.delay || 15)*1000);
			});
		}
	};
}]);