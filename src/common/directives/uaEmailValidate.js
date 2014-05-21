angular.module('myApp.common.directives.uaEmailValidate', []).

directive('uaEmailValidate', ['interface', function (interface) { // http://bit.ly/1cwp3h0
	return {
		restrict: 'A', // restrict to an attribute
		require: 'ngModel', // must have ng-model attribute
		scope: {
			'uaEmailValidate': '='
		},
		link: function(scope, elem, attr, ctrl) {
			elem.on('blur', function (e) {
				if (!scope.uaEmailValidate) interface.user('checkEmail', {email:elem.val()}).then(function (res) {
					ctrl.$setValidity('used', true);
				}, function (res) {
					ctrl.$setValidity('used', false);
				});
			});
		}
	};
}]);