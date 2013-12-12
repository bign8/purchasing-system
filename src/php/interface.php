<?php

// Handle cross site stuff (for development)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

require_once('./libinc/main_include.php');

/*
 *  Application Class (conditionally run script subsets)
 * ------------------------------------------------------- */

class formsManager extends NgClass {
	private $db;

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();
		$this->db = new myPDO();
	}

	// Worker(security): Implements Abstract: returns database user object or null
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

	// Main application funcitons

	// Worker(app): returns product list
	public function getProducts() {
		$STH = $this->db->query("SELECT * FROM `product` WHERE visible = 'yes';");
		return json_encode($STH->fetchAll(PDO::FETCH_ASSOC));
	}

	// Helper(app): returns interpolated item (see: https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-3-logger-interface.md)
	private function interpolate( $message, array $context = array()) {
		// build a replacement array with braces around the context keys
		$replace = array();
		foreach ($context as $key => $val) {
			$replace['{' . $key . '}'] = $val;
		}

		// interpolate replacement values into the message and return
		return strtr($message, $replace);
	}

	// Helper(app): return cost for a productID
	private function getProductCost( $productID ) {
		$user = $this->getCurrentUser(); // TODO: use this to adjust price as it is set

		$costSTH = $this->db->prepare("SELECT settings, pretty FROM `price` p JOIN `option` o ON o.optionID = p.optionID WHERE productID = ?;");
		$costSTH->execute( $productID );
		$costRow = $costSTH->fetch(PDO::FETCH_ASSOC);
		return $this->interpolate($costRow['pretty'], (array)json_decode($costRow['settings']));
	}

	// Worker(app): returns item list
	public function getItems() {
		$data = $this->getPostData();

		// Get cost for all the items
		$cost = $this->getProductCost( $data->prodID );

		// Get All the items
		$itemSTH = $this->db->prepare("SELECT * FROM `item` WHERE productID = ?;");
		$itemSTH->execute( $data->prodID );

		// Properly pre-format return data
		$retData = $itemSTH->fetchAll(PDO::FETCH_ASSOC);
		foreach ($retData as &$item) {
			$item['settings'] = json_decode($item['settings']);
			$item['cost'] = $cost;
		}

		return json_encode($retData);
	}

	// Worker(app): return specific item detail
	public function getItem() {
		$data = $this->getPostData();
		// die(print_r($data, true));
		return json_encode($this->getItemByID($data->itemID));
	}

	// Helper(app): return specific item detail by id
	private function getItemByID( $itemID ) {
		$itemSTH = $this->db->prepare("SELECT * FROM `item` WHERE itemID = ?;");
		$itemSTH->execute( $itemID );
		$row = $itemSTH->fetch(PDO::FETCH_ASSOC);
		if (!isset($row['productID'])) {
			return null;
		}
		$row['settings'] = json_decode($row['settings']);
		$row['cost'] = $this->getProductCost( $row['productID'] );
		return $row;
	}

	// Worker(app): return cart with current prices
	public function getCart() {
		// $user = $this->requiresAuth(); // upon cart completion
		$data = $this->getPostData();

		// Iterate through ID's
		$retData = array();
		foreach ($data->ids as $itemID) {
			// $itemSTH->execute( $itemID );
			// $row = $itemSTH->fetch(PDO::FETCH_ASSOC);
			// $row['cost'] = $this->getProductCost( $row['productID'] );
			if (is_string($itemID)) {
				$item = $this->getItemByID( $itemID );
				if ($item != null) {
					array_push($retData, $item);
				}
			} else {
				array_push($retData, $itemID);
			}

		}

		return json_encode($retData);
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

		$checkSTH = $this->db->prepare("SELECT * FROM `contact` WHERE email=?;");
		if (!$checkSTH->execute($data->email)) {
			header('HTTP/ 409 Conflict');
			return print_r($STH->errorInfo(), true);
		}
		if ($checkSTH->rowCount() > 0) {
			header('HTTP/ 409 Conflict');
			return 'dup';
		}

		// TODO: check to see if user is already in system (email)

		$firmSTH = $this->db->prepare("INSERT INTO `firm` (addressID, name, website) VALUES (?,?,?);");
		if (!$firmSTH->execute( $data->firm->addr->addrID, $data->firm->name, $data->firm->website )) {
			header('HTTP/ 409 Conflict');
			return print_r($STH->errorInfo(), true);
		}
		$firmID = $this->db->lastInsertId();

		$contSTH = $this->db->prepare("INSERT INTO `contact` (firmID, addressID, legalName, preName, title, email, phone, pass) VALUES (?,?,?,?,?,?,?,ENCRYPT(?,?));");
		if (!$contSTH->execute( $firmID, $data->addr->addrID, $data->legalName, $data->preName, $data->title, $data->email, $data->phone, $data->password, config::encryptSTR )) {
			header('HTTP/ 409 Conflict');
			return print_r($STH->errorInfo(), true);
		}

		session_start();
		$_SESSION['user'] = $this->getUser( $data );
		return $this->db->lastInsertId();
	}
}

/*
 *  Application Logic (fire methods depending on 'action')
 * ------------------------------------------------------- */

if (!isset($_REQUEST['action'])) $_REQUEST['action'] = 'nope';

$obj = new formsManager();
switch ($_REQUEST['action']) {
	case 'currentUser': echo $obj->currentUser(); break;
	case 'login': echo $obj->login(); break;
	case 'logout': echo $obj->logout(); break;

	// Main app functions
	case 'getProducts': echo $obj->getProducts(); break;
	case 'getItems': echo $obj->getItems(); break;
	case 'getCart': echo $obj->getCart(); break;
	case 'getItem': echo $obj->getItem(); break;

	// user registration functions
	case 'addAddress': echo $obj->addAddress(); break;
	case 'editAddress': echo $obj->editAddress(); break;
	case 'addUser': echo $obj->addUser(); break;

	// Test case statements
	case 'testAuth': echo $obj->testAuth(); break;
	case 'testAdmin': echo $obj->testAdmin(); break;
	case 'demo': echo '<pre>'; print_r($_REQUEST); break;
	default: die('Your Kung-Fu is not strong.');
}