// This file contains a few controllers

angular.module('myApp.controllers', [
	'myApp.services',
	'ui.bootstrap'
]).

controller('IndexCtrl', ['$scope', 'myPage', 'theCart', 'security', function ($scope, myPage, theCart, security) {
	myPage.setTitle("Upstream Academy", "Guiding accounting firms to high performance");
	if (security.currentUser !== null) security.redirect('/cart');
	$scope.theCart = theCart;
}]).

controller('RegisterConFormCtrl', ['$scope', 'myPage', 'interface', 'conference', '$modal', function ($scope, myPage, interface, conference, $modal) {
	$scope.con = conference.data;
	// employees = employees.data; // store for later

	var title = ($scope.con.item.template == 'conference') ? "Register" : "Options" ;
	myPage.setTitle(title, "for " + $scope.con.item.name);

	$scope.noFields = ($scope.con.fields.length === 0); // ensure item has quesitions
	if ($scope.noFields) return; // no need to do any further processing if there are no options
	
	$scope.attID = (function() {
		angular.forEach($scope.con.fields, function(value, key) { if (value.name == 'Attendees') found = value.fieldID; });
		return found;
	})();

	// Attendee list controls
	$scope.total = 0;
	$scope.computeCost = function(index) {
		var cost = 0, s = $scope.con.item.cost.settings;
		if ( index === 0 ) {
			cost = parseFloat( s.initial );
			$scope.total = 0;
		} else if ( index >= parseInt( s.after ) ) {
			cost = parseFloat( s.later );
		}
		$scope.total += cost;
		return cost;
	};
	$scope.clr = function() { 
		$scope.con.options[ $scope.attID ] = []; 
		$scope.total = 0; 
	};
	$scope.rem = function(index, $event) {
		$event.preventDefault();
		var o = $scope.con.options[ $scope.attID ];
		o.splice(index,1);
		if (!o.length) $scope.total = 0;
	};
	$scope.add = function() { $scope.edit(); };
	$scope.edit = function(contact) {
		var o = $scope.con.options[ $scope.attID ],
		modalInstance = $modal.open({
			templateUrl: 'partials/modal-contact.tpl.html',
			controller: 'ContactModalCtrl',
			resolve: {
				contact: function() { return angular.copy( contact ); },
				prep: function(interface) { return interface.user('prepAtten'); },
				opt: function() { return angular.copy( o ); }
			}
		});
		modalInstance.result.then(function (modContact) {
			if (!o) o = $scope.con.options[ $scope.attID ] = []; // in case the settings object is empty
			var index = o.indexOf( contact );
			if (index === -1) {
				o.push( modContact );
			} else {
				o[index] = modContact;
			}
		});
	};

	$scope.save = function() {
		console.log('SAVING');
	};
}]).

controller('ContactModalCtrl', ['$scope', '$modalInstance', 'contact', 'prep', 'interface', '$modal', 'opt', '$filter', function ($scope, $modalInstance, contact, prep, interface, $modal, opt, $filter) {
	var blankAddr = {addressID:null, addr2:null};
	var oldUserAddr = ( contact && contact.addr.addressID != prep.data.add.addressID ) ? contact.addr : blankAddr ; // null address handler
	$scope.contact = contact || {addr:blankAddr}; // null contact handler

	// filter list on `opt` (remove already added people)
	$scope.firmEmploy = $filter('filter')(prep.data.emp, function(item) { // filter here not on template
		var found = false; // http://stackoverflow.com/a/14844516
		angular.forEach(opt, function (obj){ if (!found && obj.contactID == item.contactID ) found = true; });
		return !found;
	});

	// view changing variables
	$scope.addNew = (contact !== undefined) || $scope.firmEmploy.length === 0; // !blank passed contact or no employees left
	$scope.canChange = ($scope.contact.contactID === undefined) && $scope.firmEmploy.length !== 0;

	// for managing same changes
	var tmpAddrID = contact ? contact.addr.addressID : -2 ; // wierd case checking
	$scope.sameAddr = ($scope.contact.addr.addressID == prep.data.add.addressID); // check if same address
	$scope.$watch('sameAddr', function(value) {
		if (value) {
			if (tmpAddrID != prep.data.add.addressID) oldUserAddr = $scope.contact.addr; // ensure not firm
			$scope.contact.addr = prep.data.add;
		} else {
			$scope.contact.addr = oldUserAddr;
		}
	});

	$scope.toggle = function () { $scope.addNew = !$scope.addNew; }; // changes view
	$scope.cancel = function () { $modalInstance.dismiss('cancel'); }; // closes the dialog
	$scope.edit = function (user) {
		$scope.contact = user;
		$scope.addNew = true;
		tmpAddrID = user.addr.addressID;
		$scope.sameAddr = (tmpAddrID == prep.data.add.addressID); // check if same address
		oldUserAddr = $scope.sameAddr ? blankAddr : user.addr ; // clear or assign last
	};
	$scope.choose = function (user, $event) { // chooses a specific user
		$event.preventDefault();
		$modalInstance.close(user);
	};
	$scope.ok = function ( invalid ) {
		if (invalid) return alert('Form is not valid\nPlease try again.');
		if ($scope.contact.addr.addressID === null) return alert('Please assign an address');

		var query = ($scope.contact.contactID === undefined) ? 'add' : 'edit'; // change add or edit based on existence of contactID
		interface.user(query + 'Contact', $scope.contact).then(function(res) {
			$scope.contact.contactID = JSON.parse(res.data);
			$modalInstance.close( $scope.contact );
		}, function (err) {
			alert('There was an unknown error adding this user\nPlease try again or contact Upstream Academy for help.');
			console.log(err);
		});
	};
	$scope.setAddr = function () { // open modal here with address form
		var modalInstance = $modal.open({ // modal insterts into db and returns full object
			templateUrl: 'partials/modal-address.tpl.html',
			controller: 'ModalAddressCtrl',
			resolve: { address: function() { return angular.copy( $scope.contact.addr ); } }
		});
		modalInstance.result.then(function(address) { $scope.contact.addr = address; });
	};
}]).

