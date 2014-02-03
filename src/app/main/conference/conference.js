angular.module('myApp.main.conference', [
	'ui.bootstrap',
]).

config(['$routeProvider', 'securityAuthorizationProvider', function ( $routeProvider, securityAuthorizationProvider ){
	$routeProvider.when('/conference/:itemID', {
		title: 'Register',
		templateUrl: 'app/main/conference/conference.tpl.html',
		controller: 'RegisterConferenceCtrl',
		resolve: {
			conference: ['interface', '$route', function (interface, $route) {
				return interface.cart('getOption', $route.current.params);
			}],
			user: securityAuthorizationProvider.requireAuthenticatedUser
		}
	});
}]).

controller('RegisterConferenceCtrl', ['$scope', 'myPage', 'interface', 'conference', '$modal', 'theCart', 'appStrings', function ($scope, myPage, interface, conference, $modal, theCart, appStrings) {
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
			templateUrl: 'app/main/conference/modal-contact.tpl.html',
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

directive('uaMagicFormatter', ['$filter', function($filter) {
	var formatters = {
		currency: function(val) {
			var decimal = val.split('.')[1];
			decimal = (decimal === undefined) ? "" : ("." + decimal.substr(0,2)); // decimal formatting
			val = parseInt(val.replace(/[^\d\.]/g,'')); // convert to number
			val = $filter('currency')(val, '$'); // format directly
			val = val.substring(0, val.length-3); // remove decimals
			return val + decimal;
		}
	};
	return {
		restrict: 'A',
		require: '?ngModel',
		link: function(scope, element, attrs, ctrl) {
			ctrl.$parsers.unshift(function(val) {
				val = formatters[ attrs.uaMagicFormatter ]( val );
				return element.val( val ).val();
			});
		}
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
			templateUrl: 'common/modal/address/modal-address.tpl.html',
			controller: 'ModalAddressCtrl',
			resolve: { address: function() { return angular.copy( $scope.contact.addr ); } }
		});
		modalInstance.result.then(function(address) { $scope.contact.addr = address; });
	};
}]);