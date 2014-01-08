<?php

// Handle cross site stuff (for development)
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
// header('Access-Control-Allow-Headers: Content-Type');
// if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit(0);

require_once('./libinc/main_include.php');

/*
 *  Application Logic (fire methods depending on 'action')
 * ------------------------------------------------------- */

if (!isset($_REQUEST['a'])) $_REQUEST['a'] = 'nope'; // catch not assigned
if (!isset($_REQUEST['c'])) $_REQUEST['c'] = 'nope'; // catch not assigned

$pass = true; // determine response type
$data = array(); // return json data array

// Application logic, choose proper class and function
if ( $_REQUEST['c'] == 'cart' ) {
	$obj = new Cart();
	switch ($_REQUEST['a']) {
		case 'get': $data = $obj->get(); break; // get entire cart
		case 'rem': $data = $obj->rem(); break; // remove item from cart
		case 'add': $data = $obj->add(); break; // add invoice to cart
		case 'clr': $data = $obj->clr(); break; // clear cart

		case 'con': $data = $obj->con(); break; // get conference form data

		// case 'getDiscount': $data = $obj->getDiscount(); break;
		// case 'getItem': $data = $obj->getItem(); break;
		// case 'getItemOptions': $data = $obj->getItemOptions(); break;
		// case 'getItems': $data = $obj->getItems(); break;
		// case 'getProducts': $data = $obj->getProducts(); break;
		// case 'getPurchases': $data = $obj->getPurchases(); break;
		// case 'getSoftPurchases': $data = $obj->getSoftPurchases(); break;
		// case 'prettyCrumb': $data = $obj->prettyCrumb(); break;
		// case 'saveCart': $data = $obj->saveCart(); break;
		default: $pass = false;
	}
} elseif ( $_REQUEST['c'] == 'user' ) {
	$obj = new User();
	switch ($_REQUEST['a']) {
		case 'addAddress': $data = $obj->addAddress(); break;
		case 'listFirms': $data = $obj->listFirms(); break;
		// case 'addContact': $data = $obj->addContact(); break;
		case 'addUser': $data = $obj->addUser(); break;
		case 'currentUser': $data = $obj->currentUser(); break;
		case 'editAddress': $data = $obj->editAddress(); break;
		// case 'editContact': $data = $obj->editContact(); break;
		// case 'getCart': $data = $obj->getCart(); break;
		// case 'getFirmAddr': $data = $obj->getFirmAddr(); break;
		// case 'getFirmEmploy': $data = $obj->getFirmEmploy(); break;
		case 'login': $data = $obj->login(); break;
		case 'logout': $data = $obj->logout(); break;
		default: $pass = false;
	}
} elseif ( $_REQUEST['c'] == 'test' ) {
	switch ($_REQUEST['a']) {
		// case 'testAuth': $data = $obj->testAuth(); break;
		// case 'testAdmin': $data = $obj->testAdmin(); break;
		case 'demo': 
			// echo '<pre>'; 
			// print_r($_REQUEST); 
			break;
		default: $pass = false;
	}
} else {
	$pass = false;
}

// Determine proper return data
if ( $pass ) {
	echo json_encode( $data );
} else {
	header( 'HTTP/ 405 Method Not Allowed' );
	echo 'Your Kung-Fu is not strong.';
}
