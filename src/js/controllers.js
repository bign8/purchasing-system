// This file contains a few controllers

angular.module('myApp.controllers', [
	'myApp.services',
	'ui.bootstrap'
]).

controller('IndexCtrl', ['$scope', 'theCart', 'security', function ($scope, theCart, security) {
	$scope.$watch(function() {return security.currentUser;}, function() {
		if (security.currentUser !== null) security.redirect('/cart');
	}, true);
	$scope.theCart = theCart;
}]).

controller('RegisterConFormCtrl', ['$scope', 'myPage', 'interface', 'conference', '$modal', 'theCart', 'appStrings', function ($scope, myPage, interface, conference, $modal, theCart, appStrings) {
	$scope.con = conference;
	$scope.orig = angular.copy( $scope.con.options );
	$scope.message = false;

	var title = ($scope.con.item.template == 'conference') ? "Register" : "Options" ;
	myPage.setTitle(title, "for " + $scope.con.item.name);

	$scope.noFields = ($scope.con.fields.length === 0); // ensure item has quesitions
	if ($scope.noFields) return; // no need to do any further processing if there are no options
	
	$scope.attID = (function() {
		angular.forEach($scope.con.fields, function(value, key) { if (value.name == 'Attendees') attID = value.fieldID; });
		$scope.con.options.attID = attID;
		if (attID) $scope.con.options[attID] = $scope.con.options[attID] || []; // set empty attendee array
		return attID;
	})();

	// Attendee list controls (these will be disabled if $scope.attID is undefined)
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
				prep: ['interface', function(interface) { return interface.user('prepAtten'); }],
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
	$scope.equal = function(x,y) { return angular.equals(x,y);};
	$scope.reset = function() { $scope.con.options = angular.copy( $scope.orig ); };

	$scope.save = function() {
		if ($scope.attID && $scope.con.options[ $scope.attID ].length === 0) {
			$scope.message = appStrings.conference.attendee;
			return;
		}
		interface.cart('setOption', $scope.con).then(function() {
			theCart.setDirty();
			$modal.open({
				templateUrl: 'registerConfNextActionTPL.html',
				controller: ['$scope', '$modalInstance', '$location', function ($scope, $modalInstance, $location) {
					$scope.cart = function () {
						$location.path('/cart');
						$modalInstance.dismiss('cancel');
					};
				}]
			});
			$scope.orig = angular.copy( $scope.con.options );
		}, function() {
			$scope.message = appStrings.conference.error;
		});
	};
}]).

