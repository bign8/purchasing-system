angular.module('security.login.form', [])

// The LoginFormController provides the behavior behind a reusable form to allow users to authenticate.
// This controller and its template (login/form.tpl.html) are used in a modal dialog box by the security service.
.controller('LoginFormController', ['$scope', 'security', function ($scope, security) {
	// The model for this form 
	$scope.user = {};
	$scope.isLogin = true;
	$scope.processing = false; // disable submit when processing
	$scope.success = false;

	// Any error message from failing to login
	$scope.authError = null;

	// The reason that we are being asked to login - for instance because we tried to access something to which we are not authorized
	// We could do something different for each reason here but to keep it simple...
	$scope.authReason = null;
	if ( security.getLoginReason() ) {
		$scope.authReason = ( security.isAuthenticated() ) ?
			"You do not have the necessary access permissions.  Do you want to login as someone else?" :
			"You must be logged in to access this part of the application.";
	}

	// Attempt to authenticate the user specified in the form's model
	$scope.login = function() {
		// Clear any previous security errors
		$scope.authError = null;
		$scope.processing = true;

		// Try to login
		security.login($scope.user.email, $scope.user.password).then(function (loggedIn) {
			if ( !loggedIn ) {
				// If we get here then the login failed due to bad credentials
				$scope.authError = 'Login failed.  Please check your credentials and try again.';
			}
		}, function(x) {
			// If we get here then there was a problem with the login request to the server
			$scope.authError = 'There was a problem with authenticating: ' + x;
		}).finally(function() {
			$scope.processing = false;
		});
	};

	$scope.clearForm = function() {
		$scope.user = {};
	};
	$scope.cancelLogin = function(path) {
		security.cancelLogin(path);
	};
	$scope.register = function() {
		security.register();
	};

	var store = {};
	$scope.setIsLogin = function(value) {
		if (value) {
			$scope.authError = store.err;
			$scope.authReason = store.rea;
		} else {
			store.err = $scope.authError;
			store.rea = $scope.authReason;
			$scope.authError = null;
			$scope.authReason = "Please enter your email.";
		}
		$scope.isLogin = value;
	};

	$scope.reset = function() {
		$scope.processing = true;
		$scope.authError = null;
		security.reset($scope.user.email).then(function() {
			$scope.authReason = "An email will be sent to you with reset instructions.";
			$scope.success = true;
		}, function() {
			$scope.authError = "Your email has not yet been registered.";
		}).finally(function() {
			$scope.processing = false;
		});
	};
}]);