angular.module('myApp.common.services.theCart', []).

factory('theCart', ['$rootScope', 'interface', 'security', '$q', function($rootScope, interface, security, $q) {
	var cart = [];
	var options = {};
	var dirty = true;
	var total = 0;
	var observerCallbacks = []; // Observer Pattern

	// Update cart/purchases on current user change
	$rootScope.$watch(function() {
		return security.currentUser;
	}, reload, true);

	var processItem = function(item, attribute) {
		var setValue = (attribute=='settings') ? 'value' : 'fullValue';
		item.cost = item.cost || {};
		item.cost[setValue] = 0;
		item.hasOptions = false;
		switch (item.template) {
			case 'conference':
				item.cost[setValue] = parseFloat( item.cost[attribute].initial ); // initial cost always in effect
				if ( options.hasOwnProperty(item.itemID) ) { // apply pricing based on the number of attendees
					var attID = options[ item.itemID ].attID; // grab attendee id
					var multiply = (options[ item.itemID ][ attID ] || []).length - parseFloat( item.cost[attribute].after ); // how many more
					if (multiply > 0) item.cost[setValue] += parseFloat( item.cost[attribute].later ) * multiply; // for additional attendees
				}
				item.hasOptions = true;
				break;
			case 'download':
				item.cost[setValue] = parseFloat(item.cost[attribute].cost); // straight assignment (no options)
				break;
			case 'custom':
				item.cost[setValue] = item.cost[attribute].cost;// = { calc: item.cost, pretty: $filter('currency')(item.cost) }; // invoices
				break;
			default:
				item.cost = {};
				item.cost[setValue] = 0;
		}
		if (item.hasOptions) item.cost.set = options.hasOwnProperty( item.itemID );
	};

	var processCart = function() {
		total = 0;
		angular.forEach(cart, function(item) {
			processItem(item, 'settings');
			if (item.cost.hasOwnProperty('full')) processItem(item, 'full');
			total += item.cost.value;
		});
		angular.forEach(observerCallbacks, function(callback) { // Notify observers
			callback();
		});
	};

	var dbCall = function(fn, item) {
		dirty = true;
		var promise = interface.cart(fn, item);
		promise.then(function(res) {
			reload();
		});
		return promise;
	};

	var reload = function() {
		var cartPromise = interface.cart('get').then(function(res) { // get cart
			cart = res;
		});
		var optPromise = interface.cart('getOptions').then(function(res) { // get options
			options = res;
		});
		return $q.all([cartPromise, optPromise]).then(function() { // wait for both to respond
			dirty = false;
			processCart();
		});
	};

	return {
		load: function() {
			var promise = null;
			if (dirty) {
				promise = reload();
			} else {
				var deferred = $q.defer();
				promise = deferred.promise;
				deferred.resolve(cart);
			}
			return promise;
		},
		len: function() {
			return cart.length || '';
		},
		add: function(item) {
			return dbCall('add', item);
		},
		rem: function(item) {
			return dbCall('rem', item);
		},
		get: function() {
			return cart;
		},
		total: function() {
			return total;
		},
		// dev: function() { // for development only
		// 	return options;
		// },
		setDirty: function() {
			dirty = true;
		},

		// Observer pattern
		registerObserver: function(callback) { // Nice observer pattern! http://stackoverflow.com/a/17558885
			if (observerCallbacks.indexOf(callback) === -1)
				observerCallbacks.push(callback);
		}
	};
}]);