controller('ContactModalCtrl', ['$scope', '$modalInstance', 'contact', 'prep', 'interface', '$modal', 'opt', '$filter', 'appStrings', function ($scope, $modalInstance, contact, prep, interface, $modal, opt, $filter, appStrings) {
	var blankAddr = {addressID:null, addr2:null};
	var oldUserAddr = ( contact && contact.addr.addressID != prep.add.addressID ) ? contact.addr : blankAddr ; // null address handler
	$scope.contact = contact || {addr:blankAddr}; // null contact handler

	// filter list on `opt` (remove already added people)
	$scope.firmEmploy = $filter('filter')(prep.emp, function(item) { // filter here not on template
		var found = false; // http://stackoverflow.com/a/14844516
		angular.forEach(opt, function (obj){ if (!found && obj.contactID == item.contactID ) found = true; });
		return !found;
	});

	// view changing variables
	$scope.addNew = (contact !== undefined) || $scope.firmEmploy.length === 0; // !blank passed contact or no employees left
	$scope.canChange = ($scope.contact.contactID === undefined) && $scope.firmEmploy.length !== 0;

	// for managing same changes
	var tmpAddrID = contact ? contact.addr.addressID : -2 ; // wierd case checking
	$scope.sameAddr = ($scope.contact.addr.addressID == prep.add.addressID); // check if same address
	$scope.$watch('sameAddr', function(value) {
		if (value) {
			if (tmpAddrID != prep.add.addressID) oldUserAddr = $scope.contact.addr; // ensure not firm
			$scope.contact.addr = prep.add;
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
		$scope.sameAddr = (tmpAddrID == prep.add.addressID); // check if same address
		oldUserAddr = $scope.sameAddr ? blankAddr : user.addr ; // clear or assign last
	};
	$scope.choose = function (user, $event) { // chooses a specific user
		$event.preventDefault();
		$modalInstance.close(user);
	};
	$scope.ok = function () {
		if ($scope.contact.addr.addressID === null) {
			$scope.message = appStrings.contact.address;
			return;
		}
		var query = ($scope.contact.contactID === undefined) ? 'add' : 'edit'; // change add or edit based on existence of contactID
		interface.user(query + 'Contact', $scope.contact).then(function(res) {
			$scope.contact.contactID = JSON.parse(res);
			$modalInstance.close( $scope.contact );
		}, function (err) {
			$scope.message = (err == 'dup') ? appStrings.contact.duplicate : appStrings.contact.error;
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

controller('CartCtrl', ['$scope', '$modal', 'interface', '$location', 'theCart', 'discounts', 'appStrings', function ($scope, $modal, interface, $location, theCart, discounts, appStrings) {
	$scope.theCart = theCart;
	$scope.discounts = discounts;
	$scope.discountMsg = false;
	$scope.submitMsg = false;

	theCart.registerObserver(function() { // update discounts with cart updates
		interface.cart('getDiscount').then(function(res) {
			$scope.discounts = res;
		});
		checkWarn();
	});
	var checkWarn = function() {
		var found = false;
		angular.forEach(theCart.get(), function(item) {
			if (item.warn) found = true;
		});
		$scope.submitMsg = (found) ? appStrings.cart.warn : false ;
	};
	checkWarn();

	$scope.total = function() { // Cart total calculation
		return $scope.theCart.total() - $scope.discountTotal();
	};
	$scope.discountTotal = function() { // On the fly discount summation
		var total = 0;
		angular.forEach($scope.discounts, function (item) {
			total += parseFloat( item.amount );
		});
		return total;
	};
	$scope.addDiscount = function(code) { // add discount
		interface.cart('addDiscount', {code:code}).then(function (res) {
			$scope.discountMsg = appStrings.cart.disc_yep; // assign a reset-able message
			$scope.discounts.push( res ); // add object on good callback
		}, function(res) {
			$scope.discountMsg = appStrings.cart['disc_' + res]; // assign a reset-able message
		});
	};
	$scope.remDiscount = function(myDiscount) { // remove discount
		interface.cart('remDiscount', myDiscount).then(function(res) {
			$scope.discounts = res;
		});
	};
	$scope.saveCart = function(medium) { // save price (everything else is already on server)
		if ($scope.total() < 0) {
			$scope.submitMsg = appStrings.cart.negative;
			return;
		}
		var fail = false;
		angular.forEach(theCart.get(), function(item) { // verify options are set
			if ( item.hasOptions && !item.cost.set ) fail = true;
		});
		if (fail) {
			$scope.submitMsg = appStrings.cart.needOpt;
			return;
		}
		angular.forEach(theCart.get(), function(item) { // verify double purchases
			if (item.warn) fail = true;
		});
		if (fail) {
			$scope.submitMsg = appStrings.cart.prevPer;
			return;
		}
		$scope.submitMsg = appStrings.cart.checkOut;
		interface.cart('save', {cost:$scope.total(), medium:medium}).then(function() {
			var cart = {
				list: theCart.get(),
				disTotal: $scope.discountTotal(),
				total: $scope.total(),
				medium: medium
			};
			localStorage.setItem('UA-recipt', JSON.stringify( cart )); // store off cart

			if (medium == 'online') { // direct accordingly
				var obj = appStrings.paypal.uri;
				obj[appStrings.paypal.totalParam] = cart.total;
				document.location = appStrings.paypal.url + '?' + $.param(obj);
			} else {
				$location.path('/recipt'); // go to checkout page
			}
			theCart.setDirty(); // make sure empty cart gets loaded into the system
		});
	};
}]).

controller('ReciptCtrl', ['$scope', function ($scope) {
	$scope.recipt = JSON.parse(localStorage.getItem('UA-recipt'));
}]).

controller('HeadCtrl', ['$scope', 'myPage', 'breadcrumbs', 'theCart', 'security', function ($scope, myPage, breadcrumbs, theCart, security) {
	$scope.myPage = myPage;
	$scope.breadcrumbs = breadcrumbs;
	$scope.theCart = theCart;
	$scope.security = security;
}]).

controller('ListPurchasesCtrl', ['$scope', 'items', '$modal', function ($scope, items, $modal){
	$scope.items = items;
	angular.forEach($scope.items, function(ele) {
		if (ele.stamp) ele.stamp = new Date( ele.stamp );
	});
	$scope.showAttendees = function( item ) {
		$modal.open({
			templateUrl: 'partials/modal-list-attendees.tpl.html',
			controller: 'ModalListAttendeesCtrl',
			resolve: {
				item: function() { return item; }
			}
		});
	};
}]).

controller('ModalListAttendeesCtrl', ['$scope', '$modalInstance', 'item', function ($scope, $modalInstance, item) {
	$scope.item = item;
	$scope.ok = function () { $modalInstance.close('all good'); };
	$scope.cancel = function () { $modalInstance.dismiss('cancel'); };
}]).

controller('CustPayFormCtrl', ['$scope', 'theCart', '$location', 'appStrings', function ($scope, theCart, $location, appStrings){
	var orig = {
		itemID: -1,
		productID: -1,
		name: appStrings.pay.customPayName,
		template: 'custom',
		img: null
	};
	$scope.item = angular.copy(orig);
	$scope.add = function() {
		var promise = theCart.add( $scope.item );
		promise.then(function (res) {
			if (res) {
				$scope.message = appStrings.pay.success;
				$scope.item = angular.copy(orig);
			} else {
				$scope.message = appStrings.pay.failure;
			}
		});
	};
}]).

controller('RegisterFormCtrl', ['$scope', '$modal', 'interface', 'security', 'firms', 'appStrings', function ($scope, $modal, interface, security, firms, appStrings){

	// find firm vs. register
	$scope.firms = firms;
	$scope.clearFirm = function () { 
		$scope.user.firm = '';
		$scope.firmModified = false;
	};

	// initialize empty user
	$scope.user = {
		preName: '',
		firm: ''
	};
	$scope.modifyFirm = function() { $scope.firmModified = true; };

	// handle registration clicks
	$scope.register = function() {
		if ($scope.passVerify !== $scope.user.password) {
			$scope.message = appStrings.register.passMatch;
			return;
		}
		if (($scope.user.firm.addr || {}).addressID === undefined) {
			$scope.message = appStrings.register.firmAddr;
			return;
		}
		if ($scope.user.addr.addressID === undefined) {
			$scope.message = appStrings.register.userAddr;
			return;
		}
		interface.user('addUser', $scope.user).then(function() {
			$scope.message = appStrings.register.success; // some sort of callback on close
			security.requestCurrentUser();
			// security.redirect('/cart');
			window.history.back(); // go to last page!
		}, function (err) {
			$scope.message = (err=='dup') ? appStrings.register.duplicate : appStrings.register.failure ;
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
		var myAddress = (slug == 'firm') ? ($scope.user.firm || {}).addr : $scope.user.addr ;
		
		var modalInstance = $modal.open({ // insterts into db and returns full object
			templateUrl: 'partials/modal-address.tpl.html',
			controller: 'ModalAddressCtrl',
			resolve: { address: function() { return angular.copy( myAddress ); } }
		});
		modalInstance.result.then(function(address) {
			if (slug == 'firm') {
				$scope.user.firm = typeof($scope.user.firm)=='string' ? {name:''} : $scope.user.firm;
				$scope.user.firm.addr = address;
				if ($scope.same) $scope.user.addr = address;
			} else {
				$scope.user.addr = address;
			}
		});
	};
}]).

controller('ResetPassCtrl', ['$scope', 'check', 'security', '$route', 'appStrings', function ($scope, check, security, $route, appStrings) {
	$scope.check = check;
	$scope.user = angular.copy( $route.current.params );
	$scope.message = false;
	$scope.processing = false;

	$scope.changePass = function() {
		$scope.processing = true;
		if ($scope.user.passVerify != $scope.user.password) {
			$scope.message = appStrings.reset.match;
			return;
		}
		security.resetPass($scope.user.hash, $scope.user.password).catch(function() {
			$scope.message = appStrings.reset.error;
			processing = false;
		});
	};
}]).

controller('UserFormCtrl', ['$scope', 'myPage', '$modal', 'interface', 'security', 'user', 'firms', 'groups', 'appStrings', function ($scope, myPage, $modal, interface, security, user, firms, groups, appStrings) {
	myPage.setTitle("Account Settings", "for " + user.legalName);
	$scope.origUser = angular.copy( user );
	$scope.firms = firms;
	$scope.groups = groups;

	var firstLoad = true, oldUserAddr = {addressID:undefined};
	$scope.$watch('same', function(value) {
		if (firstLoad) { firstLoad = false; return; }
		if (value) {
			oldUserAddr = $scope.user.addr;
			$scope.user.addr = $scope.user.firm.addr;
		} else {
			$scope.user.addr = oldUserAddr;
		}
	});
	$scope.$watch('user.firm.addr', function(value) {
		if ($scope.same) $scope.user.addr = value;
	});

	$scope.reset = function() {
		$scope.user = angular.copy( $scope.origUser );
		$scope.same = $scope.user.addr.addressID == $scope.user.firm.addr.addressID;
		$scope.enableFirm = false;
		$scope.passVerify = "";
	};
	$scope.reset();

	$scope.store = function() {
		if ($scope.user.oldPass && $scope.passVerify !== $scope.user.password) {
			$scope.message = appStrings.user.passMatch;
			return;
		}
		if ($scope.user.firm.addr.addressID === undefined) {
			$scope.message = appStrings.user.firmAddr;
			return;
		}
		if ($scope.user.addr.addressID === undefined) {
			$scope.message = appStrings.user.userAddr;
			return;
		}
		
		interface.user('updateUser', $scope.user).then(function() {
			$scope.message = appStrings.user.success; // some sort of callback on close
			security.forceCurrentUser();
			myPage.setTitle("Account Settings", "for " + $scope.user.legalName);
			$scope.origUser = angular.copy( $scope.user );
			$scope.settings.$setPristine(true);
		}, function (err) {
			if (err == 'dup') {
				$scope.message = appStrings.user.dupEmail;
			} else if (err == 'badPass') {
				$socpe.message = appStrings.user.badPass;
			} else {
				$scope.message = appStrings.user.failure;
			}
		});
	};

	$scope.check = function(a, b) { return angular.equals(a, b); };
	$scope.modifyFirm = function() {
		$scope.enableFirm = true;
		$scope.firmNew = "";
	};
	$scope.selectFirm = function() {
		$scope.user.firm = $scope.firmNew;
		$scope.enableFirm = false;
	};
	$scope.newFirm = function() {
		$scope.user.firm = {};
		$scope.enableFirm = false;
	};
	$scope.addFirmCode = function () {
		interface.user('addFirmCode', {code:$scope.firmCode}).then(function (group) {
			console.log('success');
			$scope.groups.push(group);
		}, function (res) {
			if (res == 'dup') {
				$scope.message = appStrings.user.dupCode;
			} else if (res == 'dne') {
				$scope.message = appStrings.user.dneCode;
			} else {
				$scope.message = appStrings.user.errCode;
			}
		});
		$scope.firmCode = '';
		$scope.settings.firmCode.$setPristine();
	};
	$scope.setAddr = function (slug) {
		var myAddress = (slug == 'firm') ? ($scope.user.firm || {}).addr : $scope.user.addr ;
		
		var modalInstance = $modal.open({ // insterts into db and returns full object
			templateUrl: 'partials/modal-address.tpl.html',
			controller: 'ModalAddressCtrl',
			resolve: { address: function() { return angular.copy( myAddress ); } }
		});
		modalInstance.result.then(function(address) {
			if (slug == 'firm') {
				$scope.user.firm = typeof($scope.user.firm)=='string' ? {name:''} : $scope.user.firm;
				$scope.user.firm.addr = address;
				if ($scope.same) $scope.user.addr = address;
			} else {
				$scope.user.addr = address;
			}
		});
	};
}]).

controller('ModalAddressCtrl', ['$scope', '$modalInstance', 'address', 'interface', 'appStrings', function ($scope, $modalInstance, address, interface, appStrings){
	$scope.address = address || {addressID:null, addr2: null};
	$scope.ok = function() {
		// use interface to add/edit address in db
		var fun = ($scope.address.addressID === null) ? 'add' : 'edit' ;
		interface.user(fun + 'Address', $scope.address).then(function (res) {
			$scope.address.addressID = JSON.parse(res);
			$modalInstance.close($scope.address);
		}, function() {
			$scope.message = appStrings.address.error;
		});
	};
	$scope.cancel = function() {
		$modalInstance.dismiss();
	};
}]);