<?php

abstract class NgClass {

	/*
	 *   Angular Security functions
	 * ------------------------------------------------------------------------ */

	// Worker(constructor): initialized session and user object
	function __construct() {
		session_start();
		if ( !isset($_SESSION['user']) ) {
			$_SESSION['user'] = null;
		}
	}

	// Worker(security): Forces Extension: returns user object associated with login information
	abstract protected function getUser( $data );
	/*
	 * Example response
	array(
		'userID' => '1234',
		'email' => 'nwoods@carroll.edu',
		'firstName' => 'Nathan', // required for pretty print (login-toolbar directive)
		'lastName' => 'Woods', // required for pretty print (login-toolbar directive)
		'admin' => false // this field is required by angular
	);
	 * ---------------------------------------------------------------------- */

	// Helper(security): ensures user is authenticated
	protected function requiresAuth() {
		if ( !isset($_SESSION['user']) ) {
			header('HTTP/1.1 401 Unauthorized');
			die( 'no-auth' );
		}
		return $_SESSION['user'];
	}

	// Helper(security) ensures user is administrator
	protected function requiresAdmin() {
		$this->requiresAuth();
		if ( !$_SESSION['user']['admin'] ) {
			header('HTTP/1.1 401 Unauthorized');
			die( 'no-admin' );
		}
		return $_SESSION['user'];
	}

	// Helper(security) grabs user if available
	protected function getCurrentUser() {
		return $_SESSION['user'];
	}

	// Worker(security): returns current user or null
	public function currentUser() {
		return json_encode(array( 'user' => $_SESSION['user'] ) );
	}

	// Worker(security): grabs authentication from child class
	public function login() {
		$data = $this->getPostData();

		$user = $this->getUser( $data ); // Abstract function (See documentation)
		if (isset($user)) {
			$_SESSION['user'] = $user;
		}

		return $this->currentUser();
	}

	// Worker(security): destroys a particular session
	public function logout() {
		session_destroy();
	}

	/*
	 *   Angular Helper functions
	 * ------------------------------------------------------------------------ */

	// Helper(angular): angular data retriever / because angular is wierd
	protected function getPostData() {
		return json_decode(file_get_contents("php://input"));
	}
}
