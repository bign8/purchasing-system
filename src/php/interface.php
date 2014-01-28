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
switch ($_REQUEST['c']) {
	case 'cart': Cart::process( $_REQUEST['a'], $pass, $data ); break;
	case 'user': User::process( $_REQUEST['a'], $pass, $data ); break;
	case 'app' :   NG::process( $_REQUEST['a'], $pass, $data ); break;
	case 'test':
		switch ($_REQUEST['a']) {
			case 'info': phpinfo(); break;
			case 'db': die(system('mysqldump --host=db3.modwest.com -u '.config::db_user.' -p'.config::db_pass.' upstreamacademy_payment -d --skip-opt')); break;
			default: $pass = false;
		}
		break;
	default: $pass = false; break;
}

// Determine proper return data
if ( $pass ) {
	if ( !is_bool($data) ) echo ")]}',\n";
	echo json_encode( $data );
} else {
	header( 'HTTP/ 405 Method Not Allowed' );
	echo 'Your Kung-Fu is not strong.';
}
