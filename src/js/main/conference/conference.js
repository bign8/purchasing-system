angular.module('myApp.main.conference', [
	'ui.bootstrap',
]).

config(['$routeProvider', 'securityAuthorizationProvider', function ( $routeProvider, securityAuthorizationProvider ){
	$routeProvider.when('/conference/:itemID', {
		title: 'Register',
		templateUrl: 'js/main/conference/conference.tpl.html',
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
}]);