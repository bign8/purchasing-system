angular.module('myApp.common.services.theCart', []).

factory('theCart', ['$rootScope', 'interface', 'security', '$q', function ($rootScope, interface, security, $q) {
	var options = {};
	var dirty = true;
	var total = 0;
	var observerCallbacks = []; // Observer Pattern

	// Update cart/purchases on current user change
	$rootScope.$watch(function() {
		return security.currentUser;
	}, function() {
		reload();
	}, true);

	var processItem = function(item, attribute) {
		var setValue = (attribute=='settings') ? 'value' : 'fullValue';
		var override = false;
		item.cost = item.cost || {};
		item.cost[setValue] = 0;
		if (item.template == 'custom') {
			item.cost[setValue] = parseFloat(item.cost[attribute].cost) || 0; // straight assignment (no options)
		} else {
			switch (item.cost.costReq) {
				case 'cost':
					item.cost[setValue] = parseFloat(item.cost[attribute].cost) || 0; // straight assignment (no options)
					break;
				case 'initial,later,after':
					item.cost[setValue] = parseFloat( item.cost[attribute].initial ); // initial cost always in effect
					if ( options.hasOwnProperty(item.itemID) ) { // apply pricing based on the number of attendees
						var attID = options[ item.itemID ].attID; // grab attendee id
						item.cost[setValue] = 0;
						angular.forEach(options[ item.itemID ][ attID ], function (person, index) {
							var cost = 0, s = item.cost[attribute];
							if (person.immutable) {
								cost = 0;
								item.warn = false; // reset item warning
							} else if ( index === 0 ) {
								cost = parseFloat( s.initial );
							} else if ( index >= parseInt( s.after ) ) {
								cost = parseFloat( s.later );
							}
							item.cost[setValue] += cost;
						});
					}
					break;
				case 'hard,soft':
					item.hasOptions = true;
					item.cost[setValue] = parseFloat( options[ item.itemID ] ? item.cost[attribute].hard : item.cost[attribute].soft ) ;
					override = true;
					break;
				default:
					item.cost = {};
					item.cost[setValue] = 0;
			}
		}
		
		if (item.hasOptions) item.cost.set = options.hasOwnProperty( item.itemID ) || override;
	};

	var processCart = function() {
		total = 0;
		var now = new Date();
		angular.forEach(service.cart, function (item) {
			processItem(item, 'settings');
			if (item.cost.reasonID) processItem(item, 'full');
			if (options.hasOwnProperty(item.itemID)) item.options = options[item.itemID];
			item.expired = (
				item.hasOwnProperty('settings') && 
				!!item.settings &&
				item.settings.hasOwnProperty('date') &&
				(new Date(item.settings.date) < now)
			);
			total += item.cost.value;
		});
		angular.forEach(observerCallbacks, function (callback) { // Notify observers
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
		return interface.cart('getFullCart').then(function (res) {
			service.cart = res.cart;
			options = res.options;
			service.discounts = res.discounts;
			processCart();
		});
	};

	var service = {
		cart: [],
		cartPromise: null,
		load: function() {
			if (dirty) {
				dirty = false;
				service.cartPromise = reload();
			}
			return service.cartPromise;
		},
		len: function() {
			return (service.cart || []).length || '';
		},
		add: function(item) {
			return dbCall('add', item);
		},
		rem: function(item) {
			return dbCall('rem', item);
		},
		total: function() {
			return total;
		},

		// DISCOUNT FUNCTIONS
		discounts: [],
		addDiscount: function(code) {
			return interface.cart('addDiscount', {code:code}).then(function (res) {
				service.discounts.push( res ); // add object on good callback
			});
		},
		remDiscount: function(myDiscount) {
			return interface.cart('remDiscount', myDiscount).then(function (res) {
				service.discounts = res;
			});
		},
		totDiscount: function() { // On the fly discount summation
			var total = 0;
			angular.forEach(service.discounts, function (item) {
				total += parseFloat( item.amount );
			});
			return total;
		},

		fullTotal: function() {
			return service.total() - service.totDiscount();
		},
		setDirty: function() {
			dirty = true;
		},

		setOption: function(itemID, opts) {
			interface.cart('setOption', {item:{'itemID':itemID}, options: opts}).then(function() {
				options[itemID] = opts;
				processCart();
			});
		},

		// Observer pattern
		registerObserver: function(callback) { // Nice observer pattern! http://stackoverflow.com/a/17558885
			if (observerCallbacks.indexOf(callback) === -1)
				observerCallbacks.push(callback);
		}
	};

	return service;
}]);