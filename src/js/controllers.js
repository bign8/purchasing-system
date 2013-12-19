// This file contains a few controllers

angular.module('myApp.controllers', [
	'myApp.services',
	'ui.bootstrap'
]).

controller('IndexCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	myPage.setTitle("Upstream Academy", "Guiding accounting firms to high performance");
}]).

controller('ListProdCtrl', ['$scope', 'myPage', 'prodList', function ($scope, myPage, prodList) {
	myPage.setTitle("Our Products", "Some quote about products");

	// Set global passed variables
	prodList.data.forEach(function(ele) {
		// console.log(ele);
		if (ele.img === null) {
			ele.img = 'http://lorempixel.com/360/250/business';
		}
	});
	$scope.products = prodList.data;

	// toggling list view style
	$scope.showAsList = false;

	// list sort
	$scope.sortField = undefined;
	$scope.reverse = false;
	$scope.sort = function (fieldName) {
		if ($scope.sortField === fieldName) {
			$scope.reverse = !$scope.reverse;
		} else {
			$scope.sortField = fieldName;
			$scope.reverse = false;
		}
	};
	$scope.sortIcon = function (fieldName) {
		if ($scope.sortField === fieldName) {
			return $scope.reverse ? 'icon-chevron-down' : 'icon-chevron-up' ;
		} else {
			return '';
		}
	};

	// pagination
	$scope.pageNo = 1;
	$scope.pageSize = 12;

}]).

controller('ListItemCtrl', ['$scope', 'myPage', '$routeParams', 'itemList', 'myCart', function ($scope, myPage, $routeParams, itemList, myCart) {
	myPage.setTitle("Products", $routeParams.prodID);

	// Set global passed variables
	$scope.myCart = myCart;
	itemList.data.forEach(function(ele) {
		if (ele.img === null) {
			ele.img = 'http://lorempixel.com/360/250/business';
		}
	});
	$scope.items = itemList.data;

	// toggling list view style
	$scope.showAsList = false;

	// list sort
	$scope.sortField = undefined;
	$scope.reverse = false;

	$scope.sort = function (fieldName) {
		if ($scope.sortField === fieldName) {
			$scope.reverse = !$scope.reverse;
		} else {
			$scope.sortField = fieldName;
			$scope.reverse = false;
		}
	};

	$scope.sortIcon = function (fieldName) {
		if ($scope.sortField === fieldName) {
			return $scope.reverse ? 'icon-chevron-down' : 'icon-chevron-up' ;
		} else {
			return '';
		}
	};

	// pagination
	$scope.pageNo = 1;
	$scope.pageSize = 12;
}]).

controller('ShowItemCtrl', ['$scope', 'myPage', 'itemDetail', function ($scope, myPage, itemDetail) {
	myPage.setTitle(itemDetail.data.name);

	if (itemDetail.data.img === null) {
		itemDetail.data.img = 'http://lorempixel.com/360/250/business';
	}

	$scope.item = itemDetail.data;
}]).

controller('CartCtrl', ['$scope', 'myPage', 'myCart', 'security', 'printCart', '$modal', 'interface', '$location', function ($scope, myPage, myCart, security, printCart, $modal, interface, $location) {
	myPage.setTitle("Shopping Cart");

	$scope.myCart = myCart;
	$scope.printCart = printCart;
	$scope.printList = [];
	$scope.options = printCart.getOpt(); // load options cashe

	$scope.$watch('options', function(newOptions) { // assign and store options
		printCart.setOpt($scope.options);
	}, true);

	$scope.$watch(function() { // watch and retrieve printCart.list
		return printCart.list();
	}, function(newValue) {
		$scope.printList = newValue;
	}, true);

	$scope.showOptions = function(item) { // should we show the options button
		return item.options > 0;
	};

	$scope.callOptions = function(tpl, item) {
		var modalInstance = $modal.open({
			templateUrl: 'partials/modal-options.tpl.html',
			controller: 'CartOptionCtrl',
			resolve: {
				item: function() { return item; },
				opt: function() {
					return angular.copy( $scope.options[item.itemID] ); // insurance (breaks tie incase of cancel)
				},
				options: function(interface) {
					return interface.call('getItemOptions', item);
				}
			}
		});
		modalInstance.result.then(function( res ){
			$scope.options[item.itemID] = res;
			// watchHandle(printCart.list().concat(['x'])); // force update
		});
	};

	$scope.saveCart = function(medium) {
		// verify options are set
		var fail = false;
		angular.forEach($scope.printList, function(ele) {
			if ( $scope.showOptions(ele) && !$scope.options.hasOwnProperty(ele.itemID) ) {	
				fail = true;
			}
		});
		if (fail) return alert('You need to assign options for each item in your cart.\nPlease try again.');

		// Pre-process data
		var obj = {}; // list:$scope.printList, opt:$scope.options
		angular.forEach($scope.options, function(ele) {
			if (ele.hasOwnProperty('attendees')) { // convert attendee array of obj to attendee array of id's
				var temp = [];
				angular.forEach(ele.attendees, function(att) {
					temp.push(att.contactID);
				});
				ele.attendees = temp;
			}
		});
		angular.forEach($scope.printList, function(ele) { // converting into itemID -> options style array
			obj[ele.itemID] = $scope.options[ele.itemID] || {};
		});

		interface.call('saveCart', {items:obj, medium:medium}).then(function(res) {
			var total = printCart.total();
			printCart.checkout(); // clear cart + archive for callback

			var returnPath = '/cart/recipt';

			if (medium == 'online') {
				var loc = "https://payflowlink.paypal.com?";
				loc += "LOGIN=UpstreamAcademy&";
				loc += "PARTNER=PayPal&";
				loc += "TYPE=S&";
				loc += "SHOWCONFIRM=FALSE&";
				loc += "AMOUNT=" + total + "&";
				loc += "DESCRIPTION=Upstream Academy Purchase&";
				loc += "MODE=TEST&";
				document.location = loc;
			} else {
				$location.path(returnPath); // go to checkout page
			}
		});
	};
}]).

