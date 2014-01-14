// This file contains a few controllers

angular.module('myApp.controllers', [
	'myApp.services',
	'ui.bootstrap'
]).

controller('IndexCtrl', ['$scope', 'myPage', 'theCart', 'security', function ($scope, myPage, theCart, security) {
	myPage.setTitle("Upstream Academy", "Guiding accounting firms to high performance");

	$scope.$watch(function() {return security.currentUser;}, function() {
		if (security.currentUser !== null) security.redirect('/cart');
	}, true);
	
	$scope.theCart = theCart;
}]).

controller('RegisterConFormCtrl', ['$scope', 'myPage', 'interface', 'conference', '$modal', 'theCart', function ($scope, myPage, interface, conference, $modal, theCart) {
	$scope.con = conference;
	$scope.orig = angular.copy( $scope.con.options );

	var title = ($scope.con.item.template == 'conference') ? "Register" : "Options" ;
	myPage.setTitle(title, "for " + $scope.con.item.name);

	$scope.noFields = ($scope.con.fields.length === 0); // ensure item has quesitions
	if ($scope.noFields) return; // no need to do any further processing if there are no options
	
	$scope.attID = (function() {
		angular.forEach($scope.con.fields, function(value, key) { if (value.name == 'Attendees') attID = value.fieldID; });
		$scope.con.options.attID = attID;
		return attID;
	})();
	if ($scope.attID) $scope.con.options[attID] = []; // set empty attendee array

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
	$scope.equal = function(x,y) { return angular.equals(x,y);};
	$scope.reset = function() { $scope.con.options = angular.copy( $scope.orig ); };

	$scope.save = function( invalid ) {
		console.log(invalid);
		if (invalid) return alert('Form is not valid\nPlease try again.');
		if ($scope.attID && $scope.con.options[ $scope.attID ].length === 0) 
			return alert('Please add at least one Attendee to the conference');
		interface.cart('setOption', $scope.con).then(function() {
			theCart.setDirty();
			$modal.open({
				templateUrl: 'registerConfNextActionTPL.html',
				controller: function ($scope, $modalInstance, $location) {
					$scope.cart = function () {
						$location.path('/cart');
						$modalInstance.dismiss('cancel');
					};
				}
			});
		}, function(obj) {
			console.log(obj);
			alert('Your save was unsuccessful.\nPlease try again or contact UpstreamAcademy for assistance.');
		});
	};
}]).

