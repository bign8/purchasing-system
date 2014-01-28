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
	Cart::process( $_REQUEST['a'], $pass, $data );
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