// CartOptionCtrl that loads questions (from db) and sub controller based on template type
controller('CartOptionCtrl', ['$scope', '$modalInstance', '$modal', 'options', 'opt', 'item', function($scope, $modalInstance, $modal, options, opt, item){
	$scope.options = options.data;
	$scope.opt = opt || {};

	$scope.attendees = function(option) {
		var modalInstance = $modal.open({
			templateUrl: 'partials/modal-options-conference.tpl.html',
			controller: 'CartOptionsconferenceCtrl',
			resolve: {
				item: function() { return item; },
				opt: function() {
					if ($scope.opt.attendees) {
						return angular.copy( $scope.opt.attendees );
					} else {
						return undefined;
					}
				}
			}
		});
		modalInstance.result.then(function(res) {
			$scope.opt['+' + option.name] = 'Assigned'; // Added Attendee (allow hidden field to pass)
			$scope.opt.attendees = res;
		});
	};

	$scope.ok = function () { $modalInstance.close($scope.opt); };
	$scope.cancel = function () { $modalInstance.dismiss('cancel'); };
}]).

controller('CartOptionsconferenceCtrl', ['$scope', '$modalInstance', 'item', 'opt', '$modal', function($scope, $modalInstance, item, opt, $modal) {
	$scope.item = item;
	$scope.opt = opt || [];
	$scope.total = 0;

	var updatePrice = function() {
		$scope.total = 0;
		for (var i = 0; i < $scope.opt.length; i++) {
			if ( i === 0 ) {
				$scope.opt[i].price = parseFloat(item.cost.settings.initial);
			} else if ( i >= parseFloat(item.cost.settings.after) ) {
				$scope.opt[i].price = parseFloat(item.cost.settings.later);
			} else {
				$scope.opt[i].price = 0;
			}
			$scope.total += $scope.opt[i].price;
		}
		if ($scope.total === 0) { // cannot have a 0 priced thing (for consistency)
			$scope.total = parseFloat(item.cost.settings.initial);
		}
	};
	updatePrice();

	$scope.ok = function () {
		$modalInstance.close($scope.opt);
	};
	$scope.rem = function(index, $event) {
		$event.preventDefault();
		$scope.opt.splice(index,1);
		updatePrice();
	};
	$scope.add = function () {
		$scope.edit();
	};
	$scope.edit = function (contact) {
		var modalInstance = $modal.open({
			templateUrl: 'partials/modal-contact.tpl.html',
			controller: 'ContactModalCtrl',
			resolve: {
				contact: function() {
					return angular.copy( contact );
				},
				firmAddr: function(interface) {
					return interface.call('getFirmAddr');
				},
				firmEmploy: function(interface) {
					return interface.call('getFirmEmploy');
				}
			}
		});

		modalInstance.result.then(function (modContact) {
			var index = $scope.opt.indexOf(contact);
			if (index === -1) {
				$scope.opt.push(modContact); // {name:'new guy', phone:'111 222 3333'}
			} else {
				$scope.opt[index] = modContact;
			}
			updatePrice();
		});
	};
	$scope.cancel = function () { $modalInstance.dismiss('cancel'); };
}]).

