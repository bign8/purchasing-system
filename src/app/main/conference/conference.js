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

controller('RegisterConferenceCtrl', ['$scope', 'myPage', 'interface', 'conference', '$modal', 'theCart', 'appStrings', '$location', function ($scope, myPage, interface, conference, $modal, theCart, appStrings, $location) {
	$scope.con = conference;
	$scope.message = false;

	// Data, pre-processing
	var title = ($scope.con.item.template == 'conference') ? "Register" : "Options" ;
	myPage.setTitle(title, "for " + $scope.con.item.name);
	$scope.noFields = ($scope.con.fields.length === 0); // ensure item has quesitions
	if ($scope.noFields) return $location.path('/cart'); // no need to do any further processing if there are no options
	
	function processAttendees() {
		var attID = null;
		angular.forEach($scope.con.fields, function(value, key) { if (value.name == 'Attendees') attID = value.fieldID; });
		$scope.con.options.attID = attID;
		if (attID) $scope.con.options[attID] = $scope.con.options[attID] || []; // set empty attendee array

		if ($scope.con.item.oldData && $scope.con.item.oldData.hasOwnProperty(attID)) {
			angular.forEach($scope.con.item.oldData, function (value, key) {
				if (key !== attID) $scope.con.options[key] = value;
			});

			angular.forEach($scope.con.item.oldData[attID], function (person) { // add old immutable attendees
				var found = false;
				angular.forEach($scope.con.options[attID], function (checkPerson) { // search for same user (re-edit)
					if (checkPerson.contactID == person.contactID) found = true;
				});
				if (!found) { // if user is not in list, add
					person.immutable = true;
					$scope.con.options[attID].unshift(person);
				}
			});
			$scope.message = appStrings.conference.immutable();
		}
		return attID;
	}
	$scope.attID = processAttendees();

	$scope.orig = angular.copy( $scope.con.options );

	// Attendee list controls (these will be disabled if $scope.attID is undefined)
	$scope.total = 0;
	$scope.computeCost = function(index, person) {
		var cost = 0, s = $scope.con.item.cost.settings;
		if (person.immutable) {
			$scope.total = 0;
			cost = 0;
		} else if ( index === 0 ) {
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
		processAttendees();
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
				opt: function() { return angular.copy( o ); },
				con: function() { return $scope.con; },
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
			$scope.save(true);
		});
	};
	$scope.equal = function(x,y) { return angular.equals(x,y);};
	$scope.reset = function() { $scope.con.options = angular.copy( $scope.orig ); };

	// Overall Controlls
	$scope.save = function(reload) {
		if ($scope.attID && $scope.con.options[ $scope.attID ].length === 0) {
			$scope.message = appStrings.conference.attendee();
			return;
		}
		interface.cart('setOption', $scope.con).then(function() {
			theCart.setDirty();
			if (!reload) $modal.open({
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
			$scope.message = appStrings.conference.error();
		});
	};
}]).

directive('uaImageUpload', [function() {
	return {
		restrict: 'A',
		scope: {
			'uaImageUpload': '='
		},
		templateUrl: 'app/main/conference/image.tpl.html',
		link: function($scope, elem, attrs) {
			$scope.state = ($scope.uaImageUpload) ? 2 : 0;
			$scope.image = $scope.uaImageUpload || false;

			$scope.$watch('uaImageUpload', function (val) {
				if (!val) {
					$scope.state = 0;
					$scope.image = false;
					// TODO: delete image
				}
			});

			var reader = new FileReader();
			reader.onload = function (e) {
				$scope.image = e.target.result;
				$scope.$apply();
			};

			elem.on('change', function() {
				reader.readAsDataURL(elem[0].children[0].children[0].files[0]);
				$scope.setFiles(elem[0].children[0].children[0]);
			});

			$scope.setFiles = function(element) {
				$scope.files = [];
				for (var i = 0; i < element.files.length; i++) $scope.files.push(element.files[i]);
				$scope.progressVisible = false;
				$scope.state = 1;
				$scope.$apply();
			};
			$scope.uploadFile = function() {
				var fd = new FormData();
				for (var i in $scope.files) fd.append("uploadedFile", $scope.files[i]);
				var xhr = new XMLHttpRequest();
				xhr.upload.addEventListener("progress", uploadProgress, false);
				xhr.addEventListener("load", uploadComplete, false);
				xhr.addEventListener("error", uploadFailed, false);
				xhr.addEventListener("abort", uploadCanceled, false);
				xhr.open("POST", "/uploader.php");
				$scope.progressVisible = true;
				xhr.send(fd);
				$scope.progress = 1;
			};
			function uploadProgress(evt) {
				if (evt.lengthComputable) {
					$scope.progress = Math.round(evt.loaded * 100 / evt.total);
				} else {
					$scope.progress = 'unable to compute';
				}
				$scope.$apply();
			}
			function uploadComplete(evt) {
				$scope.image = evt.target.responseText.substring(1);
				$scope.uaImageUpload = $scope.image;
				$scope.progress = 100;
				$scope.files = [];
				$scope.progressVisible = false;
				$scope.state = 2;
				$scope.$apply();
			}
			function uploadFailed(evt) {
				alert("There was an error attempting to upload the file.");
			}
			function uploadCanceled(evt) {
				$scope.progressVisible = false;
				$scope.$apply();
				alert("The upload has been canceled by the user or the browser dropped the connection.");
			}
			$scope.resetImage = function() {
				$scope.state = 0;
				$scope.uaImageUpload = undefined;
				// TODO: delete file on server
			};
		}
	};
}]).

directive('uaMagicFormatter', ['$filter', function ($filter) {
	var formatters = {
		currency: function(val) {
			var decimal = val.split('.')[1];
			decimal = (decimal === undefined) ? "" : ("." + decimal.substr(0,2)); // decimal formatting
			val = parseInt(val.replace(/[^\d\.]/g,'')); // convert to number
			val = $filter('currency')(val, '$'); // format directly
			val = val.substring(0, val.length-3); // remove decimals
			return val + decimal;
		},
		numeric: function(val) {
			val = parseFloat(val.replace(/[^\d\.]/g, ''));
			return isNaN(val) ? '' : val ;
		}
	};
	return {
		restrict: 'A',
		require: '?ngModel',
		link: function(scope, element, attrs, ctrl) {
			ctrl.$parsers.unshift(function(val) {
				if ( formatters.hasOwnProperty( attrs.uaMagicFormatter ) ) val = formatters[ attrs.uaMagicFormatter ]( val );
				return element.val( val ).val();
			});
		}
	};
}]).

controller('ContactModalCtrl', ['$scope', '$modalInstance', 'contact', 'prep', 'interface', '$modal', 'opt', '$filter', 'appStrings', 'con', function ($scope, $modalInstance, contact, prep, interface, $modal, opt, $filter, appStrings, con) {
	var blankAddr = {addressID:null, addr2:null};
	var oldUserAddr = ( contact && contact.addr.addressID != prep.add.addressID ) ? contact.addr : blankAddr ; // null address handler
	$scope.contact = contact || {addr:blankAddr,preName:'',phone:''}; // null contact handler
	$scope.con = con;
	if (!$scope.contact.options) $scope.contact.options = {};

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
		if (!$scope.contact.options) $scope.contact.options = {};
		$scope.forceUpdate = !$scope.forceUpdate;
	};
	$scope.choose = function (user, $event) { // chooses a specific user
		$event.preventDefault();
		$modalInstance.close(user);
	};
	$scope.ok = function () {
		if ($scope.contact.addr.addressID === null) {
			$scope.message = appStrings.contact.address();
			return;
		}
		var query = ($scope.contact.contactID === undefined) ? 'add' : 'edit'; // change add or edit based on existence of contactID
		interface.user(query + 'Contact', $scope.contact).then(function (res) {
			$scope.contact.contactID = JSON.parse(res);
			$modalInstance.close( $scope.contact );
		}, function (err) {
			$scope.message = (err == 'dup') ? appStrings.contact.duplicate() : appStrings.contact.error();
		});
	};
	$scope.setAddr = function () { // open modal here with address form
		var modalInstance = $modal.open({ // modal insterts into db and returns full object
			templateUrl: 'common/modal/address/modal-address.tpl.html',
			controller: 'ModalAddressCtrl',
			resolve: { address: function() { return angular.copy( $scope.contact.addr ); } }
		});
		modalInstance.result.then(function (address) { $scope.contact.addr = address; });
	};
}]).

