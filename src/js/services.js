angular.module('myApp.services', [

]).

factory('myPage', function( ){
	var pageTitle = "Upstream Academy Shop";
	var subTitle = "";

	return {
		setTitle: function( newTitle, newSubTitle ){
			pageTitle = newTitle;
			subTitle = newSubTitle;
		},
		getTitle: function() {
			return pageTitle;
		},
		getSubTitle: function() {
			return subTitle;
		}
	};
}).

factory('breadcrumbs', ['$rootScope', '$location', function ($rootScope, $location) {
	var breadcrumbs = [];

	$rootScope.$on('$routeChangeSuccess', function(event, current) {
		var pathElements = $location.path().split('/'), result = [], i;
		var breadcrumbPath = function (index) {
			return '/' + (pathElements.slice(0, index + 1)).join('/');
		};

		if (pathElements[1] !== '') { // remove empty navigation to home
			pathElements.shift();
			for (i=0; i<pathElements.length; i++) {
				result.push({
					name: pathElements[i],
					path: '#' + breadcrumbPath(i)
				});
			}
		}

		breadcrumbs = result;
	});

	return {
		getAll: function() {
			return breadcrumbs;
		},
		getFirst: function() {
			return breadcrumbs[0] || {};
		},
		onPage: function( crumb ) {
			return crumb == (breadcrumbs[breadcrumbs.length-1] || {name:'undefined'}).name;
		}
	};
}]).

factory('myCart', ['$rootScope', 'interface', function($rootScope, interface) {
	var cart = JSON.parse(localStorage.azUAcart || '[]'), past = [];
	var observerCallbacks = []; // Observer Pattern

	var update = function() {
		localStorage.setItem('azUAcart', JSON.stringify(cart));
		angular.forEach(observerCallbacks, function(callback) { // Notify observers
			callback();
		});
		update_purchases();
	};

	// Attach storage change event
	if (window.addEventListener) { // See: http://diveintohtml5.info/storage.html
		window.addEventListener('storage', handle_storage, false);
	} else {
		window.attachEvent('onstorage', handle_storage);
	}

	// Update cart and notify world of changes
	function handle_storage(e) { // allow multi-tab updates
		if (!e) { e = window.event; }
		cart = JSON.parse(localStorage.getItem('azUAcart') || '[]');
		$rootScope.$digest();
		update();
	}

	function update_purchases() {
		interface.call('getSoftPurchases').then(function(res) {
			past = res.data;
		});
	}

	return {
		len: function() {
			return cart.length || '';
		},
		add: function(item) {
			cart.push(item.itemID);
			update();
		},
		addObj: function(item) {
			cart.push(item);
			update();
		},
		rem: function(index) {
			cart.splice(index, 1);
			update();
		},
		contains: function(itemID) {
			// check if already in cart or if inprevious purchases
			return cart.indexOf(itemID) !== -1 || past.indexOf(itemID) !== -1;
		},
		get: function() {

			// remove past items from cart before returning cart
			angular.forEach(past, function(ele) {
				var index = cart.indexOf(ele);
				if (index !== -1) cart.splice(index, 1);
			});

			return cart;
		},
		clear: function() {
			cart = [];
			update();
		},
		getPurchases: function() {
			update_purchases();
		},

		// Observer pattern
		registerObserver: function(callback) {
			observerCallbacks.push(callback);
		}
	};
}]).

factory('printCart', ['interface', 'myCart', '$rootScope', '$filter', function (interface, myCart, $rootScope, $filter) {
	var fullCart = [];
	var options = {};
	var total = 0;
	var printList = []; // cost computed fullCart

	// Nice observer pattern! http://stackoverflow.com/a/17558885
	myCart.registerObserver(load_me);

	function load_me() {
			localCart = myCart.get();
			var promise = interface.call('getCart', {'ids': localCart});
			promise.then(function(response) {
				fullCart = response.data;

				// remove myCart elements that don't correspond to fullCart elements
				for (var i=0; i < response.data.length; i++) {
					var dieCount = 0; // in case bad error
					if (response.data[i].itemID==-1) continue; // fix invoices
					while (response.data[i].itemID != localCart[i]) { // thanks for being sequential!
						myCart.rem(i);
						localCart = myCart.get();
						if (++dieCount > 100) break; // infinete loops are bad
					}
				}

				watchHandle(fullCart.concat(['x'])); // force watcher
			});
			return promise;
	}

	var watchHandle = function(newValue) {
		total = 0; // reset total
		printList = angular.copy(newValue); // assign new list
		printList.pop(); // remove the concatenated options

		// Compute different costs on cart changes
		printList.forEach(function(ele) {
			ele.cost.calc = 0;
			switch (ele.template) {
				case 'conference':
					ele.cost.calc = parseFloat(ele.cost.settings.initial); // initial cost always in effect
					if (options.hasOwnProperty(ele.itemID)) { // apply pricing based on the number of attendees
						var multiply = options[ele.itemID].attendees.length - parseFloat(ele.cost.settings.after); // how many more
						if (multiply > 0) ele.cost.calc += parseFloat(ele.cost.settings.later) * multiply; // for additional attendees
					}
					break;
				case 'download':
					ele.cost.calc = parseFloat(ele.cost.settings.cost); // straight assignment (no options)
					break;
				case 'custom':
					ele.cost = { calc: ele.cost, pretty: $filter('currency')(ele.cost) }; // invoices
					break;
				default:
					ele.cost = {calc:0, pretty:'$0.00'};
			}
			total += ele.cost.calc; // compute total
		});
	};
	$rootScope.$watch(function() {
		return fullCart.concat([options]); // watch for list and option changes
	}, watchHandle, true);

	return {
		load: function() {
			return load_me();
		},
		list: function() {
			return printList; //fullCart;
		},
		total: function() {
			return total;
		},
		getOpt: function() {
			return options;
		},
		setOpt: function(opt) {
			options = opt;
		},
		checkout: function() {
			localStorage.setItem('azUArecipt', JSON.stringify(printList)); // store off cart
			localStorage.setItem('azUAreciptTotal', JSON.stringify(total));
			myCart.clear();
		},
		getRecipt: function() {
			return {
				total: JSON.parse(localStorage.getItem('azUAreciptTotal')),
				list: JSON.parse(localStorage.getItem('azUArecipt'))
			};
		}
	};
}]).

factory('interface', ['$http', function ($http) {

	return {
		call: function(myAction, data) {
			return $http.post('http://uastore.wha.la/interface.php', data, {params:{action: myAction}});
		}
	};
}]);

// http://www.codeproject.com/Articles/576246/A-Shopping-Cart-Application-Built-with-AngularJS