controller('ContactModalCtrl', ['$scope', '$modalInstance', 'contact', 'firmAddr', 'firmEmploy', 'interface', '$modal', function ($scope, $modalInstance, contact, firmAddr, firmEmploy, interface, $modal) {
	var oldUserAddr = {addrID:null, addr2:null}; // null address handler
	$scope.contact = contact || {addr:oldUserAddr}; // null contact handler
	$scope.firmEmploy = firmEmploy.data;

	// for managing same changes
	$scope.sameAddr = true;
	$scope.$watch('sameAddr', function(value) {
		if (value) {
			oldUserAddr = $scope.contact.addr;
			$scope.contact.addr = firmAddr.data;
		} else {
			$scope.contact.addr = oldUserAddr;
		}
	});

	$scope.addNew = (contact!==undefined);
	$scope.canChange = (contact===null);
	$scope.toggle = function () {
		$scope.addNew = !$scope.addNew;
	};
	$scope.choose = function (user) {
		$modalInstance.close(user);
	};
	$scope.ok = function ( invalid ) {
		if (invalid) {
			return alert('Form is not valid\nPlease try again.');
		}
		if ($scope.contact.addr.addrID === null) {
			return alert('Please assign an address');
		}

		// change add or edit based on existence of contactID
		var query = ($scope.contact.contactID === undefined) ? 'add' : 'edit';
		interface.call(query + 'Contact', $scope.contact).then(function(res) {
			$scope.contact.contactID = res.data;
			$modalInstance.close( $scope.contact );
		}, function (err) {
			alert('There was an unknown error adding this user\nPlease try again or contact Upstream Academy for help.');
			console.log(err);
		});
	};

	// handle set address clicks
	$scope.setAddr = function () {
		// open modal here with address form
		// modal insterts into db and returns full object
		
		var modalInstance = $modal.open({
			templateUrl: 'partials/modal-address.tpl.html',
			controller: 'ModalAddressCtrl',
			resolve: {
				address: function() { return angular.copy( $scope.contact.addr ); }
			}
		});

		modalInstance.result.then(function(address) {
			$scope.contact.addr = address;
		});
	};
	$scope.cancel = function () { $modalInstance.dismiss('cancel'); };
}]).

controller('ReciptCtrl', ['$scope', 'myPage', 'printCart', '$location', function ($scope, myPage, printCart, $location) {
	if (printCart.getRecipt().list === null) $location.path('/cart'); // force re-direct
	myPage.setTitle("Checkout Recipt");

	$scope.recipt = printCart.getRecipt();

}]).

controller('HeadCtrl', ['$scope', 'myPage', 'breadcrumbs', 'myCart', 'security', function ($scope, myPage, breadcrumbs, myCart, security) {
	$scope.myPage = myPage;
	$scope.breadcrumbs = breadcrumbs;
	$scope.myCart = myCart;
	$scope.security = security;
}]).

controller('ListPurchasesCtrl', ['$scope', 'myPage', 'items', function ($scope, myPage, items){
	myPage.setTitle("Previous Purchases");
	$scope.items = items.data;
	angular.forEach($scope.items, function(ele) {
		if (ele.stamp) ele.stamp = new Date( ele.stamp );
	});
}]).

controller('CustPayFormCtrl', ['$scope', 'myPage', 'myCart', function ($scope, myPage, myCart){
	myPage.setTitle("Custom Payment Form");

	$scope.myCart = myCart;

	$scope.item = {
		itemID: -1,
		productID: -1,
		name: 'Custom Payment',
		settings: null,
		template: 'custom',
		options: 0,
		img: null,
		blurb: 'This is a custom field'
	};
}]).

controller('RegisterFormCtrl', ['$scope', 'myPage', '$modal', 'interface', 'security', function ($scope, myPage, $modal, interface, security){
	myPage.setTitle("Registration Form");

	// initialize empty user
	$scope.user = {
		preName: '',
		firm: {addr: null},// {addrID: null, addr2: null}
		addr: null // {addrID: null, addr2: null}
	};

	// handle registration clicks
	$scope.register = function( invalid ) {
		if (invalid) {
			return alert('Form is not valid\nPlease try again.');
		}
		if ($scope.passVerify !== $scope.user.password) {
			return alert('Passwords do not match\nPlease try again.');
		}
		if ($scope.user.firm.addr.addrID === null) {
			return alert('Please assign a firm address');
		}
		if ($scope.user.addr.addrID === null) {
			return alert('Please assign a user address');
		}
		interface.call('addUser', $scope.user).then(function() {
			alert('Your account has successfully been created');
			security.requestCurrentUser();
			security.redirect('/cart');
		}, function (err) {
			if (err.data == 'dup') {
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
			} else {
				$scope.user.addr = address;
			}
		});
	};
}]).

controller('ModalAddressCtrl', ['$scope', '$modalInstance', 'address', 'interface', function($scope, $modalInstance, address, interface){
	$scope.address = address || {addrID:null, addr2: null};
	$scope.ok = function() {
		// use interface to add/edit address in db
		var fun = ($scope.address.addrID === null) ? 'add' : 'edit' ;
		interface.call(fun + 'Address', $scope.address).then(function (res) {
			$scope.address.addrID = res.data;
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