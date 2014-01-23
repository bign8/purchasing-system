angular.module('myApp.services', [

]).

factory('myPage', ['$rootScope', '$sce', '$route', function( $rootScope, $sce, $route ){
	$rootScope.pageTitle = "Upstream Academy Shop"; // for actual title - https://coderwall.com/p/vcfo4q
	var subTitle = "";

	$rootScope.$on('$routeChangeSuccess', function() {
		$rootScope.pageTitle = $route.current.title || $rootScope.pageTitle;
		subTitle = $route.current.subTitle || '';
	});
	return {
		setTitle: function( newTitle, newSubTitle ){
			$rootScope.pageTitle = newTitle;
			subTitle = newSubTitle || '';
		},
		getHTML: function() {
			return $sce.trustAsHtml($rootScope.pageTitle + ' <small>' + subTitle + '</small>');
		}
	};
}]).

factory('breadcrumbs', ['$rootScope', '$location', 'interface', function ($rootScope, $location, interface) {
	var breadcrumbs = [];

	$rootScope.$on('$routeChangeSuccess', function(event, current) {
		var pathElements = $location.path().split('/'), result = [], i;
		var breadcrumbPath = function (index) {
			return '/' + (pathElements.slice(0, index + 1)).join('/');
		};

		// pretty crumb cash and calling function
		function prettyCrumb(obj) {
			var crumbCashe = JSON.parse(localStorage.getItem('crumbCashe') || "{}");
			if (crumbCashe.hasOwnProperty(obj.path)) { // in in cashe
				obj.name = crumbCashe[obj.path];
			} else { // otherwise
				interface.app('prettyCrumb', obj).then(function (label) {
					crumbCashe[obj.path] = label; // assign cashe
					breadcrumbs[obj.index].name = label; // assign value out
					localStorage.setItem('crumbCashe', JSON.stringify(crumbCashe));
				});
			}
			return obj.name;
		}

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
					path: breadcrumbPath(i),
					index: i, // used for prettyCrumb
				};
				if (!isNaN(parseInt(obj.name))) obj.name = prettyCrumb(obj); // make that ugly (numeric) crumb pretty
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
}]).

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

		$http.post('/interface.php', myData, {params:{c:myClass, a:myFn}}).then(function(obj) {
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
		}
	};
}]).

