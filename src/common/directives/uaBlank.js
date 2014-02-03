angular.module('myApp.common.directives.uaBlank', []).

directive('uaBlank', function() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, elem, attr, ctrl) {
			ctrl.$parsers.push(function(value) {
				return value ? value : undefined;
			});
		}
	};
});