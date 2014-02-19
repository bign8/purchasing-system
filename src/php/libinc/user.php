<?php

class User extends NG {

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();

		if ( !isset($_SESSION['user']) ) $_SESSION['user'] = null; // assign empty user if applicable
	}

	public static function process( $action, &$pass, &$data ) {
		$obj = new User();
		switch ( $action ) {
			case 'addAddress':  $data = $obj->addAddress();  break;
			case 'addContact':  $data = $obj->addContact();  break;
			case 'addFirmCode': $data = $obj->addFirmCode(); break;
			case 'addUser':     $data = $obj->addUser();     break;
			case 'checkEmail':  $data = $obj->checkEmail();  break;
			case 'checkReset':  $data = $obj->checkReset();  break;
			case 'currentUser': $data = $obj->currentUser(); break;
			case 'editAddress': $data = $obj->editAddress(); break;
			case 'editContact': $data = $obj->editContact(); break;
			case 'getFirmMem':  $data = $obj->getFirmMem();  break;
			case 'getFullUser': $data = $obj->getFullUser(); break;
			case 'listFirms':   $data = $obj->listFirms();   break;
			case 'login':       $data = $obj->login();       break;
			case 'logout':      $data = $obj->logout();      break;
			case 'prepAtten':   $data = $obj->prepAtten();   break;
			case 'reset':       $data = $obj->reset();       break;
			case 'resetPass':   $data = $obj->resetPass();   break;
			case 'updateUser':  $data = $obj->updateUser();  break;
			default: $pass = false;
		}
	}

	// Worker(security): Implements: returns database user object or null
	protected function getUser( $data ) {
		$user = NULL;
		$STH = $this->db->prepare("SELECT * FROM `contact` WHERE `email`=? AND `pass`=ENCRYPT(?,?) LIMIT 1;");
		if ( $STH->execute( $data->email, $data->password, config::encryptSTR ) && $STH->rowCount() > 0 ) {
			$user = $this->cleanUser($STH->fetch( PDO::FETCH_ASSOC ));
			$updateSTH = $this->db->prepare( "UPDATE `contact` SET lastLogin=NOW(), `resetHash`=NULL, `resetExpires`=NULL WHERE `contactID`=?;" );
			$updateSTH->execute( $user['contactID'] );
		}
		return $user;
	}
	private function cleanUser( $user ) { // helper: getUser + resetPass
		$user['admin'] = $user['isAdmin'] == 'yes';
		unset( $user['pass'], $user['resetHash'], $user['resetExpires'], $user['isAdmin'] );
		return $user;
	}
	/*
	 * Example response
	array(
		'userID' => '1234',
		'email' => 'nwoods@azworld.com',
		'firstName' => 'Nathan', // required for pretty print (login-toolbar directive)
		'lastName' => 'Woods', // required for pretty print (login-toolbar directive)
		'admin' => false // this field is required by angular
	);
	 * ---------------------------------------------------------------------- */

	// Worker(settings/firmCode): adds firm membership to group
	public function addFirmCode() {
		$data = $this->getPostData();
		$user = $this->requiresAuth();
		$existSTH = $this->db->prepare("SELECT * FROM `group` WHERE shortCode=?;"); // check code
		if (!$existSTH->execute( $data->code ) || $existSTH->rowCount() < 1) return $this->conflict('dne');
		$group = $existSTH->fetch( PDO::FETCH_ASSOC );

		$checkSTH = $this->db->prepare("SELECT * FROM `member` WHERE firmID=? AND groupID=?;"); // do we have it?
		if (!$checkSTH->execute( $user['firmID'], $group['groupID'] ) || $checkSTH->rowCount() >= 1) return $this->conflict('dup');

		$insSTH = $this->db->prepare("INSERT INTO `member` (firmID, groupID) VALUES (?, ?);"); // iff not add it
		if (!$insSTH->execute( $user['firmID'], $group['groupID'] )) return $this->conflict();

		$this->addFirmCodeEmail($group, $user);
		return $group;
	}
	private function addFirmCodeEmail($group, $user) { // Helper: addFirmCode
		$firmSTH = $this->db->prepare("SELECT * FROM `firm` WHERE `firmID`=?;");
		$firmSTH->execute($user['firmID']);
		$firm = $firmSTH->fetch( PDO::FETCH_ASSOC );

		$html = <<<HTML
			<p>The firm "{$firm['name']}" ({$firm['website']}) has been added to the group "{$group['name']}".</p>
			<p>The above membership addition was made by the following person</p>
			<table>
				<tr><td>Name</td><td>{$user['legalName']}</td></tr>
				<tr><td>Preferred</td><td>{$user['preName']}</td></tr>
				<tr><td>Title</td><td>{$user['title']}</td></tr>
				<tr><td>Email</td><td>{$user['email']}</td></tr>
				<tr><td>Phone</td><td>{$user['phone']}</td></tr>
			</table>
HTML;
		$mail = new UAMail();
		if (!$mail->notify("UpstreamAcademy New Firm Notification", $html)) $this->conflict('mail');
	}

	// Worker(settings/firmCode): returns firm membership data
	public function getFirmMem() {
		$user = $this->requiresAuth();
		// $memSTH = $this->db->prepare("SELECT g.* FROM `member` m LEFT JOIN `group` g ON m.groupID=g.groupID WHERE `firmID`=?;");
		// if (!$memSTH->execute( $user['firmID'] )) return $this->conflict();
		// return $memSTH->fetchAll( PDO::FETCH_ASSOC );
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
		$user = $this->getUser( $this->getPostData() );
		if (isset($user)) $_SESSION['user'] = $user;
		return $this->currentUser();
	}

	// Worker(security): destroys a particular session
	public function logout() {
		$_SESSION['user'] = NULL;
	}

	// Worker(register): sees if email is in use
	public function checkEmail() {
		$data = $this->getPostData();
		$STH = $this->db->prepare("SELECT * FROM `contact` WHERE `email`=?;");
		if ( !$STH->execute($data->email) || $STH->rowCount() > 0 ) return $this->conflict('dup');
		return 'good';
	}

	// Worker(reset): sends reset emails
	public function reset() {
		$data = $this->getPostData();
		$getSTH = $this->db->prepare("SELECT *, SHA1(CONCAT(email, ?, NOW())) AS newHash FROM `contact` WHERE `email`=?;");
		if (!$getSTH->execute( config::encryptSTR, $data->email ) || $getSTH->rowCount() < 1) return $this->conflict('no-email');
		$user = $getSTH->fetch( PDO::FETCH_ASSOC );

		$setSTH = $this->db->prepare("UPDATE `contact` SET `resetHash`=?, `resetExpires`=NOW() + INTERVAL 3 DAY WHERE `contactID`=?;");
		if (!$setSTH->execute($user['newHash'], $user['contactID'] )) return $this->conflict();

		$html = <<<HTML
			<p>You requested that your payment.upstreamacademy.com account password be reset.  This notice tells you how to do exactly that.</p>
			<p>
				Please navigate to our 
				<a href="http://payment.upstreamacademy.com/reset/{$user['newHash']}">password reset page</a> 
				to assign yourself a new password.
			</p>
			<p>
				If the above link does not work, try navigating to this address manually:
				<b>http://payment.upstreamacademy.com/reset/{$user['newHash']}</b>
			</p>
			<p>
				You have <b>3</b> days to reset your password, after which time, 
				this address becomes invalid and you must restart the password reset process.
			</p>
HTML;
		$mail = new UAMail();
		if (!$mail->sendMsg('Password Reset Instructions (payment.upstreamacademy.com)', $html, $user['email'], $user['legalName'])) $this->conflict('mail');
		return 'sent';
	}

	// Worker(reset): returns user object
	public function checkReset() {
		$data = $this->getPostData();
		$STH = $this->db->prepare("SELECT * FROM `contact` WHERE `resetHash`=? AND `resetExpires` > NOW() LIMIT 0,1;");
		if (!$STH->execute($data->hash)) return $this->conflict();
		return $STH->rowCount();
	}

	// Worker(reset): updates password, and assigns user (logs in)
	public function resetPass() {
		$data = $this->getPostData();
		$getSTH = $this->db->prepare("SELECT * FROM `contact` WHERE `resetHash`=? AND `resetExpires` > NOW() LIMIT 0,1;");
		if (!$getSTH->execute($data->hash) || $getSTH->rowCount() < 1) return $this->conflict();
		$user = $getSTH->fetch( PDO::FETCH_ASSOC );
		$setSTH = $this->db->prepare("UPDATE `contact` SET `lastLogin`=NOW(),`pass`=ENCRYPT(?,?),`resetHash`=NULL,`resetExpires`=NULL WHERE `contactID`=?;");
		if ( !$setSTH->execute( $data->password, config::encryptSTR, $user['contactID'] ) ) return $this->conflict();
		$_SESSION['user'] = $this->cleanUser($user);
		return $_SESSION['user'];
	}

	// Worker: list all firms in db
	public function listFirms() {
		$STH = $this->db->query("SELECT f.firmID, f.name, f.website, a.* FROM `firm` f JOIN `address` a ON f.addressID=a.addressID;");
		$ret = $STH->fetchAll( PDO::FETCH_ASSOC );
		foreach ($ret as &$value) $this->cleanAddress( $value );
		return $ret;
	}
	private function cleanAddress( &$value ) { // Helper (listFirms+getFirmEmploy+getFullUser): formats address for app
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
		return $value;
	}

	// Worker: get data for choosing new attendee
	public function prepAtten() {
		$user = $this->requiresAuth();
		$emp = $this->getFirmEmploy( $user['firmID'] );
		$add = $this->getFirmAddr( $user['firmID'] );
		if ($emp == -1 || $add == -1) return $this->conflict();
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
		$d = $this->getPostData();
		$testSTH = $this->db->prepare("SELECT * FROM `contact` WHERE `email`=?;");
		if (!$testSTH->execute( $d->email )) return $this->conflict();
		if ($testSTH->rowCount() > 0) return $this->conflict('dup');

		$STH = $this->db->prepare("INSERT INTO `contact` (firmID, addressID, legalName, preName, title, email, phone) VALUES (?,?,?,?,?,?,?);");
		if (!$STH->execute( $user['firmID'], $d->addr->addressID, $d->legalName, $d->preName, $d->title, $d->email, $d->phone )) return $this->conflict();
		// send email -> add people to firm
		$contactID = $this->db->lastInsertId();
		$this->addContactToFirmEmail($contactID);
		return $contactID;
	}
	private function addContactToFirmEmail($contactID) {
		$dataSTH = $this->db->prepare("SELECT c.contactID, legalName, preName, title, email, phone, a.*, f.* FROM (SELECT * FROM `contact` WHERE contactID=?) c LEFT JOIN address a on c.addressID = a.addressID LEFT JOIN firm f ON c.firmID = f.firmID;");
		$dataSTH->execute( $contactID );
		$data = $dataSTH->fetch(PDO::FETCH_ASSOC);

		$html = <<<HTML
			<p>The following person has been added to the firm {$data['name']} ({$data['website']})</p>
			<table>
				<tr><th>Property</th><th>Value</th></tr>
				<tr><td>Name</td><td>{$data['legalName']}</td></tr>
				<tr><td>Preferred</td><td>{$data['preName']}</td></tr>
				<tr><td>Title</td><td>{$data['title']}</td></tr>
				<tr><td>Email</td><td>{$data['email']}</td></tr>
				<tr><td>Phone</td><td>{$data['phone']}</td></tr>
				<tr><td>Address</td><td>{$data['addrName']}</td></tr>
				<tr><td>Address 1</td><td>{$data['addr1']}</td></tr>
				<tr><td>Address 2</td><td>{$data['addr2']}</td></tr>
				<tr><td>City</td><td>{$data['city']}</td></tr>
				<tr><td>State</td><td>{$data['state']}</td></tr>
				<tr><td>Zip</td><td>{$data['zip']}</td></tr>
			</table>
HTML;
		$mail = new UAMail();
		if (!$mail->notify("UpstreamAcademy Modify Contact Added to Firm", $html)) $this->conflict('mail');
	}

	// Worker: add contact to system
	public function editContact() {
		$this->requiresAuth();
		$d = $this->getPostData();
		$STH = $this->db->prepare("UPDATE `contact` SET addressID=?, legalName=?, preName=?, title=?, email=?, phone=? WHERE contactID=?;");
		if (!$STH->execute( $d->addr->addressID, $d->legalName, $d->preName, $d->title, $d->email, $d->phone, $d->contactID )) return $this->conflict();
		return $d->contactID;
	}

	// Worker(register + attendee): add an address to the database
	public function addAddress() {
		$d = $this->getPostData();
		$STH = $this->db->prepare("INSERT INTO `address` (addrName, addr1, addr2, city, state, zip) VALUES (?,?,?,?,?,?);");
		if (!$STH->execute( $d->addrName, $d->addr1, $d->addr2, $d->city, $d->state, $d->zip )) return $this->conflict();
		return $this->db->lastInsertId();
	}

	// Worker(register + attendee): add an address to the database
	public function editAddress() {
		$d = $this->getPostData();
		$STH = $this->db->prepare("UPDATE `address` SET addrName=?, addr1=?, addr2=?, city=?, state=?, zip=? WHERE addressID=?;");
		if (!$STH->execute( $d->addrName, $d->addr1, $d->addr2, $d->city, $d->state, $d->zip, $d->addressID )) return $this->conflict();
		return $d->addressID;
	}

	// Worker(app/user): register a user to the database
	public function addUser() {
		$d = $this->getPostData();

		// check to see if user is already in system (email)
		$checkSTH = $this->db->prepare("SELECT * FROM `contact` WHERE email=?;");
		if (!$checkSTH->execute($d->email)) return $this->conflict();
		if ($checkSTH->rowCount() > 0) return $this->conflict('dup');

		// Add/modify firm
		$editFirm = false;
		if (isset($d->firm->firmID)) {
			$editFirm = true;
			$getFirmSTH = $this->db->prepare("SELECT f.firmID, f.name, f.website, a.* FROM `firm` f JOIN `address` a ON f.addressID=a.addressID WHERE `firmID`=?;"); // Get Old data
			$getFirmSTH->execute( $d->firm->firmID );

			$firmSTH = $this->db->prepare("UPDATE `firm` SET `addressID`=?, `name`=?,`website`=? WHERE `firmID`=?");
			if (!$firmSTH->execute($d->firm->addr->addressID, $d->firm->name, $d->firm->website, $d->firm->firmID)) return $this->conflict();
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

		if ($editFirm) {
			$this->modifyFirmEmail($firmID, $getFirmSTH, $_SESSION['user']); // send email
		} else {
			$this->newFirmEmail($firmID, $_SESSION['user']);
		}
		$this->newRegisterEail($_SESSION['user']);
		return true;
	}
	private function newRegisterEail($user) { // helper: addUser
		$html = <<<HTML
			<p>The above user was just created</p>
			<table>
				<tr><td>Name</td><td>{$user['legalName']}</td></tr>
				<tr><td>Preferred</td><td>{$user['preName']}</td></tr>
				<tr><td>Title</td><td>{$user['title']}</td></tr>
				<tr><td>Email</td><td>{$user['email']}</td></tr>
				<tr><td>Phone</td><td>{$user['phone']}</td></tr>
			</table>
HTML;
		$mail = new UAMail();
		if (!$mail->notify("UpstreamAcademy New User Notification", $html)) $this->conflict('mail');
	}

	// Worker: returns full user object
	public function getFullUser() {
		$user = $this->requiresAuth();
		$userSTH = $this->db->prepare("SELECT c.contactID, c.firmID, c.legalName, c.preName, c.title, c.email, c.phone, a.* FROM (SELECT * FROM `contact` WHERE `contactID`=?) c LEFT JOIN `address` a ON c.addressID=a.addressID;");
		// START DEV
		$userSTH = $this->db->prepare("SELECT contactID, firmID, legalName, preName, title, email, phone, a.* FROM (SELECT * FROM `contact` WHERE `contactID`=?) c LEFT JOIN `address` a ON c.addressID=a.addressID;");
		// END DEV
		if (!$userSTH->execute( $user['contactID'] )) return $this->conflict();
		$userData = $this->cleanAddress( $userSTH->fetch( PDO::FETCH_ASSOC ) );
		$firmSTH = $this->db->prepare("SELECT c.firmID, c.name, c.website, a.* FROM (SELECT * FROM `firm` WHERE `firmID`=?) c LEFT JOIN `address` a ON c.addressID=a.addressID;");
		// START DEV
		$firmSTH = $this->db->prepare("SELECT firmID, name, website, a.* FROM (SELECT * FROM `firm` WHERE `firmID`=?) c LEFT JOIN `address` a ON c.addressID=a.addressID;");
		// END DEV
		if (!$firmSTH->execute( $userData['firmID'] )) return $this->conflict();
		$userData['firm'] = $this->cleanAddress( $firmSTH->fetch( PDO::FETCH_ASSOC ) );
		return $userData;
	}

	// Worker: updates fulll user
	public function updateUser() {
		$user = $this->requiresAuth();
		$d = $this->getPostData();

		// check to see if user is already in system (email)
		$checkSTH = $this->db->prepare("SELECT * FROM `contact` WHERE email=? AND contactID!=?;");
		if (!$checkSTH->execute($d->email, $user['contactID'])) return $this->conflict();
		if ($checkSTH->rowCount() > 0) return $this->conflict('dup');

		// Update Password
		if (isset($d->oldPass) && $d->oldPass != '') {
			$chkSTH = $this->db->prepare("SELECT * FROM `contact` WHERE `contactID`=? AND `pass`=ENCRYPT(?,?);");
			if ( $chkSTH->execute( $user['contactID'], $d->oldPass, config::encryptSTR ) && $chkSTH->rowCount() > 0 ) {
				$pasSTH = $this->db->prepare("UPDATE `contact` SET `pass`=ENCRYPT(?,?) WHERE `contactID`=?;");
				if ( !$pasSTH->execute( $d->password, config::encryptSTR, $user['contactID'] ) ) return $this->conflict();
			} else return $this->conflict('badPass');
		}

		// Add/modify firm
		if (isset($d->firm->firmID)) {
			$getFirmSTH = $this->db->prepare("SELECT f.firmID, f.name, f.website, a.* FROM `firm` f JOIN `address` a ON f.addressID=a.addressID WHERE `firmID`=?;"); // Get Old data
			$getFirmSTH->execute( $d->firm->firmID );

			$firmSTH = $this->db->prepare("UPDATE `firm` SET `addressID`=?, `name`=?,`website`=? WHERE `firmID`=?");
			if (!$firmSTH->execute($d->firm->addr->addressID, $d->firm->name, $d->firm->website, $d->firm->firmID)) return $this->conflict();
			$firmID = $d->firm->firmID;

			$this->modifyFirmEmail($firmID, $getFirmSTH, $user); // send email
		} else {
			$firmSTH = $this->db->prepare("INSERT INTO `firm` (addressID, name, website) VALUES (?,?,?);");
			if (!$firmSTH->execute( $d->firm->addr->addressID, $d->firm->name, $d->firm->website )) return $this->conflict();
			$firmID = $this->db->lastInsertId();

			$this->newFirmEmail($firmID, $user);
		}

		// Update Contact
		$userSTH = $this->db->prepare("UPDATE `contact` SET addressID=?,legalName=?,preName=?,title=?,email=?,phone=?,firmID=? WHERE contactID=?;");
		if (!$userSTH->execute($d->addr->addressID, $d->legalName, $d->preName, $d->title, $d->email, $d->phone, $firmID, $d->contactID))
			return $this->conflict();

		// Save user changes
		$STH = $this->db->prepare("SELECT * FROM `contact` WHERE `contactID`=? LIMIT 1;");
		if ( $STH->execute( $user['contactID'] ) && $STH->rowCount() > 0 ) {
			$newUser = $STH->fetch( PDO::FETCH_ASSOC );
			$newUser['admin'] = $newUser['isAdmin'] == 'yes';
			unset( $newUser['pass'], $newUser['resetHash'], $newUser['resetExpires'], $newUser['isAdmin'] );

			$updateSTH = $this->db->prepare( "UPDATE `contact` SET lastLogin=NOW() WHERE `contactID`=?;" );
			$updateSTH->execute( $newUser['contactID'] );
			$this->modifyUserEmail($_SESSION['user'], $newUser);
			$_SESSION['user'] = $newUser;
		}
		return 'check';
	}
	private function newFirmEmail($firmID, $user) { // helper: updateUser + addUser
		$firmSTH = $this->db->prepare("SELECT f.firmID, f.name, f.website, a.* FROM `firm` f JOIN `address` a ON f.addressID=a.addressID WHERE `firmID`=?;");
		$firmSTH->execute($firmID);
		$firm = $firmSTH = $firmSTH->fetch( PDO::FETCH_ASSOC );

		$html = <<<HTML
			<p>The following firm has been created.</p>
			<table>
				<tr><th>Attribute</th><th>Value</th></tr>
				<tr><td>Name</td><td>{$firm['name']}</td></tr>
				<tr><td>Website</td><td>{$firm['website']}</td></tr>
				<tr><td>Address Name</td><td>{$firm['addrName']}</td></tr>
				<tr><td>Address 1</td><td>{$firm['addr1']}</td></tr>
				<tr><td>Address 2</td><td>{$firm['addr2']}</td></tr>
				<tr><td>City</td><td>{$firm['city']}</td></tr>
				<tr><td>State</td><td>{$firm['state']}</td></tr>
				<tr><td>Zip</td><td>{$firm['zip']}</td></tr>
			</table>
			<p>The above firm creation was made by the following person</p>
			<table>
				<tr><td>Name</td><td>{$user['legalName']}</td></tr>
				<tr><td>Preferred</td><td>{$user['preName']}</td></tr>
				<tr><td>Title</td><td>{$user['title']}</td></tr>
				<tr><td>Email</td><td>{$user['email']}</td></tr>
				<tr><td>Phone</td><td>{$user['phone']}</td></tr>
			</table>
HTML;
		$mail = new UAMail();
		if (!$mail->notify("UpstreamAcademy New Firm Notification", $html)) $this->conflict('mail');
	}
	private function modifyFirmEmail($firmID, $oldDataSTH, $user) { // Helper: updatUser + addUser
		$newDataSTH = $this->db->prepare("SELECT f.firmID, f.name, f.website, a.* FROM `firm` f JOIN `address` a ON f.addressID=a.addressID WHERE `firmID`=?;");
		$newDataSTH->execute($firmID);
		$newData = $newDataSTH->fetch(PDO::FETCH_ASSOC);
		$oldData = $oldDataSTH->fetch(PDO::FETCH_ASSOC);

		if (
			$newData['name'] == $oldData['name'] &&
			$newData['website'] == $oldData['website'] &&
			$newData['addressID'] == $oldData['addressID'] &&
			$newData['addrName'] == $oldData['addrName'] &&
			$newData['addr1'] == $oldData['addr1'] &&
			$newData['addr2'] == $oldData['addr2'] &&
			$newData['city'] == $oldData['city'] &&
			$newData['state'] == $oldData['state'] &&
			$newData['zip'] == $oldData['zip']
		) return; // Firm data is the same

		// This is called HEREDOC syntax : http://www.php.net/manual/en/language.types.string.php#language.types.string.syntax.heredoc
		$html = <<<HTML
			<p>The following changes have been made to a firm.</p>
			<table>
				<tr><th>Attribute</th><th>Old Version</th><th>New Version</th></tr>
				<tr><td>Name</td><td>{$oldData['name']}</td><td>{$newData['name']}</td></tr>
				<tr><td>Website</td><td>{$oldData['website']}</td><td>{$newData['website']}</td></tr>
				<tr><td>Address Name</td><td>{$oldData['addrName']}</td><td>{$newData['addrName']}</td></tr>
				<tr><td>Address 1</td><td>{$oldData['addr1']}</td><td>{$newData['addr1']}</td></tr>
				<tr><td>Address 2</td><td>{$oldData['addr2']}</td><td>{$newData['addr2']}</td></tr>
				<tr><td>City</td><td>{$oldData['city']}</td><td>{$newData['city']}</td></tr>
				<tr><td>State</td><td>{$oldData['state']}</td><td>{$newData['state']}</td></tr>
				<tr><td>Zip</td><td>{$oldData['zip']}</td><td>{$newData['zip']}</td></tr>
			</table>
			<p>The above changes were made by the following person</p>
			<table>
				<tr><td>Name</td><td>{$user['legalName']}</td></tr>
				<tr><td>Preferred</td><td>{$user['preName']}</td></tr>
				<tr><td>Title</td><td>{$user['title']}</td></tr>
				<tr><td>Email</td><td>{$user['email']}</td></tr>
				<tr><td>Phone</td><td>{$user['phone']}</td></tr>
			</table>
HTML;
		$mail = new UAMail();
		if (!$mail->notify("UpstreamAcademy Modify Firm Notification", $html)) $this->conflict('mail');
	}
	private function modifyUserEmail($old, $new) {
		if (
			$old['legalName'] == $new['legalName'] &&
			$old['preName'] == $new['preName'] &&
			$old['title'] == $new['title'] &&
			$old['email'] == $new['email'] &&
			$old['phone'] == $new['phone'] &&
			$old['firmID'] == $new['firmID'] &&
			$old['addressID'] == $new['addressID']
		) return; // User hasn't changed

		$dataSTH = $this->db->prepare("SELECT a.*, f.firmID, f.name, f.website FROM `address` a, `firm` f WHERE a.addressID=? AND f.firmID=?;");
		$dataSTH->execute($old['addressID'], $old['firmID']);
		$oldData = $dataSTH->fetch(PDO::FETCH_ASSOC);
		$dataSTH->execute($new['addressID'], $new['firmID']);
		$newData = $dataSTH->fetch(PDO::FETCH_ASSOC);

		$html = <<<HTML
			<p>The following changes have been made to a user</p>
			<table>
				<tr><th>Attribute</th><th>Old Version</th><th>New Version</th></tr>
				<tr><td>Name</td><td>{$old['legalName']}</td><td>{$new['legalName']}</td></tr>
				<tr><td>Preferred</td><td>{$old['preName']}</td><td>{$new['preName']}</td></tr>
				<tr><td>Title</td><td>{$old['title']}</td><td>{$new['title']}</td></tr>
				<tr><td>Email</td><td>{$old['email']}</td><td>{$new['email']}</td></tr>
				<tr><td>Phone</td><td>{$old['phone']}</td><td>{$new['phone']}</td></tr>
				<tr><td>Address Name</td><td>{$oldData['addrName']}</td><td>{$newData['addrName']}</td></tr>
				<tr><td>Address 1</td><td>{$oldData['addr1']}</td><td>{$newData['addr1']}</td></tr>
				<tr><td>Address 2</td><td>{$oldData['addr2']}</td><td>{$newData['addr2']}</td></tr>
				<tr><td>City</td><td>{$oldData['city']}</td><td>{$newData['city']}</td></tr>
				<tr><td>State</td><td>{$oldData['state']}</td><td>{$newData['state']}</td></tr>
				<tr><td>Zip</td><td>{$oldData['zip']}</td><td>{$newData['zip']}</td></tr>
				<tr><td>Firm Name</td><td>{$oldData['name']}</td><td>{$newData['name']}</td></tr>
				<tr><td>Firm Website</td><td>{$oldData['website']}</td><td>{$newData['website']}</td></tr>
			</table>
HTML;
		$mail = new UAMail();
		if (!$mail->notify("UpstreamAcademy Modify User Notification", $html)) $this->conflict('mail');
	}

}