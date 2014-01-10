<?php

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

	// Worker(security): returns current user or null
	public function currentUser() {
		return $_SESSION['user'];
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
	}

	// Worker: list all firms in db
	public function listFirms() {
		$STH = $this->db->query("SELECT f.firmID, f.name, f.website, a.* FROM `firm` f JOIN `address` a ON f.addressID=a.addressID;");
		$ret = $STH->fetchAll( PDO::FETCH_ASSOC );
		foreach ($ret as &$value) $this->cleanAddress( $value );
		return $ret;
	}
	private function cleanAddress( &$value ) { // Helper (listFirms + fetFirmEmploy): formats address for app
		$value['addr'] = array(
			'addressID' => $value['addressID'],
			'addrName' => $value['addrName'],
			'addr1' => $value['addr1'],
			'addr2' => $value['addr2'],
			'city' => $value['city'],
			'state' => $value['state'],
			'zip' => $value['zip'],
		);
		unset($value['addressID'], $value['addrName'], $value['addr1'], $value['addr2'], $value['city'], $value['state'], $value['zip']);
	}

	// Worker: get data for choosing new attendee
	public function prepAtten() {
		$user = $this->requiresAuth();
		$emp = $this->getFirmEmploy( $user['firmID'] );
		$add = $this->getFirmAddr( $user['firmID'] );

		if ($emp == -1 || $add == -1) {
			header('HTTP/ 409 Conflict');
			return $this->db->errorInfo();
		}
		return array(
			'emp' => $emp,
			'add' => $add
		);
	}
	private function getFirmEmploy( $firmID ) { // Helper: return firms employees
		$STH = $this->db->prepare("SELECT c.contactID, c.firmID, c.legalName, c.preName, c.title, c.email, c.phone, a.* FROM (SELECT * FROM `contact` WHERE `firmID`=?) c LEFT JOIN `address` a ON c.addressID=a.addressID;");
		if (!$STH->execute( $firmID )) return -1;
		$ret = $STH->fetchAll( PDO::FETCH_ASSOC );
		foreach ($ret as &$value) $this->cleanAddress( $value );
		return $ret;
	}
	private function getFirmAddr( $firmID ) { // Helper: return firms address
		$STH = $this->db->prepare("SELECT a.* FROM `firm` f JOIN `address` a ON f.addressID=a.addressID WHERE f.firmID=?;");
		if (!$STH->execute( $firmID )) return -1;
		return $STH->fetch(PDO::FETCH_ASSOC);
	}

	// Worker: add contact to system
	public function addContact() {
		$user = $this->requiresAuth();
		$data = $this->getPostData();

		$STH = $this->db->prepare("INSERT INTO `contact` (firmID, addressID, legalName, preName, title, email, phone) VALUES (?,?,?,?,?,?,?);");
		if (!$STH->execute( $user['firmID'], $data->addr->addressID, $data->legalName, $data->preName, $data->title, $data->email, $data->phone )) {
			header('HTTP/ 409 Conflict');
			return $this->db->errorInfo();
		}
		return $this->db->lastInsertId();
	}

	// Worker: add contact to system
	public function editContact() {
		$this->requiresAuth();
		$data = $this->getPostData();

		$STH = $this->db->prepare("UPDATE `contact` SET addressID=?, legalName=?, preName=?, title=?, email=?, phone=? WHERE contactID=?;");
		if (!$STH->execute( $data->addr->addressID, $data->legalName, $data->preName, $data->title, $data->email, $data->phone, $data->contactID )) {
			header('HTTP/ 409 Conflict');
			return $this->db->errorInfo();
		}
		return $data->contactID;
	}

	// Worker(register + attendee): add an address to the database
	public function addAddress() {
		$data = $this->getPostData();

		$STH = $this->db->prepare("INSERT INTO `address` (addrName, addr1, addr2, city, state, zip) VALUES (?,?,?,?,?,?);");
		if (!$STH->execute( $data->addrName, $data->addr1, $data->addr2, $data->city, $data->state, $data->zip )) {
			header('HTTP/ 409 Conflict');
			return $this->db->errorInfo();
		}
		return $this->db->lastInsertId();
	}

	// Worker(register + attendee): add an address to the database
	public function editAddress() {
		$data = $this->getPostData();

		$STH = $this->db->prepare("UPDATE `address` SET addrName=?, addr1=?, addr2=?, city=?, state=?, zip=? WHERE addressID=?;");
		if (!$STH->execute( $data->addrName, $data->addr1, $data->addr2, $data->city, $data->state, $data->zip, $data->addressID )) {
			header('HTTP/ 409 Conflict');
			return $this->db->errorInfo();
		}
		return $data->addressID;
	}

	// Worker(app/user): register a user to the database
	public function addUser() {
		$d = $this->getPostData();

		// check to see if user is already in system (email)
		$checkSTH = $this->db->prepare("SELECT * FROM `contact` WHERE email=?;");
		if (!$checkSTH->execute($d->email)) return $this->conflict();
		if ($checkSTH->rowCount() > 0) return $this->conflict('dup');

		// Add/modify firm
		if ($d->firmModified && isset($d->firm->firmID)) {
			$firmSTH = $this->db->prepare("UPDATE `firm` SET `addressID`=?, `name`=?,`website`=? WHERE `firmID`=?");
			if (!$firmSTH->execute($d->firm->addr->addressID, $d->firm->name, $d->firm->website, $d->firm->firmID)) return $this->conflict();
			// TODO: send email
			$firmID = $d->firm->firmID;
		} else {
			$firmSTH = $this->db->prepare("INSERT INTO `firm` (addressID, name, website) VALUES (?,?,?);");
			if (!$firmSTH->execute( $d->firm->addr->addressID, $d->firm->name, $d->firm->website )) return $this->conflict();
			$firmID = $this->db->lastInsertId();
		}

		// Add Contact
		$contSTH = $this->db->prepare("INSERT INTO `contact` (firmID, addressID, legalName, preName, title, email, phone, pass) VALUES (?,?,?,?,?,?,?,ENCRYPT(?,?));");
		if (!$contSTH->execute( $firmID, $d->addr->addressID, $d->legalName, $d->preName, $d->title, $d->email, $d->phone, $d->password, config::encryptSTR )) return $this->conflict();
		$_SESSION['user'] = $this->getUser( $d );
		return true;
	}

}