// controller('ListProdCtrl', ['$scope', 'myPage', 'prodList', function ($scope, myPage, prodList) {
// 	myPage.setTitle("Our Products", "Some quote about products");

// 	// Set global passed variables
// 	prodList.data.forEach(function(ele) {
// 		// console.log(ele);
// 		if (ele.img === null) {
// 			ele.img = 'http://lorempixel.com/360/250/business';
// 		}
// 	});
// 	$scope.products = prodList.data;

// 	// toggling list view style
// 	$scope.showAsList = false;

// 	// list sort
// 	$scope.sortField = undefined;
// 	$scope.reverse = false;
// 	$scope.sort = function (fieldName) {
// 		if ($scope.sortField === fieldName) {
// 			$scope.reverse = !$scope.reverse;
// 		} else {
// 			$scope.sortField = fieldName;
// 			$scope.reverse = false;
// 		}
// 	};
// 	$scope.sortIcon = function (fieldName) {
// 		if ($scope.sortField === fieldName) {
// 			return $scope.reverse ? 'icon-chevron-down' : 'icon-chevron-up' ;
// 		} else {
// 			return '';
// 		}
// 	};

// 	// pagination
// 	$scope.pageNo = 1;
// 	$scope.pageSize = 12;

// }]).

// controller('ListItemCtrl', ['$scope', 'myPage', 'itemList', 'myCart', function ($scope, myPage, itemList, myCart) {
// 	myPage.setTitle("Products");

// 	// Set global passed variables
// 	$scope.myCart = myCart;
// 	itemList.data.forEach(function(ele) {
// 		if (ele.img === null) {
// 			ele.img = 'http://lorempixel.com/360/250/business';
// 		}
// 	});
// 	$scope.items = itemList.data;

// 	// toggling list view style
// 	$scope.showAsList = false;

// 	// list sort
// 	$scope.sortField = undefined;
// 	$scope.reverse = false;

// 	$scope.sort = function (fieldName) {
// 		if ($scope.sortField === fieldName) {
// 			$scope.reverse = !$scope.reverse;
// 		} else {
// 			$scope.sortField = fieldName;
// 			$scope.reverse = false;
// 		}
// 	};

// 	$scope.sortIcon = function (fieldName) {
// 		if ($scope.sortField === fieldName) {
// 			return $scope.reverse ? 'icon-chevron-down' : 'icon-chevron-up' ;
// 		} else {
// 			return '';
// 		}
// 	};

// 	// pagination
// 	$scope.pageNo = 1;
// 	$scope.pageSize = 12;
// }]).

// controller('ShowItemCtrl', ['$scope', 'myPage', 'itemDetail', function ($scope, myPage, itemDetail) {
// 	myPage.setTitle(itemDetail.data.name);

// 	if (itemDetail.data.img === null) {
// 		itemDetail.data.img = 'http://lorempixel.com/360/250/business';
// 	}

