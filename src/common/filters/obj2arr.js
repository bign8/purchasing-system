angular.module('myApp.common.filters.obj2arr', []).

// https://github.com/angular/angular.js/issues/1286
filter('obj2arr', function(){
	return function (obj) {
		if (!(obj instanceof Object)) return obj;

		return Object.keys(obj).map(function (key) {
			return Object.defineProperty(obj[key], '$key', {value: key});
		});
	};
});