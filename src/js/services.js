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

factory('myCart', ['$rootScope', function($rootScope) {
	var cart = JSON.parse(localStorage.azUAcart || '[]');
	var observerCallbacks = []; // Observer Pattern

	var update = function() {
		localStorage.setItem('azUAcart', JSON.stringify(cart));
		angular.forEach(observerCallbacks, function(callback) { // Notify observers
			callback();
		});
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
		contains: function(item) {
			return cart.indexOf(item.itemID) !== -1;
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

factory('printCart', ['interface', 'myCart', function (interface, myCart) {
	var fullCart = [];

	// Nice observer pattern! http://stackoverflow.com/a/17558885
	myCart.registerObserver(load_me);

	function load_me() {
			var promise = interface.call('getCart', {'ids': myCart.get()});
			promise.then(function(response) {
				fullCart = response.data;
			});
			return promise;
	}

	return {
		load: function() {
			return load_me();
		},
		list: function() {
			return fullCart;
		},
		total: function() {
			var tot = 0;
			fullCart.forEach(function(ele){
				tot += parseFloat(ele.cost);
			});
			return tot;
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