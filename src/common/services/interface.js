angular.module('myApp.common.services.interface', []).

factory('interface', ['$http', '$q', '$rootScope', '$timeout', function ($http, $q, $rootScope, $timeout) {

	var pendingPromisses = 0, activeTimeout = -1;
	$rootScope.$watch(
		function() { return pendingPromisses > 0; }, 
		function(loading) {
			$rootScope.loading = loading;
			$rootScope.loadWarn = false;
			$timeout.cancel( activeTimeout );
			if (loading) {
				activeTimeout = $timeout(function() {
					$rootScope.loadWarn = true;
				}, 20*1000);
			}
		}
	);

	var formatData = function(data) { // process simple types (null,true,false)
		try { if (typeof(data)=='string') data = JSON.parse(data); } catch (e) {}
		return data;
	};

	var cb = function(myClass, myFn, myData) { // don't have to call res.data to get data!
		var deferred = $q.defer();
		pendingPromisses++;

		var url = '/interface.php', args = {params:{c:myClass, a:myFn}};

		// START DEV
		var root = ( document.location.href.indexOf('payment.upstreamacademy.com') === -1 ) ? 'http://payment.upstreamacademy.com/dev' : '' ;
		url = root + url;
		args.params.sessionID = localStorage.getItem('sessionID');
		// END DEV
		
		$http.post(url, myData, args).then(function (obj) {
			deferred.resolve( formatData( obj.data ) );
			pendingPromisses--;
		}, function(obj) {
			deferred.reject( formatData( obj.data ) );
			pendingPromisses--;
		});
		return deferred.promise;
	};

	return {
		user: function(myAction, myData) {
			return cb('user', myAction, myData);
		},
		cart: function(myAction, myData) {
			return cb('cart', myAction, myData);
		},
		app: function(myAction, myData) {
			return cb('app', myAction, myData);
		},
		admin: function(myAction, myData) {
			return cb('admin', myAction, myData);
		}
	};
}]);