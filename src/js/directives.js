angular.module('myApp.directives', [

]).

directive('uaPassValidate', function() {
	return {
		restrict: 'A', // restrict to an attribute
		require: 'ngModel', // must have ng-model attribute
		link: function(scope, elem, attr, ctrl) {
			ctrl.$parsers.push(function( value ) {
				var lowerAlph = !!(value || 'a').match(/[a-z]/); // pass if empty
				var upperAlph = !!(value || 'A').match(/[A-Z]/);
				var hasNumber = !!(value || '0').match(/[0-9]/);
				var metLength = !!(value || 'abcdef').match(/.{6,}/);
				var specialCh = !!(value || '!').match(/[^a-zA-Z0-9]/);
				var valid = lowerAlph && upperAlph && hasNumber && metLength && specialCh;

				ctrl.$setValidity('lowerAlph', lowerAlph);
				ctrl.$setValidity('upperAlph', upperAlph);
				ctrl.$setValidity('hasNumber', hasNumber);
				ctrl.$setValidity('metLength', metLength);
				ctrl.$setValidity('specialCh', specialCh);
				ctrl.$setValidity('passValid', valid);
				
				return (valid && value) ? value : undefined; // but don't return object
			});
		}
	};
}).

directive('uaBlank', function() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, elem, attr, ctrl) {
			ctrl.$parsers.push(function(value) {
				console.log(value);
				return value ? value : undefined;
			});
		}
	};
});