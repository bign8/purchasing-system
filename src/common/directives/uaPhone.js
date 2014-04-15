angular.module('myApp.common.directives.uaPhone', []).

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

			// get that cursor back into position
			var pos; // number of digits before cursor
			ctrl.$parsers.unshift(function (val) { // start
				if (!val) return val;
				
				// get cursor position and subtract count of non-numeric characters before cursor
				pos = elem[0].selectionStart;
				pos -= val.substr(0, pos).replace(/[0-9]/g, '').length;

				return val;
			});
			ctrl.$parsers.push(function (val) { // end
				if (!val) return val;

				// find index of (pos)th number (newPos)
				var newPos = 0, reg = new RegExp(/[0-9]/);
				while (newPos < val.length && pos > 0) if (reg.test(val.charAt(newPos++))) pos--;

				elem[0].selectionStart = elem[0].selectionEnd = newPos;
				return val;
			});
		}
	};
});