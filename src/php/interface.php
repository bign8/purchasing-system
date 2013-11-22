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

	// Test case statements
	case 'testAuth': echo $obj->testAuth(); break;
	case 'testAdmin': echo $obj->testAdmin(); break;
	case 'demo': echo '<pre>'; print_r($_REQUEST); break;
	default: die('Your Kung-Fu is not strong.');
}