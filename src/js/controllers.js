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

controller('CartCtrl', ['$scope', 'myPage', 'myCart', 'security', 'printCart', '$modal', function ($scope, myPage, myCart, security, printCart, $modal) {
	myPage.setTitle("Shopping Cart");

	$scope.myCart = myCart;
	$scope.printList = [];
	$scope.total = 0;
	$scope.options = printCart.getOpt; // load options cashe

	// calculate totals on the fly and specifically for different templates
	var watchHandle = function(newValue) {
		printCart.setOpt($scope.options); // update options store
		$scope.total = 0; // reset total
		$scope.printList = angular.copy(newValue); // assign new list
		$scope.printList.pop(); // remove the concatenated options

		// Compute different costs on cart changes
		$scope.printList.forEach(function(ele) {
			ele.cost.calc = 0;
			switch (ele.template) {
				case 'conference':
					ele.cost.calc = parseFloat(ele.cost.settings.initial); // initial cost always in effect
					if ($scope.options.hasOwnProperty(ele.itemID)) { // apply pricing based on the number of attendees
						var multiply = $scope.options[ele.itemID].attendees.length - parseFloat(ele.cost.settings.after); // how many more
						if (multiply > 0) ele.cost.calc += parseFloat(ele.cost.settings.later) * multiply; // for additional attendees
					}
					break;
				case 'download':
					ele.cost.calc = parseFloat(ele.cost.settings.cost); // straight assignment (no options)
					break;
			}
			$scope.total += ele.cost.calc; // compute total
		});
	};
	$scope.$watch(function() {
		return printCart.list().concat([$scope.options]); // watch for list and option changes
	}, watchHandle, true);

	$scope.showOptions = function(tpl) { // should we show the options button
		var opt = ['conference'];
		return opt.indexOf(tpl) != -1;
	};

	$scope.callOptions = function(tpl, item) {
		if (!$scope.showOptions(tpl)) return; // make sure template is implemented/has dialog

		var modalInstance = $modal.open({
			templateUrl: 'partials/modal-options-' + tpl + '.tpl.html',
			controller: 'CartOptions' + tpl + 'Ctrl',
			resolve: {
				item: function() { return item; },
				opt: function() {
					if ( $scope.options.hasOwnProperty(item.itemID) ) {
						return $scope.options[item.itemID];
					} else {
						return undefined;
					}
				}
			}
		});
		modalInstance.result.then(function( res ){
			$scope.options[item.itemID] = res;
			watchHandle(printCart.list().concat(['x'])); // force update
		});
	};

	$scope.palOut = function() {
		console.log('send to paypal');
	};
	$scope.checkOut = function() {
		console.log('send to check');
	};
}]).

controller('CartOptionsconferenceCtrl', ['$scope', '$modalInstance', 'item', 'opt', function($scope, $modalInstance, item, opt) {
	$scope.item = item;
	$scope.opt = opt || {attendees: [
		{name:'Alfred', phone:'111 222 3333'},
		{name:'Betty', phone:'111 222 3333'},
		{name:'Charles', phone:'111 222 3333'}
	]};
	$scope.total = 0;

	var updatePrice = function() {
		$scope.total = 0;
		for (var i = 0; i < $scope.opt.attendees.length; i++) {
			if ( i === 0 ) {
				$scope.opt.attendees[i].price = parseFloat(item.cost.settings.initial);
			} else if ( i >= parseFloat(item.cost.settings.after) ) {
				$scope.opt.attendees[i].price = parseFloat(item.cost.settings.later);
			} else {
				$scope.opt.attendees[i].price = 0;
			}
			$scope.total += $scope.opt.attendees[i].price;
		}
	};
	updatePrice();

	$scope.ok = function () {
		$modalInstance.close($scope.opt);
	};
	$scope.rem = function(index) {
		$scope.opt.attendees.splice(index,1);
		updatePrice();
	};
	$scope.add = function () {
		$scope.opt.attendees.push({name:'new guy', phone:'111 222 3333'});
		updatePrice();
	};
	$scope.cancel = function () { $modalInstance.dismiss('cancel'); };
}]).

controller('CheckoutCtrl', ['$scope', 'myPage', function ($scope, myPage) {
	myPage.setTitle("Checkout");
}]).

controller('HeadCtrl', ['$scope', 'myPage', 'breadcrumbs', 'myCart', 'security', function ($scope, myPage, breadcrumbs, myCart, security) {
	$scope.myPage = myPage;
	$scope.breadcrumbs = breadcrumbs;
	$scope.myCart = myCart;
	$scope.security = security;
}]).

controller('LististPurchasesCtrl', ['$scope', 'myPage', function ($scope, myPage){
	myPage.setTitle("Previously purchased items");
}]).

controller('CustPayFormCtrl', ['$scope', 'myPage', 'myCart', function ($scope, myPage, myCart){
	myPage.setTitle("Custom Payment Form");

	$scope.myCart = myCart;

	$scope.item = {
		itemID: -1,
		productID: -1,
		name: 'Custom Payment',
		settings: null,
		img: null,
		blurb: 'This is a custom field'
	};
}]).

controller('RegisterFormCtrl', ['$scope', 'myPage', '$modal', 'interface', 'security', function ($scope, myPage, $modal, interface, security){
	myPage.setTitle("Registration Form");

	// initialize empty user
	$scope.user = {
		preName: '',
		firm: {addr: {addrID: null, addr2: null}},
		addr: {addrID: null, addr2: null}
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
	$scope.address = address;
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