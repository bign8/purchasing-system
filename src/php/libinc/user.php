<?php

// require_once('main_include.php');

class User extends NG {

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();

		if ( !isset($_SESSION['user']) ) $_SESSION['user'] = null; // assign empty user if applicable
	}


	// Worker(security): Implements: returns database user object or null
	protected function getUser( $data ) {
		$user = NULL;

		$STH = $this->db->prepare("SELECT * FROM `contact` WHERE `email`=? AND `pass`=ENCRYPT(?,?) LIMIT 1;");
		$STH->execute( $data->email, $data->password, config::encryptSTR );
		if ( $STH->rowCount() > 0 ) {
			$user = $STH->fetch( PDO::FETCH_ASSOC );
			$user['admin'] = $user['isAdmin'] == 'yes';
			unset( $user['pass'], $user['resetHash'], $user['resetExpires'], $user['isAdmin'] );

			$updateSTH = $this->db->prepare( "UPDATE `contact` SET lastLogin=NOW() WHERE `contactID`=?;" );
			$updateSTH->execute( $user['contactID'] );
		}
		return $user;
	}
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

	// Worker(test): tests if user is authenticated
	public function testAuth() {
		$this->requiresAuth();
		return 'hello authenticated user';
	}

	// Worker(test): tests if user is administrator
	public function testAdmin() {
		$this->requiresAdmin();
		return 'hello administrator user';
	}

	// Helper(security): ensures user is authenticated
	public function requiresAuth() {
		if ( !isset($_SESSION['user']) ) {
			header('HTTP/1.1 401 Unauthorized');
			die( 'no-auth' );
		}
		return $_SESSION['user'];
	}

	// Helper(security) ensures user is administrator
	public function requiresAdmin() {
		$this->requiresAuth();
		if ( !$_SESSION['user']['admin'] ) {
			header('HTTP/1.1 401 Unauthorized');
			die( 'no-admin' );
		}
		return $_SESSION['user'];
	}

	// Helper(security) grabs user if available
	public function getCurrentUser() {
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
		$_SESSION['user'] = NULL;
		// session_destroy();
	}

	
	
	// Worker(app/user): add an address to the database
	public function addAddress() {
		$data = $this->getPostData();

		$STH = $this->db->prepare("INSERT INTO `address` (addrName, addr1, addr2, city, state, zip) VALUES (?,?,?,?,?,?);");
		if (!$STH->execute( $data->addrName, $data->addr1, $data->addr2, $data->city, $data->state, $data->zip )) {
			header('HTTP/ 409 Conflict');
			print_r($STH->errorInfo());
		}

		return $this->db->lastInsertId();
	}

	// Worker(app/user): add an address to the database
	public function editAddress() {
		$data = $this->getPostData();

		$STH = $this->db->prepare("UPDATE `address` SET addrName=?, addr1=?, addr2=?, city=?, state=?, zip=? WHERE addressID=?;");
		if (!$STH->execute( $data->addrName, $data->addr1, $data->addr2, $data->city, $data->state, $data->zip, $data->addrID )) {
			header('HTTP/ 409 Conflict');
			print_r($STH->errorInfo());
		}

		return $data->addrID;
	}

	// Worker(app/user): register a user to the database
	public function addUser() {
		$data = $this->getPostData();

		// check to see if user is already in system (email)
		$checkSTH = $this->db->prepare("SELECT * FROM `contact` WHERE email=?;");
		if (!$checkSTH->execute($data->email)) {
			header('HTTP/ 409 Conflict');
			return print_r($STH->errorInfo(), true);
		}
		if ($checkSTH->rowCount() > 0) {
			header('HTTP/ 409 Conflict');
			return 'dup';
		}

		// Add firm
		$firmSTH = $this->db->prepare("INSERT INTO `firm` (addressID, name, website) VALUES (?,?,?);");
		if (!$firmSTH->execute( $data->firm->addr->addrID, $data->firm->name, $data->firm->website )) {
			header('HTTP/ 409 Conflict');
			return print_r($STH->errorInfo(), true);
		}
		$firmID = $this->db->lastInsertId();

		// Add Contact
		$contSTH = $this->db->prepare("INSERT INTO `contact` (firmID, addressID, legalName, preName, title, email, phone, pass) VALUES (?,?,?,?,?,?,?,ENCRYPT(?,?));");
		if (!$contSTH->execute( $firmID, $data->addr->addrID, $data->legalName, $data->preName, $data->title, $data->email, $data->phone, $data->password, config::encryptSTR )) {
			header('HTTP/ 409 Conflict');
			return print_r($STH->errorInfo(), true);
		}

		session_start();
		$_SESSION['user'] = $this->getUser( $data );
		return $this->db->lastInsertId();
	}

	// Worker(app/checkout): return firms address
	public function getFirmAddr() {
		$user = $this->requiresAuth();

		$STH = $this->db->prepare("SELECT a.* FROM `firm` f JOIN `address` a ON f.addressID=a.addressID WHERE f.firmID=?;");
		$STH->execute( $user['firmID'] );

		return json_encode( $STH->fetch(PDO::FETCH_ASSOC) );
	}

	// Worker(app/checkout): return firms employees
	public function getFirmEmploy() {
		$user = $this->requiresAuth();

		$STH = $this->db->prepare("SELECT * FROM `contact` WHERE `firmID`=?;");
		$STH->execute( $user['firmID'] );

		// Clear sensitive data
		$retData = $STH->fetchAll(PDO::FETCH_ASSOC);
		foreach ($retData as &$item) {
			unset( $item['pass'], $item['resetHash'], $item['resetExpires'], $item['isAdmin'], $item['lastLogin'] );
		}
		return json_encode($retData);
		// return json_encode( $STH->fetchAll(PDO::FETCH_ASSOC) );
	}

}