// 	$scope.item = itemDetail.data;
// }]).

controller('CartCtrl', ['$scope', 'myPage', 'security', '$modal', 'interface', '$location', 'theCart', function ($scope, myPage, security, $modal, interface, $location, theCart) {
	myPage.setTitle("Shopping Cart");

	$scope.theCart = theCart;

// 	$scope.myCart = myCart;
// 	$scope.printCart = printCart;
// 	$scope.printList = [];
// 	$scope.options = printCart.getOpt(); // load options cashe

// 	$scope.$watch('options', function(newOptions) { // assign and store options
// 		printCart.setOpt($scope.options);
// 	}, true);

// 	$scope.$watch(function() { // watch and retrieve printCart.list
// 		return printCart.list();
// 	}, function(newValue) {
// 		$scope.printList = newValue;
// 	}, true);

// 	$scope.showOptions = function(item) { // should we show the options button
// 		return item.options > 0;
// 	};

// 	$scope.callOptions = function(tpl, item) {
// 		var modalInstance = $modal.open({
// 			templateUrl: 'partials/modal-options.tpl.html',
// 			controller: 'CartOptionCtrl',
// 			resolve: {
// 				item: function() { return item; },
// 				opt: function() {
// 					return angular.copy( $scope.options[item.itemID] ); // insurance (breaks tie incase of cancel)
// 				},
// 				options: function(interface) {
// 					return interface.call('getItemOptions', item);
// 				}
// 			}
// 		});
// 		modalInstance.result.then(function( res ){
// 			$scope.options[item.itemID] = res;
// 			// watchHandle(printCart.list().concat(['x'])); // force update
// 		});
// 	};

// 	$scope.saveCart = function(medium) {
// 		// verify options are set
// 		var fail = false;
// 		angular.forEach($scope.printList, function(ele) {
// 			if ( $scope.showOptions(ele) && !$scope.options.hasOwnProperty(ele.itemID) ) {	
// 				fail = true;
// 			}
// 		});
// 		if (fail) return alert('You need to assign options for each item in your cart.\nPlease try again.');

// 		// Pre-process data
// 		var obj = {}; // list:$scope.printList, opt:$scope.options
// 		angular.forEach($scope.options, function(ele) {
// 			if (ele.hasOwnProperty('attendees')) { // convert attendee array of obj to attendee array of id's
// 				var temp = [];
// 				angular.forEach(ele.attendees, function(att) {
// 					temp.push(att.contactID);
// 				});
// 				ele.attendees = temp;
// 			}
// 		});
// 		angular.forEach($scope.printList, function(ele) { // converting into itemID -> options style array
// 			// obj[ele.itemID] = $scope.options[ele.itemID] || ele.settings || {};
// 			obj[ele.itemID] = { // Proposed change, send options and element
// 				opt: $scope.options[ele.itemID] || {},
// 				ele: ele
// 			};
// 		});

// 		interface.call('saveCart', {items:obj, medium:medium}).then(function(res) {
// 			var total = printCart.total();
// 			printCart.checkout(medium); // clear cart + archive for callback

// 			var returnPath = '/cart/recipt';

// 			if (medium == 'online') {
// 				var loc = "https://payflowlink.paypal.com?";
// 				loc += "LOGIN=UpstreamAcademy&";
// 				loc += "PARTNER=PayPal&";
// 				loc += "TYPE=S&";
// 				loc += "SHOWCONFIRM=FALSE&";
// 				loc += "AMOUNT=" + total + "&";
// 				loc += "DESCRIPTION=Upstream Academy Purchase&";
// 				loc += "MODE=TEST&";
// 				document.location = loc;
// 			} else {
// 				$location.path(returnPath); // go to checkout page
// 			}
// 		});
// 	};
}]).

// // CartOptionCtrl that loads questions (from db) and sub controller based on template type
// controller('CartOptionCtrl', ['$scope', '$modalInstance', '$modal', 'options', 'opt', 'item', function($scope, $modalInstance, $modal, options, opt, item){
// 	$scope.options = options.data;
// 	$scope.opt = opt || {};

