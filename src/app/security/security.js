// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('security.service', [
	'security.retryQueue', // Keeps track of failed requests that need to be retried once the user logs in
	'security.login', // Contains the login form template and controller
	'ui.bootstrap',
	'myApp.common.services'
]).

factory('security', ['$http', '$q', '$location', 'securityRetryQueue', '$modal', 'interface', function($http, $q, $location, queue, $modal, interface) {

	// Redirect to the given url (defaults to '/')
	function redirect(url) {
		url = url || '/noAuth';
		$location.path(url);
	}

	// Login form dialog stuff
	var loginModal = null;
	function openLoginDialog() {
		if ( loginModal ) {
			throw new Error('Trying to open a dialog that is already open!');
		}
		loginModal = $modal.open({
			templateUrl: 'app/security/login/form.tpl.html',
			controller: 'LoginFormController',
			backdrop: 'static'
		});
		loginModal.result.then(onLoginDialogClose);
	}
	function closeLoginDialog(success) {
		if (loginModal) {
			loginModal.close(success);
		}
	}
	function onLoginDialogClose(success) {
		loginModal = null;
		if ( success ) {
			queue.retryAll();
		} else {
			queue.cancelAll();
			redirect();
		}
	}

	// Register a handler for when an item is added to the retry queue
	queue.onItemAddedCallbacks.push(function(retryItem) {
		if ( queue.hasMore() ) {
			service.showLogin();
		}
	});

	// The public API of the service
	var service = {

		// Get the first reason for needing a login
		getLoginReason: function() {
			return queue.retryReason();
		},

		// Show the modal login dialog
		showLogin: function() {
			openLoginDialog();
		},

		// Attempt to authenticate a user by the given email and password
		login: function(email, password) {
			var request = interface.user('login', {email: email, password: password});
			return request.then(function(user) {
				service.currentUser = user;
				if ( service.isAuthenticated() ) {
					closeLoginDialog(true);
				}
				return service.isAuthenticated();
			});
		},

		// Give up trying to login and clear the retry queue
		cancelLogin: function() {
			closeLoginDialog(false);
			redirect();
		},

		// Logout the current user and redirect
		logout: function(redirectTo) {
			interface.user('logout').then(function() {
				service.currentUser = null;
				redirect(redirectTo);
			});
		},

		register: function() {
			loginModal.dismiss();
			loginModal = null;
			redirect('/register');
		},

		reset: function(email) {
			var request = interface.user('reset', {email: email});
			return request;
		},

		resetPass: function(hash, pass) {
			var request = interface.user('resetPass', {hash: hash, password: pass});
			request.then(function (user){
				service.currentUser = user;
				redirect('/');
			});
			return request;
		},

		// Ask the backend to see if a user is already authenticated - this may be from a previous session.
		requestCurrentUser: function() {
			return service.isAuthenticated() ? $q.when(service.currentUser) : service.forceCurrentUser();
		},

		forceCurrentUser: function() {
			return interface.user('currentUser').then(function(user) {
				service.currentUser = user;
				return service.currentUser;
			});
		},

		// Information about the current user
		currentUser: null,

		// Is the current user authenticated?
		isAuthenticated: function(){
			return !!service.currentUser;
		},
		
		// Is the current user an adminstrator?
		isAdmin: function() {
			return !!(service.currentUser && service.currentUser.admin);
		},

		// wanted simple redirect script
		redirect: function(url) {
			redirect(url);
		}
	};

	return service;
}]);