<?php

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
		// Cart Functions
		case 'get': $data = $obj->get(); break; // get entire cart
		case 'rem': $data = $obj->rem(); break; // remove item from cart
		case 'add': $data = $obj->add(); break; // add invoice to cart
		case 'clr': $data = $obj->clr(); break; // clear cart

		// Cart.Options Functions
		case 'getOptions': $data = $obj->getOptions(); break; // get all options
		case 'getOption':  $data = $obj->getOption();  break; // get conference form data
		case 'setOption':  $data = $obj->setOption();  break; // get conference form data

		// Cart.Discount Functions
		case 'getDiscount': $data = $obj->getDiscount(); break; // get all discounts
		case 'addDiscount': $data = $obj->addDiscount(); break; // add discounts
		case 'remDiscount': $data = $obj->remDiscount(); break; // rem discounts

		// Generic Functions
		case 'save': $data = $obj->save(); break;
		case 'getPurchases': $data = $obj->getPurchases(); break;
		default: $pass = false;
	}
} elseif ( $_REQUEST['c'] == 'user' ) {
	User::process( $_REQUEST['a'], $pass, $data );
} elseif ( $_REQUEST['c'] == 'test' ) {
	switch ($_REQUEST['a']) {
		case 'demo': 
			// Some dev code goes here
			break;
		case 'info': phpinfo(); break;
		case 'db':
			$cmd = 'mysqldump --host=db3.modwest.com -u ' . config::db_user . ' -p' . config::db_pass . ' upstreamacademy_payment -d --skip-opt';
			die(system($cmd));
			break;
		default: $pass = false;
	}
} elseif ( $_REQUEST['c'] == 'app') {
	NG::process( $_REQUEST['a'], $pass, $data );
} else {
	$pass = false;
}

// Determine proper return data
if ( $pass ) {
	if ( !is_bool($data) ) echo ")]}',\n";
	echo json_encode( $data );
} else {
	header( 'HTTP/ 405 Method Not Allowed' );
	echo 'Your Kung-Fu is not strong.';
}
