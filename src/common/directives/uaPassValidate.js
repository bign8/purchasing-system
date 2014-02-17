angular.module('myApp.common.directives.uaPassValidate', []).

directive('uaPassValidate', function() { // http://bit.ly/1cwp3h0
	return {
		restrict: 'A', // restrict to an attribute
		require: 'ngModel', // must have ng-model attribute
		link: function(scope, elem, attr, ctrl) {
			ctrl.$parsers.push(function( value ) {
				var hasNumber = !!(value || '0').match(/[0-9]/);
				var metLength = !!(value || 'abcdef').match(/.{6,}/);
				var specialCh = !!(value || '!').match(/[^a-zA-Z0-9]/);
				var valid = metLength && (hasNumber || specialCh);

				ctrl.$setValidity('metLength', metLength);
				ctrl.$setValidity('isSpecial', hasNumber || specialCh);
				ctrl.$setValidity('passValid', valid);
				
				return (valid && value) ? value : undefined; // but don't return object
			});
		}
	};
});