directive('dbQuestions', ['$sce', function ($sce) {
	return {
		scope: {
			fields: '=',
			options: '=',
			onUser: '=',
			forceUpdate: '=',
		},
		templateUrl: 'app/main/conference/questions.tpl.html',
		link: function ($scope, element, attrs) {

			// Prepare fields
			function prepareFields() {
				angular.forEach($scope.fields, function (value, index) {
					switch (value.type) {

						// Default options
						case 'radioboxes':
							if ($scope.onUser == (value.onUser == 'true'))
								$scope.options[ value.fieldID ] = value.settings[ value.settings.length - 1 ];
							break;
					}
				});
			}
			$scope.$watch('fields', prepareFields);
			$scope.$watch('forceUpdate', prepareFields);

			// Helper for line-breaks
			$scope.trustHTML = function (value) {
				return $sce.trustAsHtml(value);
			};

			// Generic fields helper
			$scope.temp = {};
			$scope.helpers = {
				otherSelect: {
					pre: function(arr) {
						arr = angular.copy( arr );
						arr.push('Other');
						return arr;
					},
					change: function(elem) {
						$scope.helpers.otherSelect.isOther = (elem == 'Other');
					},
					isOther: false
				},
				otherCheckbox: {
					toggle: function(item, fieldID) {
						var arr = [];
						if ($scope.options[fieldID]) arr = $scope.options[fieldID].split(', ');
						var idx = arr.indexOf(item);
						if (idx > -1) {
							arr.splice(idx, 1);
						} else {
							arr.push(item);
						}
						$scope.options[fieldID] = arr.join(', ');
					},
					isSelected: function(item, fieldID) {
						return ($scope.options[fieldID] || '').indexOf(item) > -1;
					},
					other: function(fieldID) {
						var arr = [];
						if ($scope.options[fieldID]) arr = $scope.options[fieldID].split(', ');
						for (var i=0; i<arr.length; i++)
							if (arr[i].substring(0, 7) == 'Other: ')
								arr[i] = 'Other: ' + $scope.temp[fieldID];
						$scope.options[fieldID] = arr.join(', ');
					},
					oToggle: function(fieldID) {
						$scope.temp[fieldID] = $scope.temp[fieldID] || '';
						$scope.helpers.otherCheckbox.toggle('Other: ' + $scope.temp[fieldID], fieldID);
					}
				}
			};
		}
	};
}]);
