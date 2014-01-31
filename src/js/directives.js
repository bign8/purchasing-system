angular.module('myApp.directives', [

]).

directive('uaPassValidate', function() { // http://bit.ly/1cwp3h0
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
				return value ? value : undefined;
			});
		}
	};
}).

directive('uaPhone', function() {
	var formatPhone = function (tel) {
		if (!tel) return undefined;
		var value = tel.toString().trim().replace(/[^0-9]/g, ''), country, city, number;

		switch (value.length) {
			case 10: // +1PPP####### -> C (PPP) ###-####
				country = 1;
				city = value.slice(0, 3);
				number = value.slice(3);
				break;

			case 11: // +CPPP####### -> CCC (PP) ###-####
				country = value[0];
				city = value.slice(1, 4);
				number = value.slice(4);
				break;

			case 12: // +CCCPP####### -> CCC (PP) ###-####
				country = value.slice(0, 3);
				city = value.slice(3, 5);
				number = value.slice(5);
				break;

			default:
				return value;
		}
		if (country == 1) country = "";
		number = number.slice(0, 3) + '-' + number.slice(3);
		return (country + " (" + city + ") " + number).trim();
	};

	return {
		restrict: 'A',
		require: '?ngModel',
		link: function($scope, elem, attr, ctrl) {
			ctrl.$parsers.unshift(function (tel) {
				tel = formatPhone(tel);
				elem.val(tel);
				return tel;
			});
		}
	};
}).

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
}]).

directive('uaMagicFormatter', ['$filter', function($filter) {
	var formatters = {
		currency: function(val) {
			var decimal = val.split('.')[1];
			decimal = (decimal === undefined) ? "" : ("." + decimal.substr(0,2)); // decimal formatting
			val = parseInt(val.replace(/[^\d\.]/g,'')); // convert to number
			val = $filter('currency')(val, '$'); // format directly
			val = val.substring(0, val.length-3); // remove decimals
			return val + decimal;
		}
	};
	return {
		restrict: 'A',
		require: '?ngModel',
		link: function(scope, element, attrs, ctrl) {
			ctrl.$parsers.unshift(function(val) {
				val = formatters[ attrs.uaMagicFormatter ]( val );
				return element.val( val ).val();
			});
		}
	};
}]);