// 	$scope.attendees = function(option) {
// 		var modalInstance = $modal.open({
// 			templateUrl: 'partials/modal-options-conference.tpl.html',
// 			controller: 'CartOptionsconferenceCtrl',
// 			resolve: {
// 				item: function() { return item; },
// 				opt: function() {
// 					if ($scope.opt.attendees) {
// 						return angular.copy( $scope.opt.attendees );
// 					} else {
// 						return undefined;
// 					}
// 				}
// 			}
// 		});
// 		modalInstance.result.then(function(res) {
// 			var out = '';
// 			angular.forEach(res, function(ele) { out += ', ' + ele.legalName; });
// 			$scope.opt['+' + option.name] = out.substr(2); // Added Attendee (allow hidden field to pass)
// 			$scope.opt.attendees = res;
// 		});
// 	};

// 	$scope.ok = function () { $modalInstance.close($scope.opt); };
// 	$scope.cancel = function () { $modalInstance.dismiss('cancel'); };
// }]).

// controller('CartOptionsconferenceCtrl', ['$scope', '$modalInstance', 'item', 'opt', '$modal', function($scope, $modalInstance, item, opt, $modal) {
// 	$scope.item = item;
// 	$scope.opt = opt || [];
// 	$scope.total = 0;

// 	var updatePrice = function() {
// 		$scope.total = 0;
// 		for (var i = 0; i < $scope.opt.length; i++) {
// 			if ( i === 0 ) {
// 				$scope.opt[i].price = parseFloat(item.cost.settings.initial);
// 			} else if ( i >= parseFloat(item.cost.settings.after) ) {
// 				$scope.opt[i].price = parseFloat(item.cost.settings.later);
// 			} else {
// 				$scope.opt[i].price = 0;
// 			}
// 			$scope.total += $scope.opt[i].price;
// 		}
// 		if ($scope.total === 0) { // cannot have a 0 priced thing (for consistency)
// 			$scope.total = parseFloat(item.cost.settings.initial);
// 		}
// 	};
// 	updatePrice();

// 	$scope.ok = function () {
// 		$modalInstance.close($scope.opt);
// 	};
// 	$scope.rem = function(index, $event) {
// 		$event.preventDefault();
// 		$scope.opt.splice(index,1);
// 		updatePrice();
// 	};
// 	$scope.add = function () {
// 		$scope.edit();
// 	};
// 	$scope.edit = function (contact) {
// 		var modalInstance = $modal.open({
// 			templateUrl: 'partials/modal-contact.tpl.html',
// 			controller: 'ContactModalCtrl',
// 			resolve: {
// 				contact: function() {
// 					return angular.copy( contact );
// 				},
// 				firmAddr: function(interface) {
// 					return interface.call('getFirmAddr');
// 				},
// 				firmEmploy: function(interface) {
// 					return interface.call('getFirmEmploy');
// 				},
// 				opt: function() {
// 					return angular.copy( $scope.opt );
// 				}
// 			}
// 		});

// 		modalInstance.result.then(function (modContact) {
// 			var index = $scope.opt.indexOf(contact);
// 			if (index === -1) {
// 				$scope.opt.push(modContact); // {name:'new guy', phone:'111 222 3333'}
// 			} else {
// 				$scope.opt[index] = modContact;
// 			}
// 			updatePrice();
// 		});
// 	};
// 	$scope.cancel = function () { $modalInstance.dismiss('cancel'); };

// 	if (!$scope.opt.length) $scope.add(); // open add dialog on empty attendee list
// }]).

// controller('ReciptCtrl', ['$scope', 'myPage', 'printCart', '$location', function ($scope, myPage, printCart, $location) {
// 	if (printCart.getRecipt().list === null) $location.path('/cart'); // force re-direct
// 	myPage.setTitle("Checkout Recipt");

// 	$scope.recipt = printCart.getRecipt();

// }]).

controller('HeadCtrl', ['$scope', 'myPage', 'breadcrumbs', 'theCart', 'security', function ($scope, myPage, breadcrumbs, theCart, security) {
	$scope.myPage = myPage;
	$scope.breadcrumbs = breadcrumbs;
	$scope.theCart = theCart;
	$scope.security = security;
}]).

// controller('ListPurchasesCtrl', ['$scope', 'myPage', 'items', '$modal', function ($scope, myPage, items, $modal){
// 	myPage.setTitle("Previous Purchases");
// 	$scope.items = items.data;
// 	angular.forEach($scope.items, function(ele) {
// 		if (ele.stamp) ele.stamp = new Date( ele.stamp );
// 	});

// 	$scope.showAttendees = function( item ) {
// 		$modal.open({
// 			templateUrl: 'partials/modal-list-attendees.tpl.html',
// 			controller: 'ModalListAttendeesCtrl',
// 			resolve: {
// 				item: function() { return item; }
// 			}
// 		});
// 	};
// }]).

