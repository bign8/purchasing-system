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
		if (isset($data->email) && isset($data->password) && $data->email == 'nwoods@carroll.edu' && $data->password == 'asdfasdf') {
			$user = array(
				'userID' => '1234',
				'email' => 'nwoods@carroll.edu',
				'firstName' => 'Nathan',
				'lastName' => 'Woods',
				'admin' => false
			);
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
	private function interpolate( $message, $context = array()) {
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
		return $this->interpolate($costRow['pretty'], json_decode($costRow['settings']));
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
		$row['settings'] = json_decode($row['settings']);
		$row['cost'] = $this->getProductCost( $row['productID'] );
		return $row;
	}

	// Worker(app): return cart with current prices
	public function getCart() {
		$data = $this->getPostData();

		// Iterate through ID's
		$retData = array();
		foreach ($data->ids as $itemID) {
			// $itemSTH->execute( $itemID );
			// $row = $itemSTH->fetch(PDO::FETCH_ASSOC);
			// $row['cost'] = $this->getProductCost( $row['productID'] );

			array_push($retData, $this->getItemByID( $itemID ));
		}

		return json_encode($retData);
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

	// Test case statements
	case 'testAuth': echo $obj->testAuth(); break;
	case 'testAdmin': echo $obj->testAdmin(); break;
	case 'demo': echo '<pre>'; print_r($_REQUEST); break;
	default: die('Your Kung-Fu is not strong.');
}