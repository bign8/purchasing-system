<?php

require_once('./libinc/main_include.php');

$db = new myPDO();
$STH = $db->query("SELECT * FROM item;");

while ($row = $STH->fetch( PDO::FETCH_ASSOC )) {
	print_r($row);
}

// require_once('c:/www/apps.carroll.edu/libinc/core/site_inc.php');
// error_reporting(E_ALL);
// ini_set('display_errors', '1');

// /*
//  *  Application Class (conditionally run script subsets)
//  * ------------------------------------------------------- */

// class formsManager extends NgClass {
// 	private $db;

// 	// Constructor: Initialize session and db connections
// 	function __construct() {
// 		parent::__construct();
// 		$this->db = new myPDO( new InternalDbOptions( 'cc_forms' ) );
// 	}

// 	// Worker(security): Implements Abstract: returns database user object or null
// 	protected function getUser( $data ) {
// 		$user = NULL;
// 		if (isset($data->email) && isset($data->password) && $data->email == 'nwoods@carroll.edu' && $data->password == 'asdfasdf') {
// 			$user = array(
// 				'userID' => '1234',
// 				'email' => 'nwoods@carroll.edu',
// 				'firstName' => 'Nathan',
// 				'lastName' => 'Woods',
// 				'admin' => false
// 			);
// 		}
// 		return $user;
// 	}

// 	// Worker(test): tests if user is authenticated
// 	public function testAuth() {
// 		$this->requiresAuth();
// 		return 'hello authenticated user';
// 	}

// 	// Worker(test): tests if user is administrator
// 	public function testAdmin() {
// 		$this->requiresAdmin();
// 		return 'hello administrator user';
// 	}
// }

// /*
//  *  Application Logic (fire methods depending on 'action')
//  * ------------------------------------------------------- */

// if (!isset($_REQUEST['action'])) $_REQUEST['action'] = 'nope';

// $obj = new formsManager();
// switch ($_REQUEST['action']) {
// 	case 'currentUser': echo $obj->currentUser(); break;
// 	case 'login': echo $obj->login(); break;
// 	case 'logout': echo $obj->logout(); break;

// 	// Test case statements
// 	case 'testAuth': echo $obj->testAuth(); break;
// 	case 'testAdmin': echo $obj->testAdmin(); break;
// 	case 'demo': echo '<pre>'; print_r($_REQUEST); break;
// 	default: die('Your Kung-Fu is not strong.');
// }