// controller('ModalListAttendeesCtrl', ['$scope', '$modalInstance', 'item', function($scope, $modalInstance, item) {
// 	$scope.item = item;
// 	$scope.ok = function () { $modalInstance.close('all good'); };
// 	$scope.cancel = function () { $modalInstance.dismiss('cancel'); };
// }]).

controller('CustPayFormCtrl', ['$scope', 'myPage', 'theCart', '$location', '$timeout', function ($scope, myPage, theCart, $location, $timeout){
	myPage.setTitle("Custom Payment Form");

	$scope.success = $scope.error = false;
	var timer = 0;

	var orig = {
		itemID: -1,
		productID: -1,
		name: 'Custom Payment',
		template: 'custom',
		img: null
	};
	$scope.item = angular.copy(orig);

	$scope.add = function() {
		var promise = theCart.add( $scope.item );
		promise.then(function (res) {
			if (res.data == 'false') {
				$scope.error = true;
				$scope.success = false;
			} else {
				$scope.success = true;
				$scope.error = false;
				$scope.item = angular.copy(orig);
			}

			$timeout.cancel(timer);
			timer = $timeout(function() {
				$scope.success = $scope.error = false;
			}, 5000);
		});
	};
}]).

controller('RegisterFormCtrl', ['$scope', 'myPage', '$modal', 'interface', 'security', 'firms', function ($scope, myPage, $modal, interface, security, firms){
	myPage.setTitle("Registration Form");

	// find firm vs. register
	$scope.firms = firms.data;
	$scope.clearFirm = function () { $scope.user.firm = undefined; };


	// initialize empty user
	$scope.user = {
		preName: ''
	};

	// handle registration clicks
	$scope.register = function( invalid ) {
		if (invalid) {
			return alert('Form is not valid\nPlease try again.');
		}
		if ($scope.passVerify !== $scope.user.password) {
			return alert('Passwords do not match\nPlease try again.');
		}
		if ($scope.user.firm.addr.addressID === undefined) {
			return alert('Please assign a firm address');
		}
		if ($scope.user.addr.addressID === undefined) {
			return alert('Please assign a user address');
		}
		interface.user('addUser', $scope.user).then(function() {
			alert('Your account has successfully been created');
			security.requestCurrentUser();
			security.redirect('/cart');
		}, function (err) {
			if (err.data == '"dup"') {
				alert('This email already has an account\nPlease click the login button and attempt a password reset.');
			} else {
				alert('There was an unknown error creating your account\nPlease try again or contact Upstream Academy for help.');
			}
			console.log(err);
		});
	};

	// For same address handling
	$scope.same = false;
	var firstLoad = true, oldUserAddr = null;
	$scope.$watch('same', function(value) {
		if (firstLoad) {
			firstLoad = false;
			return;
		}
		if (value) {
			oldUserAddr = $scope.user.addr;
			$scope.user.addr = $scope.user.firm.addr;
		} else {
			$scope.user.addr = oldUserAddr;
		}
	});

	// handle set address clicks
	$scope.setAddr = function (slug) {
		// open modal here with address form
		// modal insterts into db and returns full object
		var myAddress = (slug == 'firm') ? $scope.user.firm.addr : $scope.user.addr ;
		
		var modalInstance = $modal.open({
			templateUrl: 'partials/modal-address.tpl.html',
			controller: 'ModalAddressCtrl',
			resolve: {
				address: function() { return angular.copy( myAddress ); }
			}
		});

		modalInstance.result.then(function(address) {
			if (slug == 'firm') {
				$scope.user.firm.addr = address;
				if ($scope.same) $scope.user.addr = address;
			} else {
				$scope.user.addr = address;
			}
		});
	};
}]).

controller('ModalAddressCtrl', ['$scope', '$modalInstance', 'address', 'interface', function($scope, $modalInstance, address, interface){
	$scope.address = address || {addressID:null, addr2: null};
	$scope.ok = function() {
		// use interface to add/edit address in db
		var fun = ($scope.address.addressID === null) ? 'add' : 'edit' ;
		interface.user(fun + 'Address', $scope.address).then(function (res) {
			$scope.address.addressID = JSON.parse(res.data);
			$modalInstance.close($scope.address);
		}, function (err) {
			console.log(err);
			console.log("There has been an error adding you address\nPlease try again or contact Upstream Academy for further assistance");
		});
	};
	$scope.cancel = function() {
		$modalInstance.dismiss();
	};
}]);