factory('appStrings', function() {
	var ERROR = 'error', SUCCESS = 'success';
	return {
		ERROR: ERROR,
		SUCCESS: SUCCESS,
		paypal: { // Paypal (this is for the app)
			url: 'https://payflowlink.paypal.com',
			uri: { // used $.param()
				'AMOUNT': '0',
				'DESCRIPTION': 'Upstream Academy Purchase',
				'LOGIN': 'UpstreamAcademy',
				'MODE': 'TEST',
				'PARTNER': 'PayPal',
				'SHOWCONFIRM': 'FALSE',
				'TYPE': 'S'
			},
			totalParam: 'AMOUNT'
		},
		cart: { // Cart Pages
			disc_dup: { // Duplicate Discount (notify object)
				pre: 'Duplicate Code!',
				msg: 'Are you trying to cheat us?',
				type:ERROR
			},
			disc_inv: { // Invalid Discount (notify object)
				pre: 'Invalid!',
				msg: 'Invalid discount code.',
				type:ERROR
			},
			disc_exp: { // Expired Discount (notify object)
				pre: 'Expired!',
				msg: 'This code has expired!',
				type:ERROR
			},
			disc_unr: { // Unrelated Discount (notify object)
				pre: 'Unrelated!',
				msg: 'Not associated with any items in your cart.',
				type:ERROR
			},
			disc_yep: { // Unrelated Discount (notify object)
				pre: 'Success!',
				msg: 'Added discount to current order!',
				type:SUCCESS
			},
			needOpt: { // Options needed (notify object)
				pre: 'Options Needed',
				msg: 'Some of the items in your cart require you to fill out a form. Please click the orange "Set" buttons to assign these options.',
				type:ERROR, delay:20
			},
			prevPur: { // Previous Purchase (notify object)
				pre: 'Previous Purchase',
				msg: 'An item in your cart has already been purchased (shown in red).  Please remove it before continueing to checkout.',
				type:ERROR, delay:20
			},
			chekOut: { // Checkout Complete (notify object)
				pre: 'Checkout Complete',
				msg: 'You will be redirected to either a) PayPal processing to handle your online payment or b) our recipt page with payment instructions',
				type:SUCCESS, delay:20
			},
			negative: { // Negative Cart
				pre: 'Negative Cart',
				msg: 'You have provided informatinon in such a way that we are paying you.  Please contact us directly if we owe you money',
				type:ERROR, delay:20
			}
		},
		contact: { // Modal address form (register/xx > add attendee > add employee)
			address: { // No contact address (notify object)
				pre: 'No address!',
				msg: 'Please assign an address to this new contact.',
				type:ERROR
			},
			error: { // Server error (notify object)
				pre: 'Server error!',
				msg: 'There was an error on our side of things, please try again later or contact us.',
				type:ERROR
			}
		},
		pay: { // Custom payment form
			success: {
				pre:'Thanks!',
				msg:'This custom payment has been added to your cart.',
				type:SUCCESS, delay:5
			},
			failure: { // Server Error
				pre:'Error!', msg:'A payment with this name and value is already in your cart.',
				type:ERROR
			},
			customPayName: 'Custom Payment' // shows up in cart
		},
		register: { // Registration Form
			passMatch: { // Passwords Match
				pre:'Passwords do not match!',
				msg:'Please try again.',
				type:ERROR
			},
			firmAddr: { // Assign Firm Address
				pre:'No firm Address!',
				msg:'Please assign a firm address.',
				type:ERROR
			},
			userAddr: { // Assign User Address
				pre:'No user Address!',
				msg:'Please assign a user address.',
				type:ERROR
			},
			success: { // Account created
				pre:'Success!',
				msg:'Your account has successfully been created',
				type:SUCCESS
			},
			duplicate: { // Duplicate email
				pre:'Duplicate Email!',
				msg:'This email already has an account.  Please click the login button and attempt a password reset.',
				type:ERROR
			},
			failure: { // Server Error
				pre:'Error!',
				msg:'There was an unknown error creating your account.  Please try again or contact Upstream Academy for help.',
				type:ERROR
			}
		},
		user: { // Account settings Form
			passMatch: { // Passwords Match
				pre:'Passwords do not match!',
				msg:'Please try again.',
				type:ERROR
			},
			firmAddr: { // Assign Firm Address
				pre:'No firm Address!',
				msg:'Please assign a firm address.',
				type:ERROR
			},
			userAddr: { // Assign User Address
				pre:'No user Address!',
				msg:'Please assign a user address.',
				type:ERROR
			},
			success: { // Account created
				pre:'Success!',
				msg:'Your account has successfully been created',
				type:SUCCESS
			},
			duplicate: { // Duplicate email
				pre:'Duplicate Email!',
				msg:'This email already has an account. Please click the login button and attempt a password reset.',
				type:ERROR
			},
			badPass: { // Bad password
				pre:'bad Password!',
				msg:'Your password is incorrect. Please try again or attempt to reset you password.',
				type:ERROR
			},
			failure: { // Server Error
				pre:'Error!',
				msg:'There was an unknown error creating your account. Please try again or contact Upstream Academy for help.',
				type:ERROR
			}
		},
		address: {
			error: { // server error
				pre:'Error!',
				msg:'There was an unknown error creating your address.  Please try again or contact Upstream Academy for help.',
				type:ERROR
			}
		}
	};
});

// http://www.codeproject.com/Articles/576246/A-Shopping-Cart-Application-Built-with-AngularJS