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

factory('breadcrumbs', ['$rootScope', '$location', 'interface', function ($rootScope, $location, interface) {
	var breadcrumbs = [];
	var crumbCashe = {};

	$rootScope.$on('$routeChangeSuccess', function(event, current) {
		var pathElements = $location.path().split('/'), result = [], i;
		var breadcrumbPath = function (index) {
			return '/' + (pathElements.slice(0, index + 1)).join('/');
		};

		// // pretty crumb cash and calling function
		// function prettyCrumb(obj) {
		// 	if (crumbCashe.hasOwnProperty(obj.path)) { // in in cashe
		// 		obj.name = crumbCashe[obj.path];
		// 	} else { // otherwise
		// 		interface.call('prettyCrumb', obj).then(function(res) {
		// 			crumbCashe[obj.path] = res.data; // assign cashe
		// 			breadcrumbs[obj.index].name = res.data; // assign value out
		// 		});
		// 	}
		// 	return ucfirst(obj.name);
		// }

		// Pretty path elements (thanks http://phpjs.org/functions/ucfirst/)
		function ucfirst (str) {
			str += '';
			var f = str.charAt(0).toUpperCase();
			return f + str.substr(1);
		}

		if (pathElements[1] !== '') { // remove empty navigation to home
			pathElements.shift();

			for (i=0; i<pathElements.length; i++) {
				var obj = {
					name: ucfirst(pathElements[i]),
					path: '#' + breadcrumbPath(i),
					index: i, // used for prettyCrumb
				};
				// if (!isNaN(parseInt(obj.name))) obj.name = prettyCrumb(obj); // make that ugly (numeric) crumb pretty
				result.push(obj);
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

factory('myCart', ['$rootScope', 'interface', 'security', function($rootScope, interface, security) {
	var cart = JSON.parse(localStorage.azUAcart || '[]'), past = [];
	var observerCallbacks = []; // Observer Pattern

	// Attach storage change event
	if (window.addEventListener) { // See: http://diveintohtml5.info/storage.html
		window.addEventListener('storage', handle_storage, false);
	} else {
		window.attachEvent('onstorage', handle_storage);
	}

	// // Update purchases on current user change
	// $rootScope.$watch(function() {
	// 	return security.currentUser;
	// }, update_purchases, true);

	// Update cart and notify world of changes
	function handle_storage(e) { // allow multi-tab updates
		if (!e) { e = window.event; }
		cart = JSON.parse(localStorage.getItem('azUAcart') || '[]');
		update();
		$rootScope.$digest();
	}

	// Update local storage container
	function update() {
		localStorage.setItem('azUAcart', JSON.stringify(cart));
		angular.forEach(observerCallbacks, function(callback) { // Notify observers
			callback();
		});
	}

	// // retrieve purchases from server
	// function update_purchases() {
	// 	interface.call('interface', 'getSoftPurchases').then(function (res) {
	// 		past = res.data;
			
	// 		// remove past items from cart before returning cart
	// 		angular.forEach(past, function(ele) {
	// 			var index = cart.indexOf(ele);
	// 			if (index !== -1) cart.splice(index, 1);
	// 		});
	// 		update();
	// 	});
	// }

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
		purchased: function(itemID) {
			return past.indexOf(itemID) !== -1;
		},
		get: function() {
			return cart;
		},
		clear: function() {
			cart = [];
			update();
		},

		// Observer pattern
		registerObserver: function(callback) {
			observerCallbacks.push(callback);
		}
	};
}]).

factory('printCart', ['interface', 'myCart', '$rootScope', '$filter', '$timeout', function (interface, myCart, $rootScope, $filter, $timeout) {
	var fullCart = [];
	var options = {};
	var total = 0;
	var printList = []; // cost computed fullCart
	var discounts = [];
	var discountMsg = false;

	// Nice observer pattern! http://stackoverflow.com/a/17558885
	myCart.registerObserver(load_me);

	function load_me() {
			localCart = myCart.get();
			var promise = interface.call('getCart', {'ids': localCart});
			promise.then(function(response) {
				fullCart = response.data;

				// // remove myCart elements that don't correspond to fullCart elements
				// for (var i=0; i < response.data.length; i++) {
				// 	var dieCount = 0; // in case bad error
				// 	if (response.data[i].itemID==-1) continue; // fix invoices
				// 	while (response.data[i].itemID != localCart[i]) { // thanks for being sequential!
				// 		myCart.rem(i);
				// 		localCart = myCart.get();
				// 		if (++dieCount > 100) break; // infinete loops are bad
				// 	}
				// }

				// watchHandle(fullCart.concat(['x'])); // force watcher
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

	// A reset-able discount messang function (clears timeout on recall)
	var msgPromise;
	var setDisMessage = function(msgObj, delay) {
		discountMsg = msgObj;
		$timeout.cancel( msgPromise );
		msgPromise = $timeout(function() {
			discountMsg = false;
		}, delay);
	};

	// On the fly discount summation
	var discount_total = function() {
		var total = 0;
		angular.forEach(discounts, function(item) {
			total += parseFloat(item.amount);
		});
		return total;
	};

	return {
		load: function() {
			return load_me();
		},
		list: function() {
			return printList; //fullCart;
		},
		total: function() {
			return total - discount_total();
		},
		subTotal: function() {
			return total;
		},
		getOpt: function() {
			return options;
		},
		setOpt: function(opt) {
			options = opt;
		},
		checkout: function(medium) {
			localStorage.setItem('azUArecipt', JSON.stringify(printList)); // store off cart
			localStorage.setItem('azUAreciptTotal', JSON.stringify(total));
			localStorage.setItem('azUAreciptType', medium);
			myCart.clear();
		},
		getRecipt: function() {
			return {
				total: JSON.parse(localStorage.getItem('azUAreciptTotal')),
				list: JSON.parse(localStorage.getItem('azUArecipt')),
				medium: localStorage.getItem('azUAreciptType')
			};
		},
		rem: function(index) {
			obj = fullCart[index];
			myCart.rem(index);

			// look through discounts for same product id's
			var otherProducts = false;
			angular.forEach(fullCart, function(item) {
				if (obj.itemID != item.itemID && obj.productID == item.productID) otherProducts = true;
			});

			// remove discounts that apply directly to the last item removed (and not to others)
			angular.forEach(discounts, function(item, idx) {
				if (item.itemID == obj.itemID) discounts.splice(idx, 1);
				if (!otherProducts && item.productID == obj.productID) discounts.splice(idx, 1);
			});
		},

		// discount public funcitons
		addDiscount: function(code) {
			var isDuplicateCode = false;
			angular.forEach(discounts, function(item) {
				if (item.code == code) isDuplicateCode = true;
			});

			if ( isDuplicateCode ) { // is a duplicate code
				setDisMessage({
					'pre': 'Duplicate Code!',
					'msg': 'Are you trying to cheat us?',
					'type': 'error'
				}, 10000);
			} else { // new discount
				interface.call('getDiscount', {
					'ids': myCart.get(),
					'code':code
				}).then(function(res) {
					setDisMessage(res.data, 10000); // assign a reset-able message
					if (res.data.type == 'success') discounts.push( res.data.obj ); // add object on good callback
				});
			}
		},
		getDiscounts: function() {
			return discounts;
		},
		remDiscount: function(index) {
			discounts.splice(index, 1);
		},
		getDiscountMsg: function() {
			return discountMsg;
		},
		disTotal: function() {
			return discount_total();
		}
	};
}]).

factory('interface', ['$http', function ($http) {

	return {
		// call: function(myClass, myAction, myData) {
		// 	return $http.post('http://uastore.wha.la/interface.php', myData, {params:{a: myAction, c: myClass}});
		// },

		user: function(myAction, myData) {
			return $http.post('http://uastore.wha.la/interface.php', myData, {params:{a: myAction, c: 'user'}});
		},
		cart: function(myAction, myData) {
			return $http.post('http://uastore.wha.la/interface.php', myData, {params:{a: myAction, c: 'cart'}});
		}
	};
}]);

// http://www.codeproject.com/Articles/576246/A-Shopping-Cart-Application-Built-with-AngularJS