controller('ContactModalCtrl', ['$scope', '$modalInstance', 'contact', 'prep', 'interface', '$modal', 'opt', '$filter', function ($scope, $modalInstance, contact, prep, interface, $modal, opt, $filter) {
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
	$scope.ok = function ( invalid ) {
		if (invalid) return alert('Form is not valid\nPlease try again.');
		if ($scope.contact.addr.addressID === null) return alert('Please assign an address');

		var query = ($scope.contact.contactID === undefined) ? 'add' : 'edit'; // change add or edit based on existence of contactID
		interface.user(query + 'Contact', $scope.contact).then(function(res) {
			$scope.contact.contactID = JSON.parse(res);
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

controller('CartCtrl', ['$scope', 'myPage', '$modal', 'interface', '$location', 'theCart', 'discounts', '$timeout', function ($scope, myPage, $modal, interface, $location, theCart, discounts, $timeout) {
	myPage.setTitle("Shopping Cart", "Checkout");
	$scope.theCart = theCart;
	$scope.discounts = discounts;
	$scope.discountMsg = false;
	$scope.submitMsg = false;

	var msgPromises = {}; // A reset-able messang function (clears timeout on recall)
	var setMessage = function(myVar, msgObj, delay) {
		$scope[myVar] = msgObj;
		$timeout.cancel( msgPromises[myVar] );
		msgPromises[myVar] = $timeout(function() {
			$scope[myVar] = false;
		}, delay*1000);
	};

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
		var isDuplicateCode = false;
		angular.forEach($scope.discounts, function(item) {
			if (item.code == code) isDuplicateCode = true;
		});
		if ( isDuplicateCode ) { // is a duplicate code
			setMessage('discountMsg', {'pre': 'Duplicate Code!', 'msg': 'Are you trying to cheat us?', 'type': 'error'}, 10);
		} else { // new discount
			interface.cart('addDiscount', {code:code}).then(function(res) {
				setMessage('discountMsg', res, 10); // assign a reset-able message
				if (res.type == 'success') $scope.discounts.push( res.obj ); // add object on good callback
			});
		}
	};
	$scope.remDiscount = function(myDiscount) { // remove discount
		interface.cart('remDiscount', myDiscount).then(function(res) {
			$scope.discounts = res;
		});
	};
	$scope.saveCart = function(medium) { // save price (everything else is already on server)
		var fail = false;
		angular.forEach(theCart.get(), function(item) { // verify options are set
			if ( item.hasOptions && !item.cost.set ) fail = true;
		});
		if (fail) return setMessage('submitMsg', {pre:'Options Needed', msg:'Some of the items in your cart require you to fill out a form. Please click the orange "Set" buttons to assign these options.', type:'error'}, 20);

		angular.forEach(theCart.get(), function(item) { // verify double purchases
			if (item.warn) fail = true;
		});
		if (fail) return setMessage('submitMsg', {pre:'Previous Purchase',msg:'An item in your cart has already been purchased (shown in red).  Please remove it before continueing to checkout.',type:'error'}, 20);

		setMessage('submitMsg', {pre:'Checkout Complete',msg:'You will be redirected to either a) PayPal processing to handle your online payment or b) our recipt page with payment instructions',type:'success'}, 20);
		interface.cart('save', {cost:$scope.total(), medium:medium}).then(function() {
			var returnPath = '/recipt', cart = {
				list: theCart.get(),
				disTotal: $scope.discountTotal(),
				total: $scope.total(),
				medium: medium
			};
			localStorage.setItem('UA-recipt', JSON.stringify( cart )); // store off cart

			if (medium == 'online') { // direct accordingly
				var loc = "https://payflowlink.paypal.com?";
				loc += "LOGIN=UpstreamAcademy&";
				loc += "PARTNER=PayPal&";
				loc += "TYPE=S&";
				loc += "SHOWCONFIRM=FALSE&";
				loc += "AMOUNT=" + cart.total + "&";
				loc += "DESCRIPTION=Upstream Academy Purchase&";
				loc += "MODE=TEST&";
				document.location = loc;
			} else {
				$location.path(returnPath); // go to checkout page
			}
			theCart.setDirty(); // make sure empty cart gets loaded into the system
		});
	};
}]).

controller('ReciptCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	myPage.setTitle("Recipt", "from last purchase");

	$scope.recipt = JSON.parse(localStorage.getItem('UA-recipt'));
}]).

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
			if (res) {
				$scope.success = true;
				$scope.error = false;
				$scope.item = angular.copy(orig);
			} else {
				$scope.error = true;
				$scope.success = false;
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
	$scope.firms = firms;
	$scope.clearFirm = function () { 
		$scope.user.firm = undefined;
		$scope.user.firmModified = false;
	};

	// initialize empty user
	$scope.user = {
		preName: '',
		firm: '',
		firmModified: false
	};
	$scope.modifyFirm = function() { $scope.user.firmModified = true; };

	// Passowrd Requirements
	$scope.req = {pass:false,len:false,spe:false,num:false,alp:false};
	$scope.$watch('user.password', function(value) {
		value = value || ''; // undefined check
		$scope.req.alp = !! value.match(/[a-z]/);
		$scope.req.upa = !! value.match(/[A-Z]/);
		$scope.req.num = !! value.match(/[0-9]/);
		$scope.req.len = !! value.match(/.{6,}/);
		$scope.req.spe = !! value.match(/[^a-zA-Z0-9]/);
		$scope.req.pass = $scope.req.alp && $scope.req.upa && $scope.req.num && $scope.req.spe && $scope.req.len;
	});

	// handle registration clicks
	$scope.register = function( invalid ) {
		if (invalid) return alert('Form is not valid\nPlease try again.');
		if (!$scope.req.pass) return alert('Choose a password that passes all the parameters\nPlease try again.');
		if ($scope.passVerify !== $scope.user.password) return alert('Passwords do not match\nPlease try again.');
		if ($scope.user.firm.addr.addressID === undefined) return alert('Please assign a firm address');
		if ($scope.user.addr.addressID === undefined) return alert('Please assign a user address');
		
		interface.user('addUser', $scope.user).then(function() {
			alert('Your account has successfully been created');
			security.requestCurrentUser();
			// security.redirect('/cart');
			window.history.back(); // go to last page!
		}, function (err) {
			if (err == 'dup') {
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

controller('ModalAddressCtrl', ['$scope', '$modalInstance', 'address', 'interface', function($scope, $modalInstance, address, interface){
	$scope.address = address || {addressID:null, addr2: null};
	$scope.ok = function() {
		// use interface to add/edit address in db
		var fun = ($scope.address.addressID === null) ? 'add' : 'edit' ;
		interface.user(fun + 'Address', $scope.address).then(function (res) {
			console.log(res);
			$scope.address.addressID = JSON.parse(res);
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